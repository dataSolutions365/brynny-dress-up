// ❄️ Polar Ice test: the place is on the island with its animals, you skate on the rink (and spin), catch fish through the ice,
// build an igloo block by block, play a Polar escape (catch the runaways round town and walk them home), and the 4 polar rides
// stay locked until their ❄️ Polar challenges are done, then you sit right on their backs.
// Run it with:  node 3d/tests/arctic.mjs   SHOTS=folder saves pictures.
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
  // Test computers have no graphics card, so the world isn't drawn while the test runs. SHOTS draws it again for each picture.
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const state = () => page.evaluate(() => window.__game.iceState());
  // stand somewhere at Polar Ice, given in the place's own directions (+z toward the middle of town)
  const goIce = (lx, lz, face = 0) => page.evaluate(([lx, lz, face]) => { const G = window.__game, z = G.ZONES.find(z => z.id === 'arctic'), [x, w] = z.toWorld(lx, lz);
    G.player.pos.set(x, .05, w); G.player.vy = 0; G.player.speed = 0; G.player.face = face + z.rot; G.cam.yaw = face + z.rot + Math.PI; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; }, [lx, lz, face]);
  const btn = () => page.evaluate(() => { const a = document.querySelector('#iceAct'), b = document.querySelector('#iceAct2');
    return { a: a.style.display !== 'none' ? a.textContent : '', b: b.style.display !== 'none' ? b.textContent : '' }; });

  // ❄️ the place and its animals
  const place = await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'arctic'); return z && { name: z.name, d: Math.hypot(z.x, z.z), kinds: [...new Set(G.IA.map(a => a.k))] }; });
  if (!place) fail('There should be a ❄️ Polar Ice place on the island.');
  else { console.log(`${place.name}: ${place.d.toFixed(0)} m from the middle, animals: ${place.kinds.join(', ')}`);
    for (const k of ['polarbear', 'walrus', 'penguin', 'arcticfox', 'arcticwolf', 'snowyowl']) if (!place.kinds.includes(k)) fail(`Polar Ice should have a ${k}.`); }
  // the animals stay inside Polar Ice and never follow you
  await goIce(0, 4); await page.waitForTimeout(6000);
  const out = await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'arctic'); return G.IA.filter(a => Math.hypot(a.pos.x - z.x, a.pos.z - z.z) > z.r + .5).map(a => a.k); });
  if (out.length) fail(`These polar animals wandered out of Polar Ice: ${out.join(', ')}.`);
  if (SHOTS) await shot('polar-ice');

  // ⛸️ skating: step onto the rink, the skates go on, you keep gliding when you let go, and Spin works
  const rink = await page.evaluate(() => window.__game.ICE.rink);
  await goIce(rink.x, rink.z + rink.rz - .6, Math.PI);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700);
  let s = await state();
  if (!s.skating) fail('Walking onto the ice rink should put skates on.');
  await page.waitForTimeout(500); await page.keyboard.up('ArrowUp');
  const glide = await page.evaluate(async () => { const G = window.__game, p = G.player.pos, a = { x: p.x, z: p.z }; await new Promise(r => setTimeout(r, 500)); return Math.hypot(p.x - a.x, p.z - a.z); });
  console.log(`glided ${glide.toFixed(2)} m in half a second after letting go`);
  if (!(glide > .05)) fail('You should keep gliding on the ice after letting go.');
  if ((await btn()).a !== '🌀 Spin') fail(`On the ice the button should say Spin, it says "${(await btn()).a}".`);
  await page.evaluate(() => document.querySelector('#iceAct').click());
  s = await state();
  if (s.spins !== 1) fail(`Spin should count 1 spin, it is ${s.spins}.`);
  const blades = await page.evaluate(() => !!window.__game.av().iceB);
  if (!blades) fail('You should be wearing skates on the ice.');
  if (SHOTS) await shot('skating');
  // walk off the ice and the skates come off
  await goIce(0, 4);
  await page.waitForTimeout(800);
  s = await state();
  if (s.skating) fail('The skates should come off when you leave the rink.');

  // 🎣 ice fishing: stand at a hole, cast, wait for the bite, reel in, and a fish is caught
  const hole = await page.evaluate(() => { const G = window.__game, h = G.holeWorld(0); return { x: h.x, z: h.z }; });
  await page.evaluate(h => window.__game.player.pos.set(h.x + .8, .05, h.z), hole);
  await page.waitForTimeout(600);
  if ((await btn()).a !== '🎣 Ice fish') fail(`At the fishing hole the button should say Ice fish, it says "${(await btn()).a}".`);
  await page.evaluate(() => document.querySelector('#iceAct').click());
  s = await state();
  if (s.fishing !== 'wait') fail(`After casting you should be waiting for a bite, state is "${s.fishing}".`);
  // test computers are slow, so skip the wait for the bite
  await page.evaluate(() => { window.__game.ICF.t = 0; });
  await page.waitForFunction(() => window.__game.ICF.st === 'bite', null, { timeout: 15_000 }).catch(() => fail('A fish should bite.'));
  await page.evaluate(() => document.querySelector('#iceAct').click());
  s = await state();
  if (s.fish !== 1 || s.fishing !== 'caught') fail(`Reeling in on a bite should catch a fish (caught ${s.fish}, state "${s.fishing}").`);
  if (SHOTS) await shot('fish');
  await page.evaluate(() => document.querySelector('#iceAct2').click());
  if ((await state()).fishing) fail('Stop fishing should put the rod away.');

  // 🧊 the igloo: keep tapping, ring by ring, then the tunnel and the lamp
  const ig = await page.evaluate(() => window.__game.ICE.igloo);
  await goIce(ig.x, ig.z + 1.75 + 1);
  await page.waitForTimeout(600);
  if (!(await btn()).a.includes('igloo')) fail(`Next to the igloo spot the button should build an igloo, it says "${(await btn()).a}".`);
  let taps = 0;
  for (; taps < 40 && !(await state()).igloo; taps++) { await page.evaluate(() => document.querySelector('#iceAct').click()); await page.waitForTimeout(150); }
  s = await state();
  console.log(`igloo built in ${taps} taps`);
  if (!s.igloo || s.igloos !== 1) fail(`Tapping should finish the igloo (built ${s.igloo}, count ${s.igloos}).`);
  else if (taps < 8) fail(`Building an igloo should take a while, it took only ${taps} taps.`);
  // you can't walk through it
  await page.waitForTimeout(1200);
  await goIce(ig.x, ig.z - 1.75 - 1.2, 0);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(2500); await page.keyboard.up('ArrowUp');
  const inside = await page.evaluate(ig => { const G = window.__game, z = G.ZONES.find(z => z.id === 'arctic'), [x, w] = z.toWorld(ig.x, ig.z); return Math.hypot(G.player.pos.x - x, G.player.pos.z - w); }, ig);
  if (inside < 1.2) fail(`You should not walk through the igloo's wall (got ${inside.toFixed(2)} m from its middle).`);
  if (SHOTS) { await goIce(ig.x + 1, ig.z + 5, Math.PI); await shot('igloo'); }

  // 🚨 Polar escape: 4 animals run off into town; catch each one and walk it back
  await goIce(0, 3);
  await page.waitForTimeout(600);
  if ((await btn()).a !== '🚨 Start a Polar escape!') fail(`At Polar Ice the button should start a Polar escape, it says "${(await btn()).a}".`);
  await page.evaluate(() => document.querySelector('#iceAct').click());
  await page.waitForTimeout(2500);
  let pe = await page.evaluate(() => window.__game.peState());
  if (!pe.on || pe.n !== 4) fail(`A Polar escape should start with 4 runaways (${JSON.stringify(pe)}).`);
  const far = await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'arctic'); return G.PE_ANI.map(c => Math.hypot(c.pos.x - z.x, c.pos.z - z.z)); });
  if (!far.every(d => d > 10)) fail(`The runaways should be out in town, they are ${far.map(d => d.toFixed(0)).join(', ')} m from Polar Ice.`);
  for (let i = 0; i < 4; i++) {
    const nm = await page.evaluate(i => { const G = window.__game, c = G.PE_ANI[i]; G.player.pos.set(c.pos.x + 1, 0, c.pos.z); return c.nm; }, i);
    await page.waitForFunction(() => document.querySelector('#peCatch').style.display === 'block' && document.querySelector('#peCatch').textContent.includes('Catch'), null, { timeout: 10_000 })
      .catch(() => fail(`A Catch button should show next to ${nm}.`));
    await page.evaluate(() => document.querySelector('#peCatch').click());
    pe = await page.evaluate(() => window.__game.peState());
    if (pe.rope !== nm) { fail(`${nm} should be on the rope (rope: ${pe.rope}).`); continue; }
    if (i === 0 && SHOTS) await shot('escape-rope');
    // walk back toward Polar Ice: the animal follows on the rope and goes home when you get there
    await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'arctic'); G.player.pos.set(z.x * .8, 0, z.z * .8); });
    await page.waitForTimeout(800);
    await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'arctic'); G.player.pos.set(z.x, 0, z.z); });
    await page.waitForTimeout(1200);
    pe = await page.evaluate(() => window.__game.peState());
    if (pe.home !== i + 1) fail(`Walking ${nm} back to Polar Ice should bring it home (${pe.home} home).`);
  }
  pe = await page.evaluate(() => window.__game.peState());
  if (pe.on || pe.escapes !== 1 || pe.homeAll !== 4) fail(`The escape should end once all 4 are home (${JSON.stringify(pe)}).`);

  // 🐻‍❄️ the polar rides: locked until all of their ❄️ Polar challenges are done
  const RIDES = { nanuq: ['ice_feedB', 'ice_fish10', 'ice_escape3'], tusk: ['ice_feedW', 'ice_fish20', 'ice_swim'],
    ukpik: ['ice_meetAll', 'ice_igloo', 'ice_spins'], amaruq: ['ice_home12', 'ice_gold', 'ice_skate'] };
  const own = () => page.evaluate(() => Object.fromEntries(window.__game.earnedRides().map(x => [x.k, x.own])));
  let o = await own();
  for (const k in RIDES) if (o[k]) fail(`${k} should be locked at the start.`);
  // the ❄️ Polar tab lists them with their challenges
  await page.evaluate(() => document.querySelector('#stars').click());
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#chalTabs [data-tab="polar"]').click());
  await page.waitForTimeout(300);
  const txt = await page.evaluate(() => document.querySelector('#chalList').innerText);
  for (const n of ['Nanuq', 'Tusk', 'Ukpik', 'Amaruq', 'Catch 10 fish', 'Build 3 igloos', 'Do 25 spins', 'Build an igloo'])
    if (!txt.includes(n)) fail(`The Polar tab should show "${n}".`);
  const doneNow = await page.evaluate(() => ['ice_skate1', 'ice_spin1', 'ice_fish1', 'ice_igloo1', 'ice_start'].filter(id => !window.__game.SAVE.chal.done[id]));
  if (doneNow.length) fail(`These Polar challenges should be done by now: ${doneNow.join(', ')}.`);
  if (SHOTS) await shot('polar-tab');
  await page.evaluate(() => document.querySelector('#chalDone').click());
  // two of Nanuq's three isn't enough; all three is
  await page.evaluate(ids => { const D = window.__game.SAVE.chal.done; for (const id of ids) D[id] = true; }, RIDES.nanuq.slice(0, 2));
  await page.waitForTimeout(3000);
  if ((await own()).nanuq) fail('Nanuq should not come with only 2 of 3 challenges done.');
  await page.evaluate(R => { const D = window.__game.SAVE.chal.done; for (const k in R) for (const id of R[k]) D[id] = true; }, RIDES);
  // the rides come one at a time, a moment apart
  await page.waitForFunction(() => ['nanuq', 'tusk', 'ukpik', 'amaruq'].every(k => window.__game.earnedRides().find(x => x.k === k).own), null, { timeout: 20_000 }).catch(() => {});
  o = await own();
  for (const k in RIDES) if (!o[k]) fail(`${k} should come once all its Polar challenges are done.`);

  for (const k in RIDES) {
    await page.evaluate(k => { const G = window.__game; if (G.ride()) G.stopRide(true); G.player.pos.set(6, 0, 12); G.getMount(k); }, k);
    await page.waitForTimeout(1200);
    await page.evaluate(k => window.__game.callSteed(k), k);
    await page.waitForTimeout(1500);
    if (k === 'ukpik') { const j = await page.evaluate(() => document.querySelector('#jump').textContent); if (!j.includes('FLY')) fail(`Ukpik the owl should be able to fly, the jump button says "${j}".`); }
    const r = await page.evaluate(() => { const G = window.__game, a = G.ride(), av = G.av(), T = G.THREE;
      av.g.updateMatrixWorld(true); a.g.updateMatrixWorld(true);
      const hip = new T.Vector3(); av.hips.getWorldPosition(hip);
      const rc = new T.Raycaster(new T.Vector3(hip.x, hip.y + 3, hip.z), new T.Vector3(0, -1, 0)), meshes = [];
      a.g.traverse(o => { if (o.isMesh && o !== a.tag && o !== a.say) meshes.push(o); });
      const hit = rc.intersectObjects(meshes, false).filter(h => h.object.parent !== av.g)[0];
      return { k: a && a.k, hipY: hip.y, backY: hit ? hit.point.y : null }; });
    if (r.k !== k) fail(`Could not hop on ${k}.`);
    else if (r.backY == null) fail(`There's nothing under the rider on ${k}.`);
    else { const gap = r.hipY - r.backY; console.log(`${k}: gap ${gap.toFixed(2)} m`);
      if (gap < -.02 || gap > .2) fail(`On ${k} the rider's hips should sit on its back, the gap is ${gap.toFixed(2)} m.`); }
    const p0 = await page.evaluate(() => ({ ...window.__game.player.pos }));
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(2500); await page.keyboard.up('ArrowUp');
    const p1 = await page.evaluate(() => ({ ...window.__game.player.pos }));
    if (Math.hypot(p1.x - p0.x, p1.z - p0.z) < .5) fail(`${k} did not walk.`);
    if (SHOTS) await shot('ride-' + k);
  }
  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ Polar Ice works: animals, skating, ice fishing, igloo, Polar escape and the 4 polar rides.');
} finally { await browser.close(); server.close(); }
