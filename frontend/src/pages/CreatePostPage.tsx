// src/pages/CreatePostPage.tsx

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/postApi";
import { fetchTechTags } from "../api/techTagApi";
import { useAuth } from "../contexts/AuthContext";
import type { PostCategory } from "../types/post";
import type { TechTag } from "../types/api";
import { Tag } from "../components/common/Tag";
import { ErrorMessage } from "../components/common/ErrorMessage";

const CONTENT_MAX_LENGTH = 300;

// カテゴリは投稿者に選ばせるのをやめたが、APIとDB(not null)では必須のまま。
// タイムラインにも表示していない項目なので、固定値で埋めておく。
const DEFAULT_CATEGORY: PostCategory = "learning";

export function CreatePostPage() {
  const navigate = useNavigate();
  const { refreshCurrentUser } = useAuth();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  // バックエンドはタグ名ではなくタグIDを受け取るので、選択状態はIDで持つ
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [techTags, setTechTags] = useState<TechTag[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 素の<input type="file">は隠してlabelで開くので、
  // 「削除」で値を空に戻すために実体を掴んでおく
  const imageInputRef = useRef<HTMLInputElement>(null);

  //技術タグの選択肢をAPIから取得(自由入力ではなく選択式)
  useEffect(() => {
    fetchTechTags()
      .then((result) =>
         setTechTags(result.items ?? []))
      .catch((e) => console.error(e));
  }, []);


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    // 選び直すたびに前のURLが残り続けるので、作り直す前に解放する
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleImageClear = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    // 値を戻さないと、同じファイルを選び直したときにonChangeが発火しない
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const validate = (): string | null => {
    // 画像は任意。文章だけで投稿できる
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
      // multipartのフィールド名はFastAPIの引数名そのまま(snake_case)。
      // Form()はPydanticのApiSchemaを通らないためcamelCase変換が効かない。
      const formData = new FormData();
      // 未選択のときはフィールドごと送らない。空で送るとFastAPI側が
      // UploadFile として受け取ってしまい、画像なしと区別できなくなる
      if (imageFile) formData.append("image_file", imageFile);
      formData.append("content", content);
      formData.append("category", DEFAULT_CATEGORY);
      // list[int]はJSON文字列ではなく同名フィールドの繰り返しで渡す
      selectedTagIds.forEach((id) =>
        formData.append("technology_ids", String(id))
      );

      const result = await createPost(formData);

      // 投稿で加算された経験値をcurrentUserにも反映し、
      // 以降のマイページでログイン時の古い値を表示しないようにする。
      await refreshCurrentUser();

      // 完了画面は投稿APIのexpResultをそのまま使う。
      navigate("/posts/complete", { state: result });
    } catch (e) {
      setError(e instanceof Error ? e.message : "投稿に失敗しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page create-post-page">
      <h1 className="page__title">投稿を作成</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="image">画像</label>

          {/* input本体は隠し、labelを叩いてファイル選択を開く。
              フォーカスリングは :focus-visible + 兄弟セレクタでlabel側に出すので、
              DOM順は必ず input → label のままにしておくこと */}
          <div className="image-picker">
            <input
              id="image"
              ref={imageInputRef}
              className="image-picker__input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {imagePreviewUrl ? (
              <>
                <img
                  className="image-preview"
                  src={imagePreviewUrl}
                  alt="プレビュー"
                />
                <div className="image-picker__actions">
                  <label
                    htmlFor="image"
                    className="button button--secondary button--sm"
                  >
                    変更
                  </label>
                  <button
                    type="button"
                    className="button button--sm"
                    onClick={handleImageClear}
                  >
                    削除
                  </button>
                </div>
              </>
            ) : (
              <label htmlFor="image" className="image-picker__dropzone">
                <svg
                  className="image-picker__icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <span className="image-picker__title">写真を選ぶ</span>
                <span className="image-picker__hint">
                  タップして選択（任意）
                </span>
              </label>
            )}
          </div>
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
          <label>技術タグ</label>
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

        <ErrorMessage message={error} />

        <div className="form-actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "投稿中..." : "投稿する"}
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
