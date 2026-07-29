import axios, { AxiosResponse } from "axios";

import { env } from "@/src/config/env";
import {
  getAuthHeaders,
  saveAuthHeaders,
} from "@/src/stores/authStorage";
import type { AuthHeaders } from "@/src/types/auth";

export async function deleteAccount() {
  const response = await axios.delete(`${env.apiBaseUrl}/account`, {
    headers: await requestAuthHeaders(),
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
