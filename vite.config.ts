import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: 'ssr' }, remoteBindings: true }),
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
  ssr: {
    noExternal: ['@base-ui/react'],
  },
});
