// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (env.SITE_URL || process.env.SITE_URL || 'https://unnati-montessori.netlify.app').replace(/\/$/, '');

export default defineConfig({
  site,
  output: 'static',
  // QA only: tests/round2-content.spec.ts rebuilds into a scratch folder so dist/ stays untouched.
  outDir: process.env.ASTRO_OUT_DIR || './dist',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  image: { responsiveStyles: false },
  vite: { envPrefix: ['PUBLIC_', 'SITE_URL'] },
});
