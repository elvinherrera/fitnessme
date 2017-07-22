Rails.application.routes.draw do
  get "/pages/home", to: "pages#home"

  devise_for :users, :controllers => {:registrations => "registrations"}
  root to: 'events#index'
  get "/tutorials/home", to: "tutorials#home", as: "tutorials_home"
  get "/account.html/:id", to: "profiles#show"
  resources :profile_groups
  resources :tutorials
  resources :events
  resources :pages
end
