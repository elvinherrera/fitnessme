class ProfileGroup < ApplicationRecord
  belongs_to :profile 
  belongs_to :group
end
