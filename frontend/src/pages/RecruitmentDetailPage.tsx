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
  updateRecruitment,
} from "../api/recruitmentApi";
import { useAuth } from "../contexts/AuthContext";
import { LEARNING_STAGE_LABELS } from "../types/profile";
import { Tag } from "../components/common/Tag";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";

export function RecruitmentDetailPage() {
  const { recruitmentId } = useParams<{ recruitmentId: string }>();
  const { currentUser } = useAuth();

  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [interestError, setInterestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  // 募集者本人だけが募集を終了できる(最終的な権限チェックはバックエンド側)
  const handleClose = async () => {
    if (!recruitment || isClosing) return;
    if (!window.confirm("この募集を終了しますか?")) return;

    setIsClosing(true);
    setInterestError("");
    try {
      const updated = await updateRecruitment(recruitment.id, {
        status: "closed",
      });
      setRecruitment(updated);
    } catch (e) {
      setInterestError(
        e instanceof Error ? e.message : "募集の終了に失敗しました"
      );
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!recruitment) return <ErrorMessage message="募集が見つかりません" />;

  const isOpen = recruitment.status === "open";
  const isOwner = currentUser?.id === recruitment.owner.id;

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
        <div className="form-actions">
          {/* 自分の募集には興味ありを送れないので、募集者には終了ボタンを出す */}
          {isOwner ? (
            isOpen && (
              <button
                type="button"
                className="button button--danger"
                onClick={handleClose}
                disabled={isClosing}
              >
                {isClosing ? "終了中..." : "募集を終了する"}
              </button>
            )
          ) : (
            <button
              type="button"
              className={`button ${
                recruitment.isInterestedByMe
                  ? "button--active"
                  : "button--primary"
              }`}
              onClick={handleInterest}
              disabled={isSubmitting || !isOpen}
            >
              {recruitment.isInterestedByMe ? "✓ 興味あり" : "興味あり"}
            </button>
          )}
        </div>

        {!isOpen && <p>この募集は終了しています。</p>}
        {interestError && <ErrorMessage message={interestError} />}
      </section>
    </div>
  );
}
