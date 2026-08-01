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

  // 動くのは .message-thread の中だけ(スクロール領域がそこに閉じているため)。
  // ページ全体が飛ぶことはない
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  // 新着が入ったら一番下へ
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

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

  // 履歴が1件も無い状態でのエラー = そもそも開けなかった、として扱う
  const failedToLoad = Boolean(error) && messages.length === 0;

  // この画面は Header も TabBar も出していないので、読み込み中やエラーでも
  // 枠ごと差し替えない。早期returnすると戻る導線まで消えて、ブラウザの
  // 戻る以外に一覧へ帰れなくなるため
  return (
    <div className="message-thread-page">
      {/* この画面ではHeaderもTabBarも出ないので、一覧へ戻る導線をここが持つ */}
      <header className="message-thread__bar">
        <Link
          to="/messages"
          className="message-thread__back"
          aria-label="メッセージ一覧へ戻る"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>

        {partner && (
          <Link
            to={`/users/${partner.id}`}
            className="message-thread__partner"
          >
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
      </header>

      <div className="message-thread">
        {isLoading ? (
          <Loading />
        ) : failedToLoad ? (
          <ErrorMessage message={error} />
        ) : (
          /* 会話が短いときにバブルを下端へ寄せるための包み。
             スクロール側に justify-content: flex-end を使うと、あふれた分が
             上へ抜けてスクロールで戻せなくなるので、こちらで寄せる */
          <div className="message-thread__items">
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
        )}
      </div>

      {/* 送信の失敗は履歴を読める状態のまま入力欄の上に出す。
          開けなかった場合は上の一覧側に出しているので、ここでは繰り返さない */}
      {!failedToLoad && error && <ErrorMessage message={error} />}

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={body}
          maxLength={BODY_MAX_LENGTH}
          placeholder="メッセージを入力"
          onChange={(e) => setBody(e.target.value)}
          // キーボードが出ると可視領域が縮むので、最新のメッセージを
          // 入力欄の上へ送り直す
          onFocus={scrollToBottom}
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
