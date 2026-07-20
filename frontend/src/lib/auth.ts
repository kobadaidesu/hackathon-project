// src/lib/auth.ts
// 認証モジュール(こばだい担当)
// supabase-jsはこのファイルの中でのみ使用する。他のファイルからimportしないこと。
// トークンの保存・自動更新はsupabase-jsが内部で行うため、
// 使う側はgetToken()を呼ぶだけでよい(期限切れ時も自動でリフレッシュされる)。

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

/** 新規登録(Supabase Authへの登録のみ。displayNameのPATCHは呼び出し側で行う) */
export async function signup(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(toJaMessage(error.message))
  if (!data.session) {
    // Confirm emailはOFFの前提(バックエンド設計書4.3)なので、登録直後は必ずセッションが返る。
    // ここに来た場合はSupabase側の設定が変わっているので、静かに壊れる前に検知する。
    throw new Error('登録に失敗しました(開発者向け: SupabaseのConfirm email設定を確認)')
  }
}

/** ログイン */
export async function login(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(toJaMessage(error.message))
}

/** ログアウト */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(toJaMessage(error.message))
}

/**
 * 現在のアクセストークンを返す(未ログインならnull)
 * apiClientがAuthorizationヘッダに使う。
 * getSession()は期限切れトークンを自動リフレッシュしてから返す。
 * セッション取得に失敗した場合も未ログイン扱い(null)にして、
 * apiClient側の401ハンドリング(/loginへ誘導)に乗せる。
 */
export async function getToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('セッション取得に失敗:', error.message)
    return null
  }
  return data.session?.access_token ?? null
}

/** Supabaseの英語エラーメッセージを日本語に変換する */
function toJaMessage(message: string): string {
  if (message.includes('already registered')) {
    return 'このメールアドレスは登録済みです'
  }
  if (message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが違います'
  }
  if (message.includes('Password should be at least')) {
    return 'パスワードは8文字以上で入力してください'
  }
  if (message.includes('valid email')) {
    return 'メールアドレスの形式が正しくありません'
  }
  return 'エラーが発生しました。時間をおいて再度お試しください'
}