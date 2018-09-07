require 'test_helper'

class OkinawasControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get okinawas_index_url
    assert_response :success
  end

end
