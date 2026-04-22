// / landing, /projects grid, and per-project OG template

// ─── Leaderboard row (mobile: list + inline bar fill) ───
function LeaderRow({ project, rank, maxTotal, theme, tone = 'primary' }) {
  const t = theme || window.lightTheme;
  const total = project.total_donated_usd + project.projected_match_usd;
  const pct = Math.max(6, (total / maxTotal) * 100);
  const donatedPct = (project.total_donated_usd / total) * 100;
  return (
    <a href="#" onClick={(e) => e.preventDefault()} style={{
      display: 'grid', gridTemplateColumns: '22px 1fr auto', gap: 10, alignItems: 'center',
      padding: '12px 0', borderBottom: `1px solid ${t.border}`, textDecoration: 'none', color: t.text,
    }}>
      <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, fontWeight: 700, color: t.textMuted }}>
        {String(rank).padStart(2, '0')}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.name}
        </div>
        <div style={{ position: 'relative', height: 6, background: t.bgMuted, borderRadius: 999, marginTop: 6, overflow: 'hidden', width: `${pct}%` }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${donatedPct}%`, background: t.text }}/>
          <div style={{ position: 'absolute', left: `${donatedPct}%`, top: 0, bottom: 0, right: 0, background: t.primary }}/>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, fontWeight: 700, color: t.text }}>
          ${Math.round(project.total_donated_usd).toLocaleString()}
        </div>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.primary }}>
          +${Math.round(project.projected_match_usd).toLocaleString()}
        </div>
      </div>
    </a>
  );
}

// ─── / Landing — mobile ───
function LandingPage({ data, theme, setTheme, day, onCopy }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const daysLeft = Math.max(0, 32 - day);
  const maxTotal = Math.max(...data.projects.map(p => p.total_donated_usd + p.projected_match_usd));
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: t.bg, color: t.text, overflow: 'hidden',
    }} data-screen-label="Landing">
      <TopBar theme={theme} setTheme={setTheme}/>
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {/* Hero */}
        <section style={{ padding: '24px 16px 20px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            background: t.bgMuted, borderRadius: 999, fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, marginBottom: 12 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: t.success, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}/>
            May 19 – Jun 19 · Day {day} of 32
          </div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 36, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.02, textWrap: 'balance' }}>
            {daysLeft} days. 8 ways to give. Every donation matched.
          </h1>
          <p style={{ margin: '12px 0 0', fontFamily: 'Inter', fontSize: 15, lineHeight: 1.5, color: t.textMuted, textWrap: 'pretty' }}>
            A quadratic funding round for the Tor Project, run with Funding the Commons. Support a team directly, or fund the pool that multiplies every donation.
          </p>

          {/* Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <div style={{ padding: 14, background: t.bgMuted, borderRadius: 10, border: `1px solid ${t.border}` }}>
              <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.textMuted }}>Raised</div>
              <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: t.text, lineHeight: 1.05, marginTop: 2 }}>
                <AnimatedNumber value={data.totals.total_donated_usd} decimals={0}/>
              </div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                {data.totals.unique_donors.toLocaleString()} donors · {data.totals.donation_count.toLocaleString()} donations
              </div>
            </div>
            <div style={{ padding: 14, background: t.accentPoolSoft, borderRadius: 10, border: `1px solid ${t.accentPool}` }}>
              <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.accentPool }}>Pool</div>
              <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: t.text, lineHeight: 1.05, marginTop: 2 }}>
                <AnimatedNumber value={data.matching_pool.total_usd} decimals={0}/>
              </div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.accentPool, marginTop: 2 }}>
                {data.sponsors.length} sponsors · splits {data.projects.length} ways
              </div>
            </div>
          </div>

          {/* Dual CTAs — equal weight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <Button variant="solid" size="lg" theme={t} onClick={() => onCopy('Support a project')}>
              Support a project <Icon.arrow/>
            </Button>
            <Button variant="solidPool" size="lg" theme={t} onClick={() => onCopy('Fund the pool')}>
              Fund the pool <Icon.arrow/>
            </Button>
          </div>
        </section>

        {/* Top 3 leaderboard */}
        <section style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>
              Top projects
            </h2>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: t.primary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              See all <Icon.arrow/>
            </a>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: t.textMuted, marginBottom: 10 }}>
            By projected total (donated + match)
          </div>
          <div style={{
            padding: '0 14px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
          }}>
            {data.projects
              .slice()
              .sort((a, b) => (b.total_donated_usd + b.projected_match_usd) - (a.total_donated_usd + a.projected_match_usd))
              .slice(0, 3)
              .map((p, i) => <LeaderRow key={p.id} project={p} rank={i + 1} maxTotal={maxTotal} theme={t}/>)}
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: '4px 16px 16px' }}>
          <h2 style={{ margin: '10px 0 12px', fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>
            How it works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { n: '01', t: 'You donate', d: 'Pick a project, choose a chain, send from your wallet. Every chain we support is matching-eligible.' },
              { n: '02', t: 'Community signals', d: 'Quadratic funding counts donor breadth, not size — ten $10 donors beat one $100 donor.' },
              { n: '03', t: 'Pool pays out', d: 'At the end of the round, the matching pool is distributed by those community signals.' },
            ].map(s => (
              <div key={s.n} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr', gap: 12,
                padding: 14, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
              }}>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, fontWeight: 700, color: t.primary, letterSpacing: '0.04em', paddingTop: 1 }}>
                  {s.n}
                </div>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 2 }}>{s.t}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, lineHeight: 1.5, color: t.textMuted }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sponsor strip */}
        <section style={{ padding: '4px 16px 28px' }}>
          <h2 style={{ margin: '10px 0 12px', fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>
            Match sponsors
          </h2>
          <div style={{
            padding: 14, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: t.border, overflow: 'hidden',
          }}>
            {data.sponsors.map((s, i) => (
              <div key={s.name} style={{
                padding: '14px 12px', background: t.surface,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: t.text }}>{s.name}</div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>
                  ${s.committed_usd.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 11, color: t.textMuted, marginTop: 8, textAlign: 'center' }}>
            Total committed: ${data.sponsors.reduce((a, s) => a + s.committed_usd, 0).toLocaleString()}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── /projects grid — mobile ───
function ProjectsGridPage({ data, theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const [sort, setSort] = React.useState('match');
  const sorted = React.useMemo(() => {
    const arr = data.projects.slice();
    if (sort === 'raised') arr.sort((a, b) => b.total_donated_usd - a.total_donated_usd);
    else if (sort === 'match') arr.sort((a, b) => b.projected_match_usd - a.projected_match_usd);
    else arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [sort]);
  const maxTotal = Math.max(...data.projects.map(p => p.total_donated_usd + p.projected_match_usd));
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: t.bg, color: t.text, overflow: 'hidden',
    }} data-screen-label="Projects grid">
      <TopBar theme={theme} setTheme={setTheme}/>
      <CampaignStrip day={day} theme={t}/>
      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <section style={{ padding: '20px 16px 14px', borderBottom: `1px solid ${t.border}` }}>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: t.text }}>
            Projects
          </h1>
          <p style={{ margin: '4px 0 0', fontFamily: 'Inter', fontSize: 13, color: t.textMuted }}>
            All {data.projects.length} participating teams. Tap to donate.
          </p>
        </section>

        {/* Sort toggle */}
        <div style={{
          display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'auto',
          borderBottom: `1px solid ${t.border}`,
        }} className="chain-strip">
          {[{k:'match',l:'Projected match'},{k:'raised',l:'Raised'},{k:'name',l:'Name'}].map(o => {
            const sel = sort === o.k;
            return (
              <button key={o.k} onClick={() => setSort(o.k)} style={{
                flexShrink: 0, height: 36, padding: '0 14px',
                background: sel ? t.text : 'transparent', color: sel ? t.bg : t.textMuted,
                border: `1px solid ${sel ? t.text : t.border}`, borderRadius: 999,
                fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {sel && <Icon.up size={8}/>} {o.l}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(p => {
            const total = p.total_donated_usd + p.projected_match_usd;
            const pct = (p.total_donated_usd / total) * 100;
            return (
              <a key={p.id} href="#" onClick={(e) => e.preventDefault()} style={{
                padding: 16, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
                textDecoration: 'none', color: t.text, display: 'block',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text, letterSpacing: '-0.005em' }}>
                      {p.name}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontFamily: 'Inter', fontSize: 13, lineHeight: 1.45, color: t.textMuted }}>
                      {p.short_desc}
                    </p>
                  </div>
                  <div style={{ color: t.textMuted }}><Icon.arrow size={14}/></div>
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Raised</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 14, fontWeight: 700, color: t.text }}>
                      ${Math.round(p.total_donated_usd).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, color: t.primary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Match</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 14, fontWeight: 700, color: t.primary }}>
                      +${Math.round(p.projected_match_usd).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}/>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Donors</div>
                    <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 14, fontWeight: 700, color: t.text }}>
                      {p.unique_donors}
                    </div>
                  </div>
                </div>
                {/* Stacked bar */}
                <div style={{ marginTop: 10, height: 5, background: t.bgMuted, borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${pct}%`, background: t.text }}/>
                  <div style={{ flex: 1, background: t.primary }}/>
                </div>
                {/* Chain chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
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
        </div>
      </div>
    </div>
  );
}

// ─── Per-project OG image (1200x630) ───
function OGTemplate({ project, matchUsd, theme = 'light' }) {
  const bg = theme === 'dark' ? '#0B1017' : '#FFFFFF';
  const fg = theme === 'dark' ? '#E4EAF0' : '#18242F';
  const muted = theme === 'dark' ? '#8A98A6' : '#556472';
  const purple = '#9338C1';
  return (
    <div style={{
      width: 1200, height: 630, background: bg, color: fg,
      fontFamily: 'Inter', position: 'relative', overflow: 'hidden',
      padding: '72px 80px', display: 'flex', flexDirection: 'column',
    }}>
      {/* Dot pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${theme === 'dark' ? 'rgba(147,56,193,0.12)' : 'rgba(147,56,193,0.08)'} 1.5px, transparent 1.5px)`,
        backgroundSize: '28px 28px', pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        <TorLogo size={44} color={purple}/>
        <div>
          <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>Tor Project</div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, color: muted, letterSpacing: '0.06em' }}>× FTC · QF 2026</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ padding: '8px 16px', background: theme === 'dark' ? '#2A1840' : '#F5E3FF',
          border: `1px solid ${purple}`, borderRadius: 999, fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: purple }}>
          Matching eligible
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 16, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          Support {project.id}
        </div>
        <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.98, textWrap: 'balance' }}>
          {project.name}
        </h1>
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Projected match
            </div>
            <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 72, fontWeight: 700, color: purple, letterSpacing: '-0.03em', lineHeight: 1 }}>
              +${Math.round(matchUsd).toLocaleString()}
            </div>
          </div>
          <div style={{ height: 72, width: 1, background: theme === 'dark' ? '#2A3744' : '#E4EAF0' }}/>
          <div>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              From pool of
            </div>
            <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 32, fontWeight: 700, color: fg, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
              $87,500
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: `1px solid ${theme === 'dark' ? '#2A3744' : '#E4EAF0'}` }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 16, color: fg, letterSpacing: '0.04em' }}>
          donate-match.torproject.org/projects/{project.id}
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 14, color: muted }}>
          May 19 – Jun 19, 2026
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingPage, ProjectsGridPage, OGTemplate });
