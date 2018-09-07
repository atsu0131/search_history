require 'test_helper'

class TyuubusControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get tyuubus_index_url
    assert_response :success
  end

end
