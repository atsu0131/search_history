class QuizzesController < ApplicationController
  def index
    @quizzes = Quiz.all
  end
  def new
    @quiz = Quiz.new
  end

  def create
    @quiz = Quiz.new(params_set)
    @quiz.user_id = current_user.id
    if @quiz.save
      redirect_to quizzes_path, notice: "作成しました！"
    else
      render 'new'
    end

  end

  def show
    @quiz = Quiz.find(params[:id])
  end

  def edit
    @quiz = Quiz.find(params[:id])
  end

  def update
    @quiz = Quiz.find(params[:id])
    if @quiz.update(params_set)
      redirect_to quizzes_path, notice:"編集しました"
    else
      render 'edit'
    end
  end

  def destroy
    @quiz = Quiz.find(params[:id])
    @quiz.destroy
    redirect_to quizzes_path, notice:"削除しました"
  end

  private
    def params_set
    params.require(:quiz).permit(:q_title,:q_content,:q_answer1,:q_answer2,:q_answer3,:q_answer4,:q_correct,:user_id)
  end

end
