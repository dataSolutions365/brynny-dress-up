// Guy hair: every guy haircut is built (no errors), looks like its name (a buzz is short, an afro is big, a man bun
// has a bun at the back, surfer flow and locs come down past the jaw, spikes stand up), stays light on graphics
// memory, and hats sit on the hair instead of floating around it.
//
// Run it with:  node 3d/tests/guy-hair.mjs   (needs Playwright, like walk.mjs)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
    r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
  await page.route(/gstatic\.com\/firebasejs|firestore\.googleapis\.com/, r => r.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/3d/index.html`, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.__game && window.__game.closets && document.querySelector('#welcome.show'), null, { timeout: 120_000 });

  // for each cut: the hair's size around the head (in the head's own space) and how many points it has
  const res = await page.evaluate(() => {
    const G = window.__game, T = G.THREE, out = {};
    const look = (id, hat) => ({ body: 'guy', style: 'glam', skin: '#c98b62', eyes: '#4a2c1a', hair: { id, c: '#3a2414' }, top: { id: 'teamtee', c: '#2f6fd6' },
      bottom: { id: 'baggyjeans', c: '#6f9be0' }, dress: null, shoes: { id: 'kicks', c: '#fff' }, hat: hat ? { id: hat, c: '#ffffff' } : null, extras: {}, makeup: {} });
    // a box around some pieces, in the head's own space (the head is upright, so this is just a shift)
    const boxOf = (a, list) => { const inv = new T.Matrix4().copy(a.head.matrixWorld).invert(), b = new T.Box3();
      // only the points the shape really draws (a hair shell keeps unused points tucked under the skin)
      const v = new T.Vector3();
      for (const m of list) { const p = m.geometry.attributes.position, ix = m.geometry.index, M = new T.Matrix4().multiplyMatrices(inv, m.matrixWorld);
        const n = ix ? ix.count : p.count; for (let i = 0; i < n; i++) b.expandByPoint(v.fromBufferAttribute(p, ix ? ix.getX(i) : i).applyMatrix4(M)); }
      return b; };
    for (const id of G.closets().guyHairs) {
      const a = new G.Avatar(look(id), 'x'); a.g.updateMatrixWorld(true);
      const hair = a.hairMeshes.filter(m => m.visible), b = boxOf(a, hair);
      let pts = 0; for (const m of hair) pts += m.geometry.attributes.position.count;
      // how high the hair stands over the forehead
      let front = -1; { const inv = new T.Matrix4().copy(a.head.matrixWorld).invert(), v = new T.Vector3();
        for (const m of hair) { const p = m.geometry.attributes.position, ix = m.geometry.index, M = new T.Matrix4().multiplyMatrices(inv, m.matrixWorld);
          const n = ix ? ix.count : p.count; for (let i = 0; i < n; i++) { v.fromBufferAttribute(p, ix ? ix.getX(i) : i).applyMatrix4(M); if (v.z > .07) front = Math.max(front, v.y); } } }
      const r = { pts, top: b.max.y, low: b.min.y, back: -b.min.z, wide: b.max.x - b.min.x, front };
      // the sweatband: as wide as the hair where it sits, not floating around it
      for (const hat of ['sweatband', 'cap']) {
        const h = new G.Avatar(look(id, hat), 'x'); h.g.updateMatrixWorld(true);
        // the hat's pieces are the head's pieces that this look has and the hatless look doesn't
        const key = o => o.geometry.type + o.position.toArray().map(v => v.toFixed(4)) + (o.material.color ? o.material.color.getHexString() : '');
        const base = new Set(); a.head.traverse(o => { if (o.isMesh) base.add(key(o)); });
        const hatMeshes = []; h.head.traverse(o => { if (o.isMesh && !h.hairMeshes.includes(o) && !base.has(key(o))) hatMeshes.push(o); });
        const hb = boxOf(h, hatMeshes); r[hat] = hb.max.x - hb.min.x;
        G.freeObj(h.g);
      }
      G.freeObj(a.g); out[id] = r;
    }
    return out;
  });
  const has = id => res[id] || fail(`the guy haircut "${id}" is missing`);
  for (const [id, r] of Object.entries(res)) {
    if (r.pts > 60000) fail(`${id}: the hair has ${r.pts} points; keep each cut under 60,000 so iPhones don't run out of graphics memory`);
    if (r.pts === 0) fail(`${id}: no hair was built`);
    if (id !== 'bald' && r.sweatband > r.wide + .03) fail(`${id}: the sweatband is ${(r.sweatband * 100).toFixed(1)} cm wide around ${(r.wide * 100).toFixed(1)} cm of hair (floating)`);
    if (r.cap > r.wide + .05 && id !== 'afro' && id !== 'curly') fail(`${id}: the cap is ${(r.cap * 100).toFixed(1)} cm wide around ${(r.wide * 100).toFixed(1)} cm of hair (floating)`);
  }
  if (has('buzz') && has('crop') && res.buzz.top > res.crop.top) fail('a buzz cut should be shorter than a crew cut');
  if (has('afro') && has('crop') && res.afro.top < res.crop.top + .03) fail('the afro should be much bigger than a crew cut');
  if (has('afro') && has('crop') && res.afro.wide < res.crop.wide + .04) fail('the afro should be much wider than a crew cut');
  if (has('spiky') && has('crop') && res.spiky.top < res.crop.top + .015) fail('spiky hair should stand up');
  if (has('quiff') && has('crop') && res.quiff.front < res.crop.front + .015) fail('the swoop should be swept up over the forehead');
  if (has('manbun') && has('crop') && res.manbun.back < res.crop.back + .02) fail('the man bun needs a bun at the back');
  for (const id of ['flow', 'locs']) if (has(id) && res[id].low > -.15) fail(`${id} should come down past the jaw`);
  for (const id of ['crop', 'buzz', 'quiff', 'sidepart', 'spiky', 'pixie']) if (has(id) && res[id].low < -.16) fail(`${id} is a short cut but the hair hangs down`);
  if (errors.length) fail(`The game had errors:\n  ${errors.join('\n  ')}`);
  if (!process.exitCode) console.log(`✅ All ${Object.keys(res).length} guy haircuts look like their names and hats sit on the hair.`);
  else console.log(JSON.stringify(res, null, 1));
} finally {
  await browser.close();
  server.close();
}
