class AddEquipmentToTutorial < ActiveRecord::Migration[5.0]
  def change
    add_column :tutorials, :equipment, :string
  end
end
