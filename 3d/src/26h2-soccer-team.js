/* ================= ⚽ 3-on-3 SOCCER MATCH with goalies (on the Soccer Field, 26h-soccer.js) =================
   You and two teammates (🦅 Eagles, blue) against three Bears (red), and each side has a goalie in goal.
   Teams come from the 🧢 team picker (24e3-team-picker.js): you pick 3 kids, the Bears pick 4, and each team's best
   catcher (🙌) goes in goal. The others play out on the field; their ⚡ speed and 🦵 kicking stats count.
   Everything is in the field's own space (SOC): the Eagles attack the goal at +x, the Bears attack -x.
   Your buttons: with the ball ⚽ SHOOT and 👟 PASS; when a teammate has it 🙋 PASS ME!; when the Bears have it 🛡️ TACKLE.
   Bots (socTeamBot) chase loose balls, dribble, pass to whoever is open, shoot from close in, press and tackle the
   player on the ball, and spread out to get open. Goalies (socTeamKeeper) follow the ball along their line, come out
   for loose balls in their box, dive at shots (their 🙌 stat helps) and throw it out to a teammate.
   First to 5 goals, or whoever is ahead when the 3:00 clock runs out (tied: next goal wins).
   window.__soccer.team gives the test the state; SC.tm.auto lets the test play your part with the same brain as the bots.
   Challenges: did('soccer','teamgoal'|'assist'|'teamwin'). */
const SOCT_COL={us:'#2e6bd8',them:'#c8303a',usK:'#2fae5a',themK:'#f0b400'};
const SOCT_LEN=180,SOCT_WIN=5;
const socTeamRingGeo=new THREE.RingGeometry(.4,.5,28);
const socTeamRingMat={us:new THREE.MeshBasicMaterial({color:'#4f8dff',transparent:true,opacity:.85,depthWrite:false}),
  them:new THREE.MeshBasicMaterial({color:'#ff5560',transparent:true,opacity:.85,depthWrite:false}),
  me:new THREE.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:.95,depthWrite:false})};
function socTeamRing(kind){const m=M(socTeamRingGeo,socTeamRingMat[kind],0,.035,0,socZ().g,false,false);m.rotation.x=-Math.PI/2;m.visible=false;return m;}

// 🧢 pick teams, then play
function socTeamPick(){teamPick({sport:'soccer',size:4,title:'Pick your team: 3-on-3 + goalies',
  done:(us,them)=>{SC.tmTeams={us,them};socStart('team');},cancel:()=>{}});}

function socTeamEnt(a,r,team,key,me){return {a,r,team,key,me,p:new THREE.Vector3(),face:0,sp:0,stun:0,cool:0,touch:0,think:0,plan:0,hold:0,dive:null,slot:0,
  ring:socTeamRing(me?'me':team),spd:(r?rosterSpeed(r):1)*(team==='them'?.88:1),leg:r?rosterLeg(r):1,hands:r?r.cat:3};}
function socTeamBegin(){const z=socZ(),S=SOC;let T=SC.tmTeams;
  if(!T){// no draft yet (the test, or Play again before ever picking): the last team you picked, or the first kids on the list
    const names=(SAVE.teams&&SAVE.teams.soccer)||[],us=names.map(n=>ROSTER.find(r=>r.n===n)).filter(Boolean).slice(0,3);
    for(const r of ROSTER){if(us.length>=3)break;if(!us.includes(r))us.push(r);}
    const them=ROSTER.filter(r=>!us.includes(r)).slice(0,4);T=SC.tmTeams={us,them};}
  const old=SC.tm;if(old)for(const e of old.pl){if(!e.me){e.a.g.visible=false;socResetBody(e.a);}e.ring.visible=false;}
  const tm=SC.tm={pl:[],us:[],them:[],own:null,passTo:null,passFrom:null,assist:null,call:false,clock:SOCT_LEN,golden:false,us_:0,them_:0,
    phase:'play',pt:0,freeze:0,last:'us',auto:old?old.auto:false,goals:{},kick:null};
  for(const team of ['us','them']){const list=T[team].slice().sort((a,b)=>b.cat-a.cat);// the best hands go in goal
    list.forEach((r,i)=>{const key=i===0;const a=rosterAvatar(r,key?SOCT_COL[team+'K']:SOCT_COL[team]);z.g.add(a.g);a.g.visible=true;socResetBody(a);
      const e=socTeamEnt(a,r,team,key,false);e.slot=key?-1:(team==='us'?i:i-1);tm.pl.push(e);tm[team].push(e);});}
  const me=socTeamEnt(av,null,'us',false,true);me.slot=0;me.spd=1;tm.me=me;tm.pl.push(me);tm.us.push(me);
  for(const e of tm.pl)e.ring.visible=true;
  SC.me=0;SC.cpu=0;socTeamKickoff('us');
  toast('🦅 You\'re the Eagles in blue, attacking the far goal ➡️  Pass, shoot and score!');}
const socTeamKeeper=team=>SC.tm[team].find(e=>e.key);
const socTeamSide=team=>team==='us'?1:-1;// the way this team attacks (+x for the Eagles)
// where each player stands at kickoff, in their own half
function socTeamHome(e){const S=SOC,s=socTeamSide(e.team);if(e.key)return [-s*(S.FL-.5),0];
  const spots=[[-1.2,0],[-5,-4.5],[-5,4.5]];const [x,z]=spots[e.slot]||spots[1];return [s*x,z];}
function socTeamKickoff(team){const S=SOC,tm=SC.tm,b=socNewBall(0,0);tm.phase='play';tm.pt=0;tm.passTo=null;tm.assist=null;tm.call=false;tm.freeze=1;
  for(const e of tm.pl){const [x,z]=socTeamHome(e);e.p.set(x,0,z);e.face=socFace(x,z,0,0);e.stun=0;e.cool=.6;e.touch=0;e.hold=0;e.dive=null;if(!e.me)socResetBody(e.a);}
  // the team kicking off has its striker on the ball (that's you for the Eagles)
  const k=tm[team].find(e=>e.slot===0&&!e.key);k.p.set(-socTeamSide(team)*.6,0,0);k.face=socFace(k.p.x,0,0,0);tm.own=k;tm.last=team;
  socTeamSyncMe(true);cam.yaw=Math.PI/2+socZ().rot+Math.PI;cam.cy=cam.yaw;socBoard();socTeamHud();}
// you: your avatar follows the joystick like normal; this keeps the game's copy of you in step (or moves you, on autopilot)
function socTeamSyncMe(place){const me=SC.tm.me;if(place||SC.tm.auto){socPut(me.p.x,me.p.z,me.face);player.speed=me.sp;}else{const l=socL(player.pos);me.p.set(l.x,0,l.z);me.face=player.face-socZ().rot;me.sp=player.speed;}}
function socTeamHud(){const tm=SC.tm,o=tm.own,m=Math.floor(Math.max(0,tm.clock)/60),s=Math.floor(Math.max(0,tm.clock)%60);
  const who=!o?'loose ball!':o.me?'your ball':o.team==='us'?`${o.r.n}'s ball`:`🐻 ${o.r.n}'s ball`;
  socHud('⚽ 3-on-3',`${SC.me} - ${SC.cpu}`,tm.golden?'⏱ next goal wins':`⏱ ${m}:${String(s).padStart(2,'0')}`,who);}
const socTeamD=(a,b)=>Math.hypot(a.p.x-b.p.x,a.p.z-b.p.z);
const socTeamOpp=e=>e.team==='us'?'them':'us';
function socTeamGive(e){const tm=SC.tm;if(tm.own===e)return;
  // a pass from you that a teammate takes: if they score before anyone else touches it, that's your assist
  if(e.team==='us'&&!e.me&&tm.passFrom&&tm.passFrom.me&&tm.passTo===e)tm.assist=e;else if(e!==tm.assist)tm.assist=null;
  tm.own=e;tm.passTo=null;tm.passFrom=null;tm.call=false;tm.shotBy=null;tm.last=e.team;e.think=.25+Math.random()*.25;if(e.key)e.hold=.9;socTeamHud();}
// 👟 pass (or a goalie's throw) to a teammate, a little ahead of where they're running
function socTeamPassTo(from,to,throwIt){const tm=SC.tm,b=SC.ball;const lead=to.me?.25:.45,tx=to.p.x+Math.sin(to.face)*to.sp*lead,tz=to.p.z+Math.cos(to.face)*to.sp*lead;
  const dx=tx-b.p.x,dz=tz-b.p.z,d=Math.hypot(dx,dz)||1,v=Math.min(17,d*.95+2.4);
  b.st='free';b.in=false;b.v.set(dx/d*v,throwIt?2.6:.3,dz/d*v);if(throwIt)b.p.y=1.1;tm.own=null;tm.passTo=to;tm.passFrom=from;from.touch=.35;if(to.me)tm.toMe=(tm.toMe||0)+1;
  if(!from.me)socKick(from.a);else socKick(av);tone(170,.06,'sine',.12);tm.last=from.team;socTeamHud();}
// the best teammate to pass to: open (no Bears close), and further up the field is better
function socTeamBestMate(e,faceDir){const tm=SC.tm,s=socTeamSide(e.team);let best=null,bs=-1e9;
  for(const m of tm[e.team]){if(m===e||m.key)continue;const d=socTeamD(e,m);if(d<2.2||d>24)continue;
    let open=99;for(const o of tm[socTeamOpp(e.team)])if(!o.key)open=Math.min(open,socTeamD(o,m));
    let sc=Math.min(open,5)*1.2+(m.p.x-e.p.x)*s*.35-d*.08;
    if(faceDir!=null){const dir=Math.atan2(m.p.x-e.p.x,m.p.z-e.p.z),df=Math.abs(angDamp(0,dir-faceDir,1));sc+=(1.2-df)*4;}
    if(m.me)sc+=1.5;// the bots like passing to you
    if(sc>bs){bs=sc;best=m;}}
  return best;}
function socTeamShoot(e){const S=SOC,tm=SC.tm,b=SC.ball,s=socTeamSide(e.team),dist=Math.abs(s*S.FL-b.p.x);
  const miss=Math.random()<Math.max(.08,.34-.05*(e.r?e.r.kck:3)+dist*.008+(e.team==='them'?.1:0));let tz=miss?(Math.random()<.5?-1:1)*(S.GW+.2+Math.random()*1.2):(Math.random()-.5)*2*(S.GW-.45);
  const ty=.25+Math.random()*Math.min(1.5,.5+dist*.07);tm.own=null;tm.passTo=null;e.touch=.5;socKick(e.a);
  socShoot(b,s,tz,ty,Math.max(.45,dist/16)/Math.max(.8,e.leg),0);b.shot.by=e;tm.last=e.team;socTeamHud();}

/* ---------- the step: runs every frame while the match is on ---------- */
function socTeamStep(dt,t){const S=SOC,tm=SC.tm,b=SC.ball,z=socZ(),me=tm.me;
  if(curZone!==z){socEnd(true,true);return;}
  tm.pt+=dt;if(tm.freeze>0)tm.freeze-=dt;socTeamSyncMe(false);
  for(const e of tm.pl){if(e.stun>0)e.stun-=dt;if(e.cool>0)e.cool-=dt;if(e.touch>0)e.touch-=dt;}
  // ⏱ the clock runs while the ball is in play
  if(tm.phase==='play'&&!tm.golden){tm.clock-=dt;if(tm.clock<=0){tm.clock=0;if(SC.me!==SC.cpu){socEnd(true);return;}tm.golden=true;socSay('⏱ Tied! Next goal wins!');}}
  // ⚽ the ball
  const o=tm.own;
  if(o){if(o.key&&o.hold>0){const hx=o.p.x+Math.sin(o.face)*.32,hz=o.p.z+Math.cos(o.face)*.32;b.p.set(hx,.95,hz);b.v.set(0,0,0);b.m.position.copy(b.p);}
    else socAtFeet(b,o.p.x,o.p.z,o.face,o.sp,t,dt);}
  else{if(b.st==='shot'){socTeamShotWatch(dt);if(b.st==='shot')socShotStep(b,dt);}else socPhys(b,dt);
    if(b.st!=='shot'&&tm.phase==='play')socTeamPickup();}
  // a goal?
  if(b.in&&tm.phase==='play'){tm.phase='goal';tm.pt=0;const us=b.in>0;const by=b.shot&&b.shot.by||tm.shotBy;
    if(us){SC.me++;spCheer();sfx('star');did('soccer','goal');
      if(by&&by.me){socSay(rnd(['⚽ GOAL! You scored!','⚽ GOOOAL!','⚽ What a finish!']));did('soccer','teamgoal');av.play('cheer');}
      else{socSay(`⚽ GOAL! ${by&&by.r?by.r.n:'The Eagles'} scores!`);if(tm.assist&&by===tm.assist){did('soccer','assist');toast('🤝 Your pass set that up! Assist!');}}}
    else{SC.cpu++;socSay(`🐻 ${by&&by.r?by.r.n:'The Bears'} scores`);}
    for(const e of tm.pl)if(!e.me&&!e.key&&e.team===(us?'us':'them'))e.a.play('cheer');
    tm.own=null;socBoard();socTeamHud();}
  if(tm.phase==='goal'){if(tm.pt>2.6){if(tm.golden||SC.me>=SOCT_WIN||SC.cpu>=SOCT_WIN){socEnd(true);return;}socTeamKickoff(b.in>0?'them':'us');}}
  else if(tm.phase==='play'&&!tm.own&&b.st!=='shot')socTeamOut();
  // 🤖 everyone else (and you, on autopilot)
  for(const e of tm.pl){if(e.me&&!tm.auto)continue;if(e.key)socTeamKeeper2(e,dt,t);else socTeamBot(e,dt,t);}
  // nobody walks through anybody
  for(let i=0;i<tm.pl.length;i++)for(let j=i+1;j<tm.pl.length;j++){const a=tm.pl[i],c=tm.pl[j],dx=c.p.x-a.p.x,dz=c.p.z-a.p.z,d=Math.hypot(dx,dz);
    if(d<.6&&d>1e-4){const push=(.6-d)/d;if(a.me&&!tm.auto){c.p.x+=dx*push;c.p.z+=dz*push;}else if(c.me&&!tm.auto){a.p.x-=dx*push;a.p.z-=dz*push;}
      else{a.p.x-=dx*push*.5;a.p.z-=dz*push*.5;c.p.x+=dx*push*.5;c.p.z+=dz*push*.5;}}}
  if(tm.auto)socTeamSyncMe(true);
  for(const e of tm.pl){if(!e.me){e.p.x=Math.max(-S.FL-1.2,Math.min(S.FL+1.2,e.p.x));e.p.z=Math.max(-S.FW-1,Math.min(S.FW+1,e.p.z));
      if(!e.dive){e.a.g.position.copy(e.p);e.a.g.rotation.y=e.face;}e.a.update(dt,e.dive?0:e.sp,false);}
    e.ring.position.set(e.me?socL(player.pos).x:e.p.x,.035,e.me?socL(player.pos).z:e.p.z);}
  socTeamButtons();
  if(Math.floor(tm.clock)!==tm.hudS){tm.hudS=Math.floor(tm.clock);socTeamHud();}
  // the joystick works as if you're looking up the field (the camera, socTeamCam, always looks toward the goal you attack)
  cam.yaw=cam.cy=Math.PI/2+z.rot+Math.PI;
  socNetStep(dt);}

// who gets to a loose ball first (a pass is easier to take for the one it's meant for; goalies can catch it in their box)
function socTeamPickup(){const S=SOC,tm=SC.tm,b=SC.ball,sp=Math.hypot(b.v.x,b.v.z);let best=null,bd=1e9;
  for(const e of tm.pl){if(e.stun>0||e.touch>0)continue;const s=socTeamSide(e.team),inBox=e.key&&-s*b.p.x>S.FL-S.BOX-.5&&Math.abs(b.p.z)<S.BOXW;
    const r=e.key?(inBox?.95:0):e===tm.passTo?.85:.62,maxV=e.key?15:e===tm.passTo?14:9,maxY=e.key?1.9:.6;
    const d=Math.hypot(b.p.x-e.p.x,b.p.z-e.p.z);if(d<r&&sp<maxV&&b.p.y<maxY&&d<bd){bd=d;best=e;}}
  if(best)socTeamGive(best);}
// over the sideline: a throw-in to the other team; over the goal line: a goal kick from the goalie
function socTeamOut(){const S=SOC,tm=SC.tm,b=SC.ball;const side=Math.abs(b.p.z)>S.FW+SOC_BR,end=Math.abs(b.p.x)>S.FL+SOC_BR&&!b.in;if(!side&&!end)return;
  const to=tm.last==='us'?'them':'us';
  if(end){const s=Math.sign(b.p.x),def=s>0?'them':'us',k=socTeamKeeper(def);socNewBall(s*(S.FL-S.GA),0);k.p.set(s*(S.FL-S.GA)-s*.35,0,0);k.face=socFace(k.p.x,0,0,0);socTeamGive(k);k.hold=1.3;
    toast(def==='us'?'Goal kick: your goalie\'s ball':'Goal kick to the Bears');}
  else{const x=Math.max(-S.FL+1,Math.min(S.FL-1,b.p.x)),zz=Math.sign(b.p.z)*(S.FW-.45);let taker=null,bd=1e9;
    for(const e of tm[to]){if(e.key)continue;const d=Math.hypot(e.p.x-x,e.p.z-zz);if(d<bd){bd=d;taker=e;}}
    socNewBall(x,zz);taker.p.set(x,0,zz-Math.sign(zz)*.45);taker.face=socFace(taker.p.x,taker.p.z,x+socTeamSide(to)*2,0);if(taker.me)socTeamSyncMe(true);socTeamGive(taker);
    toast(taker.me?'Throw-in: your ball':to==='us'?`Throw-in to ${taker.r.n}`:'Throw-in to the Bears');}
  tm.freeze=.8;}
// 🧤 a goalie sees the shot coming and dives (whether it's saved depends on how good the shot is and their 🙌 hands)
function socTeamShotWatch(dt){const S=SOC,tm=SC.tm,b=SC.ball,sh=b.shot;if(!sh)return;tm.shotBy=sh.by||null;const def=sh.s>0?'them':'us',k=socTeamKeeper(def);
  if(!sh.kp){const onT=Math.abs(sh.tz)<S.GW-.05&&sh.ty<S.GH-.05;let p=.5+.08*(k.hands-3)-(Math.abs(sh.tz)>S.GW-1?.2:0)-(sh.ty>1.5?.12:0)+(sh.T>.9?.2:0)-(sh.T<.6?.15:0)+(def==='us'?.1:-.05);
    p=Math.max(.15,Math.min(.85,p));const save=onT&&Math.random()<p;sh.kp={save,onT};
    if(onT||Math.abs(sh.tz)<S.GW+.8){const rx=-Math.cos(k.face),rz=Math.sin(k.face),dz=sh.tz-k.p.z,side=Math.abs(dz)<.6?0:(dz*rz>0?1:-1);
      const reach=save?Math.min(2.3,Math.max(.3,Math.abs(dz)-.3)):Math.min(2.2,Math.abs(dz)*.55+.2);
      k.dive={t:-Math.max(0,sh.T*.35-.1),dur:side?.45:.3,side,reach,high:sh.ty>1.25,base:k.p.clone(),rx,rz};}}
  const u=sh.t/sh.T;
  if(sh.kp.save&&u>=.93&&b.st==='shot'){// saved!
    b.st='free';b.shot=null;const slow=sh.T>.8;tm.shotBy=null;
    if(slow){b.v.set(0,0,0);socTeamGive(k);k.hold=1.4;}else{b.v.set(-sh.s*4,2.2,(Math.random()<.5?-1:1)*3.5);k.touch=.5;tm.last=def;}
    sfx('pop');socSay(def==='us'?`🧤 Great save, ${k.r.n}!`:`🧤 Saved by ${k.r.n}!`);}
}
// a goalie: on the line following the ball, out for loose balls in the box, a dive when a shot comes, then a throw or a kick to a teammate
function socTeamKeeper2(k,dt,t){const S=SOC,tm=SC.tm,b=SC.ball,s=socTeamSide(k.team),gx=-s*S.FL;
  if(k.dive){const D=k.dive;if(D.t<0){D.t+=dt;}else{socPose(k.a,'dive');const u=socDiveStep(k.a,D.base,D,dt,D.rx,D.rz);if(u>=1&&D.t>D.dur+.7){k.dive=null;socResetBody(k.a);k.a.g.position.copy(k.p);}}
    if(k.dive)return;}
  let tx,tz,sp=3;
  if(tm.own===k){// hold it a moment, then throw it to someone open (or kick it long)
    sp=0;k.face=socFace(k.p.x,k.p.z,0,0);k.hold-=dt;socPose(k.a,null);
    if(k.hold<=0&&tm.freeze<=0){const m=socTeamBestMate(k);if(m&&socTeamD(k,m)<17)socTeamPassTo(k,m,true);
      else{const b2=SC.ball;b2.st='free';b2.v.set(s*13,4.5,(Math.random()-.5)*6);tm.own=null;tm.passTo=null;k.touch=.5;socKick(k.a);tm.last=k.team;}}
    tx=k.p.x;tz=k.p.z;}
  else{const inBox=-s*b.p.x>S.FL-S.BOX&&Math.abs(b.p.z)<S.BOXW;let close=99;for(const e of tm[socTeamOpp(k.team)])close=Math.min(close,Math.hypot(e.p.x-b.p.x,e.p.z-b.p.z));
    if(!tm.own&&b.st!=='shot'&&inBox&&Math.hypot(b.p.x-k.p.x,b.p.z-k.p.z)<close+.5){tx=b.p.x;tz=b.p.z;sp=4.6;}// come and get it
    else{const out=Math.max(0,Math.min(1.4,(8-Math.abs(b.p.x-gx))*.25));tx=gx+s*(.45+out);tz=Math.max(-S.GW+.6,Math.min(S.GW-.6,b.p.z*.45));sp=3.2;}
    socPose(k.a,b.st==='shot'||Math.abs(b.p.x-gx)<14?'keeper':null);}
  socTeamMove(k,tx,tz,sp,dt);if(tm.own!==k&&sp>0&&Math.hypot(tx-k.p.x,tz-k.p.z)<.3)k.face=angDamp(k.face,socFace(k.p.x,k.p.z,b.p.x,b.p.z),Math.min(1,dt*8));}
function socTeamMove(e,tx,tz,sp,dt){const dx=tx-e.p.x,dz=tz-e.p.z,dl=Math.hypot(dx,dz);let moved=0;
  if(dl>.08&&sp>0&&e.stun<=0){const s=Math.min(dl,sp*dt);e.p.x+=dx/dl*s;e.p.z+=dz/dl*s;moved=s/dt;e.face=angDamp(e.face,Math.atan2(dx,dz),Math.min(1,dt*9));}
  e.sp+=(moved-e.sp)*Math.min(1,dt*10);}
// 🤖 a field player (a bot, or you on autopilot)
function socTeamBot(e,dt,t){const S=SOC,tm=SC.tm,b=SC.ball,s=socTeamSide(e.team),gx=s*S.FL,run=4.3*e.spd;let tx=e.p.x,tz=e.p.z,sp=run;
  if(e.stun>0){socTeamMove(e,tx,tz,0,dt);return;}
  if(e.a&&!e.me&&e.a.socPose===SOC_POSE.tackle&&e.cool<1)socPose(e.a,null);
  const opp=tm[socTeamOpp(e.team)],mates=tm[e.team],o=tm.own;
  if(tm.phase!=='play'){const [hx,hz]=socTeamHome(e);socTeamMove(e,hx,hz,run*.6,dt);return;}
  if(o===e){// ⚽ on the ball: shoot from close in, pass when someone's on you (or a teammate asks), otherwise run at goal
    const dist=Math.abs(gx-e.p.x);let press=null,pd=99;for(const x of opp){if(x.key)continue;const d=socTeamD(e,x);if(d<pd){pd=d;press=x;}}
    e.think-=dt;sp=run*.85;
    if(!e.plan||e.planT<=0){e.plan=(Math.random()-.5)*S.FW*1.1;e.planT=1.2+Math.random()*1.2;}e.planT-=dt;
    tx=gx-s*2.5;tz=e.plan*Math.min(1,dist/14);
    if(press&&pd<2.4&&(press.p.x-e.p.x)*s>0)tz=e.p.z+(press.p.z>e.p.z?-2.5:2.5);// go round them
    if(e.think<=0&&tm.freeze<=0){e.think=.3+Math.random()*.3;
      const call=tm.call&&e.team==='us'&&!e.me;// you asked for it: they pass to you unless they're right in front of goal
      if(dist<10.5&&Math.abs(e.p.z)<S.FW*.75&&(dist<6||!call&&(dist<7||Math.random()<.6))){socTeamShoot(e);return;}
      if(call||(pd<1.9&&Math.random()<.6)||Math.random()<.12){const m=call?tm.me:socTeamBestMate(e);if(m){socTeamPassTo(e,m,false);return;}}}}
  else if(o&&o.team===e.team){// a teammate has it: get open further up the field, spread out
    const side=e.slot===1?-1:e.slot===2?1:(e.p.z>0?1:-1);tx=Math.max(-S.FL+3,Math.min(S.FL-3,o.p.x+s*5));tz=side*3.8+o.p.z*.2;sp=run*.85;
    if(e.me&&tm.auto&&Math.random()<dt*.4)tm.call=true;}
  else if(o){// the other team has it: the closest one presses the ball, the others cut off a pass
    let near=null,nd=99;for(const m of mates){if(m.key)continue;const d=socTeamD(m,o);if(d<nd){nd=d;near=m;}}
    if(near===e){tx=o.p.x-s*.7;tz=o.p.z;sp=run;
      if(socTeamD(e,o)<1.05&&e.cool<=0&&tm.freeze<=0){e.cool=1.4;if(!e.me)socPose(e.a,'tackle');
        if(Math.random()<.32+.05*((e.r?e.r.spd:3)-3)-(e.team==='them'?.1:0)){o.stun=.6;if(Math.random()<.55)socTeamGive(e);else{tm.own=null;b.st='free';b.v.set((e.p.x-o.p.x)*3+(Math.random()-.5),0,(e.p.z-o.p.z)*3+(Math.random()-.5));e.touch=.15;tm.last=e.team;}
          if(o.me)toast(`${e.r.n} took the ball! Tap 🛡️ TACKLE to win it back`);}}}
    else{// stand between a Bear and our goal
      let mark=null,md=99;for(const x of opp){if(x.key||x===o)continue;const d=socTeamD(e,x);if(d<md){md=d;mark=x;}}
      if(mark){tx=mark.p.x-s*1.6;tz=mark.p.z*.85+o.p.z*.15;}else{tx=o.p.x-s*4;tz=o.p.z*.5;}sp=run*.9;}}
  else{// loose ball: the closest on each team goes for it, the others take a spot
    let near=null,nd=99;for(const m of mates){if(m.key)continue;const d=Math.hypot(m.p.x-b.p.x,m.p.z-b.p.z);if(d<nd){nd=d;near=m;}}
    if(near===e||tm.passTo===e){tx=b.p.x+b.v.x*.25;tz=b.p.z+b.v.z*.25;sp=run;}
    else{const side=e.slot===1?-1:e.slot===2?1:(e.p.z>0?1:-1);tx=Math.max(-S.FL+3,Math.min(S.FL-3,b.p.x-s*2.5));tz=side*4;sp=run*.8;}}
  socTeamMove(e,tx,tz,sp,dt);}

/* ---------- your buttons ---------- */
function socTeamButtons(){const tm=SC.tm,o=tm.own,me=tm.me;
  if(o===me){socBtnSet('#scMain','⚽<br>SHOOT','orange');socBtnSet('#scTrick','👟<br>PASS','purple');}
  else if(o&&o.team==='us'){socBtnSet('#scMain','⚽<br>…','dim');socBtnSet('#scTrick','🙋<br>PASS ME!','purple'+(tm.call?' dim':''));}
  else if(o){const d=socTeamD(me,o);socBtnSet('#scMain','🛡️<br>TACKLE',d<1.6&&me.cool<=0?'':'dim');socBtnSet('#scTrick','👟<br>PASS','purple dim');}
  else{socBtnSet('#scMain','⚽<br>…','dim');socBtnSet('#scTrick','👟<br>PASS','purple dim');}}
function socTeamPress(){const tm=SC.tm,o=tm.own,me=tm.me;if(!tm||tm.phase!=='play')return;
  if(o===me){if(tm.freeze>0)tm.freeze=0;const S=SOC,f=me.face,fx=Math.sin(f),dist=S.FL-me.p.x;
    if(fx>.25&&dist<24){socTeamShootMe();}else{const b=SC.ball;b.st='free';b.v.set(Math.sin(f)*13,2.2,Math.cos(f)*13);tm.own=null;tm.passTo=null;me.touch=.4;socKick(av);tone(150,.08,'sine',.16);tm.last='us';socTeamHud();}}
  else if(o&&o.team==='them'){if(me.cool>0)return;me.cool=.9;socPose(av,'tackle');setTimeout(()=>{if(av.socPose===SOC_POSE.tackle)socPose(av,null);},420);
    if(socTeamD(me,o)>1.6){toast(`Get closer to ${o.key?'the goalie':o.r.n} to tackle! 🛡️`);return;}
    if(o.key&&o.hold>0){toast('You can\'t tackle the goalie when they\'re holding it!');return;}
    if(Math.random()>.6){toast(`Missed! ${o.r.n} kept it`);tone(200,.12,'sine',.08);return;}
    o.stun=.7;socTeamGive(me);socSay('🛡️ Great tackle!');tone(660,.1,'triangle',.12);did('soccer','tackle');}}
// your shot: where you're facing, like the 1-on-1
function socTeamShootMe(){const S=SOC,tm=SC.tm,me=tm.me,b=SC.ball,f=me.face,fx=Math.sin(f),fz=Math.cos(f),dist=S.FL-me.p.x;
  const k=(S.FL-b.p.x)/fx;let tz=b.p.z+fz*k;tz=Math.max(-S.GW-1.2,Math.min(S.GW+1.2,tz))+(Math.random()-.5)*dist*.05;const ty=.25+Math.random()*Math.min(1.5,.5+dist*.07);
  tm.own=null;tm.passTo=null;me.touch=.5;socKick(av);socShoot(b,1,tz,ty,Math.max(.45,dist/17),0);b.shot.by=me;tm.last='us';socTeamHud();}
function socTeamPassBtn(){const tm=SC.tm;if(!tm||tm.phase!=='play')return;const o=tm.own,me=tm.me;
  if(o===me){if(tm.freeze>0)tm.freeze=0;const m=socTeamBestMate(me,me.face);if(m)socTeamPassTo(me,m,false);else toast('Nobody open to pass to! Run or shoot ⚽');}
  else if(o&&o.team==='us'&&!tm.call){tm.call=true;toast(`🙋 ${o.key?'Goalie':o.r.n}, pass it to me!`);}}
// 🎥 high up behind you, looking up the field toward the goal you attack, so you can see your teammates to pass to
// (like football's pick-up game camera; a bit closer on a wide screen)
function socTeamCam(dt){const z=socZ(),c=SC.cam,me=SC.tm.me,k=innerWidth>innerHeight?.75:1,l=socL(player.pos);
  const P=_sA.set(l.x-15*k,10.5*k,l.z*.65),T=new THREE.Vector3(l.x+5,0,l.z*.85);z.g.localToWorld(P);z.g.localToWorld(T);
  if(!c.init){c.p.copy(P);c.t.copy(T);c.init=true;}c.p.lerp(P,Math.min(1,dt*4));c.t.lerp(T,Math.min(1,dt*5));camera.position.copy(c.p);camera.lookAt(c.t);}
// what the test can see and do
window.__soccer=Object.assign(window.__soccer||{},{team:()=>SC.tm,teamPress:socTeamPress,teamPass:socTeamPassBtn,
  teamPlace:(x,z,f)=>{const tm=SC.tm,me=tm.me;me.p.set(x,0,z);me.face=f;socTeamSyncMe(true);SC.ball.st='free';SC.ball.shot=null;SC.ball.in=false;socTeamGive(me);tm.freeze=0;}});
