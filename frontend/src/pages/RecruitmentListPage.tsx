// src/pages/RecruitmentListPage.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Recruitment } from "../types/recruitment";
import { fetchRecruitments } from "../api/recruitmentApi";
import { RecruitmentCard } from "../components/recruitment/RecruitmentCard";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";

export function RecruitmentListPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecruitments()
      .then((result) => setRecruitments(result.items))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "募集の取得に失敗しました")
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="page recruitment-list-page">
      <div className="timeline-page__header">
        <h1 className="page__title">メンバー募集</h1>
        <Link to="/recruitments/new" className="button button--primary">
          募集を作成
        </Link>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : recruitments.length === 0 ? (
        <div className="empty-state">
          <p>まだ募集がありません。最初の募集を作成してみましょう。</p>
        </div>
      ) : (
        <div className="recruitment-list">
          {recruitments.map((recruitment) => (
            <RecruitmentCard key={recruitment.id} recruitment={recruitment} />
          ))}
        </div>
      )}
    </div>
  );
}
