import { FlatList } from "react-native";

import { ChatEmptyState } from "@/src/components/chat/ChatEmptyState";
import { ChatListItem } from "@/src/components/chat/ChatListItem";
import type { ChatPreview } from "@/src/types/chat";

type Props = {
  chats: ChatPreview[];
  onPressChat: (chatId: string) => void;
};

export function ChatList({ chats, onPressChat }: Props) {
  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      contentContainerClassName="pb-6"
      renderItem={({ item }) => (
        <ChatListItem chat={item} onPress={onPressChat} />
      )}
      ListEmptyComponent={<ChatEmptyState />}
    />
  );
}
