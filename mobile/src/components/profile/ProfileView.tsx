import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { DetailRow } from "@/src/components/ui/DetailRow";
import { colors } from "@/src/constants/colors";
import type { ProfileGender, UserProfile } from "@/src/types/profile";
const MUTED_BACKGROUND = "#F3F4F6";

const GENDER_LABELS: Record<ProfileGender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
  no_answer: "未回答",
};

type Props = {
  profile: UserProfile | null;
};

export function ProfileView({ profile }: Props) {
  const mainPhoto = profile?.photos[0];

  return (
    <View className="gap-6">
      <View
        className="gap-5 rounded-lg border bg-white p-5"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-center gap-4">
          {mainPhoto?.url ? (
            <Image
            source={{ uri: mainPhoto.url }}
            className="h-24 w-24 rounded-full border-4"
            style={{ borderColor: "white" }}
          />
        ) : (
          <View
            className="h-24 w-24 items-center justify-center rounded-full border-4"
            style={{
                  backgroundColor: MUTED_BACKGROUND,
                  borderColor: colors.surface,
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: "#6B7280" }}
              >
                画像なし
              </Text>
            </View>
          )}

          <View className="flex-1 gap-2">
            <Text className="text-2xl font-bold text-gray-900">
              {profile?.nickname || "ニックネーム未設定"}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor: profile
                    ? colors.stateSoft
                    : colors.warningSoft,
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{
                    color: profile ? colors.state : colors.warningText,
                  }}
                >
                  {profile ? "公開中" : "未設定"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View
        className="gap-3 rounded-lg border bg-white p-5"
        style={{ borderColor: colors.border }}
      >
        <DetailRow
          label="年齢"
          value={profile ? `${profile.age}歳` : "未設定"}
        />
        <DetailRow
          label="性別"
          value={profile ? GENDER_LABELS[profile.gender] : "未設定"}
        />
        <DetailRow label="一言" value={profile?.bio || "未設定"} />
      </View>

      <View
        className="gap-3 rounded-lg border bg-white p-4"
        style={{ borderColor: colors.border }}
      >
        <Button
          mode="contained"
          buttonColor={colors.textPrimary}
          onPress={() => router.push("/profile/edit")}
        >
          プロフィール編集
        </Button>
        <Button
          mode="outlined"
          disabled={!profile}
          textColor={colors.textPrimary}
          style={{ borderColor: colors.inputBorder, backgroundColor: colors.surface }}
          onPress={() => router.push("/profile/photos")}
        >
          画像編集
        </Button>
      </View>
    </View>
  );
}
