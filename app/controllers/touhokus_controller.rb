class TouhokusController < ApplicationController
  def index
    @castles = Castle.where("map_id = '2'")
  end
end
