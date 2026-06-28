import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "react-native";

import { RecruitmentSummaryCard } from "@/src/components/recruitment/RecruitmentSummaryCard";
import { colors } from "@/src/constants/colors";
import type { Recruitment } from "@/src/types/recruitment";

export function RecruitmentSummaryList({
  recruitments,
  emptyMessage,
  onCancelRecruitment,
  onPressRecruitment,
  canCancelRecruitment,
  cancelingRecruitmentId,
}: {
  recruitments: Recruitment[];
  emptyMessage: string;
  onCancelRecruitment?: (recruitment: Recruitment) => void;
  onPressRecruitment?: (recruitment: Recruitment) => void;
  canCancelRecruitment?: (recruitment: Recruitment) => boolean;
  cancelingRecruitmentId?: number | null;
}) {
  if (recruitments.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <View className="gap-3">
      {recruitments.map((recruitment) => (
        <RecruitmentSummaryCard
          key={recruitment.id}
          recruitment={recruitment}
          onCancelRecruitment={onCancelRecruitment}
          onPress={onPressRecruitment}
          isCanceling={cancelingRecruitmentId === recruitment.id}
          isCancelDisabled={
            Boolean(onCancelRecruitment) &&
            canCancelRecruitment !== undefined &&
            !canCancelRecruitment(recruitment)
          }
        />
      ))}
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View
      className="items-center rounded-lg border bg-white px-4 py-10"
      style={{ borderColor: colors.border }}
    >
      <FontAwesome name="inbox" size={24} color="#9CA3AF" />
      <Text className="mt-3 text-sm font-bold text-gray-700">{message}</Text>
    </View>
  );
}
