import axios from "axios";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { signUp } from "@/src/api/auth";
import { AppleContinueButton } from "@/src/components/auth/AppleContinueButton";
import { GoogleContinueButton } from "@/src/components/auth/GoogleContinueButton";
import { SignUpForm } from "@/src/components/auth/SignUpForm";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { DividerWithText } from "@/src/components/ui/DividerWithText";
import { colors } from "@/src/constants/colors";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import type { AuthErrorResponse, SignUpFormState } from "@/src/types/auth";

export default function SignUpScreen() {
  const [successMessage, setSuccessMessage] = useState("");
  const {
    isSubmitting,
    successCount,
    validationError,
    startSubmitting,
    finishSubmitting,
    setValidationError,
  } = useSubmitState();

  async function handleSubmit(formData: SignUpFormState) {
    startSubmitting();
    setSuccessMessage("");
    let succeeded = false;

    try {
      await signUp(formData);
      succeeded = true;
      setSuccessMessage(
        "確認メールを送信しました。メール内のリンクから登録を完了してください。"
      );
    } catch (error) {
      setValidationError(getSignUpErrorMessages(error));
    } finally {
      finishSubmitting({ succeeded });
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="w-full gap-8">
        <SignUpForm
          isSubmitting={isSubmitting}
          resetSignal={successCount}
          validationError={validationError}
          onSubmit={handleSubmit}
        />

        {successMessage ? (
          <View
            className="rounded-lg border px-4 py-3"
            style={{
              backgroundColor: colors.stateMuted,
              borderColor: colors.stateSoft,
            }}
          >
            <Text className="text-sm font-bold" style={{ color: colors.stateDark }}>
              {successMessage}
            </Text>
          </View>
        ) : null}

        <View className="gap-4">
          <DividerWithText />
          <AppleContinueButton />
          <GoogleContinueButton />
        </View>

        <AuthSwitchLink
          prompt="すでにアカウントをお持ちの方"
          actionText="ログイン"
          onPress={() => router.replace("/signin")}
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
