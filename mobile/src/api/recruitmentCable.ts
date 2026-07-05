import { env } from "@/src/config/env";
import { getAuthHeaders } from "@/src/stores/authStorage";
import type { RecruitmentCablePayload } from "@/src/types/recruitment";

type RecruitmentSubscription = {
  close: () => void;
};

export async function subscribeToRecruitments({
  onMessage,
  onError,
}: {
  onMessage: (payload: RecruitmentCablePayload) => void;
  onError?: () => void;
}): Promise<RecruitmentSubscription> {
  const authHeaders = await getAuthHeaders();

  if (!authHeaders?.accessToken || !authHeaders.client || !authHeaders.uid) {
    throw new Error("ログイン情報が見つかりません");
  }

  const identifier = JSON.stringify({
    channel: "RecruitmentsChannel",
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

      onMessage(data.message as RecruitmentCablePayload);
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
