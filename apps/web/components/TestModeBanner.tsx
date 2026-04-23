import { TEST_MODE } from '@/lib/test-mode';

/**
 * Persistent site-wide banner shown only when NEXT_PUBLIC_TEST_MODE=1.
 *
 * Warns preview viewers that the snapshot is demo data and the addresses
 * rendered throughout the site are placeholders — paired with QR/action
 * suppression inside <DonationPanel>.
 */
export function TestModeBanner() {
  if (!TEST_MODE) return null;
  return (
    <div
      role="alert"
      className="sticky top-0 z-50 w-full bg-danger text-white border-b border-danger-fg px-panel py-2 text-caption text-center"
    >
      <strong className="uppercase tracking-wider font-mono">Test mode</strong>
      <span className="mx-2">·</span>
      Preview using demo data. Addresses shown are placeholders —{' '}
      <strong>do not send funds.</strong>
    </div>
  );
}
