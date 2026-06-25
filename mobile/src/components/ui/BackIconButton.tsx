import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable } from "react-native";

type Props = {
  onPress: () => void;
};

export function BackIconButton({ onPress }: Props) {
  return (
    <Pressable
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: "#F3F4F6" }}
      onPress={onPress}
    >
      <FontAwesome name="angle-left" size={24} color="#111827" />
    </Pressable>
  );
}
