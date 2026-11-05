// Skate park test: rides the ramps at the 🛹 Skate Park (3d/src/12f-place-skate-park.js, 3d/src/24k-skate-park.js) on a
// skateboard, roller skates and a bike, and checks that the ramps really work:
//   - dropping into the half-pipe you roll down, across and up the other wall, and pumping gets you air out of the top
//     (you turn around in the air and land back on the ramp, still in the park)
//   - you lean with the ramp (the board, skates or bike tilt to match it)
//   - JUMP ollies onto the rail and you grind along it to the end
//   - the trick buttons do tricks and they show up with points when you land
//   - the bike tilts with you and a backflip goes all the way round
//   - walking, the ramps and boxes are solid ground and you can't walk through the side of the platform
//
// Run it with:  node 3d/tests/skate-park.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// SHOTS=some/folder saves pictures of the riding.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? '✅' : '❌'} ${msg}`); if (!ok) { failed++; process.exitCode = 1; } };
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await (await browser.newContext({ viewport: { width: 900, height: 600 }, serviceWorkers: 'block' })).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  await page.route(/gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());
  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);
  if (SHOTS) await mkdir(SHOTS, { recursive: true });
  // test computers draw about one picture a second, so the world is only drawn for pictures (see fly.mjs)
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(1200);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };

  // the joystick: 'pump' pushes the way you're rolling, a number pushes that way (in the park's own directions), null lets go
  await page.evaluate(() => { const G = window.__game, z = G.Z.skate; window.__T = { want: null, log: [] };
    G.onTick.push(() => { const T = window.__T, P = G.skatePark();
      const wa = T.want === 'pump' && P.on ? P.hd + z.rot : typeof T.want === 'number' ? T.want + z.rot : null;
      if (wa === null) { G.joy.x = G.joy.y = 0; } else { const yaw = G.cam.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw), dx = Math.sin(wa), dz = Math.cos(wa);
        G.joy.y = -(dx * fx + dz * fz); G.joy.x = dx * -fz + dz * fx; }
      if (P.on) { const [lx, lz] = z.toLocal(G.player.pos.x, G.player.pos.z); T.log.push({ lx, lz, y: G.player.pos.y, air: P.air, grind: !!P.grind, S: P.S, face: P.face, trick: P.trick ? P.trick.def.id : '' }); if (T.log.length > 4000) T.log.shift(); } }); });
  const state = () => page.evaluate(() => { const G = window.__game, z = G.Z.skate, P = G.skatePark(), [lx, lz] = z.toLocal(G.player.pos.x, G.player.pos.z);
    const up = new G.THREE.Vector3(0, 1, 0).applyQuaternion(G.av().g.quaternion);
    return { on: P.on, kind: P.kind, lx, lz, y: G.player.pos.y, air: P.air, grind: !!P.grind, S: P.S, up: up.y, txt: document.querySelector('#trickTxt').textContent }; });
  const until = async (fn, secs) => { const end = Date.now() + secs * 1000; let s; while (Date.now() < end) { s = await state(); if (fn(s)) return s; await page.waitForTimeout(30); } return null; };
  const setup = (o) => page.evaluate(async o => { const G = window.__game, z = G.Z.skate, L = G.SAVE.look; L.extras = L.extras || {};
    if (G.skatePark().on && G.sk().on) G.toggleSkate(); if (G.bike().on) G.toggleBike();
    delete L.extras.skateboard; delete L.extras.bicycle; if (L.shoes && /skates|inlines/.test(L.shoes.id)) L.shoes = null;
    if (o.kind === 'board') L.extras.skateboard = '#ff8a1f';
    if (o.kind === 'skates') L.shoes = { id: 'inlines', c: '#ff6fae' };
    if (o.kind === 'bike') { L.extras.bicycle = '#3a8dff'; G.SAVE.owned = G.SAVE.owned || {}; G.SAVE.owned['look:bicycle'] = 1; }
    G.rebuildPlayer(); await new Promise(r => setTimeout(r, 200));
    const [x, w] = z.toWorld(o.at[0], o.at[1]); G.player.pos.set(x, G.groundAt(x, w), w); G.player.vy = 0; G.player.face = z.rot + o.face;
    G.cam.yaw = z.rot + o.face + Math.PI; G.cam.cy = G.cam.yaw; window.__T.want = null; window.__T.log = [];
    if (o.kind === 'board') G.toggleSkate(); if (o.kind === 'bike') G.toggleBike(); }, o);
  const want = w => page.evaluate(w => { window.__T.want = w; }, w);
  const log = () => page.evaluate(() => window.__T.log);

  // --- walking: the ramps are ground, the ledge is a wall ---
  const heights = await page.evaluate(() => { const G = window.__game, z = G.Z.skate, at = (x, w) => { const [a, b] = z.toWorld(x, w); return G.groundAt(a, b); };
    return { deck: at(3.5, -6.5), flat: at(0, -6.5), ledge: at(-3.1, 3), stairsTop: at(-6, -1.5), grass: at(0, 12) }; });
  check(Math.abs(heights.deck - 1.65) < .02 && Math.abs(heights.flat - .05) < .02 && Math.abs(heights.ledge - .4) < .01 && Math.abs(heights.stairsTop - .9) < .01 && heights.grass === 0,
    `the half-pipe deck, its flat bottom, the ledge and the platform are solid ground (${JSON.stringify(Object.fromEntries(Object.entries(heights).map(([k, v]) => [k, +v.toFixed(2)])))})`);
  await setup({ kind: '', at: [-3.4, -1.9], face: -Math.PI / 2 });
  await want(-Math.PI / 2); await page.waitForTimeout(1500); await want(null);
  let s = await state();
  check(!s.on && s.lx > -4.65 && s.lx < -4, `walking into the side of the platform stops you there (got to x ${s.lx.toFixed(2)}, its side is at -4.6)`);

  // --- skateboard in the half-pipe ---
  await setup({ kind: 'board', at: [3.5, -6.5], face: -Math.PI / 2 });
  s = await until(s => s.on && !s.air, 5);
  check(s && s.on && s.kind === 'board', 'on a skateboard in the park, the skate park takes over the riding');
  await want(-Math.PI / 2);
  s = await until(s => s.lx < 0, 15);
  check(s && s.y < .2 && s.S > 6, `dropping in, you roll down to the flat bottom fast (speed ${s && s.S.toFixed(1)})`);
  s = await until(s => !s.air && s.y > .6 && s.lx < -2, 10);
  check(s && s.up < .9, `going up the other wall you lean with the ramp (up is ${s && s.up.toFixed(2)})`);
  await want('pump');
  s = await until(s => s.air && s.y > 2, 30);
  check(!!s, 'pumping on the flat gets you air out of the top of the half-pipe');
  await shot('half-pipe-air');
  s = await until(s => !s.air && s.y < 1.3, 10);
  const L1 = await log();
  check(s && s.on && Math.abs(s.lz + 6.5) < 1.6 && s.S > 3, `you come back down onto the ramp and keep rolling (z ${s && s.lz.toFixed(2)}, speed ${s && s.S.toFixed(1)})`);
  { const airs = L1.filter(l => l.air && l.y > 1.8); const turned = airs.length ? Math.abs(airs[airs.length - 1].face - airs[0].face) : 0;
    check(turned > 2.2, `you turn around in the air above the coping (${(turned * 180 / Math.PI).toFixed(0)}°)`); }
  check(L1.every(l => Math.abs(l.lx) < 4.2), 'you never fly out over the back of the half-pipe');
  if (!L1.every(l => Math.abs(l.lx) < 4.2)) { const i = L1.findIndex(l => Math.abs(l.lx) >= 4.2); // show how it happened
    console.log('   ' + L1.slice(Math.max(0, i - 40), i + 5).map(l => `${l.lx.toFixed(2)},${l.y.toFixed(2)},${l.air ? 'A' : 'g'},${l.S.toFixed(1)}`).join(' ')); }
  s = await until(s => s.air && s.y > 1.9, 30);
  await page.evaluate(() => window.__game.skTrick('kickflip'));
  s = await until(s => /Kickflip/.test(s.txt), 15);
  check(!!s, `a kickflip in the air pops up with points when you land ("${s && s.txt}")`);
  await want(null);

  // the same at any speed and any frame rate: rolling up either wall of the half-pipe from anywhere, you go up off the coping and
  // turn around, and never fly out over the back. This moves the board itself with fixed time steps (a fast computer's down to a
  // slow phone's), so it gives the same answer on every computer.
  { const r = await page.evaluate(() => { const G = window.__game, P = G.skatePark(), out = []; let n = 0;
      for (const dt of [1 / 60, 1 / 45, 1 / 30, .05]) for (const side of [-1, 1]) for (let i = 0; i < 40; i++) for (const S of [7, 8.5, 10]) {
        const x0 = side * (2 + i * .023); n++;
        Object.assign(P, { lx: x0, lz: -6.5, y: G.skateLH(x0, -6.5), air: false, S, hd: side * Math.PI / 2, face: side * Math.PI / 2, vert: null, grind: null, trick: null, vx: 0, vz: 0, vy: 0 });
        let t = 0, air = false, far = 0;
        while (t < 3) { G.skStep(dt, 0, 0, 0); t += dt; far = Math.max(far, Math.abs(P.lx)); if (P.air) air = true; else if (air) break; }
        if (far > 4.2) out.push(`from x ${x0.toFixed(2)} at speed ${S}, ${Math.round(1 / dt)} frames a second: out to x ${far.toFixed(2)}`); }
      return { n, out }; });
    check(r.out.length === 0, `rolling up the half-pipe walls ${r.n} ways, you never fly out over the back (${r.out.slice(0, 3).join('; ')})`); }

  // --- ollie onto the rail and grind it ---
  await setup({ kind: 'board', at: [0, 9], face: Math.PI });
  await until(s => s.on && !s.air, 5);
  await want(Math.PI);
  s = await until(s => s.lz < 7.3, 10);
  await page.evaluate(() => document.querySelector('#jump').dispatchEvent(new PointerEvent('pointerdown')));
  s = await until(s => s.grind, 4);
  check(!!s && Math.abs(s.lx) < .05 && Math.abs(s.y - .42) < .02, `JUMP ollies you onto the rail and you grind it (${s ? `at height ${s.y.toFixed(2)}` : 'never got on'})`);
  await shot('rail-grind');
  s = await until(s => !s.grind && !s.air, 6);
  check(s && s.lz < 1.3 && /grind/i.test(s.txt), `you grind to the end of the rail and land ("${s && s.txt}")`);
  await want(null);
  // riding straight into the rail without jumping bumps you off it instead of going through
  await setup({ kind: 'board', at: [2.5, 3.4], face: -Math.PI / 2 });
  await until(s => s.on && !s.air, 5); await want(-Math.PI / 2); await page.waitForTimeout(2500); await want(null);
  s = await state();
  check(s.lx > -.1, `riding into the rail without jumping bumps you off it (x ${s.lx.toFixed(2)})`);

  // --- roller skates off the kicker ---
  await setup({ kind: 'skates', at: [5.3, 8.6], face: Math.PI });
  await want(Math.PI); // you start just outside the park, so roll in
  s = await until(s => s.on && s.kind === 'skates', 8);
  check(s && s.kind === 'skates', 'on roller skates the skate park takes over too');
  s = await until(s => s.air && s.lz < 2.9, 12);
  check(!!s, 'the kicker throws you into the air on skates');
  await page.evaluate(() => window.__game.skTrick('spin'));
  s = await until(s => /360/.test(s.txt), 10);
  check(!!s, `a 360 on skates lands with points ("${s && s.txt}")`);
  await want(null);

  // --- bike: tilts with you, backflip all the way round ---
  await setup({ kind: 'bike', at: [3.5, -6.5], face: -Math.PI / 2 });
  s = await until(s => s.on && s.kind === 'bike' && !s.air, 5);
  check(s && s.kind === 'bike', 'on the bike the skate park takes over');
  await want(-Math.PI / 2);
  s = await until(s => !s.air && s.y > .6 && s.lx < -2, 15);
  const tilt = await page.evaluate(() => { const G = window.__game; return G.bikeModel().g.quaternion.angleTo(G.av().g.quaternion); });
  check(s && s.up < .9 && tilt < .01, `the bike leans with the ramp, together with you (up ${s && s.up.toFixed(2)})`);
  await want('pump');
  s = await until(s => s.air && s.y > 1.9, 30);
  await page.evaluate(() => window.__game.skTrick('backflip'));
  s = await until(s => /Backflip/.test(s.txt), 15);
  check(!!s, `a backflip on the bike goes all the way round and lands ("${s && s.txt}")`);
  await shot('bike');
  await want(null);

  // --- riding out of the park: back to normal riding ---
  await setup({ kind: 'board', at: [0, 8.5], face: 0 });
  await until(s => s.on && !s.air, 5); await want(0);
  s = await until(s => !s.on, 10); await want(null);
  check(!!s, 'riding out of the park, you skate around town like before');

  check(errors.length === 0, `no errors (${errors.slice(0, 3).join(' | ')})`);
} finally { await browser.close(); server.close(); }
if (failed) console.log(`\n${failed} check(s) failed`);
