// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const site = (env.SITE_URL || process.env.SITE_URL || 'https://unnati-montessori.netlify.app').replace(/\/$/, '');

export default defineConfig({
  site,
  output: 'static',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  image: { responsiveStyles: false },
  vite: { envPrefix: ['PUBLIC_', 'SITE_URL'] },
});
