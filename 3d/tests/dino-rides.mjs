// 🏆 Big dinosaurs test: the 7 big dinosaurs (Tank, Spike, Tuba, Dash, Rex, Atlas and Zephyr, 3d/src/24c9i-dinos-more.js) stay locked
// until you finish their 🦖 Dino challenges and can't be bought, the 🦴 Fossil Dig at Dino Valley digs up fossils and counts for the
// challenges, you sit up on each one's saddle, the big T. rex walks you round, and Zephyr the pteranodon flies.
// Run it with:  node 3d/tests/dino-rides.mjs   SHOTS=folder saves pictures.
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
  // stand somewhere in Dino Valley, in the place's own directions (+z toward the island)
  const go = (lx, lz, face = 0) => page.evaluate(([lx, lz, face]) => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'), [x, w] = z.toWorld(lx, lz);
    G.player.pos.set(x, .05, w); G.player.vy = 0; G.player.speed = 0; G.player.face = face + z.rot; G.cam.yaw = face + z.rot + Math.PI; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; }, [lx, lz, face]);
  const local = () => page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'), p = G.player.pos; return z.toLocal(p.x, p.z); });
  const BIG = ['dtrike', 'dstego', 'dcrest', 'draptor', 'dtrex', 'dlong', 'dptero'];
  const owns = () => page.evaluate(BIG => { const o = window.__game.barn().own; return BIG.filter(k => o[k]); }, BIG);
  const did = (k, a) => page.evaluate(([k, a]) => dispatchEvent(new CustomEvent('brynny:did', { detail: { k, a } })), [k, a]);
  await page.waitForTimeout(2000);

  // 🔒 locked at the start, and not for sale
  if ((await owns()).length) fail(`The big dinosaurs should be locked at the start (you have ${(await owns()).join(', ')}).`);
  const shop = await page.evaluate(BIG => BIG.map(k => window.__game.SHOP.find(x => x.k === 'mount:' + k)).map(x => !x || (!!x.prize && !x.stars)), BIG);
  if (shop.some(ok => !ok)) fail('The big dinosaurs should not be for sale in the shop.');
  const tab = await page.evaluate(() => window.__game.earnedRides().filter(r => /Dino/.test(r.what)).map(r => r.k));
  if (BIG.some(k => !tab.includes(k))) fail(`Every big dinosaur should say "Finish all 3 🦖 Dino challenges" (these do: ${tab.join(', ')}).`);

  // 🦴 the Fossil Dig: stand in the pit, tap Dig, and a fossil comes out (the first one is always a T. rex tooth)
  const D = await page.evaluate(() => window.__game.DV.dig);
  await go(D.x, D.z + D.r + .4, Math.PI); await page.waitForTimeout(800);
  const digBtn = await page.evaluate(() => document.querySelector('#dinoDig').style.display);
  if (digBtn !== 'block') fail('Next to the Fossil Dig a 🦴 Dig button should show.');
  if (SHOTS) await shot('dig-pit');
  let found = [];
  page.on('console', () => {});
  await page.exposeFunction('__fossil', a => found.push(a));
  await page.evaluate(() => addEventListener('brynny:did', e => { if (e.detail.k === 'fossil') window.__fossil(e.detail.a); }));
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => document.querySelector('#dinoDig').click());
    await page.waitForTimeout(2500);
  }
  const ds = await page.evaluate(() => window.__game.dinoState());
  console.log(`dug up: ${found.join(', ')} (${ds.dig} fossils, ${ds.kinds} kinds)`);
  if (ds.dig !== 3 || found.length !== 3) fail(`Digging 3 times should dig up 3 fossils (got ${ds.dig}).`);
  if (found[0] !== 'tooth') fail(`The first fossil should be a T. rex tooth (got ${found[0]}).`);
  const left = await page.evaluate(() => window.__game.DIG.spots.filter(s => s.ready).length);
  if (left !== 2) fail(`3 of the 5 dig spots should be dug (${left} are still ready).`);

  // 🦕 Tank's challenges: meet 3 kinds, feed the triceratops 5 times and dig 3 fossils => he's yours
  for (const k of ['trikeR', 'stegoR', 'longneckR']) await did('dinolearn', k);
  for (let i = 0; i < 5; i++) await did('dinofeed', 'trikeR');
  await page.waitForFunction(() => window.__game.barn().own.dtrike, null, { timeout: 15_000 }).catch(() => {});
  let mine = await owns();
  if (!mine.includes('dtrike')) fail('Finishing Tank\'s 3 challenges should give you Tank the big triceratops.');
  if (mine.length !== 1) fail(`Only Tank should be yours so far (you have ${mine.join(', ')}).`);

  // the rest: finish all their challenges
  await page.evaluate(() => { const C = window.__game.SAVE.chal; for (const f of window.__game.earnedRides()) if (/Dino/.test(f.what)) for (const id of ['dino_feedS', 'dino_dig10', 'dino_days3', 'dino_meetAll', 'dino_feed20', 'dino_kinds4', 'dino_feedR', 'dino_kinds8', 'dino_ride300', 'dino_feedX', 'dino_dig25', 'dino_days5', 'dino_big3', 'dino_feed60', 'dino_ride2k', 'dino_big6', 'dino_dig50', 'dino_days10']) C.done[id] = true; });
  await page.waitForFunction(BIG => BIG.every(k => window.__game.barn().own[k]), BIG, { timeout: 30_000 }).catch(() => {});
  mine = await owns();
  if (mine.length !== 7) fail(`Finishing all the 🦖 Dino challenges should give you all 7 big dinosaurs (you have ${mine.join(', ')}).`);

  // 🏇 sit up on each one's saddle (in the open meadow)
  for (const k of BIG) {
    await go(-1, 9, Math.PI); await page.waitForTimeout(600);
    await page.evaluate(k => window.__game.callSteed(k), k); await page.waitForTimeout(900);
    const s = await page.evaluate(() => { const G = window.__game, a = G.ride(); if (!a) return null; a.g.updateMatrixWorld(true);
      const v = a.saddle && a.saddle.getWorldPosition(new (a.g.position.constructor)());
      return { k: a.k, ride: a.F.ride, saddle: v ? v.y - G.player.pos.y : null, hip: G.av().g.position.y - G.player.pos.y, h: a.h }; });
    if (!s || s.k !== k) { fail(`You should be able to ride ${k}.`); continue; }
    console.log(`${k}: seat ${s.ride} m up, saddle at ${s.saddle == null ? '?' : s.saddle.toFixed(2)} m, ${s.h.toFixed(1)} m tall`);
    if (s.saddle == null || Math.abs(s.saddle - (s.ride - .06)) > .2) fail(`On ${k} you should sit on the saddle (the saddle is ${s.saddle} up, you sit at ${s.ride}).`);
    if (s.ride < 1.9) fail(`${k} should be a big dinosaur (you sit only ${s.ride} m up).`);
    if (SHOTS) await shot('ride-' + k);
    await page.evaluate(() => window.__game.stopRide(true)); await page.waitForTimeout(300);
  }

  // 🦖 the big T. rex walks you round, and it counts as riding a dinosaur
  await go(-1, 9, Math.PI); await page.waitForTimeout(600);
  await page.evaluate(() => window.__game.callSteed('dtrex')); await page.waitForTimeout(800);
  const r0 = (await page.evaluate(() => window.__game.dinoState())).ride;
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(2500); await page.keyboard.up('ArrowUp');
  const st = await page.evaluate(() => window.__game.dinoState());
  console.log(`rode the big T. rex ${st.ride - r0} steps; ridden ${st.big} big dinosaurs`);
  if (st.ride - r0 < 1) fail('Riding the big T. rex should walk you round (and count your riding steps).');
  if (st.big !== 7) fail(`All 7 big dinosaurs should count as ridden (${st.big} do).`);
  await page.evaluate(() => window.__game.stopRide(true));

  // 🪽 Zephyr the big pteranodon: wings folded on the ground, open in the air
  await page.evaluate(() => { const G = window.__game; G.player.pos.set(6, 0, 12); }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__game.callSteed('dptero')); await page.waitForTimeout(1200);
  const w0 = await page.evaluate(() => window.__game.ride().wingOpen || 0);
  if (w0 > .1) fail('On the ground Zephyr\'s wings should be folded.');
  const jb = await page.locator('#jump').boundingBox();
  await page.touchscreen.tap(jb.x + jb.width / 2, jb.y + jb.height / 2);
  const t0 = await page.evaluate(() => window.__game.fly().t);
  for (let i = 0; i < 400; i++) { await page.waitForTimeout(250); if ((await page.evaluate(() => window.__game.fly().t)) - t0 > 5) break; }
  const air = await page.evaluate(() => { const G = window.__game; return { on: G.fly().on, y: G.player.pos.y, open: G.ride().wingOpen }; });
  console.log(`Zephyr after take-off: ${air.y.toFixed(1)} m up, wings ${Math.round(air.open * 100)}% open`);
  if (!air.on || air.y < 6) fail(`Zephyr should fly up above the trees (she is ${air.y.toFixed(1)} m up).`);
  if (air.open < .8) fail('Zephyr\'s wings should open in the air.');
  if (SHOTS) await shot('zephyr-flying');
  await page.evaluate(() => window.__game.stopRide(true));

  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ The big dinosaurs: locked until earned, the Fossil Dig, sitting on each saddle, the T. rex walks and Zephyr flies.');
} finally { await browser.close(); server.close(); }
