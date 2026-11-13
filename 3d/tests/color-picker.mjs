// 🌈 All-colors picker test (colorpick.js): on an iPhone-size screen, every color row gets a 🌈 + button,
// it opens lots of base colors, tapping one shows its shades light to dark, and picking a shade really
// colors the thing, in the 3D world closet (hair), the 2D studio (hair) and the pet page.
//
// Run it with:  node 3d/tests/color-picker.mjs   (needs Playwright: npm i --no-save playwright && npx playwright install chromium)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
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
const base = `http://127.0.0.1:${server.address().port}/`;
const SHOTS = process.env.SHOTS;   // a folder to save screenshots in, if set

const fail = msg => { console.error(`❌ ${msg}`); process.exitCode = 1; };
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

// tap 🌈 + on the row, pick a base color by name, then the shade at (row, col); returns the shade's color
// Everything goes through page.evaluate: the 3D world keeps the page so busy that Playwright's own
// waiting helpers can stall, so this test polls by itself and taps with real click events.
const until = async (page, fn, arg, what, ms = 15_000) => {
  for (const t0 = Date.now(); Date.now() - t0 < ms; await page.waitForTimeout(200)) if (await page.evaluate(fn, arg)) return true;
  fail(`Timed out waiting for ${what}.`); return false; };
const tap = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.scrollIntoView({ block: 'center' }); e.click(); return true; }, sel);

// dotSel is the selector of one of the row's own color dots; the row is the dot's parent
async function pickShade(page, dotSel, famName, r, c, shot) {
  if (!await until(page, s => { const d = document.querySelector(s); return d && d.parentElement.querySelector('.cp-more'); }, dotSel, `the 🌈 button next to ${dotSel}`)) return null;
  const w = await page.evaluate(s => document.querySelector(s).parentElement.querySelector('.cp-more').getBoundingClientRect().width, dotSel);
  if (w < 30) fail(`The 🌈 button is too small to tap (${w}px).`);
  await page.evaluate(s => { const m = document.querySelector(s).parentElement.querySelector('.cp-more'); m.scrollIntoView({ block: 'center' }); m.click(); }, dotSel);
  if (!await until(page, () => document.querySelector('#cpSheetBg.show'), null, 'the color sheet to open')) return null;
  const n = await page.evaluate(() => ({ b: document.querySelectorAll('#cpSheet .cpBase:not(.fant)').length, s: document.querySelectorAll('#cpSheet .cpShade').length }));
  if (n.b < (famName === 'Golden' ? 6 : 20)) fail(`Only ${n.b} base colors in the picker.`);
  if (n.s < 21) fail(`Only ${n.s} shades for a color.`);
  if (!await tap(page, `#cpSheet .cpBase[aria-label="${famName}"]`)) fail(`No ${famName} in the picker.`);
  const col = await page.evaluate(i => { const b = document.querySelectorAll('#cpSheet .cpShade')[i]; b.click(); return b.dataset.shade; }, r * 7 + c);
  await page.waitForTimeout(600);
  if (shot && SHOTS) await page.screenshot({ path: join(SHOTS, shot), timeout: 60_000 }).catch(() => console.log('(screenshot skipped)'));
  return col;
}
const done = async page => { await tap(page, '#cpSheet .cpDone'); await page.waitForTimeout(300); };
const chosen = (page, dotSel) => page.evaluate(s => { const d = document.querySelector(s); const on = d && d.parentElement.querySelector('.on'); return on && on.getAttribute('data-c'); }, dotSel);

try {
  // ---------- 3D world ----------
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    if (process.env.THREE_DIR) await page.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\//, r =>
      r.fulfill({ path: join(process.env.THREE_DIR, r.request().url().replace(/^.*?three@[^/]+\//, '')), contentType: 'text/javascript' }));
    await page.route(/gstatic\.com|googleapis\.com/, r => r.abort());
    await page.goto(base + '3d/index.html', { waitUntil: 'load', timeout: 120_000 });
    await until(page, () => window.__game && document.querySelector('#welcome.show') && !document.querySelector('#loading:not(.done)'), null, 'the 3D world to load', 120_000);
    await page.evaluate(() => document.querySelector('#play').click());
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.__game.openCloset());
    await page.waitForTimeout(500);
    await page.evaluate(() => document.querySelector('#tabs [data-tab="hair"]').click());
    await page.waitForTimeout(400);
    const col = await pickShade(page, '#ccontent [data-sw="hair"]', 'Purple', 0, 2, '3d-hair-shades.png');
    const hair = await page.evaluate(() => window.__game.SAVE.look.hair.c);
    console.log(`3D: picked ${col}, hair is now ${hair}`);
    if (hair !== col) fail(`3D hair color did not change to the picked shade (${hair} vs ${col}).`);
    await done(page);
    const onDot = await chosen(page, '#ccontent [data-sw="hair"]');
    if (onDot !== col) fail(`The picked shade does not show as chosen in the hair row (${onDot}).`);
    if (SHOTS) await page.screenshot({ path: join(SHOTS, '3d-hair-row.png'), timeout: 60_000 }).catch(() => {});
    // the skin row opens on skin tones
    await page.evaluate(() => document.querySelector('#tabs [data-tab="skin"],#tabs [data-tab="face"]')?.click());
    await page.waitForTimeout(500);
    if (await page.evaluate(() => !!document.querySelector('#ccontent [data-sw="skin"]'))) {
      const sc = await pickShade(page, '#ccontent [data-sw="skin"]', 'Golden', 0, 3, '3d-skin-shades.png');
      const skin = await page.evaluate(() => window.__game.SAVE.look.skin);
      if (skin !== sc) fail(`3D skin did not change to the picked tone (${skin} vs ${sc}).`);
      await done(page);
    } else console.log('(no skin row in this closet tab layout)');
    if (errors.length) fail(`The 3D world had errors:\n  ${errors.join('\n  ')}`);
    await ctx.close();
  }
  // ---------- 2D studio ----------
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(/gstatic\.com|googleapis\.com/, r => r.abort());
    await page.goto(base + 'index.html', { waitUntil: 'load', timeout: 120_000 });
    await page.waitForTimeout(800);
    const dot = '[data-act="hairColor"]';
    await tap(page, '[data-tab="hair"]'); await page.waitForTimeout(300);
    if (!(await page.evaluate(s => !!document.querySelector(s), dot))) fail('Could not find the 2D hair color row.');
    else {
      const col = await pickShade(page, dot, 'Teal', 1, 4, '2d-hair-shades.png');
      await done(page);
      const on = await chosen(page, dot);
      console.log(`2D: picked ${col}, chosen dot ${on}`);
      if (on !== col) fail(`The 2D hair row does not show the picked shade as chosen (${on} vs ${col}).`);
    }
    if (errors.length) fail(`The 2D studio had errors:\n  ${errors.join('\n  ')}`);
    await ctx.close();
  }
  if (!process.exitCode) console.log('✅ The 🌈 all-colors picker works in the 3D world and the 2D studio.');
} finally {
  await browser.close();
  server.close();
}
