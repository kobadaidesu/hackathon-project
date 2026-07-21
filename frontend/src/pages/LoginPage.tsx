import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';

export function LoginPage() {
    return (
        <div>
            <h1>ログイン</h1>
            <Button onClick={() => alert('ログインボタンがクリックされました')}>
                ログイン
            </Button>
            <Loading />
            <ErrorMessage message="テスト用のエラーメッセージです" />
        </div>
    );
}