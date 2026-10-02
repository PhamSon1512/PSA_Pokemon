// GET /api/docs — serve interactive Swagger UI
export async function loader() {
  // Pin exact version + SRI integrity to prevent CDN supply-chain attacks
  const SWAGGER_VERSION = '5.21.0';
  const CDN_BASE = `https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Docs</title>
    <link rel="stylesheet" href="${CDN_BASE}/swagger-ui.css" />
    <style>
      body { margin: 0; }
      #swagger-ui { max-width: 1280px; margin: 0 auto; padding: 24px 16px; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${CDN_BASE}/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: '/api/openapi',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: 'BaseLayout',
        });
      };
    </script>
  </body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
