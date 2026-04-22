import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * Shared button primitive. Polymorphic via `as`: renders a `<button>` by
 * default, `<a>` when `as="a"`.
 *
 * `kind` drives the accent:
 *   - 'primary' → purple (project donation flows, CTAs)
 *   - 'pool'    → orange (matching-pool flow ONLY; never on projects)
 *   - 'ghost'   → transparent, token-bordered secondary
 */
type Kind = 'primary' | 'pool' | 'ghost';

interface CommonProps {
  kind?: Kind;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | 'as'> & {
    as?: 'button';
  };

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'as'> & {
    as: 'a';
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const base =
  'inline-flex items-center justify-center gap-2 rounded-card px-4 py-3 text-body font-medium ' +
  'transition-colors focus-visible:outline-none min-h-touch';

const kindClasses: Record<Kind, string> = {
  primary:
    'bg-purple-500 text-white hover:bg-purple-600 shadow-cta ' +
    'disabled:bg-ink-200 disabled:text-ink-500 disabled:shadow-none',
  pool:
    'bg-pool-500 text-white hover:bg-pool-400 shadow-cta-pool ' +
    'disabled:bg-ink-200 disabled:text-ink-500 disabled:shadow-none',
  ghost:
    'bg-transparent text-ink-800 dark:text-ink-100 border border-ink-100 dark:border-ink-700 ' +
    'hover:bg-ink-50 dark:hover:bg-ink-900',
};

export function Button(props: ButtonProps) {
  const {
    kind = 'primary',
    fullWidth,
    className = '',
    children,
    as,
    ...rest
  } = props as ButtonProps & { as?: 'a' | 'button' };

  const cls = [
    base,
    kindClasses[kind],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (as === 'a') {
    return (
      <a
        className={cls}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
