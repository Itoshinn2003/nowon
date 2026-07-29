import Feather from "@expo/vector-icons/Feather";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { DeviceEventEmitter, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { subscribeToChatNotifications } from "@/src/api/chatNotificationsCable";
import { colors } from "@/src/constants/colors";
import { useProfile } from "@/src/hooks/useProfile";

const TAB_BAR_BASE_HEIGHT = 52;
const TAB_BAR_BOTTOM_INSET_REDUCTION = 20;
const TAB_BAR_MIN_BOTTOM_PADDING = 6;
const TAB_BAR_TOP_PADDING = 4;

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>["name"];
  color: string;
}) {
  return (
    <TabIconFrame>
      <Feather size={25} {...props} />
    </TabIconFrame>
  );
}

function ProfileTabIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  const { profile } = useProfile();
  const photoUrl = profile?.photos[0]?.url;

  if (!photoUrl) {
    return <TabBarIcon name="user" color={color} />;
  }

  return (
    <TabIconFrame>
      <View
        style={{
          borderColor: focused ? color : "transparent",
          borderRadius: 14,
          borderWidth: 1.5,
          height: 28,
          overflow: "hidden",
          padding: 1,
          width: 28,
        }}
      >
        <View style={{ borderRadius: 12, flex: 1, overflow: "hidden" }}>
          <Image
            source={{ uri: photoUrl }}
            style={{ height: "100%", width: "100%" }}
          />
        </View>
      </View>
    </TabIconFrame>
  );
}

function TabIconFrame({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 56,
      }}
    >
      {children}
    </View>
  );
}

export default function TabLayout() {
  const chatNotificationsSubscriptionRef = useRef<{ close: () => void } | null>(
    null
  );
  const currentUserIdRef = useRef<number | null>(null);
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(
    insets.bottom - TAB_BAR_BOTTOM_INSET_REDUCTION,
    TAB_BAR_MIN_BOTTOM_PADDING
  );

  useEffect(() => {
    currentUserIdRef.current = profile?.userId ?? null;
  }, [profile?.userId]);

  useEffect(() => {
    let isMounted = true;

    subscribeToChatNotifications({
      onMessage: (payload) => {
        const currentUserId = currentUserIdRef.current;

        if (
          currentUserId !== null &&
          payload.message.user_id !== currentUserId
        ) {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          ).catch(() => undefined);
        }

        DeviceEventEmitter.emit("chatMessageReceived", payload);
      },
    })
      .then((subscription) => {
        if (!isMounted) {
          subscription.close();
          return;
        }

        chatNotificationsSubscriptionRef.current = subscription;
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
      chatNotificationsSubscriptionRef.current?.close();
      chatNotificationsSubscriptionRef.current = null;
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.state,
        tabBarInactiveTintColor: "#111827",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#DBDBDB",
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: TAB_BAR_BASE_HEIGHT + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: TAB_BAR_TOP_PADDING,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "地図",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map-pin" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: "募集",
          tabBarIcon: ({ color }) => <TabBarIcon name="edit-3" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "チャット",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="message-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, focused }) => (
            <ProfileTabIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
