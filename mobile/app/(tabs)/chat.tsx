import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getChatPreviews } from "@/src/api/chat";
import { ChatList } from "@/src/components/chat/ChatList";

export default function ChatScreen() {
  const chats = getChatPreviews();

  function handlePressChat(chatId: string) {
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    } as never);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="border-b border-gray-100 px-5 pb-4 pt-2">
        <Text className="text-2xl font-bold text-gray-900">チャット</Text>
      </View>
      <ChatList chats={chats} onPressChat={handlePressChat} />
    </SafeAreaView>
  );
}
