import { env } from "@/src/config/env";
import { getAuthHeaders } from "@/src/stores/authStorage";
import type { ChatNotificationCablePayload } from "@/src/types/chat";

type ChatNotificationsSubscription = {
  close: () => void;
};

export async function subscribeToChatNotifications({
  onMessage,
  onError,
}: {
  onMessage: (payload: ChatNotificationCablePayload) => void;
  onError?: () => void;
}): Promise<ChatNotificationsSubscription> {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders?.accessToken || !authHeaders.client || !authHeaders.uid) {
    throw new Error("ログイン情報が見つかりません");
  }

  const identifier = JSON.stringify({
    channel: "ChatNotificationsChannel",
  });
  const socket = new WebSocket(
    cableUrl({
      accessToken: authHeaders.accessToken,
      client: authHeaders.client,
      uid: authHeaders.uid,
    })
  );

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        command: "subscribe",
        identifier,
      })
    );
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type || !data.message) return;

      onMessage(data.message as ChatNotificationCablePayload);
    } catch {
      onError?.();
    }
  };

  socket.onerror = () => {
    onError?.();
  };

  return {
    close() {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    },
  };
}

function cableUrl(authHeaders: {
  accessToken: string;
  client: string;
  uid: string;
}) {
  const url = new URL(env.apiBaseUrl);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/cable";
  url.searchParams.set("access-token", authHeaders.accessToken);
  url.searchParams.set("client", authHeaders.client);
  url.searchParams.set("uid", authHeaders.uid);

  return url.toString();
}
