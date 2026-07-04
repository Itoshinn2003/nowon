import type { ReactElement } from "react";
import { FlatList, type RefreshControlProps } from "react-native";

import { ChatEmptyState } from "@/src/components/chat/ChatEmptyState";
import { ChatListItem } from "@/src/components/chat/ChatListItem";
import type { ChatRoom } from "@/src/types/chat";

type Props = {
  chats: ChatRoom[];
  currentUserId: number | null;
  onPressChat: (chatId: number) => void;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function ChatList({
  chats,
  currentUserId,
  onPressChat,
  refreshControl,
}: Props) {
  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => String(item.id)}
      contentContainerClassName="pb-6"
      refreshControl={refreshControl}
      renderItem={({ item }) => (
        <ChatListItem
          chat={item}
          currentUserId={currentUserId}
          onPress={onPressChat}
        />
      )}
      ListEmptyComponent={<ChatEmptyState />}
    />
  );
}
