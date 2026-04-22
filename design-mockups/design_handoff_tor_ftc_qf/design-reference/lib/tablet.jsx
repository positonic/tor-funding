// Tablet frame (768×1024, iPad-ish). Shows priority pages at a middle width.
// Reuses mobile/desktop components with CSS scale where a dedicated layout isn't needed.

function TabletFrame({ children, theme = 'light' }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  return (
    <div style={{
      width: 768, height: 1024, background: t.bg, borderRadius: 26, overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 24px 48px -18px rgba(120,56,200,0.25), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 10px #0B0B10, 0 0 0 11px #2A2A33',
      fontFamily: 'Inter, system-ui',
    }}>
      {/* Status bar */}
      <div style={{
        height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', background: t.bg,
        fontFamily: 'Inter, system-ui', fontSize: 14, fontWeight: 600, color: t.text,
        borderBottom: 'none',
      }}>
        <span>9:41</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, opacity: 0.8 }}>onion</span>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0.5" y="0.5" width="14.5" height="11" rx="2" stroke={t.text} fill="none"/><rect x="2" y="2" width="11.5" height="8" rx="1" fill={t.text}/><rect x="15.7" y="4" width="1.5" height="4" rx="0.5" fill={t.text}/></svg>
        </span>
      </div>
      <div style={{ position: 'absolute', top: 36, left: 0, right: 0, bottom: 0 }}>
        {children}
      </div>
    </div>
  );
}

// /projects/[slug] tablet: stacked — hero, donation panel (wider), stats row, feed.
function ProjectPageTablet({ project, theme, setTheme, chainPattern, onCopy, day, feed, projects, newEntryId }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const [chain, setChain] = React.useState(project.matching_eligible_chains[0]);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Project · tablet">
      <TopBar theme={theme} setTheme={setTheme}/>
      <CampaignStrip day={day} theme={t}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
        <section style={{ padding: '24px 0 20px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Badge color="primary" theme={t} size="sm" icon={<Icon.onion size={10}/>}>Tor Project</Badge>
            <Badge color="success" theme={t} size="sm">Matching eligible</Badge>
          </div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 40, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
            {project.name}
          </h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'Inter', fontSize: 16, color: t.textMuted, lineHeight: 1.5 }}>
            {project.short_desc}
          </p>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20, padding: '20px 0' }}>
          <div>
            <DonationPanel project={project} chain={chain} onChainChange={setChain} theme={t} chainPattern={chainPattern} onCopy={onCopy}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProjectStats project={project} theme={t}/>
            <section style={{ padding: 18, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text }}>Recent donations</h3>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: t.success, display: 'inline-block', marginRight: 4 }}/>Live
                </span>
              </div>
              <RecentFeed entries={feed.filter(e => e.project_id === project.id).concat(feed.filter(e => e.project_id !== project.id))} projects={projects} theme={t} newEntryId={newEntryId}/>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Landing tablet — hero stacked, dual CTA full-width row, leaderboard 3-up.
function LandingPageTablet({ data, theme, setTheme, day, onCopy }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const daysLeft = Math.max(0, 32 - day);
  const top3 = [...data.projects].sort((a, b) => b.projected_match_usd - a.projected_match_usd).slice(0, 3);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Landing · tablet">
      <TopBar theme={theme} setTheme={setTheme}/>
      <CampaignStrip day={day} theme={t}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
        <section style={{ padding: '32px 0 24px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            May 19 – Jun 19, 2026 · {daysLeft} days left
          </div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 52, fontWeight: 700, color: t.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
            31 days.<br/>8 ways to give.<br/><span style={{ color: t.primary }}>Every donation matched.</span>
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
            <Button variant="solid" size="lg" theme={t} onClick={() => onCopy && onCopy('Support a project')}>Support a project <Icon.arrow/></Button>
            <Button variant="solidPool" size="lg" theme={t} onClick={() => onCopy && onCopy('Fund the pool')}>Fund the pool <Icon.arrow/></Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24 }}>
            <div style={{ padding: 16, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
              <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.primary }}>Total raised</div>
              <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
                <AnimatedNumber value={data.totals.total_donated_usd} decimals={0}/>
              </div>
            </div>
            <div style={{ padding: 16, background: t.surface, border: `1px solid ${t.accentPool}`, borderRadius: 12 }}>
              <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.accentPool }}>Matching pool</div>
              <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
                <AnimatedNumber value={data.matching_pool.total_usd} decimals={0}/>
              </div>
            </div>
          </div>
        </section>
        <section style={{ padding: '24px 0' }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Top projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {top3.map((p, i) => (
              <a key={p.id} href="#" onClick={e => e.preventDefault()} style={{ padding: 16, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, textDecoration: 'none', color: t.text }}>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.primary, marginBottom: 6 }}>#{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, marginTop: 6 }}>
                  ${Math.round(p.total_donated_usd).toLocaleString()} raised
                </div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.primary, fontWeight: 700 }}>
                  +${Math.round(p.projected_match_usd).toLocaleString()} match
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Matching pool tablet.
function MatchingPoolPageTablet({ data, theme, setTheme, chainPattern, onCopy, day, newEntryId }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const [chain, setChain] = React.useState('eth');
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      backgroundImage: `radial-gradient(${theme === 'dark' ? 'rgba(216,119,23,0.08)' : 'rgba(216,119,23,0.06)'} 1px, transparent 1px)`,
      backgroundSize: '20px 20px' }}
      data-screen-label="Matching pool · tablet">
      <TopBar theme={theme} setTheme={setTheme} tone="pool"/>
      <CampaignStrip day={day} theme={t} tone="pool"/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
        <section style={{ padding: '24px 0 20px', borderBottom: `2px dashed ${t.accentPool}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Badge color="pool" theme={t} size="sm">Matching pool</Badge>
          </div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 40, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
            Multiply every donor's impact.
          </h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'Inter', fontSize: 16, color: t.textMuted, lineHeight: 1.5 }}>
            Your contribution spreads across all participating projects based on community support.
          </p>
          <div style={{ padding: 20, marginTop: 20, background: t.accentPoolSoft, border: `1px solid ${t.accentPool}`, borderRadius: 12 }}>
            <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, color: t.accentPool, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pool total</div>
            <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 46, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
              <AnimatedNumber value={data.matching_pool.total_usd} decimals={0}/>
            </div>
          </div>
        </section>
        <section style={{ padding: '20px 0' }}>
          <DonationPanel
            project={{ id: 'matching-pool', name: 'Campaign matching pool', matching_eligible_chains: Object.keys(data.matching_pool.addresses), addresses: data.matching_pool.addresses }}
            chain={chain} onChainChange={setChain}
            theme={t} chainPattern={chainPattern} tone="pool" onCopy={onCopy}
          />
        </section>
      </div>
    </div>
  );
}

Object.assign(window, {
  TabletFrame, ProjectPageTablet, LandingPageTablet, MatchingPoolPageTablet,
});
