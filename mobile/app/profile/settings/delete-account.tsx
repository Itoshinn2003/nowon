import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { deleteAccount } from "@/src/api/account";
import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";
import { useAuthStore } from "@/src/stores/authStore";
import { errorMessageFromError } from "@/src/utils/profile";

export default function DeleteAccountScreen() {
  const { clearSession } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function confirmDelete() {
    Alert.alert(
      "アカウントを削除しますか？",
      "プロフィール、画像、募集、応募、チャットなど、アカウントに関連するデータが削除されます。この操作は取り消せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: handleDelete,
        },
      ]
    );
  }

  async function handleDelete() {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await deleteAccount();
      await clearSession();
      router.replace("/welcome");
    } catch (error) {
      setErrorMessage(
        errorMessageFromError(error, "アカウントを削除できませんでした")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mx-4 mt-2 h-12 flex-row items-center justify-between">
        <BackIconButton onPress={() => router.back()} />
        <Text className="text-base font-extrabold text-gray-950">
          アカウント削除
        </Text>
        <View className="w-10" />
      </View>

      <View className="gap-5 px-4 pt-4">
        <Text className="text-sm leading-6 text-gray-700">
          アカウントを削除すると、プロフィール、画像、募集、応募、チャットなど、アカウントに関連するデータが削除されます。
        </Text>
        <Text className="text-sm leading-6 text-gray-700">
          法令上またはサービス運営上必要な情報は、必要な期間保存される場合があります。
        </Text>

        {errorMessage ? (
          <Text className="text-sm text-red-500">{errorMessage}</Text>
        ) : null}

        <Button
          mode="contained"
          buttonColor="#DC2626"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={confirmDelete}
        >
          アカウントを削除する
        </Button>
      </View>
    </SafeAreaView>
  );
}
