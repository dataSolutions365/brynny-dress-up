// ⚾ Baseball test: walks over the footbridge to the Baseball Field (it began as the wiffle ball field), checks the pad opens the menu, then plays a quick game
// (bat, then pitch) and a Home Run Derby with a batter who swings on time, and checks hits, outs, runs, the overhand pitching, the catcher,
// real runners on the bases and the end card.
// The game is stepped by hand (window.__game.wfStep) so a whole game runs in a few seconds even on a slow test computer.
//
// Run it with:  node 3d/tests/wiffle.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
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
  // test computers draw slowly: stop drawing while the test runs, and count game time
  await page.evaluate(() => { const G = window.__game, r = G.renderer; r.__draw = r.render; r.render = () => {}; window.__wt = { t: 0 }; G.onTick.push(dt => { window.__wt.t += dt; }); });
  const shot = async (name, ms = 3000) => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(ms);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const play = async sec => { const t0 = await page.evaluate(() => window.__wt.t), end = Date.now() + 180_000;
    while (Date.now() < end) { await page.waitForTimeout(250); if (await page.evaluate(() => window.__wt.t) - t0 >= sec) break; } };

  // 1. walk over the footbridge from the island to the field
  await page.evaluate(() => { const G = window.__game, a = G.WB.fb.a * Math.PI / 180, d = 66; G.player.pos.set(Math.sin(a) * d, 0, Math.cos(a) * d); G.player.vy = 0;
    G.cam.yaw = a + Math.PI; G.cam.cy = G.cam.yaw; G.keys.KeyW = true; });
  await play(7);
  let s = await page.evaluate(() => { const G = window.__game, p = G.player.pos; G.keys.KeyW = false; return { d: Math.hypot(p.x, p.z), zone: G.zone()?.id, y: p.y }; });
  console.log(`walked out to ${s.d.toFixed(1)} from the middle (zone ${s.zone})`);
  if (s.d < 92) fail('Could not walk over the footbridge to the Wiffle Ball Field.');
  if (s.zone !== 'wiffle') fail(`Walking over the bridge did not bring you to the Wiffle Ball Field (zone ${s.zone}).`);

  // 2. the pad opens the menu
  await page.evaluate(() => { const G = window.__game, z = G.Z.wiffle, [x, w] = z.toWorld(G.WB.pad.lx, G.WB.pad.lz); G.player.pos.set(x, 0, w); });
  await play(1);
  s = await page.evaluate(() => ({ menu: document.querySelector('#spMenu').classList.contains('show'), txt: document.querySelector('#spCard').textContent }));
  if (!s.menu || !/Baseball Field/.test(s.txt)) fail('Stepping on the pad did not open the baseball menu.');
  await shot('wiffle-menu');
  await page.evaluate(() => { document.querySelector('#spNo').click(); });

  // play a whole game by stepping it: a batter who swings about on time, a pitcher who throws as soon as it can
  const sim = (kind, jitter) => page.evaluate(([kind, jitter]) => { const G = window.__game, WF = G.WF, WB = G.WB;
    G.wfStart(kind);const seen = { pitches: 0, swings: 0, outs: 0, ghosts: 0, halves: new Set(), opBat: 0, kinds: new Set(), maxBases: 0, calls: 0, arm: 0, mitt: 0, noRunner: 0, walkBat: 0 };let lastPh = null, prevOuts = 0;
    for (let i = 0; i < 40000 && WF.on; i++) { const b = WF.ball;
      if (WF.half === 'top' && b.st === 'pitch' && WF.mySwing == null && !WF.myHitDone && b.v0) { const left = (WB.HP - b.p.z) / b.v0.z;
        if (left <= .14 + (WF._j ?? (WF._j = (Math.random() - .5) * jitter))) { G.wfPress(); seen.swings++; WF._j = null; } }
      if (WF.phase === 'pick' && WF.t > .25) G.wfPress();
      if (WF.phase !== lastPh) { if (WF.phase === 'pitch') { seen.pitches++; seen.kinds.add(b.kind); if (WF.half === 'bot') seen.opBat++; } lastPh = WF.phase; }
      if (WF.res && WF.res !== seen._r) { seen._r = WF.res; (seen.log = seen.log || []).push(WF.half + ':' + WF.res.t); }
      if (WF.outs > prevOuts) seen.outs += WF.outs - prevOuts; prevOuts = WF.outs;
      if (WF.phase === 'wind' && !WF.pitcher.me) seen.arm = Math.max(seen.arm, WF.pitcher.a.arms[0].sh.rotation.x);
      if (b.st === 'held' && b.held === WF.catcher) seen.mitt++;
      for (let k = 1; k < 4; k++) if (WF.bases[k] && !(WF.ob && WF.ob[k] && WF.ob[k].base === k)) seen.noRunner++;
      if (WF.half === 'bot' && (WF.phase === 'pick' || WF.phase === 'pitch') && WF.batter && WF.batter.spd > 0 && i > 0 && WF.t > .3) seen.walkBat++;
      seen.halves.add(WF.half + WF.inn); seen.ghosts = Math.max(seen.ghosts, WF.bases.reduce((a, v) => a + v, 0));
      G.wfStep(1 / 30, i / 30); }
    return { on: WF.on, me: WF.me, op: WF.op, hits: WF.hits, hr: WF.hr, swings: WF.swings, ks: WF.ks, inn: WF.inn, ...seen, halves: [...seen.halves], kinds: [...seen.kinds],
      log: seen.log, card: document.querySelector('#spCard').textContent, menu: document.querySelector('#spMenu').classList.contains('show'), mode: G.SP.mode }; }, [kind, jitter]);

  // an old kept outfit (with roller skates) from before you last changed clothes is never put back on
  await page.evaluate(() => { const G = window.__game, S = G.SAVE; S.sports.prev = JSON.parse(JSON.stringify(S.look)); S.sports.prev.shoes = { id: 'inlines', c: '#ff4d8d' }; delete S.sports.kit; });

  // 3. a quick game: you bat, then you pitch
  let g = await sim('quick', .16);
  if (await page.evaluate(() => !!document.querySelector('#spUnsuit'))) fail('After a game it offered to put back an old outfit you had already changed out of (that is how roller skates came back).');
  console.log(`quick game: ${g.me}-${g.op}, ${g.pitches} pitches (${g.kinds.join(' ')}), ${g.swings} swings, ${g.hits} hits, ${g.outs} outs, ${g.ks} Ks, most runners on base ${g.ghosts}, halves ${g.halves.join(',')}`);
  if (process.env.DEBUG) console.log(g.log);
  if (g.on || g.mode) fail('The quick game never finished.');
  if (!g.menu || !/You win|win this time|tie/.test(g.card)) fail('The end card did not show who won.');
  if (g.hits < 1) fail('Swinging on time never got a hit.');
  if (g.outs < 3) fail('Nobody got out.');
  if (!g.halves.includes('bot1')) fail('The Bears never got to bat.');
  if (g.opBat < 3) fail('You hardly pitched to the Bears.');
  // one short game can happen to see only two kinds by chance, so then ask the pitcher for 60 more pitches (as in the 1st and 2nd innings)
  const more = g.kinds.length >= 3 ? [] : await page.evaluate(() => { const G = window.__game, k = new Set(), inn = G.WF.inn, kd = G.WF.kind;
    G.WF.kind = 'quick'; for (const i of [1, 2]) { G.WF.inn = i; for (let n = 0; n < 30; n++) k.add(G.wfCpuPitch().kind); } G.WF.inn = inn; G.WF.kind = kd; return [...k]; });
  if (new Set([...g.kinds, ...more]).size < 3) fail('The pitches were all the same kind.');
  if (g.arm < 3.5) fail(`Maya does not throw overhand (her arm never came up over the top: ${g.arm.toFixed(2)}).`);
  if (!g.mitt) fail('No pitch ever went into the catcher\'s mitt.');
  if (g.ghosts && g.noRunner) fail('A base was taken but nobody was standing on it.');
  if (g.walkBat) fail('The batter was walking in place at the plate instead of standing in the batting stance.');
  await page.evaluate(() => { document.querySelector('#spDone').click(); });

  // suit up in the baseball uniform, play, then "Back to my outfit" gives you your own clothes (and shoes) back
  s = await page.evaluate(() => { const G = window.__game, S = G.SAVE; S.look.shoes = { id: 'sneaker', c: '#123456' }; G.wfMenu();
    const b = [...document.querySelectorAll('#spCard button')].find(b => /Suit up/.test(b.textContent)); if (!b) return { err: 'no suit up button' };
    b.click(); const worn = S.look.shoes.id; document.querySelector('#spNo')?.click(); return { worn }; });
  if (s.err) fail(`The wiffle menu had ${s.err}.`); else if (s.worn !== 'ballcleats') fail(`Suiting up did not put on cleats (${s.worn}).`);

  // 4. a Home Run Derby with a batter right on time: some go over the fence
  g = await sim('derby', .02);
  console.log(`derby: ${g.hr} homers in ${g.swings} swings`);
  if (g.on) fail('The Derby never finished.');
  if (g.swings !== 10) fail(`The Derby should be 10 swings, it was ${g.swings}.`);
  if (g.hr < 2) fail('A batter swinging right on time hit fewer than 2 homers in the Derby.');
  s = await page.evaluate(() => { const u = document.querySelector('#spUnsuit'); if (!u) return null; u.click(); const sh = window.__game.SAVE.look.shoes; return sh.id + sh.c; });
  if (s !== 'sneaker#123456') fail(`"Back to my outfit" after the Derby did not give back your own shoes (${s}).`);
  await page.evaluate(() => { document.querySelector('#spDone').click(); });

  // 5. pictures of a real game: batting, pitching and a ball in play
  if (SHOTS) {
    const stepTo = cond => page.evaluate(c => { const G = window.__game, WF = G.WF, f = new Function('WF', 'return ' + c);
      for (let i = 0; i < 20000 && WF.on && !f(WF); i++) { if (WF.phase === 'pick' && WF.t > .25 && !f(WF)) G.wfPress();
        const b = WF.ball; if (WF.half === 'top' && b.st === 'pitch' && WF.mySwing == null && b.v0 && (WB => (WB.HP - b.p.z) / b.v0.z)(G.WB) <= .14) G.wfPress();
        G.wfStep(1 / 30, i / 30); } return WF.on; }, cond);
    await page.evaluate(() => window.__game.wfStart('game'));
    await stepTo("WF.phase==='pitch'&&WF.ball.t>.25");await shot('wiffle-bat', 2500);
    await stepTo("WF.phase==='play'&&WF.ball.t>.5");await shot('wiffle-hit', 1200);
    await stepTo("WF.half==='bot'&&WF.phase==='pick'&&WF.t>.2");await page.evaluate(() => { window.__game.WF.t = -999; });await shot('wiffle-pitch', 2500);
    await page.evaluate(() => { const G = window.__game; G.SP.mode && document.querySelector('#spLeave').click(); document.querySelector('#spDone')?.click();
      const z = G.Z.wiffle, [x, w] = z.toWorld(9, 14); G.player.pos.set(x, 0, w); G.cam.yaw = z.rot + .5; G.cam.cy = G.cam.yaw; });
    await shot('wiffle-field', 3000);
  }

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log('✅ Baseball: the field, batting, overhand pitching, the catcher, fielding, runners on base and the Derby all work.');
} finally {
  await browser.close();
  server.close();
}
