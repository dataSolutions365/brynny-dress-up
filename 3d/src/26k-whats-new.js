/* ================= 🆕 WHAT'S NEW =================
   After an update, the first time someone opens the 3D world they get a little "What's new" card,
   in short, kid-friendly words. It only shows once per update (SAVE.wnSeen keeps the newest update they saw).
   Places that are new (or have something new) get a red NEW tag on the map and minimap until the player goes there
   (SAVE.wnVisit), or until the update is NEW_DAYS old.

   TO ADD NOTES FOR AN UPDATE: put a new entry at the TOP of WHATS_NEW with today's date as `v` ('YYYY-MM-DD').
   Each note is {e: emoji, t: 'short sentence a kid can read'}. Optional:
     go:  a place id from ZONES (02-island.js): the note gets a "Show me" button and the place gets a NEW tag
     hol: a holiday id (seasons.js): the note only shows during that holiday
   Keep it to about 3 to 6 notes, one short sentence each.
   Reopen it any time from ⚙️ Settings. In tests (navigator.webdriver) it doesn't pop up by itself, unless the page has ?wn=1. */
const WHATS_NEW=[
  {v:'2026-11-06',notes:[
    {e:'🏀',t:'Play a 3-on-3 basketball game! Pick two teammates, pass the ball and beat the Bears.',go:'court'},
    {e:'🏊',t:'Swimming looks real now! Your arms reach forward and pull back like a real swimmer, and you float with your head up.'},
    {e:'⚽',t:'Play soccer at the new Soccer Field! Take penalty kicks, hit targets, do keepy-uppies or play 1-on-1 with Kai.',go:'soccer'},
    {e:'🏈',t:'Play flag football on the Soccer Field, and suit up in a real football uniform!',go:'soccer'},
    {e:'⚾',t:'Wiffle Ball has a new camera, so you can see the ball better when you bat and catch.',go:'wiffle'},
    {e:'⛄',t:'Tap ⛄ Snowman, then walk in the snow to roll big snowballs and stack them into a snowman!',hol:'christmas'},
    {e:'🎶',t:'The town plays a playlist now: lots of songs, one after another.'},
    {e:'🦦',t:'Ollie the otter got fixed! His head is straight now. Swim out from the Beach to say hi.',go:'beach'},
  ]},
];
const NEW_DAYS=30;// how long a place keeps its NEW tag after an update
if(!SAVE.wnVisit)SAVE.wnVisit={};
const wnDays=v=>(Date.now()-new Date(v+'T12:00:00').getTime())/864e5;
const wnHol=n=>!n.hol||!!(window.__season&&window.__season.on&&window.__season.on(n.hol));
// the updates this player hasn't seen yet (newest first)
const wnUnseen=()=>WHATS_NEW.filter(u=>!SAVE.wnSeen||u.v>SAVE.wnSeen);
// places that get a NEW tag: named by a recent note, and not visited since that update
let wnTagCache=null,wnTagT=0;
function wnTags(){const now=performance.now();if(wnTagCache&&now-wnTagT<1000)return wnTagCache;wnTagT=now;const s=new Set();
  for(const u of WHATS_NEW){if(wnDays(u.v)>NEW_DAYS)continue;for(const n of u.notes)if(n.go&&wnHol(n)&&!(SAVE.wnVisit[n.go]>=u.v))s.add(n.go);}
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
  if(!started||curZone===wnZone)return;wnZone=curZone;if(!curZone||!WHATS_NEW.length)return;
  const v=WHATS_NEW[0].v;if(isNewZone(curZone.id)&&!(SAVE.wnVisit[curZone.id]>=v)){SAVE.wnVisit[curZone.id]=v;wnTagCache=null;persist();}});
// the card
const wnEl=document.createElement('div');wnEl.className='modal';wnEl.id='whatsNew';
wnEl.innerHTML='<div class="card" id="wnCard"></div>';document.body.appendChild(wnEl);
let wnShown=null;
function openWhatsNew(all){let ups=all?WHATS_NEW.slice(0,2):wnUnseen().slice(0,3);if(!ups.length)ups=WHATS_NEW.slice(0,1);
  const notes=[];for(const u of ups)for(const n of u.notes)if(wnHol(n))notes.push(n);if(!notes.length)return false;
  wnShown=notes;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  $('#wnCard').innerHTML=`<div class="wnTop">🆕</div><h2>What's new!</h2><p class="wnSub">Here's what we added since you last played:</p><ul id="wnList">`+
    notes.map((n,i)=>{const z=n.go&&Z[n.go];return `<li><b>${n.e}</b><span>${n.t}</span>${z?`<button class="wnGo" data-wn="${i}">🗺️ Show me</button>`:''}</li>`;}).join('')+
    `</ul><button class="btn" id="wnOk">Let's play! ✨</button>`;
  wnEl.classList.add('show');sfx('pop');return true;}
function closeWhatsNew(){if(!wnEl.classList.contains('show'))return;wnEl.classList.remove('show');if(WHATS_NEW.length&&!(SAVE.wnSeen>=WHATS_NEW[0].v)){SAVE.wnSeen=WHATS_NEW[0].v;persist();}}
wnEl.onclick=e=>{if(e.target===wnEl||e.target.id==='wnOk'){closeWhatsNew();return;}
  const b=e.target.closest('[data-wn]');if(!b)return;const n=wnShown[+b.dataset.wn],z=n&&Z[n.go];closeWhatsNew();if(!z)return;
  if(curZone===z){toast(`You're already at ${zLabel(z)}! ✨`);return;}
  if(fastPassAsk(z))return;// 🎟️ zip there or follow the arrow (26i-fast-pass.js)
  setDest(z);sfx('star');toast(`Follow the pink arrow on the map to ${zLabel(z)} 💗`);};
// pops up once, a moment after tapping Play, when there's an update they haven't seen
const wnAuto=()=>!navigator.webdriver||/[?&]wn=1\b/.test(location.search);
$('#play').addEventListener('click',()=>setTimeout(()=>{if(wnAuto()&&wnUnseen().length&&!closetOpen&&!mapOpen)openWhatsNew();},1200));
// ⚙️ Settings has a button to see it again
{const b=document.createElement('button');b.className='btn ghost';b.id='setNew';b.style.cssText='display:block;width:calc(100% - 8px);margin-top:10px';b.textContent="🆕 What's new";
  $('#setClose').before(b);b.onclick=()=>{$('#settings').classList.remove('show');openWhatsNew(true);};}
window.__whatsNew={WHATS_NEW,open:openWhatsNew,close:closeWhatsNew,tags:()=>[...wnTags()],unseen:()=>wnUnseen().map(u=>u.v)};
