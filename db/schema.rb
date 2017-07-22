# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170716195547) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "boards", force: :cascade do |t|
    t.string   "title"
    t.string   "subject"
    t.string   "creator"
    t.text     "description"
    t.integer  "event_id"
    t.string   "activity"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "comments", force: :cascade do |t|
    t.text     "body"
    t.integer  "user_id"
    t.integer  "post_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "events", force: :cascade do |t|
    t.string   "title"
    t.text     "description"
    t.string   "location"
    t.integer  "group_id"
    t.datetime "time"
    t.string   "event_type"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "groups", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "images", force: :cascade do |t|
    t.string   "url"
    t.integer  "tutorial_id"
    t.integer  "profile_id"
    t.integer  "event_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "group_id"
  end

  create_table "likes", force: :cascade do |t|
    t.integer  "user_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "post_id"
    t.integer  "event_id"
    t.integer  "tutorial_id"
    t.boolean  "liked"
  end

  create_table "posts", force: :cascade do |t|
    t.text     "body"
    t.integer  "user_id"
    t.integer  "board_id"
    t.string   "archived",   default: "f"
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "profile_groups", force: :cascade do |t|
    t.integer  "profile_id"
    t.integer  "group_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "status"
  end

  create_table "profiles", force: :cascade do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "email"
    t.date     "date_of_birth"
    t.string   "screen_name"
    t.string   "location"
    t.string   "url"
    t.integer  "followers_count"
    t.integer  "friends_count"
    t.text     "description"
    t.integer  "statuses_count"
    t.integer  "tutorial_count"
    t.integer  "user_id"
    t.integer  "image_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "tags", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "tutorials", force: :cascade do |t|
    t.text     "description"
    t.string   "tutorial_type"
    t.string   "title"
    t.boolean  "weights"
    t.string   "experience"
    t.integer  "video_id"
    t.integer  "post_id"
    t.integer  "profile_id"
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.string   "equipment"
    t.string   "equipment_description"
  end

  create_table "user_events", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "event_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.string   "email",                  default: "",    null: false
    t.string   "encrypted_password",     default: "",    null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,     null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.float    "latitude"
    t.float    "longitude"
    t.string   "name"
    t.boolean  "admin",                  default: false
    t.index ["email"], name: "index_users_on_email", unique: true, using: :btree
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  end

  create_table "videos", force: :cascade do |t|
    t.string   "url"
    t.integer  "tutorial_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

end
