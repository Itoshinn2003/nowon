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
  { name: "ライブ", key: "live", display_order: 1 },
  { name: "スポーツ観戦", key: "sports", display_order: 2 },
  { name: "ご飯", key: "food", display_order: 3 },
  { name: "飲み", key: "drink", display_order: 4 },
  { name: "グッズ交換", key: "goods_exchange", display_order: 5 },
  { name: "一緒に帰る", key: "walk", display_order: 6 },
  { name: "その他", key: "other", display_order: 99 }
]

legacy_goods_category = RecruitmentCategory.find_by(key: "goods")
legacy_goods_category&.update!(key: "goods_exchange", name: "グッズ交換")

recruitment_categories.each do |category_attributes|
  RecruitmentCategory.find_or_initialize_by(key: category_attributes[:key]).tap do |category|
    category.assign_attributes(category_attributes)
    category.save!
  end
end
