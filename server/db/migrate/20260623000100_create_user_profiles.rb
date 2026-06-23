class CreateUserProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :user_profiles do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :nickname, null: false, limit: 12
      t.date :birth_date, null: false
      t.string :gender, null: false, limit: 32
      t.string :bio, limit: 160

      t.timestamps
    end

    add_index :user_profiles, :gender
    add_index :user_profiles, :birth_date
    add_check_constraint :user_profiles,
                         "gender in ('male', 'female', 'other', 'no_answer')",
                         name: "chk_user_profiles_gender"
  end
end
