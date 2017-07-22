class Group < ApplicationRecord
  has_many :users
  has_many :events
  has_many :images
  has_many :profile_groups
  has_many :profiles, through: :profile_groups
  has_many :tags
end
