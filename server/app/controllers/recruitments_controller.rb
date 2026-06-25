class RecruitmentsController < ApplicationController
  before_action :authenticate_user!

  def create
    recruitment = current_user.recruitments.build(recruitment_params)

    if recruitment.save
      render json: { recruitment: serialized_recruitment(recruitment) }, status: :created
    else
      render json: { errors: recruitment.errors.to_hash }, status: :unprocessable_entity
    end
  rescue ArgumentError => e
    render json: { errors: { base: [ e.message ] } }, status: :unprocessable_entity
  end

  private

  def recruitment_params
    params.fetch(:recruitment, params).permit(
      :recruitment_type,
      :recruitment_category_id,
      :purpose,
      :vibe,
      :recruiting_people_min,
      :recruiting_people_max,
      :application_limit,
      :allowed_gender_policy,
      :latitude,
      :longitude,
      :description,
      :safety_confirmed
    )
  end

  def serialized_recruitment(recruitment)
    {
      id: recruitment.id,
      user_id: recruitment.user_id,
      recruitment_type: recruitment.recruitment_type,
      recruitment_category_id: recruitment.recruitment_category_id,
      purpose: recruitment.purpose,
      vibe: recruitment.vibe,
      recruiting_people_min: recruitment.recruiting_people_min,
      recruiting_people_max: recruitment.recruiting_people_max,
      application_limit: recruitment.application_limit,
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
end
