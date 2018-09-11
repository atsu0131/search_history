class CreateComments < ActiveRecord::Migration[5.1]
  def change
    create_table :comments do |t|
      t.references :castle, foreign_key: true
      t.text :content
      t.string :image

      t.timestamps
    end
  end
end
