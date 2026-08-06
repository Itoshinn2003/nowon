require "test_helper"

class DevicePushTokenTest < ActiveSupport::TestCase
  test "validates expo push token format" do
    token = DevicePushToken.new(
      user: users(:one),
      token: "invalid-token",
      platform: "ios",
      last_seen_at: Time.current
    )

    assert_not token.valid?
    assert_not_empty token.errors[:token]
  end

  test "deliverable excludes disabled and invalidated tokens" do
    deliverable = create_push_token("ExpoPushToken[deliverable]")
    disabled = create_push_token("ExpoPushToken[disabled]", enabled: false)
    invalidated = create_push_token("ExpoPushToken[invalidated]", invalidated_at: Time.current)

    assert_includes DevicePushToken.deliverable, deliverable
    assert_not_includes DevicePushToken.deliverable, disabled
    assert_not_includes DevicePushToken.deliverable, invalidated
  end

  private

  def create_push_token(token, enabled: true, invalidated_at: nil)
    DevicePushToken.create!(
      user: users(:one),
      token: token,
      platform: "ios",
      enabled: enabled,
      invalidated_at: invalidated_at,
      last_seen_at: Time.current
    )
  end
end
