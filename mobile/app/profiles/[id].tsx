import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";
import { useUserProfile } from "@/src/hooks/useProfile";
import type {
  ProfileGender,
  ProfilePhoto,
  UserProfile,
} from "@/src/types/profile";

const GENDER_LABELS: Record<ProfileGender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
  no_answer: "未回答",
};

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
      ) : profile ? (
        <ProfileDetail profile={profile} />
      ) : (
        <EmptyProfile />
      )}
    </SafeAreaView>
  );
}

function ProfileDetail({ profile }: { profile: UserProfile }) {
  const { width } = useWindowDimensions();
  const mainPhoto =
    profile.photos.find((photo) => photo.url) ?? profile.photos[0];
  const photoGap = 2;
  const photoGridWidth = width - 32;
  const photoSize = Math.floor((photoGridWidth - photoGap * 2) / 3);

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pb-8 pt-4"
      showsVerticalScrollIndicator={false}
    >
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

        {profile.photos.length > 0 ? (
          <View
            className="flex-row flex-wrap"
            style={{ gap: photoGap }}
          >
            {profile.photos.map((photo) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                size={photoSize}
              />
            ))}
          </View>
        ) : (
          <View className="py-6">
            <Text className="text-center text-sm text-gray-500">
              公開中の写真はありません
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function EmptyProfile() {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6">
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
        このユーザーはまだプロフィールを登録していません
      </Text>
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
  if (photo?.url) {
    return (
      <Image
        source={{ uri: photo.url }}
        className="h-32 w-32 rounded-full"
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
  return (
    <View
      className="overflow-hidden bg-gray-100"
      style={{ height: size, width: size }}
    >
      {photo.url ? (
        <Image
          source={{ uri: photo.url }}
          className="h-full w-full"
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

function numberFromParam(value: string | undefined) {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
