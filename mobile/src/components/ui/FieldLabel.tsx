import { Text, View } from "react-native";

type Props = {
  label: string;
  required?: boolean;
};

export function FieldLabel({ label, required = false }: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      {required ? (
        <Text className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-bold text-red-600">
          必須
        </Text>
      ) : null}
    </View>
  );
}
