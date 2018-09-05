Rails.application.routes.draw do
  get 'toppage/index'

  get 'sessions/new'

  get 'maps/index'

  resources :castles
  resources :users
  resources :sessions, only: [:new, :create, :destroy]

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
