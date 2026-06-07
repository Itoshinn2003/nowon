import { router } from "expo-router";
import { View } from "react-native";

import { GoogleContinueButton } from "@/src/components/auth/GoogleContinueButton";
import { SignUpForm } from "@/src/components/auth/SignUpForm";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { DividerWithText } from "@/src/components/ui/DividerWithText";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import type { SignUpFormState } from "@/src/types/auth";

export default function SignUpScreen() {
  const {
    isSubmitting,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  } = useSubmitState();

  async function handleSubmit(formData: SignUpFormState) {
    startSubmitting();

    try {
      console.log(formData.email, formData.password);
      // TODO: signup API ができたら、ここで formData を送信する。
      await Promise.resolve(formData);
    } catch {
      setValidationError("新規登録に失敗しました。時間をおいて再度お試しください。");
    } finally {
      finishSubmitting();
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="w-full gap-8">
        <SignUpForm
          isSubmitting={isSubmitting}
          validationError={validationError}
          onSubmit={handleSubmit}
        />

        <View className="gap-4">
          <DividerWithText />
          <GoogleContinueButton />
        </View>

        <AuthSwitchLink
          prompt="すでにアカウントをお持ちの方"
          actionText="ログイン"
          onPress={() => router.push("/signin")}
        />
      </View>
    </View>
  );
}
