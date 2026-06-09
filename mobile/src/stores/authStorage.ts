import * as SecureStore from "expo-secure-store";

import type { AuthHeaders } from "@/src/types/auth";

const AUTH_HEADERS_KEY = "authHeaders";

export async function saveAuthHeaders(authHeaders: AuthHeaders) {
  if (!hasRequiredAuthHeaders(authHeaders)) {
    throw new Error("Auth headers are missing");
  }

  await SecureStore.setItemAsync(
    AUTH_HEADERS_KEY,
    JSON.stringify(authHeaders)
  );
}

export async function getAuthHeaders() {
  const storedAuthHeaders = await SecureStore.getItemAsync(AUTH_HEADERS_KEY);

  if (!storedAuthHeaders) return null;

  try {
    const authHeaders = JSON.parse(storedAuthHeaders) as AuthHeaders;

    if (!isAuthHeadersValid(authHeaders)) {
      await clearAuthHeaders();
      return null;
    }

    return authHeaders;
  } catch {
    await clearAuthHeaders();
    return null;
  }
}

export async function clearAuthHeaders() {
  await SecureStore.deleteItemAsync(AUTH_HEADERS_KEY);
}

export function isAuthHeadersValid(authHeaders: AuthHeaders | null) {
  if (!authHeaders || !hasRequiredAuthHeaders(authHeaders)) return false;

  const expiry = Number(authHeaders.expiry);

  return Number.isFinite(expiry) && expiry * 1000 > Date.now();
}

function hasRequiredAuthHeaders(authHeaders: AuthHeaders) {
  return Boolean(
    authHeaders.accessToken &&
      authHeaders.client &&
      authHeaders.uid &&
      authHeaders.expiry
  );
}
