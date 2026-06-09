class AddDeviseTokenAuthToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :provider, :string, null: false, default: "email"
    add_column :users, :uid, :string, null: false, default: ""
    add_column :users, :allow_password_change, :boolean, default: false
    add_column :users, :name, :string
    add_column :users, :nickname, :string
    add_column :users, :image, :string
    add_column :users, :tokens, :text

    add_index :users, [:uid, :provider], unique: true
  end
end
