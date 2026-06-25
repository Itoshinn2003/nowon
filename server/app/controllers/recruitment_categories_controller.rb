class RecruitmentCategoriesController < ApplicationController
  def index
    render json: {
      recruitment_categories: RecruitmentCategory.ordered.map { |category| serialized_category(category) }
    }
  end

  private

  def serialized_category(category)
    {
      id: category.id,
      name: category.name,
      key: category.key,
      display_order: category.display_order,
      color: category.color,
      icon_name: category.icon_name
    }
  end
end
