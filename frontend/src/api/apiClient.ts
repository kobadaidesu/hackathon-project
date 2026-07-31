import { getToken } from "../lib/auth";

// 空(未設定)なら "/api/..." という相対パスで投げる。開発中は
// vite.config.ts のproxyが同じPCの8000番へ中継するので、スマホ実機から
// 開いてもPCのIPを埋め込む必要がない。
// デプロイ時など、別ホストのAPIを叩きたいときだけ .env で指定する。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * エラーレスポンスから表示用のメッセージを取り出す。
 *
 * FastAPIは HTTPException を {"detail": "メッセージ"} の形で返す。
 * バリデーションエラー(422)のときは detail が配列になる:
 *   {"detail": [{"loc": [...], "msg": "...", "type": "..."}]}
 * どちらの形でも読めるようにしておく。
 */
function extractErrorMessage(body: unknown): string {
  const fallback = "APIリクエストに失敗しました";
  if (!body || typeof body !== "object") return fallback;

  const { detail, error } = body as {
    detail?: unknown;
    error?: { message?: string };
  };

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined;
    return first?.msg ? `入力内容を確認してください: ${first.msg}` : fallback;
  }

  return error?.message ?? fallback;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("ログインし直してください");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // 原因を追えるように、生のレスポンスもコンソールへ残す
    console.error(`API ${response.status} ${path}`, body);
    throw new Error(extractErrorMessage(body));
  }
  return response.json() as Promise<T>;
}
