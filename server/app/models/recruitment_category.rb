class RecruitmentCategory < ApplicationRecord
  has_many :recruitments, dependent: :restrict_with_error

  validates :name, presence: true
  validates :key, presence: true, uniqueness: true
  validates :display_order, presence: true

  scope :ordered, -> { order(:display_order, :id) }
end
