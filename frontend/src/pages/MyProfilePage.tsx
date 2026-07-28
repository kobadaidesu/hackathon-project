// src/pages/MyProfilePage.tsx

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ProfileView } from "../components/profile/ProfileView";
import { Loading } from "../components/common/Loading";

export function MyProfilePage() {
  // ProtectedRoute配下なのでcurrentUserは基本入っているが、
  // 再取得中に一瞬nullになりうるのでガードしておく
  const { currentUser } = useAuth();

  if (!currentUser) return <Loading />;

  return (
    <div className="page profile-page">
      <div className="timeline-page__header">
        <h1 className="page__title">プロフィール</h1>
        <Link to="/profile/setup" className="button button--secondary">
          編集
        </Link>
      </div>

      <ProfileView profile={currentUser} />
    </div>
  );
}
