class DevicePushToken < ApplicationRecord
  PLATFORMS = %w[ios android web unknown].freeze
  EXPO_TOKEN_PATTERN = /\A(?:ExponentPushToken|ExpoPushToken)\[[^\]]+\]\z/

  belongs_to :user

  validates :token, presence: true, uniqueness: true, format: { with: EXPO_TOKEN_PATTERN }
  validates :platform, presence: true, inclusion: { in: PLATFORMS }

  scope :deliverable, -> { where(enabled: true, invalidated_at: nil) }

  def mark_seen!(platform:)
    update!(
      platform: platform.presence || "unknown",
      enabled: true,
      invalidated_at: nil,
      last_seen_at: Time.current
    )
  end

  def invalidate!
    update!(enabled: false, invalidated_at: Time.current)
  end
end
