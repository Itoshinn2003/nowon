require "test_helper"
require "net/http"

class AppleIdTokenVerifierTest < ActiveSupport::TestCase
  test "verifies a signed Apple identity token" do
    private_key = OpenSSL::PKey::RSA.new(2048)
    token = apple_identity_token(private_key)
    response = apple_keys_response(private_key)

    with_http_response(response) do
      payload = AppleIdTokenVerifier.verify(token)

      assert_equal "apple-user-id", payload.fetch("sub")
      assert_equal "apple@example.com", payload.fetch("email")
    end
  end

  test "rejects a token with an invalid signature" do
    token_private_key = OpenSSL::PKey::RSA.new(2048)
    response_private_key = OpenSSL::PKey::RSA.new(2048)
    token = apple_identity_token(token_private_key)
    response = apple_keys_response(response_private_key)

    with_http_response(response) do
      assert_raises(AppleIdTokenVerifier::Error) do
        AppleIdTokenVerifier.verify(token)
      end
    end
  end

  private

  def apple_identity_token(private_key)
    header = {
      alg: "RS256",
      kid: "apple-key-id"
    }
    payload = {
      iss: "https://appleid.apple.com",
      aud: "com.nowon.mobile",
      sub: "apple-user-id",
      email: "apple@example.com",
      email_verified: "true",
      exp: 1.hour.from_now.to_i
    }
    signing_input = [
      base64_url_json(header),
      base64_url_json(payload)
    ].join(".")
    signature = private_key.sign(OpenSSL::Digest.new("SHA256"), signing_input)

    [ signing_input, base64_url(signature) ].join(".")
  end

  def apple_keys_response(private_key)
    response = Net::HTTPResponse::CODE_TO_OBJ.fetch("200").new("1.1", "200", "OK")
    response.instance_variable_set(:@body, JSON.generate(
      keys: [
        {
          kty: "RSA",
          kid: "apple-key-id",
          use: "sig",
          alg: "RS256",
          n: base64_url(integer_bytes(private_key.n)),
          e: base64_url(integer_bytes(private_key.e))
        }
      ]
    ))
    response.instance_variable_set(:@read, true)
    response
  end

  def base64_url_json(value)
    base64_url(JSON.generate(value))
  end

  def base64_url(value)
    Base64.urlsafe_encode64(value, padding: false)
  end

  def integer_bytes(value)
    hex = value.to_s(16)
    hex = "0#{hex}" if hex.length.odd?
    [ hex ].pack("H*")
  end

  def with_http_response(response)
    original_start = Net::HTTP.method(:start)
    Net::HTTP.define_singleton_method(:start) do |*|
      response
    end

    yield
  ensure
    Net::HTTP.define_singleton_method(:start) do |*args, **kwargs, &block|
      original_start.call(*args, **kwargs, &block)
    end
  end
end
