// src/components/post/PostCard.tsx

import { useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../../types/post";
import {
  sendNiceChallenge,
  removeNiceChallenge,
  deletePost,
} from "../../api/postApi";
import { Tag } from "../common/Tag";
// 修正後
import { LEARNING_STAGE_LABELS } from "../../types/profile";
import { POST_CATEGORY_LABELS } from "../../types/post";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  post: Post;
  // ナイス挑戦の結果を親(PostList)のstateに反映してもらうためのコールバック
  onUpdate: (updatedPost: Post) => void;
  // 渡されたときだけ削除ボタンを出す。削除後に一覧から取り除くのは親の役目
  onDelete?: (postId: string) => void;
};

export function PostCard({ post, onUpdate, onDelete }: Props) {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // 削除できるのは自分の投稿だけ(最終的な権限チェックはバックエンド側)
  const canDelete = Boolean(onDelete) && currentUser?.id === post.author.id;

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm("この投稿を削除しますか?")) return;

    setIsDeleting(true);
    setError("");
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "投稿の削除に失敗しました");
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

  return (
    <div className="post-card">
      {/* ヘッダー:アイコン・表示名・学習段階 */}
      <div className="post-card__header">
        {post.author.avatarUrl ? (
          <img
            src={post.author.avatarUrl}
            alt=""
            className="post-card__avatar"
          />
        ) : (
          <div className="post-card__avatar post-card__avatar--placeholder" />
        )}
        <div>
          <Link to={`/users/${post.author.id}`} className="post-card__author-name">
            {post.author.displayName}
          </Link>
          {post.author.learningStage && (
            <p className="post-card__learning-stage">
              {LEARNING_STAGE_LABELS[post.author.learningStage]}
            </p>
          )}
        </div>
      </div>

      {/* 投稿画像 */}
      <img src={post.imageUrl} alt="" className="post-card__image" />

      <div className="post-card__body">
        {/* カテゴリ */}
        <span className="post-card__category">
          {POST_CATEGORY_LABELS[post.category]}
        </span>

        {/* 本文 */}
        <p className="post-card__content">{post.content}</p>

        {/* 技術タグ */}
        {post.technologyTags.length > 0 && (
          <div className="post-card__tags">
            {post.technologyTags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* ナイス挑戦ボタン */}
        <div className="post-card__footer">
          <button
            type="button"
            className={`nice-button ${
              post.isNicedByMe ? "nice-button--active" : ""
            }`}
            onClick={handleNice}
            disabled={isSubmitting}
          >
            {post.isNicedByMe ? "✓ ナイス挑戦" : "ナイス挑戦"} {post.niceCount}
          </button>

          {canDelete && (
            <button
              type="button"
              className="button button--danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          )}
        </div>

        {error && <p className="post-card__error">{error}</p>}
      </div>
    </div>
  );
}