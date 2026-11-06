// 🐶🏊 Pets swim test (3d/src/26f3-pet-swim.js), on an iPhone-size screen: your pet follows you into the 🌊 canal and the
// 💦 waterpark's lazy river and swims next to you (body down in the water, head above it, paddling) instead of walking on
// top of the water, and walks normally again once you're both back on land.
//
// Run it with:  node 3d/tests/pet-swim.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  // Test computers have no graphics card, so the world isn't drawn while the test runs (everything else runs as normal).
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  // adopt Apollo the chihuahua
  await page.evaluate(() => { const G = window.__game, pt = G.PETS.find(p => p.name === 'Apollo'); G.PETS.forEach(p => { p.owned = false; }); pt.owned = true; pt.setTag(); });
  const pet = () => page.evaluate(() => { const G = window.__game, pt = G.PETS.find(p => p.owned), P = G.player.pos, w = G.petWater(pt.pos.x, pt.pos.z, pt.pos.y);
    // the top of the pet's back and its head, in the world
    pt.g.updateWorldMatrix(true, true);// the world isn't drawn during the test, so bring the positions up to date first
    const box = new G.THREE.Box3().setFromObject(pt.head), torsoY = pt.torso.getWorldPosition(new G.THREE.Vector3()).y;
    return { d: Math.hypot(pt.pos.x - P.x, pt.pos.z - P.z), r: Math.hypot(pt.pos.x, pt.pos.z), k: pt.swim ? pt.swim.k : 0, top: w.top, wet: w.k,
      y: pt.g.position.y, headTop: box.max.y, torsoY, legs: pt.legs.map(l => l.lg.rotation.x) }; });
  const face = f => page.evaluate(f => { const G = window.__game; G.player.face = f; G.cam.yaw = f + Math.PI; G.cam.cy = G.cam.yaw; }, f);
  const C = await page.evaluate(() => window.__game.CANAL);

  // 1. swim out into the canal: the pet comes too and swims beside you
  const a = 1.1, rr = C.inR - 3;
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [Math.sin(a) * rr, Math.cos(a) * rr]);
  await face(a); await page.waitForTimeout(2500);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(3000); await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(2500);
  let p = await pet();
  console.log(`canal: pet ${p.d.toFixed(2)} from you, ${p.r.toFixed(1)} out (water from ${C.inR.toFixed(1)}), deep ${p.k.toFixed(2)}, body ${p.torsoY.toFixed(2)}, head top ${p.headTop.toFixed(2)}, water ${p.top}`);
  if (p.d > 2) fail(`Your pet should swim out next to you (it is ${p.d.toFixed(1)} away).`);
  if (p.k < .8) fail(`Out in the canal your pet should be swimming (deep ${p.k.toFixed(2)}).`);
  if (p.torsoY > p.top + .05) fail(`A swimming pet's body should be down in the water, not walking on it (body at ${p.torsoY.toFixed(2)}, water at ${p.top}).`);
  if (p.headTop < p.top + .05) fail(`A swimming pet should keep its head above the water (head top at ${p.headTop.toFixed(2)}, water at ${p.top}).`);
  // it paddles while you swim along
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(300);
  const l0 = (await pet()).legs; await page.waitForTimeout(250); const l1 = (await pet()).legs;
  await page.keyboard.up('ArrowLeft');
  if (!l0.some((v, i) => Math.abs(v - l1[i]) > .05)) fail('A swimming pet should paddle its legs.');
  await shot('1-canal');

  // 2. a long swim away: it catches up in the water, not on the sand
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [Math.sin(a + .6) * (C.inR + 6), Math.cos(a + .6) * (C.inR + 6)]);
  await page.waitForTimeout(2500); p = await pet();
  if (p.d > 2 || p.k < .8) fail(`After a long swim your pet should be swimming next to you again (${p.d.toFixed(1)} away, deep ${p.k.toFixed(2)}).`);

  // 3. back on land: the pet climbs out and walks normally
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [Math.sin(a) * (C.inR - 6), Math.cos(a) * (C.inR - 6)]);
  await page.waitForTimeout(4000); p = await pet();
  console.log(`back on land: pet ${p.d.toFixed(2)} from you, deep ${p.k.toFixed(2)}, at ${p.y.toFixed(2)}`);
  if (p.d > 2 || p.k > .05 || p.y < -.05) fail(`Back on land your pet should walk next to you, not swim (${p.d.toFixed(1)} away, deep ${p.k.toFixed(2)}, at ${p.y.toFixed(2)}).`);

  // 4. 💦 in a tube on the waterpark's lazy river: the pet swims along beside the tube
  const goLocal = (lx, lz) => page.evaluate(([lx, lz]) => { const G = window.__game, [x, z] = G.waterpark.WPZ.toWorld(lx, lz); G.player.pos.set(x, 0, z); G.player.vy = 0; }, [lx, lz]);
  await goLocal(0, -2); await page.waitForTimeout(2500);
  await goLocal(0, -4.4);
  for (let i = 0; i < 40 && !(await page.evaluate(() => !!window.__game.waterpark.WP.ride)); i++) await page.waitForTimeout(250);
  await page.keyboard.down('KeyW'); await page.waitForTimeout(4000);
  p = await pet();
  console.log(`lazy river: pet ${p.d.toFixed(2)} from you, deep ${p.k.toFixed(2)}, body ${p.torsoY.toFixed(2)}, head top ${p.headTop.toFixed(2)}, water ${p.top}`);
  await shot('2-lazy-river');
  await page.keyboard.up('KeyW');
  if (p.d > 2.5) fail(`Your pet should swim along next to your tube (it is ${p.d.toFixed(1)} away).`);
  if (p.k < .8 || p.torsoY > p.top + .05) fail(`In the lazy river your pet should swim, not walk on the water (deep ${p.k.toFixed(2)}, body at ${p.torsoY.toFixed(2)}, water at ${p.top}).`);
  if (p.headTop < p.top + .05) fail(`In the lazy river your pet should keep its head above the water (head top at ${p.headTop.toFixed(2)}).`);

  if (errors.length) fail('Page errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ Pets swim next to you in the canal and the waterpark, and walk again on land.');
} finally { await browser.close(); server.close(); }
