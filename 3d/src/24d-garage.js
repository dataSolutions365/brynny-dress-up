/* ===== Car Garage mini game =====
   Step on the glowing wrench pad in the Car Garage. Four jobs, in any order:
   🛞 change a flat tire, 🛢️ change the oil, ⚙️ fix the engine, 🎨 paint and customize your car.
   The car and the garage are built in 11b-place-garage.js (CARX). Your car's look is saved in SAVE.car. */
const CAR_COLORS=['#e0263b','#ff6fae','#ff8a1f','#ffd23f','#7ee081','#0b6e3a','#2fd1c5','#4fb6ff','#3a5bd9','#8e6cff','#2d2d3a','#ffffff','#c0c0c0','#d4af37'];
const CAR_FIN=[['shiny','✨','Shiny'],['metal','🪩','Metallic'],['matte','🧱','Matte'],['glitter','💖','Glitter']];
const CAR_RIMS=[['silver','⚪','Silver'],['black','⚫','Black'],['gold','🟡','Gold'],['match','🎨','Match car']];
const CAR_DECO=[['none','','None'],['racing','🏁','Racing stripes'],['flames','🔥','Flames'],['bolt','⚡','Lightning'],['stars','⭐','Stars'],['hearts','💖','Hearts']];
const CAR_SPOIL=[['none','','None'],['small','','Small'],['big','','Big wing']];
const CAR_GLOW=[['none','','Off'],['#ff4d8d','💗','Pink'],['#4fb6ff','💙','Blue'],['#7ee081','💚','Green'],['#b388ff','💜','Purple']];
const CAR_PARTS=[['battery','🔋','Battery'],['plug','⚡','Spark plug'],['belt','➰','Belt'],['filter','🌬️','Air filter']];
const carDefault=()=>({paint:'#e0263b',fin:'shiny',rims:'silver',deco:'racing',decoC:'#ffffff',spoil:'small',glow:'none',plate:''});
SAVE.car={...carDefault(),...(SAVE.car&&typeof SAVE.car==='object'?SAVE.car:{})};

/* ---------- how the car looks ---------- */
function decoTex(kind,col){return canvasTex(512,96,(x,w,h)=>{x.fillStyle=col;x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=3;
  if(kind==='flames'){// flames start at the front (right side of the picture) and lick back
    for(let i=0;i<6;i++){const y=h/2+(i-2.5)*11,L=170+((i*73)%5)*40;x.beginPath();x.moveTo(w,y-16);x.quadraticCurveTo(w-L*.55,y-30,w-L,y+(i%2?-6:6));x.quadraticCurveTo(w-L*.5,y+8,w,y+16);x.closePath();x.fill();x.stroke();}
    x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<6;i++){const y=h/2+(i-2.5)*11,L=(170+((i*73)%5)*40)*.55;x.beginPath();x.moveTo(w,y-6);x.quadraticCurveTo(w-L*.5,y-12,w-L,y);x.quadraticCurveTo(w-L*.5,y+4,w,y+6);x.fill();}}
  else if(kind==='bolt'){x.beginPath();const pts=[[10,52],[150,30],[140,50],[300,24],[290,46],[500,14],[330,66],[340,46],[180,74],[190,54]];x.moveTo(...pts[0]);pts.slice(1).forEach(p=>x.lineTo(...p));x.closePath();x.fill();x.stroke();}
  else if(kind==='stars'){const star=(cx,cy,r)=>{x.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();x.fill();x.stroke();};
    [[60,50,26],[140,36,16],[210,56,30],[300,40,18],[380,54,28],[460,38,16]].forEach(s=>star(...s));}
  else if(kind==='hearts'){const heart=(cx,cy,s)=>{x.beginPath();x.moveTo(cx,cy+s*.9);x.bezierCurveTo(cx-s*1.4,cy-s*.1,cx-s*.6,cy-s*1.1,cx,cy-s*.35);x.bezierCurveTo(cx+s*.6,cy-s*1.1,cx+s*1.4,cy-s*.1,cx,cy+s*.9);x.fill();x.stroke();};
    [[60,50,26],[140,40,16],[220,52,30],[310,40,18],[390,52,28],[465,42,16]].forEach(s=>heart(...s));}});}
function plateTex(t){return canvasTex(256,88,(x,w,h)=>{x.fillStyle='#ffffff';roundRect(x,3,3,w-6,h-6,12);x.fill();x.lineWidth=6;x.strokeStyle='#3a5bd9';x.stroke();
  x.fillStyle='#1f2e7a';x.font='800 50px "Trebuchet MS", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(t,w/2,h/2+3,w-24);});}
const carPlate=()=>(SAVE.car.plate||(SAVE.name||'Brynny')).toUpperCase().slice(0,8);
let carDecoKey='',carPlateKey='';
function applyCar(){const C=SAVE.car,P=CARX.paint;P.color.set(C.paint);
  const F={shiny:[.3,.25,1,null],metal:[.9,.3,.6,null],matte:[0,.85,0,null],glitter:[.5,.3,1,TEX.glitter]}[C.fin]||[.3,.25,1,null];
  P.metalness=F[0];P.roughness=F[1];P.clearcoat=F[2];if(P.map!==F[3]){P.map=F[3];P.needsUpdate=true;}
  const R={silver:['#d9d9e8',1,.2],black:['#2b2b33',.6,.35],gold:['#e8c25a',1,.22],match:[C.paint,.5,.3]}[C.rims]||['#d9d9e8',1,.2];
  CARX.rimM.color.set(R[0]);CARX.rimM.metalness=R[1];CARX.rimM.roughness=R[2];
  CARX.stripes.forEach(s=>s.visible=C.deco==='racing');CARX.stripeM.color.set(C.decoC);
  const side=['flames','bolt','stars','hearts'].includes(C.deco);CARX.sides.forEach(s=>s.visible=side);
  if(side&&carDecoKey!==C.deco+C.decoC){carDecoKey=C.deco+C.decoC;if(CARX.sideM.map)CARX.sideM.map.dispose();CARX.sideM.map=decoTex(C.deco,C.decoC);CARX.sideM.needsUpdate=true;}
  for(const k in CARX.spoil)CARX.spoil[k].visible=C.spoil===k;
  CARX.glow.visible=C.glow!=='none';if(C.glow!=='none')CARX.glow.material.color.set(C.glow);
  const pt=carPlate();if(carPlateKey!==pt){carPlateKey=pt;const m=CARX.plate.material;if(m.map)m.map.dispose();m.map=plateTex(pt);m.needsUpdate=true;}}
applyCar();

/* ---------- the jobs, one step at a time ---------- */
// lift: how high the car sits on that step. hood: the hood is open. cam: where the camera looks.
const GJ={
  tire:[{id:'lift',say:'Raise the car up on the lift.',btn:'⬆️ Raise the lift',cam:'car'},
    {id:'loosen',lift:.35,cam:'wheel'},
    {id:'pull',say:'Tap or swipe the flat tire to pull it off.',lift:.35,cam:'wheel'},
    {id:'spare',say:'Tap the shiny new tire to put it on.',lift:.35,cam:'spare'},
    {id:'tighten',lift:.35,cam:'wheel'},
    {id:'lower',say:'All tight! Lower the car back down.',btn:'⬇️ Lower the car',lift:.35,cam:'car'}],
  oil:[{id:'lift',say:'Raise the car up high so you can get under it.',btn:'⬆️ Raise the lift',cam:'car'},
    {id:'plug',say:'Tap the gold drain plug under the car to unscrew it.',lift:1.45,cam:'under'},
    {id:'drain',say:'Glug glug! The old black oil is draining out...',lift:1.45,cam:'under'},
    {id:'plugin',say:'Tap to screw the drain plug back in.',lift:1.45,cam:'under'},
    {id:'lower',say:'Lower the car back down.',btn:'⬇️ Lower the car',lift:1.45,cam:'car'},
    {id:'hood',say:'Tap the hood to open it.',btn:'🔓 Open the hood',cam:'car'},
    {id:'cap',say:'Tap the yellow oil cap to take it off.',hood:1,cam:'bay'},
    {id:'pour',say:'Press and hold to pour in new oil. Let go when it reaches the green!',hood:1,cam:'bay'},
    {id:'capon',say:'Tap to put the oil cap back on.',hood:1,cam:'bay'}],
  engine:[{id:'hood',say:'Smoke is coming out! Tap the hood to open it.',btn:'🔓 Open the hood',cam:'car'},
    {id:'fix',hood:1,cam:'bay'},
    {id:'start',say:'Everything is fixed. Turn the key!',btn:'🔑 Start the engine',hood:1,cam:'car'}]};
const GARTABS=[['tire','🛞','Tire'],['oil','🛢️','Oil'],['engine','⚙️','Engine'],['paint','🎨','Paint']];
const GPAY={tire:[6,'Tire changed!'],oil:[6,'Oil changed!'],engine:[8,'Engine fixed!']};
let garageOpen=false;
const gar={job:'tire',s:{tire:0,oil:0,engine:0},n:0,broken:new Set(),removed:null,drain:0,fill:0,pid:null,lift:0,hood:0,tw:[],shake:0,drive:0,run:0,smokeT:0,busy:false};
const garCam={p:new THREE.Vector3(),t:new THREE.Vector3(),dy:0,dp:0,id:null,x:0,y:0},gTgt=new THREE.Vector3(),gWant=new THREE.Vector3(),gV=new THREE.Vector3();
const jobDone=j=>gar.s[j]>=GJ[j].length;
const allFixed=()=>jobDone('tire')&&jobDone('oil')&&jobDone('engine');
const curStep=(j=gar.job)=>GJ[j]?GJ[j][gar.s[j]]:null;
const midJob=j=>gar.s[j]>0&&!jobDone(j);
function garTw(d,f,done){gar.tw.push({t:0,d,f,done});}
const gsnd={ratchet(){for(let i=0;i<6;i++)tone(2200,.025,'square',.03,i*.06);},clunk(){tone(140,.12,'triangle',.18);},
  hum(){tone(110,.7,'sine',.07,0,150);},vroom(){tone(55,.6,'sawtooth',.09,0,120);tone(120,.7,'sawtooth',.08,.55,260);tone(260,.5,'sawtooth',.05,1.2,110);},
  honk(){for(const w of [0,.25]){tone(392,.18,'square',.05,w);tone(494,.18,'square',.05,w);}},spray(){tone(5000,.25,'sawtooth',.012,0,3500);}};

function resetJob(j){const X=CARX;
  if(j==='tire'){const w=X.fix,t=w.userData.tire;w.visible=true;w.position.copy(w.userData.home);w.rotation.set(0,0,0);t.material=X.flatM;t.scale.set(1.05,.74,.95);t.position.y=-.06;
    w.userData.nuts.forEach(n=>{n.visible=true;n.position.copy(n.userData.home);n.rotation.set(Math.PI/2,0,0);n.userData.busy=false;});
    X.spare.visible=true;X.spare.position.set(1.95,.305,-.1);X.spare.rotation.set(0,-.5,0);}
  if(j==='oil'){X.plug.visible=true;X.plug.position.copy(X.plug.userData.home);X.cap.visible=true;X.cap.position.copy(X.cap.userData.home);X.cap.rotation.set(0,0,0);gar.drain=0;gar.fill=0;X.bucketOil.scale.y=.001;}
  if(j==='engine'){const ids=CAR_PARTS.map(p=>p[0]).sort(()=>Math.random()-.5);gar.broken=new Set(ids.slice(0,2+(Math.random()<.5?1:0)));gar.removed=null;
    for(const [id] of CAR_PARTS){const p=X.parts[id];p.g.visible=true;p.g.position.copy(p.home);p.g.scale.setScalar(1);p.good.visible=!gar.broken.has(id);p.bad.visible=gar.broken.has(id);}}
  gar.s[j]=0;gar.n=0;}
['tire','oil','engine'].forEach(resetJob);

function nextStep(){const j=gar.job;gar.s[j]++;gar.n=0;garCam.dy=garCam.dp=0;sfx('pop');if(jobDone(j))finishJob(j);renderGarage();}
function finishJob(j){const [n,why]=GPAY[j];did('car',j);sfx('tada');banner({tire:'🛞 New tire on!',oil:'🛢️ Fresh oil!',engine:'🏁 Vroom! It runs great!'}[j]);
  burst(carTop(),rnd(['#4fb6ff','#ffd23f','#7ee081','#ff6fae']),30,2,.09);try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}if(av.play)av.play('cheer');
  const paid=SAVE.garPaid||(SAVE.garPaid={});if(Date.now()-(paid[j]||0)>3e5){paid[j]=Date.now();persist();setTimeout(()=>earn(n,why),700);}
  if(allFixed()){did('carfixed');setTimeout(()=>{toast('Your car is all fixed up! Now try 🎨 Paint 🚗');if(Date.now()-(paid.all||0)>3e5){paid.all=Date.now();persist();earn(5,'Car all fixed!');}},2200);}}
const carTop=()=>CARX.g.localToWorld(gV.set(0,1.1,0)).clone();

/* ---------- open and close ---------- */
function openGarage(){if(closetOpen)return;closeTalk();const z=Z.garage;garageOpen=closetOpen=true;z.padLbl.visible=false;
  document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  if(allFixed()&&gar.wasFixed){['tire','oil','engine'].forEach(resetJob);setTimeout(()=>toast('Your car needs a tune-up again! 🔧'),500);}
  gar.wasFixed=false;if(gar.job!=='paint'&&jobDone(gar.job))gar.job=['tire','oil','engine'].find(j=>!jobDone(j))||'paint';
  const [px,pz]=z.toWorld(-2.3,.5),[cx,cz]=z.toWorld(0,CARX.cz);player.pos.set(px,0,pz);player.vy=0;player.speed=0;player.face=Math.atan2(cx-px,cz-pz);
  garCam.p.copy(camera.position);garCam.t.copy(cam.fv||player.pos);garCam.dy=garCam.dp=0;
  renderGarage();$('#garage').classList.add('show');$('#gcontent').scrollTop=0;sfx('tada');}
function closeGarage(){if(!garageOpen)return;const z=Z.garage;garageOpen=closetOpen=false;z.padLbl.visible=true;gar.pid=null;garCam.id=null;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  document.body.classList.remove('dressing');$('#garage').classList.remove('show');persist();cam.yaw=cam.cy=z.rot;player.face=z.rot;
  if(allFixed())gar.wasFixed=true;
  toast(allFixed()?'Your car looks awesome! 🚗✨':'Come back to finish fixing your car 🔧');}
$('#gdone').onclick=closeGarage;$('#gphoto').onclick=()=>{wantPhoto=true;};

/* ---------- the panel ---------- */
function garSay(st){const n=gar.n;
  if(st.id==='loosen')return `Tap each lug nut to spin it off. (${n} of 5)`;
  if(st.id==='tighten')return `Tap each hole to tighten a lug nut back on. (${n} of 5)`;
  if(st.id==='fix'){if(gar.removed){const p=CAR_PARTS.find(p=>p[0]===gar.removed);return `Now tap the new ${p[1]} ${p[2].toLowerCase()} below to put it in.`;}
    return `Find the smoking parts and tap one to take it out. (${gar.broken.size} left)`;}
  return st.say;}
function renderGarage(){const C=SAVE.car;
  $('#gtabs').innerHTML=GARTABS.map(([id,ico,n])=>`<button class="tab${id===gar.job?' on':''}" data-gtab="${id}"><b>${ico}${id!=='paint'&&jobDone(id)?'<i>✅</i>':''}</b>${n}</button>`).join('');
  let h='';const j=gar.job;
  if(j==='paint'){const chips=(list,cur,kind)=>`<div class="chips">${list.map(([id,e,n])=>`<button class="${id===cur?'on':''}" data-${kind}="${id}">${e?e+' ':''}${n}</button>`).join('')}</div>`;
    const sw=(list,cur,kind)=>`<div class="swatches">${list.map(c=>`<button class="sw${c===cur?' on':''}" style="background:${c}" data-${kind}="${c}" aria-label="color ${c}"></button>`).join('')}</div>`;
    const cols=myColors(CAR_COLORS);
    h=`<button class="btn" data-drive="1">🚗 Take it for a spin!</button>
      <h3>Paint color</h3>${sw(cols,C.paint,'paint')}<h3>Shine</h3>${chips(CAR_FIN,C.fin,'fin')}<h3>Wheels</h3>${chips(CAR_RIMS,C.rims,'rims')}
      <h3>Stickers</h3>${chips(CAR_DECO,C.deco,'deco')}${C.deco!=='none'?'<div style="height:8px"></div>'+sw(cols,C.decoC,'decoc'):''}
      <h3>Spoiler</h3>${chips(CAR_SPOIL,C.spoil,'spoil')}<h3>Lights under the car</h3>${chips(CAR_GLOW,C.glow,'glow')}
      <h3>License plate</h3><input class="binput" id="gplate" maxlength="8" placeholder="${carPlate()}" autocomplete="off" value="${(C.plate||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}">`;}
  else if(jobDone(j)){const nx=['tire','oil','engine'].find(k=>!jobDone(k));
    h=`<p class="gdone">✅ ${{tire:'The new tire is on!',oil:'Fresh oil is in!',engine:'The engine purrs like a kitty!'}[j]}</p>
      <p class="drawhint">${nx?`Next, tap ${GARTABS.find(t=>t[0]===nx).slice(1,3).join(' ')} up top.`:'Every job is done. Now make your car look awesome in 🎨 Paint!'}</p>
      <button class="btn" data-again="1">🔁 Do it again</button>`;}
  else{const steps=GJ[j],i=gar.s[j],st=steps[i];
    h=`<div class="gpips">${steps.map((_,k)=>`<span class="${k<i?'ok':k===i?'on':''}"></span>`).join('')}</div><p class="gsay">${garSay(st)}</p>`;
    if(st.btn)h+=`<button class="btn" data-gbtn="1">${st.btn}</button>`;
    if(st.id==='drain')h+=`<div class="gbar drain"><i id="gbarI" style="width:${(1-gar.drain)*100}%"></i></div><p class="drawhint">Old oil left in the car</p>`;
    if(st.id==='pour')h+=`<div class="gbar"><em></em><i id="gbarI" style="width:${Math.min(100,gar.fill*100)}%"></i></div><p class="drawhint">Oil in the engine. Stop in the green part!</p>`;
    if(st.id==='fix')h+=`<div class="gtray">${CAR_PARTS.map(([id,e,n])=>`<button data-part="${id}" class="${gar.removed===id?'want':''}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`;}
  $('#gcontent').innerHTML=h;
  const inp=$('#gplate');if(inp){inp.addEventListener('input',()=>{SAVE.car.plate=inp.value.replace(/[^\w !?♥-]/g,'').slice(0,8);applyCar();persist();});inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();});}}
$('#gtabs').onclick=e=>{const b=e.target.closest('[data-gtab]');if(!b)return;gar.job=b.dataset.gtab;gar.n=0;garCam.dy=garCam.dp=0;sfx('pop');renderGarage();$('#gcontent').scrollTop=0;};
$('#gcontent').onclick=e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset,C=SAVE.car;
  if(d.gbtn){const st=curStep();if(!st||gar.busy)return;
    if(st.id==='lift'||st.id==='lower'){gsnd.hum();nextStep();return;}
    if(st.id==='hood'){gsnd.clunk();nextStep();return;}
    if(st.id==='start'){startEngine();return;}}
  if(d.again){resetJob(gar.job);sfx('pop');renderGarage();return;}
  if(d.part){partPick(d.part);return;}
  if(d.drive){driveCar();return;}
  const set=(k,v)=>{C[k]=v;applyCar();persist();did('carpaint',k);gsnd.spray();burst(carTop(),k==='paint'?v:'#ffffff',22,1.4,.07);renderGarage();};
  if(d.paint)return set('paint',d.paint);if(d.fin)return set('fin',d.fin);if(d.rims)return set('rims',d.rims);if(d.deco)return set('deco',d.deco);
  if(d.decoc)return set('decoC',d.decoc);if(d.spoil)return set('spoil',d.spoil);if(d.glow)return set('glow',d.glow);};

/* ---------- tapping things on the car ---------- */
// Little things like lug nuts are hard to hit with a finger, so a tap picks whatever is closest on the screen.
function garScr(o){o.getWorldPosition(gV).project(camera);return [(gV.x+1)/2*innerWidth,(1-gV.y)/2*innerHeight,gV.z];}
function nearest(e,list,R){R*=isTouch?1.25:1;let best=null,bd=R;for(const o of list){const [x,y,z]=garScr(o);if(z>1)continue;const d=Math.hypot(x-e.clientX,y-e.clientY);if(d<bd){bd=d;best=o;}}return best;}
function garTap(e){const st=curStep();if(gar.job==='paint'||!st||gar.busy)return false;const X=CARX,nuts=X.fix.userData.nuts,s=st.id;
  if(s==='loosen'){const n=nearest(e,nuts.filter(n=>n.visible&&!n.userData.busy),40);if(!n)return false;n.userData.busy=true;gsnd.ratchet();
    const z0=n.position.z,r0=n.rotation.y;garTw(.5,k=>{n.rotation.y=r0+k*12;n.position.z=z0+k*.14;},()=>{n.visible=false;n.userData.busy=false;gar.n++;if(gar.n>=5)nextStep();else renderGarage();});return true;}
  if(s==='tighten'){const n=nearest(e,nuts.filter(n=>!n.visible&&!n.userData.busy),40);if(!n)return false;n.userData.busy=true;n.visible=true;gsnd.ratchet();
    const h=n.userData.home;garTw(.5,k=>{n.rotation.y=(1-k)*12;n.position.z=h.z+(1-k)*.14;},()=>{n.userData.busy=false;gar.n++;if(gar.n>=5)nextStep();else renderGarage();});return true;}
  if(s==='pull'){if(!nearest(e,[X.fix],90))return false;pullTire();return true;}
  if(s==='spare'){if(!nearest(e,[X.spare],95))return false;putSpare();return true;}
  if(s==='plug'){if(!nearest(e,[X.plug],70))return false;gar.busy=true;gsnd.ratchet();const p=X.plug,h=p.userData.home;
    garTw(.6,k=>{p.rotation.y=k*14;p.position.y=h.y-k*.06;},()=>{garTw(.35,k=>{p.position.y=h.y-.06-k*k*(gar.lift+.1);},()=>{p.visible=false;p.position.set(h.x,h.y-.06,h.z);gsnd.clunk();gar.busy=false;nextStep();});});return true;}
  if(s==='plugin'){if(!nearest(e,[X.plug],70))return false;gar.busy=true;const p=X.plug,h=p.userData.home;p.visible=true;gsnd.ratchet();
    garTw(.6,k=>{p.rotation.y=(1-k)*14;p.position.y=h.y-(1-k)*.06;},()=>{gar.busy=false;nextStep();});return true;}
  if(s==='hood'){if(!nearest(e,[X.hoodM],130))return false;gsnd.clunk();nextStep();return true;}
  if(s==='cap'){if(!nearest(e,[X.cap],70))return false;gar.busy=true;const c=X.cap,h=c.userData.home;sfx('pop');
    garTw(.6,k=>{c.rotation.y=k*8;c.position.set(h.x+k*.12,h.y+Math.sin(k*Math.PI)*.15+k*.02,h.z-k*.12);},()=>{gar.busy=false;nextStep();});return true;}
  if(s==='capon'){if(!nearest(e,[X.cap],80))return false;gar.busy=true;const c=X.cap,h=c.userData.home,p0=c.position.clone();sfx('pop');
    garTw(.6,k=>{c.rotation.y=(1-k)*8;c.position.lerpVectors(p0,h,k);c.position.y+=Math.sin(k*Math.PI)*.15;},()=>{gar.busy=false;nextStep();});return true;}
  if(s==='fix'){const list=CAR_PARTS.map(p=>X.parts[p[0]].g).filter(g=>g.visible);const g=nearest(e,list,60);if(!g)return false;
    const id=CAR_PARTS.map(p=>p[0]).find(id=>X.parts[id].g===g);
    if(!gar.broken.has(id)){toast('That one looks good 👍 Find a smoking part!');return true;}
    if(gar.removed){toast('Put the new part in first 👇');return true;}
    gar.busy=true;gar.removed=id;gsnd.ratchet();const P=X.parts[id];
    garTw(.6,k=>{P.g.position.set(P.home.x,P.home.y+k*.5,P.home.z+k*.4);P.g.scale.setScalar(1-k*.8);},()=>{P.g.visible=false;gar.busy=false;renderGarage();});
    renderGarage();return true;}
  return false;}
function partPick(id){if(!gar.removed){toast('First tap a smoking part in the engine to take it out 💨');return;}
  if(id!==gar.removed){const p=CAR_PARTS.find(p=>p[0]===gar.removed);toast(`Oops, that doesn't fit! You took out the ${p[2].toLowerCase()} ${p[1]}`);tone(180,.15,'square',.05);return;}
  const P=CARX.parts[id];gar.removed=null;gar.broken.delete(id);P.g.visible=true;P.good.visible=true;P.bad.visible=false;P.g.scale.setScalar(1);gar.busy=true;
  garTw(.45,k=>{P.g.position.set(P.home.x,P.home.y+(1-k)*(1-k)*.5,P.home.z);},()=>{gar.busy=false;gsnd.clunk();burst(P.g.getWorldPosition(new THREE.Vector3()),'#7ee081',14,.8,.05);
    if(gar.broken.size===0)nextStep();else renderGarage();});
  renderGarage();}
function pullTire(){const w=CARX.fix,h=w.userData.home;gar.busy=true;sfx('pop');
  garTw(.4,k=>{w.position.z=h.z+k*.5;},()=>garTw(.7,k=>{w.position.set(h.x+k*1.1,h.y-k*k*gar.lift,h.z+.5+k*.6);w.rotation.z=-k*6;},()=>{w.visible=false;gsnd.clunk();burst(w.getWorldPosition(new THREE.Vector3()),'#cfcfd8',12,.8,.06);gar.busy=false;nextStep();}));}
function putSpare(){const w=CARX.fix,h=w.userData.home,t=w.userData.tire;gar.busy=true;CARX.spare.visible=false;
  t.material=CARX.spare.userData.tire.material;t.scale.set(1,1,.95);t.position.y=0;w.userData.nuts.forEach(n=>{n.visible=false;n.position.copy(n.userData.home);n.rotation.set(Math.PI/2,0,0);});
  w.visible=true;w.rotation.set(0,0,0);garTw(.55,k=>{w.position.set(h.x,h.y,h.z+(1-k)*.7);w.rotation.z=(1-k)*3;},()=>{gsnd.clunk();gar.busy=false;nextStep();});}
function startEngine(){if(gar.busy)return;gar.busy=true;gsnd.vroom();gar.shake=1.8;gar.run=2.4;
  setTimeout(()=>{gar.busy=false;if(garageOpen&&gar.job==='engine')nextStep();},1900);}
function driveCar(){if(gar.drive||gar.busy)return;gar.drive=.001;gsnd.vroom();setTimeout(()=>gsnd.honk(),1500);did('carspin');}

/* pointer: tap things, press and hold to pour oil, drag anywhere else to look around */
function garageDown(e){const cap=()=>{try{canvas.setPointerCapture(e.pointerId);}catch(_){}};const st=curStep();
  if(gar.job!=='paint'&&st&&st.id==='pour'&&!gar.busy){if(gar.pid===null){gar.pid=e.pointerId;cap();}return;}
  if(garTap(e))return;
  if(garCam.id===null){garCam.id=e.pointerId;garCam.x=e.clientX;garCam.y=e.clientY;garCam.moved=0;cap();}}
function garageMove(e){if(e.pointerId===garCam.id){const dx=e.clientX-garCam.x,dy=e.clientY-garCam.y;garCam.dy=Math.max(-1.4,Math.min(1.4,garCam.dy-dx*.006));garCam.dp=Math.max(-.4,Math.min(.6,garCam.dp+dy*.004));garCam.x=e.clientX;garCam.y=e.clientY;garCam.moved+=Math.abs(dx)+Math.abs(dy);
    // a swipe across the flat tire also pulls it off
    const st=curStep();if(st&&st.id==='pull'&&!gar.busy&&garCam.moved>30&&nearest(e,[CARX.fix],120)){garCam.id=null;pullTire();}}}
function garageUp(e){if(e.pointerId===gar.pid){gar.pid=null;const st=curStep();if(!garageOpen||!st||st.id!=='pour')return;
    if(gar.fill>=.78)pourDone();else if(gar.fill>0)toast('A little more! Fill it up to the green 🟩');}
  if(e.pointerId===garCam.id)garCam.id=null;}
function pourDone(spill){gar.pid=null;CARX.gold.visible=false;CARX.jug.visible=false;
  if(spill){toast('Oops, a little spilled! Wiped it up 🧽');gar.fill=.95;}else toast('Just right! 👍');nextStep();}

/* ---------- camera ---------- */
function garView(){const z=Z.garage,L=gar.lift,cz=CARX.cz,st=gar.job==='paint'?null:curStep(),v=gar.drive?'car':st?st.cam:'car',dx=CARX.root.position.x;
  const at=(lx,y,lz)=>{const [x,w]=z.toWorld(lx+dx,lz);gTgt.set(x,y,w);};let yaw=.45,pitch=.28,d=3.9;
  if(v==='wheel'){at(.78,L+.3,cz+.5);yaw=.3;pitch=.12;d=1.45;}
  else if(v==='spare'){at(1.35,L*.5+.3,cz+.45);yaw=.15;pitch=.3;d=2.3;}
  else if(v==='under'){at(.15,(L+.16)*.62+.05,cz);yaw=0;pitch=.02;d=2.7;}
  else if(v==='bay'){at(.74,L+.55,cz);yaw=Math.PI/2-.55;pitch=.85;d=1.5;}
  else{at(.1,L*.5+.55,cz);yaw=.6;pitch=.22;d=3.3;}
  if(gar.job==='paint')d=3.5;
  return [yaw+z.rot+garCam.dy,Math.max(-.2,Math.min(1.3,pitch+garCam.dp)),d];}
function garageCam(dt){const [yaw,pitch,d0]=garView(),land=innerWidth>innerHeight*1.25;const d=d0*(land?1:1.3)*ZOOM.k;
  gWant.set(gTgt.x+Math.sin(yaw)*Math.cos(pitch)*d,gTgt.y+Math.sin(pitch)*d,gTgt.z+Math.cos(yaw)*Math.cos(pitch)*d);
  // stay inside the garage: not behind the walls and not up behind the big sign over the door
  {const z=Z.garage;let [lx,lz]=z.toLocal(gWant.x,gWant.z);lx=Math.max(-4.1,Math.min(4.1,lx));lz=Math.max(-4,lz);if(lz>1.4)gWant.y=Math.min(gWant.y,2.3);const [wx,wz]=z.toWorld(lx,lz);gWant.x=wx;gWant.z=wz;}
  const a=Math.min(1,dt*5);garCam.p.lerp(gWant,a);garCam.t.lerp(gTgt,a);camera.position.copy(garCam.p);camera.lookAt(garCam.t);}

/* ---------- every frame: the lift, the hood, smoke, oil, hints ---------- */
const smokeTex=canvasTex(64,64,(x)=>{const r=x.createRadialGradient(32,32,0,32,32,30);r.addColorStop(0,'rgba(200,200,205,.9)');r.addColorStop(1,'rgba(200,200,205,0)');x.fillStyle=r;x.fillRect(0,0,64,64);});
const SMOKE=[];for(let i=0;i<16;i++){const s=sprite(smokeTex,.2,.2);s.visible=false;s.material.depthWrite=false;scene.add(s);SMOKE.push({s,t:9,v:new THREE.Vector3()});}
function puff(p,dark,v){const o=SMOKE.find(o=>o.t>=1.4);if(!o)return;o.t=0;o.s.position.copy(p);o.s.visible=true;o.s.material.color.set(dark?'#6a6a70':'#ffffff');o.v.copy(v||gV.set((Math.random()-.5)*.1,.45,(Math.random()-.5)*.1));}
const hintTex=e=>canvasTex(64,64,(x)=>{x.font='52px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,32,36);});
const gHint=sprite(hintTex('👇'),.2,.2),gHintUp=sprite(hintTex('👆'),.2,.2);gHint.visible=gHintUp.visible=false;gHint.renderOrder=gHintUp.renderOrder=5;
gHint.material.depthTest=gHintUp.material.depthTest=false;scene.add(gHint,gHintUp);
const gW=new THREE.Vector3(),gW2=new THREE.Vector3();
function hintTarget(){if(!garageOpen||gar.job==='paint'||gar.busy)return null;const st=curStep();if(!st)return null;const X=CARX,nuts=X.fix.userData.nuts;
  switch(st.id){case 'loosen':return nuts.find(n=>n.visible&&!n.userData.busy);case 'tighten':return nuts.find(n=>!n.visible&&!n.userData.busy);
    case 'pull':return X.fix;case 'spare':return X.spare;case 'plug':case 'plugin':return X.plug;case 'cap':case 'capon':return X.cap;case 'hood':return X.hoodM;
    case 'fix':return gar.removed?null:CAR_PARTS.map(p=>X.parts[p[0]]).find((P,i)=>gar.broken.has(CAR_PARTS[i][0]))?.g;}return null;}
anims.push((t,dt)=>{const X=CARX;
  for(let i=gar.tw.length-1;i>=0;i--){const w=gar.tw[i];w.t+=dt;const k=Math.min(1,w.t/w.d);w.f(k*k*(3-2*k));if(k>=1){gar.tw.splice(i,1);w.done&&w.done();}}
  // how high the lift is and whether the hood is open: from the step you are on, and any job you left half done
  let L=0,H=0;if(!gar.drive){for(const j of ['tire','oil','engine']){if(!midJob(j)&&j!==gar.job)continue;const st=curStep(j);if(!st)continue;L=Math.max(L,st.lift||0);if(st.hood)H=1;}}
  if(gar.job==='paint')H=0;// paint with the hood shut
  const oldL=gar.lift;gar.lift+=(L-gar.lift)*Math.min(1,dt*2.2);if(Math.abs(L-gar.lift)<.002)gar.lift=L;gar.hood+=(H-gar.hood)*Math.min(1,dt*5);
  X.g.position.y=gar.lift;X.hood.rotation.z=gar.hood*1.15;X.liftTop.position.y=gar.lift+.195;
  {const hh=gar.lift+.11,a=Math.asin(Math.min(.98,hh/1.7));for(const m of X.arms){m.rotation.z=m.userData.s*a;m.position.y=.06+hh/2;}}
  // shaking and puffing when the engine starts
  if(gar.shake>0){gar.shake-=dt;X.g.position.x=Math.sin(t*70)*.012*Math.min(1,gar.shake);X.g.rotation.x=Math.sin(t*53)*.01*Math.min(1,gar.shake);}else{X.g.position.x=0;X.g.rotation.x=0;}
  if(gar.run>0){gar.run-=dt;X.heads.forEach(h=>h.material.color.setScalar(2.4));if(Math.random()<dt*14)puff(X.pipe.getWorldPosition(gW),true,gV.set(0,.3,0).add(gW2.set(-1.2,0,0).applyQuaternion(X.g.getWorldQuaternion(new THREE.Quaternion()))));}
  else if(!gar.drive)X.heads.forEach(h=>h.material.color.set('#fff4c8').multiplyScalar(1.2));
  // take it for a spin: drive forward, honk, back up
  if(gar.drive){gar.drive+=dt;const k=gar.drive,f=k<1.3?Math.sin(k/1.3*Math.PI/2):k<1.8?1:k<3?Math.cos((k-1.8)/1.2*Math.PI/2):0;const x=f*1.6,old=X.root.position.x;X.root.position.x=x;
    for(const w of X.wheels)w.rotation.z-=(x-old)/.305;X.heads.forEach(h=>h.material.color.setScalar(2.4));if(Math.random()<dt*10)puff(X.pipe.getWorldPosition(gW),true);
    if(k>=3){gar.drive=0;X.root.position.x=0;}}
  // old oil draining into the bucket
  X.bucket.visible=gar.s.oil>=1&&gar.s.oil<=4;
  const st=curStep(gar.job==='paint'?'':gar.job),oilSt=curStep('oil');
  if(oilSt&&oilSt.id==='drain'&&garageOpen&&gar.job==='oil'){gar.drain=Math.min(1,gar.drain+dt/3.2);X.plug.userData.home&&X.g.localToWorld(gW.copy(X.plug.userData.home));
    const top=.22,len=gW.y-top;X.stream.visible=len>0;X.stream.position.copy(Z.garage.g.worldToLocal(gW.clone())).setY(top+len/2);X.stream.scale.y=Math.max(.01,len);
    if(Math.random()<dt*6)sfx('bubble');const bar=$('#gbarI');if(bar)bar.style.width=(1-gar.drain)*100+'%';if(gar.drain>=1){X.stream.visible=false;nextStep();}}
  else X.stream.visible=false;
  X.bucketOil.scale.y=Math.max(.001,gar.drain*.17);
  // pouring new oil while you hold your finger down
  if(garageOpen&&st&&st.id==='pour'){X.cap.getWorldPosition(gW);const gl=Z.garage.g.worldToLocal(gW.clone());X.jug.visible=true;X.jug.position.set(gl.x+.12,gl.y+.32,gl.z+.02);X.jug.rotation.set(0,0,gar.pid!==null?.9:.25);
    X.gold.visible=gar.pid!==null;if(gar.pid!==null){gar.fill+=dt*.3;X.gold.position.set(gl.x,gl.y+.12,gl.z);X.gold.scale.y=.22;if(Math.random()<dt*8)tone(300+gar.fill*500,.06,'sine',.04);
      if(gar.fill>1.06){burst(gW.clone().add(gV.set(0,.05,0)),'#e8b13a',20,1,.05);pourDone(true);}}
    const bar=$('#gbarI');if(bar)bar.style.width=Math.min(100,gar.fill*100)+'%';}
  else{X.jug.visible=false;X.gold.visible=false;}
  // smoke from broken engine parts (and from the hood seams while it is closed)
  if(gar.broken.size&&curZone===Z.garage&&!(jobDone('engine'))){gar.smokeT-=dt;if(gar.smokeT<=0){gar.smokeT=.16;const ids=[...gar.broken].filter(id=>id!==gar.removed);
    if(ids.length){if(gar.hood<.4)X.hoodM.localToWorld(gW.set(.3*(Math.random()-.5)*2,.05,(Math.random()-.5)*.8));else X.parts[rnd(ids)].g.getWorldPosition(gW).add(gV.set(0,.08,0));puff(gW,false);}}}
  for(const o of SMOKE){if(o.t>=1.4)continue;o.t+=dt;o.s.position.addScaledVector(o.v,dt);const k=o.t/1.4;o.s.scale.setScalar(.12+k*.35);o.s.material.opacity=(1-k)*.8;if(o.t>=1.4)o.s.visible=false;}
  // a bouncing finger shows what to tap next
  const ht=hintTarget();gHint.visible=gHintUp.visible=false;
  if(ht){ht.getWorldPosition(gW);const under=ht===X.plug,s=under?gHintUp:gHint,b=Math.sin(t*6)*.025;s.visible=true;s.position.copy(gW).add(gV.set(0,under?-.16-b:(ht===X.fix||ht===X.spare?.42:ht===X.hoodM?.2:.12)+b,0));
    const sz=ht===X.fix||ht===X.spare||ht===X.hoodM?.22:.13;s.scale.set(sz,sz,1);}});
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{openGarage,closeGarage,garage:gar,garageHint:()=>{const o=hintTarget();if(!o)return null;const [x,y]=garScr(o);return {x,y};}});});
