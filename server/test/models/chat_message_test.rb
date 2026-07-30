require "test_helper"

class ChatMessageTest < ActiveSupport::TestCase
  test "message sender must be a chat participant" do
    room = create_room
    outsider = create_user("chat-outsider@example.com")
    message = room.chat_messages.build(user: outsider, body: "こんにちは")

    assert_not message.valid?
    assert_includes message.errors[:user_id], "is not a chat participant"
  end

  test "read_count excludes sender" do
    room = create_room
    sender = room.participants.first
    reader = room.participants.second
    message = room.chat_messages.create!(user: sender, body: "集合場所を決めましょう")

    room.chat_participants.find_by!(user: sender).update!(last_read_message: message)

    assert_equal 0, message.read_count

    room.chat_participants.find_by!(user: reader).update!(last_read_message: message)

    assert_equal 1, message.read_count
  end

  private

  def create_room
    recruitment = Recruitment.create!(
      user: create_user("chat-message-owner@example.com"),
      recruitment_category: create_category,
      recruitment_type: :one_to_one,
      purpose: "東京駅でランチ",
      vibe: "気軽に",
      description: "駅前で少し話したいです",
      recruiting_people_min: 1,
      recruiting_people_max: 1,
      allowed_gender_policy: :anyone,
      latitude: 35.681236,
      longitude: 139.767125,
      safety_confirmed: true,
      status: :matched,
      closed_at: Time.current
    )
    participant = create_user("chat-message-participant@example.com")
    room = recruitment.create_chat_room!
    room.chat_participants.create!(user: recruitment.user)
    room.chat_participants.create!(user: participant)
    room
  end

  def create_category
    RecruitmentCategory.create!(
      key: "chat_message_test_#{SecureRandom.hex(4)}",
      name: "チャットメッセージテスト",
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
