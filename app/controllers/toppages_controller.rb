class ToppagesController < ApplicationController
  def index
    @randoms = Castle.order("RANDOM()").limit(2)
  end
end
