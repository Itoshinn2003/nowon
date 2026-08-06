import "../global.css";

import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";

import { LoadingScreen } from "@/src/components/ui/LoadingScreen";
import { ProfileProvider, useProfile } from "@/src/hooks/useProfile";
import { usePushNotifications } from "@/src/hooks/usePushNotifications";
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

  usePushNotifications(isLoggedIn);

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
        <OnboardingNavigation />
      </ProfileProvider>
    );
  }

  return content;
}

function OnboardingNavigation() {
  const segments = useSegments();
  const { isLoading, errorMessage, onboardingCompletedAt } = useProfile();
  const inOnboardingGroup = segments[0] === "onboarding";
  const needsOnboarding = onboardingCompletedAt === null;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!errorMessage && needsOnboarding && !inOnboardingGroup) {
    return <Redirect href="/onboarding/profile" />;
  }

  if (!errorMessage && !needsOnboarding && inOnboardingGroup) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
