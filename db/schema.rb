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

ActiveRecord::Schema.define(version: 20180907081642) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "castles", force: :cascade do |t|
    t.string "ca_name"
    t.string "ca_top_image"
    t.string "ca_image"
    t.text "ca_comment"
    t.string "ca_pref"
    t.text "ca_info"
    t.string "ca_owner"
    t.string "ca_hp"
    t.string "ca_loca"
    t.string "ca_access"
    t.text "ca_history"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "map_id"
  end

  create_table "maps", force: :cascade do |t|
    t.string "region"
    t.integer "castle_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.integer "age"
    t.string "sex"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
