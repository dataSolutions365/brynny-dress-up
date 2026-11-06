/* ================= 🐾 THE BARN ANIMALS AND THE 🚨 ROUND-UP =================
   - Four barn animals (🦆 Waddles, 🐐 Billy, 🐷 Truffle, 🐑 Woolly) live in the big meadow all round the 🐴 Happy Barn. Most of the
     time they just wander about out there (not shut in the little paddock), sniff the grass and look at you when you walk up.
     They never follow you (only the pet you adopt does). Tap 🌽 Feed next to one.
   - 🚨 Round-up (Preston's idea): tap "Start a Round-up" near the barn and the animals break out all over town. Each one runs off to one
     of its two streets (ROAM_LIST streets = the ang of a place with a path in 02-island.js, in different parts of town so they never
     bunch up) and stays out until someone catches it. A bar at the top says the Round-up is on and lists who's still out.
     Tap 🪢 Catch next to one and it walks behind you on a rope (only then, and only until the barn); walk it back to the Happy Barn.
     When all four are home the Round-up ends.
   - 👭 Friends online in your room join in by themselves: everyone hunts the same four animals, and whoever brings the most home wins
     (+40 🪙 and it counts as a win for the 🏆 rides; everyone else +15 🪙). Playing alone works too (+40 🪙 when they're all home).
     Messages go through the room as {t:'roam', a, r (which Round-up)}: go {seed}, catch {nm}, let {nm}, home {nm}, st (the whole state,
     every few seconds, so a friend who joins late or missed a message catches up). Two people catching the same animal at once:
     the lower id keeps it, on every phone.
   - did('roamhome', name) for each one you bring home, did('roundup', place) at the end (place 0 = you won against friends, -1 alone).
     The ⭐ challenges are in the 🗺️ Explore tab of challenges.js.
   - 🦁 Safari Round-up: the same game from the 🦒 Safari Zoo, with four safari runaways (Ziggy the zebra, Kito the okapi, Twiga the baby
     giraffe and Tembo the baby elephant, in SAFARI_LIST). They live in the zoo with the others (hidden copies until a Safari Round-up starts),
     and you walk them back to the zoo. Only one Round-up runs at a time (RU.grp is 'barn' or 'zoo').
   - 🌪️ The All-Animal Round-up (Preston's idea): tap "Start the All-Animal Round-up!" by the ✨ Sparkle Studio in the middle of town and
     EVERY animal breaks out at once (the barn four, every animal in the Safari Zoo, and every polar one when ❄️ Polar Ice is there), right
     round you so you see lots of them. They don't keep to the streets: they run all over town (mode 'loose', any grass or path you could
     walk on, looseSpot), and when you get close they dash away (flee), then stop for a breather (tired) and that's your chance. You can walk
     up to 3 on ropes at once (ropeMax), and each one goes home to its own place (barn, zoo or Polar Ice). A timer runs; RS.allBest is your best.
   - The safari and polar runaways are the zoo's and Polar Ice's own animals (ZA, IA), not copies: while one is out (a.esc) its pen is
     empty and its own place stops moving it; back home it goes into its pen again (penOut/penIn). The barn four live in the meadow. */
const ROAM_LIST=[
  {k:'duck',nm:'Waddles',food:[['🌽','corn'],['🍉','melon']],streets:[330,0],say:['Quack quack! 🦆','*waddle waddle*','I\'m exploring! 🗺️']},
  {k:'goat',nm:'Billy',food:[['🍎','apple'],['🌾','hay']],streets:[30,90],say:['Meeeh! 🐐','*hop hop*','Catch me if you can!']},
  {k:'pig',nm:'Truffle',food:[['🍎','apple'],['🥔','potato']],streets:[150,180],say:['Oink oink! 🐷','*sniff sniff*','Smells like snacks! 💗']},
  {k:'lamb',nm:'Woolly',food:[['🍀','clover'],['🥕','carrot']],streets:[240,270],say:['Baaa! 🐑','*fluffy wiggle*','Hello, friend! 💖']}].map(o=>({...o,grp:'barn'}));
// 🦁 the zoo's own animals are the safari runaways (ZA in 24d-barn.js): the very same ones, no copies, so the pen really empties.
// Each gets a name (the same on every phone, for friends online). sec: the four that break out in a Safari Round-up.
const ZOO_NAMES={zebra:['Ziggy','Zuri'],giraffe:['Jengo','Twiga'],rhino:['Kifaru','Rocky'],okapi:['Kito'],elephant:['Ella','Tembo'],lion:['Leo'],gorilla:['Bongo'],
  hippo:['Hugo'],cheetah:['Dash'],tiger:['Sher'],gator:['Chomp']},SAFARI_SEC=['Ziggy','Kito','Twiga','Tembo'];
const POLAR_NAMES={polarbear:['Nanook','Kiki'],walrus:['Wally'],penguin:['Pebble','Waddle','Flipper','Tux'],arcticfox:['Frost'],arcticwolf:['Tundra'],snowyowl:['Hoot']};
const realList=(list,grp,names)=>{const n={};return list.map((a,i)=>{const F=FK[a.k],k=(n[a.k]=(n[a.k]||0)+1)-1,
  nm=(names[a.k]||[])[k]||`${F.n}${k?' '+(k+1):''}`;
  return {k:a.k,nm,e:F.e,grp,real:a,sec:grp==='zoo'?SAFARI_SEC.includes(nm):true,food:F.food,say:F.say,streets:[[330,0],[30,90],[150,180],[240,270]][i%4]};});};
const SAFARI_LIST=realList(ZA,'zoo',ZOO_NAMES);
// ❄️ the polar animals (IA in 24m-arctic.js), once Polar Ice is in town
const POLAR_LIST=typeof IA!=='undefined'&&Z.arctic?realList(IA,'arctic',POLAR_NAMES):[];
const RU_ZONE={barn:BZ,zoo:Z.zoo},RU_NAME={barn:'🐴 Happy Barn',zoo:'🦒 Safari Zoo'};
if(POLAR_LIST.length){RU_ZONE.arctic=Z.arctic;RU_NAME.arctic='❄️ Polar Ice';}
const ROAM_RING=7.15,ROAM_REACH=2.6,ROAM_SPD=.85,RU_SPD=1.35,RU_HOME=6;// RU_HOME: how close to the barn's fence counts as home
SAVE.roam||={};const RS=SAVE.roam;RS.fed||={};
// where each street stops: just in front of the first place along it
function roamEnd(ang){const z=ZONES.filter(z=>z.d&&!z.nopath&&Math.abs(z.ang-ang)<.5).sort((a,b)=>a.d-b.d)[0];return z?z.d-z.r-1.5:24;}
// a spot on the street at angle ang (degrees), d out from the middle, side steps to the left or right of the middle of the street
function roamSpot(ang,d,side=0){const a=deg(ang);return {x:Math.sin(a)*d+Math.cos(a)*side,z:Math.cos(a)*d-Math.sin(a)*side};}
// a spot in the meadow round the barn: outside its fence, on the island, clear of other places and of trees and posts.
// near = the angle round the barn to stay close to, so the walk there doesn't cut through the paddock
function meadowSpot(near){for(let i=0;i<80;i++){const a=near==null?Math.random()*Math.PI*2:near+(Math.random()-.5)*2,r=BZ.fence+2+Math.random()*9,
    x=BZ.x+Math.sin(a)*r,z=BZ.z+Math.cos(a)*r;
    if(Math.hypot(x,z)>R-3)continue;if(ZONES.some(o=>o!==BZ&&o.d&&Math.hypot(x-o.x,z-o.z)<o.r+2))continue;if(obs.some(o=>o.r>0&&Math.hypot(x-o.x,z-o.z)<o.r+.6))continue;
    return {x,z};}
  return {x:BZ.x+BZ.fence+3,z:BZ.z};}
const meadowAng=c=>Math.atan2(c.pos.x-BZ.x,c.pos.z-BZ.z);
const ROAM=ROAM_LIST.concat(SAFARI_LIST,POLAR_LIST).map(o=>{let a;
  if(o.real){a=o.real;const sc=a.g.scale.y||1,tag=sprite(labelTex(o.nm,{size:58,fg:'#8a5a3b',bg:'rgba(255,255,255,.88)',border:null}),.8/sc,.2/sc);tag.position.y=a.h/sc+.15/sc;tag.visible=false;a.g.add(tag);
    return {...o,a,tag,F:FK[o.k],pos:a.pos.clone(),face:0,mode:'pen',flee:0,tired:0,cool:0,stuck:0,cT:0,tgt:null,wp:[],wait:0,street:o.streets[0],lookT:0,happy:0,owner:''};}
  a=new FarmAnimal(o.k);const j=obs.indexOf(a.ob);if(j>=0)obs.splice(j,1);a.ob.r=0;a.dust.forEach(d=>d.visible=false);
  const sc=o.sc||1,tag=sprite(labelTex(o.nm,{size:58,fg:'#8a5a3b',bg:'rgba(255,255,255,.88)',border:null}),.8/sc,.2/sc);tag.position.y=a.h+.15/sc;a.g.add(tag);
  if(sc!==1){a.g.scale.setScalar(sc);a.h*=sc;a.rad*=sc;a.size*=sc;a.baby=true;}
  const c={...o,a,F:FK[o.k],e:o.e||FK[o.k].e,pos:new THREE.Vector3(),face:Math.random()*6,mode:'meadow',flee:0,tired:0,cool:0,stuck:0,cT:0,tgt:null,wp:[],wait:Math.random()*3,street:o.streets[0],lookT:0,happy:0,owner:''};
  const s=meadowSpot();c.pos.set(s.x,0,s.z);a.pos.copy(c.pos);scene.add(a.g);return c;});
// a real zoo or polar animal leaves its pen (esc: its own place stops moving it) or goes back in
function penOut(c){const a=c.a;if(!c.real||a.esc)return;a.esc=true;a.ob.r=0;a.g.visible=true;c.tag.visible=true;c.pos.set(a.g.position.x,0,a.g.position.z);if(c.real.sw&&c.real.sw.rip)c.real.sw.rip.visible=false;}
function penIn(c){const a=c.a;if(!c.real)return;a.esc=false;c.tag.visible=false;c.mode='pen';a.vy=a.y=0;[a.lx,a.lz]=a.perch&&typeof ICE!=='undefined'?[ICE.perch[0],ICE.perch[1]]:a.spot(a.rad);placeFarm(a);/* the snowy owl goes back up on her rock */a.g.visible=true;}
// the animals in the Round-up that's on (or the last one): in the All-Animal one, every one of them
const ruSet=()=>RU.grp==='all'?ROAM:ROAM.filter(c=>c.grp===RU.grp&&c.sec!==false);
const ruIn=c=>RU.grp==='all'||(c.grp===RU.grp&&c.sec!==false);
// 🌪️ All-Animal Round-up: anywhere you could walk counts (on the island, not in the water, not inside a tree, post or wall)
const looseOk=(x,z)=>Math.hypot(x,z)<R-2.5&&!obs.some(o=>o.r>0&&Math.hypot(x-o.x,z-o.z)<o.r+.7);
function looseSpot(c,rr=Math.random){for(let i=0;i<40;i++){const a=rr()*Math.PI*2,d=6+rr()*16,x=c.pos.x+Math.sin(a)*d,z=c.pos.z+Math.cos(a)*d;if(looseOk(x,z))return {x,z};}
  const a=rr()*Math.PI*2,d=10+rr()*25;return {x:Math.sin(a)*d,z:Math.cos(a)*d};}
const RU_ALL_SPD=2.3,RU_FLEE_SPD=4.2,RU_FLEE_R=4.5;
const myRopes=()=>ROAM.filter(c=>c.mode==='rope').sort((a,b)=>a.cT-b.cT);
const ropeMax=()=>RU.grp==='all'?3:1;
const canCatch=c=>c&&(c.mode==='street'||c.mode==='loose');
const allOn=()=>typeof PE!=='undefined'&&PE.on;// ❄️ a Polar escape is on (24m2-arctic-escape.js): one chase at a time
const mmss=t=>{t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};
const roamByName=nm=>ROAM.find(c=>c.nm===nm);
// a walk along its street during a Round-up: out to the end, a sniff around, back to the plaza, round the ring to the next street
function roamPlan(c,from){const wp=c.wp,end=roamEnd(c.street),side=()=>(Math.random()-.5)*.9;
  for(let d=(from!=null?from+5:10);d<end;d+=5)wp.push({...roamSpot(c.street,d,side()),w:Math.random()<.2?1.5+Math.random()*2:0});
  wp.push({...roamSpot(c.street,end,side()),w:3+Math.random()*4});
  for(let d=end-5;d>9;d-=5)wp.push({...roamSpot(c.street,d,side()),w:0});
  const next=Math.random()<.75?c.streets.find(s=>s!==c.street)??c.street:c.street;
  const diff=((next-c.street+540)%360)-180,n=Math.max(1,Math.ceil(Math.abs(diff)/12));
  for(let i=0;i<=n;i++)wp.push({...roamSpot(c.street+diff*i/n,ROAM_RING+(Math.random()-.5)*.6),w:i===n?1+Math.random()*2:0});
  c.next=next;}
// back on its street from wherever it is (after it's let go): the nearer of its two streets, at about the same distance out
function roamToStreet(c){const P=c.pos,d0=Math.hypot(P.x,P.z),ang=Math.atan2(P.x,P.z)*180/Math.PI;
  c.street=c.streets.reduce((b,s)=>Math.abs(((s-ang+540)%360)-180)<Math.abs(((b-ang+540)%360)-180)?s:b);c.next=c.street;
  const d=Math.max(9,Math.min(roamEnd(c.street)-1,d0));c.wp=[{...roamSpot(c.street,d),w:0}];roamPlan(c,d);}

/* ---------- 🚨 the Round-up ---------- */
const RU={on:false,grp:'barn',r:'',seed:0,home:{},sc:{},names:{},stT:0,endT:0,done:{}};
const ruNet=()=>{const n=window.__net;return n&&n.live()?n:null;};
const ruMe=()=>{const n=window.__net;return (n&&n.id&&n.id())||'me';};
const ruEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
function ruSend(d){const n=ruNet();if(n)try{n.send(Object.assign({t:'roam',r:RU.r},d));}catch(e){}}
const ruRand=seed=>{let s=(Math.abs(Math.floor(seed))%2147483646)+1;return ()=>((s=(s*16807)%2147483647)-1)/2147483646;};
// everyone starts the same Round-up from the same seed, so the animals break out to the same spots on every phone
function ruStart(r,seed,who,whoName,grp='barn',at=null){if(RU.on||(!RU_ZONE[grp]&&grp!=='all')||allOn())return;Object.assign(RU,{on:true,grp,r,seed,home:{},sc:{},names:{},stT:0,endT:0,t0:roamT,secT:0});
  RU.names[ruMe()]=SAVE.name||'You';if(who&&who!==ruMe())RU.names[who]=String(whoName||'Friend').slice(0,16);
  const rr=ruRand(seed),set=ruSet();
  // they burst out all round whoever started it (at), so you see a whole crowd of them, then they scatter every which way
  const ax=at?at.x:0,az=at?at.z:Z.studio.r+3;RU.at={x:ax,z:az};
  if(grp==='all')set.forEach((c,i)=>{
    let s=null;for(let k=0;k<30&&!s;k++){const a=(i+rr()*.8)/set.length*Math.PI*2,d=2.5+rr()*5+k*.2,x=ax+Math.sin(a)*d,z=az+Math.cos(a)*d;if(looseOk(x,z)&&Math.hypot(x,z)>Z.studio.r+.5)s={x,z};}
    s||=looseSpot({pos:{x:ax,z:az}},rr);penOut(c);c.pos.set(s.x,0,s.z);c.mode='loose';c.owner='';c.wait=rr()*.6;c.lookT=0;c.flee=c.tired=c.cool=c.stuck=0;
    c.cool=1+rr()*2;c.tgt=looseSpot(c,rr);c.face=Math.atan2(c.tgt.x-s.x,c.tgt.z-s.z);c.a.g.visible=true;burst(new THREE.Vector3(s.x,.5,s.z),'#ffd23f',16,1.4);});
  else for(const c of set){burst(c.a.g.position.clone().add(new THREE.Vector3(0,.5,0)),'#ffd23f',16,1.4);penOut(c);
    c.mode='street';c.owner='';c.wait=0;c.lookT=0;c.street=c.streets[Math.floor(rr()*2)];const d=12+rr()*(roamEnd(c.street)-15),s=roamSpot(c.street,d,(rr()-.5)*.8);
    c.pos.set(s.x,0,s.z);c.wp=[];roamPlan(c,d);c.face=deg(c.street);c.a.g.visible=true;}
  const home=RU_NAME[grp],n=ruSet().length;
  if(grp==='all'){sfx('tada');banner('🌪️ All-Animal Round-up! EVERYONE broke out!');
    setTimeout(()=>toast(who&&who!==ruMe()?`👭 ${whoName||'A friend'} let all ${n} animals out! Catch them 🪢 and walk each one to its home`:`All ${n} animals are loose! Sneak up, catch them 🪢 (up to 3 at once) and walk each one to its home`),1900);
    did('roundstart');ruBar();roamBtnKey='?';return;}
  sfx('tada');banner(grp==='zoo'?'🚨 Safari Round-up! The zoo animals broke out!':'🚨 Round-up! The barn animals broke out!');
  setTimeout(()=>toast(who&&who!==ruMe()?`👭 ${whoName||'A friend'} started a Round-up! Catch the runaways 🪢 and bring them back to the ${home}`:`Catch all ${n} runaways 🪢 and bring them back to the ${home}. Look on the minimap!`),1900);
  did('roundstart');ruBar();roamBtnKey='?';}
function ruBegin(grp){if(RU.on)return;const r=ruMe().slice(0,8)+'-'+Date.now().toString(36),seed=1+Math.floor(Math.random()*2e9),P=player.pos;
  // they burst out just in front of you (the way the camera looks), so the screen fills up with them
  let fx=P.x-Math.sin(cam.yaw)*6,fz=P.z-Math.cos(cam.yaw)*6;if(Math.hypot(fx,fz)<Z.studio.r+3||!looseOk(fx,fz)){fx=P.x;fz=P.z;}
  const at={x:+fx.toFixed(1),z:+fz.toFixed(1)};
  ruStart(r,seed,null,null,grp,at);ruSend({a:'go',seed,g:grp,...at});}
function ruCatch(c){if(!RU.on||!canCatch(c)||!ruIn(c)||myRopes().length>=ropeMax())return;c.mode='rope';c.owner=ruMe();c.cT=roamT;c.wp=[];c.wait=0;c.flee=c.tired=0;c.a.speak(rnd(c.say));sfx('pop');
  const n=myRopes().length;toast(`🪢 You caught ${c.nm}! Walk ${c.nm} back to the ${RU_NAME[c.grp]}`+(RU.grp==='all'&&n<3?` (you can hold ${3-n} more)`:''));did('roamcatch',c.nm);if(n>=3)did('roamtrio',n);ruSend({a:'catch',nm:c.nm});ruBar();roamBtnKey='?';}
function ruLetGo(c,quiet){if(!c||(c.mode!=='rope'&&c.mode!=='friend'))return;const mine=c.mode==='rope';c.owner='';
  if(RU.grp==='all'){c.mode='loose';c.tgt=looseSpot(c);c.flee=1;c.cool=0;}else{c.mode='street';roamToStreet(c);}
  if(mine&&!quiet){sfx('pop');toast(`${c.e} ${c.nm} runs off again!`);ruSend({a:'let',nm:c.nm});}ruBar();roamBtnKey='?';}
// brought home (by you or a friend): a barn animal trots back into the meadow, a safari one goes back into the zoo
function ruHome(c,who,quiet){if(!RU.on||RU.home[c.nm])return;RU.home[c.nm]=who;RU.sc[who]=(RU.sc[who]||0)+1;c.owner='';c.wait=0;
  if(c.real){burst(c.a.g.position.clone().add(new THREE.Vector3(0,.5,0)),'#ffd23f',20,1.5);penIn(c);}else{c.mode='meadow';c.tgt=meadowSpot(meadowAng(c));}
  if(who===ruMe()){burst(c.a.g.position.clone().add(new THREE.Vector3(0,.4,0)),'#ffd23f',24,1.6);floaties(c.a.g.position.clone().add(new THREE.Vector3(0,c.a.h+.2,0)),'🏠',5);sfx('tada');
    did('roamhome',c.nm);ruSend({a:'home',nm:c.nm});const left=ruSet().length-Object.keys(RU.home).length;
    if(left)toast(`🏠 ${c.nm} is back home! ${left} still out`);}
  else if(!quiet)toast(`🏠 ${RU.names[who]||'A friend'} brought ${c.nm} home`);
  ruBar();roamBtnKey='?';if(Object.keys(RU.home).length>=ruSet().length)ruEnd();}
function ruEnd(){const me=ruMe(),ids=Object.keys(RU.names),friends=ids.filter(id=>id!==me),mine=RU.sc[me]||0;
  const best=Math.max(0,...ids.map(id=>RU.sc[id]||0)),place=friends.length?ids.filter(id=>(RU.sc[id]||0)>mine).length:-1;
  RU.on=false;RU.done[RU.r]=1;RU.endT=roamT||1e-3;RU.last={sc:{...RU.sc},names:{...RU.names},t:roamT-RU.t0};
  if(RU.grp==='all'){const t=RU.last.t,rec=!RS.allBest||t<RS.allBest;if(rec){RS.allBest=t;persist();}
    const won=!friends.length||(place===0&&mine===best&&mine>0);
    banner(won?(friends.length?`🏆 You won the All-Animal Round-up! ${mine} caught`:`🌪️ Everyone is home! Done in ${mmss(t)}${rec?' · new best!':''}`):`🌪️ Everyone is home! You caught ${mine}`);
    setTimeout(()=>earn(won?100:30,'All-Animal Round-up'),900);}
  else if(!friends.length){banner('🏠 Round-up done! Everyone is home');setTimeout(()=>earn(40,'Round-up'),900);}
  else if(place===0&&mine===best&&mine>0){banner(`🏆 You won the Round-up! ${mine} caught`);setTimeout(()=>earn(40,'Won the Round-up'),900);}
  else{banner(`🏠 Round-up done! You caught ${mine}`);setTimeout(()=>earn(15,'Round-up'),900);}
  sfx('tada');did('roundup',place);did('roundgrp',RU.grp);ruBar();roamBtnKey='?';}
// what friends send
function ruFromNet(id,name,d){if(!d||typeof d.a!=='string'||typeof d.r!=='string')return;id=String(id).slice(0,40);const r=d.r.slice(0,40),c=typeof d.nm==='string'?roamByName(d.nm):null;
  if(d.a==='go'||d.a==='st'){if(!RU.on&&started&&!RU.done[r]){const sd=+d.seed;if(Number.isFinite(sd))ruStart(r,sd,id,name,d.g==='zoo'||d.g==='all'||(d.g==='arctic'&&RU_ZONE.arctic)?d.g:'barn',Number.isFinite(+d.x)&&Number.isFinite(+d.z)?{x:+d.x,z:+d.z}:null);}
    if(!RU.on||r!==RU.r)return;RU.names[id]=String(name||'Friend').slice(0,16);
    if(d.a==='st'){for(const [nm,w] of Object.entries(d.h||{})){const a=roamByName(nm);if(a&&ruIn(a)&&typeof w==='string'&&!RU.home[nm])ruHome(a,w.slice(0,40),true);}
      for(const [nm,w] of Object.entries(d.c||{})){const a=roamByName(nm);if(a&&ruIn(a)&&w===id&&canCatch(a)){a.mode='friend';a.owner=id;}}
      ruBar();}
    return;}
  if(!RU.on||r!==RU.r||!c||!ruIn(c))return;RU.names[id]=String(name||'Friend').slice(0,16);
  if(d.a==='catch'){if(c.mode==='rope'){if(id<ruMe()){toast(`😮 ${RU.names[id]} caught ${c.nm} first!`);c.mode='friend';c.owner=id;}}
    else if(canCatch(c)||c.mode==='friend'){c.mode='friend';c.owner=id;}ruBar();roamBtnKey='?';}
  else if(d.a==='let'){if(c.mode==='friend'&&c.owner===id)ruLetGo(c,true);}
  else if(d.a==='home')ruHome(c,id);}
addEventListener('load',()=>{if(window.__net)window.__net.on((id,name,d)=>{if(d&&d.t==='roam')ruFromNet(id,name,d);});});

/* ---------- moving them ---------- */
let roamNear=null,roamBtnKey='',roamT=0;
const nearHome=(g,P,extra)=>{const z=RU_ZONE[g];return Math.hypot(P.x-z.x,P.z-z.z)<(z.fence||z.r)+extra;};
const ruFriend=id=>{const n=window.__net;return (n&&n.friends&&n.friends().get(id))||(RU.fake&&RU.fake[id])||null;};// fake: friends made up by the tests
function roamFollow(c,P,face,dt,k=0){const back=face+Math.PI+.6-k*1.2,r=1.2+c.a.rad+k*.45;let tx=P.x+Math.sin(back)*r,tz=P.z+Math.cos(back)*r;
  // it won't go in the water: while you swim in the canal it waits for you on the shore, still on its rope
  const td=Math.hypot(tx,tz),shore=R-.6;if(td>shore){tx*=shore/td;tz*=shore/td;}
  const dx=tx-c.pos.x,dz=tz-c.pos.z,d=Math.hypot(dx,dz);
  if(d>14){c.pos.set(tx,0,tz);return 0;}if(d>.2){const sp=Math.min(7,1+d*3),st=Math.min(d,sp*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*6));return sp;}
  c.face=angDamp(c.face,face,Math.min(1,dt*3));return 0;}
function roamStep(dt){if(!started)return;roamT+=dt;const P=player.pos,slot={};
  for(const c of ROAM){const a=c.a,dP=Math.hypot(P.x-c.pos.x,P.z-c.pos.z);if(c.mode==='pen')continue;/* at home in the zoo or at Polar Ice: its own place moves it */const vis=dP<70;a.g.visible=vis;let sp=0;
    const k=(c.mode==='rope'||c.mode==='friend')?(slot[c.owner]=(slot[c.owner]??-1)+1):0;
    if(c.mode==='rope'){sp=roamFollow(c,P,player.face,dt,k);a.graze=0;if(nearHome(c.grp,P,RU_HOME))ruHome(c,ruMe());}
    else if(c.mode==='friend'){const o=ruFriend(c.owner);if(!o)ruLetGo(c,true);else{sp=roamFollow(c,o.pos,o.cur??o.face??0,dt,k);a.graze=0;}}
    else if(c.mode==='loose')sp=looseStep(c,P,dP,dt);
    else{// on its own: when you walk up it stops and looks at you for a few seconds, then goes on its own way (it never comes after you)
      const look=dP<2.4&&c.lookT<(RU.on?2:4);if(dP<2.4)c.lookT+=dt;else if(dP>4)c.lookT=0;
      if(look){c.wait=0;c.face=angDamp(c.face,Math.atan2(P.x-c.pos.x,P.z-c.pos.z),Math.min(1,dt*4));a.graze+=(0-a.graze)*Math.min(1,dt*3);}
      else if(c.wait>0){c.wait-=dt;a.graze+=(1-a.graze)*Math.min(1,dt*2);}// sniffing around
      else if(c.mode==='street'){if(!c.wp.length){c.street=c.next;roamPlan(c);}
        const w=c.wp[0],dx=w.x-c.pos.x,dz=w.z-c.pos.z,d=Math.hypot(dx,dz);
        if(d<.12){c.wp.shift();c.wait=w.w||0;}
        else{sp=RU_SPD;const st=Math.min(d,sp*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*4));}
        a.graze+=(0-a.graze)*Math.min(1,dt*3);}
      else{// the meadow round the barn: amble to a spot, graze a while, amble on
        if(!c.tgt)c.tgt=meadowSpot(meadowAng(c));const dx=c.tgt.x-c.pos.x,dz=c.tgt.z-c.pos.z,d=Math.hypot(dx,dz);
        if(d<.15){c.tgt=null;c.wait=2+Math.random()*5;}
        else{sp=ROAM_SPD;const st=Math.min(d,sp*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;collide(c.pos,.25);c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*4));
          if(Math.hypot(c.pos.x-BZ.x,c.pos.z-BZ.z)<BZ.fence+.8){c.tgt=null;c.wait=.5;}}
        a.graze+=(0-a.graze)*Math.min(1,dt*3);}}
    if(c.happy>0){c.happy-=dt;if(a.y<=0&&Math.random()<dt*2)a.vy=2;}
    a.vy-=12*dt;a.y=Math.max(0,a.y+a.vy*dt);if(a.y<=0)a.vy=0;
    if(!vis)continue;
    c.pos.y=groundAt(c.pos.x,c.pos.z);a.pos.copy(c.pos);a.g.position.set(c.pos.x,c.pos.y+a.y,c.pos.z);a.g.rotation.y=c.face;a.update(dt,sp);}
  // the ropes: from your hand (or a friend's) to the animal on it
  ROAM.forEach((c,i)=>{const R0=ROPES[i];let h=null;
    if(c.mode==='rope')h=av.g.position;else if(c.mode==='friend'){const o=ruFriend(c.owner);if(o)h=o.pos;}
    if(!h||!c.a.g.visible){R0.visible=false;return;}
    const hv=h.clone().add(new THREE.Vector3(0,.9,0)),b=c.a.g.position.clone().add(new THREE.Vector3(0,c.a.h*.7,0));
    R0.visible=true;R0.position.copy(hv).add(b).multiplyScalar(.5);R0.scale.set(1,hv.distanceTo(b),1);R0.quaternion.setFromUnitVectors(LIMB_UP,b.sub(hv).normalize());});
  // the whole state for friends, every few seconds
  if(RU.on&&RU.grp==='all'&&(RU.secT-=dt)<0){RU.secT=1;ruBar();}// the timer
  if(RU.on&&(RU.stT-=dt)<0){RU.stT=3;const cc={};for(const c of ROAM)if(c.mode==='rope')cc[c.nm]=ruMe();ruSend({a:'st',seed:RU.seed,g:RU.grp,h:RU.home,c:cc,...(RU.at||{})});}
  if(!RU.on&&RU.endT&&roamT-RU.endT>9){RU.endT=0;ruBar();}
  roamButton();}
// 🌪️ running loose in the All-Animal Round-up: dash from spot to spot anywhere in town; get close and it bolts away from you,
// then it has to stop for a breather (that's when you can catch it), and for a little while after it won't bolt again
function looseStep(c,P,dP,dt){const a=c.a;c.cool-=dt;
  if(c.tired>0){c.tired-=dt;c.face=angDamp(c.face,Math.atan2(P.x-c.pos.x,P.z-c.pos.z),Math.min(1,dt*3));a.graze+=(.6-a.graze)*Math.min(1,dt*3);if(c.tired<=0)c.cool=2.5;return 0;}
  a.graze+=(0-a.graze)*Math.min(1,dt*4);
  if(c.flee<=0&&c.cool<=0&&dP<RU_FLEE_R){c.flee=1.2+Math.random()*.6;if(dP<12)sfx('pop');}
  let tx,tz,sp;
  if(c.flee>0){c.flee-=dt;const ang=Math.atan2(c.pos.x-P.x,c.pos.z-P.z)+Math.sin(roamT*3+c.nm.length)*.5;tx=c.pos.x+Math.sin(ang)*4;tz=c.pos.z+Math.cos(ang)*4;sp=RU_FLEE_SPD;
    if(c.flee<=0){c.tired=2.6+Math.random()*1.2;c.tgt=null;floaties(c.a.g.position.clone().add(new THREE.Vector3(0,a.h+.2,0)),'💦',3);return 0;}}
  else{if(c.wait>0){c.wait-=dt;return 0;}
    if(!c.tgt)c.tgt=looseSpot(c);tx=c.tgt.x;tz=c.tgt.z;sp=RU_ALL_SPD;}
  const dx=tx-c.pos.x,dz=tz-c.pos.z,d=Math.hypot(dx,dz);
  if(d<.3){c.tgt=null;c.wait=Math.random()<.4?.4+Math.random()*1.4:0;return 0;}
  const ox=c.pos.x,oz=c.pos.z,st=Math.min(d,sp*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;collide(c.pos,.3);
  if(!looseOk(c.pos.x,c.pos.z)&&Math.hypot(c.pos.x,c.pos.z)>=R-2.5){const m=(R-2.5)/Math.hypot(c.pos.x,c.pos.z);c.pos.x*=m;c.pos.z*=m;}// never into the water
  const moved=Math.hypot(c.pos.x-ox,c.pos.z-oz);
  if(moved<st*.3){if((c.stuck+=dt)>.4){c.stuck=0;c.tgt=looseSpot(c);}}else c.stuck=0;// bumped into a wall or a tree: off somewhere else
  c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*6));return sp;}
onTick.push(roamStep);
const ropeMat=std('#c8a46a',{roughness:.9}),ROPES=ROAM.map(()=>{const m=M(cyl(.012,.012,1,6),ropeMat,0,0,0,scene,false,false);m.visible=false;return m;});

/* ---------- buttons and the Round-up bar ---------- */
{const st=document.createElement('style');st.textContent=`
#roamBtn,#roamCatch{position:fixed;left:50%;transform:translateX(-50%);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5}
#roamBtn{bottom:calc(env(safe-area-inset-bottom) + 300px);background:linear-gradient(90deg,#f6b93b,#e58e26);box-shadow:0 6px 18px rgba(229,142,38,.45)}
#roamCatch{bottom:calc(env(safe-area-inset-bottom) + 370px);background:linear-gradient(90deg,#a1887f,#6d4c41);box-shadow:0 6px 18px rgba(109,76,65,.4)}
#roamCatch.go{background:linear-gradient(90deg,#ff6a3d,#e8336d);box-shadow:0 6px 18px rgba(232,51,109,.45)}
#roamBtn:active,#roamCatch:active{transform:translateX(-50%) scale(.94)}
body.dressing #roamBtn,body.talking #roamBtn,body.shopping #roamBtn,body.sp-on #roamBtn,body.dressing #roamCatch,body.talking #roamCatch,body.shopping #roamCatch,body.sp-on #roamCatch,
body.dressing #ruBar,body.shopping #ruBar,body.sp-on #ruBar{display:none!important}
#ruBar{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 156px);z-index:8;display:none;flex-direction:column;align-items:center;gap:5px;width:max-content;max-width:calc(100vw - 32px);pointer-events:none}
#ruBar b{pointer-events:auto;cursor:pointer}#ruBar:not(.open) div{display:none!important}
#ruBar.show{display:flex}
#ruBar b{background:#e8336d;color:#fff;border-radius:999px;padding:4px 12px;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.18);white-space:nowrap}
#ruBar div{display:flex;flex-wrap:wrap;justify-content:center;gap:5px}
#ruBar span{background:rgba(255,255,255,.92);color:#3b2357;border-radius:999px;padding:4px 10px;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.18);white-space:nowrap}
#ruBar span.home{opacity:.6}#ruBar span.rope{background:#ffe2b8}#ruBar span.me{background:#ffd23f}
#ruBar small{font-weight:600;color:#7a5a8c;margin-left:3px}
button.hud.aniIco{left:16px!important;right:auto!important;transform:none!important;bottom:calc(env(safe-area-inset-bottom) + 300px)!important;min-width:72px;height:72px;padding:5px 9px 0;border-radius:36px;white-space:nowrap;line-height:1;text-align:center;border:3px solid #fff}
button.hud.aniIco:active{transform:scale(.94)!important}
button.hud.aniIco .ie{display:block;font-size:30px;line-height:36px}button.hud.aniIco .il{display:block;font-size:12px;font-weight:800;margin-top:1px}
@media (max-height:520px){button.hud.aniIco{bottom:calc(env(safe-area-inset-bottom) + 110px)!important}#roamPop{bottom:calc(env(safe-area-inset-bottom) + 190px)!important}}
#roamPop{position:fixed;left:16px;bottom:calc(env(safe-area-inset-bottom) + 384px);z-index:9;display:none;background:rgba(255,255,255,.96);border-radius:20px;padding:10px 12px 12px;box-shadow:0 8px 24px rgba(0,0,0,.22);width:max-content;max-width:calc(100vw - 32px)}
#roamPop.show{display:block}#roamPop header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;color:#3b2357;font-size:16px}
#roamPop header button{border:0;background:#f1e8f7;color:#3b2357;border-radius:50%;width:30px;height:30px;font-size:14px}
#roamPop div{display:flex;gap:8px}#roamPop div button{border:0;background:#fff4e0;color:#3b2357;border-radius:14px;padding:8px 10px;font-weight:700;font-size:12px;min-width:66px}
#roamPop div button i{display:block;font-style:normal;font-size:26px;margin-bottom:3px}#roamPop div button:active{transform:scale(.94)}
body.dressing #roamPop,body.talking #roamPop,body.shopping #roamPop,body.sp-on #roamPop{display:none!important}#ruBar i{font-style:normal;opacity:.85;margin-left:2px}
#ruBar.all span{font-size:11px;padding:3px 7px}#ruBar.all b{background:linear-gradient(90deg,#ff6a3d,#e8336d)}
@media (max-height:520px){#roamBtn{bottom:calc(env(safe-area-inset-bottom) + 185px)}#roamCatch{bottom:calc(env(safe-area-inset-bottom) + 240px)}#ruBar{top:calc(env(safe-area-inset-top) + 52px)}}`;
  document.head.appendChild(st);document.body.insertAdjacentHTML('beforeend','<button class="hud" id="roamBtn"></button><button class="hud" id="roamCatch"></button><div id="ruBar"></div>');}
// the bar at the top: the Round-up is on, every animal and where it is (still out, on someone's rope, home), and the catches so far
function ruBar(){const el=$('#ruBar');if(!RU.on&&!RU.endT){el.classList.remove('show');el.innerHTML='';return;}
  const me=ruMe(),nm=id=>id===me?'You':ruEsc(RU.names[id]||'Friend'),src=RU.on?RU:RU.last;
  const set=ruSet(),out=set.filter(c=>!RU.home[c.nm]).length;
  const all=RU.grp==='all',what=all?'All-Animal Round-up':RU.grp==='zoo'?'Safari Round-up':'Round-up';el.classList.toggle('all',all);
  const tg=`<i>${ruOpen?'▴':'▾'}</i>`;
  let h=RU.on?(all?`<b>🌪️ ${what}! ${out} of ${set.length} still out · ⏱ ${mmss(roamT-RU.t0)} ${tg}</b>`:`<b>🚨 ${what} is on! ${out} of ${set.length} still out ${tg}</b>`)
    :`<b>🏁 ${what} done!${all&&RU.last?` ⏱ ${mmss(RU.last.t)}`:''} ${tg}</b>`;
  h+='<div>'+set.map(c=>{const hm=RU.home[c.nm];if(hm)return all?'': `<span class="home">🏠 ${c.nm}<small>${nm(hm)}</small></span>`;
    if(c.mode==='rope'||c.mode==='friend')return `<span class="rope">🪢 ${c.e} ${c.nm}<small>${nm(c.owner)}</small></span>`;
    return `<span>${c.e} ${c.nm}</span>`;}).join('')+'</div>';
  const ids=Object.keys(src.names||{});
  if(ids.length>1)h+='<div>'+ids.sort((a,b)=>(src.sc[b]||0)-(src.sc[a]||0)).map(id=>`<span class="${id===me?'me':''}">${nm(id)} <small>🏠 ${src.sc[id]||0}</small></span>`).join('')+'</div>';
  el.innerHTML=h;el.classList.add('show');el.classList.toggle('open',ruOpen);}
// the list of animals stays folded away so it isn't in the way: tap the bar to open or close it
let ruOpen=false;$('#ruBar').addEventListener('click',e=>{if(!e.target.closest('b'))return;ruOpen=!ruOpen;sfx('pop');ruBar();});
function roamButton(){const P=player.pos;let best=null,bd=ROAM_REACH;
  if(!closetOpen&&!(typeof SW!=='undefined'&&SW.k>.3))for(const c of ROAM){if(c.mode==='friend'||c.mode==='pen')continue;const d=Math.hypot(P.x-c.pos.x,P.z-c.pos.z)-(c.real?c.a.rad*.6:0);if(d<bd){bd=d;best=c;}}
  roamNear=best;const ropes=myRopes(),rope=ropes[ropes.length-1],
    atBarn=!RU.on&&!RU.endT&&!closetOpen&&!allOn()?(nearHome('barn',P,14)?'barn':nearHome('zoo',P,10)?'zoo':Math.hypot(P.x,P.z)<Z.studio.r+8?'all':''):'';
  const grab=RU.on&&canCatch(best)&&ruIn(best)&&ropes.length<ropeMax();
  const key=(best?best.nm+best.mode:'')+'|'+ropes.map(c=>c.nm).join()+'|'+(RU.on?1:0)+'|'+atBarn;if(key===roamBtnKey)return;roamBtnKey=key;const b=$('#roamBtn'),k=$('#roamCatch');
  if(best&&best.mode!=='rope'&&!grab){aniIco(b,best.e,best.nm,`Meet ${best.nm}`);b.style.display='block';}else{b.style.display='none';}
  if(roamPopC&&roamPopC!==best)roamPopClose();
  k.classList.remove('go');
  if(grab){k.textContent=`🪢 Catch ${best.nm}`;k.style.display='block';}
  else if(rope){k.textContent=`🪢 Let go of ${rope.nm}`;k.style.display='block';}
  else if(atBarn){k.textContent=atBarn==='all'?'🌪️ Start the All-Animal Round-up!':atBarn==='zoo'?'🚨 Start a Safari Round-up!':'🚨 Start a Round-up!';k.dataset.g=atBarn;k.classList.add('go');k.style.display='block';}
  else k.style.display='none';}
function roamFeed(c,i){if(!c)return;const fd=c.food[i]||rnd(c.food),top=c.a.g.position.clone().add(new THREE.Vector3(0,c.a.h+.2,0));
  floaties(top,fd[0],4);setTimeout(()=>floaties(top,'💖',5),350);sfx('munch');c.happy=1.6;c.a.happy=2;c.a.wig=1;c.a.speak(rnd(c.say));
  RS.fed[c.nm]=1;persist();toast(`${c.e} ${c.nm} loves the ${fd[1]}!`);did('roamfeed',c.nm);}
function roamPet(c){if(!c)return;const top=c.a.g.position.clone().add(new THREE.Vector3(0,c.a.h+.2,0));floaties(top,'💖',6);sfx('pop');c.happy=1.6;c.a.happy=2;c.a.wig=.6;c.a.speak(rnd(c.say));did('roampet',c.nm);}
// 🐾 tap the animal's icon and a little card pops up with what you can do with it (feed it one of its foods, or pet it)
let roamPopC=null;
function roamPopOpen(c){if(!c)return;roamPopC=c;const el=$('#roamPop');sfx('pop');
  el.innerHTML=`<header><b>${c.e} ${ruEsc(c.nm)}</b><button data-x="1" aria-label="Close">✕</button></header><div>${c.food.map(([e,n],i)=>`<button data-feed="${i}"><i>${e}</i>Feed ${ruEsc(n)}</button>`).join('')}<button data-pet="1"><i>🤚</i>Pet</button></div>`;
  el.classList.add('show');}
function roamPopClose(){roamPopC=null;$('#roamPop').classList.remove('show');}
$('#roamBtn').onclick=()=>{if(roamPopC===roamNear)roamPopClose();else roamPopOpen(roamNear);};
document.body.insertAdjacentHTML('beforeend','<div id="roamPop" class="hud"></div>');
$('#roamPop').onclick=e=>{const b=e.target.closest('button'),c=roamPopC;if(!b||!c)return;if(b.dataset.x)return roamPopClose();
  if(b.dataset.feed!=null)roamFeed(c,+b.dataset.feed);else if(b.dataset.pet)roamPet(c);};
// the round animal icon used by every "meet / feed this animal" button (here, the zoo's, Polar Ice's and the sea animals'): the animal and a short word, not a sentence
function aniIco(b,e,lbl,say){b.classList.add('aniIco');b.innerHTML=`<span class="ie">${e}</span><span class="il">${ruEsc(lbl)}</span>`;b.setAttribute('aria-label',say||lbl);}
$('#roamCatch').onclick=()=>{const ropes=myRopes(),c=roamNear;if(RU.on&&canCatch(c)&&ruIn(c)&&ropes.length<ropeMax())ruCatch(c);else if(ropes.length)ruLetGo(ropes[ropes.length-1]);
  else if(!RU.on)ruBegin($('#roamCatch').dataset.g||'barn');};

// the animals on the minimap (during a Round-up only the ones still out), so you can go looking for them (heading-up, like drawMini in 26-map.js)
onTick.push(()=>{if(!started)return;const cv=$('#miniCv');if(!cv)return;const x=cv.getContext('2d'),S=cv.width,h=S/2,k=S/54,p=player.pos,
  fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx;x.save();x.font=`${Math.round(S*.08)}px serif`;x.textAlign='center';x.textBaseline='middle';
  for(const c of ROAM){if(c.mode==='pen'||(RU.on&&!canCatch(c)))continue;const dx=c.pos.x-p.x,dz=c.pos.z-p.z,sx=h+(dx*rx+dz*rz)*k,sy=h-(dx*fx+dz*fz)*k;if(Math.hypot(sx-h,sy-h)<h-10)x.fillText(c.e,sx,sy);}
  // 🏠 where to take them: each home that still waits for someone, kept on the rim when it's off the map so it points the way
  if(RU.on){const ropes=myRopes(),hs=new Set(ruSet().filter(c=>!RU.home[c.nm]).map(c=>c.grp));
    for(const g of hs){const z=RU_ZONE[g],dx=z.x-p.x,dz=z.z-p.z;let sx=(dx*rx+dz*rz)*k,sy=-(dx*fx+dz*fz)*k;const d=Math.hypot(sx,sy),lim=h-14;if(d>lim){sx*=lim/d;sy*=lim/d;}
      const on=ropes.some(c=>c.grp===g);x.beginPath();x.arc(h+sx,h+sy,S*(on?.075:.06),0,Math.PI*2);x.fillStyle=on?'#2fa36b':'rgba(255,210,63,.9)';x.fill();x.lineWidth=2;x.strokeStyle='#fff';x.stroke();
      x.font=`${Math.round(S*(on?.08:.065))}px serif`;x.fillText('🏠',h+sx,h+sy+1);}}
  x.restore();});

/* ---------- 🏠 where to take them: a glowing beacon over each home, an arrow at the top pointing the way, and 🏠 on the minimap ---------- */
const GUIDE={el:null,beacons:{},to:null};
function ruBeacon(g){if(GUIDE.beacons[g])return GUIDE.beacons[g];const z=RU_ZONE[g],grp=new THREE.Group();grp.position.set(z.x,0,z.z);
  const mat=new THREE.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide});
  const col=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,26,20,1,true),mat);col.position.y=13;grp.add(col);
  const tag=sprite(labelTex(`🏠 ${RU_NAME[g]}`,{size:60,fg:'#7a3b00',bg:'rgba(255,236,170,.95)',border:null}),5.2,1.1);tag.position.y=9;grp.add(tag);
  grp.visible=false;scene.add(grp);return GUIDE.beacons[g]=grp;}
// homes the runaways still out (or on your rope) belong to; the one to head for = the nearest home of an animal on your rope
function ruGuide(){const P=player.pos,ropes=myRopes(),want=new Set();
  if(RU.on)for(const c of ruSet())if(!RU.home[c.nm])want.add(c.grp);
  for(const g of Object.keys(RU_ZONE))if(want.has(g)||GUIDE.beacons[g]){const b=ruBeacon(g);b.visible=want.has(g);if(b.visible){const on=ropes.some(c=>c.grp===g);b.children[0].material.opacity=on?.42+.12*Math.sin(roamT*4):.16;b.children[1].visible=on||!ropes.length;}}
  let to=null,best=1e9;for(const c of ropes){const z=RU_ZONE[c.grp],d=Math.hypot(z.x-P.x,z.z-P.z);if(d<best){best=d;to=c;}}
  GUIDE.to=to?c2home(to):null;const el=GUIDE.el||(GUIDE.el=$('#ruGuide'));
  if(!to||closetOpen){el.classList.remove('show');return;}
  const z=RU_ZONE[to.grp],dx=z.x-P.x,dz=z.z-P.z,fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),sx=dx*-fz+dz*fx,sy=dx*fx+dz*fz,ang=Math.atan2(sx,sy)*180/Math.PI;
  const left=Math.max(0,Math.round(best-(z.fence||z.r)-RU_HOME)),who=ropes.filter(c=>c.grp===to.grp).map(c=>ruEsc(c.nm)).join(' & ');
  el.innerHTML=`<i style="transform:rotate(${ang.toFixed(0)}deg)">⬆</i><span>Take ${who} to ${RU_NAME[to.grp]}<small>${left?left+' steps':'almost there!'}</small></span>`;el.classList.add('show');}
const c2home=c=>({g:c.grp,x:RU_ZONE[c.grp].x,z:RU_ZONE[c.grp].z});
onTick.push(()=>{if(started)ruGuide();});
{const st=document.createElement('style');st.textContent=`
#ruGuide{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 196px);z-index:8;display:none;align-items:center;gap:8px;background:#2fa36b;color:#fff;border-radius:999px;padding:5px 14px 5px 6px;font-weight:800;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.2);white-space:nowrap;pointer-events:none}
#ruGuide.show{display:flex}#ruGuide i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#fff;color:#2fa36b;font-size:18px;transition:transform .15s}
#ruGuide small{display:block;font-size:11px;font-weight:700;opacity:.9}
body.dressing #ruGuide,body.shopping #ruGuide,body.sp-on #ruGuide{display:none!important}
@media (max-height:520px){#ruGuide{top:calc(env(safe-area-inset-top) + 92px)}}`;
  document.head.appendChild(st);document.body.insertAdjacentHTML('beforeend','<div id="ruGuide"></div>');}

// for challenges.js and the tests
function roamState(){return {fed:Object.keys(RS.fed).length,n:ROAM.length,on:RU.on,grp:RU.grp,home:Object.keys(RU.home).length,sc:{...RU.sc},
  rope:(ROAM.find(c=>c.mode==='rope')||{}).nm||null,guide:GUIDE.to?GUIDE.to.g:null,beacons:Object.keys(GUIDE.beacons).filter(g=>GUIDE.beacons[g].visible),ropes:myRopes().map(c=>c.nm),best:RS.allBest||0,modes:Object.fromEntries(ROAM.map(c=>[c.nm,c.mode]))};}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{ROAM,RU,ZA,roamState,roamFeed,roamEnd,roamT:()=>roamT,ruBegin,looseOk,POLAR_LIST,ruCatch,ruLetGo,ruFromNet,ruMe,BZ,ruNearHome:(x,z,m=0)=>Object.keys(RU_ZONE).some(g=>nearHome(g,{x,z},RU_HOME+m))});});
