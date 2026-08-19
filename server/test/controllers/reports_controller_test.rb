require "test_helper"
require "securerandom"

class ReportsControllerTest < ActionDispatch::IntegrationTest
  test "create stores a user report" do
    reporter = create_user("reporter-#{SecureRandom.hex(4)}@example.com")
    reported_user = create_user("reported-#{SecureRandom.hex(4)}@example.com")

    assert_difference("Report.count", 1) do
      post "/reports",
           params: {
             report: {
               reported_user_id: reported_user.id,
               reason: "harassment",
               details: "迷惑なメッセージが届いた"
             }
           },
           headers: reporter.create_new_auth_token
    end

    assert_response :created

    report = Report.last
    assert_equal reporter.id, report.reporter_id
    assert_equal reported_user.id, report.reported_user_id
    assert_equal "harassment", report.reason
    assert_equal "pending", report.status
  end

  test "create rejects self report" do
    user = create_user("self-report-#{SecureRandom.hex(4)}@example.com")

    assert_no_difference("Report.count") do
      post "/reports",
           params: {
             report: {
               reported_user_id: user.id,
               reason: "other"
             }
           },
           headers: user.create_new_auth_token
    end

    assert_response :unprocessable_entity
  end

  private

  def create_user(email)
    User.create!(
      email: email,
      password: "password123",
      uid: email,
      confirmed_at: Time.current
    )
  end
end
