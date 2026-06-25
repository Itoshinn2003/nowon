import axios from "axios";
import { router } from "expo-router";
import { View } from "react-native";

import { signIn } from "@/src/api/auth";
import { GoogleContinueButton } from "@/src/components/auth/GoogleContinueButton";
import { SignInForm } from "@/src/components/auth/SignInForm";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { DividerWithText } from "@/src/components/ui/DividerWithText";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import { useAuthStore } from "@/src/stores/authStore";
import type { AuthErrorResponse, SignInFormState } from "@/src/types/auth";

export default function SignInScreen() {
  const { saveSession } = useAuthStore();
  const {
    isSubmitting,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  } = useSubmitState();

  async function handleSubmit(formData: SignInFormState) {
    startSubmitting();
    try {
      const { authHeaders } = await signIn(formData);
      await saveSession(authHeaders);
      router.replace("/");
    } catch (error) {
      setValidationError(getSignInErrorMessages(error));
    } finally {
      finishSubmitting();
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="w-full gap-8">
        <SignInForm
          isSubmitting={isSubmitting}
          validationError={validationError}
          onSubmit={handleSubmit}
        />

        <View className="gap-4">
          <DividerWithText />
          <GoogleContinueButton />
        </View>

        <AuthSwitchLink
          prompt="アカウントをお持ちでない方"
          actionText="新規登録"
          onPress={() => router.replace("/signup")}
        />
      </View>
    </View>
  );
}

function getSignInErrorMessages(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as AuthErrorResponse | undefined)?.errors ??
      "ログインに失敗しました。時間をおいて再度お試しください。"
    );
  }

  return "ログインに失敗しました。時間をおいて再度お試しください。";
}
