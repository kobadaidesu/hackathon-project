// src/pages/PostCompletePage.tsx

import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import type { CreatePostResponse } from "../types/post";

export function PostCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as CreatePostResponse | undefined;

  // 直接URLアクセスなどでstateが無い場合はタイムラインへ戻す
  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { expResult } = state;

  return (
    <div className="post-complete-page">
      <h1>投稿が完了しました!</h1>

      <div className="character-display">
        <img
          src={
            expResult.characterStage === "chick"
              ? "/images/character-chick.png"
              : "/images/character-egg.png"
          }
          alt={expResult.characterStage === "chick" ? "ひよこ" : "たまご"}
        />
      </div>

      <p>獲得経験値:+{expResult.gained}</p>
      <p>現在の経験値:{expResult.total}</p>

      {expResult.evolved && (
        <p className="evolution-message">ひよこエンジニアに進化!</p>
      )}

      <Link to="/" className="button">
        タイムラインへ戻る
      </Link>
    </div>
  );
}