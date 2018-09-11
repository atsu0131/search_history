class Comment < ApplicationRecord
  mount_uploader :image, ImageUploader

  belongs_to :castle
end
