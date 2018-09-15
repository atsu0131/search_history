class SikokusController < ApplicationController

  def index
    @castles = Castle.where("map_id = '7'")
  end
end
