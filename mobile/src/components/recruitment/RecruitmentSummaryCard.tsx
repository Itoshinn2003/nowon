import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { colors } from "@/src/constants/colors";
import type {
  Recruitment,
  RecruitmentSummaryStatusTone,
} from "@/src/types/recruitment";
import { recruitmentPeopleLabel } from "@/src/utils/recruitment";

export function RecruitmentSummaryCard({
  recruitment,
  onCancelRecruitment,
  onPress,
  isCanceling = false,
  isCancelDisabled = false,
}: {
  recruitment: Recruitment;
  onCancelRecruitment?: (recruitment: Recruitment) => void;
  onPress?: (recruitment: Recruitment) => void;
  isCanceling?: boolean;
  isCancelDisabled?: boolean;
}) {
  const category = recruitment.recruitment_category?.name ?? "未分類";
  const status = recruitmentSummaryStatus(recruitment);

  return (
    <View
      className="gap-3 rounded-3xl border bg-white p-4"
      style={{ borderColor: colors.border }}
    >
      <Pressable className="gap-3" onPress={() => onPress?.(recruitment)}>
        <View className="min-w-0 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-gray-500">
              {category}
            </Text>
            <StatusBadge
              label={status.label}
              tone={status.tone}
            />
          </View>
          <Text className="text-base font-bold text-gray-950" numberOfLines={2}>
            {recruitment.purpose}
          </Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {recruitment.vibe}
          </Text>
        </View>

        <View className="border-t border-gray-100 pt-3">
          <DetailRow icon="users" text={recruitmentPeopleLabel(recruitment)} />
        </View>
      </Pressable>

      {onCancelRecruitment ? (
        <Button
          mode="outlined"
          textColor="#DC2626"
          loading={isCanceling}
          disabled={isCanceling || isCancelDisabled}
          style={{ borderColor: "#FCA5A5", borderRadius: 999 }}
          onPress={() => onCancelRecruitment(recruitment)}
        >
          キャンセル
        </Button>
      ) : null}
    </View>
  );
}

function recruitmentSummaryStatus(recruitment: Recruitment): {
  label: string;
  tone: RecruitmentSummaryStatusTone;
} {
  if (recruitment.status === "matched") {
    return { label: "成立済み", tone: "matched" };
  }

  if (recruitment.status === "active") {
    return { label: "募集中", tone: "active" };
  }

  return { label: "終了", tone: "pending" };
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: RecruitmentSummaryStatusTone;
}) {
  const styleByTone = {
    active: { backgroundColor: colors.stateSoft, color: colors.state },
    pending: { backgroundColor: colors.warningSoft, color: colors.warningText },
    matched: { backgroundColor: "#EEF2FF", color: "#4338CA" },
  }[tone];

  return (
    <View
      className="rounded-full px-2 py-1"
      style={{ backgroundColor: styleByTone.backgroundColor }}
    >
      <Text className="text-xs font-bold" style={{ color: styleByTone.color }}>
        {label}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <FontAwesome name={icon} size={14} color="#6B7280" />
      <Text className="min-w-0 flex-1 text-sm text-gray-600" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}
