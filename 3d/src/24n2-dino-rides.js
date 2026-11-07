/* ===== 🦴 The fossil dig at 🦖 Dino Valley, and what the 🦖 Dino challenges count (challenges.js reads G.dinoState()) =====
   - The dig is a sandy pit in the meadow (DV.dig, built in 12i-place-dino-valley.js). Wherever a fossil pokes out of the sand you
     can tap 🦴 Dig and dig it up: a T. rex tooth, a raptor feather, an ammonite... (FOSSILS), and now and then rare golden amber.
     A dug spot fills up again after DIG_REFILL seconds. did('fossil', kind).
   - It also counts the days you visit Dino Valley, how far you ride your dinosaurs (any FARM ride with dino:1) and which of the
     🏆 big dinosaurs (DINO_BIG, 24c9i-dinos-more.js) you've ridden. Saved in SAVE.dino. */
const DS=SAVE.dino||(SAVE.dino={});DS.dig||=0;DS.kinds||={};DS.days||={};DS.ride||=0;DS.big||={};
const FOSSILS=[['tooth','🦷','T. rex tooth'],['bone','🦴','dinosaur leg bone'],['ammonite','🐚','ammonite shell'],['egg','🥚','fossil dinosaur egg'],
  ['print','🐾','dinosaur footprint'],['feather','🪶','raptor feather'],['fern','🌿','fern fossil'],['horn','🦕','triceratops horn']];
const AMBER=['amber','🟠','piece of golden amber'],DIG_REFILL=40;
FLYK.draco={hz:1.1,amp:.6,base:.06,glide:.75,spd:15,tuckF:1.1,tuckB:1.2};// 🐉 Draco the great dragon: big slow wing beats
FLYK.dptero={hz:1,amp:.5,base:.04,glide:.85,spd:14,tuckF:1.15,tuckB:1.3};// 🪽 Zephyr flies like Sunny, with slower, bigger wing beats
// a fossil poking out of the sand at each spot (a bit of old bone), and a little heap of sand
const DIG={busy:0,spot:null,spots:DV.dig.spots.map(([x,z],i)=>{const g=new THREE.Group(),D=DV.dig;g.position.set(D.x+x,0,D.z+z);g.rotation.y=i*1.7;DZ.g.add(g);
  const bone=dnM('fossilBone',()=>std('#e9dcc0',{roughness:.85})),heap=dnM('fossilHeap',()=>std('#c9ab74',{roughness:1}));
  M(sph(.28,12,8),heap,0,0,0,g,false,true).scale.set(1,.28,1);
  const b=new THREE.Group();g.add(b);const s=M(new THREE.CapsuleGeometry(.05,.34,4,8),bone,0,.07,0,b);s.rotation.z=Math.PI/2-.25;
  for(const e of [-1,1])M(sph(.075,10,8),bone,e*.2,.07+e*.05,0,b,false,false).scale.set(.8,1,1.2);
  return {g,b,ready:true,t:0};})};
{document.body.insertAdjacentHTML('beforeend','<button class="hud" id="dinoDig">🦴 Dig for fossils</button>');
 const st=document.createElement('style');st.textContent=`
#dinoDig{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 310px);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5;background:linear-gradient(90deg,#c9a066,#8a6232);box-shadow:0 6px 18px rgba(138,98,50,.4)}
#dinoDig:active{transform:translateX(-50%) scale(.94)}
body.dressing #dinoDig,body.talking #dinoDig,body.shopping #dinoDig{display:none!important}
@media (max-height:520px){#dinoDig{bottom:calc(env(safe-area-inset-bottom) + 190px)}}`;
 document.head.appendChild(st);}
// the closest spot you can dig at (standing in or right next to the pit, on your own feet)
function digSpot(){if(!started||closetOpen||barnRide||FLY.on||DIG.busy)return null;const p=player.pos,[lx,lz]=DZ.toLocal(p.x,p.z),D=DV.dig;
  if(Math.hypot(lx-D.x,lz-D.z)>D.r+.7)return null;let best=null,bd=1e9;
  for(const s of DIG.spots){if(!s.ready)continue;const d=Math.hypot(lx-s.g.position.x,lz-s.g.position.z);if(d<bd){bd=d;best=s;}}return best;}
function dinoDig(){const s=digSpot();if(!s)return false;DIG.busy=1.4;DIG.spot=s;const [x,z]=DZ.toWorld(s.g.position.x,s.g.position.z);
  player.face=Math.atan2(x-player.pos.x,z-player.pos.z);player.speed=0;$('#dinoDig').style.display='none';sfx('pop');return true;}
$('#dinoDig').onclick=()=>dinoDig();
// what you find: the first one is always a tooth; after that any kind, and now and then rare golden amber
function digFind(){if(!DS.dig)return FOSSILS[0];if(Math.random()<.1)return AMBER;
  const left=FOSSILS.filter(f=>!DS.kinds[f[0]]);return left.length&&Math.random()<.5?rnd(left):rnd(FOSSILS);}
let dsSave=0,dsLast=null;
function dinoRideStep(dt){const p=player.pos;
  // digging: sand flies up, then the fossil comes out
  if(DIG.busy>0){DIG.busy-=dt;const s=DIG.spot,[x,z]=DZ.toWorld(s.g.position.x,s.g.position.z);player.speed=0;
    if(Math.random()<dt*7)burst(new THREE.Vector3(x,.15,z),'#d8bf8a',8,1.4,.08);
    if(DIG.busy<=0){DIG.busy=0;s.ready=false;s.t=DIG_REFILL;s.b.visible=false;const [k,e,n]=digFind();DS.dig++;DS.kinds[k]=1;persist();
      floaties(new THREE.Vector3(x,.6,z),e,5);banner(`${e} You dug up a ${n}!`);sfx('star');av.play('cheer');did('fossil',k);
      if(k==='amber')toast('✨ Super rare! Golden amber is tree sap that turned to stone millions of years ago.');}}
  for(const s of DIG.spots)if(!s.ready){s.t-=dt;if(s.t<=0){s.ready=true;s.b.visible=true;}}
  const sp=digSpot();$('#dinoDig').style.display=sp?'block':'none';
  // a visit today (inside the valley's fence)
  const [lx,lz]=DZ.toLocal(p.x,p.z);if(started&&Math.hypot(lx,lz)<DV.fence){const d=new Date(),k=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;if(!DS.days[k]){DS.days[k]=1;persist();}}
  // how far you ride your dinosaurs (steps = how far you go)
  if(barnRide&&barnRide.F.dino){if(dsLast){const d=Math.hypot(p.x-dsLast.x,p.z-dsLast.z);if(d<3){DS.ride+=d;dsSave+=d;if(dsSave>15){dsSave=0;persist();}}}dsLast={x:p.x,z:p.z};}else dsLast=null;}
anims.push((t,dt)=>{dinoRideStep(dt);});
addEventListener('brynny:did',e=>{const {k,a}=e.detail||{};if(k==='ride'&&DINO_BIG.includes(a)&&!DS.big[a]){DS.big[a]=1;persist();}});
function dinoState(){const big=Object.keys(DS.big).filter(k=>DINO_BIG.includes(k));
  return {dig:DS.dig,kinds:FOSSILS.filter(f=>DS.kinds[f[0]]).length,amber:DS.kinds.amber?1:0,days:Object.keys(DS.days).length,ride:Math.floor(DS.ride),
    big:big.length,bigNoPtero:big.filter(k=>k!=='dptero').length};}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{dinoState,dinoDig,digSpot,DIG,DINO_BIG});});
