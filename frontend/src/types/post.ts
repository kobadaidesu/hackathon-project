import type { UserSummary, CharacterStage } from "./profile";

export type PostCategory =
  | "learning" | "work_in_progress" | "solved" | "error"
  | "new_technology" | "event" | "environment" | "idea";

export type Post = {
  id: string;
  author: UserSummary;
  imageUrl: string;
  content: string;
  category: PostCategory;
  technologyTags: string[];
  niceCount: number;
  isNicedByMe: boolean;
  createdAt: string;
};

export type NiceResponse = { niceCount: number; isNicedByMe: boolean };

export type ExpResult = {
  gained: number;
  total: number;
  evolved: boolean;
  characterStage: CharacterStage;
};

export type CreatePostResponse = { post: Post; expResult: ExpResult };

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  learning: "今日の学習",
  work_in_progress: "制作途中",
  solved: "解決したこと",
  error: "エラー・困りごと",
  new_technology: "新しく試した技術",
  event: "イベント・ハッカソン",
  environment: "開発環境",
  idea: "アイデア",
};