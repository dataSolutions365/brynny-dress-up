/* ================= 🚁 THE HELICOPTER: buy it or win it, fly it, and take your friends along =================
   - It lives at the 🚁 Helipad (12h-place-helipad.js), between the Basketball Court and the Jump Park.
   - Get it two ways: buy it in the shop's 🦖 Rides tab for HELI_PRICE 🪙 coins, or win it for free by finishing the
     4 helicopter challenges in ⭐🏆 (ids in HELI_EARN, in the 🗺️ Explore tab of challenges.js).
   - Walk up to it and tap 🚁 Get in. The rotor spins up, then hold ⬆️ UP (Space) to lift straight off.
     Steer with the joystick (W A S D): the nose dips when you speed up, it banks into turns and slows to a hover when you let go.
     Hold ⬇️ (Shift) to come down, and it touches down by itself on open ground. 🛬 Land picks a clear spot (the Helipad if
     it's close) and sets you down gently. It never flies into trees or roofs: it climbs over them (flyFloor in 24h-flying.js).
   - 🚪 Get out on the ground parks it right there. 🚁 Heli in the moves wheel calls it to you from wherever it's parked.
   - 👭 Friends online (online.js) see it parked or flying through the 'heli' entry in SHOW (26c-friends-see.js is the list).
     When your helicopter is on the ground with you in it, a friend standing next to it gets 🙋 Ride along: they sit in one
     of the 3 passenger seats and fly with you, and the 'hseat' entry shows them in their seat on every phone.
     The pilot's phone hands out the seats: messages {t:'heli', a:'ask'|'ok'|'full'|'out', to} go through the room (online.js).
     Passengers can only hop out once you've landed. If you get out, everyone gets out with you.
   - Real-looking on purpose (not a cartoon): a light four-seat helicopter with a tinted bubble canopy, two-blade main rotor,
     tail rotor, skids, navigation lights and a flashing red beacon. Keep it that way. */
const HELI_PRICE=500,HELI_K='heli:skyhawk';
const HELI_EARN=['heli_visit','heli_places','heli_wins','heli_stars'];// the challenges that win it (challenges.js)
const HELI_SPD=15,HELI_UP=4.5,HELI_DOWN=3.6,HELI_MAX=32,HELI_EDGE=R+9;// top speed, climb and sink rates, ceiling, how far out over the water
// where people sit: the spot their feet go (the 'chair' pose sits them on the seat). 0 = the pilot, front right like a real one
const HELI_SEATS=[[-.36,.6,.4],[.36,.6,.4],[-.36,.6,-.42],[.36,.6,-.42]].map(a=>new THREE.Vector3(...a));
const HELI_SEAT_Y=.52;// how high the seats' feet spot is above the skids (in HELI_SEATS)
SHOP.push({k:HELI_K,tab:'rides',e:'🚁',n:'Helicopter',p:HELI_PRICE,
  d:`Skyhawk, your own real helicopter! It's parked at the 🚁 Helipad. Fly it anywhere over town, and friends online can ride along. Or win it for free: finish the 4 🚁 helicopter challenges in ⭐🏆.`});

/* ---------- the model ---------- */
function makeHeli(){const g=new THREE.Group();scene.add(g);
  const paint=phys('#f2f3f5',{roughness:.28,clearcoat:1,clearcoatRoughness:.08,metalness:.05}),navy=phys('#1f3557',{roughness:.3,clearcoat:1,clearcoatRoughness:.1}),
    alu=std('#b9bec5',{metalness:.85,roughness:.32}),dark=std('#2a2d32',{metalness:.5,roughness:.45}),blade=std('#34373c',{metalness:.35,roughness:.5}),
    glass=phys('#22323f',{roughness:.04,metalness:.15,clearcoat:1,transparent:true,opacity:.34,side:THREE.DoubleSide,depthWrite:false}),
    seatM=std('#3d3f44',{roughness:.9}),panelM=std('#1b1c1f',{roughness:.6});
  // the cabin: an egg shape, with the front and top as a tinted glass bubble
  const C=new THREE.Vector3(0,1.22,.22),RX=.82,RY=.8,RZ=1.22,F=Math.PI/2,W=1.2,T0=.34,T1=1.72;
  const part=(m,a,b,c,d)=>{const s=M(new THREE.SphereGeometry(1,40,24,a,b,c,d),m,C.x,C.y,C.z,g,m!==glass,m!==glass);s.scale.set(RX,RY,RZ);return s;};
  part(paint,F+W,Math.PI*2-W*2,0,Math.PI);// the back and sides
  part(glass,F-W,W*2,T0,T1-T0);// the bubble
  part(paint,F-W,W*2,0,T0);// the roof just over it
  part(navy,F-W,W*2,T1,Math.PI-T1);// the chin under the windows
  // the belly: a flat-bottomed pan under the cabin floor (it also hides the bottom of a long skirt when you sit)
  M(new THREE.SphereGeometry(1,36,12,0,Math.PI*2,Math.PI/2,Math.PI/2),navy,0,.62,.18,g).scale.set(.76,.42,1.12);
  // a navy stripe down each side and a door line
  for(const sx of [-1,1]){const st=M(box(.02,.12,1.6),navy,sx*(RX-.035),.98,-.25,g,false,false);st.rotation.y=0;
    M(box(.015,.95,.02),dark,sx*(RX-.03),1.25,-.2,g,false,false);}
  // inside: floor, four seats, the instrument panel with glowing screens, and the sticks
  M(box(1.36,.06,1.7),panelM,0,.52,.1,g,false,true);
  for(const s of HELI_SEATS){M(box(.46,.1,.46),seatM,s.x,s.y+.42,s.z-.02,g,false,true);M(box(.46,.62,.1),seatM,s.x,s.y+.76,s.z-.27,g,false,true);M(box(.26,.18,.08),seatM,s.x,s.y+1.17,s.z-.29,g,false,false);}
  M(box(1.1,.26,.3),panelM,0,1.2,1.0,g,false,false).rotation.x=-.5;
  const scr=glow('#2ee0a0',.75);for(const x of [-.32,0,.32])M(new THREE.PlaneGeometry(.2,.13),scr,x,1.27,1.03,g,false,false).rotation.x=-.5-Math.PI/2+Math.PI/2;
  for(const x of [-.36,.36]){M(cyl(.015,.02,.42,8),dark,x,.75,.78,g,false,false).rotation.x=-.15;}
  // engine cowling, mast and the rotor head on top
  const cowl=M(new THREE.CapsuleGeometry(.3,.7,8,20),paint,0,1.93,-.5,g);cowl.rotation.x=Math.PI/2;cowl.scale.set(1,.62,1);
  for(const sx of [-1,1])M(box(.02,.1,.4),dark,sx*.29,1.93,-.75,g,false,false);// engine air vents
  M(cyl(.05,.07,.42,12),alu,0,2.37,-.2,g);
  const rotor=new THREE.Group();rotor.position.set(0,2.6,-.2);g.add(rotor);
  M(cyl(.14,.14,.12,16),dark,0,0,0,rotor);M(sph(.09,12,8),alu,0,.08,0,rotor);
  const blades=[];for(const s of [-1,1]){const b=M(box(4,.035,.24),blade,s*2.05,0,0,rotor,true,false);b.rotation.z=s*-.025;blades.push(b);
    M(box(.22,.036,.245),std('#d8b23a',{roughness:.5}),s*3.95,-.05*s*0+0,0,rotor,false,false).position.y=-.05;}
  // the spinning blur you see when the rotor is going fast (a soft disc, darker at the tips like a real one)
  const discTex=canvasTex(256,256,(x,w,h)=>{const gr=x.createRadialGradient(w/2,h/2,8,w/2,h/2,w/2);gr.addColorStop(0,'rgba(40,42,46,0)');gr.addColorStop(.35,'rgba(40,42,46,.18)');gr.addColorStop(.92,'rgba(40,42,46,.3)');gr.addColorStop(.97,'rgba(216,178,58,.35)');gr.addColorStop(1,'rgba(40,42,46,0)');x.fillStyle=gr;x.fillRect(0,0,w,h);});
  const discM=new THREE.MeshBasicMaterial({map:discTex,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const disc=M(new THREE.CircleGeometry(4.05,48),discM,0,2.6,-.2,g,false,false);disc.rotation.x=-Math.PI/2;
  // the tail boom, fins and tail rotor
  const tb=M(new THREE.CylinderGeometry(.08,.2,3.5,16),paint,0,1.5,-2.95,g);tb.rotation.x=-Math.PI/2-.04;// thin end at the back, rising a little
  const tbs=M(new THREE.CylinderGeometry(.165,.205,1.0,16,1,true),navy,0,1.49,-1.75,g,false,false);tbs.rotation.x=-Math.PI/2-.04;tbs.scale.set(1.02,1,1.02);
  M(new THREE.CylinderGeometry(.2,.52,.75,20),paint,0,1.42,-1.08,g).rotation.x=-Math.PI/2;// where the cabin narrows into the boom
  const fin=M(box(.05,.9,.5),navy,0,1.85,-4.5,g);fin.rotation.x=-.5;
  const fin2=M(box(.05,.4,.35),navy,0,1.2,-4.5,g);fin2.rotation.x=.45;
  M(box(1.0,.04,.28),navy,0,1.42,-4.05,g);for(const sx of [-1,1])M(box(.04,.22,.26),navy,sx*.5,1.47,-4.05,g);
  const tail=new THREE.Group();tail.position.set(.1,1.85,-4.62);g.add(tail);
  M(cyl(.05,.05,.08,10),dark,0,0,0,tail).rotation.z=Math.PI/2;
  for(const s of [-1,1]){const b=M(box(.03,.62,.09),blade,.04,s*.31,0,tail,false,false);b.userData.tail=1;}
  const tdM=discM.clone();const tdisc=M(new THREE.CircleGeometry(.63,32),tdM,.06,1.85,-4.62,g,false,false);tdisc.rotation.y=Math.PI/2;
  // the registration on the boom, like a real one
  const reg=labelTex('N-BRYN',{size:70,fg:'#1f3557',bg:null,border:null});
  for(const sx of [-1,1]){const p=M(new THREE.PlaneGeometry(.95,.24),new THREE.MeshBasicMaterial({map:reg,transparent:true,depthWrite:false}),sx*.2,1.5,-2.6,g,false,false);p.rotation.y=sx*Math.PI/2;p.rotation.x=0;}
  // skids: two aluminium tubes on curved struts, turned up at the front
  for(const sx of [-1,1]){const x=sx*.86;M(cyl(.045,.045,2.5,10),alu,x,.06,-.05,g).rotation.x=Math.PI/2;
    const tip=M(cyl(.045,.045,.4,10),alu,x,.14,1.33,g);tip.rotation.x=Math.PI/2-.6;
    for(const zz of [.62,-.6]){const st=M(cyl(.04,.04,.68,8),alu,sx*.68,.32,zz,g);st.rotation.z=sx*.62;}}
  for(const zz of [.62,-.6])M(cyl(.035,.035,1.0,8),alu,0,.55,zz,g).rotation.z=Math.PI/2;
  // lights: red on the left, green on the right, white on the tail, and a red beacon that flashes on top
  const navR=glow('#ff2a2a',1.6),navG=glow('#2aff5a',1.6),navW=glow('#ffffff',1.4);
  M(sph(.045,8,6),navR,.82,1.05,-.9,g,false,false);M(sph(.045,8,6),navG,-.82,1.05,-.9,g,false,false);M(sph(.045,8,6),navW,0,1.4,-4.85,g,false,false);
  const beaconM=glow('#ff2020',2),beacon=M(sph(.06,10,8),beaconM,0,2.3,-1.15,g,false,false);
  const lightM=glow('#fff8e0',1.2);M(sph(.07,10,8),lightM,0,.5,1.33,g,false,false);// a landing light under the nose
  return {g,rotor,blades,disc,tail,tdisc,beacon,spin:0,tspin:0,rpm:0};}

// spin the rotors and fade the blades into a blur as they speed up (for your helicopter and friends')
function heliSpin(h,dt,t){const r=h.rpm;h.spin+=r*r*dt*28;h.tspin+=r*dt*60;h.rotor.rotation.y=h.spin;h.tail.rotation.x=h.tspin;
  const blur=Math.max(0,Math.min(1,(r-.35)/.45));h.disc.material.opacity=blur*.85;h.tdisc.material.opacity=blur*.8;
  for(const b of h.blades)b.visible=blur<.97;for(const c of h.tail.children)if(c.userData.tail)c.visible=blur<.95;
  h.beacon.visible=r>.02&&(t*1.1)%1<.12;}
const HV={v:new THREE.Vector3(),e:new THREE.Euler(0,0,0,'YXZ'),m:new THREE.Matrix4(),q:new THREE.Quaternion()};
// put helicopter model h at origin P (skids on the ground), facing yaw, with its nose pitch and its bank
function heliPlace(h,P,yaw,pitch,bank){h.g.position.copy(P);h.g.rotation.order='YXZ';h.g.rotation.set(-pitch,yaw,-bank);}
// where seat i is in the world, for a helicopter at P (out: a Vector3)
function heliSeatAt(P,yaw,pitch,bank,i,out){HV.e.set(-pitch,yaw,-bank);return out.copy(HELI_SEATS[i]).applyEuler(HV.e).add(P);}
// and the other way round: the helicopter's origin when seat i is at S
function heliFromSeat(S,yaw,pitch,bank,i,out){HV.e.set(-pitch,yaw,-bank);return out.copy(HELI_SEATS[i]).applyEuler(HV.e).negate().add(S);}
// someone sitting in a seat: the chair pose, tilted with the helicopter
function heliSit(a,P,yaw,pitch,bank,i){if(!a)return;if(!a.emote||a.emote.id!=='chair')a.play('chair');a.emote.t=Math.min(a.emote.t,1);
  heliSeatAt(P,yaw,pitch,bank,i,a.g.position);const r=a.g.rotation;r.order='YXZ';r.set(-pitch,yaw,-bank);}
function heliUnsit(a){if(!a)return;a.g.rotation.set(0,a.g.rotation.y,0);if(a.emote&&a.emote.id==='chair')a.emote=null;}

/* ---------- your helicopter ---------- */
const HM=makeHeli();
const HELI={pos:new THREE.Vector3(),hd:0,vx:0,vz:0,vy:0,pitch:0,bank:0,turn:0,on:false,mode:'park',spot:null,ride:null,seats:[null,null,null,null],
  auto:null,chopT:0,dustT:0,edgeT:0,highT:0,ob:{x:0,z:0,r:0},hide:false,t:0,gone:0,liftWarn:0};
const heliOwn=()=>owns(HELI_K);
// the jump button while you're in it: ⬆️ UP is held down (FLY.upBtn, 24h-flying.js), so a tap does nothing else
function heliJump(){return HELI.on||!!HELI.ride;}
SAVE.heli||={};
// where it's parked (the Helipad until you park it somewhere else)
{const s=SAVE.heli,z=Z.heli;if(Number.isFinite(s.x)&&Number.isFinite(s.z)&&Math.hypot(s.x,s.z)<R){HELI.pos.set(s.x,0,s.z);HELI.hd=+s.hd||0;}
  else{HELI.pos.set(z.x,0,z.z);HELI.hd=z.rot;}}
obs.push(HELI.ob);
function heliSave(){SAVE.heli.x=+HELI.pos.x.toFixed(2);SAVE.heli.z=+HELI.pos.z.toFixed(2);SAVE.heli.hd=+HELI.hd.toFixed(2);persist();}
// the helicopters are never "in the way" for the flying rides' height map (24h-flying.js)
function heliSkip(){const l=[HM.g];try{for(const o of (window.__net?window.__net.friends().values():[]))if(o.shows&&o.shows.heli&&o.shows.heli.h&&o.shows.heli.h.H)l.push(o.shows.heli.h.H.g);}catch(e){}return l;}
// is the ground here clear for the rotor (no trees, roofs or lamp posts close by)?
function heliOpen(x,z){flyGrid();if(Math.hypot(x,z)>R-2)return false;const g=groundAt(x,z);if(flyFloor(x,z,3)>g+.5)return false;return !obs.some(o=>o!==HELI.ob&&o.r>0&&Math.hypot(o.x-x,o.z-z)<o.r+1.6);}
function heliSpot(x,z){if(heliOpen(x,z))return [x,z];for(let r=1.5;r<40;r+=1.5)for(let i=0;i<20;i++){const a=i/20*Math.PI*2+r,sx=x+Math.sin(a)*r,sz=z+Math.cos(a)*r;if(heliOpen(sx,sz))return [sx,sz];}return [x,z];}
const heliOnPad=(x,z)=>Math.hypot(x-Z.heli.x,z-Z.heli.z)<HPAD.r;
const heliBusy=()=>closetOpen||!started||handsBusy()||!!barnRide||DL.on||restOpen;
function heliBtnShow(txt,fn){const b=$('#heliBtn');if(!txt){if(b.style.display!=='none'){b.style.display='none';b.textContent='';}b._fn=null;return;}if(b.textContent!==txt)b.textContent=txt;if(b.style.display!=='block')b.style.display='block';b._fn=fn;}
$('#heliBtn').addEventListener('click',()=>{const f=$('#heliBtn')._fn;if(f){sfx('pop');f();}});

// it's yours: bought in the shop, or won with the challenges
function heliGet(won){if(SAVE.heli.got)return;SAVE.owned[HELI_K]=true;SAVE.heli.got=1;persist();renderActions();
  setTimeout(()=>{banner(won?'🏆 You won the helicopter!':'🚁 The helicopter is yours!');toast('It\'s at the 🚁 Helipad. Walk up to it and tap 🚁 Get in, or tap 🚁 Heli with your moves!');},won?0:1900);
  if(won){sfx('tada');burst(new THREE.Vector3(player.pos.x,player.pos.y+1.4,player.pos.z),'#ffd23f',60,3,.2);did('prize','heli');}}
addEventListener('brynny:did',e=>{const d=e.detail||{};if(d.k==='buy'&&d.a===HELI_K)heliGet(false);});
const heliEarned=()=>HELI_EARN.filter(id=>SAVE.chal&&SAVE.chal.done&&SAVE.chal.done[id]).length;
setInterval(()=>{if(!started)return;if(owns(HELI_K)&&!SAVE.heli.got){SAVE.heli.got=1;persist();}
  if(!owns(HELI_K)&&heliEarned()>=HELI_EARN.length)heliGet(true);},1500);
// 🚁 Heli in the moves wheel
RIDE_ACTS.push(()=>heliOwn()&&!HELI.on&&!HELI.ride?[['heli','🚁','Heli']]:[]);

/* ---------- getting in and out ---------- */
function heliBoard(){if(!heliOwn()||HELI.on||HELI.ride||HELI.auto)return;flyGrid();if(heliBusy()){toast('Finish what you are doing first! 🚁');return;}
  if(BIKE.on)stopBike(true);if(SK.on)stopSkate(true);
  Object.assign(HELI,{on:true,mode:'ground',vx:0,vz:0,vy:0,pitch:0,bank:0,turn:0,spot:null,t:0});HELI.ob.r=0;
  player.face=HELI.hd;player.vy=0;player.speed=0;sfx('pop');tone(220,.5,'sawtooth',.03,0,90);renderActions();heliHud(true);
  if(!SAVE.heliTip){SAVE.heliTip=1;persist();setTimeout(()=>toast(isTouch?'Wait for the rotor to spin up, then hold ⬆️ UP to lift off! Steer with the joystick, hold ⬇️ to come down.':'Wait for the rotor to spin up, then hold Space to lift off! Steer with W A S D, hold Shift to come down, L to land.'),700);}}
function heliOut(){if(!HELI.on||HELI.mode!=='ground')return;const P=HELI.pos;HELI.on=false;HELI.mode='park';HELI.seats.fill(null);
  const door=heliSeatAt(P,HELI.hd,0,0,0,new THREE.Vector3()),side=new THREE.Vector3(-1.25,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),HELI.hd);
  player.pos.set(door.x+side.x,groundAt(door.x+side.x,door.z+side.z),door.z+side.z);collide(player.pos);player.onGround=true;player.vy=0;player.face=HELI.hd-Math.PI/2;
  heliUnsit(av);heliSave();renderActions();heliHud(true);}
// 🚁 Heli in the moves wheel: hop in if it's close by, or it flies over to you by itself and lands nearby
function heliCall(){if(!heliOwn()){setDest(Z.heli);toast('Get the helicopter at the 🚁 Helipad! 💗');return;}
  if(HELI.on||HELI.ride)return;const P=player.pos;
  if(Math.hypot(P.x-HELI.pos.x,P.z-HELI.pos.z)<6&&!HELI.auto){heliBoard();return;}
  if(HELI.auto)return;const f=player.face,[sx,sz]=heliSpot(P.x+Math.sin(f)*7,P.z+Math.cos(f)*7);
  HELI.auto={x:sx,z:sz,from:HELI.pos.clone(),t:0};HELI.ob.r=0;toast('🚁 Your helicopter is on its way!');sfx('star');}

/* ---------- flying it (from the game loop instead of walking; true = it moved you) ---------- */
function heliStep(dt,ix,iy,mag){if(HELI.ride)return heliRideStep(dt);if(!HELI.on)return false;
  const H=HELI,P=H.pos,up=FLY.upBtn||keys.Space,down=FLY.downBtn||keys.ShiftLeft||keys.ShiftRight||keys.KeyC;H.t+=dt;
  if(keys.KeyL&&H.mode==='air')heliLand();
  const g=groundAt(P.x,P.z);
  // the joystick: which way you want to go, the same as walking
  let wx=0,wz=0;if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;wx=(fx*-iy+rx*ix)/n*HELI_SPD*mag;wz=(fz*-iy+rz*ix)/n*HELI_SPD*mag;}
  if(H.mode==='ground'){H.vx=H.vy=H.vz=0;P.y=g;
    if(up&&HM.rpm>.85){H.mode='air';H.vy=1.5;did('heli','takeoff');if(H.seats.some(Boolean))did('heli','friend');sfx('jump');}
    else if(up&&performance.now()-H.liftWarn>2500){H.liftWarn=performance.now();toast('⏳ Wait for the rotor to spin up…');}}
  else{
    // 🛬 landing by itself: fly over to the spot, slow down, and come straight down onto it
    let wantVy=up?HELI_UP:down?-HELI_DOWN:0;
    if(H.mode==='land'){if(mag>.08||up){H.mode='air';}else{const dx=H.spot[0]-P.x,dz=H.spot[1]-P.z,d=Math.hypot(dx,dz),sp=Math.min(9,d*.9);
      if(d>.05){wx=dx/d*sp;wz=dz/d*sp;}const hg=P.y-g;const cl=flyFloor(P.x,P.z,3);wantVy=d<1.5?-Math.max(.5,Math.min(3,hg*.9)):d<8&&P.y>cl+1.2?-Math.min(1.5,hg*.3):0;}}
    // speed builds up and dies down gently, like a real helicopter
    const k=Math.min(1,dt*(Math.hypot(wx,wz)>Math.hypot(H.vx,H.vz)?.9:.7));const ax=(wx-H.vx)*k,az=(wz-H.vz)*k;H.vx+=ax;H.vz+=az;
    H.vy+=(wantVy-H.vy)*Math.min(1,dt*2.5);
    // stay over the island and the water round it
    const rr=Math.hypot(P.x,P.z);if(rr>HELI_EDGE-8){const nx=-P.x/rr,nz=-P.z/rr,out=-(H.vx*nx+H.vz*nz);if(out>0){const s=Math.min(1,(rr-(HELI_EDGE-8))/8);H.vx+=nx*out*s*dt*4;H.vz+=nz*out*s*dt*4;}
      if(rr>HELI_EDGE-2&&performance.now()-H.edgeT>6000){H.edgeT=performance.now();toast('🌊 That\'s as far as the helicopter goes! Turning back ✨');}}
    // never into trees and buildings: climb over them before you get there
    let nx=P.x+H.vx*dt,nz=P.z+H.vz*dt;const nr=Math.hypot(nx,nz);if(nr>HELI_EDGE){nx*=HELI_EDGE/nr;nz*=HELI_EDGE/nr;}
    const below=flyFloor(nx,nz,3),ahead=Math.max(below,flyFloor(nx+H.vx*.7,nz+H.vz*.7,3));
    if(P.y>=below-.1){P.x=nx;P.z=nz;}else{H.vx*=.5;H.vz*=.5;}
    const gg=groundAt(P.x,P.z),clear=ahead>gg+.1?ahead+.4:gg;
    if(P.y<clear&&H.vy<(clear-P.y)*3+.5)H.vy+=((clear-P.y)*3+.5-H.vy)*Math.min(1,dt*6);
    P.y+=H.vy*dt;{const fl=flyFloor(P.x,P.z,3);if(fl>gg+.1&&P.y<fl+.05){P.y=fl+.05;if(H.vy<0)H.vy=0;}}// never down into a tree or onto a roof
    if(P.y>HELI_MAX){P.y=HELI_MAX;H.vy=Math.min(0,H.vy);}
    if(P.y>=HELI_MAX-.5){H.highT+=dt;if(H.highT>1.5&&!H.wentHigh){H.wentHigh=1;did('heli','high');toast('☁️ Up with the clouds!');}}else H.highT=0;
    // touching down: only on open ground, softly
    if(P.y<=gg+.02&&H.vy<=0){P.y=gg;if(heliOpen(P.x,P.z)||clear<=gg+.01){H.mode='ground';H.vx=H.vz=H.vy=0;burst(new THREE.Vector3(P.x,gg+.05,P.z),'#e6dcc4',24,2);tone(140,.18,'sine',.08,0,80);
      did('heli','land');if(heliOnPad(P.x,P.z))did('heli','pad');}else P.y=gg+.02;}
    // the nose points where you're going; it dips as you speed up and banks into turns
    const sp=Math.hypot(H.vx,H.vz);let turn=0;
    if(sp>1.2){const want=Math.atan2(H.vx,H.vz),d=angDamp(0,want-H.hd,1),rate=1.5*dt,st=Math.max(-rate,Math.min(rate,d))*Math.min(1,sp/4);H.hd+=st;turn=st/dt;}
    H.turn+=(turn-H.turn)*Math.min(1,dt*4);
    const fwd=H.vx*Math.sin(H.hd)+H.vz*Math.cos(H.hd),side=H.vx*Math.cos(H.hd)-H.vz*Math.sin(H.hd),aF=(ax*Math.sin(H.hd)+az*Math.cos(H.hd))/Math.max(dt,.001);
    const wantP=Math.max(-.32,Math.min(.2,-fwd/HELI_SPD*.2-aF*.025)),wantB=Math.max(-.42,Math.min(.42,H.turn*sp*.045+side/HELI_SPD*.15));
    H.pitch+=(wantP-H.pitch)*Math.min(1,dt*2.5);H.bank+=(wantB-H.bank)*Math.min(1,dt*2.5);}
  if(H.mode==='ground'){H.pitch*=Math.max(0,1-dt*6);H.bank*=Math.max(0,1-dt*6);}
  // you're in the pilot's seat
  heliSeatAt(P,H.hd,H.pitch,H.bank,0,player.pos);player.face=H.hd;player.speed=0;player.vy=0;player.onGround=false;
  heliHud();return true;}
function heliLand(){const H=HELI;if(!H.on||H.mode!=='air')return;const P=H.pos,pz=Z.heli;
  // the Helipad if it's close and nobody's on it, or else the nearest open patch a little ahead
  if(Math.hypot(P.x-pz.x,P.z-pz.z)<30&&heliOpen(pz.x,pz.z))H.spot=[pz.x,pz.z];
  else H.spot=heliSpot(P.x+H.vx*.8,P.z+H.vz*.8);H.mode='land';}

/* ---------- riding along in a friend's helicopter ---------- */
const heliNet=()=>{const n=window.__net;return n&&n.live()?n:null;};
const heliMe=()=>(window.__net&&window.__net.id())||'me';
// a friend's helicopter as you see it (built by the 'heli' entry in SHOW)
function heliOf(id){const n=window.__net;if(!n)return null;const o=n.friends().get(id);const c=o&&o.shows&&o.shows.heli;return c&&c.h?{o,d:c.d,h:c.h}:null;}
function heliRideStep(dt){const r=HELI.ride,f=heliOf(r.pid);r.t+=dt;
  if(!f||!heliNet()){r.lost=(r.lost||0)+dt;if(r.lost>2.5)heliDrop('Your friend\'s helicopter is gone 👋');return true;}r.lost=0;
  // the pilot's phone says who's in the seats: if you're not in one any more, you're out
  if(r.t>3&&!(Array.isArray(f.d.s)&&f.d.s.includes(heliMe()))){heliDrop();return true;}
  const h=f.h;heliSeatAt(h.P,h.yaw,h.pitch,h.bank,r.i,player.pos);player.face=h.yaw;player.speed=0;player.vy=0;player.onGround=false;
  heliHud();return true;}
function heliAsk(pid){const n=heliNet();if(!n||HELI.on||HELI.ride||HELI.asking)return;if(heliBusy()){toast('Finish what you are doing first! 🚁');return;}
  HELI.asking=pid;n.send({t:'heli',a:'ask',to:pid});setTimeout(()=>{if(HELI.asking===pid){HELI.asking=null;toast('No answer from the pilot. Try again!');}},5000);}
function heliDrop(msg){const r=HELI.ride;if(!r)return;HELI.ride=null;const n=heliNet();if(n)try{n.send({t:'heli',a:'out',to:r.pid});}catch(e){}
  const f=heliOf(r.pid),P=player.pos,side=new THREE.Vector3(r.i%2?1.3:-1.3,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),f?f.h.yaw:player.face);
  P.x+=side.x;P.z+=side.z;P.y=groundAt(P.x,P.z);collide(P);player.onGround=true;player.vy=0;heliUnsit(av);heliHud(true);renderActions();if(msg)toast(msg);}
// messages through the room: the pilot hands out the seats
addEventListener('load',()=>{if(window.__net)window.__net.on((id,name,d)=>{if(d.t!=='heli'||d.to!==heliMe())return;const H=HELI;
  if(d.a==='ask'){const n=heliNet();if(!n)return;
    if(!H.on||H.mode!=='ground'){n.send({t:'heli',a:'full',to:id,why:'air'});return;}
    let i=H.seats.indexOf(id);if(i<0){i=H.seats.findIndex((s,k)=>k>0&&!s);if(i<0){n.send({t:'heli',a:'full',to:id});return;}H.seats[i]=id;}
    n.send({t:'heli',a:'ok',to:id,i});toast(`🚁 ${name} hopped in! Hold ⬆️ to take off together`);sfx('pop');}
  else if(d.a==='out'){const i=H.seats.indexOf(id);if(i>0){H.seats[i]=null;if(H.on)toast(`${name} hopped out 👋`);}}
  else if(d.a==='ok'&&H.asking===id){H.asking=null;if(HELI.on)return;if(BIKE.on)stopBike(true);if(SK.on)stopSkate(true);if(barnRide)stopRide(true);
    H.ride={pid:id,i:Math.max(1,Math.min(3,d.i|0)),t:0};renderActions();heliHud(true);did('heli','ride');toast(`🚁 You're riding with ${name}! Enjoy the flight ✨`);}
  else if(d.a==='full'&&H.asking===id){H.asking=null;toast(d.why==='air'?`${name} is already flying. Wait for them to land!`:`${name}'s helicopter is full!`);}});});

/* ---------- buttons ---------- */
let heliHudS='';
function heliHud(force){const H=HELI,s=H.ride?'P'+((heliOf(H.ride.pid)||{}).d||{}).m:H.on?H.mode:'';if(s===heliHudS&&!force)return;heliHudS=s;
  document.body.classList.toggle('heli-on',!!s);document.body.classList.toggle('heli-pass',!!H.ride);document.body.classList.toggle('flying',!!s||(!!barnRide&&FLY.on));
  if(H.on){$('#jump').textContent='⬆️ UP';$('#jump').classList.add('fly');$('#flyDown').style.display=H.mode==='ground'?'none':'grid';}
  else{$('#flyDown').style.display='none';$('#jump').classList.remove('fly');$('#jump').textContent='JUMP';flyHudS='?';}}// flyHud and skLabel put their own words back next time
// the floating button: get in, land, get out, ride along, or see how to get one
function heliButtons(){if(!started||closetOpen){heliBtnShow('');return;}const H=HELI,P=player.pos;
  if(H.ride){const f=heliOf(H.ride.pid);heliBtnShow(f&&f.d.m==='g'?'🚪 Get out':'',()=>{const f=heliOf(H.ride.pid);if(f&&f.d.m==='g')heliDrop();else toast('Wait until you land to hop out! 🚁');});return;}
  if(H.on){heliBtnShow(H.mode==='ground'?'🚪 Get out':H.mode==='land'?'🛬 Landing…':'🛬 Land',H.mode==='ground'?heliOut:heliLand);return;}
  if(heliBusy()||SKP.on){heliBtnShow('');return;}
  // a friend's helicopter on the ground with them in it: ride along
  const n=heliNet();if(n)for(const [id,o] of n.friends()){const c=o.shows&&o.shows.heli;if(!c||!c.h||!c.d.on||c.d.m!=='g')continue;const h=c.h;
    if(Math.hypot(P.x-h.P.x,P.z-h.P.z)<3.6){heliBtnShow(H.asking?'🙋 Asking…':`🙋 Ride with ${o.name}`,()=>heliAsk(id));return;}}
  if(!HM.g.visible||H.auto){heliBtnShow('');return;}
  if(Math.hypot(P.x-H.pos.x,P.z-H.pos.z)<3.6)heliBtnShow(heliOwn()?'🚁 Get in':'🚁 Get the helicopter',()=>{if(heliOwn())heliBoard();else askBuy(HELI_K);});
  else heliBtnShow('');}
function heliCamBack(){if(!HELI.on&&!HELI.ride)return 0;const P=player.pos;return 3.2+2.5*Math.max(0,Math.min(1,(P.y-groundAt(P.x,P.z))/10));}

/* ---------- every frame: the model, the rotor, the sound, the dust, and you in your seat ---------- */
const heliTmp=new THREE.Vector3();
function heliNoise(h,P,dt,mine){if(h.rpm<.08)return;const d=mine?0:Math.hypot(P.x-player.pos.x,P.z-player.pos.z),vol=Math.max(0,1-d/40)*h.rpm;if(vol<.03)return;
  h.chopT=(h.chopT||0)-dt;if(h.chopT<=0){h.chopT=1/(4+h.rpm*7);tone(58+h.rpm*14,.09,'triangle',.07*vol);tone(1500+h.rpm*600,.12,'sine',.006*vol);}
  // rotor wash: dust blowing out from under it when it's close to the ground
  const hg=P.y-groundAt(P.x,P.z);h.dustT=(h.dustT||0)-dt;if(h.rpm>.6&&hg<5&&h.dustT<=0){h.dustT=.18;const a=Math.random()*Math.PI*2;burst(heliTmp.set(P.x+Math.sin(a)*1.5,groundAt(P.x,P.z)+.05,P.z+Math.cos(a)*1.5),'#e6dcc4',8,2.4*(1-hg/6),.18);}}
anims.push((t,dt)=>{const H=HELI;
  // flying over to you when you call it
  if(H.auto){const A=H.auto;A.t+=dt;const T=6;HM.rpm=Math.min(1,HM.rpm+dt);const k=Math.min(1,A.t/T),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    const gy=groundAt(A.x,A.z);H.pos.set(A.from.x+(A.x-A.from.x)*e,0,A.from.z+(A.z-A.from.z)*e);H.pos.y=Math.max(gy,A.from.y+(gy-A.from.y)*k+Math.sin(k*Math.PI)*14);
    const dx=A.x-A.from.x,dz=A.z-A.from.z;if(k<.85&&Math.hypot(dx,dz)>1)H.hd=angDamp(H.hd,Math.atan2(dx,dz),Math.min(1,dt*2));H.pitch=-Math.sin(k*Math.PI)*.18;H.bank=0;
    if(k>=1){H.auto=null;H.pos.y=gy;H.pitch=0;heliSave();burst(new THREE.Vector3(H.pos.x,gy+.05,H.pos.z),'#e6dcc4',24,2);toast('🚁 Here it is! Tap 🚁 Get in');}}
  // the rotor spins up while someone's in it (or it's flying itself over), and slowly winds down after
  const run=H.on||!!H.auto;HM.rpm=run?Math.min(1,HM.rpm+dt*.3):Math.max(0,HM.rpm-dt*.09);
  // a friend's helicopter parked right on top of yours: yours steps aside for now
  let hide=false;if(!run&&heliNet())for(const o of window.__net.friends().values()){const c=o.shows&&o.shows.heli;if(c&&c.h&&Math.hypot(c.h.P.x-H.pos.x,c.h.P.z-H.pos.z)<4){hide=true;break;}}
  HM.g.visible=!hide;H.ob.r=run||hide?0:1.35;H.ob.x=H.ob.r?H.pos.x:1e4;H.ob.z=H.pos.z;
  if(!run&&!H.on){H.pitch*=.9;H.bank*=.9;H.pos.y=groundAt(H.pos.x,H.pos.z);}
  heliPlace(HM,H.pos,H.hd,H.pitch,H.bank);heliSpin(HM,dt,t);if(HM.g.visible)heliNoise(HM,H.pos,dt,H.on);
  // you in your seat (after the game loop has posed you, so this wins)
  if(H.on)heliSit(av,H.pos,H.hd,H.pitch,H.bank,0);
  // seats of friends who left the room are free again
  if(H.on){const n=window.__net,fr=n&&n.friends();for(let i=1;i<4;i++)if(H.seats[i]&&!(fr&&fr.has(H.seats[i])))H.seats[i]=null;}
  heliButtons();});
// a game or the closet opening while you're in it: you're set down where you are (the helicopter lands itself first if it's up)
anims.push(()=>{const H=HELI;if(!H.on||!(handsBusy()||closetOpen))return;
  if(H.mode!=='ground'){const [x,z]=heliSpot(H.pos.x,H.pos.z);H.pos.set(x,groundAt(x,z),z);H.mode='ground';H.vx=H.vz=H.vy=0;}heliOut();});

/* ---------- 👭 what friends see (26c-friends-see.js) ---------- */
// your helicopter: parked (where it is) or flying with you in it (they work out the tilt from how you move), and who's in the seats
SHOW.push({k:'heli',
  mine(){if(!heliOwn())return null;const H=HELI;
    if(H.on)return {on:1,m:H.mode==='ground'?'g':'a',s:H.seats.map(s=>s||'')};
    if(H.auto)return null;// flying itself over to you: friends see it once it's parked
    return {p:[+H.pos.x.toFixed(1),+H.pos.y.toFixed(2),+H.pos.z.toFixed(1)],h:+H.hd.toFixed(2)};},
  on(f,d){const k=f._heliKeep;if(k){f._heliKeep=null;k.H.g.visible=true;if(!d.on&&Array.isArray(d.p)){k.P.set(+d.p[0]||0,+d.p[1]||0,+d.p[2]||0);k.yaw=+d.h||0;}return k;}
    const H=makeHeli(),h={H,P:new THREE.Vector3(),yaw:0,pitch:0,bank:0,vx:0,vz:0,turn:0,last:null,ob:{x:1e4,z:0,r:0},a:null};obs.push(h.ob);
    if(!d.on&&Array.isArray(d.p)){h.P.set(+d.p[0]||0,+d.p[1]||0,+d.p[2]||0);h.yaw=+d.h||0;}else{h.yaw=f.cur??f.face;heliFromSeat(f.pos,h.yaw,0,0,0,h.P);h.last=f.pos.clone();}
    H.rpm=d.on?.9:0;heliPlace(H,h.P,h.yaw,0,0);return h;},
  step(f,d,dt,h){const H=h.H;
    if(d.on){const yaw=f.cur??f.face,pos=f.pos;
      // how they're moving: speed up = nose down, turning = bank, the same as on your own phone
      if(!h.last)h.last=pos.clone();const vx=(pos.x-h.last.x)/Math.max(dt,.001),vz=(pos.z-h.last.z)/Math.max(dt,.001);h.last.copy(pos);
      const ax=(vx-h.vx)/Math.max(dt,.001),az=(vz-h.vz)/Math.max(dt,.001);h.vx+=(vx-h.vx)*Math.min(1,dt*4);h.vz+=(vz-h.vz)*Math.min(1,dt*4);
      const tr=angDamp(0,yaw-h.yaw,1)/Math.max(dt,.001);h.turn+=(tr-h.turn)*Math.min(1,dt*4);h.yaw=yaw;
      const sp=Math.hypot(h.vx,h.vz),fwd=h.vx*Math.sin(yaw)+h.vz*Math.cos(yaw),aF=(ax*Math.sin(yaw)+az*Math.cos(yaw))*.02;
      const air=d.m!=='g',wantP=air?Math.max(-.32,Math.min(.2,-fwd/HELI_SPD*.2-aF*.025)):0,wantB=air?Math.max(-.42,Math.min(.42,h.turn*sp*.045)):0;
      h.pitch+=(wantP-h.pitch)*Math.min(1,dt*2.5);h.bank+=(wantB-h.bank)*Math.min(1,dt*2.5);
      heliFromSeat(pos,yaw,h.pitch,h.bank,0,h.P);if(!air){const gy=groundAt(h.P.x,h.P.z);if(Math.abs(h.P.y-gy)<.4)h.P.y=gy;}
      H.rpm=Math.min(1,H.rpm+dt*.3);h.ob.r=0;h.ob.x=1e4;
      heliSit(f.a,h.P,yaw,h.pitch,h.bank,0);h.a=f.a;}
    else{H.rpm=Math.max(0,H.rpm-dt*.09);h.pitch*=.9;h.bank*=.9;h.ob.r=1.35;h.ob.x=h.P.x;h.P.y=groundAt(h.P.x,h.P.z);h.ob.z=h.P.z;h.last=null;if(h.a){heliUnsit(h.a);h.a=null;}}
    heliPlace(H,h.P,h.yaw,h.pitch,h.bank);heliSpin(H,dt,performance.now()/1000);heliNoise(H,h.P,dt,false);},
  // (kept for a moment: when only the data changed, on() takes it straight back instead of building a new one)
  off(f,h){if(!h)return;h.H.g.visible=false;f._heliKeep=h;setTimeout(()=>{if(f._heliKeep!==h)return;f._heliKeep=null;
    scene.remove(h.H.g);freeObj(h.H.g);const i=obs.indexOf(h.ob);if(i>=0)obs.splice(i,1);if(h.a)heliUnsit(h.a);},0);}});
// you riding along: friends see you sitting in your seat in the pilot's helicopter (on the pilot's phone too)
SHOW.push({k:'hseat',
  mine(){const r=HELI.ride;return r?{p:String(r.pid).slice(0,64),i:r.i}:null;},
  on(f){return {a:null};},
  step(f,d,dt,h){const i=Math.max(1,Math.min(3,d.i|0));let P,yaw,pitch,bank;
    if(d.p===heliMe()){if(!HELI.on)return;P=HELI.pos;yaw=HELI.hd;pitch=HELI.pitch;bank=HELI.bank;}
    else{const o=heliOf(d.p);if(!o)return;P=o.h.P;yaw=o.h.yaw;pitch=o.h.pitch;bank=o.h.bank;}
    heliSit(f.a,P,yaw,pitch,bank,i);h.a=f.a;},
  off(f,h){if(h&&h.a)heliUnsit(h.a);}});

// riding along: sit in your seat after online.js has moved your friend's helicopter this frame (or you'd lag behind it)
function heliRideSit(){const r=HELI.ride;if(!r)return;const f=heliOf(r.pid);if(!f)return;const h=f.h;
  heliSeatAt(h.P,h.yaw,h.pitch,h.bank,r.i,player.pos);heliSit(av,h.P,h.yaw,h.pitch,h.bank,r.i);}
addEventListener('load',()=>onTick.push(heliRideSit));
// for the ⭐🏆 challenges' Rewards tab (challenges.js), and for tests
addEventListener('load',()=>{const G=window.__game;if(!G)return;const er=G.earnedRides;
  G.earnedRides=()=>(er?er():[]).concat([{k:'heli',e:'🚁',pic:null,n:'Helicopter',nm:'Skyhawk',by:'chal',goal:HELI_EARN.length,have:Math.min(HELI_EARN.length,heliEarned()),own:heliOwn(),fly:false,
    what:`Finish the ${HELI_EARN.length} 🚁 helicopter challenges, or buy it for ${HELI_PRICE} 🪙`,ownTxt:'Yours! It\'s parked at the 🚁 Helipad'}]);
});
Object.assign(window.__game,{heli:()=>HELI,heliModel:()=>HM,heliBoard,heliOut,heliLand,heliCall,heliGet,heliAsk,heliDrop,heliOpen,HELI_SEATS,HELI_K});
