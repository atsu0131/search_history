class CreateArticles < ActiveRecord::Migration[5.1]
  def change
    create_table :articles do |t|
      t.string :ar_name
      t.integer :ar_price
      t.string :ar_image
      t.integer :ar_stock
      t.integer :ar_pref
      t.text :ar_info
      t.integer :user_id
      t.integer :castle_id

      t.timestamps
    end
  end
end
