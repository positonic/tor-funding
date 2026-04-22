import type { Chain, ChainAddress } from '@tor/types';
import { DonationPanel } from './DonationPanel';

/**
 * <MatchingPoolPanel> — thin wrapper around <DonationPanel> that forces
 * the orange pool accent. Using a dedicated wrapper means callers can't
 * accidentally instantiate the purple-accent donation panel on the
 * /matching-pool page (accents must never be mixed — see CLAUDE.md #2).
 */
export interface MatchingPoolPanelProps {
  addresses: Partial<Record<Chain, ChainAddress>>;
  /** Usually all chains the pool has addresses on. */
  eligibleChains: readonly Chain[];
  defaultChain?: Chain;
  onEvent?: (
    event: 'copy' | 'wallet' | 'chain-change',
    payload: { chain: Chain },
  ) => void;
}

export function MatchingPoolPanel(props: MatchingPoolPanelProps) {
  return (
    <DonationPanel
      projectId="__matching_pool__"
      projectName="the matching pool"
      addresses={props.addresses}
      eligibleChains={props.eligibleChains}
      defaultChain={props.defaultChain}
      accent="pool"
      onEvent={props.onEvent}
    />
  );
}
