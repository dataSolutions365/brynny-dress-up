/* ================= 🚲 BICYCLE and 🐎 HORSE (rides from the moves wheel) =================
   - 🚲 Bike: an extra you buy in the shop with ⭐ stars, in the closet's Extras like in the 2D studio (index.html).
     While you wear it, tap 🚲 Bike in the moves wheel to hop on and pedal around town: faster than walking,
     you keep rolling for a bit when you let go of the joystick, you lean into turns, and JUMP does a little bunny hop.
     Tap 🚲 Hop off to walk again.
   - 🐎 Horse: once you adopt a horse (or a pony, unicorn, donkey... any animal you can ride) at the Happy Barn, tap it in
     the moves wheel and it trots over to you wherever you are, so you can ride it around town (24d-barn.js does the riding).
     Before you have one, the button shows the way to the barn.
   Only barn animals made for riding can be ridden (never pets like dogs and cats).
   Both are put away during sports, contests and other hands-on games, the same as the skateboard. */
const BIKE={on:false,v:0,dir:0,lean:0,crank:0,spin:0,air:false,col:''};
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
function makeBike(){const g=new THREE.Group();g.visible=false;scene.add(g);
  const frame=phys('#ff6fae',{roughness:.3,clearcoat:1}),tire=std('#2d2d3a',{roughness:.9}),rim=phys('#e8e8ee',{metalness:.7,roughness:.25}),
    seat=std('#3a2a30',{roughness:.6}),grip=std('#ffffff',{roughness:.5}),bask=std('#d9a066',{roughness:.9});
  const R=.27,WB=.47,BB=[0,.3,.02];// wheel radius, half the wheelbase, where the pedals turn
  // a tube from one point to another
  const tube=(a,b,r=.022,m=frame)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),t=M(cyl(r,r,d.length(),10),m,0,0,0,g);
    t.position.copy(A).add(B).multiplyScalar(.5);t.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return t;};
  const wheels=[];
  for(const z of [-WB,WB]){const w=new THREE.Group();w.position.set(0,R,z);g.add(w);
    const ti=M(new THREE.TorusGeometry(R-.025,.03,10,32),tire,0,0,0,w);ti.rotation.y=Math.PI/2;
    const ri=M(new THREE.TorusGeometry(R-.06,.012,6,28),rim,0,0,0,w,false);ri.rotation.y=Math.PI/2;
    for(let i=0;i<6;i++){const s=M(cyl(.005,.005,(R-.06)*2,4),rim,0,0,0,w,false);s.rotation.x=i*Math.PI/6;}
    M(cyl(.03,.03,.06,12),rim,0,0,0,w,false).rotation.z=Math.PI/2;wheels.push(w);}
  const back=[0,R,-WB],front=[0,R,WB],seatP=[0,.6,-.14],head=[0,.66,.36],bb=BB;
  tube(back,bb);tube(back,seatP,.02);tube(bb,[0,.62,-.13],.026);tube(bb,head,.028);tube([0,.6,-.12],[0,.64,.34],.024);
  tube(head,front,.022);tube([0,.66,.36],[0,.86,.32],.024);// fork and steering post
  const bar=M(cyl(.018,.018,.46,10),frame,0,.86,.32,g);bar.rotation.z=Math.PI/2;
  for(const x of [-.21,.21])M(cyl(.024,.024,.08,10),grip,x,.86,.32,g).rotation.z=Math.PI/2;
  const sb=M(new RoundedBoxGeometry(.13,.04,.2,3,.018),seat,0,.635,-.15,g);
  // a little basket on the front with flowers in it
  M(new RoundedBoxGeometry(.24,.13,.16,2,.02),bask,0,.8,.47,g);
  for(const [x,c] of [[-.06,'#ff8fc8'],[0,'#ffd23f'],[.06,'#8fd8ff']])M(sph(.03,8,6),std(c),x,.88,.47,g,false);
  // the pedals go round with your feet
  const crank=new THREE.Group();crank.position.set(...bb);g.add(crank);M(cyl(.06,.06,.02,16),rim,0,0,0,crank).rotation.z=Math.PI/2;
  const pedals=[];for(const s of [-1,1]){const arm=M(box(.016,.15,.03),rim,s*.05,-s*.06,0,crank,false);const pd=M(box(.08,.02,.05),tire,s*.09,-s*.13,0,crank,false);pedals.push(pd,arm);}
  return {g,wheels,crank,frame,R};}
const BK=makeBike();

function bikeBusy(){return closetOpen||!started||handsBusy()||!!barnRide||!hasBike();}
function startBike(){if(BIKE.on||bikeBusy())return;if(SK.on)stopSkate(true);BIKE.on=true;BIKE.v=0;BIKE.dir=player.face;av.emote=null;
  sfx('pop');tone(880,.05,'triangle',.08);tone(1180,.06,'triangle',.08,.08);// ring ring!
  renderActions();did('bike');
  if(!SAVE.biked){SAVE.biked=1;persist();toast('🚲 Ride your bike anywhere in town! Tap JUMP to hop, tap 🚲 Hop off to walk');}}
function stopBike(quiet){if(!BIKE.on)return;BIKE.on=false;BIKE.v=0;av.biking=false;av.g.rotation.z=0;BK.g.visible=false;if(!quiet)sfx('pop');renderActions();}
function toggleBike(){if(BIKE.on)stopBike();else startBike();}
// sitting on the seat, feet going round on the pedals, hands on the handlebars
function bikePose(a,tgt,sp,air,t){const c=a===av?BIKE.crank:(a.bikeCrank||0);
  tgt.bob=-(a.hip-(.66+a.legX));tgt.lean=.32;tgt.sy=0;tgt.st=0;tgt.hy=0;tgt.hd=0;tgt.spin=0;tgt.l0z=tgt.l1z=0;
  tgt.l0=-1.05-Math.sin(c)*.38;tgt.k0=1.15+Math.sin(c)*.5;tgt.l1=-1.05+Math.sin(c)*.38;tgt.k1=1.15-Math.sin(c)*.5;tgt.an=.1;
  tgt.a0x=tgt.a1x=-1.05;tgt.a0z=.12;tgt.a1z=-.12;tgt.e0=tgt.e1=-.35;
  if(air){tgt.bob+=.05;tgt.l0=tgt.l1=-1.05;tgt.k0=tgt.k1=1.25;}}
anims.push((t,dt)=>{if(!started||!av)return;
  if(BIKE.on&&bikeBusy())stopBike(true);
  av.biking=BIKE.on;
  // the bike is the color you picked for it in the closet
  const col=hasBike()&&SAVE.look.extras.bicycle;if(col&&BIKE.col!==col){BIKE.col=col;BK.frame.color.set(col);}
  // in the closet it stands next to you so you can see it
  const parked=!BIKE.on&&hasBike()&&closetOpen&&$('#closet').classList.contains('show');BK.g.visible=BIKE.on||parked;
  if(parked){const f=player.face;BK.g.position.set(player.pos.x+Math.cos(f)*.75,player.pos.y,player.pos.z-Math.sin(f)*.75);BK.g.rotation.set(0,f+.5,0);BK.crank.rotation.x=.6;}
  if(!BIKE.on)return;
  // keep rolling after you let go of the joystick, slowing down little by little
  let ix=joy.x,iy=joy.y;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;if(keys.KeyW||keys.ArrowUp)iy-=1;if(keys.KeyS||keys.ArrowDown)iy+=1;
  const p=player.pos,pushing=Math.hypot(ix,iy)>.08;
  const turn=((player.face-BIKE.dir+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
  if(pushing){BIKE.v=player.speed;BIKE.dir=player.face;BIKE.crank+=dt*Math.min(9,player.speed*.9);}
  else if(BIKE.v>.15){BIKE.v*=Math.pow(.5,dt);const old=p.clone();p.x+=Math.sin(BIKE.dir)*BIKE.v*dt;p.z+=Math.cos(BIKE.dir)*BIKE.v*dt;collide(p);
    if(groundAt(p.x,p.z)-p.y>.45||p.distanceTo(old)<BIKE.v*dt*.3){p.x=old.x;p.z=old.z;BIKE.v=0;}player.speed=BIKE.v;}
  else BIKE.v=0;
  // wheels roll with how far you went, lean into turns
  const sp=pushing?player.speed:BIKE.v;BIKE.spin+=sp*dt/BK.R;for(const w of BK.wheels)w.rotation.x=BIKE.spin;BK.crank.rotation.x=BIKE.crank;
  BIKE.lean+=(Math.max(-.25,Math.min(.25,-turn/Math.max(dt,.001)*.01))-BIKE.lean)*Math.min(1,dt*6);
  av.g.position.copy(p);av.g.rotation.z=BIKE.lean;
  BK.g.position.copy(p);BK.g.rotation.set(0,player.face,0);BK.g.rotateZ(BIKE.lean);
  const air=!player.onGround;if(BIKE.air&&!air)tone(220,.05,'triangle',.05);BIKE.air=air;});

/* ---------- 🐎 call your horse (or any ride you own) from anywhere ---------- */
// the animal that comes when you call: the last one you rode, or else your horse, unicorn, pony... (riding: 24d-barn.js)
const STEED_ORDER=['horse','unicorn','pony','donkey','cow','trike','trex','longneck','kitty','crest','pegacorn','ptero','nova'];
function myRides(){const own=(SAVE.barn&&SAVE.barn.own)||{};return Object.keys(own).filter(k=>FK[k]&&FK[k].ride).sort((a,b)=>(STEED_ORDER.indexOf(a)+99)%99-(STEED_ORDER.indexOf(b)+99)%99);}
function mySteed(){const r=myRides();return r.includes(SAVE.barn&&SAVE.barn.steed)?SAVE.barn.steed:r[0]||null;}
// (the moves wheel is first drawn before the barn file has loaded, so skip the horse button until it has)
// with more than one ride (barn animals plus rides from the shop) the button says 🏇 Rides and opens a list to pick from (24g-mounts.js)
RIDE_ACTS.push(()=>{try{if(barnRide)return [['horse',barnRide.F.e,'Hop off']];if(myRides().length>1)return [['horse','🏇','Rides']];const k=mySteed();return [['horse',k?FK[k].e:'🐎',k?FK[k].n:'Horse']];}catch(e){return [];}});
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
  a.y=0;a.vy=0;a.face=player.face-BZ.rot;a.pos.set(P.x,P.y,P.z);a.g.position.copy(a.pos);
  startRide(a);}
