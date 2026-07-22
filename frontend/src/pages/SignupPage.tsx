import { useState } from 'react';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!displayName || !email || !password || !passwordConfirm) {
      setError('すべての項目を入力してください');
      return;
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません');
      return;
    }
    setError('');
    // 本来はここで、AuthContextのsignupAndInit関数を呼ぶ(こばださんのauth.tsが届いてから繋ぎ込む)
    alert(`仮の送信: ${displayName} / ${email}`);
  };

  return (
    <div>
      <h1>新規登録</h1>

      <div>
        <label htmlFor="displayName">表示名</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="passwordConfirm">パスワード確認</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <Button onClick={handleSubmit}>登録</Button>

      <p>
        アカウントをお持ちの方は <a href="/login">こちらからログイン</a>
      </p>
    </div>
  );
}