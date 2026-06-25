class CreateRecruitmentCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :recruitment_categories do |t|
      t.string :name, null: false
      t.string :key, null: false
      t.integer :display_order, null: false, default: 0
      t.string :color
      t.string :icon_name

      t.timestamps
    end

    add_index :recruitment_categories, :key, unique: true
    add_index :recruitment_categories, :display_order
  end
end
