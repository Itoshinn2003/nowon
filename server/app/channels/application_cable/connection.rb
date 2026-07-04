module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      uid = request.params["uid"]
      client = request.params["client"]
      access_token = request.params["access-token"]
      user = User.find_by(uid: uid)

      return user if user&.valid_token?(access_token, client)

      reject_unauthorized_connection
    end
  end
end
