import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from './Loading';

const PROFILE_SETUP_PATH = '/profile/setup';

export function ProtectedRoute() {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // まだログイン状態の確認が終わっていない間は、ローディング表示にする
    return <Loading />;
  }

  if (!currentUser) {
    // ログインしていなければ、ログイン画面へ
    return <Navigate to="/login" />;
  }

  // 登録の途中で離脱した場合(Supabaseのアカウントはできたがプロフィール未設定)、
  // 次回ログイン時に profileCompleted: false が返るので設定画面へ誘導する。
  // 未定義(他ユーザーのプロフィール等)は判定対象にしないので === false で見る。
  if (
    currentUser.profileCompleted === false &&
    location.pathname !== PROFILE_SETUP_PATH
  ) {
    return <Navigate to={PROFILE_SETUP_PATH} replace />;
  }

  return <Outlet />;
}