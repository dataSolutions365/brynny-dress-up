/* ================= 🤸 JUMP PARK: bouncing, flips, slam dunks and the foam pit =================
   The park itself (trampolines, pads, the block, the foam pit, the hoops) is built in 12e-place-jump-park.js.
   - Step onto any trampoline and you start bouncing on your own (25-game-loop.js asks jpLand() when you land).
   - Tap Jump (or Space) while bouncing and the next bounce goes higher, up to a big bounce. Big bounces do a trick:
     front flip, back flip, a spin, and a double flip at the very top.
   - Bounce up to a hoop on the back wall and grab the rim for a slam dunk.
   - Jump off the padded block into the foam pit and the cubes fly everywhere.
   - Friends online see your flips (the 'flip' entry in SHOW at the bottom); townspeople bounce when they're on a trampoline. */
const JPS={on:false,want:0,since:9,base:0,peaked:true,trick:null,trickN:0,cy:null,wade:0,hinted:false,tk:0};
const JP_MIN=5.4,JP_MAX=11,JP_FLIP=9;// bounce speeds: a gentle bounce, the biggest bounce, and how big a bounce does a trick
const JP_TRICKS=[{k:'front',name:'Front flip',ax:'x',full:Math.PI*2},{k:'back',name:'Back flip',ax:'x',full:-Math.PI*2},{k:'spin',name:'Spin',ax:'y',full:Math.PI*2},
  {k:'back',name:'Back flip',ax:'x',full:-Math.PI*2},{k:'front',name:'Front flip',ax:'x',full:Math.PI*2}];
const JP_DOUBLE=[{k:'dfront',name:'DOUBLE front flip',ax:'x',full:Math.PI*4},{k:'dback',name:'DOUBLE back flip',ax:'x',full:-Math.PI*4}];
const jpTrickById=k=>[...JP_TRICKS,...JP_DOUBLE].find(t=>t.k===k);
const jpSave=()=>SAVE.jump||(SAVE.jump={best:0,flips:0,dunks:0});
const jpBusy=()=>!!(barnRide||SK.on||BIKE.on);// on a ride, a skateboard or the bike you just roll over the trampolines
function jpLocal(x,z){const J=Z.jump;if(Math.abs(x-J.x)>9||Math.abs(z-J.z)>9)return null;return J.toLocal(x,z);}

// you just came down on the ground at height gy: if it's a trampoline, bounce (return true), otherwise land normally
function jpLand(p,gy){const L=jpLocal(p.x,p.z);if(!L||jpBusy()){if(JPS.on)jpStop();return false;}
  const T=jpMatAt(L[0],L[1]),impact=Math.max(0,-player.vy);
  if(!T){if(JPS.on)jpStop();const P=JP.pit;if(impact>2.5&&L[0]>P.x0&&L[0]<P.x1&&L[1]>P.z0&&L[1]<P.z1)jpSplash(L[0],L[1],impact);return false;}
  const v=JPS.want>0?Math.min(JP_MAX,Math.max(7.6,impact+2.1)):Math.max(JP_MIN,impact*.8);
  if(JPS.trick)jpTrickDone();
  p.y=gy;player.vy=v;player.onGround=false;JPS.on=true;JPS.want=0;JPS.since=0;JPS.base=gy;JPS.peaked=false;
  T.v-=Math.min(2.6,.6+impact*.2);// the mat sinks under you and springs back
  const k=v/JP_MAX;tone(150+k*120,.22,'sine',.13,0,420+k*380);tone(90,.12,'triangle',.07);
  if(v>=JP_FLIP-.01)jpTrickStart(v);
  if(!JPS.hinted&&JPS.since===0){JPS.hinted=true;setTimeout(()=>toast(isTouch?'Tap ⬆️ Jump each time you land to bounce higher! 🤸':'Press Space each time you land to bounce higher! 🤸'),400);}
  return true;}
// the Jump button while bouncing: bounce higher on the next landing (or right now, if you only just took off)
function jpJump(){if(!JPS.on||jpBusy())return false;
  if(JPS.since<.14&&player.vy>0){player.vy=Math.min(JP_MAX,player.vy+2.1);if(player.vy>=JP_FLIP&&!JPS.trick)jpTrickStart(player.vy);sfx('jump');}
  else JPS.want=.5;
  return true;}
function jpStop(){JPS.on=false;JPS.want=0;if(JPS.trick){JPS.trick=null;av.g.rotation.x=0;}}

function jpTrickStart(v){const S=jpSave();const list=v>=JP_MAX-.3?JP_DOUBLE:JP_TRICKS;const tr=list[(JPS.trickN++)%list.length];
  JPS.trick={...tr,t:0,T:2*v/18};toast(`🤸 ${tr.name}!`);}
function jpTrickDone(){const tr=JPS.trick;JPS.trick=null;av.g.rotation.x=0;if(!tr||tr.t<tr.T*.7)return;
  const S=jpSave();S.flips=(S.flips||0)+1;persist();if(window.__game&&window.__game.onJump)window.__game.onJump('flip',tr.k);
  burst(new THREE.Vector3(player.pos.x,player.pos.y+1,player.pos.z),rnd(['#ffd21f','#ff6fae','#b388ff','#4fb6ff']),18,2.2,.2);}
// turn an avatar for a trick: x tricks flip head over heels around the hips, y tricks spin around
function jpPose(g,tr,f){const ang=tr.full*f;g.rotation.order='YXZ';
  if(tr.ax==='y'){g.rotation.y+=ang;g.rotation.x=0;return;}
  const P=.85,th=g.rotation.y,s=Math.sin(ang);g.rotation.x=ang;g.position.x-=Math.sin(th)*P*s;g.position.z-=Math.cos(th)*P*s;g.position.y+=P-P*Math.cos(ang);}
const jpEase=f=>f>=1?1:(1-Math.cos(Math.PI*f))/2;

// the camera follows only part of each bounce, so the screen doesn't jump up and down with you
function jpCamY(py,dt){if(JPS.on){const tgt=JPS.base+(py-JPS.base)*.6;JPS.cy=JPS.cy==null?py:JPS.cy+(tgt-JPS.cy)*Math.min(1,dt*5);return JPS.cy;}
  if(JPS.cy!=null){JPS.cy+=(py-JPS.cy)*Math.min(1,dt*8);if(Math.abs(py-JPS.cy)<.01)JPS.cy=null;else return JPS.cy;}return py;}

// a big landing in the foam pit throws cubes everywhere
function jpSplash(lx,lz,impact){const P=JP.pit,k=Math.min(1.6,impact/8);
  for(const c of P.cubes){const dx=c.bx-lx,dz=c.bz-lz,d=Math.hypot(dx,dz);if(d>1.3*k+.4)continue;const f=1-d/(1.3*k+.5);
    c.live=true;c.vy=(2.5+Math.random()*3)*f*k+.8;c.vx=(dx/(d||1))*(1.5+Math.random()*2)*f;c.vz=(dz/(d||1))*(1.5+Math.random()*2)*f;}
  tone(220,.25,'sine',.12,0,90);tone(500,.18,'triangle',.05,.03,200);for(let i=0;i<5;i++)tone(300+Math.random()*500,.06,'sine',.04,.05+i*.04);
  if(window.__game&&window.__game.onJump)window.__game.onJump('pit');}

// grab the rim: a ball drops through the net
const JPB=[];
function jpDunk(h){const S=jpSave();S.dunks=(S.dunks||0)+1;persist();h.cool=1.4;h.swish=1;h.shake=1;
  const z=Z.jump,b=M(sph(.12,16,12),phys('#ff7a1f',{roughness:.6}),h.x,h.y+.3,h.z,z.g,true,false);JPB.push({m:b,vy:-1,t:0});
  tone(523,.1,'triangle',.12);tone(659,.1,'triangle',.12,.08);tone(784,.22,'triangle',.14,.16);tone(120,.15,'sine',.15,.02);
  const [wx,wz]=z.toWorld(h.x,h.z);burst(new THREE.Vector3(wx,h.y,wz),'#ff8a1f',30,2.6,.22);
  toast(S.dunks===1?'🏀 SLAM DUNK! You reached the rim!':`🏀 SLAM DUNK! (${S.dunks})`);if(window.__game&&window.__game.onJump)window.__game.onJump('dunk');}

onTick.push(dt=>{if(!Z.jump||!JP.block)return;const p=player.pos,t=clock.elapsedTime;
  // the mats spring back after you land
  for(const T of JP.mats){if(T.dip===0&&T.v===0)continue;T.v+=(-T.dip*160-T.v*11)*dt;T.dip+=T.v*dt;if(Math.abs(T.dip)<.001&&Math.abs(T.v)<.01){T.dip=0;T.v=0;}
    T.m.position.y=JP.MAT+Math.max(-.18,Math.min(.06,T.dip));}
  for(const h of JP.hoops)h.cool-=dt;
  for(let i=JPB.length-1;i>=0;i--){const b=JPB[i];b.t+=dt;b.vy-=12*dt;b.m.position.y+=b.vy*dt;b.m.rotation.x+=dt*6;if(b.m.position.y<JP.MAT+.12){b.m.position.y=JP.MAT+.12;b.vy=-b.vy*.55;}
    if(b.t>2.2){b.m.parent.remove(b.m);b.m.geometry.dispose();JPB.splice(i,1);}}
  // first time you walk in: how it works
  if(curZone===Z.jump&&!JPS.hinted&&started&&!JPS.tk){JPS.tk=1;setTimeout(()=>{if(!JPS.on)toast('Hop on a trampoline and bounce! 🤸 Tap Jump when you land to go higher');},1500);}
  // townspeople bounce when they're on a trampoline
  for(const f of FRIENDS){const L=jpLocal(f.pos.x,f.pos.z);if(L&&jpMatAt(L[0],L[1])){f.ph=f.ph??Math.random()*6;const s=Math.abs(Math.sin(t*3.6+f.ph));f.g.position.y=JP.MAT+s*.85;}}
  if(!JPS.on){
    // wading through the foam pit nudges the cubes
    const L=jpLocal(p.x,p.z),P=JP.pit;if(L&&L[0]>P.x0&&L[0]<P.x1&&L[1]>P.z0&&L[1]<P.z1&&player.speed>.5){JPS.wade-=dt;if(JPS.wade<=0){JPS.wade=.12;
      for(const c of P.cubes){if(c.live||c.by<0)continue;const d=Math.hypot(c.bx-L[0],c.bz-L[1]);if(d<.55&&Math.random()<.5){c.live=true;c.vy=1+Math.random()*1.4;c.vx=(c.bx-L[0])*2;c.vz=(c.bz-L[1])*2;}}}}
    return;}
  JPS.want-=dt;JPS.since+=dt;
  if(jpBusy()||!jpLocal(p.x,p.z)){jpStop();return;}
  // how high did that go?
  if(!JPS.peaked&&player.vy<=0){JPS.peaked=true;const hgt=p.y-JPS.base,S=jpSave();if(hgt>2&&hgt>(S.best||0)+.25){S.best=Math.round(hgt*10)/10;persist();if(hgt>3)toast(`🏆 Your highest bounce yet: ${S.best.toFixed(1)} m!`);}}
  // the trick
  if(JPS.trick){const tr=JPS.trick;tr.t+=dt;jpPose(av.g,tr,jpEase(Math.min(1,tr.t/(tr.T*.8))));}
  // a hoop right above you?
  const L=jpLocal(p.x,p.z);for(const h of JP.hoops){if(h.cool>0)continue;if(Math.hypot(L[0]-h.x,L[1]-h.z)<.9&&p.y+2.05>h.y&&p.y+1.2<h.y+.2)jpDunk(h);}});

// 👭 friends online see your flips and spins
SHOW.push({k:'flip',
  mine(){const tr=JPS.trick;return tr?{k:tr.k,n:JPS.trickN,T:Math.round(tr.T*100)/100}:null;},
  on(f,d){const tr=jpTrickById(d.k);return tr?{tr:{...tr,T:Math.max(.3,Math.min(2,+d.T||1))},t:0}:null;},
  step(f,d,dt,h){if(!h||!f.a)return;h.t+=dt;const tr=h.tr;if(h.t>tr.T){f.a.g.rotation.x=0;return;}jpPose(f.a.g,tr,jpEase(Math.min(1,h.t/(tr.T*.8))));},
  off(f,h){if(f.a)f.a.g.rotation.x=0;}});
// for the test (3d/tests/jump-park.mjs)
Object.assign(window.__game,{JP,jumpPark:()=>({on:JPS.on,trick:JPS.trick&&JPS.trick.k,save:{...jpSave()},pitLive:JP.pit.cubes.filter(c=>c.live).length})});
