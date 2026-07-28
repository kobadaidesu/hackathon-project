// src/api/messageApi.ts
// ダイレクトメッセージに関するAPI関数をまとめたファイル。
// fetchやAuthorizationヘッダのことは考えなくていい(apiClientが全部やってくれる)。

import { apiRequest } from "./apiClient";
import type { Conversation, Message, MessageThread } from "../types/message";

/**
 * 会話一覧を取得する(相手ごとに最新1件と未読数、新着順)
 * 使用例: const { items } = await fetchConversations();
 */
export const fetchConversations = () =>
  apiRequest<{ items: Conversation[] }>("/api/messages");

/**
 * ヘッダーのバッジ用。未読メッセージの総数
 */
export const fetchUnreadCount = () =>
  apiRequest<{ unreadCount: number }>("/api/messages/unread-count");

/**
 * 相手とのやりとりを取得する(古い順)
 * ※このAPIを呼ぶと、相手からの未読は既読になる
 */
export const fetchMessagesWith = (userId: string) =>
  apiRequest<MessageThread>(`/api/messages/${userId}`);

/**
 * メッセージを送る
 * 使用例:
 *   const sent = await sendMessage(userId, "はじめまして");
 *   setMessages((prev) => [...prev, sent]);
 */
export const sendMessage = (userId: string, body: string) =>
  apiRequest<Message>(`/api/messages/${userId}`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
