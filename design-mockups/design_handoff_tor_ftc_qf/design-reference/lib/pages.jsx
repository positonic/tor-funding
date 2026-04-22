// Project page + Matching pool page + donation panel variants

// ─── Sidebar stats for project page ───
function ProjectStats({ project, theme, tone = 'primary' }) {
  const t = theme || window.lightTheme;
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  const totalWithMatch = project.total_donated_usd + project.projected_match_usd;
  const pct = (project.total_donated_usd / totalWithMatch) * 100;
  return (
    <section style={{
      padding: 18, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Raised</div>
          <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            <AnimatedNumber value={project.total_donated_usd} decimals={0}/>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: accent, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Projected match</div>
          <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 20, fontWeight: 700, color: accent, letterSpacing: '-0.02em' }}>
            +{formatUSD(project.projected_match_usd)}
          </div>
        </div>
      </div>
      {/* Stacked bar: donated vs match */}
      <div style={{ position: 'relative', height: 10, background: t.bgMuted, borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: `${pct}%`, background: t.text, height: '100%' }}/>
        <div style={{ flex: 1, background: `repeating-linear-gradient(45deg, ${accent} 0 4px, ${tone==='pool'?t.accentPoolSoft:t.primarySoft} 4px 8px)`, height: '100%' }}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 12, color: t.textMuted }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, background: t.text, borderRadius: 2 }}/> Donated
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, background: accent, borderRadius: 2 }}/> Est. match
        </span>
      </div>
      <div style={{ height: 1, background: t.border }}/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Stat theme={t} label="Donors" value={project.unique_donors.toLocaleString()}/>
        <Stat theme={t} label="Chains live" value={project.matching_eligible_chains.length}/>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
        background: t.successSoft, borderRadius: 6,
        fontFamily: 'Inter', fontSize: 12, color: t.success, fontWeight: 500,
      }}>
        <Icon.shield/>
        <span>Cooperative transparency: all donations verified, view-keys for private chains</span>
      </div>
    </section>
  );
}

// ─── About / team block ───
function AboutBlock({ project, theme }) {
  const t = theme || window.lightTheme;
  return (
    <section style={{
      padding: 18, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
    }}>
      <h3 style={{ margin: '0 0 10px', fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.005em' }}>
        About this project
      </h3>
      <p style={{
        margin: 0, fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55, color: t.textMuted,
        textWrap: 'pretty',
      }}>
        {project.long_desc}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
        {project.team.map(m => (
          <span key={m} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px',
            background: t.bgMuted, borderRadius: 999,
            fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.text,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: t.primary }}/>
            {m}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
        {project.links.map(l => (
          <a key={l.label} href={l.url} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.text, textDecoration: 'none',
          }}>
            <span>{l.label}</span>
            <span style={{ color: t.textMuted }}><Icon.external/></span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Project hero — different visual weight per variant ───
function ProjectHero({ project, theme, variant = 'default' }) {
  const t = theme || window.lightTheme;
  if (variant === 'warm') {
    return (
      <section style={{
        padding: '22px 16px 18px', background: t.primarySoft,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Badge color="primary" theme={t} size="sm" icon={<Icon.onion size={10}/>}>Tor Project</Badge>
          <Badge color="outline" theme={t} size="sm">Matching eligible</Badge>
        </div>
        <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 32, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {project.name}
        </h1>
        <p style={{ margin: '8px 0 0', fontFamily: 'Inter', fontSize: 15, lineHeight: 1.45, color: t.textMuted }}>
          {project.short_desc}
        </p>
      </section>
    );
  }
  if (variant === 'scanner') {
    return (
      <section style={{
        padding: '20px 16px 14px', background: t.bg,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          /projects/{project.id}
        </div>
        <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {project.name}
        </h1>
        <p style={{ margin: '6px 0 0', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.5, color: t.textMuted }}>
          {project.short_desc}
        </p>
      </section>
    );
  }
  // default
  return (
    <section style={{ padding: '20px 16px 16px', background: t.bg, borderBottom: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Badge color="primary" theme={t} size="sm" icon={<Icon.onion size={10}/>}>Tor Project</Badge>
        <Badge color="success" theme={t} size="sm">Matching eligible</Badge>
      </div>
      <h1 style={{ margin: 0, fontFamily: 'Inter', fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        {project.name}
      </h1>
      <p style={{ margin: '6px 0 0', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.5, color: t.textMuted }}>
        {project.short_desc}
      </p>
    </section>
  );
}

// ─── /projects/[slug] mobile page ───
function ProjectPage({ project, theme, setTheme, chainPattern, variant, onCopy, day, feed, projects, newEntryId }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const [chain, setChain] = React.useState(project.matching_eligible_chains[0]);
  React.useEffect(() => {
    if (!project.matching_eligible_chains.includes(chain)) setChain(project.matching_eligible_chains[0]);
  }, [project.id]);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: t.bg, color: t.text, overflow: 'hidden',
    }} data-screen-label="Project detail">
      <TopBar theme={theme} setTheme={setTheme}/>
      <CampaignStrip day={day} theme={t}/>
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <ProjectHero project={project} theme={t} variant={variant}/>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ProjectStats project={project} theme={t}/>
          <DonationPanel
            project={project} chain={chain} onChainChange={setChain}
            theme={t} chainPattern={chainPattern} variant={variant}
            onCopy={onCopy}
          />
          <section style={{
            padding: 18, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.005em' }}>
                Recent donations
              </h3>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: t.success, display: 'inline-block' }}/>
                Live · 60s
              </span>
            </div>
            <RecentFeed
              entries={feed.filter(e => e.project_id === project.id).concat(feed.filter(e => e.project_id !== project.id))}
              projects={projects} theme={t} newEntryId={newEntryId}
            />
          </section>
          <AboutBlock project={project} theme={t}/>
          <div style={{ height: 8 }}/>
        </div>
      </div>
      <StickyCTA
        theme={t}
        hint="Scroll to donate"
        amount={formatUSD(project.total_donated_usd + project.projected_match_usd)}
        label="Donate"
        onClick={() => onCopy && onCopy('Opened donate panel')}
      />
    </div>
  );
}

// ─── /matching-pool mobile page (visually distinct — warm accent, dotted surface) ───
function MatchingPoolPage({ data, theme, setTheme, chainPattern, onCopy, day, newEntryId }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const chains = Object.keys(data.matching_pool.addresses);
  const [chain, setChain] = React.useState('eth');
  const poolProject = {
    id: 'matching-pool',
    name: 'Campaign matching pool',
    matching_eligible_chains: chains,
    addresses: data.matching_pool.addresses,
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: t.bg, color: t.text, overflow: 'hidden',
      // Distinguishing: dotted background + warm accent
      backgroundImage: `radial-gradient(${t.dotPattern} 1px, transparent 1px)`,
      backgroundSize: '16px 16px',
    }} data-screen-label="Matching pool">
      <TopBar theme={theme} setTheme={setTheme} tone="pool"/>
      <CampaignStrip day={day} theme={t} tone="pool"/>
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {/* Hero — warm accent band */}
        <section style={{
          padding: '22px 16px 20px',
          background: t.accentPoolSoft,
          borderBottom: `2px dashed ${t.accentPool}`,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Badge color="pool" theme={t} size="sm">Pool</Badge>
            <Badge color="outline" theme={t} size="sm">Splits across all projects</Badge>
          </div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 30, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Fund the matching pool
          </h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55, color: t.text, textWrap: 'pretty' }}>
            Donations to the matching pool are distributed across all participating projects based on community support. Your contribution multiplies the impact of every donor.
          </p>
        </section>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Pool totals */}
          <section style={{
            padding: 18, background: t.surface, border: `1px solid ${t.accentPool}`, borderRadius: 12,
            boxShadow: `0 0 0 1px ${t.accentPoolSoft}`,
          }}>
            <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.accentPool, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Pool total
            </div>
            <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 38, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
              <AnimatedNumber value={data.matching_pool.total_usd} decimals={0}/>
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 12, color: t.textMuted, marginTop: 6 }}>
              Committed by {data.sponsors.length} sponsors · splits across {data.projects.length} projects
            </div>
            {/* By chain breakdown as horizontal legend */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
              <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
                By chain
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(data.matching_pool.by_chain).map(([c, amt]) => {
                  const pct = (amt / data.matching_pool.total_usd) * 100;
                  const cm = window.CHAIN_META[c === 'zec' ? 'zec_t' : c];
                  return (
                    <div key={c}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Inter', fontSize: 13, color: t.text, fontWeight: 500 }}>
                          <ChainIcon symbol={c === 'zec' ? 'zec_t' : c} size={16} color={t.textMuted}/>
                          {cm?.label || c}
                        </span>
                        <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted }}>
                          {formatUSD(amt)} <span style={{ opacity: 0.6 }}>· {pct.toFixed(0)}%</span>
                        </span>
                      </div>
                      <div style={{ height: 4, background: t.bgMuted, borderRadius: 999 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: t.accentPool, borderRadius: 999 }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Donation panel (pool tone) */}
          <DonationPanel
            project={poolProject} chain={chain} onChainChange={setChain}
            theme={t} chainPattern={chainPattern} tone="pool"
            onCopy={onCopy}
          />

          {/* Pool-specific feed */}
          <section style={{ padding: 18, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text }}>
                Recent pool contributions
              </h3>
              <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: t.accentPool, display: 'inline-block', marginRight: 4 }}/>
                Live
              </span>
            </div>
            <RecentFeed entries={data.recent_pool_donations} projects={[]} theme={t} tone="pool" newEntryId={newEntryId}/>
          </section>

          <div style={{
            padding: '12px 14px', background: t.bgMuted, border: `1px dashed ${t.border}`, borderRadius: 8,
            fontFamily: 'Inter', fontSize: 12, lineHeight: 1.55, color: t.textMuted,
          }}>
            <strong style={{ color: t.text }}>Not sure which to pick?</strong> Project donations go to a single team. Pool donations multiply the impact of every donor across all projects based on community support.
          </div>
          <div style={{ height: 8 }}/>
        </div>
      </div>
      <StickyCTA
        theme={t} tone="pool"
        hint="Pool committed"
        amount={formatUSD(data.matching_pool.total_usd)}
        label="Fund pool"
        onClick={() => onCopy && onCopy('Opened pool panel')}
      />
    </div>
  );
}

Object.assign(window, { ProjectPage, MatchingPoolPage });
