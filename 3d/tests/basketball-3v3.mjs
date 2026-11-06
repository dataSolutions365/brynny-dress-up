// 🏀 3-on-3 basketball on the Basketball Court (3d/src/24e4-basketball-3v3.js): pick a team in the court menu,
// six players on the court in team kits, passing to a teammate and calling for it back, a dunk that counts,
// the Bears getting the ball and scoring, the computer players passing and rebounding, and winning the game.
//
// Run it with:  node 3d/tests/basketball-3v3.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// SHOTS=/some/folder also saves pictures of each step there.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SHOTS = process.env.SHOTS || '';
if (SHOTS) await mkdir(SHOTS, { recursive: true });
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
  const ctx = await browser.newContext({ ...devices['iPhone 13 landscape'], deviceScaleFactor: SHOTS ? 2 : 1, serviceWorkers: 'block' });
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
  // Test computers have no graphics card and draw about one picture a second, so the world isn't drawn while the test runs
  // (everything else runs as normal) and the steps below count game time. shot() draws it again for each picture.
  const drawOff = () => page.evaluate(() => { const r = window.__game.renderer; if (!r.__draw) r.__draw = r.render; r.render = () => {}; });
  await drawOff();
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3500);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 }); await drawOff(); };
  // run the game forward by hand: `sec` seconds of game time in small steps (test computers are too slow to wait for)
  const run = (sec, until = '') => page.evaluate(([sec, until]) => { const stop = until ? new Function('V', 'SP', 'return ' + until) : () => false;
    const V = window.__bb3.V, SP = window.__sports.SP; for (let t = 0; t < sec; t += 1 / 30) { window.__sports.step(1 / 30); if (!SP.mode || stop(V, SP)) break; } }, [sec, until]);
  const S = () => page.evaluate(() => { const V = window.__bb3.V, SP = window.__sports.SP, h = V.holder;
    return { mode: SP.mode, score: SP.score, opp: SP.opp, holder: h ? (h.me ? 'me' : h.team + ':' + h.name) : null, pass: !!V.pass, menu: SP.menu }; });
  const meTo = (x, z) => page.evaluate(([x, z]) => { const G = window.__game, zz = G.Z.court, [wx, wz] = zz.toWorld(x, z); G.player.pos.set(wx, 0, wz); G.player.vy = 0; }, [x, z]);

  // ---------- the court menu has a 3-on-3 game, and you pick your team ----------
  await meTo(0, 1);
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__sports.menu('court'));
  const menu = await page.evaluate(() => document.querySelector('#spMenu.show #spCard')?.textContent || '');
  if (!/3-on-3/.test(menu)) fail(`The court menu should offer a 3-on-3 game, it says: ${menu.slice(0, 160)}`); else ok('The court menu offers a 3-on-3 game');
  await page.evaluate(() => document.querySelector('#spV3').click());
  await page.waitForTimeout(400);
  const picker = await page.evaluate(() => document.querySelector('#tpMenu.show #tpCard')?.textContent || '');
  if (!/3-on-3 basketball/.test(picker)) fail('Tapping 3-on-3 should open the team picker'); else ok('The team picker opens');
  await page.evaluate(() => document.querySelector('#tpQuick').click());
  await page.waitForFunction(() => window.__sports.SP.mode === 'v3', null, { timeout: 30_000 }).catch(() => {});
  let s = await S();
  if (s.mode !== 'v3') { fail('Picking a team should start the 3-on-3 game'); throw new Error('no game'); }
  const teams = await page.evaluate(() => { const V = window.__bb3.V;
    return { us: V.us.length, them: V.them.length, vis: V.all.filter(A => !A.me).every(A => A.a.g.visible),
      kits: V.all.filter(A => !A.me).every(A => A.a.look.top.id === 'bballjersey' && A.a.look.bottom.id === 'bballshorts' && A.a.look.shoes.id === 'courtkicks'),
      on: V.all.every(A => Math.abs(A.p.x) <= 5.3 && A.p.z > -5.5 && A.p.z < 3.3) }; });
  if (teams.us !== 3 || teams.them !== 3 || !teams.vis) fail(`There should be 3 Eagles and 3 Bears on the court (${JSON.stringify(teams)})`);
  else ok('3 Eagles (you and 2 teammates) and 3 Bears are on the court');
  if (!teams.kits) fail('Every computer player should wear a basketball jersey, shorts and court sneakers'); else ok('Everyone wears a real basketball kit');
  if (!teams.on) fail('Everyone should start on the court'); else ok('Everyone starts on the court');
  if (s.holder !== 'me') fail(`You should bring the ball up first (holder: ${s.holder})`); else ok('You have the ball first');
  await shot('1-check-ball');

  // ---------- pass to a teammate, then call for it back (no steals or pick-offs for this part) ----------
  await page.evaluate(() => { window.__rnd = Math.random; Math.random = () => .99; });
  await page.evaluate(() => window.__bb3.passMe());
  s = await S();
  if (!s.pass) fail('🤾 PASS should throw the ball to a teammate'); else ok('🤾 PASS throws the ball');
  await run(1.2, '!V.pass');
  s = await S();
  if (!s.holder || !s.holder.startsWith('us:')) fail(`A teammate should catch the pass (holder: ${s.holder})`); else ok(`${s.holder.slice(3)} catches the pass`);
  await shot('2-teammate-has-it');
  await page.evaluate(() => window.__bb3.press());
  await run(1.2, '!V.pass');
  s = await S();
  if (s.holder !== 'me') fail(`🙋 CALL FOR IT should get the ball passed back to you (holder: ${s.holder})`); else ok('🙋 CALL FOR IT gets the ball back');
  await page.evaluate(() => { Math.random = window.__rnd; });

  // ---------- a dunk counts for the Eagles, and then it's the Bears' ball ----------
  await meTo(0, -3.0);
  const can = await page.evaluate(() => window.__bb3.canDunk());
  if (!can) fail('Next to the hoop with the ball you should be able to dunk'); else ok('Next to the hoop you can dunk');
  await page.evaluate(() => window.__bb3.press());
  await run(2, 'SP.score > 0');
  s = await S();
  if (s.score !== 2) fail(`The dunk should score 2 for the Eagles (score ${s.score} - ${s.opp})`); else ok('The dunk scores 2 for the Eagles');
  await run(2.5, 'V.holder');
  s = await S();
  if (!s.holder || !s.holder.startsWith('them:')) fail(`After a basket the Bears should check the ball (holder: ${s.holder})`); else ok(`The Bears check the ball (${s.holder.slice(5)})`);

  // ---------- let the game play: the Bears move the ball, shoot and score; passes and rebounds happen ----------
  const stats = await page.evaluate(() => { const V = window.__bb3.V, SP = window.__sports.SP; const seen = new Set(); let passes = 0, lp = null, gone = 0, maxD = 0;
    for (let t = 0; t < 120 && SP.mode && SP.opp < 4; t += 1 / 30) { window.__sports.step(1 / 30);
      if (V.holder === V.me && !V.pass) window.__bb3.passMe();// you just pass, so the computer players play it out
      if (V.holder) seen.add(V.holder.me ? 'me' : V.holder.team + ':' + V.holder.name);
      if (V.lastPass && V.lastPass !== lp) { lp = V.lastPass; if (!lp.from.me) passes++; }
      for (const A of V.all) if (!A.me) { if (Math.abs(A.p.x) > 5.3 || A.p.z < -5.5 || A.p.z > 3.3) gone++;
        for (const B of V.all) if (B !== A) maxD = Math.max(maxD, .62 - Math.hypot(A.p.x - B.p.x, A.p.z - B.p.z)); } }
    return { opp: SP.opp, score: SP.score, mode: SP.mode, seen: [...seen], passes, gone }; });
  if (stats.opp < 1) fail(`The Bears should score when nobody guards them (${stats.score} - ${stats.opp})`); else ok(`The Bears score too (${stats.score} - ${stats.opp})`);
  if (stats.passes < 1) fail('The computer players should pass the ball to each other'); else ok(`The computer players pass the ball (${stats.passes} passes)`);
  if (stats.seen.length < 3) fail(`The ball should go round different players (${stats.seen.join(', ')})`); else ok(`The ball goes round: ${stats.seen.join(', ')}`);
  if (stats.gone) fail('Computer players should stay on the court'); else ok('The computer players stay on the court');
  await shot('3-game-on');

  // ---------- a steal from the Bears ----------
  let stole = false;
  for (let i = 0; i < 20 && !stole; i++) {
    await page.evaluate(() => { const B = window.__bb3, V = B.V, SP = window.__sports.SP; if (!V.holder || V.holder.team !== 'them') B.check('them');
      const h = V.holder; h.shootT = -1; V.me.stealCD = 0; const G = window.__game, [x, w] = G.Z.court.toWorld(h.p.x + .7, h.p.z); G.player.pos.set(x, 0, w); });
    await run(1 / 30);
    await page.evaluate(() => window.__bb3.press());
    s = await S(); stole = s.holder === 'me'; }
  if (!stole) fail('🖐️ STEAL right next to a Bear should win the ball sometimes'); else ok('🖐️ STEAL wins the ball from a Bear');

  // ---------- win the game ----------
  await page.evaluate(() => { const SP = window.__sports.SP; SP.score = window.__bb3.WIN - 2; window.__bb3.check('us'); });
  await meTo(0, -3.0);
  await page.evaluate(() => window.__bb3.press());
  await run(4, '!SP.mode');
  s = await S();
  const card = await page.evaluate(() => document.querySelector('#spMenu.show #spCard')?.textContent || '');
  const wins = await page.evaluate(() => window.__game.SAVE.sports.v3w || 0);
  if (s.mode || !/Eagles win/.test(card) || wins < 1) fail(`Reaching ${11} should end the game with an Eagles win (mode ${s.mode}, card: ${card.slice(0, 80)})`);
  else ok('Scoring to 11 wins the game for the Eagles');
  const hidden = await page.evaluate(() => window.__bb3.V.all.filter(A => !A.me).every(A => !A.a.g.visible));
  if (!hidden) fail('The computer players should leave the court after the game'); else ok('The other players leave after the game');
  await shot('4-win');

  if (errors.length) fail('Page errors: ' + errors.join(' | '));
} finally { await browser.close(); server.close(); }
