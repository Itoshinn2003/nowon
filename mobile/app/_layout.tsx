import "../global.css";

import { Redirect, Stack, useSegments } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const isLoggedIn = false;
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  let content;

  if (!isLoggedIn && !inAuthGroup) {
    content = <Redirect href="/welcome" />;
  } else if (isLoggedIn && inAuthGroup) {
    content = <Redirect href="/" />;
  } else {
    content = <Stack screenOptions={{ headerShown: false }}></Stack>;
  }

  return <PaperProvider>{content}</PaperProvider>;
}
