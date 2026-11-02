// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import paymentsApi from './src/integrations/payments-api.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
// Payment settings (PAYMENT_*) from .env, for the payment API and the build. Real env vars win.
for (const [key, value] of Object.entries(env)) if (key.startsWith('PAYMENT_') && process.env[key] === undefined) process.env[key] = value;
const site = (env.SITE_URL || process.env.SITE_URL || 'https://unnati-montessori.netlify.app').replace(/\/$/, '');

export default defineConfig({
  site,
  output: 'static',
  // QA only: tests/round2-content.spec.ts rebuilds into a scratch folder so dist/ stays untouched.
  outDir: process.env.ASTRO_OUT_DIR || './dist',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // paymentsApi serves /api/payments locally; in production it's netlify/functions/payments.mts.
  integrations: [paymentsApi(), sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/pay/') })],
  image: { responsiveStyles: false },
  vite: { envPrefix: ['PUBLIC_', 'SITE_URL'] },
});
