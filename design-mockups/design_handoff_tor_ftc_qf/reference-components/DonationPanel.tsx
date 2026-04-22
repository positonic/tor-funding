/**
 * <DonationPanel> — project page donation flow.
 *
 * Chain tabs → selected chain renders address, QR, copy, wallet deep link.
 * Only renders chains the project is matching-eligible on.
 *
 * Mobile (<768): full-width, sticky bottom CTA handled by parent layout.
 * Tablet+: compact side panel; parent controls width.
 *
 * Props are fully driven by snapshot.json — never hardcode.
 */
'use client';

import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Chain, ChainAddress, WalletDeepLink } from '@/lib/types';
import { copyToClipboard } from '@/lib/copy';
import { buildWalletDeepLink } from '@/lib/wallet-links';
import { ChainTab } from './ChainTab';
import { Button } from './Button';

export interface DonationPanelProps {
  projectId: string;
  projectName: string;
  /** Full address catalog for the project, keyed by chain id. */
  addresses: Record<Chain, ChainAddress>;
  /** Subset of chains this project is matching-eligible on. */
  eligibleChains: Chain[];
  /** Optional default selection; otherwise first eligible chain. */
  defaultChain?: Chain;
  /** Accent: 'primary' (purple, projects) | 'pool' (orange, matching pool). */
  accent?: 'primary' | 'pool';
  /** Analytics hook — fires on copy/wallet click. */
  onEvent?: (event: 'copy' | 'wallet' | 'chain-change', payload: { chain: Chain }) => void;
}

export function DonationPanel({
  projectId,
  projectName,
  addresses,
  eligibleChains,
  defaultChain,
  accent = 'primary',
  onEvent,
}: DonationPanelProps) {
  const [chain, setChain] = useState<Chain>(defaultChain ?? eligibleChains[0]);
  const [copied, setCopied] = useState(false);

  const current = addresses[chain];
  const walletLink = useMemo<WalletDeepLink | null>(
    () => buildWalletDeepLink(chain, current.address),
    [chain, current.address],
  );

  const accentClass = accent === 'pool'
    ? 'border-pool-500 text-pool-700 dark:text-pool-300'
    : 'border-purple-500 text-purple-700 dark:text-purple-300';

  const ctaKind = accent === 'pool' ? 'pool' : 'primary';

  async function handleCopy() {
    await copyToClipboard(current.address);
    setCopied(true);
    onEvent?.('copy', { chain });
    setTimeout(() => setCopied(false), 1800);
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
        {eligibleChains.map((c) => (
          <ChainTab
            key={c}
            chain={c}
            selected={c === chain}
            accent={accent}
            onSelect={() => {
              setChain(c);
              onEvent?.('chain-change', { chain: c });
            }}
          />
        ))}
      </div>

      {/* Address + QR */}
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <label className="block text-micro uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-2">
            {current.label} address
          </label>
          {/* address-mono class forbids ellipsis truncation */}
          <code className="address-mono block text-body font-mono leading-relaxed p-3 rounded-card bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-700">
            {current.address}
          </code>
          {current.memoRequired && (
            <p className={`mt-2 text-caption ${accentClass.split(' ')[1]}`}>
              Memo required — see instructions below.
            </p>
          )}
        </div>

        <figure className="flex flex-col items-center md:items-end">
          <div
            className="p-3 rounded-card bg-white border border-ink-100"
            aria-label={`QR code for ${current.label} address`}
          >
            {/* 240×240 minimum on mobile per brief §7 */}
            <QRCodeSVG
              value={current.uri ?? current.address}
              size={240}
              level="M"
              includeMargin={false}
            />
          </div>
          <figcaption className="mt-2 text-caption text-ink-500 dark:text-ink-400 font-mono">
            {current.ticker}
          </figcaption>
        </figure>
      </div>

      {/* Actions — copy is primary, wallet deep link secondary */}
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
    </section>
  );
}
