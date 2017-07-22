class AddColumnsToLikes < ActiveRecord::Migration[5.0]
  def change
    add_column :likes, :post_id, :integer
    add_column :likes, :event_id, :integer
    add_column :likes, :tutorial_id, :integer
    add_column :likes, :liked, :boolean
  end
end
