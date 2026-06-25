import { useEffect, useMemo, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Button, SegmentedButtons } from "react-native-paper";

import { CoordinateRow } from "@/src/components/recruitment/CoordinateRow";
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

  return (
    <View
      className="gap-5 rounded-lg border bg-white p-5"
      style={{ borderColor: colors.border }}
    >
      {errorMessage ? (
        <Text className="text-sm text-red-500">{errorMessage}</Text>
      ) : null}

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-700">カテゴリ</Text>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = formData.recruitmentCategoryId === category.id;

            return (
              <Pressable
                key={category.id}
                className="rounded-full border px-3 py-2"
                style={{
                  borderColor: isSelected ? colors.state : colors.border,
                  backgroundColor: isSelected ? colors.stateSoft : "#FFFFFF",
                }}
                onPress={() => updateForm("recruitmentCategoryId", category.id)}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: isSelected ? colors.state : "#374151" }}
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

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-700">募集人数</Text>
        {isOneToOne ? (
          <Text
            className="rounded-lg border px-4 py-3 text-base font-bold text-gray-900"
            style={{ borderColor: colors.inputBorder }}
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

      <View className="gap-2">
        <Text className="text-sm font-medium text-gray-700">応募できる人</Text>
        <SegmentedButtons
          value={formData.allowedGenderPolicy}
          onValueChange={(value) =>
            updateForm("allowedGenderPolicy", value as AllowedGenderPolicy)
          }
          theme={{
            colors: {
              primary: colors.state,
              secondaryContainer: colors.stateSoft,
              onSecondaryContainer: "#1F2937",
            },
          }}
          buttons={[
            { value: "male_only", label: "男性のみ" },
            { value: "female_only", label: "女性のみ" },
            { value: "anyone", label: "どちらも可" },
          ]}
        />
      </View>

      <View
        className="gap-2 rounded-lg border p-3"
        style={{ borderColor: colors.border, backgroundColor: "#FAFAF8" }}
      >
        <Text className="text-sm font-bold text-gray-900">集合候補地</Text>
        <CoordinateRow label="latitude" value={latitude ?? "-"} />
        <CoordinateRow label="longitude" value={longitude ?? "-"} />
      </View>

      <View
        className="flex-row items-start gap-3 rounded-lg border p-3"
        style={{ borderColor: colors.border }}
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
          style={{ borderColor: colors.inputBorder }}
          onPress={onCancel}
        >
          キャンセル
        </Button>
        <Button
          mode="contained"
          className="flex-1"
          buttonColor={colors.textPrimary}
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
