// Tor × FTC — primitives: logo, icons, buttons, chain icons, QR renderer
// Theme-aware via a theme prop (light/dark)

// ─── Tor Project logo — arc + vertical bars, redrawn from brand kit ───
function TorLogo({ size = 28, mono = false, color }) {
  const purple = color || (mono ? 'currentColor' : '#7E4798');
  // Simplified single-color mark: the arc + the two pillar shapes
  return (
    <svg width={size * 1.35} height={size} viewBox="0 0 151 112" fill="none" aria-label="Tor Project">
      {/* vertical left pillar (T) */}
      <path d="M54.6 8.8 L78 8.8 C80 8.8 81.6 10.4 81.6 12.4 L81.6 28.4 C81.6 30.5 80 32.2 78 32.2 L66.9 32.2 C64.4 32.2 63.3 33.5 63.3 35.1 L63.3 87.5 C63.3 89.3 61.8 90.6 60.1 90.6 L41.8 90.6 C40 90.6 38.8 89.3 38.8 87.5 L38.8 34.7 C38.8 33.1 37.2 32.1 36.1 32.1 L23.8 32.1 C21.7 32.1 20 30.4 20 28.3 L20 12.3 C20 10.3 21.7 8.6 23.8 8.6 Z" fill={purple}/>
      {/* right curve (r) */}
      <path d="M137.6 38.6 L142.4 38.6 C144.2 38.6 145.6 40 145.6 41.8 L145.6 58.9 C145.6 61 145.7 62 143 62 C137.6 62 135.3 64.7 135.3 67.8 L135.3 96.7 C135.3 98 134 99.2 132.5 99.2 L115.3 99.2 C113.8 99.2 112.5 98.2 112.5 96.7 L112.5 63.8 C112.5 63.2 112.5 62.4 112.6 61.9 C113.5 49.7 123.1 40 135.2 38.7 C135.5 38.7 136.9 38.6 137.6 38.6 Z" fill={purple}/>
      {/* arc (O) */}
      <path d="M121 31.9 C118.1 29.3 114.5 27.1 110.7 25 C109 24.1 103.8 20 105.6 14.2 L92.5 8.8 L91.6 9.5 C96 17.4 93.7 21.6 91.5 23 C87.1 26 80.7 29.8 77.6 33.1 C71.5 39.4 69.7 45.4 70.3 53.2 C70.9 63.3 78.2 71.7 88.1 75 C92.4 76.4 96.4 76.6 100.8 76.6 C107.9 76.6 115.3 74.7 120.6 70.3 C126.3 65.6 129.6 58.5 129.6 51.2 C129.6 43.9 126.5 36.9 121 31.9 Z M119.1 68.8 C114.2 72.8 105.4 75.6 100.7 75.4 C95.5 75.1 90.4 74.3 85.9 72.1 C78 68.3 72.8 60 72.4 53.3 C71.7 39.6 78.3 35.7 84.4 30.7 C87.8 27.9 92.6 26.5 95.3 21.5 C95.8 20.4 96.1 18 95.5 15.5 C95.2 14.6 94 11.6 93.5 10.9 L103.3 15.2 C102.1 19.7 105.8 24.4 108.8 26.1 C111.8 27.8 116.5 31 119.4 33.6 C124.5 38.1 127.1 44.5 127.1 51.2 C127.1 57.9 124.3 64.5 119.1 68.8 Z" fill={purple}/>
    </svg>
  );
}

// ─── Icons ───
const Icon = {
  copy: (p = {}) => <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 16 16" fill="none" {...p}><rect x="3" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 3V2a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.4"/></svg>,
  check: (p = {}) => <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrow: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  external: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><path d="M6 3H3V11H11V8M8 3H11V6M11 3L6.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron: (p = {}) => <svg width={p.size || 12} height={p.size || 12} viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  shield: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><path d="M7 1L12 3V7c0 3-2 5-5 6-3-1-5-3-5-6V3l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 7l1.5 1.5L9 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3"/></svg>,
  onion: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 3.5V2M7 2C5 2 4 3.5 4 5M7 2c2 0 3 1.5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  close: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  info: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 6.5V10M7 4.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  menu: (p = {}) => <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  up: (p = {}) => <svg width={p.size || 10} height={p.size || 10} viewBox="0 0 10 10" fill="none"><path d="M5 2L9 7H1L5 2Z" fill="currentColor"/></svg>,
  filter: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><path d="M2 4h10M4 7h6M5.5 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  download: (p = {}) => <svg width={p.size || 14} height={p.size || 14} viewBox="0 0 14 14" fill="none"><path d="M7 2v7M4 6.5L7 9.5L10 6.5M2.5 11.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ─── Chain icon — monochrome pictographs keyed by symbol ───
function ChainIcon({ symbol, size = 18, color = 'currentColor' }) {
  const s = size;
  switch (symbol) {
    case 'btc':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5"/><text x="12" y="16.5" textAnchor="middle" fontSize="13" fontFamily="Space Mono" fontWeight="700" fill={color}>₿</text></svg>;
    case 'eth':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5"/><path d="M12 5L7.5 12L12 14.5L16.5 12L12 5Z M12 15.5L7.5 13L12 19L16.5 13L12 15.5Z" fill={color} stroke={color} strokeWidth="0.3" strokeLinejoin="round"/></svg>;
    case 'usdc':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontFamily="Inter" fontWeight="700" fill={color}>$</text></svg>;
    case 'sol':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5"/><path d="M8 9h7.5L17 7H9.5L8 9zM8 13h7.5L17 11H9.5L8 13zM8 17h7.5L17 15H9.5L8 17z" fill={color}/></svg>;
    case 'zec':
    case 'zec_t':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="10" fontFamily="Inter" fontWeight="700" fill={color}>Z</text></svg>;
    case 'xmr':
      return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5"/><path d="M5 16V9l4 4 3-3 3 3 4-4v7h-3V13l-2 2-2-2-2 2-2-2v3H5z" fill={color}/></svg>;
    default:
      return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" stroke={color} strokeWidth="1.5" fill="none"/></svg>;
  }
}

// ─── Deterministic pseudo-QR renderer (no external libs) ───
// Produces a consistent square pattern from a string hash. Real deploy swaps in qrcode.js.
function hash32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function QRBlock({ value, size = 240, fg = '#18242F', bg = '#FFFFFF', chainLetter }) {
  const N = 29;
  const cells = React.useMemo(() => {
    const grid = Array(N * N).fill(0);
    let h = hash32(value);
    const rand = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h; };
    for (let i = 0; i < N * N; i++) grid[i] = (rand() & 1);
    // Clear finder areas
    const setBlock = (x, y, w, h) => { for (let dy=0;dy<h;dy++) for (let dx=0;dx<w;dx++) grid[(y+dy)*N+(x+dx)] = 0; };
    const finder = (x, y) => {
      setBlock(x,y,7,7);
      for (let dy=0;dy<7;dy++) for (let dx=0;dx<7;dx++) {
        const edge = dx===0||dy===0||dx===6||dy===6;
        const core = dx>=2&&dx<=4&&dy>=2&&dy<=4;
        grid[(y+dy)*N+(x+dx)] = (edge||core) ? 1 : 0;
      }
    };
    finder(0,0); finder(N-7,0); finder(0,N-7);
    // Timing pattern
    for (let i=8;i<N-8;i++){ grid[6*N+i]=i%2?0:1; grid[i*N+6]=i%2?0:1; }
    // Clear center for logo
    setBlock(12,12,5,5);
    return grid;
  }, [value]);
  const cs = size / N;
  return (
    <div style={{ position: 'relative', width: size, height: size, background: bg, padding: 0, borderRadius: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
        <rect width={N} height={N} fill={bg}/>
        {cells.map((v, i) => v ? <rect key={i} x={i%N} y={Math.floor(i/N)} width="1" height="1" fill={fg}/> : null)}
      </svg>
      {chainLetter && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: cs * 5, height: cs * 5, background: bg, border: `1.5px solid ${fg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: cs * 2.2, color: fg,
        }}>{chainLetter}</div>
      )}
    </div>
  );
}

// ─── Button ───
function Button({ children, variant = 'solid', size = 'md', fullWidth, onClick, theme, icon, trailing, as, href, disabled, style = {} }) {
  const t = theme || window.lightTheme;
  const heights = { sm: 36, md: 44, lg: 52 };
  const fonts = { sm: 14, md: 15, lg: 16 };
  const pad = { sm: '0 14px', md: '0 18px', lg: '0 22px' };
  const variants = {
    solid: { bg: t.primary, color: t.textOnAccent, border: 'transparent' },
    solidPool: { bg: t.accentPool, color: '#FFFFFF', border: 'transparent' },
    outline: { bg: 'transparent', color: t.text, border: t.borderStrong },
    outlinePrimary: { bg: 'transparent', color: t.primary, border: t.primary },
    ghost: { bg: 'transparent', color: t.text, border: 'transparent' },
    danger: { bg: t.danger, color: '#FFFFFF', border: 'transparent' },
  };
  const v = variants[variant] || variants.solid;
  const Tag = as || (href ? 'a' : 'button');
  return (
    <Tag href={href} onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      height: heights[size], padding: pad[size], width: fullWidth ? '100%' : 'auto',
      fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: fonts[size],
      color: v.color, background: v.bg, border: `1px solid ${v.border}`,
      borderRadius: 2, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'all 120ms ease', textDecoration: 'none', letterSpacing: '-0.01em',
      ...style,
    }}>
      {icon}{children}{trailing}
    </Tag>
  );
}

// ─── Badge / pill ───
function Badge({ children, color = 'default', theme, icon, size = 'md', style = {} }) {
  const t = theme || window.lightTheme;
  const map = {
    default: { bg: t.bgMuted, fg: t.textMuted },
    primary: { bg: t.primarySoft, fg: t.primary },
    success: { bg: t.successSoft, fg: t.success },
    warn: { bg: t.accentPoolSoft, fg: t.accentPool },
    danger: { bg: t.dangerSoft, fg: t.danger },
    info: { bg: t.infoSoft, fg: t.info },
    pool: { bg: t.accentPoolSoft, fg: t.accentPool },
    outline: { bg: 'transparent', fg: t.textMuted, border: t.border },
  };
  const c = map[color] || map.default;
  const dims = size === 'sm' ? { h: 20, fs: 11, pad: '0 8px' } : { h: 24, fs: 12, pad: '0 10px' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, height: dims.h, padding: dims.pad,
      fontFamily: 'Inter, system-ui', fontWeight: 600, fontSize: dims.fs,
      color: c.fg, background: c.bg, border: c.border ? `1px solid ${c.border}` : 'none',
      borderRadius: 999, letterSpacing: '-0.005em', textTransform: 'none', ...style,
    }}>
      {icon}{children}
    </span>
  );
}

Object.assign(window, { TorLogo, Icon, ChainIcon, QRBlock, Button, Badge });
