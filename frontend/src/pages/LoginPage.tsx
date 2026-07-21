import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';

export function LoginPage() {
    return (
        <div>
            <h1>ログイン</h1>
            <Button onClick={() => alert('ログインボタンがクリックされました')}>
                ログイン
            </Button>
            <Loading />
        </div>
    );
}