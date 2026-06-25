import { Text, View } from "react-native";

import { colors } from "@/src/constants/colors";

type Props = {
  label: string;
  value: string;
};

export function CoordinateRow({ label, value }: Props) {
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
