class RankingsController < ApplicationController
  def favorite
    @ranking_counts = Favorite.ranking
    @castles = Castle.find(@ranking_counts.keys)
  end
end
