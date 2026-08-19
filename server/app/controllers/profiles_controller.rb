class ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    if params[:id]
      user = User
             .includes(user_profile: { profile_photos: { image_attachment: :blob } })
             .find(params[:id])

      if blocked_relation?(user.id)
        head :not_found
        return
      end

      render json: profile_response(
        user.user_profile,
        include_all_photos: user.id == current_user.id
      )
      return
    end

    render json: profile_response(current_user.user_profile)
  end

  def update
    profile = current_user.user_profile || current_user.build_user_profile
    status = profile.new_record? ? :created : :ok

    if profile.update(profile_params)
      render json: profile_response(profile), status: status
    else
      render json: { errors: profile.errors.to_hash }, status: :unprocessable_entity
    end
  end

  def complete_onboarding
    profile = current_user.user_profile

    unless profile&.valid?
      return render json: {
        errors: profile&.errors&.to_hash || { profile: [ "must exist" ] }
      }, status: :unprocessable_entity
    end

    unless profile.profile_photos.exists?
      return render json: {
        errors: { photos: [ "を1枚以上登録してください" ] }
      }, status: :unprocessable_entity
    end

    current_user.update!(onboarding_completed_at: Time.current)
    current_user.reload

    render json: profile_response(profile.reload)
  end

  private

  def profile_params
    params.fetch(:profile, params).permit(:nickname, :birth_date, :gender, :bio)
  end

  def serialized_profile(profile, include_all_photos: true)
    return nil unless profile

    photos = profile.profile_photos
    photos = photos.approved unless include_all_photos

    {
      id: profile.id,
      user_id: profile.user_id,
      nickname: profile.nickname,
      birth_date: profile.birth_date&.iso8601,
      age: profile.age,
      gender: profile.gender,
      bio: profile.bio,
      photos: photos.ordered.map { |photo| serialized_photo(photo) }
    }
  end

  def profile_response(profile, include_all_photos: true)
    {
      profile: serialized_profile(profile, include_all_photos: include_all_photos),
      current_user_id: current_user.id,
      onboarding_completed_at: current_user.onboarding_completed_at&.iso8601
    }
  end

  def serialized_photo(photo)
    {
      id: photo.id,
      position: photo.position,
      status: photo.status,
      url: photo.image.attached? ? rails_blob_url(photo.image, host: request.base_url) : nil
    }
  end
end
