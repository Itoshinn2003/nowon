import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import React from "react";
import { Image, View } from "react-native";

import { useProfile } from "@/src/hooks/useProfile";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>["name"];
  color: string;
}) {
  return (
    <TabIconFrame>
      <Feather size={24} {...props} />
    </TabIconFrame>
  );
}

function ProfileTabIcon({ color }: { color: string }) {
  const { profile } = useProfile();
  const photoUrl = profile?.photos[0]?.url;

  if (!photoUrl) {
    return <TabBarIcon name="user" color={color} />;
  }

  return (
    <TabIconFrame>
      <View
        style={{
          borderRadius: 13,
          height: 26,
          overflow: "hidden",
          width: 26,
        }}
      >
        <Image
          source={{ uri: photoUrl }}
          style={{ height: "100%", width: "100%" }}
        />
      </View>
    </TabIconFrame>
  );
}

function TabIconFrame({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        alignItems: "center",
        height: 42,
        justifyContent: "center",
        width: 48,
      }}
    >
      {children}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#00C2A8",
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          paddingHorizontal: 34,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 2,
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
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="edit-3" color={color} />
          ),
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
          tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
