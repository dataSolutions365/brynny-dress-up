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
  // on a phone: a ghost joystick on the left shows where to drag, and dragging there really flies it around
  await until(() => document.querySelector('#heliJoy').style.display === 'flex', 'up in the air, the ghost joystick shows where to drag');
  { const cdp = await ctx.newCDPSession(page), a = await G(() => ({ x: window.__game.heli().pos.x, z: window.__game.heli().pos.z }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 95, y: 640, id: 1 }] });
    for (let k = 1; k <= 6; k++) { await page.waitForTimeout(80); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 95, y: 640 - k * 10, id: 1 }] }); }
    for (let k = 0; k < 10; k++) { await page.waitForTimeout(250); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 95 + (k % 2), y: 580, id: 1 }] }); }
    const b = await G(() => ({ x: window.__game.heli().pos.x, z: window.__game.heli().pos.z, ghost: document.querySelector('#heliJoy').style.display }));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const moved = Math.hypot(b.x - a.x, b.z - a.z);
    console.log(`dragging a finger on the left flew it ${moved.toFixed(1)}`);
    if (moved < 5) fail('Dragging a finger on the left side of the screen should fly the helicopter around.');
    if (b.ghost !== 'none') fail('The ghost joystick should go away while you are steering.'); }
  await shot('3a-ghost-joystick');
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

  // something really tall and thin over the helicopter (like a cable or a pole): it still rises smoothly, never jumps up
  // into the sky, and once it's up the joystick flies it away instead of it getting stuck
  await G(() => { const G = window.__game, H = G.heli(), T = G.THREE;
    const pole = new T.Mesh(new T.CylinderGeometry(.05, .05, 1, 6), new T.MeshBasicMaterial()); pole.name = 'test-cable';
    const a = new T.Vector3(H.pos.x - 9, 1, H.pos.z - 9), b = new T.Vector3(H.pos.x + 9, 60, H.pos.z + 9);
    pole.position.copy(a).add(b).multiplyScalar(.5); pole.scale.y = a.distanceTo(b); pole.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    G.scene.add(pole); window.__testCable = pole; G.player.pos.set(H.pos.x + 2.6, 0, H.pos.z + 1.5); });
  await until(() => /Get in/.test(document.querySelector('#heliBtn').textContent) && document.querySelector('#heliBtn').style.display === 'block', 'walk back up to it: 🚁 Get in');
  await G(() => document.querySelector('#heliBtn').click());
  await until(() => window.__game.heli().on && window.__game.heliModel().rpm > .9, 'in again, rotor spinning');
  const fl = await G(() => { const G = window.__game, P = G.heli().pos; return G.flyFloor(P.x, P.z, 3); });
  if (fl < 50) fail(`The test cable should be in the way (floor ${fl.toFixed(1)}).`);
  const y0 = await G(() => window.__game.heli().pos.y);
  await G(() => { window.__game.keys.Space = true; });
  await page.waitForTimeout(500);
  const y1 = await G(() => window.__game.heli().pos.y);
  if (y1 - y0 > 6) fail(`It should rise smoothly like a real helicopter, it jumped ${(y1 - y0).toFixed(1)} up in half a second.`);
  await page.waitForFunction(() => window.__game.heli().pos.y > 43, null, { timeout: 120_000, polling: 250 }).catch(() => fail('It should climb up to the top.'));
  await G(() => { window.__game.keys.Space = false; });
  const s0 = await G(() => ({ x: window.__game.heli().pos.x, z: window.__game.heli().pos.z }));
  await G(() => { window.__game.joy.x = 1; });
  await page.waitForTimeout(3000);
  const s1 = await G(() => ({ x: window.__game.heli().pos.x, z: window.__game.heli().pos.z }));
  await G(() => { window.__game.joy.x = 0; window.__game.scene.remove(window.__testCable); });
  const gone = Math.hypot(s1.x - s0.x, s1.z - s0.z);
  console.log(`up past something too tall to fly over, the joystick flew it ${gone.toFixed(1)}`);
  if (gone < 10) fail('The joystick should still fly the helicopter when something too tall is in the way.');
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ The helicopter can be won or bought, flies over the trees, lands on the Helipad and comes when you call.');
} finally {
  await browser.close();
  server.close();
}
