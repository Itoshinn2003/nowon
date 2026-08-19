class ChatRoomsController < ApplicationController
  include ChatSerialization

  before_action :authenticate_user!

  def index
    rooms = ChatRoom
            .for_user(current_user)
            .then { |scope| exclude_blocked_rooms(scope) }
            .includes(
              :recruitment,
              chat_messages: :user,
              chat_participants: { user: { user_profile: { profile_photos: { image_attachment: :blob } } } }
            )
            .order(updated_at: :desc)

    render json: {
      chat_rooms: rooms.map { |room| serialized_chat_room(room) },
      current_user_id: current_user.id
    }
  end

  def show
    render json: {
      chat_room: serialized_chat_room(current_chat_room),
      current_user_id: current_user.id
    }
  end

  def read
    room = current_chat_room
    participant = room.participant_for(current_user)
    message = room.chat_messages.find_by(id: params[:last_read_message_id]) || room.chat_messages.order(id: :desc).first

    if message
      participant.update!(last_read_message: message)
      ::ChatRoomChannel.broadcast_read(room, current_user, message)
    end

    render json: {
      chat_room: serialized_chat_room(room.reload),
      current_user_id: current_user.id
    }
  end

  private

  def current_chat_room
    room = ChatRoom
           .for_user(current_user)
           .includes(
             :recruitment,
             chat_messages: :user,
             chat_participants: { user: { user_profile: { profile_photos: { image_attachment: :blob } } } }
           )
           .find(params[:id])

    raise ActiveRecord::RecordNotFound if blocked_room?(room)

    room
  end

  def exclude_blocked_rooms(scope)
    return scope if blocked_user_ids.empty?

    scope.where.not(
      id: ChatParticipant.where(user_id: blocked_user_ids).select(:chat_room_id)
    )
  end

  def blocked_room?(room)
    return false if blocked_user_ids.empty?

    room.chat_participants.any? { |participant| blocked_user_ids.include?(participant.user_id) }
  end
end
