class RemoveArImageToArticles < ActiveRecord::Migration[5.1]
  def change
    remove_column :articles, :ar_image, :string
  end
end
