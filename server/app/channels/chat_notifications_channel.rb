class ChatNotificationsChannel < ApplicationCable::Channel
  def self.broadcast_message(message)
    message.chat_room.chat_participants.includes(:user).find_each do |participant|
      broadcast_to(
        participant.user,
        {
          type: "chat_message_created",
          chat_room_id: message.chat_room_id,
          message: {
            id: message.id,
            chat_room_id: message.chat_room_id,
            user_id: message.user_id,
            body: message.body,
            read_count: message.read_count,
            created_at: message.created_at.iso8601,
            updated_at: message.updated_at.iso8601
          }
        }
      )
    end
  end

  def subscribed
    stream_for current_user
  end
end
