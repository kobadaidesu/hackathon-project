// src/api/techTagApi.ts
// 技術タグの固定マスタを取得するAPI関数。
// 投稿作成画面・プロフィール設定画面・募集作成画面で
// 「選択式のタグ一覧」を表示するために使う。
// 自由入力はしない設計なので、取得したリストの中から選ばせるだけでよい。

import { apiRequest } from "./apiClient";
import type { TechTag } from "../types/api";

/**
 * 技術タグの一覧を取得する(名前順、固定リスト)
 * 使用例:
 *   const tags = await fetchTechTags();
 *   // tags は [{ id: 1, name: "React" }, { id: 2, name: "TypeScript" }, ...] のような配列
 */
export const fetchTechTags = () =>
  apiRequest<{ items: TechTag[] }>("/api/tech-tags");