/* ================= 🚨 POLAR ESCAPE: the polar animals break out all over town, and you catch them and walk them home =================
   Works like the barn animals' 🚨 Round-up (Preston's idea, 26g-town-animals.js): tap "Start a Polar escape!" at ❄️ Polar Ice and
   four of the polar animals (the polar bear, the walrus, a penguin and the arctic fox, all from IA in 24m-arctic.js) run off,
   each along one of its two streets (PE_LIST streets = the ang of a place with a path in 02-island.js, in different parts of town),
   and stays out until someone catches it. A bar at the top says who's still out. Tap 🪢 Catch next to one and it walks behind you
   on a rope until you get back to Polar Ice. When all four are home the escape is over.
   - 👭 Friends online in your room join in by themselves: everyone hunts the same four, whoever brings the most home wins
     (+40 🪙 and it counts as a win for the 🏆 rides; everyone else +15 🪙). Alone, +40 🪙 when they're all home.
     Messages go through the room as {t:'icerun', a, r (which escape)}: go {seed}, catch {nm}, let {nm}, home {nm}, st (the whole
     state every few seconds, so a friend who joins late catches up). Two people catching the same one at once: the lower id keeps it.
   - did('icehome', name) for each one you bring home, did('iceescape', place) at the end (place 0 = you won against friends, -1 alone).
     The ⭐ challenges are in the ❄️ Polar tab of challenges.js. */
const PE_LIST=[
  {k:'polarbear',nm:'Nanook',e:'🐻‍❄️',streets:[150,195],say:['*big bear huff*','*sniff sniff* Fish?','*rolls in the grass*']},
  {k:'walrus',nm:'Wally',e:'🦭',streets:[180,240],say:['*loud bellow*','*whisker wiggle*','*flop flop flop*']},
  {k:'penguin',nm:'Pebble',e:'🐧',streets:[90,30],say:['*trumpet call*','*waddle waddle*','*slides on its belly*']},
  {k:'arcticfox',nm:'Frost',e:'🦊',streets:[270,330],say:['*yip yip!*','*pounce!*','*fluffy tail swish*']}];
const PE_RING=7.15,PE_REACH=2.6,PE_SPD=1.3;
const PE_ANI=PE_LIST.map(o=>{const a=IA.find(x=>x.k===o.k&&!x.baby);const tag=sprite(labelTex(o.nm,{size:58,fg:'#2f6a9a',bg:'rgba(255,255,255,.88)',border:null}),.8,.2);
  tag.position.y=a.h/(a.g.scale.y||1)+.15;tag.visible=false;a.g.add(tag);return {...o,a,tag,pos:new THREE.Vector3(),face:0,mode:'home',wp:[],wait:0,street:o.streets[0],next:o.streets[0],lookT:0,owner:''};});
const peByName=nm=>PE_ANI.find(c=>c.nm===nm);
// where each street stops: just in front of the first place along it (like roamEnd in the Round-up)
function peEnd(ang){const z=ZONES.filter(z=>z.d&&!z.nopath&&Math.abs(z.ang-ang)<.5).sort((a,b)=>a.d-b.d)[0];return z?z.d-z.r-1.5:24;}
function peSpot(ang,d,side=0){const a=deg(ang);return {x:Math.sin(a)*d+Math.cos(a)*side,z:Math.cos(a)*d-Math.sin(a)*side};}
// a walk along its street: out to the end, a look around, back to the plaza, round the ring to the next street
function pePlan(c,from){const wp=c.wp,end=peEnd(c.street),side=()=>(Math.random()-.5)*.9;
  for(let d=(from!=null?from+5:10);d<end;d+=5)wp.push({...peSpot(c.street,d,side()),w:Math.random()<.2?1.5+Math.random()*2:0});
  wp.push({...peSpot(c.street,end,side()),w:3+Math.random()*4});
  for(let d=end-5;d>9;d-=5)wp.push({...peSpot(c.street,d,side()),w:0});
  const next=Math.random()<.75?c.streets.find(s=>s!==c.street)??c.street:c.street;
  const diff=((next-c.street+540)%360)-180,n=Math.max(1,Math.ceil(Math.abs(diff)/12));
  for(let i=0;i<=n;i++)wp.push({...peSpot(c.street+diff*i/n,PE_RING+(Math.random()-.5)*.6),w:i===n?1+Math.random()*2:0});
  c.next=next;}
function peToStreet(c){const P=c.pos,d0=Math.hypot(P.x,P.z),ang=Math.atan2(P.x,P.z)*180/Math.PI;
  c.street=c.streets.reduce((b,s)=>Math.abs(((s-ang+540)%360)-180)<Math.abs(((b-ang+540)%360)-180)?s:b);c.next=c.street;
  const d=Math.max(9,Math.min(peEnd(c.street)-1,d0));c.wp=[{...peSpot(c.street,d),w:0}];pePlan(c,d);}

/* ---------- the escape ---------- */
const PE={on:false,r:'',seed:0,home:{},sc:{},names:{},stT:0,endT:0,done:{},t:0};
const peNet=()=>{const n=window.__net;return n&&n.live()?n:null;};
const peMe=()=>{const n=window.__net;return (n&&n.id&&n.id())||'me';};
const peEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
function peSend(d){const n=peNet();if(n)try{n.send(Object.assign({t:'icerun',r:PE.r},d));}catch(e){}}
const peRand=seed=>{let s=(Math.abs(Math.floor(seed))%2147483646)+1;return ()=>((s=(s*16807)%2147483647)-1)/2147483646;};
// the animal leaves Polar Ice and goes out onto the streets (or comes home and goes back to its life there)
function peOut(c){const a=c.a;if(zooOpen&&zooSel===a)closeZoo();a.esc=true;a.ob.r=0;a.tgt=null;a.graze=0;c.tag.visible=true;}
function peIn(c){const a=c.a;a.esc=false;c.tag.visible=false;c.mode='home';c.owner='';
  let [lx,lz]=IZ.toLocal(c.pos.x,c.pos.z);if(!iceOk(lx,lz,a.rad))[lx,lz]=a.spot(a.rad);a.lx=lx;a.lz=lz;a.y=0;a.wait=1;a.tgt=a.spot(a.rad,a);a.face=Math.atan2(-lx,-lz);placeFarm(a);}
// everyone starts the same escape from the same seed, so the animals run to the same spots on every phone
function peStart(r,seed,who,whoName){if(PE.on)return;Object.assign(PE,{on:true,r,seed,home:{},sc:{},names:{},stT:0,endT:0});
  PE.names[peMe()]=SAVE.name||'You';if(who&&who!==peMe())PE.names[who]=String(whoName||'Friend').slice(0,16);
  const rr=peRand(seed);if(ICS.on)iceSkateOff();if(ICF.on)iceFishStop();
  for(const c of PE_ANI){burst(c.a.g.position.clone().add(new THREE.Vector3(0,.5,0)),'#bfe8ff',16,1.4);peOut(c);
    c.mode='street';c.owner='';c.wait=0;c.lookT=0;c.street=c.streets[Math.floor(rr()*2)];const d=12+rr()*(peEnd(c.street)-15),s=peSpot(c.street,d,(rr()-.5)*.8);
    c.pos.set(s.x,0,s.z);c.wp=[];pePlan(c,d);c.face=deg(c.street);}
  sfx('tada');banner('🚨 Polar escape! The polar animals got out!');
  setTimeout(()=>toast(who&&who!==peMe()?`👭 ${whoName||'A friend'} started a Polar escape! Catch them 🪢 and bring them back to ❄️ Polar Ice`:`Catch all ${PE_ANI.length} runaways 🪢 and walk them back to ❄️ Polar Ice. Look on the minimap!`),1900);
  did('icestart',0);peBar();peKey='?';}
function peBegin(){if(PE.on)return;const r=peMe().slice(0,8)+'-'+Date.now().toString(36),seed=1+Math.floor(Math.random()*2e9);peStart(r,seed);peSend({a:'go',seed});}
function peCatch(c){if(!PE.on||!c||c.mode!=='street'||PE_ANI.some(o=>o.mode==='rope'))return;c.mode='rope';c.owner=peMe();c.wp=[];c.wait=0;c.a.speak(rnd(c.say));sfx('pop');
  toast(`🪢 You caught ${c.nm}! Walk ${c.e} ${c.nm} back to ❄️ Polar Ice`);did('icecatch',c.nm);peSend({a:'catch',nm:c.nm});peBar();peKey='?';}
function peLetGo(c,quiet){if(!c||(c.mode!=='rope'&&c.mode!=='friend'))return;const mine=c.mode==='rope';c.mode='street';c.owner='';peToStreet(c);
  if(mine&&!quiet){sfx('pop');toast(`${c.e} ${c.nm} runs off again!`);peSend({a:'let',nm:c.nm});}peBar();peKey='?';}
function peHome(c,who,quiet){if(!PE.on||PE.home[c.nm])return;PE.home[c.nm]=who;PE.sc[who]=(PE.sc[who]||0)+1;
  if(c.mode==='street'&&who!==peMe()){const [x,w]=IZ.toWorld(...iceSpot(c.a.rad));c.pos.set(x,0,w);}// a friend brought it home: it's back at Polar Ice on your phone too
  peIn(c);
  if(who===peMe()){burst(c.a.g.position.clone().add(new THREE.Vector3(0,.4,0)),'#bfe8ff',24,1.6);floaties(c.a.g.position.clone().add(new THREE.Vector3(0,c.a.h+.2,0)),'🏠',5);sfx('tada');
    IS.home=(IS.home||0)+1;persist();did('icehome',c.nm);peSend({a:'home',nm:c.nm});const left=PE_ANI.length-Object.keys(PE.home).length;
    if(left)toast(`🏠 ${c.nm} is back at Polar Ice! ${left} still out`);}
  else if(!quiet)toast(`🏠 ${PE.names[who]||'A friend'} brought ${c.nm} home`);
  peBar();peKey='?';if(Object.keys(PE.home).length>=PE_ANI.length)peEnd2();}
function peEnd2(){const me=peMe(),ids=Object.keys(PE.names),friends=ids.filter(id=>id!==me),mine=PE.sc[me]||0;
  const best=Math.max(0,...ids.map(id=>PE.sc[id]||0)),place=friends.length?ids.filter(id=>(PE.sc[id]||0)>mine).length:-1;
  PE.on=false;PE.done[PE.r]=1;PE.endT=PE.t||1e-3;PE.last={sc:{...PE.sc},names:{...PE.names}};IS.escapes=(IS.escapes||0)+1;persist();
  if(!friends.length){banner('🏠 Polar escape done! Everyone is home');setTimeout(()=>earn(40,'Polar escape'),900);}
  else if(place===0&&mine===best&&mine>0){banner(`🏆 You won the Polar escape! ${mine} caught`);setTimeout(()=>earn(40,'Won the Polar escape'),900);}
  else{banner(`🏠 Polar escape done! You caught ${mine}`);setTimeout(()=>earn(15,'Polar escape'),900);}
  sfx('tada');did('iceescape',place);peBar();peKey='?';}
// what friends send
function peFromNet(id,name,d){if(!d||typeof d.a!=='string'||typeof d.r!=='string')return;id=String(id).slice(0,40);const r=d.r.slice(0,40),c=typeof d.nm==='string'?peByName(d.nm):null;
  if(d.a==='go'||d.a==='st'){if(!PE.on&&started&&!PE.done[r]){const sd=+d.seed;if(Number.isFinite(sd))peStart(r,sd,id,name);}
    if(!PE.on||r!==PE.r)return;PE.names[id]=String(name||'Friend').slice(0,16);
    if(d.a==='st'){for(const [nm,w] of Object.entries(d.h||{})){const a=peByName(nm);if(a&&typeof w==='string'&&!PE.home[nm])peHome(a,w.slice(0,40),true);}
      for(const [nm,w] of Object.entries(d.c||{})){const a=peByName(nm);if(a&&w===id&&a.mode==='street'){a.mode='friend';a.owner=id;}}
      peBar();}
    return;}
  if(!PE.on||r!==PE.r||!c)return;PE.names[id]=String(name||'Friend').slice(0,16);
  if(d.a==='catch'){if(c.mode==='rope'){if(id<peMe()){toast(`😮 ${PE.names[id]} caught ${c.nm} first!`);c.mode='friend';c.owner=id;}}
    else if(c.mode==='street'||c.mode==='friend'){c.mode='friend';c.owner=id;}peBar();peKey='?';}
  else if(d.a==='let'){if(c.mode==='friend'&&c.owner===id)peLetGo(c,true);}
  else if(d.a==='home')peHome(c,id);}
addEventListener('load',()=>{if(window.__net)window.__net.on((id,name,d)=>{if(d&&d.t==='icerun')peFromNet(id,name,d);});});

/* ---------- moving them ---------- */
let peNear=null,peKey='';
const peAtIce=(P,extra)=>Math.hypot(P.x-IZ.x,P.z-IZ.z)<IZ.r+extra;
const peFriend=id=>{const n=window.__net;return (n&&n.friends&&n.friends().get(id))||(PE.fake&&PE.fake[id])||null;};// fake: friends made up by the tests
function peFollow(c,P,face,dt){const back=face+Math.PI+.6,r=1.3+c.a.rad,tx=P.x+Math.sin(back)*r,tz=P.z+Math.cos(back)*r,dx=tx-c.pos.x,dz=tz-c.pos.z,d=Math.hypot(dx,dz);
  if(d>14){c.pos.set(tx,0,tz);return 0;}if(d>.2){const sp=Math.min(7,1+d*3),st=Math.min(d,sp*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*6));return sp;}
  c.face=angDamp(c.face,face,Math.min(1,dt*3));return 0;}
function peStep(dt){if(!started)return;PE.t+=dt;const P=player.pos;
  for(const c of PE_ANI){if(c.mode==='home')continue;const a=c.a,dP=Math.hypot(P.x-c.pos.x,P.z-c.pos.z),vis=dP<70;a.g.visible=vis;let sp=0;
    if(c.mode==='rope'){sp=peFollow(c,P,player.face,dt);a.graze=0;if(peAtIce(P,1.5)){peHome(c,peMe());continue;}}
    else if(c.mode==='friend'){const o=peFriend(c.owner);if(!o)peLetGo(c,true);else{sp=peFollow(c,o.pos,o.cur??o.face??0,dt);a.graze=0;}}
    else{// on its own: when you walk up it stops and looks at you for a moment, then goes on its way (it never comes after you)
      const look=dP<2.4&&c.lookT<2;if(dP<2.4)c.lookT+=dt;else if(dP>4)c.lookT=0;
      if(look){c.wait=0;c.face=angDamp(c.face,Math.atan2(P.x-c.pos.x,P.z-c.pos.z),Math.min(1,dt*4));a.graze+=(0-a.graze)*Math.min(1,dt*3);}
      else if(c.wait>0){c.wait-=dt;a.graze+=(1-a.graze)*Math.min(1,dt*2);}
      else{if(!c.wp.length){c.street=c.next;pePlan(c);}
        const w=c.wp[0],dx=w.x-c.pos.x,dz=w.z-c.pos.z,d=Math.hypot(dx,dz);
        if(d<.12){c.wp.shift();c.wait=w.w||0;}
        else{sp=PE_SPD*(c.k==='walrus'?.7:1);const st=Math.min(d,sp*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*4));}
        a.graze+=(0-a.graze)*Math.min(1,dt*3);}}
    if(!vis)continue;
    c.pos.y=groundAt(c.pos.x,c.pos.z);a.pos.copy(c.pos);a.g.position.copy(c.pos);a.g.rotation.y=c.face;a.update(dt,sp);}
  // the ropes: from your hand (or a friend's) to the animal on it
  PE_ANI.forEach((c,i)=>{const R0=PE_ROPES[i];let h=null;
    if(c.mode==='rope')h=av.g.position;else if(c.mode==='friend'){const o=peFriend(c.owner);if(o)h=o.pos;}
    if(!h||!c.a.g.visible){R0.visible=false;return;}
    const hv=h.clone().add(new THREE.Vector3(0,.9,0)),b=c.a.g.position.clone().add(new THREE.Vector3(0,c.a.h*.7,0));
    R0.visible=true;R0.position.copy(hv).add(b).multiplyScalar(.5);R0.scale.set(1,hv.distanceTo(b),1);R0.quaternion.setFromUnitVectors(LIMB_UP,b.sub(hv).normalize());});
  if(PE.on&&(PE.stT-=dt)<0){PE.stT=3;const cc={};for(const c of PE_ANI)if(c.mode==='rope')cc[c.nm]=peMe();peSend({a:'st',seed:PE.seed,h:PE.home,c:cc});}
  if(!PE.on&&PE.endT&&PE.t-PE.endT>9){PE.endT=0;peBar();}
  peButton();}
anims.push((t,dt)=>peStep(dt));
const peRopeMat=std('#c8a46a',{roughness:.9}),PE_ROPES=PE_ANI.map(()=>{const m=M(cyl(.012,.012,1,6),peRopeMat,0,0,0,scene,false,false);m.visible=false;return m;});

/* ---------- the Catch button and the bar at the top ---------- */
{const st=document.createElement('style');st.textContent=`
#peCatch{position:fixed;left:50%;transform:translateX(-50%);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5;
  bottom:calc(env(safe-area-inset-bottom) + 370px);background:linear-gradient(90deg,#7cc7e8,#2f6a9a);box-shadow:0 6px 18px rgba(47,106,154,.4)}
#peCatch:active{transform:translateX(-50%) scale(.94)}
body.dressing #peCatch,body.talking #peCatch,body.shopping #peCatch,body.sp-on #peCatch,body.dressing #peBar,body.shopping #peBar,body.sp-on #peBar{display:none!important}
#peBar{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 156px);z-index:8;display:none;flex-direction:column;align-items:center;gap:5px;width:max-content;max-width:calc(100vw - 32px);pointer-events:none}
#peBar.show{display:flex}
#peBar b{background:#2f6a9a;color:#fff;border-radius:999px;padding:4px 12px;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.18);white-space:nowrap}
#peBar div{display:flex;flex-wrap:wrap;justify-content:center;gap:5px}
#peBar span{background:rgba(255,255,255,.92);color:#3b2357;border-radius:999px;padding:4px 10px;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.18);white-space:nowrap}
#peBar span.home{opacity:.6}#peBar span.rope{background:#d8f0ff}#peBar span.me{background:#ffd23f}
#peBar small{font-weight:600;color:#7a5a8c;margin-left:3px}
@media (max-height:520px){#peCatch{bottom:calc(env(safe-area-inset-bottom) + 240px)}#peBar{top:calc(env(safe-area-inset-top) + 52px)}}`;
  document.head.appendChild(st);document.body.insertAdjacentHTML('beforeend','<button class="hud" id="peCatch"></button><div id="peBar"></div>');}
function peBar(){const el=$('#peBar');if(!PE.on&&!PE.endT){el.classList.remove('show');el.innerHTML='';return;}
  const me=peMe(),nm=id=>id===me?'You':peEsc(PE.names[id]||'Friend'),src=PE.on?PE:PE.last;
  const out=PE_ANI.filter(c=>!PE.home[c.nm]).length;
  let h=PE.on?`<b>🚨 Polar escape! ${out} of ${PE_ANI.length} still out</b>`:`<b>🏁 Polar escape over!</b>`;
  h+='<div>'+PE_ANI.map(c=>{const hm=PE.home[c.nm];if(hm)return `<span class="home">🏠 ${c.nm}<small>${nm(hm)}</small></span>`;
    if(c.mode==='rope'||c.mode==='friend')return `<span class="rope">🪢 ${c.e} ${c.nm}<small>${nm(c.owner)}</small></span>`;
    return `<span>${c.e} ${c.nm}</span>`;}).join('')+'</div>';
  const ids=Object.keys(src.names||{});
  if(ids.length>1)h+='<div>'+ids.sort((a,b)=>(src.sc[b]||0)-(src.sc[a]||0)).map(id=>`<span class="${id===me?'me':''}">${nm(id)} <small>🏠 ${src.sc[id]||0}</small></span>`).join('')+'</div>';
  el.innerHTML=h;el.classList.add('show');}
// Catch / Let go out in town (starting an escape is a button at Polar Ice, in iceButtons in 24m-arctic.js)
function peButton(){const P=player.pos;let best=null,bd=PE_REACH;
  if(PE.on&&!closetOpen&&!(typeof SW!=='undefined'&&SW.k>.3))for(const c of PE_ANI){if(c.mode!=='street')continue;const d=Math.hypot(P.x-c.pos.x,P.z-c.pos.z);if(d<bd){bd=d;best=c;}}
  peNear=best;const rope=PE_ANI.find(c=>c.mode==='rope');
  const key=(best?best.nm:'')+'|'+(rope?rope.nm:'')+'|'+(PE.on?1:0);if(key===peKey)return;peKey=key;const k=$('#peCatch');
  if(rope){k.textContent=`🪢 Let go of ${rope.nm}`;k.style.display='block';}
  else if(best){k.textContent=`🪢 Catch ${best.e} ${best.nm}`;k.style.display='block';}
  else k.style.display='none';}
$('#peCatch').onclick=()=>{const rope=PE_ANI.find(c=>c.mode==='rope');if(rope)peLetGo(rope);else peCatch(peNear);};

// the runaways on the minimap, so you can go looking for them (heading-up, like drawMini in 26-map.js)
addEventListener('load',()=>onTick.push(()=>{if(!started||!PE.on)return;const cv=$('#miniCv');if(!cv)return;const x=cv.getContext('2d'),S=cv.width,h=S/2,k=S/54,p=player.pos,
  fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx;x.save();x.font=`${Math.round(S*.08)}px serif`;x.textAlign='center';x.textBaseline='middle';
  for(const c of PE_ANI){if(c.mode!=='street')continue;const dx=c.pos.x-p.x,dz=c.pos.z-p.z,sx=h+(dx*rx+dz*rz)*k,sy=h-(dx*fx+dz*fz)*k;if(Math.hypot(sx-h,sy-h)<h-10)x.fillText(c.e,sx,sy);}
  x.restore();}));

function peState(){return {on:PE.on,home:Object.keys(PE.home).length,n:PE_ANI.length,sc:{...PE.sc},rope:(PE_ANI.find(c=>c.mode==='rope')||{}).nm||null,
  modes:Object.fromEntries(PE_ANI.map(c=>[c.nm,c.mode])),escapes:IS.escapes||0,homeAll:IS.home||0};}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{PE,PE_ANI,peState,peBegin,peCatch,peLetGo,peFromNet,peMe,peEnd});});
