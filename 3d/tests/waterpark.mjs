// 💦 Splash Waterpark test (3d/src/26w-waterpark.js), on an iPhone-size screen: walks over the footbridge from the island
// (and swims under it), rides both waterslides down into the splash pool, floats round the lazy river, catches a wave on a
// surfboard in the wave pool, plays on the floating playground (big slide and bouncer), and checks a bike stays out of the pools.
//
// Run it with:  node 3d/tests/waterpark.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  const S = () => page.evaluate(() => window.__game.waterpark.state());
  const done = id => page.evaluate(id => !!(window.__game.SAVE.chal && window.__game.SAVE.chal.done[id]), id);
  const until = async (what, test, ms = 120_000) => { const end = Date.now() + ms; let s;
    while (Date.now() < end) { s = await S(); if (test(s)) return s; await page.waitForTimeout(250); } fail(`Timed out waiting: ${what}`); return s; };
  // put the player somewhere in the waterpark's own directions (x across, z toward the island), standing still
  const goLocal = (lx, lz, y = 0) => page.evaluate(([lx, lz, y]) => { const G = window.__game, W = G.waterpark, [x, z] = W.world(lx, lz);
    G.player.pos.set(x, y, z); G.player.vy = 0; }, [lx, lz, y]);
  const where = () => page.evaluate(() => { const G = window.__game, P = G.player.pos, [lx, lz] = G.waterpark.local();
    return { d: Math.hypot(P.x, P.z), y: P.y, lx, lz, depth: G.waterpark.wpDepth(P.x, P.z), ang: (Math.atan2(P.x, P.z) * 180 / Math.PI + 360) % 360 }; });
  const hold = async (key, ms) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); };

  // the island's radius (the waterpark sits 32 past its edge), so the spots below move out with the island when it grows
  const R = await page.evaluate(() => window.__game.waterpark.WPZ.d - 32);
  // 1. walk over the footbridge from behind the Clothing Store: up over the arch, never in the water, into the waterpark
  await page.evaluate(R => { const G = window.__game, a = 240 * Math.PI / 180; G.player.pos.set(Math.sin(a) * (R - 4), 0, Math.cos(a) * (R - 4)); G.player.face = a; G.cam.yaw = a + Math.PI; }, R);
  await page.waitForTimeout(800);
  await page.keyboard.down('KeyW');
  let top = 0, wet = 0, w;
  for (let i = 0; i < 120; i++) { await page.waitForTimeout(250); w = await where(); const s = await S(); top = Math.max(top, w.y); wet = Math.max(wet, s.swim); if (w.d > R + 24) break; }
  await page.keyboard.up('KeyW');
  if (w.d < R + 23) fail(`Walking along the footbridge should take you to the waterpark, but you stopped ${w.d.toFixed(1)} from the middle of the island.`);
  if (top < 1) fail(`The footbridge arches up over the canal; you only got ${top.toFixed(2)} up.`);
  if (wet > .3) fail(`You should stay dry walking over the bridge (swimming ${wet.toFixed(2)}).`);
  if ((await S()).zone !== 'water') fail(`On the other side you should be in the waterpark, the place says "${(await S()).zone}".`);
  await shot('1-waterpark');

  // 2. swimming in the canal you go under the bridge, not up onto it
  await page.evaluate(R => { const G = window.__game, a = 236 * Math.PI / 180, r = R + 8; G.player.pos.set(Math.sin(a) * r, 0, Math.cos(a) * r); G.player.face = a + Math.PI / 2; G.cam.yaw = G.player.face + Math.PI; }, R);
  await page.waitForTimeout(1200);
  await page.keyboard.down('KeyW');
  let maxY = 0;
  for (let i = 0; i < 60; i++) { await page.waitForTimeout(250); w = await where(); maxY = Math.max(maxY, w.y); if (w.ang > 244 || w.ang < 200) break; }
  await page.keyboard.up('KeyW');
  if (!(w.ang > 243)) fail(`Swimming along the canal you should pass under the bridge, but you got stuck at ${w.ang.toFixed(1)}°.`);
  if (maxY > .2) fail(`Swimming under the bridge you climbed ${maxY.toFixed(2)} up onto it.`);

  // 3. the 🌀 Twister: up the conveyor in a tube, down the twisting tube slide, splash into the pool
  for (const id of ['twister', 'racer']) {
    await goLocal(0, 8);await page.waitForTimeout(400);
    const P = await page.evaluate(id => window.__game.waterpark.WP_PADS[id], id);
    await goLocal(P.lx, P.lz);
    let s = await until(`the ${id} to start from its pad`, s => s.ride === 'slide', 10_000);
    let hi = 0, low = 99, n = 0;
    while (s.ride === 'slide' && n++ < 400) { await page.waitForTimeout(150); w = await where(); s = await S(); if (s.phase === 'down') { hi = Math.max(hi, w.y); low = Math.min(low, w.y); } if (id === 'twister' && n === 40) await shot('2-twister'); }
    if (s.ride) fail(`The ${id} ride never ended.`);
    w = await where();
    if (hi < 8) fail(`The ${id} starts at the top of the tower, but you only went down from ${hi.toFixed(1)}.`);
    if (w.depth < .5) fail(`The ${id} should drop you into the splash pool (depth there ${w.depth}).`);
    if (!(await done('wp_' + id))) fail(`Riding the ${id} should count for its challenge.`);
    await page.waitForTimeout(800);
  }
  await shot('3-splash-pool');

  // 4. 🛟 the lazy river: float along it in a tube, staying in the water, and a whole lap counts
  await goLocal(0, -2);await page.waitForTimeout(300);
  await goLocal(0, -4.4);
  await until('to get in a tube on the lazy river pad', s => s.ride === 'tube', 10_000);
  const r0 = await page.evaluate(() => window.__game.waterpark.WP.ride.s);
  await page.keyboard.down('KeyW');
  for (let i = 0; i < 16; i++) { await page.waitForTimeout(250); const q = await page.evaluate(() => { const W = window.__game.waterpark, [lx, lz] = W.local(), R = W.WPL.river, cx = Math.max(-R.a, Math.min(R.a, lx));
      return Math.abs(Math.hypot(lx - cx, lz - R.cz) - R.b); });
    if (q > 1.5) fail(`The tube left the river (${q.toFixed(2)} from its middle).`); }
  await page.keyboard.up('KeyW');
  const r1 = await page.evaluate(() => window.__game.waterpark.WP.ride && window.__game.waterpark.WP.ride.s);
  if (!(r1 > r0 + 1)) fail(`The tube should float along the river (it went from ${r0} to ${r1}).`);
  await shot('4-lazy-river');
  // skip ahead to near the end of the lap
  await page.evaluate(() => { const W = window.__game.waterpark, R = W.WPL.river; W.WP.ride.went = 4 * R.a + 2 * Math.PI * R.b - 1.5; });
  await page.waitForTimeout(2500);
  if (!(await done('wp_lazy'))) fail('Floating all the way round the lazy river should count.');
  await page.evaluate(() => document.querySelector('#wpBtn').click());
  if ((await S()).ride) fail('Hop out should get you out of the tube.');
  w = await where();if (w.depth > 0) fail('Hopping out of the tube should put you on the side of the river.');

  // 5. 🏄 surfing: take a board from the Surf Shack's rack, paddle out, a wave stands you up and you ride it in
  await goLocal(-2, 2);await page.waitForTimeout(300);
  const SP = await page.evaluate(() => window.__game.waterpark.WP_PADS.surf);
  await goLocal(SP.lx, SP.lz);
  await until('a surfboard from the rack', s => s.board, 5000);
  await goLocal(-17, 0);
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__game.waterpark.WAVE.t = window.__game.waterpark.WAVE.every - .1; });
  let s = await until('a wave to stand you up on your board', s => s.ride === 'surf', 30_000);
  const z0 = (await where()).lz;
  await shot('5-surfing');
  s = await until('the wave ride to end at the beach', s => s.ride !== 'surf', 30_000);
  if (!((await where()).lz > z0 + 2)) fail('Riding a wave should carry you in toward the beach.');
  if (!(await done('wp_surf'))) fail('Catching a wave should count for the surfing challenge.');
  if (!(await done('wp_waves'))) fail('Swimming in the wave pool when the waves come should count.');
  // the wave pool is the big one, and swimming in it without a board you can ask for one
  const big = await page.evaluate(() => { const W = window.__game.waterpark.WPL.wave; return (W.x1 - W.x0) * (W.z1 - W.z0); });
  if (big < 600) fail(`The wave pool should be big, it is only ${big.toFixed(0)} square steps.`);
  await page.evaluate(() => document.querySelector('#wpBtn').click());// put the board back
  await until('the board to go back', s => !s.board, 5000);
  await goLocal(-30, 4);
  await page.waitForTimeout(1500);
  const btn = await page.evaluate(() => { const b = document.querySelector('#wpBtn'); return b.style.display !== 'none' ? b.textContent : ''; });
  if (!/surfboard/i.test(btn)) fail(`Swimming in the wave pool without a board there should be a button to get one (it says "${btn}").`);
  else { await page.evaluate(() => document.querySelector('#wpBtn').click()); await until('a board from the button', s => s.board, 5000); }

  // 6. 🎈 the floating playground: slide down the big slide, and the bouncer throws you up
  await page.evaluate(() => document.querySelector('#wpBtn').click());
  const I = await page.evaluate(() => window.__game.waterpark.WPI.find(i => i.k === 'slide'));
  await goLocal(I.x - I.w / 2 + 2.9, I.z, I.h);
  await page.waitForTimeout(500);
  await goLocal(I.x - I.w / 2 + 3.4, I.z, I.h * .95);
  await page.waitForTimeout(3000);
  if (!(await done('wp_playSlide'))) fail('Sliding down the inflatable slide into the water should count.');
  const B = await page.evaluate(() => window.__game.waterpark.WPI.find(i => i.k === 'bounce'));
  await goLocal(B.x, B.z, B.h + .8);
  let up = 0;for (let i = 0; i < 12; i++) { await page.waitForTimeout(150); up = Math.max(up, (await where()).y); }
  if (up < 1.6) fail(`The bouncer should throw you up in the air (you went ${up.toFixed(2)} high).`);
  await hold('KeyW', 1500);await page.waitForTimeout(1500);
  if (!(await done('wp_bounce'))) fail('Bouncing off the bouncer into the water should count.');

  // 7. a bike stays out of the pools
  await goLocal(-3, 4);await page.waitForTimeout(500);
  await page.evaluate(() => { const G = window.__game; G.SAVE.owned = G.SAVE.owned || {}; G.SAVE.owned['look:bicycle'] = 1;
    G.SAVE.look.extras = G.SAVE.look.extras || {}; G.SAVE.look.extras.bicycle = '#ff6fae'; if (!G.bike().on) G.toggleBike(); G.player.face = G.ZONES.find(z => z.id === 'water').rot - Math.PI / 2; G.cam.yaw = G.player.face + Math.PI; });
  await page.waitForTimeout(500);
  await page.keyboard.down('KeyW');
  let wetBike = 0;for (let i = 0; i < 16; i++) { await page.waitForTimeout(250); wetBike = Math.max(wetBike, (await where()).depth); }
  await page.keyboard.up('KeyW');
  if (!(await page.evaluate(() => window.__game.bike().on))) fail('Could not hop on the bike in the waterpark.');
  if ((await where()).lx > -5.2) fail(`The bike should ride up to the edge of the wave pool (it got to ${(await where()).lx.toFixed(1)}).`);
  if (wetBike > 0) fail('A bike should not ride into the wave pool.');
  await page.evaluate(() => { const G = window.__game; if (G.bike().on) G.toggleBike(); });

  if (errors.length) fail('Page errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ The waterpark works: the bridge, both slides, the lazy river, surfing and the floating playground.');
} finally { await browser.close(); server.close(); }
