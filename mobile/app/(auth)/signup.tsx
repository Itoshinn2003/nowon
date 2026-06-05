import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>新規登録</Text>
      <Button mode="contained" onPress={() => router.push("/welcome")}>
        戻る
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
  },
});
