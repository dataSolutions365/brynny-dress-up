// Safari rides test: the safari rides (okapi, zebra, rhino, gorilla, hippo, elephant, crowned crane, lion, giraffe) only come once you finish ALL of their
// super hard 🦁 Safari challenges, they can't be bought, and you sit up on them properly when you ride.
// The hippo swims in the water round the city, and the zoo's hippo lives in the water behind the zoo.
// Run it with:  node 3d/tests/safari-rides.mjs   SHOTS=folder saves pictures.
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
  // played the last 3 days (today makes 4), 4 wins (the model and cake contests), 4 wins against Kai
  await page.addInitScript(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', 1);
    const d = new Date(); d.setDate(d.getDate() - 1); const y = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    localStorage.setItem('brynny3d.v1', JSON.stringify({ earn: { wins: 4, days: { last: y, n: 3, best: 3 } }, sports: { v1w: 4 },
      chal: { done: { win: true, cakeWin: true }, n: {}, u: {}, found: 0, stars: 20, day: null, intro: 1 } })); });
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
  const get = () => page.evaluate(() => { const G = window.__game, r = G.earnedRides(); return { st: G.earnState(), own: Object.fromEntries(r.map(x => [x.k, x.own])), have: Object.fromEntries(r.map(x => [x.k, x.have])) }; });
  const did = (k, a) => page.evaluate(([k, a]) => dispatchEvent(new CustomEvent('brynny:did', { detail: { k, a } })), [k, a]);

  await page.waitForTimeout(3000);
  let s = await get();
  if (s.st.streak !== 4 || s.st.best !== 4) fail(`The streak should be 4 today, it is ${s.st.streak} (best ${s.st.best}).`);
  if (s.st.kinds !== 2) fail(`Wins from the model and cake contests should count as 2 kinds of contest, it is ${s.st.kinds}.`);
  const SAF = ['kivu', 'punda', 'kifaru', 'zuri', 'kiboko', 'tembo', 'neema', 'jabari', 'twiga'];
  for (const k of SAF) if (s.own[k]) fail(`${k} should be locked at the start.`);
  // they can't be bought
  const shop = await page.evaluate(SAF => SAF.map(k => window.__game.SHOP.find(x => x.k === 'mount:' + k)).map(x => x && !!x.prize && !x.stars), SAF);
  if (!shop.every(Boolean)) fail('Every safari ride should be in the shop as earn-only (no star price).');

  // the 🦁 Safari tab shows each animal with its challenges
  await page.evaluate(() => document.querySelector('#stars').click());
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#chalTabs [data-tab="safari"]').click());
  await page.waitForTimeout(300);
  let txt = await page.evaluate(() => document.querySelector('#chalList').innerText);
  for (const n of ['Kivu', 'Punda', 'Kifaru', 'Zuri', 'Kiboko', 'Tembo', 'Neema', 'Jabari', 'Twiga', 'Feed all 8 kinds', 'Swim next to the hippo', 'Win the cake contest 5 times', 'Win all 3 contests', 'Beat Kai 1-on-1 at basketball 5 times', 'Play 14 days in a row', '4 / 5'])
    if (!txt.includes(n)) fail(`The Safari tab should show "${n}".`);
  if (SHOTS) await shot('safari-tab');
  await page.evaluate(() => document.querySelector('#chalDone').click());

  // Kivu: feed 6 kinds of zoo animals, win 5 times, play 5 days in a row. Two of three isn't enough.
  for (const k of ['zebra', 'giraffe', 'rhino', 'okapi', 'elephant', 'lion', 'gorilla', 'hippo']) await did('zoofeed', k);
  await did('petct', 0);// 5th win, and the 3rd kind of contest
  await page.waitForTimeout(4000);
  s = await get();
  if (s.st.wins !== 5 || s.st.kinds !== 3) fail(`After winning the pet contest: wins should be 5 (is ${s.st.wins}) and kinds 3 (is ${s.st.kinds}).`);
  if (JSON.stringify(s.st.kn) !== JSON.stringify({ contest: 1, cakect: 1, petct: 1 })) fail(`Each contest should count 1 win so far, got ${JSON.stringify(s.st.kn)}.`);
  if (s.have.kivu !== 2) fail(`Kivu should have 2 of 3 challenges done (feed and wins), has ${s.have.kivu}.`);
  if (s.own.kivu) fail('Kivu should not come with only 2 of her 3 challenges done.');
  if (s.have.tembo !== 1) fail(`Tembo should have 1 of 3 done (all 3 contests), has ${s.have.tembo}.`);
  // a 5th day in a row finishes Kivu's challenges
  await page.evaluate(() => { const E = window.__game.SAVE.earn; E.days.n = 5; E.days.best = 5; });
  await page.waitForTimeout(4500);
  s = await get();
  if (!s.own.kivu) fail('Kivu the okapi should come after all 3 of her challenges.');
  for (const k of SAF.slice(1)) if (s.own[k]) fail(`${k} should still be locked.`);
  // 5 wins against Kai is one of Jabari's 4 challenges, not all of them
  await page.evaluate(() => { window.__game.SAVE.sports.v1w = 5; });
  await page.waitForTimeout(2500);
  s = await get();
  if (s.have.jabari !== 1 || s.own.jabari) fail(`Jabari should have 1 of 4 done and stay locked (has ${s.have.jabari}, own ${s.own.jabari}).`);

  // the zoo has a lion now, and you can meet it
  const zooHas = await page.evaluate(() => window.__game.zoo().map(a => a.k));
  for (const k of ['lion', 'gorilla', 'hippo']) if (!zooHas.includes(k)) fail(`The Safari Zoo should have a ${k}.`);

  // every safari ride can be ridden: you sit on its back (not inside it, not floating), and it walks
  for (const k of SAF) {
    await page.evaluate(k => { const G = window.__game; if (G.ride()) G.stopRide(true); G.player.pos.set(6, 0, 12); G.getMount(k); }, k);
    await page.waitForTimeout(1200);
    await page.evaluate(k => window.__game.callSteed(k), k);
    await page.waitForTimeout(1500);
    if (k === 'neema') { const j = await page.evaluate(() => document.querySelector('#jump').textContent); if (!j.includes('FLY')) fail(`Neema the crane should be able to fly, the jump button says "${j}".`); }
    const r = await page.evaluate(() => { const G = window.__game, a = G.ride(), av = G.av(), T = G.THREE;
      av.g.updateMatrixWorld(true); a.g.updateMatrixWorld(true);
      // the rider's hips, and the top of the animal's back right under them
      const hip = new T.Vector3(); av.hips.getWorldPosition(hip);
      const rc = new T.Raycaster(new T.Vector3(hip.x, hip.y + 3, hip.z), new T.Vector3(0, -1, 0)), meshes = [];
      a.g.traverse(o => { if (o.isMesh && o !== a.tag && o !== a.say) meshes.push(o); });
      const hit = rc.intersectObjects(meshes, false).filter(h => h.object.parent !== av.g)[0];
      return { ride: !!a, k: a && a.k, hipY: hip.y, backY: hit ? hit.point.y : null, groundY: G.player.pos.y }; });
    if (!r.ride || r.k !== k) fail(`Could not hop on ${k}.`);
    else if (r.backY == null) fail(`There's nothing under the rider on ${k}.`);
    else { const gap = r.hipY - r.backY;
      console.log(`${k}: hips ${r.hipY.toFixed(2)} m, back ${r.backY.toFixed(2)} m, gap ${gap.toFixed(2)} m`);
      if (gap < -.02 || gap > .2) fail(`On ${k} the rider's hips should sit right on the saddle, the gap is ${gap.toFixed(2)} m.`); }
    // walk forward a bit
    const p0 = await page.evaluate(() => ({ ...window.__game.player.pos }));
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(2500); await page.keyboard.up('ArrowUp');
    const p1 = await page.evaluate(() => ({ ...window.__game.player.pos }));
    if (Math.hypot(p1.x - p0.x, p1.z - p0.z) < .5) fail(`${k} did not walk.`);
    if (SHOTS) {
      for (const [n, off] of [['side', Math.PI / 2], ['front', -2.4]]) {
        await page.evaluate(off => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + off; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; }, off);
        await shot(`ride-${k}-${n}`);
      }
      const pic = await page.evaluate(k => window.__game.farmPic(k, 400, .8), k);
      await writeFile(join(SHOTS, `pic-${k}.png`), Buffer.from(pic.split(',')[1], 'base64'));
    }
  }
  // 🦛 the hippo swims: ride Kiboko into the water round the city, and she sinks so just her back sticks out, with you on top
  {
    await page.evaluate(() => { const G = window.__game; if (G.ride()) G.stopRide(true); G.getMount('kiboko'); G.player.pos.set(6, 0, 12); G.callSteed('kiboko'); });
    await page.waitForTimeout(1500);
    // walk her off the sand into the water behind the zoo
    const shore = await page.evaluate(() => { const G = window.__game, Z = G.Z.zoo, [x, z] = Z.toWorld(0, G.ZOO_SHORE.edge + 1); return { x, z, face: Math.atan2(-Z.x, -Z.z) + Math.PI }; });
    await page.evaluate(s => { const G = window.__game; G.player.pos.set(s.x, 0, s.z); G.player.face = s.face; G.cam.yaw = s.face + Math.PI; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; }, shore);
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(2200); await page.keyboard.up('ArrowUp');
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => { const G = window.__game, a = G.ride(), av = G.av(), p = G.player.pos; const hp = new G.THREE.Vector3(); av.hips.getWorldPosition(hp); return { k: a && a.k, y: a && a.g.position.y, ay: hp.y, d: Math.hypot(p.x, p.z), k2: G.waterAt(p.x, p.z).k }; });
    console.log(`kiboko in the water: ${r.d.toFixed(1)} m from the middle of town, depth ${r.k2.toFixed(2)}, hippo at ${r.y && r.y.toFixed(2)} m, rider's hips at ${r.ay.toFixed(2)} m (water at -0.35 m)`);
    if (r.k !== 'kiboko') fail('Kiboko should still be ridden in the water.');
    else if (!(r.k2 > .9)) fail(`Kiboko should be able to walk out into deep water (depth ${r.k2.toFixed(2)}).`);
    else if (!(r.y < -.9)) fail(`Kiboko should sink into the water to swim, she is at ${r.y.toFixed(2)} m.`);
    else if (!(r.ay > -.25)) fail(`The rider should sit up above the water on Kiboko (hips at ${r.ay.toFixed(2)} m).`);
    if (SHOTS) await shot('swim-kiboko');
    await page.evaluate(() => window.__game.stopRide(true));
    // the zoo's hippo lives in the water behind the zoo, and swimming next to it counts for its challenge
    const zh = await page.evaluate(() => { const G = window.__game, a = G.zoo().find(a => a.k === 'hippo'); return { y: a.g.position.y, x: a.pos.x, z: a.pos.z, lz: a.lz }; });
    console.log(`zoo hippo: local z ${zh.lz.toFixed(1)} (shore at ${(await page.evaluate(() => window.__game.ZOO_SHORE.edge)).toFixed(1)}), height ${zh.y.toFixed(2)} m`);
    await page.evaluate(h => { const G = window.__game, a = G.zoo().find(a => a.k === 'hippo'); G.player.pos.set(a.pos.x + 1.6, 0, a.pos.z); }, zh);
    await page.waitForTimeout(3000);
    const hw = await page.evaluate(() => window.__game.hipWith());
    if (!(hw > .5)) fail(`Swimming next to the zoo's hippo should count for its challenge (${hw.toFixed(1)} s).`);
    if (SHOTS) await shot('swim-with-hippo');
  }
  if (SHOTS) { const pic = await page.evaluate(() => window.__game.farmPic('lion', 400, .8)); await writeFile(join(SHOTS, 'pic-zoo-lion.png'), Buffer.from(pic.split(',')[1], 'base64')); }
  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ Safari rides come only from finishing all of their Safari challenges, and you sit right on them.');
} finally { await browser.close(); server.close(); }
