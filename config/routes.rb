Rails.application.routes.draw do

  get 'articles/index'

  get 'rankings/favorite'

  root to: 'toppages#index'

  get 'comments/create'

  get 'toppages/index'

  get 'okinawas/index'

  get 'kyuusyuus/index'

  get 'sikokus/index'

  get 'tyuugokus/index'

  get 'kinkis/index'

  get 'tyuubus/index'

  get 'touhokus/index'

  get 'hokkaidos/index'

  get 'kantous/index'

  get 'toppage/index'

  get 'sessions/new'

  get 'maps/index'
  get 'maps/:id', to: 'maps#show', as: 'map'

  get 'rankings/favorite', to: 'rankings#favorite'

  resources :castles do
    resources :comments
      collection do
      post :confirm
      end
  end

  resources :users
  resources :sessions, only: [:new, :create, :destroy]

  resources :favorites, only: [:create, :destroy]

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
