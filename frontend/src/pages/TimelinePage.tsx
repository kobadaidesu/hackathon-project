// src/pages/TimelinePage.tsx

import { Link } from "react-router-dom";
import { PostList } from "../components/post/PostList";

export function TimelinePage() {
  return (
    <div className="timeline-page">
      <div className="timeline-page__header">
        <h1>タイムライン</h1>
        <Link to="/posts/new" className="button">
          投稿する
        </Link>
      </div>

      {/* データ取得・ローディング・エラー・空状態は全てPostListの中で完結している */}
      <PostList />
    </div>
  );
}