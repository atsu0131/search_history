class UsersController < ApplicationController
  def new
    @user = User.new
  end
  def create
    @user = User.new(user_params)
    if @user.save
      redirect_to new_session_path, notice:"登録しました。ログインをしてください"
    else
      render 'new'
    end
  end
  def show
    @user = User.find(params[:id])
    @favorites_castles = @user.favorite_castles
    @visits_castles = @user.visit_castles
    @comments = Comment.all
    @users = User.all
    @favorites = Favorite.all
    @visits = Visit.all
  end

  def edit
    @user = User.find(params[:id])
  end

private

def user_params
  params.require(:user).permit(:name,:email,:age,:sex,:password,:password_confirmation)
end
end
