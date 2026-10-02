import { defineConfig } from 'vitest/config';

/**
 * Root vitest config — Vitest 4.
 *
 * Two isolated test projects:
 *   unit        → Node.js (forks pool), no CF bindings
 *   integration → Cloudflare Workers sandbox (D1/KV/R2 via wrangler.jsonc)
 *
 * NOTE: test.workspace was removed in Vitest 4. Use test.projects instead.
 * See: https://vitest.dev/guide/projects
 */
export default defineConfig({
  test: {
    projects: ['./vitest.unit.config.ts', './vitest.integration.config.ts'],
  },
});
