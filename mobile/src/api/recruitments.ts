import axios, { AxiosResponse } from "axios";

import { env } from "@/src/config/env";
import {
  getAuthHeaders,
  saveAuthHeaders,
} from "@/src/stores/authStorage";
import type { AuthHeaders } from "@/src/types/auth";
import type {
  CreateRecruitmentParams,
  RecruitmentCategoriesResponse,
  RecruitmentResponse,
  RecruitmentsResponse,
} from "@/src/types/recruitment";
import { APPLICATION_LIMIT } from "@/src/utils/recruitment";

export async function getRecruitmentCategories() {
  const response = await axios.get<RecruitmentCategoriesResponse>(
    `${env.apiBaseUrl}/recruitment_categories`
  );

  return response.data.recruitment_categories;
}

export async function getRecruitments() {
  const response = await axios.get<RecruitmentsResponse>(
    `${env.apiBaseUrl}/recruitments`,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data.recruitments;
}

export async function getMyRecruitments() {
  const response = await axios.get<RecruitmentsResponse>(
    `${env.apiBaseUrl}/recruitments/mine`,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data.recruitments;
}

export async function createRecruitment(params: CreateRecruitmentParams) {
  const response = await axios.post<RecruitmentResponse>(
    `${env.apiBaseUrl}/recruitments`,
    {
      recruitment: {
        recruitment_type: params.recruitmentType,
        recruitment_category_id: params.recruitmentCategoryId,
        purpose: params.purpose,
        vibe: params.vibe,
        recruiting_people_min: params.recruitingPeopleMin,
        recruiting_people_max: params.recruitingPeopleMax,
        application_limit: APPLICATION_LIMIT,
        allowed_gender_policy: params.allowedGenderPolicy,
        latitude: params.latitude,
        longitude: params.longitude,
        description: params.description,
        safety_confirmed: params.safetyConfirmed,
      },
    },
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data.recruitment;
}

export async function cancelRecruitment(recruitmentId: number) {
  const response = await axios.patch<RecruitmentResponse>(
    `${env.apiBaseUrl}/recruitments/${recruitmentId}/cancel`,
    undefined,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data.recruitment;
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
