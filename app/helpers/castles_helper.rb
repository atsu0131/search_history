module CastlesHelper
  def choose_new_or_edit
    if action_name == 'new' || action_name == 'confirm'
      confirm_castles_path
    elsif action_name == 'edit'
      castle_path
    end
  end
end
