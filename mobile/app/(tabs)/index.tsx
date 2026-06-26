import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type LatLng,
} from "react-native-maps";

import { DraftRecruitmentPin } from "@/src/components/map/DraftRecruitmentPin";
import { LocationSelectionCard } from "@/src/components/map/LocationSelectionCard";
import {
  MapFilterSheet,
  type MapFilterCategory,
  type MapFilterGender,
} from "@/src/components/map/MapFilterSheet";
import { colors } from "@/src/constants/colors";
import { useRecruitments } from "@/src/hooks/useRecruitments";

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

export default function MapScreen() {
  const { recruitments, reloadRecruitments } = useRecruitments();
  // 条件コンポーネントを表示しているか
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MapFilterCategory>("all");
  const [selectedGender, setSelectedGender] = useState<MapFilterGender>("all");
  // 地図をタッチして座標を出しているか
  const [selectedCoordinate, setSelectedCoordinate] = useState<LatLng | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      reloadRecruitments();
    }, [reloadRecruitments])
  );

  return (
    <View className="flex-1 bg-white">
      <MapView
        provider={PROVIDER_GOOGLE}
        customMapStyle={minimalMapStyle}
        style={{ flex: 1 }}
        onPress={(event) => setSelectedCoordinate(event.nativeEvent.coordinate)}
        initialRegion={{
          latitude: 35.681236,
          longitude: 139.767125,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={true}
      >
        {recruitments.map((recruitment) => {
          const latitude = Number(recruitment.latitude);
          const longitude = Number(recruitment.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return (
            <Marker
              key={`recruitment-${recruitment.id}`}
              coordinate={{ latitude, longitude }}
              title={recruitment.purpose}
              description={recruitment.vibe}
            />
          );
        })}

        {selectedCoordinate ? (
          <Marker
            key={`draft-${selectedCoordinate.latitude}-${selectedCoordinate.longitude}`}
            coordinate={selectedCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
          >
            <DraftRecruitmentPin />
          </Marker>
        ) : null}
      </MapView>

      {/* 右上のフィルタボタン */}
      <Pressable
        className="absolute right-5 top-14 h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-md"
        onPress={() => setIsFilterVisible(true)}
      >
        <FontAwesome name="sliders" size={18} color={colors.textPrimary} />
      </Pressable>

      {/* その下のボタン */}
      <Pressable className="absolute right-5 top-32 h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-md">
        <FontAwesome name="location-arrow" size={18} color={colors.state} />
      </Pressable>

      {/* 募集を立てますか？カード */}
      <LocationSelectionCard
        coordinate={selectedCoordinate}
        onRequestCancel={() => setSelectedCoordinate(null)}
      />

      {/* フィルターカード */}
      <MapFilterSheet
        visible={isFilterVisible}
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        onApply={(filters) => {
          setSelectedCategory(filters.category);
          setSelectedGender(filters.gender);
        }}
        onClose={() => setIsFilterVisible(false)}
      />
    </View>
  );
}
