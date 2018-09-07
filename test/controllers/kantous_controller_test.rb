require 'test_helper'

class KantousControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get kantous_index_url
    assert_response :success
  end

end
