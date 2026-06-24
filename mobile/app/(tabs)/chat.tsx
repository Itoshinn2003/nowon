import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getChatPreviews } from "@/src/api/chat";
import { ChatList } from "@/src/components/chat/ChatList";
import { colors } from "@/src/constants/colors";

export default function ChatScreen() {
  const chats = getChatPreviews();

  function handlePressChat(chatId: string) {
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId },
    } as never);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-4 pb-3 pt-2">
        <Text className="text-2xl font-bold text-gray-950">チャット</Text>
      </View>
      <ChatList chats={chats} onPressChat={handlePressChat} />
    </SafeAreaView>
  );
}
