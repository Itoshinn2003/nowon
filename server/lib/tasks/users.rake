namespace :users do
  desc "Delete unconfirmed users older than 1 day"
  task delete_stale_unconfirmed: :environment do
    stale_users = User.where(confirmed_at: nil)
                      .where("confirmation_sent_at < ?", 1.day.ago)

    deleted_count = stale_users.delete_all

    puts "Deleted #{deleted_count} stale unconfirmed users"
  end
end
