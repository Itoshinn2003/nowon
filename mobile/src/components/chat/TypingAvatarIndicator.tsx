import { Text, View } from "react-native";

import { ParticipantAvatarStack } from "@/src/components/chat/ParticipantAvatarStack";
import type { TypingUser } from "@/src/types/chat";

type Props = {
  typingUsers: TypingUser[];
};

export function TypingAvatarIndicator({ typingUsers }: Props) {
  if (typingUsers.length === 0) return null;

  return (
    <View className="flex-row items-center gap-2 px-4 pb-2">
      <ParticipantAvatarStack participants={typingUsers} size={28} />
      <View className="flex-row gap-1 rounded-full bg-white px-3 py-2">
        <Text className="text-base leading-4 text-gray-400">.</Text>
        <Text className="text-base leading-4 text-gray-400">.</Text>
        <Text className="text-base leading-4 text-gray-400">.</Text>
      </View>
    </View>
  );
}
