/* ================= 🦸 SECRET DADDY POWERS (temporary, for the family demo) =================
   Type your name as " Daddy" (with a SPACE in front) on the welcome screen or in Settings. The space is trimmed off, so
   the name tag just says "Daddy" and nobody can tell. Typed without the space, "Daddy" is a normal name with nothing extra.
   Then a 🦸 Hero button shows up in the icons on the right (only on that player's own phone). Tap it: lightning strikes
   and you change into a whole hero suit: a green bodysuit, gold boots, gloves and belt, an eye mask, a big purple cape and a
   hero badge (a gold star with a "D"; all made up, not anybody's real superhero). Your skateboard and anything else you
   were holding go away. Tap it again (or open the closet) and you're back in your own clothes. While the suit is on:
   - Super jump: JUMP goes way up, over the trees.
   - Fly without a ride: tap JUMP again while up in the air. Steer with the joystick (fast!), hold JUMP to go higher and ⬇️
     to go lower (Space / Shift on a keyboard). Hold ⬇️ all the way down to the ground to land.
   - Teleport: open the map and tap anywhere on the island, and you're there in a puff of sparkles.
   - Super strength: walk up to something small that never moves (a pumpkin, a rock, a flower pot) and a ✋ button shows up.
     Tap it to lift it over your head, and tap again to throw it. Things go back where they were when the game reloads.
   - ❄️ Freeze breath (button on the left, or F): blows icy breath at the closest person in front of you (family playing
     online, or a townsperson). They're stuck in a block of ice for 10 seconds: on their own phone they can't walk or jump.
   - 🤖 Giant robot (button on the left, or R): turn into a robot taller than the trees and ride in the glass dome on top.
     Walk with the joystick; it strides right over trees and roofs. Tap 🤖 again to climb out.
   - ⚡ Lightning landing (button on the left while flying, or Z): the quick way down. Lightning flashes and you shoot
     straight down to the ground like a bolt, landing with a thunder boom and a scorch mark. It doesn't hit anybody.
   - ✨ More powers (the ✨ button on the left opens a menu of them):
     🪢 Rope swing (or T): a rope shoots up and you swing forward and let go, flying through the air. Tap 🪢 again while in
        the air for the next swing. 🫧 Bubble trap: the closest person floats up in a big bubble for 6 seconds, then it pops.
     🐰 Bunny zap: they turn into a little bunny for 10 seconds (nobody close: you do). 🤏 Shrink ray: they go tiny for
        10 seconds (nobody close: you do). 👻 Ghost: you go see-through, and friends only see your footprints.
     🍬 Candy rain: sweets and little pumpkins rain down around you (walk over them to pop them). 👯 Triple Daddy: two more
        of you appear and copy everything you do. 🐾 Pet parade: the island's pets come running and follow you for 25
        seconds. 🌈 Rainbow trail behind you. 🌨️ Snow and 🎆 Fireworks night (for everybody in the room).
   The suit swaps your look while it's on (your own outfit waits in SAVE.daddyLook), so friends online see it too, and they
   see everything above through the entries pushed onto SHOW in this file. They get your position as usual, so they see
   Daddy jump sky-high, fly around and pop up somewhere else. They don't see the thing you carry.

   ALL OF IT IS IN THIS ONE FILE.
   TO TURN IT OFF: set DADDY_ENABLED to false just below, then run: node 3d/build.mjs
   TO REMOVE IT: take the suit off first, delete this file, then run: node 3d/build.mjs
   The few lines in other files that call into here (17-input.js, 25-game-loop.js, 26-map.js and ../seasons.js, marked
   "DADDY POWERS") go through window.__daddy, so they simply do nothing once this file is off or gone. */
const DADDY_ENABLED=false;
if(!DADDY_ENABLED&&SAVE.daddySuit){if(SAVE.daddyLook)SAVE.look=SAVE.daddyLook;delete SAVE.daddyLook;SAVE.daddySuit=0;persist();rebuildPlayer();}// turned off while suited up: your own clothes back
if(DADDY_ENABLED){
const DAD={fly:false,vx:0,vz:0,vy:0,tilt:0,tip:false,cands:null,near:null,held:null,thrown:[],scanT:0};
const DAD_KEY=/^\s+daddy\s*$/i;// a space (or more) in front of "Daddy"
const daddyKey=()=>!!SAVE.daddy&&/^daddy$/i.test(SAVE.name||'');// the secret name: the 🦸 button shows
const daddyOn=()=>daddyKey()&&!!SAVE.daddySuit;// suited up: the powers work
if(SAVE.daddySuit&&!SAVE.daddyLook)SAVE.daddySuit=0;// suited up in an older version that didn't swap clothes
// remember whether the name was typed with the secret space in front (before the game trims it off)
for(const id of ['#wname','#setName'])$(id).addEventListener('input',e=>{const on=DAD_KEY.test(e.target.value);if(!!SAVE.daddy!==on){SAVE.daddy=on?1:0;persist();}});

/* ---------- super jump, and take off ---------- */
function daddyJump(){if(daddyFrozen())return true;// frozen in ice: no jumping
  if(!daddyOn()||barnRide)return false;
  if(DAD.fly||DAD.robot||DAD.swing)return true;// up in the air already: holding JUMP climbs (in daddyFlyStep)
  if(player.onGround){player.vy=17;player.onGround=false;sfx('jump');burst(player.pos.clone().add(new THREE.Vector3(0,.1,0)),'#ffffff',18,1.6);return true;}
  daddyTakeOff();return true;}// a second tap in the air: fly
function daddyTakeOff(){flyGrid();DAD.fling=null;Object.assign(DAD,{fly:true,vx:0,vz:0,vy:Math.max(0,player.vy*.3)});player.vy=0;player.onGround=false;
  tone(520,.25,'triangle',.08,0,1040);$('#flyDown').style.display='grid';document.body.classList.add('flying');
  if(!DAD.tip){DAD.tip=true;toast(isTouch?'🦸 Hold JUMP to go up, ⬇️ to go down. Go all the way down to land.':'🦸 Hold Space to go up, Shift to go down. Go all the way down to land.');}}
function daddyLand(snap){if(!DAD.fly)return;const p=player.pos;DAD.fly=false;DAD.dive=false;
  $('#flyDown').style.display='none';document.body.classList.remove('flying');av.g.rotation.x=0;DAD.tilt=0;
  if(snap){collide(p);p.y=groundAt(p.x,p.z);player.vy=0;player.onGround=true;}
  else{player.vy=0;burst(new THREE.Vector3(p.x,p.y+.05,p.z),'#ffffff',14,1.3);}}

/* ---------- flying, every frame (from the game loop, instead of walking) ---------- */
function daddyFlyStep(dt,ix,iy,mag){if(DAD.robot)return robotStep(dt,ix,iy,mag);if(DAD.swing||DAD.fling)return ropeStep(dt,ix,iy,mag);if(!DAD.fly)return false;
  if(!daddyOn()||barnRide||closetOpen){daddyLand(true);return false;}
  const p=player.pos;
  if(DAD.dive){// ⚡ lightning landing: straight down, fast, then a strike where you land
    const g=groundAt(p.x,p.z);p.y-=45*dt;player.face=angDamp(player.face,player.face,1);av.g.rotation.order='YXZ';av.g.rotation.x=0;
    if(p.y<=g){p.y=g;DAD.dive=false;daddyLand(false);collide(p);p.y=groundAt(p.x,p.z);player.onGround=true;player.vy=0;
      strikeFx(p.x,p.z,true);DAD.stk={x:+p.x.toFixed(2),z:+p.z.toFixed(2),n:(DAD.stk?DAD.stk.n:0)+1,t:Date.now()};doAction('pose');return true;}
    player.speed=0;player.onGround=false;player.vy=0;return true;}
  const up=FLY.upBtn||keys.Space,down=FLY.downBtn||keys.ShiftLeft||keys.ShiftRight||keys.KeyC,top=30;
  let wx=0,wz=0;
  if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;
    wx=(fx*-iy+rx*ix)/n*top*mag;wz=(fz*-iy+rz*ix)/n*top*mag;player.face=angDamp(player.face,Math.atan2(wx,wz),Math.min(1,dt*6));}
  const k=Math.min(1,dt*2);DAD.vx+=(wx-DAD.vx)*k;DAD.vz+=(wz-DAD.vz)*k;DAD.vy+=((up?7:down?-7:0)-DAD.vy)*Math.min(1,dt*4);
  p.x+=DAD.vx*dt;p.z+=DAD.vz*dt;const r=Math.hypot(p.x,p.z),lim=R-1;if(r>lim){p.x*=lim/r;p.z*=lim/r;}
  p.y=Math.min(40,p.y+DAD.vy*dt);
  const g=groundAt(p.x,p.z),floor=flyFloor(p.x,p.z,0);if(p.y<floor)p.y=floor;// glide up over roofs and trees
  if(p.y<=g+.02&&down&&floor<=g+.01){p.y=g;daddyLand(false);player.onGround=true;return true;}
  if(down&&floor>g+.01&&p.y<=floor+.02){daddyLand(false);return true;}// on top of a roof or a tree: hop down from it
  const sp=Math.hypot(DAD.vx,DAD.vz);player.speed=sp*.4;player.onGround=false;player.vy=0;
  // lean forward like a superhero when going fast
  DAD.tilt+=(Math.min(1,sp/top)*1.1-DAD.tilt)*Math.min(1,dt*4);av.g.rotation.order='YXZ';av.g.rotation.x=DAD.tilt;
  return true;}

/* ---------- teleport: tap anywhere on the map ---------- */
function daddyTeleport(sx,sy){if(!daddyOn())return false;const S=mapCv.width,k=mapK();let wx=(sx-S/2)/k,wz=(sy-S/2)/k;
  const r=Math.hypot(wx,wz);if(r>R+3)return false;if(r>R-1.5){wx*=(R-1.5)/r;wz*=(R-1.5)/r;}
  const p=player.pos;burst(p.clone().add(new THREE.Vector3(0,1,0)),'#ffd23f',40,3);ropeStop();daddyLand(true);
  p.x=wx;p.z=wz;collide(p);p.y=groundAt(p.x,p.z);player.vy=0;player.onGround=true;cam.fv=null;
  closeMap();sfx('star');setTimeout(()=>burst(player.pos.clone().add(new THREE.Vector3(0,1,0)),'#ff8fc8',40,3),60);return true;}

/* ---------- super strength: pick up things that never move ---------- */
// Everything small sitting on the ground (made once, the first time it's needed). A thing can be more than one piece,
// like a pumpkin and its stem: pieces on top of it, in the same place, come along too.
function daddyCands(){if(DAD.cands)return DAD.cands;scene.updateMatrixWorld(true);
  const skip=new Set([av.g,...FRIENDS.map(f=>f.g),...PETS.map(p=>p.g),...Object.values(FA).map(a=>a.g),...ZA.map(a=>a.g),...STARS.map(s=>s.m),...PUSH.map(o=>o.m),beam]);
  const box=new THREE.Box3(),all=[];
  const walk=ob=>{if(skip.has(ob)||!ob.visible)return;
    if(ob.isMesh&&!ob.isInstancedMesh&&!ob.isSkinnedMesh&&ob.geometry){const gm=ob.geometry;if(!gm.boundingBox)gm.computeBoundingBox();
      box.copy(gm.boundingBox).applyMatrix4(ob.matrixWorld);const sx=box.max.x-box.min.x,sz=box.max.z-box.min.z,sy=box.max.y-box.min.y;
      if(Math.max(sx,sz)<1.8&&sy<1.8)all.push({m:ob,cx:(box.min.x+box.max.x)/2,cz:(box.min.z+box.max.z)/2,y0:box.min.y,y1:box.max.y,r:Math.max(sx,sz)/2,h:sy});}
    for(const c of ob.children)walk(c);};
  walk(scene);
  const out=[];
  for(const c of all){const g=groundAt(c.cx,c.cz);if(c.y0>g+.25||c.h<.18||c.r<.12)continue;// on the ground, and not flat
    c.parts=all.filter(o=>o!==c&&o.m.parent===c.m.parent&&Math.hypot(o.cx-c.cx,o.cz-c.cz)<c.r*.6&&o.y0>=c.y0+.05&&o.y0<=c.y1+.05).map(o=>o.m);
    out.push(c);}
  const taken=new Set(out.flatMap(c=>c.parts));return DAD.cands=out.filter(c=>!taken.has(c.m));}
const grabBtn=document.createElement('button');grabBtn.className='hud';grabBtn.id='dadGrab';grabBtn.textContent='✋';
grabBtn.style.cssText='left:calc(env(safe-area-inset-left) + 22px);bottom:calc(env(safe-area-inset-bottom) + 150px);width:64px;height:64px;border-radius:50%;display:none;place-items:center;font-size:28px;background:radial-gradient(circle at 35% 30%,#ffe7a8,#ffb347);border:3px solid rgba(255,255,255,.85);box-shadow:0 6px 18px rgba(255,179,71,.45);pointer-events:auto;touch-action:none';
document.body.appendChild(grabBtn);
grabBtn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();daddyGrab();});
addEventListener('keydown',e=>{if(e.target.tagName!=='INPUT'&&e.code==='KeyG')daddyGrab();});
function daddyGrab(){if(!daddyOn()||closetOpen)return;
  if(DAD.held){daddyThrow();return;}
  const c=DAD.near;if(!c)return;
  if(!c.g){// first time: gather its pieces into one group standing where it is
    const g=new THREE.Group();g.position.set(c.cx,c.y0,c.cz);scene.add(g);g.attach(c.m);c.parts.forEach(m=>g.attach(m));c.g=g;
    let bi=-1,bd=Math.max(.9,c.r+.3);obs.forEach((o,i)=>{const d=Math.hypot(o.x-c.cx,o.z-c.cz);if(o.r>0&&d<bd){bd=d;bi=i;}});c.ob=bi>=0?obs[bi]:null;}
  if(c.ob){const i=obs.indexOf(c.ob);if(i>=0)obs.splice(i,1);}
  DAD.thrown=DAD.thrown.filter(t=>t!==c);DAD.held=c;DAD.near=null;doAction('cheer');tone(200,.2,'sine',.1,0,420);}
function daddyThrow(){const c=DAD.held;if(!c)return;DAD.held=null;const f=player.face;
  c.vx=Math.sin(f)*8+DAD.vx;c.vz=Math.cos(f)*8+DAD.vz;c.vy=4.5;c.spin=(Math.random()<.5?-1:1)*(3+Math.random()*3);DAD.thrown.push(c);sfx('jump');}
onTick.push(dt=>{const on=daddyOn()&&started;
  if(!on&&DAD.held)daddyThrow();
  if(!on&&DAD.fly)daddyLand(true);
  const p=player.pos;
  // carrying it over your head
  if(DAD.held){const g=DAD.held.g;g.position.set(p.x,p.y+2.05+Math.sin(performance.now()/260)*.04,p.z);g.rotation.y=player.face;}
  // thrown things fly, bounce and settle back on the ground (and you bump into them again)
  for(const c of DAD.thrown){const g=c.g,q=g.position;q.x+=c.vx*dt;q.z+=c.vz*dt;c.vy-=18*dt;q.y+=c.vy*dt;g.rotation.y+=c.spin*dt;
    const rr=Math.hypot(q.x,q.z);if(rr>R-.5){q.x*=(R-.5)/rr;q.z*=(R-.5)/rr;c.vx*=-.4;c.vz*=-.4;}
    const gy=groundAt(q.x,q.z);if(q.y<=gy){q.y=gy;if(c.vy<-3){c.vy*=-.3;c.vx*=.5;c.vz*=.5;tone(140,.08,'sine',.1);}else{c.vy=0;c.vx*=.2;c.vz*=.2;c.spin*=.3;}}}
  DAD.thrown=DAD.thrown.filter(c=>{const q=c.g.position,done=q.y<=groundAt(q.x,q.z)+.001&&Math.hypot(c.vx,c.vz)<.3&&c.vy===0;
    if(done){c.cx=q.x;c.cz=q.z;if(c.ob){c.ob.x=q.x;c.ob.z=q.z;obs.push(c.ob);}}return !done;});
  // what's close enough to pick up (checked a few times a second)
  if(on&&!DAD.held&&!DAD.fly&&player.onGround&&!closetOpen&&(DAD.scanT-=dt)<=0){DAD.scanT=.25;let best=null,bd=1.6;
    for(const c of daddyCands()){if(DAD.thrown.includes(c))continue;const d=Math.hypot(c.cx-p.x,c.cz-p.z)-c.r;if(d<bd){bd=d;best=c;}}DAD.near=best;}
  if(!on||DAD.fly||closetOpen)DAD.near=null;
  const show=on&&!closetOpen&&(!!DAD.held||!!DAD.near);grabBtn.style.display=show?'grid':'none';grabBtn.textContent=DAD.held?'🤾':'✋';});
/* ---------- the hero suit: a cape and a badge (on you, and on your phone in friends' games) ---------- */
let dadBadgeMat=null;
function daddyBadge(){if(dadBadgeMat)return dadBadgeMat;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  x.beginPath();x.arc(128,128,122,0,Math.PI*2);x.fillStyle='#ffd23f';x.fill();x.beginPath();x.arc(128,128,106,0,Math.PI*2);x.fillStyle='#6a2bd8';x.fill();
  x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?40:96;x.lineTo(128+Math.cos(a)*r,132+Math.sin(a)*r);}x.closePath();
  x.fillStyle='#ffd23f';x.fill();x.lineWidth=6;x.strokeStyle='#3a1478';x.stroke();
  x.font='900 70px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#6a2bd8';x.fillText('D',128,140);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return dadBadgeMat=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.4,metalness:.2,polygonOffset:true,polygonOffsetFactor:-2});}
const HERO={suit:'#17a06b',gold:'#ffc83d',cape:'#7b35e8',mask:'#1c1533'};
const dadCapeMat=std(HERO.cape,{roughness:.5,side:THREE.DoubleSide}),dadGoldMat=std(HERO.gold,{roughness:.3,metalness:.6}),dadMaskMat=std(HERO.mask,{roughness:.35,side:THREE.DoubleSide});
// the hero suit, made from the closet's own pieces: a long-sleeved top and leggings in one color, and boots
function heroLook(L){const h=JSON.parse(JSON.stringify(L));
  Object.assign(h,{dress:null,top:{id:'sweater',c:HERO.suit},bottom:{id:'leggings',c:HERO.suit},shoes:{id:'boots',c:HERO.gold},hat:null,extras:{}});return h;}
// the extra hero bits on avatar a (cape, badge, mask, gloves, belt); returns what to take off again
function heroGear(a){const guy=!!a.guy,h={a,bits:[]},add=(m,parent)=>{parent.add(m);h.bits.push(m);return m;};
  const g=new THREE.PlaneGeometry(.66,1.08,8,12),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-Math.abs(x)*x*1.1);p.setX(i,x*(1+(.54-y)*.5));}g.translate(0,-.54,0);g.computeVertexNormals();
  h.cape=add(new THREE.Group(),a.spine);h.cape.position.set(0,.5,guy?-.135:-.12);const cm=new THREE.Mesh(g,dadCapeMat);cm.rotation.y=Math.PI;cm.castShadow=true;h.cape.add(cm);
  // a gold bar across the shoulders that the cape hangs from
  const bar=add(new THREE.Mesh(new THREE.CapsuleGeometry(.018,.2,4,10),dadGoldMat),a.spine);bar.position.set(0,.47,guy?-.1:-.09);bar.rotation.z=Math.PI/2;
  h.badge=add(new THREE.Mesh(new THREE.PlaneGeometry(.17,.17),daddyBadge()),a.spine);h.badge.position.set(0,.27,guy?.13:.118);
  const belt=add(new THREE.Mesh(new THREE.TorusGeometry(.128,.016,8,32),dadGoldMat),a.hips);belt.rotation.x=Math.PI/2;belt.position.y=.06;belt.scale.set(guy?1.12:1.05,.82,1);
  for(const A of a.arms){const gl=add(new THREE.Mesh(sph(.046,14,10),dadGoldMat),A.hand);gl.position.set(0,-.03,0);gl.scale.set(1,1.35,.8);
    add(new THREE.Mesh(cyl(.04,.05,.07,14),dadGoldMat),A.el).position.y=-.2;}
  // eye mask: a ring around each eye, a bridge between them, and a strap around the head
  const HS=a.hs||new THREE.Vector3(1,1,1);
  for(const sx of [-1,1]){const r=add(new THREE.Mesh(new THREE.TorusGeometry(.031,.012,8,24),dadMaskMat),a.head);r.position.set(sx*.046*HS.x,.01,.122*HS.z);r.scale.set(1.3,.95,.6);r.rotation.y=sx*.2;}
  add(new THREE.Mesh(box(.03,.016,.012),dadMaskMat),a.head).position.set(0,.016,.132*HS.z);
  const strap=add(new THREE.Mesh(new THREE.CylinderGeometry(.134,.134,.024,32,1,true,Math.PI*.4,Math.PI*1.2),dadMaskMat),a.head);strap.position.y=.012;strap.scale.set(HS.x*1.02,1,HS.z*1.02);
  return h;}
function heroOff(h){if(!h)return;for(const m of h.bits){m.parent&&m.parent.remove(m);m.traverse(o=>{if(o.geometry)o.geometry.dispose();});}}
// the cape flows out behind you when you run, jump or fly
const heroCape=(h,t,sp,air,fly)=>{h.cape.rotation.x=fly?1.3+Math.sin(t*9)*.08:.08+Math.min(sp,8)*.07+Math.sin(t*3)*.04+(air?.45:0);};
// flying like a superhero: one fist forward, the other arm along your side, legs together
// standing in the robot's dome: arms down, legs straight
function heroStandPose(a){a.arms.forEach((A,i)=>{A.sh.rotation.set(0,0,i?.12:-.12);A.el.rotation.x=-.2;});a.legs.forEach(l=>{l.hp.rotation.set(0,0,0);l.kn.rotation.x=0;});}
function heroFlyPose(a){const [L,Rt]=a.arms;Rt.sh.rotation.set(-2.95,0,-.08);Rt.el.rotation.x=0;L.sh.rotation.set(.25,0,-.12);L.el.rotation.x=-.15;
  a.legs[0].hp.rotation.set(.08,0,.03);a.legs[1].hp.rotation.set(.2,0,-.03);a.legs[0].kn.rotation.x=.05;a.legs[1].kn.rotation.x=.45;}
// ⚡ lightning strikes at (x,y,z): a jagged bolt from the sky, sparks, and thunder (flash: a white flash on your own screen)
function heroZap(x,y,z,flash){const pts=[new THREE.Vector3(x+(Math.random()-.5)*6,y+32,z+(Math.random()-.5)*6)];
  for(let i=1;i<=12;i++){const k=i/12,q=pts[0].clone().lerp(new THREE.Vector3(x,y+1.1,z),k);if(i<12){q.x+=(Math.random()-.5)*2*(1-k*.6);q.z+=(Math.random()-.5)*2*(1-k*.6);}pts.push(q);}
  const path=new THREE.CurvePath();for(let i=1;i<pts.length;i++)path.add(new THREE.LineCurve3(pts[i-1],pts[i]));
  const bolt=new THREE.Group(),core=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true}),glowM=new THREE.MeshBasicMaterial({color:'#9fd0ff',transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false});
  bolt.add(new THREE.Mesh(new THREE.TubeGeometry(path,96,.07,5),core),new THREE.Mesh(new THREE.TubeGeometry(path,96,.28,6),glowM));scene.add(bolt);
  let t=0;const fl=dt=>{t+=dt;bolt.visible=t<.12||t>.18&&t<.42;core.opacity=glowM.opacity=Math.max(0,1-t/.5);
    if(t>.5){scene.remove(bolt);bolt.traverse(o=>o.geometry&&o.geometry.dispose());core.dispose();glowM.dispose();onTick.splice(onTick.indexOf(fl),1);}};onTick.push(fl);
  burst(new THREE.Vector3(x,y+1,z),'#ffe066',40,3.2);burst(new THREE.Vector3(x,y+.1,z),'#9fd0ff',24,2);
  const d=Math.hypot(camera.position.x-x,camera.position.z-z),v=Math.max(.04,.22-d*.004);
  tone(1800,.12,'sawtooth',v*.5,0,200);tone(70,1.1,'sawtooth',v,.08,28);tone(48,1.4,'square',v*.6,.15,22);
  if(flash){const el=document.createElement('div');el.style.cssText='position:fixed;inset:0;background:#fff;z-index:50;pointer-events:none;opacity:.9;transition:opacity .45s';
    document.body.appendChild(el);requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.opacity=0;}));setTimeout(()=>el.remove(),600);}}
// the 🦸 Hero button next to the icons on the right (only there for the secret name)
const suitBtn=document.createElement('button');suitBtn.className='rb';suitBtn.id='dadSuit';suitBtn.setAttribute('aria-label','Hero');suitBtn.innerHTML='🦸<small>Hero</small>';suitBtn.style.display='none';// beside 📸 (below the row on a sideways phone), so the icons don't get pushed around
{const st=document.createElement('style');st.textContent='#dadSuit{position:absolute;top:0;right:70px}@media (max-height:520px){#dadSuit{top:62px;right:0}}';document.head.appendChild(st);}
$('#side').appendChild(suitBtn);
function suitUp(){const p=player.pos;DAD.suitN=Date.now();if(SK.on)stopSkate(true);if(BIKE.on)stopBike(true);if(barnRide)stopRide(true);
  heroZap(p.x,p.y,p.z,true);
  setTimeout(()=>{if(!SAVE.daddySuit){SAVE.daddyLook=SAVE.look;SAVE.look=heroLook(SAVE.look);}SAVE.daddySuit=1;persist();rebuildPlayer();doAction('cheer');toast('⚡ SUPER DADDY! ⚡');},180);}
// back in your own clothes (quiet: no sparkles, e.g. when the closet opens)
function suitOff(quiet){if(!SAVE.daddySuit)return;const p=player.pos;if(DAD.held)daddyThrow();ropeStop();daddyLand(true);robotOff();powersOff();
  if(SAVE.daddyLook)SAVE.look=SAVE.daddyLook;delete SAVE.daddyLook;SAVE.daddySuit=0;persist();rebuildPlayer();
  if(!quiet){burst(p.clone().add(new THREE.Vector3(0,1,0)),'#ff8fc8',30,2.5);sfx('pop');toast('Suit off. Just regular Daddy now 😎');}}
suitBtn.onclick=()=>{if(!daddyKey()||closetOpen)return;if(SAVE.daddySuit)suitOff();else suitUp();};
onTick.push(dt=>{if(SAVE.daddySuit&&(closetOpen||!daddyKey()))suitOff(true);// back in your own clothes to dress up, or for a new name
  const key=daddyKey()&&started,on=daddyOn()&&started;suitBtn.style.display=key?'grid':'none';
  if(on&&(!DAD.gear||DAD.gear.a!==av)){heroOff(DAD.gear);DAD.gear=heroGear(av);}
  else if(!on&&DAD.gear){heroOff(DAD.gear);DAD.gear=null;}
  if(DAD.gear){heroCape(DAD.gear,performance.now()/1000,player.speed,!player.onGround,DAD.fly);if(DAD.fly)heroFlyPose(av);if(DAD.robot)heroStandPose(av);}});
/* ---------- ❄️ freeze breath and ⚡ lightning strike (buttons on the left while suited up) ---------- */
// Both reach friends online through the 'hero' entry below: it carries a little note {to, n, t} for the latest freeze
// and {x, z, n, t} for the latest strike, and every phone in the room plays it once.
const FREEZE_S=10;
// tricks Daddy can play on someone: how long they last, whether you're stuck (can't walk or jump), and the color of the zap
const HIT={ice:{s:FREEZE_S,lock:1,col:'#dff7ff'},bub:{s:6,lock:1,col:'#cfefff'},bun:{s:10,col:'#ffd6ea'},tiny:{s:10,col:'#d9c2ff'}};
// who has a trick on them right now: 'kind|who' -> {k, who, g (their model), until, t}. who is 'me', 'net:<id>' or 'town:<name>'
DAD.fx=new Map();
let dadIceMat=null,dadBubMat=null,dadBunny=null;
const iceMat=()=>dadIceMat||(dadIceMat=new THREE.MeshPhysicalMaterial({color:'#bfeeff',transparent:true,opacity:.45,roughness:.08,clearcoat:1,depthWrite:false}));
const bubMat=()=>dadBubMat||(dadBubMat=new THREE.MeshStandardMaterial({color:'#dff4ff',emissive:'#a8dcff',emissiveIntensity:.35,transparent:true,opacity:.36,roughness:.05,metalness:.3,depthWrite:false}));
// a little white bunny, about knee high
function bunnyMesh(){if(!dadBunny)dadBunny={w:std('#fbf7f2',{roughness:.85}),pk:std('#ffb3c8',{roughness:.6}),k:std('#1c1420',{roughness:.3})};const M0=dadBunny,g=new THREE.Group(),S=(r,m,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(sph(r,16,12),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;g.add(o);return o;};
  S(.3,M0.w,0,.3,0,1,.9,1.15);S(.21,M0.w,0,.62,.22);S(.09,M0.w,0,.36,-.33);// body, head, fluffy tail
  for(const sx of [-1,1]){const e=S(.07,M0.w,sx*.09,.92,.2,.6,2.6,.5);e.rotation.z=-sx*.18;S(.05,M0.pk,sx*.09,.92,.235,.4,2.1,.25).rotation.z=-sx*.18;
    S(.032,M0.k,sx*.085,.66,.4);S(.08,M0.w,sx*.16,.07,.2,1,.6,1.4);}// ears, eyes, feet
  S(.03,M0.pk,0,.6,.43);return g;}
const fxG=who=>{if(who==='me')return av.g;if(who.startsWith('net:')){const net=window.__net,o=net&&net.friends&&net.friends().get(who.slice(4));return o&&o.a&&o.a.g;}
  if(who.startsWith('town:')){const f=FRIENDS.find(f=>f.name===who.slice(5));return f&&f.g;}return null;};
function fxBuild(c){const g=c.g;
  if(c.k==='ice'){c.m=new THREE.Mesh(new THREE.BoxGeometry(.95,2.05,.95),iceMat());c.m.position.y=1.0;g.add(c.m);}
  if(c.k==='bub'){c.m=new THREE.Mesh(sph(1.15,32,24),bubMat());c.m.position.y=.95;g.add(c.m);// a bubble, with a shiny spot and a pink rim
    const shine=new THREE.Mesh(sph(.16,12,10),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.85,depthWrite:false}));shine.position.set(-.5,.55,.75);shine.scale.set(1,.6,.4);c.m.add(shine);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(1.13,.035,8,48),new THREE.MeshBasicMaterial({color:'#ffb3e6',transparent:true,opacity:.55,depthWrite:false}));c.m.add(rim);c.rim=rim;}
  if(c.k==='bun'){c.hid=g.children.filter(o=>o.visible&&!o.userData.dadFx);c.hid.forEach(o=>o.visible=false);c.m=bunnyMesh();g.add(c.m);}
  if(c.k==='tiny')c.s0=g.scale.clone();
  if(c.m)c.m.userData.dadFx=1;}
function fxUnbuild(c){if(c.m){c.m.parent&&c.m.parent.remove(c.m);c.m.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material!==dadIceMat&&o.material!==dadBubMat&&!(dadBunny&&Object.values(dadBunny).includes(o.material)))o.material.dispose();});c.m=null;}
  if(c.hid){c.hid.forEach(o=>o.visible=true);c.hid=null;}if(c.s0){c.g.scale.copy(c.s0);c.s0=null;}}
function fxOn(k,who){const key=k+'|'+who;if(DAD.fx.has(key))fxOff(key,true);const g=fxG(who);if(!g)return;
  const c={k,who,g,until:performance.now()+HIT[k].s*1000,t:0};DAD.fx.set(key,c);fxBuild(c);
  const p=g.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1,0));burst(p,HIT[k].col,36,2.4);
  if(k==='ice'){tone(1400,.35,'sine',.07,0,600);tone(900,.5,'triangle',.05,.05,300);}
  else if(k==='bub'){tone(500,.4,'sine',.06,0,1200);tone(800,.3,'sine',.04,.1,1600);}
  else if(k==='bun'){[660,880,1320].forEach((f,i)=>tone(f,.12,'triangle',.06,i*.07));}
  else{tone(1600,.5,'sine',.06,0,300);}
  if(who==='me')toast({ice:'❄️ Frozen in ice!',bub:'🫧 You\'re stuck in a bubble!',bun:'🐰 You\'re a bunny!',tiny:'🤏 You\'re tiny!'}[k]);}
function fxOff(key,quiet){const c=DAD.fx.get(key);if(!c)return;DAD.fx.delete(key);fxUnbuild(c);if(quiet)return;
  const p=c.g.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,1,0));
  if(c.k==='ice'){burst(p,'#8fd8ff',40,3.2);tone(500,.15,'triangle',.06,0,900);}
  else if(c.k==='bub'){burst(p.add(new THREE.Vector3(0,c.lift||0,0)),'#ffffff',50,3.5);tone(900,.08,'square',.05,0,200);}
  else{burst(p,HIT[c.k].col,30,2.5);tone(700,.2,'triangle',.05,0,1100);}
  if(c.who==='me')toast({ice:'💧 You thawed out!',bub:'💥 Pop!',bun:'You\'re you again!',tiny:'Back to normal size!'}[c.k]);}
// a puff of icy breath (or magic sparkles) from (a) toward (b)
function breathFx(a,b,col='#dff7ff'){let t=0;const from=a.clone().add(new THREE.Vector3(0,1.5,0)),to=b.clone().add(new THREE.Vector3(0,1,0));tone(300,.7,'sawtooth',.03,0,120);
  const fn=dt=>{t+=dt;const k=Math.min(1,t/.6);burst(from.clone().lerp(to,k),col,8,.6,.22);if(t>.6)onTick.splice(onTick.indexOf(fn),1);};onTick.push(fn);}
// am I stuck (on my own phone)? Then the joystick and JUMP do nothing (through window.__daddy in 17-input.js and 25-game-loop.js)
const daddyFrozen=()=>{for(const c of DAD.fx.values())if(c.who==='me'&&HIT[c.k].lock)return true;return false;};
const myNetId=()=>{const n=window.__net;return n&&n.id?n.id():null;};
// everyone Daddy could play a trick on: family online, and the townspeople
function freezeTargets(){const out=[];const net=window.__net;
  if(net&&net.friends)for(const [id,o] of net.friends())out.push({key:'net:'+id,id,pos:o.pos,g:()=>o.a.g});
  for(const f of FRIENDS)out.push({key:'town:'+f.name,town:f,pos:f.pos,g:()=>f.g});return out;}
// play trick k on the closest person in front of you (Bunny and Shrink work on you when nobody is close)
function daddyZap(k){const p=player.pos,fx=Math.sin(player.face),fz=Math.cos(player.face);let best=null,bs=1e9;
  for(const t of freezeTargets()){const dx=t.pos.x-p.x,dz=t.pos.z-p.z,d=Math.hypot(dx,dz);if(d>10||d<.1)continue;
    const ahead=(dx*fx+dz*fz)/d,score=d*(ahead>.4?1:2.5);if(ahead<-.2&&d>3)continue;if(score<bs){bs=score;best=t;}}
  const note=to=>{if(to)DAD.frz={to,k,n:(DAD.frz?DAD.frz.n:0)+1,t:Date.now()};};
  if(!best&&(k==='bun'||k==='tiny')){burst(p.clone().add(new THREE.Vector3(0,1,0)),HIT[k].col,40,3);fxOn(k,'me');note(myNetId());return;}
  const tgt=best?best.pos:p.clone().add(new THREE.Vector3(fx*5,0,fz*5));breathFx(p,tgt,HIT[k].col);doAction(k==='ice'?'kiss':'cheer');
  if(!best){toast('Nobody close enough. Walk up to someone first!');return;}
  if(best.town&&HIT[k].lock){best.town.tgt=null;best.town.wait=HIT[k].s;}
  setTimeout(()=>fxOn(k,best.key),450);note(best.id);}
const daddyFreeze=()=>daddyZap('ice');
// ⚡ shoot straight down to the ground like a lightning bolt (only while flying; daddyFlyStep does the fall)
function daddyStrike(){if(!DAD.fly||DAD.dive)return;const p=player.pos;DAD.dive=true;DAD.vx=DAD.vz=0;
  heroZap(p.x,p.y-1.1+.2,p.z,true);tone(1800,.2,'sawtooth',.05,0,300);}
// where you hit the ground: a bolt, a shock ring and a scorch mark (on your phone, and on friends' phones from the note)
function strikeFx(x,z,flash){const g=groundAt(x,z);
  heroZap(x,g-1.1,z,flash);burst(new THREE.Vector3(x,g+.2,z),'#ffe066',60,5);
  const mark=new THREE.Mesh(new THREE.CircleGeometry(1.3,28),new THREE.MeshBasicMaterial({color:'#1a1410',transparent:true,opacity:.7,depthWrite:false}));
  mark.rotation.x=-Math.PI/2;mark.position.set(x,g+.03,z);scene.add(mark);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),new THREE.MeshBasicMaterial({color:'#fff6b0',transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.set(x,g+.06,z);scene.add(ring);
  let t=0;const fn=dt=>{t+=dt;ring.scale.setScalar(1+t*9);ring.material.opacity=Math.max(0,.9-t*1.8);mark.material.opacity=Math.max(0,.7*(1-t/6));
    if(t>6){for(const m of [mark,ring]){scene.remove(m);m.geometry.dispose();m.material.dispose();}onTick.splice(onTick.indexOf(fn),1);}};onTick.push(fn);}
// the two buttons
const mkPower=(id,txt,bottom,bg,fn,left=22)=>{const b=document.createElement('button');b.className='hud';b.id=id;b.textContent=txt;
  b.style.cssText=`left:calc(env(safe-area-inset-left) + ${left}px);bottom:calc(env(safe-area-inset-bottom) + ${bottom}px);width:64px;height:64px;border-radius:50%;display:none;place-items:center;font-size:28px;background:${bg};border:3px solid rgba(255,255,255,.85);box-shadow:0 6px 18px rgba(59,35,87,.3);pointer-events:auto;touch-action:none`;
  document.body.appendChild(b);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(daddyOn()&&!closetOpen)fn();});return b;};
const freezeBtn=mkPower('dadFreeze','❄️',230,'radial-gradient(circle at 35% 30%,#e8fbff,#7fd3ff)',daddyFreeze);
const strikeBtn=mkPower('dadStrike','⚡',230,'radial-gradient(circle at 35% 30%,#fff3b0,#ffc83d)',daddyStrike,170);
/* ---------- 🤖 giant robot: taller than the trees, for striding across the island ---------- */
// An original robot (green and gold, with Daddy's star badge on its chest). You ride in the glass dome on top,
// so the camera rides up there with you. It steps right over trees, fences and roofs. Tap 🤖 again to climb out.
const ROBOT_SEAT=9.75,ROBOT_SPEED=11,ROBOT_STRIDE=2.6;
function makeRobot(){const R0=new THREE.Group(),body=new THREE.Group();R0.add(body);
  const green=std('#17a06b',{roughness:.35,metalness:.55}),dark=std('#0f5c43',{roughness:.5,metalness:.4}),gold=std(HERO.gold,{roughness:.25,metalness:.75}),
    purple=std(HERO.cape,{roughness:.4,metalness:.3}),eye=new THREE.MeshBasicMaterial({color:'#7ff7ff'}),
    glass=new THREE.MeshPhysicalMaterial({color:'#cdf6ff',transparent:true,opacity:.28,roughness:.05,clearcoat:1,depthWrite:false,side:THREE.DoubleSide});
  const B=(w,h,d,m,x,y,z,parent)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;};
  const legs=[],arms=[];
  for(const sx of [-1,1]){const hip=new THREE.Group();hip.position.set(sx*1.15,5.6,0);body.add(hip);
    B(1.15,2.6,1.15,green,0,-1.3,0,hip);B(1.3,.5,1.3,gold,0,-2.6,0,hip);
    const knee=new THREE.Group();knee.position.y=-2.6;hip.add(knee);B(.95,2.4,.95,dark,0,-1.25,0,knee);
    B(1.3,.6,2.1,purple,0,-2.7,.3,knee);B(1.32,.18,2.12,gold,0,-2.36,.3,knee);legs.push({hip,knee});}
  B(3.2,1.1,1.9,dark,0,5.9,0,body);
  B(4.2,3.4,2.5,green,0,8.1,0,body);B(4.3,.35,2.6,gold,0,6.55,0,body);B(4.3,.35,2.6,gold,0,9.7,0,body);
  const badge=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),daddyBadge());badge.position.set(0,7.9,1.26);body.add(badge);
  for(const sx of [-1,1])B(.42,.22,.05,eye,sx*.9,9.2,1.27,body);
  // ride-in dome, a gold ring around it, and an antenna
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1.25,28,18,0,Math.PI*2,0,Math.PI*.55),glass);dome.position.y=9.85;body.add(dome);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,.12,10,32),gold);ring.rotation.x=Math.PI/2;ring.position.y=9.88;body.add(ring);
  B(.08,1.2,.08,gold,.7,11.4,-.3,body);const tip=new THREE.Mesh(sph(.16,12,10),new THREE.MeshBasicMaterial({color:'#ff3b6b'}));tip.position.set(.7,12.05,-.3);body.add(tip);
  for(const sx of [-1,1]){const sh=new THREE.Group();sh.position.set(sx*2.55,9.1,0);body.add(sh);
    const ball=new THREE.Mesh(sph(.85,18,14),gold);ball.castShadow=true;sh.add(ball);
    B(.85,2.5,.85,green,sx*.15,-1.4,0,sh);const el=new THREE.Group();el.position.set(sx*.15,-2.7,0);sh.add(el);
    B(.75,2.2,.75,dark,0,-1.1,0,el);B(1,1,1,purple,0,-2.6,0,el);arms.push({sh,el});}
  return {g:R0,body,legs,arms,ph:0,stepN:0,tip,grow:0};}
// walking: legs and arms swing with the distance walked; a thump and a puff of dust on each step
function robotPose(r,dist,dt,me){r.ph+=dist/ROBOT_STRIDE*Math.PI;const s=Math.sin(r.ph),moving=dist>.002;
  r.amp=(r.amp||0)+((moving?1:0)-(r.amp||0))*Math.min(1,dt*6);const a=r.amp;
  r.legs[0].hip.rotation.x=s*.45*a;r.legs[1].hip.rotation.x=-s*.45*a;r.legs[0].knee.rotation.x=Math.max(0,-s)*.7*a;r.legs[1].knee.rotation.x=Math.max(0,s)*.7*a;
  r.arms[0].sh.rotation.x=-s*.35*a;r.arms[1].sh.rotation.x=s*.35*a;r.arms[0].el.rotation.x=-.3*a;r.arms[1].el.rotation.x=-.3*a;
  r.body.position.y=Math.abs(Math.cos(r.ph))*.18*a;r.tip.material.color.setHSL(.95,1,.5+.2*Math.sin(performance.now()/150));
  const n=Math.floor((r.ph+Math.PI/2)/Math.PI);if(moving&&n!==r.stepN){r.stepN=n;const side=n%2?1:-1,f=r.g.rotation.y,x=r.g.position.x+Math.cos(f)*side*1.15,z=r.g.position.z-Math.sin(f)*side*1.15;
    burst(new THREE.Vector3(x,groundAt(x,z)+.1,z),'#d9c9a8',12,2,.35);const d=Math.hypot(camera.position.x-x,camera.position.z-z);tone(55,.25,'sine',Math.max(.02,(me?.16:.12)-d*.003),0,35);}
  if(r.grow<1){r.grow=Math.min(1,r.grow+dt*1.6);const k=1-Math.pow(1-r.grow,3);r.g.scale.setScalar(Math.max(.01,k));}}
function robotOn(){if(DAD.robot||!daddyOn())return;ropeStop();daddyLand(true);if(DAD.held)daddyThrow();
  const r=makeRobot(),p=player.pos;r.g.position.set(p.x,groundAt(p.x,p.z),p.z);r.g.rotation.y=player.face;r.g.scale.setScalar(.01);scene.add(r.g);
  DAD.robot=r;DAD.camDist=cam.dist;cam.dist=Math.max(cam.dist,12);DAD.rbt=Date.now();
  burst(p.clone().add(new THREE.Vector3(0,1,0)),'#7ff7ff',60,4);[220,330,440,660].forEach((f,i)=>tone(f,.18,'square',.05,i*.12));toast('🤖 ROBO-DADDY, ACTIVATE!');}
function robotOff(){const r=DAD.robot;if(!r)return;DAD.robot=null;scene.remove(r.g);r.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});
  const p=player.pos;collide(p);p.y=groundAt(p.x,p.z);player.vy=0;player.onGround=true;cam.dist=DAD.camDist||cam.dist;
  burst(p.clone().add(new THREE.Vector3(0,1,0)),'#7ff7ff',50,3);[660,440,330,220].forEach((f,i)=>tone(f,.15,'square',.04,i*.1));}
// every frame in the robot (from daddyFlyStep, instead of walking)
function robotStep(dt,ix,iy,mag){const r=DAD.robot,p=player.pos;if(!daddyOn()||closetOpen||barnRide){robotOff();return false;}
  const ox=p.x,oz=p.z;
  if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1,mx=(fx*-iy+rx*ix)/n,mz=(fz*-iy+rz*ix)/n,sp=ROBOT_SPEED*mag*(r.grow<1?0:1);
    p.x+=mx*sp*dt;p.z+=mz*sp*dt;player.face=angDamp(player.face,Math.atan2(mx,mz),Math.min(1,dt*5));}
  const rr=Math.hypot(p.x,p.z),lim=R-1.5;if(rr>lim){p.x*=lim/rr;p.z*=lim/rr;}
  const g=groundAt(p.x,p.z);r.g.position.set(p.x,g,p.z);r.g.rotation.y=player.face;p.y=g+ROBOT_SEAT*r.g.scale.y+r.body.position.y;
  robotPose(r,Math.hypot(p.x-ox,p.z-oz),dt,true);
  player.speed=0;player.vy=0;player.onGround=false;return true;}
const robotBtn=mkPower('dadRobot','🤖',230,'radial-gradient(circle at 35% 30%,#d9fff0,#3ccf95)',()=>DAD.robot?robotOff():robotOn(),96);// (a row: ❄️ 🤖 ⚡, with ✋ below)
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||!daddyOn()||closetOpen)return;if(e.code==='KeyF')daddyFreeze();if(e.code==='KeyZ')daddyStrike();if(e.code==='KeyR')DAD.robot?robotOff():robotOn();});
let frozenToastT=0;
onTick.push(dt=>{const on=daddyOn()&&started&&!closetOpen;freezeBtn.style.display=robotBtn.style.display=on?'grid':'none';robotBtn.textContent=DAD.robot?'🚪':'🤖';strikeBtn.style.display=on&&DAD.fly&&!DAD.dive?'grid':'none';
  const now=performance.now();
  for(const [key,c] of [...DAD.fx]){if(now>c.until){fxOff(key);continue;}
    const g=fxG(c.who);if(!g){fxOff(key,true);continue;}
    if(g!==c.g){fxUnbuild(c);c.g=g;fxBuild(c);}// their model was rebuilt (new clothes): move the trick over
    c.t+=dt;const me=c.who==='me',town=c.who.startsWith('town:')&&FRIENDS.find(f=>f.name===c.who.slice(5));
    if(c.k==='bub'){c.lift=Math.min(1,c.t/1.2)*2.6;const w=1+Math.sin(c.t*5)*.04;c.m.scale.set(w,2-w,w);c.rim.quaternion.copy(camera.quaternion);
      if(me){const p=player.pos;p.y=groundAt(p.x,p.z)+c.lift;player.vy=0;player.onGround=false;av.g.position.y=p.y;}
      else if(town)g.position.y+=c.lift;}// (friends online float up on their own phone, and we get their position)
    if(c.k==='bun'){c.hid.forEach(o=>o.visible=false);const w=g.getWorldPosition(new THREE.Vector3()),mv=c.lp?Math.hypot(w.x-c.lp.x,w.z-c.lp.z)/Math.max(dt,1e-3):0;c.lp=w;
      c.hop=(c.hop||0)+dt*(mv>.5?11:0);c.m.position.y=Math.abs(Math.sin(c.hop))*.22;c.m.rotation.x=mv>.5?-.15:0;}
    if(c.k==='tiny'){const k=Math.min(1,c.t/.35),e=Math.min(1,(c.until-now)/350);g.scale.copy(c.s0).multiplyScalar(1-.68*k*e);}}
  if(daddyFrozen()&&(frozenToastT-=dt)<=0){frozenToastT=1;let c=null;for(const v of DAD.fx.values())if(v.who==='me'&&HIT[v.k].lock)c=v;
    const s=Math.ceil((c.until-now)/1000);toast(c.k==='bub'?`🫧 In a bubble! ${s}…`:`❄️ Frozen! ${s}…`);}});
// a freeze or strike that Daddy (friend f) sent, played once on this phone
function heroNotes(f,d){const P=f.pos,fresh=n=>n&&Math.abs(Date.now()-(+n.t||0))<6000;
  if(fresh(d.f)&&d.f.n!==f.heroF){f.heroF=d.f.n;const k=HIT[d.f.k]?d.f.k:'ice',net=window.__net,mine=net&&net.id&&d.f.to===net.id();
    const o=!mine&&net&&net.friends().get(d.f.to),tp=mine?player.pos:o?o.pos:null;
    if(tp){if(o!==f)breathFx(P,tp,HIT[k].col);setTimeout(()=>{if(mine){fxOn(k,'me');if(HIT[k].lock)player.vy=0;}else if(o)fxOn(k,'net:'+d.f.to);},o===f?0:450);}}
  if(fresh(d.s)&&d.s.n!==f.heroS){f.heroS=d.s.n;strikeFx(+d.s.x||0,+d.s.z||0,false);}
  if(fresh(d.c)&&d.c.n!==f.heroC){f.heroC=d.c.n;candyRain(+d.c.x||0,+d.c.z||0);}
  if(fresh(d.p)&&d.p.n!==f.heroP){f.heroP=d.p.n;paradeGo(()=>f.pos);}}
// friends online see the suit, and the lightning when you put it on
SHOW.push({k:'hero',
  mine(){return daddyOn()?{z:DAD.suitN||0,f:DAD.frz||null,s:DAD.stk||null,c:DAD.candy||null,p:DAD.par||null,r:DAD.robot?DAD.rbt:0}:null;},
  // (any change here takes the suit off and puts it on again on friends' phones, so the lightning only plays for a new suit-up)
  on(f,d){const P=f.pos;if(d.z!==f.heroZ){if(f.heroZ!==undefined||Math.abs(Date.now()-(+d.z||0))<6000)heroZap(P.x,P.y,P.z,false);f.heroZ=d.z;}
    heroNotes(f,d);const h={gear:heroGear(f.a),a:f.a};
    if(d.r){h.robot=makeRobot();if(Math.abs(Date.now()-(+d.r||0))>3000)h.robot.grow=1;h.robot.g.position.set(f.pos.x,groundAt(f.pos.x,f.pos.z),f.pos.z);h.robot.g.rotation.y=f.cur??f.face;scene.add(h.robot.g);h.rp=f.pos.clone();}
    return h;},
  step(f,d,dt,h){if(!h)return;if(h.a!==f.a){heroOff(h.gear);h.gear=heroGear(f.a);h.a=f.a;}
    if(h.robot){const r=h.robot,P=f.pos;r.g.position.set(P.x,groundAt(P.x,P.z),P.z);r.g.rotation.y=f.cur??f.face;robotPose(r,Math.hypot(P.x-h.rp.x,P.z-h.rp.z),dt,false);h.rp.copy(P);
      heroCape(h.gear,performance.now()/1000,0,false,false);heroStandPose(f.a);return;}// riding in the robot, not flying
    const fly=!!f.air&&f.pos.y-groundAt(f.pos.x,f.pos.z)>2.5,r=f.a.g.rotation;// way up in the air: flying like a superhero
    h.tilt=(h.tilt||0)+((fly?Math.min(1,(f.sp||0)/10)*1.1:0)-(h.tilt||0))*Math.min(1,dt*4);r.order='YXZ';r.x=h.tilt;
    heroCape(h.gear,performance.now()/1000,f.sp||0,!!f.air,fly);if(fly)heroFlyPose(f.a);},
  off(f,h){if(!h)return;heroOff(h.gear);if(h.robot){scene.remove(h.robot.g);h.robot.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});}if(h.a)h.a.g.rotation.x=0;}});

/* ---------- 🪢 rope swing ---------- */
// A rope shoots up ahead of you and you swing forward on it like a pendulum, then let go at the top and sail through the air.
// Tap 🪢 again while sailing for the next swing (or while swinging to let go early). ropeStep runs instead of walking.
const ROPE_L=11,ROPE_G=22,ROPE_UP=new THREE.Vector3(0,1,0);
function ropeGo(){if(DAD.robot||daddyFrozen()||!daddyOn())return;if(DAD.swing){ropeLet();return;}
  const p=player.pos,air=!player.onGround||!!DAD.fling||DAD.fly;if(DAD.fly)daddyLand(false);DAD.fling=null;
  if(SK.on)stopSkate(true);if(BIKE.on)stopBike(true);if(barnRide)return;
  const dx=Math.sin(player.face),dz=Math.cos(player.face),ang=air?-.75:-.35,L=ROPE_L;
  DAD.swing={L,ang,av:air?1.4:1.9,dx,dz,ax:p.x-dx*L*Math.sin(ang),az:p.z-dz*L*Math.sin(ang),ay:p.y+L*Math.cos(ang),n:Date.now()};
  player.onGround=false;player.vy=0;tone(900,.18,'triangle',.06,0,300);tone(300,.5,'sine',.05,.05,700);
  if(!DAD.ropeTip){DAD.ropeTip=1;toast('🪢 Wheee! Tap 🪢 again in the air for the next swing.');}}
function ropeLet(){const s=DAD.swing;if(!s)return;DAD.swing=null;const v=s.av*s.L*1.1,h=v*Math.cos(s.ang);
  DAD.fling={vx:s.dx*h,vz:s.dz*h};player.vy=Math.max(4,v*Math.sin(s.ang)+2);av.g.rotation.x=0;tone(500,.35,'sine',.07,0,1300);}
function ropeStop(){if(DAD.swing||DAD.fling){DAD.swing=null;DAD.fling=null;av.g.rotation.x=0;}}
function ropeStep(dt,ix,iy,mag){const p=player.pos;if(!daddyOn()||barnRide||closetOpen){ropeStop();return false;}
  const lim=R-1,keep=()=>{const r=Math.hypot(p.x,p.z);if(r>lim){p.x*=lim/r;p.z*=lim/r;}};
  if(DAD.swing){const s=DAD.swing;s.av-=ROPE_G/s.L*Math.sin(s.ang)*dt;s.ang+=s.av*dt;const k=s.L*Math.sin(s.ang);
    p.x=s.ax+s.dx*k;p.z=s.az+s.dz*k;keep();p.y=Math.max(s.ay-s.L*Math.cos(s.ang),groundAt(p.x,p.z)+.1);
    player.face=angDamp(player.face,Math.atan2(s.dx,s.dz),Math.min(1,dt*8));player.speed=0;player.vy=0;player.onGround=false;
    if(s.ang>.95||(s.av<=0&&s.ang>0))ropeLet();return true;}
  const F=DAD.fling;
  if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;F.vx+=(fx*-iy+rx*ix)/n*mag*8*dt;F.vz+=(fz*-iy+rz*ix)/n*mag*8*dt;}
  p.x+=F.vx*dt;p.z+=F.vz*dt;keep();player.vy-=18*dt;p.y+=player.vy*dt;
  const sp=Math.hypot(F.vx,F.vz);if(sp>.5)player.face=angDamp(player.face,Math.atan2(F.vx,F.vz),Math.min(1,dt*6));
  const g=groundAt(p.x,p.z);
  if(p.y<=g&&player.vy<0){DAD.fling=null;collide(p);p.y=groundAt(p.x,p.z);player.vy=0;player.onGround=true;burst(new THREE.Vector3(p.x,p.y+.05,p.z),'#ffffff',14,1.4);return true;}
  player.onGround=false;player.speed=sp*.3;return true;}
// the rope itself: from your hand up to a shiny gold hook in the sky
function ropeMake(){const m=new THREE.Mesh(cyl(.035,.035,1,6),std('#c79a52',{roughness:.85})),tip=new THREE.Mesh(sph(.28,14,10),std(HERO.gold,{roughness:.25,metalness:.7,emissive:'#6a4400'}));
  m.castShadow=true;scene.add(m,tip);return {m,tip};}
function ropeFree(r){if(!r)return;for(const o of [r.m,r.tip]){scene.remove(o);o.geometry.dispose();o.material.dispose();}}
const ropeHand=new THREE.Vector3(),ropeD=new THREE.Vector3();
function ropeDraw(r,a,anchor){a.arms[1].hand.getWorldPosition(ropeHand);r.tip.position.copy(anchor);
  ropeD.copy(anchor).sub(ropeHand);const len=ropeD.length();r.m.position.copy(ropeHand).addScaledVector(ropeD,.5);r.m.scale.set(1,len,1);r.m.quaternion.setFromUnitVectors(ROPE_UP,ropeD.normalize());}
// hanging on: one hand up on the rope, the other out, knees up
function ropePose(a){const [L,Rt]=a.arms;Rt.sh.rotation.set(-3.0,0,-.05);Rt.el.rotation.x=0;L.sh.rotation.set(-.4,0,-1.1);L.el.rotation.x=-.4;
  a.legs.forEach((l,i)=>{l.hp.rotation.set(-.55-i*.15,0,0);l.kn.rotation.x=.7;});}
onTick.push(dt=>{const s=DAD.swing;
  if(s&&!DAD.rope)DAD.rope=ropeMake();if(!s&&DAD.rope){ropeFree(DAD.rope);DAD.rope=null;}
  if(s){av.g.rotation.order='YXZ';av.g.rotation.x=-s.ang*.8;av.g.updateMatrixWorld(true);ropePose(av);av.g.updateMatrixWorld(true);ropeDraw(DAD.rope,av,new THREE.Vector3(s.ax,s.ay,s.az));}});
SHOW.push({k:'dadrope',
  mine(){const s=daddyOn()&&DAD.swing;return s?{x:+s.ax.toFixed(1),y:+s.ay.toFixed(1),z:+s.az.toFixed(1),n:s.n}:null;},
  on(f,d){return {r:ropeMake(),at:new THREE.Vector3(+d.x||0,+d.y||0,+d.z||0)};},
  step(f,d,dt,h){if(!h||!f.a)return;ropePose(f.a);f.a.g.updateMatrixWorld(true);ropeDraw(h.r,f.a,h.at);},
  off(f,h){if(h)ropeFree(h.r);}});

/* ---------- 👻 ghost: see-through, and friends only see your footprints ---------- */
let printGeo=null;const PRINTS=[];
function footprint(x,z,face,side){if(!printGeo)printGeo=new THREE.CircleGeometry(1,14);
  const m=new THREE.Mesh(printGeo,new THREE.MeshBasicMaterial({color:'#3b2a4a',transparent:true,opacity:.55,depthWrite:false}));
  const ox=Math.cos(face)*side*.11,oz=-Math.sin(face)*side*.11;m.position.set(x+ox,groundAt(x+ox,z+oz)+.03,z+oz);
  m.rotation.order='YXZ';m.rotation.y=face;m.rotation.x=-Math.PI/2;m.scale.set(.075,.13,1);scene.add(m);PRINTS.push({m,t:0});}
// leave a footprint every half step while walking (tr keeps where the last one was)
function printStep(tr,P,face,onGround){if(!onGround){tr.last=null;return;}if(!tr.last){tr.last=P.clone();tr.side=1;return;}
  if(Math.hypot(P.x-tr.last.x,P.z-tr.last.z)>.45){tr.last.copy(P);tr.side=-tr.side;footprint(P.x,P.z,face,tr.side);}}
function ghostMats(a,on){a.g.traverse(o=>{if(!(o.isMesh||o.isSprite)||Array.isArray(o.material))return;
  if(on&&!o.userData.dadM){o.userData.dadM=o.material;const m=o.material.clone();m.transparent=true;m.opacity=(o.material.opacity??1)*.3;m.depthWrite=false;o.material=m;}
  if(!on&&o.userData.dadM){o.material.dispose();o.material=o.userData.dadM;delete o.userData.dadM;}});}
function ghostToggle(){DAD.ghost=!DAD.ghost;const p=player.pos.clone().add(new THREE.Vector3(0,1,0));burst(p,'#e8e0ff',40,2.5);
  if(DAD.ghost){tone(400,.8,'sine',.05,0,200);tone(600,.8,'sine',.04,.2,300);toast('👻 Ghost mode! Friends only see your footprints.');}
  else{ghostMats(av,false);DAD.ghostA=null;sfx('pop');toast('Boo! You can be seen again.');}}
DAD.myPrints={};
onTick.push(dt=>{
  if(DAD.ghost&&(DAD.ghostA!==av||DAD.ghostGear!==DAD.gear)){ghostMats(av,true);DAD.ghostA=av;DAD.ghostGear=DAD.gear;}// (again after a new model or the hero bits)
  if(DAD.ghost)printStep(DAD.myPrints,player.pos,player.face,player.onGround);
  for(let i=PRINTS.length-1;i>=0;i--){const q=PRINTS[i];q.t+=dt;q.m.material.opacity=.55*Math.max(0,1-q.t/5);if(q.t>5){scene.remove(q.m);q.m.material.dispose();PRINTS.splice(i,1);}}});
SHOW.push({k:'dadghost',
  mine(){return daddyOn()&&DAD.ghost?{on:1}:null;},// (friends only take objects)
  on(f){burst(f.pos.clone().add(new THREE.Vector3(0,1,0)),'#e8e0ff',40,2.5);return {tr:{}};},
  step(f,d,dt,h){if(!h||!f.a)return;f.a.g.visible=false;printStep(h.tr,f.pos,f.cur??f.face,!f.air);},
  off(f){if(f.a)f.a.g.visible=true;}});

/* ---------- 👯 Triple Daddy: two more of you that copy everything you do ---------- */
function cloneMake(look,name){const a=new Avatar(look,name,tagColor(look));a.tag.visible=false;scene.add(a.g);return {a,gear:heroGear(a),pos:null,idle:0,emo:null};}
function cloneFree(c){heroOff(c.gear);scene.remove(c.a.g);freeObj(c.a.g);}
// lead: where you are and what you're doing; the copies stand on each side of you
function clonesStep(list,P,face,sp,air,fly,tilt,emote,dt){const fx=Math.sin(face),fz=Math.cos(face),t=performance.now()/1000;
  list.forEach((c,i)=>{const side=i?1:-1,tx=P.x+fz*side*1.4-fx*.6,tz=P.z-fx*side*1.4-fz*.6;
    if(!c.pos||Math.hypot(tx-c.pos.x,tz-c.pos.z)>15)c.pos=new THREE.Vector3(tx,P.y,tz);
    const k=Math.min(1,dt*7);c.pos.x+=(tx-c.pos.x)*k;c.pos.z+=(tz-c.pos.z)*k;c.pos.y=fly||air?c.pos.y+(P.y-c.pos.y)*k:Math.max(groundAt(c.pos.x,c.pos.z),P.y-.5);
    c.a.g.position.copy(c.pos);c.a.g.rotation.order='YXZ';c.a.g.rotation.y=face;c.a.g.rotation.x=fly?tilt:0;
    if(emote&&emote!==c.emo){c.emo=emote;const id=emote.id;setTimeout(()=>c.a.play(id),150+i*150);}
    if(!emote)c.emo=null;
    if(sp<.1&&!air&&!emote){c.idle+=dt;if(c.idle>3){c.idle=-5;c.a.play(i?'twirl':'dance');}}else c.idle=0;
    c.a.update(dt,sp,air&&!fly);heroCape(c.gear,t+i,sp,air,fly);if(fly)heroFlyPose(c.a);});}
function clonesToggle(){const P=player.pos;
  if(DAD.clones){DAD.clones.forEach(c=>{burst(c.a.g.position.clone().add(new THREE.Vector3(0,1,0)),'#ffd23f',30,2.5);cloneFree(c);});DAD.clones=null;sfx('pop');return;}
  DAD.clones=[0,1].map(()=>cloneMake(SAVE.look,SAVE.name||'Daddy'));clonesStep(DAD.clones,P,player.face,0,false,false,0,null,1);
  DAD.clones.forEach(c=>burst(c.pos.clone().add(new THREE.Vector3(0,1,0)),'#ffd23f',40,3));[523,659,784].forEach((f,i)=>tone(f,.2,'triangle',.07,i*.09));toast('👯 Triple Daddy!');}
onTick.push(dt=>{const L=DAD.clones;if(!L)return;L.forEach(c=>c.a.g.visible=!DAD.robot);
  clonesStep(L,player.pos,player.face,player.speed,!player.onGround,DAD.fly,DAD.tilt,av.emote,dt);});
SHOW.push({k:'dadclones',
  mine(){return daddyOn()&&DAD.clones?{on:1}:null;},
  on(f){if(!f.a)return null;const L=[0,1].map(()=>cloneMake(f.a.look,f.a.name||'Daddy'));return {L};},
  step(f,d,dt,h){if(!h||!f.a)return;const fly=!!f.air&&f.pos.y-groundAt(f.pos.x,f.pos.z)>2.5;
    clonesStep(h.L,f.pos,f.cur??f.face,f.sp||0,!!f.air,fly,fly?Math.min(1,(f.sp||0)/10)*1.1:0,f.a.emote,dt);},
  off(f,h){if(h)h.L.forEach(cloneFree);}});

/* ---------- 🌈 rainbow trail ---------- */
let rbTex=null;
const rainbowTex=()=>rbTex||(rbTex=canvasTex(64,4,x=>{['#ff4d6d','#ff9f1c','#ffe14d','#5fd068','#4fb6ff','#8e6cff'].forEach((c,i)=>{x.fillStyle=c;x.fillRect(i*64/6,0,64/6+1,4);});}));
let rbGeo=null;
// tr keeps the last point and the stripes; a new stripe each time you've moved a little, and they fade away
function rainbowStep(tr,P,on,dt){tr.segs=tr.segs||[];
  if(on){const at=new THREE.Vector3(P.x,P.y+.8,P.z);if(!tr.last)tr.last=at;const len=at.distanceTo(tr.last);
    if(len>.4){if(!rbGeo){rbGeo=new THREE.PlaneGeometry(.75,1);rbGeo.rotateX(-Math.PI/2);}
      const m=new THREE.Mesh(rbGeo,new THREE.MeshBasicMaterial({map:rainbowTex(),transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));
      m.position.copy(at).add(tr.last).multiplyScalar(.5);m.lookAt(at);m.scale.set(1,1,len+.08);scene.add(m);tr.segs.push({m,t:0});tr.last=at;}}
  else tr.last=null;
  for(let i=tr.segs.length-1;i>=0;i--){const q=tr.segs[i];q.t+=dt;q.m.material.opacity=.9*Math.max(0,1-q.t/2.2);if(q.t>2.2){scene.remove(q.m);q.m.material.dispose();tr.segs.splice(i,1);}}}
DAD.myRb={};
onTick.push(dt=>rainbowStep(DAD.myRb,player.pos,daddyOn()&&DAD.rainbow&&!DAD.robot,dt));
SHOW.push({k:'dadrainbow',
  mine(){return daddyOn()&&DAD.rainbow?{on:1}:null;},
  on(){return {tr:{},left:[]};},
  step(f,d,dt,h){if(h)rainbowStep(h.tr,f.pos,true,dt);},
  off(f,h){if(!h)return;const tr=h.tr;onTick.push(function fade(dt){rainbowStep(tr,f.pos,false,dt);if(!tr.segs.length)onTick.splice(onTick.indexOf(fade),1);});}});

/* ---------- 🍬 candy rain ---------- */
let candyKit=null;
function candyMesh(){const K=candyKit||(candyKit={mats:['#ff5fa2','#ffd23f','#5fd0ff','#8ee06a','#c58bff','#ff8a3d'].map(c=>std(c,{roughness:.25,metalness:.1})),
    white:std('#ffffff',{roughness:.3}),orange:std('#ff8a1f',{roughness:.5}),green:std('#3f8f3a'),
    ball:sph(.12,14,10),cone:new THREE.ConeGeometry(.07,.1,10),stick:cyl(.012,.012,.32,6),disc:cyl(.13,.13,.04,20),pk:sph(.16,14,10),stem:cyl(.02,.025,.08,6)});
  const g=new THREE.Group(),m=K.mats[Math.random()*K.mats.length|0],r=Math.random(),add=(geo,mat)=>{const o=new THREE.Mesh(geo,mat);o.castShadow=true;g.add(o);return o;};
  if(r<.45){add(K.ball,m).scale.set(1.3,1,1);g.children[0].position.y=.12;for(const s of [-1,1]){const c=add(K.cone,m);c.rotation.z=s*Math.PI/2;c.position.set(s*.19,.12,0);}}// a wrapped sweet
  else if(r<.8){add(K.stick,K.white).position.y=.16;const d=add(K.disc,m);d.rotation.x=Math.PI/2;d.position.y=.36;}// a lollipop
  else{const p=add(K.pk,K.orange);p.scale.y=.75;p.position.y=.12;add(K.stem,K.green).position.y=.25;}// a little pumpkin
  return g;}
const CANDY=[];
function candyRain(x,z){for(let i=0;i<45;i++){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*7,cx=x+Math.sin(a)*d,cz=z+Math.cos(a)*d;
    const g=candyMesh(),c={g,vy:-2,y:groundAt(cx,cz)+10+Math.random()*16,spin:(Math.random()-.5)*8,life:14+Math.random()*3,down:false};
    g.position.set(cx,c.y,cz);g.rotation.set(Math.random()*6,Math.random()*6,0);scene.add(g);CANDY.push(c);}
  while(CANDY.length>160){const c=CANDY.shift();scene.remove(c.g);}
  [1047,1319,1568,2093].forEach((f,i)=>tone(f,.25,'triangle',.05,i*.12));}
function candyGo(){const p=player.pos;candyRain(p.x,p.z);DAD.candy={x:+p.x.toFixed(1),z:+p.z.toFixed(1),n:(DAD.candy?DAD.candy.n:0)+1,t:Date.now()};toast('🍬 Candy rain!');}
onTick.push(dt=>{const P=player.pos;
  for(let i=CANDY.length-1;i>=0;i--){const c=CANDY[i],q=c.g.position;c.life-=dt;
    if(!c.down){c.vy-=12*dt;q.y+=c.vy*dt;c.g.rotation.x+=c.spin*dt;c.g.rotation.y+=c.spin*.7*dt;const gy=groundAt(q.x,q.z);
      if(q.y<=gy){q.y=gy;if(c.vy<-4){c.vy*=-.3;if(Math.random()<.15)tone(1200+Math.random()*800,.06,'sine',.03);}else{c.down=true;c.g.rotation.x=0;c.g.rotation.z=0;}}}
    const s=c.life<1?Math.max(.01,c.life):1;c.g.scale.setScalar(s);
    const got=c.down&&started&&Math.hypot(q.x-P.x,q.z-P.z)<.7&&Math.abs(q.y-P.y)<1;
    if(got){burst(q.clone().add(new THREE.Vector3(0,.3,0)),'#ffd6ea',12,1.5);tone(1400+Math.random()*600,.1,'triangle',.06);}
    if(got||c.life<=0){scene.remove(c.g);CANDY.splice(i,1);}}});

/* ---------- 🐾 pet parade: the island's pets come running and follow you in a line ---------- */
const PARADES=[];
function paradeGo(lead){const L=lead();if(!L)return;const busy=new Set(PARADES.flatMap(P=>P.pets));
  const pets=PETS.filter(pt=>!pt.owned&&!pt.inParlor&&pt.g.visible&&!busy.has(pt)).sort((a,b)=>a.pos.distanceTo(L)-b.pos.distanceTo(L)).slice(0,12);
  if(!pets.length)return;PARADES.push({lead,until:performance.now()+25000,pets,trail:[L.clone()]});
  pets.forEach(pt=>{floaties(pt.g.position.clone().add(new THREE.Vector3(0,pt.tagH||.8,0)),'💖',3);pt.happy=2;});
  [392,523,659,784,1047].forEach((f,i)=>tone(f,.15,'square',.04,i*.1));}
function paradeMine(){paradeGo(()=>player.pos);DAD.par={n:(DAD.par?DAD.par.n:0)+1,t:Date.now()};toast('🐾 Pet parade! Everybody follow Daddy!');}
onTick.push(dt=>{const now=performance.now();
  for(let k=PARADES.length-1;k>=0;k--){const P=PARADES[k],L=P.lead();
    if(now>P.until||!L){P.pets.forEach(pt=>{pt.wait=0;pt.tgt=null;});PARADES.splice(k,1);continue;}
    const tr=P.trail,last=tr[tr.length-1];if(Math.hypot(L.x-last.x,L.z-last.z)>.45){tr.push(new THREE.Vector3(L.x,0,L.z));if(tr.length>200)tr.shift();}
    P.pets.forEach((pt,i)=>{if(pt.owned||pt.inParlor)return;const idx=tr.length-1-(i+1)*3,T=idx>=0?tr[idx]:tr[0],dx=T.x-pt.pos.x,dz=T.z-pt.pos.z,d=Math.hypot(dx,dz);
      pt.tgt=null;pt.wait=1;let spd=0;
      if(d>30){pt.pos.x=T.x;pt.pos.z=T.z;}
      else if(d>.3){spd=Math.min(9,1+d*2.5);const st=Math.min(d,spd*dt);pt.pos.x+=dx/d*st;pt.pos.z+=dz/d*st;collide(pt.pos,.22);pt.face=angDamp(pt.face,Math.atan2(dx,dz),Math.min(1,dt*8));}
      pt.speed=Math.max(pt.speed,spd);pt.pos.y=groundAt(pt.pos.x,pt.pos.z);pt.g.position.set(pt.pos.x,pt.pos.y+pt.y,pt.pos.z);pt.g.rotation.y=pt.face;});}});

/* ---------- 🌨️ snow and 🎆 fireworks night (for everybody in the room) ---------- */
// who wants it right now: 'me' and/or friends (their online record); seasons.js asks window.__daddy.night() how dark to be
const SKYON={snow:new Set(),night:new Set()};
let snowPts=null,fwT=1;
function snowStep(dt,on){const P=player.pos,n=700;
  if(on&&!snowPts){const p=new Float32Array(n*3),v=[];for(let i=0;i<n;i++){p[i*3]=P.x+(Math.random()-.5)*50;p[i*3+1]=P.y+Math.random()*18;p[i*3+2]=P.z+(Math.random()-.5)*50;v.push({s:1.2+Math.random()*1.4,ph:Math.random()*7});}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
    snowPts=new THREE.Points(g,new THREE.PointsMaterial({size:.22,map:sparkTex,color:'#ffffff',transparent:true,depthWrite:false}));snowPts.frustumCulled=false;snowPts.userData.v=v;scene.add(snowPts);}
  if(!on&&snowPts){scene.remove(snowPts);snowPts.geometry.dispose();snowPts.material.dispose();snowPts=null;}
  if(!snowPts)return;const a=snowPts.geometry.attributes.position.array,v=snowPts.userData.v,t=performance.now()/1000;
  for(let i=0;i<n;i++){let x=a[i*3],y=a[i*3+1],z=a[i*3+2];y-=v[i].s*dt;x+=Math.sin(t*.9+v[i].ph)*.5*dt;
    if(y<P.y-2){y=P.y+16+Math.random()*4;x=P.x+(Math.random()-.5)*50;z=P.z+(Math.random()-.5)*50;}
    if(x-P.x>25)x-=50;else if(x-P.x<-25)x+=50;if(z-P.z>25)z-=50;else if(z-P.z<-25)z+=50;a[i*3]=x;a[i*3+1]=y;a[i*3+2]=z;}
  snowPts.geometry.attributes.position.needsUpdate=true;}
function skyToggle(k){DAD[k]=!DAD[k];sfx('pop');if(k==='snow')toast(DAD.snow?'🌨️ Let it snow!':'☀️ Snow stopped');else toast(DAD.night?'🎆 Fireworks night!':'☀️ Back to daytime');}
onTick.push(dt=>{const on=daddyOn();if(on&&DAD.snow)SKYON.snow.add('me');else SKYON.snow.delete('me');if(on&&DAD.night)SKYON.night.add('me');else SKYON.night.delete('me');
  snowStep(dt,SKYON.snow.size>0);
  if(SKYON.night.size&&started&&(fwT-=dt)<=0){fwT=.5+Math.random()*1.1;const P=player.pos,a=Math.random()*Math.PI*2,d=10+Math.random()*20;
    const pos=new THREE.Vector3(P.x+Math.sin(a)*d,P.y+15+Math.random()*9,P.z+Math.cos(a)*d);
    burst(pos,['#ffd23f','#ff8fc8','#8fd8ff','#b8f0a8','#c6a6ff','#ff6b6b'][Math.random()*6|0],90,7,.9);tone(140+Math.random()*60,.35,'sine',.05,0,50);}});
SHOW.push({k:'dadsky',
  mine(){return daddyOn()&&(DAD.snow||DAD.night)?{s:DAD.snow?1:0,n:DAD.night?1:0}:null;},
  on(f,d){if(d.s)SKYON.snow.add(f);if(d.n)SKYON.night.add(f);return 1;},
  step(){},
  off(f){SKYON.snow.delete(f);SKYON.night.delete(f);}});

/* ---------- ✨ the powers menu ---------- */
// [emoji, name, what it does, is it on (for the ones you switch on and off)]
const POWERS=[['🪢','Rope swing',ropeGo],['🫧','Bubble trap',()=>daddyZap('bub')],['🐰','Bunny zap',()=>daddyZap('bun')],['🤏','Shrink ray',()=>daddyZap('tiny')],
  ['👻','Ghost',ghostToggle,()=>DAD.ghost],['🍬','Candy rain',candyGo],['👯','Triple Daddy',clonesToggle,()=>!!DAD.clones],['🐾','Pet parade',paradeMine],
  ['🌈','Rainbow trail',()=>{DAD.rainbow=!DAD.rainbow;sfx('pop');if(DAD.rainbow)toast('🌈 Rainbow trail!');},()=>DAD.rainbow],
  ['🌨️','Snow',()=>skyToggle('snow'),()=>DAD.snow],['🎆','Fireworks night',()=>skyToggle('night'),()=>DAD.night]];
{const st=document.createElement('style');st.textContent=`
#dadPanel{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 90px);transform:translateX(-50%);z-index:40;width:min(calc(100vw - 32px),380px);
  background:rgba(255,255,255,.96);border-radius:22px;box-shadow:0 10px 30px rgba(59,35,87,.35);padding:12px;display:none;font-family:inherit}
#dadPanel b{display:block;text-align:center;color:#3b2357;font-size:15px;margin:0 0 8px}
#dadPanel .g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
#dadPanel button{border:0;border-radius:16px;background:#f3ecff;color:#3b2357;padding:8px 2px 6px;display:grid;justify-items:center;gap:2px;font:inherit;font-size:11px;font-weight:700;line-height:1.1;touch-action:none}
#dadPanel button span{font-size:26px;line-height:1.1}
#dadPanel button.on{background:linear-gradient(135deg,#8e6cff,#ff6fae);color:#fff;box-shadow:0 0 0 3px #ffd23f}
@media (max-height:520px){#dadPanel{bottom:calc(env(safe-area-inset-bottom) + 12px);width:min(calc(100vw - 32px),520px)}#dadPanel .g{grid-template-columns:repeat(6,1fr)}}`;document.head.appendChild(st);}
const panel=document.createElement('div');panel.id='dadPanel';panel.innerHTML='<b>✨ Daddy powers</b><div class="g"></div>';document.body.appendChild(panel);
const panelGrid=panel.querySelector('.g');
function panelDraw(){panelGrid.innerHTML=POWERS.map(([e,n,,on],i)=>`<button data-i="${i}" class="${on&&on()?'on':''}"><span>${e}</span>${n}</button>`).join('');}
const panelShow=v=>{panel.style.display=v?'block':'none';if(v)panelDraw();};
panel.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const b=e.target.closest('[data-i]');if(!b||!daddyOn())return;
  const P=POWERS[+b.dataset.i];P[2]();if(P[3])panelDraw();else panelShow(false);});
addEventListener('pointerdown',e=>{if(panel.style.display!=='none'&&!panel.contains(e.target)&&e.target.id!=='dadMore')panelShow(false);},true);
const moreBtn=mkPower('dadMore','✨',230,'radial-gradient(circle at 35% 30%,#fff0ff,#c58bff)',()=>panelShow(panel.style.display==='none'),244);// (the end of the row: ❄️ 🤖 ⚡/🪢 ✨)
const ropeBtn=mkPower('dadRope','🪢',230,'radial-gradient(circle at 35% 30%,#fff1d6,#d9a35b)',ropeGo,170);// for the next swing, in the air
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||!daddyOn()||closetOpen)return;if(e.code==='KeyT')ropeGo();});
onTick.push(()=>{const on=daddyOn()&&started&&!closetOpen;moreBtn.style.display=on?'grid':'none';if(!on&&panel.style.display!=='none')panelShow(false);
  ropeBtn.style.display=on&&(DAD.swing||DAD.fling)?'grid':'none';});
// suit off: everything you switched on goes off too (tricks already played on people run out by themselves)
function powersOff(){if(DAD.ghost){DAD.ghost=false;ghostMats(av,false);DAD.ghostA=null;}if(DAD.clones)clonesToggle();
  DAD.rainbow=false;DAD.snow=false;DAD.night=false;ropeStop();panelShow(false);}

// the other files reach these through window.__daddy, so they do nothing once this file is off or gone
window.__daddy={jump:daddyJump,frozen:daddyFrozen,fly:daddyFlyStep,teleport:daddyTeleport,night:()=>SKYON.night.size?1:undefined};
DAD.dbg=()=>({candy:CANDY.length,parades:PARADES.length,snow:!!snowPts,prints:PRINTS.length,night:SKYON.night.size,fx:[...DAD.fx.keys()]});// (for tests)
Object.assign(window.__game,{daddy:()=>DAD,daddyOn});
}
