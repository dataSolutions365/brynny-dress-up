/* ================= 🆕 WHAT'S NEW =================
   After an update, the first time someone opens the 3D world they get a little "What's new" card,
   in short, kid-friendly words, listing only the notes they haven't seen yet.
   Every note is remembered on its own (SAVE.wnSeenK, by its words), so a note added later the same day still shows.
   Places that are new (or have something new) get a red NEW tag on the map and minimap until the player goes there
   (SAVE.wnGone), or until the note's update is NEW_DAYS old.

   EVERY UPDATE A PLAYER WOULD NOTICE ADDS A NOTE (a GitHub check asks for one when 3d/ changes).
   Put it in the entry for today's date at the TOP of WHATS_NEW (start a new entry {v:'YYYY-MM-DD',notes:[...]} if today's isn't there).
   Each note is {e: emoji, t: 'short sentence a kid can read'}. Optional:
     go:  a place id from ZONES (02-island.js): the note gets a "Show me" button and the place gets a NEW tag
     hol: a holiday id (seasons.js): the note only shows during that holiday
   Changing a note's words makes it show again as new, so only reword one when there's really something new to say.
   (old:1 marks the notes from the very first card, which players who saw that card have already seen.)
   Reopen it any time from ⚙️ Settings. In tests (navigator.webdriver) it doesn't pop up by itself, unless the page has ?wn=1. */
const WHATS_NEW=[
  {v:'2026-11-07',notes:[
    {e:'🦖',t:'Visit Dino Valley! Cross the bridge behind the Barber Shop to see a real-looking T. rex, raptors, a triceratops and more.',go:'dino'},
    {e:'🦕',t:'Your dinosaurs moved out of the barn and into Dino Valley. The Happy Barn is just for farm animals now.',go:'dino'},
    {e:'🥚',t:'Step on the glowing footprint by the Dino Keeper\'s hut to take care of your dinosaurs or adopt a new one.',go:'dino'},
    {e:'🏆',t:'Earn a big grown-up dinosaur to ride: a T. rex, triceratops, brachiosaurus, stegosaurus, raptor, Parasaurolophus or pteranodon! See the new 🦖 Dino tab in ⭐ Star Challenges.',go:'dino'},
    {e:'🦴',t:'Dig for fossils at the Fossil Dig in Dino Valley! Find a T. rex tooth, a raptor feather, and maybe rare golden amber.',go:'dino'},
    {e:'🎺',t:'Meet a Parasaurolophus that honks through its crest, and a pteranodon. Your crested dino and pterodactyl look real now too!',go:'dino'},
    {e:'🐉',t:'Dragons look real now! Earn Draco the great dragon with the hardest 🦖 Dino challenges and fly him over the island.',go:'dino'},
  ]},
  {v:'2026-11-06',notes:[
    {e:'🏀',t:'Play a 3-on-3 basketball game! Pick two teammates, pass the ball and beat the Bears.',go:'court'},
    {e:'⚾',t:'The Wiffle Ball Field is now a real Baseball Field! Play with real teams in uniforms, a catcher, and pitches like curveballs.',go:'wiffle'},
    {e:'⚽',t:'Play a 3-on-3 soccer match with goalies at the Soccer Field!',go:'soccer'},
    {e:'🏊',t:'Swimming looks real now! Your arms reach forward and pull back like a real swimmer, and you float with your head up.'},
    {e:'🐶',t:'Your pet swims right next to you in the water now, instead of walking on top of it.'},
    {e:'🏄',t:'The wave pool is twice as big! Grab a surfboard at the new Surf Shack and ride the waves.',go:'water'},
    {e:'🐷',t:'In a Round-up, a green arrow and a glowing light show you where to take each animal home.',go:'barn'},
    {e:'⛰️',t:'No more getting stuck on Lookout Mountain! Tap 🥾 Back to the trail if you wander off.',go:'mountain'},
    {e:'🪂',t:'Parachutes always land safely now, never under the ground or a bridge.',go:'airfield'},
    {e:'❄️',t:'The Snowball and Snowman buttons only show up where there is snow.',hol:'christmas'},
    {e:'⚽',t:'Play soccer at the new Soccer Field! Take penalty kicks, hit targets, do keepy-uppies or play 1-on-1 with Kai.',go:'soccer',old:1},
    {e:'🏈',t:'Play flag football on the Soccer Field, and suit up in a real football uniform!',go:'soccer',old:1},
    {e:'⛄',t:'Tap ⛄ Snowman, then walk in the snow to roll big snowballs and stack them into a snowman!',hol:'christmas',old:1},
    {e:'🎶',t:'The town plays a playlist now: lots of songs, one after another.',old:1},
    {e:'🦦',t:'Ollie the otter got fixed! His head is straight now. Swim out from the Beach to say hi.',go:'beach',old:1},
  ]},
];
const NEW_DAYS=30;// how long a place keeps its NEW tag after an update
const WN_MAX=16;// at most this many notes on the card at once (newest first; the list scrolls)
// a note's key is made from its words, so a new or reworded note counts as unseen
const wnKey=n=>{let h=5381;const s=n.e+n.t;for(let i=0;i<s.length;i++)h=(h*33+s.charCodeAt(i))>>>0;return h.toString(36);};
const wnAll=()=>{const a=[];for(const u of WHATS_NEW)for(const n of u.notes)a.push({n,v:u.v,k:wnKey(n)});return a;};
// players from before notes were remembered one by one: the first card's notes (old:1) count as seen,
// and the places they already went to (SAVE.wnVisit) as visited
if(!SAVE.wnSeenK){SAVE.wnSeenK=[];SAVE.wnGone=SAVE.wnGone||[];
  for(const {n,k} of wnAll()){if(!n.old)continue;if(SAVE.wnSeen)SAVE.wnSeenK.push(k);if(n.go&&SAVE.wnVisit&&SAVE.wnVisit[n.go])SAVE.wnGone.push(k);}
  persist();}
if(!SAVE.wnGone)SAVE.wnGone=[];
const wnHol=n=>!n.hol||!!(window.__season&&window.__season.on&&window.__season.on(n.hol));
const wnDays=v=>(Date.now()-new Date(v+'T12:00:00').getTime())/864e5;
// the notes this player hasn't seen yet (newest first)
const wnUnseen=()=>wnAll().filter(o=>wnHol(o.n)&&!SAVE.wnSeenK.includes(o.k));
// places that get a NEW tag: named by a recent note whose place they haven't been to since
let wnTagCache=null,wnTagT=0;
function wnTags(){const now=performance.now();if(wnTagCache&&now-wnTagT<1000)return wnTagCache;wnTagT=now;const s=new Set();
  for(const o of wnAll())if(o.n.go&&wnDays(o.v)<=NEW_DAYS&&wnHol(o.n)&&!SAVE.wnGone.includes(o.k))s.add(o.n.go);
  return wnTagCache=s;}
const isNewZone=id=>wnTags().has(id);
// the red NEW tag, drawn on the map (26-map.js calls this for each place)
function drawNewTag(x,px,py,s){const p=1+Math.sin(performance.now()/260)*.06;x.save();x.translate(px,py);x.scale(p,p);
  x.font=`800 ${Math.round(s)}px system-ui,-apple-system,sans-serif`;x.textAlign='center';x.textBaseline='middle';
  const w=x.measureText('NEW').width+s*.8,h=s*1.35;x.beginPath();x.roundRect?x.roundRect(-w/2,-h/2,w,h,h/2):x.rect(-w/2,-h/2,w,h);
  x.fillStyle='#ff3b6b';x.fill();x.lineWidth=Math.max(1.5,s*.16);x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.fillText('NEW',0,s*.06);x.restore();}
// going to a place clears its tag
let wnZone=null;
// the 🗺️ Map button wears a NEW tag too while somewhere on the map has one
let wnMini=null;
onTick.push(()=>{const m=wnTags().size>0;if(m!==wnMini){wnMini=m;$('#mini').classList.toggle('hasNew',m);}
  if(!started||curZone===wnZone)return;wnZone=curZone;if(!curZone||!isNewZone(curZone.id))return;
  for(const o of wnAll())if(o.n.go===curZone.id&&!SAVE.wnGone.includes(o.k))SAVE.wnGone.push(o.k);wnTagCache=null;persist();});
// the card
const wnEl=document.createElement('div');wnEl.className='modal';wnEl.id='whatsNew';
wnEl.innerHTML='<div class="card" id="wnCard"></div>';document.body.appendChild(wnEl);
let wnShown=null;
function openWhatsNew(all){let list=all?[]:wnUnseen();if(!list.length)list=wnAll().filter(o=>wnHol(o.n));list=list.slice(0,WN_MAX);
  const notes=list.map(o=>o.n);if(!notes.length)return false;
  wnShown=list;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  $('#wnCard').innerHTML=`<div class="wnTop">🆕</div><h2>What's new!</h2><p class="wnSub">Here's what we added since you last played:</p><ul id="wnList">`+
    notes.map((n,i)=>{const z=n.go&&Z[n.go];return `<li><b>${n.e}</b><span>${n.t}</span>${z?`<button class="wnGo" data-wn="${i}">🗺️ Show me</button>`:''}</li>`;}).join('')+
    `</ul><button class="btn" id="wnOk">Let's play! ✨</button>`;
  wnEl.classList.add('show');sfx('pop');return true;}
// closing it marks every note as seen (so a long list after a long break doesn't keep coming back)
function closeWhatsNew(){if(!wnEl.classList.contains('show'))return;wnEl.classList.remove('show');
  for(const o of wnUnseen())SAVE.wnSeenK.push(o.k);if(WHATS_NEW.length)SAVE.wnSeen=WHATS_NEW[0].v;persist();}
wnEl.onclick=e=>{if(e.target===wnEl||e.target.id==='wnOk'){closeWhatsNew();return;}
  const b=e.target.closest('[data-wn]');if(!b)return;const n=wnShown[+b.dataset.wn]&&wnShown[+b.dataset.wn].n,z=n&&Z[n.go];closeWhatsNew();if(!z)return;
  if(curZone===z){toast(`You're already at ${zLabel(z)}! ✨`);return;}
  if(fastPassAsk(z))return;// 🎟️ zip there or follow the arrow (26i-fast-pass.js)
  setDest(z);sfx('star');toast(`Follow the pink arrow on the map to ${zLabel(z)} 💗`);};
// pops up once, a moment after tapping Play, when there's an update they haven't seen
const wnAuto=()=>!navigator.webdriver||/[?&]wn=1\b/.test(location.search);
$('#play').addEventListener('click',()=>setTimeout(()=>{if(wnAuto()&&wnUnseen().length&&!closetOpen&&!mapOpen)openWhatsNew();},1200));
// ⚙️ Settings has a button to see it again
{const b=document.createElement('button');b.className='btn ghost';b.id='setNew';b.style.cssText='display:block;width:calc(100% - 8px);margin-top:10px';b.textContent="🆕 What's new";
  $('#setClose').before(b);b.onclick=()=>{$('#settings').classList.remove('show');openWhatsNew(true);};}
window.__whatsNew={WHATS_NEW,open:openWhatsNew,close:closeWhatsNew,tags:()=>[...wnTags()],unseen:()=>wnUnseen().map(o=>o.k),key:wnKey};
