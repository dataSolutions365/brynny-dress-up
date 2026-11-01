// Day and night, and holidays through the year.
//
// Day and night: the sky slowly gets dark, the stars and moon come out and the street lights glow.
// Settings has a choice: changes by itself (a whole day is about 12 minutes), match my clock, always day, or always night.
//
// Holidays: the game looks at the date on the phone or computer and turns on the holiday for today.
// Each holiday can have decorations around town, things in the shop (only sold during that holiday,
// but once you buy one it's yours forever), costumes the townspeople wear, and a special talk button.
//
// HOW TO ADD A HOLIDAY: add an entry to HOLIDAYS below. Copy one that is close to what you want.
//   when:  the first and last day, as md(month, day). Dates that wrap past New Year work too.
//   items: shop things. slot is dresses, tops, hats or extras. The 3D shape for a new id goes in COSTUMES.
//   decor: a function that puts things around town (spots = places next to the street lights).
//   npc:   outfits the townspeople wear ('night' = only after dark).
//   talk:  an extra button when you talk to someone.
//   contest: a holiday round for the model contest (same fields as CT_THEMES in index.html).
//
// For testing: ?holiday=christmas (or any id, or none) and ?time=night or ?time=day in the address.
const G = window.__game;
if (G) start();

function start() {
const { THREE, scene, SAVE } = G;
const q = new URLSearchParams(location.search);
const rnd = a => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const persist = G.persist;

/* ---------- shared little textures ---------- */
const texCache = {};
function tex(key, w, h, draw, repeat) {
  if (texCache[key]) return texCache[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return (texCache[key] = t);
}
const softDot = () => tex('dot', 64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
const emojiTex = e => tex('e' + e, 128, 128, (x) => { x.font = '100px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 72); });
const heartShape = (() => { const s = new THREE.Shape(); s.moveTo(0, -.9); s.bezierCurveTo(-.2, -.6, -1, -.3, -1, .25); s.bezierCurveTo(-1, .8, -.3, 1, 0, .5); s.bezierCurveTo(.3, 1, 1, .8, 1, .25); s.bezierCurveTo(1, -.3, .2, -.6, 0, -.9); return s; })();
let heartGeo = null; const getHeartGeo = () => heartGeo || (heartGeo = (() => { const g = new THREE.ExtrudeGeometry(heartShape, { depth: .35, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 3, curveSegments: 12 }); g.center(); return g; })());
// a pumpkin: a squashed sphere with ribs
function pumpkinGeo(r, ribs = 8, depth = .08, w = 32, h = 20) {
  const g = new THREE.SphereGeometry(r, w, h), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(x, z), k = 1 - depth * (1 - Math.pow(Math.abs(Math.cos(a * ribs / 2)), .5)); p.setX(i, x * k); p.setZ(i, z * k); }
  g.computeVertexNormals(); return g;
}

/* ================= COSTUMES =================
   The 3D pieces for holiday clothes. Each gets a kit from the doll:
   P(geometry, material, parent, x, y, z) adds a piece; mat(color, kind) makes a material
   (kinds: fabric, shiny, sparkle, metal, glass, gem, tulle, fur, denim);
   head, spine, hips, arms[0|1].hand, legs are the body parts to attach to;
   topShell, skirt, waist, legsShell are the doll's own clothes shapes. */
const sph = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
const cyl = (a, b, h, s = 16) => new THREE.CylinderGeometry(a, b, h, s);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const capsule = (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10);
// a group that moves with a body part (for things held in a hand or wings)
function holder(kit, parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); kit.av.parts.push(g); g.geometry = { dispose() {} }; return g; }
function ownMat(kit, m) { kit.av.mats.push(m); return m; }
function chestPicture(kit, key, draw) { // a little picture on the front of the top
  const m = ownMat(kit, new THREE.MeshStandardMaterial({ map: tex(key, 128, 128, draw), transparent: true, roughness: .7, depthWrite: false }));
  kit.P(new THREE.PlaneGeometry(.13, .13), m, kit.spine, 0, .28, .107).castShadow = false;
}
const COSTUMES = {
  // 🎃 Halloween
  pumpkin(k, c) {
    const m = k.mat(c, 'fabric'), green = k.mat('#3f8f3a', 'fabric'), dark = k.mat('#2b1708', 'fabric');
    k.topShell(k.mat('#2d2d3a', 'fabric'), 'long');
    const b = k.P(pumpkinGeo(.3, 8, .09, 40, 24), m, k.hips, 0, -.12, 0); b.scale.set(1, .8, 1);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const l = k.P(sph(.05, 10, 8), green, k.spine, Math.sin(a) * .1, .465, Math.cos(a) * .085); l.scale.set(1, .3, 1.7); l.rotation.y = a; }
    // jack-o'-lantern face
    for (const s of [-1, 1]) { const e = k.P(new THREE.CircleGeometry(.04, 3), dark, k.hips, s * .1, -.04, .283); e.rotation.z = Math.PI / 2; e.rotation.y = s * .32; e.rotation.x = -.2; }
    const mo = k.P(new THREE.CircleGeometry(.1, 16, Math.PI, Math.PI), dark, k.hips, 0, -.12, .3); mo.scale.y = .55;
    k.av.legAmp = .4;
  },
  ghost(k, c) {
    const solid = k.mat(c, 'fabric');
    k.topShell(solid, 'long'); k.skirt(solid, .86, .46, { curve: .7, folds: .1, k: 9 });
    k.skirt(k.mat(c, 'tulle'), .95, .64, { r0: .15, curve: .55, folds: .24, k: 6, seg: 36 });
    chestPicture(k, 'ghostface', (x) => { x.fillStyle = '#1d1a1f'; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(64 + s * 24, 52, 12, 18, 0, 0, Math.PI * 2); x.fill(); } x.beginPath(); x.ellipse(64, 96, 12, 15, 0, 0, Math.PI * 2); x.fill(); });
    k.av.legAmp = .25;
  },
  pumpkinhat(k, c) {
    const p = k.P(pumpkinGeo(.1, 8, .1), k.mat(c, 'shiny'), k.head, 0, .2, -.01); p.scale.set(1.15, .75, 1.15);
    k.P(cyl(.012, .017, .06, 8), k.mat('#5b7a2a', 'fabric'), k.head, 0, .275, -.01).rotation.z = .2;
    const l = k.P(sph(.03, 10, 8), k.mat('#3f8f3a', 'fabric'), k.head, .035, .262, 0); l.scale.set(1, .25, .6); l.rotation.z = -.3;
  },
  batwings(k, c) {
    const s0 = new THREE.Shape(); s0.moveTo(0, 0); s0.lineTo(.1, .16); s0.quadraticCurveTo(.3, .22, .46, .1);
    s0.quadraticCurveTo(.4, .02, .38, -.04); s0.quadraticCurveTo(.32, .02, .27, -.03); s0.quadraticCurveTo(.21, .03, .16, -.04); s0.quadraticCurveTo(.1, .02, .06, -.06); s0.lineTo(0, 0);
    const wm = ownMat(k, new THREE.MeshPhysicalMaterial({ color: c, roughness: .45, sheen: .6, sheenColor: new THREE.Color('#8e6cff'), side: THREE.DoubleSide }));
    const geo = new THREE.ShapeGeometry(s0, 12);
    for (const s of [-1, 1]) { const wg = holder(k, k.spine, s * .02, .34, -.1); const w = k.P(geo.clone(), wm, wg); w.scale.x = s; w.castShadow = false; k.av.wings.push({ wg, s }); }
  },
  treatbag(k, c) {
    const hand = k.arms[1].hand, m = k.mat(c, 'shiny');
    const p = k.P(pumpkinGeo(.065, 8, .1), m, hand, 0, -.16, 0); p.scale.y = .85;
    const hd = k.P(new THREE.TorusGeometry(.055, .005, 6, 18, Math.PI), k.mat('#1d1a1f', 'shiny'), hand, 0, -.13, 0); hd.rotation.y = Math.PI / 2;
    ['#ff3b6b', '#ffd23f', '#7ee081', '#b388ff'].forEach((cc, i) => k.P(sph(.016, 8, 6), k.mat(cc, 'shiny'), hand, (i % 2 - .5) * .04, -.105, (i > 1 ? .5 : -.5) * .03));
    const dark = k.mat('#2b1708', 'fabric');
    for (const s of [-1, 1]) { const e = k.P(new THREE.CircleGeometry(.014, 3), dark, hand, s * .022, -.155, .063); e.rotation.z = Math.PI / 2; }
  },
  // 🦃 Thanksgiving
  leafcrown(k, c) {
    const cols = [c, '#e0263b', '#ffd23f', '#b5651d', '#ff8a1f'];
    for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI * 2; const l = k.P(sph(.03, 10, 8), k.mat(cols[i % 5], 'fabric'), k.head, Math.sin(a) * .128, .105 + Math.cos(a) * .015, Math.cos(a) * .125 - .01); l.scale.set(1, .3, 1.5); l.rotation.y = a; l.rotation.z = .4; }
    for (const s of [-1, 1]) { k.P(sph(.016, 10, 8), k.mat('#8a5a3b', 'shiny'), k.head, s * .06, .14, .1); k.P(cyl(.017, .017, .012, 10), k.mat('#5a3a1e', 'fabric'), k.head, s * .06, .155, .1); }
  },
  turkeyhat(k, c) {
    const brown = k.mat(c, 'fabric');
    const b = k.P(sph(.09, 20, 14), brown, k.head, 0, .2, -.02); b.scale.set(1, .8, 1.1);
    k.P(sph(.035, 14, 10), brown, k.head, 0, .25, .075);
    const beak = k.P(new THREE.ConeGeometry(.012, .03, 8), k.mat('#ffd23f', 'shiny'), k.head, 0, .25, .112); beak.rotation.x = Math.PI / 2;
    k.P(sph(.011, 8, 6), k.mat('#e0263b', 'shiny'), k.head, .004, .232, .104).scale.y = 1.6;
    for (const s of [-1, 1]) k.P(sph(.007, 8, 6), k.mat('#111111', 'shiny'), k.head, s * .016, .262, .102);
    const fc = ['#e0263b', '#ff8a1f', '#ffd23f', '#8a5a3b', '#ffd23f', '#ff8a1f', '#e0263b'];
    fc.forEach((cc, i) => { const a = (i / 6 - .5) * 2.4; const f = k.P(capsule(.034, .14), k.mat(cc, 'fabric'), k.head, Math.sin(a) * .13, .23 + Math.cos(a) * .13, -.1); f.rotation.z = -a; f.scale.z = .35; });
  },
  flannel(k, c) {
    const t = tex('plaid', 64, 64, (x) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(0,0,0,.32)'; x.fillRect(0, 20, 64, 22); x.fillRect(20, 0, 22, 64); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 28, 64, 6); x.fillRect(28, 0, 6, 64); x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(0, 52, 64, 2); x.fillRect(52, 0, 2, 64); }, 3);
    const m = ownMat(k, new THREE.MeshPhysicalMaterial({ color: c, map: t, roughness: .85, sheen: .4 }));
    k.topShell(m, 'long');
    for (let i = 0; i < 4; i++) k.P(sph(.008, 8, 6), k.mat('#f4eadf', 'shiny'), k.spine, 0, .4 - i * .07, .118);
  },
  // 🎄 Christmas
  elf(k, c) {
    const m = k.mat(c, 'fabric'), red = k.mat('#e0263b', 'fabric');
    k.topShell(m, 'long'); k.skirt(m, .42, .34, { curve: .8, folds: .2, k: 6 });
    k.P(new THREE.TorusGeometry(.142, .02, 8, 32), k.mat('#1a1a1a', 'shiny'), k.hips, 0, .1, 0).rotation.x = Math.PI / 2;
    k.P(box(.05, .04, .012), k.mat('#ffd23f', 'metal'), k.hips, 0, .1, .155);
    k.P(new THREE.TorusGeometry(.07, .018, 8, 20), red, k.spine, 0, .47, 0).rotation.x = Math.PI / 2;
    for (const a of k.arms) k.P(new THREE.TorusGeometry(.046, .014, 8, 20), red, a.el, 0, -.19, 0).rotation.x = Math.PI / 2;
    k.P(sph(.016, 10, 8), k.mat('#ffd23f', 'metal'), k.spine, 0, .4, .12);
  },
  antlers(k, c) {
    const m = k.mat(c, 'fabric');
    for (const s of [-1, 1]) {
      const a = k.P(capsule(.013, .12), m, k.head, s * .075, .2, -.01); a.rotation.z = -s * .35;
      const t1 = k.P(capsule(.01, .06), m, k.head, s * .115, .24, -.01); t1.rotation.z = -s * 1.1;
      const t2 = k.P(capsule(.01, .05), m, k.head, s * .07, .275, -.01); t2.rotation.z = s * .25;
      const ear = k.P(sph(.03, 10, 8), m, k.head, s * .12, .13, -.02); ear.scale.set(1.4, .6, .5); ear.rotation.z = -s * .4;
    }
    k.P(sph(.022, 14, 10), k.mat('#ff1f3d', 'gem'), k.head, 0, -.008, .148);
  },
  candycane(k, c) {
    const t = tex('cane' + c, 64, 64, (x) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 64, 64); x.fillStyle = c; for (let i = -64; i < 128; i += 22) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 10, 0); x.lineTo(i + 10 + 32, 64); x.lineTo(i + 32, 64); x.fill(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3);
    const m = ownMat(k, new THREE.MeshPhysicalMaterial({ map: t, roughness: .25, clearcoat: 1 }));
    const g = holder(k, k.arms[0].hand, 0, -.03, .06); g.rotation.x = Math.PI / 2 - .3;
    k.P(cyl(.012, .012, .3, 12), m, g, 0, 0, 0);
    k.P(new THREE.TorusGeometry(.035, .012, 8, 20, Math.PI), m, g, .035, .15, 0);
  },
  // 💕 Valentine's Day
  hearthb(k, c) {
    const m = k.mat(c, 'shiny');
    k.P(new THREE.TorusGeometry(.135, .008, 6, 32, Math.PI), m, k.head, 0, .03, 0).rotation.y = Math.PI / 2;
    for (const s of [-1, 1]) { k.P(cyl(.003, .003, .09, 6), k.mat('#c0c0c0', 'metal'), k.head, s * .06, .2, -.01).rotation.z = -s * .25;
      const h = k.P(getHeartGeo(), k.mat(c, 'gem'), k.head, s * .072, .25, -.01); h.scale.setScalar(.035); }
  },
  // 🍀 St. Patrick's Day
  leprechaun(k, c) {
    const m = k.mat(c, 'fabric');
    k.P(cyl(.18, .18, .012, 32), m, k.head, 0, .125, -.01);
    k.P(cyl(.085, .1, .17, 24), m, k.head, 0, .21, -.01);
    k.P(cyl(.101, .101, .03, 24), k.mat('#1a1a1a', 'shiny'), k.head, 0, .145, -.01);
    k.P(box(.045, .032, .012), k.mat('#ffd23f', 'metal'), k.head, 0, .145, .092);
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; k.P(sph(.016, 8, 6), k.mat('#3fbf4a', 'shiny'), k.head, .1 + Math.sin(a) * .015, .2 + Math.cos(a) * .015, .03); }
  },
  // 🐣 Easter
  basket(k, c) {
    const hand = k.arms[1].hand, m = k.mat(c, 'fabric');
    k.P(cyl(.065, .05, .06, 16), m, hand, 0, -.17, 0);
    const hd = k.P(new THREE.TorusGeometry(.06, .006, 6, 16, Math.PI), m, hand, 0, -.14, 0); hd.rotation.y = Math.PI / 2;
    ['#ffb3d1', '#8fd8ff', '#ffe066', '#b8f0a8'].forEach((cc, i) => { const e = k.P(sph(.022, 12, 10), k.mat(cc, 'shiny'), hand, (i % 2 - .5) * .05, -.13, (i > 1 ? .5 : -.5) * .04); e.scale.y = 1.3; });
  },
  // 🎆 Fourth of July
  starglasses(k, c) {
    const m = k.mat(c, 'shiny');
    for (const s of [-1, 1]) { const st = k.P(G.starGeo, m, k.head, s * .048, .008, .135); st.scale.set(.13, .13, .05); k.P(box(.005, .005, .12), m, k.head, s * .082, .01, .075); }
    k.P(box(.025, .006, .006), m, k.head, 0, .012, .14);
  },
  // 🥳 New Year's
  sparkler(k, c) {
    const g = holder(k, k.arms[0].hand, 0, -.03, .06); g.rotation.x = Math.PI / 2 - .3;
    k.P(cyl(.004, .004, .3, 6), k.mat('#9a9a9a', 'metal'), g, 0, 0, 0);
    const glowM = ownMat(k, new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(3), toneMapped: false }));
    k.P(sph(.022, 10, 8), glowM, g, 0, .15, 0).castShadow = false;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const r = k.P(cyl(.002, .002, .07, 4), glowM, g, Math.sin(a) * .03, .15 + Math.cos(a) * .03, 0); r.rotation.z = -a; r.castShadow = false; }
  },
};
window.__costumes = COSTUMES;

/* ================= CALENDAR ================= */
const md = (m, d) => m * 100 + d;
const mdOf = d => md(d.getMonth() + 1, d.getDate());
function easter(y) { // the date of Easter (it moves every year)
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
  return [y, mo - 1, da];
}
const COSTUME_ITEMS = ['witch', 'witchhat', 'catears', 'cape', 'wings', 'wand', 'santa', 'santahat', 'fairy', 'unicorn', 'halo'];

const HOLIDAYS = [
  { id: 'newyear', n: "New Year's", e: '🥳', when: () => [md(12, 31), md(1, 2)],
    hello: 'Happy New Year! 🎆 Fireworks light up the sky at night!',
    items: [{ id: 'sparkler', slot: 'extras', e: '🎇', n: 'Sparkler', c: '#ffd23f', p: 40, d: 'A glowing sparkler for the New Year! Find it in Extras.' }],
    decor: (k) => { k.balloons(['#ffd23f', '#d4af37', '#ffffff', '#c0c0c0']); k.fireworks(['#ffd23f', '#ffffff', '#ff8fc8', '#8fd8ff']); },
    npc: { when: 'always', looks: [{ hat: { id: 'party', c: '#ffd23f' } }, { hat: { id: 'tiara', c: '#d4af37' } }, { hat: { id: 'party', c: '#c0c0c0' } }] } },
  { id: 'valentine', n: "Valentine's Day", e: '💕', when: () => [md(2, 7), md(2, 14)],
    hello: "Happy Valentine's Day! 💕 Give the townspeople valentines!",
    items: [{ id: 'hearthb', slot: 'hats', e: '💘', n: 'Heart headband', c: '#ff3b6b', p: 40, d: 'Two bouncy hearts on a headband. Find it in Hats.' }],
    decor: (k) => { k.heartBalloons(); k.falling(['#ff8fc8', '#ff3b6b', '#ffffff'], { size: .22, speed: .6, emoji: '💗' }); },
    talk: { e: '💌', label: 'Valentine', act: (f, T) => T.once(f, 'Thank you! 💕 Here is one for you too! You are the best!', '💌', 4, true) } },
  { id: 'stpatrick', n: "St. Patrick's Day", e: '🍀', when: () => [md(3, 14), md(3, 17)],
    hello: "Happy St. Patrick's Day! 🍀 Look for pots of gold!",
    items: [{ id: 'leprechaun', slot: 'hats', e: '🎩', n: 'Lucky hat', c: '#2e9e4f', p: 50, d: 'A green top hat with a shiny buckle. Find it in Hats.' }],
    decor: (k) => k.potsOfGold(),
    npc: { when: 'always', looks: [{ hat: { id: 'leprechaun', c: '#2e9e4f' } }, { top: { id: 'tee', c: '#3fbf4a' }, bottom: { id: 'jeans', c: '#3a5bd9' }, dress: null }, { hat: { id: 'flowers', c: '#7ee081' } }] } },
  { id: 'easter', n: 'Easter', e: '🐣', when: (y) => { const [Y, M, D] = easter(y), a = new Date(Y, M, D - 7), b = new Date(Y, M, D + 1); return [mdOf(a), mdOf(b)]; },
    hello: 'Happy Easter! 🐣 Find the hidden eggs all over town!',
    items: [{ id: 'basket', slot: 'extras', e: '🧺', n: 'Egg basket', c: '#c9a26b', p: 40, d: 'A basket full of pretty eggs. Find it in Extras.' }],
    decor: (k) => k.eggHunt(12),
    npc: { when: 'always', looks: [{ hat: { id: 'bunny', c: '#ffffff' } }, { hat: { id: 'flowers', c: '#ffb3d1' } }, { hat: { id: 'bunny', c: '#ffb3d1' } }] } },
  { id: 'july4', n: 'the Fourth of July', e: '🎆', when: () => [md(7, 1), md(7, 4)],
    hello: 'Happy Fourth of July! 🎆 Fireworks at night!',
    items: [{ id: 'starglasses', slot: 'extras', e: '🕶️', n: 'Star glasses', c: '#e0263b', p: 40, d: 'Star-shaped party glasses. Find them in Extras.' }],
    decor: (k) => { k.balloons(['#e0263b', '#ffffff', '#3a5bd9']); k.fireworks(['#e0263b', '#ffffff', '#4fb6ff']); },
    npc: { when: 'always', looks: [{ extras: { starglasses: '#e0263b' } }, { extras: { starglasses: '#3a5bd9' } }, { hat: { id: 'cap', c: '#3a5bd9' } }] } },
  { id: 'halloween', n: 'Halloween', e: '🎃', when: () => [md(10, 1), md(11, 2)],
    hello: 'Happy Halloween! 🎃 When it gets dark, put on a costume and go trick-or-treating! Enter the costume contest at the ⭐ Star Model Agency!',
    items: [
      { id: 'pumpkin', slot: 'dresses', e: '🎃', n: 'Pumpkin costume', c: '#ff8a1f', p: 80, d: "A round, puffy pumpkin with a jack-o'-lantern face! Find it in Dresses." },
      { id: 'ghost', slot: 'dresses', e: '👻', n: 'Ghost costume', c: '#ffffff', p: 70, d: 'A floaty, swishy ghost gown. Boo! Find it in Dresses.' },
      { id: 'pumpkinhat', slot: 'hats', e: '🎃', n: 'Pumpkin hat', c: '#ff8a1f', p: 40, d: 'A little pumpkin to wear on your head. Find it in Hats.' },
      { id: 'batwings', slot: 'extras', e: '🦇', n: 'Bat wings', c: '#2d2d3a', p: 60, d: 'Flappy bat wings! Find them in Extras.' },
      { id: 'treatbag', slot: 'extras', e: '🍬', n: 'Treat bucket', c: '#ff8a1f', p: 30, d: 'A pumpkin bucket for all your candy. Find it in Extras.' }],
    decor: (k) => { k.jackOLanterns(); k.bats(); },
    contest: { id: 'costume', e: '🎃', n: 'Halloween Costume Contest', tip: 'Wear your spookiest, cutest costume! Pumpkins, ghosts, witches, bats and black cats!',
      dress: ['pumpkin', 'ghost', 'witch', 'fairy'], top: ['hoodie'], bottom: ['leggings', 'tutu'], shoes: ['boots', 'platforms'], hat: ['pumpkinhat', 'witchhat', 'catears'],
      extras: ['batwings', 'treatbag', 'cape', 'wand', 'wings'], fams: ['orange', 'black', 'purple', 'white', 'green'] },
    npc: { when: 'night', looks: [
      { dress: { id: 'witch', c: '#5b2a86' }, hat: { id: 'witchhat', c: '#2d2d3a' }, extras: { wand: '#7ee081' } },
      { dress: { id: 'pumpkin', c: '#ff8a1f' }, hat: { id: 'pumpkinhat', c: '#ff8a1f' }, extras: {} },
      { dress: { id: 'ghost', c: '#ffffff' }, hat: null, extras: {} },
      { dress: null, top: { id: 'hoodie', c: '#2d2d3a' }, bottom: { id: 'leggings', c: '#2d2d3a' }, hat: { id: 'catears', c: '#2d2d3a' }, extras: {} },
      { dress: { id: 'fairy', c: '#7ee081' }, hat: { id: 'flowers', c: '#ff6fae' }, extras: { wings: '#b388ff', wand: '#ffd23f' } },
      { dress: { id: 'party', c: '#1d1a1f' }, hat: null, extras: { cape: '#e0263b', batwings: '#2d2d3a' } },
      { dress: { id: 'stargown', c: '#3b2fa0' }, hat: { id: 'crown', c: '#d4af37' }, extras: { wand: '#ffd23f' } }] },
    talk: { e: '🎃', label: 'Trick or treat!', act: (f, T) => T.trickOrTreat(f) } },
  { id: 'thanksgiving', n: 'Thanksgiving', e: '🦃', when: () => [md(11, 3), md(11, 30)],
    hello: 'Happy Thanksgiving! 🦃 Ask the townspeople what they are thankful for!',
    items: [
      { id: 'turkeyhat', slot: 'hats', e: '🦃', n: 'Turkey hat', c: '#8a5a3b', p: 50, d: 'A silly turkey with a fan of feathers! Find it in Hats.' },
      { id: 'leafcrown', slot: 'hats', e: '🍂', n: 'Leaf crown', c: '#ff8a1f', p: 40, d: 'A crown of fall leaves and acorns. Find it in Hats.' },
      { id: 'flannel', slot: 'tops', e: '🍁', n: 'Cozy flannel', c: '#c0392b', p: 40, d: 'A warm plaid shirt for fall. Find it in Tops.' }],
    decor: (k) => { k.hayBales(); k.falling(['#ff8a1f', '#e0263b', '#ffd23f', '#b5651d'], { size: .3, speed: .9, sway: 1.4 }); },
    contest: { id: 'fall', e: '🍂', n: 'Fall Festival', tip: 'Cozy fall colors! Flannel, sweaters, boots, scarves and leaf crowns.',
      dress: ['sundress'], top: ['flannel', 'sweater', 'furcoat'], bottom: ['jeans', 'leggings', 'maxi'], shoes: ['boots', 'furboots'], hat: ['leafcrown', 'turkeyhat'],
      extras: ['scarf', 'purse'], fams: ['orange', 'brown', 'red', 'yellow'] },
    npc: { when: 'always', looks: [{ hat: { id: 'leafcrown', c: '#ff8a1f' } }, { dress: null, top: { id: 'flannel', c: '#c0392b' }, bottom: { id: 'jeans', c: '#3a5bd9' } }, { hat: { id: 'turkeyhat', c: '#8a5a3b' } }, { extras: { scarf: '#ff8a1f' } }] },
    talk: { e: '🦃', label: 'Thankful?', act: (f, T) => T.once(f, rnd(['I am thankful for my friends, like YOU! 💖', 'I am thankful for pumpkin pie! 🥧', 'I am thankful for cozy sweaters and hot cocoa ☕', 'I am thankful for my pets! 🐾', 'I am thankful for sunny days and fall leaves 🍂']) + '\n\nWhat are you thankful for? 😊', '🍂', 3, true) } },
  { id: 'christmas', n: 'Christmas', e: '🎄', when: () => [md(12, 1), md(12, 30)],
    hello: 'Merry Christmas! 🎄 It is snowing! Give the townspeople presents!',
    items: [
      { id: 'elf', slot: 'dresses', e: '🧝', n: 'Elf dress', c: '#2e9e4f', p: 80, d: "A jolly green elf dress. Find it in Dresses." },
      { id: 'antlers', slot: 'hats', e: '🦌', n: 'Reindeer antlers', c: '#8a5a3b', p: 50, d: 'Antlers AND a shiny red nose! Find them in Hats.' },
      { id: 'candycane', slot: 'extras', e: '🍭', n: 'Candy cane', c: '#e0263b', p: 30, d: 'A big striped candy cane to carry. Find it in Extras.' }],
    decor: (k) => { k.xmasTrees(); k.falling(['#ffffff', '#eef6ff'], { size: .18, speed: 1.1, count: 700 }); },
    contest: { id: 'xmas', e: '🎄', n: 'Christmas Party', tip: 'Red, green and sparkly! Elf and Santa dresses, antlers, candy canes and cozy boots.',
      dress: ['elf', 'santa'], top: ['sweater', 'furcoat', 'sequin'], bottom: ['leggings', 'skirt', 'tutu'], shoes: ['boots', 'furboots'], hat: ['santahat', 'antlers'],
      extras: ['candycane', 'scarf'], fams: ['red', 'green', 'white', 'gold'] },
    npc: { when: 'always', looks: [{ hat: { id: 'santahat', c: '#e0263b' } }, { hat: { id: 'antlers', c: '#8a5a3b' } }, { dress: { id: 'elf', c: '#2e9e4f' }, top: null, bottom: null }, { extras: { scarf: '#e0263b' }, hat: { id: 'santahat', c: '#e0263b' } }] },
    talk: { e: '🎁', label: 'Give a gift', act: (f, T) => T.once(f, rnd(['A present for me?! 🎁 Thank you! Merry Christmas! 🎄', 'Oh wow, I love it! 😍 Here, a cookie for you! 🍪', 'You are so kind! ❄️ Merry Christmas!']), '🎁', 5, true) } },
];

// which holiday is it today? (the first one in the list whose dates match)
function holidayFor(date) {
  const v = mdOf(date);
  for (const h of HOLIDAYS) { const [a, b] = h.when(date.getFullYear()); if (a <= b ? v >= a && v <= b : v >= a || v <= b) return h; }
  return null;
}
const forced = q.get('holiday');
const HOL = forced ? (HOLIDAYS.find(h => h.id === forced) || null) : holidayFor(new Date());
window.__season = { now: () => HOL, on: id => !!HOL && HOL.id === id, list: HOLIDAYS, holidayFor, night: () => nightK };

// every holiday's things go in the catalog and the shop (the shop and closet only show them during their holiday, or once you own them)
for (const h of HOLIDAYS) for (const it of h.items || []) {
  const list = G.CAT[it.slot]; if (!list.some(x => x[0] === it.id)) list.push([it.id, it.e, it.n, it.c]);
  const k = 'look:' + it.id; if (!G.SHOP.some(s => s.k === k)) G.SHOP.push({ k, tab: 'season', hol: h.id, e: it.e, n: it.n, p: it.p, d: it.d });
}
// holiday rounds for the model contest at the Star Model Agency (during the holiday it is always round 1)
for (const h of HOLIDAYS) if (h.contest && G.CT_THEMES && !G.CT_THEMES.some(t => t.id === h.contest.id)) G.CT_THEMES.push(Object.assign({ hol: h.id }, h.contest));
// the doll was built before the costumes were ready: build it again if you were wearing one
const usesCostume = L => !!L && (['dress', 'top', 'hat'].some(s => L[s] && COSTUMES[L[s].id]) || Object.keys(L.extras || {}).some(id => COSTUMES[id]));
if (usesCostume(SAVE.look)) G.av().dress(SAVE.look);

/* ================= DAY AND NIGHT ================= */
const { sun, hemi, skyMat, sky, renderer } = G;
const CYCLE = (+q.get('daylen') || 12 * 60); // seconds for one whole day when it changes by itself
let mode = q.get('time') === 'night' ? 'night' : q.get('time') === 'day' ? 'day' : (SAVE.dayMode || 'auto');
let cycleT = .04; // where we are in the day (0 = morning)
let nightK = mode === 'night' ? 1 : 0; // 0 = full day, 1 = full night
let nightNo = 0, wasNight = nightK > .5;
// how dark it should be right now
function nightTarget() {
  if (mode === 'day') return 0;
  if (mode === 'night') return 1;
  if (mode === 'clock') { const d = new Date(), h = d.getHours() + d.getMinutes() / 60; return h < 12 ? 1 - smooth(6, 7.2, h) : smooth(18.3, 19.6, h); }
  // by itself: 7 minutes of day, 1 of sunset, 3 of night, 1 of sunrise
  const u = cycleT % 1; return u < 7 / 12 ? 0 : u < 8 / 12 ? smooth(7 / 12, 8 / 12, u) : u < 11 / 12 ? 1 : 1 - smooth(11 / 12, 1, u);
}
const C = c => new THREE.Color(c);
const SKY = {
  day: { top: C('#3f8fe8'), mid: C('#9fd2ff'), bot: C('#ffe3ef') },
  dusk: { top: C('#3d3f96'), mid: C('#ff9fb6'), bot: C('#ffb27a') },
  night: { top: C('#060a22'), mid: C('#16204a'), bot: C('#2e2650') },
};
const L0 = { sun: sun.intensity, sunC: sun.color.clone(), hemi: hemi.intensity, hemiC: hemi.color.clone(), hemiG: hemi.groundColor.clone(), exp: renderer.toneMappingExposure };
const moonC = C('#a9bcff'), duskSunC = C('#ffb07a');
const tmpC = new THREE.Color();
// night reflections (shiny things reflect a dark sky, not a bright one)
const dayEnv = scene.environment;
const nightEnv = (() => {
  const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: '#1c2550', side: THREE.BackSide })));
  const gnd = new THREE.Mesh(new THREE.CircleGeometry(48, 32), new THREE.MeshBasicMaterial({ color: '#2a2433' })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -2; env.add(gnd);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3.4) })); moon.position.set(-25, 30, -30); env.add(moon);
  const t = pm.fromScene(env, .02).texture; pm.dispose(); return t;
})();
// stars and the moon ride along with the sky
const stars = (() => {
  const n = 900, p = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const u = Math.random(), a = Math.random() * Math.PI * 2, y = .08 + u * .92, r = Math.sqrt(1 - y * y);
    p[i * 3] = Math.cos(a) * r * 450; p[i * 3 + 1] = y * 450; p[i * 3 + 2] = Math.sin(a) * r * 450;
    const c = C(rnd(['#ffffff', '#ffffff', '#fff1c4', '#cfe0ff', '#ffd6ea'])); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, map: softDot(), vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const s = new THREE.Points(g, m); s.renderOrder = -1; s.frustumCulled = false; sky.add(s); return s;
})();
const moonDir = new THREE.Vector3(-.55, .42, -.72).normalize();
const moon = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff6d8', fog: false, transparent: true, opacity: 0 }));
moon.position.copy(moonDir).multiplyScalar(420); moon.renderOrder = -1; sky.add(moon);
const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot(), color: '#cfd8ff', transparent: true, opacity: 0, depthWrite: false, fog: false }));
moonGlow.scale.setScalar(110); moonGlow.position.copy(moon.position); moonGlow.renderOrder = -1; sky.add(moonGlow);
// street lights: a soft glow around each bulb and a warm puddle of light on the ground
scene.updateMatrixWorld(true);
const lampBase = G.lampMat.color.clone();
const halo = new THREE.SpriteMaterial({ map: softDot(), color: '#ffd9a0', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const poolMat = new THREE.MeshBasicMaterial({ map: softDot(), color: '#ffcf87', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
const LAMP_SPOTS = [];
for (const b of G.LAMPS) {
  const s = new THREE.Sprite(halo); s.scale.setScalar(2.2); b.add(s);
  const w = b.getWorldPosition(new THREE.Vector3());
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.set(w.x, .035, w.z); pool.renderOrder = 1; scene.add(pool);
  LAMP_SPOTS.push(w);
}
// a soft light that follows you so you can still see your outfit at night
const lantern = new THREE.PointLight('#ffd9a8', 0, 9, 1.6); scene.add(lantern);
// and a soft light in front of your face (on the camera's side), so the lights above
// don't leave the chin in dark shadow (it looked like a beard at night)
const faceLight = new THREE.PointLight('#ffe8d6', 0, 2.4, 1.5); scene.add(faceLight);
const toCam = new THREE.Vector3(), headAt = new THREE.Vector3();
const cloudBase = C('#ffffff'), cloudNight = C('#3a4170');

function applySky(n) {
  const dusk = Math.max(0, 1 - Math.abs(n - .45) / .45) * (mode === 'night' || mode === 'day' ? .4 : 1);
  for (const k of ['top', 'mid', 'bot']) { tmpC.copy(SKY.day[k]).lerp(SKY.night[k], n).lerp(SKY.dusk[k], dusk * .75); skyMat.uniforms[k].value.copy(tmpC); }
  if (scene.fog) scene.fog.color.copy(skyMat.uniforms.bot.value);
  sun.intensity = lerp(L0.sun, .5, n); sun.color.copy(L0.sunC).lerp(moonC, n).lerp(duskSunC, dusk * .6);
  hemi.intensity = lerp(L0.hemi, .45, n); hemi.color.copy(L0.hemiC).lerp(C('#5866a8'), n); hemi.groundColor.copy(L0.hemiG).lerp(C('#2a2438'), n);
  renderer.toneMappingExposure = lerp(L0.exp, .95, n);
  const env = n > .5 ? nightEnv : dayEnv; if (scene.environment !== env) scene.environment = env;
  stars.material.opacity = smooth(.35, .9, n); moon.material.opacity = smooth(.3, .8, n); moonGlow.material.opacity = smooth(.3, .8, n) * .35;
  G.lampMat.color.copy(lampBase).multiplyScalar(lerp(1, 2.2, n));
  halo.opacity = smooth(.2, .8, n) * .9; poolMat.opacity = smooth(.2, .8, n) * .45;
  lantern.intensity = smooth(.2, .8, n) * 3.5;
  faceLight.intensity = smooth(.1, .7, n) * 1.6;
  for (const m of G.CLOUD_MATS) { m.color.copy(cloudBase).lerp(cloudNight, n); m.emissiveIntensity = lerp(.25, .03, n); }
  for (const f of nightHooks) f(n);
}
const nightHooks = [];

/* ================= DECORATIONS ================= */
const deco = new THREE.Group(); scene.add(deco);
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .7, ...o });
const add = (geo, mat, x, y, z, parent = deco) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
// a spot next to each street light, a little to the side of the post
const spotNear = (w, side = 1, out = .8) => { const a = Math.atan2(w.x, w.z); return new THREE.Vector3(w.x + Math.cos(a) * out * side, 0, w.z - Math.sin(a) * out * side); };
const ground = (x, z) => G.groundAt(x, z);
const KIT = {
  jackOLanterns() {
    // the sphere's texture wraps all the way around: the face sits at u = .25, which is the pumpkin's front (+z)
    const faceTex = tex('jackface', 512, 256, (x) => { x.fillStyle = '#000'; x.fillRect(0, 0, 512, 256); x.fillStyle = '#ffb030'; const cx = 128;
      for (const s of [-1, 1]) { x.beginPath(); x.moveTo(cx + s * 16, 92); x.lineTo(cx + s * 40, 124); x.lineTo(cx + s * 4, 124); x.fill(); }
      x.beginPath(); x.moveTo(cx, 128); x.lineTo(cx + 8, 142); x.lineTo(cx - 8, 142); x.fill();
      x.beginPath(); x.moveTo(cx - 42, 150); for (let i = 0; i <= 8; i++) x.lineTo(cx - 42 + i * 10.5, 150 + (i % 2 ? 9 : 0)); x.lineTo(cx + 42, 160); x.quadraticCurveTo(cx, 196, cx - 42, 160); x.fill(); });
    const pm = new THREE.MeshPhysicalMaterial({ color: '#ff8a1f', roughness: .45, clearcoat: .4, emissive: '#ff9a20', emissiveMap: faceTex, emissiveIntensity: .4 });
    const stem = std('#5b7a2a'), geo = pumpkinGeo(.38, 10, .1);
    const putOne = (x, z, r, s = 1) => { const g = new THREE.Group(); g.position.set(x, ground(x, z), z); g.rotation.y = r; deco.add(g);
      const b = add(geo, pm, 0, .3 * s, 0, g); b.scale.set(s, s * .8, s); add(cyl(.04, .06, .18, 8), stem, 0, .58 * s, 0, g).rotation.z = .2; G.obs.push({ x, z, r: .4 * s }); };
    LAMP_SPOTS.forEach((w, i) => { const p = spotNear(w, i % 2 ? 1 : -1, .75); putOne(p.x, p.z, Math.atan2(-p.x, -p.z) + (i % 2 ? -.6 : .6), .9 + (i % 3) * .15); });
    for (let i = 0; i < 6; i++) { const a = (i + .5) / 6 * Math.PI * 2; putOne(Math.sin(a) * 8.6, Math.cos(a) * 8.6, a + Math.PI, 1.1); }
    nightHooks.push(n => { pm.emissiveIntensity = lerp(.4, 3.2, n); });
  },
  bats() {
    const bm = new THREE.MeshBasicMaterial({ color: '#1a1424', side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const s0 = new THREE.Shape(); s0.moveTo(0, 0); s0.quadraticCurveTo(.4, .5, 1, .25); s0.quadraticCurveTo(.8, .05, .7, -.1); s0.quadraticCurveTo(.5, .05, .35, -.12); s0.quadraticCurveTo(.2, 0, 0, -.1);
    const wgeo = new THREE.ShapeGeometry(s0, 8), bats = [];
    for (let i = 0; i < 12; i++) { const g = new THREE.Group(); deco.add(g); add(new THREE.SphereGeometry(.16, 10, 8), bm, 0, 0, 0, g).scale.set(1, .8, 1.3);
      const w = []; for (const s of [-1, 1]) { const wg = new THREE.Group(); g.add(wg); const m = add(wgeo, bm, 0, 0, 0, wg); m.scale.set(s * .7, .7, .7); m.rotation.x = -Math.PI / 2; w.push({ wg, s }); }
      bats.push({ g, w, r: 10 + Math.random() * 26, a: Math.random() * 7, h: 7 + Math.random() * 9, sp: (.25 + Math.random() * .3) * (Math.random() < .5 ? -1 : 1), ph: Math.random() * 6 }); }
    nightHooks.push(n => { bm.opacity = smooth(.4, .9, n); deco.userData.bats = n > .4; });
    G.onTick.push(dt => { if (!deco.userData.bats) { bats.forEach(b => b.g.visible = false); return; } const t = performance.now() / 1000;
      for (const b of bats) { b.g.visible = true; b.a += b.sp * dt; b.g.position.set(Math.sin(b.a) * b.r, b.h + Math.sin(t * 1.3 + b.ph) * .8, Math.cos(b.a) * b.r); b.g.rotation.y = b.a + (b.sp > 0 ? Math.PI / 2 : -Math.PI / 2);
        for (const w of b.w) w.wg.rotation.z = w.s * Math.sin(t * 14 + b.ph) * .7; } });
  },
  hayBales() {
    const hay = std('#e3bf5f', { roughness: 1 }), band = std('#9a6a43'), gourd = ['#ff8a1f', '#f0d34a', '#e8e0c8', '#6a8f2a'];
    LAMP_SPOTS.forEach((w, i) => { if (i % 2) return; const p = spotNear(w, i % 4 ? 1 : -1, .9), g = new THREE.Group(); g.position.set(p.x, ground(p.x, p.z), p.z); g.rotation.y = Math.atan2(p.x, p.z); deco.add(g);
      add(box(1.1, .5, .6), hay, 0, .25, 0, g); for (const s of [-1, 1]) add(box(.04, .52, .62), band, s * .3, .25, 0, g);
      for (let j = 0; j < 3; j++) { const m = add(pumpkinGeo(.14 + j * .03, 8, .1), std(gourd[(i + j) % 4], { roughness: .5 }), (j - 1) * .32, .62 + j * .01, 0, g); m.scale.y = .8; }
      G.obs.push({ x: p.x, z: p.z, r: .6 }); });
  },
  xmasTrees() {
    const green = std('#1f6f3a', { roughness: .8 }), trunk = std('#6b4a2b'), cols = ['#ff3b6b', '#ffd23f', '#4fb6ff', '#ffffff', '#7ee081'];
    const bulbMats = cols.map(c => new THREE.MeshBasicMaterial({ color: C(c).multiplyScalar(1.6), toneMapped: false }));
    const starM = new THREE.MeshStandardMaterial({ color: '#ffd23f', metalness: .9, roughness: .2, emissive: '#ffaa00', emissiveIntensity: 1 });
    LAMP_SPOTS.forEach((w, i) => { if (i % 2) return; const p = spotNear(w, i % 4 ? 1 : -1, 1.1), g = new THREE.Group(); g.position.set(p.x, ground(p.x, p.z), p.z); deco.add(g);
      add(cyl(.1, .12, .4, 8), trunk, 0, .2, 0, g);
      for (let j = 0; j < 3; j++) add(new THREE.ConeGeometry(.75 - j * .2, .8, 16), green, 0, .7 + j * .45, 0, g);
      for (let j = 0; j < 14; j++) { const y = .45 + Math.random() * 1.3, r = (.78 - (y - .3) * .35) * .95, a = Math.random() * Math.PI * 2;
        const b = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), bulbMats[j % 5]); b.position.set(Math.sin(a) * r, y, Math.cos(a) * r); g.add(b); }
      const st = add(G.starGeo, starM, 0, 2.05, 0, g); st.scale.setScalar(.7); G.obs.push({ x: p.x, z: p.z, r: .7 }); });
    nightHooks.push(n => { bulbMats.forEach((m, i) => m.color.copy(C(cols[i])).multiplyScalar(lerp(1.6, 3, n))); });
  },
  balloons(cols) {
    LAMP_SPOTS.forEach((w, i) => { const g = new THREE.Group(); g.position.set(w.x, w.y - .1, w.z); deco.add(g); const bs = [];
      for (let j = 0; j < 3; j++) { const c = cols[(i + j) % cols.length], a = (j - 1) * .5; const b = add(sph(.28, 16, 12), new THREE.MeshPhysicalMaterial({ color: c, roughness: .2, clearcoat: 1 }), Math.sin(a) * .45, .9 + j % 2 * .2, Math.cos(a) * .1, g); b.scale.y = 1.15; bs.push(b);
        const str = add(cyl(.006, .006, .9, 4), std('#ffffff'), Math.sin(a) * .22, .4, 0, g); str.rotation.z = -a * .45; }
      G.onTick.push(() => { const t = performance.now() / 1000; bs.forEach((b, j) => { b.position.y = .9 + j % 2 * .2 + Math.sin(t * 1.5 + i + j) * .06; }); }); });
  },
  heartBalloons() {
    LAMP_SPOTS.forEach((w, i) => { const c = ['#ff3b6b', '#ff8fc8', '#e0115f'][i % 3]; const h = add(getHeartGeo(), new THREE.MeshPhysicalMaterial({ color: c, roughness: .2, clearcoat: 1 }), w.x, w.y + 1, w.z); h.scale.setScalar(.3);
      add(cyl(.006, .006, .9, 4), std('#ffffff'), w.x, w.y + .45, w.z);
      G.onTick.push(() => { const t = performance.now() / 1000; h.position.y = w.y + 1 + Math.sin(t * 1.5 + i) * .08; h.rotation.y = Math.sin(t * .8 + i) * .5; }); });
  },
  potsOfGold() {
    const pot = std('#1a1a1a', { roughness: .4, metalness: .5 }), gold = new THREE.MeshStandardMaterial({ color: '#ffd23f', metalness: 1, roughness: .2, emissive: '#ffaa00', emissiveIntensity: .3 });
    LAMP_SPOTS.forEach((w, i) => { if (i % 2) return; const p = spotNear(w, i % 4 ? 1 : -1, .9), g = new THREE.Group(); g.position.set(p.x, ground(p.x, p.z), p.z); deco.add(g);
      const b = add(sph(.35, 16, 12), pot, 0, .32, 0, g); b.scale.y = .85; add(new THREE.TorusGeometry(.3, .04, 8, 24), pot, 0, .56, 0, g).rotation.x = Math.PI / 2;
      for (let j = 0; j < 9; j++) add(cyl(.07, .07, .025, 12), gold, (Math.random() - .5) * .35, .58 + Math.random() * .08, (Math.random() - .5) * .35, g).rotation.set(Math.random(), 0, Math.random());
      G.obs.push({ x: p.x, z: p.z, r: .4 }); });
  },
  // things falling from the sky around you (snow, leaves, hearts)
  falling(cols, { size = .2, speed = 1, sway = .5, count = 450, emoji } = {}) {
    const n = count, p = new Float32Array(n * 3), col = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - .5) * 50; p[i * 3 + 1] = Math.random() * 18; p[i * 3 + 2] = (Math.random() - .5) * 50;
      const c = C(rnd(cols)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; v.push({ s: speed * (.6 + Math.random() * .8), ph: Math.random() * 7 }); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size, map: emoji ? emojiTex(emoji) : softDot(), vertexColors: !emoji, transparent: true, depthWrite: false });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; deco.add(pts);
    G.onTick.push(dt => { const P = G.player.pos, t = performance.now() / 1000;
      for (let i = 0; i < n; i++) { let x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2]; y -= v[i].s * dt; x += Math.sin(t * .9 + v[i].ph) * sway * dt;
        if (y < 0) { y = 16 + Math.random() * 4; x = P.x + (Math.random() - .5) * 50; z = P.z + (Math.random() - .5) * 50; }
        if (x - P.x > 25) x -= 50; else if (x - P.x < -25) x += 50; if (z - P.z > 25) z -= 50; else if (z - P.z < -25) z += 50;
        p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z; }
      g.attributes.position.needsUpdate = true; });
  },
  // fireworks pop over town at night
  fireworks(cols) {
    let next = 2;
    G.onTick.push(dt => { if (nightK < .6 || !G.started()) return; next -= dt; if (next > 0) return; next = .7 + Math.random() * 1.6;
      const a = Math.random() * Math.PI * 2, d = 12 + Math.random() * 22, pos = new THREE.Vector3(Math.sin(a) * d, 16 + Math.random() * 8, Math.cos(a) * d);
      G.burst(pos, rnd(cols), 90, 7, .9); if (pos.distanceTo(G.player.pos) < 35) G.tone(140 + Math.random() * 60, .35, 'sine', .05, 0, 50); });
  },
  // hidden eggs to find (they come back every day)
  eggHunt(n) {
    const today = new Date().toDateString(); if (SAVE.eggDay !== today) { SAVE.eggDay = today; SAVE.eggs = []; persist(); }
    const cols = ['#ffb3d1', '#8fd8ff', '#ffe066', '#b8f0a8', '#c6a6ff', '#ffb27a'], eggs = []; let seed = 77;
    const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0, tries = 0; eggs.length < n && tries < 500; tries++) { const a = r() * Math.PI * 2, d = 8 + r() * 34, x = Math.sin(a) * d, z = Math.cos(a) * d;
      if (G.obs.some(o => Math.hypot(o.x - x, o.z - z) < o.r + .8) || eggs.some(e => Math.hypot(e.x - x, e.z - z) < 5)) continue;
      const m = add(sph(.22, 16, 12), new THREE.MeshPhysicalMaterial({ color: cols[eggs.length % 6], roughness: .25, clearcoat: 1 }), x, ground(x, z) + .28, z); m.scale.y = 1.3;
      const id = eggs.length; m.visible = !(SAVE.eggs || []).includes(id); eggs.push({ x, z, m, id }); i++; }
    G.onTick.push(() => { if (!G.started()) return; const P = G.player.pos, t = performance.now() / 1000;
      for (const e of eggs) { if (!e.m.visible) continue; e.m.rotation.y = t + e.id; if (Math.hypot(P.x - e.x, P.z - e.z) < .8) { e.m.visible = false; SAVE.eggs = (SAVE.eggs || []).concat(e.id); persist();
        G.sfx('star'); G.burst(e.m.position.clone(), '#ffd6ea', 30); G.earn(3, 'Egg!'); const got = SAVE.eggs.length;
        if (got >= eggs.length) { G.banner('🐣 You found every egg!'); setTimeout(() => G.earn(20, 'Every egg!'), 1200); } else G.toast(`🥚 ${got} of ${eggs.length} eggs!`); } } });
  },
};
if (HOL && HOL.decor) HOL.decor(KIT);

/* ================= TOWNSPEOPLE ================= */
// holiday outfits (Halloween costumes only come out after dark)
let npcOn = null;
function dressTown(on) {
  if (npcOn === on) return; npcOn = on;
  G.FRIENDS.forEach((f, i) => {
    f.baseLook = f.baseLook || JSON.parse(JSON.stringify(f.lookD));
    let L = f.baseLook;
    if (on) { L = JSON.parse(JSON.stringify(f.baseLook)); const c = HOL.npc.looks[i % HOL.npc.looks.length];
      for (const k in c) L[k] = c[k] && typeof c[k] === 'object' ? JSON.parse(JSON.stringify(c[k])) : c[k];
      if (L.dress) { L.top = null; L.bottom = null; } else if (!L.top) { L.top = { id: 'tee', c: '#ff6fae' }; L.bottom = L.bottom || { id: 'jeans', c: '#3a5bd9' }; } }
    f.lookD = L; f.dress(L);
  });
}

// talk buttons: trick-or-treat and friends
const visited = {};
const headPos = f => f.g.position.clone().add(new THREE.Vector3(0, 1.9, 0));
const CANDY = ['🍬', '🍭', '🍫', '🍩', '🧁', '🍪'];
function costumeName(L) {
  const names = [];
  const find = (list, id) => (list.find(x => x[0] === id) || [])[2];
  if (L.dress && (COSTUMES[L.dress.id] || COSTUME_ITEMS.includes(L.dress.id))) names.push(find(G.DRESSES, L.dress.id));
  if (L.hat && (COSTUMES[L.hat.id] || COSTUME_ITEMS.includes(L.hat.id))) names.push(find(G.HATS, L.hat.id));
  for (const id in L.extras || {}) if (COSTUMES[id] || COSTUME_ITEMS.includes(id)) names.push(find(G.EXTRAS, id));
  return names.filter(Boolean);
}
const T = {
  // something nice that only gives hearts and coins once a day per person
  once(f, line, emoji, coins, heart) {
    const key = HOL.id + new Date().toDateString() + f.name;
    G.tsay(f, line); G.floaties(headPos(f), emoji, 6); f.play('cheer');
    if (visited[key]) return; visited[key] = 1; if (heart) G.addHeart(f); if (coins) G.earn(coins, HOL.n);
  },
  trickOrTreat(f) {
    if (nightK < .5) { G.tsay(f, "It's not dark yet! 🌞\n\nCome back when it's night to trick-or-treat. 🎃🌙"); return; }
    const key = 'tt' + nightNo + f.name;
    if (visited[key]) { G.tsay(f, 'You already got treats from me tonight! 😋 Go trick-or-treat with someone else!'); return; }
    visited[key] = 1; const dressed = costumeName(G.SAVE.look), candy = rnd(CANDY), n = dressed.length ? 2 : 1;
    SAVE.candy = (SAVE.candy || 0) + n; persist(); f.play('cheer'); G.floaties(headPos(f), candy, 8); G.sfx('star');
    G.tsay(f, dressed.length ? `Trick or treat! 😱 Whoa, a ${dressed[0].toLowerCase()}! So spooky! Here's a double treat: ${candy}${candy}\n\nYou have ${SAVE.candy} treats! 🎃`
      : `Happy Halloween! Here's a treat: ${candy}\n\n💡 Wear a costume for double treats! (You have ${SAVE.candy} treat${SAVE.candy === 1 ? "" : "s"}.)`);
    G.earn(dressed.length ? 8 : 4, 'Trick or treat!');
    if (!visited['h' + f.name]) { visited['h' + f.name] = 1; G.addHeart(f); }
    const all = G.FRIENDS.every(o => visited['tt' + nightNo + o.name]);
    if (all) setTimeout(() => { G.banner('🎃 You trick-or-treated the whole town!'); G.earn(25, 'Every house!'); }, 1500);
  },
};
if (HOL && HOL.talk) G.TALK_EXTRA.push({ id: 'holiday', btn: () => [HOL.talk.e, HOL.talk.label], act: f => HOL.talk.act(f, T) });

/* ================= SETTINGS ================= */
{
  const css = document.createElement('style');
  css.textContent = `#dayModes{margin:6px 0 4px;justify-content:center}#dayModes button{font-size:15px}#settings .daylbl{margin:14px 0 4px;font-weight:700;text-align:center}`;
  document.head.appendChild(css);
  const card = document.querySelector('#settings .card'), close = document.querySelector('#setClose');
  if (card && close) {
    const lbl = document.createElement('div'); lbl.className = 'daylbl'; lbl.textContent = '🌗 Day and night';
    const row = document.createElement('div'); row.className = 'chips'; row.id = 'dayModes';
    const MODES = [['auto', '🔄 Changes by itself'], ['clock', '🕰️ Match my clock'], ['day', '☀️ Always day'], ['night', '🌙 Always night']];
    const render = () => { row.innerHTML = MODES.map(([v, n]) => `<button class="${mode === v ? 'on' : ''}" data-mode="${v}">${n}</button>`).join(''); };
    row.onclick = e => { const b = e.target.closest('[data-mode]'); if (!b) return; mode = b.dataset.mode; SAVE.dayMode = mode; persist(); G.sfx('pop'); render(); };
    render(); card.insertBefore(lbl, close); card.insertBefore(row, close);
  }
}

/* ================= EVERY FRAME ================= */
let greeted = false;
applySky(nightK); wasNight = nightK > .5;
if (HOL && HOL.npc) dressTown(HOL.npc.when === 'always' || wasNight);
G.onTick.push(dt => {
  if (mode === 'auto' && G.started()) cycleT += dt / CYCLE;
  const want = nightTarget(); nightK += (want - nightK) * Math.min(1, dt * .8); if (Math.abs(want - nightK) < .001) nightK = want;
  applySky(nightK);
  const P = G.player.pos; lantern.position.set(P.x, P.y + 2.6, P.z + .4);
  const av = G.av && G.av();
  if (faceLight.intensity > 0 && av && av.head) { // between the face and the camera, a little below the eyes
    av.head.getWorldPosition(headAt);
    toCam.set(G.camera.position.x - headAt.x, 0, G.camera.position.z - headAt.z); if (toCam.lengthSq() < 1e-4) toCam.set(0, 0, 1);
    toCam.normalize().multiplyScalar(.8); faceLight.position.set(headAt.x + toCam.x, headAt.y - .1, headAt.z + toCam.z); }
  const isNight = nightK > .5;
  if (isNight !== wasNight) { wasNight = isNight; if (isNight) nightNo++;
    if (G.started() && !G.closetOpen()) { G.banner(isNight ? '🌙 Night time!' : '☀️ Good morning!');
      if (isNight && HOL && HOL.id === 'halloween') setTimeout(() => G.toast("🎃 It's dark! Put on a costume and trick-or-treat with the townspeople!"), 2500);
      else if (isNight && HOL && HOL.decor && /fireworks/.test(HOL.decor.toString())) setTimeout(() => G.toast('🎆 Look up! Fireworks!'), 2500); }
    if (HOL && HOL.npc && HOL.npc.when === 'night') dressTown(isNight); }
  if (!greeted && G.started()) { greeted = true; if (HOL) setTimeout(() => { G.banner(`${HOL.e} Happy ${HOL.n.replace(/^the /, '')}!`); setTimeout(() => G.toast(`${HOL.hello} New ${HOL.n.replace(/^the /, '')} things are in the 🪙 shop.`), 2600); }, 6000); }
});
}
