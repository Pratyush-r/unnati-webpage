// QA helper: gzipped JS per built page (external module scripts + their static imports + inline scripts).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = 'dist';
const pages = [];
const walk = (d) =>
  readdirSync(d).forEach((f) => {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  });
walk(dist);

function collect(file, acc) {
  if (acc.has(file)) return;
  acc.add(file);
  const src = readFileSync(join(dist, file), 'utf8');
  for (const m of src.matchAll(/(?:import|from)\s*["'](\.{0,2}\/[^"']+\.js)["']/g)) {
    const spec = m[1];
    const rel = spec.startsWith('/') ? spec.slice(1) : posix.join(posix.dirname(file), spec);
    collect(rel, acc);
  }
}

const rows = [];
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const files = new Set();
  for (const m of html.matchAll(/<script[^>]*src="\/([^"]+\.js)"/g)) collect(m[1], files);
  let raw = '';
  for (const f of files) raw += readFileSync(join(dist, f), 'utf8');
  for (const m of html.matchAll(/<script(?![^>]*src=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) raw += m[1];
  const name = '/' + page.split(/[\\/]/).slice(1).join('/').replace(/index\.html$/, '');
  rows.push([name, (gzipSync(raw).length / 1024).toFixed(1)]);
}
rows.sort((a, b) => a[0].localeCompare(b[0]));
for (const [p, kb] of rows) console.log(`${kb.padStart(6)} KB  ${p}`);
