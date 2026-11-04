// 🎟️ Fast Pass test: buy the Fast Pass in the shop's ⚡ Powers tab, then zip to every place in town from the map, the Places tab
// and straight away, land at the front of each place (in the water at Dolphin Bay), and walk off again from there.
// Run it with:  node 3d/tests/fast-pass.mjs   SHOTS=folder saves pictures.
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
    localStorage.setItem('brynny3d.v1', JSON.stringify({ coins: 300, giftDay: new Date().toDateString(), chal: { done: {}, n: {}, u: {}, found: 0, stars: 0, day: null, intro: 1 } })); });
  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && window.__chal && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);
  // drawing the 3D world is slow without a graphics card, so only draw it for pictures
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };

  // before buying: a map tap just sets the arrow
  if (await page.evaluate(() => window.__game.fastPassAsk(window.__game.Z.bakery))) fail('the Fast Pass works before it is bought');
  // buy it in the ⚡ Powers tab
  const coins0 = await page.evaluate(() => window.__game.SAVE.coins);
  await page.evaluate(() => window.__shop.openShop('powers'));
  const item = page.locator('#scontent [data-buy="power:fastpass"]');
  if (!await item.count()) fail('no 🎟️ Fast Pass in the ⚡ Powers tab');
  await shot('shop-powers');
  await item.click();
  await page.click('#buyCard [data-b="buy"]');
  await page.evaluate(() => window.__shop.closeShop());
  const bought = await page.evaluate(() => ({ own: window.__game.hasFastPass(), coins: window.__game.SAVE.coins }));
  console.log(`bought: ${JSON.stringify(bought)}`);
  if (!bought.own || bought.coins > coins0 - 200) // 250, though buying can finish a challenge that pays a few coins back
    fail(`buying the Fast Pass should cost 250 coins (got ${JSON.stringify(bought)})`);

  const zone = () => page.evaluate(() => { const z = window.__game.zone(); return z && z.id; });
  // 🗺️ tap the Sweet Bakery on the map, then 🎟️ Zip there now
  await page.evaluate(() => window.__game.openMap());
  await page.waitForSelector('#map.show');
  // (tap its name tag, like a player would)
  const pt = await page.evaluate(() => { const G = window.__game, c = document.querySelector('#mapCv'), r = c.getBoundingClientRect(), b = G.mapLayout().find(it => it.z.id === 'bakery').lb;
    return { x: r.left + (b.x0 + b.x1) / 2 / c.width * r.width, y: r.top + (b.y0 + b.y1) / 2 / c.height * r.height }; });
  await page.mouse.click(pt.x, pt.y);
  await page.waitForSelector('#fp.show', { timeout: 20_000 }).catch(() => fail('tapping a place on the map did not ask to zip there'));
  await shot('fast-pass-ask');
  await page.click('#fpCard [data-fp="zip"]');
  await page.waitForTimeout(800);
  if (await zone() !== 'bakery') fail(`zipping from the map should land at the bakery (at ${await zone()})`);
  await shot('fast-pass-bakery');
  // "Show me the way" still guides with the arrow
  await page.evaluate(() => window.__game.fastPassAsk(window.__game.Z.runway));
  await page.click('#fpCard [data-fp="walk"]');
  const dest = await page.evaluate(() => { const d = window.__game.mapDest(); return d && d.id; });
  if (dest !== 'runway') fail(`Show me the way should set the arrow to the runway (got ${dest})`);
  // 📍 Go in the Places tab asks too
  await page.click('#stars'); await page.waitForSelector('#chal.show');
  await page.click('#chalTabs [data-tab="places"]');
  const go = page.locator('#chalList [data-go]').first(), goId = await go.getAttribute('data-go');
  await go.click();
  await page.waitForSelector('#fp.show', { timeout: 20_000 }).catch(() => fail('📍 Go in the Places tab did not ask to zip there'));
  await page.click('#fpCard [data-fp="zip"]'); await page.waitForTimeout(800);
  if (await zone() !== goId) fail(`zipping from the Places tab should land at ${goId} (at ${await zone()})`);
  if (await page.evaluate(() => window.__game.mapDest())) fail('zipping should stop the pink arrow');

  // every place: land in it, then walk off again
  const ids = await page.evaluate(() => window.__game.ZONES.map(z => z.id));
  for (const id of ids) {
    await page.evaluate(id => window.__game.fastTravel(window.__game.Z[id]), id);
    await page.waitForTimeout(500);
    const at = await zone();
    // you land facing into the place; walk back out toward the plaza (walking in could step on a pad and open it)
    const a = await page.evaluate(() => { const G = window.__game, p = G.player.pos; return { x: p.x, z: p.z, busy: G.busy() || !!document.querySelector('.modal.show') }; });
    await page.keyboard.down('KeyS'); await page.waitForTimeout(1500); await page.keyboard.up('KeyS'); await page.waitForTimeout(200);
    const b = await page.evaluate(() => { const p = window.__game.player.pos; return { x: p.x, z: p.z }; });
    const moved = Math.hypot(b.x - a.x, b.z - a.z);
    console.log(`${id}: landed in ${at}, walked ${moved.toFixed(2)}${a.busy ? ' (something opened)' : ''}`);
    if (at !== id) fail(`zipping to ${id} landed in ${at}`);
    if (a.busy) fail(`landing at ${id} opened something by itself (landed on a pad?)`);
    if (moved < .5) fail(`stuck after zipping to ${id}`);
    await page.evaluate(() => { for (const m of document.querySelectorAll('.modal.show')) m.classList.remove('show'); const g = window.__game; g.closeCloset && g.closetOpen() && g.closeCloset(); });
  }
  if (errors.length) fail(`page errors: ${errors.join(' | ')}`);
  if (!process.exitCode) console.log('✅ the 🎟️ Fast Pass zips you to every place in town');
} finally { await browser.close(); server.close(); }
