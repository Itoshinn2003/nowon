class PushNotificationEvents
  def self.chat_message_created(message)
    recipient_ids = message
                    .chat_room
                    .chat_participants
                    .where.not(user_id: message.user_id)
                    .pluck(:user_id)

    enqueue(
      recipient_ids,
      title: "新着メッセージ",
      body: message.body.to_s.truncate(80),
      data: {
        type: "chat_message_created",
        chat_room_id: message.chat_room_id,
        message_id: message.id
      }
    )
  end

  def self.recruitment_application_created(application)
    applicant_name = application.user.user_profile&.nickname || "応募者"
    recruitment_purpose = application.recruitment.purpose.to_s

    enqueue(
      [ application.recruitment.user_id ],
      title: "応募が届きました",
      body: "#{applicant_name}さんが「#{recruitment_purpose}」に応募しました".truncate(120),
      data: {
        type: "recruitment_application_created",
        recruitment_id: application.recruitment_id,
        application_id: application.id
      }
    )
  end

  def self.recruitment_application_accepted(application)
    enqueue(
      [ application.user_id ],
      title: "応募が承認されました",
      body: application.recruitment.purpose.to_s,
      data: {
        type: "recruitment_application_accepted",
        recruitment_id: application.recruitment_id,
        application_id: application.id
      }
    )
  end

  def self.recruitment_matched(recruitment)
    recipient_ids = recruitment
                    .recruitment_applications
                    .accepted
                    .pluck(:user_id) + [ recruitment.user_id ]

    enqueue(
      recipient_ids,
      title: "マッチが成立しました",
      body: recruitment.purpose.to_s,
      data: {
        type: "recruitment_matched",
        recruitment_id: recruitment.id
      }
    )
  end

  def self.enqueue(user_ids, title:, body:, data:)
    user_ids = user_ids.compact.uniq
    return if user_ids.empty?

    PushNotificationJob.perform_later(
      user_ids: user_ids,
      title: title,
      body: body,
      data: data
    )
  end

  private_class_method :enqueue
end
