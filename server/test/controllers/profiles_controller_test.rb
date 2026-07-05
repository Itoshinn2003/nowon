require "test_helper"
require "securerandom"

class ProfilesControllerTest < ActionDispatch::IntegrationTest
  test "show returns another user's profile by user id" do
    viewer = create_user("viewer-#{SecureRandom.hex(4)}@example.com")
    user = create_user("profile-user-#{SecureRandom.hex(4)}@example.com")
    profile = create_profile(user)

    get "/profiles/#{user.id}", headers: viewer.create_new_auth_token

    assert_response :success

    body = response.parsed_body
    assert_equal profile.id, body.dig("profile", "id")
    assert_equal user.id, body.dig("profile", "user_id")
    assert_equal "テスト太郎", body.dig("profile", "nickname")
  end

  test "show returns nil when the user has no profile" do
    viewer = create_user("no-profile-viewer-#{SecureRandom.hex(4)}@example.com")
    user = create_user("no-profile-user-#{SecureRandom.hex(4)}@example.com")

    get "/profiles/#{user.id}", headers: viewer.create_new_auth_token

    assert_response :success
    assert_nil response.parsed_body["profile"]
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

  def create_profile(user)
    UserProfile.create!(
      user: user,
      nickname: "テスト太郎",
      birth_date: Date.new(2000, 1, 1),
      gender: "male",
      bio: "よろしくお願いします"
    )
  end
end
