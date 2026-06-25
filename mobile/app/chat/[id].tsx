import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        className="mx-4 mt-2 flex-row items-center gap-3 rounded-lg border bg-white px-3 py-3"
        style={{ borderColor: colors.border }}
      >
        <BackIconButton onPress={() => router.back()} />

        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            チャット
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {id}
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View
          className="rounded-lg border bg-white px-6 py-8"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-center text-base font-bold text-gray-900">
            メッセージ画面
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            UIとメッセージ連携は後で作り込みます。
          </Text>
        </View>
      </View>

      <View className="px-4 pb-3">
        <View
          className="flex-row items-center gap-2 rounded-full border bg-white px-4 py-2"
          style={{ borderColor: colors.border }}
        >
          <TextInput
            className="min-h-9 flex-1 text-base text-gray-900"
            placeholder="メッセージを入力"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.state }}
          >
            <FontAwesome name="send" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
