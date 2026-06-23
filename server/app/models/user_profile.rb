class UserProfile < ApplicationRecord
  GENDERS = %w[male female other no_answer].freeze

  belongs_to :user
  has_many :profile_photos, dependent: :destroy

  validates :user_id, uniqueness: true
  validates :nickname, presence: true, length: { maximum: 12 }
  validates :birth_date, presence: true
  validates :gender, presence: true, inclusion: { in: GENDERS }
  validates :bio, length: { maximum: 160 }, allow_blank: true

  validate :birth_date_is_not_in_future

  def age(reference_date = Time.zone.today)
    return if birth_date.blank?

    years = reference_date.year - birth_date.year
    birthday_passed = reference_date.month > birth_date.month ||
                      (reference_date.month == birth_date.month && reference_date.day >= birth_date.day)

    birthday_passed ? years : years - 1
  end

  private

  def birth_date_is_not_in_future
    return if birth_date.blank? || birth_date <= Time.zone.today

    errors.add(:birth_date, :future)
  end
end
