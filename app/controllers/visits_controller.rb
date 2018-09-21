class VisitsController < ApplicationController
  def create
    visit = current_user.visits.create(castle_id: params[:castle_id])
    redirect_to    user_path(current_user)
  end

  def destroy
    visit = current_user.visits.find_by(id: params[:id]).destroy
    redirect_to    user_path(current_user)
  end
end
