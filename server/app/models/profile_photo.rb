class ProfilePhoto < ApplicationRecord
  STATUSES = %w[pending approved rejected].freeze
  MAX_PHOTOS_PER_PROFILE = 6
  MAX_IMAGE_SIZE = 10.megabytes
  ALLOWED_CONTENT_TYPES = %w[image/jpeg image/png image/webp image/heic image/heif].freeze

  belongs_to :user_profile
  has_one_attached :image

  validates :position,
            presence: true,
            numericality: {
              only_integer: true,
              greater_than: 0,
              less_than_or_equal_to: MAX_PHOTOS_PER_PROFILE
            },
            uniqueness: { scope: :user_profile_id }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :rejection_reason, length: { maximum: 255 }, allow_blank: true

  validate :image_is_attached
  validate :image_content_type
  validate :image_size
  validate :photo_count_within_limit, on: :create

  scope :approved, -> { where(status: "approved") }
  scope :ordered, -> { order(:position) }

  private

  def image_is_attached
    errors.add(:image, :blank) unless image.attached?
  end

  def image_content_type
    return unless image.attached?
    return if image.content_type.in?(ALLOWED_CONTENT_TYPES)

    errors.add(:image, :invalid)
  end

  def image_size
    return unless image.attached?
    return if image.blob.byte_size <= MAX_IMAGE_SIZE

    errors.add(:image, :too_large)
  end

  def photo_count_within_limit
    return if user_profile.blank?
    return if user_profile.profile_photos.where.not(id: id).count < MAX_PHOTOS_PER_PROFILE

    errors.add(:base, :too_many_profile_photos)
  end
end
