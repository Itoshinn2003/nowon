import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";

type Section = {
  title: string;
  body: string;
};

type Props = {
  title: string;
  sections: Section[];
};

export function SettingsContentScreen({ title, sections }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <BackIconButton onPress={() => router.back()} />
        <Text className="text-base font-extrabold text-gray-950">
          {title}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.title} className="gap-2">
            <Text className="text-base font-bold text-gray-950">
              {section.title}
            </Text>
            <Text className="text-sm leading-6 text-gray-700">
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
