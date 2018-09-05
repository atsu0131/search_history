class CastlesController < ApplicationController
  def index
    @castles = Castle.all
  end

  def new
    @castle = Castle.new
  end

  def create
    Castle.create(params_set)
    redirect_to castles_path
  end

  def show
    @castle = Castle.find(params[:id])
  end

  def edit
    @castle = Castle.find(params[:id])
  end

  def update
    @castle = Castle.find(params[:id])
    if @castle.update(params_set)
      redirect_to castles_path, notice:"編集しました"
    else
      render 'edit'
    end
  end

  def destroy
    @castle = Castle.find(params[:id])
    @castle.destroy
    redirect_to castles_path, notice:"削除しました"
  end

  private


  def params_set
    params.require(:castle).permit(:ca_name,:ca_top_image,:ca_image,:ca_comment,:ca_pref,:ca_info,:ca_owner,:ca_hp,:ca_loca,:ca_access,:ca_history)
  end
end
