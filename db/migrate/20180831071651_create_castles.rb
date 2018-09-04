class CreateCastles < ActiveRecord::Migration[5.1]
  def change
    create_table :castles do |t|
      t.string :ca_name
      t.string :ca_top_image
      t.string :ca_image
      t.text :ca_comment
      t.string :ca_pref
      t.text :ca_info
      t.string :ca_owner
      t.string :ca_hp
      t.string :ca_loca
      t.string :ca_access
      t.text :ca_history
      t.integer :user_id

      t.timestamps
    end
  end
end
