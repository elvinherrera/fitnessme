class CreateTutorials < ActiveRecord::Migration[5.0]
  def change
    create_table :tutorials do |t|
      t.text :description
      t.string :severity
      t.string :tutorial_type
      t.string :title
      t.boolean :weights
      t.string :experience
      t.integer :video_id
      t.integer :post_id
      t.integer :profile_id



      t.timestamps
    end
  end
end
