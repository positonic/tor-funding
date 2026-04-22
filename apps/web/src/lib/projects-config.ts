/**
 * Build-time project config loader.
 *
 * Reads `config/projects.yaml` at the repo root. Consumed exclusively
 * from `getStaticProps` / `getStaticPaths` — never imported into a
 * client bundle (the Node `fs` / `path` imports would blow up webpack).
 *
 * If the file doesn't exist yet (early scaffolding phase), we fall back
 * to a minimal set derived from the sample snapshot so `npm run dev`
 * still produces a working site. Remove the fallback once
 * `config/projects.yaml` lands (bead TODO).
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface ProjectConfigEntry {
  id: string;
  name: string;
  short_desc: string;
  /** Markdown — rendered naïvely by paragraph split in v1. */
  long_desc_md?: string;
  matching_eligible_chains: string[];
}

export interface CampaignConfig {
  starts_at: string;
  ends_at: string;
}

// Derived from the sample snapshot. Used only when config/projects.yaml
// is absent — i.e. during early scaffolding.
const FALLBACK_PROJECTS: ProjectConfigEntry[] = [
  {
    id: 'anti-censorship',
    name: 'Anti-Censorship Team',
    short_desc: 'Bridges, pluggable transports, and circumvention tools',
    long_desc_md:
      'The Anti-Censorship Team builds and maintains the tools that keep Tor reachable in hostile networks — bridges, pluggable transports (obfs4, meek, Snowflake, WebTunnel), and the BridgeDB distribution infrastructure.\n\nThis work directly supports users in countries where Tor is actively blocked. Your donation funds bridge infrastructure, transport research, and on-call response to new censorship events.',
    matching_eligible_chains: ['btc', 'eth', 'sol', 'zec_t', 'xmr'],
  },
  {
    id: 'tor-browser',
    name: 'Tor Browser',
    short_desc: 'The anonymous browser used by millions',
    long_desc_md:
      'Tor Browser is the flagship privacy browser — a hardened Firefox fork that routes every connection through the Tor network by default.\n\nMillions of people rely on it to read, research, and communicate safely. Your donation funds ongoing security audits, regular releases tracking upstream Firefox, and the fingerprinting-resistance work that sets it apart.',
    matching_eligible_chains: ['btc', 'eth', 'sol', 'zec_t'],
  },
  {
    id: 'arti',
    name: 'Arti — Tor in Rust',
    short_desc: 'Next-generation Tor implementation',
    long_desc_md:
      'Arti is the ground-up rewrite of Tor in Rust — safer against memory bugs, easier to embed, and designed for the next decade of the network.\n\nYour donation accelerates Arti\'s path to parity with the C implementation and unlocks embedding Tor directly into mobile apps, messengers, and other tools.',
    matching_eligible_chains: ['btc', 'eth', 'xmr'],
  },
];

const FALLBACK_CAMPAIGN: CampaignConfig = {
  starts_at: '2026-05-19T00:00:00Z',
  ends_at: '2026-06-19T23:59:59Z',
};

function repoRoot(): string {
  // Walk up from apps/web — when Next runs `getStaticProps`, cwd is the
  // app directory. Two levels up is the monorepo root.
  return path.resolve(process.cwd(), '..', '..');
}

function safeReadYaml<T>(relPath: string): T | null {
  const abs = path.join(repoRoot(), relPath);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs, 'utf8');
  return yaml.load(raw) as T;
}

export function loadProjectsConfig(): ProjectConfigEntry[] {
  const fromFile = safeReadYaml<{ projects?: ProjectConfigEntry[] }>(
    'config/projects.yaml',
  );
  if (fromFile?.projects && fromFile.projects.length > 0) {
    return fromFile.projects;
  }
  return FALLBACK_PROJECTS;
}

export function loadCampaignConfig(): CampaignConfig {
  const fromFile = safeReadYaml<{ campaign?: CampaignConfig }>(
    'config/matching-pool.yaml',
  );
  if (fromFile?.campaign) return fromFile.campaign;
  return FALLBACK_CAMPAIGN;
}

export function loadProjectConfig(id: string): ProjectConfigEntry | null {
  return loadProjectsConfig().find((p) => p.id === id) ?? null;
}
