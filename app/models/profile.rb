class Profile < ApplicationRecord
  has_many :tutorials
  has_many :images
  belongs_to :user
  has_many :profile_groups
  has_many :groups, through: :profile_groups
  has_many :tags
end
