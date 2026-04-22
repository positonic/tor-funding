import { useState } from 'react';
import { Layout } from '@/components/Layout';

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'How are matches calculated?',
    a: 'Quadratic funding uses the square-root of each donation to weight community support. A project with 100 donors giving $10 each receives a larger match than a project with one donor giving $1000. The matching pool is then distributed proportionally across all participating projects at the end of the round.',
  },
  {
    q: 'Why do you need a view key for Monero?',
    a: 'View keys let the campaign verify that a donation landed in the project’s address without exposing who sent it or letting us spend the funds. The donor remains private; the donation remains verifiable. This is the "cooperative transparency" model.',
  },
  {
    q: 'What happens if a donation arrives after the round ends?',
    a: 'Only donations received on-chain (or via view-key verification) between May 19 and June 19, 2026 (UTC) count toward the match. Later donations still reach the project directly.',
  },
  {
    q: 'How do you prevent Sybil attacks?',
    a: 'All donations are reviewed by a small trusted committee for Sybil patterns — bursts of low-value donations from correlated addresses, dust transactions, or other manipulation. Flagged donations don’t count toward the match but are still delivered to the project.',
  },
  {
    q: 'Can I donate from Tor Browser?',
    a: 'Yes — every page on this site works without JavaScript for reading, and the donate flow requires only a QR code or copying an address. No wallet connection is needed. No third-party trackers or cookie banners, anywhere.',
  },
  {
    q: 'Where does leftover matching pool go?',
    a: 'There is no "leftover". The matching pool is distributed 100% at round end. If a project is disqualified, their share redistributes to the remaining projects.',
  },
];

const SYBIL_STEPS: [string, string, string][] = [
  [
    '01',
    'Automatic checks',
    'Correlated addresses and dust bursts flagged during the round.',
  ],
  [
    '02',
    'Committee review',
    'Small trusted committee reviews flagged patterns before final distribution.',
  ],
  [
    '03',
    'Flagged donations still reach the project',
    'They just don’t count toward the match.',
  ],
];

function QFDiagram() {
  const cols = [
    { x: 20, raised: 30, matched: 95, pct: '2.5×' },
    { x: 80, raised: 42, matched: 72, pct: '1.8×' },
    { x: 140, raised: 60, matched: 50, pct: '1.25×' },
    { x: 200, raised: 80, matched: 28, pct: '0.7×' },
  ] as const;
  return (
    <svg
      viewBox="0 0 320 170"
      width="100%"
      className="block"
      aria-label="Quadratic funding match distribution diagram"
    >
      <text
        x="130"
        y="14"
        fontFamily="Inter, sans-serif"
        fontSize="9"
        fontWeight="600"
        className="fill-ink-500 dark:fill-ink-400"
      >
        Same total raised, $400 each →
      </text>
      {cols.map((c, i) => (
        <g key={`bar-${i}`}>
          <rect
            x={c.x}
            y={150 - c.raised}
            width={40}
            height={c.raised}
            rx={2}
            className="fill-ink-50 dark:fill-ink-900 stroke-ink-100 dark:stroke-ink-700"
          />
          <text
            x={c.x + 20}
            y={162}
            fontFamily="Space Mono, monospace"
            fontSize="8"
            textAnchor="middle"
            className="fill-ink-500 dark:fill-ink-400"
          >
            $100
          </text>
        </g>
      ))}
      {cols.map((c, i) => (
        <g key={`match-${i}`}>
          <rect
            x={c.x}
            y={150 - c.matched}
            width={40}
            height={c.matched - c.raised}
            rx={2}
            fillOpacity="0.85"
            className="fill-purple-500"
          />
          <text
            x={c.x + 20}
            y={150 - c.matched - 4}
            fontFamily="Space Mono, monospace"
            fontSize="8"
            fontWeight="700"
            textAnchor="middle"
            className="fill-purple-500"
          >
            +{c.pct}
          </text>
        </g>
      ))}
      <g transform="translate(260, 60)">
        <rect
          x={0}
          y={0}
          width={9}
          height={9}
          className="fill-ink-50 dark:fill-ink-900 stroke-ink-100 dark:stroke-ink-700"
        />
        <text
          x={14}
          y={8}
          fontFamily="Inter, sans-serif"
          fontSize="8"
          className="fill-ink-500 dark:fill-ink-400"
        >
          Donations
        </text>
        <rect
          x={0}
          y={14}
          width={9}
          height={9}
          fillOpacity="0.85"
          className="fill-purple-500"
        />
        <text
          x={14}
          y={22}
          fontFamily="Inter, sans-serif"
          fontSize="8"
          className="fill-ink-500 dark:fill-ink-400"
        >
          QF match
        </text>
      </g>
    </svg>
  );
}

function ShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1L12 3V7c0 3-2 5-5 6-3-1-5-3-5-6V3l5-2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M5 7l1.5 1.5L9 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function TransparencyBlock() {
  return (
    <section className="p-5 rounded-card bg-[var(--surface)] border border-ink-100 dark:border-ink-700">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-success-bg text-success">
          <ShieldIcon />
        </span>
        <h3 className="font-sans text-[15px] font-bold text-ink-800 dark:text-ink-100">
          Cooperative transparency
        </h3>
      </div>
      <p className="text-[14px] leading-[1.55] text-ink-500 dark:text-ink-400 [text-wrap:pretty]">
        Every donation is verified. Public chains (Bitcoin, Ethereum, Solana)
        confirm on-chain. Private chains (Monero, shielded Zcash) are verified
        via view keys the projects share with the campaign. Donor identity
        stays private.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
        <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-900">
          <div className="flex items-center gap-1.5 mb-1 text-ink-800 dark:text-ink-100">
            <ShieldIcon size={12} />
            <span className="font-sans text-[12px] font-bold">On-chain</span>
          </div>
          <div className="text-[12px] leading-[1.5] text-ink-500 dark:text-ink-400">
            BTC, ETH, SOL, USDC, transparent ZEC. Anyone can verify.
          </div>
        </div>
        <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-900">
          <div className="flex items-center gap-1.5 mb-1 text-ink-800 dark:text-ink-100">
            <EyeIcon size={12} />
            <span className="font-sans text-[12px] font-bold">View-key</span>
          </div>
          <div className="text-[12px] leading-[1.5] text-ink-500 dark:text-ink-400">
            Monero, shielded ZEC. Campaign verifies; identity private.
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="border-b border-ink-100 dark:border-ink-700"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full min-h-14 py-3.5 flex items-center justify-between gap-3 text-left font-sans text-[15px] font-semibold text-ink-800 dark:text-ink-100"
            >
              <span className="flex-1">{item.q}</span>
              <span
                className={
                  'inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ' +
                  (isOpen
                    ? 'bg-purple-500 text-white'
                    : 'bg-ink-50 dark:bg-ink-900 text-ink-800 dark:text-ink-100')
                }
                aria-hidden="true"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d={isOpen ? 'M1 5h8' : 'M5 1v8M1 5h8'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div
                id={`faq-panel-${i}`}
                className="pb-4 pr-8 text-[14px] leading-[1.6] text-ink-500 dark:text-ink-400 [text-wrap:pretty]"
              >
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AboutPage() {
  return (
    <Layout
      title="About"
      description="How quadratic funding works in the Tor × FTC round."
    >
      {/* Hero */}
      <section className="border-b border-ink-100 dark:border-ink-700">
        <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-14">
          <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-ink-500 dark:text-ink-400 mb-2.5">
            About the campaign
          </div>
          <h1 className="font-display font-bold text-[40px] sm:text-[48px] lg:text-[56px] leading-[1] tracking-[-0.04em] text-ink-800 dark:text-ink-100 max-w-[820px] [text-wrap:balance]">
            How quadratic funding works
          </h1>
          <p className="mt-4 max-w-[680px] text-[18px] leading-[1.55] text-ink-500 dark:text-ink-400 [text-wrap:pretty]">
            QF rewards projects with broad community support, not big cheques.
            Here’s the model, the safeguards, and the answers to the most
            common questions.
          </p>
        </div>
      </section>

      {/* Model + diagram */}
      <section
        aria-labelledby="qf-title"
        className="border-b border-ink-100 dark:border-ink-700"
      >
        <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-purple-500 dark:text-purple-300 mb-2.5">
              The model
            </div>
            <h2
              id="qf-title"
              className="font-display font-bold text-[28px] md:text-[36px] leading-[1.05] tracking-[-0.03em] text-ink-800 dark:text-ink-100"
            >
              Many small donations beat one big one
            </h2>
            <p className="mt-3 text-[16px] leading-[1.55] text-ink-500 dark:text-ink-400 [text-wrap:pretty]">
              Four projects raise $400 each. QF matches based on how many
              people donated, not how much. The grassroots project wins.
            </p>
          </div>
          <div className="p-6 rounded-[14px] bg-ink-50 dark:bg-ink-900">
            <QFDiagram />
          </div>
        </div>
      </section>

      {/* Verification + Integrity */}
      <section className="border-b border-ink-100 dark:border-ink-700">
        <div className="mx-auto max-w-7xl px-panel md:px-8 py-10 md:py-12 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-purple-500 dark:text-purple-300 mb-2.5">
              Verification
            </div>
            <h2 className="font-display font-bold text-[24px] md:text-[28px] leading-[1.2] tracking-[-0.02em] text-ink-800 dark:text-ink-100 mb-4">
              Cooperative transparency
            </h2>
            <TransparencyBlock />
          </div>
          <div>
            <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-purple-500 dark:text-purple-300 mb-2.5">
              Integrity
            </div>
            <h2 className="font-display font-bold text-[24px] md:text-[28px] leading-[1.2] tracking-[-0.02em] text-ink-800 dark:text-ink-100 mb-4">
              Sybil review
            </h2>
            <div className="p-5 rounded-card bg-[var(--surface)] border border-ink-100 dark:border-ink-700 flex flex-col gap-3">
              {SYBIL_STEPS.map(([n, t, d]) => (
                <div key={n} className="grid grid-cols-[34px_1fr] gap-2.5">
                  <div className="font-mono text-[12px] font-bold tracking-[0.04em] text-purple-500 dark:text-purple-300 pt-[1px]">
                    {n}
                  </div>
                  <div>
                    <div className="font-sans text-[14px] font-bold text-ink-800 dark:text-ink-100">
                      {t}
                    </div>
                    <div className="text-[13px] leading-[1.5] text-ink-500 dark:text-ink-400">
                      {d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[900px] px-panel md:px-8 py-10 md:py-14">
        <h2 className="font-display font-bold text-[28px] md:text-[36px] leading-[1.05] tracking-[-0.03em] text-ink-800 dark:text-ink-100 mb-5">
          FAQ
        </h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>
    </Layout>
  );
}
