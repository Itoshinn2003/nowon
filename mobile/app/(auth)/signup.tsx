import { router } from "expo-router";
import { View } from "react-native";

import { GoogleContinueButton } from "@/src/components/auth/GoogleContinueButton";
import { SignUpForm } from "@/src/components/auth/SignUpForm";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { DividerWithText } from "@/src/components/ui/DividerWithText";

export default function SignUpScreen() {
  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="w-full gap-8">
        <SignUpForm />

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
