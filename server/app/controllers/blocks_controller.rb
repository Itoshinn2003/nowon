class BlocksController < ApplicationController
  before_action :authenticate_user!

  def create
    blocked_user = User.find(block_params[:blocked_user_id])
    block = current_user.blocks_as_blocker.find_or_initialize_by(blocked_user: blocked_user)

    if block.save
      render json: { block: serialized_block(block) }, status: :created
    else
      render json: { errors: block.errors.to_hash }, status: :unprocessable_entity
    end
  end

  def destroy
    block = current_user.blocks_as_blocker.find_by(blocked_user_id: params[:blocked_user_id])
    block&.destroy!

    head :no_content
  end

  private

  def block_params
    params.fetch(:block, params).permit(:blocked_user_id)
  end

  def serialized_block(block)
    {
      id: block.id,
      blocked_user_id: block.blocked_user_id,
      created_at: block.created_at.iso8601
    }
  end
end
