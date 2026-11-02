// Online test: two phones join the same family room, and each one sees the other exactly as they are:
// their pet (in its outfit and nail polish) following them, the skateboard in their hand or under their feet,
// the animal they ride, and the sign that says what they're busy doing. (3d/online.js + 3d/src/26c-friends-see.js)
//
// Run it with:  npm i --no-save playwright peer && npx playwright install chromium && node 3d/tests/online-see.mjs
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
  // phone A (the host) is a guy with a skateboard and Titus the dog, dressed in a crown with pink claws
  const A = await phone('host', base);
  await A.evaluate(() => {
    const G = window.__game, S = G.SAVE;
    S.name = 'Hosty'; S.look.body = 'guy'; S.look.extras = Object.assign({}, S.look.extras, { skateboard: '#ff8a1f' });
    const i = G.PETS.findIndex(p => p.name === 'Titus'); G.PETS.forEach(p => { p.owned = false; }); G.PETS[i].owned = true; S.pet = i;
    S.petCare = S.petCare || {}; S.petCare[i] = { food: 90, dirt: [0, 0, 0, 0, 0], polish: Array(12).fill('#ff3b6b'), fit: { hat: { id: 'crown', c: '#ffd23f' } }, t: Date.now(), cleanAt: Date.now() };
    document.querySelector('#play').click();
  });
  await A.waitForTimeout(1500);
  await A.evaluate(() => { document.querySelector('#netBtn').click(); document.querySelector('#nHost').click(); });
  await A.waitForFunction(() => window.__net && document.querySelector('#net .code') && /^[A-Z0-9]{5}$/.test(document.querySelector('#net .code').textContent) && /Send the link/.test(document.querySelector('#net').textContent), null, { timeout: 30_000 });
  const code = await A.evaluate(() => document.querySelector('#net .code').textContent);
  ok(`host started room ${code}`);

  // phone B joins with the invite link, and A lets them in
  const B = await phone('guest', `${base}&room=${code}`);
  await B.evaluate(() => document.querySelector('#play').click());
  await A.waitForSelector('#netAsk [data-a="yes"]', { timeout: 60_000 }).catch(async e => { console.log('guest says:', await B.evaluate(() => document.querySelector('#net .card') && document.querySelector('#net .card').textContent)); throw e; });
  await A.click('#netAsk [data-a="yes"]');
  await until(B, () => window.__net.friends().size === 1, null, 'guest sees the host');
  await until(A, () => window.__net.friends().size === 1, null, 'host sees the guest');

  // B sees Titus following A, in the crown with pink claws, and the waiting-for-adoption Titus hides
  await until(B, () => { const o = [...window.__net.friends().values()][0], s = o.shows && o.shows.pet; return s && s.h.pt.name === 'Titus' && s.h.pt.fitOver.hat.id === 'crown' && s.h.pt.nailMats[0].color.getHexString() === 'ff3b6b'; }, null, "the host's pet follows them on the guest's phone, dressed up");
  await until(B, () => !window.__game.PETS.find(p => p.name === 'Titus').g.visible, null, 'no twin Titus waiting at the parlor');
  await until(B, () => { const o = [...window.__net.friends().values()][0]; return o.a.guy && o.a.board && o.a.board.visible; }, null, 'the host is a guy carrying the skateboard');

  // A hops on the skateboard: B sees them riding it
  await A.evaluate(() => window.__game.doAction('skate'));
  await until(B, () => { const o = [...window.__net.friends().values()][0]; return o.a.skating && o.a.deck.visible && !o.a.board.visible; }, null, 'the host rides the skateboard on the guest\'s phone');
  await A.evaluate(() => window.__game.doAction('skate'));
  await until(B, () => { const o = [...window.__net.friends().values()][0]; return !o.a.skating && o.a.board.visible; }, null, 'the host hops off and carries it again');

  // A rides the horse: B sees the horse under them
  await A.evaluate(() => { const r = window.__game.SHOW.find(s => s.k === 'ride'); r._mine = r.mine; r.mine = () => ({ k: 'horse', n: 'Star' }); });
  await until(B, () => { const o = [...window.__net.friends().values()][0]; return o.shows.ride && o.shows.ride.h.a.k === 'horse' && o.a.emote && o.a.emote.id === 'ride'; }, null, 'the host rides a horse on the guest\'s phone');
  await B.waitForTimeout(600);
  await A.evaluate(() => { const r = window.__game.SHOW.find(s => s.k === 'ride'); r.mine = r._mine; });
  await until(B, () => { const o = [...window.__net.friends().values()][0]; return !o.shows.ride && !(o.a.emote && o.a.emote.id === 'ride'); }, null, 'and hops off again');

  // A opens the bakery: B sees a sign over their head
  await A.evaluate(() => window.__game.openBakery());
  await until(B, () => { const o = [...window.__net.friends().values()][0]; return o.shows.doing && o.shows.doing.d.w === '🎂 Baking a cake'; }, null, 'the guest sees what the host is busy doing');
  await A.evaluate(() => window.__game.closeBakery());
  await until(B, () => { const o = [...window.__net.friends().values()][0]; return !o.shows.doing; }, null, 'the sign goes away when they are done');

  // B changes their look: A rebuilds them, and B's own pet from before still shows on A when B adopts one
  await B.evaluate(() => { const G = window.__game, i = G.PETS.findIndex(p => p.name === 'Biscuit'); G.PETS[i].owned = true; G.SAVE.pet = i; });
  await until(A, () => { const o = [...window.__net.friends().values()][0]; return o.shows.pet && o.shows.pet.h.pt.name === 'Biscuit'; }, null, "the host sees the guest's new pet");

  // a picture of what the guest sees: SHOT=picture.png
  if (process.env.SHOT) {
    await A.evaluate(() => { const G = window.__game; G.player.pos.set(0, .15, 6); G.player.face = 0; G.doAction('skate'); });
    await B.waitForTimeout(3000);
    await B.evaluate(() => { const G = window.__game; G.player.pos.set(1.2, .15, 9.5); G.player.face = Math.PI + .3; G.cam.yaw = .3; G.cam.cy = .3; });
    await B.setViewportSize({ width: 390, height: 700 }); await B.waitForTimeout(6000); await B.screenshot({ path: process.env.SHOT });
  }

  // the host leaves: their pet goes too, and Titus is back at the parlor
  await A.evaluate(() => document.querySelector('#netBtn').click());
  await A.evaluate(() => document.querySelector('#nLeave').click());
  await until(B, () => window.__net.friends().size === 0 && window.__game.PETS.find(p => p.name === 'Titus').g.visible, null, 'when the host leaves, their pet leaves with them');

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ Friends see each other just as they are.');
} finally {
  await browser.close();
  server.close();
  peerSrv.close && peerSrv.close();
  setTimeout(() => process.exit(process.exitCode || 0), 200);
}
