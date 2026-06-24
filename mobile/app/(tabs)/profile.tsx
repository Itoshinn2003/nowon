import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileView } from "@/src/components/profile/ProfileView";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { colors } from "@/src/constants/colors";
import { useProfile } from "@/src/hooks/useProfile";

export default function ProfileScreen() {
  const { profile, isLoading, errorMessage, reloadProfile } = useProfile();

  useFocusEffect(
    useCallback(() => {
      reloadProfile();
    }, [reloadProfile])
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-12">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-gray-950">
              プロフィール
            </Text>
            {errorMessage ? (
              <Text className="text-sm text-red-500">{errorMessage}</Text>
            ) : null}
          </View>

          <ProfileView profile={profile} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
