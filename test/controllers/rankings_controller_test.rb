require 'test_helper'

class RankingsControllerTest < ActionDispatch::IntegrationTest
  test "should get favorite" do
    get rankings_favorite_url
    assert_response :success
  end

end
