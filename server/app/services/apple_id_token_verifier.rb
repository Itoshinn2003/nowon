require "base64"
require "json"
require "net/http"
require "openssl"

class AppleIdTokenVerifier
  KEYS_URL = URI("https://appleid.apple.com/auth/keys")
  ISSUER = "https://appleid.apple.com"
  DEFAULT_CLIENT_IDS = %w[com.nowon.mobile].freeze

  class Error < StandardError; end

  def self.verify(identity_token)
    new(identity_token).verify
  end

  def initialize(identity_token)
    @identity_token = identity_token.to_s
  end

  def verify
    raise Error, "identity_token is required" if @identity_token.blank?

    header, payload, signing_input, signature = decode_token
    validate_signature(header, signing_input, signature)
    validate_payload(payload)
    payload
  end

  private

  def decode_token
    segments = @identity_token.split(".")
    raise Error, "Invalid token" unless segments.length == 3

    header_segment, payload_segment, signature_segment = segments
    header = parse_json(base64_url_decode(header_segment))
    payload = parse_json(base64_url_decode(payload_segment))
    signing_input = [ header_segment, payload_segment ].join(".")
    signature = base64_url_decode(signature_segment)

    [ header, payload, signing_input, signature ]
  end

  def validate_signature(header, signing_input, signature)
    raise Error, "Invalid algorithm" unless header["alg"] == "RS256"

    key_data = apple_keys.find { |key| key["kid"] == header["kid"] }
    raise Error, "Missing public key" unless key_data

    public_key = rsa_public_key(key_data)
    verified = public_key.verify(
      OpenSSL::Digest.new("SHA256"),
      signature,
      signing_input
    )

    raise Error, "Invalid signature" unless verified
  end

  def validate_payload(payload)
    raise Error, "Invalid issuer" unless payload["iss"] == ISSUER
    raise Error, "Invalid audience" unless allowed_client_ids.include?(payload["aud"])
    raise Error, "Missing subject" if payload["sub"].blank?
    raise Error, "Expired token" unless payload["exp"].to_i > Time.current.to_i

    return if payload["email_verified"].blank?
    return if ActiveModel::Type::Boolean.new.cast(payload["email_verified"])

    raise Error, "Unverified email"
  end

  def apple_keys
    response = Net::HTTP.start(
      KEYS_URL.host,
      KEYS_URL.port,
      use_ssl: KEYS_URL.scheme == "https"
    ) { |http| http.get(KEYS_URL) }

    raise Error, "Apple public keys request failed" unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body).fetch("keys")
  rescue JSON::ParserError, KeyError, SocketError, Timeout::Error
    raise Error, "Apple public keys request failed"
  end

  def rsa_public_key(key_data)
    n = integer_from_base64_url(key_data.fetch("n"))
    e = integer_from_base64_url(key_data.fetch("e"))
    sequence = OpenSSL::ASN1::Sequence([
      OpenSSL::ASN1::Integer(n),
      OpenSSL::ASN1::Integer(e)
    ])

    OpenSSL::PKey::RSA.new(sequence.to_der)
  rescue KeyError, OpenSSL::PKey::RSAError
    raise Error, "Invalid public key"
  end

  def integer_from_base64_url(value)
    base64_url_decode(value).unpack1("H*").to_i(16)
  end

  def parse_json(value)
    JSON.parse(value)
  rescue JSON::ParserError
    raise Error, "Invalid token"
  end

  def base64_url_decode(value)
    Base64.urlsafe_decode64(value)
  rescue ArgumentError
    raise Error, "Invalid token"
  end

  def allowed_client_ids
    @allowed_client_ids ||= begin
      env_client_ids = ENV.fetch("APPLE_CLIENT_IDS", "").split(",")
      single_client_ids = ENV.values_at("APPLE_CLIENT_ID", "APPLE_IOS_CLIENT_ID")

      (DEFAULT_CLIENT_IDS + env_client_ids + single_client_ids)
        .compact
        .map(&:strip)
        .reject(&:blank?)
    end
  end
end
