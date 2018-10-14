class Comment < ApplicationRecord
  validate :image_or_content

  mount_uploader :image, ImageUploader
  paginates_per 5

  belongs_to :castle

  belongs_to :user

  def image_or_content
    errors.add(:content, "もしくはimageのどちらかを入れてください") if image.url.blank? && content.blank?
  end
end
