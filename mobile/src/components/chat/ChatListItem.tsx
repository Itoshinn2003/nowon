import { Pressable, Text, View } from "react-native";

import { ParticipantAvatar } from "@/src/components/chat/ParticipantAvatar";
import type { ChatRoom } from "@/src/types/chat";

type Props = {
  chat: ChatRoom;
  currentUserId: number | null;
  onPress: (chatId: number) => void;
};

export function ChatListItem({
  chat,
  currentUserId,
  onPress,
}: Props) {
  const previewParticipant =
    chat.participants.find((participant) => participant.user_id !== currentUserId) ??
    chat.participants[0];
  const currentParticipant = chat.participants.find(
    (participant) => participant.user_id === currentUserId
  );
  const hasUnreadMessage = Boolean(
    currentUserId &&
      chat.last_message &&
      chat.last_message.user_id !== currentUserId &&
      chat.last_message.id > (currentParticipant?.last_read_message_id ?? 0)
  );

  return (
    <Pressable
      className="flex-row items-center gap-3 px-5 py-2.5"
      onPress={() => onPress(chat.id)}
    >
      <ParticipantAvatar
        initials={previewParticipant?.initials ?? "?"}
        avatarUrl={previewParticipant?.avatar_url}
        size={54}
      />

      <View className="min-w-0 flex-1 py-2.5">
        <View className="flex-row items-baseline gap-3">
          <Text
            className={[
              "min-w-0 flex-1 text-[15px] text-gray-950",
              hasUnreadMessage ? "font-extrabold" : "font-semibold",
            ].join(" ")}
            numberOfLines={1}
          >
            {chat.title}
          </Text>
          <Text
            className={[
              "text-[12px]",
              hasUnreadMessage ? "font-bold text-gray-900" : "text-gray-400",
            ].join(" ")}
          >
            {formatChatTime(chat.last_message?.created_at ?? chat.updated_at)}
          </Text>
        </View>

        <View className="mt-0.5 flex-row items-center gap-2">
          {hasUnreadMessage ? (
            <View className="h-2 w-2 rounded-full bg-blue-600" />
          ) : null}
          <Text
            className={[
              "min-w-0 flex-1 text-[14px] leading-5",
              hasUnreadMessage ? "font-bold text-gray-950" : "text-gray-500",
            ].join(" ")}
            numberOfLines={1}
          >
            {chat.last_message?.body ?? "チャットが作成されました"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function formatChatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}
