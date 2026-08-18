require "test_helper"

class PublicPagesControllerTest < ActionDispatch::IntegrationTest
  test "support page is public" do
    get "/support"

    assert_response :success
    assert_includes response.media_type, "text/html"
    assert_includes response.body, "NowOn サポート"
    assert_includes response.body, "nowon.support@gmail.com"
    assert_includes response.body, "/privacy"
  end

  test "privacy page is public" do
    get "/privacy"

    assert_response :success
    assert_includes response.media_type, "text/html"
    assert_includes response.body, "NowOn プライバシーポリシー"
    assert_includes response.body, "募集場所の緯度・経度"
    assert_includes response.body, "Expo Push Token"
  end
end
