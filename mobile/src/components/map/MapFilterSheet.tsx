import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { colors } from "@/src/constants/colors";

export type MapFilterCategory = "all" | "drink" | "live";
export type MapFilterGender = "all" | "male" | "female";

type Props = {
  visible: boolean;
  selectedCategory: MapFilterCategory;
  selectedGender: MapFilterGender;
  onApply: (filters: {
    category: MapFilterCategory;
    gender: MapFilterGender;
  }) => void;
  onClose: () => void;
};

export function MapFilterSheet({
  visible,
  selectedCategory,
  selectedGender,
  onApply,
  onClose,
}: Props) {
  const [draftCategory, setDraftCategory] =
    useState<MapFilterCategory>(selectedCategory);
  const [draftGender, setDraftGender] =
    useState<MapFilterGender>(selectedGender);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraftCategory(selectedCategory);
    setDraftGender(selectedGender);
  }, [selectedCategory, selectedGender, visible]);

  function resetDraftFilters() {
    setDraftCategory("all");
    setDraftGender("all");
  }

  function applyFilters() {
    onApply({
      category: draftCategory,
      gender: draftGender,
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
        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-4">
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
            {[
              { label: "すべて", value: "all" },
              { label: "飲み", value: "drink" },
              { label: "ライブ", value: "live" },
            ].map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                isSelected={draftCategory === option.value}
                onPress={() =>
                  setDraftCategory(option.value as MapFilterCategory)
                }
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
                onPress={() => setDraftGender(option.value as MapFilterGender)}
              />
            ))}
          </FilterSection>

          <View className="mt-6 flex-row gap-3">
            <Button
              mode="outlined"
              className="flex-1"
              textColor={colors.textPrimary}
              style={{ borderColor: colors.inputBorder }}
              onPress={resetDraftFilters}
            >
              リセット
            </Button>
            <Button
              mode="contained"
              className="flex-1"
              buttonColor={colors.textPrimary}
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
