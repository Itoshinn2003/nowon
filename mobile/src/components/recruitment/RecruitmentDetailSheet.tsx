import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/src/constants/colors";
import type {
  Recruitment,
  RecruitmentApplication,
} from "@/src/types/recruitment";
import { recruitmentPeopleLabel } from "@/src/utils/recruitment";

export function RecruitmentDetailSheet({
  visible,
  recruitment,
  mode,
  applications,
  application,
  isLoadingApplications,
  applicationsErrorMessage,
  processingApplicationId,
  isMatching,
  onAcceptApplication,
  onCancelAcceptApplication,
  onMatchRecruitment,
  onClose,
}: {
  visible: boolean;
  recruitment: Recruitment | null;
  mode: "mine" | "applied" | "matched";
  applications: RecruitmentApplication[];
  application?: RecruitmentApplication;
  isLoadingApplications: boolean;
  applicationsErrorMessage: string;
  processingApplicationId: number | null;
  isMatching: boolean;
  onAcceptApplication: (application: RecruitmentApplication) => void;
  onCancelAcceptApplication: (application: RecruitmentApplication) => void;
  onMatchRecruitment: (recruitment: Recruitment) => void;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (!recruitment) {
    return null;
  }

  const category = recruitment.recruitment_category?.name ?? "未分類";
  const acceptedApplicationCount = applications.filter(
    (currentApplication) => currentApplication.status === "accepted"
  ).length;
  const canStartMatching =
    recruitment.status === "active" &&
    acceptedApplicationCount >= recruitment.recruiting_people_min;
  const isMatched = recruitment.status === "matched";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-3xl bg-white px-5 pt-4"
          style={{
            maxHeight: height * 0.86,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <ScrollView
            style={{ maxHeight: height * 0.68 }}
            contentContainerClassName="gap-5 pb-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-xs font-bold text-gray-500">
                  {category}
                </Text>
                <Text className="text-xl font-bold text-gray-950">
                  {recruitment.purpose}
                </Text>
                <Text className="text-sm text-gray-500">
                  {recruitment.vibe}
                </Text>
              </View>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                onPress={onClose}
              >
                <FontAwesome name="close" size={16} color="#374151" />
              </Pressable>
            </View>

            <View className="gap-3 border-t border-gray-100 pt-4">
              <DetailRow label="募集人数" value={recruitmentPeopleLabel(recruitment)} />
              <DetailRow label="応募数" value={`${recruitment.active_application_count}件`} />
              <DetailRow label="期限" value={formatDateTime(recruitment.expires_at)} />
              <DetailRow
                label="説明"
                value={recruitment.description || "説明はありません"}
              />
            </View>

            {mode === "mine" ? (
              <ApplicationList
                recruitment={recruitment}
                applications={applications}
                isLoading={isLoadingApplications}
                errorMessage={applicationsErrorMessage}
                processingApplicationId={processingApplicationId}
                onAcceptApplication={onAcceptApplication}
                onCancelAcceptApplication={onCancelAcceptApplication}
              />
            ) : null}

            {mode === "matched" ? (
              <ApplicationList
                recruitment={recruitment}
                applications={applications}
                isLoading={isLoadingApplications}
                errorMessage={applicationsErrorMessage}
                processingApplicationId={processingApplicationId}
                onAcceptApplication={onAcceptApplication}
                onCancelAcceptApplication={onCancelAcceptApplication}
              />
            ) : null}

            {mode === "applied" ? (
              <View className="gap-2 border-t border-gray-100 pt-4">
                <Text className="text-sm font-bold text-gray-700">
                  送信したメッセージ
                </Text>
                <Text className="rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-700">
                  {application?.message || "メッセージはありません"}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {mode === "mine" ? (
            <View className="mb-3 gap-2 border-t border-gray-100 pt-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-gray-700">
                  承認 {acceptedApplicationCount}/
                  {recruitment.recruiting_people_max}人
                </Text>
                <Text className="text-xs text-gray-500">
                  最小{recruitment.recruiting_people_min}人
                </Text>
              </View>
              <Button
                mode="contained"
                buttonColor={colors.state}
                loading={isMatching}
                disabled={!canStartMatching || isMatching || isMatched}
                style={{ minHeight: 44 }}
                onPress={() => onMatchRecruitment(recruitment)}
              >
                {isMatched ? "マッチング成立済み" : "マッチング開始"}
              </Button>
            </View>
          ) : null}

          <Button
            mode="contained"
            buttonColor={colors.textPrimary}
            style={{ minHeight: 44 }}
            onPress={onClose}
          >
            閉じる
          </Button>
        </View>
      </View>
    </Modal>
  );
}

function ApplicationList({
  recruitment,
  applications,
  isLoading,
  errorMessage,
  processingApplicationId,
  onAcceptApplication,
  onCancelAcceptApplication,
}: {
  recruitment: Recruitment;
  applications: RecruitmentApplication[];
  isLoading: boolean;
  errorMessage: string;
  processingApplicationId: number | null;
  onAcceptApplication: (application: RecruitmentApplication) => void;
  onCancelAcceptApplication: (application: RecruitmentApplication) => void;
}) {
  const isMatched = recruitment.status === "matched";

  return (
    <View className="gap-3 border-t border-gray-100 pt-4">
      <Text className="text-sm font-bold text-gray-700">応募一覧</Text>
      {isLoading ? (
        <Text className="text-sm text-gray-500">読み込み中です</Text>
      ) : errorMessage ? (
        <Text className="text-sm text-red-500">{errorMessage}</Text>
      ) : applications.length === 0 ? (
        <Text className="text-sm text-gray-500">まだ応募はありません</Text>
      ) : (
        applications.map((application) => (
          <View
            key={application.id}
            className="gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3"
          >
            <View className="flex-row items-center justify-between gap-2">
              <Text className="min-w-0 flex-1 text-sm font-bold text-gray-900">
                {application.applicant_profile?.nickname ?? "プロフィール未設定"}
              </Text>
              <Text className="text-xs text-gray-500">
                {statusLabel(application.status)}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">
              {application.message || "メッセージはありません"}
            </Text>
            {!isMatched ? (
              <View className="flex-row gap-2">
                {application.status === "accepted" ? (
                  <Button
                    mode="outlined"
                    className="flex-1"
                    textColor="#DC2626"
                    loading={processingApplicationId === application.id}
                    disabled={processingApplicationId !== null}
                    style={{ borderColor: "#FCA5A5" }}
                    onPress={() => onCancelAcceptApplication(application)}
                  >
                    承認キャンセル
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    className="flex-1"
                    buttonColor={colors.state}
                    loading={processingApplicationId === application.id}
                    disabled={processingApplicationId !== null}
                    onPress={() => onAcceptApplication(application)}
                  >
                    承認
                  </Button>
                )}
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-xs font-bold text-gray-500">{label}</Text>
      <Text className="text-sm text-gray-800">{value}</Text>
    </View>
  );
}

function statusLabel(status: RecruitmentApplication["status"]) {
  if (status === "accepted") return "承認済み";
  if (status === "rejected") return "見送り";

  return "未対応";
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
