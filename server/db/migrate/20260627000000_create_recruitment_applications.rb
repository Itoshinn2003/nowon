class CreateRecruitmentApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :recruitment_applications do |t|
      t.references :recruitment, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.text :message

      t.timestamps
    end

    add_index :recruitment_applications,
              [ :recruitment_id, :user_id ],
              unique: true
    add_index :recruitment_applications, [ :user_id, :status ]
    add_index :recruitment_applications, [ :recruitment_id, :status ]

    add_check_constraint :recruitment_applications,
                         "status in (0, 1, 2)",
                         name: "chk_recruitment_applications_status"
  end
end
