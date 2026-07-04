import { useEffect, useState } from "react";
import { Marker, type LatLng } from "react-native-maps";

import { RecruitmentMapPin } from "@/src/components/map/RecruitmentMapPin";
import type { Recruitment } from "@/src/types/recruitment";

type Props = {
  coordinate: LatLng;
  recruitment: Recruitment;
  currentTime: number;
  onPress: () => void;
};

export function RecruitmentMapMarker({
  coordinate,
  recruitment,
  currentTime,
  onPress,
}: Props) {
  const avatarUrl = recruitment.owner_profile?.avatar_url;
  const [tracksViewChanges, setTracksViewChanges] = useState(Boolean(avatarUrl));
  const [hasLoadedAvatar, setHasLoadedAvatar] = useState(!avatarUrl);

  useEffect(() => {
    setHasLoadedAvatar(!avatarUrl);
    setTracksViewChanges(Boolean(avatarUrl));
  }, [avatarUrl, recruitment.id]);

  useEffect(() => {
    setTracksViewChanges(true);

    const timeoutId = setTimeout(() => {
      if (hasLoadedAvatar) {
        setTracksViewChanges(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [currentTime, hasLoadedAvatar, recruitment.expires_at]);

  function handleImageLoadEnd() {
    setHasLoadedAvatar(true);
    setTracksViewChanges(false);
  }

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 1 }}
      stopPropagation
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
    >
      <RecruitmentMapPin
        recruitment={recruitment}
        currentTime={currentTime}
        onImageLoadEnd={handleImageLoadEnd}
      />
    </Marker>
  );
}
