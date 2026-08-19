module ChatSerialization
  extend ActiveSupport::Concern

  private

  def serialized_chat_room(room)
    last_message = room.last_message

    {
      id: room.id,
      recruitment_id: room.recruitment_id,
      title: room.recruitment.purpose,
      participants: room.chat_participants.reject { |participant| blocked_relation?(participant.user_id) }.map { |participant| serialized_chat_participant(participant) },
      last_message: last_message ? serialized_chat_message(last_message) : nil,
      unread_count: unread_count(room),
      created_at: room.created_at.iso8601,
      updated_at: room.updated_at.iso8601
    }
  end

  def serialized_chat_participant(participant)
    profile = participant.user.user_profile

    {
      id: participant.id,
      user_id: participant.user_id,
      nickname: profile&.nickname || "プロフィール未設定",
      initials: participant_initials(profile),
      avatar_url: participant_avatar_url(profile),
      last_read_message_id: participant.last_read_message_id
    }
  end

  def serialized_chat_message(message)
    {
      id: message.id,
      chat_room_id: message.chat_room_id,
      user_id: message.user_id,
      body: message.body,
      read_count: message.read_count,
      created_at: message.created_at.iso8601,
      updated_at: message.updated_at.iso8601
    }
  end

  def participant_initials(profile)
    nickname = profile&.nickname.to_s.strip
    return "?" if nickname.blank?

    nickname.first
  end

  def participant_avatar_url(profile)
    photo = profile&.profile_photos&.approved&.ordered&.first
    return nil unless photo&.image&.attached?

    rails_blob_url(photo.image, host: request.base_url)
  end

  def unread_count(room)
    participant = room.participant_for(current_user)
    last_read_message_id = participant&.last_read_message_id || 0

    room
      .chat_messages
      .where.not(user_id: current_user.id)
      .where("id > ?", last_read_message_id)
      .count
  end
end
