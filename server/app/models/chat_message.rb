class ChatMessage < ApplicationRecord
  BODY_MAX_LENGTH = 1_000

  belongs_to :chat_room, touch: true
  belongs_to :user

  validates :body, presence: true, length: { maximum: BODY_MAX_LENGTH }
  validate :sender_is_chat_participant

  def read_count
    chat_room
      .chat_participants
      .where.not(user_id: user_id)
      .where("last_read_message_id >= ?", id)
      .count
  end

  private

  def sender_is_chat_participant
    return if chat_room.blank? || user_id.blank?
    return if chat_room.chat_participants.exists?(user_id: user_id)

    errors.add(:user_id, "is not a chat participant")
  end
end
