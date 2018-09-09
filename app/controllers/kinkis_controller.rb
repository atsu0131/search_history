class KinkisController < ApplicationController
  def index
    @castles = Castle.where("map_id = '5'")
  end
end
