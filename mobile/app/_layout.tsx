import "../global.css";

import { Redirect, Stack, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";

import { AuthProvider, useAuthStore } from "@/src/stores/authStore";

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AuthNavigation />
      </AuthProvider>
    </PaperProvider>
  );
}

function AuthNavigation() {
  const { status, isLoggedIn } = useAuthStore();
  const segments = useSegments();

  if (status === "loading") {
    return null;
  }

  const inAuthGroup = segments[0] === "(auth)";

  let content;

  if (!isLoggedIn && !inAuthGroup) {
    content = <Redirect href="/welcome" />;
  } else if (isLoggedIn && inAuthGroup) {
    content = <Redirect href="/" />;
  } else {
    content = <Stack screenOptions={{ headerShown: false }}></Stack>;
  }

  return content;
}
