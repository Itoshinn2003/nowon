import { Text, View } from "react-native";

import { colors } from "@/src/constants/colors";

type DetailRowProps = {
  label: string;
  value: string;
};

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View
      className="gap-1 border-b pb-3"
      style={{ borderBottomColor: colors.border }}
    >
      <Text className="text-sm font-medium text-gray-500">{label}</Text>
      <Text className="text-base text-gray-900">{value}</Text>
    </View>
  );
}
