// Shared screen chrome + stats components

function formatUSD(n, compact = false) {
  if (compact && n >= 1000) return '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function formatUSDcents(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// Top bar — campaign title + theme toggle + menu
function TopBar({ theme, setTheme, onTor, tone = 'primary', title }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', height: 56,
      background: t.bg, borderBottom: `1px solid ${t.border}`, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TorLogo size={22} color={accent}/>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>Tor Project</div>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted, letterSpacing: '0.04em' }}>× FTC · QF 2026</div>
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
        style={{
          width: 36, height: 36, borderRadius: 999, border: `1px solid ${t.border}`,
          background: t.surface, color: t.text, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {theme === 'dark' ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="3" fill="currentColor"/><g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M7 1v1.5M7 11.5V13M13 7h-1.5M2.5 7H1M11.24 2.76l-1.06 1.06M3.82 10.18l-1.06 1.06M11.24 11.24l-1.06-1.06M3.82 3.82L2.76 2.76"/></g></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 8.5a4 4 0 01-5-5 4.5 4.5 0 105 5z" fill="currentColor"/></svg>
        )}
      </button>
      <button aria-label="Menu" style={{
        width: 36, height: 36, borderRadius: 999, border: `1px solid ${t.border}`,
        background: t.surface, color: t.text, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon.menu size={16}/>
      </button>
    </header>
  );
}

// Campaign progress strip (dot + days remaining)
function CampaignStrip({ day, totalDays = 32, theme, tone = 'primary' }) {
  const t = theme || window.lightTheme;
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  const pct = Math.min(100, (day / totalDays) * 100);
  const daysLeft = Math.max(0, totalDays - day);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
      background: t.bgMuted, borderBottom: `1px solid ${t.border}`,
      fontFamily: 'Inter', fontSize: 12, color: t.textMuted,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.text, fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}/>
        Live
      </span>
      <span>·</span>
      <span>Day {day} of {totalDays}</span>
      <span style={{ flex: 1 }}/>
      <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.text }}>
        {daysLeft === 0 ? 'closing today' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
      </span>
    </div>
  );
}

// Sticky bottom CTA on mobile
function StickyCTA({ theme, amount, label, onClick, tone = 'primary', hint }) {
  const t = theme || window.lightTheme;
  return (
    <div style={{
      position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 5,
      background: t.bg, borderTop: `1px solid ${t.border}`,
      padding: '10px 16px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Inter', fontSize: 11, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {hint || 'Raised'}
        </div>
        <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 20, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>
          {amount}
        </div>
      </div>
      <Button variant={tone === 'pool' ? 'solidPool' : 'solid'} size="lg" theme={t} onClick={onClick}>
        {label} <Icon.arrow/>
      </Button>
    </div>
  );
}

// Animated USD counter (prefers-reduced-motion aware)
function AnimatedNumber({ value, duration = 900, prefix = '$', decimals = 0, style }) {
  const [n, setN] = React.useState(value);
  const prev = React.useRef(value);
  const reduced = React.useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  React.useEffect(() => {
    if (reduced) { setN(value); prev.current = value; return; }
    const start = performance.now(); const from = prev.current; const to = value;
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick); else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);
  return <span style={style}>{prefix}{n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

// Recent donations feed — reserves height
function RecentFeed({ entries, projects, theme, tone = 'primary', newEntryId }) {
  const t = theme || window.lightTheme;
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  const byId = {}; (projects || []).forEach(p => byId[p.id] = p);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {entries.slice(0, 6).map((e, i) => {
        const p = byId[e.project_id];
        const ch = window.CHAIN_META[e.chain];
        const isNew = newEntryId === i;
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10, alignItems: 'center',
            padding: '10px 0', borderBottom: i < 5 ? `1px solid ${t.border}` : 'none',
            minHeight: 44,
            background: isNew ? t.primarySoft : 'transparent',
            transition: 'background 400ms ease',
          }}>
            <span style={{ color: t.textMuted }}><ChainIcon symbol={e.chain} size={22}/></span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: t.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                <span style={{ fontFamily: '"Space Mono", monospace', color: accent, fontWeight: 700 }}>
                  ${e.amount_usd}
                </span>
                {' · '}
                {p ? p.name : 'Matching pool'}
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 11, color: t.textMuted }}>
                via {ch.label} · {e.verification === 'view_key' ? 'view-key verified' : 'on-chain'}
              </div>
            </div>
            <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, whiteSpace: 'nowrap' }}>
              {e.minutes_ago}m
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Stat block
function Stat({ label, value, sub, theme, align = 'left' }) {
  const t = theme || window.lightTheme;
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: '-0.02em', marginTop: 2 }}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: 'Inter', fontSize: 11, color: t.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Toast
function Toast({ toast, theme }) {
  const t = theme || window.lightTheme;
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      background: t.text, color: t.bg, padding: '10px 14px', borderRadius: 999,
      fontFamily: 'Inter', fontWeight: 500, fontSize: 13,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'toastIn 200ms ease',
    }}>
      {toast}
    </div>
  );
}

Object.assign(window, { formatUSD, formatUSDcents, TopBar, CampaignStrip, StickyCTA, AnimatedNumber, RecentFeed, Stat, Toast });
