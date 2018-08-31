class CreateCastles < ActiveRecord::Migration[5.1]
  def change
    create_table :castles do |t|

      t.timestamps
    end
  end
end
