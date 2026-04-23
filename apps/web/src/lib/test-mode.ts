/**
 * Build-time flag for temp/demo deploys.
 *
 * When NEXT_PUBLIC_TEST_MODE=1 is set at build time, the UI renders a
 * persistent warning banner and disables donation CTAs / hides QR codes
 * so preview viewers can't accidentally send real funds to the
 * placeholder addresses in the demo snapshot.
 *
 * Default (unset) = production behavior, all donation UI fully active.
 */
export const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === '1';
