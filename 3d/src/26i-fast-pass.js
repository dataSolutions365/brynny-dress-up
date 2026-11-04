/* ================= 🎟️ FAST PASS: zip to any place in town ================= */
// A power you buy once in the shop's ⚡ Powers tab (with coins) and keep forever, like a fast pass at a theme park.
// Once it's yours, tapping a place on the 🗺️ map, or 📍 Go in the ⭐ Star Challenges (Places tab and every challenge), asks:
// 🎟️ Zip there now (you pop up at the front of that place in a puff of sparkles) or 🗺️ Show me the way (the pink arrow, as before).
// Your barn ride comes with you; a bike or skateboard does too, except into the water at 🐬 Dolphin Bay, where you swim.
// It's off during a 🛵 delivery rush, a 🚨 Round-up and while you're on a ladder, wall or zip line, so those stay fair,
// a ❄️ Polar escape, ice fishing, and in the 🚁 helicopter (you fly that yourself).
// Friends online just see you pop up somewhere else (they get your position as usual).
SHOP.push({k:'power:fastpass',tab:'powers',e:'🎟️',n:'Fast Pass',p:250,
  d:'Zip to any place in town in a puff of sparkles! Tap a place on the 🗺️ map (or 📍 Go on a challenge) and pick 🎟️ Zip there now. Buy it once, use it forever.'});
STABS.splice(1,0,['powers','⚡','Powers']);// right after Outfits, so it's easy to find
SHINT.powers='Powers are yours forever once you buy them.';
const hasFastPass=()=>owns('power:fastpass');
// where you pop up: the edge of the place on the side facing the plaza, where you'd walk in, so you're not inside a
// building or standing on one of its glowing pads (that would open the barn, the bakery and so on by itself)
function fpSpot(z){if(!z.d)return [0,z.r-1.2];// the Sparkle Studio is in the middle: stand south of the closet pad
  if(z.id==='bay')return [z.x,z.z];// right in the water with the dolphins
  const ux=-z.x/z.d,uz=-z.z/z.d;
  // places across the canal can reach out over the water: step in until you're on dry land
  for(let f=z.r-.4;f>0;f-=1){const x=z.x+ux*f,w=z.z+uz*f;if(seaDepth(x,w,0)<.3)return [x,w];}
  return [z.x,z.z];}
// why the pass can't be used right now (or '' when it can)
function fpBlocked(){if(DL.on)return 'No fast pass during a delivery rush! 🛵 Ride it there!';
  if(RU.on)return 'No fast pass during a Round-up! 🚨 Catch them the fun way!';
  if(ADS.mode)return 'Hold on tight until you get off! 🦺';
  if(HELI.on||HELI.ride)return 'Land the helicopter and hop out first! 🚁';
  if(PE.on)return 'No fast pass during a Polar escape! ❄️ Catch them the fun way!';
  if(ICF.on)return 'Reel in your line first! 🎣';
  if(WP.ride)return 'Finish your water ride first! 💦';
  if(handsBusy()||ct.on)return 'Finish what you are doing first ✨';return '';}
function fastTravel(z){const why=fpBlocked();if(why){toast(why);return false;}
  const p=player.pos;burst(p.clone().add(new THREE.Vector3(0,1,0)),'#ffd23f',40,3);sfx('star');
  if(FLY.on)flyEnd(true);// a flying ride comes down at the other end
  iceSkateOff();// skates come off when you leave the ice
  if(z.id==='bay'){if(BIKE.on)stopBike(true);if(SK.on)stopSkate(true);if(barnRide&&!barnRide.F.swim)stopRide(true);}
  const [x,w]=fpSpot(z);p.x=x;p.z=w;collide(p);HIGH.on=false;p.y=groundAt(p.x,p.z);player.vy=0;player.onGround=true;player.speed=0;
  player.face=z.d?Math.atan2(z.x,z.z):Math.PI;cam.yaw=player.face+Math.PI;cam.fv=null;// facing into the place
  setDest(null);did('fastpass',z.id);
  setTimeout(()=>{burst(player.pos.clone().add(new THREE.Vector3(0,1,0)),'#ff8fc8',50,3);sfx('tada');},60);
  return true;}
// the choice card: zip there, or follow the arrow
let fpZone=null;
function fastPassAsk(z){if(!hasFastPass())return false;fpZone=z;closeMap();
  $('#fpCard').innerHTML=`<div class="bigE">🎟️</div><h2>${z.name}</h2><p>Use your Fast Pass to zip there right now?</p>
    <button class="btn" data-fp="zip">🎟️ Zip there now!</button><button class="btn ghost" data-fp="walk">🗺️ Show me the way</button>`;
  $('#fp').classList.add('show');sfx('pop');return true;}
$('#fp').onclick=e=>{const b=e.target.closest('[data-fp]');if(e.target.id!=='fp'&&!b)return;$('#fp').classList.remove('show');const z=fpZone;fpZone=null;if(!b||!z)return;
  if(b.dataset.fp==='zip')fastTravel(z);
  else{setDest(z);sfx('star');toast(`Follow the pink arrow on the map to ${zLabel(z)} 💗`);}};
Object.assign(window.__game,{hasFastPass,fastPassAsk,fastTravel,mapW2s,mapLayout});
