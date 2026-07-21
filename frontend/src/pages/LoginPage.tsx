import { Button } from '../components/common/Button';

export function LoginPage() {
    return (
        <div>
            <h1>ログイン</h1>
            <Button onClick={() => alert('ログインボタンがクリックされました')}>
                ログイン
            </Button>
        </div>
    );
}