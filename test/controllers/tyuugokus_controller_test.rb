require 'test_helper'

class TyuugokusControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get tyuugokus_index_url
    assert_response :success
  end

end
