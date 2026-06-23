# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_23_000200) do
  create_table "active_storage_attachments", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "profile_photos", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "position", null: false
    t.string "rejection_reason"
    t.string "status", limit: 20, default: "pending", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_profile_id", null: false
    t.index ["user_profile_id", "position"], name: "index_profile_photos_on_user_profile_id_and_position", unique: true
    t.index ["user_profile_id", "status"], name: "index_profile_photos_on_user_profile_id_and_status"
    t.index ["user_profile_id"], name: "index_profile_photos_on_user_profile_id"
    t.check_constraint "`position` > 0", name: "chk_profile_photos_position"
    t.check_constraint "`status` in (_utf8mb4'pending',_utf8mb4'approved',_utf8mb4'rejected')", name: "chk_profile_photos_status"
  end

  create_table "user_profiles", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "bio", limit: 160
    t.date "birth_date", null: false
    t.datetime "created_at", null: false
    t.string "gender", limit: 32, null: false
    t.string "nickname", limit: 12, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["birth_date"], name: "index_user_profiles_on_birth_date"
    t.index ["gender"], name: "index_user_profiles_on_gender"
    t.index ["user_id"], name: "index_user_profiles_on_user_id", unique: true
    t.check_constraint "`gender` in (_utf8mb4'male',_utf8mb4'female',_utf8mb4'other',_utf8mb4'no_answer')", name: "chk_user_profiles_gender"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.boolean "allow_password_change", default: false
    t.datetime "confirmation_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "image"
    t.string "name"
    t.string "nickname"
    t.string "provider", default: "email", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.text "tokens"
    t.string "uid", default: "", null: false
    t.string "unconfirmed_email"
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "profile_photos", "user_profiles"
  add_foreign_key "user_profiles", "users"
end
