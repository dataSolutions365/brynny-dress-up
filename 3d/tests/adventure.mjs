// Lookout Mountain and the Treetop Adventure test (26h-adventure.js), on an iPhone-size screen:
// walks over the footbridge to the far bank, checks swimmers still go under it, climbs the ladder, crosses all three rope
// bridges (the harness keeps you from stepping off), rides the treetop zip line, climbs the rock wall, zips down from the
// mountain top, hikes the trail up, and checks you can't just walk up the steep rock.
//
// Run it with:  node 3d/tests/adventure.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  // Test computers have no graphics card, so the world isn't drawn while the test runs (everything else runs as normal),
  // and the steps below count game time, not clock time. SHOTS draws it again for each picture.
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {};
    // what the game tells the challenges, and a steering helper: walk through a list of spots (x, z) with the W key
    window.__did = []; addEventListener('brynny:did', e => window.__did.push(e.detail));
    const G = window.__game; window.__walk = null;
    G.onTick.push(() => { const w = window.__walk; G.keys.KeyW = false; if (!w || !w.pts.length) return; const p = G.player.pos;
      while (w.pts.length && Math.hypot(w.pts[0][0] - p.x, w.pts[0][1] - p.z) < (w.pts.length > 1 ? .55 : .3)) w.pts.shift();
      if (!w.pts.length) return; const [x, z] = w.pts[0]; G.cam.yaw = Math.atan2(-(x - p.x), -(z - p.z)); G.keys.KeyW = true; }); });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const state = () => page.evaluate(() => { const G = window.__game, p = G.player.pos, a = G.adv();
    return { x: p.x, y: p.y, z: p.z, d: Math.hypot(p.x, p.z), ...a, zone: (G.zone() || {}).id, did: window.__did.slice(), walking: !!(window.__walk && window.__walk.pts.length) }; });
  const waitGame = async (sec, until = () => false) => { const t0 = (await state()).t, end = Date.now() + 240_000; let s;
    while (Date.now() < end) { await page.waitForTimeout(250); s = await state(); if (s.t - t0 >= sec || until(s)) return s; } return s; };
  const walk = pts => page.evaluate(p => { window.__walk = { pts: p }; }, pts);
  const stop = () => page.evaluate(() => { window.__walk = null; window.__game.keys.KeyW = false; });
  const put = (x, z, y = null) => page.evaluate(([x, z, y]) => { const G = window.__game; G.player.pos.set(x, y ?? G.groundAt(x, z), z); G.player.vy = 0; }, [x, z, y]);
  const P = await page.evaluate(() => { const A = window.__game.ADV_PARTS, w = (z, x, y) => z.toWorld(x, y);
    return { fb: A.FB, RC: A.RC.map(c => ({ ...c, w: w(A.TZ, c.x, c.z) })), ladder: w(A.TZ, ...A.RLAD.foot),
      zips: A.ZIPS.map(L => ({ id: L.id, launch: L.launch, land: L.land, h: L.launchH })), wallPad: w(A.MZ, A.WALL.x0 + .85, 0), H: A.MT.H,
      trail: A.TRAIL.map(t => w(A.MZ, t.lx, t.lz)), mFoot: w(A.MZ, -2, 6.9), mMid: w(A.MZ, -2, 2) }; });
  const did = (s, k, a) => s.did.some(d => d.k === k && (a === undefined || d.a === a));
  const btn = () => page.evaluate(() => document.querySelector('#advBtn').style.display === 'block' ? document.querySelector('#advBtn').textContent : '');
  const tap = () => page.evaluate(() => document.querySelector('#advBtn').click());
  const along = t => [P.fb.ux * t, P.fb.uz * t];

  // 1. walk over the footbridge to the far bank
  await put(...along(66));
  await walk([along(70), along(80), along(92), along(96)]);
  let top = 0, s;
  for (let i = 0; i < 60; i++) { s = await waitGame(.5); top = Math.max(top, s.y); if (!s.walking) break; }
  await stop();
  console.log(`over the footbridge: got to ${s.d.toFixed(1)} from the middle, as high as ${top.toFixed(2)}`);
  if (s.d < 94) fail(`Could not walk over the footbridge to the far bank (stopped ${s.d.toFixed(1)} from the middle).`);
  if (top < 2) fail(`The footbridge should go up over the water, but she only got ${top.toFixed(2)} high.`);
  await shot('1-over-the-bridge');

  // 2. a swimmer goes right under the footbridge
  { const t = 81, sx = P.fb.uz, sz = -P.fb.ux, c = along(t);
    await put(c[0] + sx * 4, c[1] + sz * 4, 0); await walk([[c[0] - sx * 4, c[1] - sz * 4]]); s = await waitGame(4, s => !s.walking); await stop();
    const side = (s.x - c[0]) * sx + (s.z - c[1]) * sz;
    console.log(`swimming under the footbridge: ended ${side.toFixed(1)} to the side, height ${s.y.toFixed(2)}`);
    if (side > -2) fail('A swimmer could not swim under the footbridge.');
    if (s.y > .5) fail('A swimmer was lifted up onto the footbridge from the water.'); }

  // 3. climb the ladder to the first tree
  await put(...P.ladder); s = await waitGame(.5);
  if (!(await btn()).includes('Climb the ladder')) fail(`At the foot of the ladder the button should say "Climb the ladder", it says "${await btn()}".`);
  await tap(); await waitGame(1.5); await shot('2-climbing-the-ladder');
  s = await waitGame(8, s => !s.mode);
  console.log(`after the ladder: height ${s.y.toFixed(2)}, up ${s.up}, on platform ${s.plat}, harness ${s.harness}`);
  if (!s.up || s.plat !== 0 || s.y < P.RC[0].h - .1) fail('The ladder should take her up onto the first platform.');
  if (!s.harness) fail('She should wear a harness up on the ropes course.');
  if (!did(s, 'ropes', 'up')) fail('Climbing up should count for the challenges.');

  // 4. the harness keeps her on the platform when she walks off the edge
  { const c = P.RC[0].w; await walk([[c[0] + (c[0] - P.ladder[0]) * 3 + 1, c[1] + (c[1] - P.ladder[1]) * 3 + 1]]); s = await waitGame(2); await stop();
    if (!s.up || s.y < P.RC[0].h - .1) fail(`Walking off the edge of the platform should be stopped by the harness (she's at height ${s.y.toFixed(2)}).`); }

  // 5. cross all three rope bridges, tree to tree
  for (let i = 1; i < 4; i++) { const c = P.RC[i].w, b = P.RC[i - 1].w;
    await walk([[b[0] + (c[0] - b[0]) * .17, b[1] + (c[1] - b[1]) * .17], [b[0] + (c[0] - b[0]) * .5, b[1] + (c[1] - b[1]) * .5], [c[0] + (b[0] - c[0]) * .12, c[1] + (b[1] - c[1]) * .12]]);
    s = await waitGame(12, s => s.plat === i && !s.walking); await stop();
    console.log(`to tree ${i + 1}: on platform ${s.plat}, height ${s.y.toFixed(2)}`);
    if (s.plat !== i) fail(`Could not walk across the rope bridge to tree ${i + 1}.`);
    if (i === 2) await shot('3-on-the-ropes-course'); }
  s = await state();
  const bridges = new Set(s.did.filter(d => d.k === 'ropesBridge').map(d => d.a));
  if (bridges.size !== 3) fail(`Crossing all 3 bridges should count 3 different ones for the challenges, got ${[...bridges].join(', ')}.`);

  // 6. the treetop zip line
  { const z = P.zips.find(z => z.id === 'tree'); await walk([z.launch]); s = await waitGame(5, s => !s.walking); await stop(); await waitGame(.4);
    if (!(await btn()).includes('Zip')) fail(`On the last tree's zip spot the button should say "Zip line!", it says "${await btn()}".`);
    await tap(); await waitGame(1.2); await shot('4-zip-line'); s = await state();
    if (s.mode !== 'zip') fail('Tapping "Zip line!" should start the zip line.');
    s = await waitGame(20, s => !s.mode);
    console.log(`after the treetop zip: (${s.x.toFixed(1)}, ${s.z.toFixed(1)}) height ${s.y.toFixed(2)}`);
    if (s.mode) fail('The treetop zip line never got to the bottom.');
    if (Math.hypot(s.x - z.land[0], s.z - z.land[1]) > 2 || s.y > .3) fail('The treetop zip line should drop you on the ground at the landing spot.');
    if (!did(s, 'zip', 'tree')) fail('The treetop zip line should count for the challenges.'); }

  // 7. climb the rock wall to the top of Lookout Mountain
  await put(...P.wallPad); await waitGame(.5);
  if (!(await btn()).includes('rock wall')) fail(`At the foot of the climbing wall the button should say "Climb the rock wall", it says "${await btn()}".`);
  await tap(); await waitGame(3); await shot('5-climbing-the-wall');
  s = await waitGame(12, s => !s.mode);
  console.log(`after the rock wall: height ${s.y.toFixed(2)} (the top is ${P.H})`);
  if (s.y < P.H - .1) fail('Climbing the rock wall should take you to the top of the mountain.');
  if (!did(s, 'climb', 'wall')) fail('Climbing the rock wall should count for the challenges.');

  // 8. the big zip line from the top down to the ropes course
  { const z = P.zips.find(z => z.id === 'mountain'); await walk([z.launch]); s = await waitGame(5, s => !s.walking); await stop(); await waitGame(.4);
    if (!(await btn()).includes('Zip')) fail(`On the mountain top's zip spot the button should say "Zip line down the mountain!", it says "${await btn()}".`);
    await tap(); await waitGame(2.5); await shot('6-big-zip-line');
    s = await waitGame(30, s => !s.mode);
    console.log(`after the big zip: (${s.x.toFixed(1)}, ${s.z.toFixed(1)}) height ${s.y.toFixed(2)}`);
    if (Math.hypot(s.x - z.land[0], s.z - z.land[1]) > 2 || s.y > .3) fail('The big zip line should drop you on the ground by the ropes course.');
    if (!did(s, 'zip', 'mountain')) fail('The big zip line should count for the challenges.'); }

  // 9. you can't just walk straight up the steep rock
  await put(...P.mFoot); await walk([P.mMid]); s = await waitGame(3); await stop();
  console.log(`walking straight at the rock: got to height ${s.y.toFixed(2)}`);
  if (s.y > 2) fail(`She walked straight up the steep rock to ${s.y.toFixed(2)}; only the trail and the wall go up.`);

  // 9b. the ground you stand on is the rock you see (no standing on air past the trail's edge), nowhere on the slope traps you,
  // you can step back up onto the trail from just below it, and off the trail a button pops you back on
  { const r = await page.evaluate(() => { const G = window.__game, T = G.THREE, MZ = G.ADV_PARTS.MZ; MZ.g.updateMatrixWorld(true);
      const meshes = []; MZ.g.traverse(o => { if (o.isMesh && o.geometry.type === 'PlaneGeometry' && o.geometry.attributes.color) meshes.push(o); });
      const rc = new T.Raycaster(); let air = 0, worst = 0, trapped = 0, back = 0, backN = 0;
      for (let lx = -9.6; lx <= 6.2; lx += .25) for (let lz = -6.8; lz <= 6.8; lz += .25) { const [x, z] = MZ.toWorld(lx, lz), g = G.groundAt(x, z);
        rc.set(new T.Vector3(x, 40, z), new T.Vector3(0, -1, 0)); const hit = rc.intersectObjects(meshes)[0];
        if (hit && hit.point.y > 0 && Math.abs(g - hit.point.y) > .05) { air++; worst = Math.max(worst, Math.abs(g - hit.point.y)); }
        const m = G.mtH(lx, lz); if (m[1] || g < .3) continue; const old = { x, y: g, z };
        let free = 0; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, p = { x: x + Math.sin(a) * .08, y: g, z: z + Math.cos(a) * .08 };
          if (!(G.groundAt(p.x, p.z) - g > .45 || G.advBlock(old, p))) free++; }
        if (!free) trapped++;
        const t = G.trailNear(lx, lz); if (t[0] > .85 && t[0] < 1.6 && g < t[1] - .05 && g > t[1] - .4) { backN++;
          const [tx, tz] = MZ.toWorld(t[3], t[4]), d = Math.hypot(tx - x, tz - z), p = { x: x + (tx - x) / d * .08, y: g, z: z + (tz - z) / d * .08 };
          if (!(G.groundAt(p.x, p.z) - g > .45 || G.advBlock(old, p))) back++; } }
      return { air, worst, trapped, back, backN }; });
    console.log(`mountain ground: ${r.air} spots off the drawn rock (worst ${r.worst.toFixed(2)}), ${r.trapped} spots that trap you, ${r.back}/${r.backN} spots step back onto the trail`);
    if (r.air) fail(`The ground you stand on doesn't match the rock you see in ${r.air} spots (up to ${r.worst.toFixed(2)} off): you'd stand on air.`);
    if (r.trapped) fail(`${r.trapped} spots on the mountain's slope trap you so you can't walk any way.`);
    if (r.back < r.backN) fail(`From just below the trail you couldn't step back onto it in ${r.backN - r.back} of ${r.backN} spots.`);
    // off the trail on the slope the 🥾 button pops you back on
    const off = await page.evaluate(() => { const G = window.__game, A = G.ADV_PARTS, MZ = A.MZ;
      for (let lx = -6; lx < 4; lx += .3) for (let lz = -5; lz < 5; lz += .3) { const m = G.mtH(lx, lz); if (!m[1] && m[0] > 2 && m[0] < 8 && G.trailNear(lx, lz)[0] > 1.5) return MZ.toWorld(lx, lz); } });
    await put(...off); await waitGame(.3); s = await state();
    if (!/Back to the trail/.test(s.btn)) fail(`Off the trail on the slope the "Back to the trail" button should show (it says "${s.btn}").`);
    await page.evaluate(() => document.querySelector('#advBtn').click()); await waitGame(.5);
    const on = await page.evaluate(() => { const G = window.__game, MZ = G.ADV_PARTS.MZ, p = G.player.pos, [lx, lz] = MZ.toLocal(p.x, p.z); return G.mtH(lx, lz)[1] && G.trailNear(lx, lz)[0] < .8; });
    if (!on) fail('The "Back to the trail" button should put you on the trail.'); }

  // 10. hike the trail to the top
  await put(...P.trail[0]); await walk(P.trail.slice(1)); s = await waitGame(60, s => !s.walking); await stop(); await waitGame(.5); s = await state();
  console.log(`after the trail: height ${s.y.toFixed(2)}`);
  if (s.y < P.H - .1) fail('Walking the trail should take you to the top of the mountain.');
  if (!did(s, 'climb', 'trail')) fail('Hiking the trail to the top should count for the challenges.');
  await shot('7-on-top');

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The footbridge, the ropes course, the rock wall, the trail and both zip lines work.');
} finally {
  await browser.close();
  server.close();
}
