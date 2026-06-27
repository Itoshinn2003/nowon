import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
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
import type { RecruitmentCategory } from "@/src/types/recruitment";

export type MapFilterCategory = "all" | number;
export type MapFilterGender = "all" | "male" | "female";
export type MapFilterRecruitmentType = "all" | "one_to_one" | "group";

type Props = {
  visible: boolean;
  categories: RecruitmentCategory[];
  selectedCategory: MapFilterCategory;
  selectedGender: MapFilterGender;
  selectedRecruitmentType: MapFilterRecruitmentType;
  onApply: (filters: {
    category: MapFilterCategory;
    gender: MapFilterGender;
    recruitmentType: MapFilterRecruitmentType;
  }) => void;
  onClose: () => void;
};

export function MapFilterSheet({
  visible,
  categories,
  selectedCategory,
  selectedGender,
  selectedRecruitmentType,
  onApply,
  onClose,
}: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [draftCategory, setDraftCategory] =
    useState<MapFilterCategory>(selectedCategory);
  const [draftGender, setDraftGender] =
    useState<MapFilterGender>(selectedGender);
  const [draftRecruitmentType, setDraftRecruitmentType] =
    useState<MapFilterRecruitmentType>(selectedRecruitmentType);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraftCategory(selectedCategory);
    setDraftGender(selectedGender);
    setDraftRecruitmentType(selectedRecruitmentType);
  }, [selectedCategory, selectedGender, selectedRecruitmentType, visible]);

  function resetDraftFilters() {
    setDraftCategory("all");
    setDraftGender("all");
    setDraftRecruitmentType("all");
  }

  function applyFilters() {
    onApply({
      category: draftCategory,
      gender: draftGender,
      recruitmentType: draftRecruitmentType,
    });
    onClose();
  }

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
            maxHeight: height * 0.82,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <ScrollView
            style={{ maxHeight: height * 0.62 }}
            contentContainerClassName="pb-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-gray-950">
                  条件で絞る
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  表示する募集を絞り込みます
                </Text>
              </View>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                onPress={onClose}
              >
                <FontAwesome name="close" size={16} color="#374151" />
              </Pressable>
            </View>

            <FilterSection title="カテゴリ">
              <FilterChip
                label="すべて"
                isSelected={draftCategory === "all"}
                onPress={() => setDraftCategory("all")}
              />
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.name}
                  isSelected={draftCategory === category.id}
                  onPress={() => setDraftCategory(category.id)}
                />
              ))}
            </FilterSection>

            <FilterSection title="性別">
              {[
                { label: "すべて", value: "all" },
                { label: "男性", value: "male" },
                { label: "女性", value: "female" },
              ].map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isSelected={draftGender === option.value}
                  onPress={() =>
                    setDraftGender(option.value as MapFilterGender)
                  }
                />
              ))}
            </FilterSection>

            <FilterSection title="募集タイプ">
              {[
                { label: "すべて", value: "all" },
                { label: "1人募集", value: "one_to_one" },
                { label: "複数人募集", value: "group" },
              ].map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  isSelected={draftRecruitmentType === option.value}
                  onPress={() =>
                    setDraftRecruitmentType(
                      option.value as MapFilterRecruitmentType
                    )
                  }
                />
              ))}
            </FilterSection>
          </ScrollView>

          <View className="min-h-14 flex-row gap-3 border-t border-gray-100 pt-4">
            <Button
              mode="outlined"
              className="flex-1"
              textColor={colors.textPrimary}
              style={{ minHeight: 44, borderColor: colors.inputBorder }}
              onPress={resetDraftFilters}
            >
              リセット
            </Button>
            <Button
              mode="contained"
              className="flex-1"
              buttonColor={colors.textPrimary}
              style={{ minHeight: 44 }}
              onPress={applyFilters}
            >
              適用する
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
};

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View className="gap-3 border-t border-gray-100 py-4">
      <Text className="text-sm font-bold text-gray-700">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

type FilterChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
  return (
    <Pressable
      className="rounded-full border px-4 py-2"
      style={{
        backgroundColor: isSelected ? colors.stateSoft : colors.surface,
        borderColor: isSelected ? colors.state : colors.inputBorder,
      }}
      onPress={onPress}
    >
      <Text
        className="text-sm font-bold"
        style={{ color: isSelected ? colors.state : colors.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
