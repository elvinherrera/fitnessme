class CreatePosts < ActiveRecord::Migration[5.0]
  def change
    create_table :posts do |t|
      t.text :body
      t.integer :user_id
      t.integer :board_id
      t.string :archived, default: false

      t.timestamps
    end
  end
end
