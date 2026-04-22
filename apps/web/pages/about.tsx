import { useState } from 'react';
import { Layout } from '@/components/Layout';

/**
 * About page — structural placeholder.
 *
 * TODO (bead §17.9 story 78 "QF explainer copy"): swap the placeholder
 *   paragraphs for the final copy negotiated with Tor's comms team.
 * TODO (bead §17.9 story 79 "FAQ content"): fill `FAQ_ITEMS` with the
 *   vetted question/answer pairs — currently ships empty.
 */
const FAQ_ITEMS: Array<{ q: string; a: string }> = [];

function Accordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) {
    return (
      <p className="text-caption text-ink-500 dark:text-ink-400">
        FAQ content coming soon.
      </p>
    );
  }
  return (
    <ul className="border-t border-ink-100 dark:border-ink-700">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className="border-b border-ink-100 dark:border-ink-700">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-left py-3 text-body-lg text-ink-800 dark:text-ink-100"
            >
              {item.q}
            </button>
            {isOpen && (
              <div
                id={`faq-panel-${i}`}
                className="pb-3 text-body text-ink-500 dark:text-ink-400"
              >
                {item.a}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <Layout
      title="About"
      description="How quadratic funding works in the Tor × FTC round."
    >
      <div className="mx-auto max-w-3xl px-panel py-8 space-y-10">
        <header>
          <h1 className="font-display text-h1 text-ink-800 dark:text-ink-100">
            About the round
          </h1>
          <p className="mt-3 text-body-lg text-ink-500 dark:text-ink-400">
            A 31-day quadratic funding round for the Tor Project, run with
            Funding the Commons.
          </p>
        </header>

        <section aria-labelledby="qf-title">
          <h2 id="qf-title" className="font-display text-h2 text-ink-800 dark:text-ink-100">
            How quadratic funding works
          </h2>
          <p className="mt-3 text-body-lg text-ink-800 dark:text-ink-100">
            Quadratic funding rewards the projects with the broadest community support,
            not just the biggest individual donors. Many small donations to a project
            earn a disproportionately larger share of the matching pool than a single
            large donation of the same total amount.
          </p>
          <p className="mt-3 text-body-lg text-ink-800 dark:text-ink-100">
            {/* TODO (§17.9 story 78): final explainer copy. */}
            In this round your donation is both a contribution and a vote — the more
            donors a project has, the more it receives from the pool at round close.
          </p>
        </section>

        <section aria-labelledby="transparency-title">
          <h2
            id="transparency-title"
            className="font-display text-h2 text-ink-800 dark:text-ink-100"
          >
            Cooperative transparency
          </h2>
          <p className="mt-3 text-body-lg text-ink-800 dark:text-ink-100">
            Every participating project has voluntarily made its incoming donations
            observable — public on-chain where possible, view-key verified on privacy
            chains (Monero, shielded Zcash). Donors see the same data the campaign does.
          </p>
        </section>

        <section aria-labelledby="sybil-title">
          <h2
            id="sybil-title"
            className="font-display text-h2 text-ink-800 dark:text-ink-100"
          >
            Sybil resistance
          </h2>
          <p className="mt-3 text-body-lg text-ink-800 dark:text-ink-100">
            Quadratic funding is vulnerable to donors splitting one contribution across
            many identities to game the match. We apply heuristic review at round close
            rather than cryptographic identity attestation — keeping the donation flow
            friction-free.
          </p>
        </section>

        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className="font-display text-h2 text-ink-800 dark:text-ink-100 mb-3">
            FAQ
          </h2>
          <Accordion items={FAQ_ITEMS} />
        </section>
      </div>
    </Layout>
  );
}
