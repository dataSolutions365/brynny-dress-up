/* ================= 🚲 BICYCLE and 🐎 HORSE (rides from the moves wheel) =================
   - 🚲 Bike: an extra you buy in the shop with ⭐ stars, in the closet's Extras like in the 2D studio (index.html).
     While you wear it, tap 🚲 Bike in the moves wheel to hop on and pedal around town: faster than walking,
     you sit on the saddle with your hands on the grips and your feet pedaling the cranks round (faster the faster you go),
     you coast with the pedals still when you let go of the joystick, the bike leans and the handlebars turn in turns,
     a foot comes down when you stop, and JUMP does a little bunny hop.
     Tap 🚲 Hop off to walk again.
   - 🐎 Horse: once you adopt a horse (or a pony, unicorn, donkey... any animal you can ride) at the Happy Barn, tap it in
     the moves wheel and it trots over to you wherever you are, so you can ride it around town (24d-barn.js does the riding).
     Before you have one, the button shows the way to the barn.
   Only barn animals made for riding can be ridden (never pets like dogs and cats).
   Both are put away during sports, contests and other hands-on games, the same as the skateboard. */
const BIKE={on:false,v:0,dir:0,lean:0,crank:0,spin:0,steer:0,stand:0,still:0,pedal:false,air:false,col:''};
const bikeBoost=()=>BIKE.on?1.7:1;
// "rideActs" are added to the front of the moves wheel (19-ui-closet.js); the horse one comes from the barn
const hasBike=()=>!!(SAVE.look&&SAVE.look.extras&&SAVE.look.extras.bicycle)&&owns('look:bicycle');
const RIDE_ACTS=[()=>hasBike()?[['bike','🚲',BIKE.on?'Hop off':'Bike']]:[]];
// in the closet's Extras (girls and guys), and in the shop for ⭐ stars; its color is the bike's color
EXTRAS.push(['bicycle','🚲','Bicycle','#ff6fae']);GUY_EXTRAS.push(['bicycle','🚲','Bicycle','#3a8dff']);
SHOP.push({k:'look:bicycle',tab:'outfits',e:'🚲',n:'Bicycle',stars:10,d:'Your own bike! Find it in Extras, then tap 🚲 Bike with your moves to ride it around town.'});
const rideActs=()=>RIDE_ACTS.flatMap(f=>f());

/* ---------- the bike model: chunky and cute like the rest of the town ---------- */
// makeBike() builds one; friends online get their own (26c-friends-see.js)
// It is a grown-up size so a rider's legs reach the pedals: the seat slides up or down to fit whoever rides it,
// the handlebars and front wheel turn when you steer, and the pedals stay flat under your feet as the cranks go round.
const BIKE_S=1.2,BIKE_GEAR=2.4;// how big the bike is, and how many times the back wheel turns for each turn of the pedals
function makeBike(){const g=new THREE.Group();g.visible=false;scene.add(g);
  // everything sits in "in": scaled up, and moved forward so the seat is right under the rider's hips
  const inn=new THREE.Group();inn.scale.setScalar(BIKE_S);inn.position.z=.17;g.add(inn);
  const frame=phys('#ff6fae',{roughness:.3,clearcoat:1}),tire=std('#2d2d3a',{roughness:.9}),rim=phys('#e8e8ee',{metalness:.7,roughness:.25}),
    seat=std('#3a2a30',{roughness:.6}),grip=std('#ffffff',{roughness:.5}),bask=std('#d9a066',{roughness:.9});
  const R=.27,WB=.47,BB=[0,.3,.02];// wheel radius, half the wheelbase, where the pedals turn
  // a tube from one point to another
  const tube=(a,b,r=.022,m=frame,par=inn)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),t=M(cyl(r,r,d.length(),10),m,0,0,0,par);
    t.position.copy(A).add(B).multiplyScalar(.5);t.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return t;};
  const wheel=(par,x,y,z)=>{const w=new THREE.Group();w.position.set(x,y,z);par.add(w);
    const ti=M(new THREE.TorusGeometry(R-.025,.03,10,32),tire,0,0,0,w);ti.rotation.y=Math.PI/2;
    const ri=M(new THREE.TorusGeometry(R-.06,.012,6,28),rim,0,0,0,w,false);ri.rotation.y=Math.PI/2;
    for(let i=0;i<6;i++){const s=M(cyl(.005,.005,(R-.06)*2,4),rim,0,0,0,w,false);s.rotation.x=i*Math.PI/6;}
    M(cyl(.03,.03,.06,12),rim,0,0,0,w,false).rotation.z=Math.PI/2;return w;};
  const back=[0,R,-WB],front=[0,R,WB],seatP=[0,.6,-.14],head=[0,.66,.36],bb=BB;
  tube(back,bb);tube(back,seatP,.02);tube(bb,[0,.62,-.13],.026);tube(bb,head,.028);tube([0,.6,-.12],[0,.64,.34],.024);
  // the seat on its post: slides up and down to fit the rider (bikeRide)
  const seatG=new THREE.Group();inn.add(seatG);
  tube([0,.5,-.125],[0,.64,-.145],.016,rim,seatG);M(new RoundedBoxGeometry(.13,.04,.2,3,.018),seat,0,.635,-.15,seatG);
  // the front: fork, front wheel, handlebars and basket all turn together around the head tube
  const axis=new THREE.Vector3(0,.66-R,-(.36-WB)).normalize(),steer=new THREE.Group();steer.position.set(...head);inn.add(steer);
  const rel=p=>[p[0]-head[0],p[1]-head[1],p[2]-head[2]];
  const wheels=[wheel(inn,...back),wheel(steer,...rel(front))];
  tube(rel(head),rel(front),.022,frame,steer);tube(rel(head),rel([0,.93,.31]),.024,frame,steer);
  M(cyl(.018,.018,.46,10),frame,...rel([0,.93,.31]),steer).rotation.z=Math.PI/2;
  const grips=[];for(const x of [-.21,.21]){M(cyl(.024,.024,.08,10),grip,...rel([x,.93,.31]),steer).rotation.z=Math.PI/2;const o=new THREE.Object3D();o.position.set(...rel([x,.93,.31]));steer.add(o);grips.push(o);}
  // a little basket on the front with flowers in it
  M(new RoundedBoxGeometry(.24,.13,.16,2,.02),bask,...rel([0,.85,.47]),steer);
  for(const [x,c] of [[-.06,'#ff8fc8'],[0,'#ffd23f'],[.06,'#8fd8ff']])M(sph(.03,8,6),std(c),...rel([x,.93,.47]),steer,false);
  // the cranks go round with your feet, and each pedal stays flat under your shoe
  const crank=new THREE.Group();crank.position.set(...bb);inn.add(crank);M(cyl(.06,.06,.02,16),rim,0,0,0,crank).rotation.z=Math.PI/2;
  const pedals=[];for(const s of [-1,1]){M(box(.016,.15,.03),rim,s*.05,-s*.06,0,crank,false);const pd=new THREE.Group();pd.position.set(s*.09,-s*.13,0);crank.add(pd);M(box(.08,.02,.05),tire,0,0,0,pd,false);pedals.push(pd);}
  return {g,inn,wheels,crank,pedals,grips,seatG,steer,axis,frame,R:R*BIKE_S,crankR:.13*BIKE_S,seatTop:.655*BIKE_S};}
const BK=makeBike();

/* ---------- riding it for real: bikeRide() puts the rider's body on the bike every frame ----------
   Hips on the saddle, hands on the grips, the balls of the feet on the pedals as they go round (the legs bend to
   follow them exactly), a little rock of the hips with each push, the body leaning forward more the faster you go,
   and when you stop, one foot comes down to the ground and the bike tips onto it.
   s is the ride: {crank, lean, steer, stand (0..1 foot down), air, v}. Used for you and for friends online. */
const BKR={v:new THREE.Vector3(),w:new THREE.Vector3(),u:new THREE.Vector3(),c:new THREE.Vector3(),n:new THREE.Vector3(),z:new THREE.Vector3(),
  m:new THREE.Matrix4(),inv:new THREE.Matrix4(),mh:new THREE.Matrix4(),ms:new THREE.Matrix4(),qp:new THREE.Quaternion(),q:new THREE.Quaternion(),q2:new THREE.Quaternion(),e:new THREE.Euler(),
  pv:[new THREE.Vector3(),new THREE.Vector3()],gv:[new THREE.Vector3(),new THREE.Vector3()],cc:new THREE.Vector3(),gr:new THREE.Vector3()};
// two-bone reach (thigh+shin or upper arm+forearm): bend toward "pole", returns the root's local turn and how much the middle joint bends
function reach2(J,T,a,b,pole,qParent,bendSign,out){const t=BKR.v.copy(T).sub(J);let d=t.length();d=Math.min((a+b)*.999,Math.max(Math.abs(a-b)+.001,d));t.normalize();
  const cb=Math.min(1,Math.max(-1,(a*a+d*d-b*b)/(2*a*d))),cg=Math.min(1,Math.max(-1,(a*a+b*b-d*d)/(2*a*b))),be=Math.acos(cb);
  const p=BKR.w.copy(pole).addScaledVector(t,-pole.dot(t)).normalize();
  const u=BKR.u.copy(t).multiplyScalar(Math.cos(be)).addScaledVector(p,Math.sin(be)).normalize();
  const c=BKR.c.copy(p).addScaledVector(u,-p.dot(u)).normalize();
  const n=bendSign>0?BKR.n.crossVectors(c,u):BKR.n.crossVectors(u,c);
  const ny=BKR.z.copy(u).negate(),nz=new THREE.Vector3().crossVectors(n,ny);
  BKR.m.makeBasis(n,ny,nz);out.q.setFromRotationMatrix(BKR.m);out.q.premultiply(BKR.q2.copy(qParent).invert());out.bend=bendSign*(Math.PI-Math.acos(cg));return out;}
const KNEE_POLE=[new THREE.Vector3(-.15,.3,1),new THREE.Vector3(.15,.3,1)],ELBOW_POLE=[new THREE.Vector3(-.6,-1,-.7),new THREE.Vector3(.6,-1,-.7)];
const BK_RX=new THREE.Vector3(1,0,0);
function bikeRide(a,bk,s,dt){if(!a||!a.legs||!bk)return;
  a.bikeW=Math.min(1,(a.bikeW||0)+dt*4);const W=a.bikeW;
  // where the bike's pedals, grips and cranks are, seen from the rider's body
  bk.steer.quaternion.setFromAxisAngle(bk.axis,s.steer||0);
  for(const p of bk.pedals)p.rotation.x=0;
  bk.g.updateMatrixWorld(true);a.g.updateMatrix();BKR.inv.copy(a.g.matrix).invert();
  const loc=(o,v)=>o.getWorldPosition(v).applyMatrix4(BKR.inv);
  const cc=loc(bk.crank,BKR.cc);
  const L=a.legs,A=a.arms,th=-L[0].kn.position.y,sh=-L[0].an.position.y,leg=th+sh;
  // the saddle goes to the height where your leg is nearly straight at the bottom of each push
  const fb=.15,ay=.014+.062*Math.cos(fb)+.045*Math.sin(fb),az=.062*Math.sin(fb)-.045*Math.cos(fb);
  const dx=Math.abs(bk.pedals[1].position.x*BIKE_S)-Math.abs(L[1].hp.position.x),dz=cc.z+az;
  const sitY=cc.y-bk.crankR+ay+Math.sqrt(Math.max(.01,(leg*.94)**2-dz*dz-dx*dx))-L[0].hp.position.y;
  bk.seatG.position.y=(sitY-.0975-bk.seatTop)/BIKE_S;
  // one foot down on the ground when stopped (the left one), the bike tipped onto that side
  const st=s.stand||0;let foot=null;
  if(st>.001){const P=BKR.gr.set(-.26,0,.14).applyMatrix4(a.g.matrix);P.y=a.g.position.y-(s.groundDrop||0)+.07;foot=P.applyMatrix4(BKR.inv);}
  const standY=foot?foot.y+Math.sqrt(Math.max(.01,(leg*.97)**2-(Math.abs(foot.x)-Math.abs(L[0].hp.position.x))**2-(foot.z-.1)**2))-L[0].hp.position.y:sitY;
  const v=s.v||0,ped=s.pedal?1:0;
  const hy=sitY+(s.air?.035:0)+(Math.min(sitY,standY)-sitY)*st,hz=.1*st;
  const rock=Math.sin(s.crank||0)*.035*ped*(1-st);
  const lean=(.42+Math.min(.12,v*.014))*(1-st)+.24*st;
  // hips and back
  const H=a.hips,SP=a.spine;
  H.position.set(H.position.x*(1-W),H.position.y+(hy-H.position.y)*W,H.position.z+(hz-H.position.z)*W);
  H.quaternion.slerp(BKR.q.setFromEuler(BKR.e.set(0,0,rock)),W);SP.quaternion.slerp(BKR.q.setFromEuler(BKR.e.set(lean,0,-rock*.6)),W);
  a.head.rotation.x=-lean*.55*W;a.head.rotation.z=-(s.lean||0)*.5*W;
  H.updateMatrix();SP.updateMatrix();BKR.mh.copy(H.matrix);BKR.ms.multiplyMatrices(BKR.mh,SP.matrix);
  const out={q:new THREE.Quaternion(),bend:0};
  // legs: balls of the feet on the pedals, toes dipping a little at the bottom and back of each turn
  BKR.qp.setFromRotationMatrix(BKR.mh);
  for(let i=0;i<2;i++){const l=L[i],sx=l.sx,pd=bk.pedals[sx<0?0:1];
    const P=loc(pd,BKR.pv[i]),psi=Math.atan2(P.z-cc.z,P.y-cc.y);let fp=.15-.15*Math.sin(psi);
    pd.rotation.x=fp-bk.crank.rotation.x;
    const T=BKR.gv[i].set(P.x,P.y+.014+.062*Math.cos(fp)+.045*Math.sin(fp),P.z+.062*Math.sin(fp)-.045*Math.cos(fp));
    if(foot&&sx<0){T.lerp(foot,st);fp*=1-st;}
    const J=l.hp.position.clone().applyMatrix4(BKR.mh);
    reach2(J,T,th,sh,KNEE_POLE[sx<0?0:1],BKR.qp,1,out);
    l.hp.quaternion.slerp(out.q,W);l.kn.quaternion.slerp(BKR.q.setFromAxisAngle(BK_RX,out.bend),W);
    // the foot's turn in the body = hips * hip * knee * ankle, so pick the ankle turn that gives the wanted toe dip
    BKR.q2.copy(BKR.qp).multiply(l.hp.quaternion).multiply(l.kn.quaternion).invert();l.an.quaternion.slerp(BKR.q2.multiply(BKR.q.setFromAxisAngle(BK_RX,fp)),W);}
  // arms: hands on the grips, elbows a little bent and pointing out
  BKR.qp.setFromRotationMatrix(BKR.ms);
  for(let i=0;i<2;i++){const ar=A[i],sx=ar.sx,g=bk.grips[sx<0?0:1];
    const T=loc(g,BKR.gv[i]),J=ar.sh.position.clone().applyMatrix4(BKR.ms);
    reach2(J,T,-ar.el.position.y,-ar.hand.position.y+.04*ar.hand.scale.x,ELBOW_POLE[sx<0?0:1],BKR.qp,-1,out);
    ar.sh.quaternion.slerp(out.q,W);ar.el.quaternion.slerp(BKR.q.setFromAxisAngle(BK_RX,out.bend),W);}}
// back to normal when you hop off
function bikeUnride(a){if(!a||!a.legs)return;a.bikeW=0;a.hips.position.z=0;a.head.rotation.x=0;
  for(const l of a.legs){l.hp.rotation.y=0;l.kn.rotation.y=l.kn.rotation.z=0;l.an.rotation.y=l.an.rotation.z=0;}
  for(const r of a.arms){r.sh.rotation.y=0;r.el.rotation.y=0;}}
// how the bike moves for one step: pedals turn with the back wheel while you pedal, spin free when you coast
// (and come round level, ready for the next push), the front wheel steers and you lean into turns like a real bike,
// and after you stop for a moment a foot comes down. Shared with friends online (26c-friends-see.js).
function bikeStep(s,bk,dt,v,pedal,yawRate,ground){
  s.v=v;s.pedal=pedal;s.spin+=v*dt/bk.R;for(const w of bk.wheels)w.rotation.x=s.spin;
  s.still=v<.15&&!pedal&&ground?(s.still||0)+dt:0;
  if(pedal)s.crank+=dt*v/bk.R/BIKE_GEAR;
  else{const want=s.still>.25?-Math.PI/2-.5:Math.PI/2,k=Math.PI*(s.still>.25?2:1);const tgt=want+Math.round((s.crank-want)/k)*k;s.crank+=(tgt-s.crank)*Math.min(1,dt*3);}
  bk.crank.rotation.x=s.crank;
  const lean=-Math.max(-.35,Math.min(.35,Math.atan(v*yawRate/9.8)*.8));
  s.stand=(s.stand||0)+((s.still>.25?1:0)-(s.stand||0))*Math.min(1,dt*(s.still>.25?3:8));
  s.lean+=((lean+.1*s.stand)-s.lean)*Math.min(1,dt*6);
  s.steer+=(Math.max(-.5,Math.min(.5,yawRate*.35/(1+v*.4)))-s.steer)*Math.min(1,dt*8);}

function bikeBusy(){return closetOpen||!started||handsBusy()||!!barnRide||!hasBike();}
function startBike(){if(BIKE.on||bikeBusy())return;if(SK.on)stopSkate(true);BIKE.on=true;BIKE.v=0;BIKE.dir=player.face;BIKE.stand=1;BIKE.still=1;BIKE.crank=-Math.PI/2-.5;av.emote=null;av.bikeW=0;
  sfx('pop');tone(880,.05,'triangle',.08);tone(1180,.06,'triangle',.08,.08);// ring ring!
  renderActions();did('bike');
  if(!SAVE.biked){SAVE.biked=1;persist();toast('🚲 Ride your bike anywhere in town! Tap JUMP to hop, tap 🚲 Hop off to walk');}}
function stopBike(quiet){if(!BIKE.on)return;BIKE.on=false;BIKE.v=0;av.biking=false;av.g.rotation.z=0;bikeUnride(av);BK.g.visible=false;if(!quiet)sfx('pop');renderActions();}
function toggleBike(){if(BIKE.on)stopBike();else startBike();}
// the walking pose while bikeRide() takes over (it sets the arms, legs, hips and back exactly every frame)
function bikePose(a,tgt,sp,air,t){tgt.lean=.42;tgt.sy=0;tgt.st=0;tgt.hy=0;tgt.hd=0;tgt.spin=0;tgt.l0z=tgt.l1z=0;tgt.hx=0;tgt.hr=0;tgt.sz=0;tgt.tilt=0;
  tgt.bob=-(a.hip-(.66+a.legX));tgt.l0=tgt.l1=-1.05;tgt.k0=tgt.k1=1.15;tgt.an=.1;tgt.a0x=tgt.a1x=-1.05;tgt.a0z=.12;tgt.a1z=-.12;tgt.e0=tgt.e1=-.35;}
anims.push((t,dt)=>{if(!started||!av)return;
  if(BIKE.on&&bikeBusy())stopBike(true);
  av.biking=BIKE.on;
  // the bike is the color you picked for it in the closet
  const col=hasBike()&&SAVE.look.extras.bicycle;if(col&&BIKE.col!==col){BIKE.col=col;BK.frame.color.set(col);}
  // in the closet it stands next to you so you can see it
  const parked=!BIKE.on&&hasBike()&&closetOpen&&$('#closet').classList.contains('show');BK.g.visible=BIKE.on||parked;
  if(parked){const f=player.face;BK.g.position.set(player.pos.x+Math.cos(f)*.85,player.pos.y,player.pos.z-Math.sin(f)*.85);BK.g.rotation.set(0,f+.5,0);BK.crank.rotation.x=.6;BK.steer.quaternion.identity();}
  if(!BIKE.on)return;
  // keep rolling after you let go of the joystick, slowing down little by little
  let ix=joy.x,iy=joy.y;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;if(keys.KeyW||keys.ArrowUp)iy-=1;if(keys.KeyS||keys.ArrowDown)iy+=1;
  const p=player.pos,pushing=Math.hypot(ix,iy)>.08;
  const turn=((player.face-BIKE.dir+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
  if(SKP.on){BIKE.v=player.speed;BIKE.dir=player.face;}// at the skate park, 24k-skate-park.js does the rolling
  else if(pushing){BIKE.v=player.speed;BIKE.dir=player.face;}
  else if(BIKE.v>.15){BIKE.v*=Math.pow(.5,dt);const old=p.clone();p.x+=Math.sin(BIKE.dir)*BIKE.v*dt;p.z+=Math.cos(BIKE.dir)*BIKE.v*dt;collide(p);
    if(groundAt(p.x,p.z)-p.y>.45||p.distanceTo(old)<BIKE.v*dt*.3){p.x=old.x;p.z=old.z;BIKE.v=0;}player.speed=BIKE.v;}
  else BIKE.v=0;
  const sp=pushing?player.speed:BIKE.v;
  bikeStep(BIKE,BK,dt,sp,SKP.on?SKP.push:pushing&&sp>.15,turn/Math.max(dt,.001),player.onGround);
  av.g.position.copy(p);av.g.rotation.z=BIKE.lean;
  BK.g.position.copy(p);BK.g.rotation.set(0,player.face,0);BK.g.rotateZ(BIKE.lean);
  const air=!player.onGround;if(BIKE.air&&!air)tone(220,.05,'triangle',.05);BIKE.air=air;
  bikeRide(av,BK,BIKE,dt);});

/* ---------- 🐎 call your horse (or any ride you own) from anywhere ---------- */
// the animal that comes when you call: the last one you rode, or else your horse, unicorn, pony... (riding: 24d-barn.js)
const STEED_ORDER=['horse','unicorn','pony','donkey','cow','trike','trex','longneck','kitty','crest','pegacorn','ptero','eagle','nova'];
function myRides(){const own=(SAVE.barn&&SAVE.barn.own)||{};return Object.keys(own).filter(k=>FK[k]&&FK[k].ride).sort((a,b)=>(STEED_ORDER.indexOf(a)+99)%99-(STEED_ORDER.indexOf(b)+99)%99);}
function mySteed(){const r=myRides();return r.includes(SAVE.barn&&SAVE.barn.steed)?SAVE.barn.steed:r[0]||null;}
// (the moves wheel is first drawn before the barn file has loaded, so skip the horse button until it has)
// with more than one ride (barn animals plus rides from the shop) the button says 🏇 Rides and opens a list to pick from (24g-mounts.js)
// the button shows a little picture of your real 3D animal once it's drawn (24d-barn.js), or its emoji until then
const ridePic=k=>FTHUMB[k]?`<img class="actPic" src="${FTHUMB[k]}" alt="">`:FK[k].e;
RIDE_ACTS.push(()=>{try{if(barnRide)return [['horse',ridePic(barnRide.k),'Hop off']];if(myRides().length>1)return [['horse','🏇','Rides']];const k=mySteed();return [['horse',k?ridePic(k):'🐎',k?FK[k].n:'Horse']];}catch(e){return [];}});
function toggleHorse(){if(barnRide){sfx('pop');stopRide();return;}
  if(closetOpen||!started)return;
  if(handsBusy()){toast('Finish what you are doing first, then saddle up! 🐎');return;}
  const k=mySteed();
  if(!k){setDest(Z.barn);sfx('star');toast('Adopt a horse at the 🐴 Happy Barn, or get a ride in the 🛍️ shop, then ride it anywhere! 💗');return;}
  if(myRides().length>1){openRides();return;}
  callSteed(k);}
function callSteed(k){if(barnRide||closetOpen||!started||handsBusy()||!BS.own[k]||!FK[k]||!FK[k].ride)return;
  if(BIKE.on)stopBike(true);if(SK.on)stopSkate(true);
  const a=farmAnimal(k),P=player.pos;
  // trot over from the barn with a puff of sparkles
  burst(new THREE.Vector3(P.x,P.y+.6,P.z),'#ffd23f',30,2);
  a.y=0;a.vy=0;a.face=player.face-a.Z.rot;a.pos.set(P.x,P.y,P.z);a.g.position.copy(a.pos);
  startRide(a);}
