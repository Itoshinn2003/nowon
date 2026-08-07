export type ChatParticipant = {
  id: number;
  user_id: number;
  nickname: string;
  initials: string;
  avatar_url: string | null;
  last_read_message_id: number | null;
};

export type ChatMessage = {
  id: number;
  chat_room_id: number;
  user_id: number;
  body: string;
  read_count: number;
  created_at: string;
  updated_at: string;
};

export type ChatRoom = {
  id: number;
  recruitment_id: number;
  title: string;
  participants: ChatParticipant[];
  last_message: ChatMessage | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
};

export type ChatRoomsResponse = {
  chat_rooms: ChatRoom[];
  current_user_id: number;
};

export type ChatRoomResponse = {
  chat_room: ChatRoom;
  current_user_id: number;
};

export type ChatMessagesResponse = {
  messages: ChatMessage[];
  current_user_id: number;
};

export type ChatMessageResponse = {
  message: ChatMessage;
};

export type TypingUser = {
  user_id: number;
  nickname: string;
  initials: string;
  avatar_url: string | null;
};

export type ChatCablePayload =
  | {
      type: "message";
      message: ChatMessage;
    }
  | {
      type: "read";
      user_id: number;
      last_read_message_id: number;
    }
  | {
      type: "typing";
      is_typing: boolean;
      user: TypingUser;
    };

export type ChatNotificationCablePayload = {
  type: "chat_message_created";
  chat_room_id: number;
  message: ChatMessage;
};
