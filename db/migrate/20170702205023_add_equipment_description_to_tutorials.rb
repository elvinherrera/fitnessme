class AddEquipmentDescriptionToTutorials < ActiveRecord::Migration[5.0]
  def change
    add_column :tutorials, :equipment_description, :string
  end
end
