class CreateBoards < ActiveRecord::Migration[5.0]
  def change
    create_table :boards do |t|
      t.string :title
      t.string :subject
      t.string :creator
      t.text :description
      t.integer :event_id
      t.string :activity

      t.timestamps
    end
  end
end
