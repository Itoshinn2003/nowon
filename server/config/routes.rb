Rails.application.routes.draw do
  mount_devise_token_auth_for "User", at: "auth", controllers: {
    confirmations: "auth/confirmations",
    registrations: "auth/registrations"
  }

  resource :profile, only: %i[ show update ], controller: "profiles" do
    resources :photos, only: %i[ create destroy ], controller: "profile_photos"
  end

  resources :recruitment_categories, only: %i[ index ]
  resources :recruitments, only: %i[ index create ] do
    get :mine, on: :collection
    patch :cancel, on: :member
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
