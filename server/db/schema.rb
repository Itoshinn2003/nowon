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

ActiveRecord::Schema[8.1].define(version: 2026_07_18_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
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

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "chat_messages", force: :cascade do |t|
    t.text "body", null: false
    t.bigint "chat_room_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["chat_room_id", "created_at"], name: "index_chat_messages_on_chat_room_id_and_created_at"
    t.index ["chat_room_id"], name: "index_chat_messages_on_chat_room_id"
    t.index ["user_id"], name: "index_chat_messages_on_user_id"
  end

  create_table "chat_participants", force: :cascade do |t|
    t.bigint "chat_room_id", null: false
    t.datetime "created_at", null: false
    t.bigint "last_read_message_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["chat_room_id", "user_id"], name: "index_chat_participants_on_chat_room_id_and_user_id", unique: true
    t.index ["chat_room_id"], name: "index_chat_participants_on_chat_room_id"
    t.index ["last_read_message_id"], name: "index_chat_participants_on_last_read_message_id"
    t.index ["user_id"], name: "index_chat_participants_on_user_id"
  end

  create_table "chat_rooms", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "recruitment_id", null: false
    t.datetime "updated_at", null: false
    t.index ["recruitment_id"], name: "index_chat_rooms_on_recruitment_id", unique: true
  end

  create_table "profile_photos", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "position", null: false
    t.string "rejection_reason"
    t.string "status", limit: 20, default: "pending", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_profile_id", null: false
    t.index ["user_profile_id", "position"], name: "index_profile_photos_on_user_profile_id_and_position", unique: true
    t.index ["user_profile_id", "status"], name: "index_profile_photos_on_user_profile_id_and_status"
    t.index ["user_profile_id"], name: "index_profile_photos_on_user_profile_id"
    t.check_constraint "\"position\" > 0", name: "chk_profile_photos_position"
    t.check_constraint "status::text = ANY (ARRAY['pending'::character varying::text, 'approved'::character varying::text, 'rejected'::character varying::text])", name: "chk_profile_photos_status"
  end

  create_table "recruitment_applications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "message"
    t.bigint "recruitment_id", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["recruitment_id", "status"], name: "index_recruitment_applications_on_recruitment_id_and_status"
    t.index ["recruitment_id", "user_id"], name: "index_recruitment_applications_on_recruitment_id_and_user_id", unique: true
    t.index ["recruitment_id"], name: "index_recruitment_applications_on_recruitment_id"
    t.index ["user_id", "status"], name: "index_recruitment_applications_on_user_id_and_status"
    t.index ["user_id"], name: "index_recruitment_applications_on_user_id"
    t.check_constraint "status = ANY (ARRAY[0, 1, 2])", name: "chk_recruitment_applications_status"
  end

  create_table "recruitment_categories", force: :cascade do |t|
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

  create_table "recruitments", force: :cascade do |t|
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
    t.check_constraint "allowed_gender_policy = ANY (ARRAY[0, 1, 2])", name: "chk_recruitments_allowed_gender_policy"
    t.check_constraint "application_limit <= 10", name: "chk_recruitments_application_limit_max"
    t.check_constraint "application_limit >= recruiting_people_max", name: "chk_recruitments_application_limit_gte_people_max"
    t.check_constraint "recruiting_people_max <= 4", name: "chk_recruitments_people_max"
    t.check_constraint "recruiting_people_min <= recruiting_people_max", name: "chk_recruitments_people_min_lte_max"
    t.check_constraint "recruitment_type = ANY (ARRAY[0, 1])", name: "chk_recruitments_recruitment_type"
    t.check_constraint "status = ANY (ARRAY[0, 1, 2, 3])", name: "chk_recruitments_status"
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.bigint "channel_hash", null: false
    t.datetime "created_at", null: false
    t.binary "payload", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.datetime "created_at", null: false
    t.binary "key", null: false
    t.bigint "key_hash", null: false
    t.binary "value", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "user_profiles", force: :cascade do |t|
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
    t.check_constraint "gender::text = ANY (ARRAY['male'::character varying::text, 'female'::character varying::text, 'other'::character varying::text, 'no_answer'::character varying::text])", name: "chk_user_profiles_gender"
  end

  create_table "users", force: :cascade do |t|
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
    t.datetime "onboarding_completed_at"
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
  add_foreign_key "chat_messages", "chat_rooms"
  add_foreign_key "chat_messages", "users"
  add_foreign_key "chat_participants", "chat_messages", column: "last_read_message_id"
  add_foreign_key "chat_participants", "chat_rooms"
  add_foreign_key "chat_participants", "users"
  add_foreign_key "chat_rooms", "recruitments"
  add_foreign_key "profile_photos", "user_profiles"
  add_foreign_key "recruitment_applications", "recruitments"
  add_foreign_key "recruitment_applications", "users"
  add_foreign_key "recruitments", "recruitment_categories"
  add_foreign_key "recruitments", "users"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "user_profiles", "users"
end
