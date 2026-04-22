// Tor × Funding the Commons — design tokens extracted from brand kit
// All color values verified against /Color/Core-palette and /Color/Supporting-palette in Figma brand kit

const tokens = {
  // Core purple (primary)
  purple10:  '#F5E3FF',
  purple20:  '#E6C7FF',
  purple40:  '#C272FF',
  purple60:  '#9338C1',   // primary
  purple70:  '#7E4798',   // logo swatch
  purple80:  '#701498',
  purple90:  '#4E2065',

  // Neutrals
  gray00:    '#FFFFFF',
  gray05:    '#F8F8F8',
  gray10:    '#F2F5F8',
  gray20:    '#E4EAF0',
  gray30:    '#D1DAE3',
  gray60:    '#556472',
  gray80:    '#22232B',
  gray90:    '#18242F',
  black:     '#000000',

  // Supporting (semantic + chain accents)
  blue10:    '#DAECFF',
  blue60:    '#3D7AD7',
  blue80:    '#2E3781',

  green10:   '#EBFFC4',
  green60:   '#6DB12A',
  green80:   '#376C12',

  yellow10:  '#FFF3CB',
  orange60:  '#D87717',   // matching pool accent
  orange80:  '#7F2B07',

  red10:     '#FFD9D4',
  red60:     '#CC474E',
  red80:     '#742027',

  // Shadows
  shadowPurple: 'rgba(137,56,177,0.25)',
  shadowSoft:   'rgba(0,0,0,0.06)',
};

// Theme resolvers
const lightTheme = {
  bg:           tokens.gray00,
  bgMuted:      tokens.gray10,
  surface:      tokens.gray00,
  surfaceAlt:   tokens.gray10,
  border:       tokens.gray20,
  borderStrong: tokens.gray30,
  text:         tokens.gray90,
  textMuted:    tokens.gray60,
  textOnAccent: tokens.gray00,
  primary:      tokens.purple60,
  primaryHover: tokens.purple80,
  primarySoft:  tokens.purple10,
  primaryDeep:  tokens.purple80,
  accentPool:   tokens.orange60,
  accentPoolSoft: tokens.yellow10,
  accentPoolDeep: tokens.orange80,
  success:      tokens.green60,
  successSoft:  tokens.green10,
  warn:         tokens.orange60,
  danger:       tokens.red60,
  dangerSoft:   tokens.red10,
  info:         tokens.blue60,
  infoSoft:     tokens.blue10,
  focusRing:    tokens.purple60,
  dotPattern:   'rgba(34,35,43,0.06)',
};

const darkTheme = {
  bg:           '#0B1017',
  bgMuted:      '#111821',
  surface:      '#18242F',
  surfaceAlt:   '#22232B',
  border:       '#2A3744',
  borderStrong: '#3B4957',
  text:         '#E4EAF0',
  textMuted:    '#8A98A6',
  textOnAccent: '#FFFFFF',
  primary:      tokens.purple40,
  primaryHover: tokens.purple20,
  primarySoft:  '#2A1840',
  primaryDeep:  tokens.purple10,
  accentPool:   '#F0A457',
  accentPoolSoft: '#3A2411',
  accentPoolDeep: '#FFD9B8',
  success:      '#8FCE53',
  successSoft:  '#1E2E10',
  warn:         '#F0A457',
  danger:       '#E7737A',
  dangerSoft:   '#3A1418',
  info:         '#6FA3E8',
  infoSoft:     '#13223B',
  focusRing:    tokens.purple40,
  dotPattern:   'rgba(228,234,240,0.05)',
};

// Type scale (from /Typography)
const type = {
  display:  { family: '"Space Grotesk", Inter, system-ui', weight: 700, lh: 1.05 },
  heading:  { family: 'Inter, system-ui', weight: 700, lh: 1.2 },
  body:     { family: 'Inter, system-ui', weight: 400, lh: 1.5 },
  label:    { family: 'Inter, system-ui', weight: 500, lh: 1.3 },
  mono:     { family: '"Space Mono", ui-monospace, monospace', weight: 400, lh: 1.4 },
};

const radii = { xs: 2, sm: 6, md: 8, lg: 12, xl: 16, pill: 999 };
const space = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];

Object.assign(window, { tokens, lightTheme, darkTheme, type, radii, space });
