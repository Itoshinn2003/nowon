import axios from "axios";

import type { ProfileFormState, UserProfile } from "@/src/types/profile";

const DEFAULT_BIRTH_DATE = new Date(2000, 0, 1);

export function defaultProfileFormState(): ProfileFormState {
  return {
    nickname: "",
    birthDate: DEFAULT_BIRTH_DATE,
    gender: "no_answer",
    bio: "",
  };
}

export function profileToFormState(
  profile: UserProfile | null
): ProfileFormState {
  if (!profile) return defaultProfileFormState();

  return {
    nickname: profile.nickname,
    birthDate: parseDate(profile.birthDate),
    gender: profile.gender,
    bio: profile.bio ?? "",
  };
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fileNameFromUri(uri: string) {
  return uri.split("/").pop() || "profile-photo.jpg";
}

export function mimeTypeFromUri(uri: string) {
  const extension = uri.split(".").pop()?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";

  return "image/jpeg";
}

export function errorMessageFromError(
  error: unknown,
  fallbackMessage: string
) {
  if (error instanceof Error && !axios.isAxiosError(error)) {
    return error.message || fallbackMessage;
  }

  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const status = error.response?.status;
  const responseData = error.response?.data as
    | { errors?: Record<string, string[]> | string[] | string }
    | undefined;
  const responseErrors = responseData?.errors;
  const details = displayErrors(responseErrors);

  if (details.length > 0) {
    return `${fallbackMessage}: ${details.join(" / ")}`;
  }

  if (status === 401) {
    return `${fallbackMessage}: ログイン情報が無効です`;
  }

  if (status) {
    return `${fallbackMessage}: HTTP ${status}`;
  }

  return `${fallbackMessage}: サーバーに接続できません`;
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function displayErrors(
  errors: Record<string, string[]> | string[] | string | undefined
) {
  if (!errors) return [];
  if (typeof errors === "string") return [errors];
  if (Array.isArray(errors)) return errors;

  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => `${field} ${message}`)
  );
}
