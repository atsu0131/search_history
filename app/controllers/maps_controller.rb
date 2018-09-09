class MapsController < ApplicationController
  def index
    @maps = Map.all
  end

  def show
    @castle = Castle.new
    @castle = Castle.find(@castle.id)
  end
end
