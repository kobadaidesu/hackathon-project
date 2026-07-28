// src/pages/ProfileSetupPage.tsx
// 登録直後の着地点。表示名以外のプロフィール項目をここで埋める。
// 表示名はsignupAndInitが既にPATCH済みだが、後から変えられるようフォームには置く。

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { updateMyProfile, uploadMyIcon } from "../api/profileApi";
import { fetchTechTags } from "../api/techTagApi";
import { LEARNING_STAGE_LABELS } from "../types/profile";
import type { LearningStage } from "../types/profile";
import type { TechTag } from "../types/api";
import { Tag } from "../components/common/Tag";
import { ErrorMessage } from "../components/common/ErrorMessage";

const BIO_MAX_LENGTH = 300;

// LEARNING_STAGE_LABELSから選択肢を生成(値の重複管理を避けるため)
const LEARNING_STAGE_OPTIONS = Object.entries(LEARNING_STAGE_LABELS) as [
  LearningStage,
  string
][];

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { currentUser, refreshCurrentUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [learningStage, setLearningStage] = useState<LearningStage | "">("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [contactUrl, setContactUrl] = useState("");

  const [techTags, setTechTags] = useState<TechTag[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // アイコンはStorageへの保存が必要なので、他の項目と分けて即アップロードする
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  // 既に入力済みの値があればフォームの初期値にする(設定画面として開き直せるように)
  useEffect(() => {
    if (!currentUser) return;
    setDisplayName(currentUser.displayName ?? "");
    setBio(currentUser.bio ?? "");
    setLearningStage(currentUser.learningStage ?? "");
    setGithubUrl(currentUser.githubUrl ?? "");
    setContactUrl(currentUser.contactUrl ?? "");
    setAvatarUrl(currentUser.avatarUrl);
  }, [currentUser]);

  const handleIconChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUploadingIcon) return;

    setIsUploadingIcon(true);
    setError("");
    try {
      const formData = new FormData();
      // フィールド名はFastAPIの引数名そのまま(snake_case)
      formData.append("image_file", file);
      const updated = await uploadMyIcon(formData);
      setAvatarUrl(updated.avatarUrl);
      await refreshCurrentUser();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "アイコンのアップロードに失敗しました"
      );
    } finally {
      setIsUploadingIcon(false);
    }
  };

  // 技術タグの選択肢はAPIから取得する(自由入力ではなく選択式)
  useEffect(() => {
    fetchTechTags()
      .then((result) => setTechTags(result.items ?? []))
      .catch((e) => console.error(e));
  }, []);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (displayName.trim().length === 0) {
      setError("表示名を入力してください");
      return;
    }
    // 二重送信防止
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      // 空文字は送らない(未入力と「変更なし」を区別するため)
      await updateMyProfile({
        displayName,
        bio: bio || undefined,
        learningStage: learningStage || undefined,
        technologyIds: selectedTagIds,
        githubUrl: githubUrl || undefined,
        contactUrl: contactUrl || undefined,
      });
      await refreshCurrentUser();
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page profile-setup-page">
      <h1 className="page__title">プロフィール設定</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="icon">アイコン</label>
          {avatarUrl && (
            <img src={avatarUrl} alt="" className="profile-page__avatar" />
          )}
          <input
            id="icon"
            type="file"
            accept="image/*"
            onChange={handleIconChange}
            disabled={isUploadingIcon}
          />
          {isUploadingIcon && <p>アップロード中...</p>}
        </div>

        <div className="form-group">
          <label htmlFor="displayName">表示名</label>
          <input
            id="displayName"
            type="text"
            maxLength={30}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">
            自己紹介({bio.length}/{BIO_MAX_LENGTH})
          </label>
          <textarea
            id="bio"
            rows={4}
            maxLength={BIO_MAX_LENGTH}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="learningStage">学習段階</label>
          <select
            id="learningStage"
            value={learningStage}
            onChange={(e) =>
              setLearningStage(e.target.value as LearningStage | "")
            }
          >
            <option value="">選択してください</option>
            {LEARNING_STAGE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>興味のある技術</label>
          <div className="tag-list">
            {techTags.map((tag) => (
              <Tag
                key={tag.id}
                label={tag.name}
                selected={selectedTagIds.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="githubUrl">GitHub URL</label>
          <input
            id="githubUrl"
            type="url"
            placeholder="https://github.com/..."
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactUrl">連絡先(Discordなど)</label>
          <input
            id="contactUrl"
            type="url"
            placeholder="https://discord.com/..."
            value={contactUrl}
            onChange={(e) => setContactUrl(e.target.value)}
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="form-actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
