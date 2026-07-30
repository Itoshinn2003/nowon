import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, DeviceEventEmitter, Pressable, Text, View } from "react-native";
import MapView, {
  type LatLng,
  type Region,
} from "react-native-maps";

import { LocationPulseMarker } from "@/src/components/map/LocationPulseMarker";
import { LocationSelectionCard } from "@/src/components/map/LocationSelectionCard";
import {
  MapFilterSheet,
  type MapFilterCategory,
  type MapFilterGender,
  type MapFilterRecruitmentType,
} from "@/src/components/map/MapFilterSheet";
import { RecruitmentApplicationCard } from "@/src/components/map/RecruitmentApplicationCard";
import { RecruitmentMapMarker } from "@/src/components/map/RecruitmentMapMarker";
import { createRecruitmentApplication } from "@/src/api/recruitmentApplications";
import { subscribeToRecruitments } from "@/src/api/recruitmentCable";
import { colors } from "@/src/constants/colors";
import { useRecruitmentCategories } from "@/src/hooks/useRecruitmentCategories";
import { useRecruitmentApplications } from "@/src/hooks/useRecruitmentApplications";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import {
  useMyRecruitments,
  useRecruitments,
} from "@/src/hooks/useRecruitments";
import { useProfile } from "@/src/hooks/useProfile";
import type {
  Recruitment,
  RecruitmentBounds,
  RecruitmentCablePayload,
} from "@/src/types/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

const INITIAL_REGION: Region = {
  latitude: 35.681236,
  longitude: 139.767125,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};
const INITIAL_BOUNDS = boundsFromRegion(INITIAL_REGION);
const MAP_RELOAD_DEBOUNCE_MS = 350;

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
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
  const { applications, reloadApplications } = useRecruitmentApplications({
    loadOnMount: false,
  });
  const { profile, reloadProfile } = useProfile({ loadOnMount: false });
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
  const [selectedRecruitment, setSelectedRecruitment] =
    useState<Recruitment | null>(null);
  const [applyErrorMessage, setApplyErrorMessage] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const visibleBoundsRef = useRef<RecruitmentBounds>(INITIAL_BOUNDS);
  const hasCenteredInitialLocationRef = useRef(false);
  const mapReloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const recruitmentSubscriptionRef = useRef<{ close: () => void } | null>(null);
  const {
    isSubmitting,
    startSubmitting,
    finishSubmitting,
  } = useSubmitState();

  const loadMapData = useCallback(async (bounds = visibleBoundsRef.current) => {
    await reloadRecruitments(bounds);
    await reloadMyRecruitments();
    await reloadApplications();
    await reloadProfile();
  }, [
    reloadApplications,
    reloadMyRecruitments,
    reloadProfile,
    reloadRecruitments,
  ]);

  const centerMapOnCurrentLocation = useCallback(async ({
    showAlert,
  }: {
    showAlert: boolean;
  }) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        if (showAlert) {
          Alert.alert(
            "現在地を取得できません",
            "端末の設定で位置情報の利用を許可してください。"
          );
        }

        await loadMapData();
        return false;
      }

      const location = await Location.getCurrentPositionAsync({});
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: INITIAL_REGION.latitudeDelta,
        longitudeDelta: INITIAL_REGION.longitudeDelta,
      };

      mapRef.current?.animateToRegion(region, 350);
      visibleBoundsRef.current = boundsFromRegion(region);
      await loadMapData(visibleBoundsRef.current);
      return true;
    } catch {
      if (showAlert) {
        Alert.alert(
          "現在地を取得できません",
          "時間をおいてもう一度お試しください。"
        );
      }

      await loadMapData();
      return false;
    }
  }, [loadMapData]);

  const moveToCurrentLocation = useCallback(() => {
    centerMapOnCurrentLocation({ showAlert: true });
  }, [centerMapOnCurrentLocation]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      const nextBounds = boundsFromRegion(region);
      visibleBoundsRef.current = nextBounds;

      if (mapReloadTimeoutRef.current) {
        clearTimeout(mapReloadTimeoutRef.current);
      }

      mapReloadTimeoutRef.current = setTimeout(() => {
        loadMapData(nextBounds);
      }, MAP_RELOAD_DEBOUNCE_MS);
    },
    [loadMapData]
  );

  const handleRecruitmentCableMessage = useCallback(
    (payload: RecruitmentCablePayload) => {
      if (payload.type !== "recruitment_created") return;
      if (
        !recruitmentLocationInBounds(
          payload.recruitment,
          visibleBoundsRef.current
        )
      ) {
        return;
      }

      loadMapData();
    },
    [loadMapData]
  );

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;

      if (hasCenteredInitialLocationRef.current) {
        loadMapData();
      } else {
        hasCenteredInitialLocationRef.current = true;
        centerMapOnCurrentLocation({ showAlert: false });
      }

      subscribeToRecruitments({
        onMessage: handleRecruitmentCableMessage,
      })
        .then((subscription) => {
          if (!isFocused) {
            subscription.close();
            return;
          }

          recruitmentSubscriptionRef.current = subscription;
        })
        .catch(() => undefined);

      return () => {
        isFocused = false;
        recruitmentSubscriptionRef.current?.close();
        recruitmentSubscriptionRef.current = null;
      };
    }, [centerMapOnCurrentLocation, handleRecruitmentCableMessage, loadMapData])
  );

  useEffect(() => {
    return () => {
      if (mapReloadTimeoutRef.current) {
        clearTimeout(mapReloadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "recruitmentCreated",
      () => {
        setSelectedCoordinate(null);
        setSelectedRecruitment(null);
        loadMapData();
      }
    );

    return () => subscription.remove();
  }, [loadMapData]);

  const hasActiveRecruitment = myRecruitments.some(isRecruitmentOpen);
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  const selectedRecruitmentApplication = selectedRecruitment
    ? applications.find(
        (application) => application.recruitment_id === selectedRecruitment.id
      )
    : undefined;
  const selectedRecruitmentIsOwn = selectedRecruitment
    ? myRecruitments.some(
        (recruitment) => recruitment.id === selectedRecruitment.id
      )
    : false;
  const selectedRecruitmentGenderAllowed = selectedRecruitment
    ? canApplyByGender(selectedRecruitment, profile?.gender)
    : false;
  const selectedRecruitmentIsOpen = selectedRecruitment
    ? isRecruitmentOpen(selectedRecruitment)
    : false;
  const selectedRecruitmentIsFull = selectedRecruitment
    ? selectedRecruitment.active_application_count >=
      selectedRecruitment.application_limit
    : false;
  const selectedRecruitmentDisabledReason = selectedRecruitment
    ? applyDisabledReason({
        hasApplication: Boolean(selectedRecruitmentApplication),
        isOwnRecruitment: selectedRecruitmentIsOwn,
        isGenderAllowed: selectedRecruitmentGenderAllowed,
        hasProfile: Boolean(profile),
        isRecruitmentOpen: selectedRecruitmentIsOpen,
        isApplicationLimitReached: selectedRecruitmentIsFull,
      })
    : "";
  const canApplyToSelectedRecruitment =
    Boolean(selectedRecruitment) && selectedRecruitmentDisabledReason === "";

  return (
    <View className="flex-1 bg-white">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        onPress={(event) => {
          if (event.nativeEvent.action === "marker-press") return;
          if (hasActiveRecruitment) return;

          setSelectedRecruitment(null);
          setSelectedCoordinate(event.nativeEvent.coordinate);
        }}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsCompass={false}
        showsMyLocationButton={false}
      >
        {filteredRecruitments.map((recruitment) => {
          const latitude = Number(recruitment.latitude);
          const longitude = Number(recruitment.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return (
            <RecruitmentMapMarker
              key={`recruitment-${recruitment.id}`}
              coordinate={{ latitude, longitude }}
              recruitment={recruitment}
              currentTime={currentTime}
              onPress={() => {
                setSelectedRecruitment(recruitment);
                setSelectedCoordinate(null);
                setApplicationMessage("");
                setApplyErrorMessage("");
              }}
            />
          );
        })}

        {selectedCoordinate ? (
          <LocationPulseMarker
            latitude={selectedCoordinate.latitude}
            longitude={selectedCoordinate.longitude}
            visible={!hasActiveRecruitment}
          />
        ) : null}
      </MapView>

      {/* 右上のフィルタボタン */}
      <Pressable
        className="absolute right-5 top-14 h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-md"
        onPress={() => setIsFilterVisible(true)}
      >
        <FontAwesome name="sliders" size={18} color={colors.textPrimary} />
      </Pressable>

      {/* 現在地ボタン */}
      <Pressable
        className="absolute bottom-24 right-5 h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-md"
        onPress={moveToCurrentLocation}
      >
        <FontAwesome name="location-arrow" size={18} color={colors.state} />
      </Pressable>

      {/* 募集を立てますか？カード */}
      {!hasActiveRecruitment ? (
        <LocationSelectionCard
          coordinate={selectedCoordinate}
          onRequestCancel={() => setSelectedCoordinate(null)}
        />
      ) : null}

      {selectedRecruitment ? (
        <RecruitmentApplicationCard
          recruitment={selectedRecruitment}
          applyLabel={selectedRecruitmentApplication ? "応募済み" : "応募する"}
          applicationMessage={
            selectedRecruitmentApplication?.message ?? applicationMessage
          }
          isApplyDisabled={!canApplyToSelectedRecruitment}
          isApplying={isSubmitting}
          isOwnRecruitment={selectedRecruitmentIsOwn}
          disabledReason={
            applyErrorMessage || selectedRecruitmentDisabledReason
          }
          onChangeApplicationMessage={setApplicationMessage}
          onApply={() => applyToRecruitment(selectedRecruitment)}
          onClose={() => {
            setSelectedRecruitment(null);
            setApplicationMessage("");
            setApplyErrorMessage("");
          }}
          onPressOwnerProfile={
            selectedRecruitmentIsOwn
              ? undefined
              : () => router.push(`/profiles/${selectedRecruitment.user_id}`)
          }
        />
      ) : null}

      <View
        pointerEvents="none"
        className="absolute left-20 right-20 top-20 rounded-full border bg-white/90 px-3 py-2 shadow-sm"
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

  async function applyToRecruitment(recruitment: Recruitment) {
    if (!canApplyToSelectedRecruitment || isSubmitting) {
      return;
    }

    setApplyErrorMessage("");
    startSubmitting();

    try {
      await createRecruitmentApplication(recruitment.id, {
        message: applicationMessage,
      });
      await loadMapData();
      setSelectedRecruitment(null);
      setApplicationMessage("");
      Alert.alert("応募しました", "募集主の返答をお待ちください。");
    } catch (error) {
      setApplyErrorMessage(
        errorMessageFromError(error, "応募できませんでした")
      );
    } finally {
      finishSubmitting();
    }
  }
}

function boundsFromRegion(region: Region): RecruitmentBounds {
  const latitudeDelta = Math.abs(region.latitudeDelta);
  const longitudeDelta = Math.abs(region.longitudeDelta);

  return {
    north: clampLatitude(region.latitude + latitudeDelta / 2),
    south: clampLatitude(region.latitude - latitudeDelta / 2),
    east:
      longitudeDelta >= 360
        ? 180
        : normalizeLongitude(region.longitude + longitudeDelta / 2),
    west:
      longitudeDelta >= 360
        ? -180
        : normalizeLongitude(region.longitude - longitudeDelta / 2),
  };
}

function clampLatitude(latitude: number) {
  return Math.max(-90, Math.min(90, latitude));
}

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function recruitmentLocationInBounds(
  recruitment: RecruitmentCablePayload["recruitment"],
  bounds: RecruitmentBounds
) {
  const latitude = Number(recruitment.latitude);
  const longitude = Number(recruitment.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitudeInBounds(normalizeLongitude(longitude), bounds)
  );
}

function longitudeInBounds(longitude: number, bounds: RecruitmentBounds) {
  if (bounds.west <= bounds.east) {
    return longitude >= bounds.west && longitude <= bounds.east;
  }

  return longitude >= bounds.west || longitude <= bounds.east;
}

function canApplyByGender(
  recruitment: Recruitment,
  gender: string | undefined
) {
  if (recruitment.allowed_gender_policy === "anyone") {
    return Boolean(gender);
  }

  if (recruitment.allowed_gender_policy === "male_only") {
    return gender === "male";
  }

  if (recruitment.allowed_gender_policy === "female_only") {
    return gender === "female";
  }

  return false;
}

function isRecruitmentOpen(recruitment: Recruitment) {
  const expiresAt = Date.parse(recruitment.expires_at);

  return (
    recruitment.status === "active" &&
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now()
  );
}

function applyDisabledReason({
  hasApplication,
  isOwnRecruitment,
  isGenderAllowed,
  hasProfile,
  isRecruitmentOpen,
  isApplicationLimitReached,
}: {
  hasApplication: boolean;
  isOwnRecruitment: boolean;
  isGenderAllowed: boolean;
  hasProfile: boolean;
  isRecruitmentOpen: boolean;
  isApplicationLimitReached: boolean;
}) {
  if (isOwnRecruitment) {
    return "自分の募集には応募できません";
  }

  if (hasApplication) {
    return "この募集には応募済みです";
  }

  if (!hasProfile) {
    return "プロフィール作成後に応募できます";
  }

  if (!isRecruitmentOpen) {
    return "この募集は終了しています";
  }

  if (isApplicationLimitReached) {
    return "応募上限に達しています";
  }

  if (!isGenderAllowed) {
    return "募集条件に合わないため応募できません";
  }

  return "";
}
