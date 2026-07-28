// src/pages/UserProfilePage.tsx
// 他ユーザーのプロフィール。編集ボタンは出さない。

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { UserProfile } from "../types/profile";
import { fetchUserProfile } from "../api/profileApi";
import { ProfileView } from "../components/profile/ProfileView";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    setError("");
    fetchUserProfile(userId)
      .then(setProfile)
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : "プロフィールの取得に失敗しました"
        )
      )
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!profile) return <ErrorMessage message="ユーザーが見つかりません" />;

  return (
    <div className="page profile-page">
      <h1 className="page__title">
        {profile.displayName ?? "(表示名未設定)"}さんのプロフィール
      </h1>

      <ProfileView profile={profile} />
    </div>
  );
}
