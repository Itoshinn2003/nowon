class RecruitmentApplicationsController < ApplicationController
  before_action :authenticate_user!

  def create
    recruitment = Recruitment.find(params[:recruitment_id])

    if blocked_relation?(recruitment.user_id)
      render_blocked_error
      return
    end

    application = recruitment
                  .recruitment_applications
                  .build(application_params.merge(user: current_user))

    if application.save
      ::PushNotificationEvents.recruitment_application_created(application)
      render json: { application: serialized_application(application) }, status: :created
    else
      render json: { errors: application.errors.to_hash }, status: :unprocessable_entity
    end
  end

  def index
    recruitment = current_user.recruitments.find(params[:recruitment_id])
    applications = recruitment
                   .recruitment_applications
                   .then { |scope| exclude_blocked_applicants(scope) }
                   .includes(user: :user_profile)
                   .order(created_at: :desc)

    render json: {
      applications: applications.map { |application| serialized_application(application) }
    }
  end

  def mine
    applications = current_user
                   .recruitment_applications
                   .includes(recruitment: [ :recruitment_category, { user: { user_profile: { profile_photos: { image_attachment: :blob } } } } ])
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

  def accept
    application = owned_application
    recruitment = application.recruitment

    if blocked_relation?(application.user_id)
      render_blocked_error
      return
    end

    unless recruitment.active? && recruitment.expires_at.future?
      render json: {
        errors: { base: [ "この募集は承認できません" ] }
      }, status: :unprocessable_entity
      return
    end

    if !application.accepted? && recruitment.max_accepted?
      render json: {
        errors: { base: [ "承認人数が上限に達しています" ] }
      }, status: :unprocessable_entity
      return
    end

    application.update!(status: :accepted)
    ::PushNotificationEvents.recruitment_application_accepted(application)

    if recruitment.max_accepted?
      recruitment.update!(status: :matched, closed_at: Time.current)
      recruitment.ensure_chat_room!
      ::PushNotificationEvents.recruitment_matched(recruitment)
    end

    render json: { application: serialized_application(application.reload) }
  end

  def cancel_accept
    application = owned_application
    recruitment = application.recruitment

    if recruitment.matched?
      render json: {
        errors: { base: [ "マッチング後は承認をキャンセルできません" ] }
      }, status: :unprocessable_entity
      return
    end

    application.update!(status: :pending)

    render json: { application: serialized_application(application.reload) }
  end

  private

  def owned_application
    RecruitmentApplication
      .includes(:recruitment, user: :user_profile)
      .joins(:recruitment)
      .where(recruitments: { user_id: current_user.id })
      .find(params[:id])
  end

  def application_params
    params.fetch(:application, params).permit(:message)
  end

  def exclude_blocked_applicants(scope)
    return scope if blocked_user_ids.empty?

    scope.where.not(user_id: blocked_user_ids)
  end

  def serialized_application(application)
    {
      id: application.id,
      recruitment_id: application.recruitment_id,
      user_id: application.user_id,
      status: application.status,
      message: application.message,
      recruitment: serialized_recruitment(application.recruitment),
      applicant_profile: serialized_profile(application.user.user_profile),
      created_at: application.created_at.iso8601,
      updated_at: application.updated_at.iso8601
    }
  end

  def serialized_profile(profile)
    return nil unless profile

    {
      id: profile.id,
      nickname: profile.nickname,
      age: profile.age,
      gender: profile.gender,
      bio: profile.bio
    }
  end

  def serialized_recruitment(recruitment)
    return nil unless recruitment

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
