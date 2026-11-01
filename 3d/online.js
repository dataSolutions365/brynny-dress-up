// Play with friends: phones share a room code (or invite link) and see each other in the same 3D world.
// Peer-to-peer over WebRTC (PeerJS). The free PeerJS cloud server only introduces the phones; game data goes phone to phone.
// The phone that starts the room is the host and passes messages between everyone else.
// Family only (../family.js): the room's online name is made from the code AND the family secret word, so a phone
// without the word can't find the room, and the host still taps "Let in" before anyone joins.
const G = window.__game;
const $ = s => document.querySelector(s);
const PEERJS = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
const PREFIX = 'brynny3d-room-';
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const MAX = 6;
const SAY = ['Hi! 👋', 'Cute outfit! 💖', 'Follow me! 🏃‍♀️', 'Wanna race? 🏁', 'Love your hair! ✨', 'Dance party! 💃', 'Let’s go to the beach! 🏖️', 'Photo time! 📸', 'Yay! 🎉', 'Bye bye! 👋'];
const TAGC = ['#2fb8a5', '#8e6cff', '#ff8a1f', '#3a8fe8', '#e0263b'];
const q = new URLSearchParams(location.search);
const urlRoom = (q.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
// ?peer=host:port points at a self-hosted PeerJS server (used for local testing)
const peerOpts = () => {
  const o = { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }] } };
  const ph = q.get('peer'); if (ph) { const [host, port] = ph.split(':'); Object.assign(o, { host, port: +port || 9000, path: '/', secure: false, config: { iceServers: [] } }); }
  return o;
};

let peer = null, host = null /* conn to host (guest) */, conns = new Map() /* host: id -> conn */, code = '', role = null, myId = '', hostId = '', hiKey = '';
const waiting = new Map(); // host: id -> conn, family phones waiting for the host to tap Let in
const Fam = window.Family;
const roomId = async c => PREFIX + (await Fam.key('room', c)).slice(0, 24);
const others = new Map(); // id -> {name, look, a: Avatar, tgt, face, sp, air}
if (G && G.setMapOthers) G.setMapOthers(others); // friends show up on the map
let lastLook = '', lastEmote = null, sendT = 0;

/* ---------- UI ---------- */
const css = document.createElement('style');
css.textContent = `
#netBtn .dot{position:absolute;top:2px;right:2px;min-width:18px;height:18px;border-radius:9px;background:#2fb8a5;color:#fff;font-size:11px;font-weight:700;display:none;place-items:center;padding:0 4px;box-shadow:0 0 0 2px #fff}
#netBtn.live .dot{display:grid}
#net .card{max-width:380px;max-height:calc(100vh - 40px);overflow-y:auto}
#net h2{margin:0 0 6px;font-size:24px}
#net p{color:var(--muted);margin:4px 0 12px}
#net .code{font-size:44px;font-weight:700;letter-spacing:8px;color:var(--pink);background:#fff0f7;border-radius:18px;padding:6px 0 6px 8px;margin:6px 0 10px;user-select:all}
#net input{width:100%;font-size:30px;letter-spacing:8px;text-transform:uppercase;padding:10px;border-radius:16px;border:3px solid var(--pink2);text-align:center;color:var(--ink);outline:none;margin-bottom:10px}
#net input:focus{border-color:var(--pink)}
#net .or{margin:14px 0 8px;color:var(--muted);font-size:14px;font-weight:600}
#net .who{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 12px}
#net .who span{background:#f6e3ef;border-radius:999px;padding:5px 12px;font-weight:600;font-size:14px}
#net .says{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:4px 0 12px}
#net .says button{background:#fff7fb;border:2px solid #f6e3ef;border-radius:14px;padding:8px 4px;font-weight:600;font-size:14px}
#net .says button:active{background:#ffe6f2}
#net .small{font-size:13px;color:var(--muted)}
#wroom{margin:-4px 0 12px;font-weight:600;color:#2fb8a5}
`;
document.head.appendChild(css);

const btn = document.createElement('button');
btn.className = 'rb'; btn.id = 'netBtn'; btn.setAttribute('aria-label', 'Play with friends');
btn.innerHTML = '👭<small>Friends</small><span class="dot"></span>';
$('#side').appendChild(btn);

const modal = document.createElement('div');
modal.className = 'modal'; modal.id = 'net'; modal.innerHTML = '<div class="card"></div>';
document.body.appendChild(modal);
const card = modal.querySelector('.card');
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
btn.onclick = () => openModal();
const closeModal = () => modal.classList.remove('show');
function openModal() { render(); modal.classList.add('show'); }

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const link = () => `${location.origin}${location.pathname}?room=${code}`;
let status = '';

function render() {
  if (!role) {
    card.innerHTML = `<h2>👭 Play with friends</h2><p>Start a room and send the link to a friend. They’ll show up in your world!</p>
      <button class="btn" id="nHost">✨ Start a room</button>
      <div class="or">— or join a friend —</div>
      <input id="nCode" maxlength="5" placeholder="CODE" autocomplete="off" autocapitalize="characters" value="${esc(urlRoom)}">
      <button class="btn" id="nJoin" style="background:#2fb8a5;box-shadow:0 4px 0 #1f8f80">🚪 Join</button>
      ${status ? `<p class="small">${esc(status)}</p>` : ''}
      <p class="small">🔒 Only family phones with your family secret word can join.</p>
      <div><button class="btn ghost" id="nFam">👨‍👩‍👧 ${Fam.has() ? 'Change' : 'Set'} family word</button> <button class="btn ghost" id="nClose">Close</button></div>`;
    $('#nFam').onclick = async () => { await Fam.ask('Grown-ups only: this word keeps rooms just for family.'); render(); };
    $('#nHost').onclick = startRoom;
    $('#nJoin').onclick = () => { const c = $('#nCode').value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length < 5) { status = 'Type the 5-letter code from your friend.'; render(); return; } joinRoom(c); };
    $('#nCode').addEventListener('keydown', e => { if (e.key === 'Enter') $('#nJoin').click(); });
    $('#nClose').onclick = closeModal;
    return;
  }
  const names = [G.SAVE.name || 'Me', ...[...others.values()].map(o => o.name)];
  const live = role === 'host' ? !!peer && !peer.disconnected || conns.size > 0 : !!host && host.open;
  card.innerHTML = `<h2>${role === 'host' ? '🏠 Your room' : '👭 Friend’s room'}</h2>
    ${status ? `<p>${esc(status)}</p>` : ''}
    <div class="code">${esc(code)}</div>
    ${role === 'host' ? '<button class="btn" id="nShare">💌 Send invite link</button>' : ''}
    <div class="or">In this room (${names.length})</div>
    <div class="who">${names.map(n => `<span>${esc(n)}</span>`).join('')}</div>
    ${others.size ? `<div class="or">Say something</div><div class="says">${SAY.map((s, i) => `<button data-say="${i}">${esc(s)}</button>`).join('')}</div>` : (live && role === 'host' ? '<p class="small">Waiting for friends to join…</p>' : '')}
    <button class="btn ghost" id="nLeave">🚪 Leave room</button> <button class="btn ghost" id="nClose">Close</button>`;
  const sh = $('#nShare'); if (sh) sh.onclick = share;
  card.querySelectorAll('[data-say]').forEach(b => b.onclick = () => { say(SAY[+b.dataset.say]); closeModal(); });
  $('#nLeave').onclick = () => { leave(); status = ''; render(); };
  $('#nClose').onclick = closeModal;
}
function badge() { btn.classList.toggle('live', !!role); btn.querySelector('.dot').textContent = role ? others.size + 1 : ''; if (modal.classList.contains('show')) render(); }

async function share() {
  const url = link(), text = `Come play Brynny's Dress-Up World with me! 💖 Room code: ${code}`;
  try { if (navigator.share) { await navigator.share({ title: "Brynny's Dress-Up World", text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(`${text} ${url}`); G.toast('Invite link copied! Paste it in a message 💌'); }
  catch (e) { prompt('Copy this link and send it to your friend:', url); }
}

/* ---------- networking ---------- */
let peerLib = null;
function loadPeer() {
  if (window.Peer) return Promise.resolve(window.Peer);
  if (!peerLib) peerLib = new Promise((ok, no) => { const s = document.createElement('script'); s.src = PEERJS; s.onload = () => ok(window.Peer); s.onerror = () => { peerLib = null; no(new Error('load')); }; document.head.appendChild(s); });
  return peerLib;
}
const newCode = () => Array.from({ length: 5 }, () => ABC[Math.random() * ABC.length | 0]).join('');
const me = () => ({ name: G.SAVE.name || 'Friend', look: G.SAVE.look });
const stateMsg = () => { const p = G.player.pos; return { t: 's', p: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)], f: +G.player.face.toFixed(2), sp: +G.player.speed.toFixed(1), air: !G.player.onGround }; };

async function startRoom(tries = 0) {
  if (!(await Fam.ensure('Rooms are just for family.'))) { status = 'Ask a grown-up to set the family word first.'; render(); return; }
  status = 'Starting your room…'; render();
  let Peer; try { Peer = await loadPeer(); } catch (e) { status = 'Couldn’t load online play. Check your internet and try again.'; render(); return; }
  code = newCode(); role = 'host';
  try { hostId = await roomId(code); hiKey = await Fam.key('hi', code); } catch (e) { leave(true); status = 'This browser can’t do family rooms. Try Chrome or Safari.'; render(); return; }
  peer = new Peer(hostId, peerOpts());
  peer.on('open', id => { myId = id; status = 'Send the link to a friend so they can join you!'; badge(); });
  peer.on('connection', c => {
    if (conns.size >= MAX - 1) { c.on('open', () => { c.send({ t: 'full' }); setTimeout(() => c.close(), 500); }); return; }
    c.on('data', d => fromGuest(c, d));
    c.on('close', () => { waiting.delete(c.peer); askDone(c.peer); dropGuest(c.peer); });
    c.on('error', () => { waiting.delete(c.peer); askDone(c.peer); dropGuest(c.peer); });
  });
  peer.on('disconnected', () => { if (role === 'host' && peer && !peer.destroyed) setTimeout(() => peer && !peer.destroyed && peer.reconnect(), 1500); });
  peer.on('error', e => {
    if (e.type === 'unavailable-id' && tries < 3) { peer.destroy(); peer = null; role = null; startRoom(tries + 1); return; }
    if (role === 'host' && conns.size === 0 && !myId) { leave(); status = 'Couldn’t start a room. Check your internet and try again.'; render(); }
  });
}

function fromGuest(c, d) {
  if (!d || typeof d !== 'object') return;
  const id = c.peer;
  if (d.t === 'hi' && !conns.has(id)) {
    // wrong family word: say no and hang up
    if (d.k !== hiKey) { try { c.send({ t: 'no' }); } catch (e) { } setTimeout(() => c.close(), 500); return; }
    if (waiting.has(id)) return;
    waiting.set(id, c);
    askHost(id, String(d.name || 'Someone').slice(0, 16), yes => {
      if (!waiting.has(id)) return; waiting.delete(id);
      if (!yes || role !== 'host') { try { c.send({ t: 'no' }); } catch (e) { } setTimeout(() => c.close(), 500); return; }
      if (conns.size >= MAX - 1) { c.send({ t: 'full' }); setTimeout(() => c.close(), 500); return; }
      letIn(c, id, d);
    });
    return;
  }
  if (!conns.has(id)) return;
  if (d.t === 'hi') return;
  if (d.t === 'bye') { dropGuest(id); return; }
  for (const [oid, oc] of conns) if (oid !== id) oc.send({ ...d, id });
  handle(id, d);
}
function letIn(c, id, d) {
    delete d.k;
    conns.set(id, c);
    // tell the newcomer who is here already, then tell everyone about the newcomer
    c.send({ t: 'roster', you: id, list: [{ id: myId, ...me(), st: stateMsg() }, ...[...others].map(([oid, o]) => ({ id: oid, name: o.name, look: o.look, st: o.st }))] });
    for (const [oid, oc] of conns) if (oid !== id) oc.send({ ...d, id });
    addOther(id, d);
}

/* ---------- the host taps Let in ---------- */
const askBox = document.createElement('div');
askBox.id = 'netAsk';
askBox.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;width:min(340px,calc(100vw - 32px))';
document.body.appendChild(askBox);
const asks = new Map(); // id -> {el, fn, t}
function askHost(id, name, fn) {
  const el = document.createElement('div');
  el.style.cssText = 'background:#fff;border-radius:18px;padding:12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.25);text-align:center;font-weight:600;color:#4a2b45';
  el.innerHTML = `<div style="font-size:17px;margin-bottom:8px">👋 <b>${esc(name)}</b> wants to join your room</div>
    <button class="btn" data-a="yes" style="margin:2px">✅ Let in</button> <button class="btn ghost" data-a="no" style="margin:2px">❌ No thanks</button>`;
  el.onclick = e => { const b = e.target.closest('[data-a]'); if (b) answer(id, b.dataset.a === 'yes'); };
  asks.set(id, { el, fn, t: setTimeout(() => answer(id, false), 60000) });
  askBox.appendChild(el); G.sfx && G.sfx('star');
}
function answer(id, yes) { const a = asks.get(id); if (!a) return; askDone(id); a.fn(yes); }
function askDone(id) { const a = asks.get(id); if (!a) return; clearTimeout(a.t); a.el.remove(); asks.delete(id); }
function dropGuest(id) {
  if (!conns.has(id)) return; conns.delete(id);
  for (const oc of conns.values()) oc.send({ t: 'bye', id });
  removeOther(id);
}

async function joinRoom(c) {
  status = `Joining room ${c}…`; render();
  let Peer; try { Peer = await loadPeer(); } catch (e) { status = 'Couldn’t load online play. Check your internet and try again.'; render(); return; }
  if (!(await Fam.ensure('Rooms are just for family.'))) { status = 'Ask a grown-up to set the family word first.'; render(); return; }
  let hid, k; try { hid = await roomId(c); k = await Fam.key('hi', c); } catch (e) { status = 'This browser can’t do family rooms. Try Chrome or Safari.'; render(); return; }
  leave(true); code = c; role = 'guest'; hostId = hid; render();
  peer = new Peer(undefined, peerOpts());
  let opened = false;
  peer.on('open', id => {
    myId = id;
    host = peer.connect(hid, { reliable: true });
    host.on('open', () => { opened = true; host.send({ t: 'hi', k, ...me(), st: stateMsg() }); status = 'Waiting for your family to let you in…'; render(); badge(); });
    host.on('data', d => fromHost(d));
    host.on('close', () => { if (role !== 'guest') return; const was = opened; leave(true); status = was ? 'The room closed. Join again with the code.' : ''; G.toast(was ? 'Your friend left the room 👋' : 'Couldn’t reach that room'); render(); badge(); });
  });
  peer.on('error', e => {
    if (role !== 'guest') return;
    const msg = e.type === 'peer-unavailable' ? `No room called ${c}. Check the code, and make sure this phone has the same family word.` : 'Couldn’t connect. Check your internet and try again.';
    leave(true); status = msg; render(); badge(); if (!modal.classList.contains('show')) G.toast(msg);
  });
  setTimeout(() => { if (role === 'guest' && code === c && !opened) { leave(true); status = 'Couldn’t connect to that room. Try again, or try on Wi-Fi.'; render(); badge(); } }, 25000);
}
function fromHost(d) {
  if (!d || typeof d !== 'object') return;
  if (d.t === 'no') { leave(true); status = 'You weren’t let in this time. Check the family word, or ask again.'; G.toast('Not let in this time'); render(); badge(); return; }
  if (d.t === 'full') { leave(true); status = 'That room is full (6 friends max).'; render(); badge(); return; }
  if (d.t === 'roster') { status = 'You’re in! Find your family in the world.'; G.toast(`You joined ${d.list[0] ? d.list[0].name + '’s' : 'the'} room! 💖`); for (const o of d.list) addOther(o.id, o, true); nearHost(d.list[0]); return; }
  if (d.t === 'hi') { addOther(d.id, d); return; }
  if (d.t === 'bye') { if (d.id === hostId) { leave(true); status = 'Your friend closed the room.'; G.toast('Your friend left the room 👋'); render(); return; } removeOther(d.id); return; }
  handle(d.id, d);
}

function nearHost(h) {
  if (!h || !h.st || !Array.isArray(h.st.p)) return;
  const P = G.player.pos, f = +h.st.f || 0;
  P.set(+h.st.p[0] + Math.sin(f) * 1.4 + Math.cos(f) * .6, +h.st.p[1] + .3, +h.st.p[2] + Math.cos(f) * 1.4 - Math.sin(f) * .6);
  G.player.face = f + Math.PI; G.player.vy = 0;
}
function send(d) {
  if (role === 'host') { d = { ...d, id: myId }; for (const c of conns.values()) c.open && c.send(d); }
  else if (role === 'guest' && host && host.open) host.send(d);
}
function say(text) { send({ t: 'say', text }); G.friendBubble(bubbleHolder(), text); }
const myBubble = { g: null, say: null, sayT: 0 };
function bubbleHolder() { const a = G.av(); if (myBubble.g !== a.g) { myBubble.g = a.g; myBubble.say = null; } return myBubble; }

function leave(quiet) {
  try { send({ t: 'bye' }); } catch (e) { }
  try { if (host) host.close(); } catch (e) { }
  for (const c of conns.values()) try { c.close(); } catch (e) { }
  conns.clear(); host = null;
  for (const [id, c] of waiting) { askDone(id); try { c.close(); } catch (e) { } }
  waiting.clear();
  try { if (peer) peer.destroy(); } catch (e) { }
  peer = null; role = null; myId = ''; code = ''; hostId = ''; hiKey = '';
  for (const id of [...others.keys()]) removeOther(id, true);
  if (q.has('room')) history.replaceState(null, '', location.pathname);
  badge();
}
addEventListener('pagehide', () => leave(true));

/* ---------- other players in the world ---------- */
function addOther(id, d, quiet) {
  if (!id || id === myId) return;
  if (others.has(id)) removeOther(id, true);
  const { THREE, scene, Avatar } = G;
  const name = String(d.name || 'Friend').slice(0, 16);
  const tc = TAGC[others.size % TAGC.length], a = new Avatar(d.look, name, tc);
  const st = d.st || { p: [0, .15, 2], f: 0, sp: 0 };
  const o = { name, tc, look: d.look, a, st, pos: new THREE.Vector3(...st.p), tgt: new THREE.Vector3(...st.p), face: st.f, sp: 0, air: false, say: null, sayT: 0, g: a.g };
  o.heard = performance.now(); a.g.position.copy(o.pos); scene.add(a.g); others.set(id, o);
  if (!quiet) { G.toast(`${name} joined the room! 👋`); a.play('wave'); }
  badge();
}
function removeOther(id, quiet) {
  const o = others.get(id); if (!o) return;
  G.scene.remove(o.a.g); others.delete(id);
  if (!quiet) G.toast(`${o.name} left 👋`);
  badge();
}
// the bakery cake contest (3d/src/21b-cake-contest.js) sends its own messages through the room
const netFns = [];
window.__net = { live: () => !!role && others.size > 0, send: d => send(d), on: f => netFns.push(f) };
function handle(id, d) {
  const o = others.get(id); if (!o) return;
  o.heard = performance.now();
  if (d.t === 's' && Array.isArray(d.p)) { o.st = d; o.tgt.set(+d.p[0] || 0, +d.p[1] || 0, +d.p[2] || 0); o.face = +d.f || 0; o.sp = +d.sp || 0; o.air = !!d.air; }
  else if (d.t === 'look' && d.look) {
    o.look = d.look;
    // style (glam/cute) or girl/guy changes the body, so rebuild; otherwise just re-dress
    if ((d.look.style || 'glam') !== (o.a.look.style || 'glam') || (d.look.body || 'girl') !== (o.a.look.body || 'girl') || JSON.stringify(d.look.face || {}) !== JSON.stringify(o.a.look.face || {})) {
      const n = new G.Avatar(d.look, o.name, o.tc);
      G.scene.remove(o.a.g); o.a = n; o.g = n.g; o.say = null; G.scene.add(n.g); n.g.position.copy(o.pos);
    } else { try { o.a.dress(d.look); } catch (e) { } }
  }
  else if (d.t === 'emo' && typeof d.id === 'string') { o.a.play(d.id); if (d.id === 'magic' || d.id === 'cheer') G.burst(o.pos.clone().add(new G.THREE.Vector3(0, 1.2, 0)), '#ffd23f', 30, 2.5, .18); }
  else if (d.t === 'say' && SAY.includes(d.text)) G.friendBubble(o, d.text);
  else if (d.t === 'cake') for (const f of netFns) try { f(id, o.name, d); } catch (e) { }
}

G.onTick.push(dt => {
  for (const o of others.values()) {
    o.pos.lerp(o.tgt, Math.min(1, dt * 10));
    if (o.pos.distanceTo(o.tgt) > 8) o.pos.copy(o.tgt);
    o.a.g.position.copy(o.pos);
    o.a.update(dt, o.sp, o.air);
    o.cur = G.angDamp(o.cur ?? o.face, o.face, Math.min(1, dt * 12));
    o.a.g.rotation.y = o.cur + (o.a.spinY || 0);
    if (o.say) { o.sayT -= dt; if (o.sayT < 0) { o.g.remove(o.say); o.say = null; } }
  }
  if (myBubble.say) { myBubble.sayT -= dt; if (myBubble.sayT < 0) { myBubble.g.remove(myBubble.say); myBubble.say = null; } }
  if (!role) return;
  // my moves, outfit and actions
  sendT -= dt;
  if (sendT <= 0) { sendT = .1; send(stateMsg()); }
  const a = G.av();
  if (a.emote && a.emote !== lastEmote) { lastEmote = a.emote; if (a.emote.t < .2) send({ t: 'emo', id: a.emote.id }); }
});
// a phone that locks or loses signal can vanish without saying bye
let shownAt = 0;
document.addEventListener('visibilitychange', () => { if (!document.hidden) shownAt = performance.now(); });
setInterval(() => {
  if (!role) return; const now = performance.now();
  if (document.hidden || now - shownAt < 6000) return;
  if (role === 'host') { for (const id of [...conns.keys()]) { const o = others.get(id); if (o && now - o.heard > 20000) { try { conns.get(id).close(); } catch (e) { } dropGuest(id); } } }
  else if (others.size && [...others.values()].every(o => now - o.heard > 20000)) { leave(true); status = 'Lost the connection to your friend. Join again with the code.'; G.toast('Lost the connection 😢'); render(); }
}, 2000);
setInterval(() => { if (!role) return; const l = JSON.stringify(G.SAVE.look); if (l !== lastLook) { if (lastLook) send({ t: 'look', look: G.SAVE.look }); lastLook = l; } }, 700);

/* ---------- invite links: ?room=CODE ---------- */
if (urlRoom) {
  const card0 = $('#welcome .card'), play = $('#play');
  if (card0 && play) {
    const n = document.createElement('div'); n.id = 'wroom'; n.textContent = `👭 You’re invited to room ${urlRoom}!`;
    play.before(n); play.textContent = '▶ Play with my friend';
    play.addEventListener('click', () => setTimeout(() => joinRoom(urlRoom), 400));
  }
}
