class CreateRecruitments < ActiveRecord::Migration[8.1]
  def change
    create_table :recruitments do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :recruitment_type, null: false
      t.references :recruitment_category, null: false, foreign_key: true
      t.string :purpose, null: false
      t.string :vibe, null: false
      t.integer :recruiting_people_min, null: false, default: 1
      t.integer :recruiting_people_max, null: false, default: 1
      t.integer :application_limit, null: false, default: 10
      t.integer :allowed_gender_policy, null: false
      t.decimal :latitude, precision: 10, scale: 6, null: false
      t.decimal :longitude, precision: 10, scale: 6, null: false
      t.text :description
      t.integer :status, null: false, default: 0
      t.datetime :expires_at, null: false
      t.datetime :closed_at
      t.boolean :safety_confirmed, null: false, default: false

      t.timestamps
    end

    add_index :recruitments, [ :status, :expires_at ]
    add_index :recruitments, [ :user_id, :status ]
    add_index :recruitments, [ :latitude, :longitude ]

    add_check_constraint :recruitments,
                         "recruitment_type in (0, 1)",
                         name: "chk_recruitments_recruitment_type"
    add_check_constraint :recruitments,
                         "allowed_gender_policy in (0, 1, 2)",
                         name: "chk_recruitments_allowed_gender_policy"
    add_check_constraint :recruitments,
                         "status in (0, 1, 2, 3)",
                         name: "chk_recruitments_status"
    add_check_constraint :recruitments,
                         "recruiting_people_min <= recruiting_people_max",
                         name: "chk_recruitments_people_min_lte_max"
    add_check_constraint :recruitments,
                         "recruiting_people_max <= 4",
                         name: "chk_recruitments_people_max"
    add_check_constraint :recruitments,
                         "application_limit >= recruiting_people_max",
                         name: "chk_recruitments_application_limit_gte_people_max"
    add_check_constraint :recruitments,
                         "application_limit <= 10",
                         name: "chk_recruitments_application_limit_max"
  end
end
