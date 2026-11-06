// Hang gliding and skydiving test (3d/src/26i-sky-sports.js), on an iPhone-size screen:
//  🪂 steps on the launch spot on top of Lookout Mountain, taps 🪂 Hang glide!, runs off the ramp, glides toward town (steering with
//     the joystick), checks a thermal lifts you up, taps 🛬 Land and checks you come down on open ground (not a roof, not a tree).
//  🪂 also opens a parachute over town and checks it always comes down and lands (never floats back up).
//  ✈️ steps on the spot by the plane at the airfield, taps ✈️ Go skydiving!, checks the plane takes off and climbs to jump height
//     with the door open, taps 🪂 Jump!, falls, the parachute opens by itself at the safe height, and you land standing up.
//     Then the plane lands again and taxis back to its spot.
//
// Run it with:  node 3d/tests/sky.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  const G = () => page.evaluate(() => { const G = window.__game, p = G.player.pos, S = G.sky();
    return { ...S, x: p.x, y: p.y, z: p.z, ground: G.skyFloor(p.x, p.z), land: G.skyLandable(p.x, p.z), r: Math.hypot(p.x, p.z) }; });
  const gameT = async () => (await G()).clock;
  const waitGame = async (sec, until = () => false) => { const t0 = await gameT(), end = Date.now() + 240_000;
    while (Date.now() < end) { await page.waitForTimeout(250); const s = await G(); if (s.clock - t0 >= sec || until(s)) return s; } return G(); };
  const tapBtn = async () => { const b = await page.locator('#skyBtn').boundingBox(); if (!b) return false; await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); return true; };
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });

  // ---------- 🪂 hang gliding ----------
  await page.evaluate(() => { const G = window.__game, R = G.SKY_PARTS.RAMP; G.player.pos.set(R.padW[0], 10.5, R.padW[1]); });
  let s = await waitGame(.6);
  if (!s.btn.includes('Hang glide')) fail(`On the launch spot the button should say Hang glide, it says "${s.btn}".`);
  await shot('1-launch-ramp');
  await tapBtn();
  s = await waitGame(.5);
  if (s.mode !== 'hgRun') fail(`Tapping Hang glide should start the run down the ramp, mode is ${s.mode}.`);
  await shot('2-running');
  s = await waitGame(2.5);
  console.log(`after the launch: mode ${s.mode}, height ${s.y.toFixed(1)}, lying flat ${s.pr.toFixed(2)}`);
  if (s.mode !== 'hg') fail('You should be gliding after running off the ramp.');
  if (s.pr < .8) fail('In the air you should swing up into the harness and lie flat.');
  await shot('3-gliding');
  // glide toward town for a while (pushing the joystick forward)
  await touch('touchStart', [{ x: 100, y: 600 }]);
  for (let i = 1; i <= 8; i++) { await touch('touchMove', [{ x: 100, y: 600 - i * 6 }]); await page.waitForTimeout(30); }
  let low = 99, startR = s.r;
  for (let i = 0; i < 12; i++) { s = await waitGame(.5); if (s.y < s.ground - .05) fail(`The glider went into something at (${s.x.toFixed(1)}, ${s.z.toFixed(1)}).`); low = Math.min(low, s.y - s.ground); }
  await touch('touchEnd', []);
  await page.evaluate(() => { const j = window.__game.joy; j.x = j.y = 0; j.id = null; });
  console.log(`glided from ${startR.toFixed(1)} to ${s.r.toFixed(1)} from the middle, height ${s.y.toFixed(1)}`);
  if (!(s.r < startR - 20)) fail('The glider should have flown toward town.');
  if (s.mode !== 'hg') fail(`Still gliding expected, mode is ${s.mode}.`);
  await shot('4-over-the-canal');
  // a thermal lifts you: put the glider in the one over the Basketball Court
  const y0 = await page.evaluate(() => { const G = window.__game, T = G.SKY_PARTS.THERM[0]; G.player.pos.set(T.x, 9, T.z); return 9; });
  s = await waitGame(4);
  console.log(`in the thermal: from ${y0} up to ${s.y.toFixed(1)}`);
  if (!(s.y > y0 + 1.5)) fail('A thermal should lift the glider up.');
  await shot('5-thermal');
  // 🛬 Land
  await tapBtn();
  s = await waitGame(40, s => !s.mode);
  console.log(`landed at (${s.x.toFixed(1)}, ${s.z.toFixed(1)}), height ${s.y.toFixed(2)}, ground under it ${s.ground.toFixed(2)}`);
  if (s.mode) fail(`The glider should have landed, mode is ${s.mode}.`);
  if (Math.abs(s.y - s.ground) > .2 || s.y > .8) fail('After landing you should be standing on open ground.');
  await shot('6-landed');

  // ---------- ✈️ skydiving ----------
  await page.evaluate(() => { const G = window.__game, A = G.SKY_PARTS.AIRF; G.player.pos.set(A.padW[0], 0, A.padW[1]); });
  s = await waitGame(.8);
  if (!s.btn.includes('skydiving')) fail(`By the plane the button should say Go skydiving, it says "${s.btn}".`);
  await shot('7-airfield');
  await tapBtn();
  s = await waitGame(8, s => s.plane === 'climb');
  await shot('8-takeoff');
  s = await waitGame(60, s => s.plane === 'run');
  console.log(`jump height: plane at ${s.planeY.toFixed(1)}, door ${s.door.toFixed(2)}, button "${s.btn}"`);
  if (s.plane !== 'run') fail(`The plane should get up to jump height, it is "${s.plane}" at ${s.planeY.toFixed(1)}.`);
  if (s.planeY < 70) fail('Jump height should be way up above the clouds.');
  s = await waitGame(2);
  if (s.door < .7) fail('The jump door should be open.');
  await shot('9-door-open');
  if (!s.btn.includes('Jump')) fail(`The button should say Jump, it says "${s.btn}".`);
  await tapBtn();
  s = await waitGame(2);
  if (s.mode !== 'ff') fail(`After jumping you should be in free fall, mode is ${s.mode}.`);
  if (!(s.vy < -8)) fail(`Free fall should be fast, falling at ${s.vy.toFixed(1)}.`);
  await shot('10-freefall');
  s = await waitGame(15, s => s.mode === 'cn');
  console.log(`canopy open at height ${s.y.toFixed(1)}`);
  if (s.mode !== 'cn' && s.mode !== 'open') fail(`The parachute should open by itself, mode is ${s.mode}.`);
  if (s.y < 15) fail('The parachute opened too low.');
  await shot('11-canopy');
  s = await waitGame(60, s => !s.mode);
  console.log(`landed at (${s.x.toFixed(1)}, ${s.z.toFixed(1)}), height ${s.y.toFixed(2)}, ${s.land}`);
  if (s.mode) fail(`You should have landed, mode is ${s.mode}.`);
  // on open ground, or a splash into the canal to swim (both are real landings; never on a roof, a tree or rock)
  if (s.land === 'water' ? s.y > .6 : (Math.abs(s.y - s.ground) > .2 || s.land !== true)) fail('You should be standing on open ground (or swimming in the canal) after landing.');
  await shot('12-landed');
  s = await waitGame(150, s => s.plane === 'park');
  console.log(`the plane is back: ${s.plane}`);
  if (s.plane !== 'park') fail(`The plane should land and taxi back to its spot, it is "${s.plane}".`);
  await shot('13-plane-back');
  // a parachute coming down over town (busy with roofs, trees, lamps and, at Christmas, the big tree) still lands, on open ground,
  // whether you let it fly itself or hold the joystick the whole way down
  for (const [nm, x, z, held] of [['the plaza', 12, 12, 0], ['the plaza, steering', 12, 12, 1], ['the far bank', 20, 95, 0]]) {
    await page.evaluate(([x, z]) => { const G = window.__game; G.skyGo.canopyAt(x, G.groundAt(x, z) + 20, z, Math.atan2(-x, -z)); }, [x, z]);
    if (held) { await touch('touchStart', [{ x: 100, y: 600 }]); for (let i = 1; i <= 8; i++) { await touch('touchMove', [{ x: 100 + i * 2, y: 600 - i * 6 }]); await page.waitForTimeout(30); } }
    let top = 0; const t0 = (await G()).clock;
    s = await waitGame(45, s => { top = Math.max(top, s.y); return !s.mode; });
    if (held) await touch('touchEnd', []);
    await page.evaluate(() => { const j = window.__game.joy; j.id = null; j.x = j.y = 0; });
    console.log(`parachute over ${nm}: down in ${(s.clock - t0).toFixed(0)} s at (${s.x.toFixed(1)}, ${s.z.toFixed(1)}), ${s.land}, highest ${top.toFixed(1)}`);
    if (s.mode) fail(`A parachute over ${nm} should come down and land within 45 s, it is still ${s.mode} at height ${s.y.toFixed(1)}.`);
    if (top > 23) fail(`A parachute over ${nm} should never float back up (it went up to ${top.toFixed(1)}).`);
    s = await waitGame(2.5);
  }
  // a parachute opening anywhere round Lookout Mountain (rock, pines, the ropes course, the bank) lands within 60 s, on open ground or
  // in the canal, never stuck hovering. This steps the parachute itself with fixed time steps (a quick one and a slow phone's one),
  // so it gives the same answer on every computer.
  const stuck = await page.evaluate(() => { const G = window.__game, out = []; let n = 0;
    for (const dt of [1 / 60, .05]) for (let x = 88; x <= 118; x += 5) for (let z = -45; z <= -10; z += 5) for (const hd of [0, 1.57, 3.14, 4.71]) {
      G.skyGo.canopyAt(x, G.groundAt(x, z) + 20, z, hd); const p = G.player.pos; let t = 0; n++;
      while (t < 60 && G.sky().mode) { G.skyGo.step(dt, 0, 0, 0); t += dt; }
      const L = G.skyLandable(p.x, p.z);
      if (G.sky().mode || (L !== 'water' && (L !== true || Math.abs(p.y - G.skyFloor(p.x, p.z)) > .2)))
        out.push(`from (${x}, ${z}) heading ${hd}: ${G.sky().mode || 'landed'} at (${p.x.toFixed(1)}, ${p.z.toFixed(1)}) height ${p.y.toFixed(1)}`);
    } return { n, out }; });
  console.log(`parachutes round the mountain: ${stuck.n - stuck.out.length} of ${stuck.n} came down`);
  for (const o of stuck.out) fail(`A parachute should always come down and land, ${o}.`);
  // a parachute coming down anywhere (town, the canal and its footbridges, the fenced-off hills of the big world) lands within 60 s,
  // never stuck floating round and round, and never inside the ground, a bridge or a hill on the way down
  const under = await page.evaluate(() => { const G = window.__game, p = G.player.pos, out = [], pts = []; let n = 0;
    for (let a = 0; a < 6.28; a += .7) for (const r of [30, 82, 100, 150, 210]) pts.push([Math.sin(a) * r, Math.cos(a) * r]);
    for (const [x, z] of pts) for (const hd of [0, 3.1]) {
      G.skyGo.canopyAt(x, Math.max(G.groundAt(x, z), G.groundH(x, z)) + 30, z, hd); let t = 0, worst = 9; n++;
      while (t < 60 && G.sky().mode) { G.skyGo.step(.05, 0, 0, 0); t += .05; if (G.sky().mode !== 'cnDown') worst = Math.min(worst, p.y - Math.max(G.groundAt(p.x, p.z), G.groundH(p.x, p.z))); }
      if (G.sky().mode || worst < -.3) out.push(`from (${x.toFixed(0)}, ${z.toFixed(0)}) heading ${hd}: ${G.sky().mode || 'landed'} at (${p.x.toFixed(1)}, ${p.z.toFixed(1)}), lowest ${worst.toFixed(2)} from the ground`);
    } return { n, out }; });
  console.log(`parachutes all round the world: ${under.n - under.out.length} of ${under.n} came down safely`);
  for (const o of under.out) fail(`A parachute should land and never go into the ground, ${o}.`);
  // 🛟 the safety net: stuck inside the ground (here, inside a hill), you pop back up onto open ground
  const net = await page.evaluate(async () => { const G = window.__game, p = G.player.pos;
    p.set(0, -3, 150); const c0 = G.sky().clock, end = Date.now() + 60000; while (G.sky().clock - c0 < 1.5 && Date.now() < end) await new Promise(r => setTimeout(r, 200));
    return { y: p.y, g: Math.max(G.groundAt(p.x, p.z), G.groundH(p.x, p.z)), land: G.skyLandable(p.x, p.z), r: Math.hypot(p.x, p.z) }; });
  console.log(`safety net: popped back up at ${net.r.toFixed(1)} from the middle, height ${net.y.toFixed(2)} (ground ${net.g.toFixed(2)}), ${net.land}`);
  if (net.y < net.g - .3 || !net.land) fail('Stuck inside the ground, the safety net should pop you back up onto open ground or into the canal.');
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ Hang gliding and skydiving work.');
} finally {
  await browser.close();
  server.close();
}
