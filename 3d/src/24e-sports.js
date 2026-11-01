/* ================= SPORTS: basketball and batting practice =================
   The places are built in 12c-place-sports.js. Everything here works in each place's own local space
   (the balls and the computer player are children of the zone's group), so "toward the hoop" is always -z.
   🏀 Free throws: 10 shots from the line. 🔥 Shootout: 60 seconds, 2s and 3s, dunks near the rim.
   🆚 1-on-1: first to 11 against Kai, who guards you, blocks, rebounds and shoots back.
   ⚾ Batting practice: 10 pitches from the machine. Swing timing decides the hit. */
const SP={mode:null,z:null,balls:[],ball:null,poss:null,hold:null,dunk:null,score:0,opp:0,shots:0,t:0,left:0,
  next:0,busy:0,stealCD:0,msgT:0,lastBy:null,cpu:null,menu:false,bat:null,cam:{p:new THREE.Vector3(),t:new THREE.Vector3(),init:false},
  autoYaw:true};
const SP_G=9.8,SP_BR=.13,SP_SWEET=.8;// aim is +0.009 strong: right on the rim's sweet spot (tuned with a quick physics simulation)
if(!SAVE.sports)SAVE.sports={};
const spBest=(k,v,hi=true)=>{const S=SAVE.sports;if(v==null)return S[k];if(S[k]==null||(hi?v>S[k]:v<S[k])){S[k]=v;persist();return true;}return false;};

/* ---------- on-screen buttons, scores and menus ---------- */
{const st=document.createElement('style');st.textContent=`
#spHud{left:50%;top:calc(env(safe-area-inset-top) + 108px);transform:translateX(-50%);display:none;align-items:center;gap:8px;z-index:9}
body.sp-on #spHud{display:flex}
#spTop{display:flex;gap:10px;align-items:center;background:rgba(29,26,47,.82);color:#fff;border-radius:999px;padding:7px 14px;font-weight:600;font-size:15px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.25)}
#spTop b{color:#ffd23f}#spScore{font-size:18px;font-weight:700}
#spLeave{background:rgba(255,255,255,.9);border-radius:999px;padding:8px 12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.2)}
#spMain{position:fixed;display:none;z-index:6;border-radius:50%;width:104px;height:104px;font-size:17px;font-weight:700;color:#fff;line-height:1.1;
  background:radial-gradient(circle at 35% 30%,#ffb067,#ff6a1f);border:4px solid rgba(255,255,255,.85);box-shadow:0 6px 20px rgba(255,106,31,.5);touch-action:none}
#spMain.green{background:radial-gradient(circle at 35% 30%,#8ff59a,#2fb84a);box-shadow:0 6px 20px rgba(47,184,74,.5)}
#spMain.purple{background:radial-gradient(circle at 35% 30%,#c6b4ff,#7a4dff);box-shadow:0 6px 20px rgba(122,77,255,.5)}
#spMain.dim{opacity:.45}
#spMain:active{transform:scale(.93)}
body.sp-on #spMain{display:block}
body.sp-free #spMain{right:calc(env(safe-area-inset-right) + 124px);bottom:calc(env(safe-area-inset-bottom) + 24px)}
body.sp-fixed #spMain{left:50%;margin-left:-60px;width:120px;height:120px;font-size:20px;bottom:calc(env(safe-area-inset-bottom) + 34px)}
body.sp-bat #spMain{left:auto;margin-left:0;right:calc(env(safe-area-inset-right) + 22px)}
#spMeter{position:fixed;z-index:6;display:none;width:26px;height:170px;border-radius:14px;background:rgba(255,255,255,.88);box-shadow:0 4px 14px rgba(59,35,87,.3);overflow:hidden}
#spMeter i{position:absolute;left:0;right:0;background:linear-gradient(#7ee081,#2fb84a)}
#spMeter b{position:absolute;left:-2px;right:-2px;height:8px;margin-bottom:-4px;border-radius:4px;background:#ff3b6b;box-shadow:0 0 0 2px #fff}
body.sp-free #spMeter{right:calc(env(safe-area-inset-right) + 236px);bottom:calc(env(safe-area-inset-bottom) + 24px)}
body.sp-fixed #spMeter{left:50%;margin-left:80px;bottom:calc(env(safe-area-inset-bottom) + 34px)}
#spMeter.show{display:block}
body.sp-on #actions,body.sp-on #petBtn,body.sp-on #talkBtn,body.sp-on #poseBtn,body.sp-on #hint,body.sp-on #side,body.sp-on #zoomCtl,body.sp-on #mini,body.sp-fixed #jump{display:none!important}
#spCard h2{margin:0 0 4px}#spCard p{margin:4px 0 12px;color:var(--muted)}
.spPick{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff7ef;border-radius:18px;padding:12px 14px;margin:8px 0;box-shadow:0 3px 0 #f1dcc6}
.spPick:active{transform:scale(.97)}
.spPick>b{font-size:34px;font-weight:400}.spPick span{display:flex;flex-direction:column;gap:2px}.spPick strong{font-size:18px}.spPick small{font-size:13px;color:var(--muted)}
.spBig{font-size:46px;margin:6px 0}
@media (max-height:520px){body.sp-fixed #spMain{width:96px;height:96px;margin-left:-48px;font-size:17px}#spMeter{height:130px}#spHud{top:calc(env(safe-area-inset-top) + 8px)}}`;
 document.head.appendChild(st);
 const d=document.createElement('div');d.innerHTML=`<div class="hud" id="spHud"><div id="spTop"><b id="spTitle"></b><span id="spScore"></span><span id="spInfo"></span></div><button id="spLeave">✕ Leave</button></div>
<button id="spMain"></button><div id="spMeter"><i></i><b></b></div>
<div class="modal" id="spMenu"><div class="card" id="spCard"></div></div>`;
 document.body.append(...d.children);}
const spBody=(on,free)=>{document.body.classList.toggle('sp-on',!!on);document.body.classList.toggle('sp-free',!!on&&!!free);document.body.classList.toggle('sp-fixed',!!on&&!free);};
function spHud(title,score,info){$('#spTitle').textContent=title;$('#spScore').textContent=score;$('#spInfo').textContent=info||'';}
function spBtn(text,cls){const b=$('#spMain');if(b.dataset.t!==text){b.dataset.t=text;b.innerHTML=text;}b.className=cls||'';}

/* ---------- small helpers ---------- */
const spLocal=(z,w)=>{const [x,zz]=z.toLocal(w.x,w.z);return new THREE.Vector3(x,w.y,zz);};
const spSetWorld=(z,lx,lz)=>{const [x,w]=z.toWorld(lx,lz);player.pos.x=x;player.pos.z=w;};
const spFace=(z,lx,lz,tx,tz)=>Math.atan2(tx-lx,tz-lz)+z.rot;// world facing for looking from (lx,lz) to (tx,tz)
function spLock(){return !!SP.mode&&(SP.mode==='ft'||SP.mode==='bat'||!!SP.hold||!!SP.dunk);}
function spSay(t,ms=1300){banner(t);}
function spCheer(){try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}}
// arm poses drawn on top of the normal walking animation
function spArms(a,pose,t){const A=a.arms;if(!A)return;
  if(pose==='up'){for(const [i,s] of [[0,1],[1,-1]]){A[i].sh.rotation.x=-2.75;A[i].sh.rotation.z=s*.12;A[i].el.rotation.x=-.75;}}
  else if(pose==='dribble'){A[0].sh.rotation.x=-.55;A[0].sh.rotation.z=-.25;A[0].el.rotation.x=-.5-Math.abs(Math.sin(t*9))*.35;}
  else if(pose==='guard'){A[0].sh.rotation.z=-1.25;A[1].sh.rotation.z=1.25;A[0].sh.rotation.x=A[1].sh.rotation.x=-.3;A[0].el.rotation.x=A[1].el.rotation.x=-.3;}
  else if(pose==='reach'){for(const i of [0,1]){A[i].sh.rotation.x=-1.3;A[i].el.rotation.x=-.2;}}}

/* ---------- 🏀 basketball physics ---------- */
const spBallMat=phys('#ff7a1f',{roughness:.55,clearcoat:.2});
const spBallTex=canvasTex(256,128,(x)=>{x.fillStyle='#ff7a1f';x.fillRect(0,0,256,128);x.strokeStyle='#2a1406';x.lineWidth=5;
  x.beginPath();x.moveTo(0,64);x.lineTo(256,64);x.stroke();for(const c of [64,192]){x.beginPath();x.moveTo(c,0);x.lineTo(c,128);x.stroke();}
  for(const c of [0,128,256]){x.beginPath();x.ellipse(c,64,46,64,0,0,Math.PI*2);x.stroke();}});
spBallMat.map=spBallTex;
function spNewBall(){const z=Z.court;const m=M(sph(SP_BR,24,16),spBallMat,0,-5,0,z.g,true,false);
  const b={m,p:new THREE.Vector3(0,-5,0),v:new THREE.Vector3(),st:'hold',by:'me',pts:2,made:false,bounces:0,age:0,rim:0,gone:0,blockAt:-1};SP.balls.push(b);return b;}
function spDropBall(b){const i=SP.balls.indexOf(b);if(i>=0)SP.balls.splice(i,1);Z.court.g.remove(b.m);if(SP.ball===b)SP.ball=null;}
function spStepBall(b,dt){const C=SPC,n=5,h=dt/n,p=b.p,v=b.v;b.age+=dt;
  if(b.blockAt>=0&&b.age>=b.blockAt){b.blockAt=-1;b.blocked=true;v.set((Math.random()<.5?-1:1)*(2+Math.random()*2),1.5,3+Math.random()*2);tone(140,.12,'square',.12);}
  for(let k=0;k<n;k++){const py=p.y;v.y-=SP_G*h;p.addScaledVector(v,h);
    if(p.y<SP_BR){p.y=SP_BR;if(v.y<0){if(v.y<-1.2){b.bounces++;if(b.bounces<6)tone(120+Math.random()*20,.06,'sine',.08);}v.y=-v.y*.7;v.x*=.9;v.z*=.9;}}
    // keep it near the court
    if(Math.abs(p.x)>C.X+1.4){p.x=Math.sign(p.x)*(C.X+1.4);v.x*=-.5;}
    if(p.z<C.Z0-.5){p.z=C.Z0-.5;v.z*=-.5;}if(p.z>C.Z1+1.4){p.z=C.Z1+1.4;v.z*=-.5;}
    // backboard
    if(Math.abs(p.x)<.75+SP_BR*.5&&p.y>2.5-SP_BR&&p.y<3.5+SP_BR&&p.z-C.BOARD<SP_BR+.025&&p.z-C.BOARD>-.15&&v.z<0){p.z=C.BOARD+SP_BR+.025;v.z=-v.z*.55;v.x*=.85;tone(200,.05,'square',.05);}
    // rim: bounce off the closest point of the ring
    {const dx=p.x,dz=p.z-C.HZ,hd=Math.hypot(dx,dz)||1e-4;const qx=dx/hd*C.RR,qz=C.HZ+dz/hd*C.RR;
     const ex=p.x-qx,ey=p.y-C.RIM,ez=p.z-qz,el=Math.hypot(ex,ey,ez),m=SP_BR+.018;
     if(el<m&&el>1e-5){const nx=ex/el,ny=ey/el,nz=ez/el;p.set(qx+nx*m,C.RIM+ny*m,qz+nz*m);const vn=v.x*nx+v.y*ny+v.z*nz;
       if(vn<0){v.x-=1.5*vn*nx;v.y-=1.5*vn*ny;v.z-=1.5*vn*nz;v.multiplyScalar(.92);b.rim++;Z.court.hoop.shake=Math.min(1,.4+Math.abs(vn)*.15);if(Math.abs(vn)>.6)tone(520,.07,'triangle',.07);}}
     // through the hoop from above: it counts
     if(!b.made&&!b.blocked&&py>=C.RIM&&p.y<C.RIM&&v.y<0&&hd<C.RR-.03)spMade(b);}}
  b.m.position.copy(p);b.m.rotation.x+=v.z*dt*4;b.m.rotation.z-=v.x*dt*4;}
// launch a shot from `from` toward the rim. perr: too soft/too hard (0 is perfect), lerr: left/right (radians)
function spLaunch(b,from,perr,lerr){const C=SPC;b.p.copy(from);const dx=0-from.x,dz=C.HZ-from.z,dist=Math.hypot(dx,dz),dy=C.RIM+.02-from.y;
  const t=.62+dist*.09;let vx=dx/t,vz=dz/t;const vy=(dy+.5*SP_G*t*t)/t;const c=Math.cos(lerr),s=Math.sin(lerr);[vx,vz]=[vx*c-vz*s,vx*s+vz*c];
  b.v.set(vx,vy,vz).multiplyScalar(1+perr);b.st='fly';b.age=0;b.bounces=0;b.rim=0;b.made=false;b.blocked=false;b.m.position.copy(b.p);}
const spThree=(lx,lz)=>{const C=SPC,cx=C.ARC-.25;return Math.abs(lx)>=cx?true:Math.hypot(lx,lz-C.HZ)>C.ARC;};
function spMade(b){const C=SPC,z=Z.court;b.made=true;z.hoop.swish=1;tone(880,.12,'triangle',.12);tone(1320,.16,'sine',.1,.08);
  burst(z.g.localToWorld(new THREE.Vector3(0,C.RIM,C.HZ)),b.pts===3?'#ffd23f':'#ff8a1f',b.pts===3?50:30,3);
  if(SP.mode==='ft'){SP.score++;spSay(b.rim?'🏀 It\'s good!':'🏀 Swish!');}
  else if(SP.mode==='shoot'){SP.score+=b.pts;spSay(b.dunked?'💥 SLAM DUNK!':b.pts===3?'🔥 Three!':b.rim?'🏀 Bucket!':'🏀 Swish!');}
  else if(SP.mode==='v1'){if(b.by==='me')SP.score+=b.pts;else SP.opp+=b.pts;
    spSay(b.by==='me'?(b.dunked?'💥 SLAM DUNK!':b.pts===3?'🔥 Three pointer!':'🏀 Bucket!'):(b.dunked?'😮 Kai dunks!':'Kai scores'));
    SP.poss=null;SP.next=1.3;SP.nextFor=b.by==='me'?'cpu':'me';}
  if(b.by==='me'){spCheer();did('sport','basket');}
  spBoard();}
function spBoard(){const zb=Z.court.board;if(SP.mode==='ft')zb.draw(SP.score,10-SP.shots,'🎯 MADE · LEFT');else if(SP.mode==='shoot')zb.draw(SP.score,Math.ceil(SP.left),'🔥 POINTS · TIME');else if(SP.mode==='v1')zb.draw(SP.score,SP.opp,'YOU · KAI');else zb.draw('0','0');}

/* ---------- the computer player for 1-on-1 ---------- */
function spCpu(){if(SP.cpu)return SP.cpu;const L=Object.assign(defaultGuyLook(),{skin:'#b97a4f',eyes:'#3d2a1a',hair:{id:'crop',c:'#2b1d16'},dress:null,
    top:{id:'bballjersey',c:'#4fb6ff'},bottom:{id:'bballshorts',c:'#4fb6ff'},shoes:{id:'courtkicks',c:'#ffffff'},hat:{id:'sweatband',c:'#4fb6ff'},extras:{}});
  const a=new Avatar(L,'Kai','#2f7fd9');a.g.visible=false;Z.court.g.add(a.g);
  return SP.cpu={a,p:new THREE.Vector3(0,0,0),vy:0,face:0,sp:0,plan:null,t:0,shootT:-1,air:false};}
function spCpuJump(c,v){if(c.p.y<=.01){c.vy=v;}}

/* ---------- starting and ending games ---------- */
function spOpenMenu(zid){if(SP.mode||SP.menu)return;SP.menu=true;const S=SAVE.sports,c=$('#spCard');
  if(zid==='court')c.innerHTML=`<h2>🏀 Basketball Court</h2><p>Pick a game!</p>
   <button class="spPick" data-m="ft"><b>🎯</b><span><strong>Free throws</strong><small>10 shots from the line${S.ft!=null?` · Best: ${S.ft} of 10`:''}</small></span></button>
   <button class="spPick" data-m="shoot"><b>🔥</b><span><strong>Shootout</strong><small>60 seconds. Shoot from anywhere, dunk up close${S.shoot!=null?` · Best: ${S.shoot} pts`:''}</small></span></button>
   <button class="spPick" data-m="v1"><b>🆚</b><span><strong>1-on-1 vs Kai</strong><small>First to 11 wins${S.v1w?` · Wins: ${S.v1w}`:''}</small></span></button>
   <button class="btn ghost" id="spNo">Not now</button>`;
  else c.innerHTML=`<h2>⚾ Batting Cage</h2><p>The machine throws 10 pitches. Tap SWING when the ball gets to the plate!</p>
   <div class="spBig">⚾🏏</div><p>${S.hr?`Most home runs: ${S.hr} · `:''}${S.far?`Longest hit: ${S.far} ft`:'Hit it over the fence for a home run!'}</p>
   <button class="btn" data-m="bat">▶ Play ball!</button> <button class="btn ghost" id="spNo">Not now</button>`;
  spSuitBtn(c,zid);
  c.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{spCloseMenu();spStart(b.dataset.m);});
  $('#spNo').onclick=spCloseMenu;$('#spMenu').classList.add('show');sfx('pop');}
// "Suit up": put on the sport's outfit in one tap (your old outfit is kept so you can switch back after)
const spWearing=zid=>{const L=sportLook(zid),l=SAVE.look;return !l.dress&&l.top&&l.top.id===L.top.id&&l.bottom&&l.bottom.id===L.bottom.id;};
function spSuitBtn(c,zid){if(spWearing(zid))return;const b=document.createElement('button');b.className='btn';b.style.cssText='display:block;width:calc(100% - 8px);margin:2px 4px 8px';
  b.textContent=zid==='court'?'👕 Suit up in basketball clothes':'👕 Suit up in a baseball uniform';c.querySelector('p').after(b);
  b.onclick=()=>{const L=sportLook(zid),l=SAVE.look;if(!spCanUnsuit())SAVE.sports.prev=JSON.parse(JSON.stringify(l));
    l.dress=null;l.top={...L.top};l.bottom={...L.bottom};l.shoes={...L.shoes};l.hat={...L.hat};l.extras={...(l.extras||{})};if(L.glove)l.extras.glove=L.glove;else delete l.extras.glove;
    persist();rebuildPlayer();sfx('star');b.textContent='✅ Suited up! Pick a game';b.disabled=true;b.style.opacity=.7;did('dress','sports');};}
const spCanUnsuit=()=>{const P=SAVE.sports.prev;return !!P&&isGuy(P)===isGuy(SAVE.look);};
function spUnsuit(){const P=SAVE.sports.prev;if(!spCanUnsuit())return;SAVE.look=P;delete SAVE.sports.prev;persist();rebuildPlayer();sfx('pop');}
function spCloseMenu(){SP.menu=false;$('#spMenu').classList.remove('show');}
$('#spMenu').addEventListener('click',e=>{if(e.target.id==='spMenu'&&!SP.mode)spCloseMenu();});
function spStart(m){const C=SPC;spCloseMenu();SP.mode=m;SP.z=m==='bat'?Z.batting:Z.court;SP.score=0;SP.opp=0;SP.shots=0;SP.t=0;SP.hold=null;SP.dunk=null;SP.next=0;SP.poss=null;SP.cam.init=false;SP.msgT=0;
  for(const b of SP.balls.slice())spDropBall(b);
  closeMap&&closeMap();joy.id=null;joy.x=joy.y=0;$('#joy').style.display='none';
  if(m==='bat'){spBody(true,false);spBatStart();return;}
  spBody(true,m!=='ft');did('play',m);
  if(m==='ft'){spHud('🎯 Free throws','0 / 0','10 shots');spSetWorld(SP.z,0,C.FT+.25);player.face=spFace(SP.z,0,C.FT+.25,0,C.HZ);spGive();}
  else if(m==='shoot'){SP.left=60;spHud('🔥 Shootout','0 pts','60s');spSetWorld(SP.z,0,C.FT+.6);player.face=spFace(SP.z,0,C.FT+.6,0,C.HZ);spGive();toast('Hold SHOOT, let go in the green. Get close to the hoop to DUNK!');}
  else if(m==='v1'){const c=spCpu();c.a.g.visible=true;spHud('🆚 You vs Kai','0 - 0','first to 11');spCheck('me');toast('You get the ball first! Score 11 to win 🏀');}
  cam.yaw=player.face+Math.PI;cam.cy=cam.yaw;spBoard();setTrack('stadium');}
// hand the player a ball
function spGive(){const b=spNewBall();b.st='hold';b.by='me';SP.ball=b;SP.poss='me';}
// check ball at the top of the key for whoever gets the next possession
function spCheck(who){const C=SPC,z=SP.z,c=spCpu();for(const b of SP.balls.slice())spDropBall(b);
  const top=C.HZ+5.5,def=C.HZ+4.2;const b=spNewBall();SP.ball=b;SP.poss=who;b.by=who;b.st='hold';
  if(who==='me'){spSetWorld(z,0,top);player.face=spFace(z,0,top,0,C.HZ);c.p.set(0,0,def);c.face=Math.atan2(0,1);}
  else{spSetWorld(z,0,def);player.face=spFace(z,0,def,0,top);c.p.set(0,0,top);c.face=Math.PI;c.plan=null;c.t=0;c.shootT=-1;}
  cam.yaw=spFace(z,0,top,0,C.HZ)+Math.PI;cam.cy=cam.yaw;spBoard();spHud('🆚 You vs Kai',`${SP.score} - ${SP.opp}`,who==='me'?'your ball':'Kai\'s ball');}
function spEnd(show=true,quit=false){const m=SP.mode;if(!m)return;SP.mode=null;SP.hold=null;SP.dunk=null;$('#spMeter').classList.remove('show');spBody(false);
  for(const b of SP.balls.slice())spDropBall(b);if(SP.cpu)SP.cpu.a.g.visible=false;
  if(m==='bat')spBatStop();Z.court.board.draw('0','0');
  if(!show)return;let h='',coins=0,best=false;
  if(quit){const sc=m==='v1'?`${SP.score} - ${SP.opp}`:m==='bat'?`${SP.bat.hits} hits`:m==='ft'?`${SP.score} / ${SP.shots}`:`${SP.score} pts`;
    h=`<h2>👋 You left the game</h2><div class="spBig">${sc}</div><p>Finish a whole game to earn coins!</p>`;}
  else 
  if(m==='ft'){coins=SP.score*2+(SP.score===10?10:0);best=spBest('ft',SP.score);h=`<h2>${SP.score>=8?'🏆 Sharpshooter!':SP.score>=5?'🏀 Nice shooting!':'🏀 Good try!'}</h2><div class="spBig">${SP.score} / 10</div><p>free throws made${best?' · New best! 🎉':''}</p>`;}
  else if(m==='shoot'){coins=Math.round(SP.score/2);best=spBest('shoot',SP.score);h=`<h2>${SP.score>=20?'🔥 On fire!':'🏀 Time!'}</h2><div class="spBig">${SP.score} pts</div><p>in 60 seconds${best?' · New best! 🎉':''}</p>`;}
  else if(m==='v1'){const win=SP.score>SP.opp;coins=win?30:10;if(win){SAVE.sports.v1w=(SAVE.sports.v1w||0)+1;persist();}h=`<h2>${win?'🏆 You win!':'😅 Kai wins this time'}</h2><div class="spBig">${SP.score} - ${SP.opp}</div><p>${win?'You beat Kai 1-on-1!':'Practice your shot and try again!'}</p>`;}
  else if(m==='bat'){const B=SP.bat;coins=B.hits*2+B.hr*5;const nb=spBest('hr',B.hr);const nf=B.far&&spBest('far',B.far);
    h=`<h2>${B.hr?'💥 Slugger!':B.hits?'⚾ Nice hitting!':'⚾ Good try!'}</h2><div class="spBig">${B.hits} hits · ${B.hr} 🏠</div><p>${B.far?`Longest hit: ${B.far} ft`:'Watch the ball and swing when it gets to the plate!'}${nb||nf?' · New best! 🎉':''}</p>`;}
  if(quit)coins=0;
  if(coins>0)earn(coins,'sports');if(coins>0)h+=`<p>🪙 +${coins} coins</p>`;
  const zid=m==='bat'?'batting':'court';
  $('#spCard').innerHTML=h+`<button class="btn" id="spAgain">🔁 Play again</button> <button class="btn ghost" id="spDone">Done</button>`+(spCanUnsuit()?`<br><button class="btn ghost" id="spUnsuit">👗 Back to my outfit</button>`:'');
  if(spCanUnsuit())$('#spUnsuit').onclick=()=>{spUnsuit();spCloseMenu();};
  $('#spAgain').onclick=()=>{spCloseMenu();if(zid==='court')spOpenMenu('court');else spStart('bat');};$('#spDone').onclick=spCloseMenu;
  SP.menu=true;$('#spMenu').classList.add('show');if(coins>=10||best)sfx('tada');}
$('#spLeave').onclick=()=>spEnd(true,true);

/* ---------- the big button ---------- */
function spCanDunk(){if(SP.mode!=='shoot'&&SP.mode!=='v1')return false;if(SP.poss!=='me'||!SP.ball||SP.ball.st!=='hold'||SP.dunk||SP.hold)return false;
  const l=spLocal(SP.z,player.pos);const d=Math.hypot(l.x,l.z-SPC.HZ);return d<2.1&&l.z>SPC.HZ-.2;}
function spPress(){if(!SP.mode||SP.menu)return;
  if(SP.mode==='bat'){spSwing();return;}
  if(SP.mode==='v1'&&SP.poss==='cpu'){spSteal();return;}
  if(SP.poss!=='me'||!SP.ball||SP.ball.st!=='hold'||SP.dunk||SP.hold)return;
  if(spCanDunk()){spDunk();return;}
  SP.hold={t:0};$('#spMeter').classList.add('show');tone(440,.05,'sine',.06);}
function spRelease(){if(!SP.hold)return;const C=SPC,z=SP.z,h=SP.hold;SP.hold=null;$('#spMeter').classList.remove('show');
  const u=(h.t/1.05)%2,v=u<1?u:2-u;const l=spLocal(z,player.pos);const dist=Math.hypot(l.x,l.z-C.HZ);
  let w=SP.mode==='ft'?.15:Math.max(.07,.15-.014*Math.max(0,dist-3));let contest=0;
  if(SP.mode==='v1'){const c=SP.cpu;contest=Math.max(0,1-Math.hypot(c.p.x-l.x,c.p.z-l.z)/1.6);w*=1-.45*contest;}
  const off=(v-SP_SWEET)/w,perr=.009+off*.02+(Math.random()-.5)*.006,lerr=(Math.random()-.5)*.03*(1+contest*2)*(Math.abs(off)>1?1.6:1);
  const b=SP.ball;const fwd=new THREE.Vector3(-l.x,0,C.HZ-l.z).normalize();
  const from=new THREE.Vector3(l.x+fwd.x*.2,(l.y||0)+2.15,l.z+fwd.z*.2);
  b.by='me';b.pts=SP.mode==='ft'?1:spThree(l.x,l.z)?3:2;spLaunch(b,from,perr,lerr);SP.poss=null;SP.lastBy='me';SP.shots++;
  if(SP.mode!=='ft'&&player.onGround)player.vy=3.6;
  av.play&&av.play('hop');
  const tip=Math.abs(off)<=1?(Math.abs(off)<.35?'Perfect release! ✨':'Good release!'):v<SP_SWEET?'Too soft!':'Too hard!';toast(tip);
  if(SP.mode==='v1'&&contest>.35&&Math.random()<.15*contest+.04){const c=SP.cpu;spCpuJump(c,5.5);b.blockAt=.12;setTimeout(()=>{if(SP.mode)spSay('🖐️ Blocked by Kai!');},150);}
  if(SP.mode==='ft'){SP.next=2.4;}else if(SP.mode==='shoot'){SP.next=.55;}
  spHud(...spHudText());spBoard();}
function spHudText(){if(SP.mode==='ft')return ['🎯 Free throws',`${SP.score} / ${SP.shots}`,`${10-SP.shots} left`];
  if(SP.mode==='shoot')return ['🔥 Shootout',`${SP.score} pts`,`${Math.ceil(SP.left)}s`];
  if(SP.mode==='v1')return ['🆚 You vs Kai',`${SP.score} - ${SP.opp}`,SP.poss==='me'?'your ball':SP.poss==='cpu'?'Kai\'s ball':'loose ball!'];return ['','',''];}
{const b=$('#spMain');b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}spPress();});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>spRelease());
 b.addEventListener('contextmenu',e=>e.preventDefault());
 addEventListener('keydown',e=>{if(!SP.mode||e.repeat||e.target.tagName==='INPUT')return;if(e.code==='KeyF'||e.code==='Enter'){spPress();e.preventDefault();}if(e.code==='Escape')spEnd(true,true);});
 addEventListener('keyup',e=>{if(SP.mode&&(e.code==='KeyF'||e.code==='Enter'))spRelease();});}

/* ---------- dunks ---------- */
function spDunk(){const C=SPC,l=spLocal(SP.z,player.pos);SP.dunk={t:0,fx:l.x,fz:l.z,peak:0,slam:false};player.vy=7.4;player.onGround=false;tone(300,.2,'sine',.1,0,700);
  const fwd=Math.atan2(-l.x,C.HZ-l.z);player.face=fwd+SP.z.rot;
  if(SP.mode==='v1'){const c=SP.cpu;const cd=Math.hypot(c.p.x-l.x,c.p.z-l.z);if(cd<1&&Math.random()<.3){SP.dunk.blocked=true;spCpuJump(c,7);}}}
function spDunkStep(dt){const D=SP.dunk,C=SPC,z=SP.z,b=SP.ball,p=player.pos;D.t+=dt;
  const k=Math.min(1,D.t/.42),e=k*(2-k);const tx=0,tz=C.HZ+.42;spSetWorld(z,D.fx+(tx-D.fx)*e,D.fz+(tz-D.fz)*e);player.face=spFace(z,0,C.HZ+1,0,C.HZ);
  D.peak=Math.max(D.peak,p.y);
  if(D.t>=.42&&!D.slam){D.slam=true;if(D.blocked){spLaunch(b,new THREE.Vector3(0,C.RIM+.5,C.HZ+.5),0,0);b.v.set((Math.random()<.5?-1:1)*3,2,4);b.blocked=true;b.by='me';SP.poss=null;SP.lastBy='me';spSay('🖐️ Kai blocks the dunk!');}
    else{b.st='fly';b.by='me';b.pts=2;b.dunked=true;b.p.set(0,C.RIM+.35,C.HZ+.02);b.v.set(0,-6,0);b.age=0;b.made=false;b.blocked=false;b.rim=0;SP.poss=null;SP.lastBy='me';Z.court.hoop.shake=1;tone(90,.25,'square',.14);
      SP.shots++;if(SP.mode==='shoot')SP.next=.8;}}
  // hang on the rim for a moment, then drop
  if(D.slam&&D.t<.85&&!D.blocked){p.y=Math.max(p.y,D.peak-.05);player.vy=0;}
  if(D.t>=.85&&!D.blocked||D.t>=.6&&D.blocked){SP.dunk=null;}
  if(!D.slam){b.p.copy(spLocal(z,p));b.p.y=p.y+2.2;b.m.position.copy(b.p);}}

/* ---------- 1-on-1 defense, steals and Kai's turn ---------- */
function spSteal(){const c=SP.cpu,l=spLocal(SP.z,player.pos);if(SP.stealCD>0)return;SP.stealCD=.9;av.play&&av.play('hop');
  const d=Math.hypot(c.p.x-l.x,c.p.z-l.z);if(d>1.35){toast('Get closer to Kai to steal! 🖐️');return;}
  if(c.shootT<0&&Math.random()<.4){spSay('🖐️ Steal!');tone(660,.1,'triangle',.12);tone(990,.12,'triangle',.1,.08);SP.poss='me';SP.ball.st='hold';SP.ball.by='me';did('sport','steal');}
  else{toast('Missed! Kai kept the ball');tone(200,.12,'sine',.08);}}
function spCpuStep(dt,t){const C=SPC,c=SP.cpu,z=SP.z,l=spLocal(z,player.pos);c.t+=dt;let tx=c.p.x,tz=c.p.z,spd=0,pose=null;const b=SP.ball;
  const dP=Math.hypot(c.p.x-l.x,c.p.z-l.z);
  if(SP.poss==='me'){// guard: stay between the player and the hoop
    const hx=0-l.x,hz=C.HZ-l.z,hl=Math.hypot(hx,hz)||1;tx=l.x+hx/hl*Math.min(1.15,hl*.5);tz=l.z+hz/hl*Math.min(1.15,hl*.5);spd=3.2;pose='guard';c.face=Math.atan2(l.x-c.p.x,l.z-c.p.z);}
  else if(SP.poss==='cpu'&&b){// Kai's ball: drive to the rim or pull up for a jumper
    if(!c.plan){const drive=Math.random()<.4;const a=(Math.random()-.5)*2.4,d=drive?.7:2.6+Math.random()*2.6;c.plan={drive,x:Math.sin(a)*d,z:C.HZ+Math.abs(Math.cos(a))*d+.2};c.t=0;}
    if(c.shootT<0){tx=c.plan.x;tz=c.plan.z;spd=3;// step around you if you are right in the way
      const dx=tx-c.p.x,dz=tz-c.p.z,dl=Math.hypot(dx,dz)||1,ox=l.x-c.p.x,oz=l.z-c.p.z;if(dP<1&&(ox*dx+oz*dz)/dl>0){tx=c.p.x+dx/dl-dz/dl*1.2;tz=c.p.z+dz/dl+dx/dl*1.2;spd=2.4;}
      c.face=Math.atan2(dx,dz);pose='dribble';
      if(Math.hypot(c.plan.x-c.p.x,c.plan.z-c.p.z)<.3||c.t>4.5){c.shootT=0;c.face=Math.atan2(-c.p.x,C.HZ-c.p.z);spCpuJump(c,c.plan.drive?6.8:4.2);}}
    else{c.shootT+=dt;pose='up';c.face=Math.atan2(-c.p.x,C.HZ-c.p.z);
      if(c.shootT>=.34){c.shootT=-1;c.plan=null;const dist=Math.hypot(c.p.x,c.p.z-C.HZ);const contest=Math.max(0,1-dP/1.4);
        const three=spThree(c.p.x,c.p.z);let chance=(dist<1.4?.62:three?.3:.45)-contest*.3;// Kai is good, but beatable
        b.by='cpu';b.pts=three?3:2;SP.poss=null;SP.lastBy='cpu';
        if(dist<1.4&&Math.random()<.5){b.dunked=true;b.st='fly';b.p.set(0,C.RIM+.35,C.HZ+.02);b.v.set(0,-6,0);b.age=0;b.made=false;b.blocked=false;b.rim=0;Z.court.hoop.shake=1;tone(90,.25,'square',.14);
          if(!player.onGround&&dP<1.1&&Math.random()<.5){b.v.set(3,2,4);b.blocked=true;spSay('🖐️ You blocked the dunk!');did('sport','block');}}
        else{const ok=Math.random()<chance;const perr=.009+(ok?(Math.random()-.5)*.008:(Math.random()<.5?-1:1)*(.045+Math.random()*.04));
          spLaunch(b,new THREE.Vector3(c.p.x,c.p.y+2.15,c.p.z),perr,(Math.random()-.5)*(ok?.01:.05));b.dunked=false;
          if(!player.onGround&&dP<1.25&&Math.random()<.65){b.blockAt=.1;setTimeout(()=>{if(SP.mode){spSay('🖐️ Blocked!');tone(1200,.1,'triangle',.1);}},120);did('sport','block');}}
        spHud(...spHudText());}}}
  else if(b&&b.st!=='hold'&&(b.made===false)&&(b.bounces>0||b.rim>0||b.blocked||b.age>1.2)){// loose ball: go get the rebound
    tx=b.p.x;tz=b.p.z;spd=3.3;c.face=Math.atan2(tx-c.p.x,tz-c.p.z);pose='reach';}
  else if(SP.next>0){tx=0;tz=C.HZ+3;spd=1.5;c.face=Math.atan2(tx-c.p.x,tz-c.p.z);}
  // move
  const dx=tx-c.p.x,dz=tz-c.p.z,dl=Math.hypot(dx,dz);let moved=0;if(dl>.05&&spd>0){const s=Math.min(dl,spd*dt);c.p.x+=dx/dl*s;c.p.z+=dz/dl*s;moved=s/dt;}
  // don't walk through the player
  {const ox=c.p.x-l.x,oz=c.p.z-l.z,od=Math.hypot(ox,oz);if(od<.6&&od>1e-4){c.p.x=l.x+ox/od*.6;c.p.z=l.z+oz/od*.6;}}
  c.p.x=Math.max(-C.X,Math.min(C.X,c.p.x));c.p.z=Math.max(C.Z0+.3,Math.min(C.Z1,c.p.z));
  c.vy-=18*dt;c.p.y+=c.vy*dt;if(c.p.y<0){c.p.y=0;c.vy=0;}
  c.a.g.position.copy(c.p);c.a.g.rotation.y=c.face;c.a.update(dt,moved,c.p.y>.02);if(pose)spArms(c.a,pose,t);
  // Kai holding the ball
  if(SP.poss==='cpu'&&b&&b.st==='hold'){const f=c.face;if(c.shootT>=0){b.p.set(c.p.x+Math.sin(f)*.15,c.p.y+2.15,c.p.z+Math.cos(f)*.15);}
    else{const rx=-Math.cos(f),rz=Math.sin(f);b.p.set(c.p.x+rx*.32+Math.sin(f)*.2,SP_BR+Math.abs(Math.sin(t*9))*.62,c.p.z+rz*.32+Math.cos(f)*.2);}b.m.position.copy(b.p);b.m.rotation.x+=dt*6;}
  // grab a loose ball
  if(b&&SP.poss===null&&b.st!=='hold'&&!b.made&&(b.bounces>0||b.rim>0||b.blocked)&&b.age>.35&&b.p.y<2.3&&Math.hypot(b.p.x-c.p.x,b.p.z-c.p.z)<.55){b.st='hold';SP.poss='cpu';c.plan=null;c.shootT=-1;spHud(...spHudText());toast('Kai got the rebound');}}

/* ---------- the game tick ---------- */
function spCourtStep(dt,t){const C=SPC,z=SP.z,p=player.pos,l=spLocal(z,p);
  // leaving the court ends the game
  if(SP.mode!=='ft'&&curZone!==z){spEnd(true,true);return;}
  if(SP.mode==='ft'){spSetWorld(z,0,C.FT+.25);if(!SP.hold)player.face=spFace(z,0,C.FT+.25,0,C.HZ);}
  if(SP.hold){SP.hold.t+=dt;const u=(SP.hold.t/1.05)%2,v=u<1?u:2-u;const mk=$('#spMeter b'),gz=$('#spMeter i');mk.style.bottom=(v*100)+'%';
    const ll=spLocal(z,p),dist=Math.hypot(ll.x,ll.z-C.HZ);let w=SP.mode==='ft'?.15:Math.max(.07,.15-.014*Math.max(0,dist-3));
    if(SP.mode==='v1'){const c=SP.cpu;w*=1-.45*Math.max(0,1-Math.hypot(c.p.x-ll.x,c.p.z-ll.z)/1.6);}
    gz.style.bottom=((SP_SWEET-w)*100)+'%';gz.style.height=(w*200)+'%';player.face=spFace(z,ll.x,ll.z,0,C.HZ);}
  if(SP.dunk)spDunkStep(dt);
  if(SP.stealCD>0)SP.stealCD-=dt;
  // the ball in your hands
  const b=SP.ball;if(b&&b.st==='hold'&&SP.poss==='me'&&!SP.dunk){const f=player.face-z.rot;
    if(SP.hold){b.p.set(l.x+Math.sin(f)*.15,p.y+2.15,l.z+Math.cos(f)*.15);}
    else{const rx=-Math.cos(f),rz=Math.sin(f);b.p.set(l.x+rx*.32+Math.sin(f)*.22,p.y+SP_BR+Math.abs(Math.sin(t*9))*.62,l.z+rz*.32+Math.cos(f)*.22);if(SP.mode==='ft')b.p.y=p.y+1.05;}
    b.m.position.copy(b.p);}
  for(const bb of SP.balls.slice()){if(bb.st==='fly'){spStepBall(bb,dt);if(SP.mode!=='v1'&&(bb.age>3.2||bb.made&&bb.age>2.2))spDropBall(bb);}}
  // poses
  if(SP.hold||SP.dunk)spArms(av,'up',t);else if(SP.poss==='me'&&b&&b.st==='hold')spArms(av,SP.mode==='ft'?'reach':'dribble',t);else if(SP.mode==='v1'&&SP.poss==='cpu')spArms(av,'guard',t);
  // after a shot
  if(SP.mode==='ft'){if(!SP.ball||SP.ball.st!=='hold'){SP.next-=dt;if(SP.next<=0){if(SP.shots>=10){spEnd(true);return;}spGive();}}}
  else if(SP.mode==='shoot'){SP.left-=dt;if(SP.left<=0){spEnd(true);return;}if(SP.poss!=='me'&&!SP.dunk){SP.next-=dt;if(SP.next<=0)spGive();}}
  else if(SP.mode==='v1'){spCpuStep(dt,t);
    if(SP.poss===null&&b&&b.made){SP.next-=dt;if(SP.next<=0){if(SP.score>=11||SP.opp>=11){spEnd(true);return;}spCheck(SP.nextFor);}}
    else if(SP.poss===null&&b&&!b.made&&(b.bounces>0||b.rim>0||b.blocked)&&b.age>.35&&!SP.dunk){// rebound: grab it if you are close
      if(Math.hypot(b.p.x-l.x,b.p.z-l.z)<.6&&b.p.y<p.y+2.4){b.st='hold';SP.poss='me';b.by='me';spHud(...spHudText());toast('Rebound! 🙌');}
      else if(b.age>6){spCheck(SP.lastBy==='me'?'cpu':'me');}}
    // auto turn the camera toward the hoop when you are not dragging it
    if(look.id===null&&SP.poss==='me'){const want=spFace(z,l.x,l.z,0,C.HZ)+Math.PI;cam.yaw=angDamp(cam.yaw,want,Math.min(1,dt*1.2));}}
  if(SP.mode==='shoot'&&look.id===null){const want=spFace(z,l.x,l.z,0,C.HZ)+Math.PI;cam.yaw=angDamp(cam.yaw,want,Math.min(1,dt*1.2));}
  // button
  if(SP.mode==='v1'&&SP.poss==='cpu'){const c=SP.cpu;spBtn('🖐️<br>STEAL','purple'+(Math.hypot(c.p.x-l.x,c.p.z-l.z)<1.35&&SP.stealCD<=0?'':' dim'));}
  else if(spCanDunk())spBtn('💥<br>DUNK!','');else if(SP.poss==='me')spBtn('🏀<br>SHOOT','');else spBtn('🏀<br>…','dim');
  SP.hudT=(SP.hudT||0)+dt;if(SP.hudT>.25){SP.hudT=0;spHud(...spHudText());if(SP.mode==='shoot')spBoard();}}

/* ---------- ⚾ batting practice ---------- */
const spBatGeo=(()=>{const pts=[];const P=[[0,.016],[.03,.018],[.04,.016],[.2,.02],[.35,.026],[.55,.038],[.7,.042],[.74,.04],[.75,0]];for(const [y,r] of P)pts.push(new THREE.Vector2(r,y));return new THREE.LatheGeometry(pts,14);})();
function spBatStart(){const B=SPB,z=Z.batting;SP.bat={n:0,max:10,hits:0,hr:0,far:0,feet:0,phase:'wait',t:0,ball:null,swing:-1,hitDone:false,speed:8,label:''};
  spSetWorld(z,-.62,B.PLATE);player.face=Math.PI/2+z.rot;
  // a bat in your hands (it hangs off the body so it swings with you)
  const piv=new THREE.Group();av.g.add(piv);const bat=M(spBatGeo,std('#e8c99a',{roughness:.45}),0,0,0,piv,true,false);SP.bat.piv=piv;SP.bat.batM=bat;
  const bm=M(sph(.075,16,12),phys('#ffffff',{roughness:.5}),0,-5,0,z.g,true,false);SP.bat.bm=bm;
  {const seam=canvasTex(128,64,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,128,64);x.strokeStyle='#d0102b';x.lineWidth=3;x.beginPath();for(let i=0;i<=128;i+=4)x.lineTo(i,32+Math.sin(i/128*Math.PI*4)*18);x.stroke();});bm.material.map=seam;}
  z.backstop.visible=false;document.body.classList.add('sp-bat');spHud('⚾ Batting practice','0 hits','pitch 1 of 10');spBtn('⚾<br>SWING!','green');
  cam.yaw=player.face+Math.PI;cam.cy=cam.yaw;toast('Watch the pitching machine. Tap SWING when the ball reaches you!');}
function spBatStop(){const B=SP.bat;Z.batting.backstop.visible=true;document.body.classList.remove('sp-bat');if(!B)return;if(B.piv)B.piv.parent&&B.piv.parent.remove(B.piv);if(B.bm)Z.batting.g.remove(B.bm);if(B.splash)B.splash=null;}
function spSwing(){const B=SP.bat;if(!B||B.swing>=0)return;B.swing=0;B.hitDone=false;tone(260,.12,'sine',.07,0,520);}
function spBatPose(t){const B=SP.bat,A=av.arms;if(!B||!A)return;const s=B.swing;
  // stance: hands up by the back shoulder. swing: arms come through to the front
  let u=s<0?0:Math.min(1,s/.3);const ease=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
  const phi=-2.3+ease*4.1,elev=.95-Math.sin(Math.min(1,u*1.6)*Math.PI/2)*.95+(u>.8?(u-.8)*2:0);
  const dir=new THREE.Vector3(Math.sin(phi)*Math.cos(elev),Math.sin(elev),Math.cos(phi)*Math.cos(elev));
  B.piv.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
  const ax=-.9-Math.sin(ease*Math.PI)*.5;A[0].sh.rotation.x=ax;A[1].sh.rotation.x=ax;A[0].sh.rotation.z=.35-ease*.5;A[1].sh.rotation.z=-.1+ease*.2-.4;A[0].el.rotation.x=-1.2+ease*.9;A[1].el.rotation.x=-1.4+ease*1;
  av.hips.rotation.y=-.35+ease*1.1;
  // the bat's handle sits in your right hand
  av.g.position.copy(player.pos);av.g.rotation.y=player.face;av.g.updateMatrixWorld(true);B.piv.position.copy(av.g.worldToLocal(A[0].hand.getWorldPosition(new THREE.Vector3()))).add(new THREE.Vector3(0,-.04,0));B.piv.translateY(-.06);}
function spPitch(){const B=SP.bat,P=SPB;B.n++;const change=B.n>2&&Math.random()<.3;B.speed=change?6.2:7.6+B.n*.55;B.label=change?'🐢 Slow ball':B.n>=8?'🔥 Fastball':'⚾ Pitch';
  const from=new THREE.Vector3(0,1.12,P.MACH+.35),to=new THREE.Vector3((Math.random()-.5)*.16,.8+Math.random()*.2,P.PLATE);
  const T=from.distanceTo(to)/B.speed;B.ball={p:from.clone(),v:new THREE.Vector3((to.x-from.x)/T,(to.y-from.y+.5*SP_G*T*T)/T,(to.z-from.z)/T),st:'pitch',land:null,t:0,fair:true,hr:false};
  B.bm.position.copy(from);tone(180,.18,'sawtooth',.06,0,90);}
function spHit(e){const B=SP.bat,b=B.ball,P=SPB;const q=1-Math.abs(e)/.17;let ang,ex,la;b.st='hit';b.t=0;
  if(Math.abs(e)>.115){ang=Math.sign(e||1)*(.95+Math.random()*.35);ex=7.5;la=.5;b.fair=false;}
  else{ang=(e/.115)*.62+(Math.random()-.5)*.08;ex=6+q*q*12;la=(q<.3?.05:.1+q*.45)+(Math.random()-.5)*.08;b.fair=true;}
  b.v.set(Math.sin(ang)*Math.cos(la)*ex,Math.sin(la)*ex,-Math.cos(ang)*Math.cos(la)*ex);b.p.z=Math.min(b.p.z,P.PLATE-.05);
  tone(q>.85?1500:900,.08,'square',.14);tone(200,.12,'sine',.1);if(q>.85&&b.fair){spCheer();burst(Z.batting.g.localToWorld(b.p.clone()),'#ffd23f',30,3);}}
function spBatStep(dt,t){const B=SP.bat,P=SPB,z=SP.z;if(!B)return;spSetWorld(z,-.62,P.PLATE);player.face=Math.PI/2+z.rot;
  if(B.swing>=0){B.swing+=dt;if(B.swing>.55)B.swing=-1;}
  spBatPose(t);
  const b=B.ball;B.t+=dt;
  // machine light: red, yellow, green
  const ml=z.mlight.material.color;
  if(B.phase==='wait'){ml.setRGB(2,.4,.4);if(B.t>1.4){if(B.n>=B.max){spEnd(true);return;}B.phase='wind';B.t=0;toast(`${['','',''][0]}${B.n+1===B.max?'Last pitch! ':''}${(B.n+1>2&&Math.random()<0)?'':''}Get ready…`);}}
  else if(B.phase==='wind'){ml.setRGB(B.t<.6?2:.4,B.t<.6?1.8:2,.3);for(const w of z.wheels)w.rotation.x+=dt*30;if(B.t>1){B.phase='pitch';B.t=0;spPitch();spHud('⚾ Batting practice',`${B.hits} hits`,`${B.label} · ${B.n} of ${B.max}`);}}
  else if(B.phase==='pitch'&&b){for(const w of z.wheels)w.rotation.x+=dt*30;
    if(b.st==='pitch'){b.v.y-=SP_G*dt;b.p.addScaledVector(b.v,dt);
      // the swing reaches the plate about 0.14 seconds after you tap
      if(B.swing>=.14&&!B.hitDone){B.hitDone=true;const e=(b.p.z-P.PLATE)/B.speed;if(Math.abs(e)<=.17&&b.p.z>P.PLATE-.9)spHit(e);else{spSay(e<0?'Too early!':'Too late!');}}
      if(b.st==='pitch'&&b.p.z>P.PLATE+1.6){if(!B.hitDone)spSay('Strike! ⚾');B.phase='wait';B.t=0;b.st='done';}}
    if(b.st==='hit'){b.t+=dt;b.v.y-=SP_G*dt;b.p.addScaledVector(b.v,dt);
      const hd=Math.hypot(b.p.x,b.p.z-P.PLATE);
      // the fence stops low balls
      if(b.fair&&!b.land&&b.p.y<.95&&hd>P.FENCE-.1&&hd<P.FENCE+.3){const nx=b.p.x/hd,nz=(b.p.z-P.PLATE)/hd,vn=b.v.x*nx+b.v.z*nz;if(vn>0){b.v.x-=1.4*vn*nx;b.v.z-=1.4*vn*nz;b.wall=true;}}
      const w=z.g.localToWorld(b.p.clone());const inSea=Math.hypot(w.x,w.z)>R+1.6;
      if(b.p.y<.075&&(!inSea)){b.p.y=.075;if(!b.land){b.land=hd;spLanded(b,hd);}if(b.v.y<0)b.v.y*=-.35;b.v.x*=.8;b.v.z*=.8;}
      if(inSea&&b.p.y<-.2&&!b.splashed){b.splashed=true;burst(w,'#bfefff',40,3);sfx('splash');if(!b.land){b.land=hd;spLanded(b,hd);}}
      if(b.t>4.5||b.splashed&&b.t>2.4||b.land&&b.t>3){b.st='done';B.phase='wait';B.t=0;}}
    B.bm.position.copy(b.p);B.bm.rotation.x+=dt*20;}
  spHud('⚾ Batting practice',`${B.hits} hits${B.hr?` · ${B.hr} 🏠`:''}`,B.phase==='wait'&&B.n>=B.max?'done!':`${B.n||1} of ${B.max}`);
  spBtn('⚾<br>SWING!','green'+(B.swing>=0?' dim':''));}
function spLanded(b,hd){const B=SP.bat,P=SPB;const ft=Math.round(hd*12);
  if(!b.fair){spSay('Foul ball!');return;}
  B.hits++;B.far=Math.max(B.far,ft);B.feet+=ft;
  if(hd>P.FENCE&&!b.wall){B.hr++;spSay(`💥 HOME RUN! ${ft} ft`);spCheer();did('sport','homerun');sfx('tada');for(let k=0;k<3;k++)setTimeout(()=>burst(player.pos.clone().add(new THREE.Vector3(0,2.5,0)),rnd(['#ffd23f','#4fb6ff','#ff6fae']),40,4),k*200);}
  else spSay(ft<40?`⚾ Base hit! ${ft} ft`:ft<90?`⚾ Line drive! ${ft} ft`:`⚾ Deep fly! ${ft} ft`);}

/* ---------- cameras ---------- */
function sportsCam(dt){if(!SP.mode)return;const z=SP.z;let P,T;
  if(SP.mode==='ft'){P=z.g.localToWorld(new THREE.Vector3(.35,2.35,SPC.FT+3.4));T=z.g.localToWorld(new THREE.Vector3(0,2.1,SPC.HZ));}
  else if(SP.mode==='bat'){const B=SP.bat,b=B&&B.ball;
    if(b&&b.st==='hit'&&b.t>.15){P=z.g.localToWorld(new THREE.Vector3(.6,2.6,SPB.PLATE+3.2));T=z.g.localToWorld(b.p.clone());}
    else{P=z.g.localToWorld(new THREE.Vector3(.2,2.15,SPB.PLATE+3.5));T=z.g.localToWorld(new THREE.Vector3(-.25,.95,SPB.MACH+1));}}
  else return;
  const c=SP.cam;if(!c.init){c.p.copy(P);c.t.copy(T);c.init=true;}c.p.lerp(P,Math.min(1,dt*5));c.t.lerp(T,Math.min(1,dt*6));
  camera.position.copy(c.p);camera.lookAt(c.t);}

/* ---------- pads and the per-frame hook ---------- */
SP.onPad={court:false,batting:false};
anims.push((t,dt)=>{// runs every frame after the player moved, before the camera
  if(!SP.mode&&started&&!closetOpen&&!SP.menu&&!mapOpen){const p=player.pos;for(const id of ['court','batting']){const z=Z[id],[lx,lz]=z.toLocal(p.x,p.z),d=Math.hypot(lx-z.pad.lx,lz-z.pad.lz);
    if(d<z.pad.r&&player.onGround){if(!SP.onPad[id]){SP.onPad[id]=true;spOpenMenu(id);}}else if(d>1.3)SP.onPad[id]=false;}}
  if(curZone!==SP.lastZone){SP.lastZone=curZone;if(started&&!SP.mode&&curZone&&(curZone.id==='court'||curZone.id==='batting'))setTimeout(()=>toast(curZone.id==='court'?'Step on the 🏀 pad to play basketball!':'Step on the ⚾ pad for batting practice!'),1600);}
  if(!SP.mode)return;
  if(closetOpen){spEnd(false);return;}
  if(SP.mode==='bat')spBatStep(dt,t);else spCourtStep(dt,t);
  av.g.position.copy(player.pos);av.g.rotation.y=player.face;av.tag.visible=SP.mode!=='ft'&&SP.mode!=='bat';});
window.__sports={SP,step:(dt)=>{if(SP.mode)SP.mode==='bat'?spBatStep(dt,clock.elapsedTime):spCourtStep(dt,clock.elapsedTime);},start:spStart,end:spEnd,press:spPress,release:spRelease,menu:spOpenMenu,busy:()=>!!SP.mode};
