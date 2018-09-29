class ArticlesController < ApplicationController


  def index
    @articles = Article.all
  end

  def new
    @article = Article.new
  end

  def create
    @article = Article.create(params_set)
    redirect_to articles_index_path
  end

  def show
    @article = Article.find(params[:id])
  end


  # payを private よりも前に追加
  def pay
    Payjp.api_key = 'sk_test_c62fade9d045b54cd76d7036'
    charge = Payjp::Charge.create(
      :amount => @article.ar_price,
      :card => params['payjp-token'],
      :currency => 'jpy',
    )
    redirect_to @article, notice: 'ありがとうございました。'
  end

private
    def params_set
    params.require(:article).permit(:ar_name,:ar_image,:ar_price,:ar_stock,:ar_pref,:ar_info,:user_id,:castle_id)
  end
end
