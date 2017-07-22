class Like < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :post, optional: true
  belongs_to :event, optional: true
  belongs_to :tutorial, optional: true
end
