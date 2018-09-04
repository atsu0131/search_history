class CastlesController < ApplicationController
  def index
    @castles = Castle.all
  end

  def new
    @castle = Castle.new
  end

  def create
    Castle.create(params_set)
  end

  private

  def params_set
    params.require(:castle).permit(:ca_name,:ca_top_image,:ca_image,:ca_comment,:ca_pref,:ca_info,:ca_owner,:ca_hp,:ca_loca,:ca_access,:ca_history,:user_id)
  end
end
