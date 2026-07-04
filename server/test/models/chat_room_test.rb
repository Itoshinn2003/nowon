require "test_helper"

class ChatRoomTest < ActiveSupport::TestCase
  test "ensure_chat_room creates room for owner and accepted applicants" do
    recruitment = create_recruitment
    accepted_user = create_user("accepted-chat@example.com")
    pending_user = create_user("pending-chat@example.com")

    recruitment.recruitment_applications.create!(user: accepted_user, status: :accepted)
    recruitment.recruitment_applications.create!(user: pending_user, status: :pending)
    recruitment.update!(status: :matched, closed_at: Time.current)

    room = recruitment.ensure_chat_room!

    assert_equal [ recruitment.user_id, accepted_user.id ].sort, room.participants.pluck(:id).sort
  end

  test "ensure_chat_room is idempotent" do
    recruitment = create_recruitment
    accepted_user = create_user("idempotent-chat@example.com")

    recruitment.recruitment_applications.create!(user: accepted_user, status: :accepted)
    recruitment.update!(status: :matched, closed_at: Time.current)

    room = recruitment.ensure_chat_room!

    assert_equal room, recruitment.ensure_chat_room!
    assert_equal 2, room.chat_participants.count
  end

  private

  def create_recruitment
    Recruitment.create!(
      user: create_user("chat-owner@example.com"),
      recruitment_category: create_category,
      recruitment_type: :one_to_one,
      purpose: "東京駅でランチ",
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
      key: "chat_test_#{SecureRandom.hex(4)}",
      name: "チャットテスト",
      display_order: 1
    )
  end

  def create_user(email)
    local, domain = email.split("@", 2)

    User.create!(
      email: "#{local}-#{SecureRandom.hex(4)}@#{domain}",
      password: "password123",
      confirmed_at: Time.current
    )
  end
end
