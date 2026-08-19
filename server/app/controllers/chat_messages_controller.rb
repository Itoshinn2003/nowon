class ChatMessagesController < ApplicationController
  include ChatSerialization

  before_action :authenticate_user!

  def index
    room = current_chat_room
    messages = room.chat_messages.order(:created_at, :id)

    mark_read!(room, messages.last)

    render json: {
      messages: messages.map { |message| serialized_chat_message(message) },
      current_user_id: current_user.id
    }
  end

  def create
    room = current_chat_room
    message = room.chat_messages.build(message_params.merge(user: current_user))

    if message.save
      mark_read!(room, message)
      ::ChatRoomChannel.broadcast_message(message)
      ::ChatNotificationsChannel.broadcast_message(message)
      ::PushNotificationEvents.chat_message_created(message)
      render json: { message: serialized_chat_message(message) }, status: :created
    else
      render json: { errors: message.errors.to_hash }, status: :unprocessable_entity
    end
  end

  private

  def current_chat_room
    room = ChatRoom
           .for_user(current_user)
           .includes(:recruitment, :chat_participants)
           .find(params[:chat_room_id])

    raise ActiveRecord::RecordNotFound if blocked_room?(room)

    room
  end

  def message_params
    params.fetch(:message, params).permit(:body)
  end

  def mark_read!(room, message)
    return unless message

    participant = room.participant_for(current_user)
    participant.update!(last_read_message: message)
    ::ChatRoomChannel.broadcast_read(room, current_user, message)
  end

  def blocked_room?(room)
    return false if blocked_user_ids.empty?

    room.chat_participants.any? { |participant| blocked_user_ids.include?(participant.user_id) }
  end
end
