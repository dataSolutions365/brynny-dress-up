// 🆕 What's new test: after an update the "What's new" card pops up once when you tap Play, its "Show me" button
// guides you to the place, it doesn't come back after you close it, places with something new get a NEW tag on the map,
// and going there takes the tag away.
//
// Run it with:  node 3d/tests/whats-new.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };

// a tiny file server for the repo, like GitHub Pages
const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  if (path === '' || path.endsWith('/')) path += 'index.html';
  try { const body = await readFile(join(ROOT, path)); res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const SAVE_KEY = 'brynny3d.v1'; // the 3D save in localStorage (01-setup.js)
const url = `http://127.0.0.1:${server.address().port}/3d/index.html?wn=1`;

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // offline runs: THREE_DIR=/path/to/three-package serves the 3D engine from disk instead of cdn.jsdelivr.net
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  // never send test runs to the real error list
  await page.route(/gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());

  const t0 = Date.now();

  const start = async () => {
    await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
    await page.waitForFunction(() => window.__game && window.__whatsNew && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
    await page.evaluate(() => document.querySelector('#play').click());
    await page.waitForTimeout(2500);
  };
  const shot = n => process.env.SHOTS && page.screenshot({ path: `${process.env.SHOTS}/${n}.png` });
  await start();
  await page.waitForSelector('#whatsNew.show', { timeout: 20_000 }).catch(() => {});
  const W = () => page.evaluate(() => ({ show: !!document.querySelector('#whatsNew.show'), notes: document.querySelectorAll('#wnList li').length,
    go: document.querySelectorAll('#wnList [data-wn]').length, tags: window.__whatsNew.tags(), seen: window.__game.SAVE.wnSeen, newest: window.__whatsNew.WHATS_NEW[0].v }));
  let w = await W();
  console.log('first open:', JSON.stringify(w));
  if (!w.show) fail('the What\'s new card did not pop up after tapping Play');
  if (w.notes < 3) fail(`the What's new card should list the notes (got ${w.notes})`);
  if (!w.go) fail('notes about a place should have a Show me button');
  for (const id of ['soccer', 'wiffle']) if (!w.tags.includes(id)) fail(`${id} should have a NEW tag on the map`);
  await shot('whats-new-card');
  if (!(await page.evaluate(() => document.querySelector('#mini').classList.contains('hasNew')))) fail('the 🗺️ Map button should show NEW');

  // 🗺️ Show me: closes the card and points the arrow at the Wiffle Ball Field
  const goIdx = await page.evaluate(() => [...document.querySelectorAll('#wnList [data-wn]')].findIndex(b => b.closest('li').textContent.includes('Wiffle')));
  await page.evaluate(i => document.querySelectorAll('#wnList [data-wn]')[i].click(), goIdx);
  await page.waitForTimeout(400);
  const dest = await page.evaluate(() => { const d = window.__game.mapDest(); return d && d.id; });
  if (dest !== 'wiffle') fail(`Show me should point the arrow at the Wiffle Ball Field (got ${dest})`);
  w = await W();
  if (w.show) fail('the card should close after Show me');
  if (w.seen !== w.newest) fail(`closing the card should remember this update was seen (${w.seen} vs ${w.newest})`);
  await page.evaluate(() => window.__game.openMap()); await page.waitForTimeout(600); await shot('whats-new-map'); await page.evaluate(() => window.__game.closeMap());
  await shot('whats-new-minimap');

  // going to the Soccer Field takes its NEW tag away
  await page.evaluate(() => window.__game.fastTravel(window.__game.Z.soccer));
  await page.waitForTimeout(2000);
  w = await W();
  if (w.tags.includes('soccer')) fail('the Soccer Field still has its NEW tag after going there');
  if (!w.tags.includes('wiffle')) fail('the Wiffle Ball Field lost its NEW tag without going there');

  // open the game again: no card this time, and the tags you cleared stay cleared
  await start();
  await page.waitForTimeout(2500);
  w = await W();
  console.log('second open:', JSON.stringify(w));
  if (w.show) fail('the What\'s new card came back after it was seen');
  if (w.tags.includes('soccer')) fail('the Soccer Field NEW tag came back');
  // ⚙️ Settings can show it again
  await page.evaluate(() => { document.querySelector('#setBtn').click(); document.querySelector('#setNew').click(); }); await page.waitForTimeout(300);
  if (!(await W()).show) fail('🆕 What\'s new in Settings did not open the card');
  await page.evaluate(() => document.querySelector('#wnOk').click());

  // a note added later the SAME day still counts as new (this was missed once: a same-day note never showed)
  const later = await page.evaluate(() => { const W = window.__whatsNew; W.WHATS_NEW[0].notes.unshift({ e: '🧪', t: 'A brand new test note.' });
    const u = W.unseen(); W.open(); const n = document.querySelectorAll('#wnList li').length; W.close(); return { u: u.length, n, after: W.unseen().length }; });
  console.log('note added later the same day:', JSON.stringify(later));
  if (later.u !== 1 || later.n !== 1) fail(`a note added later the same day should show by itself on the card (${JSON.stringify(later)})`);
  if (later.after !== 0) fail('closing the card should mark the new note as seen');

  // someone who saw the very first card (before notes were remembered one by one) gets only the newer notes
  await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k) || '{}'); delete s.wnSeenK; delete s.wnGone; s.wnSeen = '2026-11-06'; s.wnVisit = { soccer: '2026-11-06' };
    localStorage.setItem(k, JSON.stringify(s)); }, SAVE_KEY);
  await start();
  await page.waitForSelector('#whatsNew.show', { timeout: 20_000 }).catch(() => {});
  const old = await page.evaluate(() => ({ show: !!document.querySelector('#whatsNew.show'), txt: [...document.querySelectorAll('#wnList li span')].map(s => s.textContent), tags: window.__whatsNew.tags() }));
  console.log('player who saw the first card:', JSON.stringify(old));
  if (!old.show) fail('a player who saw the first card should get the newer notes');
  if (old.txt.some(t => /Soccer Field!|playlist|Ollie/.test(t))) fail('notes from the first card showed again');
  if (!old.txt.some(t => /Baseball/.test(t))) fail('the Baseball Field note should show');
  if (old.tags.includes('soccer')) fail('the Soccer Field NEW tag came back for a player who already went there');

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ What\'s new shows once, guides you, and the NEW tags clear when you visit.');
} finally {
  await browser.close();
  server.close();
}
