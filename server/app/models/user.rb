class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  include DeviseTokenAuth::Concerns::User

  has_one :user_profile, dependent: :destroy
  has_many :recruitments, dependent: :destroy
  has_many :recruitment_applications, dependent: :destroy
  has_many :chat_participants, dependent: :destroy
  has_many :chat_rooms, through: :chat_participants
  has_many :chat_messages, dependent: :destroy
  has_many :device_push_tokens, dependent: :destroy
  has_many :sent_reports, class_name: "Report", foreign_key: :reporter_id, dependent: :destroy, inverse_of: :reporter
  has_many :received_reports, class_name: "Report", foreign_key: :reported_user_id, dependent: :destroy, inverse_of: :reported_user
  has_many :blocks_as_blocker, class_name: "Block", foreign_key: :blocker_id, dependent: :destroy, inverse_of: :blocker
  has_many :blocks_as_blocked, class_name: "Block", foreign_key: :blocked_user_id, dependent: :destroy, inverse_of: :blocked_user
end
