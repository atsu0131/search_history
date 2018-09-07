require 'test_helper'

class HokkaidosControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get hokkaidos_index_url
    assert_response :success
  end

end
