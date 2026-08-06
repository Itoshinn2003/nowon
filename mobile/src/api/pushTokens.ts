import axios, { AxiosResponse } from "axios";

import { env } from "@/src/config/env";
import {
  getAuthHeaders,
  saveAuthHeaders,
} from "@/src/stores/authStorage";
import type { AuthHeaders } from "@/src/types/auth";

type PushTokenPlatform = "ios" | "android" | "web" | "unknown";

type RegisterPushTokenParams = {
  token: string;
  platform: PushTokenPlatform;
};

export async function registerPushToken(params: RegisterPushTokenParams) {
  const response = await axios.post(
    `${env.apiBaseUrl}/push_tokens`,
    {
      push_token: {
        token: params.token,
        platform: params.platform,
      },
    },
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data;
}

export async function unregisterPushToken(token: string) {
  const response = await axios.delete(`${env.apiBaseUrl}/push_tokens`, {
    headers: await requestAuthHeaders(),
    data: {
      push_token: {
        token,
      },
    },
  });

  await persistResponseAuthHeaders(response);
}

async function requestAuthHeaders() {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders?.accessToken || !authHeaders.client || !authHeaders.uid) {
    throw new Error("ログイン情報が見つかりません");
  }

  return {
    "access-token": authHeaders.accessToken,
    client: authHeaders.client,
    uid: authHeaders.uid,
    expiry: authHeaders.expiry,
    "token-type": authHeaders.tokenType ?? "Bearer",
  };
}

async function persistResponseAuthHeaders(response: AxiosResponse) {
  const authHeaders = responseAuthHeaders(response);

  if (!authHeaders) return;

  await saveAuthHeaders(authHeaders);
}

function responseAuthHeaders(response: AxiosResponse): AuthHeaders | null {
  const accessToken = response.headers["access-token"];
  const client = response.headers.client;
  const uid = response.headers.uid;
  const expiry = response.headers.expiry;

  if (!accessToken || !client || !uid || !expiry) return null;

  return {
    accessToken,
    client,
    uid,
    expiry,
    tokenType: response.headers["token-type"],
  };
}
