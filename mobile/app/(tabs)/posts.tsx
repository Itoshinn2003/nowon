import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RecruitmentListTabs } from "@/src/components/recruitment/RecruitmentListTabs";
import { RecruitmentSummaryList } from "@/src/components/recruitment/RecruitmentSummaryList";
import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { cancelRecruitment } from "@/src/api/recruitments";
import { colors } from "@/src/constants/colors";
import { useMyRecruitments } from "@/src/hooks/useRecruitments";
import type { Recruitment, RecruitmentListTab } from "@/src/types/recruitment";
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
  const {
    recruitments: myRecruitments,
    isLoading,
    errorMessage,
    reloadRecruitments,
  } = useMyRecruitments({ loadOnMount: false });

  useFocusEffect(
    useCallback(() => {
      reloadRecruitments();
    }, [reloadRecruitments])
  );

  const recruitments = useMemo(
    () => (selectedTab === "mine" ? myRecruitments : []),
    [myRecruitments, selectedTab]
  );
  const displayedErrorMessage = cancelErrorMessage || errorMessage;

  if (isLoading && selectedTab === "mine") {
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
              selectedTab === "mine" ? handleCancelRecruitment : undefined
            }
            cancelingRecruitmentId={cancelingRecruitmentId}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
