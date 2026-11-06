/* ================= 🏀 3-ON-3 BASKETBALL: you and two teammates against the 🐻 Bears =================
   Half-court streetball on the Basketball Court (12c-place-sports.js), first team to 11 wins (2s and 3s).
   It plugs into 24e-sports.js as SP.ext.v3 (shared HUD, big button, ✕ Leave and menu card). Unlike the other
   SP.ext games you walk and run freely with the joystick (SP.ext.v3.lock only holds you still while you shoot or dunk).
   - Teams come from the 🧢 team picker (24e3-team-picker.js, sport 'basketball'): 🎯 throwing is how well they shoot,
     ⚡ speed how fast they run, 🙌 catching how well they hold on to the ball.
   - Everything is in the court's own space (hoop toward -z). V.us[0] is you (ME), the rest are computer players:
     each guards the player with the same number on the other team (V.them[0] guards you).
   - Your ball: hold SHOOT and let go in the green (like 1-on-1), DUNK up close, or 🤾 PASS to the most open teammate.
     A teammate's ball: 🙋 CALL FOR IT and they pass it to you. The Bears' ball: 🖐️ STEAL when you're close, or jump to block.
   - A pass flies to the catcher and can be picked off by a defender standing in the way.
   - Challenges: did('sport','v3win'), did('sport','assist') (your pass, a teammate scores) and did('play','v3').
   window.__bb3 is for tests (3d/tests/basketball-3v3.mjs). */
TP_WANT.basketball={spd:1.2,thr:1.4,cat:1,kck:.1};
const BB3={on:false,us:[],them:[],all:[],holder:null,pass:null,next:0,nextFor:'us',lastPass:null,callCD:0,hudT:0,clock:0,looseT:0,lastTeam:'us'};
const BB3_WIN=11,BB3_COL={us:'#2f6fd9',them:'#d62839'};
// a computer player in a real basketball kit: jersey and shorts in the team colour, court sneakers
const BB3_AV=new Map();
function bb3Avatar(r,c){const k=r.n+c;let a=BB3_AV.get(k);
  if(!a){const L=rosterLook(r,c);L.top={id:'bballjersey',c};L.bottom={id:'bballshorts',c};L.shoes={id:'courtkicks',c:'#ffffff'};
    a=new Avatar(L,r.n,c);a.g.visible=false;Z.court.g.add(a.g);BB3_AV.set(k,a);}return a;}

/* ---------- the pass button (next to SHOOT) ---------- */
{const st=document.createElement('style');st.textContent=`
#bb3Pass{position:fixed;display:none;z-index:6;border-radius:50%;width:84px;height:84px;font-size:14px;font-weight:700;color:#fff;line-height:1.1;
  right:calc(env(safe-area-inset-right) + 134px);bottom:calc(env(safe-area-inset-bottom) + 140px);
  background:radial-gradient(circle at 35% 30%,#8fd0ff,#2f6fd9);border:4px solid rgba(255,255,255,.85);box-shadow:0 6px 20px rgba(47,111,217,.5);touch-action:none}
#bb3Pass:active{transform:scale(.93)}
body.bb3-me #bb3Pass{display:block}
@media (max-height:520px){#bb3Pass{width:72px;height:72px;font-size:13px;bottom:calc(env(safe-area-inset-bottom) + 132px)}}`;
 document.head.appendChild(st);const b=document.createElement('button');b.id='bb3Pass';document.body.appendChild(b);
 b.addEventListener('pointerdown',e=>{e.preventDefault();bb3PassMe();});b.addEventListener('contextmenu',e=>e.preventDefault());
 addEventListener('keydown',e=>{if(SP.mode==='v3'&&!e.repeat&&e.target.tagName!=='INPUT'&&(e.code==='KeyP'||e.code==='KeyE')){bb3PassMe();e.preventDefault();}});}

/* ---------- helpers ---------- */
const bb3Foes=A=>A.team==='us'?BB3.them:BB3.us;
const bb3Mates=A=>(A.team==='us'?BB3.us:BB3.them).filter(o=>o!==A);
const bb3Hoop=A=>Math.hypot(A.p.x,A.p.z-SPC.HZ);
function bb3Near(A,list){let best=null,d=1e9;for(const o of list){const dd=Math.hypot(o.p.x-A.p.x,o.p.z-A.p.z);if(dd<d){d=dd;best=o;}}return {o:best,d};}
const bb3Name=A=>A.me?'You':A.name;
function bb3Hold(A){const V=BB3,b=SP.ball;V.holder=A;SP.poss=A?(A.me?'me':'cpu'):null;
  if(A&&b){b.st='hold';b.by=A.me?'me':A.team==='us'?'mate':'cpu';b.team=A.team;V.lastTeam=A.team;A.hold=0;A.think=.45+Math.random()*.35;A.shootT=-1;A.plan=null;}
  V.looseT=0;bb3Hud();}
function bb3Hud(){const V=BB3,h=V.holder;spHud('🏀 3-on-3',`${SP.score} - ${SP.opp}`,h?(h.me?'your ball':h.team==='us'?`${h.name}'s ball`:`🐻 ${h.name}'s ball`):V.pass?'pass!':'loose ball!');}
function bb3Board(zb){zb.draw(SP.score,SP.opp,'EAGLES · BEARS');}
// the most open teammate to pass to (how far the nearest defender is), a little keener on players in front of you
function bb3PassTarget(A){let best=null,bs=-1e9;const f=A.me?player.face-SP.z.rot:A.face;
  for(const o of bb3Mates(A)){const open=bb3Near(o,bb3Foes(A)).d,dx=o.p.x-A.p.x,dz=o.p.z-A.p.z,dl=Math.hypot(dx,dz)||1;
    const ahead=(Math.sin(f)*dx+Math.cos(f)*dz)/dl;const s=Math.min(open,3)+ahead*.6+(o.me?.8:0)-(dl>7?1:0);if(s>bs){bs=s;best={o,open};}}return best;}

/* ---------- starting a game ---------- */
function bb3Pick(){if(SP.mode)return;teamPick({sport:'basketball',size:3,title:'Pick your team: 3-on-3 basketball',done:(us,them)=>bb3Start(us,them),cancel:()=>{}});}
function bb3Actor(r,team){const a=bb3Avatar(r,BB3_COL[team]);a.g.visible=true;
  return {r,name:r.n,team,a,p:new THREE.Vector3(),vy:0,face:0,spot:null,spotT:0,stealCD:1,shootT:-1,plan:null,hold:0,think:0,follow:0,triedInt:false,drive:false};}
function bb3Start(us,them){if(SP.mode)return;const V=BB3;spCloseMenu();
  for(const a of BB3_AV.values())a.g.visible=false;
  const ME={me:true,name:'You',team:'us',a:av,p:new THREE.Vector3(),vy:0,face:0,stealCD:0,shootT:-1,hold:0};
  V.us=[ME,...us.slice(0,2).map(r=>bb3Actor(r,'us'))];V.them=them.slice(0,3).map(r=>bb3Actor(r,'them'));V.all=[...V.us,...V.them];V.me=ME;
  V.us.forEach((A,i)=>A.mark=V.them[i]);V.them.forEach((A,i)=>A.mark=V.us[i]);
  SP.mode='v3';SP.z=Z.court;SP.score=0;SP.opp=0;SP.shots=0;SP.t=0;SP.hold=null;SP.rel=null;SP.dunk=null;SP.next=0;SP.poss=null;SP.cam.init=false;SP.msgT=0;
  for(const b of SP.balls.slice())spDropBall(b);
  closeMap&&closeMap();joy.id=null;joy.x=joy.y=0;$('#joy').style.display='none';
  V.on=true;V.next=0;V.pass=null;V.lastPass=null;V.clock=0;spBody(true,true);did('play','v3');
  bb3Check('us');setTrack('stadium');
  toast(`🦅 Eagles: You, ${V.us[1].name} and ${V.us[2].name}. First to ${BB3_WIN} wins! Tap 🤾 PASS to pass.`);}
// check ball at the top of the key: the team with the ball spreads out, the other team guards
function bb3Check(team){const V=BB3,C=SPC,z=SP.z;for(const b of SP.balls.slice())spDropBall(b);
  const b=spNewBall();SP.ball=b;V.pass=null;SP.rel=null;SP.hold=null;$('#spMeter').classList.remove('show');
  const top=C.HZ+5.5,OFF=[[0,top],[-3.3,C.HZ+3],[3.3,C.HZ+3]],DEF=[[0,C.HZ+4.2],[-2.6,C.HZ+2.1],[2.6,C.HZ+2.1]];
  const O=team==='us'?V.us:V.them,D=team==='us'?V.them:V.us;
  const put=(A,[x,w],tx,tz)=>{if(A.me){spSetWorld(z,x,w);player.face=spFace(z,x,w,tx,tz);player.vy=0;A.p.set(x,0,w);}
    else{A.p.set(x,0,w);A.vy=0;A.shootT=-1;A.plan=null;A.spot=null;A.follow=0;A.face=Math.atan2(tx-x,tz-w);}};
  O.forEach((A,i)=>put(A,OFF[i],0,C.HZ));D.forEach((A,i)=>put(A,DEF[i],OFF[i][0],OFF[i][1]));
  bb3Hold(O[0]);cam.yaw=spFace(z,0,top,0,C.HZ)+Math.PI;cam.cy=cam.yaw;spBoard();
  if(team==='them')toast(`🐻 Bears' ball. Guard ${O[0].name}: get close and tap STEAL, or jump to block!`);}

/* ---------- passing ---------- */
function bb3Pass(A,to){const V=BB3,b=SP.ball;if(!b||V.holder!==A)return;
  const s=b.p.clone();if(A.me&&s.y<.7)s.y=player.pos.y+1.05;const d=Math.hypot(to.p.x-s.x,to.p.z-s.z);
  V.pass={from:A,to,s,t:0,T:Math.max(.28,Math.min(.85,.12+d/9)),arc:.12+d*.05};V.holder=null;SP.poss=null;b.st='pass';
  for(const o of V.all)o.triedInt=false;V.lastPass={from:A,to,t:V.clock};A.face=Math.atan2(to.p.x-A.p.x,to.p.z-A.p.z);
  if(A.me){player.face=A.face+SP.z.rot;did('sport','pass');}
  tone(500,.06,'triangle',.07);bb3Hud();}
function bb3PassMe(){const V=BB3;if(SP.mode!=='v3'||SP.menu||V.holder!==V.me||SP.hold||SP.rel||SP.dunk)return;const t=bb3PassTarget(V.me);if(t)bb3Pass(V.me,t.o);}
const _bbV=new THREE.Vector3();
function bb3PassStep(dt){const V=BB3,P=V.pass,b=SP.ball;P.t+=dt;const k=Math.min(1,P.t/P.T),to=P.to;
  _bbV.set(to.p.x,(to.me?player.pos.y:to.p.y)+1.05,to.p.z);b.p.lerpVectors(P.s,_bbV,k);b.p.y+=Math.sin(k*Math.PI)*P.arc;b.m.position.copy(b.p);b.m.rotation.x+=dt*12;
  // a defender standing in the passing lane can pick it off
  if(k>.2&&k<.9)for(const o of bb3Foes(P.from)){if(o.triedInt)continue;const d=Math.hypot(o.p.x-b.p.x,o.p.z-b.p.z);if(d>.5||b.p.y>2.3)continue;o.triedInt=true;
    const ch=o.me?.5:P.from.me?.2:.28;if(Math.random()<ch){V.pass=null;bb3Hold(o);
      if(o.me){spSay('🖐️ You picked it off!');did('sport','steal');tone(990,.12,'triangle',.1);}else spSay(o.team==='them'?`🖐️ ${o.name} intercepts!`:`🖐️ ${o.name} picks it off!`);return;}}
  if(k>=1){V.pass=null;bb3Hold(to);if(to.me)tone(700,.05,'sine',.06);}}

/* ---------- your buttons ---------- */
function bb3CanDunk(){const V=BB3,b=SP.ball;if(V.holder!==V.me||!b||b.st!=='hold'||SP.dunk||SP.hold||SP.rel)return false;
  const l=V.me.p.copy(spLocal(SP.z,player.pos));return Math.hypot(l.x,l.z-SPC.HZ)<2.1&&l.z>SPC.HZ-.2;}
function bb3Press(){const V=BB3,b=SP.ball,h=V.holder;if(SP.menu||!b)return;
  if(h===V.me){if(b.st!=='hold'||SP.dunk||SP.hold||SP.rel)return;
    if(bb3CanDunk()){b.team='us';b.shooter=V.me;V.holder=null;SP.poss='me';spDunk();return;}
    SP.hold={t:0};$('#spMeter').classList.add('show');tone(440,.05,'sine',.06);return;}
  if(h&&h.team==='us'){if(h.shootT>=0||V.callCD>0)return;V.callCD=.8;toast(`🙋 ${h.name}: "Here you go!"`);bb3Pass(h,V.me);return;}
  if(h&&h.team==='them'){const me=V.me;if(me.stealCD>0)return;me.stealCD=.9;av.play&&av.play('hop');
    const d=Math.hypot(h.p.x-me.p.x,h.p.z-me.p.z);if(d>1.35){toast(`Get closer to ${h.name} to steal! 🖐️`);return;}
    if(h.shootT<0&&Math.random()<.4){spSay('🖐️ Steal!');tone(660,.1,'triangle',.12);tone(990,.12,'triangle',.1,.08);bb3Hold(me);did('sport','steal');}
    else{toast(`Missed! ${h.name} kept the ball`);tone(200,.12,'sine',.08);}}}
function bb3Window(){const l=BB3.me.p,dist=Math.hypot(l.x,l.z-SPC.HZ);let w=Math.max(.07,.15-.014*Math.max(0,dist-3));
  const f=bb3Near(BB3.me,BB3.them);const contest=Math.max(0,1-f.d/1.6);return {w:w*(1-.45*contest),contest,f,dist};}
function bb3Release(){const V=BB3;if(!SP.hold)return;const h=SP.hold;SP.hold=null;$('#spMeter').classList.remove('show');
  const u=(h.t/1.05)%2,v=u<1?u:2-u,{w,contest,f}=bb3Window(),l=V.me.p,b=SP.ball;
  const off=(v-SP_SWEET)/w,perr=.009+off*.02+(Math.random()-.5)*.006,lerr=(Math.random()-.5)*.03*(1+contest*2)*(Math.abs(off)>1?1.6:1);
  b.by='me';b.team='us';b.shooter=V.me;b.dunked=false;b.pts=spThree(l.x,l.z)?3:2;SP.rel={t:0,b,perr,lerr,done:false};V.holder=null;SP.poss=null;V.lastTeam='us';SP.shots++;
  if(player.onGround)player.vy=3.6;
  toast(Math.abs(off)<=1?(Math.abs(off)<.35?'Perfect release! ✨':'Good release!'):v<SP_SWEET?'Too soft!':'Too hard!');
  if(contest>.35&&Math.random()<.15*contest+.04){const o=f.o;bb3Jump(o,5.5);b.blockAt=.12;setTimeout(()=>{if(SP.mode==='v3')spSay(`🖐️ Blocked by ${o.name}!`);},150);}
  bb3Hud();}
const bb3Jump=(A,v)=>{if(A&&!A.me&&A.p.y<=.01)A.vy=v;};

/* ---------- computer players ---------- */
const BB3_SPOTS=[[0,SPC.HZ+5.3],[-3.4,SPC.HZ+3.4],[3.4,SPC.HZ+3.4],[-4.4,SPC.HZ+.7],[4.4,SPC.HZ+.7],[-1.7,SPC.HZ+1.3],[1.7,SPC.HZ+1.3],[0,SPC.HZ+2.6]];
function bb3PickSpot(A){const mates=bb3Mates(A);const ok=BB3_SPOTS.filter(([x,z])=>mates.every(o=>Math.hypot(o.p.x-x,o.p.z-z)>2.2&&(!o.spot||Math.hypot(o.spot[0]-x,o.spot[1]-z)>2)));
  A.spot=rnd(ok.length?ok:BB3_SPOTS);A.spotT=2.4+Math.random()*2.6;}
function bb3StartShot(A,drive){A.shootT=0;A.drive=drive;A.face=Math.atan2(-A.p.x,SPC.HZ-A.p.z);bb3Jump(A,drive?6.8:4.2);}
function bb3Shoot(A){const V=BB3,C=SPC,b=SP.ball;const dist=bb3Hoop(A),f=bb3Near(A,bb3Foes(A)),contest=Math.max(0,1-f.d/1.4),three=spThree(A.p.x,A.p.z);
  let chance=((dist<1.4?.62:three?.32:.47)*(.8+.06*A.r.thr)*(A.team==='them'?.85:1))-contest*.3;// the Bears are good, but beatable
  b.by=A.team==='us'?'mate':'cpu';b.team=A.team;b.shooter=A;b.pts=three?3:2;V.holder=null;SP.poss=null;V.lastTeam=A.team;
  const meBlock=A.team==='them'&&f.o&&f.o.me&&!player.onGround&&f.d<1.25;
  if(dist<1.4&&Math.random()<.45){b.dunked=true;b.st='fly';b.p.set(0,C.RIM+.35,C.HZ+.02);b.v.set(0,-6,0);b.spin=0;b.age=0;b.made=false;b.blocked=false;b.rim=0;b.bounces=0;Z.court.hoop.shake=1;tone(90,.25,'square',.14);
    if(meBlock&&Math.random()<.5){b.v.set(3,2,4);b.blocked=true;spSay('🖐️ You blocked the dunk!');did('sport','block');}}
  else{const ok=Math.random()<chance;const perr=.009+(ok?(Math.random()-.5)*.008:(Math.random()<.5?-1:1)*(.045+Math.random()*.04));
    spLaunch(b,A.drive?new THREE.Vector3(A.p.x,A.p.y+2.15,A.p.z):b.p.clone(),perr,(Math.random()-.5)*(ok?.01:.05));b.dunked=false;if(!A.drive)A.follow=.65;
    if(meBlock&&Math.random()<.65){b.blockAt=.1;setTimeout(()=>{if(SP.mode==='v3'){spSay('🖐️ Blocked!');tone(1200,.1,'triangle',.1);}},120);did('sport','block');}
    else if(f.o&&!f.o.me&&f.d<.9&&Math.random()<.15){bb3Jump(f.o,5.5);b.blockAt=.1;setTimeout(()=>{if(SP.mode==='v3')spSay(`🖐️ ${f.o.name} blocks it!`);},120);}}
  bb3Hud();}
const bb3Loose=b=>!!b&&!BB3.holder&&!BB3.pass&&b.st==='fly'&&!b.made&&(b.bounces>0||b.rim>0||b.blocked||b.age>1.2);
function bb3Ai(A,dt,t,chaser){const V=BB3,C=SPC,b=SP.ball,S=3.4*rosterSpeed(A.r);let tx=A.p.x,tz=A.p.z,spd=0,pose=null;
  A.stealCD-=dt;if(A.spot)A.spotT-=dt;
  if(A.shootT>=0){A.shootT+=dt;pose=A.drive?'up':(A.shootT<.2?'shot-set':'shot-rise');A.face=Math.atan2(-A.p.x,C.HZ-A.p.z);
    if(A.drive){const dl=bb3Hoop(A);if(dl>.7){tx=A.p.x*.5;tz=C.HZ+(A.p.z-C.HZ)*.5+.3;spd=2;}}
    if(A.shootT>=.34){A.shootT=-1;bb3Shoot(A);if(!A.drive)pose='shot-follow';}}
  else if(V.holder===A){A.hold+=dt;A.think-=dt;const d=bb3Hoop(A),f=bb3Near(A,bb3Foes(A));
    if(A.think<=0){A.think=.5+Math.random()*.4;const opt=bb3PassTarget(A),open=f.d>1.5;
      if(d<1.6)bb3StartShot(A,true);
      else if(A.hold>4.4){if(opt&&opt.open>1.2&&(d>6.2||Math.random()<.5))bb3Pass(A,opt.o);else bb3StartShot(A,false);}
      else if(open&&d<6.3&&A.hold>.6&&Math.random()<.42)bb3StartShot(A,false);
      else if(opt&&opt.open>1.4&&A.hold>.5&&Math.random()<(opt.o.me?.55:.35))bb3Pass(A,opt.o);
      else{const ang=Math.atan2(A.p.x,A.p.z-C.HZ)+(Math.random()-.5)*1.3,nd=Math.max(.5,d-1.6-Math.random()*1.6);A.plan={x:Math.sin(ang)*nd,z:C.HZ+Math.abs(Math.cos(ang))*nd+.3};}}
    if(V.holder===A&&A.shootT<0){if(!A.plan)A.plan={x:A.p.x,z:A.p.z};tx=A.plan.x;tz=A.plan.z;spd=S*.85;pose='dribble';
      const dx=tx-A.p.x,dz=tz-A.p.z;A.face=Math.hypot(dx,dz)>.2?Math.atan2(dx,dz):Math.atan2(-A.p.x,C.HZ-A.p.z);}}
  else if(V.pass&&V.pass.to===A){const P=V.pass;A.face=Math.atan2(P.from.p.x-A.p.x,P.from.p.z-A.p.z);pose='reach';}
  else if(bb3Loose(b)&&chaser){tx=b.p.x;tz=b.p.z;spd=S*1.05;A.face=Math.atan2(tx-A.p.x,tz-A.p.z);pose='reach';}
  else if(!V.holder&&!V.pass&&b&&b.st==='fly'&&!b.made&&V.next<=0){// a shot in the air: box out round the rim for the rebound
    const i=V.all.indexOf(A),ang=(i-2.5)*.5;tx=Math.sin(ang)*2.1;tz=C.HZ+.4+Math.cos(ang)*1.9;spd=S*.8;A.face=Math.atan2(b.p.x-A.p.x,b.p.z-A.p.z);}
  else if(V.holder&&V.holder.team===A.team){// spread out and cut: find an open spot on the floor
    if(!A.spot||A.spotT<=0)bb3PickSpot(A);tx=A.spot[0];tz=A.spot[1];spd=S*.75;const h=V.holder;A.face=Math.atan2(h.p.x-A.p.x,h.p.z-A.p.z);}
  else if(V.holder){// guard your player: between them and the hoop, closer when they have the ball
    const m=A.mark,on=V.holder===m,hx=0-m.p.x,hz=C.HZ-m.p.z,hl=Math.hypot(hx,hz)||1,gap=on?1:1.6;
    tx=m.p.x+hx/hl*Math.min(gap,hl*.5);tz=m.p.z+hz/hl*Math.min(gap,hl*.5);spd=S;A.face=Math.atan2(m.p.x-A.p.x,m.p.z-A.p.z);
    if(on){pose='guard';const d=Math.hypot(m.p.x-A.p.x,m.p.z-A.p.z),busy=m.me&&(SP.hold||SP.rel||SP.dunk);
      if(d<.95&&A.stealCD<=0&&m.shootT<0&&!busy){A.stealCD=1.4+Math.random()*1.2;if(Math.random()<(m.me?.12:.15)){bb3Hold(A);
        spSay(m.me?`🖐️ ${A.name} stole it!`:A.team==='us'?`🖐️ ${A.name} steals it!`:`🖐️ ${A.name} steals from ${m.name}!`);tone(300,.1,'square',.08);}}}}
  else if(b&&b.st==='fly'){A.face=Math.atan2(b.p.x-A.p.x,b.p.z-A.p.z);}
  // move
  const dx=tx-A.p.x,dz=tz-A.p.z,dl=Math.hypot(dx,dz);let moved=0;if(dl>.05&&spd>0){const s=Math.min(dl,spd*dt);A.p.x+=dx/dl*s;A.p.z+=dz/dl*s;moved=s/Math.max(dt,1e-4);}
  A.moved=moved;A.pose=pose;
  // grab a loose ball
  if(bb3Loose(b)&&b.age>.35&&b.p.y<2.3&&Math.hypot(b.p.x-A.p.x,b.p.z-A.p.z)<.55){bb3Hold(A);toast(A.team==='us'?`🙌 ${A.name} got the rebound`:`🐻 ${A.name} got the rebound`);}}
// after everyone moved: keep them apart and on the court, then pose them
function bb3Bodies(dt,t){const V=BB3,C=SPC,b=SP.ball,L=V.all;
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],c=L[j];const ox=c.p.x-a.p.x,oz=c.p.z-a.p.z,od=Math.hypot(ox,oz);
    if(od<.62&&od>1e-4){const push=(.62-od),nx=ox/od,nz=oz/od;if(a.me){c.p.x+=nx*push;c.p.z+=nz*push;}else if(c.me){a.p.x-=nx*push;a.p.z-=nz*push;}
      else{a.p.x-=nx*push/2;a.p.z-=nz*push/2;c.p.x+=nx*push/2;c.p.z+=nz*push/2;}}}
  for(const A of L){if(A.me)continue;A.p.x=Math.max(-C.X,Math.min(C.X,A.p.x));A.p.z=Math.max(C.Z0+.3,Math.min(C.Z1,A.p.z));
    A.vy-=18*dt;A.p.y+=A.vy*dt;if(A.p.y<0){A.p.y=0;A.vy=0;}
    let pose=A.pose;if(A.follow>0){A.follow-=dt;if(!(pose&&pose.startsWith('shot')))pose='shot-follow';}
    A.a.g.position.copy(A.p);A.a.g.rotation.y=A.face;A.a.update(dt,A.moved||0,A.p.y>.02);
    if(pose&&pose.startsWith('shot-')){const n=pose.slice(5);spShotPose(A.a,n,dt,n==='set'?16:n==='rise'?28:14);}else{spShotOff(A.a,dt);if(pose)spArms(A.a,pose,t);}
    // the ball in a computer player's hands: dribbling beside them, up for a jump shot, or over the head for a layup
    if(V.holder===A&&b&&b.st==='hold'){const f=A.face;if(A.shootT>=0&&!A.drive)spBallInHands(A.a,b,false);else if(A.shootT>=0)b.p.set(A.p.x+Math.sin(f)*.15,A.p.y+2.15,A.p.z+Math.cos(f)*.15);
      else{const rx=-Math.cos(f),rz=Math.sin(f);b.p.set(A.p.x+rx*.32+Math.sin(f)*.2,SP_BR+Math.abs(Math.sin(t*9+A.p.x))*.62,A.p.z+rz*.32+Math.cos(f)*.2);b.m.rotation.x+=dt*6;}b.m.position.copy(b.p);}}}

/* ---------- a basket ---------- */
function bb3Made(b){const V=BB3,A=b.shooter,us=b.team==='us';if(us)SP.score+=b.pts;else SP.opp+=b.pts;
  const LP=V.lastPass,assist=LP&&LP.to===A&&LP.from!==A&&LP.from.team===b.team&&V.clock-LP.t<7;
  const nm=A?bb3Name(A):'';
  if(A&&A.me)spSay(b.dunked?'💥 SLAM DUNK!':b.pts===3?'🔥 Three pointer!':'🏀 Bucket!');
  else if(us)spSay(`${b.dunked?'💥':'🏀'} ${nm} ${b.dunked?'dunks it':b.pts===3?'hits a three':'scores'}!${assist&&LP.from.me?' 🙌 Assist!':''}`);
  else spSay(`🐻 ${nm} ${b.dunked?'dunks':b.pts===3?'hits a three':'scores'} for the Bears`);
  if(us&&!(A&&A.me))spCheer();
  if(us&&assist&&LP.from.me)did('sport','assist');
  V.holder=null;V.pass=null;SP.poss=null;V.next=1.5;V.nextFor=us?'them':'us';bb3Hud();}

/* ---------- the game tick ---------- */
function bb3Step(dt,t){const V=BB3,C=SPC,z=SP.z,p=player.pos,me=V.me;if(!V.on)return;
  if(curZone!==z){spEnd(true,true);return;}
  V.clock+=dt;if(V.callCD>0)V.callCD-=dt;if(me.stealCD>0)me.stealCD-=dt;
  me.p.copy(spLocal(z,p));
  // the shot meter while you hold SHOOT
  if(SP.hold){SP.hold.t+=dt;const u=(SP.hold.t/1.05)%2,v=u<1?u:2-u,{w}=bb3Window();$('#spMeter b').style.bottom=(v*100)+'%';
    const gz=$('#spMeter i');gz.style.bottom=((SP_SWEET-w)*100)+'%';gz.style.height=(w*200)+'%';player.face=spFace(z,me.p.x,me.p.z,0,C.HZ);}
  if(SP.dunk){spDunkStep(dt);}
  const b=SP.ball;
  // you: the same jump shot, dunk and dribble as 1-on-1
  const mine=b&&b.st==='hold'&&V.holder===me&&!SP.dunk,R=SP.rel;
  av.g.position.copy(p);av.g.rotation.y=player.face;
  if(SP.dunk){spShotOff(av,dt);spArms(av,'up',t);}
  else if(SP.hold)spShotPose(av,'set',dt,14);
  else if(R){R.t+=dt;spShotPose(av,R.t<SP_REL?'rise':'follow',dt,R.t<SP_REL?28:R.t<SP_REL+.12?30:12);}
  else{spShotOff(av,dt);if(mine)spArms(av,'dribble',t);else if(V.holder&&V.holder.team==='them')spArms(av,'guard',t);else if(V.pass&&V.pass.to===me)spArms(av,'reach',t);}
  if(mine){if(SP.hold)spBallInHands(av,b,false);
    else{const f=player.face-z.rot,rx=-Math.cos(f),rz=Math.sin(f);b.p.set(me.p.x+rx*.32+Math.sin(f)*.22,p.y+SP_BR+Math.abs(Math.sin(t*9))*.62,me.p.z+rz*.32+Math.cos(f)*.22);b.m.position.copy(b.p);}}
  if(R&&!R.done){spBallInHands(av,R.b,false);if(R.t>=SP_REL){R.done=true;spLaunch(R.b,R.b.p.clone(),R.perr,R.lerr);}}
  if(R&&R.t>SP_REL+.75)SP.rel=null;
  // the ball
  if(V.pass)bb3PassStep(dt);
  for(const bb of SP.balls.slice())if(bb.st==='fly')spStepBall(bb,dt);
  if(!SP.mode)return;
  // the computer players: one from each team goes after a loose ball (your teammates leave it to you if you're closer)
  const loose=bb3Loose(b);let ch={us:null,them:null};
  if(loose){for(const tm of ['us','them']){let best=null,bd=1e9;for(const A of V[tm]){const d=Math.hypot(A.p.x-b.p.x,A.p.z-b.p.z);if(d<bd){bd=d;best=A;}}ch[tm]=best&&!best.me?best:null;}}
  for(const A of V.all)if(!A.me)bb3Ai(A,dt,t,ch[A.team]===A);
  bb3Bodies(dt,t);
  // you grab a loose ball when you're right there
  if(bb3Loose(b)&&b.age>.35&&!SP.dunk&&Math.hypot(b.p.x-me.p.x,b.p.z-me.p.z)<.6&&b.p.y<p.y+2.4){bb3Hold(me);toast(V.lastTeam==='us'?'Got it! 🙌':'Rebound! 🙌');}
  // a ball nobody gets: the other team checks it
  if(bb3Loose(b)){V.looseT+=dt;if(V.looseT>6)bb3Check(V.lastTeam==='us'?'them':'us');}
  // after a basket
  if(V.next>0){V.next-=dt;if(V.next<=0){if(SP.score>=BB3_WIN||SP.opp>=BB3_WIN){spEnd(true);return;}bb3Check(V.nextFor);}}
  // the camera turns toward the hoop while you have the ball (unless you're dragging it)
  if(look.id===null&&V.holder===me){const want=spFace(z,me.p.x,me.p.z,0,C.HZ)+Math.PI;cam.yaw=angDamp(cam.yaw,want,Math.min(1,dt*1.2));}
  // buttons
  const h=V.holder;
  if(h&&h.team==='them')spBtn('🖐️<br>STEAL','purple'+(Math.hypot(h.p.x-me.p.x,h.p.z-me.p.z)<1.35&&me.stealCD<=0?'':' dim'));
  else if(h&&h.team==='us'&&!h.me)spBtn('🙋<br>CALL<br>FOR IT','green'+(h.shootT>=0?' dim':''));
  else if(bb3CanDunk())spBtn('💥<br>DUNK!','');else if(h===me)spBtn('🏀<br>SHOOT','');else spBtn('🏀<br>…','dim');
  const canPass=h===me&&!SP.hold&&!SP.rel&&!SP.dunk;document.body.classList.toggle('bb3-me',canPass);
  V.hudT+=dt;if(V.hudT>.25){V.hudT=0;bb3Hud();if(canPass){const tg=bb3PassTarget(me),pb=$('#bb3Pass'),tx=tg?`🤾<br>PASS<br><small>${tg.o.name}</small>`:'🤾<br>PASS';if(pb.dataset.t!==tx){pb.dataset.t=tx;pb.innerHTML=tx;}}}}

/* ---------- the end ---------- */
function bb3End(show,quit){const V=BB3;V.on=false;V.holder=null;V.pass=null;SP.hold=null;SP.rel=null;SP.dunk=null;SP.poss=null;
  document.body.classList.remove('bb3-me');for(const a of BB3_AV.values())a.g.visible=false;
  for(const a of [av,...V.all.map(A=>A.a)])if(a){a.shot=null;a.handsBack=false;if(a.arms)for(const A of a.arms)A.hand.rotation.set(0,0,0);}
  for(const b of SP.balls.slice())spDropBall(b);Z.court.board.draw('0','0');
  if(!show)return;let h,coins=0;const sc=`${SP.score} - ${SP.opp}`;
  if(quit)h=`<h2>👋 You left the game</h2><div class="spBig">${sc}</div><p>Finish a whole game to earn coins!</p>`;
  else{const win=SP.score>SP.opp;coins=win?40:15;if(win){SAVE.sports.v3w=(SAVE.sports.v3w||0)+1;persist();did('sport','v3win');}
    h=`<h2>${win?'🏆 The Eagles win!':'😅 The Bears win this time'}</h2><div class="spBig">${sc}</div><p>${win?`Great teamwork with ${V.us[1].name} and ${V.us[2].name}!`:'Pass to an open teammate and try again!'}</p>`;}
  if(coins>0){earn(coins,'sports');h+=`<p>🪙 +${coins} coins</p>`;}
  $('#spCard').innerHTML=h+`<button class="btn" id="spAgain">🔁 Play again</button> <button class="btn ghost" id="spDone">Done</button>`+(spCanUnsuit()?`<br><button class="btn ghost" id="spUnsuit">👗 Back to my outfit</button>`:'');
  if(spCanUnsuit())$('#spUnsuit').onclick=()=>{spUnsuit();spCloseMenu();};
  $('#spAgain').onclick=()=>{spCloseMenu();spOpenMenu('court');};$('#spDone').onclick=spCloseMenu;
  SP.menu=true;$('#spMenu').classList.add('show');if(coins>=40)sfx('tada');}

SP.ext.v3={step:bb3Step,press:bb3Press,release:bb3Release,end:bb3End,made:bb3Made,board:bb3Board,lock:()=>!!SP.hold||!!SP.dunk};
window.__bb3={V:BB3,pick:bb3Pick,start:bb3Start,check:bb3Check,pass:bb3Pass,passMe:bb3PassMe,press:bb3Press,release:bb3Release,canDunk:bb3CanDunk,WIN:BB3_WIN};
