import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, Platform } from "react-native";
import { Button } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";

import { signInWithGoogle } from "@/src/api/auth";
import { env } from "@/src/config/env";
import { useAuthStore } from "@/src/stores/authStore";

WebBrowser.maybeCompleteAuthSession();

export function GoogleContinueButton() {
  const { saveSession } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handledIdTokenRef = useRef("");
  const requiredClientId = googleClientIdForPlatform();
  const isGoogleConfigured = Boolean(requiredClientId);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: env.googleClientId,
    iosClientId: env.googleIosClientId,
    androidClientId: env.googleAndroidClientId,
    redirectUri: googleRedirectUriForPlatform(),
    webClientId: env.googleWebClientId,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "error") {
      Alert.alert(
        "Googleログインに失敗しました",
        "時間をおいて再度お試しください。"
      );
      return;
    }

    if (response.type !== "success") return;

    const idToken = response.params.id_token;

    if (!idToken || handledIdTokenRef.current === idToken) {
      return;
    }

    handledIdTokenRef.current = idToken;
    authenticateWithGoogle(idToken);
  }, [response]);

  async function authenticateWithGoogle(idToken: string) {
    setIsSubmitting(true);

    try {
      const { authHeaders } = await signInWithGoogle(idToken);
      await saveSession(authHeaders);
      router.replace("/");
    } catch {
      handledIdTokenRef.current = "";
      Alert.alert(
        "Googleログインに失敗しました",
        "時間をおいて再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePress() {
    if (!isGoogleConfigured) {
      Alert.alert(
        "Google OAuth client ID が未設定です",
        googleClientIdErrorMessage()
      );
      return;
    }

    if (!request || isSubmitting) return;

    await promptAsync();
  }

  return (
    <Button
      mode="outlined"
      icon={({ size }) => (
        <Image
          source={require("@/assets/images/google-g.png")}
          style={{ height: size, width: size }}
        />
      )}
      loading={isSubmitting}
      disabled={isSubmitting}
      textColor="#1F2937"
      style={{ borderColor: "#D1D5DB" }}
      theme={{ colors: { primary: "#1F2937" } }}
      onPress={handlePress}
    >
      Googleで続ける
    </Button>
  );
}

function googleClientIdForPlatform() {
  if (Platform.OS === "ios") {
    return env.googleIosClientId;
  }

  if (Platform.OS === "android") {
    return env.googleAndroidClientId;
  }

  return env.googleWebClientId ?? env.googleExpoClientId ?? env.googleClientId;
}

function googleRedirectUriForPlatform() {
  if (Platform.OS !== "ios" || !env.googleIosClientId) {
    return undefined;
  }

  return `${iosGoogleUrlScheme(env.googleIosClientId)}:/oauthredirect`;
}

function iosGoogleUrlScheme(clientId: string) {
  const clientIdPrefix = clientId.replace(".apps.googleusercontent.com", "");

  return `com.googleusercontent.apps.${clientIdPrefix}`;
}

function googleClientIdErrorMessage() {
  if (Platform.OS === "ios") {
    return "Google Cloud で iOS OAuth client を作成し、EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID に設定してください。Bundle ID は com.nowon.mobile です。";
  }

  if (Platform.OS === "android") {
    return "Google Cloud で Android OAuth client を作成し、EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID に設定してください。Package name は com.nowon.mobile です。";
  }

  return "Google OAuth client ID を設定してください。";
}
