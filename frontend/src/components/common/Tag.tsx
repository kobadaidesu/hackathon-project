type TagProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function Tag({ label, selected, onClick }: TagProps) {
  return (
    <span
      className={`tag${selected ? " tag--selected" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {label}
    </span>
  );
}

