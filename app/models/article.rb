class Article < ApplicationRecord
    mount_uploader :ar_top_image, ImageUploader
    validates :ar_name, presence: true,length: { maximum: 30 }
    validates :ar_price, presence: true,length: { maximum: 10 }
    validates :ar_stock, presence: true,length: { maximum: 10 }

    belongs_to :user, optional: true
end
