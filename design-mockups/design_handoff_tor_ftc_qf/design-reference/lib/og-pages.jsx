// Per-page OG image templates (1200×630). Complements the per-project OGTemplate in landing.jsx.

function OGPage({ kind, eyebrow, title, stat, statLabel, substat, substatLabel, theme = 'light', tone = 'primary' }) {
  const bg = theme === 'dark' ? '#0B1017' : '#FFFFFF';
  const fg = theme === 'dark' ? '#E4EAF0' : '#18242F';
  const muted = theme === 'dark' ? '#8A98A6' : '#556472';
  const border = theme === 'dark' ? '#2A3744' : '#E4EAF0';
  const purple = '#9338C1';
  const orange = '#D87717';
  const accent = tone === 'pool' ? orange : purple;
  const accentSoft = tone === 'pool'
    ? (theme === 'dark' ? '#3A2411' : '#FFE9CC')
    : (theme === 'dark' ? '#2A1840' : '#F5E3FF');
  const dotColor = tone === 'pool'
    ? (theme === 'dark' ? 'rgba(216,119,23,0.14)' : 'rgba(216,119,23,0.10)')
    : (theme === 'dark' ? 'rgba(147,56,193,0.12)' : 'rgba(147,56,193,0.08)');

  return (
    <div style={{
      width: 1200, height: 630, background: bg, color: fg,
      fontFamily: 'Inter', position: 'relative', overflow: 'hidden',
      padding: '72px 80px', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: '28px 28px', pointerEvents: 'none',
      }}/>
      {/* Corner rule */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 80, height: 8, background: accent }}/>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        <TorLogo size={44} color={accent}/>
        <div>
          <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>Tor Project</div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, color: muted, letterSpacing: '0.06em' }}>× FTC · QF 2026</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{
          padding: '8px 16px', background: accentSoft, border: `1px solid ${accent}`, borderRadius: 999,
          fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: accent,
        }}>
          {kind}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 16, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          {eyebrow}
        </div>
        <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 92, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.98, textWrap: 'balance', maxWidth: 980 }}>
          {title}
        </h1>
        {(stat || substat) && (
          <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', gap: 24 }}>
            {stat && (
              <div>
                <div style={{ fontFamily: 'Inter', fontSize: 14, color: muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {statLabel}
                </div>
                <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 68, fontWeight: 700, color: accent, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {stat}
                </div>
              </div>
            )}
            {stat && substat && <div style={{ height: 72, width: 1, background: border }}/>}
            {substat && (
              <div>
                <div style={{ fontFamily: 'Inter', fontSize: 14, color: muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {substatLabel}
                </div>
                <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 32, fontWeight: 700, color: fg, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>
                  {substat}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: `1px solid ${border}` }}>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, color: muted }}>
          donate-match.torproject.org
        </div>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, color: muted, letterSpacing: '0.06em' }}>
          May 19 – Jun 19, 2026
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OGPage });
