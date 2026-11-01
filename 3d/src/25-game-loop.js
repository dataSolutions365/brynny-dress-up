/* ================= LOOP ================= */
const onTick=[];// extra per-frame hooks (online play)
const clock=new THREE.Clock();let curZone=null,onPad=true,onRunway=false,onPPad=false;
const tmpV=new THREE.Vector3();
function stepPushables(p,dt){
  for(const o of PUSH){const z=o.z,m=o.m,q=m.position;
    // player bump: push it out ahead of you so it gets kicked along like the beach ball
    const [px,pz]=z.toLocal(p.x,p.z);let dx=q.x-px,dz=q.z-pz,d=Math.hypot(dx,dz);const reach=o.r+.32;
    if(d<reach&&d>1e-4&&p.y<q.y+o.h){dx/=d;dz/=d;const sp=Math.max(3.2,player.speed*1.15);
      const slow=Math.hypot(o.vx,o.vz)<1.5;o.vx=dx*sp;o.vz=dz*sp;q.x=px+dx*reach;q.z=pz+dz*reach;
      if(slow){if(q.y<=o.y0+.01)o.vy=1.8+Math.random()*1.2;o.spin=(Math.random()<.5?-1:1)*(3+Math.random()*4);tone(160+Math.random()*80,.09,'sine',.12);tone(330,.06,'triangle',.06,.03);}}
    const v=Math.hypot(o.vx,o.vz);if(v<.02&&q.y<=o.y0&&Math.abs(o.tx)+Math.abs(o.tz)<.002)continue;
    q.x+=o.vx*dt;q.z+=o.vz*dt;
    // hop and land with a little bounce
    o.vy-=18*dt;q.y+=o.vy*dt;if(q.y<o.y0){q.y=o.y0;o.vy=o.vy<-1.5?-o.vy*.35:0;}
    const air=q.y>o.y0+.01,fr=air?.995:Math.pow(.06,dt);o.vx*=fr;o.vz*=fr;
    // spin and tip over in the direction it slides, then settle flat again
    o.ry+=o.spin*dt;o.spin*=Math.pow(.08,dt);
    o.tx+=((o.vz*.12)-o.tx)*Math.min(1,dt*10);o.tz+=((-o.vx*.12)-o.tz)*Math.min(1,dt*10);m.rotation.set(o.tx,o.ry,o.tz);
    // stay inside the zone and bounce off its things (trees, cake, other presents)
    const r=Math.hypot(q.x,q.z),lim=z.r-.5;if(r>lim){q.x*=lim/r;q.z*=lim/r;const nx=q.x/lim,nz=q.z/lim,dot=o.vx*nx+o.vz*nz;if(dot>0){o.vx-=1.6*dot*nx;o.vz-=1.6*dot*nz;}}
    const [wx,wz]=z.toWorld(q.x,q.z);
    for(const ob of obs){const ox=wx-ob.x,oz=wz-ob.z,od=Math.hypot(ox,oz),mm=ob.r+o.r;if(od<mm&&od>1e-4){const [lx,lz]=z.toLocal(ob.x+ox/od*mm,ob.z+oz/od*mm);
      const nx=lx-q.x,nz=lz-q.z,nl=Math.hypot(nx,nz)||1;q.x=lx;q.z=lz;const ux=nx/nl,uz=nz/nl,dot=o.vx*ux+o.vz*uz;if(dot<0){o.vx-=1.6*dot*ux;o.vz-=1.6*dot*uz;}}}
    for(const b of PUSH){if(b===o||b.z!==z)continue;const bq=b.m.position,bx=q.x-bq.x,bz=q.z-bq.z,bd=Math.hypot(bx,bz),mm=o.r+b.r;
      if(bd<mm&&bd>1e-4){const ux=bx/bd,uz=bz/bd,push=(mm-bd)/2;q.x+=ux*push;q.z+=uz*push;bq.x-=ux*push;bq.z-=uz*push;
        const rel=(o.vx-b.vx)*ux+(o.vz-b.vz)*uz;if(rel<0){o.vx-=rel*ux*.9;o.vz-=rel*uz*.9;b.vx+=rel*ux*.9;b.vz+=rel*uz*.9;if(b.spin===0)b.spin=o.spin*.6;}}}}}
function collide(p,rad=.32){for(const o of obs){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),m=o.r+rad;if(d<m&&d>1e-4){p.x=o.x+dx/d*m;p.z=o.z+dz/d*m;}}
  const d=Math.hypot(p.x,p.z),lim=onDock(p.x,p.z)?48.5:R+.9;if(d>lim){p.x*=lim/d;p.z*=lim/d;}}
const angDamp=(a,b,k)=>{let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*k;};
function stepFriend(f,dt){f.wait-=dt;const P=player.pos;
  if(!f.tgt&&f.wait<=0&&!f.follow){const z=Math.random()<.7?f.home:rnd(ZONES);const a=Math.random()*Math.PI*2,r=Math.random()*z.r*.8;f.tgt=new THREE.Vector3(z.x+Math.sin(a)*r,0,z.z+Math.cos(a)*r);}
  let sp=0;const dP=P.distanceTo(f.pos);
  if(talkF===f){f.face=angDamp(f.face,Math.atan2(P.x-f.pos.x,P.z-f.pos.z),dt*6);if(dP>5)closeTalk();}
  else if(f.follow){const i=FRIENDS.filter(o=>o.follow).indexOf(f),a=player.face+Math.PI+(i%2?.7:-.7)*(1+(i>>1)*.5),r=1.4+(i>>1)*.6;
    f.tgt=new THREE.Vector3(P.x+Math.sin(a)*r,0,P.z+Math.cos(a)*r);tmpV.subVectors(f.tgt,f.pos);tmpV.y=0;const d=tmpV.length();
    if(d>25){f.pos.set(f.tgt.x,P.y,f.tgt.z);}else if(d>.4){tmpV.normalize();sp=Math.min(6,1.2+d*2);f.pos.addScaledVector(tmpV,Math.min(d,sp*dt));collide(f.pos);f.face=angDamp(f.face,Math.atan2(tmpV.x,tmpV.z),dt*8);}
    else f.face=angDamp(f.face,player.face,dt*4);}
  else if(dP<2.4&&started){f.face=angDamp(f.face,Math.atan2(P.x-f.pos.x,P.z-f.pos.z),dt*5);if(f.cool<=0){f.cool=14;f.play('wave');friendBubble(f,questReady(f)?'Come talk to me! 💬':rnd(f.info.hi));}}
  else if(f.tgt){tmpV.subVectors(f.tgt,f.pos);tmpV.y=0;const d=tmpV.length();if(d<.6){f.tgt=null;f.wait=3+Math.random()*5;if(Math.random()<.3)f.play(rnd(['dance','twirl','wave']));}else{tmpV.normalize();const old=f.pos.clone();f.pos.addScaledVector(tmpV,dt*1.7);collide(f.pos);if(f.pos.distanceTo(old)<dt*.4){f.stuck=(f.stuck||0)+dt;if(f.stuck>1.5){f.tgt=null;f.stuck=0;}}sp=1.7;f.face=angDamp(f.face,Math.atan2(tmpV.x,tmpV.z),dt*6);}}
  f.cool-=dt;if(f.say){f.sayT-=dt;if(f.sayT<0){f.g.remove(f.say);f.say=null;}}
  const gy=groundAt(f.pos.x,f.pos.z);f.pos.y+=(gy-f.pos.y)*Math.min(1,dt*12);
  f.g.position.copy(f.pos);f.g.rotation.y=f.face+(f.spinY||0);f.update(dt,sp,false);}

function tick(){const rawDt=clock.getDelta(),dt=Math.min(.05,rawDt),t=clock.elapsedTime;if(started)adaptRes(rawDt);
  // movement input
  let ix=joy.x,iy=joy.y;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;if(keys.KeyW||keys.ArrowUp)iy-=1;if(keys.KeyS||keys.ArrowDown)iy+=1;
  let mag=Math.min(1,Math.hypot(ix,iy));if(closetOpen||!started)mag=0;
  const p=player.pos;
  if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx;const n=Math.hypot(ix,iy)||1;const mx=(fx*-iy+rx*ix)/n,mz=(fz*-iy+rz*ix)/n;
    const spd=5*mag;const old=p.clone();p.x+=mx*spd*dt;p.z+=mz*spd*dt;collide(p);
    const g=groundAt(p.x,p.z);if(g-p.y>.45){p.x=old.x;p.z=old.z;}
    player.face=angDamp(player.face,Math.atan2(mx,mz),Math.min(1,dt*12));player.speed=spd;}else player.speed*=.8;
  // vertical
  const gy=groundAt(p.x,p.z);player.vy-=18*dt;p.y+=player.vy*dt;
  if(p.y<=gy){if(!player.onGround&&player.vy<-3)burst(new THREE.Vector3(p.x,gy+.05,p.z),'#ffffff',10,1);p.y=gy;player.vy=0;player.onGround=true;}else if(p.y>gy+.05)player.onGround=false;
  if(p.y<gy+.3&&player.vy<=0&&!player.onGround){p.y=Math.max(p.y,gy);}
  if(ct.on)contestStep(dt);
  if(glamOpen)AG.chair.rotation.y=player.face-AG.rot+Math.PI;
  av.g.position.copy(p);av.tag.visible=!closetOpen;av.update(dt,player.speed,!player.onGround);av.g.rotation.y=player.face+(av.spinY||0);
  // stars
  for(let i=0;i<STARS.length;i++){const s=STARS[i];if(s.got)continue;const dx=s.x-p.x,dz=s.z-p.z,dy=s.m.position.y-(p.y+.9);if(dx*dx+dz*dz<.8&&Math.abs(dy)<1.0){s.got=true;s.m.visible=false;burst(s.m.position.clone());sfx('star');
    SAVE.stars=STARS.map((s,i)=>s.got?i:-1).filter(i=>i>=0);persist();updateStars();const n=SAVE.stars.length;
    if(n===STARS.length){sfx('tada');banner('🌟 You found every star! 🌟');for(let k=0;k<5;k++)setTimeout(()=>burst(new THREE.Vector3(p.x+(Math.random()-.5)*3,p.y+2,p.z+(Math.random()-.5)*3),rnd(['#ff8fc8','#ffd23f','#8fd8ff']),50,4),k*250);
      setTimeout(()=>{STARS.forEach(s=>{s.got=false;s.m.visible=true;});SAVE.stars=[];persist();updateStars();toast('The stars are back! Find them again ⭐');},9000);}
    else toast(`⭐ ${n} of ${STARS.length}!`);questEvent('star');}}
  // zones
  let z=null;for(const zz of ZONES){if(Math.hypot(p.x-zz.x,p.z-zz.z)<zz.r+(zz.d?1:1.4)){z=zz;break;}}z=z||PARK;
  if(z!==curZone){curZone=z;$('#place').textContent=z.name;if(started)questEvent('zone',z.id);if(started){if(z!==PARK)banner(z.name);setTrack(z.music);if(z.id==='parlor'&&!closetOpen)setTimeout(()=>toast(myPet()?'Step on the glowing paw pad to start pet care 🐾':'Adopt a pet first, then bring them here! 🐾'),1600);if(z.id==='bakery'&&!closetOpen)setTimeout(()=>toast('Step on the glowing cupcake pad to design a cake 🎂'),1600);if(z.id==='agency'&&!closetOpen)setTimeout(()=>toast('Step on 🏆 for the model contest, or 💄 to sit at the glam mirror!'),1600);}}
  const padD=Math.hypot(p.x,p.z);if(padD<Z.studio.pad.r&&player.onGround){if(!onPad&&started){onPad=true;openCloset();}}else if(padD>1.6)onPad=false;
  {const pz=Z.parlor,[lx,lz]=pz.toLocal(p.x,p.z),d=Math.hypot(lx-pz.ppad.lx,lz-pz.ppad.lz);if(d<pz.ppad.r&&player.onGround&&!closetOpen){if(!onPPad&&started){onPPad=true;tryParlor();}}else if(d>1.3)onPPad=false;}
  {const bz=Z.bakery,[lx,lz]=bz.toLocal(p.x,p.z),d=Math.hypot(lx-bz.bpad.lx,lz-bz.bpad.lz);if(d<bz.bpad.r&&player.onGround&&!closetOpen){if(!onBPad&&started){onBPad=true;openBakery();}}else if(d>1.3)onBPad=false;}
  {const [lx,lz]=AG.toLocal(p.x,p.z),dc=Math.hypot(lx-AG.cpad.lx,lz-AG.cpad.lz),dg=Math.hypot(lx-AG.gpad.lx,lz-AG.gpad.lz);
    if(dc<AG.cpad.r&&player.onGround&&!closetOpen){if(!onCPad&&started){onCPad=true;openContest();}}else if(dc>1.3)onCPad=false;
    if(dg<AG.gpad.r&&player.onGround&&!closetOpen){if(!onGPad&&started){onGPad=true;openGlam();}}else if(dg>1.3)onGPad=false;}
  let rw=false;{const r=Z.runway;const [lx,lz]=r.toLocal(p.x,p.z);rw=Math.abs(lx)<r.rw.w&&lz>r.rw.z0&&lz<r.rw.z1&&p.y>.2;}
  if(rw!==onRunway){onRunway=rw;$('#poseBtn').style.display=rw?'block':'none';}
  // beach ball
  {const b=Z.beach.ball,bp=b.m.getWorldPosition(tmpV);const dx=bp.x-p.x,dz=bp.z-p.z,d=Math.hypot(dx,dz);if(d<.7&&d>0){const [lvx,lvz]=[dx/d*4,dz/d*4];const c=Math.cos(Z.beach.rot),s=Math.sin(Z.beach.rot);b.vx=lvx*c-lvz*s;b.vz=lvx*s+lvz*c;}
    b.m.position.x+=b.vx*dt;b.m.position.z+=b.vz*dt;b.vx*=.985;b.vz*=.985;b.m.rotation.x+=b.vz*dt*2.5;b.m.rotation.z-=b.vx*dt*2.5;const bd=Math.hypot(b.m.position.x,b.m.position.z);if(bd>9){b.m.position.x*=9/bd;b.m.position.z*=9/bd;b.vx*=-.6;b.vz*=-.6;}}
  stepPushables(p,dt);
  // friends
  for(const f of FRIENDS)stepFriend(f,dt);if(started)talkBtn();
  for(const pt of PETS)stepPet(pt,dt);if(started&&!closetOpen)petButton();
  for(const a of anims)a(t,dt);tickBursts(dt);
  for(const f of onTick)f(dt);
  // camera
  zoomTick();
  const playMode=!closetOpen;
  const ZM={eyes:[.012,.3],lips:[-.058,.26],face:[-.01,.55]}[closetOpen?czoom:'']||null;
  if(ZM)player.face=angDamp(player.face,cam.closetYaw,Math.min(1,dt*8));
  const tPitch=playMode?cam.pitch:ZM?.02:.1,tDist=playMode?cam.dist:ZM?ZM[1]:3.1,tYaw=playMode?cam.yaw:cam.closetYaw;
  if(!started){cam.yaw+=dt*.12;}
  cam.cy=angDamp(cam.cy,tYaw,Math.min(1,dt*(playMode?14:6)));cam.cp+=(tPitch-cam.cp)*Math.min(1,dt*6);cam.cd+=(tDist-cam.cd)*Math.min(1,dt*5);
  const want=ZM?av.head.localToWorld(tmpV.set(0,ZM[0],.1)):tmpV.set(p.x,p.y+(playMode?1.15:.82),p.z);
  if(!cam.fv){cam.fv=want.clone();}cam.fv.lerp(want,Math.min(1,dt*(playMode&&player.speed>.5?22:9)));const tgt=cam.ty.copy(cam.fv);
  const nearT=ZM||glamOpen?.01:.1;if(camera.near!==nearT){camera.near=nearT;camera.updateProjectionMatrix();}
  camera.position.set(tgt.x+Math.sin(cam.cy)*Math.cos(cam.cp)*cam.cd,tgt.y+Math.sin(cam.cp)*cam.cd,tgt.z+Math.cos(cam.cy)*Math.cos(cam.cp)*cam.cd);
  const minY=groundAt(camera.position.x,camera.position.z)+.25;if(camera.position.y<minY)camera.position.y=minY;
  if(playMode)agencyCamClamp(tgt);
  camera.lookAt(tgt);
  if(parlorOpen)parlorCam(dt);
  if(glamOpen)glamCam(dt);
  if(ct.on)contestCam(dt);
  if(bakeryOpen)bakeryCam(dt);
  cakeContestCam(dt);
  petContestCam(dt);
  // shift the picture so the avatar is not hidden behind the closet
  const land=innerWidth>innerHeight*1.25;const voT=closetOpen?1:0;cam.vo+=(voT-cam.vo)*Math.min(1,dt*6);
  if(cam.vo>.002){const W=innerWidth,H=innerHeight;if(land)camera.setViewOffset(W,H,W*.24*cam.vo,0,W,H);else camera.setViewOffset(W,H,0,H*.2*cam.vo,W,H);}else if(camera.view&&camera.view.enabled)camera.clearViewOffset();
  sky.position.copy(camera.position);
  sun.position.copy(p).add(SUN_OFF);sun.target.position.copy(p);
  renderer.render(scene,camera);
  if(wantPhoto){wantPhoto=false;takePhoto();}
  portraitTick();}

function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<innerHeight?62:55;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);}
addEventListener('resize',resize);resize();
document.addEventListener('visibilitychange',()=>{if(document.hidden)music.pause();else if(musicOn&&started&&music.src)music.play().catch(()=>{});});
// Start-up: wait until online.js, challenges.js and seasons.js have added their things too (seasons adds a light,
// and every new light makes the graphics card rebuild all of its shaders), then build the shaders once, in the
// background where the browser allows it, so Tiereyn keeps running on the loading screen. Then show the world.
function showWorld(){renderer.setAnimationLoop(tick);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const l=$('#loading');if(l){l.classList.add('done');setTimeout(()=>l.remove(),600);}$('#welcome').classList.add('show');}));}
// The glam-room mirror draws the world a second time into its own picture, and that picture needs its own set of
// shaders. Build those now too, or the game freezes for a few seconds the first time the mirror comes into view.
function warmUp(){scene.updateMatrixWorld(true);let c;try{c=renderer.compileAsync?renderer.compileAsync(scene,camera):null;
    const rt=AG.mirror.getRenderTarget&&AG.mirror.getRenderTarget();if(rt){renderer.setRenderTarget(rt);const c2=renderer.compileAsync?renderer.compileAsync(scene,camera):null;renderer.setRenderTarget(null);if(c&&c2)c=Promise.all([c,c2]);}}catch(e){renderer.setRenderTarget(null);c=null;}
  // never wait forever: if building the shaders takes too long, just start (the first frame finishes the job)
  Promise.race([c||Promise.resolve(),new Promise(r=>setTimeout(r,25000))]).catch(()=>{}).then(preUpload).then(showWorld);}
// The graphics chip only gets a shape or picture the first time it is on screen, so turning the camera used to stutter
// while thousands of them were sent over. Draw everything once, behind the loading screen, so they are all there already.
function preUpload(){const off=[];try{scene.traverse(o=>{if(o.frustumCulled){o.frustumCulled=false;off.push(o);}});renderer.render(scene,camera);}catch(e){}off.forEach(o=>o.frustumCulled=true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(warmUp,0),{once:true});else setTimeout(warmUp,0);
