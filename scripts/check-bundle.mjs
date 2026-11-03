import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const html = await readFile('dist/index.html', 'utf8');
const assets = [...html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))"/g)]
  .map((match) => match[1])
  .filter((path) => path.includes('/assets/'))
  .map((path) => `dist/assets/${path.split('/').at(-1)}`);
let total = 0;
for (const path of assets) {
  const bytes = gzipSync(await readFile(path)).length;
  total += bytes;
  console.log(`${path}: ${(bytes / 1024).toFixed(1)} KiB gzip`);
}
if (!assets.some((path) => path.endsWith('.js')))
  throw new Error('No initial JavaScript entry was found.');
console.log(`Initial JS + CSS: ${(total / 1024).toFixed(1)} KiB gzip (budget: 40 KiB)`);
if (total > 40 * 1024) throw new Error('Initial asset budget exceeded.');
const entries = await readdir('dist/assets');
if (
  !entries.some((name) => name.startsWith('ArrangeCanvas-')) ||
  !entries.some((name) => name.startsWith('CustomizePanel-'))
)
  throw new Error('Settings and drag support must remain separate chunks.');
