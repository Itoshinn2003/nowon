import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";

export default function RecruitmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <BackIconButton onPress={() => router.back()} />
        <Text className="text-base font-extrabold text-gray-950">募集詳細</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-4 py-6">
        <View className="rounded-[30px] bg-white px-5 py-5">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.stateSoft }}
          >
            <FontAwesome name="map-marker" size={20} color={colors.state} />
          </View>
          <Text className="mt-4 text-2xl font-extrabold text-gray-950">
            募集詳細ページ
          </Text>
          <Text className="mt-2 text-sm leading-6 text-gray-500">
            募集ID: {id}
          </Text>
          <Text className="mt-4 text-sm leading-6 text-gray-600">
            ここに募集内容、集合場所、応募状況、成立後の情報を表示する想定です。今は遷移確認用のダミーページです。
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
