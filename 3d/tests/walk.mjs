// Walking test: opens the 3D world on an iPhone-size screen, drags the joystick with a finger,
// and checks that the character really moves. It catches bugs that throw no error, like the
// one where the walking code was hidden inside a comment and the character only moved its arms and legs.
//
// Run it with:  node 3d/tests/walk.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };

// a tiny file server for the repo, like GitHub Pages
const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  if (path === '' || path.endsWith('/')) path += 'index.html';
  try { const body = await readFile(join(ROOT, path)); res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/3d/index.html`;

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // offline runs: THREE_DIR=/path/to/three-package serves the 3D engine from disk instead of cdn.jsdelivr.net
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  // never send test runs to the real error list
  await page.route(/gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());

  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && window.__game.player, null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);

  const pos = () => page.evaluate(() => { const p = window.__game.player.pos; return { x: p.x, z: p.z }; });
  const start = await pos();

  // put a finger down on the left side of the screen and drag it down (walk toward the camera, away from the closet pad)
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  await touch('touchStart', [{ x: 100, y: 500 }]);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', [{ x: 100, y: 500 + i * 5 }]); await page.waitForTimeout(30); }
  await page.waitForTimeout(3000);
  const end = await pos();
  await touch('touchEnd', []);

  const moved = Math.hypot(end.x - start.x, end.z - start.z);
  console.log(`start (${start.x.toFixed(2)}, ${start.z.toFixed(2)}) → after walking (${end.x.toFixed(2)}, ${end.z.toFixed(2)}), moved ${moved.toFixed(2)}`);
  if (moved < 0.5) fail('The character did not walk when the joystick was dragged.');
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The character walks.');
} finally {
  await browser.close();
  server.close();
}
