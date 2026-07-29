// src/pages/RecruitmentListPage.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Recruitment } from "../types/recruitment";
import { fetchRecruitments } from "../api/recruitmentApi";
import { RecruitmentCard } from "../components/recruitment/RecruitmentCard";
import { Loading } from "../components/common/Loading";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { MASCOT } from "../lib/mascot";

export function RecruitmentListPage() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecruitments()
      // 募集終了は一覧に出さない。「終了＝一覧から消える」という扱いにするため、
      // 表示中のカードは必ず募集中になる
      .then((result) =>
        setRecruitments((result.items ?? []).filter((r) => r.status === "open"))
      )
      .catch((e) =>
        setError(e instanceof Error ? e.message : "募集の取得に失敗しました")
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="page recruitment-list-page">
      <div className="timeline-page__header">
        <h1 className="page__title">メンバー募集</h1>
        <Link to="/recruitments/new" className="button button--action button--sm">
          募集を作成
        </Link>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : recruitments.length === 0 ? (
        <div className="empty-state">
          <img src={MASCOT.idle} alt="" className="empty-state__image" />
          <p className="empty-state__title">まだ募集がありません</p>
          <p className="empty-state__hint">
            一緒に作る人を探してみませんか。
            <br />
            作りたいものを1行書くだけで十分です。
          </p>
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
