require "test_helper"
require "securerandom"

class RecruitmentApplicationTest < ActiveSupport::TestCase
  test "accepted application is cancelable when recruitment is not matched" do
    recruitment = create_recruitment
    application = recruitment.recruitment_applications.create!(
      user: create_user("applicant@example.com"),
      status: :accepted
    )

    recruitment.update!(status: :closed, closed_at: Time.current)

    assert application.cancelable?
  end

  test "accepted application is not cancelable when recruitment is matched" do
    recruitment = create_recruitment
    application = recruitment.recruitment_applications.create!(
      user: create_user("matched-applicant@example.com"),
      status: :accepted
    )

    recruitment.update!(status: :matched)

    assert_not application.cancelable?
  end

  private

  def create_user(email)
    User.create!(
      email: email,
      password: "password123",
      uid: email
    )
  end

  def create_recruitment
    Recruitment.create!(
      user: create_user("owner-#{SecureRandom.hex(4)}@example.com"),
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

  def create_category
    RecruitmentCategory.create!(
      name: "食事",
      key: "meal-#{SecureRandom.hex(4)}",
      display_order: 1
    )
  end
end
