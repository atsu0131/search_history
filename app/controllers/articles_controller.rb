class ArticlesController < ApplicationController


  def index
    @articles = Article.all
  end

  def new
    @article = Article.new
  end

  def create
    @article = Article.new(params_set)
    @article.user_id = current_user.id
    if @article.save
      redirect_to articles_path, notice: "作成しました！"
    else
      render 'new'
    end

  end

  def show
    @article = Article.find(params[:id])
  end

  def edit
    @article = Article.find(params[:id])
  end

  def update
    @article = Article.find(params[:id])
    if @article.update(params_set)
      redirect_to articles_path,notice:"編集しました"
    else
      render 'edit'
    end
  end

  def destroy
    @article = Article.find(params[:id])
    @article.destroy
    redirect_to articles_path,notice:"削除しました"
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
    params.require(:article).permit(:ar_name,:ar_top_image,:ar_price,:ar_stock,:ar_pref,:ar_info,:user_id,:castle_id)
  end
end
