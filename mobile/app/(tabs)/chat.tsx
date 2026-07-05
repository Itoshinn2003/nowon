import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getChatRooms } from "@/src/api/chat";
import { ChatList } from "@/src/components/chat/ChatList";
import { colors } from "@/src/constants/colors";
import type { ChatRoom } from "@/src/types/chat";
import { errorMessageFromError } from "@/src/utils/profile";

export default function ChatScreen() {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadChats = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    try {
      const response = await getChatRooms();
      setChats(response.chat_rooms);
      setCurrentUserId(response.current_user_id);
    } catch (error) {
      setErrorMessage(errorMessageFromError(error, "チャットを取得できませんでした"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  function handlePressChat(chatId: number) {
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    } as never);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View className="px-5 pb-2 pt-2">
        <Text className="text-center text-xl font-bold text-gray-950">
          メッセージ
        </Text>
        {errorMessage ? (
          <Text className="mt-2 text-sm text-red-500">{errorMessage}</Text>
        ) : null}
        {isLoading ? (
          <Text className="mt-2 text-sm text-gray-500">読み込み中です</Text>
        ) : null}
      </View>
      <ChatList
        chats={chats}
        currentUserId={currentUserId}
        onPressChat={handlePressChat}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadChats(true)}
          />
        }
      />
    </SafeAreaView>
  );
}
