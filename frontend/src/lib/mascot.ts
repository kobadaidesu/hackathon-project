// src/lib/mascot.ts
// マスコット画像のパスを1箇所にまとめる。
// デザイン(StyleGuide 08)の使い分け:
//   idle  … アバター・空状態・未ナイス(彩度を落として使う場面もある)
//   cheer … 投稿完了・進化・ナイスをタップした直後
//   heart … ナイス済の固定状態

export const MASCOT = {
  idle: "/images/chick-idle.png",
  cheer: "/images/chick-cheer.png",
  heart: "/images/chick-heart.png",
} as const;

export type MascotVariant = keyof typeof MASCOT;
