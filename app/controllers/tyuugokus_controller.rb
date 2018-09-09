class TyuugokusController < ApplicationController
  def index
    @castles = Castle.where("map_id = '6'")
  end
end
