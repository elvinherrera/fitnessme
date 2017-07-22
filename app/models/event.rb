class Event < ApplicationRecord
  belongs_to :group
  has_many :user_events
  has_many :users, through: :user_events

  has_many :images
  has_many :tags
  has_many :likes
  belongs_to :board, optional: true
end
