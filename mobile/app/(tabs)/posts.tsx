import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RecruitmentListTabs } from "@/src/components/recruitment/RecruitmentListTabs";
import { RecruitmentSummaryList } from "@/src/components/recruitment/RecruitmentSummaryList";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { deleteRecruitmentApplication } from "@/src/api/recruitmentApplications";
import { cancelRecruitment } from "@/src/api/recruitments";
import { colors } from "@/src/constants/colors";
import { useRecruitmentApplications } from "@/src/hooks/useRecruitmentApplications";
import { useMyRecruitments } from "@/src/hooks/useRecruitments";
import type {
  Recruitment,
  RecruitmentApplication,
  RecruitmentListTab,
} from "@/src/types/recruitment";
import { errorMessageFromError } from "@/src/utils/profile";

const emptyMessages: Record<RecruitmentListTab, string> = {
  mine: "現在出している募集はありません",
  applied: "応募した募集はまだありません",
  matched: "成立した募集はまだありません",
};

export default function PostsScreen() {
  const [selectedTab, setSelectedTab] = useState<RecruitmentListTab>("mine");
  const [cancelErrorMessage, setCancelErrorMessage] = useState("");
  const [cancelingRecruitmentId, setCancelingRecruitmentId] = useState<
    number | null
  >(null);
  const [cancelingApplicationId, setCancelingApplicationId] = useState<
    number | null
  >(null);
  const {
    recruitments: myRecruitments,
    isLoading,
    errorMessage,
    reloadRecruitments,
  } = useMyRecruitments({ loadOnMount: false });
  const {
    applications,
    isLoading: isLoadingApplications,
    errorMessage: applicationsErrorMessage,
    reloadApplications,
  } = useRecruitmentApplications({ loadOnMount: false });

  useFocusEffect(
    useCallback(() => {
      async function loadRecruitmentLists() {
        await reloadRecruitments();
        await reloadApplications();
      }

      loadRecruitmentLists();
    }, [reloadApplications, reloadRecruitments])
  );

  const appliedRecruitments = useMemo(
    () =>
      applications
        .map((application) => application.recruitment)
        .filter((recruitment): recruitment is Recruitment =>
          Boolean(recruitment)
        ),
    [applications]
  );
  const cancelingAppliedRecruitmentId =
    applications.find((application) => application.id === cancelingApplicationId)
      ?.recruitment_id ?? null;
  const recruitments = useMemo(
    () => {
      if (selectedTab === "mine") return myRecruitments;
      if (selectedTab === "applied") return appliedRecruitments;

      return [];
    },
    [appliedRecruitments, myRecruitments, selectedTab]
  );
  const displayedErrorMessage =
    cancelErrorMessage || errorMessage || applicationsErrorMessage;

  if (
    (isLoading && selectedTab === "mine") ||
    (isLoadingApplications && selectedTab === "applied")
  ) {
    return <LoadingScreen />;
  }

  function handleCancelRecruitment(recruitment: Recruitment) {
    if (cancelingRecruitmentId !== null) return;

    Alert.alert(
      "募集キャンセル",
      `「${recruitment.purpose}」の募集をキャンセルしますか？`,
      [
        { text: "戻る", style: "cancel" },
        {
          text: "キャンセルする",
          style: "destructive",
          onPress: () => requestCancelRecruitment(recruitment),
        },
      ]
    );
  }

  function handleCancelApplication(recruitment: Recruitment) {
    if (cancelingApplicationId !== null) return;

    const application = applications.find(
      (currentApplication) =>
        currentApplication.recruitment_id === recruitment.id
    );

    if (!application || !isApplicationCancelable(application)) return;

    Alert.alert(
      "応募キャンセル",
      `「${recruitment.purpose}」への応募をキャンセルしますか？`,
      [
        { text: "戻る", style: "cancel" },
        {
          text: "キャンセルする",
          style: "destructive",
          onPress: () => requestCancelApplication(application),
        },
      ]
    );
  }

  async function requestCancelRecruitment(recruitment: Recruitment) {
    setCancelErrorMessage("");
    setCancelingRecruitmentId(recruitment.id);

    try {
      await cancelRecruitment(recruitment.id);
      await reloadRecruitments();
    } catch (error) {
      setCancelErrorMessage(
        errorMessageFromError(error, "募集をキャンセルできませんでした")
      );
    } finally {
      setCancelingRecruitmentId(null);
    }
  }

  async function requestCancelApplication(application: RecruitmentApplication) {
    setCancelErrorMessage("");
    setCancelingApplicationId(application.id);

    try {
      await deleteRecruitmentApplication(application.id);
      await reloadApplications();
    } catch (error) {
      setCancelErrorMessage(
        errorMessageFromError(error, "応募をキャンセルできませんでした")
      );
    } finally {
      setCancelingApplicationId(null);
    }
  }

  function canCancelAppliedRecruitment(recruitment: Recruitment) {
    const application = applications.find(
      (currentApplication) =>
        currentApplication.recruitment_id === recruitment.id
    );

    return application ? isApplicationCancelable(application) : false;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-12">
        <View className="gap-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold text-gray-950">募集</Text>
            <Text className="text-sm text-gray-500">
              募集の状況を確認できます
            </Text>
            {displayedErrorMessage ? (
              <Text className="text-sm text-red-500">
                {displayedErrorMessage}
              </Text>
            ) : null}
          </View>

          <RecruitmentListTabs
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
          />

          <RecruitmentSummaryList
            recruitments={recruitments}
            emptyMessage={emptyMessages[selectedTab]}
            onCancelRecruitment={
              selectedTab === "mine"
                ? handleCancelRecruitment
                : selectedTab === "applied"
                  ? handleCancelApplication
                  : undefined
            }
            canCancelRecruitment={
              selectedTab === "applied"
                ? canCancelAppliedRecruitment
                : undefined
            }
            cancelingRecruitmentId={
              selectedTab === "mine"
                ? cancelingRecruitmentId
                : cancelingAppliedRecruitmentId
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function isApplicationCancelable(application: RecruitmentApplication) {
  const isPendingOrAccepted =
    application.status === "pending" || application.status === "accepted";

  return isPendingOrAccepted && application.recruitment?.status !== "matched";
}
