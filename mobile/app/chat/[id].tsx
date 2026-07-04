import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createChatMessage,
  getChatMessages,
  getChatRoom,
  markChatRoomRead,
} from "@/src/api/chat";
import { subscribeToChatRoom } from "@/src/api/chatCable";
import { ChatMessageBubble } from "@/src/components/chat/ChatMessageBubble";
import { TypingAvatarIndicator } from "@/src/components/chat/TypingAvatarIndicator";
import { BackIconButton } from "@/src/components/ui/BackIconButton";
import { colors } from "@/src/constants/colors";
import { useSubmitState } from "@/src/hooks/useSubmitState";
import type {
  ChatCablePayload,
  ChatMessage,
  ChatParticipant,
  ChatRoom,
  TypingUser,
} from "@/src/types/chat";
import { errorMessageFromError } from "@/src/utils/profile";

type ChatSubscription = {
  sendTyping: (isTyping: boolean) => void;
  close: () => void;
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatRoomId = Number(id);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const subscriptionRef = useRef<ChatSubscription | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingUserTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const isSendingTypingRef = useRef(false);
  const currentUserIdRef = useRef<number | null>(null);
  const participantsRef = useRef<ChatParticipant[]>([]);

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<number, TypingUser>>({});
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { isSubmitting, startSubmitting, finishSubmitting } = useSubmitState();

  const participantsByUserId = useMemo(() => {
    const participants = new Map<number, ChatParticipant>();

    room?.participants.forEach((participant) => {
      participants.set(participant.user_id, participant);
    });

    return participants;
  }, [room]);

  const typingUserList = useMemo(
    () => Object.values(typingUsers),
    [typingUsers]
  );

  const applyReadCounts = useCallback(
    (nextMessages: ChatMessage[], participants: ChatParticipant[]) =>
      nextMessages.map((message) => ({
        ...message,
        read_count: participants.filter(
          (participant) =>
            participant.user_id !== message.user_id &&
            (participant.last_read_message_id ?? 0) >= message.id
        ).length,
      })),
    []
  );

  const updateParticipantRead = useCallback(
    (userId: number, lastReadMessageId: number) => {
      setRoom((currentRoom) => {
        if (!currentRoom) return currentRoom;

        const participants = currentRoom.participants.map((participant) =>
          participant.user_id === userId
            ? {
                ...participant,
                last_read_message_id: Math.max(
                  participant.last_read_message_id ?? 0,
                  lastReadMessageId
                ),
              }
            : participant
        );

        participantsRef.current = participants;
        setMessages((currentMessages) =>
          applyReadCounts(currentMessages, participants)
        );

        return { ...currentRoom, participants };
      });
    },
    [applyReadCounts]
  );

  const markLatestRead = useCallback(
    async (lastMessageId: number) => {
      if (!Number.isFinite(chatRoomId)) return;

      try {
        await markChatRoomRead(chatRoomId, lastMessageId);
        if (currentUserIdRef.current) {
          updateParticipantRead(currentUserIdRef.current, lastMessageId);
        }
      } catch {
        // Reading state is best-effort and should not block the chat.
      }
    },
    [chatRoomId, updateParticipantRead]
  );

  const handleCablePayload = useCallback(
    (payload: ChatCablePayload) => {
      if (payload.type === "message") {
        setMessages((currentMessages) => {
          const existingIndex = currentMessages.findIndex(
            (message) => message.id === payload.message.id
          );

          if (existingIndex >= 0) {
            const nextMessages = [...currentMessages];
            nextMessages[existingIndex] = payload.message;
            return applyReadCounts(nextMessages, participantsRef.current);
          }

          return applyReadCounts(
            [...currentMessages, payload.message],
            participantsRef.current
          );
        });

        if (
          currentUserIdRef.current &&
          payload.message.user_id !== currentUserIdRef.current
        ) {
          markLatestRead(payload.message.id);
        }

        return;
      }

      if (payload.type === "read") {
        updateParticipantRead(payload.user_id, payload.last_read_message_id);
        return;
      }

      if (payload.type === "typing") {
        if (payload.user.user_id === currentUserIdRef.current) return;

        if (typingUserTimersRef.current[payload.user.user_id]) {
          clearTimeout(typingUserTimersRef.current[payload.user.user_id]);
        }

        if (!payload.is_typing) {
          setTypingUsers((currentUsers) => {
            const nextUsers = { ...currentUsers };
            delete nextUsers[payload.user.user_id];
            return nextUsers;
          });
          return;
        }

        setTypingUsers((currentUsers) => ({
          ...currentUsers,
          [payload.user.user_id]: payload.user,
        }));

        typingUserTimersRef.current[payload.user.user_id] = setTimeout(() => {
          setTypingUsers((currentUsers) => {
            const nextUsers = { ...currentUsers };
            delete nextUsers[payload.user.user_id];
            return nextUsers;
          });
        }, 3500);
      }
    },
    [
      applyReadCounts,
      markLatestRead,
      updateParticipantRead,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadChat() {
      if (!Number.isFinite(chatRoomId)) {
        setErrorMessage("チャットが見つかりません");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const roomResponse = await getChatRoom(chatRoomId);
        const messagesResponse = await getChatMessages(chatRoomId);
        const lastMessage =
          messagesResponse.messages[messagesResponse.messages.length - 1];
        const participants = lastMessage
          ? roomResponse.chat_room.participants.map((participant) =>
              participant.user_id === roomResponse.current_user_id
                ? {
                    ...participant,
                    last_read_message_id: Math.max(
                      participant.last_read_message_id ?? 0,
                      lastMessage.id
                    ),
                  }
                : participant
            )
          : roomResponse.chat_room.participants;

        if (!isMounted) return;

        currentUserIdRef.current = roomResponse.current_user_id;
        participantsRef.current = participants;
        setCurrentUserId(roomResponse.current_user_id);
        setRoom({ ...roomResponse.chat_room, participants });
        setMessages(applyReadCounts(messagesResponse.messages, participants));

        const subscription = await subscribeToChatRoom({
          chatRoomId,
          onMessage: handleCablePayload,
          onError: () => {
            setErrorMessage("リアルタイム接続が切断されました");
          },
        });

        if (!isMounted) {
          subscription.close();
          return;
        }

        subscriptionRef.current = subscription;
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(errorMessageFromError(error, "チャットを取得できませんでした"));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadChat();

    return () => {
      isMounted = false;
      subscriptionRef.current?.sendTyping(false);
      subscriptionRef.current?.close();
      subscriptionRef.current = null;

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      Object.values(typingUserTimersRef.current).forEach(clearTimeout);
      typingUserTimersRef.current = {};
    };
  }, [applyReadCounts, chatRoomId, handleCablePayload]);

  useEffect(() => {
    if (messages.length === 0) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length]);

  function handleChangeBody(nextBody: string) {
    setBody(nextBody);

    if (nextBody.trim()) {
      if (!isSendingTypingRef.current) {
        subscriptionRef.current?.sendTyping(true);
        isSendingTypingRef.current = true;
      }

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = setTimeout(() => {
        subscriptionRef.current?.sendTyping(false);
        isSendingTypingRef.current = false;
      }, 1500);
    } else {
      subscriptionRef.current?.sendTyping(false);
      isSendingTypingRef.current = false;
    }
  }

  async function handleSend() {
    const trimmedBody = body.trim();

    if (!trimmedBody || isSubmitting || !Number.isFinite(chatRoomId)) return;

    startSubmitting();
    setErrorMessage("");
    subscriptionRef.current?.sendTyping(false);
    isSendingTypingRef.current = false;

    try {
      const message = await createChatMessage(chatRoomId, trimmedBody);
      setMessages((currentMessages) => {
        if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
          return currentMessages;
        }

        return applyReadCounts([...currentMessages, message], participantsRef.current);
      });
      setBody("");
    } catch (error) {
      setErrorMessage(errorMessageFromError(error, "メッセージを送信できませんでした"));
    } finally {
      finishSubmitting();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          className="mx-4 mt-2 flex-row items-center gap-3 rounded-lg border bg-white px-3 py-3"
          style={{ borderColor: colors.border }}
        >
          <BackIconButton onPress={() => router.back()} />

          <Pressable
            className="min-w-0 flex-1"
            disabled={!room}
            onPress={() => {
              if (room) {
                router.push(`/recruitments/${room.recruitment_id}`);
              }
            }}
          >
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {room?.title ?? "チャット"}
            </Text>
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {room ? `参加者 ${room.participants.length}人` : "読み込み中"}
            </Text>
          </Pressable>
        </View>

        {errorMessage ? (
          <Text className="mx-4 mt-3 text-sm text-red-500">{errorMessage}</Text>
        ) : null}

        {isLoading ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-gray-500">読み込み中です</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            contentContainerClassName="gap-4 px-0 py-5"
            renderItem={({ item }) => (
              <ChatMessageBubble
                message={item}
                participant={participantsByUserId.get(item.user_id)}
                isMine={item.user_id === currentUserId}
                onPressParticipant={(participant) =>
                  router.push(`/profiles/${participant.user_id}`)
                }
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center px-6 py-20">
                <Text className="text-sm text-gray-500">
                  最初のメッセージを送ってみましょう
                </Text>
              </View>
            }
          />
        )}

        <TypingAvatarIndicator typingUsers={typingUserList} />

        <View className="px-4 pb-3">
          <View
            className="flex-row items-end gap-2 rounded-3xl border bg-white px-4 py-2"
            style={{ borderColor: colors.border }}
          >
            <TextInput
              className="max-h-28 min-h-9 flex-1 text-base text-gray-900"
              multiline
              value={body}
              editable={!isSubmitting}
              placeholder="メッセージを入力"
              placeholderTextColor="#9CA3AF"
              onChangeText={handleChangeBody}
            />
            <Pressable
              className="h-9 w-9 items-center justify-center rounded-full"
              disabled={!body.trim() || isSubmitting}
              style={{
                backgroundColor:
                  body.trim() && !isSubmitting ? colors.state : "#D1D5DB",
              }}
              onPress={handleSend}
            >
              <FontAwesome name="send" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
