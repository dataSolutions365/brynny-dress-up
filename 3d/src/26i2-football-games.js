/* ================= 🏈 FOOTBALL GAMES on the field from 26i-football.js =================
   Step on the 🏈 pad by the near end zone and pick a game:
   🥅 Field goals: 8 kicks from the 20 out to the 50. Tap to aim (stop the marker in the green, the wind moves it),
      tap again for power (above the line gets it over the crossbar). The holder kneels, you run up and kick.
   🏈 Pick-up game: 3-on-3 flag football, you and Sam and Lily (🦅 Eagles) against Marcus, Nora and Jake (🐻 Bears).
      On offense you're the quarterback: pick a play, hike, and tap a receiver's button to throw (green = open).
      Run past the line yourself if nobody's open. On defense you're the pass rusher: wait for the 3 Mississippi
      count, then chase the quarterback and tap 🚩 GRAB to pull his flag. Pulling the QB's flag before he throws is a SACK.
      Pick-up rules: every drive starts at the 50, 4 downs to make 10 yards, a touchdown is 7, 3 drives each (or first to 21).
   💥 Sack the QB: just the rushing, 6 snaps against the Bears' quarterback.
   🏃 Kick returns: catch 5 punts (the glowing ring shows where it's coming down) and run them back.
      Sam and Lily block for you; 💨 SPIN gets you past a tackler.
   No tackling: everyone wears a flag belt, and a "tackle" is pulling a flag (kid-safe, like real flag football).
   Field space: x across, z along, +z toward the island. Your team always drives toward -z (the far end zone).
   The other players and the ball live in Z.football.g, so their positions are field positions. */
const FTB={mode:null,menu:false,pl:[],us:[],them:[],me:null,ball:null,cam:{p:new THREE.Vector3(),t:new THREE.Vector3(),init:false},
  fg:null,g:null,r:null,onPad:false,lastZone:null,shown:false,flags:[]};
if(!SAVE.football)SAVE.football={};
const ftBest=(k,v)=>{const S=SAVE.football;if(S[k]==null||v>S[k]){S[k]=v;persist();return true;}return false;};
const FT_G=9.8;
const ftRand=(a,b)=>a+Math.random()*(b-a);
const ftGauss=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;
const ftClamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- buttons, the scores bar, the kick meters and the menu ---------- */
{const st=document.createElement('style');st.textContent=`
#ftHud{left:50%;top:calc(env(safe-area-inset-top) + 108px);transform:translateX(-50%);display:none;align-items:center;gap:8px;z-index:9}
body.ft-on #ftHud{display:flex}
#ftTop{display:flex;gap:10px;align-items:center;background:rgba(29,26,47,.82);color:#fff;border-radius:999px;padding:7px 14px;font-weight:600;font-size:15px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.25)}
#ftTop b{color:#ffd23f}#ftScore{font-size:18px;font-weight:700}
#ftLeave{background:rgba(255,255,255,.9);border-radius:999px;padding:8px 12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.ftBtn{position:fixed;z-index:6;display:none;border-radius:50%;width:106px;height:106px;font-size:17px;font-weight:700;color:#fff;line-height:1.1;
  background:radial-gradient(circle at 35% 30%,#ffb067,#ff6a1f);border:4px solid rgba(255,255,255,.85);box-shadow:0 6px 20px rgba(0,0,0,.3);touch-action:none}
.ftBtn.show{display:block}.ftBtn:active{transform:scale(.93)}.ftBtn.dim{opacity:.45}
.ftBtn.green{background:radial-gradient(circle at 35% 30%,#8ff59a,#2fb84a)}.ftBtn.red{background:radial-gradient(circle at 35% 30%,#ff9aa8,#e0263b)}
#ftMain{right:calc(env(safe-area-inset-right) + 20px);bottom:calc(env(safe-area-inset-bottom) + 24px)}
#ftAlt{right:calc(env(safe-area-inset-right) + 136px);bottom:calc(env(safe-area-inset-bottom) + 30px);width:80px;height:80px;font-size:14px;background:radial-gradient(circle at 35% 30%,#c6b4ff,#7a4dff)}
#ftRow{position:fixed;z-index:6;right:calc(env(safe-area-inset-right) + 14px);bottom:calc(env(safe-area-inset-bottom) + 24px);display:none;gap:10px;flex-direction:column;align-items:stretch;width:150px}
#ftRow.show{display:flex}
#ftRow button{border-radius:18px;padding:10px 12px;font-weight:700;font-size:16px;color:#fff;background:rgba(29,26,47,.86);border:3px solid #fff;min-width:108px;box-shadow:0 4px 14px rgba(0,0,0,.25);touch-action:none}
#ftRow button small{display:block;font-size:12px;font-weight:600;opacity:.9}
#ftRow button.open{background:#2fb84a}#ftRow button.close{background:#e09a18}#ftRow button.cov{background:#d8394a}
#ftCount{position:fixed;left:50%;top:34%;transform:translate(-50%,-50%);font-size:30px;font-weight:800;color:#fff;text-shadow:0 3px 10px rgba(0,0,0,.55);display:none;z-index:7;pointer-events:none;text-align:center;white-space:nowrap}
#ftCount.show{display:block}
#ftAim{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 160px);width:min(80vw,340px);height:30px;border-radius:15px;background:rgba(255,255,255,.88);display:none;z-index:6;overflow:hidden;box-shadow:0 4px 14px rgba(59,35,87,.3)}
#ftAim i{position:absolute;top:0;bottom:0;background:rgba(47,184,74,.6)}
#ftAim b{position:absolute;top:2px;bottom:2px;width:8px;margin-left:-4px;border-radius:4px;background:#ff3b6b;box-shadow:0 0 0 2px #fff}
#ftAim.show,#ftPow.show{display:block}
#ftPow{position:fixed;z-index:6;display:none;width:28px;height:170px;border-radius:14px;background:rgba(255,255,255,.88);right:calc(env(safe-area-inset-right) + 140px);bottom:calc(env(safe-area-inset-bottom) + 24px);overflow:hidden;box-shadow:0 4px 14px rgba(59,35,87,.3)}
#ftPow i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#2fb84a,#ffd23f 70%,#ff6a1f)}
#ftPow u{position:absolute;left:-2px;right:-2px;height:4px;margin-bottom:-2px;background:#1d1a2f}
#ftWind{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 196px);display:none;z-index:6;background:rgba(29,26,47,.78);color:#fff;border-radius:999px;padding:4px 12px;font-weight:700;font-size:14px}
#ftWind.show{display:block}
body.ft-on #actions,body.ft-on #petBtn,body.ft-on #talkBtn,body.ft-on #poseBtn,body.ft-on #hint,body.ft-on #side,body.ft-on #zoomCtl,body.ft-on #mini,body.ft-on #jump{display:none!important}
body.ft-fixed #joy{visibility:hidden}
@media (max-height:520px){#ftHud{top:calc(env(safe-area-inset-top) + 8px)}#ftAim{top:calc(env(safe-area-inset-top) + 56px)}#ftWind{top:calc(env(safe-area-inset-top) + 92px)}#ftRow{flex-direction:row;flex-wrap:wrap;width:min(60vw,330px);justify-content:flex-end}#ftPow{height:130px}}`;
 document.head.appendChild(st);
 const d=document.createElement('div');d.innerHTML=`<div class="hud" id="ftHud"><div id="ftTop"><b id="ftTitle"></b><span id="ftScore"></span><span id="ftInfo"></span></div><button id="ftLeave">✕ Leave</button></div>
<button class="ftBtn" id="ftMain"></button><button class="ftBtn" id="ftAlt"></button><div id="ftRow"></div><div id="ftCount"></div>
<div id="ftAim"><i></i><b></b></div><div id="ftPow"><i></i><u></u></div><div id="ftWind"></div>
<div class="modal" id="ftMenu"><div class="card" id="ftCard"></div></div>`;
 document.body.append(...d.children);}
const ftHud=(a,b,c)=>{$('#ftTitle').textContent=a;$('#ftScore').textContent=b;$('#ftInfo').textContent=c||'';};
function ftBtn(id,text,cls){const b=$(id);if(!text){b.classList.remove('show');return;}if(b.dataset.t!==text){b.dataset.t=text;b.innerHTML=text;}b.className='ftBtn show '+(cls||'');}
let ftCountT=0;function ftCount(t,sec=0){const c=$('#ftCount');if(!t){c.classList.remove('show');return;}c.textContent=t;c.classList.add('show');ftCountT=sec;}
function ftRow(list){const r=$('#ftRow');if(!list){r.classList.remove('show');r.innerHTML='';r.dataset.k='';return;}
  const k=list.map(b=>b.k+b.t+(b.c||'')).join('|');if(r.dataset.k===k)return;r.dataset.k=k;
  r.innerHTML=list.map((b,i)=>`<button data-i="${i}" class="${b.c||''}">${b.t}</button>`).join('');r.classList.add('show');
  r.querySelectorAll('button').forEach(el=>el.addEventListener('pointerdown',e=>{e.preventDefault();const b=list[+el.dataset.i];if(b&&b.go)b.go();}));}
const ftWhistle=()=>{tone(2900,.22,'sine',.06);tone(3100,.22,'sine',.04,.02);};
const ftThud=()=>{tone(110,.09,'square',.09);tone(70,.12,'sine',.14);};
function ftCheer(){try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}}

/* ---------- the football ---------- */
const FTG={};
function ftBallGeo(){if(FTG.ball)return FTG.ball;const pts=[],L=.15,Rr=.088;
  for(let i=0;i<=18;i++){const y=-L+2*L*i/18,r=Rr*Math.pow(Math.max(0,1-(y/L)**2),.72);pts.push(new THREE.Vector2(Math.max(r,.006),y));}
  const g=new THREE.LatheGeometry(pts,22);g.rotateX(Math.PI/2);return FTG.ball=g;}// the long way is along z, so lookAt points the nose
function ftBallMat(){if(FTG.bmat)return FTG.bmat;
  // brown pebbled leather, white stripes near both ends and the white laces on top
  const map=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#7a3a1a';x.fillRect(0,0,w,h);
    for(let i=0;i<2200;i++){x.fillStyle=Math.random()<.5?'rgba(40,14,4,.35)':'rgba(170,95,55,.25)';x.fillRect(Math.random()*w,Math.random()*h,2,2);}
    x.fillStyle='rgba(30,10,2,.55)';for(const u of [0,.25,.5,.75])x.fillRect(u*w-1,0,2,h);// the four seams
    x.fillStyle='#f4f1ea';x.fillRect(0,h*.18,w,h*.04);x.fillRect(0,h*.78,w,h*.04);
    x.fillRect(w*.115,h*.36,w*.02,h*.28);for(let i=0;i<8;i++)x.fillRect(w*.085,h*(.38+i*.033),w*.08,h*.012);});
  return FTG.bmat=phys('#ffffff',{map,roughness:.55,clearcoat:.25,clearcoatRoughness:.6});}
function ftNewBall(){if(FTB.ball)return FTB.ball;const m=M(ftBallGeo(),ftBallMat(),0,-5,0,FTZ.g,true,false);m.visible=false;
  // the glowing ring where a punt or a pass will come down
  const ring=M(new THREE.RingGeometry(.55,.75,32),glow('#ffd23f',1.4),0,.05,0,FTZ.g,false,false);ring.rotation.x=-Math.PI/2;ring.visible=false;ring.material.transparent=true;
  return FTB.ball={m,ring,p:new THREE.Vector3(),v:new THREE.Vector3(),st:'none',by:null,kind:'',t:0,T:0,tgt:null,to:null,spin:0,tumble:0,res:null};}
const _ftV=new THREE.Vector3(),_ftW=new THREE.Vector3();
// put the ball where a player is holding it: tucked under the right arm when running, at the chest when set to throw
function ftBallInHand(e){const B=FTB.ball,a=e.a;if(!a||!a.arms)return;a.g.updateMatrixWorld(true);
  const two=e.hold==='two';a.arms[0].hand.localToWorld(_ftV.set(0,-.06,two?.04:.02));
  if(two){a.arms[1].hand.localToWorld(_ftW.set(0,-.06,.04));_ftV.add(_ftW).multiplyScalar(.5);}
  FTZ.g.worldToLocal(B.p.copy(_ftV));B.m.position.copy(B.p);
  const f=e.face;B.m.rotation.set(0,f,0);if(e.hold==='throw'){B.m.rotation.x=-.5;}else if(!two)B.m.rotation.x=.35;}
function ftBallFly(dt){const B=FTB.ball;B.v.y-=FT_G*dt;B.p.addScaledVector(B.v,dt);B.m.position.copy(B.p);
  _ftV.copy(B.p).add(B.v);FTZ.g.localToWorld(_ftV);B.m.lookAt(_ftV);
  if(B.kind==='pass'){B.spin+=dt*22;B.m.rotateZ(B.spin);}else{B.tumble+=dt*(B.kind==='punt'?9:13);B.m.rotateX(B.tumble);}}
// bouncing along the ground like a real football (it hops off its point)
function ftBallBounce(dt){const B=FTB.ball;if(B.p.y>.16||B.v.y>0){ftBallFly(dt);if(B.p.y<.12&&B.v.y<0){B.p.y=.12;B.v.y=Math.abs(B.v.y)*ftRand(.25,.5);B.v.x*=.6;B.v.z*=.6;B.v.x+=ftRand(-1,1)*Math.hypot(B.v.x,B.v.z)*.4;if(Math.abs(B.v.y)>.6)ftThud();}return;}
  B.v.x*=Math.pow(.15,dt);B.v.z*=Math.pow(.15,dt);B.p.x+=B.v.x*dt;B.p.z+=B.v.z*dt;B.p.y=.1;B.m.position.copy(B.p);B.m.rotation.set(Math.PI/2*.15,B.m.rotation.y+dt*Math.hypot(B.v.x,B.v.z)*3,0);}

/* ---------- the players ---------- */
const FT_COL={us:'#2a5fc4',them:'#b8262f'};
const FT_DEF={us:['Sam','Lily'],them:['Marcus','Nora','Jake']};// the teams if you haven't picked one yet
function ftEnt(a,name,team,r){return {a,r,name,team,p:new THREE.Vector3(),face:0,sp:0,vx:0,vz:0,pose:null,pk:0,hold:null,route:null,ri:0,x0:0,track:null,hist:[],belt:null,grabCD:0,jukeT:0,blockT:0,skill:1,flagT:0,stop:false};}
// the flag belt: a black belt round the hips with a flag hanging on each side
function ftBelt(a,team){if(!FTG.ring){FTG.ring=new THREE.TorusGeometry(.142,.012,6,28);FTG.flag=new THREE.PlaneGeometry(.06,.34).translate(0,-.17,0);
    FTM.belt=std('#1d1d22',{roughness:.6});FTM.flagUs=std('#ffd23f',{roughness:.8,side:THREE.DoubleSide});FTM.flagThem=std('#ff3b5b',{roughness:.8,side:THREE.DoubleSide});}
  const g=new THREE.Group();g.position.y=-.02;const ring=new THREE.Mesh(FTG.ring,FTM.belt);ring.rotation.x=Math.PI/2;ring.scale.set(1.06,.82,1);g.add(ring);
  const fl=[];for(const s of [-1,1]){const f=new THREE.Mesh(FTG.flag,team==='us'?FTM.flagUs:FTM.flagThem);f.position.set(s*.152,0,0);f.rotation.y=Math.PI/2;g.add(f);fl.push(f);}
  a.hips.add(g);return {g,fl,a};}
// the players for this game: the ones you picked (🧢 24e3-team-picker.js) in Eagles blue, the other team in Bears red
function ftSetTeams(us,them){for(const e of FTB.pl){e.a.g.visible=false;FTZ.g.remove(e.a.g);}FTB.pl=[];FTB.us=[];FTB.them=[];
  for(const [team,list] of [['us',us],['them',them]])for(const r of list){const a=rosterAvatar(r,FT_COL[team]);FTZ.g.add(a.g);a.g.visible=false;
    const e=ftEnt(a,r.n,team,r);e.belt=a.ftBelt||(a.ftBelt=ftBelt(a,team));FTB.pl.push(e);FTB[team].push(e);}
  // the Bears' best thrower plays quarterback
  FTB.them.sort((a,b)=>b.r.thr-a.r.thr);
  if(!FTB.me)FTB.me=ftEnt(av,SAVE.name||'You','us',null);}
function ftLastTeams(){const n=(SAVE.teams&&SAVE.teams.football)||FT_DEF.us,us=n.map(x=>ROSTER.find(r=>r.n===x)).filter(Boolean).slice(0,2);
  while(us.length<2)us.push(ROSTER.find(r=>!us.includes(r)));const them=FT_DEF.them.map(x=>ROSTER.find(r=>r.n===x)).filter(r=>!us.includes(r));
  for(const r of ROSTER){if(them.length>=3)break;if(!us.includes(r)&&!them.includes(r))them.push(r);}return [us,them];}
// you get a flag belt too while you play (a new outfit builds a new avatar, so it's put back on when that happens)
function ftMyBelt(on){const me=FTB.me;if(!me)return;if(me.belt&&(!on||me.belt.a!==av)){me.belt.a.hips.remove(me.belt.g);me.belt=null;}if(on&&!me.belt)me.belt=ftBelt(av,'us');me.a=av;}
function ftFlags(){for(const e of [...FTB.pl,FTB.me])if(e&&e.belt)e.belt.fl.forEach(f=>f.visible=true);for(const f of FTB.flags.splice(0))f.parent&&f.parent.remove(f);}
// a flag gets pulled: it comes off the belt and the one who pulled it holds it up
function ftPull(by,who){if(who.belt){const f=who.belt.fl.find(f=>f.visible);if(f)f.visible=false;}
  if(by&&by.a&&by.a.arms){const f=new THREE.Mesh(FTG.flag,who.team==='us'?FTM.flagUs:FTM.flagThem);f.position.set(0,-.05,.02);f.rotation.x=Math.PI;by.a.arms[0].hand.add(f);FTB.flags.push(f);by.flagT=1.6;}
  tone(520,.08,'triangle',.08);tone(300,.12,'sine',.08,.05);}
const ftAll=()=>[FTB.me,...FTB.pl];
const ftTeamOf=t=>t==='us'?[FTB.me,...FTB.us]:FTB.them;
const ftFoes=e=>e.team==='us'?FTB.them:[FTB.me,...FTB.us];
// poses laid over the normal walking animation (after Avatar.update)
function ftPose(a,pose,k,dt){if(!pose||!a||!a.arms)return;const A=a.arms,L=a.legs,f=Math.min(1,dt*16),S=(o,key,v)=>{o[key]+=(v-o[key])*f;};
  const arm=(i,x,z,e)=>{S(A[i].sh.rotation,'x',x);S(A[i].sh.rotation,'z',z);S(A[i].el.rotation,'x',e);};
  const leg=(i,h,kn,an=0)=>{S(L[i].hp.rotation,'x',h);S(L[i].kn.rotation,'x',kn);S(L[i].an.rotation,'x',an);};
  const lean=v=>S(a.spine.rotation,'x',v),drop=v=>S(a.hips.position,'y',a.hip+(a.lift||0)-v);
  if(pose==='ready'){leg(0,-.62,1.0,-.42);leg(1,-.48,.88,-.42);lean(.4);drop(.1);arm(0,-.4,.12,-.6);arm(1,-.4,-.12,-.6);}
  else if(pose==='set'){leg(0,-.32,.55,-.22);leg(1,-.32,.55,-.22);lean(.18);drop(.05);arm(0,-.85,.38,-1.45);arm(1,-.85,-.38,-1.45);}
  else if(pose==='hold'){arm(0,-.85,.38,-1.45);arm(1,-.85,-.38,-1.45);}
  else if(pose==='carry'){arm(0,-.42,.28,-1.75);}
  else if(pose==='throw'){if(k<.16){arm(0,-2.35,-.5,-1.75);arm(1,-1.25,-.25,-.35);lean(-.06);}else if(k<.34){arm(0,-1.9,-.2,-.12);arm(1,-.45,-.1,-.3);lean(.2);}else{arm(0,-1.0,.25,-.25);arm(1,-.3,-.1,-.2);lean(.12);}}
  else if(pose==='catch'){arm(0,-2.35,.18,-.35);arm(1,-2.35,-.18,-.35);}
  else if(pose==='reach'){arm(0,-1.5,.15,-.12);arm(1,-1.15,-.1,-.2);lean(.32);}
  else if(pose==='block'){arm(0,-1.45,.25,-.95);arm(1,-1.45,-.25,-.95);lean(.36);leg(0,-.55,.8,-.2);leg(1,-.15,.55,-.2);drop(.06);}
  else if(pose==='kneel'){leg(0,-1.45,1.5,.25);leg(1,.18,1.95,.7);drop(.36);lean(.3);arm(0,-1.05,.3,-.45);arm(1,-.35,-.1,-.3);}
  else if(pose==='kick'||pose==='punt'){if(k<.14){leg(0,.75,1.35,.35);leg(1,-.12,.3);arm(0,-.25,-1.0,-.3);arm(1,-.7,1.0,-.3);lean(-.08);}
    else if(k<.5){leg(0,pose==='punt'?-1.9:-1.55,.04,.55);leg(1,.08,.22);arm(0,.3,-1.25,-.2);arm(1,-1.3,1.25,-.2);lean(-.24);}}
  else if(pose==='cheer'){arm(0,-2.95,-.25,-.05);arm(1,-2.95,.25,-.05);}
  else if(pose==='sad'){lean(.35);arm(0,-.05,.12,-.1);arm(1,-.05,-.12,-.1);}}
const ftHist=(e,ago)=>{const h=e.hist;if(!h.length)return e.p;const t=FTB.clock-ago;for(let i=h.length-1;i>=0;i--)if(h[i][0]<=t)return _ftW.set(h[i][1],0,h[i][2]);return _ftW.set(h[0][1],0,h[0][2]);};
// walk or run an NPC toward a spot (speeds up and slows down, turns smoothly)
function ftGo(e,tx,tz,spd,dt){if(e.r)spd*=rosterSpeed(e.r);const dx=tx-e.p.x,dz=tz-e.p.z,d=Math.hypot(dx,dz);let wx=0,wz=0;
  if(d>.06){const s=Math.min(spd,d*3.2);wx=dx/d*s;wz=dz/d*s;}
  const k=Math.min(1,dt*7);e.vx+=(wx-e.vx)*k;e.vz+=(wz-e.vz)*k;e.p.x+=e.vx*dt;e.p.z+=e.vz*dt;e.sp=Math.hypot(e.vx,e.vz);
  if(e.sp>.4)e.face=angDamp(e.face,Math.atan2(e.vx,e.vz),Math.min(1,dt*10));return d;}
const ftFace=(e,tx,tz,dt)=>{e.face=angDamp(e.face,Math.atan2(tx-e.p.x,tz-e.p.z),Math.min(1,dt*8));};
const ftD=(a,b)=>Math.hypot(a.p.x-b.p.x,a.p.z-b.p.z);
function ftPlace(e,x,z,face){e.p.set(x,0,z);e.vx=e.vz=0;e.sp=0;e.face=face;e.hist.length=0;e.pose=null;e.hold=null;e.track=null;e.route=null;e.stop=false;e.blockT=0;e.jukeT=0;e.grabCD=0;
  if(e===FTB.me){const [wx,wz]=FTZ.toWorld(x,z);player.pos.set(wx,groundAt(wx,wz),wz);player.vy=0;player.onGround=true;player.speed=0;player.face=face+FTZ.rot;}
  else{e.a.g.visible=true;e.a.g.position.copy(e.p);e.a.g.rotation.y=face;}}

/* ---------- moving you (the game loop asks ftStep first while a football game is on) ---------- */
function ftMeSync(){const me=FTB.me,[x,z]=FTZ.toLocal(player.pos.x,player.pos.z);me.vx=(x-me.p.x)/Math.max(.001,FTB.dt||.016);me.vz=(z-me.p.z)/Math.max(.001,FTB.dt||.016);me.p.set(x,0,z);me.face=player.face-FTZ.rot;me.a=av;}
function ftStep(dt,ix,iy,mag){if(!FTB.mode)return false;const me=FTB.me,p=player.pos;
  const can=FTB.canMove?FTB.canMove():0;
  if(can>0&&mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;const mx=(fx*-iy+rx*ix)/n,mz=(fz*-iy+rz*ix)/n;
    const spd=can*mag*(me.jukeT>0?1.35:1);p.x+=mx*spd*dt;p.z+=mz*spd*dt;
    // stay on the field (a step past the sidelines and end lines)
    let [lx,lz]=FTZ.toLocal(p.x,p.z);lx=ftClamp(lx,-FTF.HW-1.2,FTF.HW+1.2);lz=ftClamp(lz,-FTF.HL-.8,FTF.HL+.8);if(FTB.fence)[lx,lz]=FTB.fence(lx,lz);
    const [wx,wz]=FTZ.toWorld(lx,lz);p.x=wx;p.z=wz;
    player.face=angDamp(player.face,Math.atan2(mx,mz),Math.min(1,dt*12));player.speed=spd;}
  else player.speed*=.8;
  p.y=groundAt(p.x,p.z);player.vy=0;player.onGround=true;return true;}

/* ---------- starting and ending ---------- */
function ftOpenMenu(){if(FTB.mode||FTB.menu||SP.mode)return;FTB.menu=true;const S=SAVE.football,c=$('#ftCard');
  c.innerHTML=`<h2>🏈 Football Field</h2><p>Flag football: no tackling, you pull the flag off their belt!</p>
   <button class="spPick" data-m="game"><b>🏈</b><span><strong>Pick-up game</strong><small>3-on-3 vs the Bears. Throw to your receivers, sack their QB${S.wins?` · Wins: ${S.wins}`:''}</small></span></button>
   <button class="spPick" data-m="fg"><b>🥅</b><span><strong>Field goals</strong><small>8 kicks, from the 20 out to the 50${S.fg!=null?` · Best: ${S.fg} of 8`:''}</small></span></button>
   <button class="spPick" data-m="sack"><b>💥</b><span><strong>Sack the QB</strong><small>Count to 3 Mississippi, then grab his flag${S.sacks!=null?` · Best: ${S.sacks} sacks`:''}</small></span></button>
   <button class="spPick" data-m="ret"><b>🏃</b><span><strong>Kick returns</strong><small>Catch 5 punts and run them back${S.ret!=null?` · Best: ${S.ret} yards`:''}</small></span></button>
   <button class="btn ghost" id="ftNo">Not now</button>`;
  c.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ftCloseMenu();ftStart(b.dataset.m);});
  ftSuitBtn(c);$('#ftNo').onclick=ftCloseMenu;$('#ftMenu').classList.add('show');sfx('pop');}
// 👕 suit up in a football uniform: the Eagles jersey, white football pants and cleats (your outfit is kept, like the other sports)
const FT_LOOK={top:{id:'jersey',c:'#2a5fc4'},bottom:{id:'baseballpants',c:'#ffffff'},shoes:{id:'ballcleats',c:'#2d2d3a'}};
const ftWearing=()=>{const l=SAVE.look;return !l.dress&&l.top&&l.top.id==='jersey'&&l.bottom&&l.bottom.id==='baseballpants';};
function ftSuitBtn(c){if(ftWearing())return;
  const b=document.createElement('button');b.className='btn';b.id='ftSuit';b.style.cssText='display:block;width:calc(100% - 8px);margin:2px 4px 8px';b.textContent='👕 Suit up in a football uniform';c.querySelector('p').after(b);
  b.onclick=()=>{const l=SAVE.look;if(!spCanUnsuit())SAVE.sports.prev=JSON.parse(JSON.stringify(l));l.dress=null;l.top={...FT_LOOK.top};l.bottom={...FT_LOOK.bottom};l.shoes={...FT_LOOK.shoes};l.hat=null;
    persist();rebuildPlayer();sfx('star');b.textContent='✅ Suited up! Pick a game';b.disabled=true;b.style.opacity=.7;did('dress','football');};}
function ftCloseMenu(){FTB.menu=false;$('#ftMenu').classList.remove('show');}
$('#ftMenu').addEventListener('click',e=>{if(e.target.id==='ftMenu'&&!FTB.mode)ftCloseMenu();});
function ftStart(m){ftCloseMenu();
  if(m==='game'){teamPick({sport:'football',size:3,title:'Pick your team: 3-on-3',done:(us,them)=>{ftSetTeams(us,them);ftBegin(m);},cancel:()=>{}});return;}
  ftSetTeams(...ftLastTeams());ftBegin(m);}
function ftBegin(m){const B=ftNewBall();FTB.mode=m;FTB.cam.init=false;FTB.canMove=null;FTB.fence=null;FTB.clock=0;
  closeMap&&closeMap();joy.id=null;joy.x=joy.y=0;$('#joy').style.display='none';
  if(typeof BIKE!=='undefined'&&BIKE.on&&typeof bikeOff==='function')try{bikeOff();}catch(e){}
  document.body.classList.add('ft-on');document.body.classList.toggle('ft-fixed',m==='fg');
  ftMyBelt(true);ftFlags();for(const e of FTB.pl)e.a.g.visible=false;B.m.visible=false;B.ring.visible=false;B.st='none';
  setTrack('stadium');did('football','play');
  if(m==='fg')ftFgStart();else if(m==='game'||m==='sack')ftGameStart(m);else ftRetStart();}
function ftEnd(show=true,quit=false){const m=FTB.mode;if(!m)return;FTB.mode=null;document.body.classList.remove('ft-on','ft-fixed');
  for(const id of ['#ftMain','#ftAlt'])ftBtn(id,null);ftRow(null);ftCount(null);for(const id of ['#ftAim','#ftPow','#ftWind'])$(id).classList.remove('show');
  ftMyBelt(false);ftFlags();FTZ.marks(false);for(const e of FTB.pl){e.a.g.visible=false;e.a.emote=null;}if(FTB.ball){FTB.ball.m.visible=false;FTB.ball.ring.visible=false;FTB.ball.st='none';}
  FTZ.board.draw(0,0,'','PICK-UP FLAG FOOTBALL');
  // step off on the island-side touchline, between the 🏈 and ⚽ pads
  {const [x,w]=FTZ.toWorld(FTZ.pad.lx,0);player.pos.set(x,0,w);player.face=FTZ.rot+Math.PI/2;}
  if(!show)return;let h='',coins=0,best=false;
  if(quit)h=`<h2>👋 You left the game</h2><p>Finish a whole game to earn coins!</p>`;
  else if(m==='fg'){const S=FTB.fg;coins=S.made*3+(S.made===8?20:0);best=ftBest('fg',S.made);
    h=`<h2>${S.made>=7?'🏆 Golden leg!':S.made>=4?'🥅 Nice kicking!':'🥅 Good try!'}</h2><div class="spBig">${S.made} / 8</div><p>field goals${S.long?` · Longest: ${S.long} yards`:''}${best?' · New best! 🎉':''}</p>`;}
  else if(m==='game'){const G=FTB.g,win=G.us>G.them,tie=G.us===G.them;coins=win?40:tie?20:15;coins+=G.tds*5;
    if(win){SAVE.football.wins=(SAVE.football.wins||0)+1;persist();did('football','win');}
    h=`<h2>${win?'🏆 Eagles win!':tie?'🤝 It\'s a tie!':'😅 The Bears win this time'}</h2><div class="spBig">${G.us} - ${G.them}</div><p>${G.sacks?`💥 ${G.sacks} sack${G.sacks>1?'s':''} · `:''}${G.tds?`🏈 ${G.tds} touchdown${G.tds>1?'s':''}`:'Keep throwing to the open receiver!'}</p>`;}
  else if(m==='sack'){const G=FTB.g;coins=G.sacks*5+G.stops*2;best=ftBest('sacks',G.sacks);
    h=`<h2>${G.sacks>=4?'💥 Sack master!':G.sacks?'💥 Nice rushing!':'🏃 Good try!'}</h2><div class="spBig">${G.sacks} sack${G.sacks===1?'':'s'}</div><p>${G.stops} other stops${best?' · New best! 🎉':''}</p>`;}
  else if(m==='ret'){const S=FTB.r;coins=Math.round(S.yards/4)+S.td*10;best=ftBest('ret',S.yards);
    h=`<h2>${S.td?'🏃 Touchdown return!':S.yards>=80?'🏃 Great returns!':'🏃 Good try!'}</h2><div class="spBig">${S.yards} yards</div><p>${S.td?`${S.td} touchdown${S.td>1?'s':''} · `:''}longest ${S.long} yards${best?' · New best! 🎉':''}</p>`;}
  if(quit)coins=0;if(coins>0){earn(coins,'sports');h+=`<p>🪙 +${coins} coins</p>`;}
  $('#ftCard').innerHTML=h+`<button class="btn" id="ftAgain">🔁 Play again</button> <button class="btn ghost" id="ftDone">Done</button>`+(spCanUnsuit()?`<br><button class="btn ghost" id="ftUnsuit">👗 Back to my outfit</button>`:'');
  if(spCanUnsuit())$('#ftUnsuit').onclick=()=>{spUnsuit();ftCloseMenu();};
  $('#ftAgain').onclick=()=>{ftCloseMenu();ftStart(m);};$('#ftDone').onclick=ftCloseMenu;
  FTB.menu=true;$('#ftMenu').classList.add('show');if(coins>=15||best)sfx('tada');}
$('#ftLeave').onclick=()=>ftEnd(true,true);
{const bind=(id,fn)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}fn();});};
  bind('#ftMain',()=>FTB.mode&&FTB.press&&FTB.press());bind('#ftAlt',()=>FTB.mode&&FTB.alt&&FTB.alt());
  addEventListener('keydown',e=>{if(!FTB.mode||e.repeat)return;if(e.code==='Enter'||e.code==='KeyE'){FTB.press&&FTB.press();}else if(e.code==='KeyQ'){FTB.alt&&FTB.alt();}
    else if(/^Digit[1-4]$/.test(e.code)){const b=$('#ftRow').querySelectorAll('button')[+e.code.slice(5)-1];if(b)b.dispatchEvent(new PointerEvent('pointerdown'));}});}

/* ================= 🥅 FIELD GOALS ================= */
const FG_YDS=[20,25,30,33,36,40,45,50],FG_AIM=deg(11),FG_EL=deg(37);
// how fast a kick goes at this much power
const fgSpeed=pw=>7.6+8.8*pw;
// the least power that gets over the crossbar from D away (no wind)
function fgNeed(D){for(let pw=0;pw<=1;pw+=.01){const v=fgSpeed(pw),vz=v*Math.cos(FG_EL),T=D/vz,y=.16+v*Math.sin(FG_EL)*T-.5*FT_G*T*T;if(y>FTF.BAR+.25)return pw;}return 1;}
function ftFgStart(){FTB.fg={n:0,made:0,long:0};ftFgSetup();FTB.press=ftFgPress;FTB.alt=null;FTB.canMove=()=>0;}
function ftFgSetup(){const S=FTB.fg,F=FTF,yd=FG_YDS[S.n],B=FTB.ball,me=FTB.me;
  Object.assign(S,{yd,ph:'aim',t:0,u:0,pw:0,lockU:0,res:null,doneT:0,crossed:false});
  S.D=yd*F.Y;S.zH=-F.HL+S.D;
  // wind: a push sideways in steps a second per second, stronger on the long kicks. The ribbons on the uprights show it
  S.wind=(Math.random()<.5?-1:1)*ftRand(.15,.45+S.n*.16);if(S.n===0)S.wind*=.3;
  const mph=Math.round(Math.abs(S.wind)*9);$('#ftWind').textContent=mph<2?'🌬️ No wind':`🌬️ Wind ${S.wind>0?'→':'←'} ${mph} mph`;$('#ftWind').classList.add('show');
  for(const rb of FTZ.ribbons){rb.rotation.set(Math.PI/2-.4,0,-Math.sign(S.wind)*Math.min(1.2,Math.abs(S.wind)*1.4));}
  const H=FTB.us[0];ftPlace(H,-.42,S.zH-.04,Math.PI/2);H.pose='kneel';
  for(const e of FTB.pl)if(e!==H)e.a.g.visible=false;
  B.st='tee';B.m.visible=true;B.p.set(0,.17,S.zH);B.m.position.copy(B.p);B.m.rotation.set(-.35,0,0);
  ftPlace(me,-.9,S.zH+1.9,Math.atan2(.9,-1.9));S.need=fgNeed(S.D);
  // the green part of the aim bar: where the kick goes through once the wind has pushed it
  const T=S.D/(fgSpeed(Math.max(S.need,.6))*Math.cos(FG_EL)),drift=.5*S.wind*T*T,half=Math.atan((F.PW/2-.16)/S.D),mid=Math.atan(-drift/S.D);
  S.win=[(mid-half)/FG_AIM,(mid+half)/FG_AIM];const a=$('#ftAim i');a.style.left=`${(ftClamp(S.win[0],-1,1)+1)*50}%`;a.style.width=`${(ftClamp(S.win[1],-1,1)-ftClamp(S.win[0],-1,1))*50}%`;
  $('#ftPow u').style.bottom=`${S.need*100}%`;$('#ftAim').classList.add('show');$('#ftPow').classList.remove('show');
  ftHud('🥅 Field goals',`${S.made} / ${S.n}`,`${yd} yards`);ftBtn('#ftMain','🎯<br>AIM');FTZ.board.draw(S.made,S.n-S.made,`${yd} YD FG`,`KICK ${S.n+1} OF 8`);
  FTB.cam.init=false;}
function ftFgPress(){const S=FTB.fg;if(S.ph==='aim'){S.ph='power';S.lockU=S.u;S.t=0;tone(520,.06,'sine',.08);$('#ftPow').classList.add('show');ftBtn('#ftMain','💪<br>KICK!');}
  else if(S.ph==='power'){S.ph='run';S.t=0;tone(660,.06,'sine',.08);ftBtn('#ftMain',null);}}
function ftFgStep(dt){const S=FTB.fg,F=FTF,B=FTB.ball,me=FTB.me,H=FTB.us[0];S.t+=dt;
  if(S.ph==='aim'){const sp=2.1+S.n*.22;S.u=Math.sin(S.t*sp);$('#ftAim b').style.left=`${(S.u+1)*50}%`;}
  else if(S.ph==='power'){const per=1.25-S.n*.03,k=(S.t/per)%2;S.pw=k<1?k:2-k;$('#ftPow i').style.height=`${S.pw*100}%`;}
  else if(S.ph==='run'){// two steps up to the ball, then the kick
    const k=Math.min(1,S.t/.45);const sx=-.9+(.55)*k,sz=S.zH+1.9-(1.9-.42)*k;const [wx,wz]=FTZ.toWorld(sx,sz);player.pos.x=wx;player.pos.z=wz;player.speed=k<1?4.5:0;
    player.face=FTZ.rot+Math.atan2(.35,-1.48);
    if(k>=1){me.pose='kick';me.pk=S.t-.45;if(me.pk>=.16){S.ph='fly';S.t=0;const v=fgSpeed(S.pw)*ftRand(.985,1.015),yaw=S.lockU*FG_AIM;
      B.st='air';B.kind='kick';B.tumble=0;B.v.set(v*Math.cos(FG_EL)*Math.sin(yaw),v*Math.sin(FG_EL),-v*Math.cos(FG_EL)*Math.cos(yaw));ftThud();tone(180,.05,'square',.06);
      H.pose=null;}}}
  else if(S.ph==='fly'){if(me.pk<.6)me.pk+=dt;else me.pose=null;
    if(B.st==='air'){const pz=B.p.z;B.v.x+=S.wind*dt;ftBallFly(dt);
      // through the posts? check as it crosses the goal line plane
      if(!S.crossed&&pz>-F.HL&&B.p.z<=-F.HL){S.crossed=true;const x=B.p.x,y=B.p.y,hw=F.PW/2;
        if(Math.abs(Math.abs(x)-hw)<.12&&y>F.BAR-.05&&y<F.TOP){S.res='doink';B.v.z*=-.35;B.v.x=-Math.sign(x)*1.2;B.p.z=-F.HL+.05;tone(1400,.12,'triangle',.1);tone(980,.2,'sine',.08,.04);}
        else if(Math.abs(x)<hw&&y>F.BAR+.08)S.res='good';
        else if(Math.abs(x)<hw&&y>F.BAR-.1){S.res=Math.random()<.5?'good':'bar';if(S.res==='bar'){B.v.z*=-.3;B.v.y=Math.abs(B.v.y)*.4;}tone(1200,.1,'triangle',.1);}
        else S.res=y<=F.BAR?'short':x<0?'left':'right';
        ftFgResult();}
      if(B.p.y<.14&&B.v.y<0){if(!S.crossed){S.crossed=true;S.res='short';ftFgResult();}B.st='loose';B.v.y=Math.abs(B.v.y)*.3;ftThud();}}
    else ftBallBounce(dt);
    if(S.doneT>0&&(S.doneT-=dt)<=0){S.n++;if(S.n>=FG_YDS.length){ftEnd(true);return;}ftFgSetup();}}
  if(H.pose==='kneel'&&S.ph!=='fly')H.pose='kneel';}
function ftFgResult(){const S=FTB.fg,H=FTB.us[0];const good=S.res==='good';S.doneT=2.6;$('#ftAim').classList.remove('show');$('#ftPow').classList.remove('show');
  if(good){S.made++;S.long=Math.max(S.long,S.yd);banner(`🥅 IT'S GOOD! ${S.yd} yards`);ftCheer();did('football','fg');if(S.yd>=50)did('football','fg50');H.a.play('cheer');FTB.me.a.play('cheer');
    burst(FTZ.g.localToWorld(new THREE.Vector3(0,F_TOPY(),-FTF.HL)),'#ffd23f',40,3);}
  else{banner({doink:'😬 Doink! Off the upright',bar:'😬 Off the crossbar… no good',short:'⬇️ Short! Kick harder',left:'⬅️ Wide left!',right:'➡️ Wide right!'}[S.res]||'No good');tone(220,.3,'sine',.08);}
  ftHud('🥅 Field goals',`${S.made} / ${S.n+1}`,`${S.yd} yards`);FTZ.board.draw(S.made,S.n+1-S.made,good?'IT\'S GOOD!':'NO GOOD',`KICK ${S.n+1} OF 8`);}
const F_TOPY=()=>FTF.TOP;

/* ================= 🏈 THE PICK-UP GAME (and the 💥 Sack the QB drill) ================= */
// routes: [toward the middle, downfield] from where the receiver lines up; the last point is where they settle
const FT_ROUTES={slant:[[0,1.3],[4.2,4.8],[8,7.5]],go:[[-.5,3],[-.7,15]],curl:[[0,5.4],[.7,4.6]],out:[[0,4.4],[-4.6,4.8]],post:[[0,4],[3.2,9.5],[4.6,15]],flat:[[-.4,.8],[-5,1.8]],dig:[[0,6],[6,6.4]]};
const FT_PLAYS=[{id:'slants',e:'⚡',n:'Slants',r:['slant','slant']},{id:'deep',e:'🚀',n:'Go deep',r:['go','curl']},{id:'outs',e:'↪️',n:'Out & post',r:['out','post']},{id:'cross',e:'❌',n:'Flat & dig',r:['flat','dig']}];
const FT_COUNT=3,FT_MISS=.75;// 3 Mississippi (a quick count, like kids really say it) before the rusher may go
function ftGameStart(m){const sack=m==='sack';
  FTB.g={drill:sack,poss:sack?'them':'us',us:0,them:0,drives:{us:0,them:0},los:0,fd:0,down:1,ph:'pick',t:0,play:null,thrown:false,carrier:null,qb:null,wr:[],cb:[],rush:null,res:null,deadT:0,
    tds:0,sacks:0,stops:0,snaps:0,msg:'',count:0};
  FTB.press=ftGamePress;FTB.alt=ftGameAlt;FTB.canMove=ftGameCanMove;FTB.fence=ftGameFence;ftDrive();}
const ftDir=()=>FTB.g.poss==='us'?-1:1;
function ftDrive(){const G=FTB.g;G.los=0;G.down=1;G.fd=ftDir()*10*FTF.Y;ftSetPlay();}
function ftSetPlay(){const G=FTB.g,dir=ftDir(),los=G.los,us=G.poss==='us';
  Object.assign(G,{ph:'pick',t:0,thrown:false,carrier:null,res:null,deadT:0,play:null,count:0,throwAt:-1,qbRun:false,sackBy:null,scr:null});
  ftFlags();const off=us?[FTB.me,...FTB.us]:FTB.them,def=us?FTB.them:[FTB.us[0],FTB.us[1],FTB.me];
  G.qb=off[0];G.wr=[off[1],off[2]];G.cb=[def[0],def[1]];G.rush=def[2];
  const back=-dir;// toward the offense's own end
  ftPlace(G.qb,0,los+back*2.1,dir<0?Math.PI:0);G.qb.pose='set';G.qb.hold='two';
  G.wr.forEach((w,i)=>{const x0=(i?1:-1)*5.2;w.x0=x0;ftPlace(w,x0,los+back*.35,dir<0?Math.PI:0);w.pose='ready';});
  G.cb.forEach((c,i)=>{ftPlace(c,G.wr[i].x0*.94,los+dir*2.7,dir<0?0:Math.PI);c.pose='ready';c.skill=ftRand(.92,1.02);});
  ftPlace(G.rush,.4,los+dir*1.8,dir<0?0:Math.PI);G.rush.pose='ready';
  const B=FTB.ball;B.st='held';B.by=G.qb;B.m.visible=true;B.ring.visible=false;
  FTZ.marks(true,los,Math.abs(G.fd)>=FTF.GL-.01?null:G.fd);FTZ.setDown(G.down);ftBoard();FTB.cam.init=false;
  if(us){ftRow(FT_PLAYS.map(p=>({k:p.id,t:`${p.e} ${p.n}`,go:()=>ftSnap(p)})));ftBtn('#ftMain',null);ftBtn('#ftAlt',null);ftCount('Pick a play! 📋');}
  else{ftRow(null);ftBtn('#ftMain','🚩<br>GRAB','dim');ftBtn('#ftAlt',null);ftCount(G.drill?`Snap ${G.snaps+1} of 6: get ready to rush!`:'Defense! You rush the quarterback 💥');G.autoSnap=1.6;}
  ftHudGame();}
function ftHudGame(){const G=FTB.g;if(G.drill){ftHud('💥 Sack the QB',`${G.sacks} sacks`,`snap ${Math.min(6,G.snaps+1)} of 6`);return;}
  const toGo=Math.abs(G.fd)>=FTF.GL-.01&&Math.abs(G.fd-G.los)<=10*FTF.Y+.01?'Goal':Math.max(1,Math.round(Math.abs(G.fd-G.los)/FTF.Y));
  ftHud(G.poss==='us'?'🦅 Eagles ball':'🐻 Bears ball',`${G.us} - ${G.them}`,`${['','1st','2nd','3rd','4th'][G.down]||'4th'} & ${toGo}`);}
function ftBoard(){const G=FTB.g;if(!G)return;const yd=G.poss==='us'?ftYd(G.los):100-ftYd(G.los),side=yd===50?'50':yd<50?`OWN ${yd}`:`OPP ${100-yd}`;
  FTZ.board.draw(G.us,G.them,G.drill?`SACKS ${G.sacks}`:`${['','1ST','2ND','3RD','4TH'][G.down]||'4TH'} DOWN`,G.drill?`SNAP ${Math.min(6,G.snaps+1)} OF 6`:`BALL ON ${side}`);}
function ftSnap(p){const G=FTB.g;if(G.ph!=='pick')return;G.play=p||rnd(FT_PLAYS);G.ph='live';G.t=0;G.count=0;ftRow(null);ftCount(null);
  const dir=ftDir(),los=G.los;
  G.wr.forEach((w,i)=>{const r=FT_ROUTES[G.play.r[i]],inS=-Math.sign(w.x0);w.route=r.map(([lat,fw])=>[ftClamp(w.x0+inS*lat,-FTF.HW+.5,FTF.HW-.5),ftClamp(los+dir*fw,-FTF.HL+.6,FTF.HL-.6)]);w.ri=0;w.pose=null;w.speed=ftRand(4.5,4.8);});
  for(const e of [...G.cb,G.rush])e.pose=null;G.qb.pose='hold';
  tone(330,.08,'square',.06);tone(330,.08,'square',.06,.18);banner(G.poss==='us'?'Hut! Hut! 🏈':'Hike! 🏈');G.snaps++;
  if(G.poss==='us')ftThrowButtons();}
// can you move, and how fast? (your speed in steps a second)
function ftGameCanMove(){const G=FTB.g;if(G.ph==='pick')return G.poss==='us'?0:2.2;if(G.ph!=='live')return 1.6;
  if(G.carrier===FTB.me)return 5.0;if(G.qb===FTB.me&&!G.thrown)return 4.4;return 5.1;}
// on defense you may not cross the line until the count is done; the quarterback stays behind the line until he runs
function ftGameFence(lx,lz){const G=FTB.g,dir=ftDir();if(!G)return [lx,lz];
  if(G.rush===FTB.me&&(G.ph==='pick'||G.count<FT_COUNT)){const lim=G.los+dir*1.1;if(dir>0)lz=Math.max(lz,lim);else lz=Math.min(lz,lim);}
  return [lx,lz];}
function ftThrowButtons(){const G=FTB.g;if(G.qb!==FTB.me||G.thrown||G.carrier){ftRow(null);return;}
  ftRow(G.wr.map((w,i)=>{const sep=ftSep(w),c=sep>1.7?'open':sep>1.0?'close':'cov';return {k:w.name,c,t:`🏈 ${w.name}<small>${c==='open'?'open!':c==='close'?'close':'covered'}</small>`,go:()=>ftThrow(G.qb,w)};}));}
// how open a receiver is: steps to the nearest defender
function ftSep(w){let s=9;for(const d of ftFoes(w))s=Math.min(s,ftD(w,d));return s;}
// throw it: where the receiver will be when the ball gets there, plus a little miss (more when hurried or far)
function ftThrow(qb,w,hurry){const G=FTB.g,B=FTB.ball;if(G.thrown||G.carrier||B.by!==qb)return;
  const dir=ftDir(),dpress=ftD(qb,G.rush),pressed=hurry||dpress<1.7&&G.count>=FT_COUNT;
  qb.pose='throw';qb.pk=0;qb.hold='throw';G.thrown=true;G.throwAt=.14;G.passTo=w;G.pressed=pressed;ftRow(null);
  if(qb===FTB.me)did('football','throw');}
function ftRelease(){const G=FTB.g,B=FTB.ball,qb=G.qb,w=G.passTo;
  const from=B.p.clone(),d=Math.hypot(w.p.x-from.x,w.p.z-from.z),T=.34+d*.05;
  const tgt=new THREE.Vector3(w.p.x+w.vx*T*.92,1.2,w.p.z+w.vz*T*.92),err=(.1+d*.016+(G.pressed?.55:0)+(qb===FTB.me?0:.08))*(qb.r?rosterArm(qb.r):1);
  tgt.x=ftClamp(tgt.x+ftGauss()*err,-FTF.HW+.3,FTF.HW-.3);tgt.z=ftClamp(tgt.z+ftGauss()*err,-FTF.HL+.4,FTF.HL-.4);
  B.st='air';B.kind='pass';B.t=0;B.T=T;B.tgt=tgt;B.to=w;B.by=null;B.spin=0;
  B.v.set((tgt.x-from.x)/T,(tgt.y-from.y+.5*FT_G*T*T)/T,(tgt.z-from.z)/T);
  w.track=tgt;w.route=null;// the receiver goes for the ball; so does a defender who can get there
  for(const c of ftFoes(w)){if(c===FTB.me)continue;if(Math.hypot(c.p.x-tgt.x,c.p.z-tgt.z)<4.6*T+1.3)c.track=tgt;}
  tone(600,.05,'sine',.06,0,900);}
function ftCatch(){const G=FTB.g,B=FTB.ball,w=B.to,tgt=B.tgt;
  const dW=Math.hypot(w.p.x-tgt.x,w.p.z-tgt.z);let dD=9,D=null;for(const c of ftFoes(w)){const d=Math.hypot(c.p.x-tgt.x,c.p.z-tgt.z);if(d<dD){dD=d;D=c;}}
  const hands=w.r?Math.min(1,rosterHands(w.r)):1,dHands=D&&D.r?rosterHands(D.r):1;
  let res;if(D&&D!==FTB.me&&dD<.7&&Math.random()<(dW<1?.16:.45)*dHands)res='int';else if(dW<1.05&&!(dD<.85&&Math.random()<.32)&&Math.random()<hands)res='catch';else res='inc';
  for(const e of ftAll())e.track=null;
  if(res==='catch'){G.carrier=w;B.st='held';B.by=w;w.hold='carry';w.pose='carry';banner(`🙌 Caught by ${w===FTB.me?'you':w.name}!`);tone(784,.1,'triangle',.1);
    if(w.team==='us'&&G.qb===FTB.me)did('football','catch');}
  else if(res==='int'){G.carrier=D;B.st='held';B.by=D;D.hold='carry';D.pose='carry';banner(`😮 Intercepted by ${D.name}!`);G.intBy=D;tone(300,.25,'sine',.1);
    if(D.team==='us')did('football','int');}
  else{B.st='loose';B.v.multiplyScalar(.45);banner(dD<.9?`🖐️ Knocked away!`:'Incomplete');G.res='inc';G.ph='dead';G.deadT=1.6;ftWhistle();
    if(G.poss==='them'){G.stops++;}}}
function ftGamePress(){const G=FTB.g;if(G.ph==='pick'&&G.poss==='them')return;
  // GRAB: pull the flag of whoever has the ball (the quarterback, or the runner)
  if(G.ph!=='live'||G.poss==='us'&&G.carrier&&G.carrier.team==='us')return;const me=FTB.me;if(me.grabCD>0)return;
  const t=G.carrier||(!G.thrown?G.qb:null);if(!t||t.team==='us')return;
  if(G.rush===me&&!G.carrier&&G.count<FT_COUNT){toast('Wait for 3 Mississippi! 🗣️');return;}
  me.grabCD=.45;me.pose='reach';me.pk=0;const d=ftD(me,t);
  if(d<1.5&&(d<1.0||Math.random()<.75)&&!(t.jukeT>0&&Math.random()<.6)){ftTag(me,t);}else{tone(200,.1,'sine',.06);if(d<2.2)banner('Missed! Grab again! 🚩');}}
function ftGameAlt(){const me=FTB.me,G=FTB.g;if(G.carrier!==me||me.jukeT>0||me.jukeCD>0)return;me.jukeT=.45;me.jukeCD=1.5;av.play('twirl');tone(500,.12,'sine',.08,0,900);}
// a flag is pulled: the play is over right there
function ftTag(by,who){const G=FTB.g;ftPull(by,who);if(G.ph!=='live')return;
  const sack=!G.thrown&&!G.qbRun&&who===G.qb;G.res=sack?'sack':'tag';G.spot=who.p.z;G.ph='dead';G.deadT=1.9;ftWhistle();
  if(sack){banner(by===FTB.me?'💥 SACK! You got him!':`💥 Sacked by ${by.name}!`);if(by===FTB.me){G.sacks++;did('football','sack');ftCheer();}}
  else banner(`🚩 Flag pulled by ${by===FTB.me?'you':by.name}!`);
  if(G.poss==='them'&&by.team==='us'&&!sack)G.stops++;}
// the play is over: work out the next down, a touchdown, or the other team's ball
function ftAfterPlay(){const G=FTB.g,dir=ftDir();let next=null;
  if(G.drill){G.los=0;if(G.snaps>=6){ftEnd(true);return;}ftSetPlay();return;}
  if(G.res==='td'){const t=G.carrier.team;G[t]+=7;if(t==='us')G.tds++;next='drive';}
  else if(G.intBy){next='drive';}
  else{if(G.res==='sack'||G.res==='tag'||G.res==='oob')G.los=ftClamp(G.spot,-FTF.GL+.3,FTF.GL-.3);
    if(dir*(G.los-G.fd)>=-.001){G.down=1;G.fd=G.los+dir*10*FTF.Y;if(Math.abs(G.fd)>FTF.GL)G.fd=dir*FTF.GL;if(G.res!=='inc')banner('⛓️ First down!');}
    else if(++G.down>4){banner(G.poss==='us'?'😬 Turnover on downs':'🛑 Stopped them on downs!');next='drive';}}
  if(next==='drive'){G.drives[G.poss]++;
    if((G.drives.us>=3&&G.drives.them>=3)||G.us>=21||G.them>=21){ftEnd(true);return;}
    G.poss=G.poss==='us'?'them':'us';G.intBy=null;ftDrive();return;}
  ftSetPlay();}
function ftGameStep(dt){const G=FTB.g,dir=ftDir(),B=FTB.ball,me=FTB.me;G.t+=dt;
  for(const e of ftAll()){e.hist.push([FTB.clock,e.p.x,e.p.z]);while(e.hist.length>40)e.hist.shift();}
  if(G.ph==='pick'){if(G.poss==='them'&&(G.autoSnap-=dt)<=0)ftSnap(rnd(FT_PLAYS));
    for(const e of FTB.pl)if(e.pose==='ready'||e.pose==='set')e.sp=0;ftHoldBall();return;}
  if(G.ph==='dead'){for(const e of FTB.pl){e.vx*=.9;e.vz*=.9;e.p.x+=e.vx*dt;e.p.z+=e.vz*dt;e.sp=Math.hypot(e.vx,e.vz);}
    if(B.st==='loose')ftBallBounce(dt);else if(B.st==='held')ftHoldBall();
    if((G.deadT-=dt)<=0)ftAfterPlay();return;}
  // live: the count, then the rusher goes
  if(G.count<FT_COUNT){const c=Math.floor(G.t/FT_MISS);if(c>G.count){G.count=c;if(c<FT_COUNT){ftCount(`${c} Mississippi…`);tone(440,.05,'sine',.05);}else{ftCount(G.rush===me?'GO! 🏃 Get the QB!':'3 Mississippi! 🏃',.9);tone(660,.08,'sine',.07);}}
    if(G.t<FT_MISS&&G.count===0&&!$('#ftCount').classList.contains('show'))ftCount('1 Mississippi…');}
  else if(ftCountT>0&&(ftCountT-=dt)<=0)ftCount(null);
  if(G.throwAt>0&&(G.throwAt-=dt)<=0){G.throwAt=-1;ftRelease();}
  // receivers run their routes (or go get the ball once it's thrown)
  for(const w of G.wr){if(w===G.carrier||w===me)continue;
    if(w.track){ftGo(w,w.track.x,w.track.z,4.9,dt);if(B.st==='air'&&B.T-B.t<.25)w.pose='catch';continue;}
    if(G.carrier){ftBlock(w,dt);continue;}
    if(w.route&&w.ri<w.route.length){const [tx,tz]=w.route[w.ri];if(ftGo(w,tx,tz,w.speed,dt)<.35)w.ri++;}
    else{w.vx*=.85;w.vz*=.85;w.sp*=.85;ftFace(w,G.qb.p.x,G.qb.p.z,dt);w.pose=G.thrown?null:'hold';}}
  // defenders cover their receiver, a step behind and a little deeper; then everybody chases the ball carrier
  G.cb.forEach((c,i)=>{if(c===me||c===G.carrier)return;const w=G.wr[i];
    if(c.track){ftGo(c,c.track.x,c.track.z,4.6*c.skill,dt);return;}
    if(G.carrier&&G.carrier.team!==c.team){ftChase(c,G.carrier,5.0*c.skill,dt);return;}
    if(G.carrier){ftBlock(c,dt);return;}
    const h=ftHist(w,.2),cush=Math.max(.45,1.1-G.t*.12);ftGo(c,h.x+(-Math.sign(w.x0))*.35,h.z+dir*cush,4.7*c.skill,dt);});
  // the rusher
  {const r=G.rush;if(r!==me&&r!==G.carrier){if(G.count<FT_COUNT){r.sp=0;r.pose='ready';ftFace(r,G.qb.p.x,G.qb.p.z,dt);}
    else if(G.carrier&&G.carrier.team!==r.team)ftChase(r,G.carrier,5.0,dt);
    else if(!G.thrown){r.pose=null;ftChase(r,G.qb,4.55,dt);}
    else{const t=B.tgt||G.qb.p;ftGo(r,t.x,t.z,3.4,dt);}}}
  // the quarterback
  if(G.qb!==me&&!G.carrier)ftCpuQB(dt);
  if(G.qb===me&&!G.thrown&&!G.carrier){me.hold='hold';me.pose='hold';ftThrowButtons();
    // run it yourself once you cross the line
    if(dir*(me.p.z-G.los)>.25){G.carrier=me;G.qbRun=true;me.hold='carry';me.pose='carry';ftRow(null);banner('🏃 QB keeper! Run!');}}
  // whoever has the ball
  const c=G.carrier;if(c){if(c!==me)ftRun(c,dt);
    const cd=c.team==='us'?-1:1;
    if(cd*c.p.z>FTF.GL){G.res='td';G.ph='dead';G.deadT=2.6;ftTouchdown(c);}
    else if(Math.abs(c.p.x)>FTF.HW){G.res='oob';G.spot=c.p.z;G.ph='dead';G.deadT=1.6;ftWhistle();banner('Out of bounds');}
    else for(const f of ftFoes(c)){if(f===me)continue;f.grabCD-=dt;if(f.blockT>0)continue;if(ftD(f,c)<.62&&f.grabCD<=0){f.grabCD=.45;f.pose='reach';f.pk=0;
      if(c.jukeT>0?Math.random()<.15:Math.random()<.78){ftTag(f,c);break;}else if(c===me)banner('💨 Missed you!');}}}
  else if(!G.thrown){// the rusher pulls the quarterback's flag: a sack
    const r=G.rush;if(r!==me&&G.count>=FT_COUNT&&ftD(r,G.qb)<.62){r.grabCD-=dt;if(r.grabCD<=0){r.grabCD=.45;r.pose='reach';if(G.qb.jukeT>0?Math.random()<.2:Math.random()<.8)ftTag(r,G.qb);}}}
  // the ball
  if(B.st==='air'){B.t+=dt;ftBallFly(dt);if(B.t>=B.T)ftCatch();}
  else if(B.st==='held')ftHoldBall();else if(B.st==='loose')ftBallBounce(dt);
  // your grab button lights up when you're close enough
  if(G.poss==='them'||(G.carrier&&G.carrier.team==='them')){const t=G.carrier||(!G.thrown?G.qb:null);
    const ok=t&&t.team==='them'&&(G.rush!==me||G.carrier||G.count>=FT_COUNT);ftBtn('#ftMain','🚩<br>GRAB',ok&&ftD(me,t)<1.5?'green':'dim');}
  else ftBtn('#ftMain',null);
  ftBtn('#ftAlt',G.carrier===me?'💨<br>SPIN':null,me.jukeCD>0?'dim':'');
  me.jukeT-=dt;me.jukeCD=(me.jukeCD||0)-dt;me.grabCD-=dt;
  for(const e of FTB.pl){e.jukeT-=dt;e.blockT-=dt;}
  // a play that goes on too long: the quarterback has to throw it away
  if(G.t>9&&!G.thrown&&!G.carrier){G.res='inc';G.ph='dead';G.deadT=1.4;banner('Thrown away');ftWhistle();if(G.poss==='them')G.stops++;}}
function ftHoldBall(){const B=FTB.ball;if(B.by)ftBallInHand(B.by);}
// the computer quarterback drops back, reads his receivers and throws to the open one; he scrambles away from you
function ftCpuQB(dt){const G=FTB.g,q=G.qb,dir=ftDir(),me=FTB.me,r=G.rush;if(G.thrown){q.vx*=.9;q.vz*=.9;q.sp*=.9;return;}
  const dropZ=G.los-dir*3.1,dR=ftD(q,r),live=G.count>=FT_COUNT;
  let best=null,bs=-9;for(const w of G.wr){const s=ftSep(w)+Math.min(1,dir*(w.p.z-G.los)/6)*.4;if(s>bs){bs=s;best=w;}}
  const th=(G.drill?3.8:3.2)-.4*Math.max(0,G.t-1.6);
  if(G.t>1.2&&best&&bs>th){ftThrow(q,best);return;}
  if(live&&dR<2.3){if(G.t>1.4&&bs>1.6&&Math.random()<dt*.7){ftThrow(q,best,true);return;}
    // scramble: away from the rusher, staying behind the line (or take off running if there's room)
    const ax=q.p.x-r.p.x,az=q.p.z-r.p.z,al=Math.hypot(ax,az)||1;let tx=q.p.x+ax/al*3+(q.p.x>0?-1:1)*.8,tz=q.p.z+az/al*2;
    if(G.scr==null)G.scr=Math.random()<.22;if(G.scr&&G.t>1.8){G.carrier=q;G.qbRun=true;q.hold='carry';q.pose='carry';banner(`🏃 ${q.name} takes off running!`);return;}
    tz=dir>0?Math.min(tz,G.los-.6):Math.max(tz,G.los+.6);tx=ftClamp(tx,-FTF.HW+1,FTF.HW-1);ftGo(q,tx,tz,4.15,dt);q.pose='hold';return;}
  if(G.t>6){ftThrow(q,best,true);return;}
  ftGo(q,q.p.x*.9,dropZ,3.4,dt);if(q.sp<.5)ftFace(q,best.p.x,best.p.z,dt);q.pose='hold';}
// a computer player with the ball runs for the end zone, cutting away from whoever is closest
function ftRun(c,dt){const gd=c.team==='us'?-1:1;let ax=0,az=gd*1.6;
  for(const f of ftFoes(c)){const dx=c.p.x-f.p.x,dz=c.p.z-f.p.z,d=Math.hypot(dx,dz);if(d>4.2||f.blockT>0)continue;const w=(4.2-d)/4.2;ax+=dx/d*w*1.8;az+=dz/d*w*.6;
    if(d<1.1&&c.jukeT<=-1&&Math.random()<dt*2.5){c.jukeT=.4;c.a.play('twirl');}}
  if(Math.abs(c.p.x)>FTF.HW-1.2)ax-=Math.sign(c.p.x)*1.2;const l=Math.hypot(ax,az)||1;
  ftGo(c,c.p.x+ax/l*2,c.p.z+az/l*2,(c.jukeT>0?5.4:4.6),dt);c.pose='carry';c.hold='carry';}
// chase someone, aiming a little ahead of where they're going
function ftChase(e,t,spd,dt){const d=ftD(e,t),lead=Math.min(.55,d/6);ftGo(e,t.p.x+t.vx*lead,t.p.z+t.vz*lead,spd,dt);if(d<1.3)e.pose='reach';else e.pose=null;}
// block for the runner: get between him and the nearest chaser
function ftBlock(e,dt){const G=FTB.g||{},c=(FTB.mode==='ret'?FTB.me:G.carrier);if(!c)return;let tgt=null,td=9;
  for(const f of ftFoes(c)){if(f===FTB.me)continue;const d=ftD(f,c);if(d<td&&f.blockT<=0){td=d;tgt=f;}}
  if(!tgt){ftGo(e,c.p.x+1.5,c.p.z,3,dt);return;}
  const mx=(tgt.p.x*2+c.p.x)/3,mz=(tgt.p.z*2+c.p.z)/3;ftGo(e,mx,mz,4.9,dt);
  if(ftD(e,tgt)<.75&&(e.blockCD||0)<=0){tgt.blockT=1.1;e.blockCD=2.2;e.pose='block';e.pk=0;tgt.vx*=-.3;tgt.vz*=-.3;tone(160,.07,'square',.05);}
  e.blockCD=(e.blockCD||0)-dt;if(e.pose==='block'&&(e.pk+=dt)>.6)e.pose=null;}
function ftTouchdown(c){const us=c.team==='us';ftCheer();sfx('tada');banner(us?(c===FTB.me?'🏈 TOUCHDOWN! You ran it in!':`🏈 TOUCHDOWN ${c.name}!`):`🏈 Touchdown Bears…`);
  for(const e of ftTeamOf(c.team))if(e.a)e.a.play('cheer');if(us){if(FTB.g.qb===FTB.me&&c!==FTB.me)did('football','tdpass');else did('football','td');}
  for(let k=0;k<3;k++)setTimeout(()=>burst(FTZ.g.localToWorld(c.p.clone().add(new THREE.Vector3(0,2,0))),rnd(['#ffd23f','#4fb6ff','#ffffff']),40,4),k*220);}

/* ================= 🏃 KICK RETURNS ================= */
function ftRetStart(){FTB.r={n:0,yards:0,td:0,long:0};FTB.press=null;FTB.alt=ftRetAlt;FTB.canMove=ftRetCanMove;FTB.fence=null;ftRetSetup();}
function ftRetSetup(){const S=FTB.r,B=FTB.ball,me=FTB.me,[P,C1,C2]=FTB.them,[K1,K2]=FTB.us;Object.assign(S,{ph:'set',t:0,catchZ:0,deadT:0,res:null});ftFlags();
  ftPlace(P,0,-7,0);P.pose='set';P.hold='two';ftPlace(C1,-4,-6.2,0);ftPlace(C2,4,-6.2,0);ftPlace(K1,-3,3.5,Math.PI);ftPlace(K2,3,3.5,Math.PI);
  for(const e of [C1,C2,K1,K2])e.pose='ready';ftPlace(me,0,11.5,Math.PI);
  S.land=new THREE.Vector3(ftRand(-4,4),0,ftRand(9.5,13));B.st='held';B.by=P;B.m.visible=true;B.ring.visible=false;
  FTZ.marks(false);ftHud('🏃 Kick returns',`${S.yards} yds`,`punt ${S.n+1} of 5`);FTZ.board.draw(S.yards,'',`PUNT ${S.n+1} OF 5`,'CATCH IT AND RUN!');ftBtn('#ftMain',null);ftBtn('#ftAlt',null);
  ftCount('Get under the ball! 🏈');FTB.cam.init=false;}
function ftRetCanMove(){const S=FTB.r;return S.ph==='set'?1.5:S.ph==='dead'?1.2:5.1;}
function ftRetAlt(){const me=FTB.me,S=FTB.r;if(S.ph!=='run'||me.jukeT>0||me.jukeCD>0)return;me.jukeT=.45;me.jukeCD=1.5;av.play('twirl');tone(500,.12,'sine',.08,0,900);}
function ftRetStep(dt){const S=FTB.r,B=FTB.ball,me=FTB.me,[P,C1,C2]=FTB.them,[K1,K2]=FTB.us;S.t+=dt;
  for(const e of ftAll()){e.hist.push([FTB.clock,e.p.x,e.p.z]);while(e.hist.length>40)e.hist.shift();}
  if(ftCountT>0&&(ftCountT-=dt)<=0)ftCount(null);
  me.jukeT-=dt;me.jukeCD=(me.jukeCD||0)-dt;for(const e of FTB.pl){e.jukeT-=dt;e.blockT-=dt;e.grabCD-=dt;}
  if(S.ph==='set'){ftHoldBall();if(S.t>1.4){P.pose='punt';P.pk=0;S.ph='kick';S.t=0;}return;}
  if(S.ph==='kick'){P.pk+=dt;if(P.pk<.18){ftHoldBall();return;}
    const from=B.p.clone(),T=ftRand(2.3,2.7)*(P.r?rosterLeg(P.r):1);B.st='air';B.kind='punt';B.tumble=0;B.by=null;B.T=T;B.t=0;
    B.v.set((S.land.x-from.x)/T,(1.15-from.y+.5*FT_G*T*T)/T,(S.land.z-from.z)/T);B.ring.position.set(S.land.x,.05,S.land.z);B.ring.visible=true;ftThud();
    S.ph='air';S.t=0;ftCount(null);return;}
  if(S.ph==='air'||S.ph==='loose'){
    if(P.pk<.7)P.pk+=dt;else P.pose=null;
    // the punt team runs down and waits a step away so you can catch it
    for(const c of [P,C1,C2]){const dx=c.p.x-S.land.x,dz=c.p.z-S.land.z,d=Math.hypot(dx,dz)||1;ftGo(c,S.land.x+dx/d*2.2,S.land.z+dz/d*2.2,c===P?3.4:4.6,dt);}
    for(const k of [K1,K2]){k.pose=null;ftGo(k,k.p.x*.9,S.land.z-4,2.5,dt);}
    if(B.st==='air'){B.t+=dt;ftBallFly(dt);B.ring.material.opacity=.5+.5*Math.sin(S.t*8);
      if(B.p.y<1.7&&B.v.y<0&&Math.hypot(B.p.x-me.p.x,B.p.z-me.p.z)<1.0){ftRetGot(false);return;}
      if(B.p.y<1.6&&B.v.y<0&&B.p.y>.6)me.pose=Math.hypot(B.p.x-me.p.x,B.p.z-me.p.z)<2.2?'catch':null;
      if(B.p.y<.14&&B.v.y<0){B.st='loose';S.ph='loose';B.v.y=Math.abs(B.v.y)*.4;ftThud();banner('Bouncing! Pick it up! 🏈');}}
    else{ftBallBounce(dt);if(Math.hypot(B.p.x-me.p.x,B.p.z-me.p.z)<.8){ftRetGot(true);return;}}
    return;}
  if(S.ph==='run'){ftHoldBall();me.pose='carry';
    for(const c of [P,C1,C2]){if(c.blockT>0){c.vx*=.9;c.vz*=.9;c.p.x+=c.vx*dt;c.p.z+=c.vz*dt;c.sp=Math.hypot(c.vx,c.vz);continue;}ftChase(c,me,c===P?4.4:4.85,dt);
      if(ftD(c,me)<.62&&c.grabCD<=0){c.grabCD=.45;if(me.jukeT>0?Math.random()<.12:Math.random()<.8){ftPull(c,me);ftRetDead('tag');return;}else banner('💨 Missed you!');}}
    for(const k of [K1,K2])ftBlock(k,dt);
    ftBtn('#ftAlt','💨<br>SPIN',me.jukeCD>0?'dim':'');
    if(me.p.z<-FTF.GL){ftRetDead('td');return;}if(Math.abs(me.p.x)>FTF.HW){ftRetDead('oob');return;}return;}
  if(S.ph==='dead'){for(const e of FTB.pl){e.vx*=.9;e.vz*=.9;e.p.x+=e.vx*dt;e.p.z+=e.vz*dt;e.sp=Math.hypot(e.vx,e.vz);}ftHoldBall();
    if((S.deadT-=dt)<=0){S.n++;if(S.n>=5){ftEnd(true);return;}ftRetSetup();}}}
function ftRetGot(muff){const S=FTB.r,B=FTB.ball,me=FTB.me;S.ph='run';S.t=0;S.catchZ=me.p.z;B.st='held';B.by=me;me.hold='carry';B.ring.visible=false;
  banner(muff?'Got it! Now run! 🏃':'🙌 Caught it! Run!');tone(784,.1,'triangle',.1);if(!muff)did('football','puntcatch');}
function ftRetDead(res){const S=FTB.r,me=FTB.me;S.ph='dead';S.deadT=2.2;S.res=res;ftBtn('#ftAlt',null);ftWhistle();
  const end=res==='td'?-FTF.GL:me.p.z,yd=Math.max(0,Math.round((S.catchZ-end)/FTF.Y));S.yards+=yd+(res==='td'?20:0);S.long=Math.max(S.long,yd);
  if(res==='td'){S.td++;ftCheer();sfx('tada');banner(`🏈 TOUCHDOWN! ${yd} yard return!`);did('football','rettd');for(const e of FTB.us)e.a.play('cheer');me.a.play('cheer');}
  else banner(res==='oob'?`Out of bounds · ${yd} yards`:`🚩 Flag pulled · ${yd} yard return`);
  ftHud('🏃 Kick returns',`${S.yards} yds`,`punt ${S.n+1} of 5`);FTZ.board.draw(S.yards,'',res==='td'?'TOUCHDOWN!':`${yd} YD RETURN`,`PUNT ${S.n+1} OF 5`);}

/* ---------- camera: high behind the play, looking down the field ---------- */
function ftCam(dt){if(!FTB.mode)return;const c=FTB.cam,me=FTB.me,B=FTB.ball;let P,T;
  if(FTB.mode==='fg'){const S=FTB.fg;
    if(S.ph==='fly'&&B.p.z<S.zH-1){P=new THREE.Vector3(-.4,4,S.zH+10);T=new THREE.Vector3(B.p.x*.6,Math.max(1.5,B.p.y*.8),Math.min(B.p.z,-FTF.HL+4)-2);}
    else{P=new THREE.Vector3(-.35,3.8,S.zH+10);T=new THREE.Vector3(0,2.6,-FTF.HL);}}// pulled back behind the kicker and holder
  else if(FTB.mode==='ret'){const S=FTB.r;const f=(S.ph==='air'&&B.st==='air')?new THREE.Vector3((me.p.x+B.p.x)/2,0,Math.max(me.p.z-2,(me.p.z+B.p.z)/2)):me.p;
    P=new THREE.Vector3(f.x*.4,8,me.p.z+10.5);T=new THREE.Vector3(f.x*.7,.6,f.z-6);
    if(S.ph==='air'&&B.st==='air')T.y=Math.min(4,B.p.y*.4+.9);}
  else{// behind the quarterback of whoever has the ball (yours, or the Bears' when you're on defense), up high and back
    // far enough that the receivers, the defenders and the field ahead all fit on a phone held upright
    const G=FTB.g,dir=ftDir(),back=-dir,wide=camera.aspect<1?1:.72;let f;if(B.st==='air')f=B.p;else if(G.carrier)f=G.carrier.p;else f=G.qb.p;
    const fz=dir<0?Math.min(f.z,G.los+1):Math.max(f.z,G.los-1);
    P=new THREE.Vector3(f.x*.15,12.5*wide,fz+back*16.5*wide);T=new THREE.Vector3(f.x*.3,0,fz+dir*6);}
  FTZ.g.localToWorld(P);FTZ.g.localToWorld(T);
  if(!c.init){c.p.copy(P);c.t.copy(T);c.init=true;}c.p.lerp(P,Math.min(1,dt*4));c.t.lerp(T,Math.min(1,dt*5));
  camera.position.copy(c.p);camera.lookAt(c.t);
  // keep the stick pointing where the camera looks
  cam.yaw=Math.atan2(-(c.t.x-c.p.x),-(c.t.z-c.p.z));cam.cy=cam.yaw;}

/* ---------- every frame ---------- */
anims.push((t,dt)=>{
  // the pad: step on it to open the menu
  if(!FTB.mode&&started&&!closetOpen&&!FTB.menu&&!mapOpen&&!SP.mode&&!SP.menu&&!SC.mode&&!SC.menu){const [lx,lz]=FTZ.toLocal(player.pos.x,player.pos.z),d=Math.hypot(lx-FTZ.pad.lx,lz-FTZ.pad.lz);
    if(d<FTZ.pad.r&&player.onGround){if(!FTB.onPad){FTB.onPad=true;ftOpenMenu();}}else if(d>1.3)FTB.onPad=false;}
  // the ⚽ pad stays quiet while you play football or pick a game (it opens when SC.onPad is false)
  if(FTB.mode||FTB.menu||TPK.on)SC.onPad=true;
  // soccer says "Step on the ⚽ pad…" when you arrive, football adds its pad after it
  if(curZone!==FTB.lastZone){FTB.lastZone=curZone;if(started&&!FTB.mode&&!SC.mode&&curZone===FTZ.zone)setTimeout(()=>toast('…or the 🏈 pad for football!'),3600);}
  if(!FTB.mode)return;
  if(closetOpen){ftEnd(false);return;}
  FTB.dt=dt;FTB.clock+=dt;ftMyBelt(true);ftMeSync();
  if(FTB.mode==='fg')ftFgStep(dt);else if(FTB.mode==='ret')ftRetStep(dt);else ftGameStep(dt);
  if(!FTB.mode)return;
  // your own pose (Avatar.update already ran this frame), then everyone else
  const me=FTB.me;if(me.pose&&!av.emote){me.pk+=dt;ftPose(av,me.pose,me.pk,dt);}if(me.pose==='reach'&&me.pk>.4)me.pose=null;
  if(me.flagT>0&&(me.flagT-=dt)<=0)for(const f of FTB.flags.splice(0))f.parent&&f.parent.remove(f);
  for(const e of FTB.pl){if(!e.a.g.visible)continue;e.a.g.position.copy(e.p);e.a.g.rotation.y=e.face+(e.a.spinY||0);e.a.update(dt,e.sp,false);
    if(e.pose&&!e.a.emote){if(e.pose!=='kneel'&&e.pose!=='ready'&&e.pose!=='set')e.pk+=dt;ftPose(e.a,e.pose,e.pk,dt);}
    if(e.pose==='reach'&&e.pk>.45)e.pose=e.hold==='carry'?'carry':null;if(e.pose==='throw'&&e.pk>.7){e.pose=null;e.hold=null;}
    if(e.belt)e.belt.fl.forEach((f,i)=>{f.rotation.z=Math.sin(FTB.clock*9+i)*Math.min(.6,e.sp*.12);});}
  av.tag.visible=false;});
// friends online see that you're playing football
SHOW.push({k:'fball',
  mine(){return FTB.mode?{w:{fg:'🥅 Kicking field goals',game:'🏈 Pick-up football',sack:'💥 Sack the QB',ret:'🏃 Kick returns'}[FTB.mode]}:null;},
  on(f,d){const h={};if(d&&typeof d.w==='string'&&f.a){h.sign=sprite(labelTex(showEsc(d.w.slice(0,30)),{size:44,w:512,h:100,fg:'#3b2357',bg:'rgba(255,240,248,.92)',border:null}),1.05,.2);h.sign.position.y=2.1;f.a.g.add(h.sign);h.g=f.a.g;}return h;},
  step(f,d,dt,h){if(h&&h.sign&&f.a&&h.g!==f.a.g){h.g.remove(h.sign);f.a.g.add(h.sign);h.g=f.a.g;}},
  off(f,h){if(h&&h.sign&&h.g)h.g.remove(h.sign);}});
Object.assign(window.__game,{football:{FTB,FTF,FTZ,start:ftStart,end:ftEnd,menu:ftOpenMenu,press:()=>FTB.press&&FTB.press(),alt:()=>FTB.alt&&FTB.alt(),snap:p=>ftSnap(p?FT_PLAYS.find(x=>x.id===p):null),
  throwTo:i=>FTB.g&&ftThrow(FTB.g.qb,FTB.g.wr[i]),busy:()=>!!FTB.mode}});
