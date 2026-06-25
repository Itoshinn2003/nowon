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

ActiveRecord::Schema[8.1].define(version: 2026_06_25_000400) do
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

  create_table "recruitment_categories", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "color"
    t.datetime "created_at", null: false
    t.integer "display_order", default: 0, null: false
    t.string "icon_name"
    t.string "key", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["display_order"], name: "index_recruitment_categories_on_display_order"
    t.index ["key"], name: "index_recruitment_categories_on_key", unique: true
  end

  create_table "recruitments", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "allowed_gender_policy", null: false
    t.integer "application_limit", default: 10, null: false
    t.datetime "closed_at"
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "expires_at", null: false
    t.decimal "latitude", precision: 10, scale: 6, null: false
    t.decimal "longitude", precision: 10, scale: 6, null: false
    t.string "purpose", null: false
    t.integer "recruiting_people_max", default: 1, null: false
    t.integer "recruiting_people_min", default: 1, null: false
    t.bigint "recruitment_category_id", null: false
    t.integer "recruitment_type", null: false
    t.boolean "safety_confirmed", default: false, null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.string "vibe", null: false
    t.index ["latitude", "longitude"], name: "index_recruitments_on_latitude_and_longitude"
    t.index ["recruitment_category_id"], name: "index_recruitments_on_recruitment_category_id"
    t.index ["status", "expires_at"], name: "index_recruitments_on_status_and_expires_at"
    t.index ["user_id", "status"], name: "index_recruitments_on_user_id_and_status"
    t.index ["user_id"], name: "index_recruitments_on_user_id"
    t.check_constraint "`allowed_gender_policy` in (0,1,2)", name: "chk_recruitments_allowed_gender_policy"
    t.check_constraint "`application_limit` <= 10", name: "chk_recruitments_application_limit_max"
    t.check_constraint "`application_limit` >= `recruiting_people_max`", name: "chk_recruitments_application_limit_gte_people_max"
    t.check_constraint "`recruiting_people_max` <= 4", name: "chk_recruitments_people_max"
    t.check_constraint "`recruiting_people_min` <= `recruiting_people_max`", name: "chk_recruitments_people_min_lte_max"
    t.check_constraint "`recruitment_type` in (0,1)", name: "chk_recruitments_recruitment_type"
    t.check_constraint "`status` in (0,1,2,3)", name: "chk_recruitments_status"
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
  add_foreign_key "recruitments", "recruitment_categories"
  add_foreign_key "recruitments", "users"
  add_foreign_key "user_profiles", "users"
end
