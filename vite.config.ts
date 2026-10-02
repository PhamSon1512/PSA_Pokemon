import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  ssr: {
    optimizeDeps: {
      noDiscovery: true,
      include: [
        'embla-carousel-react',
        'embla-carousel',
        'vanilla-lazyload',
        'vaul',
        'js.foresight',
        'clsx',
        'tailwind-merge',
        'query-string',
        'framer-motion',
        'motion',
        'sonner',
        'lucide-react',
        'nanoid',
        'ramda',
        'ramda-adjunct',
        'valtio',
        'usehooks-ts',
        'use-stick-to-bottom',
        'react-resizable-panels',
        'class-variance-authority',
        'cmdk',
        '@radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-collapsible',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-hover-card',
        '@radix-ui/react-label',
        '@radix-ui/react-progress',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-slot',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-use-controllable-state',
        '@xyflow/react',
        'ai',
        'shiki',
        'streamdown',
        'tokenlens',
        'xior',
        'js-cookie',
        'nprogress',
      ],
    },
  },
  plugins: [
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    reactRouter(),
    tsconfigPaths(),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        icon: false,
        memo: true,
        expandProps: 'end',
        svgoConfig: {
          floatPrecision: 2,
          plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
        },
      },
      include: '**/*.svg?react',
    }),
  ],
  optimizeDeps: {
    exclude: ['@cloudflare/vite-plugin'],
  },
});
