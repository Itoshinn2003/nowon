require "test_helper"

class ChatMessagesControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    clear_enqueued_jobs
    clear_performed_jobs
  end

  teardown do
    clear_enqueued_jobs
    clear_performed_jobs
  end

  test "create enqueues a push notification for other chat participants" do
    room = create_room
    sender = room.participants.first
    recipient = room.participants.second

    assert_enqueued_jobs 1, only: PushNotificationJob do
      post "/chat_rooms/#{room.id}/messages",
           params: { message: { body: "こんにちは" } },
           headers: sender.create_new_auth_token
    end

    assert_response :created

    job = enqueued_jobs.find { |enqueued_job| enqueued_job[:job] == PushNotificationJob }
    arguments = job[:args].first.with_indifferent_access

    assert_equal [ recipient.id ], arguments[:user_ids]
    assert_equal "新着メッセージ", arguments[:title]
    assert_equal "こんにちは", arguments[:body]
    assert_equal "chat_message_created", arguments[:data]["type"]
    assert_equal room.id, arguments[:data]["chat_room_id"]
  end

  private

  def create_room
    recruitment = Recruitment.create!(
      user: create_user("chat-controller-owner@example.com"),
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
    participant = create_user("chat-controller-participant@example.com")
    room = recruitment.create_chat_room!
    room.chat_participants.create!(user: recruitment.user)
    room.chat_participants.create!(user: participant)
    room
  end

  def create_category
    RecruitmentCategory.create!(
      key: "chat_controller_test_#{SecureRandom.hex(4)}",
      name: "チャットコントローラテスト",
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
