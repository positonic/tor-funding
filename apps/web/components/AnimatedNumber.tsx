import { useEffect, useRef, useState } from 'react';
import { formatUsd } from '@/lib/format';

/**
 * Ease-out tween from `start` to `value` on mount and on subsequent
 * prop changes. 1.2s on mount, 0.8s on updates per brief §"Animated
 * USD counter". Respects prefers-reduced-motion (snap to final).
 */
export interface AnimatedNumberProps {
  value: number;
  /** How the number is formatted when rendered. Defaults to $ whole. */
  format?: (n: number) => string;
  className?: string;
  /** Durations in ms. Kept as props so tests can shorten them. */
  mountDurationMs?: number;
  updateDurationMs?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function AnimatedNumber({
  value,
  format = formatUsd,
  className = '',
  mountDurationMs = 1200,
  updateDurationMs = 800,
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState<number>(0);
  const fromRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayed(value);
      fromRef.current = value;
      mountedRef.current = true;
      return;
    }

    const from = fromRef.current;
    const to = value;
    const duration = mountedRef.current ? updateDurationMs : mountDurationMs;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const v = from + (to - from) * eased;
      setDisplayed(v);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        mountedRef.current = true;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, mountDurationMs, updateDurationMs]);

  return <span className={className}>{format(displayed)}</span>;
}
