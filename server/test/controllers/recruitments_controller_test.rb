require "test_helper"
require "securerandom"

class RecruitmentsControllerTest < ActionDispatch::IntegrationTest
  include ActionCable::TestHelper

  test "index filters recruitments by map bounds" do
    viewer = create_user("bounds-viewer-#{SecureRandom.hex(4)}@example.com")
    inside_owner = create_user("inside-owner-#{SecureRandom.hex(4)}@example.com")
    outside_owner = create_user("outside-owner-#{SecureRandom.hex(4)}@example.com")
    inside_recruitment = create_recruitment(
      inside_owner,
      latitude: 35.681236,
      longitude: 139.767125
    )
    outside_recruitment = create_recruitment(
      outside_owner,
      latitude: 35.75,
      longitude: 139.82
    )

    get "/recruitments", params: {
      north: 35.69,
      south: 35.67,
      east: 139.78,
      west: 139.75
    }, headers: viewer.create_new_auth_token

    assert_response :success

    recruitment_ids = response
                      .parsed_body
                      .fetch("recruitments")
                      .map { |recruitment| recruitment.fetch("id") }
    assert_includes recruitment_ids, inside_recruitment.id
    assert_not_includes recruitment_ids, outside_recruitment.id
  end

  test "create broadcasts created recruitment to map subscribers" do
    owner = create_user("broadcast-owner-#{SecureRandom.hex(4)}@example.com")
    category = create_category

    broadcasting = RecruitmentsChannel.broadcasting_for(
      RecruitmentsChannel::MAP_STREAM
    )
    broadcasts = capture_broadcasts(broadcasting) do
      post "/recruitments", params: {
        recruitment: {
          recruitment_type: "one_to_one",
          recruitment_category_id: category.id,
          purpose: "ランチ",
          recruiting_people_min: 1,
          recruiting_people_max: 1,
          allowed_gender_policy: "anyone",
          latitude: 35.681236,
          longitude: 139.767125,
          description: "駅前で少し話したいです",
          safety_confirmed: true
        }
      }, headers: owner.create_new_auth_token
    end

    assert_response :created
    assert_equal 1, broadcasts.size
    assert_equal "", response.parsed_body.dig("recruitment", "vibe")

    message = broadcasts.first
    recruitment = message.fetch("recruitment")
    assert_equal "recruitment_created", message.fetch("type")
    assert_equal(
      response.parsed_body.dig("recruitment", "id"),
      recruitment.fetch("id")
    )
    assert_equal "35.681236", recruitment.fetch("latitude")
    assert_equal "139.767125", recruitment.fetch("longitude")
  end

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

  def create_recruitment(user, latitude: 35.681236, longitude: 139.767125)
    Recruitment.create!(
      user: user,
      recruitment_category: create_category,
      recruitment_type: :one_to_one,
      purpose: "ランチ",
      vibe: "気軽に",
      recruiting_people_min: 1,
      recruiting_people_max: 1,
      allowed_gender_policy: :anyone,
      latitude: latitude,
      longitude: longitude,
      description: "駅前で少し話したいです",
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
