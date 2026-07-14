module Auth
  class GoogleAuthenticationsController < ApplicationController
    def create
      payload = GoogleIdTokenVerifier.verify(params[:id_token])
      user = find_or_create_user!(payload)
      auth_headers = user.create_new_auth_token

      response.headers.merge!(auth_headers)
      render json: { data: serialized_user(user) }
    rescue GoogleIdTokenVerifier::Error
      render json: {
        errors: [ "Google認証に失敗しました" ]
      }, status: :unauthorized
    rescue ActiveRecord::RecordInvalid => e
      render json: {
        errors: e.record.errors.to_hash.merge(full_messages: e.record.errors.full_messages)
      }, status: :unprocessable_entity
    end

    private

    def find_or_create_user!(payload)
      email = payload.fetch("email").to_s.downcase
      user = User.find_by(provider: "google", uid: payload.fetch("sub")) ||
             User.find_by(email: email)

      return update_existing_user!(user, payload) if user

      User.create!(
        email: email,
        provider: "google",
        uid: payload.fetch("sub"),
        password: SecureRandom.urlsafe_base64(15)[0, 20],
        name: payload["name"],
        nickname: payload["name"],
        image: payload["picture"],
        confirmed_at: Time.current
      )
    end

    def update_existing_user!(user, payload)
      user.name = payload["name"] if user.name.blank? && payload["name"].present?
      user.nickname = payload["name"] if user.nickname.blank? && payload["name"].present?
      user.image = payload["picture"] if user.image.blank? && payload["picture"].present?
      user.confirmed_at ||= Time.current
      user.save!
      user
    end

    def serialized_user(user)
      {
        id: user.id,
        email: user.email,
        provider: user.provider,
        uid: user.uid
      }
    end
  end
end
