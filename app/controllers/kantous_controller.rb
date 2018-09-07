class KantousController < ApplicationController
  def index
    @castles = Castle.all
  end
end
