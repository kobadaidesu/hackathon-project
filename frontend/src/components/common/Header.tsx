// src/components/common/Header.tsx
// 全画面共通のヘッダー。
// ログイン画面・登録画面でも使われるので、未ログイン時はナビを出さない。

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchUnreadCount } from "../../api/messageApi";

export function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  // 未読数はポーリングせず、画面遷移のたびに取り直す。
  // 常時ポーリングするとサーバーレスの関数呼び出しが跳ねるため。
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    fetchUnreadCount()
      .then((result) => setUnreadCount(result.unreadCount ?? 0))
      .catch((e) => console.error(e));
  }, [currentUser, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // 成否にかかわらずログイン画面へ戻す
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        エンジニア版Instagram
      </Link>

      {currentUser && (
        <nav className="header__actions">
          <Link to="/">タイムライン</Link>
          <Link to="/recruitments">募集</Link>
          <Link to="/messages" className="header__messages">
            メッセージ
            {unreadCount > 0 && (
              <span className="header__badge">{unreadCount}</span>
            )}
          </Link>
          <Link to="/profile">プロフィール</Link>
          <button type="button" className="button" onClick={handleLogout}>
            ログアウト
          </button>
        </nav>
      )}
    </header>
  );
}
