//Button.tsx（見た目はまだ仮、構造だけ先に書く）
import type { ReactNode } from 'react';

type ButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
    disabled?: boolean;
    /** components.css の .button--primary / --secondary / --danger に対応 */
    variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({
    children,
    onClick,
    type = 'button',
    disabled = false,
    variant
}: ButtonProps) {
    return (
        <button
            className={`button${variant ? ` button--${variant}` : ''}`}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}