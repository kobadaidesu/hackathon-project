// src/pages/MessageListPage.tsx
// 会話一覧。相手ごとに最新の1件と未読数を出す。
// ここはポーリングしない(開いたときに取得するだけ)。

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Conversation } from "../types/message";
import { fetchConversations } from "../api/messageApi";
import { LEARNING_STAGE_LABELS } from "../types/profile";
import { Avatar } from "../components/common/Avatar";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";

export function MessageListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConversations()
      .then((result) => setConversations(result.items ?? []))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "メッセージの取得に失敗しました")
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="page message-list-page">
      <h1 className="page__title">メッセージ</h1>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <p>
            まだメッセージがありません。気になる人のプロフィールから送ってみましょう。
          </p>
        </div>
      ) : (
        <div className="message-list">
          {conversations.map((conversation) => (
            <Link
              key={conversation.partner.id}
              to={`/messages/${conversation.partner.id}`}
              className="conversation-card card-base"
            >
              <Avatar
                src={conversation.partner.avatarUrl}
                className="conversation-card__avatar"
              />

              <div className="conversation-card__body">
                <p className="conversation-card__name">
                  {conversation.partner.displayName}
                  {conversation.partner.learningStage && (
                    <span className="conversation-card__stage">
                      {LEARNING_STAGE_LABELS[conversation.partner.learningStage]}
                    </span>
                  )}
                </p>
                <p className="conversation-card__last">
                  {conversation.lastMessage}
                </p>
              </div>

              {conversation.unreadCount > 0 && (
                <span className="conversation-card__unread">
                  {conversation.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
