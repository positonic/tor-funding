# tor-platform

Tor Project × Funding the Commons quadratic funding campaign site + donation tracker.

- **Canonical spec**: [docs/tech-spec-v3.1.md](docs/tech-spec-v3.1.md)
- **Design handoff**: [design-mockups/design_handoff_tor_ftc_qf/README.md](design-mockups/design_handoff_tor_ftc_qf/README.md)
- **Agent guide**: [CLAUDE.md](CLAUDE.md)

## Structure

Monorepo with npm workspaces:

```
tor-platform/
├── apps/
│   ├── web/              # Next.js static export → TPA CDN
│   └── tracker/          # Node.js donation tracker → TPA VM
├── packages/
│   └── types/            # Shared Snapshot contract between tracker and web
├── config/
│   ├── projects.yaml     # Source of truth: project metadata + addresses
│   └── matching-pool.yaml# Source of truth: pool addresses per chain
├── docs/
├── design-mockups/       # Design handoff (visual truth — not production code)
└── .beads/               # Issue tracking (local-only)
```

## Develop

```bash
# First time
npm install

# Run the web app against sample snapshot data
npm run dev:web

# Run the tracker (testnet config + mock view keys)
npm run dev:tracker
```

## Check

```bash
npm run check        # typecheck + lint across workspaces
```

## Deploy

GitLab CI builds both apps on push to `main`. See [.gitlab-ci.yml](.gitlab-ci.yml).

- Frontend → `rsync apps/web/out/` to TPA static CDN
- Tracker → Docker image to TPA registry, redeploy on TPA VM

## Task tracking

All work is tracked in `bd` (beads). Never use `TodoWrite` in this repo. See `CLAUDE.md` for the workflow.
