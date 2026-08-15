import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";
import type { ImageErrorEvent } from "react-native";
import { Button } from "react-native-paper";

import { colors } from "@/src/constants/colors";
import type {
  ProfileGender,
  ProfilePhoto,
  UserProfile,
} from "@/src/types/profile";
import {
  appendImageRetryParam,
  logProfileImageError,
  logProfileImageLoad,
  PROFILE_IMAGE_RETRY_LIMIT,
} from "@/src/utils/imageDiagnostics";

const GENDER_LABELS: Record<ProfileGender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
  no_answer: "未回答",
};

type Props = {
  profile: UserProfile | null;
  showOwnerActions?: boolean;
  onLogout?: () => void;
};

export function ProfileView({
  profile,
  showOwnerActions = false,
  onLogout,
}: Props) {
  const { width } = useWindowDimensions();
  const mainPhoto = profile?.photos[0];
  const galleryPhotos = profile?.photos.slice(1) ?? [];
  const photoGap = 2;
  const photoGridWidth = width - 32;
  const photoSize = Math.floor((photoGridWidth - photoGap * 2) / 3);

  if (!profile) {
    return (
      <View className="items-center justify-center gap-4 py-20">
        <View
          className="h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.stateSoft }}
        >
          <FontAwesome name="user" size={24} color={colors.state} />
        </View>
        <Text className="text-center text-base font-bold text-gray-950">
          プロフィール未設定
        </Text>
        <Text className="text-center text-sm leading-6 text-gray-500">
          プロフィールがまだ登録されていません
        </Text>
        {showOwnerActions ? (
          <OwnerActions profile={profile} onLogout={onLogout} />
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-5">
      <View className="items-center gap-3">
        <ProfilePhotoBlock photo={mainPhoto} nickname={profile.nickname} />
        <Text className="text-2xl font-extrabold text-gray-950">
          {profile.nickname}
        </Text>
        <Text className="text-sm text-gray-500">
          {profile.age}歳・{GENDER_LABELS[profile.gender]}
        </Text>
        <Text className="w-full text-center text-sm leading-6 text-gray-700">
          {profile.bio || "未設定"}
        </Text>
      </View>

      {showOwnerActions ? (
        <OwnerActions profile={profile} onLogout={onLogout} />
      ) : null}

      {galleryPhotos.length > 0 ? (
        <View className="flex-row flex-wrap" style={{ gap: photoGap }}>
          {galleryPhotos.map((photo) => (
            <PhotoTile key={photo.id} photo={photo} size={photoSize} />
          ))}
        </View>
      ) : (
        <View className="py-6">
          <Text className="text-center text-sm text-gray-500">
            追加の写真はありません
          </Text>
        </View>
      )}
    </View>
  );
}

function OwnerActions({
  profile,
  onLogout,
}: {
  profile: UserProfile | null;
  onLogout?: () => void;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <Button
          mode="outlined"
          textColor={colors.textPrimary}
          contentStyle={{ height: 44 }}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.inputBorder,
            flex: 1,
            minHeight: 44,
          }}
          onPress={() => router.push("/profile/edit")}
        >
          プロフィール編集
        </Button>
        <Button
          mode="outlined"
          disabled={!profile}
          textColor={colors.textPrimary}
          contentStyle={{ height: 44 }}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.inputBorder,
            flex: 1,
            minHeight: 44,
          }}
          onPress={() => router.push("/profile/photos")}
        >
          画像編集
        </Button>
      </View>

      {onLogout ? (
        <Button
          mode="outlined"
          textColor="#DC2626"
          style={{ borderColor: "#FCA5A5", backgroundColor: colors.surface }}
          onPress={onLogout}
        >
          ログアウト
        </Button>
      ) : null}
    </View>
  );
}

function ProfilePhotoBlock({
  photo,
  nickname,
}: {
  photo?: ProfilePhoto;
  nickname: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const [retryToken, setRetryToken] = useState<number | null>(null);
  const retryAttempt = retryToken ? 1 : 0;

  useEffect(() => {
    setHasImageError(false);
    setRetryToken(null);
  }, [photo?.url]);

  if (photo?.url && !hasImageError) {
    const imageUrl = retryToken
      ? appendImageRetryParam(photo.url, retryToken)
      : photo.url;

    function handleError(event: ImageErrorEvent) {
      const willRetry = retryAttempt < PROFILE_IMAGE_RETRY_LIMIT;

      logProfileImageError({
        context: {
          attempt: retryAttempt,
          component: "ProfilePhotoBlock",
          photoId: photo?.id,
          url: photo?.url ?? "",
        },
        event,
        willRetry,
      });

      if (willRetry) {
        setRetryToken(Date.now());
        return;
      }

      setHasImageError(true);
    }

    return (
      <Image
        source={{ uri: imageUrl }}
        className="h-32 w-32 rounded-full"
        onError={handleError}
        onLoad={() =>
          logProfileImageLoad({
            attempt: retryAttempt,
            component: "ProfilePhotoBlock",
            photoId: photo.id,
            url: photo.url ?? "",
          })
        }
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      className="h-32 w-32 items-center justify-center rounded-full"
      style={{ backgroundColor: colors.stateSoft }}
    >
      <Text className="text-3xl font-extrabold" style={{ color: colors.state }}>
        {nickname.charAt(0) || "?"}
      </Text>
    </View>
  );
}

function PhotoTile({ photo, size }: { photo: ProfilePhoto; size: number }) {
  const [hasImageError, setHasImageError] = useState(false);
  const [retryToken, setRetryToken] = useState<number | null>(null);
  const retryAttempt = retryToken ? 1 : 0;

  useEffect(() => {
    setHasImageError(false);
    setRetryToken(null);
  }, [photo.url]);

  function handleError(event: ImageErrorEvent) {
    const willRetry = retryAttempt < PROFILE_IMAGE_RETRY_LIMIT;

    logProfileImageError({
      context: {
        attempt: retryAttempt,
        component: "ProfilePhotoTile",
        photoId: photo.id,
        url: photo.url ?? "",
      },
      event,
      willRetry,
    });

    if (willRetry) {
      setRetryToken(Date.now());
      return;
    }

    setHasImageError(true);
  }

  const imageUrl =
    photo.url && retryToken
      ? appendImageRetryParam(photo.url, retryToken)
      : photo.url;

  return (
    <View
      className="overflow-hidden bg-gray-100"
      style={{ height: size, width: size }}
    >
      {imageUrl && !hasImageError ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          onError={handleError}
          onLoad={() =>
            logProfileImageLoad({
              attempt: retryAttempt,
              component: "ProfilePhotoTile",
              photoId: photo.id,
              url: photo.url ?? "",
            })
          }
          resizeMode="cover"
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <FontAwesome name="image" size={18} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
}
