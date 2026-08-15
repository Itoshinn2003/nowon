import * as SecureStore from "expo-secure-store";

const PUSH_TOKEN_KEY = "expoPushToken";

export async function saveStoredPushToken(token: string) {
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function getStoredPushToken() {
  return SecureStore.getItemAsync(PUSH_TOKEN_KEY);
}

export async function clearStoredPushToken() {
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
