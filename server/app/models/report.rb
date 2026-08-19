class Report < ApplicationRecord
  REASONS = %w[
    inappropriate_profile
    harassment
    impersonation
    dangerous_illegal
    spam
    other
  ].freeze

  belongs_to :reporter, class_name: "User"
  belongs_to :reported_user, class_name: "User"

  enum :status, {
    pending: 0,
    reviewed: 1,
    resolved: 2,
    dismissed: 3
  }

  validates :reason, presence: true, inclusion: { in: REASONS }
  validates :details, length: { maximum: 1_000 }, allow_blank: true

  validate :reported_user_is_not_reporter

  private

  def reported_user_is_not_reporter
    return if reporter_id.blank? || reported_user_id.blank?
    return if reporter_id != reported_user_id

    errors.add(:reported_user_id, "cannot report yourself")
  end
end
