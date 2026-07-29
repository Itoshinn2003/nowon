import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileView } from "@/src/components/profile/ProfileView";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { colors } from "@/src/constants/colors";
import { useProfile } from "@/src/hooks/useProfile";
import { useAuthStore } from "@/src/stores/authStore";

export default function ProfileScreen() {
  const { clearSession } = useAuthStore();
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
    </SafeAreaView>
  );
}
