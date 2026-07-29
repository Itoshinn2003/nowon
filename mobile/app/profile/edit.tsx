import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { saveProfile } from "@/src/api/profile";
import { ProfileEditForm } from "@/src/components/profile/ProfileEditForm";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { colors } from "@/src/constants/colors";
import { useProfile } from "@/src/hooks/useProfile";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import type { ProfileFormState } from "@/src/types/profile";
import {
  errorMessageFromError,
  formatDate,
} from "@/src/utils/profile";

export default function ProfileEditScreen() {
  const {
    profile,
    setProfile,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useProfile();
  const {
    isSubmitting,
    startSubmitting,
    finishSubmitting,
  } = useSubmitState();

  async function handleSubmit(formData: ProfileFormState) {
    startSubmitting();
    setErrorMessage("");

    try {
      const updatedProfile = await saveProfile({
        nickname: formData.nickname.trim(),
        birthDate: formatDate(formData.birthDate),
        gender: formData.gender,
        bio: formData.bio.trim(),
      });

      setProfile(updatedProfile);
      router.back();
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "プロフィールを保存できませんでした")
      );
    } finally {
      finishSubmitting();
    }
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-12">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-gray-950">
              プロフィール編集
            </Text>
            {errorMessage ? (
              <Text className="text-sm text-red-500">{errorMessage}</Text>
            ) : null}
          </View>

          <ProfileEditForm
            profile={profile}
            isSubmitting={isSubmitting}
            showBirthDate={false}
            showGender={false}
            onCancel={() => router.back()}
            onSubmit={handleSubmit}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
