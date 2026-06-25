import { Text, TextInput, View } from "react-native";

import { colors } from "@/src/constants/colors";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  keyboardType?: "default" | "number-pad";
  multiline?: boolean;
};

export function RecruitmentTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  keyboardType = "default",
  multiline = false,
}: Props) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        className={[
          "rounded-lg border px-4 py-3 text-base text-gray-900",
          multiline ? "min-h-24" : "",
        ].join(" ")}
        style={{ borderColor: colors.inputBorder }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        maxLength={maxLength}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {maxLength ? (
        <Text className="text-right text-xs text-gray-500">
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}
