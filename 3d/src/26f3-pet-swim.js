/* ===== 🐶🏊 Pets swim with you =====
   Your pet follows you into the water (the 🌊 canal and the 💦 waterpark's pools) and swims next to you like a real dog would:
   its body sinks so only its back, neck and head stick out, nose up, legs doggy-paddling under the water, ripples round it.
   - petWater(): how deep the water is where a pet stands (0 dry .. 1 deep) and where the top of it is.
   - petSwim(): run after the pet's update (stepPet in 16-animals-pets.js, and friends' pets in the 'pet' entry of 26c-friends-see.js).
   - PET_SEA.on: set while a pet moves, so collide() (25-game-loop.js) lets it out into the canal (petSea) instead of keeping it on the sand. */
const PET_SEA={on:false};
// a pet may swim out into the canal while its owner is in the water (or while it's still swimming back to the shore)
function petSea(p){if(!PET_SEA.on||!bankReady)return false;const d=Math.hypot(p.x,p.z),lim=CANAL.outR-.5;if(d>lim){p.x*=lim/d;p.z*=lim/d;}return true;}
const PW={k:0,top:0};
// the waterpark's pools sit a little higher than the canal (WP_TOP in 26w-waterpark.js)
function petWater(x,z,y){PW.k=bankReady?seaDepth(x,z,y):0;PW.top=Math.hypot(x,z)<BANK.in?WATER_Y:WP_TOP;return PW;}
// is the owner at P out in the water? (in a tube on the lazy river counts too)
const ownerWet=(P,me)=>me?SW.k>.25||!!(WP.ride&&WP.ride.kind==='tube'):bankReady&&seaDepth(P.x+.003,P.z,P.y)>.25;
function petSwim(pt,dt,mine){const s=pt.swim||(pt.swim={k:0,ph:0,splT:0,rip:null,inT:0}),w=petWater(pt.pos.x,pt.pos.z,pt.pos.y+pt.y);
  s.k+=(w.k-s.k)*Math.min(1,dt*3);if(s.k<.003)s.k=0;
  const D=pt.D,sc=pt.body.scale.y,k=s.k;
  if(!k){if(s.was){s.was=0;pt.body.rotation.x=0;pt.head.rotation.x=pt.headX0;if(pt.tail)pt.tail.rotation.x=0;}if(s.rip)s.rip.visible=false;return 0;}
  s.was=1;const sp=Math.min(1,pt.speed/3);s.ph+=dt*(5+sp*7);
  // sink: the water comes up over the back, so the neck and head ride just above it
  const want=w.top-(D.leg+D.r*1.25)*sc+Math.sin(pt.t*2.4)*.01;pt.g.position.y+=(want-pt.g.position.y)*k;
  // nose up, chin up, the body lies flatter the faster it swims
  pt.body.rotation.x=-k*(.3-.1*sp);pt.body.position.y*=1-k;pt.head.rotation.x=pt.headX0-.18*k;
  // doggy paddle: front paws reach forward and pull down, back legs kick, in turn; slow and calm while just treading water
  const amp=.45+.35*sp;pt.legs.forEach(l=>{const o=s.ph+(l.sx>0?Math.PI:0)+(l.sz>0?0:Math.PI*.5),
    tgt=l.sz>0?-.75+Math.sin(o)*amp:.55+Math.sin(o)*amp*.8;l.lg.rotation.x+=(tgt-l.lg.rotation.x)*k;});
  if(pt.tail&&pt.kind==='dog')pt.tail.rotation.x=.5*k;// the tail floats out behind like a rudder
  // ripples round it on top of the water
  if(k>.25){if(!s.rip){s.rip=M(new THREE.RingGeometry(.8,1,32),HIPM().rip,0,0,0,pt.g,false,false);s.rip.rotation.x=-Math.PI/2;}
    const q=(performance.now()/1200)%1,sz=(D.len*.5+D.r)*sc*1.25;s.rip.visible=true;s.rip.position.y=w.top+.015-pt.g.position.y;s.rip.scale.setScalar(sz*(1+q*.5));}
  else if(s.rip)s.rip.visible=false;
  // a splash going in, and little splashes from the paws as it swims along
  if(mine&&k>.5&&!s.inT){s.inT=1;burst(new THREE.Vector3(pt.pos.x,w.top+.08,pt.pos.z),'#ffffff',12,1.6,.16);if(!SAVE.petSwam){SAVE.petSwam=1;persist();toast(`🐾 ${pt.name} is swimming with you! 💦`);}}
  if(k<.1)s.inT=0;
  if(mine&&k>.6&&pt.speed>.6&&(s.splT-=dt)<0){s.splT=.5;burst(new THREE.Vector3(pt.pos.x+Math.sin(pt.face)*.25,w.top+.04,pt.pos.z+Math.cos(pt.face)*.25),'#ffffff',5,.9,.1);}
  return k;}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{petWater,petSea,PET_SEA});});
