// src/components/post/PostCard.tsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../../types/post";
import { removeNiceChallenge, deletePost, sendNiceChallenge } from "../../api/postApi";
import { Tag } from "../common/Tag";
import { NiceButton } from "./NiceButton";
import { LEARNING_STAGE_LABELS } from "../../types/profile";
import { useAuth } from "../../contexts/AuthContext";
import { MASCOT } from "../../lib/mascot";
import { formatRelativeTime } from "../../lib/formatRelativeTime";

type Props = {
  post: Post;
  // ナイス挑戦の結果を親(PostList)のstateに反映してもらうためのコールバック
  onUpdate: (updatedPost: Post) => void;
  // 渡されたときだけ削除メニューを出す。削除後に一覧から取り除くのは親の役目
  onDelete?: (postId: string) => void;
};

export function PostCard({ post, onUpdate, onDelete }: Props) {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 外側クリックの判定に使う。ボタンとメニューをまとめて包む要素
  const menuRef = useRef<HTMLDivElement>(null);

  // 削除できるのは自分の投稿だけ(最終的な権限チェックはバックエンド側)
  const canDelete = Boolean(onDelete) && currentUser?.id === post.author.id;

  // メニューが開いている間だけ、外側クリックとEscを拾う
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm("この投稿を削除しますか?")) return;

    setIsDeleting(true);
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
    } catch (e) {
      // カード内の赤字はナイス専用に残してあるので、削除の失敗はダイアログで知らせる
      window.alert(e instanceof Error ? e.message : "投稿の削除に失敗しました");
      setIsDeleting(false);
    }
  };

  const handleNice = async () => {
    // 二重送信防止:通信中はここで弾く
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      // すでにナイス挑戦済みなら取り消し、まだなら送信する(トグル)
      const result = post.isNicedByMe
        ? await removeNiceChallenge(post.id)
        : await sendNiceChallenge(post.id);

      // ★重要:自分で+1/-1を計算しない。
      // レスポンスに入っている最新のniceCount / isNicedByMeでそのまま上書きする
      onUpdate({ ...post, ...result });
    } catch (e) {
      // バックエンドが日本語メッセージを返すのでそのまま表示する
      setError(
        e instanceof Error ? e.message : "ナイス挑戦の送信に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageLabel = post.author.learningStage
    ? LEARNING_STAGE_LABELS[post.author.learningStage]
    : null;
  const timeLabel = formatRelativeTime(post.createdAt);
  // 「個人開発に挑戦中・3時間前」の中黒区切り
  const metaLabel = [stageLabel, timeLabel].filter(Boolean).join("・");
  const hasTags = post.technologyTags.length > 0;

  // 置き場所が2通りあるので、実体は1つにして参照だけ差し替える
  const niceButton = (
    <NiceButton
      count={post.niceCount}
      isNiced={post.isNicedByMe}
      disabled={isSubmitting}
      onToggle={handleNice}
    />
  );

  return (
    <article className="post-card">
      {/* ヘッダー:左にアイコン・表示名・学習段階/時刻、右に⋯ */}
      <div className="post-card__header">
        <div className="post-card__header-main">
          <span className="post-card__avatar">
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="post-card__avatar-img" />
            ) : (
              // 未設定のときはマスコットで埋める(デザインの既定アバター)
              <img src={MASCOT.idle} alt="" className="post-card__avatar-img post-card__avatar-img--mascot" />
            )}
          </span>

          <span className="post-card__identity">
            <Link to={`/users/${post.author.id}`} className="post-card__author-name">
              {post.author.displayName}
            </Link>
            {metaLabel && <span className="post-card__meta">{metaLabel}</span>}
          </span>
        </div>

        <div className="post-card__header-actions">
          {canDelete && (
            // ここでのクリックはカード内のリンクへ伝播させない
            <div
              className="post-card__menu"
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="post-card__menu-button"
                aria-label="投稿メニュー"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                <span aria-hidden="true">⋯</span>
              </button>

              {isMenuOpen && (
                <div className="post-card__menu-list" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className="post-card__menu-item post-card__menu-item--danger"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleDelete();
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "削除中..." : "削除"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 投稿画像 */}
      {post.imageUrl && <img src={post.imageUrl} alt="" className="post-card__image" />}

      {/* タグがあれば本文の下に帯を作り、左にタグ・右にナイス。
          タグが無いときは帯を作らず本文の右へ置く。
          帯にナイスだけが乗ると、本文との間に用の無い空白ができるため */}
      {hasTags ? (
        <>
          <p className="post-card__content">{post.content}</p>

          <div className="post-card__meta-row">
            <div className="post-card__tags">
              {post.technologyTags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>

            {niceButton}
          </div>
        </>
      ) : (
        <div className="post-card__content-row">
          <p className="post-card__content">{post.content}</p>
          {niceButton}
        </div>
      )}

      {error && <p className="post-card__error">{error}</p>}
    </article>
  );
}
