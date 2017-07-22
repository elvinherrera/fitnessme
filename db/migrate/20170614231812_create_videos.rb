class CreateVideos < ActiveRecord::Migration[5.0]
  def change
    create_table :videos do |t|
      t.string :url
      t.integer :tutorial_id

      t.timestamps
    end
  end
end
