class CreateProfileGroups < ActiveRecord::Migration[5.0]
  def change
    create_table :profile_groups do |t|
      t.integer :profile_id
      t.integer :group_id

      t.timestamps
    end
  end
end
