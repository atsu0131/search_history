class MapsController < ApplicationController
  def index
    @castles = Castle.all
  end

  def show
    @castle = Castle.new
    @castle = Castle.find(@castle.id)
  end
end
