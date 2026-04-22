// Desktop views at 1280×820 for the four priority pages.
// Same data/props as mobile — different layout only.

// ─── Browser chrome frame ───
function DesktopFrame({ children, url, theme = 'light' }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, borderRadius: 10, overflow: 'hidden',
      boxShadow: '0 24px 48px -18px rgba(120,56,200,0.15), 0 8px 24px rgba(0,0,0,0.08)',
      border: `1px solid ${theme === 'dark' ? '#1A2531' : '#D1DAE3'}`,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Chrome bar */}
      <div style={{
        height: 38, background: theme === 'dark' ? '#161E27' : '#F2F5F8',
        borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FF5F57' }}/>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FEBC2E' }}/>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#28C840' }}/>
        </div>
        <div style={{ flex: 1, maxWidth: 560, margin: '0 auto',
          height: 24, background: t.surface, borderRadius: 6,
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px',
          fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted,
          border: `1px solid ${t.border}`,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0.5v5l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          <span>{url || 'donate-match.torproject.org'}</span>
        </div>
        <div style={{ width: 52 }}/>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Shared desktop header (1280+) ───
function DesktopHeader({ theme, setTheme, active, tone = 'primary' }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  const navItem = (label, key) => {
    const sel = active === key;
    return (
      <a href="#" key={key} onClick={e => e.preventDefault()} style={{
        padding: '8px 12px', fontFamily: 'Inter', fontSize: 13, fontWeight: sel ? 600 : 500,
        color: sel ? t.text : t.textMuted, textDecoration: 'none', borderRadius: 6,
        background: sel ? t.bgMuted : 'transparent',
      }}>{label}</a>
    );
  };
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '0 32px', height: 64, flexShrink: 0,
      background: t.bg, borderBottom: `1px solid ${t.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <TorLogo size={26} color={accent}/>
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>Tor Project</div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted, letterSpacing: '0.06em' }}>× FTC · QF 2026</div>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 2, marginLeft: 20 }}>
        {navItem('Home', 'home')}
        {navItem('Projects', 'projects')}
        {navItem('Matching pool', 'pool')}
        {navItem('Sponsors', 'sponsors')}
        {navItem('About', 'about')}
        {navItem('Stats', 'stats')}
      </nav>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 10px', background: t.bgMuted, borderRadius: 999,
        fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: t.success, animation: 'pulse 2s ease-in-out infinite' }}/>
        Live · updates every 60s
      </div>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
        style={{
          width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.border}`,
          background: t.surface, color: t.text, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {theme === 'dark' ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" fill="currentColor"/><g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M7 1v1.5M7 11.5V13M13 7h-1.5M2.5 7H1M11.24 2.76l-1.06 1.06M3.82 10.18l-1.06 1.06M11.24 11.24l-1.06-1.06M3.82 3.82L2.76 2.76"/></g></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 8.5a4 4 0 01-5-5 4.5 4.5 0 105 5z" fill="currentColor"/></svg>
        )}
      </button>
      <Button variant="solid" theme={t} size="md">Donate <Icon.arrow/></Button>
    </header>
  );
}

// ─── Desktop / landing ───
function LandingPageDesktop({ data, theme, setTheme, day, onCopy }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const daysLeft = Math.max(0, 32 - day);
  const maxTotal = Math.max(...data.projects.map(p => p.total_donated_usd + p.projected_match_usd));
  const sorted = data.projects.slice().sort((a,b) => (b.total_donated_usd+b.projected_match_usd) - (a.total_donated_usd+a.projected_match_usd));
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Landing · desktop">
      <DesktopHeader theme={theme} setTheme={setTheme} active="home"/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero */}
        <section style={{ padding: '48px 64px 36px', borderBottom: `1px solid ${t.border}`, position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.9fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                background: t.bgMuted, borderRadius: 999, fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted, marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: t.success, animation: 'pulse 2s ease-in-out infinite' }}/>
                May 19 – Jun 19, 2026 · Day {day} of 32
              </div>
              <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 64, fontWeight: 700, color: t.text, letterSpacing: '-0.04em', lineHeight: 0.98, textWrap: 'balance' }}>
                {daysLeft} days.<br/>8 ways to give.<br/><span style={{ color: t.primary }}>Every donation matched.</span>
              </h1>
              <p style={{ margin: '20px 0 0', fontFamily: 'Inter', fontSize: 17, lineHeight: 1.55, color: t.textMuted, maxWidth: 560, textWrap: 'pretty' }}>
                A quadratic funding round for the Tor Project, run with Funding the Commons. Support a team directly, or fund the pool that multiplies every donation.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <Button variant="solid" size="lg" theme={t} onClick={() => onCopy && onCopy('Support a project')}>
                  Support a project <Icon.arrow/>
                </Button>
                <Button variant="solidPool" size="lg" theme={t} onClick={() => onCopy && onCopy('Fund the pool')}>
                  Fund the matching pool <Icon.arrow/>
                </Button>
              </div>
            </div>
            <div style={{
              padding: 28, background: t.bgMuted, borderRadius: 16, border: `1px solid ${t.border}`,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.textMuted }}>Raised so far</div>
                <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 52, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
                  <AnimatedNumber value={data.totals.total_donated_usd} decimals={0}/>
                </div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted, marginTop: 4 }}>
                  {data.totals.unique_donors.toLocaleString()} donors · {data.totals.donation_count.toLocaleString()} donations
                </div>
              </div>
              <div style={{ height: 1, background: t.border }}/>
              <div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.accentPool }}>Matching pool</div>
                <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 40, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
                  <AnimatedNumber value={data.matching_pool.total_usd} decimals={0}/>
                </div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.accentPool, marginTop: 4 }}>
                  {data.sponsors.length} sponsors · splits {data.projects.length} ways
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top projects — desktop shows bar chart variant */}
        <section style={{ padding: '40px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>
              Top projects
            </h2>
            <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: t.primary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              See all {data.projects.length} projects <Icon.arrow/>
            </a>
          </div>
          {sorted.slice(0, 3).map((p, i) => {
            const pct = (p.total_donated_usd / (p.total_donated_usd + p.projected_match_usd)) * 100;
            return (
              <a key={p.id} href="#" onClick={e => e.preventDefault()} style={{
                padding: 24, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14,
                textDecoration: 'none', color: t.text, display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, fontWeight: 700, color: t.primary, letterSpacing: '0.08em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Icon.arrow size={14}/>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>
                    {p.name}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontFamily: 'Inter', fontSize: 13, lineHeight: 1.5, color: t.textMuted }}>
                    {p.short_desc}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted }}>Raised</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 17, fontWeight: 700, color: t.text }}>
                      ${Math.round(p.total_donated_usd).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.primary }}>Match</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 17, fontWeight: 700, color: t.primary }}>
                      +${Math.round(p.projected_match_usd).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ height: 6, background: t.bgMuted, borderRadius: 999, display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: t.text }}/>
                  <div style={{ flex: 1, background: t.primary }}/>
                </div>
              </a>
            );
          })}
        </section>

        {/* How it works + sponsors row */}
        <section style={{ padding: '12px 64px 48px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>How it works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 16 }}>
              {[
                { n: '01', t: 'You donate', d: 'Pick a project, choose a chain, send from your wallet.' },
                { n: '02', t: 'Community signals', d: 'QF counts donor breadth — ten $10 donors beat one $100.' },
                { n: '03', t: 'Pool pays out', d: 'At round end, matching pool distributes by those signals.' },
              ].map(s => (
                <div key={s.n} style={{ padding: 18, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, fontWeight: 700, color: t.primary, letterSpacing: '0.06em' }}>{s.n}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text, marginTop: 6 }}>{s.t}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, color: t.textMuted, lineHeight: 1.5, marginTop: 4 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 24, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>Sponsors</h2>
            <div style={{ marginTop: 16, padding: 2, background: t.border, borderRadius: 12, overflow: 'hidden',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {data.sponsors.map(s => (
                <div key={s.name} style={{ padding: 16, background: t.surface }}>
                  <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: t.text }}>{s.name}</div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                    ${s.committed_usd.toLocaleString()} committed
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Desktop /projects grid ───
function ProjectsGridPageDesktop({ data, theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const [sort, setSort] = React.useState('match');
  const sorted = React.useMemo(() => {
    const arr = data.projects.slice();
    if (sort === 'raised') arr.sort((a, b) => b.total_donated_usd - a.total_donated_usd);
    else if (sort === 'match') arr.sort((a, b) => b.projected_match_usd - a.projected_match_usd);
    else arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [sort]);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Projects grid · desktop">
      <DesktopHeader theme={theme} setTheme={setTheme} active="projects"/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <section style={{ padding: '40px 64px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 40, fontWeight: 700, color: t.text, letterSpacing: '-0.03em' }}>
              Projects
            </h1>
            <p style={{ margin: '6px 0 0', fontFamily: 'Inter', fontSize: 15, color: t.textMuted }}>
              All {data.projects.length} participating teams. Every chain we support is matching-eligible.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, background: t.bgMuted, padding: 4, borderRadius: 10 }}>
            {[{k:'match',l:'Projected match'},{k:'raised',l:'Raised'},{k:'name',l:'Name'}].map(o => {
              const sel = sort === o.k;
              return (
                <button key={o.k} onClick={() => setSort(o.k)} style={{
                  padding: '8px 14px', background: sel ? t.bg : 'transparent',
                  color: sel ? t.text : t.textMuted, border: 'none', borderRadius: 7,
                  fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  boxShadow: sel ? `0 1px 3px ${t.border}` : 'none',
                }}>
                  {o.l}
                </button>
              );
            })}
          </div>
        </section>
        <section style={{ padding: '10px 64px 48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {sorted.map(p => {
            const pct = (p.total_donated_usd / (p.total_donated_usd + p.projected_match_usd)) * 100;
            return (
              <a key={p.id} href="#" onClick={e => e.preventDefault()} style={{
                padding: 24, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14,
                textDecoration: 'none', color: t.text, display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>{p.name}</h3>
                    <p style={{ margin: '4px 0 0', fontFamily: 'Inter', fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{p.short_desc}</p>
                  </div>
                  <Icon.arrow size={14}/>
                </div>
                <div style={{ display: 'flex', gap: 18 }}>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted }}>Raised</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 17, fontWeight: 700, color: t.text }}>${Math.round(p.total_donated_usd).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.primary }}>Match</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 17, fontWeight: 700, color: t.primary }}>+${Math.round(p.projected_match_usd).toLocaleString()}</div>
                  </div>
                  <div style={{ flex: 1 }}/>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted }}>Donors</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 17, fontWeight: 700, color: t.text }}>{p.unique_donors}</div>
                  </div>
                </div>
                <div style={{ height: 6, background: t.bgMuted, borderRadius: 999, display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: t.text }}/>
                  <div style={{ flex: 1, background: t.primary }}/>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.matching_eligible_chains.map(c => (
                    <span key={c} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                      background: t.bgMuted, borderRadius: 999,
                      fontFamily: '"Space Mono", monospace', fontSize: 10, fontWeight: 600, color: t.text,
                    }}>
                      <ChainIcon symbol={c} size={12} color={t.textMuted}/>
                      {window.CHAIN_META[c].symbol}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </section>
      </div>
    </div>
  );
}

// ─── Desktop /projects/[slug] ───
function ProjectPageDesktop({ project, theme, setTheme, chainPattern, onCopy, day, feed, projects, newEntryId }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const [chain, setChain] = React.useState(project.matching_eligible_chains[0]);
  React.useEffect(() => {
    if (!project.matching_eligible_chains.includes(chain)) setChain(project.matching_eligible_chains[0]);
  }, [project.id]);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Project detail · desktop">
      <DesktopHeader theme={theme} setTheme={setTheme} active="projects"/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Breadcrumb */}
        <div style={{ padding: '16px 64px 0', fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ color: t.textMuted, textDecoration: 'none' }}>/projects</a>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: t.text }}>{project.id}</span>
        </div>
        {/* Hero */}
        <section style={{ padding: '20px 64px 28px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Badge color="primary" theme={t} size="sm" icon={<Icon.onion size={10}/>}>Tor Project</Badge>
            <Badge color="success" theme={t} size="sm">Matching eligible</Badge>
            <Badge color="outline" theme={t} size="sm">{project.matching_eligible_chains.length} chains</Badge>
          </div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 48, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.02, maxWidth: 820 }}>
            {project.name}
          </h1>
          <p style={{ margin: '12px 0 0', fontFamily: 'Inter', fontSize: 18, color: t.textMuted, lineHeight: 1.5, maxWidth: 680 }}>
            {project.short_desc}
          </p>
        </section>

        {/* Two column: donation panel + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, padding: '28px 64px 48px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ProjectStats project={project} theme={t}/>
            <AboutBlock project={project} theme={t}/>
            <section style={{ padding: 22, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>Recent donations</h3>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: t.success, display: 'inline-block', marginRight: 4 }}/>
                  Live · 60s
                </span>
              </div>
              <RecentFeed
                entries={feed.filter(e => e.project_id === project.id).concat(feed.filter(e => e.project_id !== project.id))}
                projects={projects} theme={t} newEntryId={newEntryId}
              />
            </section>
          </div>
          {/* Sticky donation panel */}
          <div style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
            <DonationPanel
              project={project} chain={chain} onChainChange={setChain}
              theme={t} chainPattern={chainPattern} onCopy={onCopy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop /matching-pool ───
function MatchingPoolPageDesktop({ data, theme, setTheme, chainPattern, onCopy, day, newEntryId }) {
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
      width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      backgroundImage: `radial-gradient(${t.dotPattern} 1px, transparent 1px)`,
      backgroundSize: '20px 20px',
    }} data-screen-label="Matching pool · desktop">
      <DesktopHeader theme={theme} setTheme={setTheme} active="pool" tone="pool"/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero band - warm accent */}
        <section style={{
          padding: '40px 64px',
          background: t.accentPoolSoft,
          borderBottom: `2px dashed ${t.accentPool}`,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Badge color="pool" theme={t} size="sm">Pool</Badge>
                <Badge color="outline" theme={t} size="sm">Splits across all {data.projects.length} projects</Badge>
              </div>
              <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 52, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1 }}>
                Fund the matching pool
              </h1>
              <p style={{ margin: '16px 0 0', fontFamily: 'Inter', fontSize: 17, lineHeight: 1.55, color: t.text, maxWidth: 620, textWrap: 'pretty' }}>
                Donations to the matching pool are distributed across all participating projects based on community support. Your contribution multiplies the impact of every donor.
              </p>
            </div>
            <div style={{
              padding: 24, background: t.bg, border: `1px solid ${t.accentPool}`, borderRadius: 14,
              boxShadow: `0 0 0 3px ${t.accentPoolSoft}`,
            }}>
              <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.accentPool, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pool total</div>
              <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 54, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
                <AnimatedNumber value={data.matching_pool.total_usd} decimals={0}/>
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: t.textMuted, marginTop: 6 }}>
                Committed by {data.sponsors.length} sponsors
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: 32, padding: '32px 64px 48px', alignItems: 'start' }}>
          {/* Chain breakdown + recent feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section style={{ padding: 24, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14 }}>
              <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>Pool by chain</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                {Object.entries(data.matching_pool.by_chain).map(([c, amt]) => {
                  const pct = (amt / data.matching_pool.total_usd) * 100;
                  const cm = window.CHAIN_META[c === 'zec' ? 'zec_t' : c];
                  return (
                    <div key={c}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'Inter', fontSize: 14, color: t.text, fontWeight: 500 }}>
                          <ChainIcon symbol={c === 'zec' ? 'zec_t' : c} size={18} color={t.textMuted}/>
                          {cm?.label || c}
                        </span>
                        <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, color: t.textMuted }}>
                          ${amt.toLocaleString()} <span style={{ opacity: 0.6 }}>· {pct.toFixed(0)}%</span>
                        </span>
                      </div>
                      <div style={{ height: 8, background: t.bgMuted, borderRadius: 999 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: t.accentPool, borderRadius: 999 }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section style={{ padding: 24, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>Recent pool contributions</h3>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: t.accentPool, display: 'inline-block', marginRight: 4 }}/>
                  Live
                </span>
              </div>
              <RecentFeed entries={data.recent_pool_donations} projects={[]} theme={t} tone="pool" newEntryId={newEntryId}/>
            </section>
          </div>
          <div style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
            <DonationPanel
              project={poolProject} chain={chain} onChainChange={setChain}
              theme={t} chainPattern={chainPattern} tone="pool" onCopy={onCopy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DesktopFrame, DesktopHeader,
  LandingPageDesktop, ProjectsGridPageDesktop, ProjectPageDesktop, MatchingPoolPageDesktop,
});
