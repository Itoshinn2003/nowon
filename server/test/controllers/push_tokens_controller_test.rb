require "test_helper"
require "securerandom"

class PushTokensControllerTest < ActionDispatch::IntegrationTest
  test "create registers a push token for the current user" do
    user = create_user("push-token-#{SecureRandom.hex(4)}@example.com")

    assert_difference("DevicePushToken.count", 1) do
      post "/push_tokens",
           params: { push_token: { token: "ExpoPushToken[#{SecureRandom.hex(16)}]", platform: "ios" } },
           headers: user.create_new_auth_token
    end

    assert_response :created
    assert_equal user.id, DevicePushToken.last.user_id
    assert_equal "ios", response.parsed_body.dig("push_token", "platform")
  end

  test "create moves an existing token to the current user" do
    old_user = create_user("old-push-token-#{SecureRandom.hex(4)}@example.com")
    new_user = create_user("new-push-token-#{SecureRandom.hex(4)}@example.com")
    token = "ExpoPushToken[#{SecureRandom.hex(16)}]"

    DevicePushToken.create!(
      user: old_user,
      token: token,
      platform: "ios",
      enabled: false,
      invalidated_at: Time.current,
      last_seen_at: 1.day.ago
    )

    assert_no_difference("DevicePushToken.count") do
      post "/push_tokens",
           params: { push_token: { token: token, platform: "android" } },
           headers: new_user.create_new_auth_token
    end

    push_token = DevicePushToken.find_by!(token: token)
    assert_response :created
    assert_equal new_user.id, push_token.user_id
    assert_equal "android", push_token.platform
    assert_predicate push_token, :enabled
    assert_nil push_token.invalidated_at
  end

  test "destroy invalidates the current user's token" do
    user = create_user("delete-push-token-#{SecureRandom.hex(4)}@example.com")
    token = "ExpoPushToken[#{SecureRandom.hex(16)}]"
    push_token = DevicePushToken.create!(
      user: user,
      token: token,
      platform: "ios",
      last_seen_at: Time.current
    )

    delete "/push_tokens",
           params: { push_token: { token: token } },
           headers: user.create_new_auth_token

    assert_response :no_content
    assert_not push_token.reload.enabled
    assert_not_nil push_token.invalidated_at
  end

  private

  def create_user(email)
    User.create!(
      email: email,
      password: "password123",
      uid: email,
      confirmed_at: Time.current
    )
  end
end
