class PushNotificationJob < ApplicationJob
  queue_as :default

  def perform(user_ids:, title:, body:, data: {})
    users = User.where(id: user_ids)

    PushNotificationService.new.call(
      users: users,
      title: title,
      body: body,
      data: data
    )
  end
end
