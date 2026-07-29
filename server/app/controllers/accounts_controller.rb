class AccountsController < ApplicationController
  before_action :authenticate_user!
  skip_after_action :update_auth_header, only: :destroy

  def destroy
    ActiveRecord::Base.transaction do
      ChatParticipant
        .where(last_read_message_id: current_user.chat_messages.select(:id))
        .update_all(last_read_message_id: nil)

      current_user.destroy!
    end

    head :no_content
  end
end
