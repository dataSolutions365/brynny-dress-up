/* ================= 🌊 DOLPHIN BAY: swim in the sea off the Beach, with dolphins, a whale, a sea turtle and a seal =================
   - The bay is the 'bay' zone in ZONES (02-island.js): a circle of sea just past the Beach. Walk off the sand (or jump off the dock)
     and you wade in, then swim. collide() (25-game-loop.js) asks seaKeep() whether you may be out there.
   - Swimming: the game still keeps you at ground height 0 (so the camera, stars and zones work as usual); this file just sinks
     your body into the water and poses you (crawl stroke when you move, treading water when you stop) after Avatar.update.
     Not on a bike, a skateboard or a barn ride: hop off first.
   - Sea animals: 🐬 three dolphins (one is Splash), 🐋 Big Blue the humpback whale, 🐢 Shelly the sea turtle, and 🦭 Pip the seal
     on her rock. Swim near them and they come and swim along beside you. Tap 🐟 Feed when you're close.
   - 🌊 Ocean challenges (the Ocean tab in challenges.js, ids in SEA_RIDES[].ids): finish all of an animal's challenges and you can
     ride it in the bay (🐢 Shelly, 🐬 Splash, 🐋 Big Blue). Pip the seal is just for feeding.
   - Friends online see you swimming, and on your sea ride, through the 'sea' entry in SHOW (26c-friends-see.js).
   Everything is low-poly with a few shared materials and no textures, and it all hides when you're far from the bay (iPhone memory). */
const BAY=Z.bay,WATER_Y=-.35;
MAPC.bay='#7fd6ee';
// how deep you are: 0 on the sand, 1 swimming (the island's sand edge ends at R+1.6)
const seaDepth=(x,z)=>Math.max(0,Math.min(1,(Math.hypot(x,z)-(R+1.3))/2.6));
const inBay=(x,z,pad=0)=>Math.hypot(x-BAY.x,z-BAY.z)<BAY.r+pad;
let seaNoRideT=0;
// collide() asks: the player is past the island's edge; may they be out here? Moves them into the bay if that's nearer than the shore.
function seaKeep(p,lim){if(!started)return false;
  if(barnRide||BIKE.on||SK.on){if(inBay(p.x,p.z,-1)&&performance.now()>seaNoRideT){seaNoRideT=performance.now()+5000;toast('Hop off to go swimming 🏊');}return false;}
  const bd=Math.hypot(p.x-BAY.x,p.z-BAY.z),edge=BAY.r-.4;if(bd<=edge)return true;
  if(bd-edge<Math.hypot(p.x,p.z)-lim){p.x=BAY.x+(p.x-BAY.x)/bd*edge;p.z=BAY.z+(p.z-BAY.z)/bd*edge;return true;}
  return false;}

/* ---------- the swimming pose (for you and for friends online) ---------- */
// k: 0 standing .. 1 swimming, mv: 0 still .. 1 full speed, ph: stroke time. Run it after Avatar.update. Returns how far to sink the body.
function swimPose(A,k,mv,ph){if(!A||!A.legs||k<.01)return 0;
  const stroke=k>.6&&mv>.2,pitch=k*(.22+.85*(stroke?mv:0));
  A.hips.rotation.x=pitch;A.head.rotation.x=-pitch*.8;
  A.arms.forEach((a,i)=>{const o=ph+i*Math.PI;
    if(stroke){a.sh.rotation.x=-(((o%(Math.PI*2))+Math.PI*2)%(Math.PI*2));a.sh.rotation.z=a.sx*.18;a.el.rotation.x=-.3;}
    else{a.sh.rotation.x+=(-.35+Math.sin(o*.8)*.3-a.sh.rotation.x)*k;a.sh.rotation.z+=(a.sx*(1+Math.sin(ph*1.6)*.2)-a.sh.rotation.z)*k;a.el.rotation.x+=(-.55-a.el.rotation.x)*k;}});
  A.legs.forEach((l,i)=>{const o=ph*(stroke?2.4:1.3)+i*Math.PI;l.hp.rotation.x+=(Math.sin(o)*(stroke?.32:.5)-(stroke?0:.25)-l.hp.rotation.x)*k;l.kn.rotation.x+=(.2+Math.max(0,Math.sin(o+1))*(stroke?.35:.6)-l.kn.rotation.x)*k;});
  // sink until the head is just above the water
  return k*(A.hip+.62*Math.cos(pitch)+.12);}

/* ---------- the sea animals ---------- */
const SEA_M={dol:std('#5f7f9c',{roughness:.35}),belly:std('#eef3f6',{roughness:.45}),eye:std('#1d2228',{roughness:.2}),
  whale:std('#3d5568',{roughness:.5}),wbelly:std('#e3e9ec',{roughness:.6}),bump:std('#33495a',{roughness:.7}),
  shell:std('#6f7f3c',{roughness:.6}),plate:std('#55652c',{roughness:.6}),tskin:std('#a3b872',{roughness:.7}),under:std('#e6d79a',{roughness:.7}),
  seal:std('#8d939b',{roughness:.5}),sealL:std('#c7ccd2',{roughness:.5}),rock:std('#8a8278',{roughness:.95,flatShading:true})};
const sM=(geo,mat,x,y,z,p)=>M(geo,mat,x,y,z,p,false,false);
// each model faces +z with its middle at the water line (y 0 = sea level); seat = how high your seat is on its back
function seaDolphin(){const g=new THREE.Group();
  sM(sph(.34,16,12),SEA_M.dol,0,0,0,g).scale.set(1,.95,3.2);
  sM(sph(.3,14,10),SEA_M.belly,0,-.1,.08,g).scale.set(.9,.7,2.9);
  const nose=sM(cyl(.06,.1,.42,10),SEA_M.dol,0,-.1,1.22,g);nose.rotation.x=Math.PI/2;
  const fin=sM(new THREE.ConeGeometry(.17,.5,8),SEA_M.dol,0,.42,-.12,g);fin.scale.set(.28,1,1.2);fin.rotation.x=-.55;
  for(const sx of [-1,1]){const f=sM(sph(.15,10,6),SEA_M.dol,sx*.33,-.17,.45,g);f.scale.set(1.7,.22,.75);f.rotation.z=sx*.45;
    sM(sph(.035,8,6),SEA_M.eye,sx*.2,.05,.9,g);}
  const tail=new THREE.Group();tail.name='tail';tail.position.z=-.95;g.add(tail);
  sM(sph(.15,10,8),SEA_M.dol,0,0,-.2,tail).scale.set(.6,1,2.4);sM(sph(.2,12,6),SEA_M.dol,0,0,-.58,tail).scale.set(2.3,.16,.9);
  return {g,tail,seat:.3,len:2.2};}
function seaWhale(){const g=new THREE.Group();
  sM(sph(1,18,12),SEA_M.whale,0,0,0,g).scale.set(1.35,1.05,4.6);
  sM(sph(.95,16,10),SEA_M.wbelly,0,-.32,.5,g).scale.set(1.25,.8,3.9);
  for(let i=0;i<8;i++)sM(sph(.12,8,6),SEA_M.bump,(i%2?.35:-.35)*(1+(i>>1)*.15),.95-i*.02,3.6-(i>>1)*.5,g);
  for(const sx of [-1,1]){const f=sM(sph(.4,12,6),SEA_M.wbelly,sx*2.1,-.5,1.5,g);f.scale.set(3.4,.22,.8);f.rotation.y=-sx*.45;f.rotation.z=sx*.25;
    sM(sph(.08,8,6),SEA_M.eye,sx*1.22,-.3,2.7,g);}
  const fin=sM(new THREE.ConeGeometry(.35,.55,8),SEA_M.whale,0,.98,-2.3,g);fin.scale.set(.4,1,1.6);fin.rotation.x=-.5;
  const tail=new THREE.Group();tail.name='tail';tail.position.z=-4.1;g.add(tail);
  sM(sph(.5,12,8),SEA_M.whale,0,0,-.5,tail).scale.set(.8,.75,2.2);
  for(const sx of [-1,1]){const f=sM(sph(.7,12,6),SEA_M.whale,sx*1.05,0,-1.5,tail);f.scale.set(1.8,.14,.9);f.rotation.y=sx*.35;}
  return {g,tail,seat:1.0,len:9.2,blow:new THREE.Vector3(0,1.05,2.6)};}
function seaTurtle(){const g=new THREE.Group();
  sM(sph(.62,16,8,0,Math.PI*2,0,Math.PI/2),SEA_M.shell,0,-.06,0,g).scale.set(1,.55,1.25);
  sM(sph(.6,16,8),SEA_M.under,0,-.08,0,g).scale.set(1,.18,1.2);
  for(const [x,z,s] of [[0,0,.22],[0,.42,.17],[0,-.42,.17],[-.34,.18,.15],[.34,.18,.15],[-.34,-.22,.15],[.34,-.22,.15]])sM(sph(s,10,6),SEA_M.plate,x,.2+(s>.2?.08:0),z,g).scale.set(1,.3,1);
  const head=new THREE.Group();head.name='head';head.position.set(0,.02,.82);g.add(head);sM(sph(.19,12,10),SEA_M.tskin,0,0,.05,head).scale.set(1,.85,1.25);
  for(const sx of [-1,1])sM(sph(.035,8,6),SEA_M.eye,sx*.12,.05,.17,head);
  const fl=[];for(const [sx,z,len] of [[-1,.42,2.6],[1,.42,2.6],[-1,-.5,1.3],[1,-.5,1.3]]){const p=new THREE.Group();p.position.set(sx*.55,-.08,z);g.add(p);
    const f=sM(sph(.16,10,6),SEA_M.tskin,sx*.16*len*.6,0,0,p);f.scale.set(len,.22,1);fl.push({p,sx,front:z>0});}
  return {g,flip:fl,head,seat:.34,len:1.8};}
function seaSeal(){const g=new THREE.Group();
  sM(sph(.32,14,10),SEA_M.seal,0,0,0,g).scale.set(1,.85,2);
  sM(sph(.28,12,8),SEA_M.sealL,0,-.08,.15,g).scale.set(.9,.6,1.6);
  const head=new THREE.Group();head.position.set(0,.32,.55);g.add(head);sM(sph(.22,14,10),SEA_M.seal,0,0,0,head);
  sM(sph(.11,10,8),SEA_M.sealL,0,-.06,.18,head).scale.set(1.2,.8,1);sM(sph(.035,8,6),SEA_M.eye,0,-.02,.28,head);
  for(const sx of [-1,1])sM(sph(.05,8,6),SEA_M.eye,sx*.1,.06,.17,head);
  const fl=[];for(const sx of [-1,1]){const p=new THREE.Group();p.position.set(sx*.28,-.12,.3);g.add(p);const f=sM(sph(.1,8,6),SEA_M.seal,sx*.12,0,0,p);f.scale.set(2,.3,1);fl.push(p);}
  sM(sph(.14,8,6),SEA_M.seal,0,-.05,-.72,g).scale.set(2,.3,1.1);
  return {g,head,flip:fl};}
const SEA_BUILD={dolphin:seaDolphin,whale:seaWhale,turtle:seaTurtle};

// who lives in the bay. path: a loop around the bay (rx, rz, how fast); slot: where they swim next to you (x to the side, z ahead)
const SEA_KIND={
  dolphin:{e:'🐬',food:[['🐟','fish'],['🦑','squid']],reach:3.6,withR:9,near:4.5,spd:3.8,ride:2.3,say:['*click click* 🐬','Eee-eee! 💙','*happy splash*']},
  whale:{e:'🐋',food:[['🦐','krill'],['🐟','little fish']],reach:7,withR:14,near:8,spd:2,ride:1.6,say:['*whooOOOoo* 🐋','*big happy spout* 💦','*gentle rumble*']},
  turtle:{e:'🐢',food:[['🪼','jellyfish'],['🥬','sea grass']],reach:3,withR:8,near:4,spd:1.2,ride:1.35,say:['*slow happy blink*','*paddle paddle* 🐢','*munch* 🌿']},
  seal:{e:'🦭',food:[['🐟','fish']],reach:3.6,say:['Ork ork! 👏','*flipper clap* 👏','*happy wiggle*']}};
// the rides you earn with 🌊 Ocean challenges (challenges.js has the same ids, grp = k)
const SEA_RIDES=[
  {k:'shelly',kind:'turtle',nm:'Shelly',n:'Sea turtle',ids:['sea_swim','sea_turtle','sea_feedT']},
  {k:'splash',kind:'dolphin',nm:'Splash',n:'Dolphin',ids:['sea_dolph','sea_feedD','sea_feedAll']},
  {k:'bigblue',kind:'whale',nm:'Big Blue',n:'Humpback whale',ids:['sea_whale','sea_spout','sea_swim1k','sea_feedW']}];
SAVE.sea||={swum:0,with:{},spouts:0,own:{}};const SEA=SAVE.sea;SEA.with||={};SEA.own||={};

const SEAS=[],bayAt=(lx,lz)=>[BAY.x+lx,BAY.z+lz];// bay-centred spots (the bay sits straight out from the Beach, so +z is toward the shore)
const seaToward=Math.atan2(-BAY.x,-BAY.z);// the way to the island
function seaAdd(kind,nm,m,o={}){const c={kind,nm,K:SEA_KIND[kind],m,g:m.g,pos:new THREE.Vector3(),face:0,y:0,pitch:0,mode:'roam',t:Math.random()*9,a:o.a||0,
  path:o.path,slot:o.slot,leap:0,leapT:3+Math.random()*4,happy:0,spout:6+Math.random()*4,withT:0};
  c.g.rotation.order='YXZ';const [x,z]=o.path?seaPathAt(c,c.a):o.at;c.pos.set(x,0,z);c.g.position.set(x,WATER_Y,z);scene.add(c.g);SEAS.push(c);return c;}
// a loop around the bay, a little egg-shaped and turned so it doesn't look like a circle
function seaPathAt(c,a){const P=c.path,x=Math.sin(a)*P.rx,z=Math.cos(a)*P.rz,r=P.rot||0;return bayAt(x*Math.cos(r)-z*Math.sin(r),x*Math.sin(r)+z*Math.cos(r));}
{const d0=seaDolphin();
  const dols=[d0,{...d0,g:d0.g.clone()},{...d0,g:d0.g.clone()}];for(const d of dols)d.tail=d.g.getObjectByName('tail');
  dols.forEach((d,i)=>{const c=seaAdd('dolphin',i?['Bubbles','Coral'][i-1]:'Splash',d,{path:{rx:10.5,rz:8,spd:3.6,rot:.3},a:i*.35,slot:[[-1.9,.5],[1.9,.4],[0,2.8]][i]});if(i)c.g.scale.setScalar(.85);});}
seaAdd('whale','Big Blue',seaWhale(),{path:{rx:8.5,rz:7,spd:1.6,rot:-.4},a:2.6,slot:[4.4,0]});
seaAdd('turtle','Shelly',seaTurtle(),{path:{rx:5,rz:3.5,spd:1,rot:.8},a:1,slot:[1.5,-.6]});
// 🦭 Pip on her rock near the shore
const SEAL={rock:null,c:null};{const [x,z]=bayAt(5.5,9.5);const rk=new THREE.Group();rk.position.set(x,WATER_Y,z);scene.add(rk);
  const r=M(new THREE.DodecahedronGeometry(1.2,0),SEA_M.rock,0,-.15,0,rk,false,true);r.scale.set(1.45,.62,1.15);
  M(new THREE.DodecahedronGeometry(.6,0),SEA_M.rock,.9,-.2,-.6,rk,false,true).scale.set(1,.6,1);obs.push({x,z,r:1.6});SEAL.rock=rk;
  const s=seaSeal();s.g.position.set(-.1,.72,.1);s.g.rotation.y=seaToward+.4;rk.add(s.g);
  SEAL.c={kind:'seal',nm:'Pip',K:SEA_KIND.seal,m:s,g:s.g,pos:new THREE.Vector3(x,0,z),happy:0,t:0,fixed:true};SEAS.push(SEAL.c);}

/* ---------- you in the water ---------- */
const SW={withNow:{},k:0,ph:0,ride:null,splashT:0,hello:{},wasAir:false,sink:0,warn:0};
const seaVisible=()=>Math.hypot(player.pos.x-BAY.x,player.pos.z-BAY.z)<75;
let seaShown=true;
function seaShow(v){if(v===seaShown)return;seaShown=v;for(const c of SEAS)c.g.visible=v;SEAL.rock.visible=v;}
const seaSwimming=()=>SW.k>.6;

function seaStep(dt){const p=player.pos,t=performance.now()/1000;
  seaShow(seaVisible());
  // how deep you are, eased so wading in looks smooth
  const want=started&&!FLY.on?seaDepth(p.x,p.z):0;SW.k+=(want-SW.k)*Math.min(1,dt*6);if(SW.k<.002)SW.k=0;
  if(SW.ride&&(SW.k<.35||closetOpen))seaHopOff(true);
  // riding is faster, swimming without a ride a bit slower than walking (the walking step already moved you; this adds or takes a little)
  if(SW.k>.3&&player.speed>.3){const extra=(SW.ride?SW.ride.K.ride-1:-.18*SW.k)*player.speed*dt;p.x+=Math.sin(player.face)*extra;p.z+=Math.cos(player.face)*extra;collide(p);}
  if(seaSwimming()&&player.speed>.3){SEA.swum+=player.speed*dt;}
  const mv=Math.min(1,player.speed/5);SW.ph+=dt*(2.2+mv*4.2);
  // splashes when you land in the water, and little ones from your arms while you swim
  if(SW.k>.5&&SW.wasAir&&player.onGround){burst(new THREE.Vector3(p.x,WATER_Y+.1,p.z),'#ffffff',22,2.4,.3);sfx('splash');}SW.wasAir=!player.onGround;
  if(SW.k>.6&&!SW.ride&&mv>.25&&(SW.splashT-=dt)<0){SW.splashT=.55;burst(new THREE.Vector3(p.x+Math.sin(player.face)*.6,WATER_Y+.05,p.z+Math.cos(player.face)*.6),'#ffffff',6,1.2,.16);}
  // your body: on a sea ride you sit on its back, otherwise you swim
  if(SW.ride){const c=SW.ride,A=av;A.g.position.y=c.g.position.y+c.m.seat*c.g.scale.y-(.46+A.legX)+(c.kind==='dolphin'?0:Math.max(0,p.y));}// the dolphin leaps with you, on the others you hop
  else if(SW.k>0){SW.sink=swimPose(av,SW.k,mv,SW.ph);av.g.position.y=p.y-SW.sink+Math.sin(t*2.2)*.03*SW.k;}
  // the animals
  if(!seaShown)return;
  SW.withNow={};for(const c of SEAS)seaAnimal(c,dt,t);
  for(const k in SW.withNow)SEA.with[k]=(SEA.with[k]||0)+dt;// once per kind, even with 3 dolphins
  if(started)seaButtons();
  // first swim
  if(seaSwimming()&&!SEA.swamOnce){SEA.swamOnce=1;persist();toast('🏊 You\'re swimming! Swim close to the dolphins 🐬');}}
onTick.push(seaStep);

function seaAnimal(c,dt,t){c.t+=dt;c.happy=Math.max(0,c.happy-dt);
  if(c.fixed){// Pip the seal: looks around, claps when she's happy
    const s=c.m;s.head.rotation.y=Math.sin(c.t*.7)*.5;s.head.rotation.x=-.2+Math.sin(c.t*1.3)*.08-(c.happy>0?.4:0);
    s.flip.forEach((f,i)=>{f.rotation.y=c.happy>0?(i?-1:1)*(.3+Math.sin(c.t*18)*.5):Math.sin(c.t*1.5+i)*.12;});
    s.g.position.y=.72+(c.happy>0?Math.abs(Math.sin(c.t*9))*.15:0);return;}
  const P=player.pos,K=c.K,dP=Math.hypot(P.x-c.pos.x,P.z-c.pos.z);
  // ridden: right under you
  if(SW.ride===c){c.mode='ride';const back=c.kind==='whale'?-1.4:c.kind==='dolphin'?.35:0;
    c.face=player.face;c.pos.set(P.x+Math.sin(c.face)*back,0,P.z+Math.cos(c.face)*back);
    const air=c.kind==='dolphin'?Math.max(0,P.y):0;c.y=air+(c.kind==='dolphin'?-.15:c.kind==='whale'?-.5:-.05);
    c.pitch=c.kind==='dolphin'&&air>.05?Math.max(-.6,Math.min(.6,player.vy*.09)):0;
    seaMoveAnim(c,dt,Math.min(1,player.speed/5));seaPlace(c);return;}
  // swim with you when you're swimming close by, otherwise go round the bay
  if(seaSwimming()&&!SW.ride&&dP<K.withR)c.mode='with';else if(c.mode!=='roam'&&(dP>K.withR+6||!seaSwimming()||SW.ride))c.mode='roam';
  let tx,tz,spd;
  if(c.mode==='with'){const f=player.face,[sx,sz]=c.slot;tx=P.x+Math.cos(f)*sx+Math.sin(f)*sz;tz=P.z-Math.sin(f)*sx+Math.cos(f)*sz;
    // stay in the bay
    const bd=Math.hypot(tx-BAY.x,tz-BAY.z),lim=BAY.r+(c.kind==='whale'?2:0);if(bd>lim){tx=BAY.x+(tx-BAY.x)/bd*lim;tz=BAY.z+(tz-BAY.z)/bd*lim;}
    spd=Math.min(9,.6+Math.hypot(tx-c.pos.x,tz-c.pos.z)*2.2);
    if(dP<K.near&&seaSwimming()){SW.withNow[c.kind]=1;
      if(!SW.hello[c.kind]){SW.hello[c.kind]=1;toast(c.kind==='dolphin'?'🐬 The dolphins are swimming with you!':c.kind==='whale'?'🐋 Big Blue is swimming with you!':'🐢 Shelly is swimming with you!');c.happy=1.5;}}}
  else{c.a+=dt*c.path.spd/((c.path.rx+c.path.rz)/2);[tx,tz]=seaPathAt(c,c.a);spd=c.path.spd+Math.hypot(tx-c.pos.x,tz-c.pos.z)*1.2;}
  const dx=tx-c.pos.x,dz=tz-c.pos.z,d=Math.hypot(dx,dz);let moving=0;
  if(d>.15){const st=Math.min(d,spd*dt);c.pos.x+=dx/d*st;c.pos.z+=dz/d*st;moving=st/dt;c.face=angDamp(c.face,Math.atan2(dx,dz),Math.min(1,dt*(c.kind==='whale'?1.2:3)));}
  else if(c.mode==='with')c.face=angDamp(c.face,player.face,Math.min(1,dt*2));
  // dolphins leap, the whale spouts
  c.y=c.kind==='dolphin'?-.18+Math.sin(c.t*2.6)*.06:c.kind==='whale'?-.55+Math.sin(c.t*.5)*.1:-.05+Math.sin(c.t*1.8)*.03;c.pitch=0;
  if(c.kind==='dolphin'){if(c.leap>0){c.leap+=dt/1.15;const q=Math.min(1,c.leap);c.y+=Math.sin(q*Math.PI)*1.7;c.pitch=Math.cos(q*Math.PI)*.75;
      if(q>=1){c.leap=0;seaSplash(c,14);}}
    else if((c.leapT-=dt)<0){c.leapT=(c.mode==='with'?4:5)+Math.random()*4;if(moving>1.5||c.happy>0){c.leap=.001;seaSplash(c,10);}}}
  if(c.kind==='whale'){if((c.spout-=dt)<0){c.spout=7+Math.random()*4;seaSpout(c);}
    if(c.happy>0){c.tailUp=Math.min(1,(c.tailUp||0)+dt*2);}else c.tailUp=Math.max(0,(c.tailUp||0)-dt);}
  seaMoveAnim(c,dt,Math.min(1,moving/4));seaPlace(c);}
function seaMoveAnim(c,dt,mv){const m=c.m;
  if(m.tail)m.tail.rotation.x=Math.sin(c.t*(c.kind==='whale'?1.4:5))*(c.kind==='whale'?.12:.3)*(.3+mv)-(c.tailUp||0)*.9;
  if(m.flip)m.flip.forEach(f=>{const o=c.t*(2+mv*3)+(f.front?0:Math.PI);f.p.rotation.z=f.sx*Math.sin(o)*(f.front?.5:.25);f.p.rotation.y=-f.sx*(.3+Math.cos(o)*.25);});
  if(m.head&&c.kind==='turtle')m.head.rotation.y=Math.sin(c.t*.8)*.25;}
function seaPlace(c){c.g.position.set(c.pos.x,WATER_Y+c.y,c.pos.z);c.g.rotation.y=c.face;c.g.rotation.x=-c.pitch;}
function seaSplash(c,n){burst(new THREE.Vector3(c.pos.x,WATER_Y+.1,c.pos.z),'#ffffff',n,2,.24);if(Math.hypot(player.pos.x-c.pos.x,player.pos.z-c.pos.z)<15)tone(300+Math.random()*120,.12,'sine',.06,0,140);}
function seaSpout(c){const b=c.m.blow.clone();c.g.localToWorld(b);burst(b,'#e8f8ff',34,2.6,.35);burst(b,'#ffffff',18,3.4,.25);
  const dP=player.pos.distanceTo(b);if(dP<30){SEA.spouts++;persist();if(dP<18)tone(220,.5,'sawtooth',.03,0,90);}}

/* ---------- 🐟 feed and 🏇 ride buttons ---------- */
{const st=document.createElement('style');st.textContent=`
#seaFeed,#seaRide{position:fixed;left:50%;transform:translateX(-50%);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5}
#seaFeed{bottom:calc(env(safe-area-inset-bottom) + 250px);background:linear-gradient(90deg,#4fb6ff,#2fb8a5);box-shadow:0 6px 18px rgba(47,184,165,.45)}
#seaRide{bottom:calc(env(safe-area-inset-bottom) + 310px);background:linear-gradient(90deg,#3a7bd5,#00a6c8);box-shadow:0 6px 18px rgba(0,120,200,.4)}
#seaRide.lock{background:linear-gradient(90deg,#9aa7b8,#7d8a9c);box-shadow:none}
#seaFeed:active,#seaRide:active{transform:translateX(-50%) scale(.94)}
body.dressing #seaFeed,body.dressing #seaRide,body.talking #seaFeed,body.talking #seaRide,body.shopping #seaFeed,body.shopping #seaRide{display:none!important}
@media (max-height:520px){#seaFeed{bottom:calc(env(safe-area-inset-bottom) + 130px)}#seaRide{bottom:calc(env(safe-area-inset-bottom) + 185px)}}`;
  document.head.appendChild(st);
  document.body.insertAdjacentHTML('beforeend','<button class="hud" id="seaFeed"></button><button class="hud" id="seaRide"></button>');}
let seaNear=null,seaBtnKey='';
function seaButtons(){const P=player.pos;let best=null,bd=1e9;
  if(SW.k>.3&&!closetOpen)for(const c of SEAS){if(SW.ride===c)continue;const d=Math.hypot(P.x-c.pos.x,P.z-c.pos.z)-c.K.reach;if(d<0&&d<bd){bd=d;best=c;}}
  seaNear=best;const rideC=best&&!SW.ride?SEA_RIDES.find(r=>r.kind===best.kind&&r.nm===best.nm):null;
  const key=(best?best.nm:'')+'|'+(SW.ride?SW.ride.nm:'')+'|'+(rideC?(seaOwns(rideC)?1:0):'');if(key===seaBtnKey)return;seaBtnKey=key;
  const f=$('#seaFeed'),r=$('#seaRide');
  if(best&&!SW.ride){f.textContent=`${best.K.food[0][0]} Feed ${best.nm}`;f.style.display='block';}else f.style.display='none';
  if(SW.ride){r.textContent=`${SW.ride.K.e} Hop off`;r.classList.remove('lock');r.style.display='block';}
  else if(rideC){const own=seaOwns(rideC);r.textContent=own?`${best.K.e} Ride ${best.nm}`:`🔒 Ride ${best.nm}`;r.classList.toggle('lock',!own);r.style.display='block';}
  else r.style.display='none';}
function seaFeed(c){if(!c)return;const K=c.K,fd=rnd(K.food);c.happy=c.kind==='whale'?2.4:1.6;
  const top=c.fixed?SEAL.rock.position.clone().add(new THREE.Vector3(0,1.6,0)):c.g.position.clone().add(new THREE.Vector3(0,c.kind==='whale'?1.6:.8,0));
  floaties(top,fd[0],4);setTimeout(()=>floaties(top,'💖',5),350);sfx('munch');
  if(c.kind==='dolphin'){c.leap=.001;seaSplash(c,12);tone(1500,.08,'sine',.08);tone(1900,.1,'sine',.07,.09);}
  if(c.kind==='whale'){seaSpout(c);setTimeout(()=>{const b=c.m.tail.getWorldPosition(new THREE.Vector3());burst(b.setY(WATER_Y+.2),'#ffffff',40,3.5,.35);sfx('splash');},900);}
  if(c.kind==='seal'){tone(330,.12,'square',.05);tone(300,.12,'square',.05,.18);}
  friendBubbleSea(c,rnd(K.say));toast(`${K.e} ${c.nm} loves the ${fd[1]}!`);did('seafeed',c.kind);}
// a little speech bubble over the animal (like the barn animals)
function friendBubbleSea(c,txt){const s=sprite(labelTex(txt,{size:44}),1.9,.48);const top=c.fixed?1.9:c.kind==='whale'?2.6:1.5;s.position.set(0,top,0);
  if(c.fixed)SEAL.rock.add(s);else c.g.add(s);s.scale.multiplyScalar(1/c.g.scale.x);setTimeout(()=>{s.parent&&s.parent.remove(s);s.material.dispose();if(s.material.map)s.material.map.dispose();},2200);}
$('#seaFeed').onclick=()=>{seaFeed(seaNear);};
$('#seaRide').onclick=()=>{if(SW.ride){seaHopOff();return;}const c=seaNear;if(!c)return;const r=SEA_RIDES.find(x=>x.kind===c.kind&&x.nm===c.nm);if(!r)return;
  if(!seaOwns(r)){sfx('pop');toast(`Finish all of ${r.nm}'s 🌊 Ocean challenges (in ⭐ challenges) to ride ${c.kind==='whale'?'him':'her'}!`);return;}
  seaHopOn(c);};
function seaHopOn(c){SW.ride=c;c.mode='ride';player.pos.x=c.pos.x;player.pos.z=c.pos.z;player.face=c.face;av.rideW=c.kind==='whale'?.6:c.kind==='turtle'?.35:.12;av.play('ride');
  sfx('tada');friendBubbleSea(c,rnd(c.K.say));toast(`Ride ${c.nm} around the bay! Tap Jump to ${c.kind==='dolphin'?'leap 🐬':'hop'}`);did('searide',c.kind);seaBtnKey='';}
function seaHopOff(quiet){const c=SW.ride;if(!c)return;SW.ride=null;c.mode='roam';av.rideW=0;if(av.emote&&av.emote.id==='ride')av.emote=null;
  // you slide off beside it
  const s=c.kind==='whale'?2.6:1.2;player.pos.x+=Math.cos(player.face)*s;player.pos.z-=Math.sin(player.face)*s;collide(player.pos);if(!quiet)sfx('pop');seaBtnKey='';}

/* ---------- earning the sea rides ---------- */
const seaOwns=r=>!!(SAVE.chal&&SAVE.chal.done&&r.ids.every(id=>SAVE.chal.done[id]));
setInterval(()=>{if(!started)return;for(const r of SEA_RIDES)if(!SEA.own[r.k]&&seaOwns(r)){SEA.own[r.k]=1;persist();
  banner(`🎉 You can ride ${r.nm}!`);sfx('tada');did('prize',r.k);setTimeout(()=>toast(`Swim up to ${r.nm} in 🐬 Dolphin Bay and tap Ride`),1900);seaBtnKey='';break;}},1500);
// a townsperson who'd live out in the bay lives on the Beach instead
for(const f of FRIENDS)if(f.home===BAY)f.home=Z.beach;
// for challenges.js (🌊 Ocean tab) and the tests
function seaState(){return {swum:Math.floor(SEA.swum),dolphin:Math.floor(SEA.with.dolphin||0),whale:Math.floor(SEA.with.whale||0),turtle:Math.floor(SEA.with.turtle||0),spouts:SEA.spouts||0};}
function seaRides(){return SEA_RIDES.map(r=>({k:r.k,kind:r.kind,e:SEA_KIND[r.kind].e,nm:r.nm,n:r.n,ids:r.ids,own:seaOwns(r)}));}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{seaState,seaRides,sea:()=>SW,SEAS,BAY,seaDepth,seaFeed,seaHopOn,seaHopOff,seaNear:()=>seaNear});});

/* ---------- 👭 friends online see you swimming, and on your sea ride ---------- */
SHOW.push({k:'sea',
  mine(){return SW.k>.05||SW.ride?{r:SW.ride?SW.ride.kind:''}:null;},
  on(f,d){const h={k:0,ph:0,lx:f.pos.x,lz:f.pos.z,mv:0,m:null};
    if(d.r&&SEA_BUILD[d.r]){const m=SEA_BUILD[d.r]();m.g.rotation.order='YXZ';m.kind=d.r;scene.add(m.g);h.m=m;}return h;},
  step(f,d,dt,h){const A=f.a;if(!A)return;const P=f.pos;
    h.k+=(seaDepth(P.x,P.z)-h.k)*Math.min(1,dt*6);
    const v=Math.hypot(P.x-h.lx,P.z-h.lz)/Math.max(dt,1e-3);h.lx=P.x;h.lz=P.z;h.mv+=(Math.min(1,v/5)-h.mv)*Math.min(1,dt*5);h.ph+=dt*(2.2+h.mv*4.2);
    if(h.m){const m=h.m,fc=f.cur??f.face,k=m.kind,back=k==='whale'?-1.4:k==='dolphin'?.35:0,air=k==='dolphin'?Math.max(0,P.y):0;
      const y=WATER_Y+air+(k==='dolphin'?-.15:k==='whale'?-.5:-.05);
      m.g.position.set(P.x+Math.sin(fc)*back,y,P.z+Math.cos(fc)*back);m.g.rotation.y=fc;
      if(m.tail)m.tail.rotation.x=Math.sin(h.ph*(k==='whale'?.4:1.4))*(k==='whale'?.12:.3);
      if(m.flip)m.flip.forEach(fl=>{const o=h.ph+(fl.front?0:Math.PI);fl.p.rotation.z=fl.sx*Math.sin(o)*(fl.front?.5:.25);});
      A.rideW=k==='whale'?.6:k==='turtle'?.35:.12;A.g.position.y=y+m.seat-(.46+A.legX)+(k==='dolphin'?0:Math.max(0,P.y));}
    else if(h.k>.01){A.g.position.y=P.y-swimPose(A,h.k,h.mv,h.ph);}},
  off(f,h){if(h&&h.m){scene.remove(h.m.g);freeObj(h.m.g);}if(f.a){f.a.rideW=0;}}});
