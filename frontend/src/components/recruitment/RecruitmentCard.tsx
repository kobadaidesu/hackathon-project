// src/components/recruitment/RecruitmentCard.tsx
// 募集一覧に並べるカード。詳細ページへのリンクを兼ねる。

import { Link } from "react-router-dom";
import type { Recruitment } from "../../types/recruitment";
import { LEARNING_STAGE_LABELS } from "../../types/profile";
import { Tag } from "../common/Tag";

type Props = {
  recruitment: Recruitment;
};

export function RecruitmentCard({ recruitment }: Props) {
  const isOpen = recruitment.status === "open";

  return (
    <Link
      to={`/recruitments/${recruitment.id}`}
      className="recruitment-card card-base"
    >
      <p className="recruitment-card__title">{recruitment.title}</p>

      {/* 募集主の学習段階は出さない。一覧で見たいのは「何を作るか」であって
          相手の習熟度ではないので、名前だけに絞る */}
      <p className="recruitment-card__owner">{recruitment.owner.displayName}</p>

      <p className="recruitment-card__description">{recruitment.description}</p>

      {recruitment.technologies.length > 0 && (
        <div className="tag-list">
          {recruitment.technologies.map((name) => (
            <Tag key={name} label={name} />
          ))}
        </div>
      )}

      <div className="recruitment-card__footer">
        {recruitment.preferredLearningStage && (
          <span>
            希望:{LEARNING_STAGE_LABELS[recruitment.preferredLearningStage]}
          </span>
        )}
        {recruitment.beginnerFriendly && <span>初心者歓迎</span>}
        <span className="recruitment-card__interest-count">
          興味あり {recruitment.interestCount}
        </span>
        <span
          className={`recruitment-card__status recruitment-card__status--${
            isOpen ? "open" : "closed"
          }`}
        >
          {isOpen ? "募集中" : "募集終了"}
        </span>
      </div>
    </Link>
  );
}
