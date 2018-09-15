class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
    include SessionsHelper

private

  def require_user_logged_in
    unless logged_in?
    redirect_to "/sessions/new", notice: "ログインしてください"
    end
  end
end
