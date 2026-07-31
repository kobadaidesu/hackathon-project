// src/lib/techIcons.ts
// 技術タグに公式ロゴを添えるためのマッピング。
// ロゴとブランドカラーは simple-icons(MIT)の値をそのまま使う。
//
// ここに無い技術は、Tag 側でロゴ無し(名前だけ)にフォールバックする。現状の未収録は4つ:
//   AWS / AtCoder … simple-icons に無い(Amazon系は商標方針で削除済み)
//   SQL / 機械学習  … 特定製品ではないので公式ロゴが存在しない

import {
  siReact,
  siTypescript,
  siJavascript,
  siNextdotjs,
  siVuedotjs,
  siNodedotjs,
  siPython,
  siFastapi,
  siDjango,
  siGo,
  siRust,
  siOpenjdk,
  siKotlin,
  siSwift,
  siFlutter,
  siPhp,
  siRuby,
  siCplusplus,
  siSupabase,
  siDocker,
  siGit,
  siLinux,
  siUnity,
} from "simple-icons";

/**
 * アセンブリ言語は特定企業の製品ではないため公式ロゴが存在しない。
 * simple-icons にある AssemblyScript と WebAssembly はどちらも別技術なので、
 * 流用せずCPUチップを模した自作アイコンを置く。
 *
 * 形式は simple-icons と揃えてある(24x24のviewBox / hexは#無し)ので ICONS に直接入る。
 * 中央の窓は、本体を時計回り・窓を反時計回りに描いて nonzero則 で抜いている。
 * タグ内では14px表示(components.css の .tag__logo)なので、
 * ピンの幅と隙間はどちらも2ユニット取って潰れないようにしてある。
 */
const ASSEMBLY_CHIP = {
  path:
    "M5 5h14v14H5zM9 9v6h6V9z" + // 本体(外枠は時計回り、窓は反時計回り)
    "M7 2h2v3H7zM11 2h2v3h-2zM15 2h2v3h-2z" + // 上のピン
    "M7 19h2v3H7zM11 19h2v3h-2zM15 19h2v3h-2z" + // 下のピン
    "M2 7h3v2H2zM2 11h3v2H2zM2 15h3v2H2z" + // 左のピン
    "M19 7h3v2h-3zM19 11h3v2h-3zM19 15h3v2h-3z", // 右のピン
  // 公式カラーが無いのでテーマのブラウン(global.css の --color-primary)を使う
  hex: "8A5F3C",
};

export type TechIcon = {
  /** 24x24 の viewBox 前提の path */
  path: string;
  /** "#RRGGBB" 形式。simple-icons の hex は # が付かないのでここで付ける */
  color: string;
};

// キーはDBの技術タグ名(tech_tags.name)と完全一致させる
const ICONS: Record<string, { path: string; hex: string }> = {
  React: siReact,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  "Next.js": siNextdotjs,
  "Vue.js": siVuedotjs,
  "Node.js": siNodedotjs,
  Python: siPython,
  FastAPI: siFastapi,
  Django: siDjango,
  Go: siGo,
  Rust: siRust,
  // Javaのコーヒーカップは Oracle の商標なので simple-icons には無い。OpenJDK で代用する
  Java: siOpenjdk,
  Kotlin: siKotlin,
  Swift: siSwift,
  Flutter: siFlutter,
  PHP: siPhp,
  Ruby: siRuby,
  "C++": siCplusplus,
  Supabase: siSupabase,
  Docker: siDocker,
  Git: siGit,
  Linux: siLinux,
  Unity: siUnity,
  // simple-icons 由来ではない唯一の項目(理由は ASSEMBLY_CHIP のコメント)
  Assembly: ASSEMBLY_CHIP,
};

// ブランドカラーが白や極端に薄い色で、淡いタグ地に載せると消えるものだけ差し替える
const COLOR_OVERRIDE: Record<string, string> = {
  Unity: "#222C37", // 公式値は #FFFFFF
};

export function getTechIcon(name: string): TechIcon | null {
  const icon = ICONS[name];
  if (!icon) return null;

  return {
    path: icon.path,
    color: COLOR_OVERRIDE[name] ?? `#${icon.hex}`,
  };
}
