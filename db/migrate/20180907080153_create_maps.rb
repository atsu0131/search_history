class CreateMaps < ActiveRecord::Migration[5.1]
  def change
    create_table :maps do |t|
      t.string :region
      t.integer :castle_id
      t.timestamps
    end
  end
end
