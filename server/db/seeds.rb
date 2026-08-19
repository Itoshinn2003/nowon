# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

recruitment_categories = [
  { name: "ライブ・イベント", key: "live", display_order: 1 },
  { name: "スポーツ観戦", key: "sports", display_order: 2 },
  { name: "ご飯", key: "food", display_order: 3 },
  { name: "飲み", key: "drink", display_order: 4 },
  { name: "カフェ", key: "cafe", display_order: 5 },
  { name: "勉強・作業", key: "study_work", display_order: 6 },
  { name: "その他", key: "other", display_order: 99 }
]

legacy_category_replacements = {
  "goods" => { key: "cafe", name: "カフェ", display_order: 5 },
  "goods_exchange" => { key: "cafe", name: "カフェ", display_order: 5 },
  "walk" => { key: "study_work", name: "勉強・作業", display_order: 6 }
}

legacy_category_replacements.each do |legacy_key, replacement_attributes|
  next if RecruitmentCategory.exists?(key: replacement_attributes[:key])

  legacy_category = RecruitmentCategory.find_by(key: legacy_key)
  legacy_category&.update!(replacement_attributes)
end

recruitment_categories.each do |category_attributes|
  RecruitmentCategory.find_or_initialize_by(key: category_attributes[:key]).tap do |category|
    category.assign_attributes(category_attributes)
    category.save!
  end
end

demo_applicant_photo_path = Rails.root.join("db/seed_assets/demo_applicant_mio.png")

User.where("email LIKE ?", "dummy-applicant-%@example.com").find_each do |user|
  profile = user.user_profile || user.build_user_profile
  profile.assign_attributes(
    nickname: "佐藤みお",
    birth_date: Date.new(1999, 4, 12),
    gender: "female",
    bio: "ライブ後に感想を話したり、カフェでゆっくりするのが好きです。初対面でも気軽に話せます。"
  )
  profile.save!

  next unless File.exist?(demo_applicant_photo_path)

  photo = profile.profile_photos.find_or_initialize_by(position: 1)
  photo.status = "approved"
  photo.image.attach(
    io: File.open(demo_applicant_photo_path),
    filename: "demo_applicant_mio.png",
    content_type: "image/png"
  )
  photo.save!
end
