require 'test_helper'

class KinkisControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get kinkis_index_url
    assert_response :success
  end

end
