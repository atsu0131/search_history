class QuizzesController < ApplicationController
  def index
    @quizzes = Quiz.all
  end
  def new
    @quiz = Quiz.new
  end

  def create
    @quiz = Quiz.create(params_set)
    redirect_to quizzes_path
  end

  def show
    @quiz = Quiz.find(params[:id])
  end

  private
    def params_set
    params.require(:quiz).permit(:q_title,:q_content,:q_answer1,:q_answer2,:q_answer3,:q_answer4,:q_correct,:user_id)
  end

end
