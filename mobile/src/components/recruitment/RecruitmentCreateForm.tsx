import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Button } from "react-native-paper";

import { LocationPulseMarker } from "@/src/components/map/LocationPulseMarker";
import { RecruitmentNumberInput } from "@/src/components/recruitment/RecruitmentNumberInput";
import { RecruitmentTextInput } from "@/src/components/recruitment/RecruitmentTextInput";
import { colors } from "@/src/constants/colors";
import type {
  AllowedGenderPolicy,
  RecruitmentCreateFormProps,
  RecruitmentFormState,
} from "@/src/types/recruitment";
import {
  APPLICATION_LIMIT,
  GROUP_RECRUITING_PEOPLE_MAX,
  defaultRecruitmentFormState,
  numberFromInput,
} from "@/src/utils/recruitment";

export function RecruitmentCreateForm({
  recruitmentType,
  categories,
  latitude,
  longitude,
  errorMessage,
  isLoadingCategories,
  isSubmitting,
  onCancel,
  onSubmit,
}: RecruitmentCreateFormProps) {
  const [formData, setFormData] = useState<RecruitmentFormState>(
    defaultRecruitmentFormState(recruitmentType)
  );

  useEffect(() => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      recruitmentCategoryId:
        currentFormData.recruitmentCategoryId ?? categories[0]?.id ?? null,
    }));
  }, [categories]);

  const canSubmit = useMemo(() => {
    const recruitingPeopleMin = numberFromInput(formData.recruitingPeopleMin);
    const recruitingPeopleMax = numberFromInput(formData.recruitingPeopleMax);

    return (
      !isSubmitting &&
      !isLoadingCategories &&
      Boolean(latitude && longitude) &&
      formData.recruitmentCategoryId !== null &&
      formData.purpose.trim().length > 0 &&
      formData.purpose.trim().length <= 30 &&
      formData.vibe.trim().length > 0 &&
      formData.vibe.trim().length <= 30 &&
      Number.isFinite(recruitingPeopleMin) &&
      Number.isFinite(recruitingPeopleMax) &&
      recruitingPeopleMin <= recruitingPeopleMax &&
      recruitingPeopleMax <= GROUP_RECRUITING_PEOPLE_MAX &&
      APPLICATION_LIMIT >= recruitingPeopleMax &&
      formData.safetyConfirmed
    );
  }, [formData, isLoadingCategories, isSubmitting, latitude, longitude]);

  function updateForm<K extends keyof RecruitmentFormState>(
    key: K,
    value: RecruitmentFormState[K]
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [key]: value,
    }));
  }

  function handleSubmit() {
    if (!canSubmit) return;

    onSubmit(formData);
  }

  const isOneToOne = formData.recruitmentType === "one_to_one";
  const selectedLatitude = latitude ? Number(latitude) : null;
  const selectedLongitude = longitude ? Number(longitude) : null;

  return (
    <View className="gap-5">
      {errorMessage ? (
        <Text className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
          {errorMessage}
        </Text>
      ) : null}

      <View className="gap-3">
        <Text className="text-sm font-bold text-gray-900">カテゴリ</Text>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = formData.recruitmentCategoryId === category.id;

            return (
              <Pressable
                key={category.id}
                className="rounded-full px-4 py-2.5"
                style={{
                  backgroundColor: isSelected
                    ? colors.textPrimary
                    : colors.surface,
                }}
                onPress={() => updateForm("recruitmentCategoryId", category.id)}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: isSelected ? "#FFFFFF" : "#374151" }}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <RecruitmentTextInput
        label="目的"
        value={formData.purpose}
        onChangeText={(text) => updateForm("purpose", text)}
        placeholder="ライブ後に感想話したい"
        maxLength={30}
      />

      <RecruitmentTextInput
        label="雰囲気"
        value={formData.vibe}
        onChangeText={(text) => updateForm("vibe", text)}
        placeholder="30分だけ気軽に"
        maxLength={30}
      />

      <RecruitmentTextInput
        label="説明"
        value={formData.description}
        onChangeText={(text) => updateForm("description", text)}
        placeholder="近くのファミレスかカフェで、今日のイベントについて少し話したいです"
        maxLength={120}
        multiline
      />

      <View className="gap-3">
        <Text className="text-sm font-bold text-gray-900">募集人数</Text>
        {isOneToOne ? (
          <Text
            className="rounded-2xl px-4 py-4 text-base font-bold text-gray-900"
            style={{ backgroundColor: colors.surface }}
          >
            1人
          </Text>
        ) : (
          <View className="gap-2">
            <Text className="text-xs text-gray-500">
              最小2人、最大4人まで募集できます
            </Text>
            <View className="flex-row gap-3">
              <RecruitmentNumberInput
                label="最小"
                helperText="2人以上"
                value={formData.recruitingPeopleMin}
                onChangeText={(text) => updateForm("recruitingPeopleMin", text)}
              />
              <RecruitmentNumberInput
                label="最大"
                helperText="4人まで"
                value={formData.recruitingPeopleMax}
                onChangeText={(text) => updateForm("recruitingPeopleMax", text)}
              />
            </View>
          </View>
        )}
      </View>

      <View className="gap-3">
        <Text className="text-sm font-bold text-gray-900">応募できる人</Text>
        <GenderPolicyPicker
          value={formData.allowedGenderPolicy}
          onChange={(value) => updateForm("allowedGenderPolicy", value)}
        />
      </View>

      <SelectedLocationPreview
        latitude={selectedLatitude}
        longitude={selectedLongitude}
      />

      <View
        className="flex-row items-start gap-3 rounded-3xl px-4 py-4"
        style={{ backgroundColor: colors.surface }}
      >
        <Switch
          value={formData.safetyConfirmed}
          onValueChange={(value) => updateForm("safetyConfirmed", value)}
          trackColor={{ true: colors.stateSoft, false: "#E5E7EB" }}
          thumbColor={formData.safetyConfirmed ? colors.state : "#F9FAFB"}
        />
        <Text className="min-w-0 flex-1 text-sm leading-5 text-gray-700">
          自宅・個室・人通りの少ない場所での集合は禁止です。駅前・会場周辺・カフェ前など、公共性のある場所を選んでください。
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Button
          mode="outlined"
          className="flex-1"
          textColor={colors.textPrimary}
          style={{ borderColor: colors.inputBorder, borderRadius: 999 }}
          onPress={onCancel}
        >
          キャンセル
        </Button>
        <Button
          mode="contained"
          className="flex-1"
          buttonColor={colors.textPrimary}
          style={{ borderRadius: 999 }}
          disabled={!canSubmit}
          loading={isSubmitting}
          onPress={handleSubmit}
        >
          作成
        </Button>
      </View>
    </View>
  );
}

type GenderPolicyPickerProps = {
  value: AllowedGenderPolicy;
  onChange: (value: AllowedGenderPolicy) => void;
};

const genderPolicyOptions: Array<{
  value: AllowedGenderPolicy;
  label: string;
}> = [
  { value: "male_only", label: "男性のみ" },
  { value: "female_only", label: "女性のみ" },
  { value: "anyone", label: "誰でも" },
];

function GenderPolicyPicker({ value, onChange }: GenderPolicyPickerProps) {
  return (
    <View className="flex-row gap-2">
      {genderPolicyOptions.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={option.value}
            className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-full px-3"
            style={{
              backgroundColor: isSelected ? colors.textPrimary : colors.surface,
            }}
            onPress={() => onChange(option.value)}
          >
            {isSelected ? (
              <FontAwesome name="check" size={11} color="#FFFFFF" />
            ) : null}
            <Text
              className="text-sm font-bold"
              style={{ color: isSelected ? "#FFFFFF" : "#374151" }}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type SelectedLocationPreviewProps = {
  latitude: number | null;
  longitude: number | null;
};

function SelectedLocationPreview({
  latitude,
  longitude,
}: SelectedLocationPreviewProps) {
  const hasCoordinate =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  return (
    <View className="gap-2">
      <Text className="text-sm font-bold text-gray-900">集合候補地</Text>
      <View
        className="overflow-hidden rounded-[26px]"
        style={{ backgroundColor: colors.surface }}
      >
        {hasCoordinate ? (
          <View className="overflow-hidden rounded-[26px]">
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.mapPreview}
              customMapStyle={locationPreviewMapStyle}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.0038,
                longitudeDelta: 0.0038,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              toolbarEnabled={false}
              showsCompass={false}
              showsMyLocationButton={false}
              pointerEvents="none"
            >
              <LocationPulseMarker
                latitude={latitude}
                longitude={longitude}
                visible
                size={54}
              />
            </MapView>
          </View>
        ) : (
          <View
            className="items-center justify-center rounded-[26px]"
            style={[styles.mapPreview, { backgroundColor: colors.stateMuted }]}
          >
            <Text className="text-sm font-bold text-gray-500">
              地図から場所を選んでください
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPreview: {
    height: 168,
    width: "100%",
    backgroundColor: colors.stateMuted,
  },
});

const locationPreviewMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#F3F6F6" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#667085" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road.local",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#DDE7E5" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#BFEFEB" }],
  },
];
