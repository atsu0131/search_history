class AddMapIdToCastles < ActiveRecord::Migration[5.1]
  def change
    add_column :castles, :map_id, :integer
  end
end
