class Board < ApplicationRecord
  has_many :events
  has_many :posts
  has_many :tags
  has_many :tutorials
end
