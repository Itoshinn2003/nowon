Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  get "support", to: "public_pages#support"
  get "privacy", to: "public_pages#privacy"

  post "auth/google", to: "auth/google_authentications#create"
  post "auth/apple", to: "auth/apple_authentications#create"

  mount_devise_token_auth_for "User", at: "auth", controllers: {
    confirmations: "auth/confirmations",
    registrations: "auth/registrations"
  }

  resource :profile, only: %i[ show update ], controller: "profiles" do
    patch :complete_onboarding
    resources :photos, only: %i[ create destroy ], controller: "profile_photos"
  end
  resource :account, only: %i[ destroy ], controller: "accounts"
  resources :push_tokens, only: %i[ create ]
  delete "push_tokens", to: "push_tokens#destroy"
  resources :profiles, only: %i[ show ], controller: "profiles"
  resources :reports, only: %i[ create ]
  resources :blocks, only: %i[ create ]
  delete "blocks/:blocked_user_id", to: "blocks#destroy"

  resources :recruitment_categories, only: %i[ index ]
  resources :recruitments, only: %i[ index show create ] do
    get :mine, on: :collection
    patch :cancel, on: :member
    patch :match, on: :member
    resources :applications, only: %i[ index create ], controller: "recruitment_applications"
  end
  resources :recruitment_applications, only: %i[ destroy ] do
    get :mine, on: :collection
    patch :accept, on: :member
    patch :cancel_accept, on: :member
  end
  resources :chat_rooms, only: %i[ index show ] do
    patch :read, on: :member
    resources :messages, only: %i[ index create ], controller: "chat_messages"
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
