// Bike test: hops on the 🚲 bike on an iPhone-size screen and checks the riding looks real:
// sitting on the saddle, both hands on the grips, the balls of the feet on the pedals all the way round,
// the pedals turning with the back wheel while pedaling, staying still while coasting, and a foot down when stopped.
//
// Run it with:  node 3d/tests/bike.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// SHOTS=folder also saves pictures.
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
  // test computers draw about one picture a second, so the world is only drawn for pictures (see fly.mjs)
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(2500);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };

  // how far each foot is from its pedal, each hand from its grip, and the seat from the rider
  const measure = () => page.evaluate(() => {
    const G = window.__game, T = G.THREE, a = G.av(), bk = G.bikeModel(), B = G.bike();
    G.scene.updateMatrixWorld(true);
    const w = (o, x, y, z) => o.localToWorld(new T.Vector3(x, y, z));
    const feet = a.legs.map(l => w(l.an, 0, -.062, .045).distanceTo(w(bk.pedals[l.sx < 0 ? 0 : 1], 0, .012, 0)));
    const hands = a.arms.map(r => w(r.hand, 0, -.04, 0).distanceTo(bk.grips[r.sx < 0 ? 0 : 1].getWorldPosition(new T.Vector3())));
    const seat = a.hips.getWorldPosition(new T.Vector3()).y - .0975 - w(bk.seatG, 0, .655, -.15).y;
    const leftFoot = w(a.legs[0].an, 0, -.062, 0).y - G.player.pos.y;
    return { feet, hands, seat, leftFoot, crank: B.crank, spin: B.spin, v: B.v, stand: B.stand, on: B.on, biking: a.biking };
  });
  await page.evaluate(() => { const G = window.__game; G.player.pos.set(6, 0, 12); G.SAVE.owned = G.SAVE.owned || {}; G.SAVE.owned['look:bicycle'] = 1;
    G.SAVE.look.extras = G.SAVE.look.extras || {}; G.SAVE.look.extras.bicycle = '#ff6fae'; G.toggleBike(); });
  await page.waitForTimeout(1500);
  let m = await measure();
  if (!m.on || !m.biking) fail('Could not hop on the bike.');
  console.log(`stopped: right foot ${(m.feet[1] * 100).toFixed(1)} cm from its pedal, hands ${m.hands.map(h => (h * 100).toFixed(1)).join(' / ')} cm, left foot ${(m.leftFoot * 100).toFixed(1)} cm off the ground`);
  if (m.feet[1] > .03) fail('Stopped: the right foot should rest on its pedal.');
  if (m.leftFoot > .06) fail('Stopped: the left foot should be down on the ground.');
  if (Math.max(...m.hands) > .03) fail('Stopped: both hands should be on the grips.');
  await shot('1-stopped-foot-down');

  // pedal along: hold the joystick forward
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  await touch('touchStart', [{ x: 100, y: 600 }]);
  for (let i = 1; i <= 8; i++) { await touch('touchMove', [{ x: 100 + i * 2, y: 600 - i * 8 }]); await page.waitForTimeout(30); }
  await page.waitForTimeout(800);
  let worst = { feet: 0, hands: 0, seat: 0 }, c0 = null, s0 = null;
  for (let i = 0; i < 12; i++) {
    m = await measure(); if (c0 == null) { c0 = m.crank; s0 = m.spin; }
    worst.feet = Math.max(worst.feet, ...m.feet); worst.hands = Math.max(worst.hands, ...m.hands); worst.seat = Math.max(worst.seat, Math.abs(m.seat));
    if (i === 5) await shot('2-pedaling');
    await page.waitForTimeout(120);
  }
  const ratio = (m.spin - s0) / Math.max(1e-6, m.crank - c0);
  console.log(`pedaling at ${m.v.toFixed(1)}: feet within ${(worst.feet * 100).toFixed(1)} cm of the pedals, hands within ${(worst.hands * 100).toFixed(1)} cm of the grips, seat ${(worst.seat * 100).toFixed(1)} cm, wheel turns ${ratio.toFixed(2)}x per pedal turn`);
  if (m.v < 2) fail('The bike did not go anywhere.');
  if (m.crank - c0 < 3) fail('The pedals should go round while pedaling.');
  if (worst.feet > .03) fail('While pedaling, the feet should stay on the pedals.');
  if (worst.hands > .03) fail('While pedaling, the hands should stay on the grips.');
  if (worst.seat > .03) fail('While pedaling, the rider should sit on the saddle.');
  if (Math.abs(ratio - 2.4) > .3) fail('The pedals and the back wheel should turn together, like a chain.');

  // let go: coast with the pedals still while the wheels keep rolling
  await touch('touchEnd', []);
  await page.waitForTimeout(700);
  const a1 = await measure(); await page.waitForTimeout(400); const a2 = await measure();
  console.log(`coasting at ${a2.v.toFixed(1)}: wheels turned ${(a2.spin - a1.spin).toFixed(2)}, pedals ${(a2.crank - a1.crank).toFixed(2)}`);
  if (a2.v > .5 && a2.spin - a1.spin < .5) fail('Coasting: the wheels should keep rolling.');
  if (Math.abs(a2.crank - a1.crank) > .5) fail('Coasting: the pedals should stop going round.');
  if (Math.max(...a2.feet) > .03) fail('Coasting: the feet should stay on the pedals.');
  for (let i = 0; i < 40 && (m = await measure()).stand < .95; i++) await page.waitForTimeout(250);
  await shot('3-stopped-again');
  if (m.stand < .9 || m.leftFoot > .06) fail('After stopping, a foot should come down.');
  await page.evaluate(() => window.__game.toggleBike());
  await page.waitForTimeout(300);
  m = await measure();
  if (m.on || m.biking) fail('Could not hop off.');
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The rider sits on the saddle, pedals with the cranks, coasts and puts a foot down.');
} finally {
  await browser.close();
  server.close();
}
