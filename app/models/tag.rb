class Tag < ApplicationRecord
  belongs_to :board
  belongs_to :event
  belongs_to :group
  belongs_to :profile
  belongs_to :tutorial
end
