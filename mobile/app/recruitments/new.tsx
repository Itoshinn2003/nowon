import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/src/constants/colors";

export default function RecruitmentNewScreen() {
  const { latitude, longitude } = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
  }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        className="mx-4 mt-2 flex-row items-center gap-3 rounded-lg border bg-white px-3 py-3"
        style={{ borderColor: colors.border }}
      >
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "#F3F4F6" }}
          onPress={() => router.back()}
        >
          <FontAwesome name="angle-left" size={24} color="#111827" />
        </Pressable>

        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            募集作成
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            選択した場所から募集を作成します
          </Text>
        </View>
      </View>

      <View className="flex-1 px-4 pt-6">
        <View
          className="rounded-[20px] border bg-white p-4"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-xs font-bold text-gray-500">集合候補地</Text>
          <Text className="mt-2 text-xl font-bold text-gray-950">
            選択した場所
          </Text>
          <Text className="mt-2 text-sm leading-5 text-gray-500">
            募集内容の入力フォームは後で実装します。今は地図から渡された座標を確認できる状態です。
          </Text>

          <View className="mt-5 gap-2">
            <CoordinateRow label="latitude" value={latitude ?? "-"} />
            <CoordinateRow label="longitude" value={longitude ?? "-"} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type CoordinateRowProps = {
  label: string;
  value: string;
};

function CoordinateRow({ label, value }: CoordinateRowProps) {
  return (
    <View
      className="flex-row items-center justify-between rounded-xl border px-3 py-3"
      style={{ borderColor: colors.border, backgroundColor: "#FAFAF8" }}
    >
      <Text className="text-sm font-bold text-gray-500">{label}</Text>
      <Text className="text-sm font-bold text-gray-900">{value}</Text>
    </View>
  );
}
