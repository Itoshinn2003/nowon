module Auth
  class AppleAuthenticationsController < ApplicationController
    def create
      payload = AppleIdTokenVerifier.verify(params[:identity_token])
      user = find_or_create_user!(payload)
      auth_headers = user.create_new_auth_token

      response.headers.merge!(auth_headers)
      render json: { data: serialized_user(user) }
    rescue AppleIdTokenVerifier::Error
      render json: {
        errors: [ "Apple認証に失敗しました" ]
      }, status: :unauthorized
    rescue ActiveRecord::RecordInvalid => e
      render json: {
        errors: e.record.errors.to_hash.merge(full_messages: e.record.errors.full_messages)
      }, status: :unprocessable_entity
    end

    private

    def find_or_create_user!(payload)
      user = User.find_by(provider: "apple", uid: payload.fetch("sub"))
      return update_existing_user!(user) if user

      email = payload["email"].to_s.downcase
      raise AppleIdTokenVerifier::Error, "Missing email" if email.blank?

      user = User.find_by(email: email)
      return update_existing_user!(user) if user

      User.create!(
        email: email,
        provider: "apple",
        uid: payload.fetch("sub"),
        password: SecureRandom.urlsafe_base64(15)[0, 20],
        name: full_name,
        nickname: full_name,
        confirmed_at: Time.current
      )
    end

    def update_existing_user!(user)
      name = full_name
      user.name = name if user.name.blank? && name.present?
      user.nickname = name if user.nickname.blank? && name.present?
      user.confirmed_at ||= Time.current
      user.save!
      user
    end

    def full_name
      full_name_params = params[:full_name]
      return nil unless full_name_params.respond_to?(:values_at)

      [
        full_name_params[:familyName],
        full_name_params[:givenName],
        full_name_params[:middleName],
        full_name_params[:nickname]
      ].compact_blank.join(" ").presence
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
