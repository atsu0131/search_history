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
end
