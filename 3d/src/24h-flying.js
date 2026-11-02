/* ================= 🪽 FLYING RIDES: take off and soar over the treetops =================
   The rides with wings (FARM entries with fly:1 in 24d-barn.js: 🦄 Cloud the winged unicorn, 🦅 Sunny the pterodactyl
   and 🐉 Nova the starlight dragon) can fly:
   - While riding one, the JUMP button says 🪽 FLY. Tap it: she crouches, leaps and flaps up above the trees.
   - In the air, steer with the joystick like walking. Hold ⬆️ to go higher and ⬇️ to go lower (Space / Shift on a keyboard).
     Let go of the joystick and she slows down and hovers in place.
   - 🛬 Land glides down to the nearest open patch of ground (never onto a roof or into a tree). "Hop off" in the air lands first.
   - She stays over the island (a gentle turn back at the edge) and rises over buildings and trees instead of going through them.
   How it looks: wing beats with a quick downstroke, flap-and-glide when cruising, legs tucked up, the body banks into turns,
   tips nose-up when climbing and nose-down when diving, and bobs a little with each wing beat. The rider leans with her.
   Friends online see it all: the 'ride' entry in 26c-friends-see.js sends fly:1 and uses flyPose() below. */
const FLYK={// hz: wing beats a second, amp: how far the wings swing, glide: how much of the cruise is gliding, spd: top speed
  pegacorn:{hz:2.2,amp:.6,base:.12,glide:.3,spd:12,tuckF:.9,tuckB:1.05},
  ptero:{hz:1.3,amp:.5,base:.04,glide:.75,spd:13,tuckF:1.15,tuckB:1.3},
  eagle:{hz:1.5,amp:.55,base:.1,glide:.85,spd:14,tuckF:1.25,tuckB:1.25},
  nova:{hz:1.55,amp:.58,base:.08,glide:.5,spd:12.5,tuckF:.85,tuckB:1.15}};
const flyK=k=>FLYK[k]||FLYK.nova;
const FLY_CRUISE=10,FLY_MAX=26,FLY_EDGE=R-4;// cruise height (the tallest trees are about 7.5), the ceiling, how far out you can go
const FLY={on:false,mode:'',t:0,hd:0,sp:0,vy:0,tgt:0,turn:0,landAt:0,hopOff:false,spot:null,spotT:0,edgeT:0,lowT:0,
  upBtn:false,downBtn:false,ph:0,flapW:1,glideT:0,flapsLeft:4,pitch:0,bank:0,tuck:0,open:0,lift:0,beatT:0,settle:0};
const isFlyer=a=>!!(a&&a.F&&a.F.fly);

/* ---------- what's below you: a height map of every building, tree and lamp on the island (made once) ---------- */
const FG={o:Math.ceil(R+4),h:null};
function flyGrid(){if(FG.h)return;const o=FG.o,n=o*2+1,h=new Float32Array(n*n);
  const skip=new Set([av.g,...FRIENDS.map(f=>f.g),...PETS.map(p=>p.g),...Object.values(FA).map(a=>a.g),...STARS.map(s=>s.m)]);
  const box=new THREE.Box3();scene.updateMatrixWorld(true);
  const walk=ob=>{if(skip.has(ob))return;
    if(ob.isMesh&&!ob.isInstancedMesh&&!ob.isSkinnedMesh&&ob.geometry){const gm=ob.geometry;if(!gm.boundingBox)gm.computeBoundingBox();box.copy(gm.boundingBox).applyMatrix4(ob.matrixWorld);
      // skip the ground and sea (huge and flat), things floating up in the sky, and flat things on the ground
      if(box.max.x-box.min.x<30&&box.max.z-box.min.z<30&&box.min.y<9&&box.max.y>.6){
        const x0=Math.max(0,Math.floor(box.min.x)+o),x1=Math.min(n-1,Math.ceil(box.max.x)+o),z0=Math.max(0,Math.floor(box.min.z)+o),z1=Math.min(n-1,Math.ceil(box.max.z)+o);
        for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const i=z*n+x;if(h[i]<box.max.y)h[i]=box.max.y;}}}
    for(const c of ob.children)walk(c);};
  walk(scene);FG.h=h;}
// the highest thing within about a wingspan of (x,z), or the ground
function flyFloor(x,z,rr=1){const g=groundAt(x,z);if(!FG.h)return Math.max(g,7.6);const o=FG.o,n=o*2+1,cx=Math.round(x)+o,cz=Math.round(z)+o;let m=g;
  for(let dz=-rr;dz<=rr;dz++)for(let dx=-rr;dx<=rr;dx++){const X=cx+dx,Z_=cz+dz;if(X<0||Z_<0||X>=n||Z_>=n)continue;const v=FG.h[Z_*n+X];if(v>m)m=v;}return m;}
const flyOpen=(x,z)=>flyFloor(x,z,2)<groundAt(x,z)+.5&&!obs.some(o=>o.r>0&&Math.hypot(o.x-x,o.z-z)<o.r+1);
// the nearest open patch of ground to land on
function flyLandSpot(x,z){if(flyOpen(x,z))return [x,z];
  for(let r=1.5;r<30;r+=1.5)for(let i=0;i<16;i++){const a=i/16*Math.PI*2+r,sx=x+Math.sin(a)*r,sz=z+Math.cos(a)*r;if(Math.hypot(sx,sz)<FLY_EDGE-1&&flyOpen(sx,sz))return [sx,sz];}
  return [x,z];}

/* ---------- take off, land ---------- */
function flyJump(){const a=barnRide;if(!isFlyer(a))return false;// a jump while on a flying ride is a take-off
  if(!FLY.on&&player.onGround&&performance.now()-FLY.landAt>600)flyStart();return true;}
function flyStart(){const a=barnRide;if(!isFlyer(a)||FLY.on)return;flyGrid();
  Object.assign(FLY,{on:true,mode:'crouch',t:0,hd:player.face,sp:Math.min(player.speed,6),vy:0,turn:0,hopOff:false,spot:null,glideT:0,flapsLeft:4,flapW:1,settle:0,lowT:0});
  player.onGround=false;player.vy=0;sfx('jump');a.speak(rnd(a.F.say));did('fly',a.k);
  if(!SAVE.flyTip){SAVE.flyTip=1;persist();setTimeout(()=>toast(isTouch?'Steer with the joystick. Hold ⬆️ to go higher, ⬇️ to go lower, and tap 🛬 Land to come down!':'Steer with W A S D. Hold Space to go higher, Shift to go lower, and press L to land!'),900);}}
function flyLand(hopOff){if(!FLY.on)return;if(FLY.mode!=='land'){FLY.mode='land';FLY.spot=null;FLY.spotT=0;}FLY.hopOff=FLY.hopOff||!!hopOff;}
// down on the ground again (snap: right now, e.g. when a game or the closet opens while you're up in the air)
function flyEnd(snap){if(!FLY.on)return;const p=player.pos;FLY.on=false;FLY.mode='';FLY.landAt=performance.now();
  if(snap){const [x,z]=flyLandSpot(p.x,p.z);p.x=x;p.z=z;FLY.tuck=0;FLY.open=0;FLY.pitch=FLY.bank=0;}
  p.y=groundAt(p.x,p.z);collide(p);player.vy=0;player.onGround=true;player.face=FLY.hd;FLY.settle=snap?0:.6;
  if(!snap&&barnRide){burst(new THREE.Vector3(p.x,p.y+.05,p.z),'#ffffff',16,1.4);tone(150,.18,'sine',.08,0,90);}
  if(snap)flyStraighten(barnRide);
  const hop=FLY.hopOff;FLY.hopOff=false;if(hop&&barnRide)stopRide();}
function flyStraighten(a){if(a){a.g.rotation.set(0,a.g.rotation.y,0);a.wingOpen=0;}av.g.rotation.set(0,av.g.rotation.y,0);}

/* ---------- every frame while flying (called from the game loop instead of walking) ---------- */
function flyStep(dt,ix,iy,mag){flyHud();if(!FLY.on)return false;const a=barnRide,p=player.pos;
  if(!isFlyer(a)){FLY.on=false;player.onGround=false;return false;}
  FLY.t+=dt;const K=flyK(a.k);
  const up=FLY.upBtn||keys.Space,down=FLY.downBtn||keys.ShiftLeft||keys.ShiftRight||keys.KeyC;
  if(keys.KeyL&&FLY.mode!=='land'&&FLY.mode!=='crouch')flyLand(false);
  // which way you want to go: the joystick, the same as walking (or toward the landing spot)
  let want=FLY.hd,wantSp=0;
  if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;want=Math.atan2((fx*-iy+rx*ix)/n,(fz*-iy+rz*ix)/n);wantSp=K.spd*mag;}
  if(FLY.mode==='crouch'||FLY.mode==='up')wantSp=Math.max(wantSp,2.5);// a take-off always carries you forward a little
  // landing: pick an open patch a little ahead (once), glide over to it and come down on it
  let spotD=99,toX=0,toZ=0;
  if(FLY.mode==='land'){if(mag>.08)FLY.spot=null;// steering while landing: a new spot is picked where you let go
    else{if(!FLY.spot)FLY.spot=flyLandSpot(p.x+Math.sin(FLY.hd)*FLY.sp*.7,p.z+Math.cos(FLY.hd)*FLY.sp*.7);
      const dx=FLY.spot[0]-p.x,dz=FLY.spot[1]-p.z;spotD=Math.hypot(dx,dz);if(spotD>.05){toX=dx/spotD;toZ=dz/spotD;}
      if(spotD>.3){want=Math.atan2(dx,dz);wantSp=Math.min(7,spotD*.8+.6);}}}
  // stay over the island: past the edge, turn gently back toward the middle
  const rr=Math.hypot(p.x,p.z);if(rr>FLY_EDGE-6){const inw=Math.atan2(-p.x,-p.z),k=Math.min(1,(rr-(FLY_EDGE-6))/6);
    if(Math.abs(angDamp(0,inw-FLY.hd,1))>Math.PI/2){want=angDamp(want,inw,k);if(wantSp<4)wantSp=4;}
    if(rr>FLY_EDGE-1&&performance.now()-FLY.edgeT>6000){FLY.edgeT=performance.now();toast('🌊 That\'s the edge of the island! Turning back ✨');}}
  // turn like a real flyer: a limited turn rate makes smooth curves, and speed builds up and dies down gently
  const dTurn=angDamp(0,want-FLY.hd,1),rate=(FLY.sp<3?3.4:2.3)*dt,step=Math.max(-rate,Math.min(rate,dTurn));
  if(wantSp>0){FLY.hd+=step;FLY.turn+=(step/dt-FLY.turn)*Math.min(1,dt*5);}else FLY.turn*=Math.max(0,1-dt*4);
  FLY.sp+=(wantSp*(Math.abs(dTurn)>2?.6:1)-FLY.sp)*Math.min(1,dt*(wantSp>FLY.sp?1.3:.8));
  let vx=Math.sin(FLY.hd)*FLY.sp,vz=Math.cos(FLY.hd)*FLY.sp;
  // close to the landing spot: slow right down and drift onto it (no overshooting and circling back)
  if(spotD<3.5){FLY.sp=Math.min(FLY.sp,spotD*1.6+.1);const k=Math.min(1,FLY.sp);vx=toX*FLY.sp*k+vx*(1-k)*.3;vz=toZ*FLY.sp*k+vz*(1-k)*.3;}
  // over buildings and trees: rise over them before you get there; never go through them
  let nx=p.x+vx*dt,nz=p.z+vz*dt;const nr=Math.hypot(nx,nz);if(nr>FLY_EDGE){nx*=FLY_EDGE/nr;nz*=FLY_EDGE/nr;}
  const below=flyFloor(nx,nz),ahead=Math.max(below,flyFloor(nx+vx*.8,nz+vz*.8),flyFloor(nx+vx*.35,nz+vz*.35));
  if(FLY.mode==='crouch'||p.y>=below-.15){p.x=nx;p.z=nz;}else{FLY.sp*=.6;}// a wall in front of you: stop and climb
  const g=groundAt(p.x,p.z),clear=ahead>g+.1?ahead+.45:g,under=below>g+.1?below+.45:g;
  // up and down
  if(FLY.mode==='crouch'){FLY.vy=0;if(FLY.t>.32){FLY.mode='up';FLY.vy=4.6;FLY.ph=Math.PI*.5;sfx('jump');}}
  else{
    if(FLY.mode==='up'){FLY.tgt=Math.max(g+FLY_CRUISE,clear+2.5);if(p.y>FLY.tgt-1.2)FLY.mode='fly';}
    else if(FLY.mode==='fly'){if(up)FLY.tgt+=5.5*dt;if(down)FLY.tgt-=5.5*dt;FLY.tgt=Math.min(FLY_MAX,Math.max(clear+.15,FLY.tgt,g));if(!up)FLY.tgt=Math.max(FLY.tgt,clear+.15);
      // coming all the way down with ⬇️ onto open ground lands you
      if(down&&p.y<g+.5&&clear<=g+.01){FLY.mode='land';FLY.spot=[p.x,p.z];}}
    if(FLY.mode==='land'){// a gentle slope down to the spot, staying above trees and roofs on the way
      FLY.tgt=Math.max(spotD<1.2?g:g+(spotD-1.2)*.6,spotD>3?clear:under);if(FLY.tgt>p.y&&FLY.tgt<p.y+.5)FLY.tgt=p.y;}
    const dy=FLY.tgt-p.y,landing=FLY.mode==='land'&&FLY.tgt===g,hg=p.y-g;
    let wantVy=Math.max(-4.5,Math.min(5.5,dy*1.6));
    if(landing)wantVy=-Math.max(.45,Math.min(3.2,hg*1.3));// flare: slower and slower as the ground comes up
    FLY.vy+=(wantVy-FLY.vy)*Math.min(1,dt*(FLY.mode==='up'?2:3));}
  // something tall coming up: climb over it smoothly
  if(p.y<clear&&FLY.mode!=='crouch'){const need=Math.min(6.5,(clear-p.y)*3+.5);if(FLY.vy<need)FLY.vy+=(need-FLY.vy)*Math.min(1,dt*6);}
  p.y+=FLY.vy*dt;
  if(p.y<g){p.y=g;}
  if(FLY.mode==='land'&&FLY.tgt===g&&p.y<=g+.03){flyEnd(false);return true;}
  // in the air for a long time below the treetops (stuck under a roof?): pop back up
  FLY.lowT=p.y<below-.2?FLY.lowT+dt:0;if(FLY.lowT>1.5){p.y=below+.5;FLY.lowT=0;}
  player.face=FLY.hd;player.speed=FLY.sp*.4;player.onGround=false;player.vy=0;
  flyHud();return true;}

/* ---------- how she looks in the air: wings, tucked legs, banking, bobbing (for you and for friends online) ---------- */
// st: FLY for you, or a small object per friend. It needs sp, vy, turn, mode and keeps its own wing beat, tilt and tuck.
function flyPose(a,A,P,yaw,st,dt,me){const K=flyK(a.k),air=st.mode&&st.mode!=='crouch';
  const climb=st.vy>.6||st.mode==='up',hover=st.sp<3.5,diving=st.vy<-1.2&&!hover;
  // flap hard to climb, take off and hover; flap-and-glide when cruising; glide when diving
  let wantFlap=1;
  if(!air)wantFlap=st.mode==='crouch'?0:1;
  else if(!climb&&!hover){if(diving)wantFlap=0;else{st.glideT-=dt;if(st.glideT<=0){if(st.flapsLeft>0)wantFlap=1;else{st.glideT=1.2+K.glide*2.2;st.flapsLeft=Math.max(2,Math.round(5-K.glide*4));}}else wantFlap=0;}}
  if(climb||hover)st.glideT=0;
  st.flapW+=(wantFlap-st.flapW)*Math.min(1,dt*(wantFlap?5:2.5));
  const effort=st.mode==='up'?1.35:climb?1.2:hover?1.1:1,prev=st.ph;
  st.ph+=dt*Math.PI*2*K.hz*effort*(1-.35*Math.cos(st.ph));// the downstroke is quicker than the upstroke, like real wings
  if(Math.floor((prev+Math.PI/2)/(Math.PI*2))!==Math.floor((st.ph+Math.PI/2)/(Math.PI*2))){// top of a wing beat: a downstroke starts
    if(st.flapsLeft>0&&wantFlap&&!climb&&!hover)st.flapsLeft--;
    if(me&&st.flapW>.5&&air)tone(120+Math.random()*20,.16,'sine',.05,0,70);}
  const s=Math.sin(st.ph),crouch=st.mode==='crouch'?Math.min(1,st.t/.3):0;
  const flapAng=K.base+K.amp*s*(climb?1.15:1),glideAng=K.base*.5+.06+Math.sin(st.t*2.7)*.025;
  let ang=glideAng+(flapAng-glideAng)*st.flapW;if(crouch)ang=K.base+.85*crouch;// wings up high, ready for the first big beat
  st.open+=((air||crouch?1:0)-st.open)*Math.min(1,dt*4);a.wingOpen=st.open;
  if(a.wings)for(const w of a.wings)w.w.rotation.z=w.sx*ang;
  // legs tuck up once you're off the ground, and come down again to land
  const gy=groundAt(P.x,P.z),hgt=P.y-gy,tuckWant=air?Math.max(0,Math.min(1,(hgt-.25)/1.1)):0;
  st.tuck+=(tuckWant-st.tuck)*Math.min(1,dt*4);
  if(st.tuck>.001)a.legs.forEach((l,i)=>{l.g.rotation.x+=st.tuck*(i<2?K.tuckF:K.tuckB);});
  a.graze=.3*st.tuck;// neck stretched forward
  // tilt: nose up when climbing (and to brake for a landing), nose down in a dive; lean into turns
  const brake=st.mode==='land'&&hgt<2.5?.25*(1-hgt/2.5):0;
  // (coming straight down slowly is a hover, not a dive, so she stays level and leans back a little to brake)
  const tip=Math.atan2(st.vy,Math.max(3,st.sp))*.75*(st.vy<0?Math.min(1,st.sp/6):1);
  const wantPitch=air?Math.max(-.4,Math.min(.38,tip+brake+(st.mode==='land'&&st.sp<3?.12:0))):-.12*crouch;
  const wantBank=air?Math.max(-.55,Math.min(.55,st.turn*Math.min(st.sp,12)*.075)):0;
  st.pitch+=(wantPitch-st.pitch)*Math.min(1,dt*3);st.bank+=(wantBank-st.bank)*Math.min(1,dt*3.5);
  // bob a little with each wing beat (up on the downstroke), and squat before the leap
  st.lift=air?-.06*s*st.flapW*(hover?1.4:1):-.12*crouch;
  // put it all together, turning around the saddle so you stay sitting on her back
  const ride=a.F.ride,e=a.g.rotation;e.order='YXZ';e.set(-st.pitch,yaw,-st.bank);
  const sx=P.x,sy=P.y+ride+st.lift,sz=P.z,v=tmpFly.set(0,-ride,0).applyEuler(e);
  a.pos.set(sx+v.x,sy+v.y,sz+v.z);a.g.position.copy(a.pos);
  if(A){const r=A.g.rotation;r.order='YXZ';r.set(-st.pitch,yaw,-st.bank);v.set(0,-.42,0).applyEuler(r);A.g.position.set(sx+v.x,sy+v.y,sz+v.z);}}
const tmpFly=new THREE.Vector3();

// your ride, every frame (from rideStep in 24d-barn.js); false = not flying, ride normally
function flyRide(a,dt){if(!isFlyer(a))return false;
  if(!FLY.on&&FLY.settle<=0&&!FLY.open&&!FLY.tuck){if(a.wingOpen){a.wingOpen=0;}return false;}
  if(!FLY.on){FLY.settle-=dt;FLY.mode='';FLY.sp=player.speed;FLY.vy=0;FLY.turn=0;if(FLY.settle<=0&&FLY.open<.02&&FLY.tuck<.02){FLY.open=FLY.tuck=0;flyStraighten(a);flyHud();return false;}}
  a.update(dt,FLY.on?0:player.speed*.55);
  flyPose(a,av,player.pos,player.face,FLY,dt,true);return true;}

/* ---------- buttons ---------- */
let flyHudS='';
function flyHud(){const a=barnRide,fl=isFlyer(a),s=!fl?'':FLY.on?(FLY.mode==='land'?'L':'F'):'G';if(s===flyHudS)return;flyHudS=s;
  $('#jump').textContent=s==='G'?'🪽 FLY':s?'⬆️ UP':'JUMP';$('#jump').classList.toggle('fly',!!s);
  $('#flyDown').style.display=s==='F'||s==='L'?'grid':'none';document.body.classList.toggle('flying',s==='F'||s==='L');// the moves wheel steps aside for ⬇️
  if(a)$('#rideBtn').textContent=s==='F'?'🛬 Land':s==='L'?'🛬 Landing…':`${a.F.e} Hop off`;}
$('#rideBtn').onclick=()=>{sfx('pop');if(FLY.on){flyLand(false);return;}stopRide();};
{const hold=(el,k)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();FLY[k]=true;});for(const t of ['pointerup','pointercancel','pointerleave'])el.addEventListener(t,()=>{FLY[k]=false;});};
  hold($('#jump'),'upBtn');hold($('#flyDown'),'downBtn');}
// the camera backs off a little when you're high up, so you can see the island below
function flyCamBack(){const a=barnRide;if(!FLY.on||!isFlyer(a))return 0;const p=player.pos;return 2.2*Math.max(0,Math.min(1,(p.y-groundAt(p.x,p.z))/8));}
