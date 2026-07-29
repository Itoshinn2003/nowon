import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileView } from "@/src/components/profile/ProfileView";
import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";
import { useUserProfile } from "@/src/hooks/useProfile";

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = numberFromParam(id);
  const {
    profile,
    isLoading,
    errorMessage,
    reloadProfile,
  } = useUserProfile(userId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <BackIconButton onPress={() => router.back()} />
        <Text className="text-base font-extrabold text-gray-950">
          プロフィール
        </Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <ActivityIndicator color={colors.state} />
          <Text className="text-sm text-gray-500">読み込み中です</Text>
        </View>
      ) : errorMessage ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.stateSoft }}
          >
            <FontAwesome name="exclamation" size={20} color={colors.state} />
          </View>
          <Text className="text-center text-base font-bold text-gray-950">
            プロフィールを表示できません
          </Text>
          <Text className="text-center text-sm leading-6 text-gray-500">
            {errorMessage}
          </Text>
          <Button
            mode="contained"
            buttonColor={colors.textPrimary}
            style={{ borderRadius: 999 }}
            onPress={reloadProfile}
          >
            再読み込み
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <ProfileView profile={profile} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function numberFromParam(value: string | undefined) {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
