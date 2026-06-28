import { Text, TextInput, View } from "react-native";
import { Button } from "react-native-paper";

import { colors } from "@/src/constants/colors";
import type { Recruitment } from "@/src/types/recruitment";
import { recruitmentPeopleLabel } from "@/src/utils/recruitment";

export function RecruitmentApplicationCard({
  recruitment,
  applyLabel,
  applicationMessage,
  isApplyDisabled,
  isApplying,
  disabledReason,
  onChangeApplicationMessage,
  onApply,
  onClose,
}: {
  recruitment: Recruitment;
  applyLabel: string;
  applicationMessage: string;
  isApplyDisabled: boolean;
  isApplying: boolean;
  disabledReason: string;
  onChangeApplicationMessage: (message: string) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const category = recruitment.recruitment_category?.name ?? "未分類";
  const canEditMessage = !isApplyDisabled && !isApplying;

  return (
    <View
      className="absolute bottom-[86px] left-4 right-4 gap-3 rounded-lg border bg-white p-4 shadow-sm"
      style={{ borderColor: colors.border }}
    >
      <View className="gap-1">
        <Text className="text-xs font-bold text-gray-500">{category}</Text>
        <Text className="text-base font-bold text-gray-950" numberOfLines={2}>
          {recruitment.purpose}
        </Text>
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {recruitment.vibe}
        </Text>
      </View>

      <View className="border-t border-gray-100 pt-3">
        <Text className="text-sm font-bold text-gray-700">
          {recruitmentPeopleLabel(recruitment)}
        </Text>
        {disabledReason ? (
          <Text className="mt-1 text-xs text-gray-500">{disabledReason}</Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-bold text-gray-700">メッセージ</Text>
        <TextInput
          className="min-h-[76px] rounded-lg border px-3 py-2 text-sm text-gray-900"
          style={{
            borderColor: colors.inputBorder,
            backgroundColor: canEditMessage ? colors.surface : "#F9FAFB",
          }}
          value={applicationMessage}
          editable={canEditMessage}
          multiline
          maxLength={120}
          textAlignVertical="top"
          placeholder="例: 20分ほど参加したいです!"
          placeholderTextColor="#9CA3AF"
          onChangeText={onChangeApplicationMessage}
        />
      </View>

      <View className="flex-row gap-3">
        <Button
          mode="outlined"
          className="flex-1"
          textColor={colors.textPrimary}
          style={{ borderColor: colors.inputBorder }}
          onPress={onClose}
        >
          閉じる
        </Button>
        <Button
          mode="contained"
          className="flex-1"
          buttonColor={colors.state}
          loading={isApplying}
          disabled={isApplyDisabled || isApplying}
          onPress={onApply}
        >
          {applyLabel}
        </Button>
      </View>
    </View>
  );
}
