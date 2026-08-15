import { useEffect, useState } from "react";
import { Image } from "react-native";
import type { ImageErrorEvent, ImageStyle, StyleProp } from "react-native";

import type { ProfilePhoto } from "@/src/types/profile";
import {
  appendImageRetryParam,
  logProfileImageError,
  logProfileImageLoad,
  PROFILE_IMAGE_RETRY_LIMIT,
} from "@/src/utils/imageDiagnostics";

type Props = {
  className?: string;
  component: string;
  photo: ProfilePhoto;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  style?: StyleProp<ImageStyle>;
};

export function DiagnosticProfileImage({
  className,
  component,
  photo,
  resizeMode = "cover",
  style,
}: Props) {
  const [hasImageError, setHasImageError] = useState(false);
  const [retryToken, setRetryToken] = useState<number | null>(null);
  const retryAttempt = retryToken ? 1 : 0;

  useEffect(() => {
    setHasImageError(false);
    setRetryToken(null);
  }, [photo.url]);

  if (!photo.url || hasImageError) return null;

  const imageUrl = retryToken
    ? appendImageRetryParam(photo.url, retryToken)
    : photo.url;

  function handleError(event: ImageErrorEvent) {
    const willRetry = retryAttempt < PROFILE_IMAGE_RETRY_LIMIT;

    logProfileImageError({
      context: {
        attempt: retryAttempt,
        component,
        photoId: photo.id,
        url: photo.url ?? "",
      },
      event,
      willRetry,
    });

    if (willRetry) {
      setRetryToken(Date.now());
      return;
    }

    setHasImageError(true);
  }

  return (
    <Image
      className={className}
      onError={handleError}
      onLoad={() =>
        logProfileImageLoad({
          attempt: retryAttempt,
          component,
          photoId: photo.id,
          url: photo.url ?? "",
        })
      }
      resizeMode={resizeMode}
      source={{ uri: imageUrl }}
      style={style}
    />
  );
}
