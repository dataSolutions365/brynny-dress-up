// Jump Park test: stands on a trampoline and checks you bounce on your own, that tapping Jump bounces you higher and does
// flips, that bouncing under a hoop is a slam dunk, and that jumping into the foam pit sinks you in and throws the cubes.
//
// Run it with:  node 3d/tests/jump-park.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// SHOTS=/some/folder also saves pictures.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SHOTS = process.env.SHOTS;
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

  // Test computers draw about one picture a second, so the world isn't drawn while the test runs and the steps count game time.
  await page.evaluate(() => { const G = window.__game, r = G.renderer; r.__draw = r.render; r.render = () => {};
    window.__jt = { t: 0, top: -9, low: 9, tap: false, tapT: 0 };
    G.onTick.push(dt => { const J = window.__jt, y = G.player.pos.y; J.t += dt; J.top = Math.max(J.top, y); J.low = Math.min(J.low, y);
      // tap Jump about every 0.15 s of game time
      if (J.tap && (J.tapT -= dt) <= 0) { J.tapT = .15; dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' })); dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' })); } }); });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const play = async sec => { const t0 = await page.evaluate(() => window.__jt.t), end = Date.now() + 180_000;
    while (Date.now() < end) { await page.waitForTimeout(250); if (await page.evaluate(() => window.__jt.t) - t0 >= sec) break; } };
  // put the player at a spot in the park (local: x across, z toward the front), reset the high/low marks
  const goTo = (lx, lz, y, tap) => page.evaluate(([lx, lz, y, tap]) => { const G = window.__game, z = G.Z.jump, [x, w] = z.toWorld(lx, lz);
    G.player.pos.set(x, y, w); G.player.vy = 0; G.player.face = z.rot + Math.PI; G.cam.yaw = z.rot; Object.assign(window.__jt, { top: -9, low: 9, tap }); }, [lx, lz, y, tap]);
  const st = () => page.evaluate(() => ({ ...window.__game.jumpPark(), top: window.__jt.top, low: window.__jt.low }));

  // 1. a trampoline in the middle of the grid: you start bouncing by yourself
  const mat = await page.evaluate(() => { const T = window.__game.JP.mats.find(m => m.kind === 'mat' && Math.abs(m.cx + 1.07) < .1 && Math.abs(m.cz + .17) < .1); return T && [T.cx, T.cz]; });
  if (!mat) throw new Error('No trampoline in the middle of the grid');
  await goTo(mat[0], mat[1], 1, false); await play(1.0); await page.evaluate(() => { window.__jt.top = -9; }); await play(2.5);
  let s = await st();
  console.log(`bouncing on your own: highest ${s.top.toFixed(2)}`);
  if (!s.on || s.top < .7) fail('Standing on a trampoline did not bounce you.');
  if (s.top > 1.6) fail('Bouncing without tapping Jump went too high.');

  // 2. tap Jump: higher and higher, with flips at the top
  await goTo(mat[0], mat[1], 1, true); await play(6);
  s = await st();
  console.log(`tapping Jump: highest ${s.top.toFixed(2)}, flips ${s.save.flips}, best ${s.save.best} m`);
  await shot('jump-park-flip');
  if (s.top < 3) fail('Tapping Jump on a trampoline did not bounce you higher.');
  if (s.top > 5) fail('Bounced so high you would hit the lights.');
  if (!(s.save.flips >= 1)) fail('Big bounces did not do a flip.');

  // 3. the slam-dunk trampoline right under a hoop
  const hoop = await page.evaluate(() => { const h = window.__game.JP.hoops[0]; return [h.x, h.z + .55]; });
  await goTo(hoop[0], hoop[1], 1, true); await play(5);
  s = await st();
  console.log(`under the hoop: dunks ${s.save.dunks}`);
  if (!(s.save.dunks >= 1)) fail('Bouncing under the hoop was never a slam dunk.');

  // 4. drop into the foam pit
  const pit = await page.evaluate(() => { const P = window.__game.JP.pit; return [(P.x0 + P.x1) / 2, (P.z0 + P.z1) / 2 + .4]; });
  await goTo(pit[0], pit[1], 3, false); await play(.9);
  s = await st();
  console.log(`foam pit: sank to ${s.low.toFixed(2)}, cubes flying ${s.pitLive}`);
  await shot('jump-park-pit');
  if (s.low > -.2) fail('Landing in the foam pit did not sink you into the cubes.');
  if (s.pitLive < 5) fail('Landing in the foam pit did not throw the cubes.');
  if (s.on) fail('Still bouncing in the foam pit.');

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The Jump Park bounces, flips, dunks and splashes.');
} finally {
  await browser.close();
  server.close();
}
