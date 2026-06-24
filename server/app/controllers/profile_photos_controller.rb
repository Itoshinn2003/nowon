class ProfilePhotosController < ApplicationController
  before_action :authenticate_user!
  before_action :set_profile

  def create
    photo = @profile.profile_photos.build(
      position: next_position,
      status: "approved"
    )
    photo.image.attach(params[:image]) if params[:image].present?

    if photo.save
      render json: { photo: serialized_photo(photo) }, status: :created
    else
      render json: { errors: photo.errors.to_hash }, status: :unprocessable_entity
    end
  end

  def destroy
    photo = @profile.profile_photos.find(params[:id])

    photo.destroy!
    normalize_positions

    head :no_content
  end

  private

  def set_profile
    @profile = current_user.user_profile

    return if @profile

    render json: { errors: { profile: [ "must exist" ] } }, status: :unprocessable_entity
  end

  def next_position
    @profile.profile_photos.maximum(:position).to_i + 1
  end

  def normalize_positions
    @profile.profile_photos.ordered.each.with_index(1) do |photo, position|
      photo.update_column(:position, position)
    end
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
