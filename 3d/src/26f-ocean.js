/* ================= 🌊 THE CANAL AND DOLPHIN BAY: swim all the way around the island, with dolphins, a whale, a sea turtle and a seal =================
   - The coast is a canal: a ring of water (CANAL.inR to CANAL.outR) all the way around the island, with a grassy bank with palm trees on
     the far side. Walk off any shore (or jump off the dock) and you wade in, then swim. collide() (25-game-loop.js) asks seaKeep() whether
     you may be out there. The part right past the Beach is 🐬 Dolphin Bay (the 'bay' zone in 02-island.js); the rest is the 🌊 Canal.
   - For other files (the safari hippo swims here, zoo animals drink here): seaDepth(x,z) 0 on land .. 1 deep, inCanal(x,z),
     canalSpot(ang,t) a spot in the water (t 0 the island shore .. 1 the far bank), CANAL, WATER_Y the water line.
   - Swimming: the game still keeps you at ground height 0 (so the camera, stars and zones work as usual); this file just sinks
     your body into the water and poses you (crawl stroke when you move, treading water when you stop) after Avatar.update.
     Not on a bike, a skateboard or a barn ride: hop off first.
   - Sea animals: 🐬 three dolphins (one is Splash) and 🐋 Big Blue the humpback whale swim all the way round the canal, 🐢 Shelly the
     sea turtle paddles near the Beach, 🦭 Pip the seal sits on her rock in the bay, 🐠 Ray the manta ray glides round far out and
     🦦 Ollie the sea otter floats on his back off the Beach. They never follow you (only adopted pets do): swim
     up next to one and swim along beside it. They show on the minimap. Tap 🐟 Feed when you're close.
   - 🌊 Ocean challenges (the Ocean tab in challenges.js, ids in SEA_RIDES[].ids): finish all of an animal's challenges and you can
     ride it (🐢 Shelly, 🐬 Splash, 🐋 Big Blue, 🦭 Pip: she slides off her rock for you and swims home after).
   - 🦈 Ghost the great white swims round the canal by himself. Swim close to him and now and then he chases you (sharkStep below). Harmless:
     reach the shore to get away, or he bumps you and swims on. Finish his really hard 🌊 Ocean challenges and you can ride him.
   - Friends online see you swimming, and on your sea ride, through the 'sea' entry in SHOW (26c-friends-see.js).
   Everything is low-poly with a few shared materials and no textures, and each animal hides when it's far from you (iPhone memory). */
const BAY=Z.bay,WATER_Y=-.35,CANAL={inR:R+1.6,outR:R+17};
const CANAL_ZONE={id:'canal',name:'🌊 Canal',music:'sea-waves'};// where you are when you swim anywhere but the bay (25-game-loop.js)
MAPC.bay='#7fd6ee';
/* ---------- 🏝️ land on the far bank, and footbridges over the canal ----------
   Most of the far bank is scenery you can't reach, but an area listed in BANK_LAND is real land: walk over its footbridge (or swim
   across and wade out) and you can walk, ride and play there. a0..a1: the angles it covers (degrees, like ZONES), out: how far out
   from the middle of the island it reaches. own: it draws its own ground, so the bank's grass, sand and palm trees leave a gap there.
   BANK_BRIDGES: a footbridge at angle a (degrees), w wide. Its deck only counts as ground once you've stepped on it from one of its
   ends (BRG.on), so you can still swim under it. BANK_POOLS: pools on that land, f(x,z) gives how deep (0..1) it is there.
   BANK_GROUND: things you can stand on there, f(x,z) gives how high. */
// own: a place like the waterpark that does its own walking, wading and bridge (seaKeep, seaDepth and bankOK below), so bankLand leaves it out.
// Its entries are here, not in its own file, because the bank below is built before that file runs.
const BANK_LAND=[{id:'water',a0:220,a1:274,out:R+56,own:1}];// 💦 the waterpark (26w-waterpark.js)
const BANK_BRIDGES=[{id:'water',a:240,w:2.6,own:1,on:()=>false}];
const BANK_POOLS=[],BANK_GROUND=[],BRG={on:''};
var bankReady=false;// groundAt is asked before this file has run; it stays 0 until then
const bankAng=(x,z)=>(Math.atan2(x,z)*180/Math.PI+360)%360;
const bankSector=(x,z,m=0)=>{const a=bankAng(x,z);return BANK_LAND.find(s=>s.own&&a>=s.a0-m&&a<=s.a1+m);};
function onBankLand(x,z){const d=Math.hypot(x,z);if(d<CANAL.outR)return false;const s=bankSector(x,z);return !!s&&d<=s.out;}
// on a footbridge over the canal: {b, t 0 at the island .. 1 at the far bank, side: how far from its middle line}
function bridgeAt(x,z,any){const d=Math.hypot(x,z);if(d<R-1||d>BANK.in+2)return null;
  for(const b of BANK_BRIDGES){if(!b.own)continue;const a=deg(b.a),ux=Math.sin(a),uz=Math.cos(a),along=x*ux+z*uz,side=x*uz-z*ux;
    if(along>0&&(any||Math.abs(side)<b.w/2))return {b,t:(along-(R+.3))/(BANK.in+.8-(R+.3)),side,ux,uz,along};}
  return null;}
// the bridge deck arches up over the water
const bridgeH=t=>t<=0||t>=1?0:.12+1.25*Math.sin(Math.PI*t);
function bankGround(x,z){if(!bankReady||x*x+z*z<(R-1.5)*(R-1.5))return 0;let h=0;
  const b=bridgeAt(x,z);if(b&&(BRG.on||SW.k<.3))h=bridgeH(b.t);
  for(const f of BANK_GROUND){const g=f(x,z);if(g>h)h=g;}return h;}
// keeps p on the far-bank land it's standing on (and inside its edges). minD: how close to the water it may go
function bankHold(p,minD){const d=Math.hypot(p.x,p.z);if(d<minD)return false;const s=bankSector(p.x,p.z,4);if(!s)return false;
  const a=deg(Math.max(s.a0,Math.min(s.a1,bankAng(p.x,p.z)))),dd=Math.min(d,s.out-.5);p.x=Math.sin(a)*dd;p.z=Math.cos(a)*dd;return true;}
// for pets and friends (collide in 25-game-loop.js): they may be on the far-bank land and the bridges too
function bankOK(p){return bankReady&&(bankHold(p,CANAL.outR-.1)||!!bridgeAt(p.x,p.z));}
// how deep you are: 0 on the sand, 1 swimming (the island's sand edge ends at R+1.6)
// y (optional): how high you are; up on a footbridge over the water you're not swimming
function seaDepth(x,z,y){if(y>1.05)return 0;const d=Math.hypot(x,z);
  if(BRG.on&&bridgeAt(x,z))return 0;
  if(d>CANAL.outR-1.5&&bankReady&&bankSector(x,z)){// wading out onto the far-bank land, and its pools
    if(d<BANK.in)return Math.max(0,Math.min(1,(BANK.in-.2-d)/1.6));let m=0;for(const f of BANK_POOLS){const k=f(x,z);if(k>m)m=k;}return m;}
  return d>CANAL.outR?0:Math.max(0,Math.min(1,(d-(R+1.3))/2.6));}
// how high the water comes up here: the canal's WATER_Y, or a far-bank pool's own water line (a BANK_POOLS function with .top)
function waterLine(x,z){if(Math.hypot(x,z)>CANAL.outR-1.5&&bankReady&&bankSector(x,z))for(const f of BANK_POOLS)if(f.top!=null&&f(x,z)>0)return f.top;return WATER_Y;}
function inCanal(x,z){const d=Math.hypot(x,z);return d>CANAL.inR&&d<CANAL.outR;}
// a spot in the canal at angle ang (like ZONES: x=sin, z=cos), t 0 at the island's shore .. 1 at the far bank
function canalSpot(ang,t){const r=CANAL.inR+(CANAL.outR-CANAL.inR)*t;return [Math.sin(ang)*r,Math.cos(ang)*r];}
let seaNoRideT=0;
// collide() asks: the player is past the island's edge; may they be out here? Keeps them on the water side of the far bank.
function seaKeep(p,lim){if(!started)return false;
  // on a footbridge: stay between its railings until you step off one end
  if(BRG.on){const b=bridgeAt(p.x,p.z,true);if(b){const w=b.b.w/2-.3,sd=Math.max(-w,Math.min(w,b.side));p.x=b.ux*b.along+b.uz*sd;p.z=b.uz*b.along-b.ux*sd;return true;}}
  const rider=(barnRide&&!barnRide.F.swim)||BIKE.on||SK.on;
  // on the far-bank land (the waterpark): walk and ride about, but riders don't go into the water
  if(bankHold(p,rider?BANK.in:CANAL.outR-.1))return true;
  const d=Math.hypot(p.x,p.z),sec=bankSector(p.x,p.z);
  if(rider){// a barn ride with swim:1 in FARM (the safari hippo) may go in
    if(sec&&d>(CANAL.inR+CANAL.outR)/2){p.x*=BANK.in/d;p.z*=BANK.in/d;return true;}// riding by the water on the far-bank land: stay on the land
    if(performance.now()>seaNoRideT){seaNoRideT=performance.now()+5000;toast('Hop off to go swimming 🏊');}return false;}
  const edge=sec?BANK.in:CANAL.outR-.5;if(d>edge){p.x*=edge/d;p.z*=edge/d;}// you can wade out onto the far-bank land
  return true;}

/* ---------- the far bank of the canal: sand, grass and palm trees all the way round ---------- */
const BANK={in:CANAL.outR+1.2,out:CANAL.outR+18};
// Other bits of the far bank you can walk on, and footbridges over to them, pushed into BANK_LAND and BANK_BRIDGES from their own files:
//   BANK_LAND:    {a0,a1,out}  a sector in degrees (like ZONES: 0 is +z, 90 is +x), walkable out to distance out from the middle
//   BANK_BRIDGES: {a,w,on(p)}  a footbridge at angle a (degrees), w wide; on(p) says if p is up on its deck
// collide() (25-game-loop.js) asks this when p is past the island's edge: true if p may be there (it may move p back onto the land)
function bankLand(p){const d=Math.hypot(p.x,p.z);if(d<R)return false;const a=bankAng(p.x,p.z);
  for(const b of BANK_BRIDGES){if(b.own)continue;const da=(((a-b.a)%360)+540)%360-180,side=Math.abs(Math.sin(da*Math.PI/180)*d);if(Math.abs(da)<90&&side<b.w/2&&d<BANK.in+3&&b.on(p))return true;}
  for(const L of BANK_LAND){if(L.own||a<L.a0||a>L.a1)continue;
    if(d>=CANAL.outR-.5){if(d>L.out){p.x*=L.out/d;p.z*=L.out/d;}return true;}
    // on a bike, a skateboard or a ride you can't go in the water, so you stay on the bank instead of popping back to the island
    if(p===player.pos&&d>CANAL.outR-4&&((barnRide&&!barnRide.F.swim)||BIKE.on||SK.on)){const k=(CANAL.outR-.4)/d;p.x*=k;p.z*=k;return true;}}
  return false;}
{const sand=std('#f1d9a6',{map:TEX.sand,roughness:1});
  // the sandy slope up out of the water (seen from the island side), the grass on top, and the slope down to the open sea
  const wall=M(new THREE.CylinderGeometry(BANK.in,CANAL.outR-1,3,128,1,true),sand.clone(),0,-1.5,0,scene,false,true);wall.material.side=THREE.BackSide;
  // the grass, the sand and the slope down to the open sea go all the way round, except where a BANK_LAND area draws its own ground
  const own=BANK_LAND.filter(s=>s.own).sort((a,b)=>a.a0-b.a0),spans=[];
  {let a=own.length?own[own.length-1].a1-360:0;for(const s of own){spans.push([a,s.a0]);a=s.a1;}if(!own.length)spans.push([0,360]);else spans.push([own[own.length-1].a1,own[0].a0+360]);}
  for(const [a0,a1] of spans){if(a1-a0<.5)continue;const n=Math.max(8,Math.round(128*(a1-a0)/360)),t0=deg(a0-90),tl=deg(a1-a0);// RingGeometry angle 0 is ZONES angle 90
    const top=M(new THREE.RingGeometry(BANK.in,BANK.out,n,1,t0,tl),groundMat,0,.004,0,scene,false,true);top.rotation.x=-Math.PI/2;
    const beach=M(new THREE.RingGeometry(BANK.in,BANK.in+2.2,n,1,t0,tl),sand,0,.012,0,scene,false,false);beach.rotation.x=-Math.PI/2;
    M(new THREE.CylinderGeometry(BANK.out,BANK.out+2,3,n,1,true,deg(a0),tl),sand,0,-1.5,0,scene,false,true);}
  sand.polygonOffset=true;sand.polygonOffsetFactor=-2;sand.polygonOffsetUnits=-2;
  const ownAt=(x,z)=>{const a=bankAng(x,z);return own.some(s=>a>s.a0-3&&a<s.a1+3);};
  // palm trees and bushes: one shape each for all of them (instanced), so the whole bank is only a few draws
  let sd=7;const rr=()=>((sd=(sd*16807)%2147483647)-1)/2147483646;
  const NP=46,NB=90,mx=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();
  const trunk=new THREE.InstancedMesh(cyl(.13,.2,4.2,7),std('#9a7046',{roughness:.9}),NP),leaf=new THREE.InstancedMesh(new THREE.ConeGeometry(.5,2.6,4,1),std('#3f9a3a',{roughness:.7,side:THREE.DoubleSide}),NP*6),
    bush=new THREE.InstancedMesh(sph(1,8,6),std('#4fa645',{roughness:.9}),NB);
  let li=0;
  const placeHere=(x,z)=>ZONES.some(o=>o.d>CANAL.outR&&Math.hypot(x-o.x,z-o.z)<o.r+4);// no palms where a place stands on the far bank
  for(let i=0;i<NP;i++){const a=(i+rr()*.6)/NP*Math.PI*2,r=BANK.in+3.5+rr()*9,x=Math.sin(a)*r,z=Math.cos(a)*r,lean=(rr()-.5)*.35;let s=.8+rr()*.5;if(placeHere(x,z)||ownAt(x,z))s=.001;
    e.set(lean,rr()*6,lean*.5);q.setFromEuler(e);mx.compose(v.set(x,2.1*s,z),q,sc.set(s,s,s));trunk.setMatrixAt(i,mx);
    const tx=x+Math.sin(e.y)*lean*2*s,tz=z+Math.cos(e.y)*lean*2*s;
    for(let k=0;k<6;k++){e.set(Math.PI/2+.55,k/6*Math.PI*2+rr(),0,'YXZ');q.setFromEuler(e);const d=new THREE.Vector3(0,0,1.1*s).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,e.y,0)));
      mx.compose(v.set(tx+d.x,4.2*s,tz+d.z),q,sc.set(1.3*s,s,.15*s));leaf.setMatrixAt(li++,mx);}}
  for(let i=0;i<NB;i++){const a=rr()*Math.PI*2,r=BANK.in+2.6+rr()*13;let s=.5+rr()*.6;if(placeHere(Math.sin(a)*r,Math.cos(a)*r)||ownAt(Math.sin(a)*r,Math.cos(a)*r))s=.001;mx.compose(v.set(Math.sin(a)*r,s*.35,Math.cos(a)*r),q.identity(),sc.set(s*1.2,s*.75,s*1.2));bush.setMatrixAt(i,mx);}
  for(const m of [trunk,leaf,bush]){m.instanceMatrix.needsUpdate=true;m.castShadow=false;m.receiveShadow=false;m.computeBoundingSphere();scene.add(m);}}
// on the minimap and the big map (26-map.js drawWorld): the far bank all the way round
function canalBank(x,cx,cy,k){x.beginPath();x.arc(cx,cy,BANK.out*k,0,Math.PI*2);x.fillStyle='#8fd36f';x.fill();
  x.beginPath();x.arc(cx,cy,BANK.in*k,0,Math.PI*2);x.fillStyle='#f1d9a6';x.fill();
  x.beginPath();x.arc(cx,cy,(CANAL.outR+.2)*k,0,Math.PI*2);x.fillStyle='#2ab0d4';x.fill();}

/* ---------- the swimming pose (for you and for friends online) ---------- */
// k: 0 standing .. 1 swimming, mv: 0 still .. 1 full speed, ph: stroke time, wy: the water line there (waterLine()).
// Run it after Avatar.update. Returns how far to sink the body (from ground height 0).
// Like a real swimmer the body floats: the shoulders stay at the water line, so treading water your head, neck and the tops of
// your shoulders are out, and swimming you lie almost flat with your back at the surface and your head up, face out of the water.
function swimPose(A,k,mv,ph,wy=WATER_Y){if(!A||!A.legs||k<.01)return 0;
  const stroke=k>.6&&mv>.2,pitch=k*(.22+1.13*(stroke?mv:0));
  A.hips.rotation.x=pitch;A.head.rotation.x=-pitch*.8;
  // the body rolls from side to side with the stroke: the shoulder of the arm coming over lifts, the pulling one dips
  if(stroke)A.hips.rotation.y=-.38*k*mv*Math.sin(ph);
  A.arms.forEach((a,i)=>{const o=ph+i*Math.PI;
    // front crawl: the arm comes out of the water at the hip, swings forward over the back to reach out past the head (angle pi),
    // then pulls down and back under the chest to the hip again. The angle has to grow; counting it down swims backwards.
    // The elbow bends halfway through the pull (the 'catch'), and more on the way over (a high elbow, the hand trailing near the water).
    if(stroke){const s=((o%(Math.PI*2))+Math.PI*2)%(Math.PI*2),sn=Math.sin(s);a.sh.rotation.x=s;a.sh.rotation.z=a.sx*.18;a.el.rotation.x=-(.2+(sn>0?.85*sn:.6*-sn));}
    else{a.sh.rotation.x+=(-.35+Math.sin(o*.8)*.3-a.sh.rotation.x)*k;a.sh.rotation.z+=(a.sx*(1+Math.sin(ph*1.6)*.2)-a.sh.rotation.z)*k;a.el.rotation.x+=(-.55-a.el.rotation.x)*k;}});
  A.legs.forEach((l,i)=>{const o=ph*(stroke?2.4:1.3)+i*Math.PI;l.hp.rotation.x+=(Math.sin(o)*(stroke?.32:.5)-(stroke?0:.25)-l.hp.rotation.x)*k;l.kn.rotation.x+=(.2+Math.max(0,Math.sin(o+1))*(stroke?.35:.6)-l.kn.rotation.x)*k;});
  // sink until the shoulders are at the water line (the hips hang lower when you're upright treading water)
  return k*(A.hip+.42*Math.cos(pitch)-.03-wy);}

/* ---------- the sea animals ---------- */
const SEA_M={dol:std('#5f7f9c',{roughness:.35}),belly:std('#eef3f6',{roughness:.45}),eye:std('#1d2228',{roughness:.2}),
  whale:std('#3d5568',{roughness:.5}),wbelly:std('#e3e9ec',{roughness:.6}),bump:std('#33495a',{roughness:.7}),
  shell:std('#6f7f3c',{roughness:.6}),plate:std('#55652c',{roughness:.6}),tskin:std('#a3b872',{roughness:.7}),under:std('#e6d79a',{roughness:.7}),
  seal:std('#8d939b',{roughness:.5}),sealL:std('#c7ccd2',{roughness:.5}),rock:std('#8a8278',{roughness:.95,flatShading:true}),
  manta:std('#2c3640',{roughness:.55,side:THREE.DoubleSide}),mantaB:std('#e9edf0',{roughness:.6}),
  otter:std('#6b4a33',{roughness:.85}),otterL:std('#c4a684',{roughness:.85}),nose:std('#2a1d17',{roughness:.4}),shellP:std('#f2b5b0',{roughness:.5}),
  shark:std('#ffffff',{roughness:.45,vertexColors:true}),sharkF:std('#6c7a85',{roughness:.45,side:THREE.DoubleSide}),gill:std('#4c5862',{roughness:.6})};
const sM=(geo,mat,x,y,z,p)=>M(geo,mat,x,y,z,p,false,false);
// each model faces +z with its middle at the water line (y 0 = sea level); seat = how high your seat is on its back
function seaDolphin(){const g=new THREE.Group();
  sM(sph(.34,16,12),SEA_M.dol,0,0,0,g).scale.set(1,.95,3.2);
  sM(sph(.3,14,10),SEA_M.belly,0,-.1,.08,g).scale.set(.9,.7,2.9);
  const nose=sM(cyl(.06,.1,.42,10),SEA_M.dol,0,-.1,1.22,g);nose.rotation.x=Math.PI/2;
  const fin=sM(new THREE.ConeGeometry(.17,.5,8),SEA_M.dol,0,.42,-.12,g);fin.scale.set(.28,1,1.2);fin.rotation.x=-.55;
  for(const sx of [-1,1]){const f=sM(sph(.15,10,6),SEA_M.dol,sx*.33,-.17,.45,g);f.scale.set(1.7,.22,.75);f.rotation.z=sx*.45;
    sM(sph(.035,8,6),SEA_M.eye,sx*.2,.05,.9,g);}
  const tail=new THREE.Group();tail.name='tail';tail.position.z=-.95;g.add(tail);
  sM(sph(.15,10,8),SEA_M.dol,0,0,-.2,tail).scale.set(.6,1,2.4);sM(sph(.2,12,6),SEA_M.dol,0,0,-.58,tail).scale.set(2.3,.16,.9);
  return {g,tail,seat:.3,len:2.2};}
function seaWhale(){const g=new THREE.Group();
  sM(sph(1,18,12),SEA_M.whale,0,0,0,g).scale.set(1.35,1.05,4.6);
  sM(sph(.95,16,10),SEA_M.wbelly,0,-.32,.5,g).scale.set(1.25,.8,3.9);
  for(let i=0;i<8;i++)sM(sph(.12,8,6),SEA_M.bump,(i%2?.35:-.35)*(1+(i>>1)*.15),.95-i*.02,3.6-(i>>1)*.5,g);
  for(const sx of [-1,1]){const f=sM(sph(.4,12,6),SEA_M.wbelly,sx*2.1,-.5,1.5,g);f.scale.set(3.4,.22,.8);f.rotation.y=-sx*.45;f.rotation.z=sx*.25;
    sM(sph(.08,8,6),SEA_M.eye,sx*1.22,-.3,2.7,g);}
  const fin=sM(new THREE.ConeGeometry(.35,.55,8),SEA_M.whale,0,.98,-2.3,g);fin.scale.set(.4,1,1.6);fin.rotation.x=-.5;
  const tail=new THREE.Group();tail.name='tail';tail.position.z=-4.1;g.add(tail);
  sM(sph(.5,12,8),SEA_M.whale,0,0,-.5,tail).scale.set(.8,.75,2.2);
  for(const sx of [-1,1]){const f=sM(sph(.7,12,6),SEA_M.whale,sx*1.05,0,-1.5,tail);f.scale.set(1.8,.14,.9);f.rotation.y=sx*.35;}
  return {g,tail,seat:1.0,len:9.2,blow:new THREE.Vector3(0,1.05,2.6)};}
function seaTurtle(){const g=new THREE.Group();
  sM(sph(.62,16,8,0,Math.PI*2,0,Math.PI/2),SEA_M.shell,0,-.06,0,g).scale.set(1,.55,1.25);
  sM(sph(.6,16,8),SEA_M.under,0,-.08,0,g).scale.set(1,.18,1.2);
  for(const [x,z,s] of [[0,0,.22],[0,.42,.17],[0,-.42,.17],[-.34,.18,.15],[.34,.18,.15],[-.34,-.22,.15],[.34,-.22,.15]])sM(sph(s,10,6),SEA_M.plate,x,.2+(s>.2?.08:0),z,g).scale.set(1,.3,1);
  const head=new THREE.Group();head.name='head';head.position.set(0,.02,.82);g.add(head);sM(sph(.19,12,10),SEA_M.tskin,0,0,.05,head).scale.set(1,.85,1.25);
  for(const sx of [-1,1])sM(sph(.035,8,6),SEA_M.eye,sx*.12,.05,.17,head);
  const fl=[];for(const [sx,z,len] of [[-1,.42,2.6],[1,.42,2.6],[-1,-.5,1.3],[1,-.5,1.3]]){const p=new THREE.Group();p.position.set(sx*.55,-.08,z);g.add(p);
    const f=sM(sph(.16,10,6),SEA_M.tskin,sx*.16*len*.6,0,0,p);f.scale.set(len,.22,1);fl.push({p,sx,front:z>0});}
  return {g,flip:fl,head,seat:.34,len:1.8};}
function seaSeal(swim){const g=new THREE.Group();
  sM(sph(.32,14,10),SEA_M.seal,0,0,0,g).scale.set(1,.85,2);
  sM(sph(.28,12,8),SEA_M.sealL,0,-.08,.15,g).scale.set(.9,.6,1.6);
  const head=new THREE.Group();head.position.set(0,swim?.12:.32,swim?.66:.55);g.add(head);sM(sph(.22,14,10),SEA_M.seal,0,0,0,head);
  sM(sph(.11,10,8),SEA_M.sealL,0,-.06,.18,head).scale.set(1.2,.8,1);sM(sph(.035,8,6),SEA_M.eye,0,-.02,.28,head);
  for(const sx of [-1,1])sM(sph(.05,8,6),SEA_M.eye,sx*.1,.06,.17,head);
  const fl=[];for(const sx of [-1,1]){const p=new THREE.Group();p.position.set(sx*.28,-.12,.3);g.add(p);const f=sM(sph(.1,8,6),SEA_M.seal,sx*.12,0,0,p);f.scale.set(2,.3,1);fl.push({p,sx,front:true});}
  sM(sph(.14,8,6),SEA_M.seal,0,-.05,-.72,g).scale.set(2,.3,1.1);
  return {g,head,flip:fl,seat:.27,len:1.3};}
// 🐠 Ray the manta ray: a wide flat diamond that flaps its wings slowly (and sometimes leaps right out of the water)
function seaManta(){const g=new THREE.Group();
  sM(sph(.45,14,8),SEA_M.manta,0,0,0,g).scale.set(1,.32,1.7);sM(sph(.42,14,8),SEA_M.mantaB,0,-.05,0,g).scale.set(.95,.22,1.6);
  const sh=new THREE.Shape();sh.moveTo(0,.8);sh.quadraticCurveTo(1.1,.55,2.1,-.2);sh.quadraticCurveTo(1,-.25,0,-.7);sh.lineTo(0,.8);
  const wg=new THREE.ExtrudeGeometry(sh,{depth:.05,bevelEnabled:false,curveSegments:6});wg.translate(0,0,-.025);
  const wing=[];for(const sx of [-1,1]){const p=new THREE.Group();p.position.set(sx*.3,0,0);g.add(p);const w=sM(wg,SEA_M.manta,0,0,0,p);w.rotation.x=Math.PI/2;w.scale.x=sx;wing.push({p,sx});
    const c=sM(cyl(.04,.07,.42,6),SEA_M.manta,sx*.26,-.02,.8,g);c.rotation.x=Math.PI/2;c.rotation.z=sx*.25;
    sM(sph(.04,8,6),SEA_M.eye,sx*.33,.04,.62,g);}
  const tail=new THREE.Group();tail.name='tail';tail.position.z=-.75;g.add(tail);const t=sM(cyl(.035,.01,1.4,5),SEA_M.manta,0,0,-.7,tail);t.rotation.x=Math.PI/2;
  return {g,wing,tail,len:1.6};}
// 🦦 Ollie the sea otter: floats on his back with a shell on his tummy
function seaOtter(){const g=new THREE.Group(),b=new THREE.Group();b.name='body';g.add(b);
  sM(sph(.25,16,10),SEA_M.otter,0,0,0,b).scale.set(1,.7,2);sM(sph(.22,14,8),SEA_M.otterL,0,.07,.18,b).scale.set(.85,.6,1.3);// tummy up, pale chest
  // his head is lifted out of the water with his chin tucked, so his face looks up and down along his own tummy at the shell,
  // the way a real sea otter floats (the back of his head is to the water, the top of his head leads the way he drifts).
  // He has a pale face, a dark nose, little round ears and whiskers
  const head=new THREE.Group();head.rotation.order='ZYX';head.position.set(0,.2,.56);head.rotation.set(-1.1,Math.PI,0);b.add(head);sM(sph(.17,16,12),SEA_M.otterL,0,0,0,head).scale.set(1.05,.95,1);
  sM(sph(.17,16,12),SEA_M.otter,0,-.03,-.04,head).scale.set(1.08,.95,.95);
  sM(sph(.085,12,8),SEA_M.otterL,0,-.02,.13,head).scale.set(1.25,.85,1);sM(sph(.032,8,6),SEA_M.nose,0,.02,.21,head).scale.set(1.3,.8,1);
  for(const sx of [-1,1]){sM(sph(.026,8,6),SEA_M.eye,sx*.075,.07,.13,head);sM(sph(.045,8,6),SEA_M.otter,sx*.13,.1,-.02,head).scale.set(1,1,.5);
    for(const k of [-1,1]){const w=sM(cyl(.004,.004,.16,3),SEA_M.otterL,sx*.09,-.02+k*.015,.15,head);w.rotation.z=Math.PI/2+sx*k*.12;w.rotation.y=-sx*.3;}}
  const paw=[];for(const sx of [-1,1]){const p=new THREE.Group();p.position.set(sx*.13,.16,.36);b.add(p);sM(sph(.05,8,6),SEA_M.otter,0,.04,0,p).scale.set(1,1.5,1);paw.push({p,sx});
    const ft=sM(sph(.07,8,6),SEA_M.nose,sx*.1,.1,-.45,b);ft.scale.set(.9,.5,1.6);ft.rotation.x=-.8;}// webbed back feet poking up
  const shell=sM(new THREE.ConeGeometry(.08,.04,10),SEA_M.shellP,0,.21,.26,b);shell.rotation.x=-.3;
  sM(sph(.09,8,6),SEA_M.otter,0,-.02,-.62,b).scale.set(1,.45,2.4);
  return {g,body:b,head,paw,len:1.4};}
const SEA_BUILD={dolphin:seaDolphin,whale:seaWhale,turtle:seaTurtle,seal:()=>{const m=seaSeal(true);m.g.scale.setScalar(SEAL_RIDE_S);m.seat*=SEAL_RIDE_S;return m;}};
const SEAL_RIDE_S=1.4;// Pip is a bit bigger in the water than she looks on her rock, so you fit on her back

// who lives in the canal (near = how close counts as swimming next to it). Paths are in seaAdd() below.
const SEA_KIND={
  dolphin:{e:'🐬',food:[['🐟','fish'],['🦑','squid']],reach:3.6,near:5,spd:3.8,ride:2.3,say:['*click click* 🐬','Eee-eee! 💙','*happy splash*']},
  whale:{e:'🐋',food:[['🦐','krill'],['🐟','little fish']],reach:7,near:8,spd:2,ride:1.6,say:['*whooOOOoo* 🐋','*big happy spout* 💦','*gentle rumble*']},
  turtle:{e:'🐢',food:[['🪼','jellyfish'],['🥬','sea grass']],reach:3,near:4,spd:1.2,ride:1.35,say:['*slow happy blink*','*paddle paddle* 🐢','*munch* 🌿']},
  seal:{e:'🦭',food:[['🐟','fish']],reach:3.6,near:4,spd:2.6,ride:1.9,say:['Ork ork! 👏','*flipper clap* 👏','*happy wiggle*']},
  manta:{e:'🐠',food:[['🦐','plankton']],reach:4,near:5.5,spd:2.6,say:['*glide glide*','*graceful flap* 🌊','*happy wiggle*']},
  otter:{e:'🦦',food:[['🦀','crab'],['🐚','clam']],reach:3,near:4,spd:.7,say:['*squeak squeak* 🦦','*crack crack* 🐚','*happy roll*']},
  shark:{e:'🦈',food:[['🐟','big fish']],reach:4,near:6,spd:2.8,ride:2.6,back:-.75,say:['*swish swish*','*glides past slowly*','*a calm, steady look*']}};
// how each one floats: [height, bob, bob speed], how high it leaps, and where it sits when you ride it
for(const [k,b,l,ry,w] of [['dolphin',[-.18,.06,2.6],1.7,-.15,.12],['whale',[-.55,.1,.5],0,-.5,.6],['turtle',[-.05,.03,1.8],0,-.05,.35],
  ['seal',[-.05,.03,2],0,-.05,.3],['manta',[.06,.03,1.2],1.3],['otter',[.02,.04,1.6],0],['shark',[-.42,.04,.8],0,-.12,.45]])Object.assign(SEA_KIND[k],{bob:b,leap:l,rideY:ry,rideW:w});
// how far the animal sits behind you when you ride it (you sit on the front of the whale's back, and in front of the shark's fin)
for(const k in SEA_KIND)SEA_KIND[k].back??=k==='whale'?-1.4:k==='dolphin'?.35:0;
// the rides you earn with 🌊 Ocean challenges (challenges.js has the same ids, grp = k)
const SEA_RIDES=[
  {k:'shelly',kind:'turtle',nm:'Shelly',n:'Sea turtle',ids:['sea_swim','sea_turtle','sea_feedT']},
  {k:'splash',kind:'dolphin',nm:'Splash',n:'Dolphin',ids:['sea_dolph','sea_feedD','sea_feedAll']},
  {k:'bigblue',kind:'whale',nm:'Big Blue',n:'Humpback whale',ids:['sea_whale','sea_spout','sea_swim1k','sea_feedW']},
  {k:'pip',kind:'seal',nm:'Pip',n:'Seal',ids:['sea_pip','sea_feedP','sea_meet']},
  {k:'ghost',kind:'shark',nm:'Ghost',n:'Great white shark',ids:['sea_shark','sea_shark10','sea_sharkrow','sea_rides4','sea_swim5k']}];
SAVE.sea||={swum:0,with:{},spouts:0,own:{}};const SEA=SAVE.sea;SEA.with||={};SEA.own||={};SEA.shark||={esc:0,tag:0};SEA.shark.row??=0;SEA.shark.best??=0;

const SEAS=[];
function seaAdd(kind,nm,m,o={}){const c={kind,nm,K:SEA_KIND[kind],m,g:m.g,pos:new THREE.Vector3(),face:0,y:0,pitch:0,mode:'roam',t:Math.random()*9,a:o.a||0,
  path:o.path,slot:o.slot,leap:0,leapT:3+Math.random()*4,happy:0,spout:6+Math.random()*4,withT:0};
  c.g.rotation.order='YXZ';const [x,z]=o.path?seaPathAt(c,c.a):o.at;c.pos.set(x,0,z);c.g.position.set(x,WATER_Y,z);scene.add(c.g);SEAS.push(c);return c;}
// where an animal swims: all the way round the canal (dir 1 or -1), or back and forth along a stretch of it (span, around ang0),
// t = how far out in the canal (0 shore .. 1 far bank), weaving in and out a little
function seaPathAng(c,a){const P=c.path;return P.span?P.ang0+Math.asin(Math.sin(a))*2/Math.PI*P.span:a*P.dir;}// back and forth at an even speed
function seaPathAt(c,a){const P=c.path;return canalSpot(seaPathAng(c,a),Math.max(.12,Math.min(.88,P.t+Math.sin(a*(P.span?2:7)+P.ph)*.12)));}
// carry on along the path from where it is now (after swimming with you)
function seaPathFrom(c){const P=c.path,ang=Math.atan2(c.pos.x,c.pos.z);
  if(P.span){const q=Math.max(-1,Math.min(1,(((ang-P.ang0+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI)/P.span));c.a=q*Math.PI/2;}
  else{const a=ang*P.dir,k=Math.round((c.a-a)/(Math.PI*2));c.a=a+k*Math.PI*2;}}
const seaPathRate=c=>{const P=c.path,r=(CANAL.inR+CANAL.outR)/2;return P.spd/(r*(P.span?P.span*2/Math.PI:1));};
{const d0=seaDolphin();
  const dols=[d0,{...d0,g:d0.g.clone()},{...d0,g:d0.g.clone()}];for(const d of dols)d.tail=d.g.getObjectByName('tail');
    // the pod starts near the bay and swims round the whole canal (about 2 minutes a lap)
  dols.forEach((d,i)=>{const c=seaAdd('dolphin',i?['Bubbles','Coral'][i-1]:'Splash',d,{path:{dir:1,t:[.45,.62,.3][i],ph:i*1.7,spd:3.3},a:deg(140)-i*.06,slot:[[-1.9,.5],[1.9,.4],[0,2.8]][i]});if(i)c.g.scale.setScalar(.85);});}
// Big Blue goes the other way round, slowly, out in the middle of the canal
seaAdd('whale','Big Blue',seaWhale(),{path:{dir:-1,t:.55,ph:0,spd:1.9},a:-deg(200),slot:[4.4,0]});
// Shelly paddles back and forth near the Beach
seaAdd('turtle','Shelly',seaTurtle(),{path:{ang0:deg(180),span:.3,t:.4,ph:1,spd:1.3},a:.4,slot:[1.5,-.6]});
// 🐠 Ray the manta glides round the canal far out, 🦦 Ollie the otter floats about just off the Beach
seaAdd('manta','Ray',seaManta(),{path:{dir:1,t:.75,ph:2,spd:2.6},a:deg(40)});
seaAdd('otter','Ollie',seaOtter(),{path:{ang0:deg(194),span:.12,t:.22,ph:0,spd:.7},a:1});
// 🦭 Pip on her rock near the shore
const SEAL={rock:null,c:null};{const [x,z]=canalSpot(deg(172),.42);const rk=new THREE.Group();rk.position.set(x,WATER_Y,z);scene.add(rk);
  const r=M(new THREE.DodecahedronGeometry(1.2,0),SEA_M.rock,0,-.15,0,rk,false,true);r.scale.set(1.45,.62,1.15);
  M(new THREE.DodecahedronGeometry(.6,0),SEA_M.rock,.9,-.2,-.6,rk,false,true).scale.set(1,.6,1);obs.push({x,z,r:1.6});SEAL.rock=rk;
  const s=seaSeal();s.g.position.set(-.1,.72,.1);s.g.rotation.y=Math.atan2(-x,-z)+.4;rk.add(s.g);
  SEAL.c={kind:'seal',nm:'Pip',K:SEA_KIND.seal,m:s,g:s.g,pos:new THREE.Vector3(x,0,z),face:0,y:0,pitch:0,happy:0,t:0,fixed:true};SEAS.push(SEAL.c);}
// riding Pip: she slides off her rock into the water, and when you hop off she swims home to it
function sealLeave(){const c=SEAL.c,s=c.m;c.fixed=false;scene.attach(s.g);s.g.rotation.order='YXZ';s.g.rotation.set(0,0,0);s.g.scale.setScalar(SEAL_RIDE_S);s.head.position.set(0,.12,.66);s.head.rotation.set(0,0,0);SEAL.rock.visible=true;}
function sealHome(){const c=SEAL.c,s=c.m;c.fixed=true;SEAL.rock.add(s.g);s.g.scale.setScalar(1);s.g.position.set(-.1,.72,.1);s.g.rotation.set(0,Math.atan2(-SEAL.rock.position.x,-SEAL.rock.position.z)+.4,0);
  s.head.position.set(0,.32,.55);c.pos.set(SEAL.rock.position.x,0,SEAL.rock.position.z);}

/* ---------- you in the water ---------- */
const SW={withNow:{},k:0,ph:0,ride:null,splashT:0,hello:{},wasAir:false,sink:0,warn:0};
// each animal is only drawn when it's near you (the canal goes all the way round, so most are far away)
const seaNearYou=(c,r=80)=>Math.hypot(player.pos.x-c.pos.x,player.pos.z-c.pos.z)<r;
const seaSwimming=()=>SW.k>.6;

function seaStep(dt){const p=player.pos,t=performance.now()/1000;
  // step onto a footbridge from one of its ends (not from the water underneath) and you walk on it until you step off an end
  {const b=bridgeAt(p.x,p.z,true);if(BRG.on){if(!b||b.t<-.03||b.t>1.03)BRG.on='';}else if(b&&Math.abs(b.side)<b.b.w/2-.1&&b.t>-.05&&b.t<1.05&&SW.k<.3&&p.y>-.05&&!FLY.on)BRG.on=b.b.id;}
  // how deep you are, eased so wading in looks smooth
  const want=started&&!FLY.on?seaDepth(p.x,p.z,p.y):0;SW.k+=(want-SW.k)*Math.min(1,dt*6);if(SW.k<.002)SW.k=0;
  if(SW.ride&&(SW.k<.35||closetOpen))seaHopOff(true);
  // riding is faster, swimming without a ride a bit slower than walking (the walking step already moved you; this adds or takes a little)
  if(SW.k>.3&&player.speed>.3&&!barnRide){const extra=(SW.ride?SW.ride.K.ride-1:-.18*SW.k)*player.speed*dt;p.x+=Math.sin(player.face)*extra;p.z+=Math.cos(player.face)*extra;collide(p);}
  if(seaSwimming()&&player.speed>.3){SEA.swum+=player.speed*dt;}
  const mv=Math.min(1,player.speed/5);SW.ph+=dt*(2.2+mv*4.2);
  // splashes when you land in the water, and little ones from your arms while you swim
  const wl=waterLine(p.x,p.z);
  if(SW.k>.5&&SW.wasAir&&player.onGround){burst(new THREE.Vector3(p.x,wl+.1,p.z),'#ffffff',22,2.4,.3);sfx('splash');}SW.wasAir=!player.onGround;
  if(SW.k>.6&&!SW.ride&&mv>.25&&(SW.splashT-=dt)<0){SW.splashT=.55;burst(new THREE.Vector3(p.x+Math.sin(player.face)*.6,wl+.05,p.z+Math.cos(player.face)*.6),'#ffffff',6,1.2,.16);}
  // your body: on a sea ride you sit on its back, otherwise you swim
  if(SW.ride){const c=SW.ride,A=av;A.g.position.y=c.g.position.y+c.m.seat*c.g.scale.y-(.46+A.legX)+(c.kind==='dolphin'?0:Math.max(0,p.y));}// the dolphin leaps with you, on the others you hop
  else if(SW.k>0&&!barnRide){SW.sink=swimPose(av,SW.k,mv,SW.ph,wl);av.g.position.y=p.y-SW.sink+Math.sin(t*2.2)*.03*SW.k;}
  // the animals
  SW.withNow={};for(const c of SEAS)seaAnimal(c,dt,t);
  for(const k in SW.withNow)SEA.with[k]=(SEA.with[k]||0)+dt;// once per kind, even with 3 dolphins
  if(started)seaButtons();
  // first swim
  if(seaSwimming()&&!SEA.swamOnce){SEA.swamOnce=1;persist();toast('🏊 You\'re swimming! Swim close to the dolphins 🐬');}}
onTick.push(seaStep);
// the sea animals on the minimap, so you can find them in the canal (same heading-up view as drawMini in 26-map.js)
onTick.push(()=>{if(!started)return;const cv=$('#miniCv');if(!cv)return;const x=cv.getContext('2d'),S=cv.width,h=S/2,k=S/54,p=player.pos,
  fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx;x.save();x.font=`${Math.round(S*.09)}px serif`;x.textAlign='center';x.textBaseline='middle';
  const seen={};for(const c of SEAS){if(c.fixed||SW.ride===c)continue;const key=c.kind==='dolphin'?'d'+Math.round(c.pos.x/6)+','+Math.round(c.pos.z/6):c.kind;if(seen[key])continue;seen[key]=1;
    const dx=c.pos.x-p.x,dz=c.pos.z-p.z,sx=h+(dx*rx+dz*rz)*k,sy=h-(dx*fx+dz*fz)*k;if(Math.hypot(sx-h,sy-h)<h-10)x.fillText(c.K.e,sx,sy);}
  x.restore();});

function seaAnimal(c,dt,t){c.t+=dt;c.happy=Math.max(0,c.happy-dt);
  const vis=seaNearYou(c)||SW.ride===c;if(c.fixed){SEAL.rock.visible=vis;if(!vis)return;}else c.g.visible=vis;
  if(c.fixed){// Pip the seal: looks around, claps when she's happy
    if(seaSwimming()&&Math.hypot(player.pos.x-c.pos.x,player.pos.z-c.pos.z)<c.K.near)seaWith(c);
    const s=c.m;s.head.rotation.y=Math.sin(c.t*.7)*.5;s.head.rotation.x=-.2+Math.sin(c.t*1.3)*.08-(c.happy>0?.4:0);
    s.flip.forEach((f,i)=>{f.p.rotation.z=0;f.p.rotation.y=c.happy>0?(i?-1:1)*(.3+Math.sin(c.t*18)*.5):Math.sin(c.t*1.5+i)*.12;});
    s.g.position.y=.72+(c.happy>0?Math.abs(Math.sin(c.t*9))*.15:0);return;}
  const P=player.pos,K=c.K,dP=Math.hypot(P.x-c.pos.x,P.z-c.pos.z);
  if(c===SHARK.c&&SHARK.mode&&SW.ride!==c)return;// chasing you: sharkStep moves him
  // ridden: right under you
  if(SW.ride===c){c.mode='ride';const back=K.back;
    c.face=player.face;c.pos.set(P.x+Math.sin(c.face)*back,0,P.z+Math.cos(c.face)*back);
    const air=c.kind==='dolphin'?Math.max(0,P.y):0;c.y=air+K.rideY;
    c.pitch=c.kind==='dolphin'&&air>.05?Math.max(-.6,Math.min(.6,player.vy*.09)):0;
    seaMoveAnim(c,dt,Math.min(1,player.speed/5));seaPlace(c);return;}
  // they never follow you (only pets you adopt do): each one keeps swimming its own way, and you swim up next to it.
  // Swimming close beside one counts for the 🌊 Ocean challenges, and it's happy to see you.
  if(dP<K.near&&seaSwimming())seaWith(c);
  c.a+=dt*seaPathRate(c);const [tx,tz]=seaPathAt(c,c.a);
  if(!vis){c.pos.set(tx,0,tz);return;}// far away: just move it along
  const spd=c.path.spd+Math.hypot(tx-c.pos.x,tz-c.pos.z)*1.2;
  const dx=tx-c.pos.x,dz=tz-c.pos.z,d=Math.hypot(dx,dz);let moving=0;
  if(d>.15){const st=Math.min(d,spd*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;moving=st/dt;c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*(c.kind==='whale'?1.2:3)));}
  
  // dolphins and the manta leap, the whale spouts
  c.y=K.bob[0]+Math.sin(c.t*K.bob[2])*K.bob[1];c.pitch=0;
  if(K.leap){if(c.leap>0){c.leap+=dt/(K.leap>1.5?1.15:1.4);const q=Math.min(1,c.leap);c.y+=Math.sin(q*Math.PI)*K.leap;c.pitch=Math.cos(q*Math.PI)*(c.kind==='manta'?.45:.75);
      if(q>=1){c.leap=0;seaSplash(c,c.kind==='manta'?22:14);}}
    else if((c.leapT-=dt)<0){c.leapT=c.kind==='manta'?10+Math.random()*10:4+Math.random()*4;if(moving>1.5||c.happy>0){c.leap=.001;seaSplash(c,10);}}}
  if(c.kind==='whale'){if((c.spout-=dt)<0){c.spout=7+Math.random()*4;seaSpout(c);}
    if(c.happy>0){c.tailUp=Math.min(1,(c.tailUp||0)+dt*2);}else c.tailUp=Math.max(0,(c.tailUp||0)-dt);}
  seaMoveAnim(c,dt,Math.min(1,moving/4));seaPlace(c);}
function seaMoveAnim(c,dt,mv){const m=c.m;
  if(m.tail){if(c.kind==='shark')m.tail.rotation.y=Math.sin(c.t*(3+mv*3))*(.2+mv*.2);
    else m.tail.rotation.x=Math.sin(c.t*(c.kind==='whale'?1.4:5))*(c.kind==='whale'?.12:.3)*(.3+mv)-(c.tailUp||0)*.9;}
  if(m.flip)m.flip.forEach(f=>{const o=c.t*(2+mv*3)+(f.front?0:Math.PI);f.p.rotation.z=f.sx*Math.sin(o)*(f.front?.5:.25);f.p.rotation.y=-f.sx*(.3+Math.cos(o)*.25);});
  if(m.head&&c.kind==='turtle')m.head.rotation.y=Math.sin(c.t*.8)*.25;
  if(m.wing)m.wing.forEach(w=>{w.p.rotation.z=w.sx*(Math.sin(c.t*(1.6+mv*1.4))*.32+.05);});
  if(m.paw){// Ollie taps his shell, looks about and every now and then rolls right over in the water
    m.paw.forEach((w,i)=>{w.p.rotation.x=-.4+Math.max(0,Math.sin(c.t*(c.happy>0?14:5)+i*.4))*.6;});m.head.rotation.z=Math.sin(c.t*.6)*.3;// he turns his head side to side round his neck, so it never looks crooked
    const r=(c.t%9)/9;m.body.rotation.z=r>.88?(r-.88)/.12*Math.PI*2:0;}}
// you're swimming right next to a sea animal: it counts for the challenges, and it says hello the first time
function seaWith(c){SW.withNow[c.kind]=1;
  if(!SW.hello[c.kind]){SW.hello[c.kind]=1;toast(c.kind==='dolphin'?'🐬 You\'re swimming next to the dolphins!':`${c.K.e} You're swimming next to ${c.nm}!`);c.happy=1.5;}}
function seaPlace(c){c.g.position.set(c.pos.x,WATER_Y+c.y,c.pos.z);c.g.rotation.y=c.face;c.g.rotation.x=-c.pitch;}
function seaSplash(c,n){burst(new THREE.Vector3(c.pos.x,WATER_Y+.1,c.pos.z),'#ffffff',n,2,.24);if(Math.hypot(player.pos.x-c.pos.x,player.pos.z-c.pos.z)<15)tone(300+Math.random()*120,.12,'sine',.06,0,140);}
function seaSpout(c){const b=c.m.blow.clone();c.g.localToWorld(b);burst(b,'#e8f8ff',34,2.6,.35);burst(b,'#ffffff',18,3.4,.25);
  const dP=player.pos.distanceTo(b);if(dP<30){SEA.spouts++;persist();if(dP<18)tone(220,.5,'sawtooth',.03,0,90);}}


/* ---------- 🦈 the great white: a surprise now and then while you swim in the canal ----------
   After a while of swimming (not on a sea ride) a fin shows up behind you and the great white comes after you. It's a chase, not
   a scary bit: get to the shore (or out-swim him for 25 seconds) and you escape, which counts for the 🌊 Ocean challenges.
   If he catches up he just bumps you with his nose and swims off. He's built to look like a real great white: grey on top and
   white underneath, a pointed snout, black eyes, gill slits, a tall fin and a crescent tail. */
function seaShark(){const g=new THREE.Group();
  // the body: one smooth shape, grey above and white below with the wavy line real great whites have
  const pr=[[0,-2.35],[.1,-2.15],[.2,-1.8],[.36,-1.1],[.5,-.3],[.56,.3],[.54,.8],[.46,1.3],[.33,1.75],[.18,2.1],[.05,2.3],[0,2.34]].map(([r,y])=>new THREE.Vector2(r,y));
  const geo=new THREE.LatheGeometry(pr,18);geo.rotateX(Math.PI/2);geo.scale(.82,1,1);
  const pos=geo.attributes.position,col=new Float32Array(pos.count*3),top=new THREE.Color('#6c7a85'),bot=new THREE.Color('#f1f1ec');
  for(let i=0;i<pos.count;i++){const y=pos.getY(i),z=pos.getZ(i),c=y<-.06+Math.sin(z*6)*.05+(z>1.4?.08:0)?bot:top;col.set([c.r,c.g,c.b],i*3);}
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
  sM(geo,SEA_M.shark,0,0,0,g);
  const fin=(pts,depth=.05)=>{const sh=new THREE.Shape();sh.moveTo(...pts[0]);for(let i=1;i<pts.length;i+=2)sh.quadraticCurveTo(...pts[i],...pts[i+1]);
    const fg=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false,curveSegments:5});fg.translate(0,0,-depth/2);return fg;};
  // the fins are flat shapes drawn from the side (x = forward along the body, y = up), stood up along the body
  const df=sM(fin([[.35,0],[.12,.55],[-.25,.95],[-.22,.45],[-.45,.05],[0,-.02],[.35,0]],.06),SEA_M.sharkF,0,.48,.15,g);df.rotation.y=-Math.PI/2;
  sM(fin([[.1,0],[.05,.12],[-.08,.2],[-.08,.1],[-.15,0],[0,0],[.1,0]],.03),SEA_M.sharkF,0,.22,-1.6,g).rotation.y=-Math.PI/2;
  // pectoral fins: long and swept back, out to the sides and drooping a little (x = out, y = forward)
  const pg=fin([[0,.2],[.5,.08],[.95,-.45],[.7,-.35],[.2,-.2],[.05,-.05],[0,.2]],.04);
  for(const sx of [-1,1]){const pp=new THREE.Group();pp.position.set(sx*.36,-.25,.95);pp.rotation.z=-sx*.38;g.add(pp);
    const pf=sM(pg,SEA_M.sharkF,0,0,0,pp);pf.rotation.x=Math.PI/2;pf.scale.x=sx;
    sM(sph(.045,10,8),SEA_M.eye,sx*.25,.08,1.78,g);
    for(let k=0;k<5;k++){const gs=sM(new THREE.BoxGeometry(.02,.24-k*.012,.03),SEA_M.gill,sx*(.37+k*.016),-.02,1.32-k*.11,g);gs.rotation.z=-sx*.15;}}
  // the mouth line under the snout (closed)
  const mouth=sM(new THREE.TorusGeometry(.18,.012,4,12,Math.PI),SEA_M.gill,0,-.2,1.72,g);mouth.rotation.x=Math.PI/2;mouth.scale.set(1.05,.8,1);
  // the tail swishes side to side (sharks swim like that; whales and dolphins go up and down)
  const tail=new THREE.Group();tail.name='tail';tail.position.z=-2.2;g.add(tail);
  sM(fin([[.05,0],[-.25,.4],[-.6,.95],[-.38,.45],[-.22,.03],[-.36,-.35],[-.5,-.72],[-.15,-.3],[.05,0]],.05),SEA_M.sharkF,0,0,0,tail).rotation.y=-Math.PI/2;
  return {g,tail,seat:.52,len:4.7};}
// 🦈 Ghost cruises round the canal by himself (far out in the middle), like the other sea animals. When you swim near him he may
// come after you (not more than once every couple of minutes); after the chase he carries on round the canal.
const SHARK={c:null,mode:'',t:0,next:20,beat:0,leave:0,splT:0};
SHARK.c=seaAdd('shark','Ghost',seaShark(),{path:{dir:1,t:.5,ph:3,spd:2.8},a:deg(300)});SEA_BUILD.shark=seaShark;
// start a chase. The tests call it with force: then he comes from behind you, wherever he was.
function sharkStart(force){const p=player.pos,c=SHARK.c;if(SHARK.mode||SW.ride===c||(!force&&(SW.ride||!seaSwimming()||seaOwns(SEA_RIDES.find(r=>r.k==='ghost')))))return false;// once he's yours he's friendly
  if(force){let best=null;for(const off of [0,.5,-.5,1,-1,Math.PI]){const a=player.face+Math.PI+off,x=p.x+Math.sin(a)*18,z=p.z+Math.cos(a)*18,d=Math.hypot(x,z);
      const r=Math.max(CANAL.inR+2,Math.min(CANAL.outR-1.5,d)),sx=x*r/d,sz=z*r/d;if(Math.hypot(sx-p.x,sz-p.z)>9){best=[sx,sz];break;}}
    if(!best)return false;c.pos.set(best[0],0,best[1]);c.face=Math.atan2(p.x-best[0],p.z-best[1]);}
  Object.assign(SHARK,{mode:'chase',t:0,beat:0,leave:0});c.g.visible=true;toast('🦈 Ghost the great white is coming! Swim for the shore!');banner('🦈 Swim for the shore!');return true;}
function sharkEnd(how){if(SHARK.mode!=='chase')return;SHARK.mode='leave';SHARK.leave=0;SHARK.next=90+Math.random()*60;const S=SEA.shark;
  if(how==='escape'){S.esc++;S.row++;S.best=Math.max(S.best,S.row);persist();sfx('tada');toast(`🎉 You got away from Ghost!${S.row>1?` ${S.row} in a row!`:''}`);did('shark','escape');}
  if(how==='tag'){S.tag++;S.row=0;persist();const p=player.pos,c=SHARK.c;burst(new THREE.Vector3(p.x,WATER_Y+.2,p.z),'#ffffff',40,3.2,.35);sfx('splash');
    // a nose bump that pushes you along a little; then he loses interest
    p.x+=Math.sin(c.face)*1.6;p.z+=Math.cos(c.face)*1.6;collide(p);toast('🦈 Bump! He just wanted a look. He swims on');did('shark','tag');}}
function sharkStep(dt){const p=player.pos,S=SHARK,c=S.c;
  if(SW.ride===c){S.mode='';return;}
  if(!S.mode){if(started&&seaSwimming()&&inCanal(p.x,p.z)&&!SW.ride&&!FLY.on){S.next-=dt;
      if(S.next<0&&Math.hypot(p.x-c.pos.x,p.z-c.pos.z)<24)sharkStart();}return;}
  S.t+=dt;c.t+=dt;const dx=p.x-c.pos.x,dz=p.z-c.pos.z,d=Math.hypot(dx,dz);let spd;
  if(S.mode==='chase'){
    // you're safe on the shore, on a sea ride or when you've out-swum him for 25 seconds
    if(seaDepth(p.x,p.z,p.y)<.4||SW.ride||S.t>25)sharkEnd('escape');
    else if(d<1.9)sharkEnd('tag');
    // he gains on you when he's far and is just a little slower than you up close, so if you keep swimming you get away
    spd=d>9?5.4:3.7;c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*2.2));
    // the music: two low notes that speed up as he gets closer
    if((S.beat-=dt)<0){S.beat=Math.max(.28,Math.min(1.1,d/14));tone(82,.22,'sawtooth',.045);tone(87,.22,'sawtooth',.045,S.beat*.5);}}
  else{// swims away from you for a bit, then carries on round the canal
    S.leave+=dt;spd=4.5;c.face=angDamp(c.face,Math.atan2(-dx,-dz),Math.min(1,dt*1.5));
    if(S.leave>4){S.mode='';seaPathFrom(c);return;}}
  let nx=c.pos.x+Math.sin(c.face)*spd*dt,nz=c.pos.z+Math.cos(c.face)*spd*dt;const r=Math.hypot(nx,nz),lim=Math.max(CANAL.inR+1.2,Math.min(CANAL.outR-1.2,r));
  c.pos.set(nx*lim/r,0,nz*lim/r);c.y=c.K.bob[0];c.pitch=0;seaMoveAnim(c,dt,1);seaPlace(c);c.g.rotation.z=Math.sin(S.t*3)*.04;
  if(S.mode==='chase'&&(S.splT-=dt)<0){S.splT=.25;burst(new THREE.Vector3(c.pos.x+Math.sin(c.face)*.3,WATER_Y+.05,c.pos.z+Math.cos(c.face)*.3),'#ffffff',4,1,.14);}}
onTick.push(sharkStep);

/* ---------- 🐟 feed and 🏇 ride buttons ---------- */
{const st=document.createElement('style');st.textContent=`
#seaFeed,#seaRide{position:fixed;left:50%;transform:translateX(-50%);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5}
#seaFeed{bottom:calc(env(safe-area-inset-bottom) + 250px);background:linear-gradient(90deg,#4fb6ff,#2fb8a5);box-shadow:0 6px 18px rgba(47,184,165,.45)}
#seaRide{bottom:calc(env(safe-area-inset-bottom) + 310px);background:linear-gradient(90deg,#3a7bd5,#00a6c8);box-shadow:0 6px 18px rgba(0,120,200,.4)}
#seaRide.lock{background:linear-gradient(90deg,#9aa7b8,#7d8a9c);box-shadow:none}
#seaFeed:active,#seaRide:active{transform:translateX(-50%) scale(.94)}
body.dressing #seaFeed,body.dressing #seaRide,body.talking #seaFeed,body.talking #seaRide,body.shopping #seaFeed,body.shopping #seaRide{display:none!important}
@media (max-height:520px){#seaFeed{bottom:calc(env(safe-area-inset-bottom) + 130px)}#seaRide{bottom:calc(env(safe-area-inset-bottom) + 185px)}}`;
  document.head.appendChild(st);
  document.body.insertAdjacentHTML('beforeend','<button class="hud" id="seaFeed"></button><button class="hud" id="seaRide"></button>');}
let seaNear=null,seaBtnKey='';
function seaButtons(){const P=player.pos;let best=null,bd=1e9;
  if(SW.k>.3&&!closetOpen)for(const c of SEAS){if(SW.ride===c||(c===SHARK.c&&SHARK.mode))continue;const d=Math.hypot(P.x-c.pos.x,P.z-c.pos.z)-c.K.reach;if(d<0&&d<bd){bd=d;best=c;}}
  seaNear=best;const rideC=best&&!SW.ride?SEA_RIDES.find(r=>r.kind===best.kind&&r.nm===best.nm):null;
  const key=(best?best.nm:'')+'|'+(SW.ride?SW.ride.nm:'')+'|'+(rideC?(seaOwns(rideC)?1:0):'');if(key===seaBtnKey)return;seaBtnKey=key;
  const f=$('#seaFeed'),r=$('#seaRide');
  if(best&&!SW.ride){f.textContent=`${best.K.food[0][0]} Feed ${best.nm}`;f.style.display='block';}else f.style.display='none';
  if(SW.ride){r.textContent=`${SW.ride.K.e} Hop off`;r.classList.remove('lock');r.style.display='block';}
  else if(rideC){const own=seaOwns(rideC);r.textContent=own?`${best.K.e} Ride ${best.nm}`:`🔒 Ride ${best.nm}`;r.classList.toggle('lock',!own);r.style.display='block';}
  else r.style.display='none';}
function seaFeed(c){if(!c)return;const K=c.K,fd=rnd(K.food);c.happy=c.kind==='whale'?2.4:1.6;
  const top=c.fixed?SEAL.rock.position.clone().add(new THREE.Vector3(0,1.6,0)):c.g.position.clone().add(new THREE.Vector3(0,c.kind==='whale'?1.6:.8,0));
  floaties(top,fd[0],4);setTimeout(()=>floaties(top,'💖',5),350);sfx('munch');
  if(c.kind==='dolphin'){c.leap=.001;seaSplash(c,12);tone(1500,.08,'sine',.08);tone(1900,.1,'sine',.07,.09);}
  if(c.kind==='whale'){seaSpout(c);setTimeout(()=>{const b=c.m.tail.getWorldPosition(new THREE.Vector3());burst(b.setY(WATER_Y+.2),'#ffffff',40,3.5,.35);sfx('splash');},900);}
  if(c.kind==='seal'){tone(330,.12,'square',.05);tone(300,.12,'square',.05,.18);}
  if(c.kind==='manta'){c.leap=.001;seaSplash(c,12);}
  if(c.kind==='otter'){tone(1200,.08,'sine',.07);tone(1400,.08,'sine',.07,.12);}
  if(c.kind==='shark'){SHARK.next=Math.max(SHARK.next,40);}// a fed shark leaves you alone for a while
  friendBubbleSea(c,rnd(K.say));toast(`${K.e} ${c.nm} loves the ${fd[1]}!`);did('seafeed',c.kind);}
// a little speech bubble over the animal (like the barn animals)
function friendBubbleSea(c,txt){const s=sprite(labelTex(txt,{size:44}),1.9,.48);const top=c.fixed?1.9:c.kind==='whale'?2.6:1.5;s.position.set(0,top,0);
  if(c.fixed)SEAL.rock.add(s);else c.g.add(s);s.scale.multiplyScalar(1/c.g.scale.x);setTimeout(()=>{s.parent&&s.parent.remove(s);s.material.dispose();if(s.material.map)s.material.map.dispose();},2200);}
$('#seaFeed').onclick=()=>{seaFeed(seaNear);};
$('#seaRide').onclick=()=>{if(SW.ride){seaHopOff();return;}const c=seaNear;if(!c)return;const r=SEA_RIDES.find(x=>x.kind===c.kind&&x.nm===c.nm);if(!r)return;
  if(!seaOwns(r)){sfx('pop');toast(`Finish all of ${r.nm}'s 🌊 Ocean challenges (in ⭐ challenges) to ride ${c.kind==='whale'||c.kind==='shark'?'him':'her'}!`);return;}
  seaHopOn(c);};
function seaHopOn(c){if(c.fixed)sealLeave();SW.ride=c;c.mode='ride';player.pos.x=c.pos.x;player.pos.z=c.pos.z;player.face=c.face;av.rideW=c.K.rideW;av.play('ride');
  sfx('tada');friendBubbleSea(c,rnd(c.K.say));toast(`Ride ${c.nm} around the canal! Tap Jump to ${c.kind==='dolphin'?'leap 🐬':'hop'}`);did('searide',c.kind);(SEA.rode||={})[c.kind]=1;persist();seaBtnKey='';}
function seaHopOff(quiet){const c=SW.ride;if(!c)return;SW.ride=null;c.mode='roam';if(c.path)seaPathFrom(c);else{sealHome();if(!quiet)toast('🦭 Pip swims home to her rock');}av.rideW=0;if(av.emote&&av.emote.id==='ride')av.emote=null;
  // you slide off beside it
  const s=c.kind==='whale'?2.6:1.2;player.pos.x+=Math.cos(player.face)*s;player.pos.z-=Math.sin(player.face)*s;collide(player.pos);if(!quiet)sfx('pop');seaBtnKey='';}

/* ---------- earning the sea rides ---------- */
const seaOwns=r=>!!(SAVE.chal&&SAVE.chal.done&&r.ids.every(id=>SAVE.chal.done[id]));
setInterval(()=>{if(!started)return;for(const r of SEA_RIDES)if(!SEA.own[r.k]&&seaOwns(r)){SEA.own[r.k]=1;persist();
  banner(`🎉 You can ride ${r.nm}!`);sfx('tada');did('prize',r.k);setTimeout(()=>toast(`Swim up to ${r.nm} ${r.k==='ghost'?'in the canal':'in 🐬 Dolphin Bay'} and tap Ride`),1900);seaBtnKey='';break;}},1500);
// a townsperson who'd live out in the bay lives on the Beach instead
for(const f of FRIENDS)if(f.home===BAY)f.home=Z.beach;
// for challenges.js (🌊 Ocean tab) and the tests
function seaState(){const w=k=>Math.floor(SEA.with[k]||0);return {swum:Math.floor(SEA.swum),dolphin:w('dolphin'),whale:w('whale'),turtle:w('turtle'),seal:w('seal'),manta:w('manta'),otter:w('otter'),
  kinds:Object.keys(SEA.with).filter(k=>SEA.with[k]>=1).length,spouts:SEA.spouts||0,sharkEsc:SEA.shark.esc,sharkTag:SEA.shark.tag,sharkRow:SEA.shark.best,
  rode:Object.keys(SEA.rode||{}).length};}
function seaRides(){return SEA_RIDES.map(r=>({k:r.k,kind:r.kind,e:SEA_KIND[r.kind].e,nm:r.nm,n:r.n,ids:r.ids,own:seaOwns(r)}));}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{seaState,sharkStart,shark:()=>SHARK,seaRides,sea:()=>SW,SEAS,BAY,CANAL,inCanal,canalSpot,seaDepth,seaFeed,seaHopOn,seaHopOff,seaNear:()=>seaNear});});

/* ---------- 👭 friends online see you swimming, and on your sea ride ---------- */
SHOW.push({k:'sea',
  mine(){return SW.k>.05||SW.ride?{r:SW.ride?SW.ride.kind:''}:null;},
  on(f,d){const h={k:0,ph:0,lx:f.pos.x,lz:f.pos.z,mv:0,m:null};
    if(d.r&&SEA_BUILD[d.r]){const m=SEA_BUILD[d.r]();m.g.rotation.order='YXZ';m.kind=d.r;scene.add(m.g);h.m=m;}return h;},
  step(f,d,dt,h){const A=f.a;if(!A)return;const P=f.pos;
    h.k+=(seaDepth(P.x,P.z,P.y)-h.k)*Math.min(1,dt*6);
    const v=Math.hypot(P.x-h.lx,P.z-h.lz)/Math.max(dt,1e-3);h.lx=P.x;h.lz=P.z;h.mv+=(Math.min(1,v/5)-h.mv)*Math.min(1,dt*5);h.ph+=dt*(2.2+h.mv*4.2);
    if(h.m){const m=h.m,fc=f.cur??f.face,k=m.kind,back=SEA_KIND[k].back,air=k==='dolphin'?Math.max(0,P.y):0;
      const y=WATER_Y+air+SEA_KIND[k].rideY;
      m.g.position.set(P.x+Math.sin(fc)*back,y,P.z+Math.cos(fc)*back);m.g.rotation.y=fc;
      if(m.tail){if(k==='shark')m.tail.rotation.y=Math.sin(h.ph*1.2)*.3;else m.tail.rotation.x=Math.sin(h.ph*(k==='whale'?.4:1.4))*(k==='whale'?.12:.3);}
      if(m.flip)m.flip.forEach(fl=>{const o=h.ph+(fl.front?0:Math.PI);fl.p.rotation.z=fl.sx*Math.sin(o)*(fl.front?.5:.25);});
      A.rideW=SEA_KIND[k].rideW;A.g.position.y=y+m.seat-(.46+A.legX)+(k==='dolphin'?0:Math.max(0,P.y));}
    else if(h.k>.01){A.g.position.y=P.y-swimPose(A,h.k,h.mv,h.ph,waterLine(P.x,P.z));}},
  off(f,h){if(h&&h.m){scene.remove(h.m.g);freeObj(h.m.g);}if(f.a){f.a.rideW=0;}}});
bankReady=true;
