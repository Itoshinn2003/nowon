class ReportsController < ApplicationController
  before_action :authenticate_user!

  def create
    reported_user = User.find(report_params[:reported_user_id])
    report = current_user.sent_reports.build(
      reported_user: reported_user,
      reason: report_params[:reason],
      details: report_params[:details]
    )

    if report.save
      render json: { report: serialized_report(report) }, status: :created
    else
      render json: { errors: report.errors.to_hash }, status: :unprocessable_entity
    end
  end

  private

  def report_params
    params.fetch(:report, params).permit(:reported_user_id, :reason, :details)
  end

  def serialized_report(report)
    {
      id: report.id,
      reported_user_id: report.reported_user_id,
      reason: report.reason,
      status: report.status,
      created_at: report.created_at.iso8601
    }
  end
end
