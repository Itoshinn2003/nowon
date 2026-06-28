class RecruitmentApplication < ApplicationRecord
  belongs_to :recruitment
  belongs_to :user

  enum :status, {
    pending: 0,
    accepted: 1,
    rejected: 2
  }

  validates :user_id, uniqueness: { scope: :recruitment_id }
  validates :status, presence: true
  validates :message, length: { maximum: 120 }, allow_blank: true

  validate :applicant_is_not_recruitment_owner, on: :create
  validate :recruitment_is_active_now, on: :create
  validate :applicant_gender_is_allowed, on: :create
  validate :application_limit_is_not_exceeded, on: :create

  scope :active_for_limit, -> { where(status: %i[pending accepted]) }

  def cancelable?
    (pending? || accepted?) && !recruitment.matched?
  end

  private

  def applicant_is_not_recruitment_owner
    return if recruitment.blank? || user_id.blank?
    return if recruitment.user_id != user_id

    errors.add(:user_id, "cannot apply to own recruitment")
  end

  def recruitment_is_active_now
    return if recruitment.blank?
    return if recruitment.active? && recruitment.expires_at.future?

    errors.add(:recruitment_id, "is not active")
  end

  def applicant_gender_is_allowed
    return if recruitment.blank? || user.blank?
    return if recruitment.allowed_gender_policy == "anyone"

    gender = user.user_profile&.gender

    if recruitment.allowed_gender_policy == "male_only" && gender == "male"
      return
    end

    if recruitment.allowed_gender_policy == "female_only" && gender == "female"
      return
    end

    errors.add(:user_id, "does not satisfy allowed gender policy")
  end

  def application_limit_is_not_exceeded
    return if recruitment.blank?

    application_count = recruitment.recruitment_applications.active_for_limit.count
    return if application_count < recruitment.application_limit

    errors.add(:recruitment_id, "has reached application limit")
  end
end
