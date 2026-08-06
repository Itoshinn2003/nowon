import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

import { registerPushToken } from "@/src/api/pushTokens";

type NotificationData = {
  type?: unknown;
  chat_room_id?: unknown;
  recruitment_id?: unknown;
};

export function usePushNotifications(isLoggedIn: boolean) {
  const router = useRouter();
  const hasRegisteredRef = useRef(false);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as NotificationData;

      if (data.type === "chat_message_created") {
        const chatRoomId = numberParam(data.chat_room_id);

        if (chatRoomId) {
          router.push({
            pathname: "/chat/[id]",
            params: { id: String(chatRoomId) },
          });
        }
      }

      if (
        data.type === "recruitment_application_created" ||
        data.type === "recruitment_application_accepted" ||
        data.type === "recruitment_matched"
      ) {
        const recruitmentId = numberParam(data.recruitment_id);

        if (recruitmentId) {
          router.push({
            pathname: "/recruitments/[id]",
            params: { id: String(recruitmentId) },
          });
        }
      }
    },
    [router]
  );

  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    return () => {
      subscription.remove();
    };
  }, [handleNotificationResponse]);

  useEffect(() => {
    if (!isLoggedIn) {
      hasRegisteredRef.current = false;
      return;
    }

    if (hasRegisteredRef.current) return;
    hasRegisteredRef.current = true;

    registerForPushNotifications().catch((error) => {
      console.warn("Push notification registration failed", error);
    });
  }, [isLoggedIn]);
}

async function registerForPushNotifications() {
  if (Platform.OS === "web") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (existingPermission.status !== "granted") {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== "granted") return;

  const projectId = notificationProjectId();

  if (!projectId) {
    throw new Error("EAS projectId is missing");
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  await registerPushToken({
    token: token.data,
    platform: notificationPlatform(),
  });
}

function notificationProjectId() {
  return (
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined)
  );
}

function notificationPlatform() {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return Platform.OS;
  }

  return "unknown";
}

function numberParam(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}
