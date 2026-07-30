// src/pages/MyProfilePage.tsx

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ProfileView } from "../components/profile/ProfileView";
import { Loading } from "../components/common/Loading";

export function MyProfilePage() {
  // ProtectedRoute配下なのでcurrentUserは基本入っているが、
  // 再取得中に一瞬nullになりうるのでガードしておく
  const { currentUser, logout, refreshCurrentUser } = useAuth();
  const navigate = useNavigate();

  // 経験値は投稿時にDBで加算されるため、ログイン時のプロフィール情報を
  // 使い続けず、マイページを開くたびに最新値へ同期する。
  useEffect(() => {
    void refreshCurrentUser();
  }, [refreshCurrentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // 成否にかかわらずログイン画面へ戻す
      navigate("/login", { replace: true });
    }
  };

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

      {/* ログアウトは滅多に使わないので、ページの一番下に控えめに置く。
          ProfileView は他人のプロフィール(/users/:userId)とも共有しているので、
          自分の画面であるここに直接書く */}
      <div className="profile-page__logout">
        <button type="button" className="button" onClick={handleLogout}>
          ログアウト
        </button>
      </div>
    </div>
  );
}
