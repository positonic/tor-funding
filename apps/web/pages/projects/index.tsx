import type { GetStaticProps } from 'next';
import { Layout } from '@/components/Layout';
import { ProjectGrid } from '@/components/ProjectGrid';
import { UpdatedChip } from '@/components/UpdatedChip';
import { useSnapshot } from '@/lib/snapshot';
import {
  loadProjectsConfig,
  type ProjectConfigEntry,
} from '@/lib/projects-config';
import type { Chain, Project } from '@tor/types';

interface ProjectsIndexProps {
  /** Build-time metadata used as a fallback before the snapshot arrives. */
  seedProjects: readonly ProjectConfigEntry[];
}

export const getStaticProps: GetStaticProps<ProjectsIndexProps> = async () => {
  return { props: { seedProjects: loadProjectsConfig() } };
};

function seedToProject(p: ProjectConfigEntry): Project {
  return {
    id: p.id,
    name: p.name,
    short_desc: p.short_desc,
    long_desc_md: p.long_desc_md,
    matching_eligible_chains: p.matching_eligible_chains as readonly Chain[],
    donation_addresses: {},
    by_chain: {},
    total_donated_usd: 0,
    unique_donors: 0,
    projected_match_usd: 0,
  };
}

export default function ProjectsIndex({ seedProjects }: ProjectsIndexProps) {
  const { snapshot, isStale, updatedAt } = useSnapshot();

  // Before the snapshot lands, show the seeded project list with zeroed
  // numbers so the grid renders immediately on static navigation.
  const projects: readonly Project[] =
    snapshot?.projects ?? seedProjects.map(seedToProject);

  return (
    <Layout title="Projects" description="All Tor sub-projects in the round.">
      <div className="mx-auto max-w-6xl px-panel py-8">
        <div className="flex items-center justify-between mb-4">
          <div />
          <UpdatedChip updatedAt={updatedAt} isStale={isStale} />
        </div>
        <ProjectGrid projects={projects} />
      </div>
    </Layout>
  );
}
