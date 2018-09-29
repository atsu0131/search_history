class AddArImageToArticles < ActiveRecord::Migration[5.1]
  def change
    add_column :articles, :ar_image, :string
  end
end
