import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { LatLng } from "react-native-maps";

import { colors } from "@/src/constants/colors";

type Props = {
  coordinate: LatLng | null;
  onRequestCancel: () => void;
};

export function LocationSelectionCard({
  coordinate,
  onRequestCancel,
}: Props) {
  if (!coordinate) {
    return null;
  }

  const selectedCoordinate = coordinate;

  function handleCancelPress() {
    onRequestCancel();
  }

  function handleCreatePress(recruitmentType: "one_to_one" | "group") {
    router.push({
      pathname: "/recruitments/new",
      params: {
        recruitmentType,
        latitude: selectedCoordinate.latitude.toString(),
        longitude: selectedCoordinate.longitude.toString(),
      },
    });
  }

  return (
    <View
      className="absolute bottom-[92px] left-4 right-4 rounded-[28px] bg-white/95 px-4 pb-4 pt-3 shadow-sm"
      style={{
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { height: 8, width: 0 },
      }}
    >
      <View className="items-center">
        <View className="h-1 w-10 rounded-full bg-gray-200" />
      </View>

      <View className="mt-4 flex-row items-start gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.stateSoft }}
        >
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: colors.state }}
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-lg font-extrabold text-gray-950">
            この場所で募集
          </Text>
          <Text className="mt-1 text-sm leading-5 text-gray-500">
            集まり方を選んで、募集内容を作成します。
          </Text>
        </View>

        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          onPress={handleCancelPress}
        >
          <FontAwesome name="close" size={14} color="#6B7280" />
        </Pressable>
      </View>

      <View className="mt-5 flex-row gap-3">
        <RecruitmentTypeButton
          icon="user"
          label="1対1"
          onPress={() => handleCreatePress("one_to_one")}
        />
        <RecruitmentTypeButton
          icon="users"
          label="グループ"
          onPress={() => handleCreatePress("group")}
        />
      </View>
    </View>
  );
}

type RecruitmentTypeButtonProps = {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: string;
  onPress: () => void;
};

function RecruitmentTypeButton({
  icon,
  label,
  onPress,
}: RecruitmentTypeButtonProps) {
  return (
    <Pressable
      className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full"
      style={{ backgroundColor: colors.textPrimary }}
      onPress={onPress}
    >
      <FontAwesome name={icon} size={14} color="#FFFFFF" />
      <Text className="text-sm font-bold text-white">{label}</Text>
    </Pressable>
  );
}
