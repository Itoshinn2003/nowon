import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import type { UploadProfilePhotoParams } from "@/src/types/profile";
import { fileNameFromUri, mimeTypeFromUri } from "@/src/utils/profile";

export async function pickProfilePhoto(): Promise<UploadProfilePhotoParams | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("写真へのアクセスを許可してください");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.9,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    name: asset.fileName ?? fileNameFromUri(asset.uri),
    type: asset.mimeType ?? mimeTypeFromUri(asset.uri),
  };
}
