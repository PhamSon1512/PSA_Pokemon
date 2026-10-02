import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

// Auto-discover all *.openapi.ts files in the openapi/ directory
// Each module must export default: RouteConfig[] (created via createRoute from @hono/zod-openapi)
const modules = import.meta.glob<{ default: Parameters<OpenAPIRegistry['registerPath']>[0][] }>('../../openapi/*.openapi.ts', {
  eager: true,
});

function buildSpec() {
  const registry = new OpenAPIRegistry();

  // ── Security scheme ────────────────────────────────────────────────────────
  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  // ── Health (inline — no separate openapi file needed) ──────────────────────
  registry.registerPath({
    method: 'get',
    path: '/api/health',
    tags: ['Health'],
    summary: 'Health check',
    security: [],
    responses: { 200: { description: 'Service is healthy' } },
  });

  // ── Auto-register routes from all openapi/*.openapi.ts ─────────────────────
  for (const mod of Object.values(modules)) {
    for (const route of mod.default) {
      registry.registerPath(route);
    }
  }

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated from Drizzle models via drizzle-zod.',
    },
    servers: [{ url: '/', description: 'Current Environment' }],
    security: [{ bearerAuth: [] }],
  });
}

// GET /api/openapi — return raw OpenAPI spec JSON (no response wrapper)
export async function loader() {
  const spec = buildSpec();

  return new Response(JSON.stringify(spec), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
