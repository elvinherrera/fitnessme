class AddStatusToProfileGroup < ActiveRecord::Migration[5.0]
  def change
    add_column :profile_groups, :status, :string
  end
end
