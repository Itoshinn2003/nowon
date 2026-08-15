require "test_helper"
require "securerandom"

module Auth
  class GoogleAuthenticationsControllerTest < ActionDispatch::IntegrationTest
    test "creates a user and returns auth headers with a valid Google token" do
      payload = google_payload(
        email: "google-#{SecureRandom.hex(4)}@example.com",
        sub: "google-sub-#{SecureRandom.hex(4)}"
      )

      with_google_payload(payload) do
        post "/auth/google", params: { id_token: "valid-token" }
      end

      assert_response :success

      body = response.parsed_body
      user = User.find_by!(email: payload.fetch("email"))
      assert_equal user.id, body.dig("data", "id")
      assert_equal "google", body.dig("data", "provider")
      assert_equal payload.fetch("sub"), body.dig("data", "uid")
      assert_equal payload.fetch("name"), user.name
      assert user.confirmed?
      assert_auth_headers_present
    end

    test "reuses an existing email user for Google login" do
      user = create_user("existing-google-#{SecureRandom.hex(4)}@example.com")
      payload = google_payload(
        email: user.email,
        sub: "google-sub-#{SecureRandom.hex(4)}"
      )

      with_google_payload(payload) do
        post "/auth/google", params: { id_token: "valid-token" }
      end

      assert_response :success

      body = response.parsed_body
      assert_equal user.id, body.dig("data", "id")
      assert_equal "email", body.dig("data", "provider")
      assert_equal user.uid, body.dig("data", "uid")
      assert_equal 1, User.where(email: user.email).count
      assert_auth_headers_present
    end

    test "rejects an invalid Google token" do
      with_google_verification_error do
        post "/auth/google", params: { id_token: "invalid-token" }
      end

      assert_response :unauthorized
      assert_equal [ "Google認証に失敗しました" ], response.parsed_body.fetch("errors")
    end

    private

    def google_payload(email:, sub:)
      {
        "iss" => "https://accounts.google.com",
        "aud" => "google-client-id",
        "sub" => sub,
        "email" => email,
        "email_verified" => true,
        "name" => "Google User",
        "picture" => "https://example.com/avatar.png"
      }
    end

    def create_user(email)
      User.create!(
        email: email,
        password: "password123",
        uid: email,
        confirmed_at: Time.current
      )
    end

    def with_google_payload(payload)
      with_google_verifier(-> { payload }) do
        yield
      end
    end

    def with_google_verification_error
      with_google_verifier(-> { raise GoogleIdTokenVerifier::Error }) do
        yield
      end
    end

    def with_google_verifier(verifier)
      original_verify = GoogleIdTokenVerifier.method(:verify)
      GoogleIdTokenVerifier.define_singleton_method(:verify) do |_id_token|
        verifier.call
      end

      yield
    ensure
      GoogleIdTokenVerifier.define_singleton_method(:verify, original_verify)
    end

    def assert_auth_headers_present
      assert response.headers["access-token"].present?
      assert response.headers["client"].present?
      assert response.headers["uid"].present?
    end
  end
end
