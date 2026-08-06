class PushTokensController < ApplicationController
  before_action :authenticate_user!

  def create
    push_token = DevicePushToken.find_or_initialize_by(token: push_token_params[:token])
    push_token.user = current_user
    push_token.mark_seen!(platform: normalized_platform)

    render json: { push_token: serialized_push_token(push_token) }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.to_hash }, status: :unprocessable_entity
  end

  def destroy
    token = params[:token] || params.dig(:push_token, :token)
    push_token = current_user.device_push_tokens.find_by(token: token)
    push_token&.invalidate!

    head :no_content
  end

  private

  def push_token_params
    params.fetch(:push_token, params).permit(:token, :platform)
  end

  def normalized_platform
    platform = push_token_params[:platform].presence || "unknown"
    DevicePushToken::PLATFORMS.include?(platform) ? platform : "unknown"
  end

  def serialized_push_token(push_token)
    {
      id: push_token.id,
      token: push_token.token,
      platform: push_token.platform,
      enabled: push_token.enabled,
      last_seen_at: push_token.last_seen_at.iso8601
    }
  end
end
