import { router, useLocalSearchParams } from "expo-router";
import {
  DeviceEventEmitter,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRecruitment } from "@/src/api/recruitments";
import { RecruitmentCreateForm } from "@/src/components/recruitment/RecruitmentCreateForm";
import { colors } from "@/src/constants/colors";
import { useRecruitmentCategories } from "@/src/hooks/useRecruitmentCategories";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import type {
  RecruitmentFormState,
  RecruitmentType,
} from "@/src/types/recruitment";
import { toDisplayErrors } from "@/src/utils/error";
import { numberFromInput } from "@/src/utils/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

export default function RecruitmentNewScreen() {
  const {
    recruitmentType = "one_to_one",
    latitude,
    longitude,
  } = useLocalSearchParams<{
    recruitmentType?: RecruitmentType;
    latitude?: string;
    longitude?: string;
  }>();
  const {
    categories,
    isLoading: isLoadingCategories,
    errorMessage: categoriesErrorMessage,
  } = useRecruitmentCategories();
  const {
    isSubmitting,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  } = useSubmitState();
  const submitErrorMessage = toDisplayErrors(validationError).join(" / ");

  async function handleSubmit(formData: RecruitmentFormState) {
    if (!latitude || !longitude || formData.recruitmentCategoryId === null) {
      return;
    }

    startSubmitting();

    try {
      await createRecruitment({
        recruitmentType: formData.recruitmentType,
        recruitmentCategoryId: formData.recruitmentCategoryId as number,
        purpose: formData.purpose.trim(),
        recruitingPeopleMin: numberFromInput(formData.recruitingPeopleMin),
        recruitingPeopleMax: numberFromInput(formData.recruitingPeopleMax),
        allowedGenderPolicy: formData.allowedGenderPolicy,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description: formData.description.trim(),
        safetyConfirmed: formData.safetyConfirmed,
      });

      DeviceEventEmitter.emit("recruitmentCreated");
      router.back();
    } catch (error) {
      setValidationError(
        errorMessageFromError(error, "募集を保存できませんでした")
      );
    } finally {
      finishSubmitting();
    }
  }

  const isOneToOne = recruitmentType === "one_to_one";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <Pressable className="w-12" onPress={() => router.back()}>
          <Text className="text-base font-bold text-gray-950">閉じる</Text>
        </Pressable>
        <Text className="text-base font-extrabold text-gray-950">
          {isOneToOne ? "1対1の募集" : "グループ募集"}
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 pb-12"
        keyboardShouldPersistTaps="handled"
        onTouchStart={() => Keyboard.dismiss()}
      >
        <RecruitmentCreateForm
          recruitmentType={recruitmentType}
          categories={categories}
          latitude={latitude}
          longitude={longitude}
          errorMessage={submitErrorMessage || categoriesErrorMessage}
          isLoadingCategories={isLoadingCategories}
          isSubmitting={isSubmitting}
          onCancel={() => router.back()}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
