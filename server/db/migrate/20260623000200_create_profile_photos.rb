class CreateProfilePhotos < ActiveRecord::Migration[8.1]
  def change
    create_table :profile_photos do |t|
      t.references :user_profile, null: false, foreign_key: true
      t.integer :position, null: false
      t.string :status, null: false, default: "pending", limit: 20
      t.string :rejection_reason

      t.timestamps
    end

    add_index :profile_photos, [ :user_profile_id, :position ], unique: true
    add_index :profile_photos, [ :user_profile_id, :status ]
    add_check_constraint :profile_photos, "position > 0", name: "chk_profile_photos_position"
    add_check_constraint :profile_photos,
                         "status in ('pending', 'approved', 'rejected')",
                         name: "chk_profile_photos_status"
  end
end
