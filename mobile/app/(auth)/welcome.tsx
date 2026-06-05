import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="w-full gap-8">
        <View className="gap-3">
          <Text className="text-center text-3xl font-bold text-gray-900">
            ようこそ
          </Text>
          <Text className="text-center text-base leading-6 text-gray-600">
            今近くで、同じ目的の人を見つけよう。
          </Text>
        </View>

        <View className="gap-3">
          <Button mode="contained" onPress={() => router.push("/signup")}>
            メールで続ける
          </Button>
          <Button mode="outlined" onPress={() => {}}>
            Googleで続ける
          </Button>
        </View>

        <Pressable onPress={() => router.push("/signin")}>
          <Text className="text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方
            <Text className="font-bold text-blue-600"> ログイン</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
