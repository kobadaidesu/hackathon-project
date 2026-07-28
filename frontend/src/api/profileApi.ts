// src/api/profileApi.ts
// プロフィールに関するAPI関数をまとめたファイル。
// ページ側はこれらの関数を呼ぶだけでよい。
// fetchやAuthorizationヘッダのことは考えなくていい(apiClientが全部やってくれる)。

import { apiRequest } from "./apiClient";
import type { UserProfile } from "../types/profile";
import type { Post } from "../types/post";

/** 更新時に送れる項目。送らなかった項目は変更されない(部分更新) */
export type ProfileUpdate = {
  displayName?: string;
  bio?: string;
  learningStage?: string;
  technologyIds?: number[];
  githubUrl?: string;
  contactUrl?: string;
};

/**
 * ログイン中の自分のプロフィールを取得する
 * profileCompleted が false なら /profile/setup へ誘導する
 */
export const fetchMyProfile = () => apiRequest<UserProfile>("/api/users/me");

/**
 * 自分のプロフィールを更新する(部分更新)
 * 使用例:
 *   await updateMyProfile({ displayName: "たなか", technologyIds: [1, 5] });
 */
export const updateMyProfile = (body: ProfileUpdate) =>
  apiRequest<UserProfile>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

/** 他ユーザーのプロフィールを取得する */
export const fetchUserProfile = (userId: string) =>
  apiRequest<UserProfile>(`/api/users/${userId}`);

/** 対象ユーザーの投稿一覧を取得する */
export const fetchUserPosts = (userId: string) =>
  apiRequest<{ items: Post[] }>(`/api/users/${userId}/posts`);
