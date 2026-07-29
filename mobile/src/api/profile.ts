import axios, { AxiosResponse } from "axios";

import { env } from "@/src/config/env";
import {
  getAuthHeaders,
  saveAuthHeaders,
} from "@/src/stores/authStorage";
import type { AuthHeaders } from "@/src/types/auth";
import type {
  CurrentProfileState,
  ProfileResponse,
  SaveProfileParams,
  UploadProfilePhotoParams,
  UserProfile,
} from "@/src/types/profile";

export async function getCurrentProfile() {
  const response = await axios.get<ProfileResponse>(`${env.apiBaseUrl}/profile`, {
    headers: await requestAuthHeaders(),
  });

  await persistResponseAuthHeaders(response);

  return normalizeCurrentProfile(response.data);
}

export async function getProfile() {
  const currentProfile = await getCurrentProfile();

  return currentProfile.profile;
}

export async function getUserProfile(userId: number) {
  const response = await axios.get<ProfileResponse>(
    `${env.apiBaseUrl}/profiles/${userId}`,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return normalizeProfile(response.data.profile);
}

export async function saveProfile(params: SaveProfileParams) {
  const response = await axios.patch<ProfileResponse>(
    `${env.apiBaseUrl}/profile`,
    {
      profile: {
        nickname: params.nickname,
        birth_date: params.birthDate,
        gender: params.gender,
        bio: params.bio,
      },
    },
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return normalizeProfile(response.data.profile);
}

export async function completeOnboarding() {
  const response = await axios.patch<ProfileResponse>(
    `${env.apiBaseUrl}/profile/complete_onboarding`,
    {},
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return normalizeCurrentProfile(response.data);
}

export async function uploadProfilePhoto(params: UploadProfilePhotoParams) {
  const formData = new FormData();

  formData.append("image", {
    uri: params.uri,
    name: params.name,
    type: params.type,
  } as unknown as Blob);

  const response = await axios.post(
    `${env.apiBaseUrl}/profile/photos`,
    formData,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data;
}

export async function deleteProfilePhoto(photoId: number) {
  const response = await axios.delete(
    `${env.apiBaseUrl}/profile/photos/${photoId}`,
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

function normalizeCurrentProfile(response: ProfileResponse): CurrentProfileState {
  return {
    profile: normalizeProfile(response.profile),
    onboardingCompletedAt: response.onboarding_completed_at,
  };
}

function normalizeProfile(profile: ProfileResponse["profile"]): UserProfile | null {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.user_id,
    nickname: profile.nickname,
    birthDate: profile.birth_date,
    age: profile.age,
    gender: profile.gender,
    bio: profile.bio,
    photos: profile.photos,
  };
}
