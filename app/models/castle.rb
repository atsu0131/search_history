class Castle < ApplicationRecord
  mount_uploader :ca_top_image, ImageUploader
  mount_uploader :ca_image, ImageUploader
  mount_uploader :image, ImageUploader

  has_many :comments, dependent: :destroy

  has_many :favorites, dependent: :destroy
  has_many :favorite_users, through: :favorites, source: :user
  belongs_to :user

  has_many :visits, dependent: :destroy
  has_many :visit_users, through: :visits, source: :user

  def build_comment(comment_hash, user_id)
    comment = comments.build(comment_hash)
    comment.user_id = user_id
    return comment
  end
end
