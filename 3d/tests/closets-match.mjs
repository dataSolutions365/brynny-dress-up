// Closets match: everything you can wear in the 2D studio can be worn in the 3D world, and the other way round,
// with the same ids, for girls and for guys. It opens both games and compares their lists.
//
// Run it with:  node 3d/tests/closets-match.mjs   (needs Playwright, like walk.mjs)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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
const base = `http://127.0.0.1:${server.address().port}`;

// the same thing with a different id in each game (2D id → 3D id); 2D Face gems are the gems in the 3D makeup studio
const SAME = { candy: 'treatbag', bat: 'batwings' };
const SKIP = new Set(['facegems']);
const TABS = ['tops', 'bottoms', 'dresses', 'shoes', 'hats', 'extras'];

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let bad = 0;
try {
  const page = await browser.newPage();
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  await page.route(/gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());

  await page.goto(`${base}/index.html`, { waitUntil: 'load' });
  const two = await page.evaluate(tabs => {
    const girl = l => l.filter(x => !x.guy).map(x => x.id);
    const out = { hair: girl(HAIR), guyHair: GUY_OK.hair, girl: {}, guy: {} };
    for (const t of tabs) { out.girl[t] = girl(CATS[t]); out.guy[t] = GUY_OK[t]; }
    return out;
  }, TABS);

  await page.goto(`${base}/3d/index.html`, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && window.__game.closets, null, { timeout: 180_000 });
  const c = await page.evaluate(() => window.__game.closets());
  const tab3 = t => t === 'extras' ? ['extras', 'glasses'] : [t];
  const three = { hair: c.hairs, guyHair: c.guyHairs, girl: {}, guy: {} };
  for (const t of TABS) {
    three.girl[t] = [...c.cat[t], ...(t === 'extras' ? c.store.glasses : [])];
    // guys: their own closet, the clothing store, and the holiday things (except the dresses made only for girls)
    three.guy[t] = [...c.guy[t], ...tab3(t).flatMap(k => c.store[k] || []), ...c.cat[t].filter(id => c.holiday.includes(id) && !c.girlOnly.includes(id))];
  }

  const check = (what, a2, a3) => {
    const s2 = new Set(a2.filter(id => !SKIP.has(id)).map(id => SAME[id] || id)), s3 = new Set(a3);
    const only2 = [...s2].filter(id => !s3.has(id)), only3 = [...s3].filter(id => !s2.has(id));
    if (only2.length) { bad++; console.error(`❌ ${what}: in 2D but not 3D: ${only2.join(', ')}`); }
    if (only3.length) { bad++; console.error(`❌ ${what}: in 3D but not 2D: ${only3.join(', ')}`); }
  };
  check('girl hair', two.hair, three.hair);
  check('guy hair', two.guyHair, three.guyHair);
  for (const t of TABS) { check(`girl ${t}`, two.girl[t], three.girl[t]); check(`guy ${t}`, two.guy[t], three.guy[t]); }
  if (bad) { console.error('Add each missing thing to the other game with the same id (see 3d/src/14e-match-2d.js).'); process.exitCode = 1; }
  else console.log('✅ The 2D and 3D closets match.');
} finally {
  await browser.close();
  server.close();
}
