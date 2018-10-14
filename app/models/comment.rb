class Comment < ApplicationRecord
  validate :image_or_content

  mount_uploader :image, ImageUploader
  paginates_per 5

  belongs_to :user
  belongs_to :castle

  def image_or_content
    errors.add(:content, "もしくはimageのどちらかを入れてください") if image.url.blank? && content.blank?
  end
end
