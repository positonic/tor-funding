/**
 * Clipboard helper. Wraps `navigator.clipboard.writeText` so components
 * don't have to branch on the `clipboard` API being undefined (older
 * Safari, Tor Browser's default permissions in some configs).
 *
 * Returns `true` if the write succeeded, `false` otherwise. Callers can
 * surface a fallback ("Select & copy manually") when it fails.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
