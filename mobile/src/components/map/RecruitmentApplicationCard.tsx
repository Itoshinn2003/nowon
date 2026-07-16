import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image, Keyboard, Pressable, Text, TextInput, View } from "react-native";
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
  isOwnRecruitment = false,
  disabledReason,
  onChangeApplicationMessage,
  onApply,
  onClose,
  onPressOwnerProfile,
}: {
  recruitment: Recruitment;
  applyLabel: string;
  applicationMessage: string;
  isApplyDisabled: boolean;
  isApplying: boolean;
  isOwnRecruitment?: boolean;
  disabledReason: string;
  onChangeApplicationMessage: (message: string) => void;
  onApply: () => void;
  onClose: () => void;
  onPressOwnerProfile?: () => void;
}) {
  const category = recruitment.recruitment_category?.name ?? "未分類";
  const categoryColor = recruitment.recruitment_category?.color || colors.state;
  const categoryBackgroundColor = colorWithOpacity(categoryColor, "1A");
  const canEditMessage = !isApplyDisabled && !isApplying;
  const shouldShowApplyForm = !isOwnRecruitment;
  const remainingLabel = remainingTimeLabel(recruitment.expires_at);

  return (
    <View
      className="absolute bottom-[86px] left-4 right-4 rounded-[30px] bg-white/95 px-4 pb-4 pt-3 shadow-sm"
      onTouchStart={() => Keyboard.dismiss()}
      style={{
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { height: 8, width: 0 },
      }}
    >
      <View className="items-center">
        <View className="h-1 w-10 rounded-full bg-gray-200" />
      </View>

      <View className="mt-4 flex-row items-start gap-3">
        <OwnerAvatar
          recruitment={recruitment}
          color={categoryColor}
          onPress={onPressOwnerProfile}
        />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: categoryBackgroundColor }}
            >
              <Text
                className="text-xs font-extrabold"
                style={{ color: categoryColor }}
              >
                {category}
              </Text>
            </View>
            {isOwnRecruitment ? (
              <View className="rounded-full bg-gray-950 px-3 py-1.5">
                <Text className="text-xs font-extrabold text-white">
                  あなたの募集
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            className="mt-2 text-xl font-extrabold text-gray-950"
            numberOfLines={2}
          >
            {recruitment.purpose}
          </Text>
          <Text
            className="mt-1 text-sm leading-5 text-gray-500"
            numberOfLines={2}
          >
            {recruitment.vibe}
          </Text>
        </View>

        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          onPress={onClose}
        >
          <FontAwesome name="close" size={14} color="#6B7280" />
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        <InfoPill icon="users" text={recruitmentPeopleLabel(recruitment)} />
        {disabledReason && shouldShowApplyForm ? (
          <Text
            className="min-w-0 flex-1 text-xs font-bold text-gray-500"
            numberOfLines={2}
          >
            {disabledReason}
          </Text>
        ) : null}
      </View>

      {isOwnRecruitment ? (
        <View className="mt-4 flex-row gap-2">
          <OwnStatusPill
            icon="user-plus"
            label="応募"
            value={`${recruitment.active_application_count}/${recruitment.application_limit}`}
          />
          <OwnStatusPill
            icon="clock-o"
            label="残り"
            value={remainingLabel}
          />
          <OwnStatusPill
            icon="venus-mars"
            label="条件"
            value={allowedGenderLabel(recruitment.allowed_gender_policy)}
          />
        </View>
      ) : null}

      {shouldShowApplyForm ? (
        <View className="mt-4 gap-2">
          <TextInput
            className="min-h-[82px] rounded-[22px] px-4 py-3 text-sm leading-5 text-gray-900"
            style={{
              backgroundColor: canEditMessage ? "#F6F7F7" : "#F9FAFB",
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
      ) : null}

      {shouldShowApplyForm ? (
        <View className="mt-4">
          <Button
            mode="contained"
            buttonColor={colors.textPrimary}
            style={{ borderRadius: 999 }}
            contentStyle={{ height: 48 }}
            loading={isApplying}
            disabled={isApplyDisabled || isApplying}
            onPress={onApply}
          >
            {applyLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

function OwnerAvatar({
  recruitment,
  color,
  onPress,
}: {
  recruitment: Recruitment;
  color: string;
  onPress?: () => void;
}) {
  const avatarUrl = recruitment.owner_profile?.avatar_url;

  return (
    <Pressable
      className="h-12 w-12 items-center justify-center rounded-full border-[3px] bg-white"
      style={{ borderColor: color }}
      disabled={!onPress}
      onPress={onPress}
    >
      <View className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-100">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="h-full w-full" />
        ) : (
          <FontAwesome name="user" size={17} color="#667085" />
        )}
      </View>
    </Pressable>
  );
}

function InfoPill({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-full bg-gray-100 px-3 py-2">
      <FontAwesome name={icon} size={12} color="#4B5563" />
      <Text className="text-xs font-extrabold text-gray-700">{text}</Text>
    </View>
  );
}

function OwnStatusPill({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: string;
  value: string;
}) {
  return (
    <View className="min-w-0 flex-1 rounded-[20px] bg-gray-100 px-3 py-3">
      <View className="flex-row items-center gap-1.5">
        <FontAwesome name={icon} size={11} color="#6B7280" />
        <Text className="text-[11px] font-extrabold text-gray-500">
          {label}
        </Text>
      </View>
      <Text
        className="mt-1 text-sm font-extrabold text-gray-950"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function colorWithOpacity(color: string, opacityHex: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return `${color}${opacityHex}`;
  }

  return colors.stateSoft;
}

function remainingTimeLabel(expiresAt: string) {
  const expiresAtTime = Date.parse(expiresAt);

  if (!Number.isFinite(expiresAtTime)) {
    return "-";
  }

  const remainingMinutes = Math.max(
    0,
    Math.ceil((expiresAtTime - Date.now()) / 60_000)
  );

  if (remainingMinutes <= 0) {
    return "終了";
  }

  if (remainingMinutes < 60) {
    return `${remainingMinutes}分`;
  }

  const remainingHours = Math.floor(remainingMinutes / 60);

  return `${remainingHours}h`;
}

function allowedGenderLabel(policy: Recruitment["allowed_gender_policy"]) {
  if (policy === "male_only") {
    return "男性";
  }

  if (policy === "female_only") {
    return "女性";
  }

  return "誰でも";
}
