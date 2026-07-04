import { Pressable, Text, View } from "react-native";

import { ParticipantAvatar } from "@/src/components/chat/ParticipantAvatar";
import { colors } from "@/src/constants/colors";
import type { ChatMessage, ChatParticipant } from "@/src/types/chat";

type Props = {
  message: ChatMessage;
  participant?: ChatParticipant;
  isMine: boolean;
  onPressParticipant?: (participant: ChatParticipant) => void;
};

export function ChatMessageBubble({
  message,
  participant,
  isMine,
  onPressParticipant,
}: Props) {
  return (
    <View className={`flex-row gap-2 px-4 ${isMine ? "justify-end" : "justify-start"}`}>
      {!isMine ? (
        <Pressable
          disabled={!participant}
          onPress={() => {
            if (participant) {
              onPressParticipant?.(participant);
            }
          }}
        >
          <ParticipantAvatar
            initials={participant?.initials ?? "?"}
            avatarUrl={participant?.avatar_url}
            size={32}
          />
        </Pressable>
      ) : null}

      <View className={`max-w-[78%] gap-1 ${isMine ? "items-end" : "items-start"}`}>
        {!isMine ? (
          <Text className="text-xs font-semibold text-gray-500">
            {participant?.nickname ?? "プロフィール未設定"}
          </Text>
        ) : null}
        <View
          className="rounded-2xl px-4 py-3"
          style={{
            backgroundColor: isMine ? colors.state : "#FFFFFF",
            borderColor: isMine ? colors.state : colors.border,
            borderWidth: isMine ? 0 : 1,
          }}
        >
          <Text className={`text-base ${isMine ? "text-white" : "text-gray-900"}`}>
            {message.body}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {isMine && message.read_count > 0 ? (
            <Text className="text-[11px] text-gray-400">
              {message.read_count === 1 ? "既読" : `既読 ${message.read_count}`}
            </Text>
          ) : null}
          <Text className="text-[11px] text-gray-400">
            {formatMessageTime(message.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
