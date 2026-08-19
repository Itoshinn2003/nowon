class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken

  private

  def blocked_user_ids
    @blocked_user_ids ||= Block.related_user_ids_for(current_user)
  end

  def blocked_relation?(user_id)
    blocked_user_ids.include?(user_id)
  end

  def render_blocked_error
    render json: { errors: { base: [ "このユーザーとはやり取りできません" ] } }, status: :forbidden
  end
end
