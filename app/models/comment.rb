class Comment < ApplicationRecord
  mount_uploader :image, ImageUploader

  belongs_to :castle

  belongs_to :user

end
