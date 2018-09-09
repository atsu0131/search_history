class KantousController < ApplicationController
  def index
    @castles = Castle.where("map_id = '3'")
  end
end
