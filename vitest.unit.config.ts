import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * Unit test project — runs in Node.js (forks pool).
 * No Cloudflare bindings (cloudflare:test / D1 / KV / R2).
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
    },
  },
  test: {
    name: 'unit',
    environment: 'node',
    include: [
      'app/.server/__tests__/errors.test.ts',
      'app/.server/__tests__/password.test.ts',
      'app/.server/__tests__/user-mapper.test.ts',
      'app/.server/__tests__/helpers.service.test.ts',
      'app/lib/__tests__/**/*.test.ts',
    ],
  },
});
