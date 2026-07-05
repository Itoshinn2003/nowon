import axios, { AxiosResponse } from "axios";

import { env } from "@/src/config/env";
import {
  getAuthHeaders,
  saveAuthHeaders,
} from "@/src/stores/authStorage";
import type { AuthHeaders } from "@/src/types/auth";
import type {
  ChatMessageResponse,
  ChatMessagesResponse,
  ChatRoomResponse,
  ChatRoomsResponse,
} from "@/src/types/chat";

export async function getChatRooms() {
  const response = await axios.get<ChatRoomsResponse>(
    `${env.apiBaseUrl}/chat_rooms`,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data;
}

export async function getChatRoom(chatRoomId: number) {
  const response = await axios.get<ChatRoomResponse>(
    `${env.apiBaseUrl}/chat_rooms/${chatRoomId}`,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data;
}

export async function getChatMessages(chatRoomId: number) {
  const response = await axios.get<ChatMessagesResponse>(
    `${env.apiBaseUrl}/chat_rooms/${chatRoomId}/messages`,
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data;
}

export async function createChatMessage(chatRoomId: number, body: string) {
  const response = await axios.post<ChatMessageResponse>(
    `${env.apiBaseUrl}/chat_rooms/${chatRoomId}/messages`,
    {
      message: {
        body: body.trim(),
      },
    },
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data.message;
}

export async function markChatRoomRead(
  chatRoomId: number,
  lastReadMessageId: number
) {
  const response = await axios.patch<ChatRoomResponse>(
    `${env.apiBaseUrl}/chat_rooms/${chatRoomId}/read`,
    {
      last_read_message_id: lastReadMessageId,
    },
    {
      headers: await requestAuthHeaders(),
    }
  );

  await persistResponseAuthHeaders(response);

  return response.data;
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
