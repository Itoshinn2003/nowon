class Recruitment < ApplicationRecord
  APPLICATION_LIMIT = 10
  GROUP_RECRUITING_PEOPLE_MAX = 4

  belongs_to :user
  belongs_to :recruitment_category
  has_many :recruitment_applications, dependent: :destroy

  enum :recruitment_type, {
    one_to_one: 0,
    group: 1
  }, prefix: true

  enum :allowed_gender_policy, {
    male_only: 0,
    female_only: 1,
    anyone: 2
  }

  enum :status, {
    active: 0,
    closed: 1,
    expired: 2,
    matched: 3
  }

  before_validation :set_default_expires_at, on: :create
  before_validation :set_fixed_application_limit

  validates :user_id, presence: true
  validates :recruitment_type, presence: true
  validates :recruitment_category_id, presence: true
  validates :purpose, presence: true, length: { maximum: 30 }
  validates :description, length: { maximum: 120 }, allow_blank: true
  validates :vibe, presence: true, length: { maximum: 30 }
  validates :recruiting_people_min, presence: true
  validates :recruiting_people_max, presence: true
  validates :application_limit, presence: true
  validates :allowed_gender_policy, presence: true
  validates :latitude, presence: true
  validates :longitude, presence: true
  validates :status, presence: true
  validates :expires_at, presence: true
  validates :safety_confirmed, acceptance: { accept: true }

  validate :recruiting_people_min_is_not_greater_than_max
  validate :recruiting_people_max_is_within_limit
  validate :recruiting_people_count_matches_recruitment_type
  validate :application_limit_is_fixed
  validate :only_one_active_recruitment_per_user, on: :create

  scope :active_now, -> { active.where("expires_at > ?", Time.current) }
  scope :visible_to_owner, -> { active_now.or(matched) }

  def accepted_application_count
    recruitment_applications.accepted.count
  end

  def matchable?
    active? &&
      expires_at.future? &&
      accepted_application_count >= recruiting_people_min
  end

  def max_accepted?
    accepted_application_count >= recruiting_people_max
  end

  private

  def set_default_expires_at
    self.expires_at ||= 60.minutes.from_now
  end

  def set_fixed_application_limit
    self.application_limit = APPLICATION_LIMIT
  end

  def recruiting_people_min_is_not_greater_than_max
    return if recruiting_people_min.blank? || recruiting_people_max.blank?
    return if recruiting_people_min <= recruiting_people_max

    errors.add(:recruiting_people_min, "must be less than or equal to recruiting people max")
  end

  def recruiting_people_max_is_within_limit
    return if recruiting_people_max.blank? || recruiting_people_max <= GROUP_RECRUITING_PEOPLE_MAX

    errors.add(:recruiting_people_max, "must be less than or equal to #{GROUP_RECRUITING_PEOPLE_MAX}")
  end

  def recruiting_people_count_matches_recruitment_type
    return if recruitment_type.blank?
    return if recruiting_people_min.blank? || recruiting_people_max.blank?

    if recruitment_type_one_to_one? && (recruiting_people_min != 1 || recruiting_people_max != 1)
      errors.add(:recruiting_people_max, "must be 1 for one to one recruitment")
    end

    return unless recruitment_type_group? && recruiting_people_min < 2

    errors.add(:recruiting_people_min, "must be greater than or equal to 2 for group recruitment")
  end

  def application_limit_is_fixed
    return if application_limit.blank?
    return if application_limit == APPLICATION_LIMIT

    errors.add(:application_limit, "must be #{APPLICATION_LIMIT}")
  end

  def only_one_active_recruitment_per_user
    return if user_id.blank? || !active?
    return unless user.recruitments.active_now.exists?

    errors.add(:user_id, "already has an active recruitment")
  end
end
