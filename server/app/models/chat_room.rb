class ChatRoom < ApplicationRecord
  belongs_to :recruitment
  has_many :chat_participants, dependent: :destroy
  has_many :participants, through: :chat_participants, source: :user
  has_many :chat_messages, dependent: :destroy

  validates :recruitment_id, presence: true, uniqueness: true

  scope :for_user, ->(user) {
    joins(:chat_participants).where(chat_participants: { user_id: user.id })
  }

  def participant_for(user)
    chat_participants.find { |participant| participant.user_id == user.id } ||
      chat_participants.find_by(user: user)
  end

  def participant?(user)
    participant_for(user).present?
  end

  def last_message
    chat_messages.max_by(&:created_at) || chat_messages.order(created_at: :desc).first
  end
end
