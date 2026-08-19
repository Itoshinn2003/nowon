class CreateReportsAndBlocks < ActiveRecord::Migration[8.1]
  def change
    create_table :reports do |t|
      t.references :reporter, null: false, foreign_key: { to_table: :users }
      t.references :reported_user, null: false, foreign_key: { to_table: :users }
      t.string :reason, null: false
      t.text :details
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :reports, [ :reporter_id, :reported_user_id ]
    add_index :reports, [ :reported_user_id, :status ]

    create_table :blocks do |t|
      t.references :blocker, null: false, foreign_key: { to_table: :users }
      t.references :blocked_user, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :blocks, [ :blocker_id, :blocked_user_id ], unique: true
  end
end
