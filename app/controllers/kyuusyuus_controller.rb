class KyuusyuusController < ApplicationController
  @castles = Castle.where("map_id = '8'")
  def index
  end
end
