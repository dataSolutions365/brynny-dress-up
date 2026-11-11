// ⚽ The Soccer Field (3d/src/26h-soccer.js): the field over its footbridge, the ⚽ pad menu, and every game:
// a penalty shootout (a real swipe shot past Leo, then saves as the goalie), target practice, keepy-uppies,
// and 1-on-1 against Kai (a goal, a trick that fools him, a tackle), and a 3-on-3 match with goalies (picking teams, a pass,
// asking for it back, a shot the goalie has to deal with, and a whole match to the end). Also checks the posts keep a ball out.
//
// Run it with:  node 3d/tests/soccer.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  const S = () => page.evaluate(() => { const s = window.__soccer.SC, b = s.ball, k = s.kai;
    return { mode: s.mode, phase: s.phase, turn: s.turn, me: s.me, cpu: s.cpu, n: s.n, clock: s.clock, menu: s.menu, own: s.own, judged: s.judged, res: s.lineRes,
      ball: b ? { x: b.p.x, y: b.p.y, z: b.p.z, st: b.st, in: b.in } : null, kai: k ? { x: k.p.x, z: k.p.z, stun: k.stun, vis: k.a.g.visible } : null,
      kaiShot: s.kaiShot, kicks: s.kicks.length, jug: s.jug ? { y: s.jug.y, vy: s.jug.vy, dead: s.jug.dead } : null }; });
  const waitGameT = async (sec, until) => { const t0 = (await S()).clock, end = Date.now() + 300_000; let t;
    while (Date.now() < end) { await page.waitForTimeout(150); t = await TM(); if ((await S()).clock - t0 >= sec || until(t)) return t; } return TM(); };
  const waitGame = async (sec, until = () => false) => { const t0 = (await S()).clock, end = Date.now() + 240_000;
    while (Date.now() < end) { await page.waitForTimeout(150); const s = await S(); if (s.clock - t0 >= sec || until(s)) return s; } return S(); };

  // ---------- the field is there, over its footbridge ----------
  const info = await page.evaluate(() => { const G = window.__game, z = G.Z.soccer, F = window.__soccer.SOC.fb;
    const [x, w] = z.toWorld(0, 0), mid = (F.t0 + F.t1) / 2; return { inside: z.inside(x, w), land: !!G.openLandAt(x, w), bridge: F.deck(mid) }; });
  if (!info.inside || !info.land) fail('The middle of the soccer field should be open land inside the Soccer Field.'); else ok('The field is open land on the far bank');

  // walk over the footbridge from the island onto the field
  await page.evaluate(() => { const G = window.__game, F = window.__soccer.SOC.fb, t = F.t0 - 2; G.player.pos.set(F.ux * t, 0, F.uz * t);
    G.cam.yaw = Math.atan2(F.ux, F.uz) + Math.PI; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; G.keys.ArrowUp = true; });
  let walked = 0;
  for (let i = 0; i < 80; i++) { await page.waitForTimeout(250); walked = await page.evaluate(() => { const G = window.__game, p = G.player.pos; return Math.hypot(p.x, p.z); });
    const t = await page.evaluate(() => window.__soccer.SOC.fb.t1 + 3); if (walked > t) break; }
  await page.evaluate(() => { window.__game.keys.ArrowUp = false; });
  const zone = await page.evaluate(() => window.__game.zone && window.__game.zone());
  const across = await page.evaluate(() => window.__soccer.SOC.fb.t1 + 2);
  if (walked < across) fail(`Walking over the footbridge should reach the field (got to ${walked.toFixed(1)}, the bank is at ${across.toFixed(1)}).`);
  else ok(`Walked over the footbridge onto the far bank (${walked.toFixed(1)} out)`);
  await shot('1-field');

  // ---------- the ⚽ pad opens the menu ----------
  await page.evaluate(() => { const z = window.__game.Z.soccer, [x, w] = z.toWorld(z.pad.lx, z.pad.lz); window.__game.player.pos.set(x, 0, w); });
  let s = await waitGame(1, s => s.menu);
  const menu = await page.evaluate(() => document.querySelector('#spMenu.show #spCard')?.textContent || '');
  if (!/Penalty shootout/.test(menu) || !/1-on-1/.test(menu) || !/Target practice/.test(menu) || !/Keepy-uppies/.test(menu)) fail(`Stepping on the ⚽ pad should open the soccer games, the card says: ${menu.slice(0, 120)}`);
  else ok('The ⚽ pad opens the soccer menu');
  await shot('2-menu');

  // ---------- 🥅 penalty shootout ----------
  await page.evaluate(() => document.querySelector('#spCard [data-m="pk"]').click());
  s = await waitGame(.5);
  if (s.mode !== 'pk' || s.phase !== 'aim') fail(`Picking the shootout should get you ready to shoot (mode ${s.mode}, ${s.phase}).`);
  await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; });
  await page.waitForTimeout(2500);// the camera has to settle behind the ball before we can swipe at the screen
  // a real swipe with a finger: from the ball up toward the top left corner
  const pts = await page.evaluate(() => { const So = window.__soccer, b = So.SC.ball.p, G = So.SOC; return { ball: So.screen(b.x, b.y, b.z), corner: So.screen(G.FL, G.GH - .45, -G.GW + .5) }; });
  await drawOff();
  const cdp = await ctx.newCDPSession(page);
  const touch = (type, p) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ x: p[0], y: p[1], id: 1 }] : [] });
  await touch('touchStart', pts.ball);
  for (let i = 1; i <= 6; i++) { await touch('touchMove', [pts.ball[0] + (pts.corner[0] - pts.ball[0]) * i / 6, pts.ball[1] + (pts.corner[1] - pts.ball[1]) * i / 6]); await page.waitForTimeout(16); }
  await touch('touchEnd');
  s = await waitGame(3, s => s.judged);
  const swiped = await page.evaluate(() => window.__soccer.SC.shot);
  console.log(`swipe shot: aimed at side ${swiped && swiped.tz.toFixed(2)}, height ${swiped && swiped.ty.toFixed(2)} → ${s.res}`);
  if (!swiped || swiped.tz > -1 || swiped.ty < .9) fail('Swiping from the ball toward the top left corner should shoot at the top left corner.');
  else if (!s.judged) fail('The swiped shot never reached the goal.');
  else ok(`A swipe shoots where it points (${s.res})`);
  await shot('3-shot');
  // now in goal: dive the way Kai shoots
  s = await waitGame(6, s => s.turn === 'save' && s.phase === 'runup');
  if (s.turn !== 'save') fail('After your kick you should go in goal.');
  await shot('4-in-goal');
  s = await waitGame(4, s => s.phase === 'fly');
  const k = s.kaiShot;
  if (!k) fail('Kai should run up and shoot.');
  else {
    const sx = await page.evaluate(tz => { const So = window.__soccer, G = So.SOC; if (Math.abs(tz) < .9) return 0;
      return Math.sign(So.screen(G.FL, 0, tz)[0] - So.screen(G.FL, 0, 0)[0]); }, k.tz);
    await page.evaluate(([sx, up]) => window.__soccer.dive(sx, up), [sx, k.ty > 1.4]);
    s = await waitGame(2, s => s.judged);
    const inGoal = Math.abs(k.tz) < 3 && k.ty < 2.1;
    console.log(`Kai shot at ${k.tz.toFixed(2)}, ${k.ty.toFixed(2)}: diving that way → ${s.res}`);
    if (inGoal && s.res !== 'save') fail(`Diving the right way should save Kai's shot, it was ${s.res}.`);
    else ok(inGoal ? 'Diving the right way saves the penalty' : 'Kai missed the goal');
  }
  await shot('5-save');
  // play the rest of the shootout through to the end
  for (let i = 0; i < 160; i++) { s = await S(); if (!s.mode) break;
    if (s.phase === 'aim') await page.evaluate(() => window.__soccer.shoot(Math.random() < .5 ? -2.3 : 2.3, .5, .65, 0));
    if (s.turn === 'save' && s.phase === 'fly' && s.kaiShot) await page.evaluate(() => window.__soccer.dive(1, false));
    await waitGame(.6); }
  s = await S();
  const card = await page.evaluate(() => document.querySelector('#spMenu.show #spCard')?.textContent || '');
  if (s.mode || !/shootout|draw|Kai wins/i.test(card)) fail(`The shootout should end with a result card (mode ${s.mode}): ${card.slice(0, 100)}`);
  else ok(`The shootout ends: ${card.split('\n')[0].slice(0, 60)}`);
  await shot('6-shootout-over');
  await page.evaluate(() => document.querySelector('#scDone')?.click());

  // ---------- the posts keep a ball out ----------
  await page.evaluate(() => window.__soccer.start('tgt'));
  await waitGame(.3);
  await page.evaluate(() => window.__soccer.shoot(window.__soccer.SOC.GW, 1, .6, 0));
  s = await waitGame(1.8);
  if (s.ball.in) fail('A shot right at the post should bounce off it, not go in.'); else ok('A shot off the post stays out');

  // ---------- 🎯 target practice ----------
  await page.evaluate(() => { window.__soccer.end(false); window.__soccer.start('tgt'); });
  const T = [[-2.45, 1.6], [2.45, 1.6], [-2.45, .5], [2.45, .5]];
  for (let i = 0; i < 10; i++) { s = await waitGame(4, s => s.phase === 'aim' || !s.mode); if (!s.mode) break;
    await page.evaluate(([tz, ty]) => window.__soccer.shoot(tz, ty, .8, 0), T[i % 4]);
    if (i === 0) { await waitGame(.75); await shot('7-target'); }
    await waitGame(1); }
  s = await waitGame(4, s => !s.mode);
  const tgt = await page.evaluate(() => window.__game.SAVE.soccer.tgt);
  if (s.mode || !(tgt >= 8)) fail(`Ten shots right at the targets should hit most of them (best ${tgt}).`); else ok(`Target practice: ${tgt} targets hit with 10 balls`);
  await page.evaluate(() => document.querySelector('#scDone')?.click());

  // ---------- 🤹 keepy-uppies ----------
  await page.evaluate(() => window.__soccer.start('jug'));
  // tap from inside the game every frame (polling from here can miss the moment on a slow test computer)
  await page.evaluate(() => { window.__jugTaps = 0; window.__game.onTick.push(() => { const j = window.__soccer.SC.jug;
    if (window.__jugTaps < 12 && j && !j.dead && j.vy < .5 && j.y > .12 && j.y < .38) { window.__soccer.press(); window.__jugTaps++; } }); });
  let taps = 0, shotDone = false;
  for (let i = 0; i < 600 && taps < 12; i++) { s = await S(); taps = await page.evaluate(() => window.__jugTaps); if (!s.jug || s.jug.dead) break;
    if (taps >= 6 && !shotDone) { shotDone = true; await shot('8-keepy-uppies'); } await page.waitForTimeout(100); }
  s = await S();
  if (s.n < 10) fail(`Tapping when the ball reaches your foot should keep it up (${s.n} in a row).`); else ok(`Keepy-uppies: ${s.n} in a row`);
  s = await waitGame(6, s => !s.mode);
  if (s.mode) fail('When the ball hits the grass the keepy-uppies should end.'); else ok('The ball dropped and the game ended');
  await page.evaluate(() => document.querySelector('#scDone')?.click());

  // ---------- 🆚 1-on-1 vs Kai ----------
  await page.evaluate(() => window.__soccer.start('v1'));
  s = await waitGame(.5);
  if (s.mode !== 'v1' || s.own !== 'me' || !s.kai.vis) fail(`1-on-1 should start with your ball and Kai on the field (${s.mode}, ${s.own}).`); else ok('1-on-1 kicks off with your ball');
  await shot('9-kickoff');
  // a trick right in front of Kai fools him
  await page.evaluate(() => { const So = window.__soccer, z = window.__game.Z.soccer, [x, w] = z.toWorld(0, 0); const G = window.__game; G.player.pos.set(x, 0, w); G.player.face = Math.PI / 2 + z.rot;
    So.SC.kai.p.set(1.6, 0, 0); So.SC.kai.stun = 0; So.SC.kai.cool = 5; So.SC.trick = 0; So.trick(); });
  s = await waitGame(.9, s => s.kai.stun > 0);
  if (!(s.kai.stun > 0)) fail('A step-over right in front of Kai should fool him.'); else ok('A step-over fools Kai');
  await shot('10-fooled');
  // shoot from close in front of the goal
  await page.evaluate(() => { const So = window.__soccer, G = window.__game, z = G.Z.soccer, F = So.SOC; So.SC.own = 'me'; So.SC.trickT = -1; G.av.socT = null;
    const [x, w] = z.toWorld(F.FL - 6, 0); G.player.pos.set(x, 0, w); G.player.face = Math.PI / 2 + z.rot; So.SC.kai.p.set(-5, 0, 6); So.SC.kai.stun = 3; });
  await waitGame(.2);
  await page.evaluate(() => window.__soccer.press());
  s = await waitGame(3, s => s.me > 0);
  if (s.me !== 1) fail(`Shooting from in front of the goal should score (${s.me} - ${s.cpu}).`); else ok('You score against Kai');
  await shot('11-goal');
  // tackle Kai when he has the ball
  s = await waitGame(4, s => s.phase === 'play' && s.own === 'cpu');
  let won = false;
  for (let i = 0; i < 14 && !won; i++) {
    await page.evaluate(() => { const So = window.__soccer, G = window.__game, z = G.Z.soccer, k = So.SC.kai; So.SC.own = 'cpu'; So.SC.cool = 0; k.trick = -1; k.stun = 0;
      const [x, w] = z.toWorld(k.p.x - .9, k.p.z); G.player.pos.set(x, 0, w); });
    await page.evaluate(() => window.__soccer.press());
    s = await waitGame(.15); won = s.own !== 'cpu'; }
  if (!won) fail('Tackling Kai from right next to him should win the ball sometimes.'); else ok('A tackle wins the ball from Kai');
  await page.evaluate(() => document.querySelector('#scLeave').click());
  s = await waitGame(.3);
  if (s.mode) fail('✕ Leave should end the game.'); else ok('✕ Leave ends the game');

  // ---------- 👟 3-on-3 with goalies ----------
  await page.evaluate(() => document.querySelector('#scDone')?.click());
  await page.evaluate(() => { const z = window.__game.Z.soccer, [x, w] = z.toWorld(z.pad.lx, z.pad.lz); window.__soccer.SC.onPad = false; window.__game.player.pos.set(x, 0, w); });
  await waitGame(1.5, s => s.menu);
  if (!await page.evaluate(() => !!document.querySelector('[data-m="team"]'))) fail('The soccer menu should have the 3-on-3 match.');
  await page.evaluate(() => document.querySelector('[data-m="team"]').click());
  await page.waitForFunction(() => document.querySelector('#tpQuick'), null, { timeout: 20_000 });
  await page.evaluate(() => document.querySelector('#tpQuick').click());
  await waitGame(3, s => s.mode === 'team');
  const TM = () => page.evaluate(() => { const s = window.__soccer.SC, tm = s.tm, S = window.__soccer.SOC, b = s.ball;
    const who = e => !e ? null : e.me ? 'me' : e.team + ':' + e.r.n + (e.key ? ':K' : '');
    return { mode: s.mode, us: s.me, them: s.cpu, own: who(tm.own), passTo: who(tm.passTo), toMe: tm.toMe || 0, phase: tm.phase, clock: tm.clock, FL: S.FL,
      pl: tm.pl.map(e => ({ team: e.team, key: e.key, me: e.me, x: e.p.x, vis: e.me || e.a.g.visible })), ball: { st: b.st, x: b.p.x }, kpSave: !!window.__kpSave }; });
  let t = await TM();
  { const us = t.pl.filter(p => p.team === 'us'), them = t.pl.filter(p => p.team === 'them'), keys = t.pl.filter(p => p.key);
    if (t.mode !== 'team' || us.length !== 4 || them.length !== 4 || keys.length !== 2 || !t.pl.every(p => p.vis)) fail(`3-on-3 should start with 4 a side, a goalie each: ${JSON.stringify(t)}`);
    else if (!keys.every(k => Math.abs(k.x) > t.FL - 1.5)) fail(`Both goalies should stand in their goals: ${JSON.stringify(keys)}`);
    else ok('3-on-3: picked teams, 4 a side with a goalie in each goal'); }
  if (t.own !== 'me') fail(`The Eagles kick off with you on the ball (${t.own}).`); else ok('3-on-3 kicks off with your ball');
  await shot('11-team-kickoff');
  // 👟 pass to a teammate, then 🙋 ask for it back
  await page.evaluate(() => window.__soccer.teamPass());
  t = await waitGameT(4, t => /^us:/.test(t.own || ''));
  if (!/^us:/.test(t.own || '')) fail(`PASS should get the ball to a teammate (${t.own}).`); else ok(`PASS: ${t.own.split(':')[1]} has it`);
  await page.evaluate(() => window.__soccer.teamPass());
  // (the Bears can still cut a pass out, so this checks the pass comes to you)
  t = await waitGameT(5, t => t.own === 'me' || t.toMe > 0);
  if (t.own !== 'me' && !(t.toMe > 0)) fail(`PASS ME! should make your teammate pass it to you (${t.own}, ${t.passTo}, ${t.ball.st}).`); else ok('PASS ME!: your teammate passes it to you');
  // ⚽ a shot from close in: a goal or the Bears' goalie stops it
  // (a quick shot from this close is never caught: a save knocks it away, so the save is read off the shot itself)
  await page.evaluate(() => { window.__kpSave = false; window.__game.onTick.push(() => { const sh = window.__soccer.SC.ball.shot; if (sh && sh.kp && sh.kp.save) window.__kpSave = true; });
    const S = window.__soccer.SOC; window.__soccer.teamPlace(S.FL - 6, 0, Math.PI / 2); window.__soccer.teamPress(); });
  const stopped = t => t.us > 0 || /^them:.*:K$/.test(t.own || '') || t.kpSave;
  t = await waitGameT(4, stopped);
  if (!stopped(t)) fail(`A shot from close in should score or be stopped by the goalie (${JSON.stringify(t.own)}, ${t.us}).`);
  else ok(t.us > 0 ? 'Your shot: GOAL!' : `Your shot: saved by the Bears' goalie`);
  // the rest of the match, with you on autopilot (same brain as the bots) and a short clock
  await page.evaluate(() => { const tm = window.__soccer.team(); tm.auto = true; tm.clock = Math.min(tm.clock, 45); });
  t = await waitGameT(150, t => !t.mode);
  const tcard = await page.evaluate(() => document.querySelector('#spCard').textContent);
  if (t.mode || !/Eagles win|tie|Bears win/.test(tcard)) fail(`The 3-on-3 match should finish (${t.mode}, ${tcard.slice(0, 80)}).`); else ok(`3-on-3 finished: ${t.us} - ${t.them}`);
  if (!(t.us + t.them >= 1)) fail('Somebody should score in a 3-on-3 match.');
  const left = await page.evaluate(() => window.__soccer.team().pl.filter(e => !e.me && e.a.g.visible).length);
  if (left) fail(`After the match the other players should go away (${left} still out).`);
  await page.evaluate(() => document.querySelector('#scDone')?.click());

  if (errors.length) fail('Page errors: ' + errors.join(' | '));
} finally { await browser.close(); server.close(); }
