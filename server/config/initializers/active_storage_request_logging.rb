class ActiveStorageRequestLogging
  ACTIVE_STORAGE_PATH_PREFIX = "/rails/active_storage/".freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    status, headers, response = @app.call(env)

    log_active_storage_request(env, status, headers, started_at)

    [ status, headers, response ]
  rescue => error
    log_active_storage_error(env, error, started_at)
    raise
  end

  private

  def active_storage_request?(env)
    env["PATH_INFO"].to_s.start_with?(ACTIVE_STORAGE_PATH_PREFIX)
  end

  def full_path(env)
    path = env["PATH_INFO"].to_s
    query = env["QUERY_STRING"].to_s

    query.empty? ? path : "#{path}?#{query}"
  end

  def header_value(headers, name)
    headers[name] || headers[name.downcase]
  end

  def log_active_storage_request(env, status, headers, started_at)
    return unless active_storage_request?(env)

    Rails.logger.info(
      "[active_storage_request] #{{
        method: env["REQUEST_METHOD"],
        path: full_path(env),
        status: status,
        location: header_value(headers, "Location"),
        content_type: header_value(headers, "Content-Type"),
        cache_control: header_value(headers, "Cache-Control"),
        duration_ms: duration_ms(started_at),
        request_id: env["action_dispatch.request_id"]
      }.to_json}"
    )
  end

  def log_active_storage_error(env, error, started_at)
    return unless active_storage_request?(env)

    Rails.logger.error(
      "[active_storage_request:error] #{{
        method: env["REQUEST_METHOD"],
        path: full_path(env),
        error_class: error.class.name,
        error_message: error.message,
        duration_ms: duration_ms(started_at),
        request_id: env["action_dispatch.request_id"]
      }.to_json}"
    )
  end

  def duration_ms(started_at)
    ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at) * 1000).round(1)
  end
end

Rails.application.config.middleware.use ActiveStorageRequestLogging
