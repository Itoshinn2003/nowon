require "test_helper"

class UserProfileTest < ActiveSupport::TestCase
  test "requires user to be at least 18 years old" do
    profile = UserProfile.new(
      user: create_user("underage-profile@example.com"),
      nickname: "テスト太郎",
      birth_date: Time.zone.today.advance(years: -18, days: 1),
      gender: "male",
      bio: "よろしくお願いします"
    )

    assert_not profile.valid?
    assert_includes profile.errors[:birth_date], "は18歳以上で登録してください"
  end

  test "allows user who is 18 years old today" do
    profile = UserProfile.new(
      user: create_user("adult-profile@example.com"),
      nickname: "テスト太郎",
      birth_date: Time.zone.today.advance(years: -18),
      gender: "male",
      bio: "よろしくお願いします"
    )

    assert profile.valid?
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
