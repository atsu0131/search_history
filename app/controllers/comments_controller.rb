class CommentsController < ApplicationController
  before_action :require_user_logged_in,{only:[:index,:new,:show,:edit]}
  def create
    @castle = Castle.find(params[:castle_id])
    @comment = @castle.comments.build(comment_params)
    respond_to do |format|
      if @comment.save
        format.js{ render:index }
      else
        format.html{ redirect_to castle_path(@castle),notice: '投稿できませんでした...' }
      end
    end
  end
  def edit
    @comment = Comment.find(params[:id])
    @castle = Castle.find(params[:castle_id])
  end
  def update
    @comment = Comment.find(params[:id])
    @castle = Castle.find(params[:castle_id])
    if @comment.update(comment_params)
      redirect_to castle_path(@castle.id), notice:"編集しました"
    else
      render 'edit'
    end
  end
  def destroy
    @comment = Comment.find(params[:id])
    @castle = Castle.find(params[:castle_id])
    @comment.destroy
    redirect_to castle_path(@castle.id), notice:"削除しました"
  end

private

  def comment_params
    params.require(:comment).permit(:castle_id, :content,:image)
    end
end
