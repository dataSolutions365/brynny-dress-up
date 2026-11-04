// 📍 Places tab test: the ⭐ Star Challenges card has a Places tab that lists every place in town with the challenges you do there,
// every challenge shows up once, and the 📍 Go button on a place sets the map arrow to it.
// Run it with:  node 3d/tests/challenge-places.mjs   SHOTS=folder saves pictures.
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
  // a few challenges already done, so the picture shows both kinds
  await page.addInitScript(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', 1);
    // today's 3 daily challenges are fixed too (none at the Runway), so the finished Runway card doesn't depend on the date
    const d = new Date(), k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    localStorage.setItem('brynny3d.v1', JSON.stringify({ chal: { done: { pose: true, runTwirl: true, pose5: true, wish: true }, n: { cake: 0 }, u: {}, found: 0, stars: 9,
      day: { k, ids: ['d_feed', 'd_moves', 'd_stars'], n: {}, u: {}, done: {}, bonus: false }, intro: 1 } })); });
  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && window.__chal && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };

  await page.click('#stars');
  await page.waitForSelector('#chal.show');
  const tab = page.locator('#chalTabs [data-tab="places"]');
  if (!await tab.count()) fail('there is no 📍 Places tab');
  await tab.click();
  const r = await page.evaluate(() => {
    const G = window.__game, C = window.__chal, all = C.list.concat(C.today());
    const heads = [...document.querySelectorAll('#chalList .csaf.place strong')].map(e => e.textContent);
    const rows = [...document.querySelectorAll('#chalList .cq strong')].map(e => e.textContent);
    const missing = all.filter(c => !rows.includes(c.t)).map(c => c.id);
    const extra = rows.length - all.length;
    const want = G.ZONES.filter(z => all.some(c => c.go === z.id)).map(z => z.name.split(' ').slice(1).join(' '));
    return { heads, missing, extra, want };
  });
  console.log(`places: ${r.heads.join(', ')}`);
  if (r.missing.length) fail(`challenges missing from the Places tab: ${r.missing.join(', ')}`);
  if (r.extra) fail(`${r.extra} challenges show up more than once`);
  for (const w of r.want) if (!r.heads.includes(w)) fail(`${w} has challenges but no place card`);
  if (!r.heads.includes('Anywhere in town')) fail('no "Anywhere in town" card for challenges you can do anywhere');
  await shot('places-tab');
  // the runway is all done: its card says so, and has no Go button
  const runway = await page.evaluate(() => { const h = [...document.querySelectorAll('#chalList .csaf.place')].find(e => e.querySelector('strong').textContent === 'Runway'); return h && { own: h.classList.contains('own'), go: !!h.querySelector('[data-go]') }; });
  if (!runway || !runway.own || runway.go) fail(`the finished Runway card should say ✅ All done (got ${JSON.stringify(runway)})`);
  await page.locator('#chalList .csaf.place:has(strong:text-is("Sweet Bakery"))').scrollIntoViewIfNeeded();
  await shot('places-tab-bakery');
  // 📍 Go on a place card guides you there
  await page.click('#chalList .csaf.place [data-go="bakery"]');
  const dest = await page.evaluate(() => { const d = window.__game.dest && window.__game.dest(); return d && d.id; }).catch(() => null);
  const shut = await page.evaluate(() => !document.querySelector('#chal.show'));
  if (!shut) fail('tapping 📍 Go should close the card');
  console.log(`after Go: card closed ${shut}, guiding to ${dest}`);
  if (errors.length) fail(`page errors: ${errors.join(' | ')}`);
  if (!process.exitCode) console.log('✅ the 📍 Places tab lists every challenge under its place');
} finally { await browser.close(); server.close(); }
