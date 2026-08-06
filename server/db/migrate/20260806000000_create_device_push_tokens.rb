class CreateDevicePushTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :device_push_tokens do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token, null: false
      t.string :platform, null: false, default: "unknown"
      t.boolean :enabled, null: false, default: true
      t.datetime :last_seen_at, null: false
      t.datetime :invalidated_at

      t.timestamps
    end

    add_index :device_push_tokens, :token, unique: true
    add_index :device_push_tokens, [ :user_id, :enabled ]
    add_check_constraint :device_push_tokens,
                         "platform IN ('ios', 'android', 'web', 'unknown')",
                         name: "chk_device_push_tokens_platform"
  end
end
