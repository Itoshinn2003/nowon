import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRecruitment } from "@/src/api/recruitments";
import { RecruitmentCreateForm } from "@/src/components/recruitment/RecruitmentCreateForm";
import { BackIconButton } from "@/src/components/ui/BackIconButton";
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
        vibe: formData.vibe.trim(),
        recruitingPeopleMin: numberFromInput(formData.recruitingPeopleMin),
        recruitingPeopleMax: numberFromInput(formData.recruitingPeopleMax),
        allowedGenderPolicy: formData.allowedGenderPolicy,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description: formData.description.trim() || undefined,
        safetyConfirmed: formData.safetyConfirmed,
      });

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
      <View
        className="mx-4 mt-2 flex-row items-center gap-3 rounded-lg border bg-white px-3 py-3"
        style={{ borderColor: colors.border }}
      >
        <BackIconButton onPress={() => router.back()} />

        <View className="min-w-0 flex-1">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            {isOneToOne ? "1人用募集" : "複数人用募集"}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            選択した場所から募集を作成します
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 pb-12"
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
