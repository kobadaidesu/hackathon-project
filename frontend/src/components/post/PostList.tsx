// src/components/post/PostList.tsx

import { useEffect, useState } from "react";
import type { Post } from "../../types/post";
import { fetchPosts } from "../../api/postApi";
import { PostCard } from "./PostCard";
import { Loading } from "../common/Loading";
import { ErrorMessage } from "../common/ErrorMessage";

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await fetchPosts();
      setPosts(result.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "投稿の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // PostCardの中でナイス挑戦が成功したら、該当の1件だけ差し替える
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  // 削除が成功したら一覧から取り除く(再取得はしない)
  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>まだ投稿がありません。最初の投稿を作成してみましょう。</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpdate={handlePostUpdate}
          onDelete={handlePostDelete}
        />
      ))}
    </div>
  );
}