// src/api/recruitmentApi.ts
// 募集・興味ありに関するAPI関数をまとめたファイル。
//
// 興味ありのレスポンスには更新後の interestCount と isInterestedByMe が入っているので、
// 呼び出し側は自分で+1を計算せず、そのままstateに入れればよい(postApiのナイス挑戦と同じ方針)。

import { apiRequest } from "./apiClient";
import type { Recruitment, InterestResponse } from "../types/recruitment";
import type { LearningStage } from "../types/profile";

export type RecruitmentCreate = {
  title: string;
  description: string;
  technologyIds: number[];
  preferredLearningStage?: LearningStage | null;
  beginnerFriendly: boolean;
};

export type RecruitmentUpdate = Partial<RecruitmentCreate> & {
  status?: "open" | "closed";
};

/** 募集一覧を取得する(新着順) */
export const fetchRecruitments = () =>
  apiRequest<{ items: Recruitment[] }>("/api/recruitments?limit=20");

/** 募集を作成する */
export const createRecruitment = (body: RecruitmentCreate) =>
  apiRequest<Recruitment>("/api/recruitments", {
    method: "POST",
    body: JSON.stringify(body),
  });

/** 募集の詳細を取得する */
export const fetchRecruitment = (recruitmentId: string) =>
  apiRequest<Recruitment>(`/api/recruitments/${recruitmentId}`);

/** 募集を更新する(募集終了もこれ経由: { status: "closed" }) */
export const updateRecruitment = (
  recruitmentId: string,
  body: RecruitmentUpdate
) =>
  apiRequest<Recruitment>(`/api/recruitments/${recruitmentId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

/**
 * 興味ありを送る
 * 使用例:
 *   const result = await sendInterest(recruitment.id);
 *   setRecruitment({ ...recruitment, ...result });
 */
export const sendInterest = (recruitmentId: string) =>
  apiRequest<InterestResponse>(`/api/recruitments/${recruitmentId}/interest`, {
    method: "POST",
  });

/** 興味ありを取り消す(isInterestedByMeがtrueのときはこちら) */
export const removeInterest = (recruitmentId: string) =>
  apiRequest<InterestResponse>(`/api/recruitments/${recruitmentId}/interest`, {
    method: "DELETE",
  });
