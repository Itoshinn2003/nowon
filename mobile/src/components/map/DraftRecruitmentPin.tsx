import FontAwesome from "@expo/vector-icons/FontAwesome";
import { View } from "react-native";

export function DraftRecruitmentPin() {
  return (
    <View className="items-center justify-center opacity-95">
      <View
        className="h-[50px] w-[50px] items-center justify-center rounded-full border-2"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "#0891B2",
          borderStyle: "dashed",
        }}
      >
        <View
          className="h-[34px] w-[34px] items-center justify-center rounded-full border bg-white"
          style={{ borderColor: "#E5E7EB" }}
        >
          <FontAwesome name="plus" size={16} color="#0891B2" />
        </View>
      </View>
    </View>
  );
}
