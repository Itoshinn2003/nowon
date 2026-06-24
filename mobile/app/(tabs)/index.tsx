import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo, useState } from "react";
import { DestinationPin } from "@/src/components/map/DestinationPin";
import { Modal, Pressable, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { colors } from "@/src/constants/colors";

const minimalMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#F8EEDF" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#4C5C57" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#FFF9F1" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2F433B" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#AEE3A4" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2F6B38" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFF9F0" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#FFD97A" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ visibility: "simplified" }, { color: "#FFF5E8" }],
  },
  {
    featureType: "road.local",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#FFFCF6" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8A8175" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#D7C6AF" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#315C78" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#99DEF7" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#267493" }],
  },
];

const japaneseDatingProfileImage = require("../../assets/images/dating-profile-japanese-man.png");
const japaneseDatingProfileWomanImage = require("../../assets/images/dating-profile-japanese-woman.png");
const japaneseDatingProfileLiveImage = require("../../assets/images/dating-profile-japanese-man-live.png");

type FilterCategory = "all" | "drink" | "live";
type FilterGender = "all" | "male" | "female";

const mockDestinationPins = [
  {
    id: "marunouchi-drink",
    category: "drink" as const,
    gender: "male" as const,
    coordinate: {
      latitude: 35.68272,
      longitude: 139.76487,
    },
    imageSource: japaneseDatingProfileImage,
    remainingRatio: 0.78,
  },
  {
    id: "yaesu-live",
    category: "live" as const,
    gender: "male" as const,
    coordinate: {
      latitude: 35.67969,
      longitude: 139.77149,
    },
    imageSource: japaneseDatingProfileLiveImage,
    remainingRatio: 0.46,
  },
  {
    id: "nihonbashi-drink",
    category: "drink" as const,
    gender: "female" as const,
    coordinate: {
      latitude: 35.68498,
      longitude: 139.77406,
    },
    imageSource: japaneseDatingProfileWomanImage,
    remainingRatio: 0.25,
  },
];

export default function TabOneScreen() {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");
  const [selectedGender, setSelectedGender] = useState<FilterGender>("all");

  const filteredPins = useMemo(
    () =>
      mockDestinationPins.filter((pin) => {
        const matchesCategory =
          selectedCategory === "all" || pin.category === selectedCategory;
        const matchesGender =
          selectedGender === "all" || pin.gender === selectedGender;

        return matchesCategory && matchesGender;
      }),
    [selectedCategory, selectedGender]
  );

  const activeFilterCount = [
    selectedCategory !== "all",
    selectedGender !== "all",
  ].filter(Boolean).length;

  function resetFilters() {
    setSelectedCategory("all");
    setSelectedGender("all");
  }

  return (
    <View className="flex-1 bg-white">
      <MapView
        provider={PROVIDER_GOOGLE}
        customMapStyle={minimalMapStyle}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 35.681236,
          longitude: 139.767125,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
      >
        {filteredPins.map((pin) => (
          <Marker
            key={`${pin.id}-dating-profile-v2`}
            coordinate={pin.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
          >
            <DestinationPin
              category={pin.category}
              imageSource={pin.imageSource}
              remainingRatio={pin.remainingRatio}
            />
          </Marker>
        ))}
      </MapView>

      <View className="absolute left-5 top-14 rounded-full bg-white/95 px-5 py-3 shadow-md">
        <Text className="text-xs font-bold text-gray-500">東京駅周辺</Text>
        <View className="flex-row items-center gap-2">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#38D996" }}
          />
          <Text className="text-lg font-bold text-gray-950">
            いま近くにいる
          </Text>
        </View>
      </View>

      <Pressable
        className="absolute right-5 top-14 h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-md"
        onPress={() => setIsFilterVisible(true)}
      >
        <FontAwesome name="sliders" size={18} color={colors.textPrimary} />
        {activeFilterCount > 0 ? (
          <View
            className="absolute -right-1 -top-1 h-6 min-w-6 items-center justify-center rounded-full px-1"
            style={{ backgroundColor: "#FFB020" }}
          >
            <Text className="text-xs font-bold text-white">
              {activeFilterCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <Pressable className="absolute right-5 top-32 h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-md">
        <FontAwesome name="location-arrow" size={18} color={colors.state} />
      </Pressable>

      <View className="absolute bottom-8 left-5 right-5 rounded-[28px] bg-white/95 p-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <View
                className="h-7 rounded-full px-3 items-center justify-center"
                style={{ backgroundColor: "#E9FFF4" }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: "#16885F" }}
                >
                  LIVE
                </Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                近くで募集中
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              条件に合う東京駅周辺の募集
            </Text>
          </View>

          <View
            className="h-12 min-w-12 items-center justify-center rounded-full px-3"
            style={{ backgroundColor: "#111827" }}
          >
            <Text className="text-base font-bold text-white">
              {filteredPins.length}
            </Text>
          </View>
        </View>
      </View>

      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <Pressable
            className="flex-1"
            onPress={() => setIsFilterVisible(false)}
          />
          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-4">
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-gray-950">
                  条件で絞る
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  表示する募集を絞り込みます
                </Text>
              </View>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                onPress={() => setIsFilterVisible(false)}
              >
                <FontAwesome name="close" size={16} color="#374151" />
              </Pressable>
            </View>

            <FilterSection title="カテゴリ">
              {[
                { label: "すべて", value: "all" },
                { label: "飲み", value: "drink" },
                { label: "ライブ", value: "live" },
              ].map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isSelected={selectedCategory === option.value}
                  onPress={() =>
                    setSelectedCategory(option.value as FilterCategory)
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="性別">
              {[
                { label: "すべて", value: "all" },
                { label: "男性", value: "male" },
                { label: "女性", value: "female" },
              ].map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isSelected={selectedGender === option.value}
                  onPress={() =>
                    setSelectedGender(option.value as FilterGender)
                  }
                />
              ))}
            </FilterSection>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-xl border py-3"
                style={{ borderColor: colors.inputBorder }}
                onPress={resetFilters}
              >
                <Text className="font-bold text-gray-900">リセット</Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-xl py-3"
                style={{ backgroundColor: colors.textPrimary }}
                onPress={() => setIsFilterVisible(false)}
              >
                <Text className="font-bold text-white">適用する</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
};

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View className="gap-3 border-t border-gray-100 py-4">
      <Text className="text-sm font-bold text-gray-700">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

type FilterChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
  return (
    <Pressable
      className="rounded-full border px-4 py-2"
      style={{
        backgroundColor: isSelected ? colors.stateSoft : colors.surface,
        borderColor: isSelected ? colors.state : colors.inputBorder,
      }}
      onPress={onPress}
    >
      <Text
        className="text-sm font-bold"
        style={{ color: isSelected ? colors.state : colors.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
