// 🎄 Christmas in town. It is on while seasons.js says it's Christmas (see THE SEASON SWITCH at the top of seasons.js),
// and does nothing the rest of the year. For testing: ?holiday=christmas in the address.
//
//  - Snow on the ground all over the island (the falling snow is the Christmas decor in seasons.js).
//  - A really big Christmas tree in the middle of town, standing in the Sparkle Studio. The 👗 dress-up pad moves to the
//    front of it (Z.studio.pad) while the tree is up.
//  - Lights: strings of bulbs wrapped round every street light and hung between them, and lights along the roof edges of
//    the buildings. They twinkle, and glow at night.
//  - 🎅 Santa walks round the plaza and out along the paths. Walk up to him to say hi; once a day he has a present for you.
//  - ❄️ Snowball: an action button that throws a snowball (it aims at whoever is in front of you). Townspeople throw back,
//    and you can ask anyone for a ❄️ Snowball fight (first to 5 hits) when you talk to them.
//  - ⛄ Snowman: roll a ball of snow by walking (it grows as it rolls), put it down, roll two more and stack them. It gets
//    a face, arms and a scarf, and stays where you built it (SAVE.xmas.snowmen, the last 6).
//  - The 🎄 Christmas tab of ⭐ Star Challenges (hol: 'christmas' in challenges.js) counts these with did():
//    did('snowball', 'throw' | 'hit' | 'santa' | 'splat'), did('snowfight', 0 = you won | 1), did('snowman', place id),
//    did('santa'), did('santagift').
// Everything is made from simple shapes and kept to a few draw calls (instanced bulbs), so phones stay smooth.
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const G = window.__game, S = window.__season;
if (G && S && S.on('christmas')) start();

function start() {
const { THREE, scene, SAVE, player, Z } = G;
const persist = G.persist;
const did = (k, a) => { try { dispatchEvent(new CustomEvent('brynny:did', { detail: { k, a } })); } catch (e) {} };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, k) => a + (b - a) * k;
const night = () => (S.night ? S.night() : 0);
const X = SAVE.xmas || (SAVE.xmas = { snowmen: [], gift: null });
X.snowmen = X.snowmen || [];
const todayKey = () => new Date().toDateString();
const zoneId = () => (G.zone() || {}).id;
const ticks = [];
G.onTick.push(dt => { for (const f of ticks) f(dt); });
// a little seeded random, so the tree and the lights look the same every time
let seed = 1225; const sr = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  t.anisotropy = 4; return t;
}
const softDot = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });

/* ================= SNOW ON THE GROUND ================= */
const snowTex = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#eef2f7'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { const r = 6 + Math.random() * 26, x0 = Math.random() * w, y0 = Math.random() * h, c = Math.random() < .5 ? '206,218,234' : '255,255,255';
    const g = x.createRadialGradient(x0, y0, 0, x0, y0, r); g.addColorStop(0, `rgba(${c},.35)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(x0 - r, y0 - r, r * 2, r * 2); }
  for (let i = 0; i < 900; i++) { x.fillStyle = Math.random() < .7 ? 'rgba(255,255,255,.9)' : 'rgba(190,205,225,.5)'; x.fillRect(Math.random() * w, Math.random() * h, 1, 1); }
}, [34, 34]);
const snowGround = new THREE.MeshStandardMaterial({ color: '#ffffff', map: snowTex, roughness: .92, metalness: 0 });
// the big grass circle the island is made of (02-island.js) gets a coat of snow
scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'CircleGeometry' && o.geometry.parameters.radius >= 60 && o.parent === scene) o.material = snowGround; });
// Halloween Hollow's purple ground (its pumpkins and ghosts are put away by seasons.js)
if (Z.halloween && Z.halloween.ground) { const m = snowGround.clone(); m.map = snowTex; m.color.set('#f4f7fb'); m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; Z.halloween.ground.material = m; }
// snow on the treetops and bushes in the park: the leaves get a frosty, pale tint
{ const seen = new Set(); scene.traverse(o => { if (!o.isMesh || o.geometry.type !== 'IcosahedronGeometry' || seen.has(o.material)) return; seen.add(o.material);
  if (o.material.color) o.material.color.lerp(new THREE.Color('#e8eef2'), .45); if (o.material.sheenColor) o.material.sheenColor.set('#ffffff'); }); }

/* ================= LIGHTS ================= */
// One InstancedMesh per batch of bulbs. Half the bulbs fade while the other half brighten, so they twinkle slowly.
const allBulbs = [];
function makeBulbs(points, colorOf, size, parent = scene) {
  const geo = new THREE.SphereGeometry(size, 8, 6), halves = [[], []];
  points.forEach((p, i) => halves[(i * 7 + (i >> 3)) % 2].push([p, i]));
  const out = [];
  for (const half of halves) { if (!half.length) continue;
    const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
    const im = new THREE.InstancedMesh(geo, mat, half.length), m4 = new THREE.Matrix4(), c = new THREE.Color();
    const gp = new Float32Array(half.length * 3), gc = new Float32Array(half.length * 3);
    half.forEach(([p, i], k) => { m4.makeTranslation(p.x, p.y, p.z); im.setMatrixAt(k, m4); c.set(colorOf(i)); im.setColorAt(k, c); p.toArray(gp, k * 3); c.toArray(gc, k * 3); });
    im.frustumCulled = false; parent.add(im);
    // the soft glow round each bulb (only shows after dark)
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('color', new THREE.BufferAttribute(gc, 3));
    const glow = new THREE.Points(gg, new THREE.PointsMaterial({ size: size * 9, map: softDot, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.frustumCulled = false; parent.add(glow);
    const b = { im, glow, ph: out.length * Math.PI }; out.push(b); allBulbs.push(b); }
  return out;
}
ticks.push(() => { const t = performance.now() / 1000, n = night();
  for (const b of allBulbs) { const tw = .5 + .5 * Math.sin(t * 1.3 + b.ph); b.im.material.color.setScalar(lerp(.95, 1.6, n) * (.72 + .28 * tw)); b.glow.material.opacity = n * (.45 + .4 * tw); } });
const LIGHT_COLS = ['#ff3b3b', '#2fd06b', '#4f8bff', '#ffb02e', '#ffd7a0', '#ff5fa8'];

/* ================= THE BIG CHRISTMAS TREE ================= */
// It stands right in the middle of town, inside the Sparkle Studio's ring of columns, and rises far above them.
const TREE = { x: 0, z: 0, base: 2.3, top: 22.5, r: 3.55, obsR: 1.9 };
const treeR = y => TREE.r * Math.pow(Math.max(0, 1 - (y - TREE.base) / (TREE.top - TREE.base)), .92) + .08;
// the 👗 dress-up pad moves to the front of the tree (25-game-loop.js reads Z.studio.pad.x / .z)
{ const st = Z.studio; if (st && st.pad) { const a = 30 * Math.PI / 180, r = 3.3; st.pad.x = Math.sin(a) * r; st.pad.z = Math.cos(a) * r;
  for (const p of st.padParts || []) { p.position.x = st.pad.x; p.position.z = st.pad.z; }
  if (st.light) { st.light.color.set('#ffd9a8'); st.light.position.set(st.pad.x, 3.2, st.pad.z); }
  st.music = 'merry-xmas'; } }
const tree = new THREE.Group(); tree.position.set(TREE.x, 0, TREE.z); scene.add(tree);
{
  // needles: lots of little strokes in different greens
  const needles = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#1b4329'; x.fillRect(0, 0, w, h);
    const cs = ['#2a5e38', '#173a24', '#356e43', '#204d30', '#3f7a4a', '#12301d'];
    x.lineCap = 'round'; for (let i = 0; i < 2600; i++) { const px = Math.random() * w, py = Math.random() * h, a = Math.PI / 2 + (Math.random() - .5) * 1.4, l = 5 + Math.random() * 9;
      x.strokeStyle = rnd(cs); x.lineWidth = 1 + Math.random() * 1.4; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  }, [7, 2]);
  const pine = new THREE.MeshStandardMaterial({ color: '#ffffff', map: needles, roughness: .88, side: THREE.DoubleSide, vertexColors: true });
  // the trunk, mostly hidden by the lowest branches
  const bark = new THREE.MeshStandardMaterial({ color: '#4a3324', roughness: .95 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.32, .55, TREE.base + 1.5, 14), bark); trunk.position.y = (TREE.base + 1.5) / 2; trunk.castShadow = true; tree.add(trunk);
  // layers of branches: each is an open cone with a ragged, drooping lower edge (the branch tips), a touch of snow on top
  const tiers = [], N = 17, frost = new THREE.Color('#dfe9ee'), deep = new THREE.Color('#ffffff');
  for (let i = 0; i < N; i++) {
    const t0 = i / N, y0 = TREE.base + (TREE.top - TREE.base) * Math.pow(t0, 1.08) - .15, rb = treeR(y0) * (1.06 + sr() * .06);
    const h = Math.max(1.1, (TREE.top - y0) * .34 + .4), rt = Math.max(.05, treeR(y0 + h) * .55);
    const g = new THREE.CylinderGeometry(rt, rb, h, 40, 4, true), p = g.attributes.position, uv = g.attributes.uv;
    const lobes = 9 + Math.floor(sr() * 5), ph = sr() * 6, cols = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let k = 0; k < p.count; k++) {
      let x = p.getX(k), y = p.getY(k), z = p.getZ(k); const a = Math.atan2(x, z), v = (y + h / 2) / h; // v: 0 at the bottom edge, 1 at the top
      const tip = (1 - v) * (1 - v);
      const jag = 1 + tip * (.16 * Math.sin(a * lobes + ph) + .09 * Math.sin(a * lobes * 2.3 + ph * 2) + (sr() - .5) * .14);
      x *= jag; z *= jag; y -= tip * (.28 + .2 * Math.max(0, Math.sin(a * lobes + ph))) * Math.min(1, rb / 2);
      p.setXYZ(k, x, y, z);
      // darker deep inside and under the tips, a little frosty on the upper side
      c.setRGB(1, 1, 1).multiplyScalar(.7 + .3 * v); if (v > .35 && sr() < .55) c.lerp(frost, .25 + sr() * .35); else c.lerp(deep, 0);
      cols[k * 3] = c.r; cols[k * 3 + 1] = c.g; cols[k * 3 + 2] = c.b;
      uv.setXY(k, uv.getX(k) * Math.max(1, Math.round(rb * 1.4)), uv.getY(k) * h * .5);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.translate(0, y0 + h / 2, 0); g.computeVertexNormals();
    tiers.push({ g, y0, rb, h });
  }
  const boughs = new THREE.Mesh(mergeGeometries(tiers.map(t => t.g)), pine); boughs.castShadow = true; boughs.receiveShadow = true; tree.add(boughs);
  for (const t of tiers) t.g.dispose();
  // a spot on the tree's surface at height y (a little in front of the branch tips)
  const onTree = (y, a, k = 1) => { const r = treeR(y) * k; return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r); };
  // ornaments: shiny glass balls in deep reds, gold, silver and blue
  const ornCols = ['#9e1b24', '#b8122d', '#c9a23a', '#d8c27a', '#c7ccd4', '#1d3e7a', '#7a1424', '#e2b552'];
  const NO = 170, orn = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 14, 10), new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: .55, roughness: .16, clearcoat: 1, clearcoatRoughness: .08 }), NO);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < NO; i++) { const y = TREE.base + .2 + Math.pow(sr(), 1.25) * (TREE.top - TREE.base - 1.6), p = onTree(y, sr() * Math.PI * 2, .93), s = .7 + sr() * .7 * (1 - (y - TREE.base) / 24);
    m4.compose(p, q, sc.setScalar(s)); orn.setMatrixAt(i, m4); orn.setColorAt(i, new THREE.Color(rnd(ornCols))); }
  orn.castShadow = false; tree.add(orn);
  // warm white lights wound round the tree, with a few coloured ones
  const bulbs = [], turns = 11;
  for (let i = 0; i < 620; i++) { const u = i / 620, y = TREE.base + .1 + u * (TREE.top - TREE.base - .8), a = u * turns * Math.PI * 2 + (sr() - .5) * .25; bulbs.push(onTree(y, a, 1.0)); }
  makeBulbs(bulbs, i => i % 7 === 3 ? rnd(['#ff3b3b', '#3fd06b', '#4f8bff', '#ffb02e']) : '#ffd7a0', .055, tree);
  // a gold star on top that catches the light, with a soft glow round it
  const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = i % 2 ? .3 : .75; i ? st.lineTo(Math.sin(a) * r, Math.cos(a) * r) : st.moveTo(0, r); }
  const star = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth: .16, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 2 }),
    new THREE.MeshStandardMaterial({ color: '#f3c94a', metalness: .85, roughness: .22, emissive: '#ffb21c', emissiveIntensity: .8 }));
  star.geometry.center(); star.position.y = TREE.top + .55; tree.add(star);
  const starGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, color: '#ffd27a', transparent: true, opacity: .35, depthWrite: false, blending: THREE.AdditiveBlending }));
  starGlow.scale.setScalar(4); starGlow.position.y = TREE.top + .55; tree.add(starGlow);
  ticks.push(dt => { star.rotation.y += dt * .35; const n = night(); star.material.emissiveIntensity = lerp(.8, 2.6, n); starGlow.material.opacity = lerp(.3, .9, n); starGlow.scale.setScalar(lerp(4, 7, n)); });
  // presents under the tree (wrapped boxes with ribbons)
  const wraps = ['#9e1b24', '#1f5e3a', '#e8e2d4', '#c9a23a', '#2a4a8a', '#b8122d'], ribbon = ['#e8c25a', '#ffffff', '#9e1b24', '#e8c25a', '#e8e2d4', '#e8c25a'];
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + sr() * .3, r = .95 + sr() * .7, w = .35 + sr() * .35, h = .25 + sr() * .35, d = .35 + sr() * .3, k = i % wraps.length;
    const g = new THREE.Group(); g.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); g.rotation.y = sr() * 3; tree.add(g);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: wraps[k], roughness: .55 })); b.position.y = h / 2; b.castShadow = true; g.add(b);
    const rm = new THREE.MeshStandardMaterial({ color: ribbon[k], roughness: .35, metalness: .3 });
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(w + .01, h + .01, .06), rm); r1.position.y = h / 2; g.add(r1);
    const r2 = new THREE.Mesh(new THREE.BoxGeometry(.06, h + .01, d + .01), rm); r2.position.y = h / 2; g.add(r2);
    for (const s of [-1, 1]) { const bow = new THREE.Mesh(new THREE.TorusGeometry(.06, .02, 6, 12), rm); bow.position.set(s * .05, h + .04, 0); bow.rotation.y = Math.PI / 2; bow.rotation.x = s * .5; g.add(bow); } }
  // a skirt of snow round the trunk
  const skirt = new THREE.Mesh(new THREE.CircleGeometry(2.1, 40), snowGround.clone()); skirt.material.polygonOffset = true; skirt.material.polygonOffsetFactor = -3; skirt.rotation.x = -Math.PI / 2; skirt.position.y = .16; tree.add(skirt);
  G.obs.push({ x: TREE.x, z: TREE.z, r: TREE.obsR });
}

// round every street light, and hanging in a dip between the street lights along each path
{ const pts = [], wire = [], byPath = new Map(), w = new THREE.Vector3();
  for (const b of G.LAMPS) { b.getWorldPosition(w); const top = w.y - .25;
    for (let k = 0; k < 26; k++) { const u = k / 26, a = u * Math.PI * 2 * 4.2; pts.push(new THREE.Vector3(w.x + Math.sin(a) * .1, .25 + u * (top - .25), w.z + Math.cos(a) * .1)); }
    const key = b.parent; if (!byPath.has(key)) byPath.set(key, []); byPath.get(key).push({ w: w.clone(), lx: b.position.x, lz: b.position.z }); }
  for (const list of byPath.values()) for (const side of [-1, 1]) {
    const row = list.filter(l => Math.sign(l.lx) === side).sort((a, b) => a.lz - b.lz);
    for (let i = 0; i + 1 < row.length; i++) { const A = row[i].w, B = row[i + 1].w, len = A.distanceTo(B), n = Math.max(6, Math.round(len / .38)), sag = Math.min(1, len * .07);
      let prev = null;
      for (let k = 0; k <= n; k++) { const u = k / n, p = new THREE.Vector3().lerpVectors(A, B, u); p.y = A.y - .3 - Math.sin(u * Math.PI) * sag;
        if (k > 0 && k < n) pts.push(p.clone().add(new THREE.Vector3(0, -.05, 0))); if (prev) wire.push(prev.x, prev.y, prev.z, p.x, p.y, p.z); prev = p; } } }
  makeBulbs(pts, i => LIGHT_COLS[i % LIGHT_COLS.length], .045);
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
  scene.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: '#1d2b22' })));
  // and a wreath with a red bow on each post
  const wreath = new THREE.InstancedMesh(new THREE.TorusGeometry(.17, .065, 8, 18), new THREE.MeshStandardMaterial({ color: '#1f4d2e', roughness: .85 }), G.LAMPS.length);
  const bow = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshStandardMaterial({ color: '#a3121f', roughness: .5 }), G.LAMPS.length * 2);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1), s2 = new THREE.Vector3(1, .7, .6);
  G.LAMPS.forEach((b, i) => { b.getWorldPosition(w); const a = Math.atan2(-w.x, -w.z); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a);
    const off = new THREE.Vector3(Math.sin(a) * .1, 0, Math.cos(a) * .1);
    m4.compose(new THREE.Vector3(w.x + off.x, 1.75, w.z + off.z), q, s1); wreath.setMatrixAt(i, m4);
    for (const sd of [-1, 1]) { const side = new THREE.Vector3(Math.cos(a) * .06 * sd, 0, -Math.sin(a) * .06 * sd);
      m4.compose(new THREE.Vector3(w.x + off.x * 1.9 + side.x, 1.91, w.z + off.z * 1.9 + side.z), q, s2); bow.setMatrixAt(i * 2 + (sd > 0 ? 1 : 0), m4); } });
  scene.add(wreath, bow); }

// 🏠 on the buildings: bulbs along the top edges of every big box-shaped building in each place
{ const pts = [], seenBox = [], tmp = new THREE.Vector3(), corners = [];
  scene.updateMatrixWorld(true);
  const visibleAll = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  for (const z of G.ZONES) z.g.traverse(o => {
    if (!o.isMesh || !o.geometry || !/^(Rounded)?BoxGeometry$/.test(o.geometry.type) || !o.geometry.parameters || !visibleAll(o)) return;
    const prm = o.geometry.parameters, s = o.getWorldScale(tmp), w = prm.width * Math.abs(s.x), h = prm.height * Math.abs(s.y), d = prm.depth * Math.abs(s.z);
    if (h < 1.6 || Math.max(w, d) < 2.2) return;
    const wall = Math.min(w, d) < .9; // a thin wall: one line of bulbs along its top
    if (o.material && (o.material.transparent || o.material.opacity < 1)) return;
    // the 4 corners of the top, in the world
    corners.length = 0;
    if (wall) { const alongX = w >= d; for (const k of [-1, 1]) corners.push(new THREE.Vector3(alongX ? k * prm.width / 2 : 0, prm.height / 2, alongX ? 0 : k * prm.depth / 2).applyMatrix4(o.matrixWorld)); }
    else for (const [cx, cz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) corners.push(new THREE.Vector3(cx * prm.width / 2, prm.height / 2, cz * prm.depth / 2).applyMatrix4(o.matrixWorld));
    const mid = corners.reduce((a, c) => a.add(c), new THREE.Vector3()).multiplyScalar(1 / corners.length);
    if (mid.y < 1.5 || seenBox.some(m => m.distanceTo(mid) < .3)) return; seenBox.push(mid);
    for (let e = 0; e < (wall ? 1 : 4); e++) { const A = corners[e], B = corners[(e + 1) % corners.length], len = A.distanceTo(B), n = Math.max(2, Math.round(len / .32));
      for (let k = 0; k <= (wall ? n : n - 1); k++) { const p = new THREE.Vector3().lerpVectors(A, B, k / n);
        if (!wall) p.add(new THREE.Vector3(p.x - mid.x, 0, p.z - mid.z).normalize().multiplyScalar(.05)); p.y += wall ? .05 : -.06; pts.push(p); } } });
  // keep it light enough for phones
  const keep = pts.length > 5200 ? pts.filter((p, i) => i % Math.ceil(pts.length / 5200) === 0) : pts;
  makeBulbs(keep, i => LIGHT_COLS[i % LIGHT_COLS.length], .05);
  window.__xmasBuildingBulbs = keep.length; }

/* ================= 🎅 SANTA ================= */
const santaLook = (() => {
  const base = JSON.parse(JSON.stringify((G.FRIENDS[0] && G.FRIENDS[0].lookD) || SAVE.look));
  return Object.assign(base, { body: 'guy', style: 'glam', skin: '#f1c8aa', eyes: '#5b7fa6', face: { eyes: 'round', nose: 'button', lips: 'soft' },
    hair: { id: 'flow', c: '#f3f1ec' }, beard: { id: 'fullbeard', c: '#f5f3ee' }, dress: null,
    top: { id: 'puffer', c: '#b3121f' }, bottom: { id: 'sweats', c: '#b3121f' }, shoes: { id: 'workboots', c: '#1b1714' },
    hat: { id: 'santahat', c: '#b3121f' }, extras: {}, makeup: Object.assign({}, base.makeup || {}, { blush: 'none', lips: 'none', shadow: 'none', liner: 'none' }) });
})();
const santa = new G.Avatar(santaLook, 'Santa', '#c8102e');
scene.add(santa.g);
{ // his suit: a round belly, a black belt with a gold buckle, white fur trim, and a sack of presents over his shoulder
  const red = new THREE.MeshPhysicalMaterial({ color: '#a8101d', roughness: .78, sheen: .6, sheenColor: new THREE.Color('#ff7a7a') });
  const fur = new THREE.MeshStandardMaterial({ color: '#f6f3ee', roughness: 1 }), belt = new THREE.MeshStandardMaterial({ color: '#141212', roughness: .35, metalness: .2 });
  const gold = new THREE.MeshStandardMaterial({ color: '#d9b04a', metalness: .9, roughness: .25 });
  const add = (geo, m, parent, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const belly = add(new THREE.SphereGeometry(.19, 24, 18), red, santa.spine, 0, .17, .05); belly.scale.set(1.08, 1, 1.05);
  const bt = add(new THREE.TorusGeometry(.19, .028, 8, 32), belt, santa.spine, 0, .1, .045); bt.rotation.x = Math.PI / 2; bt.scale.set(1.1, 1.08, 1);
  add(new THREE.BoxGeometry(.08, .065, .02), gold, santa.spine, 0, .1, .255);
  add(new THREE.BoxGeometry(.05, .035, .022), belt, santa.spine, 0, .1, .257);
  const hem = add(new THREE.TorusGeometry(.2, .035, 8, 32), fur, santa.spine, 0, -.03, .03); hem.rotation.x = Math.PI / 2; hem.scale.set(1.08, 1.05, 1);
  add(new THREE.BoxGeometry(.06, .3, .03), fur, santa.spine, 0, .28, .2).rotation.x = -.35;
  for (const a of santa.arms) { if (!a.hand) continue; const c = add(new THREE.TorusGeometry(.042, .018, 8, 18), fur, a.hand, 0, .05, 0); c.rotation.x = Math.PI / 2; }
  const sackM = new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: 1 });
  const sack = add(new THREE.SphereGeometry(.26, 18, 14), sackM, santa.spine, .08, .36, -.24); sack.scale.set(1, 1.15, .9);
  add(new THREE.CylinderGeometry(.05, .09, .12, 10), sackM, santa.spine, .05, .62, -.2).rotation.z = .3;
}
// where Santa walks: round the plaza path, and now and then out along a path to a place and back
const PLAZA_R = 7.15, SPOKES = G.ZONES.filter(z => z.d && !z.nopath && !z.p0 && z.d < 40).map(z => Math.atan2(z.x, z.z));
const SANTA = { a: .4, mode: 'ring', dir: 1, d: PLAZA_R, out: 0, spoke: 0, wait: 0, cool: 0, face: 0, said: 0, ho: 6, near: false, sayT: 0 };
const santaPos = new THREE.Vector3();
santa.pos = santaPos;
function santaSay(text) { if (santa.say) { santa.g.remove(santa.say); santa.say.material.map.dispose(); santa.say.material.dispose(); }
  const s = G.sprite(G.labelTex(text, { size: 46, w: 512, h: 110, fg: '#8a0f1a', border: '#ffd6d6' }), 1.5, .32); s.position.y = 2.4; santa.g.add(s); santa.say = s; SANTA.sayT = 3.2; }
const SANTA_HI = ["Ho ho ho! Merry Christmas! 🎄", "Have you been good this year? 😉", "Ho ho ho! Lovely outfit! ✨", "The reindeer are resting at the North Pole 🦌", "Don't forget to build a snowman! ⛄"];
function santaStep(dt) {
  const P = player.pos, dP = Math.hypot(P.x - santaPos.x, P.z - santaPos.z);
  let sp = 0, want = null;
  if (SANTA.sayT > 0) { SANTA.sayT -= dt; if (SANTA.sayT <= 0 && santa.say) { santa.g.remove(santa.say); santa.say = null; } }
  if (dP < 2.4 && G.started() && !G.closetOpen()) { // stop and say hi
    SANTA.face = G.angDamp(SANTA.face, Math.atan2(P.x - santaPos.x, P.z - santaPos.z), dt * 5);
    if (!SANTA.near) { SANTA.near = true; santa.play('wave'); did('santa');
      if (X.gift !== todayKey()) { X.gift = todayKey(); persist(); santaSay(`Ho ho ho! A present for you, ${SAVE.name || 'little one'}! 🎁`);
        setTimeout(() => { G.earn(25, 'Present from Santa'); G.sfx('tada'); G.burst(santaPos.clone().add(new THREE.Vector3(0, 1.4, 0)), '#ffd23f', 50, 3); G.toast('🎁 Santa gave you a present: 25 coins!'); did('santagift'); }, 1200); }
      else santaSay(rnd(SANTA_HI)); }
  } else {
    if (dP > 3.2) SANTA.near = false;
    if (SANTA.wait > 0) SANTA.wait -= dt;
    else if (SANTA.mode === 'ring') {
      const a0 = SANTA.a; SANTA.a += SANTA.dir * dt * 1.15 / PLAZA_R; sp = 1.15;
      want = SANTA.a + SANTA.dir * Math.PI / 2;
      // passing a path: sometimes walk out along it
      const off = (a, s) => Math.atan2(Math.sin(a - s), Math.cos(a - s));
      if (SANTA.cool <= 0) for (const s of SPOKES) { const d0 = off(a0, s), d1 = off(SANTA.a, s);
        if (Math.abs(d1) < .3 && Math.sign(d0) !== Math.sign(d1)) { SANTA.cool = 3; if (Math.random() < .4) { SANTA.mode = 'out'; SANTA.spoke = s; SANTA.a = s; SANTA.goal = 14 + Math.random() * 10; } break; } }
      SANTA.cool -= dt;
      SANTA.d = PLAZA_R;
    } else if (SANTA.mode === 'out' || SANTA.mode === 'back') {
      const s = SANTA.mode === 'out' ? 1 : -1; SANTA.d += s * dt * 1.15; sp = 1.15; want = SANTA.spoke + (s > 0 ? 0 : Math.PI);
      if (SANTA.mode === 'out' && SANTA.d >= SANTA.goal) { SANTA.mode = 'back'; SANTA.wait = 3; santa.play('wave'); if (Math.hypot(P.x - santaPos.x, P.z - santaPos.z) < 14) santaSay('Ho ho ho! 🎅'); }
      if (SANTA.mode === 'back' && SANTA.d <= PLAZA_R) { SANTA.d = PLAZA_R; SANTA.mode = 'ring'; SANTA.cool = 4; if (Math.random() < .3) SANTA.dir *= -1; }
    }
    if (want !== null) SANTA.face = G.angDamp(SANTA.face, want, dt * 4);
  }
  // in the 'out'/'back' modes he walks a little to the right side of the path, so he's not in the middle of it
  const side = SANTA.mode === 'ring' ? 0 : .7 * (SANTA.mode === 'out' ? 1 : -1);
  const a = SANTA.mode === 'ring' ? SANTA.a : SANTA.spoke;
  const x = Math.sin(a) * SANTA.d + Math.cos(a) * side, z = Math.cos(a) * SANTA.d - Math.sin(a) * side;
  santaPos.set(x, santaPos.y + (G.groundAt(x, z) - santaPos.y) * Math.min(1, dt * 12), z);
  santa.g.position.copy(santaPos); santa.g.rotation.y = SANTA.face; santa.update(dt, sp, false);
}
ticks.push(santaStep);
window.__santa = () => ({ x: santaPos.x, z: santaPos.z, mode: SANTA.mode });

/* ================= ❄️ SNOWBALLS ================= */
const snowMat = new THREE.MeshStandardMaterial({ color: '#f7fafd', roughness: .9 });
const ballGeo = new THREE.IcosahedronGeometry(.085, 1);
const balls = [], GRAV = 11;
// who can be hit: townspeople, Santa, and you
const targets = () => G.FRIENDS.map(f => ({ who: f, pos: f.pos, kind: 'friend' })).concat([{ who: santa, pos: santaPos, kind: 'santa' }]);
function handPos(av, pos, face) { const p = new THREE.Vector3(); const h = av.arms && av.arms[1] && av.arms[1].hand; if (h) h.getWorldPosition(p); else p.set(pos.x, pos.y + 1.4, pos.z);
  if (!isFinite(p.x) || p.distanceTo(pos) > 3) p.set(pos.x + Math.sin(face) * .3, pos.y + 1.4, pos.z + Math.cos(face) * .3); return p; }
// throw from p0 so it lands on 'at' (or straight ahead if there's no one there)
function throwBall(p0, at, face, from, miss = 0) {
  const m = new THREE.Mesh(ballGeo, snowMat); m.castShadow = true; m.position.copy(p0); scene.add(m);
  const v = new THREE.Vector3();
  if (at) { const tx = at.x + (Math.random() - .5) * miss, tz = at.z + (Math.random() - .5) * miss, ty = at.y;
    const dx = tx - p0.x, dz = tz - p0.z, d = Math.hypot(dx, dz), sp = Math.min(13, 7 + d * .5), t = d / sp;
    v.set(dx / t, (ty - p0.y + .5 * GRAV * t * t) / t, dz / t); }
  else v.set(Math.sin(face) * 11, 4.2, Math.cos(face) * 11);
  balls.push({ m, v, from, life: 3 }); G.tone(520, .06, 'triangle', .04, 0, 260);
}
function splat(p, big) { G.burst(p.clone(), '#ffffff', big ? 26 : 12, big ? 2.4 : 1.4, .14); G.tone(180, .08, 'sine', .05, 0, 90); }
function hitPlayer() { const P = player.pos; splat(new THREE.Vector3(P.x, P.y + 1.2, P.z), true); did('snowball', 'splat');
  if (FIGHT) { FIGHT.them++; fightHUD(); if (FIGHT.them >= 5) endFight(false); else G.toast(rnd(['❄️ Splat! You got hit!', '😆 Got you!', '⛄ Brrr! Snow down your back!'])); }
  else G.toast(rnd(['❄️ Splat!', '😆 Snowball fight!', '⛄ Brrr! Got you!'])); }
function hitTarget(t, b) {
  splat(b.m.position, true);
  if (t.kind === 'santa') { did('snowball', 'santa'); did('snowball', 'hit'); santa.play('cheer'); santaSay(rnd(['Ho ho ho! Good shot! 🎯', 'Ho ho! You got me! ❄️', 'Ho ho ho! Santa has snowballs too! ⛄']));
    setTimeout(() => { if (Math.random() < .7) throwBall(handPos(santa, santaPos, SANTA.face), new THREE.Vector3(player.pos.x, player.pos.y + 1.2, player.pos.z), SANTA.face, santa, .6); }, 900); return; }
  const f = t.who; did('snowball', 'hit');
  if (FIGHT && FIGHT.f === f) { FIGHT.you++; fightHUD(); f.play(rnd(['hop', 'clap'])); G.friendBubble(f, rnd(['Hey! 😆', 'Lucky shot! ❄️', 'Oof! ⛄'])); if (FIGHT.you >= 5) endFight(true); return; }
  f.play(rnd(['hop', 'clap', 'cheer'])); G.friendBubble(f, rnd(['Hey! 😆', 'Oh, it is ON! ❄️', 'Got me! ⛄', 'Snowball fight! 🤭']));
  if (Math.random() < .6) setTimeout(() => throwBall(handPos(f, f.pos, f.face), new THREE.Vector3(player.pos.x, player.pos.y + 1.2, player.pos.z), f.face, f, .9), 900 + Math.random() * 700);
}
ticks.push(dt => {
  for (let i = balls.length - 1; i >= 0; i--) { const b = balls[i], p = b.m.position; b.life -= dt; b.v.y -= GRAV * dt; p.addScaledVector(b.v, dt);
    let gone = b.life <= 0;
    if (!gone && b.from !== 'player') { const P = player.pos; if (Math.hypot(p.x - P.x, p.z - P.z) < .45 && p.y > P.y + .1 && p.y < P.y + 1.9) { hitPlayer(); gone = true; } }
    if (!gone && b.from === 'player') for (const t of targets()) { if (Math.hypot(p.x - t.pos.x, p.z - t.pos.z) < .48 && p.y > t.pos.y + .1 && p.y < t.pos.y + 1.95) { hitTarget(t, b); gone = true; break; } }
    if (!gone && p.y < G.groundAt(p.x, p.z) + .05) { splat(p, false); gone = true; }
    if (gone) { scene.remove(b.m); balls.splice(i, 1); } }
});
function playerThrow() {
  if (G.busy && G.busy()) return;
  const P = player.pos, face = player.face, av = G.av();
  // aim at the nearest person in front of you (within 16 steps)
  let best = null, bd = 1e9;
  for (const t of targets()) { const dx = t.pos.x - P.x, dz = t.pos.z - P.z, d = Math.hypot(dx, dz); if (d < 1 || d > 16) continue;
    const da = Math.abs(Math.atan2(Math.sin(Math.atan2(dx, dz) - face), Math.cos(Math.atan2(dx, dz) - face))); if (da > .5) continue; const sc = d + da * 8; if (sc < bd) { bd = sc; best = t; } }
  av.play('wave');
  setTimeout(() => throwBall(handPos(av, P, face), best ? new THREE.Vector3(best.pos.x, best.pos.y + 1.15, best.pos.z) : null, face, 'player', best ? .25 : 0), 180);
  did('snowball', 'throw');
}

/* ---------- ❄️ snowball fight with a townsperson: first to 5 hits ---------- */
let FIGHT = null;
const hud = document.createElement('div'); hud.id = 'xmasFight';
hud.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 58px);transform:translateX(-50%);z-index:30;background:rgba(255,255,255,.94);color:#1f3a5a;font:700 16px system-ui,sans-serif;padding:8px 16px;border-radius:999px;box-shadow:0 6px 18px rgba(31,58,90,.25);display:none;pointer-events:none;white-space:nowrap';
document.body.appendChild(hud);
function fightHUD() { if (!FIGHT) { hud.style.display = 'none'; return; } const left = Math.max(0, Math.ceil(FIGHT.end - performance.now() / 1000));
  hud.style.display = 'block'; hud.textContent = `❄️ You ${FIGHT.you} – ${FIGHT.them} ${FIGHT.f.name}  ·  ${left}s`; }
function startFight(f) {
  if (FIGHT) return; G.closeTalk && G.closeTalk();
  FIGHT = { f, you: 0, them: 0, end: performance.now() / 1000 + 60, next: 2.2, keep: f.pos.clone() };
  f.tgt = null; f.wait = 999; G.banner(`❄️ Snowball fight with ${f.name}!`); G.toast('Tap ❄️ Snowball to throw. Keep moving so you don\'t get hit! First to 5 wins.');
  G.friendBubble(f, rnd(['You\'re going down! ❄️', 'Ready? Go! ⛄', 'Bring it on! 😆'])); did('snowfight');
  fightHUD();
}
function endFight(won) {
  const f = FIGHT.f; FIGHT = null; fightHUD(); f.wait = 2;
  if (won) { G.banner(`🏆 You won the snowball fight!`); G.sfx('tada'); G.earn(20, 'Snowball fight win'); f.play('clap'); G.friendBubble(f, 'You win! Good game! ⛄'); did('snowfight', 0); G.addHeart && G.addHeart(f, 1); }
  else { G.banner(`⛄ ${f.name} won this time!`); f.play('cheer'); G.friendBubble(f, 'Ha! I win! Again? 😆'); did('snowfight', 1); }
}
ticks.push(dt => {
  if (!FIGHT) return; const f = FIGHT.f, P = player.pos, now = performance.now() / 1000;
  if (now > FIGHT.end) { endFight(FIGHT.you > FIGHT.them); return; }
  if (Math.hypot(P.x - f.pos.x, P.z - f.pos.z) > 26) { G.toast(`${f.name}: Hey, come back! The fight's over 😅`); FIGHT = null; fightHUD(); f.wait = 2; return; }
  f.tgt = null; f.wait = 999;
  // face you and dodge left and right a little (stays near where the fight started)
  f.face = G.angDamp(f.face, Math.atan2(P.x - f.pos.x, P.z - f.pos.z), dt * 6);
  const side = Math.sin(now * 1.3) * dt * 1.1; f.pos.x += Math.cos(f.face) * side; f.pos.z -= Math.sin(f.face) * side;
  if (f.pos.distanceTo(FIGHT.keep) > 3) f.pos.lerp(FIGHT.keep, dt);
  f.g.rotation.y = f.face;
  FIGHT.next -= dt; if (FIGHT.next <= 0) { FIGHT.next = 1.5 + Math.random() * 1.2; f.play('wave');
    setTimeout(() => FIGHT && throwBall(handPos(f, f.pos, f.face), new THREE.Vector3(P.x, P.y + 1.15, P.z), f.face, f, .7), 200); }
  if (Math.floor(now * 4) !== Math.floor((now - dt) * 4)) fightHUD();
});
G.TALK_EXTRA.push({ id: 'snowfight', btn: () => FIGHT ? null : ['❄️', 'Snowball fight!'], act: f => startFight(f) });

/* ================= ⛄ SNOWMEN ================= */
const SM_SIZES = [.55, .4, .28];
const lumpy = (r, seedN) => { const g = new THREE.IcosahedronGeometry(r, 3), p = g.attributes.position; let s = seedN;
  const n = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const bumps = [0, 1, 2, 3].map(() => [n() * 6, n() * 6, n() * 6]);
  for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i), k = 1 + bumps.reduce((a, b) => a + Math.sin(v.x / r * 3 + b[0]) * Math.sin(v.y / r * 3 + b[1]) * Math.sin(v.z / r * 3 + b[2]) * .025, 0);
    v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g; };
const SM_GEO = SM_SIZES.map((r, i) => lumpy(r, 77 + i * 31));
const smSnow = new THREE.MeshPhysicalMaterial({ color: '#f5f8fb', roughness: .92, sheen: .5, sheenColor: new THREE.Color('#dfe9ff') });
const coal = new THREE.MeshStandardMaterial({ color: '#16161a', roughness: .8 }), carrotM = new THREE.MeshStandardMaterial({ color: '#e46b1c', roughness: .7 });
const stickM = new THREE.MeshStandardMaterial({ color: '#4a3424', roughness: 1 });
const SCARVES = ['#b3121f', '#1f5e3a', '#2a4a8a', '#c9a23a', '#7a2a6a'];
const snowmen = [];
// stack heights: the base sits on the ground, the next ball sits a bit into the one below
const stackY = [SM_SIZES[0] * .92, SM_SIZES[0] * 1.84 + SM_SIZES[1] * .85, SM_SIZES[0] * 1.84 + SM_SIZES[1] * 1.7 + SM_SIZES[2] * .85];
function buildSnowman(d, fresh) {
  const g = new THREE.Group(); g.position.set(d.x, G.groundAt(d.x, d.z), d.z); g.rotation.y = d.face || 0; scene.add(g);
  const parts = [];
  for (let i = 0; i < (d.n == null ? 3 : d.n); i++) { const b = new THREE.Mesh(SM_GEO[i], smSnow); b.position.y = stackY[i]; b.castShadow = true; b.receiveShadow = true; b.rotation.y = i * 1.3; g.add(b); parts.push(b); }
  const sm = { d, g, parts, ob: { x: d.x, z: d.z, r: .6 } }; G.obs.push(sm.ob); snowmen.push(sm);
  if ((d.n == null ? 3 : d.n) >= 3) decorate(sm, fresh);
  return sm;
}
function decorate(sm, fresh) {
  const g = sm.g, hy = stackY[2], hr = SM_SIZES[2], my = stackY[1], mr = SM_SIZES[1];
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(.03, 8, 6), coal, s * .09, hy + .07, hr * .9);
  for (let i = 0; i < 5; i++) { const a = (i - 2) * .32; add(new THREE.SphereGeometry(.018, 6, 5), coal, Math.sin(a) * .11, hy - .08 + Math.abs(i - 2) * .025, Math.cos(a) * hr * .93); }
  const nose = add(new THREE.ConeGeometry(.035, .22, 10), carrotM, 0, hy, hr + .08); nose.rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) add(new THREE.SphereGeometry(.03, 8, 6), coal, 0, my + .15 - i * .14, Math.sqrt(Math.max(0, mr * mr - Math.pow(.15 - i * .14, 2))) + .005);
  for (const s of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(s * mr * .85, my + .08, 0); arm.rotation.z = s * -1.05; g.add(arm);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(.014, .02, .55, 6), stickM); st.position.y = .27; arm.add(st);
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(.008, .012, .16, 5), stickM); tw.position.set(.04 * s, .45, 0); tw.rotation.z = -.6 * s; arm.add(tw); }
  const scM = new THREE.MeshPhysicalMaterial({ color: sm.d.scarf || rnd(SCARVES), roughness: .95, sheen: .8 });
  const sc = add(new THREE.TorusGeometry(hr * .95, .045, 8, 24), scM, 0, hy - hr * .82, 0); sc.rotation.x = Math.PI / 2;
  const tail = add(new THREE.BoxGeometry(.08, .26, .025), scM, .1, hy - hr - .1, hr * .72); tail.rotation.z = .15;
  if (fresh) { G.burst(g.position.clone().add(new THREE.Vector3(0, 1.4, 0)), '#ffffff', 40, 2.5); G.sfx('tada'); }
}
for (const d of X.snowmen) buildSnowman(d, false);
// rolling: a ball of snow in front of you that grows as you walk
const ROLL = { on: false, stage: 0, r: .14, ball: null, last: null, base: null, full: false };
function snowmanAct() {
  if (G.busy && G.busy()) return;
  if (G.ride && G.ride()) { G.toast('Hop off your ride first to build a snowman ⛄'); return; }
  if (!ROLL.on) { // start rolling the next ball
    ROLL.on = true; ROLL.r = .14; ROLL.full = false; ROLL.last = player.pos.clone();
    ROLL.ball = new THREE.Mesh(SM_GEO[ROLL.stage], smSnow); ROLL.ball.castShadow = true; ROLL.ball.scale.setScalar(ROLL.r / SM_SIZES[ROLL.stage]); scene.add(ROLL.ball);
    G.toast(ROLL.stage === 0 ? '⛄ Walk around to roll the snow into a big ball!' : ROLL.stage === 1 ? '⛄ Roll a middle ball, then bring it back to your snowman' : '⛄ Now a small ball for the head!');
    G.renderActions(); return; }
  if (!ROLL.full) { G.toast('⛄ Keep walking! The ball is still too small'); return; }
  const P = player.pos, f = player.face, fx = P.x + Math.sin(f) * (1 + SM_SIZES[ROLL.stage]), fz = P.z + Math.cos(f) * (1 + SM_SIZES[ROLL.stage]);
  if (ROLL.stage === 0) {
    if (G.obs.some(o => Math.hypot(o.x - fx, o.z - fz) < o.r + .6)) { G.toast('⛄ Not enough room here. Try a more open spot'); return; }
    const d = { x: fx, z: fz, face: f + Math.PI, n: 1, scarf: rnd(SCARVES), at: zoneId() || 'park' };
    ROLL.base = buildSnowman(d, false); dropRoll(); ROLL.stage = 1; G.toast('⛄ Great base! Tap ⛄ again to roll the middle'); G.renderActions(); return; }
  const B = ROLL.base; if (!B || Math.hypot(B.d.x - P.x, B.d.z - P.z) > 2.8) { G.toast('⛄ Bring it to your snowman to stack it on top'); return; }
  const b = new THREE.Mesh(SM_GEO[ROLL.stage], smSnow); b.position.y = stackY[ROLL.stage]; b.castShadow = true; B.g.add(b); B.parts.push(b); B.d.n = ROLL.stage + 1; dropRoll();
  G.burst(B.g.position.clone().add(new THREE.Vector3(0, stackY[ROLL.stage], 0)), '#ffffff', 16, 1.5);
  if (ROLL.stage === 1) { ROLL.stage = 2; G.toast('⛄ Now roll a small ball for the head!'); G.renderActions(); return; }
  // done: the face, arms and scarf go on
  B.d.n = 3; decorate(B, true); ROLL.stage = 0; ROLL.base = null;
  X.snowmen.push(B.d); while (X.snowmen.length > 6) { const old = X.snowmen.shift(), sm = snowmen.find(s => s.d === old); if (sm) removeSnowman(sm); } persist();
  G.banner('⛄ You built a snowman!'); G.earn(10, 'Snowman'); did('snowman', B.d.at); G.renderActions();
}
function dropRoll() { if (ROLL.ball) { scene.remove(ROLL.ball); ROLL.ball = null; } ROLL.on = false; ROLL.full = false; }
function removeSnowman(sm) { scene.remove(sm.g); const i = G.obs.indexOf(sm.ob); if (i >= 0) G.obs.splice(i, 1); snowmen.splice(snowmen.indexOf(sm), 1); }
ticks.push(dt => {
  if (!ROLL.on || !ROLL.ball) return; const P = player.pos, f = player.face, R0 = SM_SIZES[ROLL.stage];
  const moved = Math.hypot(P.x - ROLL.last.x, P.z - ROLL.last.z); ROLL.last.copy(P);
  if (moved > 2) return; // teleported (opened something)
  if (!ROLL.full) { ROLL.r = Math.min(R0, ROLL.r + moved * .028); if (ROLL.r >= R0) { ROLL.full = true; G.sfx('pop'); G.toast(ROLL.stage === 0 ? '⛄ Big enough! Tap ⛄ to put it down' : '⛄ Big enough! Take it to your snowman and tap ⛄'); G.renderActions(); } }
  const k = ROLL.r / R0, d = .45 + ROLL.r; ROLL.ball.scale.setScalar(k);
  const x = P.x + Math.sin(f) * d, z = P.z + Math.cos(f) * d; ROLL.ball.position.set(x, G.groundAt(x, z) + ROLL.r * .92, z);
  ROLL.ball.rotateOnWorldAxis(new THREE.Vector3(Math.cos(f), 0, -Math.sin(f)), moved / Math.max(.1, ROLL.r));
});

/* ================= ACTION BUTTONS ================= */
const snowLabel = () => !ROLL.on ? (ROLL.stage === 0 ? 'Snowman' : ROLL.stage === 1 ? 'Middle' : 'Head') : ROLL.full ? (ROLL.stage === 0 ? 'Put down' : 'Stack') : 'Rolling…';
G.ACT_HOOKS.unshift({ acts: () => [['snowball', '❄️', 'Snowball'], ['snowman', '⛄', snowLabel()]], run: id => { if (id === 'snowball') { playerThrow(); return true; } if (id === 'snowman') { snowmanAct(); return true; } return false; } });
G.renderActions();

// for the test (3d/tests/christmas.mjs)
window.__xmas = { tree: TREE, santa: window.__santa, snowmen: () => snowmen.map(s => ({ x: s.d.x, z: s.d.z, n: s.d.n })), roll: () => ({ on: ROLL.on, stage: ROLL.stage, full: ROLL.full, r: ROLL.r }),
  fight: () => FIGHT && { you: FIGHT.you, them: FIGHT.them, f: FIGHT.f.name }, startFight, throwAt: playerThrow, balls: () => balls.length, bulbs: () => allBulbs.reduce((a, b) => a + b.im.count, 0) };
}
