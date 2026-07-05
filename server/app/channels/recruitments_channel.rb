class RecruitmentsChannel < ApplicationCable::Channel
  MAP_STREAM = "map"

  def self.broadcast_created(recruitment)
    broadcast_to(
      MAP_STREAM,
      {
        type: "recruitment_created",
        recruitment: {
          id: recruitment.id,
          latitude: recruitment.latitude.to_s,
          longitude: recruitment.longitude.to_s
        }
      }
    )
  end

  def subscribed
    stream_for MAP_STREAM
  end
end
