class CreateEvents < ActiveRecord::Migration[5.0]
  def change
    create_table :events do |t|
      t.string :title
      t.text :description
      t.string :location
      t.integer :group_id
      t.datetime :time
      t.string :event_type

      t.timestamps
    end
  end
end
