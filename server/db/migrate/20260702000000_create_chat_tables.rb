class CreateChatTables < ActiveRecord::Migration[8.1]
  def change
    create_table :chat_rooms do |t|
      t.references :recruitment, null: false, foreign_key: true, index: { unique: true }

      t.timestamps
    end

    create_table :chat_messages do |t|
      t.references :chat_room, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :body, null: false

      t.timestamps
    end

    add_index :chat_messages, [ :chat_room_id, :created_at ]

    create_table :chat_participants do |t|
      t.references :chat_room, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.bigint :last_read_message_id

      t.timestamps
    end

    add_index :chat_participants, [ :chat_room_id, :user_id ], unique: true
    add_index :chat_participants, :last_read_message_id
    add_foreign_key :chat_participants, :chat_messages, column: :last_read_message_id
  end
end
