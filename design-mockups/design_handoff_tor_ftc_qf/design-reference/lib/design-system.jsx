// Design system showcase — tokens + components on one page
function DesignSystem({ theme, setTheme }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const swatches = [
    { label: 'Purple 10', val: '#F5E3FF' }, { label: 'Purple 60', val: '#9338C1', primary: true },
    { label: 'Purple 80', val: '#701498' },
    { label: 'Orange 60', val: '#D87717', pool: true }, { label: 'Green 60', val: '#6DB12A' },
    { label: 'Blue 60', val: '#3D7AD7' }, { label: 'Red 60', val: '#CC474E' },
    { label: 'Gray 90', val: '#18242F' }, { label: 'Gray 60', val: '#556472' },
    { label: 'Gray 20', val: '#E4EAF0' }, { label: 'Gray 10', val: '#F2F5F8' }, { label: 'White', val: '#FFFFFF' },
  ];
  const typeSpecs = [
    { sample: 'Quadratic funding, done right.', font: '"Space Grotesk", Inter, system-ui', weight: 700, size: 44, label: 'Display · Space Grotesk Bold 44/105' },
    { sample: 'Anti-Censorship Team', font: '"Space Grotesk", Inter, system-ui', weight: 700, size: 28, label: 'Display · Space Grotesk Bold 28/110' },
    { sample: 'Support this project', font: 'Inter, system-ui', weight: 700, size: 22, label: 'Heading · Inter Bold 22/120' },
    { sample: 'The Anti-Censorship Team maintains the bridges and obfuscation tools that keep Tor reachable.', font: 'Inter, system-ui', weight: 400, size: 16, label: 'Body · Inter Regular 16/150' },
    { sample: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', font: '"Space Mono", monospace', weight: 400, size: 14, label: 'Mono · Space Mono Regular 14/140 — addresses' },
  ];
  return (
    <div style={{ height: '100%', background: t.bg, color: t.text, overflowY: 'auto', fontFamily: 'Inter' }}>
      <div style={{ padding: '32px 32px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <TorLogo size={36} color={t.primary}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: t.textMuted, fontFamily: '"Space Mono", monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Design System</div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>Tor × FTC — QF 2026</h1>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ padding: '8px 14px', border: `1px solid ${t.border}`, background: t.surface, color: t.text, borderRadius: 999, cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, fontWeight: 500 }}>
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
      </div>

      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* Colors */}
        <section>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Colors</h2>
          <p style={{ margin: '0 0 18px', color: t.textMuted, fontSize: 13, maxWidth: 560 }}>
            Primary purple for project donations. Orange for the matching pool — the two flows never share an accent. Greens/reds/blues are reserved for semantic state (transparency, success, danger).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {swatches.map(s => (
              <div key={s.val} style={{ border: `1px solid ${t.border}`, borderRadius: 8, overflow: 'hidden', background: t.surface }}>
                <div style={{ background: s.val, height: 60, position: 'relative' }}>
                  {s.primary && <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>PRIMARY</span>}
                  {s.pool && <span style={{ position: 'absolute', top: 6, left: 8, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>POOL</span>}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type */}
        <section>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Typography</h2>
          <p style={{ margin: '0 0 18px', color: t.textMuted, fontSize: 13, maxWidth: 560 }}>
            Space Grotesk Bold for display. Inter for UI + body. Space Mono for addresses, amounts, and any data that must be verified glyph-by-glyph.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
            {typeSpecs.map((ts, i) => (
              <div key={i}>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{ts.label}</div>
                <div style={{ fontFamily: ts.font, fontWeight: ts.weight, fontSize: ts.size, letterSpacing: ts.size > 24 ? '-0.02em' : '-0.005em', lineHeight: 1.15, color: t.text }}>
                  {ts.sample}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Buttons &amp; states</h2>
          <p style={{ margin: '0 0 18px', color: t.textMuted, fontSize: 13 }}>Square corners, 44pt min tap target. Solid for primary action per page.</p>
          <div style={{ padding: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Button variant="solid" theme={t}>Copy address</Button>
            <Button variant="solidPool" theme={t}>Fund the pool</Button>
            <Button variant="outline" theme={t}>Open in wallet</Button>
            <Button variant="outlinePrimary" theme={t}>Support a project</Button>
            <Button variant="ghost" theme={t}>Cancel</Button>
            <Button variant="solid" theme={t} disabled>Disabled</Button>
            <Button variant="solid" theme={t} size="sm">Small</Button>
            <Button variant="solid" theme={t} size="lg">Large</Button>
            <Button variant="solid" theme={t} icon={<Icon.copy/>}>With icon</Button>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Badges</h2>
          <p style={{ margin: '0 0 18px', color: t.textMuted, fontSize: 13 }}>Transparency state, matching eligibility, chain count.</p>
          <div style={{ padding: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <Badge color="primary" theme={t} icon={<Icon.onion size={10}/>}>Tor Project</Badge>
            <Badge color="success" theme={t}>Verified on-chain</Badge>
            <Badge color="info" theme={t} icon={<Icon.eye size={10}/>}>View-key verified</Badge>
            <Badge color="pool" theme={t}>Matching pool</Badge>
            <Badge color="warn" theme={t}>Processing</Badge>
            <Badge color="danger" theme={t}>Sybil flagged</Badge>
            <Badge color="outline" theme={t}>6 chains</Badge>
          </div>
        </section>

        {/* Chain chips */}
        <section>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Chain selector chips</h2>
          <p style={{ margin: '0 0 18px', color: t.textMuted, fontSize: 13 }}>44pt pill; scroll-snap row on mobile. Selected = soft fill + primary border + accent text.</p>
          <div style={{ padding: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
            <ChainScrollStrip chains={['btc','eth','usdc','sol','zec_t','xmr']} selected={'eth'} onSelect={() => {}} theme={t}/>
          </div>
        </section>

        {/* Address */}
        <section>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Address block</h2>
          <p style={{ margin: '0 0 18px', color: t.textMuted, fontSize: 13 }}>Space Mono. Full length, 4-char chunks, zebra-toned for scanning. Never truncated.</p>
          <div style={{ padding: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, maxWidth: 420 }}>
            <AddressDisplay address="44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A" theme={t}/>
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Spacing &amp; radii</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[4,8,12,16,20,24,32,40].map(s => (
              <div key={s} style={{ textAlign: 'center' }}>
                <div style={{ width: s, height: s, background: t.primary, borderRadius: 2 }}/>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, marginTop: 4 }}>{s}</div>
              </div>
            ))}
            <div style={{ width: 1, height: 48, background: t.border, margin: '0 8px' }}/>
            {[{r:2,l:'xs'},{r:6,l:'sm'},{r:8,l:'md'},{r:12,l:'lg'},{r:999,l:'pill'}].map(r => (
              <div key={r.l} style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, background: t.primary, borderRadius: r.r }}/>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, marginTop: 4 }}>{r.l}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 20 }}/>
      </div>
    </div>
  );
}

Object.assign(window, { DesignSystem });
