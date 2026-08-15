import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { Button } from "react-native-paper";

import { colors } from "@/src/constants/colors";
import { DiagnosticProfileImage } from "@/src/components/profile/ProfileImageDiagnostics";
import type {
  ProfilePhoto,
  UploadProfilePhotoParams,
} from "@/src/types/profile";
import { pickProfilePhoto } from "@/src/utils/profilePhotoPicker";

type Props = {
  photos: ProfilePhoto[];
  isUpdating: boolean;
  onAddPhoto: (photo: UploadProfilePhotoParams) => void;
  onDeletePhoto: (photo: ProfilePhoto) => void;
  onBack: () => void;
};

export function PhotoEditView({
  photos,
  isUpdating,
  onAddPhoto,
  onDeletePhoto,
  onBack,
}: Props) {
  async function handleAddPhoto() {
    if (isUpdating) return;

    if (photos.length >= 6) {
      Alert.alert("画像は6枚までです");
      return;
    }

    const photo = await pickProfilePhoto();

    if (photo) {
      onAddPhoto(photo);
    }
  }

  function handleDeletePhoto(photo: ProfilePhoto) {
    if (isUpdating) return;

    Alert.alert("画像を削除しますか？", undefined, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => onDeletePhoto(photo),
      },
    ]);
  }

  return (
    <View
      className="gap-5 rounded-lg border bg-white p-4"
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row flex-wrap gap-3">
        {photos.map((photo) => (
          <View key={photo.id} className="w-[31%] gap-2">
            <View
              className="aspect-square overflow-hidden rounded-lg border bg-gray-100"
              style={{ borderColor: colors.border }}
            >
              {photo.url ? (
                <DiagnosticProfileImage
                  className="h-full w-full"
                  component="PhotoEditView"
                  photo={photo}
                />
              ) : null}
            </View>
            <Button
              mode="text"
              compact
              disabled={isUpdating}
              onPress={() => handleDeletePhoto(photo)}
            >
              削除
            </Button>
          </View>
        ))}

        {photos.length < 6 ? (
          <Pressable
            className="aspect-square w-[31%] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50"
            style={{
              backgroundColor: colors.stateSoft,
              borderColor: colors.state,
            }}
            disabled={isUpdating}
            onPress={handleAddPhoto}
          >
            <Text className="text-3xl" style={{ color: colors.state }}>
              +
            </Text>
          </Pressable>
        ) : null}
      </View>

      {isUpdating ? <ActivityIndicator color={colors.state} /> : null}

      <Button mode="contained" buttonColor={colors.textPrimary} onPress={onBack}>
        完了
      </Button>
    </View>
  );
}
