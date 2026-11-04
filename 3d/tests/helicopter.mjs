// Helicopter test: on an iPhone-size screen, checks the 🚁 helicopter waits at the Helipad, can be won with its 4 challenges
// or bought for 500 coins, you sit in the pilot's seat, hold ⬆️ UP to lift off, fly across town above the trees with the nose
// dipped, 🛬 Land sets you down on the Helipad, you get out, and 🚁 Heli in the moves wheel calls it over.  (3d/src/26h-helicopter.js)
//
// Run it with:  node 3d/tests/helicopter.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  const G = (fn, a) => page.evaluate(fn, a);
  const until = async (fn, what, ms = 120_000) => { try { await page.waitForFunction(fn, null, { timeout: ms, polling: 250 }); console.log(`✓ ${what}`); } catch { fail(`timed out: ${what}`); } };
  const btn = () => G(() => { const b = document.querySelector('#heliBtn'); return b.style.display === 'block' ? b.textContent : ''; });
  const pad = await G(() => { const z = window.__game.ZONES.find(z => z.id === 'heli'); return z && { x: z.x, z: z.z }; });
  if (!pad) { fail('There is no 🚁 Helipad on the map.'); throw new Error('no helipad'); }

  // the helicopter waits at the Helipad, and you can see how to get it
  await G(() => { const G = window.__game, H = G.heli(); G.player.pos.set(H.pos.x + 2.6, 0, H.pos.z + 1.5); });
  await until(() => /Get the helicopter/.test(document.querySelector('#heliBtn').textContent), 'next to the helicopter: 🚁 Get the helicopter');
  const parked = await G(() => { const H = window.__game.heli(), z = window.__game.ZONES.find(z => z.id === 'heli'); return Math.hypot(H.pos.x - z.x, H.pos.z - z.z); });
  if (parked > 1) fail(`The helicopter should be parked on the Helipad, it is ${parked.toFixed(1)} away.`);
  await G(() => document.querySelector('#heliBtn').click());
  const card = await G(() => document.querySelector('#buy.show') && document.querySelector('#buyCard').textContent);
  if (!card || !/more 🪙/.test(card) || !/challenges/.test(card)) fail(`The helicopter card should show the price and the challenges, it says: ${card}`);
  await G(() => document.querySelector('#buy').classList.remove('show'));
  await shot('1-helipad');

  // win it with the 4 helicopter challenges
  await G(() => { const S = window.__game.SAVE; for (const id of ['heli_visit', 'heli_places', 'heli_wins', 'heli_stars']) S.chal.done[id] = true; });
  await until(() => window.__game.SAVE.owned['heli:skyhawk'], 'finishing the 4 helicopter challenges wins it');
  // and buying it with coins works too
  await G(() => { const S = window.__game.SAVE; delete S.owned['heli:skyhawk']; S.heli.got = 0; for (const id of ['heli_visit', 'heli_places', 'heli_wins', 'heli_stars']) delete S.chal.done[id]; S.coins = 600; });
  await G(() => document.querySelector('#heliBtn').click());
  await G(() => document.querySelector('#buyCard [data-b="buy"]').click());
  const coins = await G(() => window.__game.SAVE.coins);
  if (coins > 200) fail(`Buying the helicopter should cost 500 coins (from 600), now there are ${coins}.`);
  await until(() => window.__game.SAVE.owned['heli:skyhawk'] && /Get in/.test(document.querySelector('#heliBtn').textContent), 'bought with 🪙, and the button says 🚁 Get in');

  // get in: you sit in the pilot's seat and the rotor spins up
  await G(() => document.querySelector('#heliBtn').click());
  await until(() => window.__game.heli().on, 'in the pilot\'s seat');
  const sit = await G(() => { const G = window.__game, H = G.heli(), a = G.av(), s = G.HELI_SEATS[0].clone().applyEuler(new G.THREE.Euler(-H.pitch, H.hd, -H.bank, 'YXZ')).add(H.pos); return { d: s.distanceTo(a.g.position), pose: a.emote && a.emote.id }; });
  if (sit.d > .05 || sit.pose !== 'chair') fail(`You should be sitting in the pilot's seat (off by ${sit.d.toFixed(2)}, pose ${sit.pose}).`);
  await until(() => window.__game.heliModel().rpm > .9, 'the rotor spins up');
  await shot('2-in-the-seat');

  // hold ⬆️ UP: straight up above the trees
  const jb = await page.locator('#jump').boundingBox();
  await page.mouse.move(jb.x + jb.width / 2, jb.y + jb.height / 2); await page.mouse.down();
  await until(() => window.__game.heli().pos.y > 12, 'holding ⬆️ UP lifts off and climbs');
  await page.mouse.up();
  // fly across town with the joystick (W): it stays above every tree and roof on the way
  await G(() => { window.__game.keys.KeyW = true; window.__game.cam.yaw = Math.atan2(window.__game.player.pos.x, window.__game.player.pos.z); });
  let low = 99, far = 0;
  for (let i = 0; i < 24; i++) { await page.waitForTimeout(250);
    const s = await G(() => { const G = window.__game, H = G.heli(); return { y: H.pos.y, floor: G.flyFloor(H.pos.x, H.pos.z, 1), x: H.pos.x, z: H.pos.z, pitch: H.pitch }; });
    low = Math.min(low, s.y - s.floor); far = Math.max(far, Math.hypot(s.x - pad.x, s.z - pad.z)); }
  console.log(`flew ${far.toFixed(1)} from the Helipad, never closer than ${low.toFixed(2)} to what's below`);
  if (far < 10) fail('The joystick should fly the helicopter forward.');
  if (low < 0) fail('The helicopter went into a tree or a roof.');
  const tilt = await G(() => window.__game.heli().pitch);
  if (!(tilt < -.05)) fail(`The nose should dip when flying forward (pitch ${tilt.toFixed(2)}).`);
  if (/Get out/.test(await btn())) fail('You could get out up in the air.');
  await shot('3-flying');

  // fly back toward the Helipad, then 🛬 Land: it sets you down on it (it's close), then 🚪 Get out
  await G(pad => { const G = window.__game, P = G.heli().pos; G.cam.yaw = Math.atan2(P.x - pad.x, P.z - pad.z); }, pad);
  await page.waitForFunction(pad => { const G = window.__game, P = G.heli().pos; G.cam.yaw = Math.atan2(P.x - pad.x, P.z - pad.z); return Math.hypot(P.x - pad.x, P.z - pad.z) < 15; }, pad, { timeout: 120_000, polling: 100 });
  await G(() => { window.__game.keys.KeyW = false; });
  await until(() => /Land/.test(document.querySelector('#heliBtn').textContent), 'up in the air the button says 🛬 Land');
  await G(() => document.querySelector('#heliBtn').click());
  await until(() => window.__game.heli().mode === 'ground', '🛬 Land comes down and touches down');
  const landed = await G(() => { const G = window.__game, H = G.heli(), z = G.ZONES.find(z => z.id === 'heli'); return { open: G.heliOpen(H.pos.x, H.pos.z), pad: Math.hypot(H.pos.x - z.x, H.pos.z - z.z) }; });
  if (!landed.open) fail('It landed somewhere that isn\'t open ground.');
  if (landed.pad > 4.3) fail(`Landing close to the Helipad should land on it (${landed.pad.toFixed(1)} from the middle).`);
  await until(() => window.__game.SAVE.chal.done.heli_pad, 'landing on the Helipad finishes its challenge');
  await until(() => /Get out/.test(document.querySelector('#heliBtn').textContent) && document.querySelector('#heliBtn').style.display === 'block', 'on the ground the button says 🚪 Get out');
  await G(() => document.querySelector('#heliBtn').click());
  await until(() => !window.__game.heli().on && window.__game.player.onGround, 'you get out and stand next to it');

  // 🚁 Heli in the moves wheel calls it over to you from across town
  await G(() => { const G = window.__game; G.player.pos.set(-20, 0, 25); G.player.face = 0; });
  await page.waitForTimeout(500);
  await G(() => window.__game.doAction('heli'));
  await until(() => !window.__game.heli().auto && Math.hypot(window.__game.heli().pos.x + 20, window.__game.heli().pos.z - 25) < 20, '🚁 Heli flies it over and it lands near you');
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The helicopter can be won or bought, flies over the trees, lands on the Helipad and comes when you call.');
} finally {
  await browser.close();
  server.close();
}
