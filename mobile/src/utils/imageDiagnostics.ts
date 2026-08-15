import type { ImageErrorEvent } from "react-native";

type ProfileImageLogContext = {
  component: string;
  photoId?: number;
  url: string;
  attempt: number;
};

export const PROFILE_IMAGE_RETRY_LIMIT = 1;

export function appendImageRetryParam(url: string, retryToken: number) {
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}image_retry=${retryToken}`;
}

export function logProfileImageLoad(context: ProfileImageLogContext) {
  console.log("[profile-image:load]", context);
}

export function logProfileImageError({
  context,
  event,
  willRetry,
}: {
  context: ProfileImageLogContext;
  event: ImageErrorEvent;
  willRetry: boolean;
}) {
  console.warn("[profile-image:error]", {
    ...context,
    nativeEvent: event.nativeEvent,
    willRetry,
  });
}
