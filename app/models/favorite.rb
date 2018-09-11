class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :castle


  def self.ranking
    self.group(:castle_id).order('count_castle_id DESC').limit(10).count(:castle_id)
  end

end
