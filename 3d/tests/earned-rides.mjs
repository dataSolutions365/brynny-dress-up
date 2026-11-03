// Earned rides test: rides (and modern outfits) you can't buy come from a streak of days played and from wins, show on the ⭐🏆 Rewards tab,
// and can be ridden (the flying ones get 🪽 FLY). Run it with:  node 3d/tests/earned-rides.mjs   SHOTS=folder saves pictures.
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
  await page.addInitScript(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', 1);
    const d = new Date(); d.setDate(d.getDate() - 1); const y = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    localStorage.setItem('brynny3d.v1', JSON.stringify({ earn: { wins: 2, days: { last: y, n: 2, best: 2 } } })); });
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
  const gameT = () => page.evaluate(() => window.__game.fly().t);
  const waitGame = async (sec, until = () => false) => { const t0 = await gameT(), end = Date.now() + 180_000;
    while (Date.now() < end) { await page.waitForTimeout(250); const s = await state(); if ((await gameT()) - t0 >= sec || until(s)) return s; } return state(); };
  const state = () => page.evaluate(() => { const G = window.__game, p = G.player.pos, F = G.fly();
    return { x: p.x, y: p.y, z: p.z, on: F.on, mode: F.mode, floor: G.flyFloor(p.x, p.z, 0), jump: document.querySelector('#jump').textContent, ride: !!G.ride() }; });


  // the first time you play: a 2-day streak from yesterday becomes 3 days today, and 2 wins already
  const get = () => page.evaluate(() => { const G = window.__game, r = G.earnedRides(); return { st: G.earnState(), own: Object.fromEntries(r.map(x => [x.k, x.own])), have: Object.fromEntries(r.map(x => [x.k, x.have])) }; });
  await page.waitForTimeout(4000);
  let s = await get();
  if (s.st.streak !== 3) fail(`After playing yesterday and the day before, the streak should be 3 today, it is ${s.st.streak}.`);
  if (!s.own.panda) fail('Bamboo the panda should come after 3 days in a row.');
  if (s.own.goldlion) fail('Goldie the lion should not come before 3 wins.');
  // a 2nd-place finish is not a win; 1st place is
  await page.evaluate(() => { const d = (k, a) => dispatchEvent(new CustomEvent('brynny:did', { detail: { k, a } })); d('contest', 1); d('cakect', 0); });
  await page.waitForTimeout(4000);
  s = await get();
  if (s.st.wins !== 3) fail(`Wins should be 3 after one 1st place, it is ${s.st.wins}.`);
  if (!s.own.goldlion) fail('Goldie the lion should come after 3 wins.');
  if (s.own.comet || s.own.phoenix) fail('Comet and Blaze should still be locked.');
  // the modern outfits come the same way: 2 days in a row, 1 and 2 wins yes; 4 days and 5 wins not yet
  const own = await page.evaluate(() => Object.fromEntries(['cableknit', 'parachute', 'barreljeans', 'utilityvest', 'denimmaxi', 'shearling', 'chunkykicks'].map(id => [id, !!window.__game.SAVE.owned['look:' + id]])));
  for (const id of ['cableknit', 'parachute', 'barreljeans']) if (!own[id]) fail(`The ${id} outfit should be earned by now.`);
  for (const id of ['utilityvest', 'denimmaxi', 'shearling', 'chunkykicks']) if (own[id]) fail(`The ${id} outfit should still be locked.`);
  // they can't be bought in the shop
  const bought = await page.evaluate(() => { const G = window.__game; try { G.buy && G.buy('mount:phoenix'); } catch (e) {} return !!G.SAVE.owned['mount:phoenix']; });
  if (bought) fail('The phoenix could be bought.');
  // the 🏇 Rewards tab in the challenges shows all of them
  await page.evaluate(() => document.querySelector('#stars').click());
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#chalTabs [data-tab="rides"]').click());
  await page.waitForTimeout(300);
  const txt = await page.evaluate(() => document.querySelector('#chalList').innerText);
  for (const n of ['Bamboo', 'Goldie', 'Comet', 'Blaze', 'Nova', 'Cable-knit sweater', 'Chunky sneakers']) if (!txt.includes(n)) fail(`The Rewards tab should list ${n}.`);
  if (!txt.includes('3 / 10')) fail('The Rewards tab should show 3 / 10 wins toward the phoenix.');
  if (SHOTS) { await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(1500); await page.screenshot({ path: join(SHOTS, 'rides-tab.png') }); await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); }
  await page.evaluate(() => document.querySelector('#chalDone').click());
  // every earned ride can be ridden, and the flying ones fly
  for (const k of ['panda', 'goldlion', 'comet', 'phoenix']) {
    await page.evaluate(k => { const G = window.__game; if (G.ride()) G.stopRide(); G.player.pos.set(6, 0, 12); G.getMount(k); }, k);
    await page.waitForTimeout(1500);
    await page.evaluate(k => window.__game.callSteed(k), k);
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({ ride: !!window.__game.ride(), jump: document.querySelector('#jump').textContent }));
    if (!r.ride) fail(`Could not hop on ${k}.`);
    if (['comet', 'phoenix'].includes(k) && !r.jump.includes('FLY')) fail(`${k} should be able to fly, the jump button says "${r.jump}".`);
    if (SHOTS) await shot(k);
    console.log(`${k}: riding ${r.ride}, jump says ${r.jump.trim()}`);
  }
  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ Earned rides come from wins and days in a row, show on the Rewards tab, and can be ridden.');
} finally { await browser.close(); server.close(); }
