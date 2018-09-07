require 'test_helper'

class KyuusyuusControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get kyuusyuus_index_url
    assert_response :success
  end

end
