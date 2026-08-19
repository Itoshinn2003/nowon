class Block < ApplicationRecord
  belongs_to :blocker, class_name: "User"
  belongs_to :blocked_user, class_name: "User"

  validates :blocked_user_id, uniqueness: { scope: :blocker_id }

  validate :blocked_user_is_not_blocker

  def self.between?(first_user_id, second_user_id)
    return false if first_user_id.blank? || second_user_id.blank?
    return false if first_user_id == second_user_id

    where(blocker_id: first_user_id, blocked_user_id: second_user_id)
      .or(where(blocker_id: second_user_id, blocked_user_id: first_user_id))
      .exists?
  end

  def self.related_user_ids_for(user)
    blocked_user_ids = where(blocker_id: user.id).pluck(:blocked_user_id)
    blocker_ids = where(blocked_user_id: user.id).pluck(:blocker_id)

    (blocked_user_ids + blocker_ids).uniq
  end

  private

  def blocked_user_is_not_blocker
    return if blocker_id.blank? || blocked_user_id.blank?
    return if blocker_id != blocked_user_id

    errors.add(:blocked_user_id, "cannot block yourself")
  end
end
