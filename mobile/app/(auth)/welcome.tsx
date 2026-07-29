import { router } from "expo-router";
import { Image, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { GoogleContinueButton } from "@/src/components/auth/GoogleContinueButton";
import { colors } from "@/src/constants/colors";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="w-full gap-8">
        <View className="items-center gap-4">
          <Image
            source={require("@/assets/images/The logo of NowOn.png")}
            resizeMode="contain"
            style={{ height: 88, width: 240 }}
          />
          <Text className="text-center text-base leading-6 text-gray-600">
            今近くで、同じ目的の人を見つけよう。
          </Text>
        </View>

        <View className="gap-3">
          <Button
            mode="contained"
            buttonColor={colors.state}
            textColor="#FFFFFF"
            theme={{ colors: { primary: colors.state } }}
            onPress={() => router.push("/signup")}
          >
            メールで続ける
          </Button>
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
