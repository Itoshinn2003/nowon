class ChatRoomChannel < ApplicationCable::Channel
  def self.broadcast_message(message)
    broadcast_to(
      message.chat_room,
      {
        type: "message",
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

  def self.broadcast_read(room, user, message)
    broadcast_to(
      room,
      {
        type: "read",
        user_id: user.id,
        last_read_message_id: message.id
      }
    )
  end

  def subscribed
    @room = ChatRoom.find(params[:chat_room_id])

    return reject unless @room.participant?(current_user)

    stream_for @room
  end

  def typing(data)
    return unless @room&.participant?(current_user)

    ChatRoomChannel.broadcast_to(
      @room,
      {
        type: "typing",
        is_typing: ActiveModel::Type::Boolean.new.cast(data["is_typing"]),
        user: serialized_user(current_user)
      }
    )
  end

  private

  def serialized_user(user)
    profile = user.user_profile
    nickname = profile&.nickname || "プロフィール未設定"

    {
      user_id: user.id,
      nickname: nickname,
      initials: nickname.first || "?",
      avatar_url: nil
    }
  end
end
