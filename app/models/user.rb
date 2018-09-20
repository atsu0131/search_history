class User < ApplicationRecord
  validates :name, presence: true,length: { maximum: 30 }
  validates :email, presence: true, length: { maximum: 255 },
    format: { with: /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i }
  validates :age, inclusion: { in: 18..120 }
    before_validation { email.downcase! }
    has_secure_password
      validates :password, presence: true, length: { minimum: 6 }

      has_many :favorites, dependent: :destroy
      has_many :favorite_castles, through: :favorites, source: :castle
      has_many :castles

      has_many :comments, dependent: :destroy

end
