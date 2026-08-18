import { Linking, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";

const CONTACT_EMAIL = "nowon.support@gmail.com";

export default function ContactScreen() {
  function openMailApp() {
    const subject = encodeURIComponent("NowOn お問い合わせ");
    const body = encodeURIComponent(
      "お問い合わせ内容:\n\n\n登録メールアドレス:\n"
    );

    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <BackIconButton onPress={() => router.back()} />
        <Text className="text-base font-extrabold text-gray-950">
          お問い合わせ
        </Text>
        <View className="w-10" />
      </View>

      <View className="gap-5 px-4 pt-4">
        <Text className="text-sm leading-6 text-gray-700">
          不具合、通報、アカウント、プライバシーに関するお問い合わせは以下のメールアドレスまでご連絡ください。
        </Text>
        <View
          className="rounded-lg border bg-white p-4"
          style={{ borderColor: colors.border }}
        >
          <Text className="text-base font-bold text-gray-950">
            {CONTACT_EMAIL}
          </Text>
        </View>
        <Button
          mode="contained"
          buttonColor={colors.textPrimary}
          onPress={openMailApp}
        >
          メールを作成
        </Button>
      </View>
    </SafeAreaView>
  );
}
