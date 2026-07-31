require "test_helper"
require "securerandom"

class RecruitmentTest < ActiveSupport::TestCase
  test "defaults expiration to two hours from creation" do
    travel_to Time.zone.local(2026, 7, 31, 12, 0, 0) do
      recruitment = create_recruitment

      assert_equal 2.hours.from_now, recruitment.expires_at
    end
  end

  private

  def create_recruitment
    Recruitment.create!(
      user: create_user,
      recruitment_category: create_category,
      recruitment_type: :one_to_one,
      purpose: "ランチ",
      vibe: "気軽に",
      description: "駅前で少し話したいです",
      recruiting_people_min: 1,
      recruiting_people_max: 1,
      allowed_gender_policy: :anyone,
      latitude: 35.681236,
      longitude: 139.767125,
      safety_confirmed: true
    )
  end

  def create_user
    email = "recruitment-owner-#{SecureRandom.hex(4)}@example.com"

    User.create!(
      email: email,
      password: "password123",
      uid: email,
      confirmed_at: Time.current
    )
  end

  def create_category
    RecruitmentCategory.create!(
      name: "食事",
      key: "meal-#{SecureRandom.hex(4)}",
      display_order: 1
    )
  end
end
