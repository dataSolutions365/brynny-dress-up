/* ================= 🪂 HANG GLIDING off Lookout Mountain and ✈️ SKYDIVING from the Airfield =================
   🪂 HANG GLIDING: on the flat top of ⛰️ Lookout Mountain (26h-adventure.js) a wooden launch ramp sticks out over the slope
     toward town, with a hang glider waiting on it (RAMP). Step on the glowing spot, tap 🪂 Hang glide!, and you run down the ramp
     holding the glider's uprights, lift off, and swing up into the harness, lying flat like a real pilot.
     - Steer with the joystick (the glider banks into its turns and the camera swings round behind you). It slowly sinks.
     - 🦅 Thermals (THERM): warm air rising off the Basketball Court, the Skate Park, the Beach and the airfield's runway.
       Look for the hawk circling in each one: fly into it and you go up. The front of the mountain gives ridge lift too.
     - 🛬 Land comes down faster on the nearest open patch. Close to the ground you flare (nose up, swing upright) and run it out.
       Over the canal you splash down and swim. It never lands on a roof, a tree or the steep rock: it lifts over them.
   ✈️ SKYDIVING: at ✈️ Sunny Skies Airfield in Sunflower Hills (past the canal to the north-east, over its own footbridge; AIRF),
     step on the glowing spot by the plane and tap ✈️ Go skydiving!. You climb into the jump plane (a real-looking high-wing
     single-engine plane with a sliding jump door), it rolls down the runway, takes off and climbs in a big circle to jump height.
     - At the top the door slides open and you sit in it: tap 🪂 Jump!. Free fall belly down through the clouds (steer with the joystick),
       then 🪂 Pull! (or it opens by itself at the safe height, like a real automatic opener). The square canopy opens over you.
     - Steer the canopy down to the big round 🎯 target by the hangar. It flares by itself for a soft stand-up landing.
     - The plane drops back down, lands and taxis back to its spot for the next jump.
   How it moves: skyStep() (asked first by 25-game-loop.js) moves you while you're in any of this; the poses (prone in the harness,
   arched in free fall, hanging under the canopy, sitting in the door) go on after Avatar.update in the onTick below.
   skyFloor() is what's under you (buildings and trees from flyGrid in 24h-flying.js, the mountain, the far bank's pines);
   skyLandable() is where you're allowed to come down (the island, the walkable far bank in BANK_LAND, or the canal to swim in).
   Friends online see the glider, the free fall, the canopy and the plane through the 'sky' entry in SHOW.
   Challenges (🗺️ Explore tab in 3d/challenges.js): did('hglide','launch'|'thermal'|'long'|'town'), did('skydive','jump'|'land'|'target'). */

/* ---------- shared bits ---------- */
const SKM={
  tube:std('#c3c8ce',{roughness:.28,metalness:.85}),
  black:std('#1d1f23',{roughness:.55}),
  wire:new THREE.LineBasicMaterial({color:'#30343a',transparent:true,opacity:.75}),
  line:new THREE.LineBasicMaterial({color:'#f4f1ea',transparent:true,opacity:.8}),
  pod:std('#24324d',{roughness:.7}),podTrim:std('#ffb21f',{roughness:.6}),
  rig:std('#2c2f38',{roughness:.75}),rigTrim:std('#e8334a',{roughness:.6}),
  astro:std('#4f9a3e',{roughness:1}),
};
const SKY={mode:null,t:0,hd:0,sp:0,vy:0,vx:0,vz:0,pitch:0,bank:0,turn:0,pr:0,land:false,spot:null,flight:0,therm:0,said:{},gotThermal:false,camOld:null};
const tmpSky=new THREE.Vector3(),tmpSky2=new THREE.Vector3(),qSky=new THREE.Quaternion(),qSky2=new THREE.Quaternion(),eSky=new THREE.Euler(),xAxis=new THREE.Vector3(1,0,0),yAxis=new THREE.Vector3(0,1,0);
const skyEase=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
// how far out you may fly (the edge of the bigger world when there is one)
const skyMaxR=()=>(typeof WORLD!=='undefined'&&WORLD&&WORLD.out?WORLD.out:BANK.out+60)-6;

// where you may come down: true on land you can walk on, 'water' in the canal (you swim), false anywhere else
function skyLandable(x,z){const d=Math.hypot(x,z);if(d<=R+.3)return true;if(inCanal(x,z))return 'water';
  tmpSky.set(x,0,z);return bankLand(tmpSky)&&Math.abs(tmpSky.x-x)<.01&&Math.abs(tmpSky.z-z)<.01;}
// the highest thing under (x,z): buildings, trees and lamps on the island, the mountain's steep rock, the pines over the canal
function skyFloor(x,z){let f=flyFloor(x,z,1);const d=Math.hypot(x,z);
  if(Math.abs(x-MZ.x)<12&&Math.abs(z-MZ.z)<12){const [lx,lz]=MZ.toLocal(x,z),m=mtH(lx,lz);if(!m[1]&&m[0]>.3)f=Math.max(f,m[0]+1.6);}
  if(d>R+1){
    if(Math.hypot(x-TZ.x,z-TZ.z)<TZ.r+3)f=Math.max(f,15);// the tall trees of the ropes course
    else{const a=bankAng(x,z);if(a>ADV_LAND.a0&&a<ADV_LAND.a1&&d>BANK.in+2&&d<ADV_LAND.out+1){const [lx,lz]=MZ.toLocal(x,z);if(mtBase(lx,lz)[0]>1.1)f=Math.max(f,groundAt(x,z)+7);}}// the pines round the mountain
    if(!skyLandable(x,z))f=Math.max(f,groundAt(x,z)+2.5);}
  if(AIRF.near(x,z))f=Math.max(f,AIRF.floor(x,z));// the hangar and the parked plane
  return f;}

// 💨 the wind in your ears (a soft rushing noise that gets louder the faster you go)
const SKYW={g:null,f:null,v:0};
function skyWind(v){const a=ac();if(!a)return;if(!SKYW.g){if(v<=.001)return;
    const n=a.sampleRate*2,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.2;}
    const s=a.createBufferSource();s.buffer=b;s.loop=true;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=500;const g=a.createGain();g.gain.value=0;
    s.connect(f).connect(g).connect(a.destination);s.start();SKYW.g=g;SKYW.f=f;}
  if(Math.abs(v-SKYW.v)<.002&&v===0)return;SKYW.v+=(v-SKYW.v)*.1;if(SKYW.v<.002&&v===0)SKYW.v=0;
  SKYW.g.gain.setTargetAtTime(SKYW.v,a.currentTime,.08);SKYW.f.frequency.setTargetAtTime(350+SKYW.v*5200,a.currentTime,.15);}
// high up, the haze moves further out so you can see the whole island below
let skyFogKeep=null;
function skyFog(h){const F=scene.fog;if(!F)return;
  if(h>9){if(!skyFogKeep)skyFogKeep={n:F.near,f:F.far};const k=Math.min(1,(h-9)/45);F.near=skyFogKeep.n+k*110;F.far=skyFogKeep.f+k*300;}
  else if(skyFogKeep){F.near=skyFogKeep.n;F.far=skyFogKeep.f;skyFogKeep=null;}}

/* ---------- poses (the same for you and for friends online) ---------- */
const SKYP={
  up:{shx:-2.5,shz:.32,el:-.55,hpx:0,hpz:0,kn:.05,sp:0,hd:0},// standing, holding the glider's uprights up by your shoulders
  prone:{shx:-1.62,shz:.2,el:-.42,hpx:.06,hpz:.02,kn:.1,sp:-.06,hd:-1.0},// lying flat in the harness, hands on the bar, looking ahead
  box:{shx:.45,shz:1.95,el:-1.35,hpx:.18,hpz:.3,kn:1.3,sp:-.18,hd:-.85},// the belly-down free-fall arch
  hang:{shx:-.12,shz:2.55,el:-.5,hpx:-.28,hpz:.05,kn:.32,sp:0,hd:-.12},// hanging under the canopy, hands up on the toggles
  flare:{shx:-.25,shz:.9,el:-1.0,hpx:-.7,hpz:.04,kn:.45,sp:.06,hd:-.1},// toggles pulled down, legs forward for the landing
  sit:{shx:-.3,shz:.12,el:-.7,hpx:-1.5,hpz:.1,kn:1.5,sp:.04,hd:-.12},// sitting on the plane's floor by the door
};
function skyPoseSet(A,a,b,t){if(!A||!A.arms)return;const L=k=>a[k]+(b[k]-a[k])*t;
  for(const r of A.arms){r.sh.rotation.x=L('shx');r.sh.rotation.z=r.sx*L('shz');r.sh.rotation.y=0;r.el.rotation.x=L('el');}
  for(const l of A.legs){l.hp.rotation.x=L('hpx');l.hp.rotation.z=l.sx*L('hpz');l.hp.rotation.y=0;l.kn.rotation.x=L('kn');}
  A.spine.rotation.x=L('sp');A.spine.rotation.z=0;A.head.rotation.x=L('hd');A.head.rotation.y=0;A.hips.position.y=A.hip;}
// a thin stick you can move every frame (the glider's hang strap)
function skyStrap(parent,mat,r=.012){const m=M(cyl(r,r,1,5),mat,0,0,0,parent,false,false);return m;}
function skyStrapSet(m,a,b){tmpSky2.subVectors(b,a);const L=tmpSky2.length()||1e-3;m.position.copy(a).add(b).multiplyScalar(.5);m.scale.set(1,L,1);m.quaternion.setFromUnitVectors(yAxis,tmpSky2.multiplyScalar(1/L));}

/* ================= 🪂 THE HANG GLIDER ================= */
// glider space: +z is the nose, +y up, the hang point on the keel is the middle. Span 6.3, like a real one next to a person.
const HGP={N:new THREE.Vector3(0,.06,1.3),K:new THREE.Vector3(0,.02,-1.28),span:3.15,hip:new THREE.Vector3(0,-.98,-.22),hipUp:new THREE.Vector3(0,-1.38,-.05),
  bar:.42,barY:-1.32,barW:.62,hang:new THREE.Vector3(0,0,-.08)};
HGP.tip=s=>new THREE.Vector3(s*HGP.span,.27,-.95);HGP.tipT=s=>new THREE.Vector3(s*HGP.span,.28,-1.1);
let hgSailMat=null;
function hgSail(){if(!hgSailMat)hgSailMat=std('#ffffff',{roughness:.55,side:THREE.DoubleSide,map:canvasTex(256,128,(x,w,h)=>{
    x.fillStyle='#f4f3ee';x.fillRect(0,0,w,h);
    x.fillStyle='#2fa4e7';x.fillRect(w*.52,0,w*.22,h);x.fillStyle='#ffd23f';x.fillRect(w*.74,0,w*.26,h);x.fillStyle='#e8334a';x.fillRect(w*.9,0,w*.1,h);
    x.fillStyle='#1d3a6b';x.fillRect(0,0,w,h*.16);// the leading edge pocket
    x.strokeStyle='rgba(120,120,120,.35)';x.lineWidth=1.5;for(let i=1;i<8;i++){x.beginPath();x.moveTo(w*i/8,h*.16);x.lineTo(w*i/8,h);x.stroke();}// the seams between the panels
    x.fillStyle='rgba(255,255,255,.9)';x.font='700 18px sans-serif';x.fillText('SKYHIGH',w*.25,h*.6);})});
  const nu=16,nv=7,pos=[],uv=[],idx=[];
  for(const s of [-1,1]){const o=pos.length/3,tip=HGP.tip(s),tt=HGP.tipT(s);
    for(let i=0;i<=nu;i++){const u=i/nu,le=new THREE.Vector3().lerpVectors(HGP.N,tip,u),te=new THREE.Vector3().lerpVectors(HGP.K,tt,Math.pow(u,1.15));
      te.z+=.12*Math.sin(Math.PI*u);// the trailing edge curves forward a little between the keel and the tips
      for(let j=0;j<=nv;j++){const v=j/nv,p=new THREE.Vector3().lerpVectors(le,te,v);p.y+=.2*Math.sin(Math.PI*v)*Math.pow(1-u,.55)+.05*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
        pos.push(p.x,p.y,p.z);uv.push(u,1-v);}}
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=o+i*(nv+1)+j,b=a+nv+1;if(s>0)idx.push(a,b,a+1,b,b+1,a+1);else idx.push(a,a+1,b,b,a+1,b+1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function hgBuild(){const g=new THREE.Group();g.name='hangGlider';
  M(hgSail(),hgSailMat,0,0,0,g,true,false);
  const B=advBatch(),V=(x,y,z)=>new THREE.Vector3(x,y,z),N=HGP.N,K=HGP.K,apex=V(0,.0,.12),kp=V(0,.82,-.06);
  for(const s of [-1,1]){B.stick(N,HGP.tip(s),.028,SKM.tube,8);B.stick(V(0,.02,-.12),new THREE.Vector3().lerpVectors(N,HGP.tip(s),.56),.022,SKM.tube,7);
    B.stick(apex,V(s*HGP.barW,HGP.barY,HGP.bar),.02,SKM.tube,7);}
  B.stick(N,K,.03,SKM.tube,8);B.stick(V(0,0,-.06),kp,.018,SKM.tube,6);
  B.stick(V(-HGP.barW,HGP.barY,HGP.bar),V(HGP.barW,HGP.barY,HGP.bar),.022,SKM.tube,7);
  for(const s of [-1,1])B.add(cyl(.03,.03,.16,8),SKM.black,s*.13,HGP.barY,HGP.bar,0,0,Math.PI/2);// the grips
  B.add(new THREE.SphereGeometry(.05,8,6),SKM.black,0,.03,1.32);// the nose cone
  B.done(g,true);
  // the flying wires (below) and the landing wires (above), to the nose, the tail and the tips
  const w=[],L=(a,b)=>w.push(a.x,a.y,a.z,b.x,b.y,b.z);
  for(const s of [-1,1]){const bb=V(s*HGP.barW,HGP.barY,HGP.bar);L(bb,N);L(bb,K);L(bb,HGP.tip(s));L(bb,new THREE.Vector3().lerpVectors(N,HGP.tip(s),.56));L(kp,HGP.tip(s));L(kp,new THREE.Vector3().lerpVectors(N,HGP.tip(s),.56));}
  L(kp,N);L(kp,K);
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(w,3));g.add(new THREE.LineSegments(wg,SKM.wire));
  g.userData.strap=skyStrap(g,SKM.black,.014);g.userData.strap.visible=false;
  return g;}
// the harness pod you lie in (on the avatar's hips, so it moves with you)
function hgPod(A){if(!A||!A.hips)return null;const g=new THREE.Group();g.name='hgPod';
  const pod=M(new THREE.CapsuleGeometry(.155,.62,6,14),SKM.pod,0,-.36,-.03,g,false,false);pod.scale.set(1.05,1,.95);
  M(new THREE.CapsuleGeometry(.16,.22,6,14),SKM.pod,0,.16,-.04,g,false,false).scale.set(1.12,1,.9);// the back plate up to the shoulders
  const tr=M(new THREE.TorusGeometry(.162,.016,6,22),SKM.podTrim,0,-.05,-.03,g,false,false);tr.rotation.x=Math.PI/2;
  M(box(.05,.5,.02),SKM.podTrim,0,-.3,-.19,g,false,false);
  A.hips.add(g);return g;}
// put the glider and its pilot together: P is where your feet would be, hips straight above; pr 0 standing .. 1 lying flat
const hgV=new THREE.Vector3(),hgV2=new THREE.Vector3(),hgQ=new THREE.Quaternion(),hgQ2=new THREE.Quaternion();
function hgPlace(G,A,P,yaw,pitch,bank,pr){const hip=A?A.hip:.55;
  hgQ.setFromEuler(eSky.set(-pitch,yaw,-bank,'YXZ'));
  const hipL=hgV.lerpVectors(HGP.hipUp,HGP.hip,pr);
  const hips=tmpSky.set(P.x,P.y+hip,P.z);
  G.position.copy(hipL).applyQuaternion(hgQ).negate().add(hips);G.quaternion.copy(hgQ);
  if(A){// you hang under it: tipped forward onto your tummy (pr), swinging with the glider
    hgQ2.setFromAxisAngle(xAxis,pr*Math.PI/2*(1-.04)-pitch*.5*pr);qSky.copy(hgQ).multiply(hgQ2);
    A.g.quaternion.copy(qSky);A.g.position.copy(hgV2.set(0,hip,0).applyQuaternion(qSky)).negate().add(hips);
    skyPoseSet(A,SKYP.up,SKYP.prone,pr);
    // the hang strap from the keel down to the carabiner on your back
    const st=G.userData.strap;st.visible=true;const back=hgV2.set(0,.22,-.16).applyQuaternion(qSky).add(hips);G.worldToLocal(back);skyStrapSet(st,HGP.hang,back);}}

/* ---------- the launch ramp on top of Lookout Mountain ---------- */
const RAMP={a:[1.05,1.15],b:[1.05,5.3],w:1.7,drop:.75};// in the mountain's own directions (+z faces town)
{const g=MZ.g,B=advBatch(),y0=MT.H+.12,len=RAMP.b[1]-RAMP.a[1],sl=Math.atan2(RAMP.drop,len),hy=lz=>y0-(lz-RAMP.a[1])/len*RAMP.drop;
  RAMP.y=lz=>hy(lz);
  // the deck with green turf on it, sloping down and out over the edge
  for(let lz=RAMP.a[1];lz<RAMP.b[1];lz+=.32)B.add(box(RAMP.w,.08,.3),ADM.wood,RAMP.a[0],hy(lz+.15)-.05,lz+.15,sl,0,0);
  B.add(box(RAMP.w-.12,.02,len),SKM.astro,RAMP.a[0],(hy(RAMP.a[1])+hy(RAMP.b[1]))/2+.005,(RAMP.a[1]+RAMP.b[1])/2,sl,0,0);
  // beams and posts down to the rock
  for(const s of [-1,1]){const x=RAMP.a[0]+s*(RAMP.w/2-.1);B.stick(new THREE.Vector3(x,hy(RAMP.a[1])-.12,RAMP.a[1]),new THREE.Vector3(x,hy(RAMP.b[1])-.12,RAMP.b[1]),.07,ADM.dark,6);
    for(let lz=RAMP.a[1]+.9;lz<=RAMP.b[1]+.01;lz+=1.05){const gy=mtH(x,lz)[0];if(hy(lz)-gy>.25)B.stick(new THREE.Vector3(x,gy-.3,lz),new THREE.Vector3(x,hy(lz)-.1,lz),.06,ADM.dark,6);}
    // low side rails at the back half
    B.stick(new THREE.Vector3(x,hy(RAMP.a[1])+.55,RAMP.a[1]),new THREE.Vector3(x,hy(RAMP.a[1]+1.6)+.55,RAMP.a[1]+1.6),.03,ADM.wood,6);
    B.stick(new THREE.Vector3(x,hy(RAMP.a[1]),RAMP.a[1]),new THREE.Vector3(x,hy(RAMP.a[1])+.55,RAMP.a[1]),.03,ADM.wood,6);
    B.stick(new THREE.Vector3(x,hy(RAMP.a[1]+1.6),RAMP.a[1]+1.6),new THREE.Vector3(x,hy(RAMP.a[1]+1.6)+.55,RAMP.a[1]+1.6),.03,ADM.wood,6);}
  // a windsock on the top so you can see which way the wind blows (up the front of the mountain, toward you)
  B.stick(new THREE.Vector3(-.4,MT.H,1.9),new THREE.Vector3(-.4,MT.H+2.6,1.9),.03,ADM.steel,6);
  B.done(g);
  RAMP.sock=skySock(g,-.4,MT.H+2.55,1.9,.6);
  {const r=M(new THREE.RingGeometry(.45,.62,32),ADM.pad,RAMP.a[0],y0+.04,RAMP.a[1]+.25,g,false,false);r.rotation.x=-Math.PI/2;RAMP.pad=r;}
  const [wx,wz]=MZ.toWorld(RAMP.a[0],RAMP.a[1]+.25);RAMP.padW=[wx,wz];RAMP.face=MZ.rot;
  RAMP.A=MZ.toWorld(...RAMP.a);RAMP.B=MZ.toWorld(...RAMP.b);}
// a windsock: orange and white stripes, it points the way the wind blows and flutters (dir: the way it points, in the parent's space)
function skySock(parent,x,y,z,s=1,dir=Math.PI){const piv=new THREE.Group();piv.position.set(x,y,z);parent.add(piv);
  const m=std('#ffffff',{roughness:.8,side:THREE.DoubleSide,map:canvasTex(64,16,(c,w,h)=>{for(let i=0;i<5;i++){c.fillStyle=i%2?'#ffffff':'#ff6a1f';c.fillRect(i*w/5,0,w/5+1,h);}})});
  const geo=new THREE.CylinderGeometry(.16*s,.07*s,1.1*s,12,4,true);geo.rotateZ(Math.PI/2);geo.translate(.55*s,0,0);
  {const uv=geo.attributes.uv,p=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/(1.1*s),uv.getX(i));}
  const sock=M(geo,m,0,0,0,piv,false,false);M(new THREE.TorusGeometry(.16*s,.012,6,14),SKM.tube,0,0,0,piv,false,false).rotation.y=Math.PI/2;
  piv.rotation.y=dir-Math.PI/2;const ph=Math.random()*9;
  anims.push(t=>{sock.rotation.z=-.12+Math.sin(t*2.3+ph)*.06;sock.rotation.y=Math.sin(t*1.7+ph)*.12;sock.scale.y=1+Math.sin(t*9+ph)*.04;});
  return piv;}
// the glider waiting on the ramp (it goes back there after every flight)
const hgParked=hgBuild();
function hgPark(){const [x,z]=MZ.toWorld(RAMP.a[0],RAMP.a[1]+1.0),y=RAMP.y(RAMP.a[1]+1.0);
  hgParked.position.set(x,y+1.32-.02,z);hgParked.rotation.set(0,0,0);hgParked.rotation.order='YXZ';hgParked.rotation.set(-.2,RAMP.face,0);
  hgParked.position.y=y-(HGP.barY*Math.cos(.2)+HGP.bar*Math.sin(-.2))+.03;hgParked.visible=true;}
scene.add(hgParked);hgPark();
const hgFly=hgBuild();hgFly.visible=false;scene.add(hgFly);

/* ---------- 🦅 thermals: warm air rising off hot ground, each with a hawk circling in it ---------- */
const THERM=[];
function skyThermal(x,z,r=6.5,lift=2.9,top=27){const T={x,z,r,lift,top,hawk:skyHawk(),ph:Math.random()*6,hy:11+Math.random()*5};scene.add(T.hawk);THERM.push(T);return T;}
let hawkMats=null;
function skyHawk(){if(!hawkMats)hawkMats={b:std('#5b3e27',{roughness:.9,side:THREE.DoubleSide}),l:std('#d6b48c',{roughness:.9}),t:std('#b5532e',{roughness:.9,side:THREE.DoubleSide}),y:std('#e8b33a',{roughness:.6})};
  const g=new THREE.Group(),s=1.25;
  M(sph(.075*s,10,8),hawkMats.l,0,0,0,g,false,false).scale.set(1,.85,2.6);
  M(sph(.055*s,10,8),hawkMats.b,0,.025*s,.2*s,g,false,false);
  M(new THREE.ConeGeometry(.018*s,.05*s,6),hawkMats.y,0,.015*s,.27*s,g,false,false).rotation.x=Math.PI/2;
  const wing=sx=>{const sh=new THREE.Shape(),P=[[0,.1],[.22,.11],[.45,.07],[.6,.02],[.66,-.01],[.6,-.03],[.65,-.06],[.56,-.065],[.6,-.1],[.48,-.09],[.3,-.11],[0,-.1]];
    sh.moveTo(P[0][0]*s*sx,P[0][1]*s);for(const p of P.slice(1))sh.lineTo(p[0]*s*sx,p[1]*s);const geo=new THREE.ShapeGeometry(sh);geo.rotateX(Math.PI/2);const w=new THREE.Group();g.add(w);M(geo,hawkMats.b,0,0,0,w,false,false);return w;};
  g.userData.w=[wing(1),wing(-1)];
  {const sh=new THREE.Shape();sh.moveTo(-.035*s,0);sh.lineTo(.035*s,0);sh.lineTo(.08*s,-.2*s);sh.lineTo(-.08*s,-.2*s);sh.closePath();const geo=new THREE.ShapeGeometry(sh);geo.rotateX(Math.PI/2);M(geo,hawkMats.t,0,0,-.12*s,g,false,false);}
  return g;}
anims.push((t,dt)=>{for(const T of THERM){const a=t*.45+T.ph,h=T.hawk;h.position.set(T.x+Math.sin(a)*5,T.hy+Math.sin(t*.3+T.ph)*1.5,T.z+Math.cos(a)*4);
  h.rotation.order='YXZ';h.rotation.set(0,a+Math.PI/2,-.38);const fl=Math.max(0,Math.sin(t*.7+T.ph*3))>.93?Math.sin(t*14)*.35:.1;h.userData.w[0].rotation.z=fl;h.userData.w[1].rotation.z=-fl;}});
// how much the air lifts you at (x,y,z): thermals, and ridge lift where the wind blows up the front of Lookout Mountain
function skyLift(x,z,y){let L=0,inT=false;for(const T of THERM){const d=Math.hypot(x-T.x,z-T.z);if(d<T.r&&y<T.top){const k=T.lift*(1-(d/T.r)**2)*Math.min(1,(T.top-y)/4);if(k>L)L=k;if(k>1)inT=true;}}
  if(Math.abs(x-MZ.x)<20&&Math.abs(z-MZ.z)<20){const [lx,lz]=MZ.toLocal(x,z);if(lz>1&&lz<16&&Math.abs(lx)<9&&y<MT.H+7)L=Math.max(L,1.15*Math.min(1,(16-lz)/6)*Math.min(1,(9-Math.abs(lx))/3)*Math.min(1,(MT.H+7-y)/3));}
  return [L,inT];}

/* ================= ✈️ SUNNY SKIES AIRFIELD (Sunflower Hills, past the canal) ================= */
const AIRF={a:64,a0:52,a1:76,bridge:70};
AIRF.out=BANK.out+52;AIRF.t0=BANK.out+6;AIRF.t1=BANK.out+46;AIRF.w=5.2;
AIRF.ux=Math.sin(deg(AIRF.a));AIRF.uz=Math.cos(deg(AIRF.a));AIRF.vx=AIRF.uz;AIRF.vz=-AIRF.ux;// u: along the runway (outward), v: to its side
AIRF.at=(t,s)=>[AIRF.ux*t+AIRF.vx*s,AIRF.uz*t+AIRF.vz*s];// a spot by distance from the middle of the island (t) and to the side (s)
AIRF.loc=(x,z)=>[x*AIRF.ux+z*AIRF.uz,x*AIRF.vx+z*AIRF.vz];
AIRF.hdg=Math.atan2(AIRF.ux,AIRF.uz);// the way a plane faces taking off
BANK_LAND.push({id:'airfield',a0:AIRF.a0,a1:AIRF.a1,out:AIRF.out,ground:1});// ground: it draws its own ground, but you walk on it like any bank land (own:1 is for places that do their own walking)
AIRF.hangar={t:BANK.out+14,s:9.5,len:9,r:3.6};AIRF.tgt={t:BANK.out+30,s:10.5,r:3.2};AIRF.sockAt={t:BANK.out+24,s:-5};
AIRF.park={t:AIRF.t0+4.2,s:0};AIRF.pad={t:AIRF.t0+4.6,s:3.2};
AIRF.near=(x,z)=>{const d=Math.hypot(x,z);return d>BANK.out-2&&d<AIRF.out+2&&Math.abs(bankAng(x,z)-AIRF.a)<14;};
AIRF.floor=(x,z)=>{const [t,s]=AIRF.loc(x,z),H=AIRF.hangar;let f=0;
  if(Math.abs(t-H.t)<H.len/2+1&&Math.abs(s-H.s)<H.r+1)f=H.r+.6;
  if(PL&&PL.mode==='park'){const [pt,ps]=AIRF.loc(PL.pos.x,PL.pos.z);if(Math.abs(t-pt)<4&&Math.abs(s-ps)<4.6)f=Math.max(f,2.4);}
  return f;};
{const [x,z]=AIRF.at(AIRF.tgt.t,AIRF.tgt.s);AIRF.tgt.x=x;AIRF.tgt.z=z;}
{const g=new THREE.Group();scene.add(g);AIRF.g=g;const th0=deg(AIRF.a0-90),th=deg(AIRF.a1-AIRF.a0);
  // the land: grass out to the edge of the airfield, with a sandy edge down to the water (Sunflower Hills grow round it)
  {const m=M(new THREE.RingGeometry(BANK.out-.4,AIRF.out,40,1,th0,th),groundMat,0,.004,0,g,false,true);m.rotation.x=-Math.PI/2;}
  const sand=std('#e8cf9a',{map:TEX.sand,roughness:1});
  M(new THREE.CylinderGeometry(AIRF.out,AIRF.out+2,3,40,1,true,deg(AIRF.a0),deg(AIRF.a1-AIRF.a0)),sand,0,-1.5,0,g,false,true);
  for(const a of [AIRF.a0,AIRF.a1]){const L=AIRF.out-BANK.out+.4,w=M(new THREE.PlaneGeometry(L,3),sand,0,0,0,g,false,true);const r=(BANK.out+AIRF.out)/2;
    w.position.set(Math.sin(deg(a))*r,-1.5,Math.cos(deg(a))*r);w.rotation.y=deg(a)-Math.PI/2;w.material.side=THREE.DoubleSide;}
  // the runway: asphalt with the white markings, 06 at this end and 24 at the far end, like a real one
  const tex=canvasTex(128,1024,(x,w,h)=>{x.fillStyle='#45484c';x.fillRect(0,0,w,h);
    for(let i=0;i<2600;i++){const c=60+Math.random()*30|0;x.fillStyle=`rgba(${c},${c},${c+4},.5)`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);}
    x.fillStyle='#f2f2ee';x.fillRect(5,0,4,h);x.fillRect(w-9,0,4,h);
    for(let y=150;y<h-150;y+=56)x.fillRect(w/2-2,y,4,30);
    for(const end of [0,1]){x.save();if(end){x.translate(w,h);x.rotate(Math.PI);}
      for(let i=0;i<8;i++)if(i!==3&&i!==4)x.fillRect(14+i*13,10,8,52);
      x.font='700 46px sans-serif';x.textAlign='center';x.fillText(end?'06':'24',w/2,118);x.restore();}});
  tex.anisotropy=8;
  const rwLen=AIRF.t1-AIRF.t0,rw=M(new THREE.PlaneGeometry(AIRF.w,rwLen),std('#ffffff',{map:tex,roughness:.9}),0,.03,0,g,false,true);
  rw.rotation.order='YXZ';rw.rotation.set(-Math.PI/2,AIRF.hdg,0);// the texture's top is the runway's far end
  {const [x,z]=AIRF.at((AIRF.t0+AIRF.t1)/2,0);rw.position.set(x,.03,z);}
  rw.material.polygonOffset=true;rw.material.polygonOffsetFactor=-3;rw.material.polygonOffsetUnits=-3;
  // the taxiway apron by the hangar (concrete), and a gravel path from the footbridge
  const conc=std('#b9b5ad',{roughness:.95});conc.polygonOffset=true;conc.polygonOffsetFactor=-2;conc.polygonOffsetUnits=-2;
  const flat=(w,l,t,s,mat,rot=0,y=.02)=>{const m=M(new THREE.PlaneGeometry(w,l),mat,0,y,0,g,false,true);m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,AIRF.hdg+rot,0);const [x,z]=AIRF.at(t,s);m.position.set(x,y,z);return m;};
  flat(6.2,AIRF.hangar.len+2,AIRF.hangar.t,AIRF.hangar.s-4.2,conc);
  flat(3.6,4,AIRF.hangar.t,(AIRF.hangar.s-4.2+AIRF.w/2)/2,conc);
  // the 🎯 landing target: a big round bed of pea gravel with white rings and a bright middle
  {const tg=new THREE.Group();tg.position.set(AIRF.tgt.x,.025,AIRF.tgt.z);g.add(tg);
    const pea=std('#ffffff',{roughness:1,map:canvasTex(128,128,(x,w,h)=>{x.fillStyle='#d8c7a4';x.fillRect(0,0,w,h);for(let i=0;i<1400;i++){const c=Math.random();x.fillStyle=c<.4?'#b9a582':c<.7?'#efe2c4':'#a28f6c';x.beginPath();x.arc(Math.random()*w,Math.random()*h,.8+Math.random()*1.4,0,7);x.fill();}},4)});
    pea.polygonOffset=true;pea.polygonOffsetFactor=-2;pea.polygonOffsetUnits=-2;
    const ring=(r0,r1,m,y)=>{const q=M(new THREE.RingGeometry(r0,r1,48),m,0,y,0,tg,false,true);q.rotation.x=-Math.PI/2;q.material.polygonOffset=true;q.material.polygonOffsetFactor=-3;q.material.polygonOffsetUnits=-3;};
    {const q=M(new THREE.CircleGeometry(AIRF.tgt.r,48),pea,0,0,0,tg,false,true);q.rotation.x=-Math.PI/2;}
    const wht=std('#f6f4ee',{roughness:.8});ring(AIRF.tgt.r*.62,AIRF.tgt.r*.66,wht,.004);ring(AIRF.tgt.r*.3,AIRF.tgt.r*.34,wht,.004);ring(AIRF.tgt.r-.12,AIRF.tgt.r,wht,.004);
    {const q=M(new THREE.CircleGeometry(.42,32),std('#ff4d3a',{roughness:.6}),0,.008,0,tg,false,true);q.rotation.x=-Math.PI/2;q.material.polygonOffset=true;q.material.polygonOffsetFactor=-4;q.material.polygonOffsetUnits=-4;}}
  // the hangar: a round-roofed metal one, open at the front, with the SKYDIVE sign
  {const H=AIRF.hangar,hg=new THREE.Group();const [x,z]=AIRF.at(H.t,H.s);hg.position.set(x,0,z);hg.rotation.y=AIRF.hdg+Math.PI/2;g.add(hg);// its front faces the runway
    const corr=std('#ffffff',{roughness:.45,metalness:.55,side:THREE.DoubleSide,map:canvasTex(256,32,(c,w,h)=>{for(let i=0;i<w;i+=8){const gr=c.createLinearGradient(i,0,i+8,0);gr.addColorStop(0,'#9aa3ab');gr.addColorStop(.5,'#dfe5ea');gr.addColorStop(1,'#9aa3ab');c.fillStyle=gr;c.fillRect(i,0,8,h);}},)});
    corr.map.wrapS=corr.map.wrapT=THREE.RepeatWrapping;corr.map.repeat.set(3,6);
    const roof=new THREE.CylinderGeometry(H.r,H.r,H.len,28,1,true,-Math.PI/2,Math.PI);roof.rotateX(Math.PI/2);M(roof,corr,0,0,0,hg,true,true);
    // the back wall, and the front wall round the big door
    const wall=std('#d9dde0',{roughness:.7,side:THREE.DoubleSide});
    {const s=new THREE.Shape();s.absarc(0,0,H.r,0,Math.PI,false);const m=M(new THREE.ShapeGeometry(s,24),wall,0,0,-H.len/2,hg,true,true);}
    {const s=new THREE.Shape();s.absarc(0,0,H.r,0,Math.PI,false);const hole=new THREE.Path();hole.moveTo(-2.6,0);hole.lineTo(2.6,0);hole.lineTo(2.6,2.7);hole.lineTo(-2.6,2.7);hole.closePath();s.holes.push(hole);
      M(new THREE.ShapeGeometry(s,24),wall,0,0,H.len/2,hg,true,true);
      const dark=M(new THREE.PlaneGeometry(5.2,2.7),std('#2a2c30',{roughness:1}),0,1.35,H.len/2-.25,hg,false,false);}
    const sg=M(new THREE.PlaneGeometry(3.4,.85),new THREE.MeshStandardMaterial({map:labelTex('SKYDIVE',{bg:'#1d3a6b',fg:'#ffd23f',border:'#ffffff',size:70}),roughness:.6}),0,3.15,H.len/2+.02,hg,false,false);
    for(let i=-2;i<=2;i++)if(i){const [ox,oz]=AIRF.at(H.t+i*1.9,H.s+(Math.abs(i)>1?0:1.6));obs.push({x:ox,z:oz,r:H.r*.55});}
    {const [ox,oz]=AIRF.at(H.t,H.s+1.6);obs.push({x:ox,z:oz,r:H.r*.55});}}
  // a fuel tank and a picnic bench by the apron, the windsock by the runway
  {const [x,z]=AIRF.at(AIRF.hangar.t+AIRF.hangar.len/2+2.4,AIRF.hangar.s-1);const tk=new THREE.Group();tk.position.set(x,0,z);tk.rotation.y=AIRF.hdg;g.add(tk);
    M(new THREE.CapsuleGeometry(.55,1.5,6,16),std('#e8e3d6',{roughness:.5,metalness:.3}),0,.95,0,tk).rotation.z=Math.PI/2;
    for(const s of [-1,1])M(box(.1,.45,.8),SKM.black,s*.6,.22,0,tk);M(box(.35,.08,.25),std('#e8334a'),0,1.55,0,tk);obs.push({x,z,r:1.1});}
  {const [x,z]=AIRF.at(AIRF.sockAt.t,AIRF.sockAt.s);const B=advBatch();B.stick(new THREE.Vector3(x,0,z),new THREE.Vector3(x,4.2,z),.05,std('#e8e3d6',{roughness:.5}),8);B.done(g);
    AIRF.sock=skySock(g,x,4.15,z,1.3,AIRF.hdg+Math.PI);obs.push({x,z,r:.2});}
  // runway edge lights
  {const lm=glow('#fff3c4',1.4),geo=cyl(.06,.08,.22,8),n=Math.round((AIRF.t1-AIRF.t0)/5);const mesh=new THREE.InstancedMesh(geo,lm,(n+1)*2);let k=0;const m4=new THREE.Matrix4();
    for(let i=0;i<=n;i++)for(const s of [-1,1]){const [x,z]=AIRF.at(AIRF.t0+i*(AIRF.t1-AIRF.t0)/n,s*(AIRF.w/2+.5));m4.makeTranslation(x,.11,z);mesh.setMatrixAt(k++,m4);}g.add(mesh);}
  // the glowing spot where you get in
  {const [x,z]=AIRF.at(AIRF.pad.t,AIRF.pad.s);const r=M(new THREE.RingGeometry(.5,.7,32),ADM.pad,x,.05,z,g,false,false);r.rotation.x=-Math.PI/2;AIRF.padW=[x,z];AIRF.padM=r;}
  // 🌻 sunflowers round the edge of the field
  {const n=60,stem=new THREE.InstancedMesh(cyl(.025,.03,1,5),std('#4d8a32',{roughness:.9}),n),head=new THREE.InstancedMesh(new THREE.CylinderGeometry(.2,.2,.05,12),std('#f7c520',{roughness:.8}),n),
      mid=new THREE.InstancedMesh(new THREE.CylinderGeometry(.09,.09,.06,10),std('#5a3a1c',{roughness:.9}),n);
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3();let k=0,sd=7;const rr=()=>((sd=(sd*16807)%2147483647)-1)/2147483646;
    for(let i=0;i<400&&k<n;i++){const t=BANK.out+2+rr()*(AIRF.out-BANK.out-4),sd2=(rr()<.5?-1:1)*(4+rr()*10),[x,z]=AIRF.at(t,sd2);
      const a=bankAng(x,z);if(a<AIRF.a0+1.5||a>AIRF.a1-1.5)continue;if(Math.abs(sd2)<AIRF.w/2+2.5)continue;
      const [ht,hs]=[t-AIRF.hangar.t,sd2-AIRF.hangar.s];if(Math.abs(ht)<AIRF.hangar.len/2+4&&Math.abs(hs)<AIRF.hangar.r+5)continue;
      if(Math.hypot(x-AIRF.tgt.x,z-AIRF.tgt.z)<AIRF.tgt.r+2.5)continue;if(Math.abs(t-AIRF.sockAt.t)<2&&Math.abs(sd2-AIRF.sockAt.s)<2)continue;
      const h=.9+rr()*.6;m4.compose(v.set(x,h/2,z),q.identity(),s.set(1,h,1));stem.setMatrixAt(k,m4);
      q.setFromEuler(eSky.set(Math.PI/2-.5,AIRF.hdg+Math.PI+(rr()-.5)*.6,0,'YXZ'));m4.compose(v.set(x,h,z),q,s.set(1,1,1));head.setMatrixAt(k,m4);
      m4.compose(v.set(x,h,z).add(tmpSky.set(0,.02,.03).applyQuaternion(q)),q,s.set(1,1,1));mid.setMatrixAt(k,m4);k++;}
    for(const im of [stem,head,mid]){im.count=k;g.add(im);}}}

/* ---------- 🌉 the footbridge over the canal to the airfield (like the one to Lookout Mountain) ---------- */
{const F={a:AIRF.bridge,t0:R-2.5,t1:BANK.in+2.8,w:2.4,top:2.3};F.ux=Math.sin(deg(F.a));F.uz=Math.cos(deg(F.a));AIRF.fb=F;
  const loc=(x,z)=>[x*F.ux+z*F.uz,x*F.uz-z*F.ux],deck=t=>F.top*Math.sin(Math.PI*Math.max(0,Math.min(1,(t-F.t0)/(F.t1-F.t0))))+.1;F.deck=deck;F.loc=loc;
  SURF.push({h(x,z){const [t,s]=loc(x,z);if(t<F.t0||t>F.t1||Math.abs(s)>F.w/2-.18)return -1;return deck(t);}});
  BANK_BRIDGES.push({a:F.a,w:F.w,on:p=>HIGH.on||deck(loc(p.x,p.z)[0])<.5});
  const g=new THREE.Group();g.rotation.y=deg(F.a);scene.add(g);const B=advBatch(),hw=F.w/2,P=(s,t,dy=0)=>new THREE.Vector3(s,deck(t)+dy,t);
  for(let t=F.t0+.15;t<F.t1;t+=.3){const sl=Math.atan2(deck(t+.1)-deck(t-.1),.2);B.add(box(F.w,.07,.27),ADM.wood,0,deck(t)-.04,t,-sl,0,0);}
  for(const s of [-1,1]){
    for(let t=F.t0;t<F.t1-.4;t+=.4)B.stick(P(s*(hw-.08),t,-.12),P(s*(hw-.08),t+.4,-.12),.07,ADM.dark,6);
    for(let t=F.t0+.3;t<F.t1;t+=1.6){B.stick(P(s*(hw-.06),t,-.05),P(s*(hw-.06),t,1.02),.05,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,1.02),P(s*(hw-.06),Math.min(F.t1-.3,t+1.6),1.02),.045,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,.55),P(s*(hw-.06),Math.min(F.t1-.3,t+1.6),.55),.025,ADM.rope,5);}
    const arch=[];for(let i=0;i<=24;i++){const t=F.t0+3+(F.t1-F.t0-6)*i/24;arch.push(P(s*(hw-.2),t,-.18-(.6*Math.sin(Math.PI*i/24))));}
    for(let i=0;i<24;i++)B.stick(arch[i],arch[i+1],.11,ADM.dark,7);}
  for(const t of [F.t0+3.4,F.t1-3.4])B.add(new THREE.CylinderGeometry(.55,.75,2.4,10),ADM.stone,0,-.9,t,0,0,0,2.4,1,1);
  B.done(g);
  // a gravel path from the end of the bridge to the hangar
  const pm=std('#cdbb98',{roughness:1});pm.polygonOffset=true;pm.polygonOffsetFactor=-1;pm.polygonOffsetUnits=-1;
  const a=[Math.sin(deg(F.a))*F.t1,Math.cos(deg(F.a))*F.t1],b=AIRF.at(AIRF.hangar.t-AIRF.hangar.len/2-1,AIRF.hangar.s-3.5),dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
  const m=M(new THREE.PlaneGeometry(1.8,L),pm,(a[0]+b[0])/2,.015,(a[1]+b[1])/2,AIRF.g,false,true);m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,Math.atan2(dx,dz),0);}
function skyMap(x,w2s,k){const F=AIRF.fb,a=w2s(F.ux*F.t0,F.uz*F.t0),b=w2s(F.ux*F.t1,F.uz*F.t1);
  x.strokeStyle='#9a6a43';x.lineWidth=Math.max(2.5,F.w*k);x.lineCap='butt';x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();}
function skyMapTop(x,w2s,k){const p=w2s(...AIRF.at(AIRF.t0,0)),q=w2s(...AIRF.at(AIRF.t1,0));
  x.strokeStyle='#55585c';x.lineWidth=Math.max(3,AIRF.w*k);x.lineCap='butt';x.beginPath();x.moveTo(...p);x.lineTo(...q);x.stroke();
  x.strokeStyle='#ffffff';x.lineWidth=Math.max(1,.3*k);x.setLineDash([Math.max(2,2*k),Math.max(2,2*k)]);x.beginPath();x.moveTo(...p);x.lineTo(...q);x.stroke();x.setLineDash([]);
  const t=w2s(AIRF.tgt.x,AIRF.tgt.z);x.beginPath();x.arc(t[0],t[1],Math.max(3,AIRF.tgt.r*k),0,7);x.fillStyle='#f1e2bf';x.fill();x.beginPath();x.arc(t[0],t[1],Math.max(1.5,.6*k),0,7);x.fillStyle='#ff4d3a';x.fill();}

/* ================= ✈️ THE JUMP PLANE ================= */
// plane space: +z is the nose, +y up, -x is the right side where the jump door is. The middle of the cabin is (0,0,0); the wheels touch y=-PLANE_GEAR.
const PLANE_GEAR=1.2;
// join rings of points into one closed tube-like shape (fuselage, wings, tail)
function skyLoft(rings,col){const n=rings[0].length,pos=[],cols=[],idx=[];
  rings.forEach((ring,i)=>ring.forEach((p,j)=>{pos.push(p.x,p.y,p.z);const c=col?col(p,i,j):null;if(c)cols.push(c.r,c.g,c.b);}));
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=(i+1)*n+j,d=(i+1)*n+(j+1)%n;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(cols.length)g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.setIndex(idx);g.computeVertexNormals();return g;}
function skyAirfoil(c,t,n=12){const up=[],lo=[];for(let i=0;i<=n;i++){const x=(1-Math.cos(Math.PI*i/n))/2,yt=5*t*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x),yc=.02*Math.sin(Math.PI*x);up.push([x*c,(yc+yt)*c]);lo.push([x*c,(yc-yt)*c]);}
  return up.reverse().concat(lo.slice(1,-1));}// from the trailing edge over the top to the nose, and back underneath
let planeMats=null;
function planeBuild(){if(!planeMats)planeMats={skin:std('#ffffff',{vertexColors:true,roughness:.38,metalness:.12,side:THREE.DoubleSide}),white:std('#f4f5f7',{roughness:.4,metalness:.12}),
    glass:std('#1a2633',{roughness:.08,metalness:.7}),dark:std('#25282d',{roughness:.6}),tire:std('#1b1b1d',{roughness:.9}),blue:std('#1e5aa8',{roughness:.4}),prop:std('#2a2c2f',{roughness:.5,metalness:.4}),
    tipR:glow('#ff3a3a',1.6),tipG:glow('#3aff6a',1.6),beacon:glow('#ff2a2a',2),inside:std('#6b6e74',{roughness:.9,side:THREE.DoubleSide})};
  const PM=planeMats,g=new THREE.Group();g.name='jumpPlane';
  // the fuselage: rounded cross-sections from the spinner back to the tail
  const ST=[[3.02,.08,.08,.12],[2.92,.24,.22,.12],[2.7,.4,.38,.13],[2.35,.46,.46,.15],[1.9,.49,.56,.2],[1.2,.51,.63,.25],[.3,.51,.63,.25],[-.45,.48,.56,.27],[-1.25,.38,.43,.34],[-2.25,.26,.3,.43],[-3.1,.15,.18,.5],[-3.45,.07,.09,.53]];
  const st=[];for(let i=0;i<ST.length-1;i++)for(let k=0;k<3;k++){const u=k/3,a=ST[i],b=ST[i+1],e=u*u*(3-2*u);st.push(a.map((v,j)=>v+(b[j]-v)*(j===0?u:e)));}st.push(ST[ST.length-1]);
  const SEG=26,door={z0:-.38,z1:.62,y0:-.28,y1:.74};
  const rings=st.map(([z,w,h,c])=>{const r=[];for(let j=0;j<SEG;j++){const a=j/SEG*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),k=2/2.7;r.push(new THREE.Vector3(w*Math.sign(ca)*Math.pow(Math.abs(ca),k),c+h*Math.sign(sa)*Math.pow(Math.abs(sa),k),z));}return r;});
  const cW=new THREE.Color('#f7f8fa'),cB=new THREE.Color('#1e5aa8'),cR=new THREE.Color('#d8343a'),cG=new THREE.Color('#c9ced4');
  const fg=skyLoft(rings,(p,i)=>{const s=st[i],yy=(p.y-s[3])/s[2];if(yy>-.16&&yy<-.02)return cB;if(yy>-.3&&yy<-.22)return cR;if(yy<-.82)return cG;return cW;});
  // cut the jump door out of the right side
  {const P=fg.attributes.position,I=fg.index.array,keep=[];for(let i=0;i<I.length;i+=3){let x=0,y=0,z=0;for(let k=0;k<3;k++){x+=P.getX(I[i+k]);y+=P.getY(I[i+k]);z+=P.getZ(I[i+k]);}x/=3;y/=3;z/=3;
      if(!(x<-.2&&z>door.z0&&z<door.z1&&y>door.y0&&y<door.y1))keep.push(I[i],I[i+1],I[i+2]);}fg.setIndex(keep);}
  M(fg,PM.skin,0,0,0,g,true,false);
  // the floor and the inside of the cabin
  M(box(.9,.03,2.4),PM.inside,0,-.3,.55,g,false,false);M(box(.9,.75,.03),PM.inside,0,.08,-.62,g,false,false);
  // windows and the windscreen
  for(const s of [-1,1]){M(box(.012,.3,1.15),PM.glass,s*.512,.64,1.05,g,false,false);if(s>0)M(box(.012,.3,.5),PM.glass,.505,.64,.0,g,false,false);M(box(.012,.22,.45),PM.glass,s*.45,.6,-.95,g,false,false).rotation.y=-s*.08;}
  {const geo=new THREE.BufferGeometry(),v=[-.44,.5,1.93, .44,.5,1.93, .4,.86,1.52, -.4,.86,1.52];geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();
    const ws=M(geo,PM.glass,0,0,0,g,false,false);ws.material=PM.glass;}
  // the sliding jump door (it slides back along the outside)
  const doorM=M(box(.02,door.y1-door.y0,door.z1-door.z0),PM.white,-.505,(door.y0+door.y1)/2,(door.z0+door.z1)/2,g,false,false);
  M(box(.03,.05,.12),PM.dark,-.52,.25,door.z1-.15,doorM,false,false).position.set(-.015,0,.32);
  // the wing on top of the cabin, with a little dihedral, and the struts
  const wr=[];for(const x of [-4.25,-3.2,-1.6,-.5,.5,1.6,3.2,4.25]){const ax=Math.abs(x),ch=ax>2.4?1.45-(ax-2.4)/1.85*.4:1.45,z0=1.78-(1.45-ch)*.3;
    wr.push(skyAirfoil(ch,.12).map(([a,b])=>new THREE.Vector3(x,.93+ax*.035+b,z0-a)));}
  M(skyLoft(wr),PM.white,0,0,0,g,true,false);
  const B=advBatch();
  for(const s of [-1,1]){B.stick(new THREE.Vector3(s*.47,-.15,1.15),new THREE.Vector3(s*2.45,.95,1.15),.035,PM.white,8);
    B.add(box(.05,.14,1.5),PM.blue,s*4.24,.93+4.25*.035+.03,1.08);}
  // the tail: the flat stabiliser and the tall fin
  const tr=[];for(const x of [-1.45,-.5,.5,1.45]){const ax=Math.abs(x),ch=.8-ax*.12;tr.push(skyAirfoil(ch,.09).map(([a,b])=>new THREE.Vector3(x,.55+b,-2.72-(.8-ch)*.5-a)));}
  M(skyLoft(tr),PM.white,0,0,0,g,true,false);
  const fr=[];for(const y of [.5,1.0,1.62]){const k=(y-.5)/1.12,ch=1.05-k*.48,z0=-2.45-k*.5;fr.push(skyAirfoil(ch,.09).map(([a,b])=>new THREE.Vector3(b,y,z0-a)));}
  M(skyLoft(fr,(p)=>p.y>1.25&&p.y<1.42?cB:p.y>1.12&&p.y<1.2?cR:cW),PM.skin,0,0,0,g,true,false);
  // the landing gear: spring legs, wheels in fairings, and the nose wheel
  for(const s of [-1,1]){B.stick(new THREE.Vector3(s*.45,-.4,.55),new THREE.Vector3(s*1.02,-.98,.5),.04,PM.white,8);
    B.add(new THREE.CylinderGeometry(.2,.2,.12,18),PM.tire,s*1.08,-1.0,.5,0,0,Math.PI/2);
    B.add(sph(.12,14,10),PM.white,s*1.1,-.95,.5,0,0,0,.8,1.1,2.4);}
  B.stick(new THREE.Vector3(0,-.38,2.32),new THREE.Vector3(0,-1.02,2.42),.035,PM.dark,8);
  B.add(new THREE.CylinderGeometry(.15,.15,.09,16),PM.tire,0,-1.05,2.42,0,0,Math.PI/2);B.add(sph(.1,12,8),PM.white,0,-.98,2.42,0,0,0,.7,1,2);
  B.done(g,true);
  // the propeller and its spinner
  const prop=new THREE.Group();prop.position.set(0,.12,3.04);g.add(prop);
  M(new THREE.ConeGeometry(.13,.32,16),PM.white,0,0,.15,prop,false,false).rotation.x=Math.PI/2;
  for(const s of [-1,1]){const b=M(box(.11,.86,.03),PM.prop,0,s*.47,0,prop,false,false);b.rotation.y=s*.3;M(box(.112,.1,.032),std('#ffd23f'),0,s*.4,0,b,false,false);}
  const disc=M(new THREE.CircleGeometry(.92,32),new THREE.MeshBasicMaterial({color:'#444',transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide}),0,.12,3.05,g,false,false);disc.visible=false;
  // nav lights on the wing tips, and the flashing beacon on the fin
  M(sph(.05,8,6),PM.tipR,4.27,1.08,1.25,g,false,false);M(sph(.05,8,6),PM.tipG,-4.27,1.08,1.25,g,false,false);
  const beacon=M(sph(.06,8,6),PM.beacon,0,1.66,-2.95,g,false,false);
  // the number on the tail
  {const t=labelTex('N182SK',{bg:null,fg:'#1e5aa8',size:62});for(const s of [-1,1]){const p=M(new THREE.PlaneGeometry(1.0,.25),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.5}),s*.21,.5,-2.15,g,false,false);p.rotation.y=s*Math.PI/2+s*.06;}}
  return {g,prop,disc,door:doorM,beacon,doorZ:doorM.position.z};}

/* ---------- the plane at the airfield: parked, taking off, climbing, the jump run, coming back to land ---------- */
var PL=null;// (skyFloor asks about it while the island is still being built)
{const P=planeBuild();scene.add(P.g);const [x,z]=AIRF.at(AIRF.park.t,AIRF.park.s);
  PL={...P,rpm:0,mode:'park',pos:new THREE.Vector3(x,PLANE_GEAR,z),hd:AIRF.hdg,pitch:0,bank:0,sp:0,vy:0,t:0,doorK:0,with:false,wp:null,ob:{x,z,r:1.0},ob2:{x,z,r:.8}};
  obs.push(PL.ob,PL.ob2);}
const PL_ALT=80,PL_RC=34;// jump height, and how wide the circle round the target is
function planePlace(P,pos,hd,pitch,bank){P.g.position.copy(pos);P.g.rotation.order='YXZ';P.g.rotation.set(-pitch,hd,-bank);}
function planeParkObs(on){const P=PL;if(on){P.ob.x=P.pos.x;P.ob.z=P.pos.z;const [nx,nz]=[P.pos.x+Math.sin(P.hd)*2.2,P.pos.z+Math.cos(P.hd)*2.2];P.ob2.x=nx;P.ob2.z=nz;}else{P.ob.x=P.ob2.x=1e5;}}
planeParkObs(true);
// steer the plane toward a spot: returns how far it is
function planeSteer(P,dt,tx,tz,rate=.32){const want=Math.atan2(tx-P.pos.x,tz-P.pos.z),d=angDamp(0,want-P.hd,1),st=Math.max(-rate*dt,Math.min(rate*dt,d));P.hd+=st;
  P.bank+=((st/dt)*1.35-P.bank)*Math.min(1,dt*2);P.bank=Math.max(-.5,Math.min(.5,P.bank));return Math.hypot(tx-P.pos.x,tz-P.pos.z);}
function planeStep(dt){const P=PL;P.t+=dt;let fwd=true;
  if(P.mode==='park'){P.rpm=Math.max(0,P.rpm-dt*.6);}
  else if(P.mode==='start'){P.rpm=Math.min(1,P.rpm+dt*.8);if(P.t>1.6){P.mode='roll';P.t=0;}}
  else if(P.mode==='roll'){P.sp=Math.min(14,P.sp+dt*2.7);if(P.sp>12.5){P.mode='climb';P.t=0;did('skydive','takeoff');}}
  else if(P.mode==='climb'||P.mode==='run'){P.sp+=((P.mode==='run'?11:14)-P.sp)*Math.min(1,dt*.6);
    const wantVy=P.pos.y<PL_ALT-.3?5.2:0;P.vy+=(wantVy-P.vy)*Math.min(1,dt*(P.t<1.5?1.5:.8));
    if(P.t>4){const O=AIRF.tgt,a=Math.atan2(P.pos.x-O.x,P.pos.z-O.z)+.55;planeSteer(P,dt,O.x+Math.sin(a)*PL_RC,O.z+Math.cos(a)*PL_RC);}
    if(P.mode==='climb'&&P.pos.y>=PL_ALT-.5&&P.t>6){P.mode='run';P.t=0;skyJumpRun();}}
  else if(P.mode==='away'){// down again: round the circle, out past the far end, then turn in and land
    P.sp+=(12-P.sp)*Math.min(1,dt*.5);const w=P.wp[0];
    if(w){w[3]=(w[3]||0)+dt;const d=planeSteer(P,dt,w[0],w[1],.5);P.vy+=(Math.max(-6,Math.min(3,(w[2]-P.pos.y)*.6))-P.vy)*Math.min(1,dt*1.2);if(d<12||w[3]>30)P.wp.shift();}
    else{P.mode='final';P.t=0;}}
  else if(P.mode==='final'){// lined up with the runway: follow its middle line in, coming down the glide slope
    const [t,sd]=AIRF.loc(P.pos.x,P.pos.z),g=PLANE_GEAR,tt=AIRF.t0+3;P.sp+=(10-P.sp)*Math.min(1,dt*.5);
    planeSteer(P,dt,...AIRF.at(Math.max(t,AIRF.t0-60)+18,0),.5);
    const along=Math.abs(angDamp(0,AIRF.hdg-P.hd,1))<.35&&Math.abs(sd)<6;
    const wantY=along?g+Math.max(0,tt-t)*.22:Math.max(P.pos.y,g+8);P.vy+=(Math.max(-4,Math.min(2,(wantY-P.pos.y)*.8))-P.vy)*Math.min(1,dt*1.5);
    if(along&&t>AIRF.t0-2&&P.pos.y<g+1.6){P.mode='flare';P.t=0;}
    if(t>AIRF.t1-12||P.t>60){P.wp=[[...AIRF.at(AIRF.t1+30,25),22],[...AIRF.at(AIRF.t0-55,0),12]];P.mode='away';P.t=0;}}// missed it: go round and try again
  else if(P.mode==='flare'){const g=PLANE_GEAR;planeSteer(P,dt,...AIRF.at(AIRF.t1,0));P.vy+=(Math.max(-2.2,(g-P.pos.y)*1.2)-P.vy)*Math.min(1,dt*2);P.sp+=(9-P.sp)*Math.min(1,dt*.7);
    if(P.pos.y<=g+.02){P.pos.y=g;P.vy=0;P.mode='brake';P.t=0;tone(90,.2,'sine',.08);}}
  else if(P.mode==='brake'){P.sp=Math.max(0,P.sp-dt*3.2);planeSteer(P,dt,...AIRF.at(AIRF.t1+10,0),.2);if(P.sp<2.2){P.mode='taxi';P.t=0;}}
  else if(P.mode==='taxi'){// turn round and taxi back to its spot
    const [px,pz]=AIRF.at(AIRF.park.t,AIRF.park.s),[ax,az]=AIRF.at(AIRF.park.t-8,0);P.sp=2.4;
    if(!P.turned){planeSteer(P,dt,ax,az,.7);if(Math.abs(angDamp(0,AIRF.hdg+Math.PI-P.hd,1))<.15)P.turned=true;}
    else{const d=P.back?0:planeSteer(P,dt,ax,az,.5);if(d<3||P.back||AIRF.loc(P.pos.x,P.pos.z)[0]<AIRF.park.t-7){P.back=true;P.sp=1.6;fwd=false;// back into the spot nose-out, like a pilot pushes it
        const want=AIRF.hdg;P.hd=angDamp(P.hd,want,Math.min(1,dt*.6));const dd=Math.hypot(px-P.pos.x,pz-P.pos.z);if(dd>.2){P.pos.x+=(px-P.pos.x)/dd*Math.min(dd,1.6*dt);P.pos.z+=(pz-P.pos.z)/dd*Math.min(dd,1.6*dt);}
        if(dd<.25&&Math.abs(angDamp(0,want-P.hd,1))<.05){P.hd=want;P.mode='park';P.t=0;P.sp=0;P.turned=P.back=false;planeParkObs(true);}}}
    P.bank*=.9;}
  if(P.mode!=='park'&&P.mode!=='start')P.rpm=P.mode==='taxi'||P.mode==='brake'?.55:1;
  if(P.mode!=='park'&&P.mode!=='start'&&fwd){P.pos.x+=Math.sin(P.hd)*P.sp*dt;P.pos.z+=Math.cos(P.hd)*P.sp*dt;}
  if(P.mode==='roll'||P.mode==='brake'||P.mode==='taxi')P.vy=0;
  P.pos.y=Math.max(PLANE_GEAR,P.pos.y+P.vy*dt);if(P.mode==='climb'&&P.pos.y>PLANE_GEAR+.1&&P.t<.5)P.vy=Math.max(P.vy,1.2);
  const ground=P.pos.y<=PLANE_GEAR+.01,wantPitch=ground?(P.mode==='roll'&&P.sp>10?.1:0):Math.atan2(P.vy,Math.max(6,P.sp))*.9+.04;
  P.pitch+=(wantPitch-P.pitch)*Math.min(1,dt*2);if(ground)P.bank*=.8;
  // the door slides open for the jump run and closed again after
  const dk=P.mode==='run'?1:0;P.doorK+=(dk-P.doorK)*Math.min(1,dt*1.6);P.door.position.z=P.doorZ-1.02*P.doorK;
  planePlace(P,P.pos,P.hd,P.pitch,P.bank);
  P.propA=(P.propA||0)+dt*P.rpm*62;P.prop.rotation.z=P.propA;P.disc.visible=P.rpm>.6;
  P.beacon.visible=P.mode!=='park'&&Math.sin(P.t*7)>.6;
  // the engine sound, while you're on board or near
  if(P.mode!=='park'&&(P.with||player.pos.distanceTo(P.pos)<45)){P.snd=(P.snd||0)-dt;if(P.snd<0){P.snd=.09;const k=P.with?1:Math.max(0,1-player.pos.distanceTo(P.pos)/45);tone(62+P.rpm*48+Math.random()*4,.12,'sawtooth',.02*k+.012*k*P.rpm);}}}
function planeAway(){const P=PL,O=AIRF.tgt,[fx,fz]=AIRF.at(AIRF.t1+38,0),[sx,sz]=AIRF.at(AIRF.t0-34,-2),[qx,qz]=AIRF.at(AIRF.t0-14,0),[tx,tz]=AIRF.at(AIRF.t0+4,0);
  const a=Math.atan2(P.pos.x-O.x,P.pos.z-O.z)+1.4;
  // round the circle and down, out past the far end, a wide turn back over the canal, then lined up with the runway
  const [ox,oz]=AIRF.at(AIRF.t1+20,22),[cx,cz]=AIRF.at(AIRF.t0-40,28);
  P.wp=[[O.x+Math.sin(a)*PL_RC,O.z+Math.cos(a)*PL_RC,45],[ox,oz,26],[fx,fz,22],[cx,cz,16],[...AIRF.at(AIRF.t0-55,0),11]];P.mode='away';P.t=0;}

/* ================= 🪂 THE PARACHUTE ================= */
// canopy space: the middle point between your shoulders is (0,0,0), the canopy is CAN.H above, +z is the way it flies
const CAN={H:2.85,span:3.5,chord:1.3,arc:4.4,cells:9};
let canMat=null;
function canBuild(){if(!canMat)canMat=std('#ffffff',{vertexColors:true,roughness:.6,side:THREE.DoubleSide});
  const g=new THREE.Group();g.name='canopy';const can=new THREE.Group();g.add(can);g.userData.can=can;
  const ncol=['#ff4d8d','#ffd23f','#2fa4e7','#ffd23f','#ff4d8d','#ffd23f','#2fa4e7','#ffd23f','#ff4d8d'].map(c=>new THREE.Color(c));
  const prof=skyAirfoil(CAN.chord,.16,9),half=CAN.span/2/CAN.arc,per=4,N=CAN.cells*per,rings=[];
  for(let i=0;i<=N;i++){const u=i/N,th=(u-.5)*2*half,cell=(u*CAN.cells)%1,puff=.88+.12*Math.sin(Math.PI*cell),tip=1-.45*Math.pow(Math.abs(u-.5)*2,4);
    const cx=Math.sin(th)*CAN.arc,cy=CAN.H+Math.cos(th)*CAN.arc-CAN.arc;
    rings.push(prof.map(([a,b])=>{const zz=CAN.chord*.36-a,yy=b*puff*tip;return new THREE.Vector3(cx+Math.sin(th)*yy,cy+Math.cos(th)*yy,zz);}));}
  // loft along the span (rings are airfoils across it)
  const pos=[],col=[],idx=[],n=prof.length;
  rings.forEach((r,i)=>{const c=ncol[Math.min(CAN.cells-1,Math.floor(i/per))];r.forEach((p,j)=>{pos.push(p.x,p.y,p.z);const dk=j===0||j===n-1?.7:1,mouth=Math.abs(j-n/2)<1.6&&j>n/2?.35:1;col.push(c.r*dk*mouth,c.g*dk*mouth,c.b*dk*mouth);});});
  for(let i=0;i<N;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=(i+1)*n+j,d=(i+1)*n+(j+1)%n;idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
  M(geo,canMat,0,0,0,can,true,false);
  // the lines, from the underside down to the risers on your shoulders, and the brake lines to your hands
  const L=[];for(let k=0;k<=CAN.cells;k+=1){if(k%2&&k!==CAN.cells)continue;const u=k/CAN.cells,th=(u-.5)*2*half,bx=Math.sin(th)*CAN.arc,by=CAN.H+Math.cos(th)*CAN.arc-CAN.arc-.1,rs=u<.5?-1:1;
    for(const zz of [CAN.chord*.3,CAN.chord*.0,-CAN.chord*.35])L.push(bx,by,zz,rs*.16,.3,.0);
    L.push(bx,by,-CAN.chord*.62,rs*.24,.55,-.02);}
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(L,3));can.add(new THREE.LineSegments(lg,SKM.line));
  // the risers (webbing) from your shoulders up to where the lines join, and the slider
  for(const s of [-1,1])M(box(.03,.32,.012),SKM.rig,s*.16,.15,0,can,false,false);
  M(box(.5,.01,.42),std('#e9e3d6',{roughness:.8,side:THREE.DoubleSide}),0,.42,0,can,false,false);
  // the little pilot chute on its bridle behind the canopy
  const pc=M(new THREE.SphereGeometry(.22,10,6,0,Math.PI*2,0,Math.PI/2),std('#ffd23f',{roughness:.7,side:THREE.DoubleSide}),0,CAN.H+.55,-CAN.chord*.9,can,false,false);
  {const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute([0,CAN.H+.1,-.05,0,CAN.H+.55,-CAN.chord*.9],3));can.add(new THREE.LineSegments(b,SKM.line));}
  return g;}
// the parachute pack on your back (on the avatar's spine)
function skyRig(A){if(!A||!A.spine)return null;const g=new THREE.Group();g.name='skyRig';
  M(box(.25,.34,.11),SKM.rig,0,.28,-.15,g,false,false);M(box(.27,.035,.12),SKM.rigTrim,0,.44,-.15,g,false,false);M(box(.06,.06,.03),SKM.rigTrim,.09,.12,-.21,g,false,false);
  for(const s of [-1,1])M(box(.035,.3,.02),SKM.rig,s*.085,.3,.11,g,false,false);// the chest straps
  A.spine.add(g);return g;}
// put the canopy over you: k 0..1 how open it is, y swing, bank lean
const canQ=new THREE.Quaternion();
function canPlace(C,A,P,yaw,bank,k,pitch=0){const hip=A?A.hip:.55;
  canQ.setFromEuler(eSky.set(-pitch,yaw,-bank,'YXZ'));
  const sh=tmpSky.set(0,hip+.44,0).applyQuaternion(canQ).add(P);C.position.copy(sh);C.quaternion.copy(canQ);
  const can=C.userData.can,e=skyEase(k);can.scale.set(.12+.88*e,.35+.65*Math.min(1,k*1.4),.25+.75*e);can.visible=k>.02;}

/* ================= what happens: start, every frame, end ================= */
let hgPodOn=null,hgPodA=null,skyRigOn=null,skyRigA=null;
const skyCan=canBuild();skyCan.visible=false;scene.add(skyCan);
const skyBusy=()=>!!(barnRide||BIKE.on||SK.on||FLY.on||HELI.on||HELI.ride||ADS.mode||closetOpen||!started||(typeof spLock==='function'&&spLock()));
function skyGear(pod,rig){if(pod&&!hgPodOn){hgPodOn=hgPod(av);hgPodA=av;}if(!pod&&hgPodOn){if(hgPodOn.parent)hgPodOn.parent.remove(hgPodOn);freeObj(hgPodOn);hgPodOn=null;}
  if(rig&&!skyRigOn){skyRigOn=skyRig(av);skyRigA=av;}if(!rig&&skyRigOn){if(skyRigOn.parent)skyRigOn.parent.remove(skyRigOn);freeObj(skyRigOn);skyRigOn=null;}
  if(hgPodOn&&hgPodA!==av){if(hgPodOn.parent)hgPodOn.parent.remove(hgPodOn);freeObj(hgPodOn);hgPodOn=hgPod(av);hgPodA=av;}// a new outfit made a new avatar
  if(skyRigOn&&skyRigA!==av){if(skyRigOn.parent)skyRigOn.parent.remove(skyRigOn);freeObj(skyRigOn);skyRigOn=skyRig(av);skyRigA=av;}}
function skySave(){return SAVE.sky||(SAVE.sky={hg:0,jumps:0,tgt:0,best:0});}
function skyCamKeep(){if(!SKY.camOld)SKY.camOld={p:cam.pitch};}
function skyCamBackTo(){if(SKY.camOld){cam.pitch=SKY.camOld.p;SKY.camOld=null;}}

// 🪂 hang glide off the ramp
function hgGo(){if(skyBusy()||SKY.mode)return;flyGrid();
  Object.assign(SKY,{mode:'hgRun',t:0,hd:RAMP.face,sp:0,vy:0,pitch:.05,bank:0,turn:0,pr:0,land:false,spot:null,flight:0,therm:0,gotThermal:false,said:{}});
  hgParked.visible=false;hgFly.visible=true;skyCamKeep();skyGear(true,false);
  const p=player.pos;p.set(RAMP.padW[0],RAMP.y(RAMP.a[1]+.25),RAMP.padW[1]);player.face=RAMP.face;cam.yaw=RAMP.face+Math.PI;
  toast('🪂 Run, run, run… and off you go!');sfx('pop');}
// ✈️ get in the plane
function sdGo(){if(skyBusy()||SKY.mode||PL.mode!=='park')return;
  Object.assign(SKY,{mode:'board',t:0,pr:0,land:false,spot:null,said:{},hd:PL.hd});skyCamKeep();skyGear(false,true);
  SKY.from=player.pos.clone();toast('✈️ Climb aboard! Your parachute is on 🎒');sfx('pop');}
// the plane got up to jump height
function skyJumpRun(){if(SKY.mode!=='plane')return;tone(523,.12,'triangle',.1);tone(659,.12,'triangle',.1,.12);tone(784,.2,'triangle',.1,.24);
  toast('🚪 Door open! Tap 🪂 Jump! when you\'re ready');SKY.said.door=1;}
function sdJump(){if(SKY.mode!=='plane'||PL.mode!=='run')return;const P=PL,p=player.pos;
  // out of the door: you keep the plane's speed for a moment, and get a little push away from it
  const rx=-Math.cos(P.hd),rz=Math.sin(P.hd);// the right side of the plane
  Object.assign(SKY,{mode:'ff',t:0,vx:Math.sin(P.hd)*P.sp+rx*1.6,vz:Math.cos(P.hd)*P.sp+rz*1.6,vy:0,hd:P.hd-Math.PI/2,pr:1,bank:0,turn:0,pulled:false});
  p.x+=rx*.6;p.z+=rz*.6;P.with=false;av.g.visible=true;planeAway();did('skydive','jump');skySave().jumps++;persist();
  tone(392,.25,'triangle',.1);tone(262,.4,'sine',.08,.1);toast('🙌 Arch your back and enjoy the view!');}
function sdPull(auto){if(SKY.mode!=='ff')return;Object.assign(SKY,{mode:'open',t:0,k:0});skyCan.visible=true;
  tone(180,.15,'sawtooth',.06);tone(110,.3,'sine',.12,.25);if(auto)toast('🪂 Your parachute opened by itself at the safe height!');
  setTimeout(()=>{if(SKY.mode==='cn'||SKY.mode==='open')toast('🎯 Steer to the round target by the hangar!');},2600);}
function skyLandBtn(){if(SKY.mode==='hg'){SKY.land=true;SKY.spot=null;sfx('pop');}}
// everything back to normal (snap: right now, wherever you are)
function skyEnd(snap){const was=SKY.mode;SKY.mode=null;SKY.t=0;
  hgFly.visible=false;hgFly.userData.strap.visible=false;if(was&&was.startsWith('hg'))hgPark();
  skyCan.visible=false;skyGear(false,false);skyFog(0);skyWind(0);skyStreaks(false);
  av.g.quaternion.identity();av.g.rotation.set(0,player.face,0);av.g.visible=true;
  const p=player.pos;if(snap){if(PL.with){PL.with=false;const [x,z]=AIRF.at(AIRF.pad.t,AIRF.pad.s);p.set(x,0,z);}
    if(p.y>groundAt(p.x,p.z)+.05){const [x,z]=flyLandSpot(p.x,p.z);p.x=x;p.z=z;}p.y=groundAt(p.x,p.z);collide(p);}
  player.vy=0;player.onGround=true;player.speed=0;skyCamBackTo();skyHud();}

// 🛫 every frame (from the game loop, before walking): true = it moved you
function skyStep(dt,ix,iy,mag){planeStep(dt);if(!SKY.mode){skyHud();return false;}
  if(closetOpen||!started){skyEnd(true);return false;}
  const p=player.pos,S=SKY;S.t+=dt;player.vy=0;
  const joyWant=()=>{const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;return Math.atan2((fx*-iy+rx*ix)/n,(fz*-iy+rz*ix)/n);};
  const camFollow=(yaw,pitch,k=1.1)=>{cam.yaw=angDamp(cam.yaw,yaw+Math.PI,Math.min(1,dt*k));cam.pitch+=(pitch-cam.pitch)*Math.min(1,dt*1.5);};
  // --- 🪂 hang gliding ---
  if(S.mode==='hgRun'){const u=Math.min(1,S.t/1.25),e=u*u,lz=RAMP.a[1]+.25+(RAMP.b[1]-RAMP.a[1]-.25)*e,[x,z]=MZ.toWorld(RAMP.a[0],lz);
    p.set(x,RAMP.y(lz),z);player.face=RAMP.face;player.speed=2+5*u;player.onGround=true;S.sp=1+6*u;S.pitch=.05+.08*u;camFollow(S.hd,.25,2);
    if(u>=1){S.mode='hg';S.t=0;S.vy=.2;did('hglide','launch');skySave().hg++;persist();tone(660,.1,'triangle',.08);tone(990,.18,'triangle',.08,.08);}
    skyHud();return true;}
  if(S.mode==='hg'||S.mode==='hgFlare'){S.flight+=dt;const flare=S.mode==='hgFlare';
    let want=S.hd,steer=false;if(mag>.08&&!flare){want=joyWant();steer=true;}
    const r0=Math.hypot(p.x,p.z),g0=groundAt(p.x,p.z),below=skyFloor(p.x,p.z),landable=skyLandable(p.x,p.z);
    // 🛬 Land: pick an open patch a little ahead and glide down to it
    let spotD=99;
    if(S.land&&!flare){if(steer)S.spot=null;else{if(!S.spot)S.spot=flyLandSpot(p.x+Math.sin(S.hd)*7,p.z+Math.cos(S.hd)*7);spotD=Math.hypot(S.spot[0]-p.x,S.spot[1]-p.z);if(spotD>.6)want=Math.atan2(S.spot[0]-p.x,S.spot[1]-p.z);steer=true;}}
    // 🦅 in a thermal and not steering: it circles round in the rising air by itself, like the hawks do
    let inTh=null;if(!steer&&!flare&&!S.land)for(const T of THERM)if(Math.hypot(p.x-T.x,p.z-T.z)<T.r&&p.y<T.top-1){inTh=T;break;}
    if(inTh){const d=Math.hypot(p.x-inTh.x,p.z-inTh.z);want=Math.atan2(inTh.x-p.x,inTh.z-p.z)+Math.max(.5,Math.min(1.9,1.57-(d-4)*.3));steer=true;}
    // kid-safe: low down over somewhere you can't land (the steep rock, the pines, the fenced-off hills), it turns you back toward town
    if(!flare&&r0>R+1&&(p.y<below+3||!landable&&p.y<g0+5)&&!(landable===true&&below<=g0+.3)){want=Math.atan2(-p.x,-p.z);steer=true;if(!S.said.back){S.said.back=1;toast('🌬️ The breeze turns you back toward town');}}
    if(r0>skyMaxR()-12){const inw=Math.atan2(-p.x,-p.z);want=angDamp(want,inw,Math.min(1,(r0-(skyMaxR()-12))/8));steer=true;}
    const dTurn=angDamp(0,want-S.hd,1),rate=(inTh?1.6:1.05)*dt,st=steer?Math.max(-rate,Math.min(rate,dTurn)):0;S.hd+=st;S.turn+=(st/dt-S.turn)*Math.min(1,dt*3);
    S.sp+=((flare?.4:S.land?Math.min(7.2,1.2+spotD*.55):inTh?5.4:6.6)-S.sp)*Math.min(1,dt*(flare?2.4:S.land?1.5:.7));
    const [lift,inT]=skyLift(p.x,p.z,p.y);
    if(inT){S.therm+=dt;if(S.therm>2&&!S.gotThermal){S.gotThermal=true;did('hglide','thermal');toast('🦅 You found a thermal! Circle in it to go up and up');tone(784,.12,'triangle',.08);tone(1047,.2,'triangle',.08,.1);}}else S.therm=0;
    const sink=flare?1.0:(S.land?(spotD<4?2.6:1.9):.85)+Math.abs(S.bank)*.6;
    let wantVy=flare?-1.1:(S.land?0:lift)-sink;// landing: you fly out of the rising air and come down
    if(p.y>30)wantVy=Math.min(wantVy,0);
    S.vy+=(wantVy-S.vy)*Math.min(1,dt*(flare?3:1.4));
    // trees, roofs and the mountain coming up: the glider lifts over them (never into them)
    // (coming in to land, it only looks as far as the landing spot, so a fence just past it doesn't hold you up in the air)
    const vx=Math.sin(S.hd)*S.sp,vz=Math.cos(S.hd)*S.sp,look=S.land&&spotD<S.sp?spotD/Math.max(S.sp,.1):1,ahead=Math.max(skyFloor(p.x+vx*.45*look,p.z+vz*.45*look),skyFloor(p.x+vx*look,p.z+vz*look));
    const need=ahead+.55-p.y;if(need>0&&!flare)S.vy=Math.max(S.vy,Math.min(4.5,need*3));
    p.x+=vx*dt;p.z+=vz*dt;p.y+=S.vy*dt;
    const fl=skyFloor(p.x,p.z),g=groundAt(p.x,p.z);if(p.y<fl+.3&&fl>g+.2)p.y=fl+.3;
    // close to open ground: flare
    const hg=p.y-g,L=skyLandable(p.x,p.z);
    if(!flare&&hg<1.35&&fl<=g+.2&&L){S.mode='hgFlare';S.t=0;}
    if(flare&&p.y<=g+.01){p.y=g;
      if(L==='water'){burst(new THREE.Vector3(p.x,.1,p.z),'#bfeaff',30,2.4);tone(200,.3,'sine',.1,0,80);toast('💦 Splash! The lifeguards will bring your glider back to the mountain');skyEnd(false);return true;}
      S.mode='hgDown';S.t=0;S.dn={x:hgFly.position.x,y:hgFly.position.y,z:hgFly.position.z};burst(new THREE.Vector3(p.x,g+.05,p.z),'#ffffff',14,1.2);
      did('hglide','land');if(Math.hypot(p.x,p.z)<R)did('hglide','town');
      const b=skySave();b.best=Math.max(b.best||0,Math.round(S.flight));persist();earn(4,'hglide');
      toast(`🪂 Nice landing! You flew for ${Math.round(S.flight)} seconds +4 🪙`);tone(523,.1,'triangle',.1);tone(784,.2,'triangle',.1,.1);}
    if(S.flight>45&&!S.said.long){S.said.long=1;did('hglide','long');}
    // the glider banks into turns, noses down a little to speed up, and pitches up to flare
    S.bank+=(Math.max(-.6,Math.min(.6,S.turn*.62))-S.bank)*Math.min(1,dt*2.5);
    S.pitch+=((flare?.42:-.04+Math.max(-.12,Math.min(.1,S.vy*.04)))-S.pitch)*Math.min(1,dt*2.5);
    S.pr+=((flare?Math.max(0,1-S.t*2.4):Math.min(1,S.flight*1.4))-S.pr)*Math.min(1,dt*6);
    player.face=S.hd;player.speed=flare?S.sp*.8:0;player.onGround=false;
    camFollow(S.hd,.3);skyWind(.03+S.sp*.006);skyFog(p.y-g);skyHud();return true;}
  if(S.mode==='hgDown'){// you run it out and set it down on its base bar
    const u=Math.min(1,S.t/.6);S.pr=0;S.pitch+=(.2-S.pitch)*Math.min(1,dt*4);S.bank*=.9;player.face=S.hd;player.speed=u<1?2.2:0;player.onGround=true;
    if(u<1){p.x+=Math.sin(S.hd)*1.6*dt;p.z+=Math.cos(S.hd)*1.6*dt;collide(p);p.y=groundAt(p.x,p.z);}
    skyWind(0);skyFog(0);if(S.t>1.4){skyEnd(false);toast('🪂 Your glider goes back to the ramp on Lookout Mountain for next time');}skyHud();return true;}
  // --- ✈️ skydiving ---
  if(S.mode==='board'){// walk over to the door and climb in
    const P=PL,door=tmpSky.set(-1.0,-PLANE_GEAR,.1).applyQuaternion(P.g.quaternion).add(P.pos),u=Math.min(1,S.t/1.1);
    p.x=S.from.x+(door.x-S.from.x)*skyEase(u);p.z=S.from.z+(door.z-S.from.z)*skyEase(u);p.y=groundAt(p.x,p.z);player.face=Math.atan2(door.x-S.from.x,door.z-S.from.z);player.speed=u<1?3:0;player.onGround=true;
    if(S.t>1.2){S.mode='plane';S.t=0;P.with=true;P.mode='start';P.t=0;planeParkObs(false);toast('✈️ Buckle up! Up we go to jump height');}
    skyHud();return true;}
  if(S.mode==='plane'){const P=PL;
    // sitting on the floor by the door, looking out
    const seat=planeSeat(P,av);p.copy(seat);player.face=P.hd;player.speed=0;player.onGround=true;
    camFollow(P.hd-.55,.28,.8);skyWind(P.mode==='run'?.05:.012);skyFog(P.pos.y);skyHud();return true;}
  if(S.mode==='ff'){// free fall: belly down, steer with the joystick, fall through the clouds
    const g=groundAt(p.x,p.z),want=mag>.08?joyWant():S.hd,trk=mag>.08?4.6*mag:0;
    if(mag>.08)S.hd=angDamp(S.hd,want,Math.min(1,dt*2.2));
    const tx=Math.sin(S.hd)*trk,tz=Math.cos(S.hd)*trk;S.vx+=(tx-S.vx)*Math.min(1,dt*.9);S.vz+=(tz-S.vz)*Math.min(1,dt*.9);
    S.vy+=(-9.8-.098*S.vy*Math.abs(S.vy))*dt;
    p.x+=S.vx*dt;p.z+=S.vz*dt;p.y+=S.vy*dt;
    const r0=Math.hypot(p.x,p.z);if(r0>skyMaxR()-4){p.x*=(skyMaxR()-4)/r0;p.z*=(skyMaxR()-4)/r0;}
    if(p.y-g<28||p.y<g+2)sdPull(true);
    S.bank=Math.sin(S.t*1.3)*.06;S.turn=0;player.face=S.hd;player.onGround=false;
    camFollow(S.hd,.85,1.4);skyWind(Math.min(.16,.03+Math.abs(S.vy)*.013));skyFog(p.y-g);skyStreaks(true,S.vy);skyHud();return true;}
  if(S.mode==='open'||S.mode==='cn'||S.mode==='cnFlare'){
    const g=groundAt(p.x,p.z),open=S.mode==='open',flare=S.mode==='cnFlare';
    if(open){S.k=Math.min(1,S.t/1.25);S.pr=Math.max(0,1-S.t*1.5);if(S.k>=1){S.mode='cn';S.t=0;}}
    let want=S.hd,steer=false;if(mag>.08&&!flare){want=joyWant();steer=true;}
    const below=skyFloor(p.x,p.z),landable=skyLandable(p.x,p.z),r0=Math.hypot(p.x,p.z);
    // kid-safe: low down over somewhere you can't land, the breeze takes you back to the airfield
    if(!flare&&p.y<g+8&&(!landable||below>g+.5)){want=Math.atan2(AIRF.tgt.x-p.x,AIRF.tgt.z-p.z);steer=true;if(!S.said.back){S.said.back=1;toast('🌬️ The breeze carries you back toward the airfield');}}
    if(r0>skyMaxR()-10){want=Math.atan2(-p.x,-p.z);steer=true;}
    const dTurn=angDamp(0,want-S.hd,1),rate=(open?.4:.95)*dt,st=steer?Math.max(-rate,Math.min(rate,dTurn)):0;S.hd+=st;S.turn+=(st/dt-S.turn)*Math.min(1,dt*3);
    const fwd=open?S.k*3.5:flare?Math.max(.6,4.2-S.t*5):4.3;
    const hx=Math.sin(S.hd)*fwd,hz=Math.cos(S.hd)*fwd;S.vx+=(hx-S.vx)*Math.min(1,dt*(open?2.5:2));S.vz+=(hz-S.vz)*Math.min(1,dt*(open?2.5:2));
    const wantVy=open?-2.4:flare?-.7:-(2.05+Math.abs(S.bank)*1.6);S.vy+=(wantVy-S.vy)*Math.min(1,dt*(open?3.2:2));
    const ahead=Math.max(skyFloor(p.x+S.vx*.5,p.z+S.vz*.5),skyFloor(p.x+S.vx*1.1,p.z+S.vz*1.1)),need=ahead+.5-p.y;if(need>0&&!flare)S.vy=Math.max(S.vy,Math.min(3,need*2.5));
    p.x+=S.vx*dt;p.z+=S.vz*dt;p.y+=S.vy*dt;
    const fl=skyFloor(p.x,p.z),gg=groundAt(p.x,p.z);if(p.y<fl+.25&&fl>gg+.2)p.y=fl+.25;
    const L=skyLandable(p.x,p.z);
    if(S.mode==='cn'&&p.y-gg<1.5&&fl<=gg+.2&&L){S.mode='cnFlare';S.t=0;}
    if(p.y<=gg+.01&&!open){p.y=gg;S.mode='cnDown';S.t=0;S.cnK=1;
      if(L==='water'){burst(new THREE.Vector3(p.x,.1,p.z),'#bfeaff',30,2.4);tone(200,.3,'sine',.1,0,80);toast('💦 Splash! Time for a swim');skyEnd(false);return true;}
      const d=Math.hypot(p.x-AIRF.tgt.x,p.z-AIRF.tgt.z);did('skydive','land');burst(new THREE.Vector3(p.x,gg+.05,p.z),'#ffffff',16,1.2);
      if(d<AIRF.tgt.r){did('skydive','target');skySave().tgt++;persist();earn(d<.6?15:10,'skydive');sfx('tada');banner(d<.6?'🎯 Bull\'s-eye!':'🎯 On the target!');}
      else{earn(5,'skydive');toast('🪂 Soft landing! +5 🪙');}tone(523,.1,'triangle',.1);tone(784,.2,'triangle',.1,.1);}
    S.bank+=(Math.max(-.45,Math.min(.45,S.turn*.5))-S.bank)*Math.min(1,dt*2);
    player.face=S.hd;player.onGround=false;player.speed=0;
    camFollow(S.hd,open?.6:.35,open?.8:1.1);skyWind(open?.08:.025);skyFog(p.y-gg);skyStreaks(open&&S.t<.6,S.vy);skyHud();return true;}
  if(S.mode==='cnDown'){// you stand up and the canopy comes down behind you
    S.cnK=Math.max(0,1-S.t/1.4);player.onGround=true;player.speed=0;p.y=groundAt(p.x,p.z);skyWind(0);skyFog(0);
    if(S.t>1.6){skyEnd(false);setTimeout(()=>toast(PL.mode==='park'?'✈️ Want to jump again? The plane is back at its spot':'✈️ The plane is coming back in to land'),600);}
    skyHud();return true;}
  return false;}
// where you sit in the plane (feet point), and how
function planeSeat(P,A){const hip=A?A.hip:.55;return tmpSky2.set(-.08,-.29-hip+.12,.15).applyQuaternion(P.g.quaternion).add(P.pos);}

// 💨 speed streaks rushing past in free fall
const STRK={m:null};
function skyStreaks(on,vy=0){if(!on){if(STRK.m)STRK.m.visible=false;return;}
  if(!STRK.m){const n=46,pos=new Float32Array(n*6);STRK.base=[];for(let i=0;i<n;i++)STRK.base.push([(Math.random()-.5)*14,(Math.random()-.5)*16,(Math.random()-.5)*14]);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));STRK.m=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:'#ffffff',transparent:true,opacity:.45,fog:false}));STRK.m.frustumCulled=false;scene.add(STRK.m);}
  const m=STRK.m,P=player.pos,pos=m.geometry.attributes.position,L=Math.min(2.2,Math.abs(vy)*.18);m.visible=true;
  for(let i=0;i<STRK.base.length;i++){const b=STRK.base[i];b[1]+=-vy*.016;if(b[1]>8)b[1]-=16;const x=P.x+b[0],y=P.y+b[1],z=P.z+b[2];pos.setXYZ(i*2,x,y,z);pos.setXYZ(i*2+1,x,y+L,z);}pos.needsUpdate=true;}

/* ---------- the poses and the gear on you, every frame after Avatar.update ---------- */
onTick.push(dt=>{const S=SKY,p=player.pos;
  if(S.mode&&S.mode.startsWith('hg')){skyGear(S.mode!=='hgRun'&&S.mode!=='hgDown'||S.pr>.05,false);
    hgPlace(hgFly,av,p,S.hd,S.pitch,S.bank,S.pr);
    if(S.mode==='hgRun'||S.mode==='hgDown'){// running: let the legs run (from Avatar.update), hands up on the uprights
      for(const r of av.arms){r.sh.rotation.x=SKYP.up.shx;r.sh.rotation.z=r.sx*SKYP.up.shz;r.el.rotation.x=SKYP.up.el;}}
    if(S.mode==='hgDown'&&S.t>.6){// set it down: nose on the ground, you step out from under it
      const u=Math.min(1,(S.t-.6)/.6);hgFly.position.y-=u*.25;hgFly.rotation.x+=u*.3;}}
  if(S.mode==='plane'||S.mode==='board'){skyGear(false,true);
    av.g.visible=S.mode!=='plane'||PL.mode==='run';// inside the cabin you're hidden until the door opens
    if(S.mode==='plane'){const P=PL;av.g.quaternion.copy(P.g.quaternion).multiply(qSky.setFromAxisAngle(yAxis,-Math.PI/2));av.g.position.copy(p);skyPoseSet(av,SKYP.sit,SKYP.sit,0);
      if(P.mode==='run'){// legs out of the door, ready to go
        for(const l of av.legs){l.hp.rotation.x=-1.25;l.kn.rotation.x=1.1+Math.sin(clock.elapsedTime*2+l.sx)*.08;}av.g.position.add(tmpSky.set(-.32,0,0).applyQuaternion(P.g.quaternion));}}}
  if(S.mode==='ff'){skyGear(false,true);qSky.setFromEuler(eSky.set(0,S.hd,0,'YXZ'));qSky2.setFromAxisAngle(xAxis,Math.PI/2*Math.min(1,.55+S.t*.9)+Math.sin(S.t*2.1)*.03);
    av.g.quaternion.copy(qSky).multiply(qSky2);av.g.position.copy(tmpSky.set(0,av.hip,0).applyQuaternion(av.g.quaternion).negate().add(tmpSky2.set(p.x,p.y+av.hip,p.z)));
    skyPoseSet(av,SKYP.box,SKYP.box,0);for(const r of av.arms)r.sh.rotation.x+=Math.sin(S.t*3+r.sx)*.04;}
  if(S.mode==='open'||S.mode==='cn'||S.mode==='cnFlare'||S.mode==='cnDown'){skyGear(false,true);
    const k=S.mode==='open'?S.k:S.mode==='cnDown'?S.cnK:1,swing=S.mode==='open'?Math.sin(S.t*6)*.25*(1-S.k):S.mode==='cnFlare'?-.12:0;
    qSky.setFromEuler(eSky.set(-swing,S.hd,-S.bank*.7,'YXZ'));qSky2.setFromAxisAngle(xAxis,Math.PI/2*S.pr);av.g.quaternion.copy(qSky).multiply(qSky2);
    av.g.position.copy(tmpSky.set(0,av.hip,0).applyQuaternion(av.g.quaternion).negate().add(tmpSky2.set(p.x,p.y+av.hip,p.z)));
    if(S.mode==='open')skyPoseSet(av,SKYP.box,SKYP.hang,Math.min(1,S.t*1.4));
    else if(S.mode==='cnFlare')skyPoseSet(av,SKYP.hang,SKYP.flare,Math.min(1,S.t*3));
    else if(S.mode==='cnDown')skyPoseSet(av,SKYP.flare,SKYP.hang,0);
    else{skyPoseSet(av,SKYP.hang,SKYP.hang,0);const t=S.turn;for(const r of av.arms)r.sh.rotation.z=r.sx*(SKYP.hang.shz-Math.max(0,r.sx*t)*.9);}// pull one toggle down to turn
    if(S.mode==='cnDown'){av.g.quaternion.identity();av.g.rotation.set(0,player.face,0);av.g.position.copy(p);
      // the canopy floats down behind you and settles on the ground
      const u=1-S.cnK;canPlace(skyCan,av,p,S.hd,0,Math.max(.05,1-u*.7),-u*1.4);skyCan.position.y-=u*2.2;}
    else canPlace(skyCan,av,p,S.hd,S.bank*.7,k,-swing);}});

/* ---------- the button ---------- */
{const st=document.createElement('style');st.textContent=`
#skyBtn{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 250px);transform:translateX(-50%);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5;background:linear-gradient(90deg,#2f8de0,#5ec6ff);box-shadow:0 6px 18px rgba(47,120,220,.45)}
#skyBtn.go{background:linear-gradient(90deg,#ff6a3c,#ffb21f);box-shadow:0 6px 18px rgba(255,120,40,.5);font-size:22px;padding:14px 28px}
#skyBtn:active{transform:translateX(-50%) scale(.94)}
body.dressing #skyBtn,body.talking #skyBtn,body.shopping #skyBtn{display:none!important}
body.skying #jump,body.skying #flyDown{opacity:.35}
@media (max-height:520px){#skyBtn{bottom:calc(env(safe-area-inset-bottom) + 130px)}}`;
  document.head.appendChild(st);document.body.insertAdjacentHTML('beforeend','<button class="hud" id="skyBtn"></button>');}
let skyAct=null,skyKey='';
function skyHud(){const p=player.pos,S=SKY;let t='',f=null,go=false;
  if(S.mode==='hg'&&!S.land){t='🛬 Land';f=skyLandBtn;}
  else if(S.mode==='plane'&&PL.mode==='run'){t='🪂 Jump!';f=sdJump;go=true;}
  else if(S.mode==='plane'){t=`✈️ Climbing… ${Math.round(Math.max(0,PL.pos.y-PLANE_GEAR)*12.5)} ft`;f=null;}
  else if(S.mode==='ff'&&S.t>1.2){t='🪂 Pull!';f=()=>sdPull(false);go=true;}
  else if(!S.mode&&started&&!closetOpen&&!ADS.mode){const near=(x,z,r)=>Math.hypot(p.x-x,p.z-z)<r;
    if(near(RAMP.padW[0],RAMP.padW[1],.95)&&Math.abs(p.y-MT.H)<.6){t='🪂 Hang glide!';f=hgGo;}
    else if(near(AIRF.padW[0],AIRF.padW[1],1.1)&&p.y<.6){if(PL.mode==='park'){t='✈️ Go skydiving!';f=sdGo;}else{t='✈️ The plane is out on a jump…';f=null;}}
    if(f&&(barnRide||BIKE.on||SK.on||FLY.on)){t='Hop off first 🙂';f=()=>toast('Hop off your ride first 🙂');}}
  skyAct=f;const key=t+(go?'!':'');document.body.classList.toggle('skying',!!S.mode);if(key===skyKey)return;skyKey=key;const b=$('#skyBtn');b.textContent=t;b.style.display=t?'block':'none';b.classList.toggle('go',go);}
$('#skyBtn').onclick=()=>{if(skyAct)skyAct();};
// the JUMP button does nothing while you're up there (so a stray tap doesn't make you hop)
function skyJump(){if(!SKY.mode)return false;if(SKY.mode==='plane'&&PL.mode==='run')sdJump();else if(SKY.mode==='ff'&&SKY.t>1.2)sdPull(false);return true;}
// the camera backs off when you're up there, so you can see the island below
function skyCamBack(){const S=SKY;if(!S.mode)return 0;if(S.mode==='plane'||S.mode==='board')return S.mode==='plane'?6.5:0;if(S.mode==='ff')return 2.6;if(S.mode.startsWith('hg'))return S.mode==='hgRun'?2.4:4.4;return 3.4;}
// the thermals: the hot hard ground of the Basketball Court, the Skate Park, the Beach and the runway
skyThermal(Z.court.x,Z.court.z,11,3.6,26);skyThermal(Z.skate.x,Z.skate.z,11,3.4,27);skyThermal(Z.beach.x*.92,Z.beach.z*.92,10,3.2,24);
{const [x,z]=AIRF.at((AIRF.t0+AIRF.t1)/2,0);skyThermal(x,z,11,3.4,28);}

/* ---------- 👭 friends online see you hang glide, fall, fly your canopy and ride in the plane ---------- */
SHOW.push({k:'sky',
  mine(){const S=SKY;if(!S.mode)return null;const q=v=>Math.round(v*4)/4;
    if(S.mode.startsWith('hg'))return {m:'hg',b:q(S.bank),pr:q(S.pr),p:q(S.pitch)};
    if(S.mode==='board'||S.mode==='plane')return {m:'pl',r:PL.mode==='run'?1:0};
    if(S.mode==='ff')return {m:'ff'};
    return {m:'cn',b:q(S.bank),k:S.mode==='open'?q(S.k):S.mode==='cnDown'?0:1,f:S.mode==='cnFlare'?1:0,pr:q(S.pr)};},
  on(f,d){const h={d,t:0};if(d.m==='hg'){h.o=hgBuild();scene.add(h.o);h.pod=hgPod(f.a);h.podA=f.a;}
    else if(d.m==='cn'||d.m==='ff'){h.rig=skyRig(f.a);h.rigA=f.a;if(d.m==='cn'){h.o=canBuild();scene.add(h.o);}}
    else if(d.m==='pl'){h.o=planeBuild();scene.add(h.o.g);}
    return h;},
  step(f,d,dt,h){if(!h||!f.a)return;h.t+=dt;const A=f.a,yaw=f.cur??f.face,P=f.pos;
    if(h.pod&&h.podA!==A){h.pod.parent&&h.pod.parent.remove(h.pod);freeObj(h.pod);h.pod=hgPod(A);h.podA=A;}
    if(h.rig&&h.rigA!==A){h.rig.parent&&h.rig.parent.remove(h.rig);freeObj(h.rig);h.rig=skyRig(A);h.rigA=A;}
    if(d.m==='hg'){h.pr=(h.pr??d.pr)+((+d.pr||0)-(h.pr??d.pr))*Math.min(1,dt*5);h.b=(h.b||0)+((+d.b||0)-(h.b||0))*Math.min(1,dt*4);hgPlace(h.o,A,P,yaw,+d.p||0,h.b,h.pr);}
    if(d.m==='ff'){qSky.setFromEuler(eSky.set(0,yaw,0,'YXZ'));qSky2.setFromAxisAngle(xAxis,Math.PI/2);A.g.quaternion.copy(qSky).multiply(qSky2);
      A.g.position.copy(tmpSky.set(0,A.hip,0).applyQuaternion(A.g.quaternion).negate().add(tmpSky2.set(P.x,P.y+A.hip,P.z)));skyPoseSet(A,SKYP.box,SKYP.box,0);}
    if(d.m==='cn'){h.b=(h.b||0)+((+d.b||0)-(h.b||0))*Math.min(1,dt*4);h.k=(h.k??0)+((+d.k||0)-(h.k??0))*Math.min(1,dt*3);const pr=+d.pr||0;
      qSky.setFromEuler(eSky.set(0,yaw,-h.b*.7,'YXZ'));qSky2.setFromAxisAngle(xAxis,Math.PI/2*pr);A.g.quaternion.copy(qSky).multiply(qSky2);
      A.g.position.copy(tmpSky.set(0,A.hip,0).applyQuaternion(A.g.quaternion).negate().add(tmpSky2.set(P.x,P.y+A.hip,P.z)));
      skyPoseSet(A,SKYP.hang,d.f?SKYP.flare:SKYP.hang,d.f?1:0);canPlace(h.o,A,P,yaw,h.b*.7,Math.max(.05,h.k));}
    if(d.m==='pl'){// the plane round your friend, and them sitting by its door
      const o=h.o,ps=tmpSky.set(.08,.29+A.hip-.12,-.15);o.g.rotation.order='YXZ';o.g.rotation.set(0,yaw,0);o.g.position.copy(ps.applyQuaternion(o.g.quaternion)).add(P);
      if(P.y>PLANE_GEAR+.5){o.g.rotation.x=-.06;}o.prop.rotation.z+=dt*60;o.disc.visible=true;o.door.position.z=o.doorZ-(d.r?1.02:0);
      A.g.quaternion.copy(o.g.quaternion).multiply(qSky.setFromAxisAngle(yAxis,-Math.PI/2));skyPoseSet(A,SKYP.sit,SKYP.sit,0);}},
  off(f,h){if(!h)return;if(h.o){const g=h.o.g||h.o;scene.remove(g);freeObj(g);}for(const k of ['pod','rig'])if(h[k]){h[k].parent&&h[k].parent.remove(h[k]);freeObj(h[k]);}
    if(f.a){f.a.g.quaternion.identity();f.a.g.rotation.set(0,f.cur??f.face,0);}}});

// for the test (3d/tests/sky.mjs)
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{sky:()=>({mode:SKY.mode,t:SKY.t,hd:SKY.hd,sp:SKY.sp,vy:SKY.vy,pr:SKY.pr,flight:SKY.flight,land:SKY.land,btn:skyKey,plane:PL.mode,planeY:PL.pos.y,planeX:PL.pos.x,planeZ:PL.pos.z,door:PL.doorK,clock:clock.elapsedTime}),
  SKY_PARTS:{RAMP,AIRF,THERM,PL_ALT},skyGo:{hgGo,sdGo,sdJump,sdPull,skyLandBtn},skyFloor,skyLandable,skyLift});});
