// 🍝 Rosie's Restaurant test: on an iPhone-size screen, steps on the 🍽️ pad, orders a pizza, waits for Rosie to bring it
// over on her tray, eats it bite by bite and checks the challenge counts. Then steps on the 🛵 pad, does a delivery rush
// (wearing the food box, following the arrow to 3 customers around town) and wins it, and does one where time runs out.
//
// Run it with:  node 3d/tests/restaurant.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
// SHOTS=some/folder saves a picture at each step.
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
  // Test computers have no graphics card and draw about one picture a second, so the world isn't drawn while the test runs
  // (everything else runs as normal) and the steps below count game time, not clock time. SHOTS draws it again for each picture.
  await page.evaluate(() => { const r = window.__game.renderer; r.__draw = r.render; r.render = () => {}; });
  const shot = async name => { if (!SHOTS) return;
    await page.evaluate(() => { const r = window.__game.renderer; r.render = r.__draw; }); await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SHOTS, name + '.png'), timeout: 120_000 });
    await page.evaluate(() => { const r = window.__game.renderer; r.render = () => {}; }); };
  const R = () => page.evaluate(() => window.__game.restaurant.state());
  const until = async (what, test, ms = 120_000) => { const end = Date.now() + ms; let s;
    while (Date.now() < end) { s = await R(); if (test(s)) return s; await page.waitForTimeout(250); } fail(`Timed out waiting: ${what}`); return s; };
  const stepOn = pad => page.evaluate(pad => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner'), P = G.restaurant.RST[pad];
    const [x, w] = z.toWorld(P.lx, P.lz); G.player.pos.set(x, 0, w); G.player.vy = 0; }, pad);
  const done = id => page.evaluate(id => !!(window.__game.SAVE.chal && window.__game.SAVE.chal.done[id]), id);

  // walk in from the front, then step on the 🍽️ pad
  await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner'); const [x, w] = z.toWorld(0, 8); G.player.pos.set(x, 0, w); });
  await page.waitForTimeout(1500);
  await stepOn('spad');
  let s = await until('the menu to open on the 🍽️ pad', s => s.open && s.phase === 'menu');
  await shot('1-menu');
  const seat = await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner'), S = G.restaurant.RST.seats[0], [x, w] = z.toWorld(S.lx, S.lz);
    return { d: Math.hypot(G.player.pos.x - x, G.player.pos.z - w), emote: G.av().emote && G.av().emote.id }; });
  if (seat.d > .05) fail(`She should sit on the chair, she is ${seat.d.toFixed(2)} away from it.`);
  if (seat.emote !== 'chair') fail(`She should be sitting, her pose is "${seat.emote}".`);

  // order a pizza: Rosie fetches it from the pass and carries it over on her tray
  await page.evaluate(() => document.querySelector('#rcontent [data-food="pizza"]').click());
  s = await until('Rosie to carry the food on her tray', s => s.rosie.tray && s.rosie.walking);
  await shot('2-rosie-brings-it');
  s = await until('the pizza to be served', s => s.phase === 'eat');
  if (s.food !== 'pizza') fail(`The table should have the pizza on it, it has "${s.food}".`);
  if (s.rosie.tray) fail('Rosie should have put the food down.');
  const onTable = await page.evaluate(() => { const G = window.__game, m = G.restaurant.meal, t = G.restaurant.RST.myT.g; return m.food && m.food.g.parent === t; });
  if (!onTable) fail('The pizza is not on your table.');
  await shot('3-served');

  // four bites eat the whole pizza, then dessert
  for (let i = 0; i < 4; i++) { await page.evaluate(() => document.querySelector('#rcontent [data-bite]').click()); s = await until(`bite ${i + 1}`, s => s.bites === i + 1, 20_000); }
  const left = await page.evaluate(() => window.__game.restaurant.meal.food.bits.filter(b => b.visible).length);
  if (left) fail(`${left} pizza slices are still on the plate after eating it all.`);
  s = await until('the dessert menu', s => s.phase === 'dessert', 20_000);
  if (!await done('eatMeal')) fail('Eating a meal did not count for the "Eat a meal" challenge.');
  await page.evaluate(() => document.querySelector('#rcontent [data-food="sundae"]').click());
  s = await until('the sundae to be served', s => s.phase === 'eatSweet');
  for (let i = 0; i < 4; i++) { await page.evaluate(() => document.querySelector('#rcontent [data-bite]').click()); await until(`sundae bite ${i + 1}`, s => s.bites === i + 1, 20_000); }
  s = await until('the meal to be over', s => s.phase === 'full', 20_000);
  if (!await done('eatDessert')) fail('Dessert did not count for the dessert challenge.');
  await page.evaluate(() => document.querySelector('#rdone').click());
  await page.waitForTimeout(500);
  s = await R();
  if (s.open) fail('Done should close the restaurant.');
  const stood = await page.evaluate(() => { const e = window.__game.av().emote; return !e || e.id !== 'chair'; });
  if (!stood) fail('She should stand up after eating.');

  // 🪑 nobody sits on anyone: a friend online is already eating in the first chair, so you take the next free one,
  // and a townsperson who wanders into a chair gets nudged out of it
  await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner');
    const a = new G.Avatar(G.av().look || {}, 'Bunny', '#2fb8a5'), [x, w] = z.toWorld(G.restaurant.RST.seats[0].lx, G.restaurant.RST.seats[0].lz);
    const o = { a, g: a.g, name: 'Bunny', pos: new G.THREE.Vector3(x, 0, w), face: 0 }; o.tgt = o.pos.clone(); a.g.position.copy(o.pos); G.scene.add(a.g);
    window.__bunny = o; G.setMapOthers(new Map([['bunny', o]])); G.friendShow(o, { dine: { s: 0 }, doing: { w: "🍝 Eating at Rosie's" } });
    G.onTick.push(dt => { if (!window.__bunny) return; o.a.update(dt, 0, false); G.friendShowStep(o, dt); }); });
  await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner'); const [x, w] = z.toWorld(0, 8); G.player.pos.set(x, 0, w); });
  await page.waitForTimeout(1000);
  await stepOn('spad');
  s = await until('the menu to open with a friend already eating', s => s.open && s.phase === 'menu');
  await page.waitForTimeout(800);
  const two = await page.evaluate(() => { const G = window.__game, o = window.__bunny, P = G.player.pos, RP = G.restaurant.RP;
    const sitters = [o.a.g.position, ...[RP.d1, RP.d2].map(d => d.pos)];
    return { seat: G.restaurant.state().seat, near: Math.min(...sitters.map(q => Math.hypot(q.x - P.x, q.z - P.z))), fe: o.a.emote && o.a.emote.id }; });
  if (two.seat === 0) fail('You sat down in the chair your friend is already sitting in.');
  if (two.near < .9) fail(`You are sitting ${two.near.toFixed(2)} from someone else: on top of them.`);
  if (two.fe !== 'chair') fail(`Your friend eating at Rosie's should be sitting down on your phone too, their pose is "${two.fe}".`);
  await page.evaluate(() => document.querySelector('#rcontent [data-food="burger"]').click());
  s = await until('the burger at the second table', s => s.phase === 'eat');
  const onT2 = await page.evaluate(() => { const r = window.__game.restaurant; return r.meal.food.g.parent === r.meal.seat.t.g; });
  if (!onT2) fail('The burger should be on the table you are sitting at.');
  await shot('3b-two-diners');
  await page.evaluate(() => document.querySelector('#rdone').click());
  await page.evaluate(() => { const G = window.__game, o = window.__bunny; window.__bunny = null; G.friendShowClear(o); G.scene.remove(o.a.g); G.setMapOthers(null); });
  const pushed = await page.evaluate(async () => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner'), f = G.FRIENDS[0], S = G.restaurant.RST.seats;
    const [x, w] = z.toWorld(S[2].lx, S[2].lz); f.pos.set(x, 0, w); f.tgt = null; f.wait = 9; await new Promise(r => setTimeout(r, 600));
    return Math.min(...S.map(s => { const [a, b] = z.toWorld(s.lx, s.lz); return Math.hypot(f.pos.x - a, f.pos.z - b); })); });
  if (pushed < .65) fail(`A townsperson is standing in a restaurant chair (${pushed.toFixed(2)} from it).`);

  // 🛵 the delivery rush
  await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner'); const [x, w] = z.toWorld(-3.4, 7); G.player.pos.set(x, 0, w); });
  await page.waitForTimeout(1500);
  await stepOn('dpad');
  s = await until('the delivery rush card', s => s.open);
  await shot('4-rush-card');
  const wins0 = await page.evaluate(() => (window.__game.SAVE.earn && window.__game.SAVE.earn.wins) || 0);
  await page.evaluate(() => document.querySelector('#rcontent [data-rush]').click());
  s = await until('the rush to start', s => s.rush.on, 10_000);
  if (!s.rush.box) fail('She should wear the food box on her back.');
  if (s.rush.limit < 25 || s.rush.limit > 150) fail(`The time limit should be fair, it is ${s.rush.limit} seconds.`);
  if (new Set(s.rush.orders.map(o => o.id)).size !== 3) fail('There should be 3 orders to 3 different places.');
  const aim = await page.evaluate(() => { const G = window.__game, d = G.mapDest(), c = G.restaurant.state().rush.cust; return d && Math.hypot(d.x - c.x, d.z - c.z); });
  if (aim == null || aim > .1) fail('The map arrow should point at the customer.');
  if (!await page.evaluate(() => document.querySelector('#delHud').classList.contains('show'))) fail('The delivery timer should show.');
  for (let k = 0; k < 3; k++) {
    // the next customer is waiting at the next place (they show up a moment after the last delivery)
    if (k) await until(`customer ${k + 1} to be waiting`, s => Math.hypot(s.rush.cust.x - s.rush.orders[k].x, s.rush.cust.z - s.rush.orders[k].z) < .1, 30_000);
    await page.evaluate(() => { const G = window.__game, c = G.restaurant.state().rush.cust; G.player.pos.set(c.x + .7, 0, c.z + .7); });
    s = await until(`delivery ${k + 1}`, s => s.rush.i === k + 1, 30_000);
    if (k === 0) await shot('5-delivered');
  }
  if (s.rush.on) fail('The rush should be over after 3 deliveries.');
  if (s.rush.box) fail('The food box should come off after the rush.');
  if (!s.best) fail('A win should go on the Star Delivery board.');
  if (!await done('rushWin')) fail('Winning did not count for the "Deliver all 3 orders" challenge.');
  const wins1 = await page.evaluate(() => (window.__game.SAVE.earn && window.__game.SAVE.earn.wins) || 0);
  if (wins1 !== wins0 + 1) fail(`Winning a rush should count as a win for the earned rides (wins went ${wins0} -> ${wins1}).`);

  // a rush where the clock runs out (started back at Rosie's, like you do in the game: you're still standing at the last
  // customer's place, and the new rush's first order can be that same place, which would deliver it straight away)
  await page.evaluate(() => { const G = window.__game, z = G.ZONES.find(z => z.id === 'diner'); const [x, w] = z.toWorld(-3.4, 7); G.player.pos.set(x, 0, w); G.restaurant.startRush(); });
  await until('the second rush to start', s => s.rush.on, 10_000);
  await page.evaluate(() => { const D = window.__game.restaurant.DL; D.t = D.limit - .5; });
  s = await until('time to run out', s => !s.rush.on, 20_000);
  if (s.rush.i !== 0) fail('Nothing was delivered in the second rush.');
  if (s.rush.box) fail('The food box should come off when time runs out.');
  if (await page.evaluate(() => !!window.__game.mapDest())) fail('The map arrow should go away when the rush ends.');

  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log("✅ Rosie serves your food, you eat it, and the delivery rush works.");
} finally {
  await browser.close();
  server.close();
}
