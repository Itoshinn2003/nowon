require "test_helper"
require "securerandom"

class RecruitmentsControllerTest < ActionDispatch::IntegrationTest
  test "show returns an active recruitment" do
    owner = create_user("owner-#{SecureRandom.hex(4)}@example.com")
    viewer = create_user("viewer-#{SecureRandom.hex(4)}@example.com")
    recruitment = create_recruitment(owner)

    get "/recruitments/#{recruitment.id}", headers: viewer.create_new_auth_token

    assert_response :success

    body = response.parsed_body
    assert_equal recruitment.id, body.dig("recruitment", "id")
    assert_equal "ランチ", body.dig("recruitment", "purpose")
  end

  test "show hides closed recruitments from unrelated users" do
    owner = create_user("closed-owner-#{SecureRandom.hex(4)}@example.com")
    viewer = create_user("closed-viewer-#{SecureRandom.hex(4)}@example.com")
    recruitment = create_recruitment(owner)
    recruitment.update!(status: :closed, closed_at: Time.current)

    get "/recruitments/#{recruitment.id}", headers: viewer.create_new_auth_token

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

  def create_recruitment(user)
    Recruitment.create!(
      user: user,
      recruitment_category: create_category,
      recruitment_type: :one_to_one,
      purpose: "ランチ",
      vibe: "気軽に",
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
