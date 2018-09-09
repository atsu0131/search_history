class Castle < ApplicationRecord
  mount_uploader :image, ImageUploader
  belongs_to :map
end
