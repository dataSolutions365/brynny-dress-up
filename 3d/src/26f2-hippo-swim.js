/* ===== 🦛 Swimming with hippos in the water round the city =====
   - The zoo's hippo lives in the water just off the back of the Safari Zoo (HIPPO_WATER in 24d-barn.js), and comes up on the sand now and then.
   - waterAt(): how deep the water is (0 dry .. 1 deep) and where the top of it is (seaDepth and WATER_Y, 26f-ocean.js).
   - swimSink(): animals with swim (the hippo; swim = how high up its body the water comes) sink into deep water so only their
     back, eyes and ears stick out, and you sink with them when you ride. rideStep (24d-barn.js), the zoo (zooStep) and
     friends online (the 'ride' entry in 26c-friends-see.js) all use it. 🦛 Kiboko is the only barn ride that may go in the water (seaKeep).
   - The 🦁 Safari challenge "swim next to the hippo" counts seconds in SAVE.hipWith (hippoStep). The hippo model is in 24c9d-hippo.js. */
const WAT={k:0,y:0};
function waterAt(x,z){WAT.k=inCanal(x,z)?seaDepth(x,z):0;WAT.y=WAT.k>0?WATER_Y:0;return WAT;}

// a swimming animal sinks into deep water (and the rider A with it). P = where it is on the ground. Run it after its position is set.
// Returns how far into the water it is (0..1).
function swimSink(a,A,P,dt,mine){if(!a||!a.F.swim)return 0;const s=a.sw||(a.sw={k:0,splT:0,rip:null}),w=waterAt(P.x,P.z),sc=a.g.scale.y;
  s.k+=(w.k-s.k)*Math.min(1,dt*3);if(s.k<.002)s.k=0;
  const sink=s.k*(WATER_Y-a.F.swim*sc);a.g.position.y+=sink;if(A)A.g.position.y+=sink;
  // ripples round it on top of the water
  if(s.k>.25){if(!s.rip){s.rip=M(new THREE.RingGeometry(.75,.95,32),HIPM().rip,0,0,0,a.g,false,false);s.rip.rotation.x=-Math.PI/2;}
    const q=(performance.now()/1400)%1;s.rip.visible=true;s.rip.position.y=(WATER_Y+.02-a.g.position.y)/sc;s.rip.scale.setScalar(1+q*.6);}
  else if(s.rip)s.rip.visible=false;
  // splashes as you swim along
  if(mine&&s.k>.5&&player.speed>.5&&(s.splT-=dt)<0){s.splT=.45;const f=player.face;burst(new THREE.Vector3(P.x+Math.sin(f)*a.rad*1.4,WATER_Y+.08,P.z+Math.cos(f)*a.rad*1.4),'#ffffff',8,1.3,.18);}
  if(mine&&s.k>.5&&!s.inT){s.inT=1;sfx('splash');burst(new THREE.Vector3(P.x,WATER_Y+.1,P.z),'#ffffff',22,2.4,.3);if(!SAVE.hipSwam){SAVE.hipSwam=1;persist();toast(`🦛 ${a.F.nm||'The hippo'} is swimming! 💦`);}}
  if(s.k<.1)s.inT=0;
  return s.k;}

// seconds you swim right next to the zoo's hippo (a 🦁 Safari challenge)
let hipWithT=0;
function hippoStep(dt){if(!started||!seaSwimming())return;const h=ZA.find(a=>a.k==='hippo');if(!h)return;
  if(Math.hypot(player.pos.x-h.pos.x,player.pos.z-h.pos.z)<h.rad+2.6){SAVE.hipWith=(SAVE.hipWith||0)+dt;
    if((hipWithT+=dt)>5){hipWithT=0;persist();}if(!h.sayHi){h.sayHi=1;h.speak('*blub blub* 💦');toast('🦛 You\'re swimming with the hippo!');}}}
onTick.push(hippoStep);
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{waterAt,hipWith:()=>SAVE.hipWith||0,HIPPO_WATER,ZOO_SHORE});});
