// 🗺️ The big world (3d/src/26z-big-world.js): the land past the canal is there, blocked off until we build on it.
// Checks you can't get into a blocked-off region, open places over there (Lookout Mountain) stay flat and walkable,
// the fence goes round the open land and not through it, and the map zooms out to show the whole world.
//
// Run it with:  node 3d/tests/big-world.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  await page.waitForFunction(() => window.__game && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);

  // the world reaches far past the canal, with every region named
  const info = await page.evaluate(() => { const g = window.__game; return { W: g.WORLD, n: g.REGIONS.length, R: g.REGIONS.map(r => r.name) }; });
  console.log(`world: land from ${info.W.in.toFixed(0)} out to ${info.W.out.toFixed(0)}, ${info.n} blocked-off regions: ${info.R.join(', ')}`);
  if (info.W.out - info.W.in < 80) fail('The world past the canal is not much bigger.');
  if (info.n < 4) fail('There should be several blocked-off regions.');

  // you can't swim up and walk into a blocked-off region: you stay in the water in front of it
  for (const g of await page.evaluate(() => window.__game.REGIONS.map(r => ({ id: r.id, ang: r.ang })))) {
    const ok = await page.evaluate(ang => { const G = window.__game, W = G.WORLD;
      // the middle of the region, unless an open place is there: start out in the canal, facing the far bank
      for (let t = 0; t < 30; t++) { const A = ang + (t % 2 ? -1 : 1) * t * 2, a = A * Math.PI / 180, x = Math.sin(a) * (W.in + 15), z = Math.cos(a) * (W.in + 15);
        if (G.openLandAt(x, z, 8)) continue;
        const r = W.in - 21; G.player.pos.set(Math.sin(a) * r, 0, Math.cos(a) * r); G.player.vy = 0; G.cam.yaw = a + Math.PI; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; G.keys.ArrowUp = true; return true; } return false; }, g.ang);
    if (!ok) { fail(`Couldn't find a blocked-off spot in ${g.id}.`); continue; }
    await page.waitForTimeout(3500);
    const d = await page.evaluate(() => { const G = window.__game, p = G.player.pos; G.keys.ArrowUp = false; return Math.hypot(p.x, p.z); });
    console.log(`${g.id}: swam toward it and stopped ${d.toFixed(1)} out (the far bank starts at ${(info.W.in - 17).toFixed(0)})`);
    if (d > info.W.in - 16) fail(`You could walk out of the canal into the blocked-off ${g.id} region.`);
  }

  // open land over there stays flat, and the fence never runs through it
  const open = await page.evaluate(() => { const G = window.__game, out = [];
    for (const L of G.BANK_LAND) { const a = (L.a0 + L.a1) / 2 * Math.PI / 180, r = Math.min(L.out - 2, G.WORLD.in + 4);
      out.push({ id: L.id || `${L.a0}-${L.a1}`, h: G.worldH(Math.sin(a) * r, Math.cos(a) * r) }); }
    const bad = G.WFENCE.filter(([x, z]) => G.openLandAt(x, z, -1.5)).length;
    return { out, bad, posts: G.WFENCE.length }; });
  for (const o of open.out) { console.log(`open land ${o.id}: ground height ${o.h.toFixed(2)}`); if (Math.abs(o.h) > .05) fail(`The ground on open land ${o.id} isn't flat.`); }
  console.log(`fence: ${open.posts} posts, ${open.bad} inside open land`);
  if (open.posts < 100) fail('The fence round the blocked-off land is missing.');
  if (open.bad) fail('The fence runs through open land.');

  // Lookout Mountain's land is still walkable
  const adv = await page.evaluate(() => { const G = window.__game, L = G.BANK_LAND.find(l => l.id === 'adv' || l.a0 === 92) || G.BANK_LAND[0];
    const a = (L.a0 + L.a1) / 2 * Math.PI / 180, r = G.WORLD.in - 4; G.player.pos.set(Math.sin(a) * r, 0, Math.cos(a) * r); return r; });
  await page.waitForTimeout(400);
  const advD = await page.evaluate(() => { const p = window.__game.player.pos; return Math.hypot(p.x, p.z); });
  console.log(`open land: put down ${adv.toFixed(1)} out, still ${advD.toFixed(1)} out`);
  if (Math.abs(advD - adv) > 1) fail('You got pushed off the open land on the far bank.');

  // the map opens on the island, and zooms out once more to the whole world
  const m = await page.evaluate(() => { const G = window.__game; G.player.pos.set(0, 0, 8); G.openMap(); const a = document.querySelector('#mapOut').disabled;
    document.querySelector('#mapOut').click(); const b = document.querySelector('#mapOut').disabled; G.closeMap(); return { a, b }; });
  if (m.a || !m.b) fail(`The map should open on the island with ➖ to zoom out to the whole world (zoom out ${m.a ? 'off' : 'on'} at first, ${m.b ? 'off' : 'on'} after).`);
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The big world is there and blocked off, open land works, and the map shows it all.');
} finally {
  await browser.close();
  server.close();
}
