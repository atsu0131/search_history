class AddIconImageToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :icon_image, :string
    add_column :users, :user_comment, :string
  end
end
