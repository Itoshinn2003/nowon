import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
  type MapFilterRecruitmentType,
} from "@/src/components/map/MapFilterSheet";
import { colors } from "@/src/constants/colors";
import { minimalMapStyle } from "@/src/constants/map";
import { useRecruitmentCategories } from "@/src/hooks/useRecruitmentCategories";
import {
  useMyRecruitments,
  useRecruitments,
} from "@/src/hooks/useRecruitments";

export default function MapScreen() {
  const { categories } = useRecruitmentCategories();
  const { recruitments, reloadRecruitments } = useRecruitments({
    loadOnMount: false,
  });
  const {
    recruitments: myRecruitments,
    reloadRecruitments: reloadMyRecruitments,
  } = useMyRecruitments({
    loadOnMount: false,
  });
  // 条件コンポーネントを表示しているか
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MapFilterCategory>("all");
  const [selectedGender, setSelectedGender] = useState<MapFilterGender>("all");
  const [selectedRecruitmentType, setSelectedRecruitmentType] =
    useState<MapFilterRecruitmentType>("all");
  // 地図をタッチして座標を出しているか
  const [selectedCoordinate, setSelectedCoordinate] = useState<LatLng | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      async function loadRecruitments() {
        await reloadRecruitments();
        await reloadMyRecruitments();
      }

      loadRecruitments();
    }, [reloadMyRecruitments, reloadRecruitments])
  );

  const hasActiveRecruitment = myRecruitments.length > 0;
  const filteredRecruitments = useMemo(
    () =>
      recruitments.filter((recruitment) => {
        if (
          selectedCategory !== "all" &&
          recruitment.recruitment_category_id !== selectedCategory
        ) {
          return false;
        }

        if (
          selectedGender === "male" &&
          recruitment.allowed_gender_policy === "female_only"
        ) {
          return false;
        }

        if (
          selectedGender === "female" &&
          recruitment.allowed_gender_policy === "male_only"
        ) {
          return false;
        }

        if (
          selectedRecruitmentType !== "all" &&
          recruitment.recruitment_type !== selectedRecruitmentType
        ) {
          return false;
        }

        return true;
      }),
    [recruitments, selectedCategory, selectedGender, selectedRecruitmentType]
  );

  useEffect(() => {
    if (hasActiveRecruitment) {
      setSelectedCoordinate(null);
    }
  }, [hasActiveRecruitment]);

  return (
    <View className="flex-1 bg-white">
      <MapView
        provider={PROVIDER_GOOGLE}
        customMapStyle={minimalMapStyle}
        style={{ flex: 1 }}
        onPress={(event) => {
          if (hasActiveRecruitment) return;

          setSelectedCoordinate(event.nativeEvent.coordinate);
        }}
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
        {filteredRecruitments.map((recruitment) => {
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

        {selectedCoordinate && !hasActiveRecruitment ? (
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
      {!hasActiveRecruitment ? (
        <LocationSelectionCard
          coordinate={selectedCoordinate}
          onRequestCancel={() => setSelectedCoordinate(null)}
        />
      ) : null}

      <View
        className="absolute bottom-6 left-4 right-4 rounded-lg border bg-white/95 px-4 py-3 shadow-sm"
        style={{ borderColor: colors.border }}
      >
        <Text className="text-center text-sm font-bold text-gray-900">
          地図をタッチして募集を立ててみよう！
        </Text>
      </View>

      {/* フィルターカード */}
      <MapFilterSheet
        visible={isFilterVisible}
        categories={categories}
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        selectedRecruitmentType={selectedRecruitmentType}
        onApply={(filters) => {
          setSelectedCategory(filters.category);
          setSelectedGender(filters.gender);
          setSelectedRecruitmentType(filters.recruitmentType);
        }}
        onClose={() => setIsFilterVisible(false)}
      />
    </View>
  );
}
