// src/pages/MessageThreadPage.tsx
// 特定の相手とのやりとり。
// リアルタイム通信は使わず(設計書§2.1)、この画面を開いている間だけ
// 5秒ごとに再取得する。会話一覧はポーリングしない。

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { Message } from "../types/message";
import type { UserSummary } from "../types/profile";
import { fetchMessagesWith, sendMessage } from "../api/messageApi";
import { useAuth } from "../contexts/AuthContext";
import { LEARNING_STAGE_LABELS } from "../types/profile";
import { Avatar } from "../components/common/Avatar";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";

const POLL_INTERVAL_MS = 5000;
const BODY_MAX_LENGTH = 1000;

export function MessageThreadPage() {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();

  const [partner, setPartner] = useState<UserSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const result = await fetchMessagesWith(userId);
    setPartner(result.partner);
    setMessages(result.items ?? []);
  }, [userId]);

  // 初回読み込み
  useEffect(() => {
    setIsLoading(true);
    setError("");
    load()
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : "メッセージの取得に失敗しました"
        )
      )
      .finally(() => setIsLoading(false));
  }, [load]);

  // ポーリング。画面を離れたら必ず止める
  useEffect(() => {
    const timer = setInterval(() => {
      // 定期取得の失敗は画面に出さない(一時的な通信断で操作を止めないため)
      load().catch((e) => console.error(e));
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // 新着が入ったら一番下へ
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId || body.trim().length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    try {
      const sent = await sendMessage(userId, body);
      // 送信結果をそのまま末尾に足す(再取得しない)
      setMessages((prev) => [...prev, sent]);
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error && messages.length === 0) return <ErrorMessage message={error} />;

  return (
    <div className="page message-thread-page">
      {partner && (
        <Link to={`/users/${partner.id}`} className="message-thread__header">
          <Avatar
            src={partner.avatarUrl}
            className="conversation-card__avatar"
          />
          <div>
            <p className="conversation-card__name">{partner.displayName}</p>
            {partner.learningStage && (
              <p className="conversation-card__stage">
                {LEARNING_STAGE_LABELS[partner.learningStage]}
              </p>
            )}
          </div>
        </Link>
      )}

      <div className="message-thread">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>まだメッセージがありません。最初の一言を送ってみましょう。</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === currentUser?.id;
            return (
              <div
                key={message.id}
                className={`message-bubble ${
                  isMine ? "message-bubble--mine" : "message-bubble--theirs"
                }`}
              >
                {message.body}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <ErrorMessage message={error} />}

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={body}
          maxLength={BODY_MAX_LENGTH}
          placeholder="メッセージを入力"
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="submit"
          className="button button--primary"
          disabled={isSubmitting || body.trim().length === 0}
        >
          {isSubmitting ? "送信中..." : "送信"}
        </button>
      </form>
    </div>
  );
}
