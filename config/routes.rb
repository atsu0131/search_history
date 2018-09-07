Rails.application.routes.draw do
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

  resources :castles
  resources :users
  resources :sessions, only: [:new, :create, :destroy]

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
