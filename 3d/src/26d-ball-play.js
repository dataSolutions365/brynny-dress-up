/* ================= ⚽🏀 BALL PLAY: dribble, kick and pass =================
   Wear the ⚽ Soccer ball or the 🏀 Basketball (Extras) and take it for a walk around town:
   - ⚽ Walk and the ball drops to your feet. You dribble it ahead with little touches; turn and it follows.
     Stand still for a moment and you pick it back up.
   - 🏀 Walk and you bounce it beside you. Stop and you hold it.
   - ⚽ Kick / 🏀 Pass (in the moves wheel) sends it to the nearest townsperson or online friend, and they send
     it back to you. With nobody near, a kick boots it up the field (go get it!) and a pass throws it ahead.
   - The ball is put away during sports, riding and the other hands-on games, like the skateboard (17c).
   Online (bottom of this file): friends see your ball, and a pass to an online friend makes it their ball
   to dribble and pass back. */
const BALL_R={soccer:.11,bball:.12};
// textures, made once per color (called while avatars are built, so these are hoisted functions)
function bbMat(c){const C=bbMat.c||(bbMat.c={});if(C[c])return C[c];const m=phys('#ffffff',{roughness:.6,clearcoat:.15});
  m.map=canvasTex(256,128,(x)=>{x.fillStyle=c;x.fillRect(0,0,256,128);x.strokeStyle='#2a1406';x.lineWidth=5;
    x.beginPath();x.moveTo(0,64);x.lineTo(256,64);x.stroke();for(const v of [64,192]){x.beginPath();x.moveTo(v,0);x.lineTo(v,128);x.stroke();}
    for(const v of [0,128,256]){x.beginPath();x.ellipse(v,64,46,64,0,0,Math.PI*2);x.stroke();}});return C[c]=m;}
function sbMat(c){const C=sbMat.c||(sbMat.c={});if(C[c])return C[c];const m=phys('#ffffff',{roughness:.45,clearcoat:.3});
  m.map=canvasTex(256,128,(x)=>{x.fillStyle=c;x.fillRect(0,0,256,128);x.fillStyle='#2d2d3a';
    const pent=(cx,cy,r)=>{x.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();x.fill();};
    for(let i=0;i<5;i++){pent(i*51+25,40,15);pent(i*51,92,15);}pent(256,92,15);x.fillRect(0,0,256,6);x.fillRect(0,122,256,6);});return C[c]=m;}
const ballMat=(kind,c)=>kind==='soccer'?sbMat(c||'#ffffff'):bbMat(c||'#ff7a1f');
function ballMesh(kind){const m=M(sph(BALL_R[kind],24,16),ballMat(kind),0,-50,0,scene,true,false);m.visible=false;m.userData.kind=kind;return m;}

/* ---------- the poses (called from Avatar.update for you, townspeople and online friends) ---------- */
// a.ballMove = {drib: 0..1 how high the bouncing basketball is, act:'kick'|'pass', t0: when it started}
function ballPose(a,tgt,sp,t){const b=a.ballMove;
  if(b.drib!=null&&!b.act){tgt.a0x=-.42;tgt.a0z=-.12;tgt.e0=-.3-b.drib*.6;}
  if(!b.act)return;const k=performance.now()/1000-b.t0;
  if(b.act==='kick'){if(k<.13){tgt.l0=.6;tgt.k0=1.05;tgt.a1x=.3;tgt.a0x=-.3;}else if(k<.42){tgt.l0=-1.15;tgt.k0=.08;tgt.a1x=-.45;tgt.a0x=.35;tgt.lean=-.06;}else{b.act=null;if(b.drib==null)a.ballMove=null;}}
  else if(b.act==='pass'){if(k<.16){tgt.a0x=tgt.a1x=-1.15;tgt.e0=tgt.e1=-1.7;tgt.a0z=.2;tgt.a1z=-.2;}else if(k<.45){tgt.a0x=tgt.a1x=-1.5;tgt.e0=tgt.e1=-.1;tgt.a0z=.1;tgt.a1z=-.1;tgt.lean=.08;}else{b.act=null;if(b.drib==null)a.ballMove=null;}}}
const ballAct=(a,act)=>{a.ballMove=Object.assign(a.ballMove||{},{act,t0:performance.now()/1000});};
// where an avatar's held ball is: the soccer ball in the left hand, the basketball in the right
const handSpot=(a,kind,out)=>kind==='soccer'?a.arms[1].hand.localToWorld(out.set(0,-.11,.05)):a.arms[0].hand.localToWorld(out.set(0,-.15,.05));
// bouncing the basketball beside you: right under the hand, from the hand down to the ground and back
const DRIB_HZ=2.4;
function dribbleSpot(a,t,out){const u=(t*DRIB_HZ)%1,s=Math.abs(Math.cos(Math.PI*u));handSpot(a,'bball',out);
  const g=groundAt(out.x,out.z)+BALL_R.bball;out.y=g+(Math.max(g,out.y)-g)*s;return {u,s};}
// rolling: turn the ball around the axis across the way it's going
const ballAxis=new THREE.Vector3();
function ballRoll(m,vx,vz,dt,r){const s=Math.hypot(vx,vz);if(s<.01)return;ballAxis.set(vz/s,0,-vx/s);m.rotateOnWorldAxis(ballAxis,s*dt/r);}

/* ---------- my ball ---------- */
var BP={kind:null,st:'hand',p:new THREE.Vector3(),v:new THREE.Vector3(),m:{},to:null,npc:null,hold:0,flyT:0,still:0,passes:0,
  borrowed:null,awayT:0,u:0,sendT:0,sentNone:true,actsKey:'',col:null};
function ownKind(){const e=(SAVE.look&&SAVE.look.extras)||{};return e.ball?'soccer':e.bball?'bball':null;}
function ballKind(){return BP&&BP.borrowed?BP.borrowed.kind:ownKind();}
const ballColor=k=>BP.borrowed?BP.borrowed.c:((SAVE.look.extras||{})[k==='soccer'?'ball':'bball']);
function ballBusy(){return boardBusy()||SK.on;}
// (the moves wheel is first drawn before this file runs, so these are hoisted functions)
function ballActs(){const k=ballKind();return k&&!ballBusy()?[['kick',k==='soccer'?'⚽':'🏀',k==='soccer'?'Kick':'Pass']]:[];}
const ballNet=()=>{const n=window.__net;return n&&n.live()?n:null;};
function myBallMesh(kind){const m=BP.m[kind]||(BP.m[kind]=ballMesh(kind));const c=ballColor(kind);if(m.userData.c!==c){m.userData.c=c;m.material=ballMat(kind,c);}return m;}
function ballHome(quiet){BP.st='hand';BP.to=null;BP.npc=null;BP.v.set(0,0,0);if(!quiet)sfx('pop');}

// who to pass to: the closest townsperson or online friend, a bit more likely the one you're facing
function ballTarget(){const P=player.pos,fx=Math.sin(player.face),fz=Math.cos(player.face);let best=null,bs=1e9;
  const look=(pos,o)=>{const dx=pos.x-P.x,dz=pos.z-P.z,d=Math.hypot(dx,dz);if(d<1.2||d>15)return;const s=d-3.5*(dx*fx+dz*fz)/d;if(s<bs){bs=s;best=o;}};
  for(const f of FRIENDS)if(f.g.visible!==false)look(f.pos,{npc:f,pos:f.pos});
  if(ballNet()&&mapOthers)for(const [id,o] of mapOthers)look(o.pos,{net:id,pos:o.pos,name:o.name});
  return best;}
// throw or kick the ball from p toward a spot
function ballLaunch(kind,from,to){const p=BP.p,v=BP.v;p.copy(from);const dx=to.x-from.x,dz=to.z-from.z,d=Math.hypot(dx,dz)||1;
  if(kind==='soccer'){const s=Math.min(16,d*1.35+2.2);v.set(dx/d*s,d>8?2.6:.4,dz/d*s);}
  else{const T=.42+d*.045,ty=groundAt(to.x,to.z)+1.05;v.set(dx/T,(ty-from.y+.5*14*T*T)/T,dz/T);}
  BP.flyT=0;}
function kickBall(){const kind=ballKind();if(!kind||closetOpen||!started||ballBusy())return;const P=player.pos;
  if(BP.st==='fly'||BP.st==='npc'||BP.st==='away'){toast(kind==='soccer'?'Wait for the ball to come back! ⚽':'Wait for the ball to come back! 🏀');return;}
  if(BP.st!=='hand'&&Math.hypot(BP.p.x-P.x,BP.p.z-P.z)>1.7){toast(kind==='soccer'?'Run to the ball first! ⚽':'Go get the ball first! 🏀');return;}
  const fx=Math.sin(player.face),fz=Math.cos(player.face);
  // soccer: kicked off the ground in front of your feet. basketball: passed from the chest
  const from=kind==='soccer'?new THREE.Vector3(P.x+fx*.42,groundAt(P.x+fx*.42,P.z+fz*.42)+BALL_R.soccer,P.z+fz*.42):new THREE.Vector3(P.x+fx*.35,P.y+1.05,P.z+fz*.35);
  ballAct(av,kind==='soccer'?'kick':'pass');
  const tg=ballTarget();
  if(tg){ballLaunch(kind,from,tg.pos);BP.st='fly';BP.to=tg;
    if(tg.npc){tg.npc.tgt=null;tg.npc.wait=Math.max(tg.npc.wait,4);}
    if(tg.net){const n=ballNet();if(n){n.send({t:'ball',k:'pass',to:tg.net,kind,c:ballColor(kind),p:BP.p.toArray().map(x=>+x.toFixed(2)),v:BP.v.toArray().map(x=>+x.toFixed(2))});
      if(BP.borrowed)BP.borrowed.gone=true;}}}
  else{const d=kind==='soccer'?11:6;ballLaunch(kind,from,new THREE.Vector3(P.x+fx*d,0,P.z+fz*d));if(kind==='soccer')BP.v.y=3.2;BP.st='loose';BP.to=null;}
  BP.still=0;tone(kind==='soccer'?150:220,.08,'sine',.16);tone(kind==='soccer'?90:140,.06,'square',.05,.02);did('ball',kind==='soccer'?'kick':'pass');}

// the ball flying, bouncing and rolling. Returns true when it hits the ground hard enough to make a sound.
const ballOld=new THREE.Vector3();
function ballPhys(kind,p,v,dt){const R=BALL_R[kind];ballOld.copy(p);v.y-=14*dt;p.addScaledVector(v,dt);
  let g=groundAt(p.x,p.z)+R;if(g-ballOld.y>.42+R){p.x=ballOld.x;p.z=ballOld.z;v.x*=-.4;v.z*=-.4;g=groundAt(p.x,p.z)+R;}// a step too tall to roll up
  let thud=false;if(p.y<=g){p.y=g;if(v.y<-1.2){thud=v.y<-2;v.y=-v.y*(kind==='soccer'?.4:.74);}else v.y=0;}
  if(p.y<=g+.02){const f=Math.pow(kind==='soccer'?.32:.5,dt);v.x*=f;v.z*=f;}
  // trees, walls and the edge of the island
  const ox=p.x,oz=p.z;collide(p,R);const nx=p.x-ox,nz=p.z-oz,nl=Math.hypot(nx,nz);if(nl>1e-5){const ux=nx/nl,uz=nz/nl,dot=v.x*ux+v.z*uz;if(dot<0){v.x-=1.6*dot*ux;v.z-=1.6*dot*uz;}}
  return thud;}

const bTmp=new THREE.Vector3(),bTmp2=new THREE.Vector3();
anims.push((t,dt)=>{if(!started||!av)return;
  const kind=ballKind(),P=player.pos,now=performance.now()/1000;
  // the borrowed ball goes away if its owner leaves the room
  if(BP.borrowed&&(!ballNet()||!mapOthers||!mapOthers.has(BP.borrowed.from))&&BP.st!=='fly'){BP.borrowed=null;ballHome(true);return;}
  {const key=kind+(ballBusy()?'b':'');if(key!==BP.actsKey){BP.actsKey=key;renderActions();}}
  for(const k in BP.m)if(k!==kind)BP.m[k].visible=false;
  if(kind!==BP.kind){BP.kind=kind;ballHome(true);if(!kind)av.ballMove=null;}
  if(!kind){ballSend(null);return;}
  const m=myBallMesh(kind),R=BALL_R[kind],busy=ballBusy();
  // in the closet you see it in your hand; during games and skating it's put away
  if(closetOpen||busy){if(BP.st==='fly'&&BP.to&&BP.to.net){BP.st='away';BP.awayT=0;BP.to=null;}else if(BP.st!=='away')ballHome(true);m.visible=false;if(av.handBall)av.handBall.visible=!busy;av.ballMove=null;ballSend(null);return;}
  if(av.handBall)av.handBall.visible=false;m.visible=BP.st!=='away';
  const moving=player.speed>.6,fx=Math.sin(player.face),fz=Math.cos(player.face);
  if(BP.st==='hand'){
    if(kind==='soccer'){if(moving&&player.onGround){BP.st='loose';BP.flyT=1;BP.p.set(P.x+fx*.45,groundAt(P.x+fx*.45,P.z+fz*.45)+R,P.z+fz*.45);BP.v.set(fx*player.speed*1.3,0,fz*player.speed*1.3);BP.still=0;}
      else{handSpot(av,kind,BP.p);if(av.ballMove&&!av.ballMove.act)av.ballMove=null;}}
    else{if(moving&&player.onGround){const d=dribbleSpot(av,t,BP.p);if(BP.u<.5&&d.u>=.5)tone(110,.05,'sine',.07);BP.u=d.u;av.ballMove=Object.assign(av.ballMove||{},{drib:d.s});}
      else{handSpot(av,kind,BP.p);if(av.ballMove){av.ballMove.drib=null;if(!av.ballMove.act)av.ballMove=null;}}}
    m.position.copy(BP.p);}
  else{if(av.ballMove&&av.ballMove.drib!=null){av.ballMove.drib=null;if(!av.ballMove.act)av.ballMove=null;}}
  if(BP.st==='loose'||BP.st==='fly'){const vx=BP.v.x,vz=BP.v.z;
    if(ballPhys(kind,BP.p,BP.v,dt))tone(kind==='soccer'?95:115,.05,'sine',.07);
    ballRoll(m,vx,vz,dt,R);m.position.copy(BP.p);
    const dx=BP.p.x-P.x,dz=BP.p.z-P.z,d=Math.hypot(dx,dz),onG=BP.p.y<groundAt(BP.p.x,BP.p.z)+R+.05;
    if(BP.st==='loose'){BP.flyT+=dt;
      if(kind==='soccer'){
        // dribbling: the ball at your feet gets a little touch ahead the way you're walking
        if(d<.55&&onG&&BP.p.y<P.y+.5){if(moving){const s=player.speed*1.35+.5;BP.v.set(fx*s,0,fz*s);BP.still=0;if(!BP.tap)tone(140,.03,'sine',.05);BP.tap=1;}
          else if(BP.flyT>.4){BP.v.x*=.6;BP.v.z*=.6;if(d<.38&&d>1e-4){BP.p.x=P.x+dx/d*.38;BP.p.z=P.z+dz/d*.38;}}}else BP.tap=0;
        // stand still next to it and you pick it up
        if(!moving&&d<1.4&&Math.hypot(BP.v.x,BP.v.z)<.4){BP.still+=dt;if(BP.still>2.2)ballHome();}else BP.still=0;}
      else if(BP.flyT>.6&&d<.8&&BP.p.y<P.y+1.6){ballHome();}// walk up to the basketball to pick it up
      if(d>35){ballHome(true);toast(kind==='soccer'?'⚽ Your ball is back!':'🏀 Your ball is back!');}}
    else{// passing to someone: steer it toward them as it goes, and they catch it when it gets there
      BP.flyT+=dt;const tg=BP.to,tp=tg.me?P:tg.npc?tg.npc.pos:(mapOthers&&mapOthers.get(tg.net)||{}).pos;
      if(!tp){BP.st='loose';BP.to=null;}
      else{const ex=tp.x-BP.p.x,ez=tp.z-BP.p.z,ed=Math.hypot(ex,ez),hs=Math.hypot(BP.v.x,BP.v.z);
        if(kind==='soccer'&&onG&&hs>.3&&ed>.2){const k=Math.min(1,dt*5);BP.v.x+=(ex/ed*hs-BP.v.x)*k;BP.v.z+=(ez/ed*hs-BP.v.z)*k;}
        const reach=ed<.8&&BP.p.y<tp.y+1.8,stopped=hs<.6&&onG&&ed<5;
        if(reach||stopped||BP.flyT>5){
          if(tg.me){BP.passes++;BP.to=null;sfx('pop');
            if(kind==='soccer'){BP.st='loose';BP.flyT=1;BP.v.set(0,0,0);if(d>.5){BP.p.x=P.x+fx*.45;BP.p.z=P.z+fz*.45;}}else ballHome(true);
            if(BP.passes%5===0)banner(`${kind==='soccer'?'⚽':'🏀'} ${BP.passes} passes in a row!`);}
          else if(tg.npc){BP.st='npc';BP.npc=tg.npc;BP.hold=.9+Math.random()*.6;BP.to=null;const f=tg.npc;f.tgt=null;f.wait=Math.max(f.wait,3);
            friendBubble(f,rnd(kind==='soccer'?['Nice pass! ⚽','Got it! 🙌','Ooh, good kick!','Here it comes back!']:['Nice pass! 🏀','Got it! 🙌','Catch! 🏀','Good one!']));}
          else{BP.st='away';BP.awayT=0;BP.to=null;if(BP.borrowed&&BP.borrowed.gone){BP.borrowed=null;}}}}}}
  else if(BP.st==='npc'){const f=BP.npc;f.face=Math.atan2(P.x-f.pos.x,P.z-f.pos.z);f.g.rotation.y=f.face;f.tgt=null;f.wait=Math.max(f.wait,1.5);
    const ffx=Math.sin(f.face),ffz=Math.cos(f.face);
    if(kind==='soccer')BP.p.set(f.pos.x+ffx*.42,groundAt(f.pos.x+ffx*.42,f.pos.z+ffz*.42)+R,f.pos.z+ffz*.42);else handSpot(f,kind,BP.p);
    m.position.copy(BP.p);BP.hold-=dt;
    if(BP.hold<=0){ballAct(f,kind==='soccer'?'kick':'pass');if(kind==='bball')BP.p.set(f.pos.x+ffx*.35,f.pos.y+1.05,f.pos.z+ffz*.35);
      ballLaunch(kind,BP.p,P);BP.st='fly';BP.to={me:1};BP.npc=null;tone(kind==='soccer'?150:220,.08,'sine',.12);}
    if(Math.hypot(f.pos.x-P.x,f.pos.z-P.z)>40)ballHome(true);}
  else if(BP.st==='away'){m.visible=false;BP.awayT+=dt;// an online friend has it: they pass it back
    if(BP.awayT>45){ballHome(true);toast(kind==='soccer'?'⚽ Your ball is back!':'🏀 Your ball is back!');}}
  ballSend(kind,dt);});

/* ---------- online: friends see your ball (one entry in SHOW, 26c-friends-see.js) ----------
   SHOW sends what kind of ball you have and what it's doing when that changes: in your hand, bouncing beside you
   (their phone bounces it in time with your walk), out on the ground (then its spot comes 10 times a second as
   {t:'ball',k:'at',p}), put away, or gone to someone else. A pass is {t:'ball',k:'pass',to,kind,c,p,v}. */
function ballMd(){const k=ballKind();if(!k)return null;if(closetOpen)return 'hand';if(ballBusy())return 'away';
  if(BP.st==='away'||(BP.st==='fly'&&BP.to&&BP.to.net))return 'gone';
  if(BP.st==='hand')return av&&av.ballMove&&av.ballMove.drib!=null?'drib':'hand';return 'free';}
SHOW.push({k:'ball',
  mine(){const kind=ballKind();return kind?{kind,c:ballColor(kind)||null,md:ballMd()}:null;},
  on(f,d){if(d.kind!=='soccer'&&d.kind!=='bball')return null;const m=ballMesh(d.kind);m.material=ballMat(d.kind,typeof d.c==='string'?d.c.slice(0,30):null);return {m};},
  step(f,d,dt,h){const a=f.a,m=h.m,ex=(a.look&&a.look.extras)||{},theirs=!!a.handBall&&!!(d.kind==='soccer'?ex.ball:ex.bball);
    const drib=d.md==='drib';if(!drib&&a.ballMove&&a.ballMove.drib!=null){a.ballMove.drib=null;if(!a.ballMove.act)a.ballMove=null;}
    if(a.handBall)a.handBall.visible=d.md==='hand'&&theirs;
    m.visible=!(d.md==='hand'&&theirs)&&d.md!=='away'&&d.md!=='gone';if(!m.visible)return;
    if(drib){const r=dribbleSpot(a,performance.now()/1000,m.position);a.ballMove=Object.assign(a.ballMove||{},{drib:r.s});return;}
    if(d.md==='hand'){handSpot(a,d.kind,m.position);return;}
    if(!f.ballAt)return;bTmp2.copy(m.position);if(m.position.distanceTo(f.ballAt)>6)m.position.copy(f.ballAt);else m.position.lerp(f.ballAt,Math.min(1,dt*12));
    ballRoll(m,(m.position.x-bTmp2.x)/Math.max(dt,1e-3),(m.position.z-bTmp2.z)/Math.max(dt,1e-3),dt,BALL_R[d.kind]);},
  off(f,h){if(!h)return;scene.remove(h.m);const a=f.a;if(a){if(a.handBall)a.handBall.visible=true;if(a.ballMove&&a.ballMove.drib!=null){a.ballMove.drib=null;if(!a.ballMove.act)a.ballMove=null;}}}});
// while my ball is out on the ground, tell the room where it is
function ballSend(kind,dt){const n=ballNet();if(!n||!kind||ballMd()!=='free')return;BP.sendT-=dt;if(BP.sendT>0)return;BP.sendT=.1;
  n.send({t:'ball',k:'at',p:BP.p.toArray().map(x=>+x.toFixed(2))});}
function ballFromNet(id,name,d){if(!d||d.t!=='ball')return;const o=mapOthers&&mapOthers.get(id);
  if(d.k==='at'&&Array.isArray(d.p)&&o){(o.ballAt||(o.ballAt=new THREE.Vector3())).set(+d.p[0]||0,+d.p[1]||0,+d.p[2]||0);}
  else if(d.k==='pass'&&(d.kind==='soccer'||d.kind==='bball')){if(o&&o.a)ballAct(o.a,d.kind==='soccer'?'kick':'pass');
    const n=ballNet(),me=n&&n.id&&n.id();if(!me||d.to!==me)return;
    // it's coming to me: it's my ball now (my own again if it's the one I passed away)
    BP.borrowed=d.kind===ownKind()?null:{kind:d.kind,c:typeof d.c==='string'?d.c.slice(0,30):null,from:id};
    BP.kind=ballKind();BP.st='fly';BP.to={me:1};BP.flyT=0;BP.npc=null;
    if(Array.isArray(d.p))BP.p.set(+d.p[0]||0,+d.p[1]||0,+d.p[2]||0);if(Array.isArray(d.v))BP.v.set(+d.v[0]||0,+d.v[1]||0,+d.v[2]||0);
    toast(`${name||'Your friend'} passed you the ball! Tap ${d.kind==='soccer'?'⚽ Kick':'🏀 Pass'} to send it back`);}}
addEventListener('load',()=>{if(window.__net)window.__net.on(ballFromNet);if(window.__game)window.__game.ball=()=>BP;});
