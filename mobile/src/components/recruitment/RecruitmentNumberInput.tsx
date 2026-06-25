import { Text, TextInput, View } from "react-native";

import { colors } from "@/src/constants/colors";

type Props = {
  label: string;
  helperText?: string;
  value: string;
  onChangeText: (text: string) => void;
};

export function RecruitmentNumberInput({
  label,
  helperText,
  value,
  onChangeText,
}: Props) {
  return (
    <View className="flex-1 gap-2">
      <View>
        <Text className="text-xs font-bold text-gray-500">{label}</Text>
        {helperText ? (
          <Text className="mt-0.5 text-xs text-gray-400">{helperText}</Text>
        ) : null}
      </View>
      <TextInput
        className="rounded-lg border px-4 py-3 text-base text-gray-900"
        style={{ borderColor: colors.inputBorder }}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
