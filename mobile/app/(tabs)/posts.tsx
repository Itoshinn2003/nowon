import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/src/constants/colors";

type RecruitmentListTab = "mine" | "applied" | "matched";

type RecruitmentListItem = {
  id: number;
  category: string;
  purpose: string;
  vibe: string;
  place: string;
  people: string;
  statusLabel: string;
  statusTone: "active" | "pending" | "matched";
  timeLabel: string;
};

const tabs: Array<{ label: string; value: RecruitmentListTab }> = [
  { label: "自分の募集", value: "mine" },
  { label: "応募した募集", value: "applied" },
  { label: "成立した募集", value: "matched" },
];

const sampleRecruitments: Record<RecruitmentListTab, RecruitmentListItem[]> = {
  mine: [
    {
      id: 1,
      category: "ライブ",
      purpose: "ライブ後に感想話したい",
      vibe: "30分だけ気軽に",
      place: "東京ドーム周辺",
      people: "1人募集",
      statusLabel: "募集中",
      statusTone: "active",
      timeLabel: "残り42分",
    },
  ],
  applied: [
    {
      id: 2,
      category: "ご飯",
      purpose: "終演後に軽く食べたい",
      vibe: "ゆるく話したい",
      place: "水道橋駅周辺",
      people: "2〜4人",
      statusLabel: "応募中",
      statusTone: "pending",
      timeLabel: "返答待ち",
    },
  ],
  matched: [
    {
      id: 3,
      category: "飲み",
      purpose: "試合後に一杯だけ",
      vibe: "一杯だけ軽く",
      place: "新宿駅東口付近",
      people: "1人",
      statusLabel: "成立",
      statusTone: "matched",
      timeLabel: "18:40成立",
    },
  ],
};

const emptyMessages: Record<RecruitmentListTab, string> = {
  mine: "現在出している募集はありません",
  applied: "応募した募集はまだありません",
  matched: "成立した募集はまだありません",
};

export default function PostsScreen() {
  const [selectedTab, setSelectedTab] = useState<RecruitmentListTab>("mine");
  const recruitments = useMemo(
    () => sampleRecruitments[selectedTab],
    [selectedTab]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-12">
        <View className="gap-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold text-gray-950">募集</Text>
            <Text className="text-sm text-gray-500">
              募集の状況を確認できます
            </Text>
          </View>

          <View
            className="flex-row rounded-lg border bg-white p-1"
            style={{ borderColor: colors.border }}
          >
            {tabs.map((tab) => {
              const isSelected = selectedTab === tab.value;

              return (
                <Pressable
                  key={tab.value}
                  className="h-10 flex-1 items-center justify-center rounded-md px-2"
                  style={{
                    backgroundColor: isSelected ? colors.stateSoft : "#FFFFFF",
                  }}
                  onPress={() => setSelectedTab(tab.value)}
                >
                  <Text
                    className="text-xs font-bold"
                    numberOfLines={1}
                    style={{
                      color: isSelected ? colors.state : colors.textPrimary,
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {recruitments.length > 0 ? (
            <View className="gap-3">
              {recruitments.map((recruitment) => (
                <RecruitmentSummaryCard
                  key={recruitment.id}
                  recruitment={recruitment}
                />
              ))}
            </View>
          ) : (
            <EmptyState message={emptyMessages[selectedTab]} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type RecruitmentSummaryCardProps = {
  recruitment: RecruitmentListItem;
};

function RecruitmentSummaryCard({ recruitment }: RecruitmentSummaryCardProps) {
  return (
    <View
      className="gap-3 rounded-lg border bg-white p-4"
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-gray-500">
              {recruitment.category}
            </Text>
            <StatusBadge
              label={recruitment.statusLabel}
              tone={recruitment.statusTone}
            />
          </View>
          <Text className="text-base font-bold text-gray-950" numberOfLines={2}>
            {recruitment.purpose}
          </Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {recruitment.vibe}
          </Text>
        </View>
        <Text className="text-xs font-bold text-gray-500">
          {recruitment.timeLabel}
        </Text>
      </View>

      <View className="gap-2 border-t border-gray-100 pt-3">
        <DetailRow icon="map-marker" text={recruitment.place} />
        <DetailRow icon="users" text={recruitment.people} />
      </View>
    </View>
  );
}

type StatusBadgeProps = {
  label: string;
  tone: RecruitmentListItem["statusTone"];
};

function StatusBadge({ label, tone }: StatusBadgeProps) {
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

type DetailRowProps = {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  text: string;
};

function DetailRow({ icon, text }: DetailRowProps) {
  return (
    <View className="flex-row items-center gap-2">
      <FontAwesome name={icon} size={14} color="#6B7280" />
      <Text className="min-w-0 flex-1 text-sm text-gray-600" numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

type EmptyStateProps = {
  message: string;
};

function EmptyState({ message }: EmptyStateProps) {
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
