// src/components/common/TabBar.tsx
// デザイン StyleGuide 07「タブバー」。
// 4タブ＋中央の投稿ボタン。アクティブなタブだけアクセント色にする。
// ログイン済みのときだけ App から描画される。

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { fetchUnreadCount } from "../../api/messageApi";
import { useAuth } from "../../contexts/AuthContext";

// アイコンはデザイン内の SVG をそのまま持ってきている(24px / stroke 2)
const strokeProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const HomeIcon = () => (
  <svg {...strokeProps} aria-hidden="true">
    <path d="M4 11 12 4l8 7" />
    <path d="M6 10v9h12v-9" />
  </svg>
);

const RecruitIcon = () => (
  <svg {...strokeProps} aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M17 8h4M19 6v4" />
  </svg>
);

const MessageIcon = () => (
  <svg {...strokeProps} aria-hidden="true">
    <path d="M4 6h16v11H9l-4 3V6z" />
  </svg>
);

const ProfileIcon = () => (
  <svg {...strokeProps} aria-hidden="true">
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `tab-bar__item${isActive ? " tab-bar__item--active" : ""}`;

export function TabBar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // 未読数はポーリングせず、画面遷移のたびに取り直す。
  // 常時ポーリングするとサーバーレスの関数呼び出しが跳ねるため。
  // (もとは Header が持っていた処理をこちらへ移した)
  useEffect(() => {
    // 未ログイン時はそもそも描画しないので、取得もしない
    if (!currentUser) return;
    fetchUnreadCount()
      .then((result) => setUnreadCount(result.unreadCount ?? 0))
      .catch((e) => console.error(e));
  }, [currentUser, location.pathname]);

  // 未ログイン(ログイン・登録画面)では出さない
  if (!currentUser) return null;

  return (
    <nav className="tab-bar" aria-label="メインナビゲーション">
      <NavLink to="/" className={tabClass} end>
        <HomeIcon />
        <span className="tab-bar__label">ホーム</span>
      </NavLink>

      <NavLink to="/recruitments" className={tabClass}>
        <RecruitIcon />
        <span className="tab-bar__label">募集</span>
      </NavLink>

      {/* 中央の投稿ボタン。ラベルは持たず、円形のまま少し持ち上げる */}
      <span className="tab-bar__fab-slot">
        <Link to="/posts/new" className="tab-bar__fab" aria-label="投稿する">
          <PlusIcon />
        </Link>
      </span>

      <NavLink to="/messages" className={tabClass}>
        <span className="tab-bar__icon-wrap">
          <MessageIcon />
          {unreadCount > 0 && (
            <span className="tab-bar__badge">{unreadCount}</span>
          )}
        </span>
        <span className="tab-bar__label">メッセージ</span>
      </NavLink>

      <NavLink to="/profile" className={tabClass}>
        <ProfileIcon />
        <span className="tab-bar__label">マイページ</span>
      </NavLink>
    </nav>
  );
}
