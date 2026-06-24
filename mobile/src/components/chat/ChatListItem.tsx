import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import type { ChatPreview } from "@/src/types/chat";

type Props = {
  chat: ChatPreview;
  onPress: (chatId: string) => void;
};

export function ChatListItem({ chat, onPress }: Props) {
  return (
    <Pressable
      className="flex-row items-center gap-3 rounded-lg border bg-white p-4"
      style={{ borderColor: colors.border }}
      onPress={() => onPress(chat.id)}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.stateSoft }}
      >
        <Text className="text-base font-bold" style={{ color: colors.state }}>
          {chat.initials}
        </Text>
      </View>

      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="flex-1 text-base font-bold text-gray-900"
            numberOfLines={1}
          >
            {chat.name}
          </Text>
          <Text className="text-xs text-gray-400">{chat.time}</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <FontAwesome name="tag" size={11} color={colors.state} />
          <Text
            className="text-xs font-semibold"
            style={{ color: colors.state }}
            numberOfLines={1}
          >
            {chat.relatedPost}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Text className="flex-1 text-sm text-gray-500" numberOfLines={1}>
            {chat.lastMessage}
          </Text>
          {chat.unreadCount > 0 ? (
            <View
              className="min-w-5 items-center justify-center rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: colors.state }}
            >
              <Text className="text-xs font-bold text-white">
                {chat.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
