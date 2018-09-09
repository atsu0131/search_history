class OkinawasController < ApplicationController
  def index
    @castles = Castle.where("map_id = '9'")
  end
end
