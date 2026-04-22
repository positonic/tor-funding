// /about, /sponsors, /stats — mobile + desktop
// Lower-priority pages from the brief but complete passes.

// ────────────────────────────────────────────────────────────
// /about
// ────────────────────────────────────────────────────────────

function QFDiagram({ theme }) {
  const t = theme || window.lightTheme;
  return (
    <svg viewBox="0 0 320 160" width="100%" style={{ display: 'block' }}>
      {/* Baseline bars — raw donations */}
      <g>
        {[{x:20,h:30,label:'10 × $10'},{x:80,h:42,label:'5 × $20'},{x:140,h:60,label:'2 × $50'},{x:200,h:80,label:'1 × $100'}].map((d,i) => (
          <g key={i}>
            <rect x={d.x} y={150 - d.h} width={40} height={d.h} fill={t.bgMuted} stroke={t.border} rx={2}/>
            <text x={d.x + 20} y={158} fontFamily="Space Mono" fontSize="7" fill={t.textMuted} textAnchor="middle">${[100,100,100,100][i]}</text>
          </g>
        ))}
      </g>
      <text x={130} y={14} fontFamily="Inter" fontSize="9" fontWeight="600" fill={t.textMuted}>Same total raised, $400 each →</text>
      {/* QF match bars — the key point */}
      <g transform="translate(0, 0)">
        {[{x:20,h:95,pct:'2.5×'},{x:80,h:72,pct:'1.8×'},{x:140,h:50,pct:'1.25×'},{x:200,h:28,pct:'0.7×'}].map((d,i) => (
          <g key={i}>
            <rect x={d.x} y={150 - d.h} width={40} height={d.h - [30,42,60,80][i]} fill={t.primary} rx={2} opacity="0.85"/>
            <text x={d.x + 20} y={150 - d.h - 4} fontFamily="Space Mono" fontSize="8" fontWeight="700" fill={t.primary} textAnchor="middle">+{d.pct}</text>
          </g>
        ))}
      </g>
      {/* Legend */}
      <g transform="translate(260, 60)">
        <rect x={0} y={0} width={9} height={9} fill={t.bgMuted} stroke={t.border}/>
        <text x={14} y={8} fontFamily="Inter" fontSize="7" fill={t.textMuted}>Donations</text>
        <rect x={0} y={14} width={9} height={9} fill={t.primary} opacity="0.85"/>
        <text x={14} y={22} fontFamily="Inter" fontSize="7" fill={t.textMuted}>QF match</text>
      </g>
    </svg>
  );
}

const FAQ_ITEMS = [
  { q: 'How are matches calculated?', a: 'Quadratic funding uses the square-root of each donation to weight community support. A project with 100 donors giving $10 each receives a larger match than a project with one donor giving $1000. The matching pool is then distributed proportionally across all participating projects at the end of the round.' },
  { q: 'Why do you need a view key for Monero?', a: 'View keys let the campaign verify that a donation landed in the project\'s address without exposing who sent it or letting us spend the funds. The donor remains private; the donation remains verifiable. This is the "cooperative transparency" model.' },
  { q: 'What happens if a donation arrives after the round ends?', a: 'Only donations received on-chain (or via view-key verification) between May 19 and June 19, 2026 (UTC) count toward the match. Later donations still reach the project directly.' },
  { q: 'How do you prevent Sybil attacks?', a: 'All donations are reviewed by a small trusted committee for Sybil patterns — bursts of low-value donations from correlated addresses, dust transactions, or other manipulation. Flagged donations don\'t count toward the match but are still delivered to the project.' },
  { q: 'Can I donate from Tor Browser?', a: 'Yes — every page on this site works without JavaScript for reading, and the donate flow requires only a QR code or copying an address. No wallet connection is needed. No third-party trackers or cookie banners, anywhere.' },
  { q: 'Where does leftover matching pool go?', a: 'There is no "leftover". The matching pool is distributed 100% at round end. If a project is disqualified, their share redistributes to the remaining projects.' },
];

function FAQAccordion({ theme, items }) {
  const t = theme || window.lightTheme;
  const [open, setOpen] = React.useState(0);
  return (
    <div>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              style={{
                width: '100%', minHeight: 56, padding: '14px 4px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                textAlign: 'left', color: t.text,
                fontFamily: 'Inter', fontSize: 15, fontWeight: 600,
              }}>
              <span style={{ flex: 1 }}>{item.q}</span>
              <span style={{
                width: 24, height: 24, borderRadius: 6, background: isOpen ? t.primary : t.bgMuted,
                color: isOpen ? t.textOnAccent : t.text,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 140ms',
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d={isOpen ? "M1 5h8" : "M5 1v8M1 5h8"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
            </button>
            {isOpen && (
              <div style={{
                padding: '0 30px 16px 4px', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.6,
                color: t.textMuted, textWrap: 'pretty',
              }}>
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TransparencyBlock({ theme }) {
  const t = theme || window.lightTheme;
  return (
    <section style={{ padding: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: t.successSoft, color: t.success, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.shield size={14}/>
        </span>
        <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: t.text }}>Cooperative transparency</h3>
      </div>
      <p style={{ margin: 0, fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55, color: t.textMuted, textWrap: 'pretty' }}>
        Every donation is verified. Public chains (Bitcoin, Ethereum, Solana) confirm on-chain. Private chains (Monero, shielded Zcash) are verified via view keys the projects share with the campaign. Donor identity stays private.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        <div style={{ padding: 12, background: t.bgMuted, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Icon.shield size={12}/>
            <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: t.text }}>On-chain</span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
            BTC, ETH, SOL, USDC, transparent ZEC. Anyone can verify.
          </div>
        </div>
        <div style={{ padding: 12, background: t.bgMuted, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Icon.eye size={12}/>
            <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: t.text }}>View-key</span>
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
            Monero, shielded ZEC. Campaign verifies; identity private.
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutPageMobile({ theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="About">
      <TopBar theme={theme} setTheme={setTheme}/>
      <CampaignStrip day={day} theme={t}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <section style={{ paddingBottom: 20, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>About the campaign</div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 32, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            How quadratic funding works
          </h1>
          <p style={{ margin: '12px 0 0', fontFamily: 'Inter', fontSize: 15, lineHeight: 1.55, color: t.textMuted, textWrap: 'pretty' }}>
            QF rewards projects with broad community support, not big cheques. Here's the model, the safeguards, and the answers to the most common questions.
          </p>
        </section>

        <section style={{ padding: '20px 0', borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ margin: '0 0 10px', fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>
            Many small donations beat one big one
          </h2>
          <p style={{ margin: '0 0 14px', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55, color: t.textMuted }}>
            Four projects raise $400 each. QF matches based on how many people donated, not how much. The grassroots project wins.
          </p>
          <div style={{ padding: 16, background: t.bgMuted, borderRadius: 10 }}>
            <QFDiagram theme={t}/>
          </div>
        </section>

        <section style={{ padding: '20px 0', borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>Transparency</h2>
          <TransparencyBlock theme={t}/>
        </section>

        <section style={{ padding: '20px 0', borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ margin: '0 0 14px', fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>Sybil review</h2>
          <div style={{ padding: 16, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'start' }}>
              {[
                ['01','Automatic checks','Bursts of low-value donations from correlated addresses are flagged automatically during the round.'],
                ['02','Committee review','A small trusted committee reviews flagged patterns before the final distribution.'],
                ['03','Flagged donations still go to the project','They just don\'t count toward the match — the donor isn\'t penalized.'],
              ].map(([n,ttl,d]) => (
                <React.Fragment key={n}>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, fontWeight: 700, color: t.primary, paddingTop: 2, letterSpacing: '0.04em' }}>{n}</div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text }}>{ttl}</div>
                    <div style={{ fontFamily: 'Inter', fontSize: 13, color: t.textMuted, lineHeight: 1.5, marginTop: 2 }}>{d}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '20px 0' }}>
          <h2 style={{ margin: '0 0 6px', fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>FAQ</h2>
          <FAQAccordion theme={t} items={FAQ_ITEMS}/>
        </section>
      </div>
    </div>
  );
}

function AboutPageDesktop({ theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="About · desktop">
      <DesktopHeader theme={theme} setTheme={setTheme} active="about"/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <section style={{ padding: '48px 64px 32px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>About the campaign</div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 56, fontWeight: 700, color: t.text, letterSpacing: '-0.04em', lineHeight: 1, maxWidth: 820 }}>
            How quadratic funding works
          </h1>
          <p style={{ margin: '16px 0 0', fontFamily: 'Inter', fontSize: 18, lineHeight: 1.55, color: t.textMuted, maxWidth: 680, textWrap: 'pretty' }}>
            QF rewards projects with broad community support, not big cheques. Here's the model, the safeguards, and the answers to the most common questions.
          </p>
        </section>
        <section style={{ padding: '40px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', borderBottom: `1px solid ${t.border}` }}>
          <div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>The model</div>
            <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 36, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Many small donations beat one big one
            </h2>
            <p style={{ margin: '12px 0 0', fontFamily: 'Inter', fontSize: 16, lineHeight: 1.55, color: t.textMuted }}>
              Four projects raise $400 each. QF matches based on how many people donated, not how much. The grassroots project wins.
            </p>
          </div>
          <div style={{ padding: 24, background: t.bgMuted, borderRadius: 14 }}>
            <QFDiagram theme={t}/>
          </div>
        </section>
        <section style={{ padding: '40px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, borderBottom: `1px solid ${t.border}` }}>
          <div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Verification</div>
            <h2 style={{ margin: '0 0 16px', fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>Cooperative transparency</h2>
            <TransparencyBlock theme={t}/>
          </div>
          <div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.primary, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Integrity</div>
            <h2 style={{ margin: '0 0 16px', fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>Sybil review</h2>
            <div style={{ padding: 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['01','Automatic checks','Correlated addresses and dust bursts flagged during the round.'],
                ['02','Committee review','Small trusted committee reviews flagged patterns before final distribution.'],
                ['03','Flagged donations still reach the project','They just don\'t count toward the match.'],
              ].map(([n,ttl,d]) => (
                <div key={n} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 10 }}>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, fontWeight: 700, color: t.primary, paddingTop: 1, letterSpacing: '0.04em' }}>{n}</div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text }}>{ttl}</div>
                    <div style={{ fontFamily: 'Inter', fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section style={{ padding: '40px 64px 64px', maxWidth: 900 }}>
          <h2 style={{ margin: '0 0 20px', fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 36, fontWeight: 700, color: t.text, letterSpacing: '-0.03em' }}>FAQ</h2>
          <FAQAccordion theme={t} items={FAQ_ITEMS}/>
        </section>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// /sponsors
// ────────────────────────────────────────────────────────────

const SPONSORS = [
  { name: 'Human Rights Foundation', committed_usd: 25000, tag: 'Anchor' },
  { name: 'Web3 Privacy Now', committed_usd: 10000, tag: 'Supporter' },
  { name: 'Open Tech Fund', committed_usd: 15000, tag: 'Supporter' },
  { name: 'DeFi Privacy Alliance', committed_usd: 8500, tag: 'Supporter' },
  { name: 'Shielded Labs', committed_usd: 5000, tag: 'Contributor' },
  { name: 'Nym Technologies', committed_usd: 7500, tag: 'Contributor' },
  { name: 'Gitcoin Grants', committed_usd: 12000, tag: 'Supporter' },
  { name: 'Protocol Labs', committed_usd: 4500, tag: 'Contributor' },
];

function SponsorCard({ sponsor, theme, compact }) {
  const t = theme || window.lightTheme;
  const initials = sponsor.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <a href="#" onClick={e => e.preventDefault()} style={{
      padding: compact ? 16 : 20, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14,
      textDecoration: 'none', color: t.text,
      minHeight: compact ? 120 : 160,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          width: compact ? 36 : 44, height: compact ? 36 : 44, borderRadius: 8,
          background: t.bgMuted, color: t.textMuted,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: compact ? 13 : 15, fontWeight: 700, letterSpacing: '-0.01em',
        }}>
          {initials}
        </span>
        <span style={{
          padding: '3px 8px', background: t.primarySoft, color: t.primary,
          fontFamily: 'Inter', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          borderRadius: 999,
        }}>
          {sponsor.tag}
        </span>
      </div>
      <div>
        <div style={{ fontFamily: 'Inter', fontSize: compact ? 14 : 16, fontWeight: 700, color: t.text, letterSpacing: '-0.005em' }}>
          {sponsor.name}
        </div>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: compact ? 11 : 12, color: t.textMuted, marginTop: 2 }}>
          ${sponsor.committed_usd.toLocaleString()} committed
        </div>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: t.primary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        Visit <Icon.external/>
      </div>
    </a>
  );
}

function SponsorsPageMobile({ theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const total = SPONSORS.reduce((a, s) => a + s.committed_usd, 0);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Sponsors">
      <TopBar theme={theme} setTheme={setTheme}/>
      <CampaignStrip day={day} theme={t}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <section style={{ paddingBottom: 18, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Match sponsors</div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 30, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {SPONSORS.length} sponsors. ${total.toLocaleString()} pool.
          </h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55, color: t.textMuted }}>
            These organizations committed the matching pool that multiplies every individual donation.
          </p>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 0' }}>
          {SPONSORS.map(s => <SponsorCard key={s.name} sponsor={s} theme={t} compact/>)}
        </div>
        <div style={{
          padding: 16, border: `1.5px dashed ${t.border}`, borderRadius: 12,
          fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55, color: t.textMuted, textAlign: 'center',
        }}>
          Want to sponsor a future round? <a href="#" style={{ color: t.primary, fontWeight: 600 }}>Get in touch →</a>
        </div>
        <div style={{ height: 20 }}/>
      </div>
    </div>
  );
}

function SponsorsPageDesktop({ theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const total = SPONSORS.reduce((a, s) => a + s.committed_usd, 0);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Sponsors · desktop">
      <DesktopHeader theme={theme} setTheme={setTheme} active="sponsors"/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <section style={{ padding: '48px 64px 28px', borderBottom: `1px solid ${t.border}`, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'end' }}>
          <div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Match sponsors</div>
            <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 56, fontWeight: 700, color: t.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
              The pool that<br/>multiplies every donation.
            </h1>
            <p style={{ margin: '16px 0 0', fontFamily: 'Inter', fontSize: 17, lineHeight: 1.55, color: t.textMuted, maxWidth: 620 }}>
              Thank you to the organizations who committed matching funds. They enable every small donor to move the needle.
            </p>
          </div>
          <div style={{ padding: 24, background: t.accentPoolSoft, border: `1px solid ${t.accentPool}`, borderRadius: 14, textAlign: 'right' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.accentPool, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total committed</div>
            <div style={{ fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 48, fontWeight: 700, color: t.text, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
              ${total.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 13, color: t.textMuted, marginTop: 4 }}>
              across {SPONSORS.length} sponsors
            </div>
          </div>
        </section>
        <section style={{ padding: '32px 64px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {SPONSORS.map(s => <SponsorCard key={s.name} sponsor={s} theme={t}/>)}
        </section>
        <section style={{ padding: '20px 64px 64px' }}>
          <div style={{
            padding: 24, border: `1.5px dashed ${t.border}`, borderRadius: 14,
            fontFamily: 'Inter', fontSize: 15, lineHeight: 1.55, color: t.textMuted, textAlign: 'center',
          }}>
            Want to sponsor a future round? <a href="#" style={{ color: t.primary, fontWeight: 600 }}>Get in touch →</a>
          </div>
        </section>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// /stats — full transparency
// ────────────────────────────────────────────────────────────

function generateDonations(n, projects) {
  const chains = ['btc','eth','sol','usdc','zec_t','xmr'];
  const rng = (() => { let s = 42; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = projects[Math.floor(rng() * projects.length)];
    const c = chains[Math.floor(rng() * chains.length)];
    const amt = [5, 10, 20, 25, 50, 100, 250, 500][Math.floor(rng() * 8)];
    const mins = Math.floor(rng() * 2500);
    const hash = '0x' + Array.from({length: 10}).map(() => '0123456789abcdef'[Math.floor(rng() * 16)]).join('');
    out.push({
      id: i + 1, project: p.name, project_id: p.id, chain: c, amount_usd: amt,
      verification: (c === 'xmr' || c === 'zec_t') && rng() > 0.5 ? 'view_key' : 'public',
      minutes_ago: mins, hash,
    });
  }
  return out.sort((a, b) => a.minutes_ago - b.minutes_ago);
}

function ChainBreakdownChart({ data, theme, horizontal }) {
  const t = theme || window.lightTheme;
  const counts = {};
  data.forEach(d => { counts[d.chain] = (counts[d.chain] || 0) + d.amount_usd; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const rows = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  if (horizontal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(([c, amt]) => {
          const pct = (amt / total) * 100;
          const cm = window.CHAIN_META[c];
          return (
            <div key={c}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Inter', fontSize: 13, color: t.text, fontWeight: 500 }}>
                  <ChainIcon symbol={c} size={14} color={t.textMuted}/> {cm?.label}
                </span>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted }}>
                  ${Math.round(amt).toLocaleString()} · {pct.toFixed(0)}%
                </span>
              </div>
              <div style={{ height: 5, background: t.bgMuted, borderRadius: 999 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: t.primary, borderRadius: 999 }}/>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  // Stacked horizontal bar for desktop
  return (
    <div>
      <div style={{ display: 'flex', height: 16, borderRadius: 999, overflow: 'hidden', background: t.bgMuted }}>
        {rows.map(([c, amt], i) => {
          const pct = (amt / total) * 100;
          const colors = [t.primary, t.accentPool, t.info, t.success, t.warn, t.danger];
          return <div key={c} style={{ width: `${pct}%`, background: colors[i % colors.length], height: '100%' }}/>;
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 14 }}>
        {rows.map(([c, amt], i) => {
          const pct = (amt / total) * 100;
          const colors = [t.primary, t.accentPool, t.info, t.success, t.warn, t.danger];
          return (
            <div key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length] }}/>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: t.text }}>{window.CHAIN_META[c]?.label}</span>
              <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted }}>
                ${Math.round(amt).toLocaleString()} · {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsFilterBar({ theme, filter, setFilter, chainFilter, setChainFilter }) {
  const t = theme || window.lightTheme;
  const inp = {
    padding: '0 12px', height: 36, background: t.surface, color: t.text,
    border: `1px solid ${t.border}`, borderRadius: 8,
    fontFamily: 'Inter', fontSize: 13,
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 8l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </span>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by project…"
          style={{ ...inp, width: '100%', paddingLeft: 28 }}/>
      </div>
      <select value={chainFilter} onChange={e => setChainFilter(e.target.value)} style={inp}>
        <option value="">All chains</option>
        <option value="btc">Bitcoin</option>
        <option value="eth">Ethereum</option>
        <option value="sol">Solana</option>
        <option value="usdc">USDC</option>
        <option value="zec_t">Zcash (transparent)</option>
        <option value="xmr">Monero</option>
      </select>
      <Button variant="outline" theme={t} size="sm" icon={<Icon.download/>}>Export CSV</Button>
    </div>
  );
}

function StatsPageMobile({ theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const donations = React.useMemo(() => generateDonations(120, window.SAMPLE_DATA.projects), []);
  const [filter, setFilter] = React.useState('');
  const [chainFilter, setChainFilter] = React.useState('');
  const filtered = donations.filter(d =>
    (!filter || d.project.toLowerCase().includes(filter.toLowerCase())) &&
    (!chainFilter || d.chain === chainFilter)
  );
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Stats">
      <TopBar theme={theme} setTheme={setTheme}/>
      <CampaignStrip day={day} theme={t}/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <section style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Full transparency</div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: '-0.03em' }}>
            Every donation.
          </h1>
          <p style={{ margin: '6px 0 0', fontFamily: 'Inter', fontSize: 13, lineHeight: 1.55, color: t.textMuted }}>
            All {donations.length} donations since round start. Verified on-chain or via view key.
          </p>
          <div style={{ marginTop: 14 }}>
            <StatsFilterBar theme={t} filter={filter} setFilter={setFilter} chainFilter={chainFilter} setChainFilter={setChainFilter}/>
          </div>
        </section>
        <section style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 12px', fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text }}>By chain</h3>
          <ChainBreakdownChart data={filtered} theme={t} horizontal/>
        </section>
        <section style={{ padding: '0 16px 20px' }}>
          <h3 style={{ margin: '0 0 10px', fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: t.text }}>
            Donations <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, fontWeight: 400 }}>({filtered.length})</span>
          </h3>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {filtered.slice(0, 30).map((d, i) => (
              <div key={d.id} style={{
                padding: '12px 14px', borderBottom: i < Math.min(29, filtered.length - 1) ? `1px solid ${t.border}` : 'none',
                display: 'grid', gridTemplateColumns: '22px 1fr auto', gap: 10, alignItems: 'center',
              }}>
                <ChainIcon symbol={d.chain} size={18} color={t.textMuted}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.project}
                  </div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted }}>
                    {d.hash} · {d.verification === 'view_key' ? 'view-key' : 'on-chain'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, fontWeight: 700, color: t.text }}>${d.amount_usd}</div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 10, color: t.textMuted }}>
                    {d.minutes_ago < 60 ? `${d.minutes_ago}m` : `${Math.floor(d.minutes_ago/60)}h`}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length > 30 && (
              <div style={{ padding: 12, textAlign: 'center', fontFamily: 'Inter', fontSize: 12, color: t.textMuted }}>
                Showing 30 of {filtered.length} — use CSV for full list
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatsPageDesktop({ theme, setTheme, day }) {
  const t = theme === 'dark' ? window.darkTheme : window.lightTheme;
  const donations = React.useMemo(() => generateDonations(260, window.SAMPLE_DATA.projects), []);
  const [filter, setFilter] = React.useState('');
  const [chainFilter, setChainFilter] = React.useState('');
  const filtered = donations.filter(d =>
    (!filter || d.project.toLowerCase().includes(filter.toLowerCase())) &&
    (!chainFilter || d.chain === chainFilter)
  );
  const total = filtered.reduce((a, d) => a + d.amount_usd, 0);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.text, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      data-screen-label="Stats · desktop">
      <DesktopHeader theme={theme} setTheme={setTheme} active="stats"/>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <section style={{ padding: '40px 64px 24px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: t.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Full transparency</div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", Inter, system-ui', fontSize: 48, fontWeight: 700, color: t.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
            Every donation. On-chain, verifiable, exportable.
          </h1>
          <div style={{ display: 'flex', gap: 32, marginTop: 20, flexWrap: 'wrap' }}>
            <Stat theme={t} label="Donations" value={donations.length.toLocaleString()}/>
            <Stat theme={t} label="Total (USD)" value={`$${Math.round(total).toLocaleString()}`}/>
            <Stat theme={t} label="Chains live" value={Object.keys(window.CHAIN_META).length}/>
            <Stat theme={t} label="Projects" value={window.SAMPLE_DATA.projects.length}/>
          </div>
        </section>

        <section style={{ padding: '28px 64px 24px', display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div style={{ padding: 24, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: t.text }}>By chain</h3>
              <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>
                {filtered.length} donations · ${Math.round(total).toLocaleString()}
              </span>
            </div>
            <ChainBreakdownChart data={filtered} theme={t}/>
          </div>
        </section>

        <section style={{ padding: '0 64px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 16, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color: t.text }}>
              Donations <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 13, color: t.textMuted, fontWeight: 400 }}>({filtered.length})</span>
            </h3>
            <div style={{ flex: '1 1 360px', maxWidth: 560 }}>
              <StatsFilterBar theme={t} filter={filter} setFilter={setFilter} chainFilter={chainFilter} setChainFilter={setChainFilter}/>
            </div>
          </div>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden', background: t.surface }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 120px 130px 140px 110px 60px',
              padding: '12px 18px', background: t.bgMuted, borderBottom: `1px solid ${t.border}`,
              fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <span>Chain</span><span>Project</span><span>Verification</span><span>Tx hash</span><span>Timestamp</span><span style={{ textAlign: 'right' }}>Amount</span><span/>
            </div>
            {filtered.slice(0, 20).map((d, i) => (
              <div key={d.id} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 120px 130px 140px 110px 60px',
                padding: '12px 18px', borderBottom: i < Math.min(19, filtered.length - 1) ? `1px solid ${t.border}` : 'none',
                alignItems: 'center', fontFamily: 'Inter', fontSize: 13, color: t.text,
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted, fontWeight: 600 }}>
                  <ChainIcon symbol={d.chain} size={14} color={t.textMuted}/>
                  {window.CHAIN_META[d.chain]?.symbol}
                </span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{d.project}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: d.verification === 'view_key' ? t.info : t.success }}>
                  {d.verification === 'view_key' ? <Icon.eye size={11}/> : <Icon.shield size={11}/>}
                  {d.verification === 'view_key' ? 'View-key' : 'On-chain'}
                </span>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>{d.hash}</span>
                <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: t.textMuted }}>
                  {d.minutes_ago < 60 ? `${d.minutes_ago}m ago` : `${Math.floor(d.minutes_ago/60)}h ${d.minutes_ago % 60}m ago`}
                </span>
                <span style={{ textAlign: 'right', fontFamily: '"Space Mono", monospace', fontWeight: 700 }}>${d.amount_usd}</span>
                <span style={{ textAlign: 'right', color: t.textMuted }}><Icon.external/></span>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Inter', fontSize: 13, color: t.textMuted }}>
            <span>Showing 20 of {filtered.length} · sorted by most recent</span>
            <span style={{ display: 'inline-flex', gap: 6 }}>
              <button style={{ padding: '6px 10px', background: 'transparent', color: t.text, border: `1px solid ${t.border}`, borderRadius: 6, fontFamily: 'Inter', fontSize: 12, cursor: 'pointer' }}>Previous</button>
              <button style={{ padding: '6px 10px', background: t.surface, color: t.text, border: `1px solid ${t.border}`, borderRadius: 6, fontFamily: 'Inter', fontSize: 12, cursor: 'pointer' }}>Next</button>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

Object.assign(window, {
  AboutPageMobile, AboutPageDesktop,
  SponsorsPageMobile, SponsorsPageDesktop,
  StatsPageMobile, StatsPageDesktop,
  FAQAccordion, FAQ_ITEMS, SPONSORS,
});
