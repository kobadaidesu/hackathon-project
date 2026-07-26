// src/pages/CreatePostPage.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/postApi";
import { fetchTechTags } from "../api/techTagApi";
import type { PostCategory } from "../types/post";
import { POST_CATEGORY_LABELS } from "../types/post";
import type { TechTag } from "../types/api";
import { Tag } from "../components/common/Tag";
import { ErrorMessage } from "../components/common/ErrorMessage";

const CONTENT_MAX_LENGTH = 300;

// POST_CATEGORY_LABELSから選択肢を生成(値の重複管理を避けるため)
const CATEGORY_OPTIONS = Object.entries(POST_CATEGORY_LABELS) as [
  PostCategory,
  string
][];

export function CreatePostPage() {
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>(
    CATEGORY_OPTIONS[0][0]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [techTags, setTechTags] = useState<TechTag[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 技術タグの選択肢をAPIから取得(自由入力ではなく選択式)
  useEffect(() => {
    fetchTechTags()
      .then((result) => setTechTags(result))
      .catch((e) => console.error(e));
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const validate = (): string | null => {
    if (!imageFile) return "画像を選択してください";
    if (content.trim().length === 0) return "本文を入力してください";
    if (content.length > CONTENT_MAX_LENGTH)
      return `本文は${CONTENT_MAX_LENGTH}字以内で入力してください`;
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // 二重送信防止
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile as File);
      formData.append("content", content);
      formData.append("category", category);
      // 選んだタグ名の配列をJSON文字列にして送る(例: '["React","Python"]'、なしは'[]')
      formData.append("technologyTags", JSON.stringify(selectedTags));

      const result = await createPost(formData);

      // 完了画面へレスポンス(post + expResult)をそのまま渡す。再取得は不要
      navigate("/posts/complete", { state: result });
    } catch (e) {
      setError(e instanceof Error ? e.message : "投稿に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-page">
      <h1>投稿を作成</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>画像</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreviewUrl && (
            <img
              className="image-preview"
              src={imagePreviewUrl}
              alt="プレビュー"
            />
          )}
        </div>

        <div className="form-group">
          <label>
            投稿文({content.length}/{CONTENT_MAX_LENGTH})
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={CONTENT_MAX_LENGTH}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PostCategory)}
          >
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>技術タグ</label>
          <div className="tag-list">
            {techTags.map((tag) => (
              <Tag
                key={tag.id}
                label={tag.name}
                selected={selectedTags.includes(tag.name)}
                onClick={() => toggleTag(tag.name)}
              />
            ))}
          </div>
        </div>

        <ErrorMessage message={error} />

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "投稿する"}
          </button>
          <button
            type="button"
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