import { Pressable, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import type { RecruitmentListTab } from "@/src/types/recruitment";

const tabs: Array<{ label: string; value: RecruitmentListTab }> = [
  { label: "自分の募集", value: "mine" },
  { label: "応募した募集", value: "applied" },
  { label: "成立した募集", value: "matched" },
];

export function RecruitmentListTabs({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: RecruitmentListTab;
  onSelectTab: (tab: RecruitmentListTab) => void;
}) {
  return (
    <View
      className="flex-row rounded-full border bg-white p-1"
      style={{ borderColor: colors.border }}
    >
      {tabs.map((tab) => {
        const isSelected = selectedTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            className="h-11 flex-1 items-center justify-center rounded-full px-2"
            style={{
              backgroundColor: isSelected ? colors.stateSoft : "#FFFFFF",
            }}
            onPress={() => onSelectTab(tab.value)}
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
  );
}
