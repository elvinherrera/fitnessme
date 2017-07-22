class RemoveSeverityFromAll < ActiveRecord::Migration[5.0]
  def change
    remove_column :tutorials, :severity, :string
    remove_column :profiles, :severity, :string
  end
end
