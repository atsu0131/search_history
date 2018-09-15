class KyuusyuusController < ApplicationController
  def index
    @castles = Castle.where("map_id = '8'")
  end
end
