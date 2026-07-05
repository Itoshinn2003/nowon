import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";
import { minimalMapStyle } from "@/src/constants/map";
import { useRecruitment } from "@/src/hooks/useRecruitments";
import type {
  AllowedGenderPolicy,
  Recruitment,
  RecruitmentStatus,
  RecruitmentType,
} from "@/src/types/recruitment";
import { recruitmentPeopleLabel } from "@/src/utils/recruitment";

type FontAwesomeName = React.ComponentProps<typeof FontAwesome>["name"];

export default function RecruitmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recruitmentId = numberFromParam(id);
  const {
    recruitment,
    isLoading,
    errorMessage,
    reloadRecruitment,
  } = useRecruitment(recruitmentId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <BackIconButton onPress={() => router.back()} />
        <Text className="text-base font-extrabold text-gray-950">募集詳細</Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <ActivityIndicator color={colors.state} />
          <Text className="text-sm text-gray-500">読み込み中です</Text>
        </View>
      ) : errorMessage || !recruitment ? (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.stateSoft }}
          >
            <FontAwesome name="exclamation" size={20} color={colors.state} />
          </View>
          <Text className="text-center text-base font-bold text-gray-950">
            募集を表示できません
          </Text>
          <Text className="text-center text-sm leading-6 text-gray-500">
            {errorMessage || "募集が見つかりませんでした"}
          </Text>
          <Button
            mode="contained"
            buttonColor={colors.textPrimary}
            style={{ borderRadius: 999 }}
            onPress={reloadRecruitment}
          >
            再読み込み
          </Button>
        </View>
      ) : (
        <RecruitmentDetail recruitment={recruitment} />
      )}
    </SafeAreaView>
  );
}

function RecruitmentDetail({ recruitment }: { recruitment: Recruitment }) {
  const category = recruitment.recruitment_category?.name ?? "未分類";
  const categoryColor = recruitment.recruitment_category?.color ?? colors.state;
  const latitude = Number(recruitment.latitude);
  const longitude = Number(recruitment.longitude);
  const hasCoordinate = Number.isFinite(latitude) && Number.isFinite(longitude);

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-4 px-4 pb-8 pt-3"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="gap-4 rounded-3xl border bg-white p-5"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-start gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: withOpacity(categoryColor, "1A") }}
          >
            <FontAwesome
              name={categoryIconName(recruitment)}
              size={20}
              color={categoryColor}
            />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-xs font-bold text-gray-500">
                {category}
              </Text>
              <StatusBadge status={recruitment.status} />
            </View>
            <Text className="text-2xl font-extrabold text-gray-950">
              {recruitment.purpose}
            </Text>
            <Text className="text-sm leading-5 text-gray-500">
              {recruitment.vibe}
            </Text>
          </View>
        </View>

        <Pressable
          className="flex-row items-center gap-3 border-t border-gray-100 pt-4"
          onPress={() => router.push(`/profiles/${recruitment.user_id}`)}
        >
          <OwnerAvatar recruitment={recruitment} />
          <View className="min-w-0 flex-1">
            <Text className="text-xs font-bold text-gray-500">投稿者</Text>
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {recruitment.owner_profile?.nickname ?? "プロフィール未設定"}
            </Text>
          </View>
          <FontAwesome name="angle-right" size={18} color="#9CA3AF" />
        </Pressable>
      </View>

      <View
        className="gap-3 rounded-3xl border bg-white p-5"
        style={{ borderColor: colors.border }}
      >
        <Text className="text-base font-extrabold text-gray-950">募集内容</Text>
        <DetailRow
          icon="flag"
          label="目的"
          value={recruitment.purpose}
        />
        <DetailRow
          icon="comments"
          label="雰囲気"
          value={recruitment.vibe}
        />
        <DetailRow
          icon="tag"
          label="形式"
          value={recruitmentTypeLabel(recruitment.recruitment_type)}
        />
        <DetailRow
          icon="users"
          label="募集人数"
          value={recruitmentPeopleLabel(recruitment)}
        />
        <DetailRow
          icon="inbox"
          label="応募数"
          value={`${recruitment.active_application_count}件`}
        />
        <DetailRow
          icon="venus-mars"
          label="対象"
          value={genderPolicyLabel(recruitment.allowed_gender_policy)}
        />
        <DetailRow
          icon="check-circle"
          label="安全確認"
          value={recruitment.safety_confirmed ? "確認済み" : "未確認"}
        />
        <DetailRow
          icon="clock-o"
          label="期限"
          value={formatDateTime(recruitment.expires_at)}
        />
      </View>

      <View
        className="gap-3 rounded-3xl border bg-white p-5"
        style={{ borderColor: colors.border }}
      >
        <Text className="text-base font-extrabold text-gray-950">説明</Text>
        <Text className="text-sm leading-6 text-gray-700">
          {recruitment.description || "説明はありません"}
        </Text>
      </View>

      <View
        className="gap-3 rounded-3xl border bg-white p-5"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-base font-extrabold text-gray-950">場所</Text>
          {hasCoordinate ? (
            <Text className="text-xs text-gray-500">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </Text>
          ) : null}
        </View>
        {hasCoordinate ? (
          <View className="h-48 overflow-hidden rounded-2xl">
            <MapView
              provider={PROVIDER_GOOGLE}
              customMapStyle={minimalMapStyle}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              toolbarEnabled={false}
              style={{ flex: 1 }}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={{ latitude, longitude }}>
                <View
                  className="h-9 w-9 items-center justify-center rounded-full border-2 bg-white"
                  style={{ borderColor: categoryColor }}
                >
                  <FontAwesome
                    name="map-marker"
                    size={18}
                    color={categoryColor}
                  />
                </View>
              </Marker>
            </MapView>
          </View>
        ) : (
          <Text className="text-sm text-gray-500">位置情報がありません</Text>
        )}
      </View>
    </ScrollView>
  );
}

function OwnerAvatar({ recruitment }: { recruitment: Recruitment }) {
  return (
    <View
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: colors.stateSoft }}
    >
      <Text className="text-base font-extrabold" style={{ color: colors.state }}>
        {recruitment.owner_profile?.initials ?? "?"}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: FontAwesomeName;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3 border-t border-gray-100 pt-3">
      <View
        className="mt-0.5 h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.stateMuted }}
      >
        <FontAwesome name={icon} size={14} color="#4B5563" />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-xs font-bold text-gray-500">{label}</Text>
        <Text className="text-sm leading-5 text-gray-900">{value}</Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: RecruitmentStatus }) {
  const styleByStatus = {
    active: {
      label: "募集中",
      backgroundColor: colors.stateSoft,
      color: colors.state,
    },
    closed: {
      label: "終了",
      backgroundColor: colors.warningSoft,
      color: colors.warningText,
    },
    expired: {
      label: "期限切れ",
      backgroundColor: colors.warningSoft,
      color: colors.warningText,
    },
    matched: {
      label: "成立済み",
      backgroundColor: "#EEF2FF",
      color: "#4338CA",
    },
  }[status];

  return (
    <View
      className="rounded-full px-2 py-1"
      style={{ backgroundColor: styleByStatus.backgroundColor }}
    >
      <Text className="text-xs font-bold" style={{ color: styleByStatus.color }}>
        {styleByStatus.label}
      </Text>
    </View>
  );
}

function numberFromParam(value: string | undefined) {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function recruitmentTypeLabel(type: RecruitmentType) {
  if (type === "one_to_one") return "1対1";

  return "グループ";
}

function genderPolicyLabel(policy: AllowedGenderPolicy) {
  if (policy === "male_only") return "男性のみ";
  if (policy === "female_only") return "女性のみ";

  return "誰でも";
}

function categoryIconName(recruitment: Recruitment): FontAwesomeName {
  return (
    (recruitment.recruitment_category?.icon_name as FontAwesomeName) ??
    "map-marker"
  );
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

function withOpacity(color: string, opacityHex: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return `${color}${opacityHex}`;
  }

  return colors.stateSoft;
}
