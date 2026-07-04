class RecruitmentsController < ApplicationController
  before_action :authenticate_user!

  def index
    recruitments = Recruitment
                   .active_now
                   .includes(:recruitment_category, user: { user_profile: { profile_photos: { image_attachment: :blob } } })
                   .order(created_at: :desc)

    render json: {
      recruitments: recruitments.map { |recruitment| serialized_recruitment(recruitment) }
    }
  end

  def mine
    recruitments = current_user
                   .recruitments
                   .visible_to_owner
                   .includes(:recruitment_category, user: { user_profile: { profile_photos: { image_attachment: :blob } } })
                   .order(created_at: :desc)

    render json: {
      recruitments: recruitments.map { |recruitment| serialized_recruitment(recruitment) }
    }
  end

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

  def cancel
    recruitment = current_user.recruitments.find(params[:id])

    unless recruitment.active?
      render json: {
        errors: { base: [ "募集はすでに終了しています" ] }
      }, status: :unprocessable_entity
      return
    end

    if recruitment.update(status: :closed, closed_at: Time.current)
      render json: { recruitment: serialized_recruitment(recruitment) }
    else
      render json: { errors: recruitment.errors.to_hash }, status: :unprocessable_entity
    end
  end

  def match
    recruitment = current_user.recruitments.find(params[:id])

    unless recruitment.matchable?
      render json: {
        errors: { base: [ "マッチング開始に必要な承認人数に達していません" ] }
      }, status: :unprocessable_entity
      return
    end

    if recruitment.update(status: :matched, closed_at: Time.current)
      recruitment.ensure_chat_room!
      render json: { recruitment: serialized_recruitment(recruitment) }
    else
      render json: { errors: recruitment.errors.to_hash }, status: :unprocessable_entity
    end
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
      owner_profile: serialized_owner_profile(recruitment.user.user_profile),
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

  def serialized_owner_profile(profile)
    return nil unless profile

    nickname = profile.nickname.to_s
    photo = profile.profile_photos.approved.ordered.first

    {
      nickname: nickname,
      initials: nickname.first || "?",
      avatar_url: photo&.image&.attached? ? rails_blob_url(photo.image, host: request.base_url) : nil
    }
  end
end
