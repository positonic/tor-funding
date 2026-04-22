/**
 * Build a wallet deep-link for a given (chain, address) pair when the
 * chain has a widely-interoperable URI scheme. Returns null when no
 * deep-link is appropriate — callers should then hide the secondary
 * "Open in wallet" button rather than show a broken one.
 *
 * References:
 *   - Bitcoin: BIP-21 (`bitcoin:` scheme)
 *   - Ethereum / USDC on EVM: EIP-681 (`ethereum:` scheme)
 *   - Solana: `solana:` scheme (Solana Pay spec)
 *   - Zcash: no widely-adopted URI scheme for either t- or z-addresses
 *   - Monero: `monero:` exists but wallet support is inconsistent, and
 *             the QR code is the dominant handoff path — skip for v1.
 */
import type { Chain, WalletDeepLink } from '@tor/types';

export function buildWalletDeepLink(
  chain: Chain,
  address: string,
): WalletDeepLink | null {
  switch (chain) {
    case 'btc':
      return { walletName: 'Bitcoin wallet', href: `bitcoin:${address}` };

    case 'eth':
    case 'usdc-eth':
    case 'usdc-base':
      // MetaMask, Rainbow, Coinbase Wallet all handle `ethereum:`.
      return { walletName: 'Ethereum wallet', href: `ethereum:${address}` };

    case 'sol':
      // Phantom and Solflare handle Solana Pay URIs.
      return { walletName: 'Solana wallet', href: `solana:${address}` };

    case 'zec_t':
    case 'zec_z':
    case 'xmr':
      return null;
  }
}
