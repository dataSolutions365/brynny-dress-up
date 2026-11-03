/* ================= 🛹 SKATE PARK: ramps, grinds and tricks =================
   Roll into the Skate Park (12f-place-skate-park.js) on your 🛹 skateboard, your 🛼 roller skates or your 🚲 bike, and the
   ramps work like real ones:
   - you roll down into the half-pipe, up the other wall, slow down near the top and roll back, the same speed you went in
     (gravity, like a real ramp). Push on the joystick on the flat parts to go faster, and you fly up out of the half-pipe
     or the quarter pipe, turn around in the air and land back on the ramp.
   - the kicker, the funbox and the stairs throw you into the air when you ride off them fast.
   - JUMP does an ollie (a hop on the bike). Ollie onto the rail, the handrail, the ledge or the funbox edge going along it
     and you grind it, with sparks, until you ride off the end (or JUMP off).
   - the trick buttons next to JUMP do a trick in the air (they ollie for you first if you're on the ground):
       🛹 Kickflip, 360, Grab      🛼 360, Backflip, Split      🚲 Backflip, 360, No hands
     Each landed trick pops up with points, and a trick and a grind in one go make a combo. Your best combo is saved.
   You lean with the ramp: the board, skates or bike tilt to match the ramp under you.
   While you're on wheels in the park this file moves you (skateParkStep, called from the game loop in 25-game-loop.js);
   walking around the park is normal walking. Everything is in the park's own directions (local x,z, see SKZ). */
const SKP={on:false,kind:'',S:0,hd:0,face:0,lx:0,lz:0,y:0,air:false,vx:0,vz:0,vy:0,push:false,grind:null,
  n:new THREE.Vector3(0,1,0),trick:null,combo:[],pts:0,vert:null,airT:0,spark:0,lbl:'',btns:'',gy:0};
const SK_G=18;// the same gravity as jumping everywhere else in town
const SK_MAX={board:10,skates:10,bike:10.5},SK_POP={board:6,skates:6.2,bike:5.6};
const SK_TRICKS={
  board:[{id:'kickflip',e:'🛹',n:'Kickflip',T:.5,pts:100},{id:'spin',e:'🌀',n:'360',T:.65,pts:150},{id:'grab',e:'✋',n:'Grab',T:.6,pts:80}],
  skates:[{id:'spin',e:'🌀',n:'360',T:.65,pts:150},{id:'backflip',e:'🔄',n:'Backflip',T:.8,pts:250},{id:'split',e:'🤸',n:'Split',T:.6,pts:100}],
  bike:[{id:'backflip',e:'🔄',n:'Backflip',T:.85,pts:250},{id:'spin',e:'🌀',n:'360',T:.7,pts:150},{id:'nohands',e:'🙌',n:'No hands',T:.7,pts:100}]};
// which wheels you're on right now ('' when you're walking or riding an animal)
const skWheels=()=>SK.on?'board':BIKE.on?'bike':(av&&av.rollers&&!boardBusy())?'skates':'';
const skH=(x,z)=>skateLH(x,z);
// how steep the ground is (rise per step along x and z), ignoring the sides of boxes and steps
function skGrad(x,z,h0){const e=.03,f=(p,m)=>{const a=(p-h0)/e,b=(h0-m)/e,oa=Math.abs(a)<7,ob=Math.abs(b)<7;return oa&&ob?(a+b)/2:oa?a:ob?b:0;};
  return [f(skH(x+e,z),skH(x-e,z)),f(skH(x,z+e),skH(x,z-e))];}
const skAng=a=>((a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
// a step or a wall right ahead (a sudden rise), as opposed to a ramp you can roll up
function skWall(x0,z0,x1,z1,y){let px=x0,pz=z0,ph=y;for(let i=1;i<=4;i++){const k=i/4,x=x0+(x1-x0)*k,z=z0+(z1-z0)*k,h=skH(x,z),d=Math.hypot(x-px,z-pz)||1e-4;
  if(h-ph>.035&&(h-ph)/d>8)return true;px=x;pz=z;ph=Math.max(ph,h);}return false;}
const railY=(r,t)=>r.y0+(r.y1-r.y0)*t;

function skEnter(kind,lx,lz){const P=SKP,z=Z.skate;P.on=true;P.kind=kind;P.lx=lx;P.lz=lz;P.y=player.pos.y;
  P.S=SK.on?Math.max(SK.v,player.speed):BIKE.on?Math.max(BIKE.v,player.speed):player.speed;P.hd=P.face=player.face-z.rot;
  P.air=!player.onGround;P.vx=Math.sin(P.hd)*P.S;P.vz=Math.cos(P.hd)*P.S;P.vy=player.vy;P.grind=null;P.trick=null;P.combo=[];P.pts=0;P.vert=null;P.n.set(0,1,0);
  if(!SAVE.skatePark){SAVE.skatePark=1;persist();setTimeout(()=>toast(kind==='bike'?'🚲 Pedal on the flat to go fast, then ride up the ramps! Tap the trick buttons in the air':
    '🛹 Push on the flat to go fast, then ride up the ramps! JUMP to ollie onto rails, trick buttons in the air'),400);}}
function skLeave(){const P=SKP;if(!P.on)return;P.on=false;P.grind=null;P.trick=null;
  if(SK.on){SK.v=player.speed;SK.dir=player.face;}if(BIKE.on){BIKE.v=player.speed;BIKE.dir=player.face;}
  if(av){av.g.rotation.x=0;av.parkPose=null;if(av.deck){av.deck.rotation.z=0;av.deck.position.y=0;}}skButtons();}

// where you'd land if you fell from here (for timing tricks so they finish before you touch down)
function skLandIn(){const P=SKP,g=skH(P.lx,P.lz),d=P.y-g;return (P.vy+Math.sqrt(Math.max(0,P.vy*P.vy+2*SK_G*Math.max(0,d))))/SK_G;}
function skPop(vy){const P=SKP;if(P.grind){skGrindOff(vy);return;}if(P.air)return;
  const [gx,gz]=skGrad(P.lx,P.lz,P.y),dx=Math.sin(P.hd),dz=Math.cos(P.hd),k=gx*dx+gz*dz,vh=P.S/Math.sqrt(1+k*k);
  P.air=true;P.vx=dx*vh;P.vz=dz*vh;P.vy=vh*k+vy;P.airT=0;sfx('jump');}
function skateParkJump(){if(!SKP.on)return false;skPop(SK_POP[SKP.kind]);if(SK.on)tone(150,.05,'square',.05);return true;}
function skTrick(id){const P=SKP;if(!P.on||closetOpen)return;const def=(SK_TRICKS[P.kind]||[]).find(t=>t.id===id);if(!def)return;
  if(P.trick)return;// one at a time
  if(!P.air||P.grind)skPop(Math.max(SK_POP[P.kind],SK_G*def.T*.62));
  P.trick={def,p:0};P.tn=(P.tn||0)+1;}

function skGrindOff(vy){const P=SKP,g=P.grind;if(!g)return;const r=g.r,L=g.L,ux=(r.b[0]-r.a[0])/L,uz=(r.b[1]-r.a[1])/L,sl=(r.y1-r.y0)/L,c=1/Math.sqrt(1+sl*sl);
  P.vx=ux*g.dir*g.S*c;P.vz=uz*g.dir*g.S*c;P.vy=g.dir*sl*g.S*c+vy;P.air=true;P.airT=0;P.grind=null;
  P.combo.push({n:g.r.k==='rail'?(g.r.n==='Handrail'?'Handrail grind':'Rail grind'):g.r.n==='Funbox'?'Edge grind':'Ledge grind',pts:50+Math.round(g.d*60)});}
// catch a rail or ledge when you come down onto it going along it
function skCatch(oy){const P=SKP,vh=Math.hypot(P.vx,P.vz);if(vh<1)return false;
  for(const r of SKZ.rails){const ax=r.b[0]-r.a[0],az=r.b[1]-r.a[1],L=Math.hypot(ax,az),ux=ax/L,uz=az/L;
    const t=((P.lx-r.a[0])*ux+(P.lz-r.a[1])*uz)/L;if(t<.02||t>.98)continue;
    const cx=r.a[0]+ux*t*L,cz=r.a[1]+uz*t*L;if(Math.hypot(P.lx-cx,P.lz-cz)>.42)continue;
    const ry=railY(r,t);if(P.y>ry+.3||P.y<ry-.32||oy<ry-.12)continue;
    const along=(P.vx*ux+P.vz*uz);if(Math.abs(along)<vh*.55)continue;
    const sl=(r.y1-r.y0)/L;P.grind={r,t,L,dir:Math.sign(along),S:Math.max(3,Math.abs(along)*Math.sqrt(1+sl*sl)),d:0};
    P.lx=cx;P.lz=cz;P.y=ry;P.vy=0;P.air=false;P.hd=Math.atan2(ux*P.grind.dir,uz*P.grind.dir);
    tone(260,.08,'square',.06);tone(120,.12,'sawtooth',.05,.03);return true;}
  return false;}
// a rail you'd ride into, low down: bump off it
function skRailHit(x0,z0,x1,z1,y){for(const r of SKZ.rails){if(r.k!=='rail')continue;const ax=r.b[0]-r.a[0],az=r.b[1]-r.a[1],L=Math.hypot(ax,az),ux=ax/L,uz=az/L;
  const s0=(x0-r.a[0])*uz-(z0-r.a[1])*ux,s1=(x1-r.a[0])*uz-(z1-r.a[1])*ux;if(Math.abs(s0)>.15&&Math.abs(s1)>.15&&Math.sign(s0)===Math.sign(s1))continue;if(Math.abs(s1)>.12&&Math.sign(s0)===Math.sign(s1))continue;
  const t=((x1-r.a[0])*ux+(z1-r.a[1])*uz)/L;if(t<-.03||t>1.03)continue;if(y>railY(r,Math.max(0,Math.min(1,t)))-.04)continue;return [uz,-ux];}return null;}

function skLand(){const P=SKP,[gx,gz]=skGrad(P.lx,P.lz,P.y),nl=Math.sqrt(1+gx*gx+gz*gz),nx=-gx/nl,ny=1/nl,nz=-gz/nl;
  const vn=P.vx*nx+P.vy*ny+P.vz*nz,tx=P.vx-vn*nx,ty=P.vy-vn*ny,tz=P.vz-vn*nz,th=Math.hypot(tx,tz);
  P.S=Math.hypot(tx,ty,tz)*.97;P.hd=th>.25?Math.atan2(tx,tz):Math.hypot(gx,gz)>.1?Math.atan2(-gx,-gz):P.hd;
  if(P.vert){P.face=P.vert.f1;P.vert=null;}
  const hard=P.vy<-6;P.air=false;P.vy=0;
  if(P.trick){P.trick.p=1;skDone();}
  if(hard)burst(new THREE.Vector3(player.pos.x,P.y+.05,player.pos.z),'#ffffff',10,1);
  if(P.combo.length)skScore();}
function skDone(){const P=SKP,tr=P.trick;if(!tr)return;P.trick=null;P.combo.push({n:tr.def.n,pts:tr.def.pts});did('trick',tr.def.id);}
function skScore(){const P=SKP,c=P.combo;P.combo=[];const n=c.length,pts=c.reduce((s,x)=>s+x.pts,0)*(n>1?n:1);
  const best=pts>(SAVE.skateBest||0);if(best){SAVE.skateBest=pts;persist();}
  skPopText(c.map(x=>x.n).join(' + ')+'!',`+${pts}${n>1?` (combo ×${n})`:''}${best&&pts>=200?' 🏆 Best!':''}`);
  tone(660,.08,'triangle',.1);tone(990,.12,'triangle',.1,.07);if(n>1)tone(1320,.15,'triangle',.08,.14);
  if(n>1)did('skateCombo',n);}
function skPopText(a,b){let el=$('#trickTxt');if(!el)return;el.innerHTML=`<b>${a}</b><span>${b}</span>`;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}

/* ---------- moving you: called from the game loop instead of walking while you're on wheels in the park ---------- */
function skateParkStep(dt,ix,iy,mag){const z=Z.skate,P=SKP,p=player.pos,kind=skWheels();
  const [lx,lz]=z.toLocal(p.x,p.z),dc=Math.hypot(lx,lz);
  if(!P.on){if(!kind||!started||closetOpen||dc>z.r-.2||FLY.on)return false;skEnter(kind,lx,lz);skButtons();}
  else if(!kind||closetOpen||FLY.on||(dc>z.r+.25&&!P.air&&!P.grind)){skLeave();return false;}
  if(P.kind!==kind){P.kind=kind;P.trick=null;skButtons();}
  if(av)av.g.rotation.set(0,0,0);
  // the way you're pushing the joystick, in the park's directions
  let want=null;if(mag>.08){const fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx,n=Math.hypot(ix,iy)||1;want=Math.atan2((fx*-iy+rx*ix)/n,(fz*-iy+rz*ix)/n)-z.rot;}
  P.push=false;
  const steps=Math.min(10,Math.max(1,Math.ceil(Math.max(P.S,Math.hypot(P.vx,P.vz),Math.abs(P.vy))*dt/.06))),h=dt/steps;
  for(let i=0;i<steps;i++){
    if(P.grind){const g=P.grind,r=g.r,sl=(r.y1-r.y0)/g.L,c=1/Math.sqrt(1+sl*sl);
      g.S+=(-SK_G*g.dir*sl*c-.5)*h;g.S=Math.max(1.5,g.S);g.t+=g.dir*g.S*c/g.L*h;g.d+=h;
      if(g.t<0||g.t>1){g.t=Math.max(0,Math.min(1,g.t));skGrindOff(.8);}
      else{P.lx=r.a[0]+(r.b[0]-r.a[0])*g.t;P.lz=r.a[1]+(r.b[1]-r.a[1])*g.t;P.y=railY(r,g.t);}
      continue;}
    if(P.air){const ox=P.lx,oz=P.lz,oy=P.y;P.vy-=SK_G*h;P.lx+=P.vx*h;P.lz+=P.vz*h;P.y+=P.vy*h;P.airT+=h;
      if(P.vy<=1&&skCatch(oy))continue;
      const hit=skRailHit(ox,oz,P.lx,P.lz,P.y);if(hit){const d=P.vx*hit[0]+P.vz*hit[1];P.vx-=1.4*d*hit[0];P.vz-=1.4*d*hit[1];P.lx=ox;P.lz=oz;}
      const hn=skH(P.lx,P.lz);
      if(P.y<=hn){if(hn-oy>.12&&skH(ox,oz)<hn-.1){// flew into the side of something: bounce off it
          const hx=skH(P.lx,oz)>oy+.05,hz=skH(ox,P.lz)>oy+.05;if(hx||!hz){P.vx*=-.3;P.lx=ox;}if(hz||!hx){P.vz*=-.3;P.lz=oz;}tone(110,.06,'square',.06);
          const h2=skH(P.lx,P.lz);if(P.y<=h2){P.y=h2;skLand();}}
        else{P.y=hn;skLand();}}
      continue;}
    // rolling on the ground
    const y=P.y,[gx,gz]=skGrad(P.lx,P.lz,y),G2=gx*gx+gz*gz,sx=Math.sin(P.hd),sz=Math.cos(P.hd),k=gx*sx+gz*sz,c1=1/Math.sqrt(1+k*k),flat=G2<.2;
    P.S+=-SK_G*k*c1*h;// gravity: slower going up, faster coming down
    if(want!==null){const d=skAng(want-P.hd);
      if(P.S<.6&&flat)P.hd=want;else{const tr=(flat?3.4:G2<2?1.6:.7)*Math.min(1,mag*1.3)*h;P.hd+=Math.max(-tr,Math.min(tr,d));}
      if(flat&&Math.abs(d)<1.7&&P.S<SK_MAX[kind]){P.S=Math.min(SK_MAX[kind],P.S+7.5*mag*h);P.push=true;}
      else if(flat&&Math.abs(d)>2.5)P.S=Math.max(0,P.S-6*h);}
    if(P.S<0){P.S=-P.S;P.hd+=Math.PI;}// rolled to a stop up the ramp: back down you go
    P.S=Math.max(0,P.S-(.1+.006*P.S*P.S)*h);
    if(!flat){const s2=Math.sin(P.hd),c2=Math.cos(P.hd),lat=gx*c2-gz*s2;// the ramp's sideways slope turns you downhill
      if(P.S>.4)P.hd+=-SK_G*lat/(1+G2)/P.S*h;else P.hd+=skAng(Math.atan2(-gx,-gz)-P.hd)*Math.min(1,h*6);}
    else if(want===null&&P.S<.08)P.S=0;
    const dx=Math.sin(P.hd),dz=Math.cos(P.hd),k2=gx*dx+gz*dz,vh=P.S/Math.sqrt(1+k2*k2),vys=vh*k2;
    let nx=P.lx+dx*vh*h,nz=P.lz+dz*vh*h;
    // ran into a step, a box or the side of a ramp: bounce back off it
    if(skWall(P.lx,P.lz,nx,nz,y)){const bx=skWall(P.lx,P.lz,nx,P.lz,y),bz=skWall(P.lx,P.lz,P.lx,nz,y);let vx=dx*P.S,vz=dz*P.S;
      if(bx||!bz){vx*=-.3;nx=P.lx;}if(bz||!bx){vz*=-.3;nz=P.lz;}P.S=Math.hypot(vx,vz);if(P.S>.05)P.hd=Math.atan2(vx,vz);if(P.S>2)tone(110,.06,'square',.06);}
    const hit=skRailHit(P.lx,P.lz,nx,nz,y);if(hit){let vx=dx*P.S,vz=dz*P.S;const d=vx*hit[0]+vz*hit[1];vx-=1.3*d*hit[0];vz-=1.3*d*hit[1];P.S=Math.hypot(vx,vz);if(P.S>.05)P.hd=Math.atan2(vx,vz);nx=P.lx;nz=P.lz;}
    const hn=skH(nx,nz);
    // the ground drops away faster than you'd fall (the lip of a ramp, the top of the stairs): you're flying
    if(hn<y+vys*h-.5*SK_G*h*h-.012){P.air=true;P.airT=0;P.vx=dx*vh;P.vz=dz*vh;P.vy=vys;P.lx=nx;P.lz=nz;P.y=y+vys*h;
      // straight up off the top of a steep wall onto its deck (the half-pipe, the quarter pipe, not the kicker): go up and come back down onto the ramp, turning around in the air
      if(G2>2.5&&vys>0&&hn>y-.1){const gl=Math.sqrt(G2),ux=gx/gl,uz=gz/gl,a=P.vx*ux+P.vz*uz;P.vx+=(-.3-a)*ux;P.vz+=(-.3-a)*uz;
        const T=2*P.vy/SK_G,side=skAng(P.face-Math.atan2(ux,uz))>=0?1:-1;P.vert={f0:P.face,f1:P.face+side*Math.PI,t:0,T:Math.max(.3,T),vy0:Math.max(1,P.vy),n0:P.n.clone()};}
      continue;}
    P.lx=nx;P.lz=nz;P.y=hn;}
  // facing: follow the way you roll (a quick kick-turn when you roll back down a ramp), or turn around in the air off a wall
  if(P.vert){const v=P.vert;v.t+=dt;const k=Math.min(1,v.t/v.T),e=k*k*(3-2*k);P.face=v.f0+(v.f1-v.f0)*e;}
  else if(P.grind)P.face=angDamp(P.face,P.hd,Math.min(1,dt*14));
  else if(!P.air)P.face=angDamp(P.face,P.hd,Math.min(1,dt*(P.S<1.5?5:10)));
  // trick in the air: speeds up if needed so it's done before you land
  if(P.trick&&P.air){const tr=P.trick,need=1-tr.p,tl=skLandIn();tr.p+=Math.max(1/tr.def.T,need/Math.max(.05,tl-.05))*dt;if(tr.p>=1){tr.p=1;skDone();}}
  if(P.vert&&!P.air)P.vert=null;
  if(P.air&&P.vert&&P.airT>.45&&!P.vertScored){P.vertScored=true;P.combo.push({n:'Air',pts:60});}
  if(!P.air)P.vertScored=false;
  // put you there, sliding around the light poles, benches and signs
  let [wx,wz]=z.toWorld(P.lx,P.lz);
  if(!SKP.obs)SKP.obs=obs.filter(o=>!o.skRail&&Math.hypot(o.x-z.x,o.z-z.z)<z.r+1.5);
  for(const o of SKP.obs){const ox=wx-o.x,oz=wz-o.z,d=Math.hypot(ox,oz),m=o.r+.3;if(d<m&&d>1e-4){wx=o.x+ox/d*m;wz=o.z+oz/d*m;[P.lx,P.lz]=z.toLocal(wx,wz);}}
  p.set(wx,P.y,wz);
  const vh=P.air?Math.hypot(P.vx,P.vz):P.grind?P.grind.S:P.S;
  player.speed=vh;player.vy=P.air?P.vy:0;player.onGround=!P.air;player.face=P.face+z.rot;
  // sparks and a scraping sound while grinding
  if(P.grind){P.spark-=dt;if(P.spark<=0){P.spark=.06;const w=new THREE.Vector3(wx,P.y+.02,wz);burst(w,'#ffb347',6,1.6,.12);tone(85+Math.random()*50,.06,'sawtooth',.025);}}
  // the surface under you, so the board, skates or bike tilt with the ramp
  let tn=null;if(P.grind){const r=P.grind.r,L=P.grind.L,sl=(r.y1-r.y0)/L;const ux=(r.b[0]-r.a[0])/L,uz=(r.b[1]-r.a[1])/L;tn=[-ux*sl,1,-uz*sl];}
  else{const gh=skH(P.lx,P.lz);if(!P.air||P.y-gh<1.2){const [gx,gz]=skGrad(P.lx,P.lz,gh);tn=[-gx,1,-gz];}else tn=[0,1,0];}
  {const c=Math.cos(z.rot),s=Math.sin(z.rot),wnx=tn[0]*c+tn[2]*s,wnz=-tn[0]*s+tn[2]*c;tmpV.set(wnx,tn[1],wnz).normalize();
    // up out of the half-pipe: lean back toward standing up at the top of the air, then lay back onto the wall to land
    if(P.air&&P.vert){const k=.65*(1-Math.min(1,Math.abs(P.vy)/P.vert.vy0));tmpV.copy(P.vert.n0).lerp(SKQ.up,k).normalize();}
    P.n.lerp(tmpV,Math.min(1,dt*(P.air?(P.vert?10:5):16))).normalize();}
  SK.pushing=P.push;
  return true;}

/* ---------- how it looks: tilt with the ramp and do the tricks (after the skateboard and bike code has posed you) ---------- */
const SKQ={t:new THREE.Quaternion(),s:new THREE.Quaternion(),f:new THREE.Quaternion(),r:new THREE.Quaternion(),o:new THREE.Vector3(),c:new THREE.Vector3(),c2:new THREE.Vector3(),up:new THREE.Vector3(0,1,0),
  x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),q:new THREE.Quaternion(),e:new THREE.Euler()};
const skEase=k=>k<.5?2*k*k:1-2*(1-k)*(1-k);
function skParkPose(a,tgt,sp,air,t){const P=SKP;if(!P.on)return;const tr=P.trick,id=tr&&tr.def.id,k=tr?Math.sin(Math.min(1,tr.p)*Math.PI):0;
  if(P.kind==='skates'){
    // gliding: legs together, knees bent, arms out a little; a deep crouch going up and down the ramps and in the air
    const steep=Math.hypot(...skGrad(P.lx,P.lz,P.y))>.6;
    if(P.grind){tgt.l0=-.35;tgt.l1=-.2;tgt.k0=.75;tgt.k1=.55;tgt.l0z=-.25;tgt.l1z=.25;tgt.a0z=-1.2;tgt.a1z=1.2;tgt.a0x=tgt.a1x=0;tgt.lean=.3;tgt.bob=-.12;}
    else if(air||steep||!P.push){const c=air?1:steep?.75:.45;tgt.l0=tgt.l1=-.55*c;tgt.k0=tgt.k1=1.1*c;tgt.l0z=-.06;tgt.l1z=.06;tgt.a0z=-.5-.5*c;tgt.a1z=.5+.5*c;tgt.a0x=tgt.a1x=-.2;tgt.e0=tgt.e1=-.4;tgt.lean=.25+.15*c;
      const T=a.legX+.38,S=a.legX+.37;tgt.bob=(T*Math.cos(tgt.l0)+S*Math.cos(tgt.l0+tgt.k0))-(T+S);if(air)tgt.bob*=.5;}
    if(id==='split'){tgt.l0z=-1.25*k;tgt.l1z=1.25*k;tgt.l0=tgt.l1=-.2*k;tgt.k0=tgt.k1=.1;tgt.a0z=-2.4*k;tgt.a1z=2.4*k;tgt.lean=.1;}
    if(id==='backflip'||id==='spin'){tgt.l0=tgt.l1=-1.1;tgt.k0=tgt.k1=1.7;tgt.a0z=-.3;tgt.a1z=.3;tgt.a0x=tgt.a1x=-.9;tgt.e0=tgt.e1=-1.4;}}
  if(P.kind==='board'){
    if(id==='grab'){tgt.k0=tgt.k1=1.55;tgt.l0=tgt.l1=-1.2;tgt.lean=.55;tgt.a1x=.25;tgt.a1z=.25;tgt.e1=-.1;tgt.a0z=-1.6;tgt.bob=-.2;}
    if(id==='kickflip'){tgt.k0=tgt.k1=1.4;tgt.l0=tgt.l1=-.95;tgt.bob=-.1;}
    if(P.grind){tgt.k0=tgt.k1=.85;tgt.a0z=-1.3;tgt.a1z=1.3;}}}
// tilt a rider (A: their Avatar, bg: their bike's group or null) to the ramp's up (n), and turn them for a trick
// (id, p = how far along 0..1). Used for you and for friends online (26c-friends-see.js).
function skPose(A,bg,pos,kind,n,id,p,grind){const k=id?skEase(Math.min(1,p)):0;
  SKQ.t.setFromUnitVectors(SKQ.up,n);
  const spin=id==='spin'?k*Math.PI*2:0,flip=id==='backflip'?k*Math.PI*2:0;
  SKQ.s.setFromAxisAngle(SKQ.y,spin);SKQ.f.setFromAxisAngle(SKQ.x,-flip);
  const base=A.g.quaternion.clone();// the turn and lean from the skateboard / bike code
  const noFlip=SKQ.r.copy(SKQ.t).multiply(SKQ.s).multiply(base),all=SKQ.q.copy(noFlip).multiply(SKQ.f);
  const up=kind==='board'?.1:0,cy=kind==='bike'?.75:.85;
  SKQ.o.set(0,up,0).applyQuaternion(SKQ.t).add(pos);
  if(flip){SKQ.c.set(0,cy,0).applyQuaternion(noFlip);SKQ.c2.set(0,cy,0).applyQuaternion(all);SKQ.o.add(SKQ.c).sub(SKQ.c2);}
  // on a rail with the bike: the wheels go either side of it, so slide over a little
  if(grind&&kind==='bike')SKQ.o.add(tmpV.set(.16,-.32,0).applyQuaternion(noFlip));
  if(grind&&kind==='board')SKQ.o.y-=.05;
  A.g.position.copy(SKQ.o);A.g.quaternion.copy(all);
  if(bg){bg.position.copy(SKQ.o);bg.quaternion.copy(all);
    // no hands: let go of the bars and throw both arms up
    if(id==='nohands'){const w=Math.sin(Math.min(1,p)*Math.PI);for(const ar of A.arms){SKQ.e.set(0,0,ar.sx*-2.3);ar.sh.quaternion.slerp(tmpQ.setFromEuler(SKQ.e),w);ar.el.quaternion.slerp(tmpQ.identity(),w);}}}
  if(A.deck){A.deck.rotation.z=id==='kickflip'?k*Math.PI*2:0;A.deck.position.y=id==='kickflip'?-Math.sin(k*Math.PI)*.16:0;}}
// the ramp's up at a spot in town (world), for friends: their phone sends where they are, the ramps are the same here
function skNormalAt(x,z,out){const s=Z.skate,[lx,lz]=s.toLocal(x,z),h=skH(lx,lz),[gx,gz]=skGrad(lx,lz,h),c=Math.cos(s.rot),sn=Math.sin(s.rot);
  return out.set(-gx*c-gz*sn,1,gx*sn-gz*c).normalize();}
anims.push((t,dt)=>{const P=SKP;if(!av)return;
  av.parkPose=P.on?skParkPose:null;skLabel();
  if(!P.on)return;
  skPose(av,P.kind==='bike'?BK.g:null,player.pos,P.kind,P.n,P.trick&&P.trick.def.id,P.trick?P.trick.p:0,!!P.grind);});
const tmpQ=new THREE.Quaternion();

/* ---------- buttons: OLLIE on JUMP, and three trick buttons ---------- */
function skButtons(){const el=$('#tricks');if(!el)return;const P=SKP,key=P.on?P.kind:'';if(key===P.btns)return;P.btns=key;
  // in a wider ring outside the moves wheel around JUMP (19-ui-closet.js), so they never cover those buttons
  const pos=deg=>{const a=deg*Math.PI/180,R=182;return `right:calc(env(safe-area-inset-right) + ${(66-Math.cos(a)*R-30).toFixed(0)}px);bottom:calc(env(safe-area-inset-bottom) + ${(72+Math.sin(a)*R-30).toFixed(0)}px)`;};
  el.innerHTML=key?SK_TRICKS[key].map((t,i)=>`<button data-t="${t.id}" aria-label="${t.n}" style="${pos([165,133,101][i])}">${t.e}<span>${t.n}</span></button>`).join(''):'';el.classList.toggle('show',!!key);}
function skLabel(){const P=SKP,s=P.on?P.kind:'';if(s===P.lbl)return;P.lbl=s;if(!(barnRide&&isFlyer(barnRide)))$('#jump').textContent=s==='board'?'OLLIE':s==='bike'?'HOP':'JUMP';skButtons();}
{const el=$('#tricks');if(el)el.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();skTrick(b.dataset.t);});}
addEventListener('keydown',e=>{if(!SKP.on||e.target.tagName==='INPUT')return;const i={KeyJ:0,KeyK:1,KeyL:2}[e.code];if(i!==undefined&&SK_TRICKS[SKP.kind])skTrick(SK_TRICKS[SKP.kind][i].id);});
