class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "nowon.support@gmail.com")
  layout "mailer"
end
