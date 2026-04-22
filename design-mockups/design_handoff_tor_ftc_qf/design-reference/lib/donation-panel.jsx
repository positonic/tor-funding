// DonationPanel + MatchingPoolPanel — the load-bearing components.
// Props-driven. Theme-aware. Three visual variants via the `variant` prop:
//   'default'   — stacked chain chips, clean (conservative)
//   'warm'      — segmented chain selector with card warmth (warm)
//   'scanner'   — QR-first, big scanner focus (experimental)

function AddressDisplay({ address, mono = true, theme, copied, onCopy, fontSize = 13 }) {
  const t = theme || window.lightTheme;
  // chunk address into 4-char groups for scanning
  const chunks = [];
  for (let i = 0; i < address.length; i += 4) chunks.push(address.slice(i, i + 4));
  return (
    <div
      onClick={onCopy}
      style={{
        position: 'relative',
        padding: '14px 14px 14px 14px',
        background: t.bgMuted, border: `1px solid ${t.border}`, borderRadius: 8,
        fontFamily: mono ? '"Space Mono", ui-monospace, monospace' : 'Inter',
        fontSize, lineHeight: 1.55, color: t.text,
        wordBreak: 'break-all', wordWrap: 'break-word', whiteSpace: 'pre-wrap',
        letterSpacing: '0.01em', cursor: 'pointer', userSelect: 'all',
        transition: 'border-color 120ms ease',
      }}
    >
      {chunks.map((c, i) => (
        <span key={i}>
          <span style={{ color: i % 2 === 0 ? t.text : t.textMuted }}>{c}</span>
          {i < chunks.length - 1 && <span style={{ color: t.border }}> </span>}
        </span>
      ))}
      {copied && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          padding: '3px 7px', fontSize: 10, fontWeight: 700,
          fontFamily: 'Inter', letterSpacing: '0.04em',
          background: t.success, color: '#fff', borderRadius: 2, textTransform: 'uppercase',
        }}>Copied</div>
      )}
    </div>
  );
}

function ChainScrollStrip({ chains, selected, onSelect, theme, tone = 'primary' }) {
  const t = theme || window.lightTheme;
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  const accentSoft = tone === 'pool' ? t.accentPoolSoft : t.primarySoft;
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0 10px',
      scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
    }} className="chain-strip">
      {chains.map(ch => {
        const m = window.CHAIN_META[ch];
        const sel = selected === ch;
        return (
          <button
            key={ch}
            onClick={() => onSelect(ch)}
            style={{
              flexShrink: 0, scrollSnapAlign: 'start',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 44, padding: '0 14px',
              background: sel ? accentSoft : 'transparent',
              border: `1px solid ${sel ? accent : t.border}`,
              color: sel ? accent : t.text,
              borderRadius: 999, cursor: 'pointer',
              fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
              transition: 'all 120ms ease',
            }}
            aria-pressed={sel}
            aria-label={`Donate in ${m.label}`}
          >
            <ChainIcon symbol={ch} size={18} color={sel ? accent : t.textMuted}/>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function ChainDropdown({ chains, selected, onSelect, theme, tone = 'primary' }) {
  const t = theme || window.lightTheme;
  const [open, setOpen] = React.useState(false);
  const m = window.CHAIN_META[selected];
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', height: 52, padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: t.surface, border: `1.5px solid ${open ? accent : t.border}`,
          borderRadius: 8, cursor: 'pointer',
          fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: t.text,
          transition: 'border-color 120ms ease',
        }}
      >
        <ChainIcon symbol={selected} size={22} color={accent}/>
        <span style={{ flex: 1, textAlign: 'left' }}>Donate in {m.label}</span>
        <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted }}>{m.symbol}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}>
          <Icon.chevron/>
        </span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 10,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          {chains.map(ch => {
            const cm = window.CHAIN_META[ch];
            const sel = ch === selected;
            return (
              <button key={ch} onClick={() => { onSelect(ch); setOpen(false); }}
                style={{
                  width: '100%', height: 52, padding: '0 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: sel ? t.bgMuted : 'transparent',
                  border: 'none', borderBottom: `1px solid ${t.border}`,
                  cursor: 'pointer', fontFamily: 'Inter', fontSize: 15, color: t.text,
                  textAlign: 'left',
                }}>
                <ChainIcon symbol={ch} size={20} color={t.textMuted}/>
                <span style={{ flex: 1, fontWeight: sel ? 600 : 500 }}>{cm.label}</span>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted }}>{cm.symbol}</span>
                {sel && <span style={{ color: accent }}><Icon.check/></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DonationPanel({ project, chain, onChainChange, theme, chainPattern = 'scroll', variant = 'default', tone = 'primary', onCopy }) {
  const t = theme || window.lightTheme;
  const accent = tone === 'pool' ? t.accentPool : t.primary;
  const chains = project.matching_eligible_chains;
  const address = project.addresses[chain];
  const meta = window.CHAIN_META[chain];
  const [copied, setCopied] = React.useState(false);
  const [walletOpen, setWalletOpen] = React.useState(false);

  const copy = async () => {
    try { await navigator.clipboard.writeText(address); } catch {}
    setCopied(true);
    onCopy && onCopy();
    setTimeout(() => setCopied(false), 1600);
  };

  const ChainSelector = chainPattern === 'dropdown' ? ChainDropdown : ChainScrollStrip;

  return (
    <section style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
      padding: 18, position: 'relative',
    }} aria-labelledby="donate-heading">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, marginBottom: 4 }}>
            {tone === 'pool' ? 'Matching Pool' : 'Donate'}
          </div>
          <h2 id="donate-heading" style={{ margin: 0, fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>
            {tone === 'pool' ? 'Fund the pool' : 'Support this project'}
          </h2>
        </div>
        <Badge color={tone === 'pool' ? 'pool' : 'primary'} theme={t} size="sm">
          {chains.length} chains
        </Badge>
      </div>

      {/* Chain selector */}
      <ChainSelector chains={chains} selected={chain} onSelect={onChainChange} theme={t} tone={tone}/>

      {/* Body: QR + address + CTA */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* QR Card */}
        <div style={{
          background: '#FFFFFF', border: `1px solid ${t.border}`, borderRadius: 8,
          padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <QRBlock value={address} size={240} fg="#18242F" bg="#FFFFFF" chainLetter={meta.symbol.slice(0,1)}/>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: '"Space Mono", monospace', fontSize: 11, color: '#556472',
          }}>
            <Icon.onion size={12}/> Scan with {meta.deepLinks[0]} or any {meta.label} wallet
          </div>
        </div>

        {/* Address label */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <label style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {meta.label} address
          </label>
          {meta.note && (
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: t.textMuted }}>{meta.note}</span>
          )}
        </div>

        {/* Full address, never truncated */}
        <AddressDisplay address={address} theme={t} copied={copied} onCopy={copy}/>

        {/* Copy CTA — primary */}
        <Button
          fullWidth
          size="lg"
          variant={tone === 'pool' ? 'solidPool' : 'solid'}
          theme={t}
          onClick={copy}
          icon={copied ? <Icon.check/> : <Icon.copy/>}
        >
          {copied ? 'Address copied' : 'Copy address'}
        </Button>

        {/* Wallet deep link */}
        <Button
          fullWidth
          size="md"
          variant="outline"
          theme={t}
          onClick={() => setWalletOpen(!walletOpen)}
          trailing={<Icon.chevron/>}
        >
          Open in wallet
        </Button>
        {walletOpen && (
          <div style={{
            padding: 12, background: t.bgMuted, border: `1px solid ${t.border}`,
            borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Launch
            </div>
            {meta.deepLinks.map(w => (
              <a key={w} href={`${meta.uriScheme}${address}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 44, padding: '0 12px',
                background: t.surface, border: `1px solid ${t.border}`, borderRadius: 6,
                fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: t.text, textDecoration: 'none',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 5, background: t.primarySoft, color: accent,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {w[0]}
                  </span>
                  {w}
                </span>
                <Icon.external/>
              </a>
            ))}
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted, wordBreak: 'break-all', paddingTop: 4 }}>
              Link: {meta.uriScheme}{address.slice(0,20)}…
            </div>
          </div>
        )}

        {/* Transparency note */}
        <div style={{
          display: 'flex', gap: 10, padding: '10px 12px',
          background: chain === 'xmr' || chain === 'zec_t' ? t.infoSoft : t.bgMuted,
          borderRadius: 6, fontFamily: 'Inter', fontSize: 12, lineHeight: 1.45, color: t.textMuted,
        }}>
          <div style={{ flexShrink: 0, color: t.info, marginTop: 1 }}>
            {chain === 'xmr' || chain === 'zec_t' ? <Icon.eye/> : <Icon.shield/>}
          </div>
          <span>
            {chain === 'xmr' || chain === 'zec_t'
              ? <>This chain uses <strong style={{ color: t.text }}>view-key verification</strong>. Your donation counts toward matching; your identity stays private.</>
              : <>This donation will be <strong style={{ color: t.text }}>verified directly on-chain</strong> and counted toward matching.</>}
          </span>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { DonationPanel, AddressDisplay, ChainScrollStrip, ChainDropdown });
