class Article < ApplicationRecord
    mount_uploader :ar_image, ImageUploader

    belongs_to :user, optional: true
end
