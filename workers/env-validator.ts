import { z } from 'zod';

// Zod schema mirrors the Env interface from worker-configuration.d.ts.
// Use z.string().min(1) for required string vars, z.any() for CF bindings.
const EnvSchema = z.object({
  // String secrets / config vars
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  R2_PUBLIC_URL: z.string().url('R2_PUBLIC_URL must be a valid URL'),
  ENVIRONMENT: z.string().min(1, 'ENVIRONMENT is required'),

  // Cloudflare bindings — just verify they are truthy objects
  DB: z.any().refine(Boolean, { message: 'DB (D1 binding) is missing' }),
  STORAGE: z.any().refine(Boolean, { message: 'STORAGE (R2 binding) is missing' }),
});

// Module-level flag — persists across requests within the same isolate lifetime.
// Cloudflare reuses isolates for multiple requests, so we only need to validate once.
let validated = false;

/**
 * Validates all required environment variables and Cloudflare bindings.
 * Only runs once per isolate — subsequent requests are zero-cost.
 */
export function validateEnv(env: Cloudflare.Env): void {
  if (validated) return;

  const result = EnvSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');

    throw new Error(
      `[Worker] Environment validation failed:\n${errors}\n\nPlease set them in .dev.vars (local) or the Cloudflare dashboard (production).`,
    );
  }

  validated = true;
}
