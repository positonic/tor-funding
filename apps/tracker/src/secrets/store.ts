/**
 * Secret store interface (spec §14.1 / §17.3 task 22).
 *
 * View keys are referenced in config YAML by opaque `vault://...` strings,
 * never by value (spec §10.2). At startup, the tracker resolves every ref
 * present in loaded config, keeps the value in memory, and NEVER logs it.
 *
 * Two implementations:
 *  1. `EnvSecretStore` (local dev) — reads from `process.env`, mapping
 *     `vault://kv/tor-campaign/xmr/anti-censorship/view_key` to
 *     `TOR_SECRETS_XMR_ANTI_CENSORSHIP_VIEW_KEY`.
 *  2. A TPA-secret-store implementation (§17.1 task 8) lands later and
 *     plugs into the same `SecretStore` interface.
 *
 * Operational rules (CLAUDE.md contract §3 + spec §10):
 *  - Call `resolveAllAtStartup(refs)` once, with every ref in config,
 *    before any watcher starts. Fails loud if any ref is missing.
 *  - NEVER pass the value anywhere it could be logged. The pino redaction
 *    list in `src/logger.ts` is a belt-and-braces safety net.
 *  - Values live only in process memory. No caching to disk, no echoing
 *    to admin endpoints.
 */

import { logger } from '../logger.js';

export interface SecretStore {
  /**
   * Resolve a single secret by its `vault://...` reference.
   * Throws if the ref is unknown.
   *
   * Prefer batched resolution via `resolveAllAtStartup` so a misconfigured
   * ref is caught at process boot, not at the first donation.
   */
  getSecret(ref: string): string;

  /**
   * Resolve every ref provided and cache the values in memory. Intended
   * for startup — after this returns, `getSecret(ref)` is guaranteed
   * not to throw for any ref in `refs`.
   */
  resolveAllAtStartup(refs: readonly string[]): void;
}

// ---------------------------------------------------------------------------
// Local-dev implementation: `process.env`-backed.
// ---------------------------------------------------------------------------

/**
 * Maps a `vault://kv/tor-campaign/<path>` ref to an env var name.
 *
 * Example:
 *   vault://kv/tor-campaign/xmr/anti-censorship/view_key
 *     → TOR_SECRETS_XMR_ANTI_CENSORSHIP_VIEW_KEY
 *
 * Non-conforming refs raise at validation time rather than silently
 * mis-resolving.
 */
export function refToEnvVarName(ref: string): string {
  const prefix = 'vault://kv/tor-campaign/';
  if (!ref.startsWith(prefix)) {
    throw new Error(
      `unsupported secret ref format: ${ref} (expected "${prefix}..." for local-dev EnvSecretStore)`
    );
  }
  const path = ref.slice(prefix.length);
  const normalized = path
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();
  return `TOR_SECRETS_${normalized}`;
}

export class EnvSecretStore implements SecretStore {
  private readonly cache = new Map<string, string>();

  resolveAllAtStartup(refs: readonly string[]): void {
    const missing: string[] = [];
    for (const ref of refs) {
      try {
        const envVar = refToEnvVarName(ref);
        const value = process.env[envVar];
        if (value === undefined || value === '') {
          missing.push(`${ref} (expected env var ${envVar})`);
          continue;
        }
        this.cache.set(ref, value);
      } catch (err) {
        missing.push(`${ref} (${(err as Error).message})`);
      }
    }

    // Log *only* the ref strings, never values.
    logger.info(
      { ref_count: this.cache.size, missing_count: missing.length },
      'secrets resolved'
    );

    if (missing.length > 0) {
      throw new Error(
        `${missing.length} secret ref(s) could not be resolved from environment: ${missing.join('; ')}`
      );
    }
  }

  getSecret(ref: string): string {
    const value = this.cache.get(ref);
    if (value === undefined) {
      throw new Error(
        `secret not resolved: ${ref} (call resolveAllAtStartup first)`
      );
    }
    return value;
  }
}

// ---------------------------------------------------------------------------
// Factory — picks implementation based on env.
// ---------------------------------------------------------------------------

/**
 * Build the default secret store for the current environment.
 *
 * v0: always returns `EnvSecretStore`. When the TPA-secret-store
 * implementation lands (§17.1 task 8) it will switch on an env var.
 */
export function createSecretStore(): SecretStore {
  return new EnvSecretStore();
}
