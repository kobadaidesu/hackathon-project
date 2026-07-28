import type { UserSummary } from "./profile";

export type Message = {
  id: string;
  // 自分の発言かどうかは senderId と自分のIDを比べて判定する
  senderId: string;
  body: string;
  createdAt: string;
};

/** 特定の相手とのやりとり(古い順) */
export type MessageThread = {
  partner: UserSummary;
  items: Message[];
};

/** 会話一覧の1行 */
export type Conversation = {
  partner: UserSummary;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};
