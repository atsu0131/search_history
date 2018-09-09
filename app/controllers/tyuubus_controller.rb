class TyuubusController < ApplicationController
  def index
    @castles = Castle.where("map_id = '4'")
  end
end
