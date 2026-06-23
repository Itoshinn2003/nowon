import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DestinationPin } from "@/src/components/map/DestinationPin";
import { Pressable, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const minimalMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#F2F0E8" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#5F645F" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#F8F7F2" }],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3F4742" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#E7EAD9" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#E3E7D4" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6F7B68" }],
  },
  {
    featureType: "poi.business",
    elementType: "labels.icon",
    stylers: [{ saturation: -45 }, { lightness: 5 }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#CFE0B5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#49664B" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#F6C16A" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#E0A84F" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#FBFAF6" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6B6F68" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#1D4E89" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#9AADC0" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#A9D6E5" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2C6E8F" }],
  },
];

const japaneseDatingProfileImage = require("../../assets/images/dating-profile-japanese-man.png");
const japaneseDatingProfileWomanImage = require("../../assets/images/dating-profile-japanese-woman.png");
const japaneseDatingProfileLiveImage = require("../../assets/images/dating-profile-japanese-man-live.png");

const mockDestinationPins = [
  {
    id: "marunouchi-drink",
    category: "drink" as const,
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
    coordinate: {
      latitude: 35.68498,
      longitude: 139.77406,
    },
    imageSource: japaneseDatingProfileWomanImage,
    remainingRatio: 0.25,
  },
];

export default function TabOneScreen() {
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
        {mockDestinationPins.map((pin) => (
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

      <View className="absolute left-5 right-5 top-14 gap-3">
        <View className="h-12 flex-row items-center gap-3 rounded-2xl bg-white/95 px-4 shadow-md">
          <FontAwesome name="search" size={16} color="#667085" />
          <Text className="flex-1 text-base text-gray-500">
            エリア・目的で探す
          </Text>
          <Pressable className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <FontAwesome name="sliders" size={14} color="#111827" />
          </Pressable>
        </View>

        <View className="flex-row gap-2">
          {[
            { label: "今日", active: true },
            { label: "ご飯", active: false },
            { label: "飲み", active: false },
            { label: "ライブ", active: false },
            { label: "カフェ", active: false },
          ].map((category) => (
            <Pressable
              key={category.label}
              className={[
                "rounded-full px-4 py-2 shadow-sm",
                category.active ? "bg-blue-600" : "bg-white/95",
              ].join(" ")}
            >
              <Text
                className={[
                  "text-sm font-semibold",
                  category.active ? "text-white" : "text-gray-800",
                ].join(" ")}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable className="absolute right-5 top-44 h-12 w-12 items-center justify-center rounded-2xl bg-white/95 shadow-md">
        <FontAwesome name="location-arrow" size={18} color="#2563EB" />
      </Pressable>

      <View className="absolute bottom-8 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-lg font-bold text-gray-900">
              近くで募集中
            </Text>
            <Text className="text-sm text-gray-500">
              東京駅周辺のアクティブな募集
            </Text>
          </View>

          <View className="h-11 min-w-11 items-center justify-center rounded-full bg-blue-600 px-3">
            <Text className="text-base font-bold text-white">12</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
