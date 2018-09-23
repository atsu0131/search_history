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

  has_many :visits, dependent: :destroy
  has_many :visit_castles, through: :visits, source: :castle

  has_many :active_relationships, foreign_key: 'follower_id', class_name: 'Relationship', dependent: :destroy
  has_many :passive_relationships, foreign_key: 'followed_id', class_name: 'Relationship', dependent: :destroy

  has_many :following, through: :active_relationships, source: :followed
  has_many :followers, through: :passive_relationships, source: :follower

    #指定のユーザをフォローする
  def follow!(other_user)
    active_relationships.create!(followed_id: other_user.id)
  end

  #フォローしているかどうかを確認する
  def following?(other_user)
    active_relationships.find_by(followed_id: other_user.id)
  end

#指定のユーザのフォローを解除する
  def unfollow!(other_user)
  active_relationships.find_by(followed_id: other_user.id).destroy
  end
end
