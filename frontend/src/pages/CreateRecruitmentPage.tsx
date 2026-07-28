// src/pages/CreateRecruitmentPage.tsx
// 募集対象はアプリ・プロダクトを一緒に作るメンバー。
// 「募集する役割」「募集人数」はチーム確認中のため置かない(設計書4.4)。

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createRecruitment } from "../api/recruitmentApi";
import { fetchTechTags } from "../api/techTagApi";
import { LEARNING_STAGE_LABELS } from "../types/profile";
import type { LearningStage } from "../types/profile";
import type { TechTag } from "../types/api";
import { Tag } from "../components/common/Tag";
import { ErrorMessage } from "../components/common/ErrorMessage";

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 500;

const LEARNING_STAGE_OPTIONS = Object.entries(LEARNING_STAGE_LABELS) as [
  LearningStage,
  string
][];

export function CreateRecruitmentPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [preferredLearningStage, setPreferredLearningStage] = useState<
    LearningStage | ""
  >("");
  const [beginnerFriendly, setBeginnerFriendly] = useState(false);

  const [techTags, setTechTags] = useState<TechTag[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (title.trim().length === 0) {
      setError("タイトルを入力してください");
      return;
    }
    if (description.trim().length === 0) {
      setError("概要を入力してください");
      return;
    }
    // 二重送信防止
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      const created = await createRecruitment({
        title,
        description,
        technologyIds: selectedTagIds,
        preferredLearningStage: preferredLearningStage || null,
        beginnerFriendly,
      });
      navigate(`/recruitments/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "募集の作成に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page create-recruitment-page">
      <h1 className="page__title">募集を作成</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            タイトル({title.length}/{TITLE_MAX_LENGTH})
          </label>
          <input
            id="title"
            type="text"
            maxLength={TITLE_MAX_LENGTH}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            概要({description.length}/{DESCRIPTION_MAX_LENGTH})
          </label>
          <textarea
            id="description"
            rows={6}
            maxLength={DESCRIPTION_MAX_LENGTH}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>使用予定の技術</label>
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
          <label htmlFor="preferredLearningStage">
            希望する学習段階(任意)
          </label>
          <select
            id="preferredLearningStage"
            value={preferredLearningStage}
            onChange={(e) =>
              setPreferredLearningStage(e.target.value as LearningStage | "")
            }
          >
            <option value="">こだわらない</option>
            {LEARNING_STAGE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-group__checkbox">
          <input
            id="beginnerFriendly"
            type="checkbox"
            checked={beginnerFriendly}
            onChange={(e) => setBeginnerFriendly(e.target.checked)}
          />
          <label htmlFor="beginnerFriendly">初心者歓迎</label>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="form-actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "作成中..." : "募集を作成"}
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
