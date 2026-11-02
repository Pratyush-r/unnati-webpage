// Serves the payment API (src/lib/payments/http.ts) on your computer:
//   npm run dev      mounted on the dev server
//   npm run preview  run on a side port, with /api/payments proxied to it (Astro's static preview
//                    server doesn't take middleware)
// In production Netlify runs the same handler as a function (netlify/functions/payments.mts).
import { createServer as createHttpServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const HANDLER = '/src/lib/payments/http.ts';
const PREFIX = '/api/payments';

/** Node req/res ↔ the standard Request/Response the handler speaks. */
function nodeHandler(load) {
  return async (req, res, next) => {
    if (!req.url?.startsWith(PREFIX)) return next?.();
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
      const request = new Request(`http://${host}${req.url}`, {
        method: req.method,
        headers: Object.entries(req.headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : v == null ? [] : [[k, v]])),
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
      });
      const { handlePaymentsRequest } = await load();
      const response = await handlePaymentsRequest(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      console.error('[payments] local API error', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Payment API error.' }));
    }
  };
}

export default function paymentsApi() {
  return {
    name: 'unnati:payments-api',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(nodeHandler(() => server.ssrLoadModule(HANDLER)));
      },
      'astro:config:setup': async ({ command, config, updateConfig }) => {
        if (command !== 'preview') return;
        const vite = await createViteServer({
          configFile: false, root: fileURLToPath(config.root),
          server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error',
        });
        const api = createHttpServer(nodeHandler(() => vite.ssrLoadModule(HANDLER)));
        await new Promise((resolve) => api.listen(0, '127.0.0.1', resolve));
        const target = `http://127.0.0.1:${api.address().port}`;
        updateConfig({ vite: { preview: { proxy: { [PREFIX]: { target, xfwd: true } } } } });
      },
    },
  };
}
