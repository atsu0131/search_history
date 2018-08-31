require 'test_helper'

class CastlesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get castles_index_url
    assert_response :success
  end

  test "should get new" do
    get castles_new_url
    assert_response :success
  end

end
