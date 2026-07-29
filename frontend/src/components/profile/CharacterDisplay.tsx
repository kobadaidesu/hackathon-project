// src/components/profile/CharacterDisplay.tsx
// キャラクターと経験値バーの表示。プロフィール画面と投稿完了画面の両方で使う。
//
// 画像は public/images/character-<段階名>.png を参照する。
// 段階を増やすときは CharacterStage に値を足し、同名のPNGを置けばよい。
// 読み込みに失敗した場合は絵文字にフォールバックする(壊れた画像アイコンを出さないため)。

import { useState } from "react";
import type { CharacterStage } from "../../types/profile";

/** 最終段階。ここに達したら経験値バーは満杯で固定する */
const MAX_STAGE: CharacterStage = "rooster";

const CHARACTER_LABELS: Record<CharacterStage, string> = {
  egg: "たまご",
  hatching: "ふ化中",
  chick: "ひよこ",
  brown: "ちゃいろひよこ",
  green: "わかばひよこ",
  blue: "そらいろひよこ",
  gold: "こがねひよこ",
  pink: "ももいろひよこ",
  rooster: "覚醒ニワトリ",
};

const CHARACTER_FALLBACK: Record<CharacterStage, string> = {
  egg: "🥚",
  hatching: "🐣",
  chick: "🐤",
  brown: "🐥",
  green: "🦜",
  blue: "🐦",
  gold: "🦆",
  pink: "🦩",
  rooster: "🐔",
};

type Props = {
  characterStage: CharacterStage;
  /** 経験値バーを出したいときに渡す(投稿完了画面では省略) */
  nextEvolution?: { required: number; progressPercent: number } | null;
  experiencePoints?: number;
  /** 進化した直後だけメッセージを出す */
  evolved?: boolean;
  size?: "lg" | "sm";
};

export function CharacterDisplay({
  characterStage,
  nextEvolution,
  experiencePoints,
  evolved = false,
  size = "lg",
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageClassName = `character-display__image${
    size === "sm" ? " character-display__image--sm" : ""
  }`;

  const isMaxStage = characterStage === MAX_STAGE;
  const progressPercent = isMaxStage ? 100 : nextEvolution?.progressPercent ?? 0;

  return (
    <div className="character-display">
      {imageFailed ? (
        <div
          className={imageClassName}
          role="img"
          aria-label={CHARACTER_LABELS[characterStage]}
          style={{ fontSize: size === "sm" ? 32 : 96, lineHeight: 1.2 }}
        >
          {CHARACTER_FALLBACK[characterStage]}
        </div>
      ) : (
        <img
          className={imageClassName}
          src={`/images/character-${characterStage}.png`}
          alt={CHARACTER_LABELS[characterStage]}
          onError={() => setImageFailed(true)}
        />
      )}

      {nextEvolution !== undefined && (
        <>
          <div className="character-display__exp-bar">
            <div
              className="character-display__exp-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="character-display__exp-label">
            {isMaxStage
              ? "MAX"
              : `次の進化まであと ${nextEvolution?.required ?? 0}`}
            {experiencePoints !== undefined && `（経験値 ${experiencePoints}）`}
          </p>
        </>
      )}

      {evolved && (
        <p className="character-display__evolved-message">
          {CHARACTER_LABELS[characterStage]}エンジニアに進化!
        </p>
      )}
    </div>
  );
}
