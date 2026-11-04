/* ================= ❄️ POLAR ICE: the animals, ⛸️ ice skating, 🎣 ice fishing and 🧱 building an igloo =================
   (the place itself is 12h-place-arctic.js, the animal models 24c9g-arctic-animals.js, the 🚨 Polar escape 24m2-arctic-escape.js)
   - The animals (IA) live here like the Safari Zoo's do: they wander about the snow, never follow you, and you walk up and tap
     "Meet the ..." to pet them, feed them and learn about them (the zoo's panel, openZoo in 24d-barn.js). Feeding sends
     did('icefeed', kind), meeting did('icelearn', kind). The snowy owl sits up on the big ice rock by the way in.
   - ⛸️ Step onto the frozen pond (ICE.rink) and skates appear on your feet: you glide and keep sliding when you let go,
     bounce gently off the snowy bank, and can 🌀 spin (did('icespin')). Time spent skating is saved (SAVE.ice.skate, seconds).
     iceSkateStep() moves you while you skate (25-game-loop.js asks it, like the skate park). Friends see your skates ('ice' in SHOW).
   - 🎣 At a fishing hole tap Ice fish: wait for the bobber to dip, then tap Reel! in time. did('icefish', kind) for each catch;
     the 🌟 golden char is rare. Counts are in SAVE.ice.fish.
   - 🧱 At the igloo spot at the back, tap Build an igloo: every tap brings over snow blocks from the pile, ring by ring up into a dome,
     then the entrance tunnel and a lamp inside. did('igloo') when it's done. It stays built (SAVE.ice.igloo) and you can walk inside;
     tap Build again to knock it down and start over. */
SAVE.ice||={};const IS=SAVE.ice;IS.fish||={};IS.seen||={};IS.skate||=0;IS.spins||=0;
const IZ=Z.arctic,IA=[];
const iceLocal=(x,z)=>IZ.toLocal(x,z);
function iceOk(lx,lz,r){if(Math.hypot(lx,lz)>ICE.fence-.75-r)return false;for(const [x,z,rr] of ICE.avoid)if(Math.hypot(lx-x,lz-z)<rr+r)return false;if(IGL.built&&Math.hypot(lx-ICE.igloo.x,lz-ICE.igloo.z-1.6)<1.1+r)return false;return true;}
function iceSpot(r){for(let i=0;i<80;i++){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*(ICE.fence-1),lx=Math.sin(a)*d,lz=Math.cos(a)*d;if(iceOk(lx,lz,r))return [lx,lz];}return [0,2];}
// the walrus likes to lie at the edge of the frozen lake
function iceSpotW(r){const L=ICE.lake;for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,d=L.r+.45+r+Math.random()*1.2,lx=L.x+Math.sin(a)*d,lz=L.z+Math.cos(a)*d;if(iceOk(lx,lz,r))return [lx,lz];}return iceSpot(r);}
const IGL={built:!!IS.igloo,n:0,blocks:[],g:null,lamp:null,tunnel:null,busy:false};
for(const [k,sc,chick] of [['polarbear',1],['polarbear',.5],['walrus',1],['penguin',1],['penguin',.93],['penguin',1.04],['penguin',1,1],['arcticfox',1],['arcticwolf',1],['snowyowl',1]]){
  ARC_CHICK=!!chick;const a=new FarmAnimal(k);ARC_CHICK=false;a.Z=IZ;a.ok=iceOk;a.spot=k==='walrus'?iceSpotW:iceSpot;a.mates=IA;a.dust.forEach(d=>d.visible=false);
  if(sc!==1){a.g.scale.setScalar(sc);a.h*=sc;a.rad*=sc;a.size*=sc;}if(sc<.8||chick)a.baby=true;
  if(k==='snowyowl'){a.perch=true;[a.lx,a.lz]=[ICE.perch[0],ICE.perch[1]];a.face=Math.PI*.8;}else[a.lx,a.lz]=a.spot(a.rad);
  IA.push(a);scene.add(a.g);placeFarm(a);if(a.perch)a.g.position.y=ICE.perch[2];}
let iceNear=null;
{document.body.insertAdjacentHTML('beforeend','<button class="hud" id="iceMeet"></button><button class="hud" id="iceAct"></button><button class="hud" id="iceAct2"></button>');
 const st=document.createElement('style');st.textContent=`
#iceMeet,#iceAct,#iceAct2{position:fixed;left:50%;transform:translateX(-50%);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5}
#iceMeet{bottom:calc(env(safe-area-inset-bottom) + 250px);background:linear-gradient(90deg,#7cc7e8,#3a8fc8);box-shadow:0 6px 18px rgba(58,143,200,.4)}
#iceAct{bottom:calc(env(safe-area-inset-bottom) + 310px);background:linear-gradient(90deg,#8fd8ff,#5a7bd8);box-shadow:0 6px 18px rgba(90,123,216,.4)}
#iceAct2{bottom:calc(env(safe-area-inset-bottom) + 370px);background:linear-gradient(90deg,#b388ff,#7a5ad8);box-shadow:0 6px 18px rgba(122,90,216,.4)}
#iceAct.go{background:linear-gradient(90deg,#ff6a3d,#e8336d);box-shadow:0 6px 18px rgba(232,51,109,.45)}
#iceMeet:active,#iceAct:active,#iceAct2:active{transform:translateX(-50%) scale(.94)}
body.dressing #iceMeet,body.talking #iceMeet,body.shopping #iceMeet,body.dressing #iceAct,body.talking #iceAct,body.shopping #iceAct,body.dressing #iceAct2,body.talking #iceAct2,body.shopping #iceAct2{display:none!important}
#fishUI{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 150px);z-index:8;display:none;flex-direction:column;align-items:center;gap:8px;pointer-events:none;width:max-content;max-width:calc(100vw - 32px)}
#fishUI.show{display:flex}
#fishUI b{background:rgba(255,255,255,.94);color:#2f4a7a;border-radius:999px;padding:8px 16px;font-size:17px;box-shadow:0 4px 14px rgba(0,0,0,.18);text-align:center;white-space:normal}
#fishUI b.bite{background:#ffd23f;color:#7a3a00;animation:fbite .35s infinite alternate}
#fishUI small{background:rgba(255,255,255,.85);color:#3b2357;border-radius:999px;padding:4px 12px;font-weight:700;font-size:13px}
@keyframes fbite{from{transform:scale(1)}to{transform:scale(1.08)}}
@media (max-height:520px){#iceMeet{bottom:calc(env(safe-area-inset-bottom) + 130px)}#iceAct{bottom:calc(env(safe-area-inset-bottom) + 185px)}#iceAct2{bottom:calc(env(safe-area-inset-bottom) + 240px)}#fishUI{top:calc(env(safe-area-inset-top) + 52px)}}`;
 document.head.appendChild(st);document.body.insertAdjacentHTML('beforeend','<div id="fishUI"><b id="fishMsg"></b><small id="fishCount"></small></div>');}

/* ---------- the animals ---------- */
function iceAnimalsStep(dt){const p=player.pos,near=Math.hypot(p.x-IZ.x,p.z-IZ.z)<45;
  for(const a of IA){if(a.esc)continue;// out on the streets in a Polar escape (24m2-arctic-escape.js)
    if(!near&&!(zooOpen&&a===zooSel)){a.g.visible=false;continue;}a.g.visible=true;
    if(a.perch){// the owl stays up on her rock, turning her head, and faces you while you meet her
      if(zooOpen&&a===zooSel){const [px,pz]=iceLocal(p.x,p.z);a.face=angDamp(a.face,Math.atan2(px-a.lx,pz-a.lz),Math.min(1,dt*4));}
      a.update(dt,0);placeFarm(a);a.g.position.y=ICE.perch[2];a.pos.y=ICE.perch[2];continue;}
    stepFarm(a,dt);}
  // the "Meet" button
  let best=null,bd=1e9;if(!closetOpen&&started&&!barnRide&&!FLY.on)for(const a of IA){if(a.esc||!a.g.visible)continue;const d=Math.hypot(p.x-a.pos.x,p.z-a.pos.z)-a.rad;if(d<1.3&&d<bd){bd=d;best=a;}}
  if(best!==iceNear){iceNear=best;const b=$('#iceMeet');if(best){b.textContent=`${best.F.e} Meet the ${best.baby?'baby ':''}${best.F.n.toLowerCase()}`;b.style.display='block';}else b.style.display='none';}
  if(zooOpen&&zooSel&&IA.includes(zooSel)&&Math.hypot(p.x-zooSel.pos.x,p.z-zooSel.pos.z)>8)closeZoo();}
$('#iceMeet').onclick=()=>{if(iceNear){const a=iceNear;iceNear=null;$('#iceMeet').style.display='none';openZoo(a);}};

/* ---------- ⛸️ ice skating ---------- */
const ICS={on:false,vx:0,vz:0,t:0,blades:[],av:null,saveT:0};
const bladeM=std('#d9dde3',{metalness:.9,roughness:.2}),bladeBoot=phys('#f6f2ea',{roughness:.5,clearcoat:.4});
// skates on an avatar's feet: a white boot round the foot and a steel blade underneath (yours, or a friend's online)
function iceBlades(A,on){if(!A||!A.legs)return;if(!on){if(A.iceB){for(const m of A.iceB){m.parent&&m.parent.remove(m);}A.iceB=null;}A.iceSk=false;return;}
  if(A.iceB)return;A.iceB=[];A.iceSk=true;
  for(const l of A.legs){const an=l.an;if(!an)continue;const g=new THREE.Group();an.add(g);A.iceB.push(g);
    M(sph(.066,14,10),bladeBoot,0,-.012,.045,g,false,false).scale.set(1.15,.95,1.9);
    M(box(.012,.05,.27),bladeM,0,-.1,.045,g,false,false);
    for(const z of [-.04,.13])M(box(.016,.04,.02),bladeM,0,-.07,z,g,false,false);}}
function iceSkateStep(dt,ix,iy,mag){const p=player.pos;
  const can=started&&!closetOpen&&!barnRide&&!FLY.on&&!SK.on&&!BIKE.on&&!(typeof SW!=='undefined'&&SW.k>.05)&&!ICF.on;
  const k=onRink(p.x,p.z);
  if(!ICS.on){if(!can||k<.02||!player.onGround)return false;// step onto the ice: skates on
    ICS.on=true;ICS.vx=Math.sin(player.face)*player.speed*.5;ICS.vz=Math.cos(player.face)*player.speed*.5;iceBlades(av,true);ICS.av=av;
    if(!IS.skated){IS.skated=1;persist();setTimeout(()=>toast('⛸️ Skates on! Glide around the ice. Let go and you keep sliding!'),300);}did('iceskate',0);iceButtons();}
  else if(!can){iceSkateOff();return false;}
  if(ICS.av!==av){iceBlades(ICS.av,false);iceBlades(av,true);ICS.av=av;}// you changed clothes: the skates go on the new you
  // push with the joystick, glide when you let go
  if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1,mx=(fx*-iy+rx*ix)/n,mz=(fz*-iy+rz*ix)/n;
    ICS.vx+=mx*7.5*mag*dt;ICS.vz+=mz*7.5*mag*dt;}
  let sp=Math.hypot(ICS.vx,ICS.vz);const max=6.2,fr=mag>.08?.9:.35;if(sp>max){ICS.vx*=max/sp;ICS.vz*=max/sp;sp=max;}
  const dec=Math.max(0,1-fr*dt);ICS.vx*=dec;ICS.vz*=dec;sp*=dec;
  const nx=p.x+ICS.vx*dt,nz=p.z+ICS.vz*dt,nk=onRink(nx,nz);
  if(nk<0){// at the edge: step off if you're pushing outward, otherwise bounce softly off the snowy bank
    const [lx,lz]=iceLocal(nx,nz),R0=ICE.rink,gx=(lx-R0.x)/(R0.rx*R0.rx),gz=(lz-R0.z)/(R0.rz*R0.rz),c=Math.cos(IZ.rot),s=Math.sin(IZ.rot);
    let wx=gx*c+gz*s,wz=-gx*s+gz*c;const wl=Math.hypot(wx,wz)||1;wx/=wl;wz/=wl;
    let push=false;if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;push=((fx*-iy+rx*ix)/n)*wx+((fz*-iy+rz*ix)/n)*wz>.5;}
    if(push){p.x=nx;p.z=nz;iceSkateOff();return true;}
    const d=ICS.vx*wx+ICS.vz*wz;if(d>0){ICS.vx-=1.6*d*wx;ICS.vz-=1.6*d*wz;if(d>1.5){tone(180,.06,'sine',.06);burst(new THREE.Vector3(p.x,p.y+.1,p.z),'#ffffff',8,1);}}}
  else{p.x=nx;p.z=nz;}
  if(sp>.15)player.face=angDamp(player.face,Math.atan2(ICS.vx,ICS.vz),Math.min(1,dt*6));
  player.speed=Math.max(sp,mag>.08?1.2:0)*.9;
  // up and down (jumps work on the ice)
  const gy=.05;player.vy-=18*dt;p.y+=player.vy*dt;
  if(p.y<=gy){if(!player.onGround&&player.vy<-3){burst(new THREE.Vector3(p.x,gy+.05,p.z),'#e8f6ff',12,1);did('icejump',0);}p.y=gy;player.vy=0;player.onGround=true;}else if(p.y>gy+.05)player.onGround=false;
  if(sp>.4){ICS.t+=dt;IS.skate+=dt;if((ICS.saveT+=dt)>5){ICS.saveT=0;persist();}if(Math.random()<dt*sp*2)burst(new THREE.Vector3(p.x,.08,p.z),'#ffffff',3,.5,.08);}
  return true;}
function iceSkateOff(){if(!ICS.on)return;ICS.on=false;iceBlades(ICS.av,false);ICS.av=null;persist();iceButtons();}
function iceSpin(){if(!ICS.on)return;av.play('twirl');IS.spins++;persist();sfx('pop');burst(new THREE.Vector3(player.pos.x,player.pos.y+.2,player.pos.z),'#bfe8ff',16,1.4);did('icespin',0);
  const n=IS.spins;if(n===1||n%5===0)toast(n===1?'🌀 What a spin!':`🌀 ${n} spins!`);}
// friends online see your skates: the 'ice' entry in SHOW is in 26i-arctic-see.js (SHOW is made after this file)

/* ---------- 🎣 ice fishing ---------- */
const FISH=[// k, e, name, how likely, coins, body color, belly color, length
  {k:'cod',e:'🐟',n:'arctic cod',w:34,c:2,col:'#8a8f7a',bel:'#e8e4d4',L:.32},
  {k:'char',e:'🐟',n:'arctic char',w:30,c:3,col:'#4a6a6a',bel:'#e86a3a',L:.4},
  {k:'salmon',e:'🐟',n:'salmon',w:20,c:4,col:'#7a8ea0',bel:'#f0d8cc',L:.48},
  {k:'halibut',e:'🐠',n:'halibut',w:12,c:5,col:'#6a5a44',bel:'#f4f1ea',L:.5,flat:1},
  {k:'gold',e:'🌟',n:'golden char',w:4,c:25,col:'#f2b21b',bel:'#ffe68a',L:.44,gold:1}];
const ICE_UP=new THREE.Vector3(0,1,0);
const ICF={on:false,hole:-1,st:'',t:0,bite:0,rod:null,line:null,bob:null,fish:null,fishT:0,n:0};
const holeWorld=i=>{const [hx,hz]=ICE.lake.holes[i];const [x,w]=IZ.toWorld(hx,hz);return new THREE.Vector3(x,.04,w);};
function nearHole(){const p=player.pos;for(let i=0;i<ICE.lake.holes.length;i++){const h=holeWorld(i);if(Math.hypot(p.x-h.x,p.z-h.z)<1.05)return i;}return -1;}
function fishModel(F){const g=new THREE.Group(),m=phys(F.col,{roughness:.35,clearcoat:.8,metalness:F.gold?.6:.1}),b=phys(F.bel,{roughness:.4,clearcoat:.6});
  const L=F.L,body=M(sph(L*.5,16,10),m,0,0,0,g,false,false);body.scale.set(F.flat?.35:.28,F.flat?.8:.42,1);
  M(sph(L*.45,14,10),b,0,-L*.06,0,g,false,false).scale.set(F.flat?.32:.26,F.flat?.6:.3,.9);
  const t=M(new THREE.ConeGeometry(L*.2,L*.28,4),m,0,0,-L*.6,g,false,false);t.rotation.x=-Math.PI/2;t.scale.set(.25,1,1);
  for(const sx of [-1,1])M(sph(L*.05,8,6),std('#111111'),sx*L*.1,L*.07,L*.36,g,false,false);
  if(F.gold)g.userData.sparkle=1;return g;}
function iceFishStart(i){if(ICF.on||i<0)return;iceSkateOff();ICF.on=true;ICF.hole=i;ICF.n=0;const h=holeWorld(i),p=player.pos;
  // stand at the hole's edge, facing it
  const dx=p.x-h.x,dz=p.z-h.z,d=Math.hypot(dx,dz)||1;p.set(h.x+dx/d*.75,p.y,h.z+dz/d*.75);player.face=Math.atan2(h.x-p.x,h.z-p.z);player.speed=0;
  // the rod in your right hand, the line down into the hole and a red and white bobber
  const rod=new THREE.Group();const R=M(cyl(.008,.016,1.1,6),std('#2b2b30',{roughness:.4}),0,.55,0,rod,false,false);M(cyl(.025,.025,.06,10),std('#c9ced6',{metalness:.8,roughness:.3}),.03,.15,0,rod,false,false).rotation.z=Math.PI/2;
  rod.rotation.x=1.1;av.arms[0].hand.add(rod);ICF.rod=rod;ICF.tip=new THREE.Object3D();ICF.tip.position.set(0,1.1,0);rod.add(ICF.tip);
  ICF.line=M(cyl(.002,.002,1,4),new THREE.MeshBasicMaterial({color:'#ffffff'}),0,0,0,scene,false,false);
  ICF.bob=new THREE.Group();M(sph(.045,12,8),phys('#e8322a',{roughness:.3,clearcoat:1}),0,.02,0,ICF.bob,false,false);M(sph(.044,12,8,0,Math.PI*2,0,Math.PI/2),phys('#ffffff',{roughness:.3}),0,.022,0,ICF.bob,false,false);
  ICF.bob.position.copy(h);scene.add(ICF.bob);
  closeTalk();$('#fishUI').classList.add('show');iceFishWait();sfx('pop');iceButtons();}
function iceFishWait(){ICF.st='wait';ICF.t=2+Math.random()*4;ICF.bite=0;$('#fishMsg').className='';$('#fishMsg').textContent='🎣 Waiting for a bite… watch the bobber!';fishCount();iceButtons();}
function fishCount(){const n=Object.values(IS.fish).reduce((a,b)=>a+b,0);$('#fishCount').textContent=`🐟 ${n} caught${ICF.n?` · ${ICF.n} today here`:''}`;}
function iceFishReel(){if(!ICF.on)return;if(ICF.st==='bite'){// caught one!
    let r=Math.random()*FISH.reduce((a,f)=>a+f.w,0),F=FISH[0];for(const f of FISH){if((r-=f.w)<0){F=f;break;}}
    IS.fish[F.k]=(IS.fish[F.k]||0)+1;ICF.n++;persist();ICF.st='caught';ICF.t=2.2;
    const h=holeWorld(ICF.hole),fm=fishModel(F);fm.position.copy(h);scene.add(fm);ICF.fish=fm;ICF.fishF=F;ICF.fishT=0;
    burst(h.clone().add(new THREE.Vector3(0,.2,0)),F.gold?'#ffd23f':'#bfe8ff',F.gold?40:18,2);sfx(F.gold?'tada':'pop');
    const art=F.gold?'the rare ':/^[aeiou]/.test(F.n)?'an ':'a ';$('#fishMsg').className='';$('#fishMsg').textContent=`${F.e} You caught ${art}${F.n}!`;
    setTimeout(()=>earn(F.c,`Caught ${F.gold?'the golden char':'a fish'}`),600);did('icefish',F.k);fishCount();iceButtons();}
  else if(ICF.st==='wait'){ICF.st='early';ICF.t=1.3;$('#fishMsg').textContent='😅 Too soon! The fish swam off. Wait for the bobber to dip.';tone(220,.12,'triangle',.08);iceButtons();}}
function iceFishStop(){if(!ICF.on)return;ICF.on=false;for(const o of [ICF.line,ICF.bob,ICF.fish])if(o){scene.remove(o);freeObj(o);}if(ICF.rod){ICF.rod.parent&&ICF.rod.parent.remove(ICF.rod);freeObj(ICF.rod);}
  Object.assign(ICF,{rod:null,line:null,bob:null,fish:null,st:''});$('#fishUI').classList.remove('show');iceButtons();}
function iceFishStep(dt){if(!ICF.on)return;const h=holeWorld(ICF.hole),p=player.pos;
  if(Math.hypot(p.x-h.x,p.z-h.z)>1.6||closetOpen||barnRide||!started){iceFishStop();return;}
  ICF.t-=dt;
  if(ICF.st==='wait'&&ICF.t<0){ICF.st='bite';ICF.t=1.25;$('#fishMsg').className='bite';$('#fishMsg').textContent='❗ A bite! Tap Reel in!';tone(880,.08,'square',.08);tone(990,.08,'square',.08,.1);iceButtons();}
  else if(ICF.st==='bite'&&ICF.t<0){ICF.st='early';ICF.t=1.3;$('#fishMsg').className='';$('#fishMsg').textContent='🐟 It got away! Be quicker next time.';iceButtons();}
  else if((ICF.st==='early'||ICF.st==='caught')&&ICF.t<0){if(ICF.fish){scene.remove(ICF.fish);freeObj(ICF.fish);ICF.fish=null;}iceFishWait();}
  // the bobber bobs, and dips under when a fish bites
  const tt=performance.now()/1000;let by=.04+Math.sin(tt*2.2)*.012;if(ICF.st==='bite')by=-.02+Math.sin(tt*18)*.03;ICF.bob.position.set(h.x,by,h.z);
  // the line from the rod tip to the bobber
  const tip=ICF.tip.getWorldPosition(new THREE.Vector3()),b=ICF.bob.position.clone().add(new THREE.Vector3(0,.05,0));
  ICF.line.position.copy(tip).add(b).multiplyScalar(.5);ICF.line.scale.set(1,tip.distanceTo(b),1);ICF.line.quaternion.setFromUnitVectors(ICE_UP,b.sub(tip).normalize());
  // a caught fish jumps up out of the hole, wriggling, and then drops into your bucket
  if(ICF.fish){ICF.fishT+=dt;const q=ICF.fishT,f=ICF.fish;f.position.set(h.x,.05+Math.min(1.3,q*3)-Math.max(0,q-1.4)*2,h.z);f.rotation.set(-Math.PI/2+Math.sin(q*18)*.3,q*2,0);
    if(ICF.fishF.gold&&Math.random()<dt*10)burst(f.position.clone(),'#ffd23f',3,.6,.1);}
  player.speed=0;player.face=angDamp(player.face,Math.atan2(h.x-p.x,h.z-p.z),Math.min(1,dt*6));}

/* ---------- 🧱 building an igloo ---------- */
// the blocks: rings that get smaller and lean in as they go up, into a dome; the bottom two rings leave a gap for the door (toward the way in, +z)
const IGLOO_R=1.55,IGLOO_ROWS=[[0,15],[.27,14],[.55,12],[.82,9],[1.1,6],[1.33,3]];
const IGLOO_PLAN=(()=>{const out=[];IGLOO_ROWS.forEach(([ph,n],row)=>{const rr=IGLOO_R*Math.cos(ph),y=IGLOO_R*Math.sin(ph)*1.02+.15;
  for(let i=0;i<n;i++){const a=(i+(row%2)*.5)/n*Math.PI*2;if(row<2&&Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.42)continue;
    out.push({x:Math.sin(a)*rr,y,z:Math.cos(a)*rr,a,tilt:ph,w:Math.min(.62,2*Math.PI*rr/n*1.02)});}});
  out.push({x:0,y:IGLOO_R*1.02+.12,z:0,a:0,tilt:Math.PI/2,w:.5,cap:1});return out;})();
const IGLOO_STEP=4;// blocks per tap
function iglooGroup(){if(IGL.g)return IGL.g;const g=new THREE.Group();const [x,w]=IZ.toWorld(ICE.igloo.x,ICE.igloo.z);g.position.set(x,0,w);g.rotation.y=IZ.rot;scene.add(g);IGL.g=g;return g;}
function iglooBlock(b,fly){const g=iglooGroup(),m=M(box(b.w,b.cap?.24:.3,b.cap?b.w:.3),ICE.blockM,b.x,b.y,b.z,g,true,true);m.rotation.order='YXZ';m.rotation.y=b.a;m.rotation.x=b.cap?0:-b.tilt;
  if(fly){const from=ICE.pile.position;m.userData.fly={t:0,fx:from.x-ICE.igloo.x,fz:from.z-ICE.igloo.z,x:b.x,y:b.y,z:b.z};m.position.set(m.userData.fly.fx,.4,m.userData.fly.fz);}
  IGL.blocks.push(m);return m;}
function iglooTunnel(){const g=iglooGroup(),t=new THREE.Group();t.position.set(0,0,IGLOO_R-.15);g.add(t);
  const arch=new THREE.CylinderGeometry(.62,.62,1.1,18,1,true,-Math.PI/2,Math.PI);arch.rotateX(Math.PI/2);const am=M(arch,std('#f4f8fc',{roughness:.85,side:THREE.DoubleSide}),0,.15,.55,t);am.scale.set(1,1.15,1);
  for(let i=0;i<5;i++){const a=(i/4-.5)*Math.PI*.95,b=M(box(.3,.26,.36),ICE.blockM,Math.sin(a)*.64,.15+Math.cos(a)*.7,.55,t,true,true);b.rotation.z=-a;}
  for(const z of [.15,.95]){for(let i=0;i<5;i++){const a=(i/4-.5)*Math.PI*.95,b=M(box(.3,.24,.3),ICE.blockM,Math.sin(a)*.66,.15+Math.cos(a)*.72,z,t,true,true);b.rotation.z=-a;}}
  IGL.tunnel=t;return t;}
function iglooLamp(){const g=iglooGroup(),l=new THREE.Group();l.position.set(.45,0,-.4);g.add(l);M(cyl(.12,.15,.08,14),std('#7a5a3a',{roughness:.6}),0,.04,0,l);
  M(sph(.07,12,8),glow('#ffcf7a',2.2),0,.13,0,l,false,false);const halo=M(sph(.85,16,12),new THREE.MeshBasicMaterial({color:'#ffd89a',transparent:true,opacity:.18,depthWrite:false}),0,.6,0,l,false,false);
  IGL.lamp=l;return l;}
// the built igloo is solid all round, except the door: a ring of bumps you can't walk through
const IGL_OBS=[];function iglooObs(on){for(const o of IGL_OBS){const i=obs.indexOf(o);if(i>=0)obs.splice(i,1);}IGL_OBS.length=0;if(!on)return;
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.5)continue;const [x,w]=IZ.toWorld(ICE.igloo.x+Math.sin(a)*(IGLOO_R+.05),ICE.igloo.z+Math.cos(a)*(IGLOO_R+.05));const o={x,z:w,r:.28};obs.push(o);IGL_OBS.push(o);}
  for(const s of [-1,1]){const [x,w]=IZ.toWorld(ICE.igloo.x+s*.78,ICE.igloo.z+IGLOO_R+.6);const o={x,z:w,r:.22};obs.push(o);IGL_OBS.push(o);}}
function iglooBuildAll(){for(const b of IGLOO_PLAN)iglooBlock(b,false);iglooTunnel();iglooLamp();IGL.n=IGLOO_PLAN.length;IGL.built=true;iglooObs(true);}
function iglooClear(){if(IGL.g){scene.remove(IGL.g);freeObj(IGL.g);}IGL.g=null;IGL.blocks=[];IGL.tunnel=null;IGL.lamp=null;IGL.n=0;IGL.built=false;iglooObs(false);}
function iglooTap(){if(IGL.built){iglooClear();IS.igloo=0;persist();burst(iceW(ICE.igloo.x,1,ICE.igloo.z),'#ffffff',40,3);sfx('pop');toast('❄️ Knocked it down! Tap to build a new igloo');iceButtons();return;}
  if(IGL.n<IGLOO_PLAN.length){const end=Math.min(IGLOO_PLAN.length,IGL.n+IGLOO_STEP);for(let i=IGL.n;i<end;i++)setTimeout(()=>iglooBlock(IGLOO_PLAN[i],true),(i-IGL.n)*110);
    IGL.n=end;sfx('pop');tone(330,.06,'triangle',.08);
    const pct=Math.round(IGL.n/IGLOO_PLAN.length*100);if(IGL.n===IGLOO_STEP)toast('🧱 Snow blocks, ring by ring! Keep tapping to build your igloo');else if(IGL.n>=IGLOO_PLAN.length)toast('🧱 The dome is done! Now the doorway tunnel');
    $('#iceAct').textContent=iceActLabel();return;}
  if(!IGL.tunnel){iglooTunnel();sfx('pop');burst(iceW(ICE.igloo.x,.5,ICE.igloo.z+IGLOO_R+.5),'#ffffff',20,1.5);toast('🚪 A tunnel to crawl in! Last thing: light the lamp');$('#iceAct').textContent=iceActLabel();return;}
  // the lamp: done!
  iglooLamp();IGL.built=true;IS.igloo=1;IS.igloos=(IS.igloos||0)+1;persist();iglooObs(true);sfx('tada');banner('🧊 You built an igloo!');
  for(let k=0;k<3;k++)setTimeout(()=>burst(iceW(ICE.igloo.x,2,ICE.igloo.z),['#ffffff','#bfe8ff','#ffd23f'][k],40,3),k*200);
  setTimeout(()=>earn(20,'Built an igloo'),900);did('igloo',IS.igloos);iceButtons();}
const iceW=(lx,y,lz)=>{const [x,w]=IZ.toWorld(lx,lz);return new THREE.Vector3(x,y,w);};
function iglooStep(dt){for(const m of IGL.blocks){const f=m.userData.fly;if(!f)continue;f.t+=dt*2.6;const q=Math.min(1,f.t),e=q*q*(3-2*q);
  m.position.set(f.fx+(f.x-f.fx)*e,.4+(f.y-.4)*e+Math.sin(q*Math.PI)*.9,f.fz+(f.z-f.fz)*e);if(q>=1){m.position.set(f.x,f.y,f.z);m.userData.fly=null;}}}
if(IGL.built)iglooBuildAll();
const nearIgloo=()=>{const [lx,lz]=iceLocal(player.pos.x,player.pos.z);return Math.hypot(lx-ICE.igloo.x,lz-(ICE.igloo.z+IGLOO_R+1))<1.7||(!IGL.built&&Math.hypot(lx-ICE.igloo.x,lz-ICE.igloo.z)<IGLOO_R+1.3);};
function iceActLabel(){if(IGL.built)return '🔨 Build a new igloo';if(IGL.n<IGLOO_PLAN.length)return IGL.n?`🧱 Add snow blocks (${Math.round(IGL.n/IGLOO_PLAN.length*100)}%)`:'🧱 Build an igloo';if(!IGL.tunnel)return '🚪 Dig the doorway';return '🕯️ Light the lamp';}

/* ---------- the buttons: what you can do where you're standing ---------- */
let iceKey='';
function iceButtons(){const p=player.pos,inZ=Math.hypot(p.x-IZ.x,p.z-IZ.z)<IZ.r+1.5,busy=closetOpen||!started||barnRide||FLY.on;
  const hole=inZ&&!busy&&!ICS.on?nearHole():-1,igl=inZ&&!busy&&!ICS.on&&!ICF.on&&nearIgloo();
  const key=[inZ,busy,ICS.on,ICF.on,ICF.st,hole,igl,IGL.n,!!IGL.tunnel,IGL.built,PE.on,!!PE.endT,RU.on].join('|');if(key===iceKey)return;iceKey=key;
  const A=$('#iceAct'),B=$('#iceAct2');A.classList.remove('go');A.style.display=B.style.display='none';if(busy)return;
  if(ICS.on){A.textContent='🌀 Spin';A.style.display='block';A.onclick=iceSpin;return;}
  if(ICF.on){A.textContent=ICF.st==='bite'?'🎣 Reel in!':'🎣 Reel in';A.classList.toggle('go',ICF.st==='bite');A.style.display=ICF.st==='caught'?'none':'block';A.onclick=iceFishReel;
    B.textContent='✋ Stop fishing';B.style.display='block';B.onclick=iceFishStop;return;}
  if(hole>=0){A.textContent='🎣 Ice fish';A.style.display='block';A.onclick=()=>iceFishStart(nearHole());return;}
  if(igl){A.textContent=iceActLabel();A.style.display='block';A.onclick=iglooTap;return;}
  // 🚨 anywhere else at Polar Ice: start a Polar escape (24m2-arctic-escape.js)
  if(inZ&&!PE.on&&!PE.endT&&!RU.on){A.textContent='🚨 Start a Polar escape!';A.classList.add('go');A.style.display='block';A.onclick=peBegin;}}

/* ---------- every frame ---------- */
anims.push((t,dt)=>{if(!started)return;iceAnimalsStep(dt);iceFishStep(dt);iglooStep(dt);
  if(ICS.on&&onRink(player.pos.x,player.pos.z)<-.3)iceSkateOff();iceButtons();});
// on the map: the polar animals show as little emojis when you're close
// for challenges.js and the tests
function iceState(){const fish=Object.values(IS.fish).reduce((a,b)=>a+b,0);return {fish,kinds:Object.keys(IS.fish).length,gold:IS.fish.gold||0,skate:Math.floor(IS.skate),spins:IS.spins,
  igloo:!!IGL.built,igloos:IS.igloos||0,seen:Object.keys(IS.seen).length,skating:ICS.on,fishing:ICF.on?ICF.st:'',n:IA.length};}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{IA,ICE,ICS,ICF,IGL,iceState,onRink,iceSpin,iceFishStart,iceFishReel,iceFishStop,iglooTap,iglooClear,nearHole,holeWorld,iceSkateOff});});
