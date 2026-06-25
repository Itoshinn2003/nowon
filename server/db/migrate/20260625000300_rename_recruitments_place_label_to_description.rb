class RenameRecruitmentsPlaceLabelToDescription < ActiveRecord::Migration[8.1]
  def up
    if column_exists?(:recruitments, :place_label)
      rename_column :recruitments, :place_label, :description
    elsif !column_exists?(:recruitments, :description)
      add_column :recruitments, :description, :text
    end

    change_column :recruitments, :description, :text
  end

  def down
    return unless column_exists?(:recruitments, :description)

    change_column :recruitments, :description, :string
    rename_column :recruitments, :description, :place_label
  end
end
