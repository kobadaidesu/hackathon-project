import { useState } from 'react';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
;

export function LoginPage() {
    const [email , setEmail]= useState('');
    const [password , setPassword]= useState('');
    const [error , setError]= useState('');

    const handleSubmit = () => {
        if (!email || !password) {
            setError('メールアドレスとパスワードを入力してください');
            return;
        }
        setError('');
        //本来はここで、AuthContextのlogin関数を呼び出してログイン処理を行う(こばだいからauth.tsを受け取る)
        alert(`仮の送信：${email} ${password}`);
    };
    return (
        <div>
            <h1>ログイン</h1>

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

            {error && <ErrorMessage message={error} />}

            <Button onClick={handleSubmit}>
                ログイン
            </Button>
            <p>
                アカウントをお持ちでない場合は<a href="/signup">こちらから登録</a>
            </p>
        </div>
    );
}