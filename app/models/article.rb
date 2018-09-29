class Article < ApplicationRecord
    mount_uploader :ar_image, ImageUploader
end
