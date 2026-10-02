import type { Config } from '@react-router/dev/config';

export default {
  ssr: true,
  future: {
    unstable_optimizeDeps: true,
    unstable_subResourceIntegrity: false,
    unstable_trailingSlashAwareDataRequests: true,
    v8_middleware: false,
    v8_viteEnvironmentApi: true,
    v8_splitRouteModules: false,
  },
} satisfies Config;
