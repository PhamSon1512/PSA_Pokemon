import { createRequestHandler } from 'react-router';
import { validateEnv } from './env-validator';

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Cloudflare.Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE);

export default {
  async fetch(request, env, ctx) {
    // Validate all required env vars / bindings before handling any request
    validateEnv(env);

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Cloudflare.Env>;
