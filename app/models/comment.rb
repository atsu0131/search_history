class Comment < ApplicationRecord
  mount_uploader :image, ImageUploader
  paginates_per 5

  belongs_to :castle

  belongs_to :user

end
