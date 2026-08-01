// src/lib/routes.ts
// パスを見て画面の種類を判定する。ルート定義は App.tsx にあるが、
// 「この画面かどうか」を Header と TabBar の両方が知りたい場面があるので、
// 判定だけをここへ出して1箇所に持つ。

/**
 * DMのスレッド画面(/messages/:userId)か。
 *
 * スレッドは縦を目一杯使いたいので、この画面だけ Header と TabBar を出さない。
 * 会話一覧(/messages)は通常の画面なので偽を返す。
 */
export function isMessageThreadRoute(pathname: string): boolean {
  return /^\/messages\/[^/]+$/.test(pathname);
}
