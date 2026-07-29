// src/lib/formatRelativeTime.ts
// デザインのカード上では「個人開発に挑戦中・3時間前」「基礎を勉強中・昨日 21:15」の
// ように投稿時刻が相対表記で入る。それに合わせた整形。

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const diff = now.getTime() - date.getTime();
  if (diff < 0) return "たった今"; // サーバーとの時計ずれで未来になった場合
  if (diff < MINUTE) return "たった今";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}分前`;
  if (diff < 24 * HOUR) return `${Math.floor(diff / HOUR)}時間前`;

  const hhmm = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

  // 「24時間以内」ではなく暦日で昨日かどうかを見る
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (24 * HOUR)
  );
  if (dayDiff === 1) return `昨日 ${hhmm}`;

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}
