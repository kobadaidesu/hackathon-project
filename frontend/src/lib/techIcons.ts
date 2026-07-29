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
