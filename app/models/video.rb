class Video < ApplicationRecord
  has_one :tutorial
  # <iframe width="854" height="480" src="https://www.youtube.com/embed/wS4OsJ4yzx4" frameborder="0" allowfullscreen></iframe>
  # <iframe width="854" height="480" src="https://www.youtube.com/embed/rT7DgCr-3pg" frameborder="0" allowfullscreen></iframe>
end
