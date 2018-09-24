module UsersHelper
  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def logged_in?
    current_user.present?
  end

   def admin_user
     @admin_user ||= User.where("name = 'admin'")
   end


   def admin_logged_in?
     admin_user.present?
   end
end
