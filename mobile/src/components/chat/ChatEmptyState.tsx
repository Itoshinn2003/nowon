import { Text, View } from "react-native";

export function ChatEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <Text className="text-base font-bold text-gray-900">
        チャットはまだありません
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-500">
        募集への参加やメッセージが始まるとここに表示されます。
      </Text>
    </View>
  );
}
