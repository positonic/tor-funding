import type { Chain } from '@tor/types';

interface ChainIconProps {
  chain: Chain;
  size?: number;
  className?: string;
}

/**
 * Minimal circle-framed glyph per chain. Ported from design-reference
 * primitives.jsx. Uses `currentColor` so parent styles the tone.
 */
export function ChainIcon({ chain, size = 14, className }: ChainIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    className,
    'aria-hidden': true as const,
  };
  const ring = (
    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
  );

  switch (chain) {
    case 'btc':
      return (
        <svg {...common}>
          {ring}
          <text
            x="12"
            y="16.5"
            textAnchor="middle"
            fontSize="13"
            fontFamily="Space Mono, monospace"
            fontWeight="700"
            fill="currentColor"
          >
            ₿
          </text>
        </svg>
      );
    case 'eth':
      return (
        <svg {...common}>
          {ring}
          <path
            d="M12 5L7.5 12L12 14.5L16.5 12L12 5Z M12 15.5L7.5 13L12 19L16.5 13L12 15.5Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'usdc-eth':
    case 'usdc-base':
      return (
        <svg {...common}>
          {ring}
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fill="currentColor"
          >
            $
          </text>
        </svg>
      );
    case 'sol':
      return (
        <svg {...common}>
          {ring}
          <path
            d="M8 9h7.5L17 7H9.5L8 9zM8 13h7.5L17 11H9.5L8 13zM8 17h7.5L17 15H9.5L8 17z"
            fill="currentColor"
          />
        </svg>
      );
    case 'zec_t':
    case 'zec_z':
      return (
        <svg {...common}>
          {ring}
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="10"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fill="currentColor"
          >
            Z
          </text>
        </svg>
      );
    case 'xmr':
      return (
        <svg {...common}>
          {ring}
          <path
            d="M5 16V9l4 4 3-3 3 3 4-4v7h-3V13l-2 2-2-2-2 2-2-2v3H5z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

/** Short chain tickers for UI pills. */
export const CHAIN_TICKERS: Readonly<Record<Chain, string>> = {
  btc: 'BTC',
  eth: 'ETH',
  'usdc-eth': 'USDC',
  'usdc-base': 'USDC',
  sol: 'SOL',
  zec_t: 'ZEC',
  zec_z: 'ZEC-z',
  xmr: 'XMR',
};
