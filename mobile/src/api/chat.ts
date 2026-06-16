import type { ChatPreview } from "@/src/types/chat";

const mockChatPreviews: ChatPreview[] = [
  {
    id: "tokyo-lunch",
    name: "佐藤 颯太",
    relatedPost: "東京駅でランチ",
    lastMessage: "12:30で大丈夫です！丸の内側で待ち合わせしましょう。",
    time: "10:24",
    unreadCount: 2,
    initials: "佐",
  },
  {
    id: "shibuya-cafe",
    name: "Mika",
    relatedPost: "渋谷でカフェ作業",
    lastMessage: "席取れそうなので先に入ってます。",
    time: "昨日",
    unreadCount: 0,
    initials: "M",
  },
  {
    id: "ueno-drink",
    name: "田中 智也",
    relatedPost: "上野で軽く飲み",
    lastMessage: "募集見ました。まだ参加できますか？",
    time: "月",
    unreadCount: 1,
    initials: "田",
  },
  {
    id: "ginza-dinner",
    name: "Aoi",
    relatedPost: "銀座で夜ごはん",
    lastMessage: "お店候補ありがとうございます。どちらも良さそうです。",
    time: "6/12",
    unreadCount: 0,
    initials: "A",
  },
];

export function getChatPreviews() {
  return mockChatPreviews;
}
