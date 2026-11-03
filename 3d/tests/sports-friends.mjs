// Online test: two phones in the same family room play basketball and baseball against each other
// (3d/src/24e2-sports-friends.js): one challenges, the other says yes, both play at the same time and see each
// other's score, and the winner gets the friends-match prize and the 🆚 star challenges.
//
// Run it with:  npm i --no-save playwright peer && npx playwright install chromium && node 3d/tests/sports-friends.mjs
// It starts its own little PeerJS server, so nothing goes out to the internet except the 3D engine and PeerJS.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';
import { PeerServer } from 'peer';

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
const peerPort = 9000 + Math.floor(Math.random() * 900);
const peerSrv = PeerServer({ port: peerPort, host: '127.0.0.1', path: '/' });
const base = `http://127.0.0.1:${server.address().port}/3d/index.html?peer=127.0.0.1:${peerPort}`;

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const ok = msg => console.log(`✓ ${msg}`);
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  // phones on the same test machine: let WebRTC use the plain local address instead of a hidden .local name
  '--disable-features=WebRtcHideLocalIpsWithMdns', '--force-webrtc-ip-handling-policy=default'] });
const errors = [];
async function phone(name, url) {
  // a phone-size screen without the extra-sharp pixels, so two phones can draw at once on a test machine
  const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 200, height: 360 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('brynny-family-word', 'testfamily'); } catch (e) { } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`${name}: ${e.message}`));
  if (process.env.DEBUG) page.on('console', m => console.log(`  [${name}] ${m.text()}`));
  // offline runs: THREE_DIR / PEERJS_FILE serve the 3D engine and PeerJS from disk instead of cdn.jsdelivr.net
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  if (process.env.PEERJS_FILE) await page.route(/cdn\.jsdelivr\.net\/npm\/peerjs@/, r => r.fulfill({ path: process.env.PEERJS_FILE, contentType: 'text/javascript' }));
  await page.route(/fonts\.(googleapis|gstatic)\.com|gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180_000 });
  await page.waitForFunction(() => window.__game && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, { timeout: 240_000 });
  return page;
}
const until = (page, fn, arg, what) => page.waitForFunction(fn, arg, { timeout: 20_000 }).then(() => ok(what), () => fail(`timed out: ${what}`));

try {
  const A = await phone('host', base);
  await A.evaluate(() => { window.__game.SAVE.name = 'Hosty'; document.querySelector('#play').click(); });
  await A.waitForTimeout(1500);
  await A.evaluate(() => { document.querySelector('#netBtn').click(); document.querySelector('#nHost').click(); });
  await A.waitForFunction(() => window.__net && document.querySelector('#net .code') && /^[A-Z0-9]{5}$/.test(document.querySelector('#net .code').textContent) && /Send the link/.test(document.querySelector('#net').textContent), null, { timeout: 30_000 });
  const code = await A.evaluate(() => document.querySelector('#net .code').textContent);
  ok(`host started room ${code}`);
  const B = await phone('guest', `${base}&room=${code}`);
  await B.evaluate(() => { window.__game.SAVE.name = 'Guesty'; document.querySelector('#play').click(); });
  await A.waitForSelector('#netAsk [data-a="yes"]', { timeout: 60_000 });
  await A.click('#netAsk [data-a="yes"]');
  await until(B, () => window.__net.friends().size === 1, null, 'guest sees the host');
  await until(A, () => window.__net.friends().size === 1, null, 'host sees the guest');
  await A.evaluate(() => document.querySelector('#net').classList.remove('show'));
  await B.evaluate(() => document.querySelector('#net').classList.remove('show'));

  // 🏀 the host opens the court menu: there's a "play against your friends" choice, and they pick free throws
  await A.evaluate(() => window.__sports.menu('court'));
  await until(A, () => !!document.querySelector('#spCard [data-vs="ft"]') && !!document.querySelector('#spCard [data-vs="shoot"]'), null, 'the court menu offers matches against friends');
  await A.evaluate(() => document.querySelector('#spCard [data-vs="ft"]').click());
  await until(B, () => document.querySelector('#vsAsk.show') && /Hosty/.test(document.querySelector('#vsAsk').textContent), null, 'the guest gets asked to play free throws');
  await B.evaluate(() => document.querySelector('#vsAsk [data-a="yes"]').click());
  await until(A, () => window.__sports.SP.mode === 'ft' && window.__sports.vs.phase === 'play', null, 'everyone said yes, so the match starts for the host');
  await until(B, () => window.__sports.SP.mode === 'ft' && window.__sports.vs.phase === 'play', null, 'and for the guest');
  const lanes = await Promise.all([A, B].map(P => P.evaluate(() => window.__sports.SP.lx)));
  lanes[0] !== lanes[1] ? ok(`they stand side by side on the line (${lanes.join(' and ')})`) : fail('both players are in the same spot');

  // the guest makes 3 shots: the host sees it on the live scoreboard
  await B.evaluate(() => { const S = window.__sports.SP; S.score = 3; S.shots = 4; });
  await until(A, () => { const p = [...window.__sports.vs.players.values()].find(p => p.name === 'Guesty'); return p && p.s === 3 && p.n === 4 && /Guesty 3 \/ 10/.test(document.querySelector('#vsBoard').textContent); }, null, "the host sees the guest's score live");
  // a picture of the match on the guest's phone: SHOT=picture.png
  if (process.env.SHOT) { await A.evaluate(() => { const S = window.__sports.SP; S.score = 5; S.shots = 6; });
    await B.setViewportSize({ width: 390, height: 700 }); await B.waitForTimeout(5000); await B.screenshot({ path: process.env.SHOT }); }
  await A.evaluate(() => { const S = window.__sports.SP; S.score = 7; S.shots = 10; window.__sports.end(true); });
  await until(A, () => window.__sports.vs.phase === 'done' && /Waiting for your friends/.test(document.querySelector('#spCard').textContent), null, 'the host finishes first and waits for the guest');
  await B.evaluate(() => { const S = window.__sports.SP; S.score = 5; S.shots = 10; window.__sports.end(true); });
  await until(A, () => window.__sports.vs.phase === 'final' && /You won the match/.test(document.querySelector('#spCard').textContent), null, 'the host wins 7 to 5');
  await until(B, () => window.__sports.vs.phase === 'final' && /2nd place/.test(document.querySelector('#spCard').textContent), null, 'the guest comes in 2nd');
  await until(A, () => window.__game.SAVE.sports.vs.w === 1 && window.__game.SAVE.chal.done.sportVsWin && window.__game.SAVE.chal.done.sportVs, null, 'the host gets the win and the 🆚 star challenges');
  await until(B, () => window.__game.SAVE.sports.vs.p === 1 && window.__game.SAVE.chal.done.sportVs && !window.__game.SAVE.chal.done.sportVsWin, null, 'the guest gets the "play a friend" challenge');
  await A.evaluate(() => document.querySelector('#spCard [data-vsb="done"]').click());
  await B.evaluate(() => document.querySelector('#spCard [data-vsb="done"]').click());

  // ⚾ now the guest challenges the host to batting, the host bats too, and then the guest leaves early
  await B.evaluate(() => window.__sports.menu('batting'));
  await until(B, () => !!document.querySelector('#spCard [data-vs="bat"]'), null, 'the batting cage menu offers a match');
  await B.evaluate(() => document.querySelector('#spCard [data-vs="bat"]').click());
  await until(A, () => !!document.querySelector('#vsAsk.show'), null, 'the host gets asked to bat');
  await A.evaluate(() => document.querySelector('#vsAsk [data-a="yes"]').click());
  await until(A, () => window.__sports.SP.mode === 'bat', null, 'the batting match starts for the host');
  await until(B, () => window.__sports.SP.mode === 'bat', null, 'and for the guest');
  await A.waitForTimeout(1500);
  await until(A, () => { const G = window.__game, o = [...window.__net.friends().values()][0], z = G.ZONES.find(z => z.id === 'batting'), [px, pz] = z.toWorld(-.62, 3.4);
    return Math.hypot(o.a.g.position.x - px, o.a.g.position.z - pz) > 1.2; }, null, 'the guest waits on deck on the host\'s phone instead of standing inside them');
  await A.evaluate(() => { const B = window.__sports.SP.bat; B.hits = 2; B.hr = 1; B.far = 130; B.n = 10; });
  await until(B, () => { const p = [...window.__sports.vs.players.values()].find(p => p.name === 'Hosty'); return p && p.s === 4 && p.x.hr === 1; }, null, 'the guest sees the host\'s hits and home run');
  await B.evaluate(() => window.__sports.end(true, true));
  await A.evaluate(() => window.__sports.end(true));
  await until(A, () => window.__sports.vs.phase === 'final' && /You won the match/.test(document.querySelector('#spCard').textContent) && /left the game/.test(document.querySelector('#spCard').textContent), null, 'the guest left early, so the host wins');
  await until(A, () => window.__game.SAVE.sports.vs.w === 2 && window.__game.SAVE.sports.vs.p === 2, null, 'and it counts as their second win');
  await until(B, () => window.__game.SAVE.sports.vs.p === 1, null, 'leaving early earns no prize');

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ Friends can play basketball and baseball against each other.');
} finally {
  await browser.close();
  server.close();
  peerSrv.close && peerSrv.close();
  setTimeout(() => process.exit(process.exitCode || 0), 200);
}
