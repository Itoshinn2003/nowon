require "test_helper"
require "securerandom"

module Auth
  class AppleAuthenticationsControllerTest < ActionDispatch::IntegrationTest
    test "creates a user and returns auth headers with a valid Apple token" do
      payload = apple_payload(
        email: "apple-#{SecureRandom.hex(4)}@example.com",
        sub: "apple-sub-#{SecureRandom.hex(4)}"
      )

      with_apple_payload(payload) do
        post "/auth/apple", params: {
          identity_token: "valid-token",
          full_name: {
            familyName: "山田",
            givenName: "太郎"
          }
        }
      end

      assert_response :success

      body = response.parsed_body
      user = User.find_by!(email: payload.fetch("email"))
      assert_equal user.id, body.dig("data", "id")
      assert_equal "apple", body.dig("data", "provider")
      assert_equal payload.fetch("sub"), body.dig("data", "uid")
      assert_equal "山田 太郎", user.name
      assert user.confirmed?
      assert_auth_headers_present
    end

    test "reuses an existing email user for Apple login" do
      user = create_user("existing-apple-#{SecureRandom.hex(4)}@example.com")
      payload = apple_payload(
        email: user.email,
        sub: "apple-sub-#{SecureRandom.hex(4)}"
      )

      with_apple_payload(payload) do
        post "/auth/apple", params: { identity_token: "valid-token" }
      end

      assert_response :success

      body = response.parsed_body
      assert_equal user.id, body.dig("data", "id")
      assert_equal "email", body.dig("data", "provider")
      assert_equal user.uid, body.dig("data", "uid")
      assert_equal 1, User.where(email: user.email).count
      assert_auth_headers_present
    end

    test "reuses an existing Apple user without requiring email" do
      user = User.create!(
        email: "existing-apple-provider-#{SecureRandom.hex(4)}@privaterelay.appleid.com",
        provider: "apple",
        uid: "apple-sub-#{SecureRandom.hex(4)}",
        password: "password123",
        confirmed_at: Time.current
      )
      payload = apple_payload(email: nil, sub: user.uid)

      with_apple_payload(payload) do
        post "/auth/apple", params: { identity_token: "valid-token" }
      end

      assert_response :success
      assert_equal user.id, response.parsed_body.dig("data", "id")
      assert_auth_headers_present
    end

    test "rejects an invalid Apple token" do
      with_apple_verification_error do
        post "/auth/apple", params: { identity_token: "invalid-token" }
      end

      assert_response :unauthorized
      assert_equal [ "Apple認証に失敗しました" ], response.parsed_body.fetch("errors")
    end

    private

    def apple_payload(email:, sub:)
      {
        "iss" => "https://appleid.apple.com",
        "aud" => "com.nowon.mobile",
        "sub" => sub,
        "email" => email,
        "email_verified" => true,
        "exp" => 1.hour.from_now.to_i
      }.compact
    end

    def create_user(email)
      User.create!(
        email: email,
        password: "password123",
        uid: email,
        confirmed_at: Time.current
      )
    end

    def with_apple_payload(payload)
      with_apple_verifier(-> { payload }) do
        yield
      end
    end

    def with_apple_verification_error
      with_apple_verifier(-> { raise AppleIdTokenVerifier::Error }) do
        yield
      end
    end

    def with_apple_verifier(verifier)
      original_verify = AppleIdTokenVerifier.method(:verify)
      AppleIdTokenVerifier.define_singleton_method(:verify) do |_identity_token|
        verifier.call
      end

      yield
    ensure
      AppleIdTokenVerifier.define_singleton_method(:verify, original_verify)
    end

    def assert_auth_headers_present
      assert response.headers["access-token"].present?
      assert response.headers["client"].present?
      assert response.headers["uid"].present?
    end
  end
end
