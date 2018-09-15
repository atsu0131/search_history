class FavoritesController < ApplicationController
  def create
    favorite = current_user.favorites.create(castle_id: params[:castle_id])
    redirect_to    user_path(current_user), notice: "お気に入り登録しました"
  end
  def destroy
    favorite = current_user.favorites.find_by(id: params[:id]).destroy
    redirect_to   user_path(current_user), notice: "お気に入り解除しました"
  end
end

