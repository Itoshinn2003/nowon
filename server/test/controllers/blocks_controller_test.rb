require "test_helper"
require "securerandom"

class BlocksControllerTest < ActionDispatch::IntegrationTest
  test "create stores a block" do
    blocker = create_user("blocker-#{SecureRandom.hex(4)}@example.com")
    blocked_user = create_user("blocked-#{SecureRandom.hex(4)}@example.com")

    assert_difference("Block.count", 1) do
      post "/blocks",
           params: {
             block: {
               blocked_user_id: blocked_user.id
             }
           },
           headers: blocker.create_new_auth_token
    end

    assert_response :created
    assert Block.between?(blocker.id, blocked_user.id)
  end

  test "create rejects self block" do
    user = create_user("self-block-#{SecureRandom.hex(4)}@example.com")

    assert_no_difference("Block.count") do
      post "/blocks",
           params: {
             block: {
               blocked_user_id: user.id
             }
           },
           headers: user.create_new_auth_token
    end

    assert_response :unprocessable_entity
  end

  test "blocked profile is hidden" do
    blocker = create_user("profile-blocker-#{SecureRandom.hex(4)}@example.com")
    blocked_user = create_user("profile-blocked-#{SecureRandom.hex(4)}@example.com")
    create_profile(blocked_user)

    Block.create!(blocker: blocker, blocked_user: blocked_user)

    get "/profiles/#{blocked_user.id}", headers: blocker.create_new_auth_token

    assert_response :not_found
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
