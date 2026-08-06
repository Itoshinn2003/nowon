require "json"
require "net/http"

class PushNotificationService
  EXPO_PUSH_URL = URI("https://exp.host/--/api/v2/push/send")
  MAX_MESSAGES_PER_REQUEST = 100

  def call(users:, title:, body:, data: {})
    tokens = DevicePushToken
             .deliverable
             .where(user_id: users.select(:id))
             .to_a

    tokens.each_slice(MAX_MESSAGES_PER_REQUEST).flat_map do |token_batch|
      send_batch(token_batch, title: title, body: body, data: data)
    end
  end

  private

  def send_batch(tokens, title:, body:, data:)
    return [] if tokens.empty?

    response = Net::HTTP.start(EXPO_PUSH_URL.host, EXPO_PUSH_URL.port, use_ssl: true) do |http|
      http.open_timeout = 5
      http.read_timeout = 10

      request = Net::HTTP::Post.new(EXPO_PUSH_URL)
      request["Content-Type"] = "application/json"
      request.body = JSON.generate(tokens.map { |token| message_payload(token, title, body, data) })

      http.request(request)
    end

    handle_response(response, tokens)
  end

  def message_payload(token, title, body, data)
    {
      to: token.token,
      sound: "default",
      title: title,
      body: body,
      data: data
    }
  end

  def handle_response(response, tokens)
    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.warn("Expo push request failed: #{response.code} #{response.body}")
      return []
    end

    payload = JSON.parse(response.body)
    tickets = Array(payload["data"])

    tickets.zip(tokens).each do |ticket, token|
      next unless ticket.is_a?(Hash)
      next unless ticket["status"] == "error"

      invalidate_token_if_needed(token, ticket)
      Rails.logger.warn("Expo push ticket error: #{ticket.inspect}")
    end

    tickets
  rescue JSON::ParserError => e
    Rails.logger.warn("Expo push response parse failed: #{e.message}")
    []
  end

  def invalidate_token_if_needed(token, ticket)
    return unless ticket.dig("details", "error") == "DeviceNotRegistered"

    token.invalidate!
  end
end
