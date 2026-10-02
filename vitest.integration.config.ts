import { resolve } from 'path';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

/**
 * Integration test project — runs in Cloudflare Workers sandbox.
 * Tests use cloudflare:test env (D1, KV, R2 bindings via wrangler.jsonc).
 */
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
    },
  },
  test: {
    name: 'integration',
    include: ['app/.server/__tests__/auth.service.test.ts', 'app/.server/__tests__/rbac.service.test.ts'],
  },
});
