class AddColumnToImages < ActiveRecord::Migration[5.0]
  def change
    add_column :images, :group_id, :integer
  end
end
