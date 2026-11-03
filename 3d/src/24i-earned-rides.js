/* ================= 🏆 RIDES (AND OUTFITS) YOU EARN: special things you can't buy with stars or coins =================
   (the modern outfits you earn the same way are listed in 14d-fashion2-earned.js; they're given out here too)
   - 🐼 Bamboo the giant panda: play 3 days in a row.        🦁 Goldie the champion lion: win 3 contests or games.
   - 🦌 Comet the flying reindeer: play 7 days in a row.     🔥 Blaze the phoenix: win 10 contests or games.
   - A "win" is 1st place in the 👑 model contest, the 🎂 cake contest or the 🐾 pet contest, or beating Kai 1-on-1 at basketball.
   - A day counts once you start playing that day. Miss a day and the streak starts again at 1 (rides you already earned stay yours).
   - They show in the shop's 🦖 Rides tab and the ⭐🏆 challenges' 🏇 Rides tab with how close you are, and come to you by themselves.
   - 🦓 Kivu the okapi, 🐘 Tembo the elephant and 🦁 Jabari the lion: finish all of their super hard 🦁 Safari challenges
     (the Safari tab in ⭐🏆 challenges, challenges.js). They're the real-looking zoo animals with a saddle (24c9b-safari-rides.js).
   - 🦍 Zuri the gorilla and 🦛 Kiboko the hippo are earned the same way. Kiboko swims (swim: 26f2-hippo-swim.js) in the water
     round the city, the only barn ride that may go in it.
   - Once earned they work like the shop rides (24g-mounts.js): they live at the 🐴 Happy Barn and Comet and Blaze can fly (24h-flying.js).
   The FARM entries and the models below are function declarations so 24d-barn.js can use them before this file runs
   (it adds the entries to FARM and builds the models from FarmAnimal.build). Friends online see them through the 'ride' entry. */
function earnedRideList(){return [
  {k:'panda',e:'🐼',n:'Giant panda',nm:'Bamboo',earn:{by:'days',goal:3},ride:1.08,about:'A big cuddly panda who only comes to players who play 3 days in a row. Slow, soft and always munching bamboo!',food:[['🎋','Bamboo'],['🍎','Apple'],['🍠','Sweet potato']],say:['*munch munch* 🎋','Hug time! 🐼','*happy roly-poly*']},
  {k:'goldlion',e:'🦁',n:'Champion lion',nm:'Goldie',earn:{by:'wins',goal:3},ride:1.13,about:'A golden lion with a royal crown, only for champions who win 3 contests or games!',food:[['🍖','Meat'],['🍗','Drumstick'],['🐟','Fish']],say:['ROAR! 👑','*proud mane shake*','Champions ride together! 🏆']},
  {k:'comet',e:'🦌',n:'Flying reindeer',nm:'Comet',earn:{by:'days',goal:7},fly:1,ride:1.15,about:'A magic reindeer with a glowing red nose who flies without wings! Only for players who play 7 days in a row.',food:[['🥕','Carrot'],['🍪','Cookie'],['🍎','Apple']],say:['*jingle jingle* 🔔','Up to the stars! ✨','*nose glows bright* ❤️']},
  // 🦁 safari rides: real-looking animals from the Safari Zoo, for players who finish every one of their super hard 🦁 Safari challenges
  // (challenges.js, ids in earn.ids). model = the zoo animal to build (zoo = which Safari Zoo animal it is, when that's different), gear = a saddle, seat = sit this far forward, wide = legs spread, boost = speed.
  {k:'kivu',e:'🌿',n:'Okapi',nm:'Kivu',model:'okapi',gear:1,safari:1,scale:1.2,earn:{by:'chal',ids:['saf_feed5','saf_win5','saf_days5'],goal:3},ride:1.57,boost:1.75,about:'A shy forest okapi with zebra-striped legs and a velvet coat. Only for safari explorers who finish all 3 of her 🦁 Safari challenges!',food:[['🍃','Leaves'],['🍌','Banana'],['🍄','Mushroom']],say:['*soft huff*','*long tongue lick* 👅','To the rainforest! 🌿']},
  {k:'tembo',e:'🐘',n:'African elephant',nm:'Tembo',model:'elephant',gear:1,safari:1,seat:.66,wide:.55,earn:{by:'chal',ids:['saf_triple','saf_win15','saf_days10'],goal:3},ride:2.2,boost:1.55,about:'A giant African elephant. You sit up on his neck, way up high! Only for champions who finish all 3 of his 🦁 Safari challenges.',food:[['🌾','Hay'],['🍉','Watermelon'],['🍌','Bananas']],say:['PAWOOO! 🎺','*happy ear flap*','*trunk hug* 💖']},
  {k:'jabari',e:'🦁',n:'Lion',nm:'Jabari',model:'lion',gear:1,safari:1,scale:1.15,earn:{by:'chal',ids:['saf_kai5','saf_win30','saf_stars100','saf_days14'],goal:4},ride:1.38,boost:2.05,about:'The king of the savanna: a real lion with a thick dark mane, and the fastest ride in town. Only for legends who finish all 4 of his 🦁 Safari challenges!',food:[['🍖','Meat'],['🍗','Drumstick'],['🥩','Steak']],say:['ROOOAR! 🦁','*proud mane shake*','*deep rumbly purr*']},
  // more safari rides (models in 24c9c-safari-more.js): a zebra, a rhino and a giraffe to ride, and a crowned crane that flies
  {k:'punda',e:'🦓',n:'Zebra',nm:'Punda',model:'zebraR',zoo:'zebra',gear:1,safari:1,earn:{by:'chal',ids:['saf_stars24','saf_win8','saf_days7'],goal:3},ride:1.26,boost:1.9,about:'A real plains zebra with bold black and white stripes. Only for explorers who finish all 3 of her 🦁 Safari challenges!',food:[['🌾','Hay'],['🥕','Carrot'],['🍏','Apple']],say:['*happy whinny bark*','*stripe shake*','Gallop time! 🦓']},
  {k:'kifaru',e:'🦏',n:'White rhino',nm:'Kifaru',model:'rhinoR',zoo:'rhino',gear:1,safari:1,earn:{by:'chal',ids:['saf_car3','saf_best3','saf_win20'],goal:3},ride:1.34,boost:1.65,about:'A huge, gentle white rhino with a big horn and wrinkly skin. Only for players who finish all 3 of his 🦁 Safari challenges!',food:[['🌾','Hay'],['🍎','Apple'],['🥬','Lettuce']],say:['*big happy huff*','Hrrumph! 🦏','*stomp stomp*']},
  {k:'neema',e:'🕊️',n:'Crowned crane',nm:'Neema',model:'craneR',gear:1,safari:1,fly:1,scale:1.35,earn:{by:'chal',ids:['saf_model5','saf_cake5','saf_pet5'],goal:3},ride:1.86,boost:1.8,about:'A giant grey crowned crane with a golden crown of feathers. Tap 🪽 Fly to soar over the island! Only for champions who finish all 3 of her 🦁 Safari challenges.',food:[['🌾','Seeds'],['🐛','Bugs'],['🐟','Little fish']],say:['*honk-ka-wonk!*','*crown fluff*','Up we go! ☁️']},
  {k:'twiga',e:'🦒',n:'Giraffe',nm:'Twiga',model:'giraffeR',zoo:'giraffe',gear:1,safari:1,earn:{by:'chal',ids:['saf_kai10','saf_stars150','saf_days21'],goal:3},ride:1.8,boost:1.95,about:'The tallest animal in the world! Ride way up high on a real giraffe. Only for true legends who finish all 3 of her 🦁 Safari challenges.',food:[['🌿','Acacia leaves'],['🥬','Lettuce'],['🍎','Apple']],say:['*long tongue lick* 👅','Hello down there!','*gentle hum*']},
  // the big zoo animals: ride the gorilla, and a hippo who swims with you (in the zoo's hippo pool and out in 🐬 Dolphin Bay)
  {k:'zuri',e:'🦍',n:'Gorilla',nm:'Zuri',model:'gorilla',gear:1,safari:1,scale:1.25,earn:{by:'chal',ids:['saf_feedG','saf_meet8','saf_win12'],goal:3},ride:1.62,boost:1.8,about:'A mighty silverback gorilla who gives you a ride on his back as he knuckle-walks! Only for explorers who finish all 3 of his 🦁 Safari challenges.',food:[['🍌','Banana'],['🌿','Leaves'],['🎋','Bamboo shoots']],say:['*chest pat pat* 🦍','*happy rumbly grunt*','Hold on tight!']},
  {k:'kiboko',e:'🦛',n:'Hippo',nm:'Kiboko',model:'hippo',gear:1,safari:1,swim:.85,earn:{by:'chal',ids:['saf_feedH','saf_hipswim','saf_sea300'],goal:3},ride:1.11,boost:1.6,about:'A huge, happy hippo who swims with you on her back! Ride her right into the water and swim all the way round the city! Only for swimmers who finish all 3 of her 🦁 Safari challenges.',food:[['🍉','Watermelon'],['🌾','Grass'],['🥬','Lettuce']],say:['*big hippo yawn* 🦛','*blub blub* 💦','Splash time!']},
  // the big cats: the fastest ride in town, and the biggest cat in the world
  {k:'duma',e:'🐆',n:'Cheetah',nm:'Duma',model:'cheetah',gear:1,safari:1,scale:1.35,earn:{by:'chal',ids:['saf_feedC','saf_kai3','saf_days8'],goal:3},ride:1.34,boost:2.45,about:'The fastest animal on land! Hold on tight, Duma sprints faster than any other ride. Only for speedy explorers who finish all 3 of her 🦁 Safari challenges.',food:[['🍖','Meat'],['🥩','Steak'],['🍗','Drumstick']],say:['*chirp chirp*','Ready, set, ZOOM! 💨','*soft purr*']},
  {k:'raja',e:'🐅',n:'Tiger',nm:'Raja',model:'tiger',gear:1,safari:1,scale:1.1,earn:{by:'chal',ids:['saf_feedT','saf_win25','saf_stars120'],goal:3},ride:1.2,boost:2.1,about:'A huge Bengal tiger with bold black stripes. The biggest cat in the world, and he lets you ride on his back! Only for champions who finish all 3 of his 🦁 Safari challenges.',food:[['🍖','Meat'],['🐟','Fish'],['🥩','Steak']],say:['*friendly chuff chuff*','RAWRR! 🐅','*big stretch*']},
  {k:'phoenix',e:'🔥',n:'Phoenix',nm:'Blaze',earn:{by:'wins',goal:10},fly:1,wingsRun:1,ride:1.12,about:'A legendary fire bird with glowing golden feathers. Only for super champions who win 10 contests or games!',food:[['🌶️','Hot pepper'],['🍒','Cherries'],['🌻','Sunflower seeds']],say:['*sparkly whoosh* 🔥','Skreee! ✨','Let\'s light up the sky!']},
];}

// the models (called from FarmAnimal.build with this = the animal). Returns true when it built one.
function earnedRideModel(k,{g,body,o,horseLike}){
  // 🐼 a round, fuzzy panda: black legs, shoulder band, ears and eye patches
  if(k==='panda'){const r=.42,len=.5,leg=.36,by=leg+r*.62,wh=fm('#f7f5ef',{roughness:1}),bl=fm('#2a2a33',{roughness:1});
    body.position.y=by;const t=M(fuzz(new THREE.CapsuleGeometry(r,len,10,24),.015,30),wh,0,0,0,body);t.rotation.x=Math.PI/2;
    const band=M(new THREE.CylinderGeometry(r*1.04,r*1.04,.22,28,1,true),bl,0,0,len*.22,body);band.rotation.x=Math.PI/2;band.material=bl.clone();band.material.side=THREE.DoubleSide;
    fLegs(this,g,r*.58,len*.42,leg+.06,leg+.06,.14,bl,null);
    for(const l of this.legs)M(sph(.15,12,10),bl,0,-(leg+.06)+.07,.03,l.g).scale.set(1,.6,1.2);// big soft paws
    const neck=new THREE.Group();neck.position.set(0,by+r*.35,len/2+r*.55);neck.rotation.x=.3;g.add(neck);M(sph(.3,16,12),wh,0,.05,0,neck);
    const head=new THREE.Group();head.position.set(0,.24,.06);head.rotation.x=-.3+.1;neck.add(head);const H=.32;
    M(fuzz(sph(H,24,18),.01,40),wh,0,0,0,head).scale.set(1.12,.96,.96);
    for(const sx of [-1,1]){M(sph(H*.3,12,10),bl,sx*H*.74,H*.74,-H*.1,head).scale.set(1,1,.6);
      const p=M(sph(H*.27,14,10),bl,sx*H*.38,H*.06,H*.78,head,false,false);p.scale.set(.85,1.15,.5);p.rotation.z=sx*.55;}
    fEyes(this,head,H,.38,.1,.9,.38,.19);
    M(sph(H*.42,14,10),wh,0,-H*.32,H*.78,head).scale.set(1.2,.78,.8);
    M(sph(H*.11,10,8),bl,0,-H*.17,H*1.1,head,false,false).scale.set(1.4,.8,.7);
    fBlush(head,H,.68,-.28,.72);
    const tail=new THREE.Group();tail.position.set(0,by+r*.2,-(len/2+r*.9));g.add(tail);M(sph(.1,10,8),wh,0,0,0,tail);
    Object.assign(o,{neck,head,tail,nTilt:.3,size:1.1,h:by+.85,rad:.7,dustR:[r,r,len*.8]});return true;}
  // 🦁 a golden lion with a big fluffy mane and a little royal crown
  if(k==='goldlion'){const r=.36,len=.62,leg=.5,by=leg+r*.65,fur=fm('#f2b54a'),light=fm('#ffe4ad'),mane=fm('#c8682a',{roughness:1}),mane2=fm('#e88a35',{roughness:1}),
      gold=fShiny('#ffd23f',{metalness:.6,roughness:.25}),gem=phys('#ff4d8d',{roughness:.1,clearcoat:1,emissive:'#ff4d8d',emissiveIntensity:.3});
    body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,8,22),fur,0,0,0,body);t.rotation.x=Math.PI/2;M(sph(r*.8,14,10),light,0,-r*.32,len*.1,body).scale.set(.92,.72,1.3);
    fLegs(this,g,r*.55,len*.45,leg+.05,leg+.05,.1,fur,null);
    for(const l of this.legs)M(sph(.12,12,10),light,0,-(leg+.05)+.06,.03,l.g).scale.set(1,.6,1.25);
    const neck=new THREE.Group();neck.position.set(0,by+r*.4,len/2+r*.45);neck.rotation.x=.5;g.add(neck);
    M(sph(.26,16,12),fur,0,.05,0,neck);fFluff(neck,mane2,.3,.3,.26,26,.12,.05,-.02);
    const head=new THREE.Group();head.position.set(0,.24,.06);head.rotation.x=-.5+.1;neck.add(head);const H=.28;
    M(sph(H,22,16),fur,0,0,0,head).scale.set(1.05,.95,1);
    fFluff(head,mane,H*1.25,H*1.25,H*.6,48,H*.32,0,-H*.3);
    for(const sx of [-1,1])M(sph(H*.25,12,10),fur,sx*H*.66,H*.8,-H*.02,head).scale.set(1,1,.5);
    M(sph(H*.42,14,10),light,0,-H*.3,H*.78,head).scale.set(1.25,.75,.8);
    M(sph(H*.12,10,8),std('#7a3a22'),0,-H*.1,H*1.06,head,false,false).scale.set(1.3,.8,.7);
    fEyes(this,head,H,.42,.12,.82,.38,.22,'#8a5a12');fBlush(head,H,.64,-.18,.74);
    const crown=new THREE.Group();crown.position.set(0,H*1.12,-H*.05);head.add(crown);
    M(cyl(H*.36,H*.32,H*.2,18),gold,0,0,0,crown);
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;M(new THREE.ConeGeometry(H*.08,H*.24,8),gold,Math.sin(a)*H*.34,H*.2,Math.cos(a)*H*.34,crown);}
    M(sph(H*.075,10,8),gem,0,0,H*.35,crown,false,false);
    const tail=new THREE.Group();tail.position.set(0,by+r*.3,-(len/2+r*.85));g.add(tail);
    taperTube([fV(0,0,0),fV(0,-.12,-.3),fV(0,-.08,-.6),fV(0,.1,-.8)],q=>.05-.018*q,fur,tail,16,8);M(sph(.1,10,8),mane,0,.13,-.83,tail);
    this.sparkle=true;
    Object.assign(o,{neck,head,tail,nTilt:.5,size:1.05,h:by+.9,rad:.65,dustR:[r,r,len*.8]});return true;}
  // 🦌 a reindeer with big antlers, a glowing red nose and a jingle bell (she flies without wings, it's magic)
  if(k==='comet'){const h=horseLike(1,'#a8744a','#f4ede4',{light:'#f3e2cc',hoof:'#4a3324'}),H=h.H,antM=fShiny('#f6e7c8',{roughness:.5});
    for(const sx of [-1,1]){taperTube([fV(sx*H*.3,H*.7,-H*.1),fV(sx*H*.7,H*1.5,-H*.3),fV(sx*H*1,H*2.3,-H*.2),fV(sx*H*1.2,H*2.9,H*.1)],q=>H*(.1-.055*q),antM,h.head,16,8);
      taperTube([fV(sx*H*.62,H*1.35,-H*.28),fV(sx*H*.5,H*1.9,H*.3)],q=>H*(.065-.035*q),antM,h.head,8,6);
      taperTube([fV(sx*H*.95,H*2.2,-H*.2),fV(sx*H*.72,H*2.7,H*.4)],q=>H*(.06-.03*q),antM,h.head,8,6);}
    M(sph(H*.2,14,10),phys('#ff3b3b',{emissive:'#ff2020',emissiveIntensity:1.2,roughness:.25,clearcoat:1}),0,-H*.28,H*1.84,h.head,false,false);
    M(new THREE.TorusGeometry(.13,.028,8,20),phys('#d6453d',{roughness:.5}),0,.07,0,h.neck).rotation.x=Math.PI/2;
    M(sph(.055,12,10),fShiny('#ffd23f',{metalness:.6,roughness:.25}),0,.03,.15,h.neck);
    const spot=fm('#fff7ec');for(let i=0;i<7;i++)M(sph(.035,8,6),spot,Math.sin(i*2.2)*.16,.27,(i/6-.5)*.5,body,false,false).scale.set(1,.4,1);
    this.sparkle=true;return true;}
  // 🔥 a phoenix: a fire bird with glowing feather wings, a feathery crest and a long flowing tail
  if(k==='phoenix'){const by=.8,red=phys('#ff5a3c',{roughness:.5,sheen:.6,sheenColor:new THREE.Color('#ffd27a'),emissive:'#ff3a10',emissiveIntensity:.12}),belly=fm('#ffc24a'),
      gold=fShiny('#ffd23f',{metalness:.4,roughness:.3}),tips=[fm('#ffd23f',{emissive:'#ffb000',emissiveIntensity:.35}),fm('#ff8a2a',{emissive:'#ff6a00',emissiveIntensity:.25}),fm('#ff4d6d',{emissive:'#ff2a50',emissiveIntensity:.2})];
    body.position.y=by;M(sph(.4,24,18),red,0,0,0,body).scale.set(.85,.8,1.25);M(sph(.3,16,12),belly,0,-.12,.2,body).scale.set(.9,.8,1.1);
    this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*.28,.16,.06);body.add(w);const up=new THREE.Group();up.rotation.z=sx*.4;w.add(up);
      for(let i=0;i<7;i++){const L=.75-i*.06,p=new THREE.Group();p.position.z=-i*.065;p.rotation.y=sx*i*.12;up.add(p);
        const f=M(new THREE.CapsuleGeometry(.07,L,4,10),i<2?red:tips[i%3],sx*(L/2+.05),0,0,p,true,false);f.rotation.z=Math.PI/2;f.scale.set(.35,1,1);}
      M(sph(.1,10,8),red,0,0,-.15,up,true,false).scale.set(1,.6,1.8);this.wings.push({w,sx,fly:1});}
    for(const [sx,ph] of [[-1,0],[1,Math.PI]]){const lg=new THREE.Group();lg.position.set(sx*.15,.55,-.02);g.add(lg);M(capTop(.045,.46),gold,0,0,0,lg);
      M(sph(.07,10,8),gold,0,-.53,.05,lg).scale.set(1,.4,1.6);this.legs.push({g:lg,ph});}
    const neck=new THREE.Group();neck.position.set(0,by+.18,.38);neck.rotation.x=.2;g.add(neck);
    taperTube([fV(0,0,0),fV(0,.18,.04),fV(0,.32,0)],q=>.13-.03*q,red,neck,12,10);
    const head=new THREE.Group();head.position.set(0,.36,.02);head.rotation.x=-.2;neck.add(head);const H=.2;
    M(sph(H,22,16),red,0,0,0,head).scale.set(.95,.95,1.05);
    const bk=M(new THREE.ConeGeometry(H*.32,H*.9,14),gold,0,-H*.12,H*1.2,head);bk.rotation.x=Math.PI/2;bk.scale.set(.8,1,1);
    for(let i=0;i<4;i++){const s=(i-1.5);taperTube([fV(0,H*.7,-H*.1),fV(s*H*.12,H*1.4,-H*.5),fV(s*H*.25,H*1.9,-H*1.1)],q=>H*(.09-.07*q),tips[i%3],head,12,6);}
    fEyes(this,head,H,.5,.2,.66,.6,.24,'#7a3a12');fBlush(head,H,.62,-.15,.72);
    const tail=new THREE.Group();tail.position.set(0,by+.05,-.45);g.add(tail);
    for(let i=0;i<5;i++){const s=(i-2)*.08;taperTube([fV(s*.5,0,0),fV(s,-.08,-.4),fV(s*1.6,-.12,-.85),fV(s*2.2,0,-1.25)],q=>.06*(1-q*.6),tips[i%3],tail,20,8);M(sph(.06,8,6),gold,s*2.2,0,-1.27,tail,false,false);}
    this.sparkle=true;
    Object.assign(o,{neck,head,tail,nTilt:.2,size:1.1,h:by+.95,rad:.7,biped:true,dustR:[.35,.3,.45]});return true;}
  return false;}

/* ---------- earning them: wins and days in a row (saved in SAVE.earn) ---------- */
const EARNED=FARM.filter(f=>f.earn);
for(const f of EARNED)STEED_ORDER.push(f.k);
SHINT.rides+=' The 🏆 ones can\'t be bought: win contests and play days in a row to earn them!';
FLYK.comet={hz:.9,amp:.0,base:0,glide:.9,spd:12.5,tuckF:1.05,tuckB:1.2};
FLYK.neema={hz:1.25,amp:.55,base:.1,glide:.7,spd:13,tuckF:1.15,tuckB:1.2};
FLYK.phoenix={hz:1.8,amp:.62,base:.1,glide:.55,spd:13.5,tuckF:.9,tuckB:.9};
// first time: wins you already had count (the win challenges you finished, and your 1-on-1 wins against Kai)
if(!SAVE.earn){const d=(SAVE.chal&&SAVE.chal.done)||{};SAVE.earn={wins:(d.win?1:0)+(d.cakeWin?1:0)+(d.petWin?1:0)+((SAVE.sports&&SAVE.sports.v1w)||0),days:{last:null,n:0,best:0}};persist();}
const ER=SAVE.earn;ER.days||={last:null,n:0,best:0};ER.wins||=0;
// which contests you've won at least once (for the 🐘 "win all three contests" safari challenge); wins from before count
// how many times you've won each contest (for the 🕊️ crowned crane's challenges); wins from before count as one each
if(!ER.kn){const d=(SAVE.chal&&SAVE.chal.done)||{};ER.kn={contest:d.win?1:0,cakect:d.cakeWin?1:0,petct:d.petWin?1:0};persist();}
if(!ER.kinds){const d=(SAVE.chal&&SAVE.chal.done)||{};ER.kinds={contest:d.win?1:0,cakect:d.cakeWin?1:0,petct:d.petWin?1:0};persist();}
const erDayKey=d=>`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
// 'chal' = the 🦁 Safari challenges: how many of the ride's challenges (earn.ids) you've finished
const erHave=f=>f.earn.by==='wins'?ER.wins:f.earn.by==='days'?ER.days.n:f.earn.by==='chal'?f.earn.ids.filter(id=>SAVE.chal&&SAVE.chal.done&&SAVE.chal.done[id]).length:0;
const erWhat=f=>f.earn.by==='wins'?`Win ${f.earn.goal} contests or games`:f.earn.by==='chal'?`Finish all ${f.earn.goal} 🦁 Safari challenges`:`Play ${f.earn.goal} days in a row`;
// a new day you played: one more day in the streak if you also played yesterday, otherwise start again at 1
function erPlayedToday(){const D=ER.days,now=new Date(),k=erDayKey(now);if(D.last===k)return;
  const y=new Date(now);y.setDate(y.getDate()-1);D.n=D.last===erDayKey(y)?D.n+1:1;D.last=k;D.best=Math.max(D.best||0,D.n);persist();
  const nx=EARNED.find(f=>f.earn.by==='days'&&!BS.own[f.k]&&D.n<f.earn.goal);
  if(D.n>1)setTimeout(()=>toast(`🔥 ${D.n} days in a row!${nx?` ${nx.earn.goal-D.n} more for ${nx.e} ${nx.nm}`:''}`),5000);}
// the modern outfits from 14d-fashion2-earned.js: they unlock in your closet (all of them, so they're there if you switch girl/guy)
function erLooks(){for(const L of EARN_LOOKS){const k='look:'+L.id;if(owns(k)||erHave(L)<L.earn.goal)continue;
  SAVE.owned[k]=true;persist();const mine=L.who==='both'||(L.who==='guy')===isGuy(SAVE.look);
  if(mine){banner(`🏆 You earned ${L.e} ${L.n}!`);toast(`Find it in your closet's ${TAB_NAME[L.tab]} 👗`);sfx('tada');did('prize',L.id);return true;}}return false;}
function erCheck(){if(!started)return;erPlayedToday();if(erLooks())return;
  for(const f of EARNED)if(!BS.own[f.k]&&erHave(f)>=f.earn.goal){getMount(f.k,true);sfx('tada');
    burst(new THREE.Vector3(player.pos.x,player.pos.y+1.4,player.pos.z),'#ffd23f',60,3,.2);did('prize',f.k);break;}}
setInterval(erCheck,1500);
addEventListener('brynny:did',e=>{const {k,a}=e.detail||{};
  const won=((k==='contest'||k==='cakect'||k==='petct')&&a===0)||(k==='sport'&&a==='v1win');if(!won)return;
  ER.wins++;if(ER.kinds[k]!=null)ER.kinds[k]=1;if(ER.kn[k]!=null)ER.kn[k]++;persist();const nx=EARNED.find(f=>f.earn.by==='wins'&&!BS.own[f.k]&&ER.wins<f.earn.goal);
  if(nx)setTimeout(()=>toast(`🏆 That's win #${ER.wins}! ${nx.earn.goal-ER.wins} more to earn ${nx.e} ${nx.nm}`),3500);});
// for the ⭐🏆 challenges screen (challenges.js): every ride you earn, with how close you are (Nova the star dragon too)
function earnedRides(){return MOUNTS.filter(f=>f.earn||f.prize).map(f=>{const goal=f.earn?f.earn.goal:f.prize,have=f.earn?erHave(f):starsEarned();
  // the safari rides show a picture of the real 3D animal (there's no okapi emoji, and 🦓 is a zebra)
  const pic=f.safari?FTHUMB[f.k]||(FTHUMB[f.k]=(()=>{try{return farmPic(f.k);}catch(e){return null;}})()):null;
  return {k:f.k,e:f.e,pic,n:f.n,nm:f.nm,by:f.earn?f.earn.by:'stars',goal,have:Math.min(goal,have),own:!!BS.own[f.k],fly:!!f.fly,what:f.earn?erWhat(f):`Earn ${f.prize} ⭐ stars`};});}
function earnedLooks(){const G=isGuy(SAVE.look);return EARN_LOOKS.filter(L=>L.who==='both'||(L.who==='guy')===G).map(L=>({k:L.id,e:L.e,n:L.n,by:L.earn.by,goal:L.earn.goal,
  have:Math.min(L.earn.goal,erHave(L)),own:owns('look:'+L.id),what:erWhat(L),where:TAB_NAME[L.tab]}));}
// the short tag on a locked thing: "🏆 Win 3" or "🏆 5 days"
function earnTag(e){return e.by==='chal'?'🦁 Safari':`🏆 ${e.by==='wins'?`Win ${e.goal}`:`${e.goal} days`}`;}
addEventListener('load',()=>{if(window.__game)Object.assign(window.__game,{earnedRides,earnedLooks,earnState:()=>({wins:ER.wins,streak:ER.days.n,best:ER.days.best||0,kinds:Object.values(ER.kinds).filter(Boolean).length,kai:(SAVE.sports&&SAVE.sports.v1w)||0,kn:{...ER.kn}})});});
