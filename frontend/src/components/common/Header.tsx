// src/components/common/Header.tsx
// 全画面共通のヘッダー。
// ログイン画面・登録画面でも使われるので、未ログイン時はナビを出さない。

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
          <Link to="/profile">プロフィール</Link>
          <button type="button" className="button" onClick={handleLogout}>
            ログアウト
          </button>
        </nav>
      )}
    </header>
  );
}