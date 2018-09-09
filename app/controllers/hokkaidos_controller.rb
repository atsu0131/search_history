class HokkaidosController < ApplicationController
  def index
    @castles = Castle.where("map_id = '1'")
  end
end
