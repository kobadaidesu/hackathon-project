import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from './Loading';

export function ProtectedRoute() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // まだログイン状態の確認が終わっていない間は、ローディング表示にする
    return <Loading />;
  }

  if (!currentUser) {
    // ログインしていなければ、ログイン画面へ
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}