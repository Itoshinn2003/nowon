import "../global.css";

import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";

import { ProfileProvider } from "@/src/hooks/useProfile";
import { AuthProvider, useAuthStore } from "@/src/stores/authStore";

const STARTUP_SPLASH_DURATION_MS = 800;

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isStartupSplashDone, setIsStartupSplashDone] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsStartupSplashDone(true);
    }, STARTUP_SPLASH_DURATION_MS);

    return () => clearTimeout(timerId);
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <AuthNavigation isStartupSplashDone={isStartupSplashDone} />
      </AuthProvider>
    </PaperProvider>
  );
}

function AuthNavigation({
  isStartupSplashDone,
}: {
  isStartupSplashDone: boolean;
}) {
  const { status, isLoggedIn } = useAuthStore();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (status === "loading" || !isStartupSplashDone) return;

    let isMounted = true;

    async function hideSplash() {
      await SplashScreen.hideAsync();

      if (isMounted) {
        setIsReady(true);
      }
    }

    hideSplash();

    return () => {
      isMounted = false;
    };
  }, [isStartupSplashDone, status]);

  if (!isReady) {
    return null;
  }

  const inAuthGroup = segments[0] === "(auth)";

  let content;

  if (!isLoggedIn && !inAuthGroup) {
    content = <Redirect href="/welcome" />;
  } else if (isLoggedIn && inAuthGroup) {
    content = <Redirect href="/" />;
  } else {
    content = (
      <ProfileProvider>
        <Stack screenOptions={{ headerShown: false }}></Stack>
      </ProfileProvider>
    );
  }

  return content;
}
