// src/components/profile/ProfileView.tsx
// 自分のプロフィール(/profile)と他人のプロフィール(/users/:userId)で
// 共通の表示部分。投稿一覧の取得もここで完結させる。

import { useEffect, useState } from "react";
import type { UserProfile } from "../../types/profile";
import type { Post } from "../../types/post";
import { LEARNING_STAGE_LABELS } from "../../types/profile";
import { fetchUserPosts } from "../../api/profileApi";
import { CharacterDisplay } from "./CharacterDisplay";
import { PostCard } from "../post/PostCard";
import { Tag } from "../common/Tag";
import { Loading } from "../common/Loading";
import { ErrorMessage } from "../common/ErrorMessage";

type Props = {
  profile: UserProfile;
};

export function ProfileView({ profile }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");

  useEffect(() => {
    setIsLoadingPosts(true);
    setPostsError("");
    fetchUserPosts(profile.id)
      .then((result) => setPosts(result.items))
      .catch((e) =>
        setPostsError(
          e instanceof Error ? e.message : "投稿の取得に失敗しました"
        )
      )
      .finally(() => setIsLoadingPosts(false));
  }, [profile.id]);

  // ナイス挑戦の結果を該当の1件だけ差し替える(PostListと同じ方針)
  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  return (
    <>
      <div className="profile-page__header">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="profile-page__avatar" />
        ) : (
          <div className="profile-page__avatar" />
        )}
        <div>
          <p className="profile-page__name">
            {profile.displayName ?? "(表示名未設定)"}
          </p>
          {profile.learningStage && (
            <p className="profile-page__learning-stage">
              {LEARNING_STAGE_LABELS[profile.learningStage]}
            </p>
          )}
        </div>
      </div>

      <CharacterDisplay
        characterStage={profile.characterStage}
        nextEvolution={profile.nextEvolution}
        experiencePoints={profile.experiencePoints}
      />

      {profile.bio && (
        <section className="profile-page__section">
          <p className="profile-page__label">自己紹介</p>
          <p>{profile.bio}</p>
        </section>
      )}

      {profile.technologies.length > 0 && (
        <section className="profile-page__section">
          <p className="profile-page__label">興味のある技術</p>
          <div className="tag-list">
            {profile.technologies.map((name) => (
              <Tag key={name} label={name} />
            ))}
          </div>
        </section>
      )}

      {(profile.githubUrl || profile.contactUrl) && (
        <section className="profile-page__section">
          <p className="profile-page__label">リンク</p>
          <div className="profile-page__links">
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {profile.contactUrl && (
              <a href={profile.contactUrl} target="_blank" rel="noreferrer">
                連絡先
              </a>
            )}
          </div>
        </section>
      )}

      <section className="profile-page__section">
        <p className="profile-page__label">投稿</p>
        {isLoadingPosts ? (
          <Loading />
        ) : postsError ? (
          <ErrorMessage message={postsError} />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>まだ投稿がありません。</p>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
