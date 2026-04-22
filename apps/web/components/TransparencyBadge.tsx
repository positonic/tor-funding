import { useId, useState, useRef, useEffect, type KeyboardEvent } from 'react';

/**
 * <TransparencyBadge> — pill with a tooltip explaining the verification
 * model for this donation.
 *
 * Copy VERBATIM from brief §11 (negotiated with Tor's comms team; do
 * not paraphrase):
 *   public:   "This donation was verified directly on a public blockchain."
 *   view_key: "This donation was verified via a view key the project
 *              shared with the campaign. Donor identity remains private."
 *
 * Keyboard contract (a11y §"Transparency badge tooltip"):
 *   - Focus reveals tooltip
 *   - Esc dismisses
 *   - Hover reveals on pointer devices
 */
export interface TransparencyBadgeProps {
  kind: 'public' | 'view_key';
  className?: string;
}

const COPY: Record<TransparencyBadgeProps['kind'], { label: string; tip: string }> = {
  public: {
    label: 'Verified on-chain',
    tip: 'This donation was verified directly on a public blockchain.',
  },
  view_key: {
    label: 'Verified via view key',
    tip:
      'This donation was verified via a view key the project shared with ' +
      'the campaign. Donor identity remains private.',
  },
};

export function TransparencyBadge({ kind, className = '' }: TransparencyBadgeProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { label, tip } = COPY[kind];

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        btnRef.current?.blur();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function handleKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        ref={btnRef}
        type="button"
        aria-describedby={id}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onKeyDown={handleKey}
        className={
          'inline-flex items-center gap-1 px-2 py-1 rounded-pill text-caption font-medium border ' +
          (kind === 'public'
            ? 'bg-success-bg text-success-fg border-success'
            : 'bg-info-bg text-info-fg border-info')
        }
      >
        <span
          aria-hidden="true"
          className={
            'inline-block w-2 h-2 rounded-pill ' +
            (kind === 'public' ? 'bg-success' : 'bg-info')
          }
        />
        {label}
      </button>
      <span
        role="tooltip"
        id={id}
        className={
          'absolute bottom-full left-0 mb-2 w-[min(280px,80vw)] p-3 rounded-card text-caption ' +
          'bg-ink-800 text-white dark:bg-ink-700 shadow-card z-10 ' +
          'transition-opacity ' +
          (open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
        }
      >
        {tip}
      </span>
    </span>
  );
}
