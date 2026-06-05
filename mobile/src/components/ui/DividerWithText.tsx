import { Text, View } from "react-native";

export function DividerWithText() {
  return (
    <View className="mt-4 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-gray-200" />
      <Text className="text-sm text-gray-500">または</Text>
      <View className="h-px flex-1 bg-gray-200" />
    </View>
  );
}
