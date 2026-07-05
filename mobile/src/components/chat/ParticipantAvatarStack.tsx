import { Text, View } from "react-native";

import { ParticipantAvatar } from "@/src/components/chat/ParticipantAvatar";
import type { ChatParticipant, TypingUser } from "@/src/types/chat";

type Props = {
  participants: Array<ChatParticipant | TypingUser>;
  size?: number;
  maxVisible?: number;
};

export function ParticipantAvatarStack({
  participants,
  size = 28,
  maxVisible = 3,
}: Props) {
  const visibleParticipants = participants.slice(0, maxVisible);
  const remainingCount = Math.max(participants.length - visibleParticipants.length, 0);

  return (
    <View className="flex-row items-center">
      {visibleParticipants.map((participant, index) => (
        <View
          key={participant.user_id}
          style={{
            marginLeft: index === 0 ? 0 : -8,
            zIndex: visibleParticipants.length - index,
          }}
        >
          <ParticipantAvatar
            initials={participant.initials}
            avatarUrl={participant.avatar_url}
            size={size}
          />
        </View>
      ))}
      {remainingCount > 0 ? (
        <View
          className="items-center justify-center rounded-full bg-gray-200"
          style={{ height: size, marginLeft: -8, width: size }}
        >
          <Text className="text-xs font-bold text-gray-600">
            +{remainingCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
