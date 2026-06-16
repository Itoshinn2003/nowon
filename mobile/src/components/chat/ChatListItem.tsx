import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, Text, View } from "react-native";

import type { ChatPreview } from "@/src/types/chat";

type Props = {
  chat: ChatPreview;
  onPress: (chatId: string) => void;
};

export function ChatListItem({ chat, onPress }: Props) {
  return (
    <Pressable
      className="flex-row items-center gap-3 border-b border-gray-100 px-5 py-4"
      onPress={() => onPress(chat.id)}
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <Text className="text-base font-bold text-blue-700">
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
          <FontAwesome name="tag" size={11} color="#2563EB" />
          <Text
            className="text-xs font-semibold text-blue-600"
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
            <View className="min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5">
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
