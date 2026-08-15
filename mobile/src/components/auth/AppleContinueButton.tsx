import * as AppleAuthentication from "expo-apple-authentication";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

import { signInWithApple } from "@/src/api/auth";
import { SocialContinueButton } from "@/src/components/auth/SocialContinueButton";
import { useAuthStore } from "@/src/stores/authStore";

export function AppleContinueButton() {
  const { saveSession } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    AppleAuthentication.isAvailableAsync()
      .then(setIsAvailable)
      .catch(() => setIsAvailable(false));
  }, []);

  if (Platform.OS !== "ios" || !isAvailable) return null;

  async function handlePress() {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple identity token is missing");
      }

      const { authHeaders } = await signInWithApple({
        identityToken: credential.identityToken,
        fullName: credential.fullName,
      });

      await saveSession(authHeaders);
      router.replace("/");
    } catch (error) {
      if (isAppleCancelError(error)) return;

      Alert.alert(
        "Appleログインに失敗しました",
        "時間をおいて再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SocialContinueButton
      icon={({ size, color }) => (
        <FontAwesome name="apple" size={size} color={color} />
      )}
      loading={isSubmitting}
      disabled={isSubmitting}
      onPress={handlePress}
    >
      Appleで続ける
    </SocialContinueButton>
  );
}

function isAppleCancelError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ERR_REQUEST_CANCELED"
  );
}
