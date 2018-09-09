class SikokusController < ApplicationController
  @castles = Castle.where("map_id = '7'")
  def index
  end
end
