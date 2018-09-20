class CastlesController < ApplicationController
  before_action :require_user_logged_in,{only:[:index,:new,:show,:edit]}
  def index
    @user = User.all
    @castles = Castle.all
  end
  def new
    @castle = Castle.new
  end
  def create
    @castle = Castle.new(params_set)
    @castle.user_id = current_user.id
    if @castle.save!
      redirect_to castles_path, notice: "作成しました！"
    else
      render 'new'
    end
  end
  def show
    @castle = Castle.find(params[:id])
    @comments = @castle.comments
    @comment = @castle.comments.build
    @favorite = current_user.favorites.find_by(castle_id: @castle.id)
    @ranking_counts = Favorite.ranking
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
  def confirm
    @castle = Castle.new(params_set)
  end

private

  def params_set
    params.require(:castle).permit(:ca_name,:ca_top_image,:ca_image,:ca_comment,:ca_pref,:ca_info,:ca_owner,:ca_hp,:ca_loca,:ca_access,:ca_history,:map_id,:ca_top_image_cache, :ca_image_cache,:user_id)
  end
end
