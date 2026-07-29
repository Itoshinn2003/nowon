class AddOnboardingCompletedAtToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :onboarding_completed_at, :datetime

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE users
          SET onboarding_completed_at = CURRENT_TIMESTAMP
        SQL
      end
    end
  end
end
