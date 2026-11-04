/* ===== 🍝 Rosie's Restaurant: eat a meal, and the 🛵 delivery rush =====
   The building, tables, pads and food models are in 12g-place-restaurant.js (RST, makeFood, deliveryBox).
   🍽️ Sit and eat: step on the pad by the front right table, pick food from the menu, and Rosie the server walks it
     over from the kitchen pass on a tray. Tap "Take a bite" until the plate is empty (did('eat', food)), then dessert.
   🛵 Delivery rush: step on the scooter pad. You wear a food box and have to bring 3 orders to customers waiting at
     places around town before the clock runs out (the minimap arrow and the light beam show the way). Deliver all 3 in
     time to win (did('deliver',0), counts as a win for the 🏆 earned rides); the fastest time goes on the Star Delivery board. */
const RZ=RST.z;
let restOpen=false,onRSPad=false,onRDPad=false,restZone=null;
if(!SAVE.diner||typeof SAVE.diner!=='object')SAVE.diner={};
const RD=SAVE.diner;// {best:{t,n}, wins, ate:{}}

/* ---------- the people who work and eat here (built the first time you come by) ---------- */
const RP={built:false,all:[]};
function rNPC(look,name,lx,lz,face){const a=new Avatar(look,name,'#b8322a');const o={a,g:a.g,pos:zW(RZ,lx,0,lz),face:zFace(RZ,...face),sp:0,say:null,sayT:0};a.g.position.copy(o.pos);a.g.rotation.y=o.face;scene.add(a.g);RP.all.push(o);return o;}
function buildRest(){if(RP.built)return;RP.built=true;
  const rosie=Object.assign(defaultLook(),{skin:'#e8b48f',eyes:'#5a3a22',hair:{id:'highpony',c:'#5a2e1a'},dress:null,top:{id:'tee',c:'#fbf8f2'},bottom:{id:'skirt',c:'#2d2a28'},shoes:{id:'flats',c:'#2d2a28'},hat:null,extras:{}});
  RP.rosie=rNPC(rosie,'🍽️ Rosie',.9,-2.05,[0,1]);RP.rosie.home=[.9,-2.05];
  RP.rosie.tray=new THREE.Group();RP.rosie.tray.position.set(0,1.0,.36);RP.rosie.g.add(RP.rosie.tray);RP.rosie.tray.visible=false;
  M(cyl(.2,.2,.015,28),std('#c9a24a',{metalness:.9,roughness:.3}),0,0,0,RP.rosie.tray);
  const marco=Object.assign(defaultGuyLook(),{skin:'#d9a982',eyes:'#3d2a1a',hair:{id:'crop',c:'#2b1d16'},beard:{id:'beard',c:'#2b1d16'},top:{id:'buttonup',c:'#fbf8f2'},bottom:{id:'khakis',c:'#2d2d3a'},shoes:{id:'oxfords',c:'#2b1d16'}});
  RP.marco=rNPC(marco,'👨‍🍳 Chef Marco',-.6,-3.85,[0,1]);
  {const h=new THREE.Group(),w=std('#ffffff',{roughness:.8});h.position.set(0,.13,-.01);RP.marco.a.head.add(h);M(cyl(.12,.115,.08,24),w,0,0,0,h);const t=M(fuzz(sph(.15,18,12),.01,40),w,0,.1,0,h);t.scale.y=.75;}
  // two people already having dinner
  const sit=(t,side,food)=>{const tb=RST.tables[t],o=rNPC(randLook(),'',tb.lx+side*.8,tb.lz,[-side,0]);o.a.tag.visible=false;o.sit=true;o.a.play('chair');
    const f=makeFood(food);f.g.position.set(side*.3,.76,0);tb.g.add(f.g);const d=makeFood(rnd(['lemonade','oj','shake']));d.g.position.set(side*.26,.76,.22);tb.g.add(d.g);return o;};
  RP.d1=sit(0,-1,'pasta');RP.d2=sit(2,-1,'pizza');}
const rSay=(o,t)=>{if(o)friendBubble(o,t);};
// Rosie walks along a list of spots (in the restaurant's own directions)
function rosieGo(path,done){const r=RP.rosie;r.path=path.map(([x,z])=>zW(RZ,x,0,z));r.done=done;}
function rStep(o,dt){if(o.path&&o.path.length){const tg=o.path[0];tmpV.subVectors(tg,o.pos);tmpV.y=0;const d=tmpV.length();
    if(d<.08){o.path.shift();if(!o.path.length){o.sp=0;const f=o.done;o.done=null;f&&f();}}
    else{const st=Math.min(d,dt*1.6);o.pos.addScaledVector(tmpV.normalize(),st);o.face=angDamp(o.face,Math.atan2(tmpV.x,tmpV.z),Math.min(1,dt*8));o.sp=1.6;}}
  else o.sp=0;
  if(o.want!=null&&!(o.path&&o.path.length))o.face=angDamp(o.face,o.want,Math.min(1,dt*6));
  o.g.position.copy(o.pos);o.g.rotation.y=o.face;o.a.update(dt,o.sp,false);
  if(o.sit&&!o.a.emote)o.a.play('chair');
  // carrying the tray: both hands out in front
  if(o.tray&&o.tray.visible){const A=o.a.arms;for(const a of A){a.sh.rotation.x=-1.05;a.el.rotation.x=-.45;}A[0].sh.rotation.z=-.15;A[1].sh.rotation.z=.15;}
  if(o.say){o.sayT-=dt;if(o.sayT<0){o.g.remove(o.say);o.say=null;}}}

/* ---------- 🍽️ sitting down to eat ---------- */
const meal={phase:'menu',main:'pizza',drink:'lemonade',sweet:null,food:null,drk:null,bites:0,sips:0,bite:0,biteDid:false,fork:null,cam:{p:new THREE.Vector3(),t:new THREE.Vector3()}};
const BITES=4,SIPS=3;
const TBL=()=>(meal.seat||RST.seats[0]).t;
// 🪑 every person eating here gets their own chair: a friend online who is eating sends which chair (the 'dine' entry in
// 26c-friends-see.js), and townspeople standing next to a chair count too, so you take the first chair nobody is in
function seatSpot(s){return zW(RZ,s.lx,0,s.lz);}
function seatTaken(s,skipMe){if(s.npc)return true;const w=seatSpot(s),i=RST.seats.indexOf(s);
  if(!skipMe&&restOpen&&meal.mode==='eat'&&meal.seat===s)return true;
  if(typeof mapOthers!=='undefined'&&mapOthers)for(const o of mapOthers.values()){const dn=o.shows&&o.shows.dine;if(dn&&dn.h&&dn.h.s===i)return true;if(o.pos&&Math.hypot(o.pos.x-w.x,o.pos.z-w.z)<.6)return true;}
  for(const f of FRIENDS)if(Math.hypot(f.pos.x-w.x,f.pos.z-w.z)<.6)return true;
  return false;}
function pickSeat(){return RST.seats.find(s=>!seatTaken(s,true))||RST.seats[0];}
function clearTable(){for(const k of ['food','drk']){const f=meal[k];if(f){f.g.parent&&f.g.parent.remove(f.g);freeObj(f.g);meal[k]=null;}}}
function sitDown(){const s=meal.seat=pickSeat(),p=seatSpot(s);player.pos.copy(p);player.vy=0;player.speed=0;player.face=zFace(RZ,-s.side,0);av.play('chair');}
function openRest(mode){if(closetOpen||!started)return;closeTalk();buildRest();restOpen=closetOpen=true;meal.mode=mode;RST.spad.parts.forEach(v=>v.visible=false);RST.dpad.lbl.visible=false;
  document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  meal.cam.p.copy(camera.position);meal.cam.t.copy(cam.fv||player.pos);
  if(mode==='eat'){sitDown();meal.phase='menu';meal.sweet=null;clearTable();rSay(RP.rosie,'Welcome to Rosie\'s! 😊');}
  else{const P=RST.dpad,[x,w]=RZ.toWorld(P.lx,P.lz);player.pos.set(x,0,w);player.face=zFace(RZ,-.5,-1);}
  renderRest();$('#rest').classList.add('show');$('#rcontent').scrollTop=0;sfx('tada');}
function closeRest(){if(!restOpen)return;restOpen=closetOpen=false;RST.spad.parts.forEach(v=>v.visible=true);RST.dpad.lbl.visible=true;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  document.body.classList.remove('dressing');$('#rest').classList.remove('show');
  if(meal.mode==='eat'){clearTable();handFork(false);const r=RP.rosie;if(r.tray.visible||r.path&&r.path.length){r.tray.visible=false;r.tray.children.slice(1).forEach(c=>{r.tray.remove(c);freeObj(c);});rosieGo(rosieBack(),()=>{r.want=zFace(RZ,0,1);});}
    av.emote=null;const P=RST.spad,[x,w]=RZ.toWorld(P.lx,P.lz+.6);player.pos.set(x,0,w);player.face=zFace(RZ,0,1);}
  cam.yaw=cam.cy=player.face+Math.PI;persist();}
$('#rdone').onclick=closeRest;$('#rphoto').onclick=()=>{wantPhoto=true;};

// the path from the kitchen pass to your table, and back
// she comes round the back of your table, so you can watch her walk over with the tray
const rosieThere=()=>{const t=TBL();return [[1.9,-2.2],[.15,-1.3],[.15,t.lz-1.45],[t.lx+.1,t.lz-1.0]];};
const rosieBack=()=>{const t=TBL();return [[.15,t.lz-1.45],[.15,-1.3],RP.rosie.home];};
function order(kind,drinkKind){if(meal.phase!=='menu'&&meal.phase!=='dessert')return;const sweet=meal.phase==='dessert';
  meal.phase='wait';meal.serving=kind;renderRest();sfx('pop');
  const r=RP.rosie;rSay(r,sweet?'One sweet treat, coming up! 🍨':'Great choice! I\'ll be right back 📝');
  // Rosie goes to the pass, Chef Marco rings the bell, she picks up the plate and brings it over
  rosieGo([[1.9,-2.2]],()=>{r.want=zFace(RZ,0,-1);setTimeout(()=>{if(!restOpen||meal.phase!=='wait')return;rSay(RP.marco,'Order up! 🛎️');tone(2093,.5,'sine',.12);tone(2637,.6,'sine',.06,.02);
    setTimeout(()=>{if(!restOpen||meal.phase!=='wait')return;
      const f=makeFood(kind);f.g.position.set(-.04,.008,0);r.tray.add(f.g);let d=null;if(drinkKind){d=makeFood(drinkKind);d.g.position.set(.11,.008,.06);r.tray.add(d.g);}
      r.tray.visible=true;r.want=null;
      rosieGo(rosieThere().slice(1),()=>{if(!restOpen||meal.phase!=='wait'){r.tray.visible=false;return;}r.want=zFace(RZ,0,1);
        const tb=TBL().g,sd=meal.seat.side;f.g.position.set(sd*.3,.76,0);f.g.rotation.y=sd*Math.PI/2;tb.add(f.g);meal.food=f;
        if(d){if(meal.drk){tb.remove(meal.drk.g);freeObj(meal.drk.g);}d.g.position.set(sd*.24,.76,sd*.24);tb.add(d.g);meal.drk=d;meal.sips=0;}
        r.tray.visible=false;meal.bites=0;meal.phase=sweet?'eatSweet':'eat';handFork(true);renderRest();tone(660,.08,'triangle',.1);
        rSay(r,rnd(['Enjoy your meal! 😊','Bon appétit! ✨','Buon appetito! 🇮🇹']));
        setTimeout(()=>rosieGo(rosieBack(),()=>{r.want=zFace(RZ,0,1);}),1400);});},900);},700);});}
// a little fork in your hand while you eat
function handFork(on){if(on&&!meal.fork){const g=new THREE.Group(),s=std('#d9d9e0',{metalness:1,roughness:.25});M(box(.01,.12,.006),s,0,-.06,0,g,false);for(let i=-1;i<=1;i++)M(box(.004,.04,.004),s,i*.009,-.135,0,g,false);g.rotation.x=.4;meal.fork=g;}
  if(!meal.fork)return;const h=av.arms[1].hand;if(on){if(meal.fork.parent!==h)h.add(meal.fork);meal.fork.position.set(0,-.06,.03);}else if(meal.fork.parent)meal.fork.parent.remove(meal.fork);}
// a tap while the fork is still on its way counts as the next bite, so quick taps never get lost
function takeBite(){if(!meal.food||!(meal.phase==='eat'||meal.phase==='eatSweet'))return;if(meal.bite>0){meal.queued='bite';return;}meal.bite=.001;meal.biteDid=false;meal.biteKind='bite';}
function takeSip(){if(!meal.drk||meal.sips>=SIPS)return;if(meal.bite>0){meal.queued='sip';return;}meal.bite=.001;meal.biteDid=false;meal.biteKind='sip';}
function biteNow(){const f=meal.food;
  if(meal.biteKind==='sip'){const d=meal.drk;if(!d)return;meal.sips++;const j=d.g.userData.drink;j.scale.y=Math.max(.0001,j.userData.full*(1-meal.sips/SIPS));tone(300,.12,'sine',.08,0,500);if(meal.sips>=SIPS)rSay(RP.rosie,'Want a refill? Just order again! 🥤');renderRest();return;}
  const n=f.bits.length,a=Math.floor(meal.bites*n/BITES),b=Math.floor((meal.bites+1)*n/BITES);for(let i=a;i<b;i++)f.bits[i].visible=false;meal.bites++;
  sfx('munch');burst(f.g.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.08,0)),'#f3d9a6',8,.6,.05);
  if(meal.bites>=BITES){const k=f.g.userData.kind;RD.ate=RD.ate||{};RD.ate[k]=(RD.ate[k]||0)+1;persist();did('eat',k);sfx('star');
    setTimeout(()=>{if(!restOpen)return;meal.phase=meal.phase==='eatSweet'?'full':'dessert';av.play('cheer');renderRest();
      if(meal.phase==='dessert')rSay(RP.rosie,'All gone! Room for dessert? 🍨');else rSay(RP.rosie,'Thanks for coming! 💖');
      const paid=RD.paid||0;if(Date.now()-paid>3e5){RD.paid=Date.now();persist();earn(3,'Yummy meal!');}},500);}
  renderRest();}
// hand to mouth and back for a bite or a sip (runs after Avatar.update, so it wins over the sitting pose)
function biteAnim(dt){if(!(meal.bite>0))return;meal.bite+=dt;const k=meal.bite/.75,up=Math.sin(Math.min(1,k)*Math.PI);
  const A=av.arms[1];A.sh.rotation.x=-.35-1.25*up;A.sh.rotation.z=-.05-.35*up;A.el.rotation.x=-.9-1.2*up;av.head.rotation.x=.15*up;
  if(k>.5&&!meal.biteDid){meal.biteDid=true;biteNow();}if(k>=1){meal.bite=0;av.head.rotation.x=0;const q=meal.queued;meal.queued=null;if(q==='bite'&&meal.bites<BITES)takeBite();else if(q==='sip')takeSip();}}

/* ---------- the panel ---------- */
function renderRest(){const c=$('#rcontent');let h='';const P=meal.phase;
  $('#rtitle').textContent=meal.mode==='rush'?'🛵 Delivery Rush':"🍝 Rosie's Restaurant";
  if(meal.mode==='rush'){const b=RD.best;
    h=`<p class="gsay">Bring 3 orders to hungry people around town before the clock runs out!</p>
      <p class="drawhint">You'll carry the food box on your back. Follow the arrow on the map and the light beam to each customer. Rides and bikes are allowed! 🚲🐴</p>
      <p class="drawhint">🏆 Deliver all 3 in time to win coins, and a win for your 🏆 rewards.${b?`<br>⭐ Fastest so far: <b>${escH(b.n)}</b> in ${fmtT(b.t)}`:''}</p>
      <button class="btn" data-rush="1">🛵 Start the rush!</button>`;}
  else if(P==='menu'||P==='dessert'){const list=P==='menu'?FOOD_MAIN:FOOD_SWEET;
    h=`<p class="gsay">${P==='menu'?'What would you like to eat? 😋':'Yum! Room for dessert? 🍨'}</p>
      <div class="rgrid">${list.map(([k,e,n])=>`<button class="item" data-food="${k}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`;
    if(P==='menu')h+=`<h3>To drink</h3><div class="chips">${FOOD_DRINK.map(([k,e,n])=>`<button class="${k===meal.drink?'on':''}" data-drink="${k}">${e} ${n}</button>`).join('')}</div>`;
    else h+=`<button class="btn rno" data-full="1">No thanks, I'm full!</button>`;}
  else if(P==='wait')h=`<p class="gsay">📝 Rosie is getting your ${foodName(meal.serving)} from the kitchen...</p><p class="drawhint">Watch her bring it over on her tray!</p>`;
  else if(P==='eat'||P==='eatSweet'){const left=BITES-meal.bites;
    h=`<p class="gsay">${left===BITES?'Here it is! Take a bite 😋':left>1?'Mmm! Keep going!':'Last bite!'}</p>
      <div class="gpips">${Array.from({length:BITES},(_,i)=>`<span class="${i<meal.bites?'ok':''}"></span>`).join('')}</div>
      <button class="btn" data-bite="1">😋 Take a bite</button>${meal.drk&&meal.sips<SIPS?`<button class="btn rsip" data-sip="1">🥤 Take a sip</button>`:''}`;}
  else if(P==='full')h=`<p class="gsay">That was delicious! 😋💖</p><p class="drawhint">Come back any time. Try every food on the menu!</p><button class="btn" data-again="1">🍽️ Order something else</button>`;
  c.innerHTML=h;}
$('#rcontent').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.food){if(meal.phase==='menu')order(d.food,meal.drink);else order(d.food,null);}
  else if(d.drink){meal.drink=d.drink;renderRest();}
  else if(d.bite)takeBite();else if(d.sip)takeSip();
  else if(d.full){meal.phase='full';rSay(RP.rosie,'Thanks for coming! 💖');renderRest();}
  else if(d.again){clearTable();meal.phase='menu';renderRest();}
  else if(d.rush){closeRest();startRush();}});

// the camera looks at your table from the front, so you see Rosie coming over
function restCam(dt){if(!restOpen)return;const land=innerWidth>innerHeight*1.25;
  // eating: from in front of your table, off to the side you're not on, so you see your face and Rosie coming over
  const T=TBL(),sd=(meal.seat||RST.seats[0]).side;
  const want=meal.mode==='rush'?zW(RZ,-1.4,1.9,7.6):zW(RZ,T.lx-sd*(land?2.1:2.6),land?2:2.15,T.lz+(land?3.2:4.1)),tgt=meal.mode==='rush'?zW(RZ,-4,.6,4.2):zW(RZ,T.lx-sd*(land?.3:.25),.85,T.lz-(land?1.2:1.25));
  const a=Math.min(1,dt*4);meal.cam.p.lerp(want,a);meal.cam.t.lerp(tgt,a);camera.position.copy(meal.cam.p);camera.lookAt(meal.cam.t);}

/* ---------- 🛵 the delivery rush ---------- */
const DL={on:false,orders:[],i:0,t:0,limit:60,box:null,cust:null,dest:null,next:0};
const CUST_N=['Sam','Lena','Theo','Maya','Ben','Ruby','Leo','Ivy','Noah','Ella','Max','Zara'];
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
// where a customer waits: just outside the front of a place, beside its path
function custSpot(z){const [x,w]=z.toWorld(-1.9,z.r+.4);const p=new THREE.Vector3(x,0,w);collide(p,.35);return p;}
function pickOrders(){const pool=ZONES.filter(z=>z.d&&!z.far&&!['diner','bay','studio'].includes(z.id));const out=[];let from=RZ;
  while(out.length<3){const ok=pool.filter(z=>!out.includes(z)&&Math.hypot(z.x-from.x,z.z-from.z)>18);const z=rnd(ok.length?ok:pool.filter(z=>!out.includes(z)));out.push(z);from=z;}
  return out.map(z=>({z,food:rnd(FOOD_MAIN),p:custSpot(z)}));}
function startRush(){if(DL.on||!started)return;buildRest();
  DL.orders=pickOrders();DL.i=0;DL.t=0;DL.next=0;
  // time: a few seconds per stop plus enough to walk there at a good pace
  let lim=0,from=zW(RZ,RST.dpad.lx,0,RST.dpad.lz);for(const o of DL.orders){lim+=7+from.distanceTo(o.p)/3.9;from=o.p;}DL.limit=Math.ceil(lim/5)*5;
  DL.on=true;wearBox(true);
  if(!DL.cust){DL.cust={a:new Avatar(randLook(),'','#2f7be5'),pos:new THREE.Vector3(),face:0,say:null,sayT:0,wave:0};scene.add(DL.cust.a.g);DL.cust.g=DL.cust.a.g;}
  rSay(RP.rosie,'Go go go! 🛵💨');aimOrder();$('#delHud').classList.add('show');renderHud();
  banner('🛵 Delivery rush!');sfx('tada');toast(`Deliver 3 orders in ${fmtT(DL.limit)}! Follow the arrow 🧭`);did('rushStart');}
function aimOrder(){const o=DL.orders[DL.i];if(!o)return;const c=DL.cust;
  c.a.dress(randLook());if(c.tag){c.g.remove(c.tag);c.tag.material.map.dispose();c.tag.material.dispose();}
  const nm=rnd(CUST_N);c.tag=sprite(labelTex('🍽️ '+nm,{size:60,fg:'#1f5fa8',bg:'rgba(255,255,255,.9)',border:null}),.9,.225);c.tag.position.y=1.86;c.g.add(c.tag);c.a.tag.visible=false;
  c.pos.copy(o.p);c.pos.y=groundAt(c.pos.x,c.pos.z);c.face=Math.atan2(o.z.x-c.pos.x,o.z.z-c.pos.z)+Math.PI;c.wave=0;c.g.visible=true;
  DL.dest={x:o.p.x,z:o.p.z,name:`${o.food[1]} ${nm} at ${o.z.name}`,id:'delivery'};setDest(DL.dest);}
function wearBox(on){if(on){if(!DL.box)DL.box=deliveryBox();const sp=av.spine;if(DL.box.parent!==sp){sp.add(DL.box);DL.box.position.set(0,.2,-.25);}}
  else if(DL.box&&DL.box.parent)DL.box.parent.remove(DL.box);}
function renderHud(){const o=DL.orders[DL.i];if(!o)return;$('#delT').textContent=`🛵 ${DL.i+1} of 3: ${o.food[1]} to ${o.z.name}`;const left=DL.limit-DL.t;
  const tEl=$('#delTime');tEl.textContent=`⏱️ ${fmtT(left)}`;tEl.classList.toggle('low',left<10);}
function deliverNow(){const o=DL.orders[DL.i],c=DL.cust;c.a.play('cheer');rSay(c,rnd(['Yum! Thank you! 💖','Wow, that was fast! ⚡','Still hot! You\'re the best! 🔥','Mmm, smells amazing! 😋']));
  burst(new THREE.Vector3(c.pos.x,c.pos.y+1.4,c.pos.z),'#ffd23f',30,2.2);sfx('star');earn(3,'Tip!');DL.i++;
  if(DL.i>=3){endRush(true);return;}
  toast(`✅ Delivered! Next: ${DL.orders[DL.i].food[1]} to ${DL.orders[DL.i].z.name}`);DL.next=1.6;setDest(null);renderHud();}
function endRush(win,quit){if(!DL.on)return;DL.on=false;wearBox(false);setDest(null);$('#delHud').classList.remove('show');
  const c=DL.cust;setTimeout(()=>{if(!DL.on&&c)c.g.visible=false;},2500);
  const left=Math.max(0,DL.limit-DL.t),used=DL.t;
  if(quit){toast('Delivery rush stopped. Try again any time 🛵');return;}
  if(win){const bonus=Math.min(15,Math.round(left/2));RD.wins=(RD.wins||0)+1;
    const nm=SAVE.name||'Brynny',newBest=!RD.best||used<RD.best.t;if(newBest)RD.best={t:Math.round(used*10)/10,n:nm.slice(0,14)};persist();drawBoard();
    banner(newBest?'🏆 New delivery record!':'🏆 All delivered in time!');setTimeout(()=>earn(15+bonus,'Delivery rush win!'),900);
    av.play('cheer');for(let k=0;k<4;k++)setTimeout(()=>burst(new THREE.Vector3(player.pos.x+(Math.random()-.5)*2,player.pos.y+2,player.pos.z+(Math.random()-.5)*2),rnd(['#ffd23f','#ff8fc8','#8fd8ff']),40,3),k*250);
    toast(`All 3 orders in ${fmtT(used)} with ${fmtT(left)} to spare! ⚡`);did('deliver',0);}
  else{sfx('pop');banner('⏰ Out of time!');toast(`You delivered ${DL.i} of 3. Try again at 🍝 Rosie's! 🛵`);did('deliver',1);}}
$('#delQuit').onclick=()=>endRush(false,true);
function rushStep(dt){if(!DL.on)return;wearBox(true);DL.t+=dt;const left=DL.limit-DL.t;
  const c=DL.cust;
  if(DL.next>0){DL.next-=dt;if(DL.next<=0)aimOrder();}
  else{const o=DL.orders[DL.i];const d=Math.hypot(player.pos.x-c.pos.x,player.pos.z-c.pos.z);
    c.face=angDamp(c.face,Math.atan2(player.pos.x-c.pos.x,player.pos.z-c.pos.z),Math.min(1,dt*(d<14?5:0)));
    c.wave-=dt;if(c.wave<0&&d<30){c.wave=3;c.a.play('wave');rSay(c,`${o.food[1]} Over here!`);}
    if(d<1.9){deliverNow();if(!DL.on)return;}}
  if(left<=0){endRush(false);return;}
  if(Math.floor(left)!==DL.shown){DL.shown=Math.floor(left);renderHud();if(left<=5&&left>0)tone(880,.08,'square',.05);}}
function custStep(dt){const c=DL.cust;if(!c||!c.g.visible)return;c.g.position.copy(c.pos);c.g.rotation.y=c.face+(c.a.spinY||0);c.a.update(dt,0,false);
  if(c.say){c.sayT-=dt;if(c.sayT<0){c.g.remove(c.say);c.say=null;}}}

// the ⭐ Star Delivery board on the back wall
function drawBoard(){const b=RD.best;const t=canvasTex(256,184,(x,w,h)=>{x.fillStyle='#24302a';x.fillRect(0,0,w,h);x.strokeStyle='#c9a24a';x.lineWidth=8;x.strokeRect(4,4,w-8,h-8);
    x.fillStyle='#ffd590';x.textAlign='center';x.font='700 26px "Trebuchet MS",sans-serif';x.fillText('⭐ Star Delivery ⭐',w/2,40);
    x.fillStyle='#f6f1e6';x.font='700 30px "Trebuchet MS",sans-serif';x.fillText(b?b.n:'Could it be you?',w/2,96,w-24);
    x.font='24px "Trebuchet MS",sans-serif';x.fillText(b?`🛵 3 orders in ${fmtT(b.t)}`:'🛵 Win a delivery rush',w/2,140,w-24);});
  const m=RST.board;if(m.map)m.map.dispose();m.map=t;m.needsUpdate=true;}
drawBoard();

/* ---------- every frame ---------- */
anims.push((t,dt)=>{if(!started)return;const p=player.pos;
  const near=curZone===RZ||restOpen||Math.hypot(p.x-RZ.x,p.z-RZ.z)<RZ.r+14;
  if(near){buildRest();for(const o of RP.all)rStep(o,dt);
    // townspeople walking through never stand in a chair (or on someone sitting in it)
    for(const f of FRIENDS){if(Math.hypot(f.pos.x-RZ.x,f.pos.z-RZ.z)>RZ.r+1)continue;for(const s of RST.seats){const w=seatSpot(s),dx=f.pos.x-w.x,dz=f.pos.z-w.z,d=Math.hypot(dx,dz);
      if(d<.7){const k=d>.001?(.7-d)/d:0;if(k){f.pos.x+=dx*k;f.pos.z+=dz*k;}else f.pos.z+=.7;f.g.position.copy(f.pos);if(f.tgt&&Math.hypot(f.tgt.x-w.x,f.tgt.z-w.z)<.7)f.tgt=null;}}}}
  if(restOpen&&meal.mode==='eat'){if(!av.emote||av.emote.id!=='chair'&&av.emote.id!=='cheer')av.play('chair');handFork(meal.phase==='eat'||meal.phase==='eatSweet');biteAnim(dt);}
  rushStep(dt);custStep(dt);
  if(curZone!==restZone){restZone=curZone;if(curZone===RZ&&!closetOpen&&!DL.on)setTimeout(()=>toast('Step on the 🍽️ pad to eat, or the 🛵 pad for a delivery rush!'),1600);}
  if(DL.on)return;
  {const [lx,lz]=RZ.toLocal(p.x,p.z),P=RST.spad,d=Math.hypot(lx-P.lx,lz-P.lz);if(d<P.r&&player.onGround&&!closetOpen){if(!onRSPad){onRSPad=true;openRest('eat');}}else if(d>1.3)onRSPad=false;}
  {const [lx,lz]=RZ.toLocal(p.x,p.z),P=RST.dpad,d=Math.hypot(lx-P.lx,lz-P.lz);if(d<P.r&&player.onGround&&!closetOpen){if(!onRDPad){onRDPad=true;openRest('rush');}}else if(d>1.3)onRDPad=false;}});

addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{restaurant:{RST,meal,DL,RP,RD,seatTaken,pickSeat,openRest,closeRest,order,takeBite,takeSip,startRush,endRush,
  state:()=>({open:restOpen,phase:meal.phase,seat:RST.seats.indexOf(meal.seat),bites:meal.bites,food:meal.food&&meal.food.g.userData.kind,rosie:RP.rosie&&{x:RP.rosie.pos.x,z:RP.rosie.pos.z,tray:RP.rosie.tray.visible,walking:!!(RP.rosie.path&&RP.rosie.path.length)},
    rush:{on:DL.on,i:DL.i,t:DL.t,limit:DL.limit,box:!!(DL.box&&DL.box.parent),orders:DL.orders.map(o=>({id:o.z.id,x:o.p.x,z:o.p.z})),cust:DL.cust&&{x:DL.cust.pos.x,z:DL.cust.pos.z}},best:RD.best||null})}});});
