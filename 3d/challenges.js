// Star challenges: little goals at every place in town that give you ⭐ stars (and coins).
// The game tells us what you do with  dispatchEvent(new CustomEvent('brynny:did',{detail:{k,a}}))  (see did() in index.html).
// Everything is saved in SAVE.chal so it stays after you close the game.
const G = window.__game;
const $ = s => document.querySelector(s);
const SAVE = G.SAVE;
const Z = Object.fromEntries(G.ZONES.map(z => [z.id, z]));
const persist = () => { try { localStorage.setItem('brynny3d.v1', JSON.stringify(SAVE)); } catch (e) {} };
const zoneId = () => (G.zone() || {}).id;
const MOVES = ['wave', 'dance', 'twirl', 'kiss', 'clap', 'cheer', 'flip', 'sit', 'pose', 'bow', 'magic', 'jumpjack'];

// first time: stars you already found count toward your total
if (!SAVE.chal) { const f = (SAVE.stars || []).length; SAVE.chal = { done: {}, n: {}, u: {}, found: f, stars: f, day: null }; persist(); }
const C = SAVE.chal;
C.done ||= {}; C.n ||= {}; C.u ||= {};

/* ---------- the challenges ----------
   ev: which thing you did counts (k = kind, a = test for the extra info, z = must be at this place)
   poll: a number we can just look up      goal: how many you need      u: count different ones (places, people)
   go: the place the 📍 button guides you to */
const glam = () => G.glamCheck(SAVE.look);
const LIST = [
  // ✨ Sparkle Studio
  { id: 'dress', tab: 'studio', e: '👗', t: 'Put on a dress', r: 1, go: 'studio', poll: () => SAVE.look.dress ? 1 : 0 },
  { id: 'fullLook', tab: 'studio', e: '👒', t: 'Wear a hat, shoes and an extra all at once', r: 1, go: 'studio', poll: () => SAVE.look.hat && SAVE.look.shoes && Object.keys(SAVE.look.extras || {}).length ? 1 : 0 },
  { id: 'restyle', tab: 'studio', e: '🪞', t: 'Change your outfit 3 times', r: 1, go: 'studio', goal: 3, ev: { k: 'dress' } },
  { id: 'photo', tab: 'studio', e: '📸', t: 'Take a photo', r: 1, ev: { k: 'act', a: a => a === 'photo' } },
  { id: 'buy', tab: 'studio', e: '🛍️', t: 'Buy something from the shop', r: 2, ev: { k: 'buy' } },
  // 💃 Runway
  { id: 'pose', tab: 'runway', e: '📸', t: 'Strike a pose on the runway', r: 1, go: 'runway', ev: { k: 'pose' } },
  { id: 'runTwirl', tab: 'runway', e: '🌀', t: 'Twirl on the runway', r: 1, go: 'runway', ev: { k: 'act', a: a => a === 'twirl', z: 'runway' } },
  { id: 'pose5', tab: 'runway', e: '🌟', t: 'Strike 5 poses on the runway', r: 2, go: 'runway', goal: 5, ev: { k: 'pose' } },
  // 🐾 Pet Parlor
  { id: 'adopt', tab: 'parlor', e: '🐶', t: 'Adopt a pet (pets live all around town)', r: 1, go: 'spring', poll: () => G.myPet() ? 1 : 0 },
  { id: 'feed', tab: 'parlor', e: '🍖', t: 'Feed your pet a snack', r: 1, go: 'parlor', ev: { k: 'feed' } },
  { id: 'bath', tab: 'parlor', e: '🛁', t: 'Give your pet a bubble bath', r: 2, go: 'parlor', ev: { k: 'bath' } },
  { id: 'paws', tab: 'parlor', e: '💅', t: 'Paint all 4 paws', r: 2, go: 'parlor', ev: { k: 'paws' } },
  { id: 'petDress', tab: 'parlor', e: '🎀', t: 'Dress up your pet', r: 1, go: 'parlor', ev: { k: 'petdress' } },
  // 🧁 Sweet Bakery
  { id: 'cake', tab: 'bakery', e: '🎂', t: 'Design a cake', r: 1, go: 'bakery', ev: { k: 'cake' } },
  { id: 'tallCake', tab: 'bakery', e: '🍰', t: 'Make a cake with 3 layers or more', r: 2, go: 'bakery', ev: { k: 'cake', a: n => n >= 3 } },
  { id: 'cakeContest', tab: 'bakery', e: '⏱️', t: 'Enter a cake contest', r: 1, go: 'bakery', ev: { k: 'cakect' } },
  { id: 'cakeWin', tab: 'bakery', e: '👑', t: 'Win a cake contest', r: 2, go: 'bakery', ev: { k: 'cakect', a: p => p === 0 } },
  { id: 'wish', tab: 'bakery', e: '🕯️', t: 'Blow out the candles and make a wish', r: 1, go: 'bakery', ev: { k: 'wish' } },
  // ⭐ Star Model Agency
  { id: 'glam', tab: 'agency', e: '💄', t: 'Sit at the glam mirror', r: 1, go: 'agency', ev: { k: 'glam' } },
  { id: 'makeup', tab: 'agency', e: '💋', t: 'Wear 3 kinds of makeup', r: 1, go: 'agency', poll: () => glam().mk >= 3 ? 1 : 0 },
  { id: 'nails', tab: 'agency', e: '💅', t: 'Get a manicure and a pedicure', r: 1, go: 'agency', poll: () => glam().nails && glam().toes ? 1 : 0 },
  { id: 'salon', tab: 'agency', e: '💇', t: 'Get a salon hairdo', r: 1, go: 'agency', poll: () => glam().hair ? 1 : 0 },
  { id: 'braid', tab: 'agency', e: '🪢', t: 'Braid your own hair', r: 2, go: 'agency', ev: { k: 'braid' } },
  { id: 'contest', tab: 'agency', e: '🏆', t: 'Enter the model contest', r: 1, go: 'agency', ev: { k: 'contest' } },
  { id: 'podium', tab: 'agency', e: '🥉', t: 'Finish in the top 3 of the contest', r: 2, go: 'agency', ev: { k: 'contest', a: p => p <= 2 } },
  { id: 'win', tab: 'agency', e: '👑', t: 'Win the model contest', r: 3, go: 'agency', ev: { k: 'contest', a: p => p === 0 } },
  // 💬 Friends in town
  { id: 'talk', tab: 'town', e: '💬', t: 'Say hi to someone in town', r: 1, ev: { k: 'talk' } },
  { id: 'talk5', tab: 'town', e: '👭', t: 'Talk to 5 different people', r: 2, goal: 5, u: true, ev: { k: 'talk' } },
  { id: 'quest', tab: 'town', e: '🎁', t: 'Help someone with their task', r: 2, poll: () => Math.min(1, SAVE.townDone || 0) },
  { id: 'quest5', tab: 'town', e: '🦸‍♀️', t: 'Help with 5 tasks', r: 3, goal: 5, poll: () => SAVE.townDone || 0 },
  { id: 'bestie', tab: 'town', e: '💖', t: 'Make a best friend (5 hearts)', r: 3, poll: () => G.FRIENDS.some(f => G.townSave(f).h >= 5) ? 1 : 0 },
  // 🗺️ Explore
  { id: 'map', tab: 'explore', e: '🗺️', t: 'Use the map to walk somewhere', r: 1, ev: { k: 'arrive' } },
  { id: 'visitAll', tab: 'explore', e: '🧭', t: 'Visit all 10 places', r: 3, goal: G.ZONES.length, u: true, ev: { k: 'zone', a: a => !!Z[a] } },
  { id: 'find5', tab: 'explore', e: '⭐', t: 'Find 5 hidden stars', r: 1, goal: 5, poll: () => C.found },
  { id: 'find24', tab: 'explore', e: '🌟', t: 'Find all 24 hidden stars', r: 3, goal: 24, poll: () => C.found },
  { id: 'beachJump', tab: 'explore', e: '🏖️', t: 'Do a star jump at the beach', r: 1, go: 'beach', ev: { k: 'act', a: a => a === 'jumpjack', z: 'beach' } },
  { id: 'spookyFlip', tab: 'explore', e: '🎃', t: 'Do a flip in Halloween Hollow', r: 1, go: 'halloween', ev: { k: 'act', a: a => a === 'flip', z: 'halloween' } },
  { id: 'snowDance', tab: 'explore', e: '🎄', t: 'Dance in Christmas Village', r: 1, go: 'christmas', ev: { k: 'act', a: a => a === 'dance', z: 'christmas' } },
  { id: 'partyCheer', tab: 'explore', e: '🎂', t: 'Cheer at the Birthday Party', r: 1, go: 'birthday', ev: { k: 'act', a: a => a === 'cheer', z: 'birthday' } },
  { id: 'gardenBow', tab: 'explore', e: '🌷', t: 'Curtsy in the Spring Garden', r: 1, go: 'spring', ev: { k: 'act', a: a => a === 'bow', z: 'spring' } },
];
// daily challenges: 3 new ones every day, and a bonus for doing all 3
const DAILY = [
  { id: 'd_feed', e: '🍖', t: 'Feed your pet 2 times', goal: 2, go: 'parlor', ev: { k: 'feed' } },
  { id: 'd_moves', e: '💃', t: 'Do 5 dance moves', goal: 5, ev: { k: 'act', a: a => MOVES.includes(a) } },
  { id: 'd_stars', e: '⭐', t: 'Find 3 hidden stars', goal: 3, ev: { k: 'star' } },
  { id: 'd_places', e: '🧭', t: 'Visit 3 different places', goal: 3, u: true, ev: { k: 'zone', a: a => !!Z[a] } },
  { id: 'd_photo', e: '📸', t: 'Take 2 photos', goal: 2, ev: { k: 'act', a: a => a === 'photo' } },
  { id: 'd_cake', e: '🎂', t: 'Bake a cake', go: 'bakery', ev: { k: 'cake' } },
  { id: 'd_talk', e: '💬', t: 'Talk to 3 different people', goal: 3, u: true, ev: { k: 'talk' } },
  { id: 'd_pose', e: '📸', t: 'Strike 3 poses on the runway', goal: 3, go: 'runway', ev: { k: 'pose' } },
  { id: 'd_contest', e: '🏆', t: 'Enter the model contest', go: 'agency', ev: { k: 'contest' } },
  { id: 'd_quest', e: '🎁', t: 'Help someone in town', ev: { k: 'quest' } },
  { id: 'd_glam', e: '💄', t: 'Sit at the glam mirror', go: 'agency', ev: { k: 'glam' } },
  { id: 'd_bath', e: '🛁', t: 'Give your pet a bath', go: 'parlor', ev: { k: 'bath' } },
  { id: 'd_dress', e: '👗', t: 'Change your outfit 2 times', goal: 2, ev: { k: 'dress' } },
].map(d => Object.assign({ r: 1, tab: 'today', daily: true }, d));
const TABS = [['today', '📅', 'Today'], ['studio', '✨', 'Studio'], ['runway', '💃', 'Runway'], ['parlor', '🐾', 'Pets'], ['bakery', '🧁', 'Bakery'], ['agency', '⭐', 'Agency'], ['town', '💬', 'Friends'], ['explore', '🗺️', 'Explore']];
const RANKS = [[0, '🌱', 'New Star'], [10, '✨', 'Rising Star'], [25, '💫', 'Shining Star'], [45, '🌟', 'Superstar'], [70, '👑', 'Megastar'], [100, '🌈', 'Legend']];
const DAY_BONUS = 2, COINS_PER_STAR = 5;

/* ---------- today's 3 ---------- */
const dayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function today() {
  const k = dayKey();
  if (!C.day || C.day.k !== k) {
    let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const pool = DAILY.slice(), ids = [];
    while (ids.length < 3) { h = (h * 1103515245 + 12345) >>> 0; ids.push(pool.splice(h % pool.length, 1)[0].id); }
    C.day = { k, ids, n: {}, u: {}, done: {}, bonus: false }; persist();
  }
  return C.day;
}
const todays = () => today().ids.map(id => DAILY.find(d => d.id === id)).filter(Boolean);

/* ---------- progress ---------- */
const store = ch => ch.daily ? today() : C;
const isDone = ch => !!store(ch).done[ch.id];
const goalOf = ch => ch.goal || 1;
function progress(ch) {
  if (isDone(ch)) return goalOf(ch);
  if (ch.poll) { try { return Math.min(goalOf(ch), ch.poll() || 0); } catch (e) { return 0; } }
  const s = store(ch);
  return Math.min(goalOf(ch), ch.u ? (s.u[ch.id] || []).length : (s.n[ch.id] || 0));
}
const allCh = () => LIST.concat(todays());
const left = zid => allCh().some(ch => !isDone(ch) && ch.go === zid);
window.__chal = { left, list: LIST, today: todays, progress, isDone };

/* ---------- awarding stars (one at a time, so each gets its moment) ---------- */
const queue = []; let busy = false;
function award(ch) {
  const s = store(ch); if (s.done[ch.id]) return;
  s.done[ch.id] = true; C.fresh = true; persist();
  queue.push({ e: ch.e, t: ch.t, r: ch.r });
  if (ch.daily && todays().every(isDone) && !today().bonus) { today().bonus = true; persist(); queue.push({ e: '🎉', t: "All of today's challenges!", r: DAY_BONUS }); }
  drain();
}
function drain() {
  if (busy || !queue.length) return;
  if (!G.started()) { setTimeout(drain, 1000); return; }
  busy = true; const q = queue.shift();
  const before = rank(); C.stars = (C.stars || 0) + q.r; persist(); showStars(true);
  G.banner(q.b ? `${q.b} +${q.r} ⭐` : `🌟 Challenge done! +${q.r} ⭐`); G.toast(`${q.e} ${q.t}`); G.sfx('tada');
  try { const p = G.player.pos; for (let k = 0; k < 3; k++) setTimeout(() => G.burst(new G.THREE.Vector3(p.x + (Math.random() - .5) * 2, p.y + 2, p.z + (Math.random() - .5) * 2), ['#ffd23f', '#ff8fc8', '#8fd8ff'][k], 40, 3), k * 200); } catch (e) {}
  dispatchEvent(new CustomEvent('brynny:earn', { detail: { n: q.r * COINS_PER_STAR, why: 'Challenge!' } }));
  const after = rank(); if (after !== before) setTimeout(() => { G.banner(`${after[1]} You're a ${after[2]}!`); G.sfx('tada'); }, 1900);
  if (panelOpen) render();
  setTimeout(() => { busy = false; drain(); }, 2300);
}
const rank = () => { let r = RANKS[0]; for (const x of RANKS) if ((C.stars || 0) >= x[0]) r = x; return r; };

/* ---------- listening to the game ---------- */
function count(ch, k, a) {
  const ev = ch.ev; if (!ev || isDone(ch) || ev.k !== k) return;
  if (ev.a && !ev.a(a)) return;
  if (ev.z && zoneId() !== ev.z) return;
  const s = store(ch);
  if (ch.u) { const key = k === 'zone' ? a : String(a); const l = s.u[ch.id] ||= []; if (l.includes(key)) return; l.push(key); }
  else s.n[ch.id] = (s.n[ch.id] || 0) + 1;
  persist();
  if (progress(ch) >= goalOf(ch)) award(ch);
  else if (panelOpen) render();
}
addEventListener('brynny:did', e => {
  const { k, a } = e.detail || {};
  if (k === 'star') { C.found = (C.found || 0) + 1; C.stars = (C.stars || 0) + 1; persist(); showStars(true); }
  if (k === 'stars') { showStars(); return; }
  if (k === 'zone' && !G.started()) return;
  for (const ch of allCh()) count(ch, k, a);
  check();
});
// prizes from contests (the bakery cake contest gives ⭐ for 1st, 2nd and 3rd place)
addEventListener('brynny:prize', e => { const d = e.detail || {}; const n = Math.max(0, Math.min(5, Math.round(+d.n || 0))); if (!n) return; queue.push({ e: d.e || '🏆', t: String(d.t || 'Prize!'), r: n, b: d.b ? String(d.b) : '' }); drain(); });
function check() { for (const ch of allCh()) if (ch.poll && !isDone(ch) && progress(ch) >= goalOf(ch)) award(ch); }
setInterval(() => { if (G.started()) check(); }, 700);

/* ---------- the ⭐ button up top ---------- */
const css = document.createElement('style');
css.textContent = `
#stars{display:flex;align-items:center;gap:4px;color:var(--ink);background:linear-gradient(90deg,rgba(255,243,176,.95),rgba(232,220,255,.95));border:2px solid #fff;position:relative}
#stars span{font-size:15px;margin-left:2px}
#stars:active{transform:scale(.94)}
#stars.bump{animation:cbump .45s}
#stars .dot{position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#ff4d8d;border:2px solid #fff;display:none}
#stars.new .dot{display:block}
#chal .card{max-width:440px;height:min(680px,calc(100vh - 40px));height:min(680px,calc(100dvh - 40px));display:flex;flex-direction:column;padding:16px 14px 14px;text-align:left}
#chal .chead{padding:0 4px 6px}
#chal .chead h2{font-size:22px}
#chalDone{background:var(--pink);color:#fff;font-weight:700;padding:9px 18px;border-radius:999px;font-size:16px;box-shadow:0 3px 0 #e04a8d}
.crank{display:flex;align-items:center;gap:10px;background:linear-gradient(90deg,#fff3c4,#ffe6f2);border-radius:18px;padding:8px 12px;margin:0 2px 4px}
.crank>b{font-size:34px;font-weight:400;line-height:1}
.crank div{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}
.crank strong{font-size:17px}.crank span{font-size:13px;color:var(--muted);font-weight:600}
.crank i{display:block;height:9px;border-radius:9px;background:rgba(255,255,255,.8);overflow:hidden}.crank i u{display:block;height:100%;background:linear-gradient(90deg,#ffd23f,#ff6fae);border-radius:9px}
.crank em{font-style:normal;font-weight:700;font-size:22px;white-space:nowrap}
#chal .tabs{margin:0 -14px;padding:6px 10px}
#chal .tab{position:relative}
#chal .tab s{position:absolute;top:2px;right:4px;width:9px;height:9px;border-radius:50%;background:#ff4d8d;text-decoration:none}
#chalList{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:8px 2px 2px;display:flex;flex-direction:column;gap:7px;min-height:120px}
.cq{display:flex;align-items:center;gap:10px;background:#fff7fb;border:2px solid #f6e3ef;border-radius:16px;padding:8px 10px}
.cq>b{font-size:28px;font-weight:400;line-height:1;width:34px;text-align:center;flex:0 0 auto}
.cq div{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.cq strong{font-size:15px;font-weight:600;line-height:1.2}
.cq i{display:flex;align-items:center;gap:6px;font-style:normal;font-size:12px;font-weight:700;color:var(--muted)}
.cq i u{flex:1;height:8px;border-radius:8px;background:#f3eaf8;overflow:hidden;display:block}.cq i u q{display:block;height:100%;background:linear-gradient(90deg,#ffb347,#ff6fae);border-radius:8px}
.cq i u q::before,.cq i u q::after{content:none}
.cq em{font-style:normal;font-size:13px;white-space:nowrap;letter-spacing:-1px}
.cq button{flex:0 0 auto;background:var(--purple);color:#fff;font-weight:700;font-size:14px;padding:9px 12px;border-radius:999px;box-shadow:0 3px 0 #6a4fd0;min-height:40px}
.cq button:active{transform:translateY(2px);box-shadow:0 1px 0 #6a4fd0}
.cq.done{background:#effbf3;border-color:#c9eed6}
.cq.done strong{color:#2e9b5a}
.cq.done>b{filter:saturate(.6)}
.cnote{font-size:13px;color:var(--muted);text-align:center;margin:4px 0 2px;font-weight:600}
.cbonus{background:linear-gradient(90deg,#efe3ff,#ffe6f2);border-radius:14px;padding:8px 12px;font-weight:600;font-size:14px;text-align:center}
`;
document.head.appendChild(css);
const btn = $('#stars');
btn.insertAdjacentHTML('beforeend', '<i class="dot"></i>');
function showStars(bump) {
  const n = $('#starN'); if (n) n.textContent = C.stars || 0;
  if (bump) { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }
  btn.classList.toggle('new', !!C.fresh && !panelOpen);
}

/* ---------- the challenges card ---------- */
document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="chal" aria-label="Star challenges"><div class="card">
  <div class="chead"><h2>🏆 Star Challenges</h2><button id="chalDone">Done</button></div>
  <div id="chalRank"></div>
  <div class="tabs" id="chalTabs"></div>
  <div id="chalList"></div>
</div></div>`);
let panelOpen = false, tab = 'today';
function render() {
  const r = rank(), nx = RANKS[RANKS.indexOf(r) + 1], s = C.stars || 0;
  $('#chalRank').innerHTML = `<div class="crank"><b>${r[1]}</b><div><strong>${r[2]}</strong>${nx ? `<i><u style="width:${Math.round((s - r[0]) / (nx[0] - r[0]) * 100)}%"></u></i><span>${nx[0] - s} more ⭐ to ${nx[2]} ${nx[1]}</span>` : '<span>You are a legend! 🌈</span>'}</div><em>⭐ ${s}</em></div>`;
  $('#chalTabs').innerHTML = TABS.map(([id, e, n]) => {
    const list = id === 'today' ? todays() : LIST.filter(c => c.tab === id), open = list.filter(c => !isDone(c)).length;
    return `<button class="tab${tab === id ? ' on' : ''}" data-tab="${id}"><b>${e}</b>${n}${open && id === 'today' ? '<s></s>' : ''}</button>`;
  }).join('');
  const list = tab === 'today' ? todays() : LIST.filter(c => c.tab === tab), here = zoneId();
  let h = '';
  if (tab === 'today') h += `<div class="cnote">New challenges every day! Finish all 3 for +${DAY_BONUS} bonus ⭐</div>`;
  const sorted = list.slice().sort((a, b) => isDone(a) - isDone(b));
  h += sorted.map(ch => {
    const d = isDone(ch), p = progress(ch), g = goalOf(ch);
    const go = !d && ch.go && Z[ch.go] ? (ch.go === here ? '<button disabled style="background:#2fb8a5;box-shadow:0 3px 0 #23907f">📍 Here!</button>' : `<button data-go="${ch.go}">📍 Go</button>`) : '';
    return `<div class="cq${d ? ' done' : ''}"><b>${d ? '✅' : ch.e}</b><div><strong>${ch.t}</strong><i>${g > 1 && !d ? `<u><q style="width:${Math.round(p / g * 100)}%"></q></u>${p} / ${g}` : d ? 'Done!' : ''}<em>${'⭐'.repeat(ch.r)}</em></i></div>${go}</div>`;
  }).join('');
  if (tab === 'today' && today().bonus) h += '<div class="cbonus">🎉 You did all of today\'s challenges! Come back tomorrow for new ones.</div>';
  const left = LIST.filter(c => c.tab === tab && !isDone(c)).length;
  if (tab !== 'today' && !left) h += '<div class="cbonus">🎉 You finished every challenge here!</div>';
  $('#chalList').innerHTML = h;
}
function openPanel() {
  if (!G.started() || G.busy()) return;
  try { G.closeTalk && G.closeTalk(); } catch (e) {}
  G.joy.id = null; G.joy.x = G.joy.y = 0;
  panelOpen = true; C.fresh = false; persist(); render(); $('#chal').classList.add('show'); $('#chalList').scrollTop = 0; G.sfx('pop'); showStars();
}
function closePanel() { panelOpen = false; $('#chal').classList.remove('show'); showStars(); }
btn.addEventListener('click', () => panelOpen ? closePanel() : openPanel());
$('#chalDone').onclick = closePanel;
$('#chal').addEventListener('click', e => {
  if (e.target.id === 'chal') return closePanel();
  const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; G.sfx('pop'); render(); $('#chalList').scrollTop = 0; return; }
  const g = e.target.closest('[data-go]');
  if (g) { const z = Z[g.dataset.go]; G.setDest(z); G.sfx('star'); closePanel(); G.toast(`Follow the pink arrow on the map to ${z.name} 💗`); }
});
addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; if (e.code === 'Escape' && panelOpen) closePanel(); });

/* ---------- start ---------- */
showStars();
// once you start playing, point out the new button (only the first time)
const intro = setInterval(() => {
  if (!G.started()) return; clearInterval(intro); check();
  if (!C.intro) { C.intro = 1; persist(); setTimeout(() => G.toast('New! Tap ⭐🏆 at the top for star challenges'), 4500); }
}, 500);
