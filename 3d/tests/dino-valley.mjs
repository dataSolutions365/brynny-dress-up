// 🦖 Dino Valley test: the dinosaur park is across the canal over its own footbridge, its real-looking dinosaurs (T. rex, raptors,
// triceratops, brachiosaurus, stegosaurus) stay in their paddock, pen and meadow, the 🦖 Meet card works, the dinosaurs you adopt live
// there (not at the 🐴 Happy Barn, which keeps only farm animals), the footprint pad opens their care sheet, and you can ride your T. rex.
// Run it with:  node 3d/tests/dino-valley.mjs   SHOTS=folder saves pictures.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

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
const url = `http://127.0.0.1:${server.address().port}/3d/index.html`;

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const SHOTS = process.env.SHOTS;
if (SHOTS) await mkdir(SHOTS, { recursive: true });
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
  // Test computers have no graphics card, so the world isn't drawn while the test runs. SHOTS draws it again for each picture.
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  // stand somewhere in Dino Valley, in the place's own directions (+z toward the island)
  const go = (lx, lz, face = 0) => page.evaluate(([lx, lz, face]) => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'), [x, w] = z.toWorld(lx, lz);
    G.player.pos.set(x, .05, w); G.player.vy = 0; G.player.speed = 0; G.player.face = face + z.rot; G.cam.yaw = face + z.rot + Math.PI; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; }, [lx, lz, face]);
  const local = () => page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'), p = G.player.pos; return z.toLocal(p.x, p.z); });

  // 🦖 the place and its dinosaurs
  const place = await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'); return z && { name: z.name, d: Math.hypot(z.x, z.z), kinds: [...new Set(G.DVA.map(a => a.k))] }; });
  if (!place) fail('There should be a 🦖 Dino Valley place.');
  else { console.log(`${place.name}: ${place.d.toFixed(0)} m from the middle, dinosaurs: ${place.kinds.join(', ')}`);
    for (const k of ['trexR', 'raptorR', 'trikeR', 'longneckR', 'stegoR', 'parasaurR', 'pteroR']) if (!place.kinds.includes(k)) fail(`Dino Valley should have a ${k}.`); }

  // 🌉 walk from the island over the footbridge and in through the gate
  await page.evaluate(() => { const G = window.__game, a = 312 * Math.PI / 180, d = 64; G.player.pos.set(Math.sin(a) * d, .05, Math.cos(a) * d);
    G.player.face = a; G.cam.yaw = a + Math.PI; if ('cy' in G.cam) G.cam.cy = G.cam.yaw; G.player.vy = 0; });
  await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'), p = G.player.pos; return Math.hypot(p.x - z.x, p.z - z.z) < 14; }, null, { timeout: 45_000 })
    .catch(() => {});
  await page.keyboard.up('ArrowUp');
  const walked = await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'), p = G.player.pos; return { d: Math.hypot(p.x - z.x, p.z - z.z), y: p.y }; });
  console.log(`walked over the bridge to ${walked.d.toFixed(1)} m from the middle of Dino Valley`);
  if (walked.d > 14) fail(`You should be able to walk over the footbridge into Dino Valley (stopped ${walked.d.toFixed(1)} m from its middle).`);
  if (SHOTS) await shot('dino-gate');

  // the dinosaurs stay where they live: the T. rex in its paddock, the raptors in their pen, the rest in the meadow
  await go(0, 10); await page.waitForTimeout(8000);
  const where = await page.evaluate(() => { const G = window.__game, D = G.DV, out = [];
    for (const a of G.DVA) { const Q = a.k === 'trexR' ? D.T : a.k === 'raptorR' ? D.P : null;
      if (Q && Math.hypot(a.lx - Q.x, a.lz - Q.z) > Q.r) out.push(a.k + ' left its paddock');
      if (!Q && (Math.hypot(a.lx, a.lz) > D.fence || Math.hypot(a.lx - D.T.x, a.lz - D.T.z) < D.T.r || Math.hypot(a.lx - D.P.x, a.lz - D.P.z) < D.P.r)) out.push(a.k + ' left the meadow'); }
    return out; });
  if (where.length) fail(where.join(', '));
  if (SHOTS) { await go(-2, 4, Math.PI * .85); await shot('dino-meadow'); await go(1.5, 1.5, Math.PI * .8); await shot('dino-trex'); }

  // 🦖 walk up to the T. rex paddock fence and meet it (from outside), then meet a plant-eater in the meadow
  // (the T. rex is asked to stand still near the side of its paddock that faces the gate, and the plant-eaters are sent off the other way)
  const tr = await page.evaluate(() => { const G = window.__game, a = G.DVA.find(a => a.k === 'trexR'), D = G.DV.T, ang = Math.atan2(-D.x, 8 - D.z), r = D.r + .9;
    a.lx = D.x + Math.sin(ang) * 3; a.lz = D.z + Math.cos(ang) * 3; a.tgt = null; a.wait = 60;
    for (const b of G.DVA) if (b.ok === G.DVA.find(x => x.k === 'trikeR').ok) { [b.lx, b.lz] = [-11, -1]; b.tgt = null; b.wait = 60; }
    return [D.x + Math.sin(ang) * r, D.z + Math.cos(ang) * r, ang + Math.PI]; });
  await go(...tr); await page.waitForTimeout(800);
  let meet = await page.evaluate(() => { const b = document.querySelector('#dinoMeet'); return b.style.display === 'block' ? (b.getAttribute('aria-label') || '') + b.textContent : ''; });
  if (!/rex/i.test(meet)) fail(`Next to the T. rex paddock a Meet button should show (it says "${meet}").`);
  else { await page.evaluate(() => document.querySelector('#dinoMeet').click()); await page.waitForTimeout(500);
    const card = await page.evaluate(() => document.querySelector('#zooUI').classList.contains('show') && document.querySelector('#zooTitle').textContent);
    if (!card || !/rex/i.test(card)) fail(`Meet should open the T. rex's facts card (got "${card}").`);
    if (SHOTS) await shot('dino-meet');
    await page.evaluate(() => document.querySelector('#zooDone').click()); }
  const inside = await local();
  if (Math.hypot(inside[0] - tr[0], inside[1] - tr[1]) > .5) fail('You should not be able to walk into the T. rex paddock.');

  // the barn keeps only farm animals: adopt a triceratops and a young T. rex and they live in Dino Valley
  await page.evaluate(() => { const G = window.__game, B = G.barn(); B.own.trike = { n: 'Trixie', food: 80, shine: 80, love: 80, t: Date.now() }; B.own.trex = { n: 'Chomper', food: 80, shine: 80, love: 80, t: Date.now() };
    B.own.pig = { n: 'Peaches', food: 80, shine: 80, love: 80, t: Date.now() }; G.barn().spent = 0; });
  await page.evaluate(() => { const G = window.__game; G.openBarn(); });
  await page.waitForTimeout(300);
  const barnList = await page.evaluate(() => [...document.querySelectorAll('#barnContent [data-fsel]')].map(b => b.dataset.fsel));
  await page.evaluate(() => window.__game.closeBarn());
  console.log(`at the barn: ${barnList.join(', ')}`);
  if (!barnList.includes('pig') || barnList.some(k => ['trike', 'trex'].includes(k))) fail(`The barn should list only farm animals (it lists ${barnList.join(', ')}).`);
  // the adopted ones are made as soon as they're needed: the barn sheet makes the pig, the dino sheet makes the dinosaurs
  await go(...(await page.evaluate(() => window.__game.DV.stand)));
  await page.evaluate(() => { const G = window.__game, D = G.DV, z = G.ZONES.find(z => z.id === 'dino'), [x, w] = z.toWorld(D.bpad.lx, D.bpad.lz); G.player.pos.set(x, 0, w); G.player.onGround = true; });
  await page.waitForFunction(() => document.querySelector('#barnUI').classList.contains('show'), null, { timeout: 8000 }).catch(() => fail('Stepping on the footprint pad should open your dinosaurs\' sheet.'));
  const dinoList = await page.evaluate(() => ({ title: document.querySelector('#barnUI h2').textContent, list: [...document.querySelectorAll('#barnContent [data-fsel]')].map(b => b.dataset.fsel) }));
  console.log(`at Dino Valley (${dinoList.title}): ${dinoList.list.join(', ')}`);
  if (!dinoList.list.includes('trike') || !dinoList.list.includes('trex') || dinoList.list.includes('pig')) fail(`The Dino Valley sheet should list your dinosaurs only (it lists ${dinoList.list.join(', ')}).`);
  if (SHOTS) await shot('dino-care');
  await page.evaluate(() => window.__game.closeBarn());
  const at = await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'dino'), FA = G.farm(); return ['trike'].map(k => FA[k] && Math.hypot(FA[k].pos.x - z.x, FA[k].pos.z - z.z)); });
  if (!at.every(d => d != null && d < 17)) fail(`Your dinosaurs should live in Dino Valley (they are ${at.map(d => d == null ? '?' : d.toFixed(0)).join(', ')} m from it).`);

  // 🏇 ride the young T. rex: you sit on its saddle and walk
  await go(0, 9, Math.PI); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__game.callSteed('trex'));
  await page.waitForTimeout(500);
  const sit = await page.evaluate(() => { const G = window.__game, a = G.ride(); return a && { k: a.k, hip: G.av().g.position.y - G.player.pos.y }; });
  if (!sit || sit.k !== 'trex') fail('You should be able to ride your young T. rex.');
  const p0 = await page.evaluate(() => ({ ...window.__game.player.pos }));
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(2000); await page.keyboard.up('ArrowUp');
  const p1 = await page.evaluate(() => ({ ...window.__game.player.pos }));
  if (Math.hypot(p1.x - p0.x, p1.z - p0.z) < .5) fail('The T. rex should walk with you on it.');
  if (SHOTS) await shot('dino-ride');
  await page.evaluate(() => window.__game.stopRide(true));
  if (errors.length) fail('Errors: ' + errors.join(' | '));
  if (!process.exitCode) console.log('✅ Dino Valley works: the bridge, the dinosaurs in their paddocks, Meet, your own dinosaurs live there, and riding.');
} finally { await browser.close(); server.close(); }
