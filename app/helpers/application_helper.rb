module ApplicationHelper
  def display_message_btn?(user, other_user)
    user.followed?(other_user) && user.following?(other_user)
  end
end
