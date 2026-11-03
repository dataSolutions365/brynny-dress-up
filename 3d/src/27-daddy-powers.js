/* ================= 🦸 SECRET DADDY POWERS (temporary, for the family demo) =================
   Type your name as " Daddy" (with a SPACE in front) on the welcome screen or in Settings. The space is trimmed off, so
   the name tag just says "Daddy" and nobody can tell. Typed without the space, "Daddy" is a normal name with nothing extra.
   Then a 🦸 Hero button shows up in the icons on the right (only on that player's own phone). Tap it: lightning strikes
   you and you suit up with a red cape and a hero badge (a gold star with a "D"; made up, not anybody's real superhero logo).
   Tap it again to take the suit off. While the suit is on:
   - Super jump: JUMP goes way up, over the trees.
   - Fly without a ride: tap JUMP again while up in the air. Steer with the joystick (fast!), hold JUMP to go higher and ⬇️
     to go lower (Space / Shift on a keyboard). Hold ⬇️ all the way down to the ground to land.
   - Teleport: open the map and tap anywhere on the island, and you're there in a puff of sparkles.
   - Super strength: walk up to something small that never moves (a pumpkin, a rock, a flower pot) and a ✋ button shows up.
     Tap it to lift it over your head, and tap again to throw it. Things go back where they were when the game reloads.
   Friends online see the lightning, the cape and the badge (the 'hero' entry in SHOW at the bottom), and see Daddy jump
   sky-high, fly around and pop up somewhere else (they get your position as usual). They don't see the thing you carry.

   TO REMOVE: delete this file, then search 3d/src for "DADDY POWERS" and undo the 3 small hooks it finds
   (a line in 17-input.js and 26-map.js; in 25-game-loop.js the "&&!daddyFlyStep(...)" part and the note under it),
   then run: node 3d/build.mjs */
const DAD={fly:false,vx:0,vz:0,vy:0,tilt:0,tip:false,cands:null,near:null,held:null,thrown:[],scanT:0};
const DAD_KEY=/^\s+daddy\s*$/i;// a space (or more) in front of "Daddy"
const daddyKey=()=>!!SAVE.daddy&&/^daddy$/i.test(SAVE.name||'');// the secret name: the 🦸 button shows
const daddyOn=()=>daddyKey()&&!!SAVE.daddySuit;// suited up: the powers work
// remember whether the name was typed with the secret space in front (before the game trims it off)
for(const id of ['#wname','#setName'])$(id).addEventListener('input',e=>{const on=DAD_KEY.test(e.target.value);if(!!SAVE.daddy!==on){SAVE.daddy=on?1:0;persist();}});

/* ---------- super jump, and take off ---------- */
function daddyJump(){if(!daddyOn()||barnRide)return false;
  if(DAD.fly)return true;// up in the air already: holding JUMP climbs (in daddyFlyStep)
  if(player.onGround){player.vy=17;player.onGround=false;sfx('jump');burst(player.pos.clone().add(new THREE.Vector3(0,.1,0)),'#ffffff',18,1.6);return true;}
  daddyTakeOff();return true;}// a second tap in the air: fly
function daddyTakeOff(){flyGrid();Object.assign(DAD,{fly:true,vx:0,vz:0,vy:Math.max(0,player.vy*.3)});player.vy=0;player.onGround=false;
  tone(520,.25,'triangle',.08,0,1040);$('#flyDown').style.display='grid';document.body.classList.add('flying');
  if(!DAD.tip){DAD.tip=true;toast(isTouch?'🦸 Hold JUMP to go up, ⬇️ to go down. Go all the way down to land.':'🦸 Hold Space to go up, Shift to go down. Go all the way down to land.');}}
function daddyLand(snap){if(!DAD.fly)return;const p=player.pos;DAD.fly=false;
  $('#flyDown').style.display='none';document.body.classList.remove('flying');av.g.rotation.x=0;DAD.tilt=0;
  if(snap){collide(p);p.y=groundAt(p.x,p.z);player.vy=0;player.onGround=true;}
  else{player.vy=0;burst(new THREE.Vector3(p.x,p.y+.05,p.z),'#ffffff',14,1.3);}}

/* ---------- flying, every frame (from the game loop, instead of walking) ---------- */
function daddyFlyStep(dt,ix,iy,mag){if(!DAD.fly)return false;
  if(!daddyOn()||barnRide||closetOpen){daddyLand(true);return false;}
  const p=player.pos,up=FLY.upBtn||keys.Space,down=FLY.downBtn||keys.ShiftLeft||keys.ShiftRight||keys.KeyC,top=30;
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
  const p=player.pos;burst(p.clone().add(new THREE.Vector3(0,1,0)),'#ffd23f',40,3);daddyLand(true);
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
  x.beginPath();x.arc(128,128,122,0,Math.PI*2);x.fillStyle='#ffd23f';x.fill();x.beginPath();x.arc(128,128,106,0,Math.PI*2);x.fillStyle='#d81b3b';x.fill();
  x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?40:96;x.lineTo(128+Math.cos(a)*r,132+Math.sin(a)*r);}x.closePath();
  x.fillStyle='#ffd23f';x.fill();x.lineWidth=6;x.strokeStyle='#7a0f22';x.stroke();
  x.font='900 70px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#d81b3b';x.fillText('D',128,140);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  return dadBadgeMat=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.4,metalness:.2,polygonOffset:true,polygonOffsetFactor:-2});}
const dadCapeMat=std('#d81b3b',{roughness:.55,side:THREE.DoubleSide});
// put the suit on avatar a; returns what to take off again
function heroGear(a){const guy=!!a.guy,h={a};
  const g=new THREE.PlaneGeometry(.54,.98,6,10),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-Math.abs(x)*x*1.4);p.setX(i,x*(1+(.49-y)*.55));}g.translate(0,-.49,0);g.computeVertexNormals();
  h.cape=new THREE.Group();h.cape.position.set(0,.47,guy?-.13:-.115);const cm=new THREE.Mesh(g,dadCapeMat);cm.rotation.y=Math.PI;cm.castShadow=true;h.cape.add(cm);a.spine.add(h.cape);
  h.badge=new THREE.Mesh(new THREE.PlaneGeometry(.12,.12),daddyBadge());h.badge.position.set(0,.29,guy?.118:.108);a.spine.add(h.badge);return h;}
function heroOff(h){if(!h)return;for(const m of [h.cape,h.badge]){m.parent&&m.parent.remove(m);m.traverse(o=>o.geometry&&o.geometry.dispose());}}
// the cape flows out behind you when you run, jump or fly
const heroCape=(h,t,sp,air,fly)=>{h.cape.rotation.x=fly?1.25+Math.sin(t*9)*.08:.1+Math.min(sp,8)*.07+Math.sin(t*3)*.04+(air?.45:0);};
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
suitBtn.onclick=()=>{if(!daddyKey()||closetOpen)return;const p=player.pos;
  if(SAVE.daddySuit){SAVE.daddySuit=0;persist();if(DAD.held)daddyThrow();daddyLand(true);burst(p.clone().add(new THREE.Vector3(0,1,0)),'#ff8fc8',30,2.5);sfx('pop');toast('Suit off. Just regular Daddy now 😎');return;}
  heroZap(p.x,p.y,p.z,true);setTimeout(()=>{SAVE.daddySuit=1;persist();doAction('cheer');toast('⚡ SUPER DADDY! ⚡');},180);};
onTick.push(dt=>{const key=daddyKey()&&started,on=daddyOn()&&started;suitBtn.style.display=key?'grid':'none';
  if(on&&(!DAD.gear||DAD.gear.a!==av)){heroOff(DAD.gear);DAD.gear=heroGear(av);}
  else if(!on&&DAD.gear){heroOff(DAD.gear);DAD.gear=null;}
  if(DAD.gear)heroCape(DAD.gear,performance.now()/1000,player.speed,!player.onGround,DAD.fly);});
// friends online see the suit, and the lightning when you put it on
SHOW.push({k:'hero',
  mine(){return daddyOn()?{on:1}:null;},
  on(f,d){const P=f.pos;heroZap(P.x,P.y,P.z,false);return {gear:heroGear(f.a),a:f.a};},
  step(f,d,dt,h){if(!h)return;if(h.a!==f.a){heroOff(h.gear);h.gear=heroGear(f.a);h.a=f.a;}const fly=!!f.air&&f.pos.y-groundAt(f.pos.x,f.pos.z)>2.5,r=f.a.g.rotation;// way up in the air: flying like a superhero
    h.tilt=(h.tilt||0)+((fly?Math.min(1,(f.sp||0)/10)*1.1:0)-(h.tilt||0))*Math.min(1,dt*4);r.order='YXZ';r.x=h.tilt;
    heroCape(h.gear,performance.now()/1000,f.sp||0,!!f.air,fly);},
  off(f,h){if(!h)return;heroOff(h.gear);if(h.a)h.a.g.rotation.x=0;}});
Object.assign(window.__game,{daddy:()=>DAD,daddyOn});
