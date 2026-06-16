import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 border-b border-gray-100 px-4 pb-3 pt-2">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          onPress={() => router.back()}
        >
          <FontAwesome name="angle-left" size={24} color="#111827" />
        </Pressable>

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
        <Text className="text-base font-bold text-gray-900">
          メッセージ画面
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          UIとメッセージ連携は後で作り込みます。
        </Text>
      </View>

      <View className="border-t border-gray-100 px-4 py-3">
        <View className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
          <TextInput
            className="min-h-9 flex-1 text-base text-gray-900"
            placeholder="メッセージを入力"
            placeholderTextColor="#9CA3AF"
          />
          <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-blue-600">
            <FontAwesome name="send" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
