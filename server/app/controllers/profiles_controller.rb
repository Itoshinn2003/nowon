class ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: { profile: serialized_profile(current_user.user_profile) }
  end

  def update
    profile = current_user.user_profile || current_user.build_user_profile
    status = profile.new_record? ? :created : :ok

    if profile.update(profile_params)
      render json: { profile: serialized_profile(profile) }, status: status
    else
      render json: { errors: profile.errors.to_hash }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.fetch(:profile, params).permit(:nickname, :birth_date, :gender, :bio)
  end

  def serialized_profile(profile)
    return nil unless profile

    {
      id: profile.id,
      nickname: profile.nickname,
      birth_date: profile.birth_date&.iso8601,
      age: profile.age,
      gender: profile.gender,
      bio: profile.bio,
      photos: profile.profile_photos.ordered.map { |photo| serialized_photo(photo) }
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
