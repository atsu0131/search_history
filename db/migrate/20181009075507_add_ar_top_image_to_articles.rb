class AddArTopImageToArticles < ActiveRecord::Migration[5.1]
  def change
    add_column :articles, :ar_top_image, :string
  end
end
