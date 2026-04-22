/**
 * `useSnapshot()` — TanStack Query hook that polls /snapshot.json
 * every 60s. This is the single runtime data source for the web app;
 * all components read from it (via props or this hook).
 *
 * See spec §3.1 and design-handoff §"State management".
 */
import { useQuery } from '@tanstack/react-query';
import type { Snapshot } from '@tor/types';

const SNAPSHOT_URL = '/snapshot.json';
const POLL_MS = 60_000;
// Mark data stale at 2× the poll interval — if we're falling that far
// behind, the "Updated Xs ago" chip should warn the donor.
const STALE_THRESHOLD_MS = POLL_MS * 2;

async function fetchSnapshot(): Promise<Snapshot> {
  const res = await fetch(SNAPSHOT_URL, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`snapshot fetch failed: ${res.status}`);
  }
  return (await res.json()) as Snapshot;
}

export interface UseSnapshotResult {
  snapshot: Snapshot | undefined;
  isLoading: boolean;
  isError: boolean;
  /** True when the last successful fetch was more than 2 poll intervals ago. */
  isStale: boolean;
  /** ISO timestamp of the snapshot payload itself (from the tracker). */
  updatedAt: string | undefined;
}

export function useSnapshot(): UseSnapshotResult {
  const query = useQuery({
    queryKey: ['snapshot'],
    queryFn: fetchSnapshot,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: POLL_MS,
  });

  const dataUpdatedAt = query.dataUpdatedAt;
  const isStale =
    dataUpdatedAt > 0 && Date.now() - dataUpdatedAt > STALE_THRESHOLD_MS;

  return {
    snapshot: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isStale,
    updatedAt: query.data?.generated_at,
  };
}
