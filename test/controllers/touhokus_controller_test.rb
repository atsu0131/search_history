require 'test_helper'

class TouhokusControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get touhokus_index_url
    assert_response :success
  end

end
