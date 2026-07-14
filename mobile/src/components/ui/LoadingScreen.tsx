import { ActivityIndicator, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function LoadingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={require("@/assets/images/The logo of NowOn.png")}
          resizeMode="contain"
          style={{ width: "78%", maxWidth: 320, height: 112 }}
        />
        <View className="mt-8">
          <ActivityIndicator color="#00C2A8" />
        </View>
      </View>
    </SafeAreaView>
  );
}
