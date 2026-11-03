// Barn animals and 🚨 Round-up test (3d/src/26g-town-animals.js): the 4 barn animals wander the meadow round the Happy Barn and never
// follow you (only your adopted pet does); a Round-up sends them out onto their own streets until they're caught; a caught one walks
// behind you on its rope and goes home at the barn; the bar lists who's still out; friends online who bring more home win.
// Run it with:  node 3d/tests/town-animals.mjs   SHOTS=folder saves pictures.
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

  // Test computers have no graphics card, so the world isn't drawn while the test runs. SHOTS draws it again for each picture.
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const did = (k, a) => page.evaluate(([k, a]) => dispatchEvent(new CustomEvent('brynny:did', { detail: { k, a } })), [k, a]);
  const st = () => page.evaluate(() => { const G = window.__game, B = G.BZ; return G.ROAM.filter(c => c.grp === 'barn').map(c => ({ nm: c.nm, x: c.pos.x, z: c.pos.z, mode: c.mode, streets: c.streets,
    ends: c.streets.map(G.roamEnd), barn: Math.hypot(c.pos.x - B.x, c.pos.z - B.z) })); });
  const deg = d => d * Math.PI / 180;
  // the game slows its clock down when frames are slow (test computers draw slowly), so wait for game time, not real time
  const gameWait = async sec => { const t0 = await page.evaluate(() => window.__game.roamT());
    await page.waitForFunction(([t0, sec]) => window.__game.roamT() - t0 >= sec, [t0, sec], { timeout: 600_000, polling: 100 }); };
  const me = () => page.evaluate(() => { const p = window.__game.player.pos; return [p.x, p.z]; });
  const setMe = (x, z) => page.evaluate(([x, z]) => window.__game.player.pos.set(x, 0, z), [x, z]);
  const btn = sel => page.evaluate(sel => { const b = document.querySelector(sel); return b && b.style.display === 'block' ? b.textContent : ''; }, sel);
  const fence = await page.evaluate(() => window.__game.BZ.fence);
  // how far an animal is from its own streets (or the plaza ring between them)
  const offStreet = c => { const d = Math.hypot(c.x, c.z); if (d < 9.6) return Math.max(0, Math.abs(d - 7.15) - 1.4);
    return Math.min(...c.streets.map((s, i) => { const ux = Math.sin(deg(s)), uz = Math.cos(deg(s)), along = c.x * ux + c.z * uz, side = Math.abs(c.x * uz - c.z * ux);
      return along < 0 ? 99 : side + Math.max(0, along - c.ends[i] - .3); })); };

  // 1. no Round-up: they wander the meadow round the barn (outside the little paddock, but near it)
  let A = await st(), moved = 0, far = 0, inside = 99;
  for (let i = 0; i < 10; i++) { await gameWait(1); const B = await st();
    B.forEach((c, j) => { moved += Math.hypot(c.x - A[j].x, c.z - A[j].z); far = Math.max(far, c.barn); inside = Math.min(inside, c.barn); }); A = B; }
  console.log(`meadow: walked ${moved.toFixed(1)} steps between them, ${inside.toFixed(1)} to ${far.toFixed(1)} from the barn (fence ${fence})`);
  if (A.length !== 4) fail(`There should be 4 barn animals, not ${A.length}.`);
  if (moved < 4) fail(`The barn animals should wander round the meadow (they only walked ${moved.toFixed(1)} steps).`);
  if (far > fence + 13) fail(`Without a Round-up the barn animals should stay near the barn (one got ${far.toFixed(1)} away).`);
  if (inside < fence) fail('The barn animals should be out in the meadow, not shut in the paddock.');
  // they don't follow you: stand at the edge of the meadow and none comes over
  const B0 = await page.evaluate(() => ({ x: window.__game.BZ.x, z: window.__game.BZ.z }));
  await setMe(B0.x + fence + 20, B0.z - 4);
  let closest = 99;
  for (let i = 0; i < 8; i++) { await gameWait(1); const P = await me(); for (const c of await st()) closest = Math.min(closest, Math.hypot(c.x - P[0], c.z - P[1])); }
  console.log(`standing near the meadow, the closest a barn animal came was ${closest.toFixed(1)}`);
  // feed them all
  // stand next to one (if another animal is just as close, wait a moment for them to move apart, so the buttons are for this one)
  const goTo = async nm => { for (let i = 0; i < 12; i++) { const ok = await page.evaluate(nm => { const G = window.__game, c = G.ROAM.find(c => c.nm === nm), p = c.pos;
      return G.ROAM.every(o => o === c || Math.hypot(o.pos.x - p.x, o.pos.z - p.z) > 3.5); }, nm); if (ok) break; await gameWait(1); }
    await goTo0(nm); };
  const goTo0 = nm => page.evaluate(nm => { const G = window.__game, c = G.ROAM.find(c => c.nm === nm); G.player.pos.set(c.pos.x + 1.2, 0, c.pos.z + .4); G.player.face = Math.atan2(c.pos.x - G.player.pos.x, c.pos.z - G.player.pos.z); G.cam.yaw = G.player.face + Math.PI + .7; G.cam.cy = G.cam.yaw; }, nm);
  for (const nm of ['Waddles', 'Billy', 'Truffle', 'Woolly']) { await goTo(nm); await gameWait(.3);
    const b = await btn('#roamBtn'); if (!b.includes(nm)) fail(`Next to ${nm} there should be a Feed button (it says "${b}").`);
    if ((await btn('#roamCatch')).includes('Catch')) fail('Without a Round-up there is nothing to catch.');
    await page.evaluate(() => document.querySelector('#roamBtn').click()); await gameWait(.2); }
  if (SHOTS) await shot('meadow');

  // 2. start a Round-up at the barn: they break out onto their streets and stay out
  await setMe(B0.x * .82, B0.z * .82); await gameWait(.3);
  const startTxt = await btn('#roamCatch');
  if (!startTxt.includes('Round-up')) fail(`Near the barn there should be a Start a Round-up button (it says "${startTxt}").`);
  await page.evaluate(() => document.querySelector('#roamCatch').click()); await gameWait(.5);
  let s = await page.evaluate(() => window.__game.roamState());
  if (!s.on) fail('Tapping Start a Round-up should start it.');
  const bar = await page.evaluate(() => { const b = document.querySelector('#ruBar'); return b.classList.contains('show') ? b.innerText : ''; });
  console.log('bar:', bar.replace(/\n/g, ' · '));
  if (!/Round-up is on/.test(bar) || !['Waddles', 'Billy', 'Truffle', 'Woolly'].every(n => bar.includes(n))) fail('The bar should say the Round-up is on and list the animals still out.');
  let worst = 0; A = await st(); moved = 0;
  for (let i = 0; i < 10; i++) { await gameWait(1); const B = await st(); B.forEach((c, j) => { worst = Math.max(worst, offStreet(c)); moved += Math.hypot(c.x - A[j].x, c.z - A[j].z); }); A = B; }
  console.log(`round-up: walked ${moved.toFixed(1)} steps between them, at most ${worst.toFixed(2)} off their streets`);
  if (moved < 8) fail('During a Round-up the animals should run around town.');
  if (worst > .6) fail(`During a Round-up the animals should stay on their streets (one got ${worst.toFixed(2)} off).`);
  if (A.some(c => c.barn < fence + 13)) fail('During a Round-up the animals should be out in town, not at the barn.');
  if (SHOTS) { await goTo('Billy'); await gameWait(.3); await shot('round-up-on'); }
  // a runaway doesn't follow you either: walk up, it stops and looks, then goes on its way
  await goTo('Woolly'); await gameWait(.3);
  const w0 = (await st()).find(c => c.nm === 'Woolly'); await gameWait(1);
  const w1 = (await st()).find(c => c.nm === 'Woolly');
  if (Math.hypot(w1.x - w0.x, w1.z - w0.z) > .3) fail('A runaway should stop for a moment when you walk up to it.');
  await gameWait(5);
  const w2 = (await st()).find(c => c.nm === 'Woolly');
  if (Math.hypot(w2.x - w1.x, w2.z - w1.z) < .5) fail('After a moment a runaway should carry on its own way, not stay with you.');

  // 3. catch Truffle and walk him home: he comes along on his rope
  await goTo('Truffle'); await gameWait(.3);
  const ct = await btn('#roamCatch'); if (!ct.includes('Catch Truffle')) fail(`Next to Truffle there should be a Catch button (it says "${ct}").`);
  await page.evaluate(() => document.querySelector('#roamCatch').click()); await gameWait(.2);
  s = await page.evaluate(() => window.__game.roamState());
  if (s.rope !== 'Truffle') fail(`Tapping Catch should catch Truffle (on the rope: ${s.rope}).`);
  await page.evaluate(() => { const G = window.__game, p = G.player.pos; p.set(p.x + 6, 0, p.z + 6); }); await gameWait(3);
  const tr = await page.evaluate(() => { const G = window.__game, c = G.ROAM.find(c => c.nm === 'Truffle'), p = G.player.pos; return Math.hypot(c.pos.x - p.x, c.pos.z - p.z); });
  console.log(`caught Truffle is ${tr.toFixed(1)} behind you`);
  if (tr > 3) fail(`A caught animal should walk along with you (Truffle is ${tr.toFixed(1)} away).`);
  if (SHOTS) { await page.evaluate(() => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + 1.1; G.cam.cy = G.cam.yaw; }); await shot('caught-on-rope'); }
  await setMe(B0.x * .82, B0.z * .82); await gameWait(.6);
  s = await page.evaluate(() => window.__game.roamState());
  if (s.home !== 1 || s.rope) fail(`Walking Truffle to the barn should bring him home (home ${s.home}, rope ${s.rope}).`);

  // 4. a friend online catches one and brings it home; you bring the other two: you win 3 to 1
  await page.evaluate(() => { const G = window.__game; G.RU.fake = { f1: { pos: new G.THREE.Vector3(5, 0, 5), face: 0 } };
    G.ruFromNet('f1', 'Ava', { t: 'roam', a: 'catch', r: G.RU.r, nm: 'Waddles' }); });
  await gameWait(.5);
  s = await page.evaluate(() => window.__game.roamState());
  if (s.modes.Waddles !== 'friend') fail(`A friend's catch should put Waddles on the friend's rope (${s.modes.Waddles}).`);
  if ((await page.evaluate(() => document.querySelector('#ruBar').innerText)).indexOf('Ava') < 0) fail('The bar should show the friend.');
  await page.evaluate(() => { const G = window.__game; G.ruFromNet('f1', 'Ava', { t: 'roam', a: 'home', r: G.RU.r, nm: 'Waddles' }); });
  const coins0 = await page.evaluate(() => window.__game.SAVE.coins || 0);
  for (const nm of ['Billy', 'Woolly']) { await goTo(nm); await gameWait(.3); await page.evaluate(() => document.querySelector('#roamCatch').click()); await gameWait(.2);
    await setMe(B0.x * .82, B0.z * .82); await gameWait(.6); }
  if (SHOTS) await shot('round-up-done');
  await page.waitForTimeout(1500);
  s = await page.evaluate(() => window.__game.roamState());
  const done = await page.evaluate(() => window.__game.SAVE.chal.done), coins = await page.evaluate(() => window.__game.SAVE.coins || 0);
  console.log(`round-up over: ${s.on ? 'still on' : 'done'}, you ${s.sc[await page.evaluate(() => window.__game.ruMe())]} vs Ava ${s.sc.f1}, +${coins - coins0} coins; challenges: ${['roamFeed', 'roundup', 'roundWin'].filter(k => done[k]).join(', ')}`);
  if (s.on) fail('With all 4 home the Round-up should end.');
  if (!done.roundup || !done.roundWin || !done.roamFeed) fail('Finishing (and winning) the Round-up and feeding them all should finish those challenges.');
  if (coins - coins0 < 40) fail(`Winning the Round-up should give coins (got ${coins - coins0}).`);
  if (['Waddles', 'Billy', 'Truffle', 'Woolly'].some(n => s.modes[n] !== 'meadow')) fail('After the Round-up the animals should be back in the meadow.');
  if (closest < 6) fail(`Barn animals should never come over to you (one came within ${closest.toFixed(1)}).`);

  // 5. the 🦁 Safari Round-up starts at the Safari Zoo: Ziggy, Kito, Twiga and Tembo break out, and go back to the zoo
  await gameWait(10);// the barn Round-up's results go away first
  const Zo = await page.evaluate(() => { const z = window.__game.Z.zoo; return { x: z.x, z: z.z, f: z.fence || z.r }; });
  await setMe(Zo.x * .85, Zo.z * .85); await gameWait(.4);
  const zt = await btn('#roamCatch');
  if (!zt.includes('Safari Round-up')) fail(`Near the Safari Zoo there should be a Start a Safari Round-up button (it says "${zt}").`);
  await page.evaluate(() => document.querySelector('#roamCatch').click()); await gameWait(.5);
  s = await page.evaluate(() => window.__game.roamState());
  const zbar = await page.evaluate(() => document.querySelector('#ruBar').innerText);
  console.log('safari:', s.grp, JSON.stringify(s.modes), '| bar:', zbar.replace(/\n/g, ' · '));
  if (!s.on || s.grp !== 'zoo') fail('Tapping it should start a Safari Round-up.');
  const SAF = ['Ziggy', 'Kito', 'Twiga', 'Tembo'];
  if (!SAF.every(n => s.modes[n] === 'street')) fail('In a Safari Round-up the safari animals should be out on the streets.');
  if (['Waddles', 'Billy', 'Truffle', 'Woolly'].some(n => s.modes[n] !== 'meadow')) fail('The barn animals should stay in their meadow during a Safari Round-up.');
  if (!SAF.every(n => zbar.includes(n))) fail('The bar should list the safari runaways.');
  if (SHOTS) { await goTo('Twiga'); await gameWait(.3); await shot('safari-round-up'); }
  for (const nm of SAF) { await goTo(nm); await gameWait(.3); await page.evaluate(() => document.querySelector('#roamCatch').click()); await gameWait(.2);
    await setMe(Zo.x * .85, Zo.z * .85); await gameWait(.6); }
  s = await page.evaluate(() => window.__game.roamState());
  const done3 = await page.evaluate(() => window.__game.SAVE.chal.done);
  console.log(`safari round-up: ${s.on ? 'still on' : 'done'}, safariRound ${done3.safariRound ? 'done' : 'not done'}`);
  if (s.on || !done3.safariRound) fail('Bringing all 4 safari runaways back to the zoo should finish the Safari Round-up.');

  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ The barn animals wander their meadow, a Round-up sends them round town until they are caught and walked home, and the most catches wins.');
} finally { await browser.close(); server.close(); }
