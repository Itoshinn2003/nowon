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

  test "complete onboarding does not update completed at without a profile photo" do
    user = create_user("onboarding-no-photo-#{SecureRandom.hex(4)}@example.com")
    create_profile(user)

    patch "/profile/complete_onboarding", headers: user.create_new_auth_token

    assert_response :unprocessable_entity
    assert_nil user.reload.onboarding_completed_at
  end

  test "complete onboarding updates completed at with a valid profile and photo" do
    user = create_user("onboarding-complete-#{SecureRandom.hex(4)}@example.com")
    profile = create_profile(user)
    create_photo(profile)

    patch "/profile/complete_onboarding", headers: user.create_new_auth_token

    assert_response :success
    assert_not_nil user.reload.onboarding_completed_at
    assert_equal user.onboarding_completed_at.iso8601, response.parsed_body["onboarding_completed_at"]
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

  def create_photo(profile)
    profile.profile_photos.create!(
      position: 1,
      status: "approved",
      image: {
        io: StringIO.new("image"),
        filename: "profile.jpg",
        content_type: "image/jpeg"
      }
    )
  end
end
