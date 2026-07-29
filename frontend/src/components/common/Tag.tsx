import { getTechIcon } from "../../lib/techIcons";

type TagProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  /** components.css の .tag--category に対応(カテゴリ表示用) */
  variant?: "category";
};

export function Tag({ label, selected, onClick, variant }: TagProps) {
  // カテゴリは和文ラベルなのでロゴは持たない。技術タグだけ公式ロゴを引く
  const icon = variant === "category" ? null : getTechIcon(label);

  const className = [
    "tag",
    variant && `tag--${variant}`,
    // ロゴがある側だけ左の余白を詰めたいので、有無をクラスで出す
    icon && "tag--with-logo",
    selected && "tag--selected",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {icon && (
        <svg
          className="tag__logo"
          viewBox="0 0 24 24"
          aria-hidden="true"
          // 選択中は地がアクセント色になるのでブランド色だと潰れる。文字色に合わせる
          style={{ fill: selected ? "currentColor" : icon.color }}
        >
          <path d={icon.path} />
        </svg>
      )}
      {label}
    </span>
  );
}
