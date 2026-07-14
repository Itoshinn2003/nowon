require "json"
require "net/http"

class GoogleIdTokenVerifier
  TOKENINFO_URL = URI("https://oauth2.googleapis.com/tokeninfo")
  VALID_ISSUERS = %w[accounts.google.com https://accounts.google.com].freeze
  DEFAULT_CLIENT_IDS = %w[
    992345631859-210k21u2mnrde78sgd79mmsaa7hgig6n.apps.googleusercontent.com
  ].freeze

  class Error < StandardError; end

  def self.verify(id_token)
    new(id_token).verify
  end

  def initialize(id_token)
    @id_token = id_token.to_s
  end

  def verify
    raise Error, "id_token is required" if @id_token.blank?

    payload = fetch_token_payload
    validate_payload(payload)
    payload
  end

  private

  def fetch_token_payload
    uri = TOKENINFO_URL.dup
    uri.query = URI.encode_www_form(id_token: @id_token)

    response = Net::HTTP.start(
      uri.host,
      uri.port,
      use_ssl: uri.scheme == "https"
    ) { |http| http.get(uri) }

    unless response.is_a?(Net::HTTPSuccess)
      raise Error, "Google token verification failed"
    end

    JSON.parse(response.body)
  rescue JSON::ParserError, SocketError, Timeout::Error
    raise Error, "Google token verification failed"
  end

  def validate_payload(payload)
    raise Error, "Invalid issuer" unless VALID_ISSUERS.include?(payload["iss"])
    raise Error, "Invalid audience" unless allowed_client_ids.include?(payload["aud"])
    raise Error, "Missing subject" if payload["sub"].blank?
    raise Error, "Missing email" if payload["email"].blank?
    unless ActiveModel::Type::Boolean.new.cast(payload["email_verified"])
      raise Error, "Unverified email"
    end
  end

  def allowed_client_ids
    @allowed_client_ids ||= begin
      env_client_ids = ENV.fetch("GOOGLE_OAUTH_CLIENT_IDS", "").split(",")
      single_client_ids = ENV.values_at(
        "GOOGLE_OAUTH_CLIENT_ID",
        "GOOGLE_WEB_CLIENT_ID",
        "GOOGLE_IOS_CLIENT_ID",
        "GOOGLE_ANDROID_CLIENT_ID",
        "GOOGLE_EXPO_CLIENT_ID"
      )

      (DEFAULT_CLIENT_IDS + env_client_ids + single_client_ids)
        .compact
        .map(&:strip)
        .reject(&:blank?)
    end
  end
end
