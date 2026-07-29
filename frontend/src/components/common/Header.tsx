// src/components/common/Header.tsx
// 全画面共通のヘッダー。
// デザインは下部タブバー方式なので、上部はアプリ名だけの細い帯にする。
// 画面間の移動は TabBar 側が持つ。未読バッジも TabBar へ移した。
// ログアウトは滅多に使わないので、常時見えるここではなくプロフィール画面へ置いた。

import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="header">
      <Link to="/" className="header__logo">
        Sudachi
      </Link>
    </header>
  );
}
