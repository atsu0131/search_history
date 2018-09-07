require 'test_helper'

class SikokusControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get sikokus_index_url
    assert_response :success
  end

end
