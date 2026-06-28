import axios, { AxiosResponse } from "axios";

import { env } from "@/src/config/env";
import {
  getAuthHeaders,
  saveAuthHeaders,
} from "@/src/stores/authStorage";
import type { AuthHeaders } from "@/src/types/auth";
import type {
  RecruitmentApplicationResponse,
  RecruitmentApplicationsResponse,
} from "@/src/types/recruitment";

type CreateRecruitmentApplicationParams = {
  message?: string;
};

export async function createRecruitmentApplication(
  recruitmentId: number,
  params: CreateRecruitmentApplicationParams = {}
) {
  const response = await axios.post<RecruitmentApplicationResponse>(
    `${env.apiBaseUrl}/recruitments/${recruitmentId}/applications`,
    {
      application: {
        message: params.message?.trim() || undefined,
      },
    },
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data.application;
}

export async function getMyRecruitmentApplications() {
  const response = await axios.get<RecruitmentApplicationsResponse>(
    `${env.apiBaseUrl}/recruitment_applications/mine`,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data.applications;
}

export async function deleteRecruitmentApplication(applicationId: number) {
  const response = await axios.delete(
    `${env.apiBaseUrl}/recruitment_applications/${applicationId}`,
    {
      headers: await requestAuthHeaders(),
    }
  );

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
