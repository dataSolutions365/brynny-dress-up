/* ===== 🦖 Dino Valley: the dinosaurs that live there (the valley is 12i-place-dino-valley.js, the models 24c9h-dinos.js) =====
   - DVA are the valley's own dinosaurs: a T. rex in its paddock, three raptors in their pen, and a triceratops, a brachiosaurus and a
     stegosaurus (and their young) out in the meadow. They're not yours: like the zoo's animals they wander about, never follow you,
     and you walk up and tap 🦖 Meet to see their facts card (openZoo in 24d-barn.js), feed them and pet them (through the fence too).
   - Kid-safe: nobody chases, bites or attacks. The T. rex just lifts its head and roars now and then (24c9h-dinos.js).
   - The dinosaurs you adopt or buy (dino:1 in FARM) live here too, in the meadow, and the 🦖 footprint pad by the Dino Keeper's hut
     opens their care sheet (openBarn('dino') in 24d-barn.js). */
const DZ=Z.dino,DVA=[];
// [kind, size (1 = grown up), where it lives: m = meadow, t = T. rex paddock, r = raptor pen]
for(const [k,sc,at] of [['trexR',.82,'t'],['raptorR',1,'r'],['raptorR',.92,'r'],['raptorR',.85,'r'],['trikeR',1,'m'],['trikeR',.5,'m'],['longneckR',1,'m'],['longneckR',.5,'m'],['stegoR',1,'m']]){
  const a=new FarmAnimal(k);a.Z=DZ;a.mates=DVA;a.dust.forEach(d=>d.visible=false);
  if(at==='t'){a.ok=dvTOk;a.spot=dvTSpot;}else if(at==='r'){a.ok=dvROk;a.spot=dvRSpot;}else{a.ok=dvOk;a.spot=dvSpot;}
  if(sc!==1){a.g.scale.setScalar(sc);a.h*=sc;a.rad*=sc;a.size*=sc;if(sc<.7)a.baby=true;}
  [a.lx,a.lz]=a.spot(a.rad);DVA.push(a);scene.add(a.g);placeFarm(a);}
{document.body.insertAdjacentHTML('beforeend','<button class="hud" id="dinoMeet"></button>');
 const st=document.createElement('style');st.textContent=`
#dinoMeet{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom) + 250px);color:#fff;font-weight:700;font-size:18px;padding:12px 22px;border-radius:999px;display:none;white-space:nowrap;pointer-events:auto;border:0;z-index:5;background:linear-gradient(90deg,#8bbf5a,#4f7f2e);box-shadow:0 6px 18px rgba(79,127,46,.4)}
#dinoMeet:active{transform:translateX(-50%) scale(.94)}
body.dressing #dinoMeet,body.talking #dinoMeet,body.shopping #dinoMeet{display:none!important}
@media (max-height:520px){#dinoMeet{bottom:calc(env(safe-area-inset-bottom) + 130px)}}`;
 document.head.appendChild(st);}
let dinoNear=null;
function dinoStep(dt){const p=player.pos,near=Math.hypot(p.x-DZ.x,p.z-DZ.z)<55;
  for(const a of DVA){if(!near&&!(zooOpen&&a===zooSel)){a.g.visible=false;continue;}a.g.visible=true;stepFarm(a,dt);}
  // the 🦖 Meet button: walk up to one (the paddock ones from outside their fence)
  let best=null,bd=1e9;if(near&&!closetOpen&&started&&!barnRide&&!FLY.on)for(const a of DVA){const d=Math.hypot(p.x-a.pos.x,p.z-a.pos.z)-a.rad;if(d<(a.ok===dvOk?1.3:5)&&d<bd){bd=d;best=a;}}
  if(best!==dinoNear){dinoNear=best;const b=$('#dinoMeet');if(best){aniIco(b,best.F.e,'Meet',`Meet the ${best.baby?'young ':''}${best.F.n.replace(/ \(.*\)/,'')}`);b.style.display='block';}else b.style.display='none';}
  if(zooOpen&&zooSel&&DVA.includes(zooSel)&&Math.hypot(p.x-zooSel.pos.x,p.z-zooSel.pos.z)>10)closeZoo();}
$('#dinoMeet').onclick=()=>{if(dinoNear){const a=dinoNear;dinoNear=null;$('#dinoMeet').style.display='none';openZoo(a);}};
anims.push((t,dt)=>{if(started)dinoStep(dt);});
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{DVA,DV,DZ,dinoNear:()=>dinoNear});});
