// Helicopter with friends: two phones in the same family room. The host sits in their helicopter at the Helipad, the guest
// walks up and taps 🙋 Ride along, they take off together and both phones show the guest in their seat, then the pilot lands
// and the guest hops out. (3d/src/26g-helicopter.js + 3d/online.js)
//
// Run it with:  npm i --no-save playwright peer && npx playwright install chromium && node 3d/tests/heli-friends.mjs
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
  // phone A (the host) has the helicopter and sits in it at the Helipad with the rotor spinning
  const A = await phone('host', base);
  await A.evaluate(() => { const G = window.__game; G.SAVE.name = 'Pilot'; document.querySelector('#play').click(); });
  await A.waitForTimeout(1500);
  await A.evaluate(() => { const G = window.__game; G.renderer.render = () => {}; G.heliGet(false); G.heliBoard(); });
  await A.evaluate(() => { document.querySelector('#netBtn').click(); document.querySelector('#nHost').click(); });
  await A.waitForFunction(() => window.__net && document.querySelector('#net .code') && /^[A-Z0-9]{5}$/.test(document.querySelector('#net .code').textContent) && /Send the link/.test(document.querySelector('#net').textContent), null, { timeout: 30_000 });
  const code = await A.evaluate(() => document.querySelector('#net .code').textContent);
  await A.evaluate(() => document.querySelector('#net').classList.remove('show'));
  ok(`host started room ${code}`);

  // phone B joins and walks up to the helicopter
  const B = await phone('guest', `${base}&room=${code}`);
  await B.evaluate(() => { window.__game.SAVE.name = 'Rider'; document.querySelector('#play').click(); });
  await A.waitForSelector('#netAsk [data-a="yes"]', { timeout: 60_000 });
  await A.click('#netAsk [data-a="yes"]');
  await until(B, () => window.__net.friends().size === 1, null, 'guest sees the host');
  await B.evaluate(() => { const G = window.__game; G.renderer.render = () => {}; document.querySelector('#net').classList.remove('show'); });
  await until(B, () => { const o = [...window.__net.friends().values()][0], c = o.shows && o.shows.heli; return c && c.h && c.d.on === 1 && c.d.m === 'g'; }, null, "the guest sees the host's helicopter on the ground with the host in it");
  await B.evaluate(() => { const G = window.__game, o = [...window.__net.friends().values()][0], h = o.shows.heli.h; G.player.pos.set(h.P.x + 2, 0, h.P.z + 1.5); });
  await until(B, () => /Ride with Pilot/.test(document.querySelector('#heliBtn').textContent) && document.querySelector('#heliBtn').style.display === 'block', null, 'standing next to it, the guest gets 🙋 Ride with Pilot');
  await B.evaluate(() => document.querySelector('#heliBtn').click());
  await until(B, () => !!window.__game.heli().ride, null, 'the pilot lets the guest in');
  await until(A, () => window.__game.heli().seats.filter(Boolean).length === 1, null, "the guest has a seat on the pilot's phone");
  await until(A, () => { const o = [...window.__net.friends().values()][0]; return o.shows && o.shows.hseat; }, null, 'the pilot sees the guest sitting in the helicopter');

  // take off together
  await A.waitForFunction(() => window.__game.heliModel().rpm > .9, null, { timeout: 60_000 });
  await A.evaluate(() => { window.__game.keys.Space = true; });
  await until(A, () => window.__game.heli().pos.y > 8, null, 'the pilot takes off');
  await A.evaluate(() => { const G = window.__game; G.keys.Space = false; G.keys.KeyW = true; });
  await until(B, () => window.__game.player.pos.y > 7, null, "the guest flies up with them");
  await B.waitForTimeout(2000);
  const gap = await B.evaluate(() => { const G = window.__game, o = [...window.__net.friends().values()][0], h = o.shows.heli.h, s = new G.THREE.Vector3(...G.HELI_SEATS[G.heli().ride.i].toArray()).applyEuler(new G.THREE.Euler(-h.pitch, h.yaw, -h.bank, 'YXZ')).add(h.P);
    return { d: s.distanceTo(G.player.pos), av: s.distanceTo(G.av().g.position) }; });
  console.log(`guest's seat vs where they are: ${gap.d.toFixed(3)}, their body: ${gap.av.toFixed(3)}`);
  if (gap.av > .05) fail("The guest isn't sitting in their seat in the flying helicopter.");
  const seen = await A.evaluate(() => { const G = window.__game, H = G.heli(), o = [...window.__net.friends().values()][0], i = o.shows.hseat.d.i, s = new G.THREE.Vector3(...G.HELI_SEATS[i].toArray()).applyEuler(new G.THREE.Euler(-H.pitch, H.hd, -H.bank, 'YXZ')).add(H.pos);
    return s.distanceTo(o.a.g.position); });
  console.log(`on the pilot's phone, the guest is ${seen.toFixed(3)} from their seat`);
  if (seen > .05) fail("The pilot doesn't see the guest in their seat.");
  ok('everyone sits in their seat while flying');
  if (await B.evaluate(() => /Get out/.test(document.querySelector('#heliBtn').textContent) && document.querySelector('#heliBtn').style.display === 'block')) fail('The guest could hop out up in the air.');

  // land, and the guest hops out
  await A.evaluate(() => { const G = window.__game; G.keys.KeyW = false; G.heliLand(); });
  await A.waitForFunction(() => window.__game.heli().mode === 'ground', null, { timeout: 120_000 }).then(() => ok('the pilot lands'), () => fail('the pilot never landed'));
  await until(B, () => /Get out/.test(document.querySelector('#heliBtn').textContent) && document.querySelector('#heliBtn').style.display === 'block', null, 'on the ground the guest can get out');
  await B.evaluate(() => document.querySelector('#heliBtn').click());
  await until(B, () => !window.__game.heli().ride && window.__game.player.onGround, null, 'the guest gets out and stands on the ground');
  await until(A, () => !window.__game.heli().seats.some(Boolean), null, 'the seat is free again on the pilot\'s phone');

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ Friends ride along in the helicopter.');
} finally {
  await browser.close();
  server.close();
  peerSrv.close && peerSrv.close();
  setTimeout(() => process.exit(process.exitCode || 0), 200);
}
