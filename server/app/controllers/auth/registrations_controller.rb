module Auth
  class RegistrationsController < DeviseTokenAuth::RegistrationsController
    def create
      existing_user = User.find_by(email: normalized_email, provider: "email")

      if existing_user&.confirmed?
        return render_confirmed_user_error(existing_user)
      end

      if existing_user
        existing_user.send_confirmation_instructions(
          redirect_url: params[:confirm_success_url],
          client_config: params[:config_name]
        )

        return render json: {
          status: "success",
          message: "確認メールを送信しました"
        }
      end

      super
    end

    private

    def normalized_email
      params[:email].to_s.downcase
    end

    def render_confirmed_user_error(user)
      user.errors.add(:email, :taken)

      render json: {
        status: "error",
        data: user.as_json,
        errors: user.errors.to_hash.merge(full_messages: user.errors.full_messages)
      }, status: :unprocessable_entity
    end
  end
end
