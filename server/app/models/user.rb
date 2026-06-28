class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  include DeviseTokenAuth::Concerns::User

  has_one :user_profile, dependent: :destroy
  has_many :recruitments, dependent: :destroy
  has_many :recruitment_applications, dependent: :destroy
end
