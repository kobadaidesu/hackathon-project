// src/components/post/NiceButton.tsx
// デザイン StyleGuide 03「ナイス挑戦ボタン」の3ステートを実装する。
//   IDLE  … 彩度を落としたひよこ。静かに待つ
//   BURST … タップ直後。cheer ひよこが跳ね、♥と★が飛び散る
//   LIKED … heart ひよこで固定。再タップで 0.2s しゅんと縮む
//
// 色(liked かどうか)の正はあくまでサーバーの isNiced。
// 通信中だけ optimistic で先に見た目を進め、確定したら手放す。
// phase はアニメーションの再生状態だけを持つので、通信が失敗しても
// 色が取り残されることはない。

import { useEffect, useRef, useState } from "react";
import { MASCOT } from "../../lib/mascot";

type Phase = "idle" | "burst" | "shrink";

type Particle = {
  key: string;
  tx: number;
  ty: number;
  rot: string;
  char: string;
  color: string;
  size: number;
  delay: number;
};

const PARTICLE_COUNT = 10;

function makeParticles(burstId: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // 真上から時計回りに等間隔で散らし、少しだけ角度と距離を揺らす
    const angle =
      (-90 + (i / PARTICLE_COUNT) * 360) * (Math.PI / 180) +
      (Math.random() - 0.5) * 0.4;
    const distance = 32 + Math.random() * 24;
    const isHeart = i % 2 === 0;
    out.push({
      key: `${burstId}-${i}`,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      rot: `${Math.random() * 120 - 60}deg`,
      char: isHeart ? "♥" : "★",
      color: isHeart ? "var(--ds-color-cheek-pink)" : "var(--ds-color-mascot-yellow)",
      size: isHeart ? 13 : 11,
      delay: (i % 3) * 0.03,
    });
  }
  return out;
}

type Props = {
  count: number;
  isNiced: boolean;
  disabled?: boolean;
  onToggle: () => void | Promise<void>;
  /** lg は投稿詳細用(ひよこ34px) */
  size?: "md" | "lg";
};

export function NiceButton({
  count,
  isNiced,
  disabled = false,
  onToggle,
  size = "md",
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  // 描画中に読む値なので ref ではなく state で持つ(img の key に使う)
  const [burstId, setBurstId] = useState(0);

  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  const liked = optimistic ?? isNiced;
  // サーバーの値が届くまでの間だけ、押した結果を先取りして表示する
  const displayCount =
    optimistic === null ? count : count + (optimistic ? 1 : -1);

  const handleClick = async () => {
    if (disabled) return;
    clearTimers();

    const next = !liked;
    setOptimistic(next);

    if (next) {
      const nextBurstId = burstId + 1;
      setBurstId(nextBurstId);
      setPhase("burst");
      setParticles(makeParticles(nextBurstId));
      timersRef.current.push(
        window.setTimeout(() => setPhase("idle"), 400),
        window.setTimeout(() => setParticles([]), 800)
      );
    } else {
      setPhase("shrink");
      setParticles([]);
      timersRef.current.push(window.setTimeout(() => setPhase("idle"), 200));
    }

    try {
      await onToggle();
    } finally {
      // 成功でも失敗でも手放す。以降は props の isNiced が正になる
      setOptimistic(null);
    }
  };

  const src =
    phase === "burst" ? MASCOT.cheer : liked ? MASCOT.heart : MASCOT.idle;

  return (
    <button
      type="button"
      className={`nice-button nice-button--${size}${
        liked ? " nice-button--active" : ""
      }`}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={liked ? "ナイス挑戦を取り消す" : "ナイス挑戦を送る"}
    >
      <span className="nice-button__visual">
        <img
          /* key を変えて、同じ画像でもアニメーションを頭から再生させる */
          key={`${phase}-${burstId}`}
          src={src}
          alt=""
          className={`nice-button__chick nice-button__chick--${phase}`}
        />
        {particles.map((p) => (
          <span
            key={p.key}
            className="nice-button__particle"
            aria-hidden="true"
            style={
              {
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
                "--rot": p.rot,
                fontSize: `${p.size}px`,
                color: p.color,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          >
            {p.char}
          </span>
        ))}
      </span>

      {/* key を count に紐づけて、数値が変わるたび countUp を再生する */}
      <span key={displayCount} className="nice-button__count">
        {displayCount}
      </span>
    </button>
  );
}
