// src/pages/TimelinePage.tsx

import { PostList } from "../components/post/PostList";

export function TimelinePage() {
  return (
    <div className="page timeline-page">
      {/* 投稿への導線は下部タブバー中央のボタンに集約したので、ここには置かない */}
      <div className="timeline-page__header">
        <h1 className="page__title">タイムライン</h1>
      </div>

      {/* データ取得・ローディング・エラー・空状態は全てPostListの中で完結している */}
      <PostList />
    </div>
  );
}