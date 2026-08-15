require "test_helper"
require "securerandom"

module Auth
  class SessionsControllerTest < ActionDispatch::IntegrationTest
    test "returns auth headers on email sign in" do
      user = User.create!(
        email: "signin-#{SecureRandom.hex(4)}@example.com",
        password: "password123",
        uid: "signin-#{SecureRandom.hex(4)}@example.com",
        confirmed_at: Time.current
      )

      post "/auth/sign_in", params: {
        email: user.email,
        password: "password123"
      }

      assert_response :success
      assert response.headers["access-token"].present?
      assert response.headers["client"].present?
      assert response.headers["uid"].present?
      assert response.headers["expiry"].present?
    end
  end
end
