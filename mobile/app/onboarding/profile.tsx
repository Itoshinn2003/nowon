import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  completeOnboarding,
  getProfile,
  saveProfile,
  uploadProfilePhoto,
} from "@/src/api/profile";
import { ProfileEditForm } from "@/src/components/profile/ProfileEditForm";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { colors } from "@/src/constants/colors";
import { useProfile } from "@/src/hooks/useProfile";
import type {
  ProfileFormState,
  UploadProfilePhotoParams,
} from "@/src/types/profile";
import {
  errorMessageFromError,
  formatDate,
} from "@/src/utils/profile";
import { pickProfilePhoto } from "@/src/utils/profilePhotoPicker";

export default function ProfileOnboardingScreen() {
  const {
    profile,
    setProfile,
    setOnboardingCompletedAt,
    isLoading,
    errorMessage,
    setErrorMessage,
    reloadProfile,
  } = useProfile();
  const [selectedPhoto, setSelectedPhoto] =
    useState<UploadProfilePhotoParams | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photoPreviewUri = selectedPhoto?.uri ?? profile?.photos[0]?.url ?? null;
  const hasPhoto = Boolean(photoPreviewUri);
  const canComplete = useMemo(
    () => hasPhoto && !isSubmitting,
    [hasPhoto, isSubmitting]
  );

  async function handlePickPhoto() {
    if (isSubmitting) return;

    const photo = await pickProfilePhoto();

    if (!photo) return;

    setSelectedPhoto(photo);
    setErrorMessage("");
  }

  async function handleSubmit(formData: ProfileFormState) {
    if (!hasPhoto || isSubmitting) {
      setErrorMessage("プロフィール画像を1枚登録してください");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const savedProfile = await saveProfile({
        nickname: formData.nickname.trim(),
        birthDate: formatDate(formData.birthDate),
        gender: formData.gender,
        bio: formData.bio.trim(),
      });

      setProfile(savedProfile);

      if (selectedPhoto) {
        await uploadProfilePhoto(selectedPhoto);
        setProfile(await getProfile());
      }

      const completedProfile = await completeOnboarding();

      if (!completedProfile.onboardingCompletedAt) {
        throw new Error("オンボーディング完了状態を確認できませんでした");
      }

      setProfile(completedProfile.profile);
      setOnboardingCompletedAt(completedProfile.onboardingCompletedAt);

      const reloadedProfile = await reloadProfile();

      if (!reloadedProfile?.onboardingCompletedAt) {
        throw new Error("オンボーディング完了状態を確認できませんでした");
      }

      router.replace("/");
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "オンボーディングを完了できませんでした")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-12"
        keyboardShouldPersistTaps="handled"
        onTouchStart={() => Keyboard.dismiss()}
      >
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-gray-950">
              プロフィール登録
            </Text>
            <Text className="text-sm leading-5 text-gray-600">
              募集や応募で相手に表示される内容を登録してください。
            </Text>
            {errorMessage ? (
              <Text className="text-sm text-red-500">{errorMessage}</Text>
            ) : null}
          </View>

          <ProfileEditForm
            profile={profile}
            isSubmitting={isSubmitting}
            canSubmitExtra={canComplete}
            genderOptions={["male", "female", "other"]}
            submitLabel="始める"
            extraContent={
              <View className="gap-3">
                <View className="gap-1">
                  <FieldLabel label="プロフィール画像" required />
                  <Text className="text-xs leading-5 text-gray-500">
                    安心してつながれるよう、本人の雰囲気や顔がわかる写真がおすすめです。
                  </Text>
                </View>
                <Pressable
                  className="aspect-square w-36 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-gray-50"
                  style={{
                    backgroundColor: colors.stateSoft,
                    borderColor: colors.state,
                  }}
                  disabled={isSubmitting}
                  onPress={handlePickPhoto}
                >
                  {photoPreviewUri ? (
                    <Image
                      source={{ uri: photoPreviewUri }}
                      className="h-full w-full"
                    />
                  ) : (
                    <Text className="text-3xl" style={{ color: colors.state }}>
                      +
                    </Text>
                  )}
                </Pressable>
                <Button
                  mode="outlined"
                  compact
                  disabled={isSubmitting}
                  textColor={colors.state}
                  style={{ borderColor: colors.state, alignSelf: "flex-start" }}
                  onPress={handlePickPhoto}
                >
                  画像を選択
                </Button>
              </View>
            }
            onSubmit={handleSubmit}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
