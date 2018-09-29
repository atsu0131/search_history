class CreateArticles < ActiveRecord::Migration[5.1]
  def change
    create_table :articles do |t|
      t.string :ar_name
      t.integer :ar_price
      t.integer :ar_stock
      t.integer :ar_pref
      t.text :ar_info
      t.string :user_id
      t.string :castle_id

      t.timestamps
    end
  end
end
