class CreateImages < ActiveRecord::Migration[5.0]
  def change
    create_table :images do |t|
      t.string :url
      t.integer :tutorial_id
      t.integer :profile_id
      t.integer :event_id
      t.integer :group_id

      t.timestamps
    end
  end
end
