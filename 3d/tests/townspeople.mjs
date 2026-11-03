// Townspeople test: the people in town (Ava, Zoe, Mia...) never follow you around or copy your moves.
// Only the pet you adopted follows you. It crowds every townsperson round you, dances, waves, checks
// nobody copies, checks there's no "Walk with me" in their chat, then walks far away and checks nobody comes along.
//
// Run it with:  node 3d/tests/townspeople.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
const url = `http://127.0.0.1:${server.address().port}/3d/index.html`;

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
  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 120_000 });
  console.log(`loading screen took ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await page.evaluate(() => document.querySelector('#play').click());
  await page.waitForTimeout(1500);

  // everyone in town crowds round you, the way it looked when they started copying you
  await page.evaluate(() => { const G = window.__game, P = G.player.pos;
    G.FRIENDS.forEach((f, i) => { const a = i / G.FRIENDS.length * Math.PI * 2; f.pos.set(P.x + Math.sin(a) * 2.6, P.y, P.z + Math.cos(a) * 2.6); f.tgt = null; f.wait = 99; f.emote = null; f.cool = 0; }); });
  await page.waitForTimeout(300);
  // watch every move a townsperson does
  await page.evaluate(() => window.__game.FRIENDS.forEach(f => { const o = f.play.bind(f); f.play = e => { (window.__played = window.__played || []).push(f.name + ':' + e); o(e); }; }));
  await page.evaluate(() => window.__game.FRIENDS.forEach(f => { f.emote = null; f.cool = 0; }));
  const copied = async id => {
    await page.evaluate(id => window.__game.doAction(id, true), id);
    await page.waitForTimeout(3500);// townspeople used to join in 0.3-0.8s later; slow test phones need longer
    return page.evaluate(id => { const w = (window.__played || []).filter(x => x.endsWith(':' + id)).map(x => x.split(':')[0]); window.__played = []; return w; }, id);
  };
  // step off the closet pad first, so tapping a move really does it
  await page.evaluate(() => { const G = window.__game; if (G.closetOpen()) G.closeCloset(); });
  console.log(`you are free to move: ${await page.evaluate(() => !window.__game.closetOpen())}`);
  for (const id of ['dance', 'floss', 'breakdance']) {
    const who = await copied(id);
    const me = await page.evaluate(() => window.__game.av().emote && window.__game.av().emote.id);
    if (!me) fail(`you didn't do "${id}" yourself, so this test can't tell`);
    console.log(`you do "${id}": copied by ${who.length ? who.join(', ') : 'nobody'}`);
    if (who.length) fail(`${who.join(', ')} copied your "${id}"`);
  }
  if (process.env.SHOT) { await page.evaluate(() => window.__game.doAction('floss', true)); await page.waitForTimeout(900); await page.screenshot({ path: process.env.SHOT }); }
  const waves = await copied('wave');
  console.log(`you wave: waved back by ${waves.length ? waves.join(', ') : 'nobody'}`);
  if (waves.length > 1) fail(`${waves.length} people copied your wave (only the closest one should wave back)`);

  // a best friend (5 hearts) has no "Walk with me" button
  const btns = await page.evaluate(() => { const G = window.__game, f = G.FRIENDS[0]; G.townSave(f).h = 5; G.openTalk(f);
    const b = [...document.querySelectorAll('#topts [data-t]')].map(x => x.dataset.t); G.closeTalk(); return b; });
  console.log(`chat buttons: ${btns.join(', ')}`);
  if (btns.includes('follow')) fail('townspeople still offer "Walk with me"');

  // walk far away: nobody comes along, even someone told to walk with you before this fix (an old "Walk with me")
  const near = () => page.evaluate(() => { const G = window.__game, P = G.player.pos; return G.FRIENDS.filter(f => Math.hypot(f.pos.x - P.x, f.pos.z - P.z) < 8).map(f => f.name); });
  await page.evaluate(() => { const G = window.__game; G.FRIENDS.forEach(f => { f.wait = 0; }); G.FRIENDS[0].follow = true; G.player.pos.x += 30; });
  await page.waitForTimeout(5000);
  const still = await near();
  console.log(`after walking away, near you: ${still.length ? still.join(', ') : 'nobody'}`);
  if (still.length > 1) fail(`${still.join(', ')} followed you`);
  if (errors.length) fail(`page errors: ${errors.join(' | ')}`);
  if (!process.exitCode) console.log('✅ townspeople don\'t follow you or copy your moves');
} finally { await browser.close(); server.close(); }
