// src/api/postApi.ts
// 投稿・タイムライン・ナイス挑戦に関するAPI関数をまとめたファイル。
// ページ側(TimelinePage.tsxなど)はこれらの関数を呼ぶだけでよい。
// fetchやAuthorizationヘッダのことは考えなくていい(apiClientが全部やってくれる)。

import { apiRequest } from "./apiClient";
import type { Post, NiceResponse, CreatePostResponse } from "../types/post";

/**
 * タイムライン取得(最新20件・新着順)
 * 使用例: const { items } = await fetchPosts();
 */
export const fetchPosts = () =>
  apiRequest<{ items: Post[] }>("/api/posts?limit=20");

/**
 * 投稿を作成する
 * FormDataの中身: image, content, category, technologyTags
 * ※technologyTagsは配列そのままではなく、JSON文字列にすること
 *   例: JSON.stringify(["React", "Python"])  → '["React","Python"]'
 *   選択なしの場合は JSON.stringify([]) → '[]'
 *
 * 使用例(投稿作成画面):
 *   const formData = new FormData();
 *   formData.append("image", imageFile);
 *   formData.append("content", content);
 *   formData.append("category", category);
 *   formData.append("technologyTags", JSON.stringify(selectedTags));
 *   const result = await createPost(formData);
 *   // result.post → 作成された投稿
 *   // result.expResult → 経験値情報(投稿完了画面へ渡す)
 */
export const createPost = (formData: FormData) =>
  apiRequest<CreatePostResponse>("/api/posts", {
    method: "POST",
    body: formData,
  });

/**
 * ナイス挑戦を送る
 * レスポンスには更新後のniceCountとisNicedByMeが入っているので、
 * 呼び出し側は自分で+1を計算せず、そのままstateに入れればよい。
 *
 * 使用例:
 *   const result = await sendNiceChallenge(post.id);
 *   setPost({ ...post, ...result });
 */
export const sendNiceChallenge = (postId: string) =>
  apiRequest<NiceResponse>(`/api/posts/${postId}/nice`, {
    method: "POST",
  });

/**
 * ナイス挑戦を取り消す
 * isNicedByMeがtrueのときはこちらを呼ぶ(sendNiceChallengeと呼び分ける)
 */
export const removeNiceChallenge = (postId: string) =>
  apiRequest<NiceResponse>(`/api/posts/${postId}/nice`, {
    method: "DELETE",
  });