require "test_helper"

class RecruitmentApplicationsControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    clear_enqueued_jobs
    clear_performed_jobs
  end

  teardown do
    clear_enqueued_jobs
    clear_performed_jobs
  end

  test "create enqueues a push notification for the recruitment owner" do
    owner = create_user("application-owner@example.com")
    applicant = create_user("application-applicant@example.com")
    create_profile(applicant, nickname: "応募太郎")
    recruitment = create_recruitment(owner, purpose: "ライブ同行")

    assert_enqueued_jobs 1, only: PushNotificationJob do
      post "/recruitments/#{recruitment.id}/applications",
           params: { application: { message: "参加したいです" } },
           headers: applicant.create_new_auth_token
    end

    assert_response :created

    job = enqueued_jobs.find { |enqueued_job| enqueued_job[:job] == PushNotificationJob }
    arguments = job[:args].first.with_indifferent_access

    assert_equal [ owner.id ], arguments[:user_ids]
    assert_equal "応募が届きました", arguments[:title]
    assert_equal "応募太郎さんが「ライブ同行」に応募しました", arguments[:body]
    assert_equal "recruitment_application_created", arguments[:data]["type"]
    assert_equal recruitment.id, arguments[:data]["recruitment_id"]
    assert_equal response.parsed_body.dig("application", "id"), arguments[:data]["application_id"]
  end

  private

  def create_user(email)
    local, domain = email.split("@", 2)

    User.create!(
      email: "#{local}-#{SecureRandom.hex(4)}@#{domain}",
      password: "password123",
      uid: email,
      confirmed_at: Time.current
    )
  end

  def create_profile(user, nickname:)
    UserProfile.create!(
      user: user,
      nickname: nickname,
      birth_date: Date.new(2000, 1, 1),
      gender: "male",
      bio: "よろしくお願いします"
    )
  end

  def create_recruitment(user, purpose:)
    Recruitment.create!(
      user: user,
      recruitment_category: create_category,
      recruitment_type: :one_to_one,
      purpose: purpose,
      vibe: "気軽に",
      recruiting_people_min: 1,
      recruiting_people_max: 1,
      allowed_gender_policy: :anyone,
      latitude: 35.681236,
      longitude: 139.767125,
      description: "駅前で少し話したいです",
      safety_confirmed: true
    )
  end

  def create_category
    RecruitmentCategory.create!(
      name: "ライブ",
      key: "application-controller-test-#{SecureRandom.hex(4)}",
      display_order: 1
    )
  end
end
