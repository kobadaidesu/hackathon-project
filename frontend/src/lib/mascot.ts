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

/**
 * 下部タブバーのアイコン。
 * public/images/_original/ の原本から透明部分を切り落として128pxへ縮めたもの。
 * 原本は退避用で .gitignore 済み(トリミング後のこちらだけコミットする)。
 */
/**
 * 画面の主役として置く一枚絵。
 * こちらも _original/ の原本から切り出して縮小・減色したもの。
 */
export const ILLUSTRATION = {
  login: "/images/login-hero.png",
} as const;

export const TAB_ICON = {
  home: "/images/tab-home.png",
  recruit: "/images/tab-recruit.png",
  message: "/images/tab-message.png",
  profile: "/images/tab-profile.png",
} as const;
