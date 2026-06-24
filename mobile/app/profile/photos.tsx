import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteProfilePhoto,
  getProfile,
  uploadProfilePhoto,
} from "@/src/api/profile";
import { PhotoEditView } from "@/src/components/profile/PhotoEditView";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { colors } from "@/src/constants/colors";
import { useProfile } from "@/src/hooks/useProfile";
import type { ProfilePhoto, UploadProfilePhotoParams } from "@/src/types/profile";
import { errorMessageFromError } from "@/src/utils/profile";

export default function ProfilePhotosScreen() {
  const {
    profile,
    setProfile,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useProfile();
  const [isPhotoUpdating, setIsPhotoUpdating] = useState(false);

  async function handleAddPhoto(photo: UploadProfilePhotoParams) {
    if (!profile || isPhotoUpdating) return;

    setIsPhotoUpdating(true);
    setErrorMessage("");

    try {
      await uploadProfilePhoto(photo);

      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
    } catch (error) {
      setErrorMessage(errorMessageFromError(error, "画像を追加できませんでした"));
    } finally {
      setIsPhotoUpdating(false);
    }
  }

  async function handleDeletePhoto(photo: ProfilePhoto) {
    if (isPhotoUpdating) return;

    setIsPhotoUpdating(true);
    setErrorMessage("");

    try {
      await deleteProfilePhoto(photo.id);
      const updatedProfile = await getProfile();
      setProfile(updatedProfile);
    } catch (error) {
      setErrorMessage(errorMessageFromError(error, "画像を削除できませんでした"));
    } finally {
      setIsPhotoUpdating(false);
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
              画像編集
            </Text>
            {errorMessage ? (
              <Text className="text-sm text-red-500">{errorMessage}</Text>
            ) : null}
          </View>

          {profile ? (
            <PhotoEditView
              photos={profile.photos}
              isUpdating={isPhotoUpdating}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
              onBack={() => router.back()}
            />
          ) : (
            <Text className="text-base text-gray-600">
              先にプロフィールを作成してください
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
