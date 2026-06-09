import axios from "axios";
import { router } from "expo-router";
import { View } from "react-native";

import { signUp } from "@/src/api/auth";
import { GoogleContinueButton } from "@/src/components/auth/GoogleContinueButton";
import { SignUpForm } from "@/src/components/auth/SignUpForm";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { DividerWithText } from "@/src/components/ui/DividerWithText";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import type { AuthErrorResponse, SignUpFormState } from "@/src/types/auth";

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
      await signUp(formData);
    } catch (error) {
      setValidationError(getSignUpErrorMessages(error));
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

function getSignUpErrorMessages(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as AuthErrorResponse | undefined)?.errors ??
      "新規登録に失敗しました。時間をおいて再度お試しください。"
    );
  }

  return "新規登録に失敗しました。時間をおいて再度お試しください。";
}
