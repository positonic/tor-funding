import type { GetStaticPaths, GetStaticProps } from 'next';
import { useEffect, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { DonationPanel } from '@/components/DonationPanel';
import { RecentFeed } from '@/components/RecentFeed';
import { UpdatedChip } from '@/components/UpdatedChip';
import { ChainBreakdown } from '@/components/ChainBreakdown';
import { Button } from '@/components/Button';
import { useSnapshot } from '@/lib/snapshot';
import { formatUsd } from '@/lib/format';
import {
  loadProjectsConfig,
  loadProjectConfig,
  type ProjectConfigEntry,
} from '@/lib/projects-config';
import type { Chain } from '@tor/types';

interface ProjectDetailProps {
  slug: string;
  project: ProjectConfigEntry;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: loadProjectsConfig().map((p) => ({ params: { slug: p.id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ProjectDetailProps> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? '');
  const project = loadProjectConfig(slug);
  if (!project) {
    return { notFound: true };
  }
  return { props: { slug, project } };
};

export default function ProjectDetail({ slug, project }: ProjectDetailProps) {
  const { snapshot, isStale, updatedAt } = useSnapshot();

  const live = snapshot?.projects.find((p) => p.id === slug);
  const addresses = live?.donation_addresses ?? {};
  const eligibleChains = (project.matching_eligible_chains as Chain[]) ?? [];

  const totalRaised = live?.total_donated_usd ?? 0;
  const projectedMatch = live?.projected_match_usd ?? 0;
  const uniqueDonors = live?.unique_donors ?? 0;
  const byChain = live?.by_chain ?? {};

  // Sticky bottom CTA: visible on mobile only, hidden when the donation
  // panel is fully in view (brief §"Sticky bottom CTA").
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelInView, setPanelInView] = useState<boolean>(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setPanelInView(entry.isIntersecting);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Render long description as plain paragraphs. TODO: markdown renderer
  // (tiny: `micromark` or `marked`) once content has inline links/emphasis.
  const paragraphs = (project.long_desc_md ?? project.short_desc).split(/\n\n+/);

  return (
    <Layout
      title={project.name}
      description={project.short_desc}
    >
      <article className="mx-auto max-w-6xl px-panel py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-micro uppercase tracking-wide text-ink-500 dark:text-ink-400">
              Tor sub-project
            </div>
            <UpdatedChip updatedAt={updatedAt} isStale={isStale} />
          </div>
          <h1 className="font-display text-h1 text-ink-800 dark:text-ink-100 mt-2">
            {project.name}
          </h1>
          <p className="mt-2 text-body-lg text-ink-500 dark:text-ink-400 max-w-3xl">
            {project.short_desc}
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-[1fr_380px]">
          <div>
            <section className="prose-like space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-body-lg text-ink-800 dark:text-ink-100">
                  {p}
                </p>
              ))}
            </section>

            <section className="mt-8" ref={panelRef}>
              <DonationPanel
                projectId={project.id}
                projectName={project.name}
                addresses={addresses}
                eligibleChains={eligibleChains}
              />
            </section>

            <section className="mt-8">
              <h2 className="font-display text-h3 text-ink-800 dark:text-ink-100 mb-3">
                Recent donations
              </h2>
              <RecentFeed
                donations={snapshot?.recent_donations ?? []}
                projects={snapshot?.projects ?? []}
                projectId={project.id}
                limit={6}
              />
            </section>
          </div>

          <aside className="space-y-4">
            <div className="p-panel rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)] space-y-3">
              <div>
                <div className="text-micro uppercase text-ink-500 dark:text-ink-400">
                  Raised so far
                </div>
                <div className="font-display text-h2 text-ink-800 dark:text-ink-100">
                  {formatUsd(totalRaised)}
                </div>
                <div className="text-caption text-ink-500 dark:text-ink-400">
                  {uniqueDonors.toLocaleString()} donor{uniqueDonors === 1 ? '' : 's'}
                </div>
              </div>
              <div className="border-t border-ink-100 dark:border-ink-700 pt-3">
                <div className="text-micro uppercase text-ink-500 dark:text-ink-400">
                  Projected match
                </div>
                <div className="font-display text-h2 text-purple-500 dark:text-purple-300">
                  +{formatUsd(projectedMatch)}
                </div>
                <div className="text-caption text-ink-500 dark:text-ink-400">
                  updated live from the community pool
                </div>
              </div>
            </div>

            <div className="p-panel rounded-panel border border-ink-100 dark:border-ink-700 bg-[var(--surface)]">
              <ChainBreakdown byChain={byChain} title="By chain" />
            </div>
          </aside>
        </div>
      </article>

      {/* Sticky mobile CTA */}
      <div
        className={
          'md:hidden fixed bottom-0 inset-x-0 p-3 bg-[var(--surface)] border-t border-ink-100 dark:border-ink-700 ' +
          'transition-transform duration-200 ' +
          (panelInView ? 'translate-y-full' : 'translate-y-0')
        }
      >
        <Button
          as="a"
          href="#donate"
          kind="primary"
          fullWidth
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Donate to {project.name}
        </Button>
      </div>
    </Layout>
  );
}
