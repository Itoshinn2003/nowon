import { env } from "@/src/config/env";
import { getAuthHeaders } from "@/src/stores/authStorage";
import type { ChatCablePayload } from "@/src/types/chat";

type ChatSubscription = {
  sendTyping: (isTyping: boolean) => void;
  close: () => void;
};

export async function subscribeToChatRoom({
  chatRoomId,
  onMessage,
  onError,
}: {
  chatRoomId: number;
  onMessage: (payload: ChatCablePayload) => void;
  onError?: () => void;
}): Promise<ChatSubscription> {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders?.accessToken || !authHeaders.client || !authHeaders.uid) {
    throw new Error("ログイン情報が見つかりません");
  }

  const identifier = JSON.stringify({
    channel: "ChatRoomChannel",
    chat_room_id: chatRoomId,
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

      onMessage(data.message as ChatCablePayload);
    } catch {
      onError?.();
    }
  };

  socket.onerror = () => {
    onError?.();
  };

  return {
    sendTyping(isTyping) {
      if (socket.readyState !== WebSocket.OPEN) return;

      socket.send(
        JSON.stringify({
          command: "message",
          identifier,
          data: JSON.stringify({
            action: "typing",
            is_typing: isTyping,
          }),
        })
      );
    },
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
