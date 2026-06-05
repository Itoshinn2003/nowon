import { Pressable, Text } from "react-native";

type Props = {
  prompt: string;
  actionText: string;
  onPress: () => void;
};

export function AuthSwitchLink({ prompt, actionText, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Text className="text-center text-sm text-gray-600">
        {prompt}
        <Text className="font-bold text-blue-600"> {actionText}</Text>
      </Text>
    </Pressable>
  );
}
