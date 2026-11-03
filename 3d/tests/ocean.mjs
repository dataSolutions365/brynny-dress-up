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

  // the canal goes all the way round: you can swim on the far side of the island too, but not past the far bank
  const C = await page.evaluate(() => window.__game.CANAL);
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [-ux * (R + 9), -uz * (R + 9)]);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(900); s = await st();
  console.log(`far side: ${s.d.toFixed(1)} from the middle, deep ${s.k.toFixed(2)}, zone ${s.zone}`);
  if (s.d < R + 5 || s.k < .9) fail(`You should be able to swim in the canal on the far side of the island (at ${s.d.toFixed(1)}, deep ${s.k.toFixed(2)}).`);
  if (s.zone !== 'canal') fail(`Out in the canal you should be in the Canal, not ${s.zone}.`);
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [-ux * (C.outR + 10), -uz * (C.outR + 10)]);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(300); s = await st();
  if (s.d > C.outR) fail(`You should stay on the water side of the far bank (at ${s.d.toFixed(1)}, the bank is at ${C.outR}).`);
  if (SHOTS) { await page.evaluate(([x, z]) => { const G = window.__game; G.player.pos.set(x, 0, z); G.cam.yaw = Math.atan2(x, z) + Math.PI / 2; G.cam.pitch = .25; }, [-ux * (R + 9), -uz * (R + 9)]); await shot('canal-far-side'); }

  // the sea animals never follow you (only adopted pets do): they keep swimming their own way, and swimming next to one counts
  const near = async (nm, gap) => { await page.evaluate(([nm, gap]) => { const G = window.__game, c = G.SEAS.find(c => c.nm === nm), a = Math.atan2(c.pos.x, c.pos.z);
    G.player.pos.set(c.pos.x - Math.sin(a) * gap, 0, c.pos.z - Math.cos(a) * gap); }, [nm, gap]); };// beside it, toward the island
  for (const [nm, gap] of [['Splash', 2], ['Big Blue', 4.5], ['Shelly', 1.5], ['Ray', 2.5], ['Ollie', 1.2]]) {
    await near(nm, gap); await page.waitForTimeout(150);
    const a0 = await page.evaluate(nm => { const G = window.__game, c = G.SEAS.find(c => c.nm === nm); return { x: c.pos.x, z: c.pos.z }; }, nm);
    await page.waitForTimeout(3000);
    const r = await page.evaluate(([nm, a0]) => { const G = window.__game, c = G.SEAS.find(c => c.nm === nm), p = G.player.pos;
      return { you: Math.hypot(c.pos.x - p.x, c.pos.z - p.z), went: Math.hypot(c.pos.x - a0.x, c.pos.z - a0.z), mode: c.mode }; }, [nm, a0]);
    console.log(`${nm}: swam ${r.went.toFixed(1)} on its way, now ${r.you.toFixed(1)} from you (you stayed still)`);
    if (r.went < 1.5) fail(`${nm} should keep swimming its own way (moved ${r.went.toFixed(1)}).`);
    if (r.you < r.went * .6) fail(`${nm} should not follow you (it is ${r.you.toFixed(1)} from you after swimming ${r.went.toFixed(1)}).`);
  }
  s = await st();
  if (!(s.s.dolphin >= 1 && s.s.whale >= 1 && s.s.turtle >= 1 && s.s.manta >= 1 && s.s.otter >= 1)) fail(`Swimming next to them should count: ${JSON.stringify(s.s)}`);
  if (s.s.kinds < 5) fail(`Five different sea animals should count for "Swim next to 5 different sea animals" (${s.s.kinds}).`);
  if (SHOTS) for (const [nm, gap, turn] of [['Ray', 3, .9], ['Ollie', 2, .6]]) { await near(nm, gap); await page.evaluate(t => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + t; G.cam.pitch = .45; }, turn); await shot('swimming-next-to-' + nm.toLowerCase()); }
  // feed Ollie the otter
  await page.evaluate(() => { const G = window.__game, d = G.SEAS.find(c => c.nm === 'Ollie'); G.player.pos.set(d.pos.x + .8, 0, d.pos.z); });
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('#seaFeed').click()); await page.waitForTimeout(200);
  if (await page.evaluate(() => window.__chal.progress(window.__chal.list.find(c => c.id === 'sea_otter'))) !== 1) fail('Feeding Ollie should count for "Feed Ollie the sea otter 3 times".');
  if (SHOTS) { await near('Splash', 2.5); await page.evaluate(() => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + .5; G.cam.pitch = .45; }); await shot('swimming-next-to-dolphins'); }

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
  for (const n of ['Shelly', 'Splash', 'Big Blue', 'Feed the dolphins 5 times', '1 / 5', 'Pip the seal', 'Feed Pip 5 times', 'More sea friends', 'The great white', 'Get away from the great white 3 times']) if (!txt.includes(n)) fail(`The Ocean tab should show "${n}".`);
  if (SHOTS) await shot('ocean-tab');
  await page.evaluate(() => document.querySelector('#chalDone').click());

  // finish Splash's challenges (and Shelly's): now you can ride them, sitting right on their back
  for (let i = 0; i < 4; i++) await did('seafeed', 'dolphin');
  for (const k of ['turtle', 'whale']) await did('seafeed', k);
  await page.evaluate(() => { window.__game.SAVE.sea.with.dolphin = 50; });
  await page.waitForTimeout(3500);
  const own = await page.evaluate(() => Object.fromEntries(window.__game.seaRides().map(r => [r.k, r.own])));
  if (!own.splash) fail('Splash should be yours once her 3 challenges are done.');
  if (own.bigblue) fail('Big Blue should still be locked.');
  if (own.pip) fail('Pip should still be locked.');
  for (const nm of ['Splash', 'Shelly', 'Big Blue', 'Pip']) {
    if (nm === 'Shelly') await page.evaluate(() => { const D = window.__game.SAVE.chal.done; D.sea_swim = D.sea_turtle = D.sea_feedT = true; });
    if (nm === 'Big Blue') await page.evaluate(() => { const D = window.__game.SAVE.chal.done; D.sea_whale = D.sea_spout = D.sea_swim1k = D.sea_feedW = true; });
    if (nm === 'Pip') await page.evaluate(() => { const D = window.__game.SAVE.chal.done; D.sea_pip = D.sea_feedP = D.sea_meet = true; });
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
  // hop off Pip and she swims home to her rock
  await page.evaluate(() => window.__game.seaHopOff()); await page.waitForTimeout(300);
  if (!(await page.evaluate(() => { const c = window.__game.SEAS.find(c => c.nm === 'Pip'); return c.fixed && c.g.parent && c.g.parent.parent === window.__game.scene; })))
    fail('After you hop off, Pip should be back on her rock.');

  // 🦈 the great white: he comes from behind and chases you. Stay still and he just bumps you and swims off; reach the shore and you get away.
  const sh = () => page.evaluate(() => { const G = window.__game, S = G.shark(), p = G.player.pos; return { on: S.on, mode: S.mode, d: Math.hypot(S.pos.x - p.x, S.pos.z - p.z), seen: S.m.g.visible, s: G.seaState() }; });
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [-ux * (R + 9), -uz * (R + 9)]);
  await page.waitForTimeout(800);
  if (!(await page.evaluate(() => window.__game.sharkStart(true)))) fail('The great white should be able to show up in the canal.');
  let k = await sh();
  console.log(`great white: ${k.mode}, ${k.d.toFixed(1)} away`);
  if (k.mode !== 'chase' || !k.seen || k.d < 9) fail(`The great white should start a chase from a way off (${JSON.stringify(k)}).`);
  if (SHOTS) { await page.waitForTimeout(1500); await page.evaluate(() => { const G = window.__game, S = G.shark(); G.cam.yaw = Math.atan2(G.player.pos.x - S.pos.x, G.player.pos.z - S.pos.z); G.cam.pitch = .35; }); await shot('great-white-chase'); }
  for (let i = 0; i < 20 && (await sh()).mode === 'chase'; i++) await page.waitForTimeout(500);
  k = await sh();
  if (k.s.sharkTag !== 1) fail(`Staying still, the great white should catch up and bump you (bumps: ${k.s.sharkTag}, ${k.mode}).`);
  await page.waitForTimeout(5000); k = await sh();
  if (k.on) fail('After the bump the great white should swim off and go away.');
  await page.evaluate(() => window.__game.sharkStart(true)); await page.waitForTimeout(500);
  await page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [ux * (R - 3), uz * (R - 3)]);
  await page.waitForTimeout(800); k = await sh();
  if (k.s.sharkEsc !== 1 || k.mode === 'chase') fail(`Getting to the shore should count as getting away (${JSON.stringify(k)}).`);
  if (await page.evaluate(() => window.__chal.progress(window.__chal.list.find(c => c.id === 'sea_shark'))) !== 1) fail('Getting away should count for "Get away from the great white 3 times".');
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
  await face(Math.atan2(ux, uz));
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
