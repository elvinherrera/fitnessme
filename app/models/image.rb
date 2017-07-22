class Image < ApplicationRecord
  belongs_to :tutorial, optional: true
  belongs_to :event, optional: true
  belongs_to :profile, optional: true
  belongs_to :group, optional: true

 
end
