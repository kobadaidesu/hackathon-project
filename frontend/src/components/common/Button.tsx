//Button.tsx（見た目はまだ仮、構造だけ先に書く）
import type { ReactNode } from 'react';

type ButtonProps = {
    children: ReactNode;
    onClick: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
};

export function Button({
    children,
    onClick,
    type = 'button',
    disabled = false
}: ButtonProps) {
    return (
        <button
            className="button"
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}