// src/pages/PostCompletePage.tsx

import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import type { CreatePostResponse } from "../types/post";
import { CharacterDisplay } from "../components/profile/CharacterDisplay";

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
    <div className="page post-complete-page">
      <h1 className="page__title">投稿が完了しました!</h1>

      <CharacterDisplay
        characterStage={expResult.characterStage}
        evolved={expResult.evolved}
      />

      <p>獲得経験値:+{expResult.gained}</p>
      <p>現在の経験値:{expResult.total}</p>

      <Link to="/" className="button button--primary">
        タイムラインへ戻る
      </Link>
    </div>
  );
}