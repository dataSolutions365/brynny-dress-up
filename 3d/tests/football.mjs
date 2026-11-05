// 🏈 Football on the ⚽ Soccer Field (3d/src/26i-football.js, 26i2-football-games.js, team picker 24e3-team-picker.js):
// walks onto the 🏈 pad to open the menu, picks a team, kicks field goals
// (good ones go through, a weak one is short), plays a whole 3-on-3 pick-up game (passes get caught, the QB gets sacked,
// someone wins), the Sack the QB drill, and the kick returns (you catch the punt and run it back).
//
// Run it with:  node 3d/tests/football.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// SHOTS=/some/folder also saves pictures.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SHOTS = process.env.SHOTS;
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
const ok = msg => console.log(`✅ ${msg}`);
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

  // Test computers draw about one picture a second, so the world isn't drawn while the test runs and the steps count game time.
  await page.evaluate(() => { const G = window.__game, r = G.renderer; r.__draw = r.render; r.render = () => {};
    window.__ft = { t: 0, bot: null }; G.onTick.push(dt => { window.__ft.t += dt; if (window.__ft.bot) window.__ft.bot(dt); }); });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const play = async (sec, until) => { const t0 = await page.evaluate(() => window.__ft.t), end = Date.now() + 400_000;
    while (Date.now() < end) { await page.waitForTimeout(300); if (await page.evaluate(() => window.__ft.t) - t0 >= sec) break;
      if (until && await page.evaluate(until)) break; } };
  const key = (code, down) => page.evaluate(([c, d]) => dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c })), [code, down]);

  // 1. football is played on the ⚽ Soccer Field: walk up the island-side touchline toward the 🏈 pad
  await page.evaluate(() => { const G = window.__game, F = G.football, [x, z] = F.FTZ.toWorld(F.FTZ.pad.lx - .2, F.FTZ.pad.lz + 4), [tx, tz] = F.FTZ.toWorld(F.FTZ.pad.lx, F.FTZ.pad.lz - 3);
    G.player.pos.set(x, 0, z); G.player.vy = 0; const a = Math.atan2(tx - x, tz - z); G.player.face = a; G.cam.yaw = a + Math.PI; });
  await key('ArrowUp', true); await play(5, () => document.querySelector('#ftMenu').classList.contains('show')); await key('ArrowUp', false);
  { const z = await page.evaluate(() => window.__game.zone() && window.__game.zone().id);
    if (z === 'soccer') ok('football is on the ⚽ Soccer Field'); else fail(`not on the soccer field, in ${z}`); }
  if (await page.evaluate(() => document.querySelector('#ftMenu').classList.contains('show'))) ok('walking onto the 🏈 pad opens the football menu'); else fail('walking onto the 🏈 pad did not open the menu');
  if (await page.evaluate(() => document.querySelector('#spMenu').classList.contains('show'))) fail('the ⚽ menu opened too');
  await shot('football-1-arrive');

  // 2. the pad opens the football menu
  await page.evaluate(() => { const G = window.__game, F = G.football, [x, z] = F.FTZ.toWorld(F.FTZ.pad.lx, F.FTZ.pad.lz); G.player.pos.set(x, 0, z); });
  await play(.6);
  if (await page.evaluate(() => document.querySelector('#ftMenu').classList.contains('show'))) ok('the 🏈 pad opens the football menu'); else fail('the 🏈 pad did not open the menu');
  await shot('football-2-menu');
  // 👕 suit up in the football uniform from the menu
  await page.evaluate(() => document.querySelector('#ftSuit').click());
  { const l = await page.evaluate(() => { const l = window.__game.SAVE.look; return { top: l.top && l.top.id, bottom: l.bottom && l.bottom.id, shoes: l.shoes && l.shoes.id, av: window.__game.av().look.top.id }; });
    if (l.top === 'jersey' && l.bottom === 'baseballpants' && l.shoes === 'ballcleats' && l.av === 'jersey') ok('👕 suits up in the football uniform'); else fail(`the football uniform didn't go on: ${JSON.stringify(l)}`); }

  // 3. field goals: stop the aim in the green and the power above the line; kick 2 is a weak one on purpose
  await page.evaluate(() => { document.querySelector('#ftMenu [data-m="fg"]').click();
    const F = window.__game.football, B = F.FTB; window.__ft.res = [];
    window.__ft.bot = () => { const S = B.fg; if (B.mode !== 'fg' || !S) return; const mid = (S.win[0] + S.win[1]) / 2;
      if (S.ph === 'aim' && Math.abs(S.u - mid) < .05) F.press();
      if (S.ph === 'power' && (S.n === 1 ? S.pw < .03 : S.pw > S.need + .1 && S.pw < S.need + .3)) F.press();
      if (S.res && window.__ft.res.length === S.n) window.__ft.res.push(S.res); }; });
  await play(2); await shot('football-3-fg');
  await play(90, () => !window.__game.football.FTB.mode);
  { const r = await page.evaluate(() => ({ made: window.__game.football.FTB.fg.made, res: window.__ft.res, menu: document.querySelector('#ftMenu').classList.contains('show') }));
    console.log('   kicks:', r.res.join(', '));
    if (r.made >= 6 && r.res.length === 8) ok(`field goals: ${r.made} of 8 good`); else fail(`field goals didn't go through: ${JSON.stringify(r)}`);
    if (r.res[1] === 'short') ok('a weak kick falls short'); else fail(`the weak kick should be short, it was ${r.res[1]}`);
    if (!r.menu) fail('no results card after the field goals'); }
  await page.evaluate(() => document.querySelector('#ftDone').click());

  // 4. the pick-up game: you throw to the open receiver, and on defense you chase the QB and grab his flag
  const bot = () => page.evaluate(() => { const G = window.__game, F = G.football, B = F.FTB, Z = F.FTZ;
    window.__ft.st = { plays: 0, catch: 0, sack: 0, td: 0, inc: 0, tag: 0, int: 0, oob: 0 }; let last = '';
    window.__ft.bot = dt => { const g = B.g; if (!g || (B.mode !== 'game' && B.mode !== 'sack')) return; const me = B.me, st = window.__ft.st;
      if (g.ph === 'pick' && g.poss === 'us') F.snap(['slants', 'deep', 'outs', 'cross'][st.plays % 4]);
      if (g.ph === 'live' && g.qb === me && !g.thrown && !g.carrier && g.t > 1.4) { const s = g.wr.map(w => Math.min(...B.them.map(d => Math.hypot(w.p.x - d.p.x, w.p.z - d.p.z)))); F.throwTo(s[0] > s[1] ? 0 : 1); }
      if (g.ph === 'live' && g.poss === 'them' && g.count >= 3) { const t = g.carrier || (!g.thrown ? g.qb : null);
        if (t && t.team === 'them') { const dx = t.p.x - me.p.x, dz = t.p.z - me.p.z, d = Math.hypot(dx, dz);
          if (d > .5) { const k = Math.min(d, 4.8 * dt) / d, [x, z] = Z.toWorld(me.p.x + dx * k, me.p.z + dz * k); G.player.pos.x = x; G.player.pos.z = z; }
          if (d < .95 && me.grabCD <= 0) F.press(); } }// inside 1.0 a grab always gets the flag
      if (g.ph === 'live' && g.carrier && g.carrier.team === 'us' && g.carrier !== me) st.caught = 1;
      const k = g.snaps + g.poss + g.drives.us + g.drives.them;
      if (g.ph === 'dead' && last !== k) { last = k; st.plays++; st[g.res] = (st[g.res] || 0) + 1; if (g.res !== 'inc' && g.carrier && g.carrier !== g.qb) st.catch++; } }; });
  await bot();
  await page.evaluate(() => window.__game.football.start('game'));
  // the team picker: you pick one player by hand, the Bears pick, then you pick again
  await page.waitForFunction(() => document.querySelector('#tpMenu.show'), null, { timeout: 10_000 });
  await shot('football-4-pick');
  const picks = [];
  for (let i = 0; i < 2; i++) {
    await page.waitForFunction(() => /Your pick/.test(document.querySelector('#tpCard').textContent), null, { timeout: 20_000 });
    picks.push(await page.evaluate(i => { const b = [...document.querySelectorAll('.tpP:not(.gone)')][i * 2]; b.click(); return b.dataset.n; }, i));
    await page.waitForTimeout(300); }
  await play(6, () => window.__game.football.FTB.mode === 'game');
  { const r = await page.evaluate(() => { const B = window.__game.football.FTB; return { mode: B.mode, us: B.us.map(e => e.name), them: B.them.map(e => e.name) }; });
    if (r.mode === 'game' && picks.every(n => r.us.includes(n)) && r.them.length === 3 && !r.them.some(n => r.us.includes(n))) ok(`picked a team: Eagles ${r.us.join(', ')} vs Bears ${r.them.join(', ')}`);
    else fail(`team picking went wrong: picked ${picks}, got ${JSON.stringify(r)}`); }
  const onScreen = () => page.evaluate(() => { const G = window.__game, B = G.football.FTB, g = B.g, c = G.camera; c.updateMatrixWorld();
    const all = [B.me, ...B.us, ...B.them], out = [];
    for (const e of all) { const v = (e === B.me ? G.av().g : e.a.g).getWorldPosition(new c.position.constructor()); v.y += .9; v.project(c);
      if (Math.abs(v.x) > .95 || Math.abs(v.y) > .9 || v.z > 1) out.push(e.name + " " + v.x.toFixed(2) + "," + v.y.toFixed(2)); }
    const q = g.qb.a.g.getWorldPosition(new c.position.constructor()), dq = q.distanceTo(c.position);
    return { poss: g.poss, ph: g.ph, out, camH: +(c.position.y - q.y).toFixed(1), dq: +dq.toFixed(1) }; });
  for (const side of ['us', 'them']) {
    await play(120, `(() => { const g = window.__game.football.FTB.g; return !!g && g.poss === '${side}' && g.ph === 'live' && g.t > .8; })()`);
    await play(.4);
    const r = await onScreen();
    if (r.poss === side && !r.out.length && r.camH > 6) ok(`the camera sees all 6 players from behind the QB (${side === 'us' ? 'your ball' : 'Bears ball'}, ${r.camH} up, ${r.dq} from the QB)`);
    else fail(`the camera misses players (${side}): ${JSON.stringify(r)}`);
    if (side === 'us') await shot('football-4-game'); else await shot('football-4b-defense'); }
  await play(400, () => !window.__game.football.FTB.mode);
  { const r = await page.evaluate(() => ({ g: (({ us, them, drives, sacks, tds }) => ({ us, them, drives, sacks, tds }))(window.__game.football.FTB.g), st: window.__ft.st,
      mode: window.__game.football.FTB.mode, card: document.querySelector('#ftCard').textContent }));
    console.log('   game:', JSON.stringify(r.g), JSON.stringify(r.st));
    if (!r.mode && /win|tie/i.test(r.card)) ok(`a whole pick-up game: Eagles ${r.g.us} - Bears ${r.g.them}`); else fail(`the pick-up game didn't finish: ${JSON.stringify(r)}`);
    if (r.st.catch >= 2) ok(`passes get caught (${r.st.catch})`); else fail(`hardly any passes were caught: ${JSON.stringify(r.st)}`);
    // the Bears get only 2 or 3 drives, so a game can pass without a sack; the Sack the QB drill below checks sacks for sure
    console.log(`   sacks in the game: ${r.g.sacks}`);
    if (await page.evaluate(() => document.querySelector('#spMenu').classList.contains('show'))) fail('the ⚽ menu popped up during football');
    if (r.st.plays >= 5) ok(`${r.st.plays} plays`); else fail(`only ${r.st.plays} plays`); }
  await page.evaluate(() => document.querySelector('#ftDone').click());

  // 5. Sack the QB: six snaps
  // the same dice every run, so a slow test computer doesn't change how the six snaps go
  await page.evaluate(() => { let a = 20261105; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  await page.evaluate(() => { const st = window.__ft.st; for (const k in st) st[k] = 0; window.__game.football.start('sack'); });
  await play(3.6); await shot('football-5-sack');
  await play(200, () => !window.__game.football.FTB.mode);
  { const g = await page.evaluate(() => ({ sacks: window.__game.football.FTB.g.sacks, snaps: window.__game.football.FTB.g.snaps, mode: window.__game.football.FTB.mode, st: window.__ft.st }));
    console.log("   drill:", JSON.stringify(g.st));
    if (!g.mode && g.snaps === 6 && g.sacks >= 2) ok(`Sack the QB: ${g.sacks} sacks in 6 snaps`); else fail(`Sack the QB: ${JSON.stringify(g)}`); }
  await page.evaluate(() => document.querySelector('#ftDone').click());

  // 6. kick returns: get under the punt, catch it and run up the field
  await page.evaluate(() => { const G = window.__game, F = G.football, B = F.FTB, Z = F.FTZ; window.__ft.catches = 0; let n = -1;
    window.__ft.bot = dt => { const S = B.r; if (B.mode !== 'ret' || !S) return; const me = B.me;
      const go = (tx, tz, sp) => { const dx = tx - me.p.x, dz = tz - me.p.z, d = Math.hypot(dx, dz); if (d < .05) return; const k = Math.min(d, sp * dt) / d, [x, z] = Z.toWorld(me.p.x + dx * k, me.p.z + dz * k); G.player.pos.x = x; G.player.pos.z = z; };
      if (S.ph === 'air') go(S.land.x, S.land.z, 5);
      if (S.ph === 'run') { if (n !== S.n) { n = S.n; window.__ft.catches++; } go(me.p.x * .9, me.p.z - 3, 5); } }; });
  await page.evaluate(() => window.__game.football.start('ret'));
  await play(3.4); await shot('football-6-punt');
  await play(200, () => !window.__game.football.FTB.mode);
  { const r = await page.evaluate(() => ({ S: (({ n, yards, td, long }) => ({ n, yards, td, long }))(window.__game.football.FTB.r), c: window.__ft.catches, mode: window.__game.football.FTB.mode }));
    if (!r.mode && r.S.n === 5 && r.c >= 4 && r.S.yards > 0) ok(`kick returns: caught ${r.c} of 5, ${r.S.yards} yards`); else fail(`kick returns: ${JSON.stringify(r)}`); }

  if (errors.length) fail('errors on the page: ' + errors.slice(0, 5).join(' | ')); else ok('no errors');
} finally { await browser.close(); server.close(); }
