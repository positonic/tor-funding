import { useEffect, useState } from 'react';

/**
 * Tiny live-region chip that reads "Updated Xs ago". Used next to the
 * leaderboard / hero counters (brief §"Leaderboard refresh").
 */
export interface UpdatedChipProps {
  /** ISO timestamp from `snapshot.generated_at`. */
  updatedAt?: string;
  isStale?: boolean;
}

function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}

export function UpdatedChip({ updatedAt, isStale }: UpdatedChipProps) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(id);
  }, []);

  if (!updatedAt) return null;
  const delta = now - new Date(updatedAt).getTime();

  return (
    <span
      aria-live="polite"
      className={
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-micro border ' +
        (isStale
          ? 'bg-warning-bg text-warning-fg border-warning'
          : 'bg-ink-50 dark:bg-ink-900 text-ink-500 dark:text-ink-400 border-ink-100 dark:border-ink-700')
      }
    >
      <span
        aria-hidden="true"
        className={
          'inline-block w-1.5 h-1.5 rounded-pill ' +
          (isStale ? 'bg-warning' : 'bg-success')
        }
      />
      Updated {ago(delta)} ago
    </span>
  );
}
