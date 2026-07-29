// src/pages/LoginPage.tsx
// 未ログインで最初に見る画面なので、上部ヘッダー以外は何も置かず
// カード1枚を画面の中央に据える。

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { MASCOT } from "../lib/mascot";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // form の onSubmit にすることで、入力欄でEnterを押しても送信できる
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ログインに失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={MASCOT.idle} alt="" className="auth-card__mascot" />

        <div className="auth-card__heading">
          <h1 className="auth-card__title">おかえりなさい</h1>
          <p className="auth-card__lead">今日の学びを残していきましょう</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="8文字以上"
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            className="button button--action auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="auth-card__switch">
          アカウントをお持ちでない方は <Link to="/signup">こちらから登録</Link>
        </p>
      </div>
    </div>
  );
}
