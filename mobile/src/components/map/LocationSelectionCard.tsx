import { router } from "expo-router";
import { Text, View } from "react-native";
import type { LatLng } from "react-native-maps";
import { Button } from "react-native-paper";

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

  function handleCreatePress() {
    router.push({
      pathname: "/recruitments/new",
      params: {
        latitude: selectedCoordinate.latitude.toString(),
        longitude: selectedCoordinate.longitude.toString(),
      },
    });
  }

  return (
    <View
      className="absolute bottom-[90px] left-4 right-4 rounded-[20px] border bg-white p-4 shadow-sm"
      style={{ borderColor: "#E5E7EB" }}
    >
      <Text className="text-xs font-bold text-gray-500">選択した場所</Text>
      <Text className="mt-1.5 text-xl font-extrabold text-gray-950">
        ここに募集を立てますか？
      </Text>
      <Text className="mt-1.5 text-sm leading-5 text-gray-500">
        選んだ場所を集合候補として、募集内容を作成します。
      </Text>
      <View
        className="mt-3 gap-1 rounded-xl border p-2.5"
        style={{ backgroundColor: "#FAFAF8", borderColor: "#E5E7EB" }}
      >
        <CoordinateText
          label="latitude"
          value={selectedCoordinate.latitude.toFixed(6)}
        />
        <CoordinateText
          label="longitude"
          value={selectedCoordinate.longitude.toFixed(6)}
        />
      </View>

      <View className="mt-4 flex-row gap-3">
        <Button
          mode="outlined"
          className="flex-1"
          textColor="#111827"
          style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
          onPress={handleCancelPress}
        >
          キャンセル
        </Button>
        <Button
          mode="contained"
          className="flex-1"
          buttonColor="#0891B2"
          onPress={handleCreatePress}
        >
          募集を作成
        </Button>
      </View>
    </View>
  );
}

type CoordinateTextProps = {
  label: string;
  value: string;
};

function CoordinateText({ label, value }: CoordinateTextProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs font-bold text-gray-500">{label}</Text>
      <Text className="text-xs font-bold text-gray-900">{value}</Text>
    </View>
  );
}
