// src/pages/RecruitmentDetailPage.tsx
// 興味ありボタンは、レスポンスに入っている更新後のinterestCount/isInterestedByMeを
// そのままstateに入れる(自分で±1を計算しない)。

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Recruitment } from "../types/recruitment";
import {
  fetchRecruitment,
  sendInterest,
  removeInterest,
} from "../api/recruitmentApi";
import { LEARNING_STAGE_LABELS } from "../types/profile";
import { Tag } from "../components/common/Tag";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";

export function RecruitmentDetailPage() {
  const { recruitmentId } = useParams<{ recruitmentId: string }>();

  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [interestError, setInterestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!recruitmentId) return;
    setIsLoading(true);
    setError("");
    fetchRecruitment(recruitmentId)
      .then(setRecruitment)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "募集の取得に失敗しました")
      )
      .finally(() => setIsLoading(false));
  }, [recruitmentId]);

  const handleInterest = async () => {
    if (!recruitment || isSubmitting) return;

    setIsSubmitting(true);
    setInterestError("");
    try {
      const result = recruitment.isInterestedByMe
        ? await removeInterest(recruitment.id)
        : await sendInterest(recruitment.id);
      setRecruitment({ ...recruitment, ...result });
    } catch (e) {
      setInterestError(
        e instanceof Error ? e.message : "興味ありの送信に失敗しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!recruitment) return <ErrorMessage message="募集が見つかりません" />;

  const isOpen = recruitment.status === "open";

  return (
    <div className="page recruitment-detail-page">
      <h1 className="page__title">{recruitment.title}</h1>

      <section className="recruitment-detail__section">
        <Link to={`/users/${recruitment.owner.id}`}>
          {recruitment.owner.displayName}
          {recruitment.owner.learningStage &&
            `・${LEARNING_STAGE_LABELS[recruitment.owner.learningStage]}`}
        </Link>
      </section>

      <section className="recruitment-detail__section">
        <p>{recruitment.description}</p>
      </section>

      {recruitment.technologies.length > 0 && (
        <section className="recruitment-detail__section">
          <div className="tag-list">
            {recruitment.technologies.map((name) => (
              <Tag key={name} label={name} />
            ))}
          </div>
        </section>
      )}

      <section className="recruitment-detail__section">
        <div className="recruitment-detail__meta">
          {recruitment.preferredLearningStage && (
            <span>
              希望する学習段階:
              {LEARNING_STAGE_LABELS[recruitment.preferredLearningStage]}
            </span>
          )}
          {recruitment.beginnerFriendly && <span>初心者歓迎</span>}
          <span
            className={`recruitment-card__status recruitment-card__status--${
              isOpen ? "open" : "closed"
            }`}
          >
            {isOpen ? "募集中" : "募集終了"}
          </span>
          <span className="recruitment-card__interest-count">
            興味あり {recruitment.interestCount}
          </span>
        </div>
      </section>

      <section className="recruitment-detail__section">
        <button
          type="button"
          className={`button ${
            recruitment.isInterestedByMe ? "button--active" : "button--primary"
          }`}
          onClick={handleInterest}
          disabled={isSubmitting || !isOpen}
        >
          {recruitment.isInterestedByMe ? "✓ 興味あり" : "興味あり"}
        </button>
        {!isOpen && <p>この募集は終了しています。</p>}
        {interestError && <ErrorMessage message={interestError} />}
      </section>
    </div>
  );
}
