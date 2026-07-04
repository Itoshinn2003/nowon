import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  type LatLng,
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
import { colors } from "@/src/constants/colors";
import { minimalMapStyle } from "@/src/constants/map";
import { useRecruitmentCategories } from "@/src/hooks/useRecruitmentCategories";
import { useRecruitmentApplications } from "@/src/hooks/useRecruitmentApplications";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import {
  useMyRecruitments,
  useRecruitments,
} from "@/src/hooks/useRecruitments";
import { useProfile } from "@/src/hooks/useProfile";
import type { Recruitment } from "@/src/types/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

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
  const {
    isSubmitting,
    startSubmitting,
    finishSubmitting,
  } = useSubmitState();

  useFocusEffect(
    useCallback(() => {
      async function loadRecruitments() {
        await reloadRecruitments();
        await reloadMyRecruitments();
        await reloadApplications();
        await reloadProfile();
      }

      loadRecruitments();
    }, [
      reloadApplications,
      reloadMyRecruitments,
      reloadProfile,
      reloadRecruitments,
    ])
  );

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
        provider={PROVIDER_GOOGLE}
        customMapStyle={minimalMapStyle}
        style={{ flex: 1 }}
        onPress={(event) => {
          if (event.nativeEvent.action === "marker-press") return;
          if (hasActiveRecruitment) return;

          setSelectedRecruitment(null);
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
      await reloadRecruitments();
      await reloadApplications();
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
