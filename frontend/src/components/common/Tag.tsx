type TagProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  /** components.css の .tag--category に対応(カテゴリ表示用) */
  variant?: "category";
};

export function Tag({ label, selected, onClick, variant }: TagProps) {
  const className = ["tag", variant && `tag--${variant}`, selected && "tag--selected"]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {label}
    </span>
  );
}

