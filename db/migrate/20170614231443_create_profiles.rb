class CreateProfiles < ActiveRecord::Migration[5.0]
  def change
    create_table :profiles do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.date :date_of_birth
      t.string :screen_name
      t.string :location
      t.string :url
      t.integer :followers_count
      t.integer :friends_count
      t.text :description
      t.integer :statuses_count
      t.integer :tutorial_count
      t.integer :user_id
      t.string :severity
      t.integer :image_id

      t.timestamps
    end
  end
end
