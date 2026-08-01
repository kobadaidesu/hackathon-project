// src/components/common/Avatar.tsx
// ユーザーアイコン。アイコン未設定のときも、URLはあるが画像を読み込めなかった
// ときも、どちらもマスコットで埋める。
//
// 空の丸を出す実装にしていると、この2つが同じ見た目(下地の色だけ)になり、
// 「アイコンが出ない」ときにどちらが原因か切り分けられない。必ず何かを描く
// ようにして、画像が出ていない = 未設定 と読めるようにしている。

import { useEffect, useState } from "react";
import { MASCOT } from "../../lib/mascot";

type Props = {
  /** 未設定なら null。APIの avatarUrl をそのまま渡す */
  src: string | null | undefined;
  /** 名前が隣に出ている場所では空のままでよい(読み上げの重複を避ける) */
  alt?: string;
  className?: string;
  /** マスコットを出すときだけ足すクラス。下地を見せたい場所で使う */
  mascotClassName?: string;
};

export function Avatar({ src, alt = "", className, mascotClassName }: Props) {
  const [hasFailed, setHasFailed] = useState(false);

  // 一覧で別のユーザーに描き替わったとき、前のユーザーの失敗を持ち越さない
  useEffect(() => {
    setHasFailed(false);
  }, [src]);

  const showsMascot = !src || hasFailed;

  const classes = [className, showsMascot ? mascotClassName : null]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={showsMascot ? MASCOT.idle : src}
      alt={alt}
      className={classes || undefined}
      // マスコット自体が読めない場合もここへ来るが、状態が既にtrueなので
      // 再描画は起きず、ループにはならない
      onError={() => setHasFailed(true)}
    />
  );
}
