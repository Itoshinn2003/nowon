import Feather from "@expo/vector-icons/Feather";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileSettingsMenu } from "@/src/components/profile/ProfileSettingsMenu";
import { ProfileView } from "@/src/components/profile/ProfileView";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { colors } from "@/src/constants/colors";
import { useProfile } from "@/src/hooks/useProfile";
import { useAuthStore } from "@/src/stores/authStore";

export default function ProfileScreen() {
  const { clearSession } = useAuthStore();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const { profile, isLoading, errorMessage, reloadProfile } = useProfile({
    loadOnMount: false,
  });

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
    }, [reloadProfile])
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  async function handleLogout() {
    await clearSession();
    router.replace("/signin");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-12">
        <View className="gap-6">
          <View className="h-10 flex-row items-center justify-end">
            <Pressable
              className="h-10 w-10 items-center justify-center"
              onPress={() => setIsSettingsVisible(true)}
            >
              <Feather name="settings" size={22} color="#111827" />
            </Pressable>
          </View>

          {errorMessage ? (
            <View className="gap-2">
              <Text className="text-sm text-red-500">{errorMessage}</Text>
            </View>
          ) : null}

          <ProfileView
            profile={profile}
            showOwnerActions
            onLogout={handleLogout}
          />
        </View>
      </ScrollView>
      <ProfileSettingsMenu
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}
