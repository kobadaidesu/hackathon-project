// src/pages/NotFoundPage.tsx

import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <h1 className="page__title">ページが見つかりません</h1>
      <p>お探しのページは削除されたか、URLが間違っている可能性があります。</p>
      <Link to="/" className="button button--primary">
        タイムラインへ戻る
      </Link>
    </div>
  );
}
