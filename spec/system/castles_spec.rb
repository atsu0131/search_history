require 'rails_helper'

descripe "管理機能", type: :system do
  descripe "表示機能" do
    before do
      user_a = FactoryBot.create(:user, name:"A", email: "a@example.com")
      FactoryBot.create(:castle, :ca_name "タスク", user: user_a)
    end

    context "ログインしている時" do
      before do
        visit login_path
        fill_in "メールアド", with: "a@example.com"
          fill_in "パスワード", with: "password"
          click_button "ログイン"
      end

      it "表示" do
        expect(page).to have_content "最初のタスク"
      end
    end
  end
end