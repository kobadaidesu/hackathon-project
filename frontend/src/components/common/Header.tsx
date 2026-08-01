// src/components/common/Header.tsx
// 全画面共通のヘッダー。
// デザインは下部タブバー方式なので、上部はアプリ名だけの細い帯にする。
// 画面間の移動は TabBar 側が持つ。未読バッジも TabBar へ移した。
// ログアウトは滅多に使わないので、常時見えるここではなくプロフィール画面へ置いた。

import { Link, useLocation } from "react-router-dom";
import { LOGO } from "../../lib/mascot";
import { isMessageThreadRoute } from "../../lib/routes";

export function Header() {
  const { pathname } = useLocation();

  // DMのスレッドは縦を目一杯使いたいので、この帯は出さない。
  // 一覧へ戻る導線はスレッド側のヘッダーが持っている
  if (isMessageThreadRoute(pathname)) return null;

  return (
    <header className="header">
      {/* ロゴ画像がアプリ名そのものなので、alt にアプリ名を入れる */}
      <Link to="/" className="header__logo" aria-label="Sudachi ホームへ">
        <img src={LOGO} alt="Sudachi" width={300} height={66} />
      </Link>
    </header>
  );
}
