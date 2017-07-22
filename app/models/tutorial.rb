class Tutorial < ApplicationRecord
  has_many :images
  has_many :tags
  has_many :likes
  belongs_to :video, optional: true
  belongs_to :profile, optional: true
  belongs_to :post, optional:true
end
