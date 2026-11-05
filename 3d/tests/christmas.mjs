// 🎄 Christmas test: with Christmas on in town (?holiday=christmas), the big tree stands in the middle with the dress-up pad
// in front of it, the street lights and buildings have lights, Halloween Hollow's pumpkins and ghosts are put away,
// Santa walks round town, a snowball hits whoever you aim at, and you can roll and stack a whole snowman.
// It also checks that with Halloween on the pumpkins come back and none of the Christmas things are there.
// Run it with:  node 3d/tests/christmas.mjs   SHOTS=folder saves pictures.
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
const base = `http://127.0.0.1:${server.address().port}/3d/index.html`;

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const SHOTS = process.env.SHOTS;
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function open(q) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  await page.route(/gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());
  await page.addInitScript(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', 1);
    localStorage.setItem('brynny3d.v1', JSON.stringify({ name: 'Brynny', chal: { done: {}, n: {}, u: {}, found: 0, stars: 0, day: null, intro: 1 } })); });
  await page.goto(base + q, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && window.__chal && window.__season && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);
  // drawing is slow on the test machine's software graphics: only draw for pictures
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  return { page, errors, ctx, shot };
}
// walk the player in small steps (the game moves things from frame to frame)
const walk = (page, dx, dz, steps = 40) => page.evaluate(async ([dx, dz, steps]) => { const p = window.__game.player;
  for (let i = 0; i < steps; i++) { p.pos.x += dx / steps; p.pos.z += dz / steps; p.face = Math.atan2(dx, dz); await new Promise(r => setTimeout(r, 40)); } }, [dx, dz, steps]);

try {
  /* ---------- Christmas ---------- */
  const { page, errors, ctx, shot } = await open('?holiday=christmas');
  // 🎶 walking around town plays the Christmas songs, and every song file is there
  const mu = await page.evaluate(async () => { const G = window.__game, L = (G.PLAYLISTS || {})['xmas-town'] || [];
    const ok = await Promise.all(L.map(n => fetch(`../audio/${n}.mp3`, { method: 'HEAD' }).then(r => r.ok, () => false)));
    return { music: G.PARK && G.PARK.music, songs: L.length, missing: L.filter((n, i) => !ok[i]) }; });
  if (mu.music !== 'xmas-town' || mu.songs < 2) fail(`town should play the Christmas songs, got ${JSON.stringify(mu)}`);
  if (mu.missing.length) fail(`Christmas song files missing: ${mu.missing.join(', ')}`);
  console.log(`🎶 town plays ${mu.songs} Christmas songs`);
  const s = await page.evaluate(() => { const G = window.__game, X = window.__xmas, hz = G.Z.halloween;
    return { on: !!X, tree: X && X.tree, pad: { x: G.Z.studio.pad.x, z: G.Z.studio.pad.z }, treeOb: G.obs.some(o => Math.hypot(o.x, o.z) < .1 && o.r > 1.5),
      bulbs: X && X.bulbs(), building: window.__xmasBuildingBulbs || 0, spooky: hz.spooky.parts.filter(p => p.visible).length, spookyObs: hz.spooky.obs.filter(o => G.obs.includes(o)).length,
      tab: !!document.querySelector('#chalTabs') }; });
  console.log('christmas:', JSON.stringify(s));
  if (!s.on) fail('christmas.js did not turn on with ?holiday=christmas');
  if (!s.treeOb) fail('the big tree in the middle of town has nothing to bump into');
  if (Math.hypot(s.pad.x, s.pad.z) < 2.5) fail(`the dress-up pad should move out from under the tree (it is at ${JSON.stringify(s.pad)})`);
  if (!(s.bulbs > 1500)) fail(`too few Christmas lights (${s.bulbs})`);
  if (!(s.building > 300)) fail(`the buildings have too few lights (${s.building})`);
  if (s.spooky || s.spookyObs) fail(`Halloween Hollow's pumpkins and ghosts are still out at Christmas (${s.spooky} shown, ${s.spookyObs} still in the way)`);
  await shot('christmas-start');

  // 👗 stepping on the moved pad opens the closet
  const closet = await page.evaluate(async () => { const G = window.__game, p = G.player; p.pos.set(G.Z.studio.pad.x, 0, G.Z.studio.pad.z + 2); await new Promise(r => setTimeout(r, 300));
    p.pos.set(G.Z.studio.pad.x, 0, G.Z.studio.pad.z); await new Promise(r => setTimeout(r, 600)); const open = G.closetOpen(); if (open) G.closeCloset(); return open; });
  if (!closet) fail('stepping on the moved dress-up pad does not open the closet');
  await page.evaluate(() => window.__game.player.pos.set(-40, 0, 30)); // out of Santa's way, so he doesn't stop for you

  // 🎅 Santa walks
  const a = await page.evaluate(() => window.__xmas.santa());
  await page.waitForTimeout(4000);
  const b = await page.evaluate(() => window.__xmas.santa());
  const moved = Math.hypot(a.x - b.x, a.z - b.z);
  console.log(`santa walked ${moved.toFixed(2)} steps`);
  if (moved < 1) fail('Santa is not walking round town');
  // walking up to Santa: he says hi and gives a present
  // (the present comes a moment after he says hi; give a slow test machine up to 15 seconds)
  await page.evaluate(() => { const G = window.__game, s = window.__xmas.santa(); G.SAVE.xmas.gift = null; window.__c0 = G.SAVE.coins || 0; G.player.pos.set(s.x + 1.2, 0, s.z + 1.2); });
  await page.waitForFunction(() => (window.__game.SAVE.coins || 0) - window.__c0 >= 25, null, { timeout: 15_000 }).catch(() => {});
  const gift = await page.evaluate(() => { const G = window.__game; return { gift: G.SAVE.xmas.gift, coins: (G.SAVE.coins || 0) - window.__c0, hi: window.__chal.isDone(window.__chal.list.find(c => c.id === 'xs_santa')) }; });
  console.log('santa:', JSON.stringify(gift));
  if (!gift.gift || gift.coins < 25) fail('Santa did not give a present');
  if (!gift.hi) fail('saying hi to Santa did not count for the challenge');
  await shot('santa');

  // ❄️ a snowball thrown at a townsperson in front of you hits them
  const hit = await page.evaluate(async () => { const G = window.__game, f = G.FRIENDS[0], p = G.player;
    p.pos.set(30, 0, -20); f.pos.set(30, 0, -14); f.tgt = null; f.wait = 99; p.face = 0;
    await new Promise(r => setTimeout(r, 200)); G.doAction('snowball'); await new Promise(r => setTimeout(r, 2000));
    const C = window.__chal, ch = C.list.find(c => c.id === 'xs_hit'); return { thrown: C.isDone(C.list.find(c => c.id === 'xs_throw')), hit: C.isDone(ch) }; });
  console.log('snowball:', JSON.stringify(hit));
  if (!hit.thrown) fail('throwing a snowball did not count');
  if (!hit.hit) fail('the snowball did not hit the townsperson in front of you');

  // ⛄ roll a ball, put it down, roll two more and stack them
  await page.evaluate(() => { const G = window.__game; G.player.pos.set(-30, 0, -30); G.player.face = 0; for (const f of G.FRIENDS) if (f.pos.distanceTo(G.player.pos) < 12) f.pos.set(0, 0, 40); });
  for (let stage = 0; stage < 3; stage++) {
    await page.evaluate(() => window.__game.doAction('snowman'));
    // you can see what's happening: a helper at the top says what to do, and the ball sits out in front of you where the camera sees it
    const st = await page.evaluate(async () => { await new Promise(r => setTimeout(r, 200)); const r = window.__xmas.roll(), p = window.__game.player.pos;
      return { hud: r.hud, ahead: r.ball && Math.hypot(r.ball.x - p.x, r.ball.z - p.z), label: [...document.querySelectorAll('#actions button, #actions .act')].map(e => e.textContent).join('|') }; });
    if (!/Walk around/.test(st.hud)) fail(`no ⛄ helper telling you to walk while rolling (${JSON.stringify(st)})`);
    if (!(st.ahead > 1.1)) fail(`the rolling ball is hidden behind you (${JSON.stringify(st)})`);
    if (stage === 0) { console.log('rolling:', JSON.stringify(st)); await walk(page, 0, 4, 30); await page.evaluate(() => { const G = window.__game; G.cam.yaw = Math.PI; }); await shot('rolling'); }
    // walk back and forth until the ball is big enough
    for (let k = 0; k < 12; k++) { if ((await page.evaluate(() => window.__xmas.roll().full))) break; await walk(page, k % 2 ? -5 : 5, 0, 30); }
    const r = await page.evaluate(() => window.__xmas.roll());
    if (!r.full) { fail(`the snowball for part ${stage + 1} never got big enough (${JSON.stringify(r)})`); break; }
    if (stage > 0) await page.evaluate(() => { const G = window.__game, sm = window.__xmas.snowmen(), b = G.SAVE.xmas; }); // stacking happens next to the base
    if (stage > 0) await page.evaluate(() => { const G = window.__game, p = G.player; const base = window.__xmasBase; p.pos.set(base.x, 0, base.z - 1.6); p.face = 0; });
    await page.evaluate(() => window.__game.doAction('snowman'));
    if (stage === 0) await page.evaluate(() => { const L = window.__xmas.snowmen(), b = L[L.length - 1]; window.__xmasBase = { x: b.x, z: b.z }; });
  }
  if (await page.evaluate(() => window.__xmas.roll().hud)) fail('the ⛄ helper stayed up after the snowman was built');
  const sm = await page.evaluate(() => ({ list: window.__xmas.snowmen(), saved: window.__game.SAVE.xmas.snowmen.length, done: window.__chal.isDone(window.__chal.list.find(c => c.id === 'xs_snowman')) }));
  console.log('snowmen:', JSON.stringify(sm));
  if (!sm.list.some(s => s.n === 3)) fail('the snowman did not get all 3 balls');
  if (!sm.saved) fail('the snowman is not saved');
  if (!sm.done) fail('building a snowman did not count for the challenge');
  await page.evaluate(() => { const G = window.__game, b = window.__xmasBase; G.player.pos.set(b.x + 1.5, 0, b.z - 2.5); G.player.face = -.5; G.cam.yaw = Math.PI - .5; });
  await shot('snowman');

  // the 🎄 Christmas tab is in the challenges
  await page.click('#stars'); await page.waitForSelector('#chal.show');
  if (!await page.locator('#chalTabs [data-tab="xmas"]').count()) fail('there is no 🎄 Christmas tab in the challenges at Christmas');
  if (errors.length) fail(`page errors at Christmas: ${errors.join(' | ')}`);
  await ctx.close();

  /* ---------- Halloween: pumpkins back, no Christmas ---------- */
  const H = await open('?holiday=halloween');
  // 🎶 outside Christmas, walking around town plays the everyday town songs, and every song file is there
  const tm = await H.page.evaluate(async () => { const G = window.__game, L = (G.PLAYLISTS || {}).town || [];
    const ok = await Promise.all(L.map(n => fetch(`../audio/${n}.mp3`, { method: 'HEAD' }).then(r => r.ok, () => false)));
    return { music: G.PARK && G.PARK.music, songs: L.length, missing: L.filter((n, i) => !ok[i]) }; });
  if (tm.music !== 'town' || tm.songs < 2) fail(`outside Christmas the town should play the town songs, got ${JSON.stringify(tm)}`);
  if (tm.missing.length) fail(`town song files missing: ${tm.missing.join(', ')}`);
  console.log(`🎶 outside Christmas the town plays ${tm.songs} songs`);
  const h = await H.page.evaluate(() => { const G = window.__game, hz = G.Z.halloween;
    return { xmas: !!window.__xmas, spooky: hz.spooky.parts.every(p => p.visible), pad: Math.hypot(G.Z.studio.pad.x, G.Z.studio.pad.z), santa: !!window.__santa,
      xs: window.__chal.list.filter(c => c.hol === 'christmas').length }; });
  console.log('halloween:', JSON.stringify(h));
  if (h.xmas || h.santa) fail('the Christmas things are out at Halloween');
  if (!h.spooky) fail('the Halloween Hollow pumpkins and ghosts should be out at Halloween');
  if (h.pad > .01) fail('the dress-up pad should be in the middle when there is no big tree');
  if (h.xs) fail('the Christmas challenges show at Halloween');
  await H.page.click('#stars'); await H.page.waitForSelector('#chal.show');
  if (await H.page.locator('#chalTabs [data-tab="xmas"]').count()) fail('the 🎄 Christmas tab shows at Halloween');
  if (H.errors.length) fail(`page errors at Halloween: ${H.errors.join(' | ')}`);
  if (!process.exitCode) console.log('✅ Christmas in town: the big tree, lights, Santa, snowballs and snowmen all work, and Halloween comes back for Halloween');
} finally { await browser.close(); server.close(); }
