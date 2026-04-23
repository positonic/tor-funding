/**
 * <DonationPanel> — project page donation flow (adapted from the design
 * handoff reference implementation).
 *
 * Chain tabs → selected chain renders address, QR, copy, wallet deep link.
 * Only renders chains the project is matching-eligible on.
 *
 * Mobile (<768): full-width. Tablet+: compact side panel; parent sets width.
 *
 * Props are fully driven by snapshot.json — never hardcode addresses.
 */
import { useState, useMemo, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Chain, ChainAddress, WalletDeepLink } from '@tor/types';
import { copyToClipboard } from '@/lib/copy';
import { buildWalletDeepLink } from '@/lib/wallet-links';
import { TEST_MODE } from '@/lib/test-mode';
import { ChainTab } from './ChainTab';
import { Button } from './Button';
import { TransparencyBadge } from './TransparencyBadge';

export interface DonationPanelProps {
  projectId: string;
  projectName: string;
  /** Full address catalog for the project, keyed by chain id. */
  addresses: Partial<Record<Chain, ChainAddress>>;
  /** Subset of chains this project is matching-eligible on. */
  eligibleChains: readonly Chain[];
  /** Optional default selection; otherwise first eligible chain. */
  defaultChain?: Chain;
  /** Accent: 'primary' (purple, projects) | 'pool' (orange, matching pool). */
  accent?: 'primary' | 'pool';
  /** Analytics hook — fires on copy/wallet click. */
  onEvent?: (
    event: 'copy' | 'wallet' | 'chain-change',
    payload: { chain: Chain },
  ) => void;
}

export function DonationPanel({
  projectId: _projectId,
  projectName,
  addresses,
  eligibleChains,
  defaultChain,
  accent = 'primary',
  onEvent,
}: DonationPanelProps) {
  // Filter out chains we don't have an address for — the panel only
  // offers chains we can actually receive on.
  const usableChains = useMemo(
    () => eligibleChains.filter((c) => addresses[c] !== undefined),
    [eligibleChains, addresses],
  );

  const firstChain: Chain | undefined = defaultChain ?? usableChains[0];
  const [chain, setChain] = useState<Chain | undefined>(firstChain);
  const [copied, setCopied] = useState(false);

  // If props shift and our chain is no longer in the usable list, reset.
  useEffect(() => {
    if (chain && !usableChains.includes(chain)) {
      setChain(usableChains[0]);
    } else if (!chain && usableChains.length > 0) {
      setChain(usableChains[0]);
    }
  }, [chain, usableChains]);

  const current: ChainAddress | undefined = chain ? addresses[chain] : undefined;

  const walletLink = useMemo<WalletDeepLink | null>(
    () => (chain && current ? buildWalletDeepLink(chain, current.address) : null),
    [chain, current],
  );

  if (!chain || !current || usableChains.length === 0) {
    // No matching-eligible chains with addresses — shouldn't happen in
    // production (spec §6.2) but we degrade gracefully.
    return (
      <section
        aria-label={`Donate to ${projectName}`}
        className="rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)] p-panel md:p-panel-lg"
      >
        <p className="text-body text-ink-500 dark:text-ink-400">
          No matching-eligible donation chains configured yet for {projectName}.
        </p>
      </section>
    );
  }

  const ctaKind: 'primary' | 'pool' = accent === 'pool' ? 'pool' : 'primary';

  async function handleCopy() {
    if (!current || !chain) return;
    await copyToClipboard(current.address);
    setCopied(true);
    onEvent?.('copy', { chain });
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section
      aria-label={`Donate to ${projectName}`}
      className="rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)] p-panel md:p-panel-lg"
    >
      {/* Chain tabs — horizontal scroll on mobile, snap */}
      <div
        role="tablist"
        aria-label="Choose a chain"
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory -mx-panel px-panel md:mx-0 md:px-0 md:flex-wrap"
      >
        {usableChains.map((c) => (
          <ChainTab
            key={c}
            chain={c}
            selected={c === chain}
            accent={accent}
            onSelect={() => {
              setChain(c);
              onEvent?.('chain-change', { chain: c });
            }}
            label={addresses[c]?.label}
            ticker={addresses[c]?.ticker}
          />
        ))}
      </div>

      {/* Address + QR */}
      <div
        role="tabpanel"
        className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-start"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="block text-micro uppercase tracking-wide text-ink-500 dark:text-ink-400">
              {current.label} address
            </label>
            <TransparencyBadge kind={current.verification} />
          </div>
          {/* address-mono class forbids ellipsis truncation. Do NOT add
              truncate / line-clamp / white-space nowrap + overflow hidden. */}
          <code
            data-address
            className="address-mono block text-body leading-relaxed p-3 rounded-card bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700"
          >
            {current.address}
          </code>
          {current.memoRequired && (
            <p
              className={
                'mt-2 text-caption ' +
                (accent === 'pool'
                  ? 'text-pool-700 dark:text-pool-300'
                  : 'text-purple-700 dark:text-purple-300')
              }
            >
              Memo required — see instructions below.
            </p>
          )}
        </div>

        <figure className="flex flex-col items-center md:items-end">
          {TEST_MODE ? (
            <div
              role="alert"
              className="p-3 rounded-card bg-danger-bg border border-danger text-danger-fg flex items-center justify-center text-center font-mono text-caption"
              style={{ width: 264, height: 264 }}
              aria-label="QR code hidden in test mode"
            >
              QR disabled
              <br />
              in test mode
            </div>
          ) : (
            <div
              className="p-3 rounded-card bg-white border border-ink-100"
              aria-label={`QR code for ${current.label} address`}
            >
              <QRCodeSVG
                value={current.uri ?? current.address}
                size={240}
                level="M"
                marginSize={0}
              />
            </div>
          )}
          <figcaption className="mt-2 text-caption text-ink-500 dark:text-ink-400 font-mono">
            {current.ticker}
          </figcaption>
        </figure>
      </div>

      {/* Actions — copy primary, wallet deep link secondary */}
      {TEST_MODE ? (
        <div
          role="alert"
          className="mt-5 p-3 rounded-card bg-danger-bg border border-danger text-danger-fg text-caption text-center"
        >
          <strong className="uppercase tracking-wider font-mono">
            Test mode
          </strong>{' '}
          — donation actions disabled. The address above is a placeholder; do
          not send funds.
        </div>
      ) : (
        <div className="mt-5 grid gap-2 md:grid-cols-[1fr_auto]">
          <Button
            kind={ctaKind}
            fullWidth
            onClick={handleCopy}
            aria-live="polite"
          >
            {copied ? 'Copied ✓' : `Copy ${current.ticker} address`}
          </Button>
          {walletLink && (
            <Button
              kind="ghost"
              as="a"
              href={walletLink.href}
              onClick={() => onEvent?.('wallet', { chain })}
            >
              Open in {walletLink.walletName}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
