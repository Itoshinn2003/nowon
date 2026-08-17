require "json"

module MemoryDiagnostics
  module_function

  DEFAULT_INTERVAL_SECONDS = 60
  LOCK_PATH = "/tmp/nowon_memory_diagnostics_process_sampler.lock".freeze
  PROC_PATH = "/proc".freeze
  QUERY_PATTERN = /\?[^[:space:]]*/.freeze
  TOKEN_PATTERN = /(access-token|token|client|uid)=([^&[:space:]]+)/i.freeze

  module ProcessForkHook
    def fork(*args, &block)
      if block
        super(*args) do
          MemoryDiagnostics.after_fork!
          block.call
        end
      else
        result = super
        MemoryDiagnostics.after_fork! if result.nil?
        result
      end
    end
  end

  module KernelForkHook
    def fork(*args, &block)
      if block
        super(*args) do
          MemoryDiagnostics.after_fork!
          block.call
        end
      else
        result = super
        MemoryDiagnostics.after_fork! if result.nil?
        result
      end
    end

    private :fork
  end

  def enabled?
    ENV["MEMORY_DIAGNOSTICS"] == "true"
  end

  def request_logging_enabled?
    ENV["MEMORY_DIAGNOSTICS_LOG_REQUESTS"] == "true"
  end

  def interval_seconds
    Integer(ENV.fetch("MEMORY_DIAGNOSTICS_INTERVAL", DEFAULT_INTERVAL_SECONDS))
  rescue ArgumentError
    DEFAULT_INTERVAL_SECONDS
  end

  def start!
    return unless enabled?

    $stdout.sync = true
    log_enabled_once!
    install_fork_hook!
    subscribe_to_active_job! unless @active_job_subscribed
    subscribe_to_requests! if request_logging_enabled? && !@requests_subscribed
    start_self_sampler! unless sampler_thread_alive?(@self_sampler_thread, @self_sampler_pid)
    start_process_sampler_if_lock_owner! unless sampler_thread_alive?(@process_sampler_thread, @process_sampler_pid)
  end

  def after_fork!
    @self_sampler_thread = nil
    @self_sampler_pid = nil
    @process_sampler_thread = nil
    @process_sampler_pid = nil
    close_inherited_process_sampler_lock!

    start!
  rescue => error
    log_error(error, event: "after_fork")
  end

  def install_fork_hook!
    return if @fork_hook_installed

    Process.singleton_class.prepend(ProcessForkHook)
    Kernel.prepend(KernelForkHook)
    @fork_hook_installed = true
  end

  def log_enabled_once!
    return if @enabled_logged_pid == Process.pid

    @enabled_logged_pid = Process.pid
    log_line(
      "[MemoryDiagnostics] enabled pid=#{Process.pid} ppid=#{Process.ppid} " \
        "interval_seconds=#{interval_seconds} proc_available=#{Dir.exist?(PROC_PATH)} " \
        "request_logging=#{request_logging_enabled?}"
    )
  end

  def sampler_thread_alive?(thread, pid)
    pid == Process.pid && thread&.alive?
  end

  def start_self_sampler!
    @self_sampler_pid = Process.pid
    log_line("[MemoryDiagnostics] self sampler starting pid=#{Process.pid} ppid=#{Process.ppid}")

    @self_sampler_thread = Thread.new do
      Thread.current.name = "memory_diagnostics_self" if Thread.current.respond_to?(:name=)

      log_self_snapshot(event: "sampler_start")

      loop do
        sleep interval_seconds
        log_self_snapshot(event: "periodic")
      end
    rescue => error
      log_error(error, event: "self_sampler")
    end
  end

  def start_process_sampler_if_lock_owner!
    unless Dir.exist?(PROC_PATH)
      log_line("[MemoryDiagnostics] process sampler unavailable pid=#{Process.pid} reason=proc_not_found")
      return
    end

    lock_file = File.open(LOCK_PATH, File::RDWR | File::CREAT, 0o644)
    unless lock_file.flock(File::LOCK_EX | File::LOCK_NB)
      log_line("[MemoryDiagnostics] process sampler skipped pid=#{Process.pid} reason=lock_held")
      lock_file.close
      return
    end

    @process_sampler_lock_file = lock_file

    @process_sampler_pid = Process.pid
    log_line("[MemoryDiagnostics] process sampler starting pid=#{Process.pid} ppid=#{Process.ppid}")

    @process_sampler_thread = Thread.new do
      Thread.current.name = "memory_diagnostics_processes" if Thread.current.respond_to?(:name=)

      log_process_snapshot

      loop do
        sleep interval_seconds
        log_process_snapshot
      end
    rescue => error
      log_error(error, event: "process_sampler")
    end
  rescue => error
    log_error(error, event: "process_sampler_lock")
  end

  def subscribe_to_active_job!
    @active_job_subscribed = true

    ActiveSupport::Notifications.subscribe("perform_start.active_job") do |_name, _started, _finished, _id, payload|
      log_self_snapshot(event: "active_job_start", active_job: active_job_payload(payload[:job]))
    end

    ActiveSupport::Notifications.subscribe("perform.active_job") do |_name, started, finished, _id, payload|
      active_job = active_job_payload(payload[:job]) || {}

      log_self_snapshot(
        event: "active_job_finish",
        active_job: active_job.merge(
          duration_ms: duration_ms(started, finished),
          exception: payload[:exception]&.first
        )
      )
    end
  end

  def subscribe_to_requests!
    @requests_subscribed = true

    ActiveSupport::Notifications.subscribe("process_action.action_controller") do |_name, started, finished, _id, payload|
      log_self_snapshot(
        event: "request_finish",
        request: {
          controller: payload[:controller],
          action: payload[:action],
          method: payload[:method],
          path: sanitized_path(payload[:path]),
          status: payload[:status],
          duration_ms: duration_ms(started, finished)
        }
      )
    end
  end

  def log_self_snapshot(event:, active_job: nil, request: nil)
    payload = {
      event: event,
      pid: Process.pid,
      ppid: Process.ppid,
      role: process_role(Process.pid),
      rss_kb: rss_kb(Process.pid),
      gc: gc_payload,
      active_job: active_job,
      request: request
    }.compact

    log_line("[memory_diagnostics:self] #{JSON.generate(payload)}")
  end

  def log_process_snapshot
    payload = {
      event: "process_snapshot",
      source_pid: Process.pid,
      processes: ruby_processes
    }

    log_line("[memory_diagnostics:processes] #{JSON.generate(payload)}")
  end

  def ruby_processes
    Dir.children(PROC_PATH)
       .grep(/\A\d+\z/)
       .filter_map { |pid| process_payload(pid.to_i) }
       .select { |process| ruby_process?(process) }
       .sort_by { |process| process[:pid] }
  end

  def process_payload(pid)
    {
      pid: pid,
      ppid: ppid(pid),
      rss_kb: rss_kb(pid),
      role: process_role(pid),
      command: sanitized_command(command_line(pid))
    }
  rescue Errno::ENOENT, Errno::EACCES
    nil
  end

  def ruby_process?(process)
    command = process[:command].to_s.downcase
    role = process[:role].to_s

    command.include?("ruby") ||
      command.include?("rails") ||
      command.include?("puma") ||
      command.include?("solid") ||
      role != "unknown"
  end

  def process_role(pid)
    command = command_line(pid).downcase

    return "solid_queue_worker" if command.include?("worker") && solid_queue_process?(command)
    return "solid_queue_dispatcher" if command.include?("dispatcher") && solid_queue_process?(command)
    return "solid_queue_scheduler" if command.include?("scheduler") && solid_queue_process?(command)
    return "solid_queue_supervisor" if command.include?("supervisor") && solid_queue_process?(command)
    return "puma_worker" if puma_process?(command) && parent_puma_process?(pid)
    return "puma_cluster_master" if puma_process?(command) && child_puma_process?(pid)
    return "puma_or_rails" if command.include?("puma") || command.include?("rails server")
    return "ruby" if command.include?("ruby")

    "unknown"
  rescue Errno::ENOENT, Errno::EACCES
    "unknown"
  end

  def solid_queue_process?(command)
    command.include?("solidqueue") || command.include?("solid_queue") || command.include?("solid queue")
  end

  def puma_process?(command)
    command.include?("puma")
  end

  def parent_puma_process?(pid)
    parent_pid = ppid(pid)
    return false if parent_pid <= 0

    puma_process?(command_line(parent_pid).downcase)
  rescue Errno::ENOENT, Errno::EACCES
    false
  end

  def child_puma_process?(pid)
    Dir.children(PROC_PATH).grep(/\A\d+\z/).any? do |child_pid|
      child_pid = child_pid.to_i
      child_pid != pid && ppid(child_pid) == pid && puma_process?(command_line(child_pid).downcase)
    rescue Errno::ENOENT, Errno::EACCES
      false
    end
  rescue Errno::ENOENT, Errno::EACCES
    false
  end

  def command_line(pid)
    path = File.join(PROC_PATH, pid.to_s, "cmdline")
    command = File.read(path).split("\0").join(" ").strip
    return command unless command.empty?

    File.read(File.join(PROC_PATH, pid.to_s, "comm")).strip
  end

  def ppid(pid)
    status_value(pid, "PPid").to_i
  end

  def rss_kb(pid)
    status_value(pid, "VmRSS")&.split&.first&.to_i
  end

  def status_value(pid, key)
    File.foreach(File.join(PROC_PATH, pid.to_s, "status")) do |line|
      return line.split(":", 2).last.strip if line.start_with?("#{key}:")
    end

    nil
  rescue Errno::ENOENT, Errno::EACCES
    nil
  end

  def gc_payload
    stat = GC.stat

    {
      count: stat[:count],
      heap_live_slots: stat[:heap_live_slots],
      heap_free_slots: stat[:heap_free_slots],
      heap_allocated_pages: stat[:heap_allocated_pages],
      heap_sorted_length: stat[:heap_sorted_length],
      old_objects: stat[:old_objects],
      malloc_increase_bytes: stat[:malloc_increase_bytes],
      oldmalloc_increase_bytes: stat[:oldmalloc_increase_bytes],
      total_allocated_objects: stat[:total_allocated_objects],
      total_freed_objects: stat[:total_freed_objects]
    }
  end

  def active_job_payload(job)
    return nil unless job

    {
      job_class: job.class.name,
      job_id: job.job_id,
      queue_name: job.queue_name
    }
  end

  def duration_ms(started, finished)
    ((finished - started) * 1000).round(1)
  end

  def sanitized_path(path)
    path.to_s.sub(QUERY_PATTERN, "")
  end

  def sanitized_command(command)
    command
      .to_s
      .sub(QUERY_PATTERN, "?[FILTERED]")
      .gsub(TOKEN_PATTERN, "\\1=[FILTERED]")
      .slice(0, 240)
  end

  def error_payload(error, event:)
    {
      event: event,
      pid: Process.pid,
      error_class: error.class.name,
      error_message: error.message
    }
  end

  def log_error(error, event:)
    log_line("[memory_diagnostics:error] #{JSON.generate(error_payload(error, event: event))}")
  end

  def log_line(line)
    $stdout.puts(line)
  rescue IOError
    nil
  end

  def close_inherited_process_sampler_lock!
    return unless @process_sampler_lock_file

    @process_sampler_lock_file.close unless @process_sampler_lock_file.closed?
  rescue IOError
    nil
  ensure
    @process_sampler_lock_file = nil
  end
end

Rails.application.config.after_initialize do
  MemoryDiagnostics.start!
end
