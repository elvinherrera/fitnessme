class Post < ApplicationRecord
  belongs_to :board, optional: true
  has_many :comments
  belongs_to :user
  has_many :tutorials
  has_many :likes
  
end
