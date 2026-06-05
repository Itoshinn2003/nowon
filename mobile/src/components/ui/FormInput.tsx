import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isValid?: boolean;
  errorMessage?: string;
};

export function FormInput({
  label,
  value,
  onChangeText,
  isValid = true,
  errorMessage,
  className,
  secureTextEntry,
  autoComplete,
  importantForAutofill,
  textContentType,
  ...textInputProps
}: Props) {
  const defaultAutoComplete = secureTextEntry ? "off" : autoComplete;
  const defaultImportantForAutofill = secureTextEntry
    ? "no"
    : importantForAutofill;
  const defaultTextContentType = secureTextEntry
    ? "oneTimeCode"
    : textContentType;

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>

      <TextInput
        className={[
          "rounded-lg border px-4 py-3 text-base text-gray-900",
          isValid ? "border-gray-300" : "border-red-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        autoComplete={defaultAutoComplete}
        importantForAutofill={defaultImportantForAutofill}
        textContentType={defaultTextContentType}
        {...textInputProps}
      />

      {!isValid && errorMessage ? (
        <Text className="text-sm text-red-500">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
