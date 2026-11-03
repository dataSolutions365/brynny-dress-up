// Dolphin Bay test: you can walk off the Beach into the sea and swim (only in the bay, and not on a bike), the dolphins,
// Big Blue the whale and Shelly the sea turtle come and swim beside you, you can feed them, and the sea rides stay locked until
// their 🌊 Ocean challenges are done; then you sit on their back. Run it with:  node 3d/tests/ocean.mjs   SHOTS=folder saves pictures.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
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
  await page.addInitScript(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', 1);
    localStorage.setItem('brynny3d.v1', JSON.stringify({ chal: { done: {}, n: {}, u: {}, found: 0, stars: 0, day: null, intro: 1 } })); });
  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);
  // Test computers have no graphics card, so the world isn't drawn while the test runs. SHOTS draws it again for each picture.
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const did = (k, a) => page.evaluate(([k, a]) => dispatchEvent(new CustomEvent('brynny:did', { detail: { k, a } })), [k, a]);
  const st = () => page.evaluate(() => { const G = window.__game, p = G.player.pos, B = G.BAY, sw = G.sea(), av = G.av();
    return { x: p.x, z: p.z, d: Math.hypot(p.x, p.z), bay: Math.hypot(p.x - B.x, p.z - B.z), k: sw.k, ride: sw.ride ? sw.ride.nm : null, avY: av.g.position.y, pitch: av.hips.rotation.x, s: G.seaState(), zone: (G.zone() || {}).id }; });
  const R = await page.evaluate(() => { const b = window.__game.Z.beach; return Math.hypot(b.x, b.z) + 10.5; });
  const B = await page.evaluate(() => ({ x: window.__game.BAY.x, z: window.__game.BAY.z, r: window.__game.BAY.r }));
  // walk from the Beach straight out to sea (the bay is straight past the Beach, away from the middle of the island)
  const ux = B.x / Math.hypot(B.x, B.z), uz = B.z / Math.hypot(B.x, B.z);
  const face = async f => page.evaluate(f => { const G = window.__game; G.player.face = f; G.cam.yaw = f + Math.PI; G.cam.cy = G.cam.yaw; }, f);
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [ux * (R - 4), uz * (R - 4)]);
  await face(Math.atan2(ux, uz));
  await page.waitForTimeout(500);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(3500); await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(1200);
  let s = await st();
  console.log(`walked out: ${s.d.toFixed(1)} from the middle (shore at ${R}), deep ${s.k.toFixed(2)}, body at ${s.avY.toFixed(2)}, zone ${s.zone}`);
  if (s.d < R + 4) fail(`You should be able to walk off the Beach into the sea (got to ${s.d.toFixed(1)}, the shore is at ${R}).`);
  if (s.k < .9) fail(`Out in the bay you should be swimming (deep ${s.k.toFixed(2)}).`);
  if (s.avY > -.9) fail(`A swimmer's body should be down in the water (it is at ${s.avY.toFixed(2)}).`);
  if (s.zone !== 'bay') fail(`Out there you should be in Dolphin Bay, not ${s.zone}.`);
  // swim on, further out: you lie down and swim, and it counts
  const sw0 = s.s.swum;
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(1200);
  const mid = await st(); await page.keyboard.up('ArrowUp');
  if (mid.pitch < .7) fail(`Swimming forward you should lie down in the water (lean ${mid.pitch.toFixed(2)}).`);
  if (SHOTS) { await page.keyboard.down('ArrowUp'); await page.evaluate(() => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + 1; }); await shot('swimming'); await page.keyboard.up('ArrowUp'); }
  await page.waitForTimeout(800); s = await st();
  if (s.s.swum <= sw0) fail('Swimming should count steps for the 🌊 Ocean challenges.');
  if (s.bay > B.r) fail(`You should stay inside the bay (${s.bay.toFixed(1)} from its middle, it is ${B.r} big).`);

  // the open sea everywhere else is still off limits
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [-ux * (R + 8), -uz * (R + 8)]);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');// moving is what keeps you in bounds
  await page.waitForTimeout(400); s = await st();
  if (s.d > R + 1) fail(`Out at sea on the far side of the island you should be put back on the shore (at ${s.d.toFixed(1)}).`);

  // the sea animals come and swim next to you
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [B.x, B.z]);
  let close = {};
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    close = await page.evaluate(() => { const G = window.__game, p = G.player.pos, o = {}; for (const c of G.SEAS) { if (c.fixed) continue; const d = Math.hypot(c.pos.x - p.x, c.pos.z - p.z); o[c.kind] = Math.min(o[c.kind] ?? 99, d); } return o; });
    if (close.dolphin < 3.5 && close.whale < 7 && close.turtle < 3) break;
  }
  console.log('closest to you: ' + Object.entries(close).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', '));
  if (!(close.dolphin < 3.5)) fail('The dolphins should come and swim right next to you.');
  if (!(close.whale < 7)) fail('Big Blue should come and swim next to you.');
  if (!(close.turtle < 3)) fail('Shelly should come and swim next to you.');
  await page.waitForTimeout(2000);
  s = await st();
  if (!(s.s.dolphin >= 1 && s.s.whale >= 1 && s.s.turtle >= 1)) fail(`Swimming with them should count: ${JSON.stringify(s.s)}`);
  if (SHOTS) { await page.evaluate(() => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + .5; G.cam.pitch = .45; }); await shot('swimming-with-friends'); }

  // feed a dolphin with the 🐟 button; Splash's ride is locked
  await page.evaluate(() => { const G = window.__game, d = G.SEAS.find(c => c.nm === 'Splash'); G.player.pos.set(d.pos.x + .8, 0, d.pos.z); });
  await page.waitForTimeout(150);
  const fb = await page.evaluate(() => { const b = document.querySelector('#seaFeed'), r = document.querySelector('#seaRide'); return { feed: b.style.display, ft: b.textContent, ride: r.style.display, rt: r.textContent }; });
  if (fb.feed !== 'block' || !/Feed/.test(fb.ft)) fail(`Next to a dolphin there should be a Feed button (${JSON.stringify(fb)}).`);
  if (fb.ride !== 'block' || !/🔒/.test(fb.rt)) fail(`Next to Splash there should be a locked 🔒 Ride button (${JSON.stringify(fb)}).`);
  await page.evaluate(() => { document.querySelector('#seaFeed').click(); document.querySelector('#seaRide').click(); });
  await page.waitForTimeout(400);
  s = await st();
  if (s.ride) fail('Splash should not let you ride before her 🌊 Ocean challenges are done.');
  const fed = await page.evaluate(() => window.__chal.progress(window.__chal.list.find(c => c.id === 'sea_feedD')));
  if (fed !== 1) fail(`Feeding a dolphin should count for "Feed the dolphins 5 times" (it is ${fed}).`);

  // the 🌊 Ocean tab
  await page.evaluate(() => document.querySelector('#stars').click()); await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#chalTabs [data-tab="ocean"]').click()); await page.waitForTimeout(300);
  const txt = await page.evaluate(() => document.querySelector('#chalList').innerText);
  for (const n of ['Shelly', 'Splash', 'Big Blue', 'Feed the dolphins 5 times', '1 / 5', 'Pip the seal']) if (!txt.includes(n)) fail(`The Ocean tab should show "${n}".`);
  if (SHOTS) await shot('ocean-tab');
  await page.evaluate(() => document.querySelector('#chalDone').click());

  // finish Splash's challenges (and Shelly's): now you can ride them, sitting right on their back
  for (let i = 0; i < 4; i++) await did('seafeed', 'dolphin');
  for (const k of ['turtle', 'whale', 'seal']) await did('seafeed', k);
  await page.evaluate(() => { window.__game.SAVE.sea.with.dolphin = 50; });
  await page.waitForTimeout(3500);
  const own = await page.evaluate(() => Object.fromEntries(window.__game.seaRides().map(r => [r.k, r.own])));
  if (!own.splash) fail('Splash should be yours once her 3 challenges are done.');
  if (own.bigblue) fail('Big Blue should still be locked.');
  for (const nm of ['Splash', 'Shelly', 'Big Blue']) {
    if (nm === 'Shelly') await page.evaluate(() => { const D = window.__game.SAVE.chal.done; D.sea_swim = D.sea_turtle = D.sea_feedT = true; });
    if (nm === 'Big Blue') await page.evaluate(() => { const D = window.__game.SAVE.chal.done; D.sea_whale = D.sea_spout = D.sea_swim1k = D.sea_feedW = true; });
    await page.evaluate(nm => { const G = window.__game; if (G.sea().ride) G.seaHopOff(true); const d = G.SEAS.find(c => c.nm === nm); G.player.pos.set(d.pos.x + .8, 0, d.pos.z); }, nm);
    await page.waitForTimeout(150);
    await page.evaluate(() => document.querySelector('#seaRide').click());
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => { const G = window.__game, c = G.sea().ride, av = G.av(), T = G.THREE; if (!c) return null;
      av.g.updateMatrixWorld(true); c.g.updateMatrixWorld(true); const hip = new T.Vector3(); av.hips.getWorldPosition(hip);
      const meshes = []; c.g.traverse(o => { if (o.isMesh) meshes.push(o); });
      const hit = new T.Raycaster(new T.Vector3(hip.x, hip.y + 3, hip.z), new T.Vector3(0, -1, 0)).intersectObjects(meshes, false)[0];
      return { nm: c.nm, hipY: hip.y, backY: hit ? hit.point.y : null }; });
    if (!r) { fail(`Could not hop on ${nm}.`); continue; }
    if (r.backY == null) fail(`There's nothing under the rider on ${nm}.`);
    else { const gap = r.hipY - r.backY; console.log(`${nm}: hips ${r.hipY.toFixed(2)}, back ${r.backY.toFixed(2)}, gap ${gap.toFixed(2)}`);
      if (gap < -.05 || gap > .22) fail(`On ${nm} the rider should sit right on the back, the gap is ${gap.toFixed(2)} m.`); }
    if (SHOTS) { await page.evaluate(() => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + 1.2; G.cam.pitch = .3; }); await shot('ride-' + nm.replace(' ', '').toLowerCase()); }
    const p0 = await st();
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(1000); await page.keyboard.up('ArrowUp');
    const p1 = await st();
    console.log(`${nm} went ${Math.hypot(p1.x - p0.x, p1.z - p0.z).toFixed(1)} in 1 s`);
    if (Math.hypot(p1.x - p0.x, p1.z - p0.z) < 1) fail(`${nm} did not swim.`);
  }
  // back on the sand you hop off by yourself and stand up
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [ux * (R - 3), uz * (R - 3)]);
  await page.waitForTimeout(1500); s = await st();
  if (s.ride) fail('Back on the sand you should hop off your sea ride.');
  if (s.k > .05 || Math.abs(s.avY) > .05) fail(`Back on the sand you should stand up again (deep ${s.k.toFixed(2)}, body at ${s.avY.toFixed(2)}).`);

  // no swimming on a bike
  await page.evaluate(() => { const G = window.__game; G.SAVE.owned = G.SAVE.owned || {}; G.SAVE.owned['look:bicycle'] = 1;
    G.SAVE.look.extras = G.SAVE.look.extras || {}; G.SAVE.look.extras.bicycle = '#ff6fae'; G.toggleBike(); });
  await page.waitForTimeout(1000);
  if (!(await page.evaluate(() => window.__game.bike().on))) fail('Could not get on the bike for the test.');
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [B.x + 6, B.z]);// (not straight out past the dock, you can ride along that)
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');// moving is what keeps you in bounds
  await page.waitForTimeout(400); s = await st();
  if (s.d > R + 1) fail(`On a bike you should stay on the shore (at ${s.d.toFixed(1)}).`);
  await page.evaluate(() => window.__game.toggleBike());

  // friends online are told you're swimming
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [B.x, B.z]);
  await page.waitForTimeout(1500);
  if (!(await page.evaluate(() => window.__game.myShow().sea))) fail('Friends online should be told you are swimming (SHOW sea).');

  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ You swim in Dolphin Bay with the dolphins, Big Blue and Shelly, feed them, and ride them once their Ocean challenges are done.');
} finally { await browser.close(); server.close(); }
