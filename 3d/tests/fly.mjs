// Flying test: on an iPhone-size screen, hops on the pterodactyl, taps 🪽 FLY, flies over the trees toward the edge of the island,
// and taps 🛬 Land. It checks she really gets up above the treetops, stays over the island, and comes back down to the ground.
//
// Run it with:  node 3d/tests/fly.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// SHOTS=some/folder saves a picture at each step.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  if (path === '' || path.endsWith('/')) path += 'index.html';
  try { const body = await readFile(join(ROOT, path)); res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/3d/index.html`;

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const SHOTS = process.env.SHOTS;
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  await page.route(/gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());
  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);
  // Test computers have no graphics card and draw about one picture a second, so the world isn't drawn while the test runs
  // (everything else runs as normal) and the steps below count game time, not clock time. SHOTS draws it again for each picture.
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const gameT = () => page.evaluate(() => window.__game.fly().t);
  const waitGame = async (sec, until = () => false) => { const t0 = await gameT(), end = Date.now() + 180_000;
    while (Date.now() < end) { await page.waitForTimeout(250); const s = await state(); if ((await gameT()) - t0 >= sec || until(s)) return s; } return state(); };
  const state = () => page.evaluate(() => { const G = window.__game, p = G.player.pos, F = G.fly();
    return { x: p.x, y: p.y, z: p.z, on: F.on, mode: F.mode, floor: G.flyFloor(p.x, p.z, 0), jump: document.querySelector('#jump').textContent, ride: !!G.ride() }; });

  // get Sunny the pterodactyl and hop on (walk a few steps away from the closet pad first)
  await page.evaluate(() => { const G = window.__game; G.player.pos.set(6, 0, 12); G.getMount('ptero'); });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__game.callSteed('ptero'));
  await page.waitForTimeout(1200);
  let s = await state();
  if (!s.ride) fail('Could not hop on the pterodactyl.');
  if (!s.jump.includes('FLY')) fail(`The jump button should say FLY on a flying ride, it says "${s.jump}".`);
  await shot('1-on-the-ground');

  // tap 🪽 FLY
  const jb = await page.locator('#jump').boundingBox();
  await page.touchscreen.tap(jb.x + jb.width / 2, jb.y + jb.height / 2);
  await page.waitForTimeout(300);
  await shot('2-takeoff');
  s = await waitGame(5);
  console.log(`after take-off: height ${s.y.toFixed(1)} (mode ${s.mode})`);
  if (!s.on) fail('Tapping FLY did not take off.');
  if (s.y < 8) fail(`She should be up above the trees after 5 seconds, but she is only ${s.y.toFixed(1)} high.`);
  await shot('3-above-the-trees');

  // fly toward the edge of the island with the joystick for a while
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  await touch('touchStart', [{ x: 100, y: 600 }]);
  for (let i = 1; i <= 10; i++) { await touch('touchMove', [{ x: 100 + i * 4, y: 600 - i * 6 }]); await page.waitForTimeout(30); }
  await waitGame(1.5);
  await shot('4-banking');
  let far = 0;
  for (let i = 0; i < 24; i++) { s = await waitGame(.5); far = Math.max(far, Math.hypot(s.x, s.z)); if (s.y < s.floor - .2) fail(`She went into something at (${s.x.toFixed(1)}, ${s.z.toFixed(1)}).`); }
  await shot('5-cruising');
  await touch('touchEnd', []);
  const R = await page.evaluate(() => window.__game.R);
  console.log(`flew as far as ${far.toFixed(1)} from the middle (the island is ${R} across from the middle)`);
  if (far > R - 3) fail('She flew off the island.');
  if (far < 20) fail('She did not fly anywhere.');

  // tap 🛬 Land
  await page.evaluate(() => document.querySelector('#rideBtn').click());
  await waitGame(1);
  await shot('6-landing');
  s = await waitGame(30, s => !s.on);
  console.log(`landed at (${s.x.toFixed(1)}, ${s.z.toFixed(1)}), height ${s.y.toFixed(2)}`);
  if (s.on) fail('She did not land.');
  if (s.y > .3) fail(`After landing she should be on the ground, not ${s.y.toFixed(2)} up.`);
  if (!s.ride) fail('Landing should keep you on her back.');
  await page.waitForTimeout(800);
  await shot('7-landed');
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The pterodactyl flies over the trees and lands.');
} finally {
  await browser.close();
  server.close();
}
