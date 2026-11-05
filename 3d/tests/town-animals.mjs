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
  const bar = await page.evaluate(() => { const b = document.querySelector('#ruBar'); return b.classList.contains('show') ? b.textContent : ''; });
  console.log('bar:', bar.replace(/\n/g, ' · '));
  // the animal list is folded away (so it isn't in the way) until you tap the bar
  const chips = () => page.evaluate(() => { const d = document.querySelector('#ruBar div'); return !!d && getComputedStyle(d).display !== 'none'; });
  if (await chips()) fail('The list of animals should be folded away at first.');
  await page.evaluate(() => document.querySelector('#ruBar b').click()); await gameWait(.1);
  if (!(await chips())) fail('Tapping the bar should show the list of animals.');
  await page.evaluate(() => document.querySelector('#ruBar b').click()); await gameWait(.1);
  if (await chips()) fail('Tapping the bar again should fold the list away.');
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
  // swim out into the canal: Truffle waits on the shore on his rope, he never walks on the water
  await page.evaluate(() => { const G = window.__game, p = G.player.pos, a = Math.atan2(p.x, p.z); p.set(Math.sin(a) * 77, 0, Math.cos(a) * 77); }); await gameWait(3);
  const swim = await page.evaluate(() => { const G = window.__game, c = G.ROAM.find(c => c.nm === 'Truffle'); return [Math.hypot(c.pos.x, c.pos.z), G.roamState().rope]; });
  console.log(`swimming with Truffle on the rope: he is ${swim[0].toFixed(1)} from the middle (island edge 72), rope: ${swim[1]}`);
  if (swim[0] > 72 || swim[1] !== 'Truffle') fail(`While you swim, a caught animal should wait on the shore, still on its rope (Truffle is ${swim[0].toFixed(1)} out).`);
  await setMe(B0.x * .82, B0.z * .82); await gameWait(.6);
  s = await page.evaluate(() => window.__game.roamState());
  if (s.home !== 1 || s.rope) fail(`Walking Truffle to the barn should bring him home (home ${s.home}, rope ${s.rope}).`);

  // 4. a friend online catches one and brings it home; you bring the other two: you win 3 to 1
  await page.evaluate(() => { const G = window.__game; G.RU.fake = { f1: { pos: new G.THREE.Vector3(5, 0, 5), face: 0 } };
    G.ruFromNet('f1', 'Ava', { t: 'roam', a: 'catch', r: G.RU.r, nm: 'Waddles' }); });
  await gameWait(.5);
  s = await page.evaluate(() => window.__game.roamState());
  if (s.modes.Waddles !== 'friend') fail(`A friend's catch should put Waddles on the friend's rope (${s.modes.Waddles}).`);
  if ((await page.evaluate(() => document.querySelector('#ruBar').textContent)).indexOf('Ava') < 0) fail('The bar should show the friend.');
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
  const zbar = await page.evaluate(() => document.querySelector('#ruBar').textContent);
  console.log('safari:', s.grp, JSON.stringify(s.modes), '| bar:', zbar.replace(/\n/g, ' · '));
  if (!s.on || s.grp !== 'zoo') fail('Tapping it should start a Safari Round-up.');
  const SAF = ['Ziggy', 'Kito', 'Twiga', 'Tembo'];
  if (!SAF.every(n => s.modes[n] === 'street')) fail('In a Safari Round-up the safari animals should be out on the streets.');
  if (['Waddles', 'Billy', 'Truffle', 'Woolly'].some(n => s.modes[n] !== 'meadow')) fail('The barn animals should stay in their meadow during a Safari Round-up.');
  if (!SAF.every(n => zbar.includes(n))) fail('The bar should list the safari runaways.');
  // no copies: the runaways ARE the zoo's own animals, so they're gone from the zoo while they're out
  const pen = () => page.evaluate(() => { const G = window.__game; return { zoo: G.ZA.length, inPen: G.ZA.filter(a => !a.esc).length, out: G.ROAM.filter(c => c.real && c.a.esc).map(c => c.nm) }; });
  let pz = await pen();
  console.log(`safari round-up: ${pz.inPen} of the zoo's ${pz.zoo} animals still in the zoo, out: ${pz.out.join(', ')}`);
  if (pz.inPen !== pz.zoo - 4 || SAF.some(n => !pz.out.includes(n))) fail('The 4 safari runaways should be the zoo\'s own animals, gone from the zoo (no copy left behind).');
  if (SHOTS) { await goTo('Twiga'); await gameWait(.3); await shot('safari-round-up'); }
  for (const nm of SAF) { await goTo(nm); await gameWait(.3); await page.evaluate(() => document.querySelector('#roamCatch').click()); await gameWait(.2);
    await setMe(Zo.x * .85, Zo.z * .85); await gameWait(.6); }
  s = await page.evaluate(() => window.__game.roamState());
  const done3 = await page.evaluate(() => window.__game.SAVE.chal.done);
  console.log(`safari round-up: ${s.on ? 'still on' : 'done'}, safariRound ${done3.safariRound ? 'done' : 'not done'}`);
  if (s.on || !done3.safariRound) fail('Bringing all 4 safari runaways back to the zoo should finish the Safari Round-up.');
  pz = await pen(); if (pz.inPen !== pz.zoo) fail(`Back home, all the zoo animals should be in the zoo again (${pz.inPen} of ${pz.zoo}).`);

  // 6. 🌪️ the All-Animal Round-up starts by the Sparkle Studio: every runaway (barn, safari, polar) breaks out at once, all round you,
  // runs anywhere in town (not just the streets), bolts when you get close, stops for a breather, and you can hold 3 at once
  await gameWait(10);
  const SR = await page.evaluate(() => window.__game.Z.studio.r);
  await setMe(0, SR + 3); await page.evaluate(() => { const G = window.__game; G.player.face = Math.PI / 2; G.cam.yaw = G.cam.cy = Math.PI * 1.5; }); await gameWait(.4);
  const at = await btn('#roamCatch');
  if (!at.includes('All-Animal')) fail(`By the Sparkle Studio there should be a Start the All-Animal Round-up button (it says "${at}").`);
  await page.evaluate(() => document.querySelector('#roamCatch').click()); await gameWait(.5);
  s = await page.evaluate(() => window.__game.roamState());
  const N = s.n, polar = await page.evaluate(() => window.__game.POLAR_LIST.map(o => o.nm));
  const abar = await page.evaluate(() => document.querySelector('#ruBar').textContent);
  console.log(`all-animal: ${N} animals (${polar.length ? 'with the polar ones: ' + polar.join(', ') : 'no Polar Ice in town yet'}) | bar: ${abar.replace(/\n/g, ' · ')}`);
  if (!s.on || s.grp !== 'all') fail('Tapping it should start the All-Animal Round-up.');
  pz = await pen();
  console.log(`all-animal: ${pz.zoo - pz.inPen} of the zoo's ${pz.zoo} animals are out, ${pz.inPen} left in the zoo`);
  if (pz.inPen) fail(`Every zoo animal should leave the zoo in the All-Animal Round-up (${pz.inPen} stayed).`);
  if (N < 4 + pz.zoo || Object.values(s.modes).some(m => m !== 'loose')) fail(`Every animal (barn and safari${polar.length ? ' and polar' : ''}) should be loose: ${JSON.stringify(s.modes)}`);
  if (!abar.includes(`${N} of ${N} still out`) || !abar.includes('⏱')) fail('The bar should say how many are still out and show the timer.');
  const stAll = () => page.evaluate(() => { const G = window.__game, p = G.player.pos; return G.ROAM.map(c => ({ nm: c.nm, x: c.pos.x, z: c.pos.z, mode: c.mode, streets: c.streets,
    ends: c.streets.map(G.roamEnd), me: Math.hypot(c.pos.x - p.x, c.pos.z - p.z), ok: G.looseOk(c.pos.x, c.pos.z), d: Math.hypot(c.pos.x, c.pos.z) })); });
  A = await stAll();
  const seen = A.filter(c => c.me < 22).length;
  console.log(`right after the start ${seen} of ${N} are within 22 steps of you`);
  if (seen < 6) fail(`At the start you should see lots of them at once (only ${seen} close by).`);
  if (SHOTS) { await page.evaluate(() => { const G = window.__game, c = G.cam; c.d0 = [c.dist, c.pitch]; c.dist = 9; c.pitch = .45; });
    await shot('all-animals-loose'); await page.evaluate(() => { const c = window.__game.cam; [c.dist, c.pitch] = c.d0; }); }
  await setMe(60, 0);// out of their way, so none of them bolts while we watch them run
  moved = 0; let offMax = {}, wet = 0, farOut = 0;
  for (let i = 0; i < 12; i++) { await gameWait(1); const B = await stAll();
    B.forEach((c, j) => { moved += Math.hypot(c.x - A[j].x, c.z - A[j].z); offMax[c.nm] = Math.max(offMax[c.nm] || 0, offStreet(c)); if (c.d > 70) wet++; farOut = Math.max(farOut, c.d); }); A = B; }
  const offs = Object.values(offMax).filter(v => v > 2).length;
  console.log(`loose: ran ${moved.toFixed(0)} steps between them, ${offs} of ${N} went well off the streets, farthest out ${farOut.toFixed(1)}`);
  if (moved < N * 12) fail(`In the All-Animal Round-up they should run all over (only ${moved.toFixed(0)} steps).`);
  if (offs < N / 2) fail(`They should run anywhere you could walk, not just the streets (only ${offs} left the streets).`);
  if (wet) fail('The runaways should stay on land.');
  // walk up to one and it bolts, then it stops for a breather
  const fl = await page.evaluate(() => { const G = window.__game, c = G.ROAM.find(c => c.mode === 'loose' && c.tired <= 0 && c.cool <= 0 && c.pos.length() < 55);
    c.wait = 0; G.player.pos.set(c.pos.x + 3, 0, c.pos.z); return c.nm; });
  await gameWait(1);
  const fd = (await stAll()).find(c => c.nm === fl);
  await gameWait(2.2);
  const tired = await page.evaluate(nm => window.__game.ROAM.find(c => c.nm === nm).tired, fl);
  console.log(`${fl} bolted to ${fd.me.toFixed(1)} away, then tired ${tired.toFixed(1)}`);
  if (fd.me < 5) fail(`Walking up to a runaway it should dash off (${fl} only got ${fd.me.toFixed(1)} away).`);
  if (!(tired > 0)) fail('After a dash a runaway should stop for a breather.');
  // a tired one can be caught with the button; then two more, and they all walk with you
  const grab = async (nm, button) => {
    // for the button, wait until no other runaway is right next to this one (so the button is for this one)
    if (button) for (let i = 0; i < 20; i++) { if (await page.evaluate(nm => { const G = window.__game, c = G.ROAM.find(c => c.nm === nm), p = c.pos; c.tired = 3;
      return G.ROAM.every(o => o === c || o.mode === 'pen' || Math.hypot(o.pos.x - p.x, o.pos.z - p.z) > 4 + o.a.rad); }, nm)) break; await gameWait(.5); }
    // (and not by any home: walking there with ones already on ropes brings them home, and you'd be holding fewer)
    await page.evaluate(nm => { const G = window.__game, c = G.ROAM.find(c => c.nm === nm); c.tired = 3;
      if (G.ruNearHome(c.pos.x, c.pos.z, 4) || G.ruNearHome(c.pos.x + 1.2, c.pos.z, 4)) safe: for (let r = 20; r < 60; r += 4) for (let a = 0; a < 6.28; a += .3) {
        const x = Math.sin(a) * r, z = Math.cos(a) * r; if (G.looseOk(x, z) && G.looseOk(x + 1.2, z) && !G.ruNearHome(x, z, 6) && !G.ruNearHome(x + 1.2, z, 6)) { c.pos.set(x, c.pos.y, z); break safe; } }
      G.player.pos.set(c.pos.x + 1.2, 0, c.pos.z); }, nm);
    if (button) { await gameWait(.3); const t = await btn('#roamCatch'); if (!t.includes('Catch ' + nm)) fail(`Next to a tired ${nm} there should be a Catch button (it says "${t}").`);
      await page.evaluate(() => document.querySelector('#roamCatch').click()); }
    else await page.evaluate(nm => { const G = window.__game; G.ruCatch(G.ROAM.find(c => c.nm === nm)); }, nm); await gameWait(.2); };
  const order = await page.evaluate(() => window.__game.ROAM.filter(c => c.grp !== 'barn').map(c => c.nm));
  await grab(fl, true); await grab(order.find(n => n !== fl), false); await grab(order.filter(n => n !== fl)[1], false);
  s = await page.evaluate(() => window.__game.roamState());
  const four = order.filter(n => n !== fl)[2]; await grab(four, false);
  const s4 = await page.evaluate(() => window.__game.roamState());
  await page.evaluate(() => { const G = window.__game, p = G.player.pos; let x = p.x * .9, z = p.z * .9 + 5;
    if (G.ruNearHome(x, z, 4)) { x = p.x; z = p.z; } p.set(x, 0, z); }); await gameWait(3);
  const trail = await page.evaluate(() => { const G = window.__game, p = G.player.pos; return G.ROAM.filter(c => c.mode === 'rope').map(c => Math.hypot(c.pos.x - p.x, c.pos.z - p.z)); });
  console.log(`on ropes: ${s.ropes.join(', ')} (a 4th: ${s4.ropes.length}), ${trail.map(d => d.toFixed(1)).join(', ')} behind you`);
  if (s.ropes.length !== 3 || s4.ropes.length !== 3) fail(`You should be able to hold 3 runaways at once, and no more (${s.ropes.length}, then ${s4.ropes.length}).`);
  if (trail.some(d => d > 4)) fail('All 3 on ropes should walk along with you.');
  if (SHOTS) { await page.evaluate(() => { const G = window.__game; G.cam.yaw = G.player.face + Math.PI + 1.1; G.cam.cy = G.cam.yaw; }); await shot('all-three-ropes'); }
  // every one of them goes back to its own home
  const homes = await page.evaluate(() => { const G = window.__game, o = {}; for (const c of G.ROAM) { const z = c.grp === 'barn' ? G.BZ : c.grp === 'zoo' ? G.Z.zoo : G.Z.arctic; o[c.nm] = [z.x * .82, z.z * .82]; } return o; });
  const deliver = async () => { const rs = (await page.evaluate(() => window.__game.roamState())).ropes; for (const nm of rs) { await setMe(...homes[nm]); await gameWait(.6); } };
  await deliver();
  const coinsA = await page.evaluate(() => window.__game.SAVE.coins || 0);
  for (let i = 0; i < 40; i++) { const out = await page.evaluate(() => window.__game.ROAM.filter(c => c.mode === 'loose').map(c => c.nm)); if (!out.length) break;
    for (const nm of out.slice(0, 3)) await grab(nm, false); await deliver(); }
  await page.waitForTimeout(1500);
  s = await page.evaluate(() => window.__game.roamState());
  const done4 = await page.evaluate(() => window.__game.SAVE.chal.done), coinsB = await page.evaluate(() => window.__game.SAVE.coins || 0);
  console.log(`all-animal round-up: ${s.on ? 'still on' : 'done'} in ${s.best.toFixed(0)}s, +${coinsB - coinsA} coins, allRound ${done4.allRound ? 'done' : 'not done'}, allTrio ${done4.allTrio ? 'done' : 'not done'}; ${JSON.stringify(s.modes)}`);
  if (s.on || !done4.allRound) fail('Bringing every runaway home should finish the All-Animal Round-up.');
  if (!done4.allTrio) fail('Holding 3 at once should finish the allTrio challenge.');
  if (coinsB - coinsA < 100) fail(`Finishing the All-Animal Round-up should give 100 coins (got ${coinsB - coinsA}).`);
  if (Object.entries(s.modes).some(([n, m]) => m !== (['Waddles', 'Billy', 'Truffle', 'Woolly'].includes(n) ? 'meadow' : 'pen'))) fail('After it every animal should be back at its own home.');

  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ The barn animals wander their meadow, a Round-up sends them round town until they are caught and walked home, and the most catches wins.');
} finally { await browser.close(); server.close(); }
