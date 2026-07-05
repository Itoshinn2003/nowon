import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RecruitmentListTabs } from "@/src/components/recruitment/RecruitmentListTabs";
import { RecruitmentDetailSheet } from "@/src/components/recruitment/RecruitmentDetailSheet";
import { RecruitmentSummaryList } from "@/src/components/recruitment/RecruitmentSummaryList";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import {
  acceptRecruitmentApplication,
  cancelAcceptRecruitmentApplication,
  deleteRecruitmentApplication,
  getRecruitmentApplications,
} from "@/src/api/recruitmentApplications";
import { cancelRecruitment, matchRecruitment } from "@/src/api/recruitments";
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
  const [selectedRecruitment, setSelectedRecruitment] =
    useState<Recruitment | null>(null);
  const [selectedRecruitmentTab, setSelectedRecruitmentTab] =
    useState<RecruitmentListTab>("mine");
  const [selectedRecruitmentApplications, setSelectedRecruitmentApplications] =
    useState<RecruitmentApplication[]>([]);
  const [
    isLoadingSelectedRecruitmentApplications,
    setIsLoadingSelectedRecruitmentApplications,
  ] = useState(false);
  const [
    selectedRecruitmentApplicationsErrorMessage,
    setSelectedRecruitmentApplicationsErrorMessage,
  ] = useState("");
  const [processingApplicationId, setProcessingApplicationId] = useState<
    number | null
  >(null);
  const [matchingRecruitmentId, setMatchingRecruitmentId] = useState<
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
      if (selectedTab === "mine") {
        return myRecruitments.filter(isRecruitmentOpen);
      }

      if (selectedTab === "applied") return appliedRecruitments;
      if (selectedTab === "matched") {
        return myRecruitments.filter(
          (recruitment) => recruitment.status === "matched"
        );
      }

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

  function handlePressRecruitment(recruitment: Recruitment) {
    setSelectedRecruitment(recruitment);
    setSelectedRecruitmentTab(selectedTab);
    setSelectedRecruitmentApplications([]);
    setSelectedRecruitmentApplicationsErrorMessage("");

    if (selectedTab === "mine" || selectedTab === "matched") {
      loadSelectedRecruitmentApplications(recruitment);
    }
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

  async function loadSelectedRecruitmentApplications(recruitment: Recruitment) {
    setIsLoadingSelectedRecruitmentApplications(true);
    setSelectedRecruitmentApplicationsErrorMessage("");

    try {
      const loadedApplications = await getRecruitmentApplications(
        recruitment.id
      );
      setSelectedRecruitmentApplications(loadedApplications);
    } catch (error) {
      setSelectedRecruitmentApplicationsErrorMessage(
        errorMessageFromError(error, "応募一覧を取得できませんでした")
      );
    } finally {
      setIsLoadingSelectedRecruitmentApplications(false);
    }
  }

  async function requestAcceptApplication(application: RecruitmentApplication) {
    if (processingApplicationId !== null) return;

    setProcessingApplicationId(application.id);
    setSelectedRecruitmentApplicationsErrorMessage("");

    try {
      const updatedApplication = await acceptRecruitmentApplication(
        application.id
      );

      if (updatedApplication.recruitment) {
        setSelectedRecruitment(updatedApplication.recruitment);
      }

      if (selectedRecruitment) {
        await loadSelectedRecruitmentApplications(selectedRecruitment);
      }

      await reloadRecruitments();
    } catch (error) {
      setSelectedRecruitmentApplicationsErrorMessage(
        errorMessageFromError(error, "応募を承認できませんでした")
      );
    } finally {
      setProcessingApplicationId(null);
    }
  }

  async function requestCancelAcceptApplication(
    application: RecruitmentApplication
  ) {
    if (processingApplicationId !== null) return;

    setProcessingApplicationId(application.id);
    setSelectedRecruitmentApplicationsErrorMessage("");

    try {
      const updatedApplication = await cancelAcceptRecruitmentApplication(
        application.id
      );

      if (updatedApplication.recruitment) {
        setSelectedRecruitment(updatedApplication.recruitment);
      }

      if (selectedRecruitment) {
        await loadSelectedRecruitmentApplications(selectedRecruitment);
      }

      await reloadRecruitments();
    } catch (error) {
      setSelectedRecruitmentApplicationsErrorMessage(
        errorMessageFromError(error, "承認をキャンセルできませんでした")
      );
    } finally {
      setProcessingApplicationId(null);
    }
  }

  async function requestMatchRecruitment(recruitment: Recruitment) {
    if (matchingRecruitmentId !== null) return;

    setMatchingRecruitmentId(recruitment.id);
    setSelectedRecruitmentApplicationsErrorMessage("");

    try {
      const matchedRecruitment = await matchRecruitment(recruitment.id);
      setSelectedRecruitment(matchedRecruitment);
      setSelectedRecruitmentTab("matched");
      await loadSelectedRecruitmentApplications(matchedRecruitment);
      await reloadRecruitments();
    } catch (error) {
      setSelectedRecruitmentApplicationsErrorMessage(
        errorMessageFromError(error, "マッチングを開始できませんでした")
      );
    } finally {
      setMatchingRecruitmentId(null);
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
            <Text className="text-center text-2xl font-bold text-gray-950">
              募集
            </Text>
            <Text className="text-center text-sm text-gray-500">
              募集の状況を確認できます
            </Text>
            {displayedErrorMessage ? (
              <Text className="text-center text-sm text-red-500">
                {displayedErrorMessage}
              </Text>
            ) : null}
          </View>

          <RecruitmentListTabs
            selectedTab={selectedTab}
            onSelectTab={(tab) => {
              setSelectedTab(tab);
              setSelectedRecruitment(null);
            }}
          />

          <RecruitmentSummaryList
            recruitments={recruitments}
            emptyMessage={emptyMessages[selectedTab]}
            onPressRecruitment={handlePressRecruitment}
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
      <RecruitmentDetailSheet
        visible={Boolean(selectedRecruitment)}
        recruitment={selectedRecruitment}
        mode={selectedRecruitmentTab}
        applications={selectedRecruitmentApplications}
        application={
          selectedRecruitment
            ? applications.find(
                (currentApplication) =>
                  currentApplication.recruitment_id === selectedRecruitment.id
              )
            : undefined
        }
        isLoadingApplications={isLoadingSelectedRecruitmentApplications}
        applicationsErrorMessage={selectedRecruitmentApplicationsErrorMessage}
        processingApplicationId={processingApplicationId}
        isMatching={matchingRecruitmentId === selectedRecruitment?.id}
        canShowApplications={Boolean(
          selectedRecruitment &&
            myRecruitments.some(
              (recruitment) => recruitment.id === selectedRecruitment.id
            )
        )}
        onAcceptApplication={requestAcceptApplication}
        onCancelAcceptApplication={requestCancelAcceptApplication}
        onMatchRecruitment={requestMatchRecruitment}
        onPressRecruitmentDetail={(recruitment) =>
          router.push(`/recruitments/${recruitment.id}`)
        }
        onPressApplicantProfile={(application) =>
          router.push(`/profiles/${application.user_id}`)
        }
        onClose={() => setSelectedRecruitment(null)}
      />
    </SafeAreaView>
  );
}

function isApplicationCancelable(application: RecruitmentApplication) {
  const isPendingOrAccepted =
    application.status === "pending" || application.status === "accepted";

  return isPendingOrAccepted && application.recruitment?.status !== "matched";
}

function isRecruitmentOpen(recruitment: Recruitment) {
  const expiresAt = Date.parse(recruitment.expires_at);

  return (
    recruitment.status === "active" &&
    Number.isFinite(expiresAt) &&
    expiresAt > Date.now()
  );
}
