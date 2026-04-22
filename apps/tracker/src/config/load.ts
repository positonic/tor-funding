/**
 * YAML config loader for `config/projects.yaml` and
 * `config/matching-pool.yaml` (repo root).
 *
 * Schemas are validated with zod. Malformed config fails loud and fast
 * — a bad YAML is never silently tolerated because it would mean
 * watching the wrong addresses, which is worse than not watching at all.
 *
 * Chain identifiers use the `Chain` union from `@tor/types`. A config
 * that references an unknown chain (e.g. a typo) will be rejected at
 * load time, not silently coerced.
 */

import { readFileSync } from 'node:fs';

import yaml from 'js-yaml';
import { z } from 'zod';

import { CHAINS } from '@tor/types';

// Build a zod enum from the @tor/types chain list so the two cannot
// drift. A config referencing an unknown chain fails validation.
const chainSchema = z.enum(CHAINS);
export type Chain = z.infer<typeof chainSchema>;

const verificationSchema = z.enum(['public', 'view_key']);

const baseAddressSchema = z
  .object({
    address: z.string().min(1),
    ticker: z.string().min(1),
    label: z.string().min(1),
    uri_scheme: z.string().optional(),
    verification: verificationSchema,
    btcpay_store_id: z.string().optional(),
    view_key_secret_ref: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.verification === 'view_key' && val.view_key_secret_ref === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'view_key_secret_ref is required when verification = view_key',
        path: ['view_key_secret_ref'],
      });
    }
  });

const projectAddressSchema = baseAddressSchema.and(
  z.object({ is_matching_eligible: z.boolean() })
);

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  short_desc: z.string().min(1),
  long_desc_md: z.string().min(1),
  order_index: z.number().int(),
  active: z.boolean(),
  matching_eligible_chains: z.array(chainSchema),
  // Partial record so projects can declare addresses on only the chains
  // they've onboarded.
  donation_addresses: z.record(chainSchema, projectAddressSchema),
});

export const projectsConfigSchema = z.object({
  version: z.literal(1),
  projects: z.array(projectSchema),
});

export const matchingPoolConfigSchema = z.object({
  version: z.literal(1),
  pool: z.object({
    name: z.string().min(1),
    custody_entity: z.string().min(1),
    addresses: z.record(chainSchema, baseAddressSchema),
  }),
});

export type ProjectConfig = z.infer<typeof projectSchema>;
export type ProjectsConfig = z.infer<typeof projectsConfigSchema>;
export type MatchingPoolConfig = z.infer<typeof matchingPoolConfigSchema>;
export type ProjectAddress = z.infer<typeof projectAddressSchema>;
export type PoolAddress = z.infer<typeof baseAddressSchema>;

function readYaml(path: string): unknown {
  const raw = readFileSync(path, 'utf8');
  return yaml.load(raw);
}

export function loadProjectsConfig(path: string): ProjectsConfig {
  const parsed = projectsConfigSchema.safeParse(readYaml(path));
  if (!parsed.success) {
    throw new Error(
      `invalid projects config at ${path}: ${parsed.error.toString()}`
    );
  }
  return parsed.data;
}

export function loadMatchingPoolConfig(path: string): MatchingPoolConfig {
  const parsed = matchingPoolConfigSchema.safeParse(readYaml(path));
  if (!parsed.success) {
    throw new Error(
      `invalid matching-pool config at ${path}: ${parsed.error.toString()}`
    );
  }
  return parsed.data;
}
