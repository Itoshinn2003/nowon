class RecruitmentApplicationsController < ApplicationController
  before_action :authenticate_user!

  def create
    recruitment = Recruitment.find(params[:recruitment_id])
    application = recruitment
                  .recruitment_applications
                  .build(application_params.merge(user: current_user))

    if application.save
      render json: { application: serialized_application(application) }, status: :created
    else
      render json: { errors: application.errors.to_hash }, status: :unprocessable_entity
    end
  end

  def mine
    applications = current_user
                   .recruitment_applications
                   .includes(recruitment: :recruitment_category)
                   .order(created_at: :desc)

    render json: {
      applications: applications.map { |application| serialized_application(application) }
    }
  end

  def destroy
    application = current_user
                  .recruitment_applications
                  .includes(:recruitment)
                  .find(params[:id])

    unless application.cancelable?
      render json: {
        errors: { base: [ "この応募はキャンセルできません" ] }
      }, status: :unprocessable_entity
      return
    end

    application.destroy!
    head :no_content
  end

  private

  def application_params
    params.fetch(:application, params).permit(:message)
  end

  def serialized_application(application)
    {
      id: application.id,
      recruitment_id: application.recruitment_id,
      user_id: application.user_id,
      status: application.status,
      message: application.message,
      recruitment: serialized_recruitment(application.recruitment),
      created_at: application.created_at.iso8601,
      updated_at: application.updated_at.iso8601
    }
  end

  def serialized_recruitment(recruitment)
    return nil unless recruitment

    {
      id: recruitment.id,
      user_id: recruitment.user_id,
      recruitment_type: recruitment.recruitment_type,
      recruitment_category_id: recruitment.recruitment_category_id,
      recruitment_category: serialized_category(recruitment.recruitment_category),
      purpose: recruitment.purpose,
      vibe: recruitment.vibe,
      recruiting_people_min: recruitment.recruiting_people_min,
      recruiting_people_max: recruitment.recruiting_people_max,
      application_limit: recruitment.application_limit,
      active_application_count: recruitment.recruitment_applications.active_for_limit.count,
      allowed_gender_policy: recruitment.allowed_gender_policy,
      latitude: recruitment.latitude.to_s,
      longitude: recruitment.longitude.to_s,
      description: recruitment.description,
      status: recruitment.status,
      expires_at: recruitment.expires_at&.iso8601,
      closed_at: recruitment.closed_at&.iso8601,
      safety_confirmed: recruitment.safety_confirmed
    }
  end

  def serialized_category(category)
    return nil unless category

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
