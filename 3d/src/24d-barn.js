/* ================= HAPPY BARN: farm animals you adopt, care for and ride ================= */
// c = price in coins, s = price in stars (the rare ones), ride = how high the saddle is (0 = too small to ride)
// New animals go at the end so saves keep working.
const FARM=[
  {k:'chicken',e:'🐔',n:'Chicken',nm:'Nugget',c:15,ride:0,about:'Clucks, pecks and flaps her wings when she is happy.',food:[['🌽','Corn'],['🪱','Worm'],['🍓','Berry']],say:['Bawk bawk! 🐔','*peck peck*','Cluck? 💛']},
  {k:'duck',e:'🦆',n:'Duckling',nm:'Puddles',c:15,ride:0,about:'A fluffy yellow duckling who quacks and waddles everywhere.',food:[['🌽','Corn'],['🥬','Lettuce'],['🍉','Melon']],say:['Quack quack! 🦆','*waddle waddle*','Splash time? 💦']},
  {k:'bunny',e:'🐰',n:'Barn bunny',nm:'Clover',c:20,ride:0,about:'A soft lop-eared bunny with a cotton-ball tail. Loves to hop!',food:[['🥕','Carrot'],['🥬','Lettuce'],['🍓','Berry']],say:['*nose wiggle* 🐰','Hop hop! 💖','*binky!*']},
  {k:'turkey',e:'🦃',n:'Turkey',nm:'Gobbles',c:25,ride:0,about:'A proud turkey with a rainbow fan of tail feathers.',food:[['🌽','Corn'],['🌾','Seeds'],['🍓','Berry']],say:['Gobble gobble! 🦃','*shows off feathers*','Gobble? 💛']},
  {k:'pig',e:'🐷',n:'Piglet',nm:'Peaches',c:25,ride:0,about:'A pink piglet with a curly tail who loves snacks.',food:[['🍎','Apple'],['🌽','Corn'],['🥔','Potato']],say:['Oink oink! 🐷','*happy snort*','Squee! 💗']},
  {k:'lamb',e:'🐑',n:'Lamb',nm:'Cotton',c:25,ride:0,about:'The fluffiest little lamb, soft as a cloud.',food:[['🌾','Hay'],['🍀','Clover'],['🥕','Carrot']],say:['Baaa! 🐑','*fluffy wiggle*','Baa-baa 💖']},
  {k:'goat',e:'🐐',n:'Goat',nm:'Pebbles',c:30,ride:0,about:'A bouncy goat with a tiny beard. Loves to hop.',food:[['🌾','Hay'],['🥬','Lettuce'],['🍎','Apple']],say:['Meeeh! 🐐','*hop hop*','Can I eat your hat?']},
  {k:'cow',e:'🐮',n:'Highland cow',nm:'Fluffy',c:40,ride:.98,about:'A shaggy orange cow with long horns and bangs over her eyes.',food:[['🌾','Hay'],['🌽','Corn'],['🍀','Clover']],say:['Moooo! 🐮','*fluffy moo*','Mooo 💖']},
  {k:'alpaca',e:'🦙',n:'Alpaca',nm:'Cocoa',c:45,ride:0,about:'A fuzzy alpaca with a fluffy hairdo. Hums when happy.',food:[['🌾','Hay'],['🥕','Carrot'],['🍏','Apple']],say:['Hmmmm? 🦙','*happy hum*','Fluffiest friend!']},
  {k:'donkey',e:'🫏',n:'Donkey',nm:'Biscuit',c:45,ride:.85,about:'A gentle gray donkey with big fuzzy ears. You can ride him!',food:[['🥕','Carrot'],['🍎','Apple'],['🌾','Hay']],say:['Hee-haw! 🫏','*ear wiggle*','Hee-haw 💖']},
  {k:'llama',e:'🦙',n:'Llama',nm:'Mocha',c:50,ride:0,about:'A tall, friendly llama with a two-tone coat and banana ears.',food:[['🌾','Hay'],['🥕','Carrot'],['🍏','Apple']],say:['Mmmmm? 🦙','*proud hum*','Llama llama! 💖']},
  {k:'pony',e:'🐴',n:'Pony',nm:'Buttercup',c:50,ride:.82,about:'A sweet little pony. You can ride her around town!',food:[['🥕','Carrot'],['🍎','Apple'],['🌾','Hay']],say:['Neigh! 🐴','*happy whinny*','Ride with me! 💛']},
  {k:'horse',e:'🐎',n:'Horse',nm:'Star',c:70,ride:1.2,about:'A tall, fast horse. Ride her and gallop around town!',food:[['🥕','Carrot'],['🍎','Apple'],['🌾','Hay']],say:['Neeeigh! 🐎','*proud snort*','Let\'s gallop! 💨']},
  {k:'unicorn',e:'🦄',n:'Unicorn',nm:'Sparkle',s:10,ride:1.2,about:'Rare! A magic unicorn with a rainbow mane and a golden horn.',food:[['🍓','Strawberry'],['🍭','Lollipop'],['🌈','Rainbow treat']],say:['✨ Neigh! ✨','*sparkle sparkle*','I love you! 🦄']},
  {k:'trike',e:'🦕',n:'Triceratops',nm:'Trixie',s:12,dino:1,model:'trikeR',scale:.4,ride:1.1,about:'Rare! A young triceratops with three horns and a big frill. Gentle and calm.',food:[['🌿','Ferns'],['🍉','Melon'],['🥬','Leaves']],say:['Rawr! 💚','*happy stomp*','Three horns, one heart!']},
  {k:'trex',e:'🦖',n:'Young T. rex',nm:'Chomper',s:15,dino:1,model:'trexR',scale:.32,ride:1.15,about:'Rare! A young T. rex with tiny arms and a big rumbly roar. Gentle with friends!',food:[['🍖','Meat'],['🍗','Drumstick'],['🍉','Melon']],say:['RAWR! 🦖','*tiny arm wave*','Rawr means I love you!']},
  {k:'dragon',e:'🐉',n:'Baby dragon',nm:'Ember',s:8,ride:0,pal:'fly',scale:.42,about:'Rare! A tiny dragon who flies along behind you everywhere you go.',food:[['🌶️','Hot pepper'],['🍓','Strawberry'],['🍖','Meat']],say:['*tiny puff of smoke* 💨','Rawr! 🔥','Let\'s fly! 💜']},
  {k:'stego',e:'🦕',n:'Mini stegosaurus',nm:'Pebble',s:5,ride:0,pal:'walk',dino:1,model:'stegoR',scale:.22,about:'Rare! A pocket-size dinosaur with plates on her back. She can follow you around town.',food:[['🌿','Ferns'],['🥬','Leaves'],['🍓','Berry']],say:['*tiny stomp*','Rawr! 💚','Wait for me!']},
  {k:'raptor',e:'🦖',n:'Mini raptor',nm:'Zippy',s:6,ride:0,pal:'walk',dino:1,model:'raptorR',scale:.45,about:'Rare! A speedy little feathered raptor who races along beside you.',food:[['🍗','Drumstick'],['🍖','Meat'],['🥚','Egg']],say:['Skreee! 💨','*zoom zoom*','Race you!']},
  {k:'monkey',e:'🐒',n:'Baby monkey',nm:'Coco',c:60,ride:0,pal:'walk',scale:.55,about:'A cheeky baby monkey with a curly tail. Takes walks with you around town.',food:[['🍌','Banana'],['🥭','Mango'],['🍇','Grapes']],say:['Ooh ooh ah ah! 🐒','*happy chatter*','Got a banana? 🍌']},
  {k:'longneck',e:'🦕',n:'Long-neck dino',nm:'Skye',s:20,dino:1,model:'longneckR',scale:.55,wide:.5,ride:2.18,about:'Super rare! A giant long-neck dinosaur. Ride way up high!',food:[['🌿','Ferns'],['🍃','Tree leaves'],['🍐','Pear']],say:['Hrrrooo! 🦕','*big gentle hum*','I can see the whole town!']},
  // rides from the shop: bought with ⭐ in the shop's 🦖 Rides tab (mount = price), or won as a prize (prize = ⭐ stars you need to earn).
  // They live at the barn like the others, and you call them from anywhere with the ride button (24g-mounts.js).
  {k:'kitty',e:'🐱',n:'Big fluffy cat',nm:'Marshmallow',mount:10,ride:1.08,about:'A giant, super fluffy cat you can ride! She purrs when you hug her.',food:[['🐟','Fish'],['🥛','Milk'],['🍗','Chicken']],say:['Purrrrr 💕','Mrrrow! 🐱','*big fluffy stretch*']},
  {k:'crest',e:'🦕',n:'Crested dino',nm:'Honker',mount:12,dino:1,ride:1.06,about:'A friendly duck-billed dinosaur with a long crest that goes HONK!',food:[['🌿','Ferns'],['🍐','Pear'],['🥬','Leaves']],say:['HONK! 🦕','*happy toot toot*','Honk means hello! 💛']},
  {k:'pegacorn',e:'🦄',n:'Winged unicorn',nm:'Cloud',mount:15,wingsRun:1,fly:1,ride:1.2,about:'A lavender unicorn with feathery wings. Ride her and tap 🪽 Fly to soar over the treetops!',food:[['🍬','Cloud candy'],['🍓','Strawberry'],['🌈','Rainbow treat']],say:['✨ Neigh! ✨','*flap flap*','To the clouds! ☁️']},
  {k:'ptero',e:'🦕',n:'Pterodactyl',nm:'Sunny',mount:14,dino:1,fly:1,ride:1.02,about:'A giant flying reptile with a big orange crest and huge leathery wings. Ride her and soar over the treetops!',food:[['🐟','Fish'],['🦐','Shrimp'],['🍤','Fried shrimp']],say:['SKRAAAW! 🦅','*big wing stretch*','Up, up and away! ☁️']},
  {k:'eagle',e:'🦅',n:'Giant eagle',nm:'Skyler',mount:16,fly:1,ride:1.0,about:'A giant bald eagle with a snowy white head, golden eyes and huge feathered wings. Ride him and soar over the whole island!',food:[['🐟','Salmon'],['🍗','Chicken'],['🥩','Steak']],say:['SCREEEE! 🦅','*fluffs his feathers*','Hop on, let\'s soar! ☁️']},
  {k:'nova',e:'🐉',n:'Starlight dragon',nm:'Nova',prize:50,wingsRun:1,fly:1,ride:1.15,about:'Super rare prize! A big starry dragon that only comes to players who earn 50 ⭐ stars. She can fly you over the whole island!',food:[['🌶️','Hot pepper'],['⭐','Star candy'],['🍖','Meat']],say:['*puff of sparkles* ✨','RAWR! 💫','Let\'s fly through town! 🌙']},
];
FARM.push(...earnedRideList());// 🏆 rides you can only earn, not buy (24i-earned-rides.js)
// zoo animals (12d-place-zoo.js): you can't adopt these, but you can pet and feed them and learn about them
// model = which real-looking builder in ZOO_BUILD to use (the same one as the safari ride of that animal)
const ZOOA=[
  {k:'zebra',e:'🦓',n:'Zebra',model:'zebraR',food:[['🌾','Hay'],['🥕','Carrot']],say:['*happy snort* 🦓','Hee-haw-hee!','Look at my stripes!'],
    facts:[['🥗','Diet','Herbivore. Mostly grass, plus some leaves, bark and shoots.'],['🌍','Habitat','Grasslands and savannas of eastern and southern Africa.'],['⏳','Lifespan','About 20 to 25 years in the wild, and up to 40 in zoos.'],['✨','Fun fact','No two zebras have the same stripes, just like fingerprints!']]},
  {k:'giraffe',e:'🦒',n:'Giraffe',model:'giraffeR',food:[['🥬','Lettuce'],['🌿','Acacia leaves']],say:['*long lick* 👅','Hello down there!','Mmm, leaves! 🌿'],
    facts:[['🥗','Diet','Herbivore. Leaves and twigs from tall trees, especially acacia. Up to 34 kg (75 lb) a day!'],['🌍','Habitat','Savannas and open woodlands of Africa.'],['⏳','Lifespan','About 25 years in the wild, and a bit longer in zoos.'],['✨','Fun fact','The tallest animal on Earth, up to 5.5 m (18 ft). Its tongue is about 50 cm (20 in) long!']]},
  {k:'rhino',e:'🦏',n:'White rhino',model:'rhinoR',food:[['🌾','Hay'],['🍎','Apple']],say:['*big happy huff*','Hrrumph! 🦏','Scratch behind my ears?'],
    facts:[['🥗','Diet','Herbivore. A grazer that eats short grass all day long.'],['🌍','Habitat','Grasslands and savannas of southern Africa.'],['⏳','Lifespan','About 40 to 50 years.'],['✨','Fun fact','Its horns are made of keratin, the same stuff as your fingernails. Adults can weigh over 2,000 kg!']]},
  {k:'okapi',e:'🌿',n:'Okapi',food:[['🍃','Leaves'],['🍌','Banana']],say:['*soft huff*','*long tongue lick* 👅','Shh, I\'m shy! 🌿'],
    facts:[['🥗','Diet','Herbivore. Leaves, buds, fruit and even mushrooms, which it pulls off with its long tongue.'],['🌍','Habitat','Only in the thick rainforests of the Democratic Republic of the Congo, in central Africa.'],['⏳','Lifespan','About 20 to 30 years.'],['✨','Fun fact','It has zebra stripes, but its closest relative is the giraffe! Its tongue is so long it can lick its own ears.']]},
  {k:'elephant',e:'🐘',n:'African elephant',food:[['🌾','Hay'],['🍉','Watermelon']],say:['PAWOOO! 🎺','*happy ear flap*','*trunk hug* 💖'],
    facts:[['🥗','Diet','Herbivore. Grass, leaves, bark and fruit. Up to 150 kg (330 lb) of food a day!'],['🌍','Habitat','Savannas and forests of Africa.'],['⏳','Lifespan','About 60 to 70 years.'],['✨','Fun fact','The biggest animal on land, up to 6,000 kg (13,000 lb). Its trunk has about 40,000 muscles!']]},
  {k:'lion',e:'🦁',n:'Lion',food:[['🍖','Meat'],['🥩','Steak']],say:['ROOOAR! 🦁','*big lazy yawn*','*deep rumbly purr*'],
    facts:[['🥗','Diet','Carnivore. Zebras, antelopes, buffalo and other big animals. A male can eat about 40 kg (90 lb) in one meal!'],['🌍','Habitat','Savannas and grasslands of Africa, plus one forest in India.'],['⏳','Lifespan','About 10 to 14 years in the wild, and up to 20 in zoos.'],['✨','Fun fact','Lions sleep up to 20 hours a day! A lion\'s roar can be heard 8 km (5 miles) away.']]},
  {k:'gorilla',e:'🦍',n:'Gorilla',food:[['🍌','Banana'],['🌿','Leaves']],say:['*chest pat pat* 🦍','*happy rumbly grunt*','*sits and munches*'],
    facts:[['🥗','Diet','Mostly a herbivore. Leaves, stems, bamboo shoots and fruit, plus the odd ant or termite. A big male eats about 18 kg (40 lb) a day!'],['🌍','Habitat','Rainforests and mountain forests of central Africa.'],['⏳','Lifespan','About 35 to 40 years in the wild, and up to 50 in zoos.'],['✨','Fun fact','The biggest ape in the world! Grown-up males get a patch of silver hair on their backs, so they are called silverbacks. Every gorilla has its own nose print, like a fingerprint.']]},
  {k:'hippo',e:'🦛',n:'Hippo',swim:.85,food:[['🍉','Watermelon'],['🌾','Grass']],say:['*big hippo yawn* 🦛','*blub blub* 💦','*happy grunty honk*'],
    facts:[['🥗','Diet','Herbivore. At night it walks out of the water to eat grass, about 40 kg (90 lb) a night!'],['🌍','Habitat','Rivers, lakes and swamps of Africa, south of the Sahara.'],['⏳','Lifespan','About 40 years in the wild, and up to 50 in zoos.'],['✨','Fun fact','Hippos spend all day in the water to stay cool, and they can hold their breath for 5 minutes. They can\'t really swim: they walk and bounce along the bottom! Their name means "river horse".']]},
  {k:'cheetah',e:'🐆',n:'Cheetah',food:[['🍖','Meat'],['🥩','Steak']],say:['*chirp chirp*','*fast tail flick*','*soft purr*'],
    facts:[['🥗','Diet','Carnivore. Gazelles, impalas and hares, which it catches with a super fast sprint.'],['🌍','Habitat','Open grasslands and savannas of Africa, and a few in Iran.'],['⏳','Lifespan','About 10 to 12 years in the wild, and up to 17 in zoos.'],['✨','Fun fact','The fastest land animal in the world: up to 110 km/h (70 mph)! It can\'t roar, but it chirps like a bird. The black "tear marks" under its eyes stop the sun from dazzling it.']]},
  {k:'tiger',e:'🐅',n:'Tiger',food:[['🍖','Meat'],['🐟','Fish']],say:['*deep rumbly growl*','*friendly chuff chuff*','*big stretch*'],
    facts:[['🥗','Diet','Carnivore. Deer, wild pigs and buffalo. A tiger can eat 40 kg (88 lb) in one meal!'],['🌍','Habitat','Forests, grasslands and mangrove swamps of Asia, from India to Russia.'],['⏳','Lifespan','About 10 to 15 years in the wild, and up to 20 in zoos.'],['✨','Fun fact','The biggest cat in the world! No two tigers have the same stripes, and the stripes are on its skin too. Unlike most cats, tigers love to swim.']]},
  {k:'gator',e:'🐊',n:'Alligator',swim:.36,food:[['🐟','Fish'],['🍗','Chicken']],say:['*low rumbly bellow*','*snap snap!* 🐊','*lazy sunbathing*'],
    facts:[['🥗','Diet','Carnivore. Fish, turtles, snakes, birds and small animals. It can go months without eating in the winter!'],['🌍','Habitat','Rivers, lakes and swamps of the southeastern United States, like Florida and Louisiana. A cousin lives in China.'],['⏳','Lifespan','About 35 to 50 years in the wild, and up to 70 in zoos.'],['✨','Fun fact','You can tell an alligator from a crocodile by its wide, rounded U-shaped snout. When its mouth is shut you can only see its top teeth! It has about 80 teeth and grows new ones all its life.']]}
];
ZOOA.push(...arcticZooList(),...DINOA);FARM.push(...arcticRideList());// ❄️ the polar animals and the polar rides you earn (24c9g-arctic-animals.js)
const FK=Object.fromEntries(FARM.concat(ZOOA).map(f=>[f.k,f]));
if(!SAVE.barn)SAVE.barn={own:{},spent:0};
const BS=SAVE.barn;BS.own||={};
// stars you can spend = all the stars you ever earned minus the ones spent at the barn (your star rank never goes down)
const starsLeft=()=>Math.max(0,((SAVE.chal&&SAVE.chal.stars)||0)-(BS.spent||0));
const FDECAY={food:6,shine:3,love:4};// points lost per hour
function farmCare(k){const c=BS.own[k];if(!c)return null;const now=Date.now(),h=(now-(c.t||now))/36e5;
  if(h>.01){for(const m in FDECAY)c[m]=Math.max(0,(c[m]??60)-h*FDECAY[m]);c.t=now;}return c;}
function farmNeed(k){const c=farmCare(k);if(!c)return null;if(c.food<35)return "I'm hungry! 🌾";if(c.shine<35)return 'Brush me please! 🪮';if(c.love<35)return 'I missed you! 💖';return null;}

/* ---------- building the animals (all in code, cute and chunky like the rest of the town) ---------- */
const fm=(c,o={})=>phys(c,{roughness:.85,sheen:.8,sheenColor:new THREE.Color('#ffffff'),sheenRoughness:.7,...o});
const fShiny=(c,o={})=>phys(c,{roughness:.3,clearcoat:1,...o});
const fV=(x,y,z)=>new THREE.Vector3(x,y,z);
function fEyes(a,head,H,ex,ey,ez,ry,size=.2,col='#3a2416'){const iris=phys(col,{map:irisTex(),roughness:.1,clearcoat:1,clearcoatRoughness:.05}),shine=new THREE.MeshBasicMaterial({color:'#ffffff'});
  for(const sx of [-1,1]){const g=new THREE.Group();g.position.set(sx*H*ex,H*ey,H*ez);g.rotation.y=sx*ry;head.add(g);const e=M(irisGeo(H*size),iris,0,0,0,g);e.scale.z=.7;
    M(sph(H*size*.28,8,6),shine,H*size*.22,H*size*.32,H*size*.62,g,false,false);a.eyes.push(g);}}
function fBlush(head,H,ex,ey,ez){const m=new THREE.MeshBasicMaterial({color:'#ff8fb0',transparent:true,opacity:.4,depthWrite:false});
  for(const sx of [-1,1])M(sph(H*.16,12,8),m,sx*H*ex,H*ey,H*ez,head,false,false).scale.set(1,.6,.35);}
function fLegs(a,par,lx,lz,y,len,r,mat,hoof,front=1){for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*lx,y,sz*lz);par.add(lg);
  M(capTop(r,Math.max(.01,len-r*2)),mat,0,0,0,lg);if(hoof)M(cyl(r*1.02,r*1.18,r*1.2,12),hoof,0,-len+r*.6,0,lg);a.legs.push({g:lg,ph});}}
// a fluffy coat: lots of soft balls over an ellipsoid
function fFluff(par,mat,rx,ry,rz,n,s,y=0,z=0){for(let i=0;i<n;i++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2,q=Math.sqrt(1-u*u);const x=q*Math.cos(th),yy=u,zz=q*Math.sin(th);if(yy<-.55)continue;
  M(sph(s*(.8+Math.random()*.4),10,8),mat,x*rx,y+yy*ry,z+zz*rz,par,true,false);}}

class FarmAnimal{
  constructor(k){const F=FK[k];this.k=k;this.F=F;this.g=new THREE.Group();this.legs=[];this.eyes=[];this.mats=[];this.t=Math.random()*9;this.phase=0;this.speed=0;
    this.pos=new THREE.Vector3();this.lx=0;this.lz=0;this.face=Math.random()*6;this.tgt=null;this.wait=Math.random()*3;this.graze=0;this.hop=0;this.vy=0;this.y=0;this.blink=2+Math.random()*3;this.happy=0;this.wig=0;
    const B=this.build(k);Object.assign(this,B);if(F.scale){this.g.scale.setScalar(F.scale);this.h*=F.scale;this.rad*=F.scale;this.size*=F.scale;}
    // dust spots that brushing cleans off
    const dm=std('#9c7a52',{roughness:1});this.dust=[];const R=this.dustR||[.3,.25,.4];
    for(const [x,y,z] of [[.9,.35,.2],[-.85,.4,-.25],[.2,.95,-.1],[-.5,.75,.35],[.6,.6,-.4]]){const d=M(sph(R[0]*.24,10,8),dm,x*R[0],y*R[1],z*R[2],this.body,false,false);d.scale.set(1,.5,1);this.dust.push(d);}
    this.ob={x:0,z:0,r:0};obs.push(this.ob);this.setTag('');}
  build(k){const g=this.g,body=new THREE.Group();g.add(body);const o={body,size:1,h:1,rad:.5,dustR:[.3,.3,.4]};
    const horseLike=(sc,coat,mane,o2={})=>{// horse, pony and unicorn share one shape
      const r=.3*sc,len=.62*sc,leg=.66*sc*(o2.short?.82:1),by=leg+r*.7,fur=fm(coat),light=fm(o2.light||new THREE.Color(coat).lerp(new THREE.Color('#ffffff'),.35).getStyle()),
        maneM=Array.isArray(mane)?mane.map(c=>fm(c,{roughness:.6})):[fm(mane,{roughness:.6})],hoof=fShiny(o2.hoof||'#3b2a22');
      body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,8,20),fur,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(1,.95,1);
      M(sph(r*.8,16,12),light,0,-r*.3,len*.15,body).scale.set(.9,.75,1.3);
      fLegs(this,g,r*.5,len*.45,leg+r*.1,leg+r*.1,.065*sc,fur,hoof);
      const neck=new THREE.Group();neck.position.set(0,by+r*.35,len/2+r*.35);neck.rotation.x=.78;g.add(neck);const nl=.44*sc,nr=.13*sc;
      M(new THREE.CapsuleGeometry(nr,nl,6,14),fur,0,nl/2,0,neck).scale.set(.85,1,1.1);
      for(let i=0;i<8;i++){const q=i/7;M(sph(nr*.62,10,8),maneM[i%maneM.length],0,q*nl*1.05+nr*.3,-nr*.82,neck).scale.set(.75,1.15,1);}
      const head=new THREE.Group();head.position.set(0,nl+nr*.4,0);head.rotation.x=-.78+.25;neck.add(head);const H=.16*sc;
      M(sph(H,22,16),fur,0,0,0,head).scale.set(.95,1,1.1);const sn=M(sph(H*.78,18,14),light,0,-H*.32,H*.82,head);sn.scale.set(.95,.85,1.3);
      for(const sx of [-1,1]){M(sph(H*.1,8,6),std('#3b2a22'),sx*H*.3,-H*.28,H*1.78,head,false,false).scale.set(1,.7,.5);
        const e=M(new THREE.ConeGeometry(H*.22,H*.55,10),fur,sx*H*.45,H*.88,-H*.15,head);e.rotation.z=-sx*.25;e.scale.z=.6;}
      fEyes(this,head,H,.55,.22,.6,.6,.24);fBlush(head,H,.62,-.15,.65);
      for(let i=0;i<4;i++)M(sph(H*.24,10,8),maneM[i%maneM.length],(i-1.5)*H*.16,H*.8,H*.45,head).scale.set(.8,1,1.2);
      const tail=new THREE.Group();tail.position.set(0,by+r*.45,-(len/2+r*.85));g.add(tail);
      maneM.forEach((m,i)=>{const s=(i-(maneM.length-1)/2)*.03*sc;taperTube([fV(s,0,0),fV(s,-.08*sc,-.14*sc),fV(s*1.5,-.35*sc,-.2*sc),fV(s*2,-.6*sc,-.16*sc)],q=>(.07-.035*q)*sc*(maneM.length>1?.6:1),m,tail,20,8);});
      Object.assign(o,{neck,head,tail,nTilt:.78,size:sc,h:by+nl+.35*sc,rad:.45*sc,dustR:[r,r,len*.7]});return {fur,head,H,neck};};
    if(earnedRideModel.call(this,k,{g,body,o,horseLike}))return o;// 🏆 the rides you earn (24i-earned-rides.js)
    if(k==='horse'){const h=horseLike(1.05,'#9a5f34','#3b2416',{light:'#c48a5c'});M(sph(h.H*.3,10,8),fm('#ffffff'),0,h.H*.35,h.H*.95,h.head).scale.set(.5,1.2,.4);}
    if(k==='donkey'){const h=horseLike(.88,'#9d968f','#4a4440',{short:true,light:'#ece6df',hoof:'#3b2a22'});
      for(const sx of [-1,1]){const e=M(new THREE.CapsuleGeometry(h.H*.17,h.H*.95,6,10),h.fur,sx*h.H*.42,h.H*1.15,-h.H*.15,h.head);e.rotation.z=-sx*.3;e.scale.z=.6;M(new THREE.CapsuleGeometry(h.H*.09,h.H*.75,6,8),fm('#4a4440'),sx*h.H*.44,h.H*1.15,-h.H*.06,h.head).rotation.z=-sx*.3;}
      M(sph(h.H*.62,14,10),fm('#ece6df'),0,-h.H*.32,h.H*.9,h.head).scale.set(1,.85,1.25);}
    if(k==='pony'){horseLike(.82,'#f0cf8a','#fff6e2',{short:true,light:'#fff3d6',hoof:'#a0784a'});}
    if(k==='unicorn'){const h=horseLike(1.05,'#ffffff',['#ff6fae','#ffd23f','#7ee081','#4fb6ff','#b388ff'],{light:'#fff6fb',hoof:'#ffb3d1'});
      const horn=M(new THREE.ConeGeometry(h.H*.16,h.H*.95,18),phys('#ffd86b',{map:TEX.glitter,metalness:.6,roughness:.25,clearcoat:1,iridescence:.6}),0,h.H*1.15,h.H*.65,h.head);horn.rotation.x=.5;
      this.sparkle=true;}
    if(k==='cow'){const r=.38,len=.55,leg=.38,by=leg+r*.7,coat='#c8662a',fur=fm(coat,{map:furTex(),bumpMap:furTex(),bumpScale:2}),dark=fm('#9a4a1c',{map:furTex()});
      body.position.y=by;const t=M(fuzz(new THREE.CapsuleGeometry(r,len,10,24),.03,30),fur,0,0,0,body);t.rotation.x=Math.PI/2;
      for(let i=0;i<14;i++){const a=i/14*Math.PI*2;for(const s of [-1,1])M(sph(.09,10,8),fur,s*r*.86,-r*.55,Math.cos(a)*len*.55,body,true,false).scale.set(.7,1.6,.9);}
      fLegs(this,g,r*.55,len*.42,leg+.05,leg+.05,.09,dark,fShiny('#3b2a22'));
      const neck=new THREE.Group();neck.position.set(0,by+r*.1,len/2+r*.5);neck.rotation.x=1.1;g.add(neck);const nl=.12;
      M(sph(.24,14,12),fur,0,0,0,neck);
      const head=new THREE.Group();head.position.set(0,nl+.08,0);head.rotation.x=-1.1+.15;neck.add(head);const H=.22;
      M(fuzz(sph(H,22,16),.02,40),fur,0,0,0,head).scale.set(1,.95,1.05);const sn=M(sph(H*.62,18,14),fShiny('#f0a8a0',{roughness:.5,clearcoat:.4}),0,-H*.38,H*.8,head);sn.scale.set(1.2,.85,.9);
      for(const sx of [-1,1])M(sph(H*.1,8,6),std('#5a2a2a'),sx*H*.25,-H*.33,H*1.3,head,false,false);
      fEyes(this,head,H,.42,.08,.82,.35,.2);fBlush(head,H,.6,-.18,.7);
      // shaggy bangs over the eyes
      for(let i=0;i<7;i++){const b=M(sph(H*.24,10,8),fur,(i-3)*H*.16,H*.42-Math.abs(i-3)*H*.03,H*.82,head);b.scale.set(.7,1.35,.6);b.rotation.z=(i-3)*.1;}
      for(const sx of [-1,1]){const horn=taperTube([fV(sx*H*.6,H*.45,0),fV(sx*H*1.4,H*.55,0),fV(sx*H*2,H*1,H*.1),fV(sx*H*2.1,H*1.45,H*.15)],q=>H*(.16-.12*q),fShiny('#f6ead2'),head,24,10);
        const ear=M(sph(H*.25,10,8),fur,sx*H*1.05,H*.12,-H*.05,head);ear.scale.set(1.4,.6,.8);}
      const tail=new THREE.Group();tail.position.set(0,by+r*.4,-(len/2+r*.9));g.add(tail);taperTube([fV(0,0,0),fV(0,-.2,-.08),fV(0,-.45,-.1)],q=>.03+q*.02,fur,tail,12,8);M(sph(.07,10,8),dark,0,-.47,-.1,tail).scale.y=1.6;
      Object.assign(o,{neck,head,tail,nTilt:1.1,size:1,h:by+.5,rad:.6,dustR:[r,r,len*.8]});}
    if(k==='bunny'){const by=.2,fur=fm('#f2e6d8'),light=fm('#ffffff'),pink=fShiny('#ffb3c1',{roughness:.5});
      body.position.y=by;M(sph(.17,16,12),fur,0,0,0,body).scale.set(1,.95,1.2);M(sph(.13,12,10),light,0,-.04,.07,body).scale.set(.9,.85,1.1);
      fLegs(this,g,.07,.09,.09,.09,.04,fur,light);
      const neck=new THREE.Group();neck.position.set(0,by+.12,.13);g.add(neck);
      const head=new THREE.Group();head.position.set(0,.04,0);neck.add(head);const H=.12;M(sph(H,18,14),fur,0,0,0,head);M(sph(H*.5,12,10),light,0,-H*.35,H*.7,head).scale.set(1.2,.8,.8);M(sph(H*.13,8,6),pink,0,-H*.15,H*1.02,head);
      for(const sx of [-1,1]){const e=M(new THREE.CapsuleGeometry(H*.22,H*1.1,6,10),fur,sx*H*.38,H*1.25,-H*.15,head);e.rotation.z=-sx*.22;e.scale.z=.5;const i=M(new THREE.CapsuleGeometry(H*.12,H*.85,6,8),pink,sx*H*.39,H*1.25,-H*.07,head);i.rotation.z=-sx*.22;i.scale.z=.3;}
      fEyes(this,head,H,.45,.18,.78,.4,.22);fBlush(head,H,.6,-.18,.72);
      const tail=new THREE.Group();tail.position.set(0,by+.02,-.2);g.add(tail);M(sph(.06,10,8),light,0,0,0,tail);
      Object.assign(o,{neck,head,tail,nTilt:0,size:.4,h:.45,rad:.22,dustR:[.17,.17,.2]});}
    if(k==='pig'){const r=.27,len=.3,leg=.16,by=leg+r*.75,fur=fm('#ffb3c1',{roughness:.6}),pink=fShiny('#ff8fa8',{roughness:.45});
      body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,8,20),fur,0,0,0,body);t.rotation.x=Math.PI/2;
      fLegs(this,g,r*.55,len*.45,leg+.04,leg+.04,.06,fur,fShiny('#d0707f'));
      const neck=new THREE.Group();neck.position.set(0,by+.02,len/2+r*.55);neck.rotation.x=1.3;g.add(neck);
      const head=new THREE.Group();head.position.set(0,.05,0);head.rotation.x=-1.3+.05;neck.add(head);const H=.21;
      M(sph(H,22,16),fur,0,0,0,head).scale.set(1.05,.95,1);const sn=M(cyl(H*.38,H*.42,H*.3,24),pink,0,-H*.15,H*.98,head);sn.rotation.x=Math.PI/2;
      for(const sx of [-1,1]){M(sph(H*.09,8,6),std('#a04060'),sx*H*.14,-H*.15,H*1.14,head,false,false).scale.z=.4;
        const e=M(new THREE.ConeGeometry(H*.3,H*.5,4),fur,sx*H*.58,H*.72,H*.15,head);e.rotation.set(.7,0,-sx*.4);e.scale.z=.35;}
      fEyes(this,head,H,.42,.22,.8,.3,.2);fBlush(head,H,.62,-.2,.7);
      const tail=new THREE.Group();tail.position.set(0,by+r*.3,-(len/2+r*.95));g.add(tail);const pts=[];for(let i=0;i<=24;i++){const q=i/24*Math.PI*4;pts.push(fV(Math.sin(q)*.04,Math.cos(q)*.04+i*.004,-i*.004));}
      M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.014,6),fur,0,0,0,tail);
      Object.assign(o,{neck,head,tail,nTilt:1.3,size:.7,h:by+.3,rad:.4,dustR:[r,r,len*.8]});}
    if(k==='lamb'){const leg=.3,by=leg+.16,wool=fm('#fffaf2',{roughness:1}),face=fm('#f2e2cf'),dark=fm('#4a3a36');
      body.position.y=by;M(sph(.24,16,12),wool,0,0,0,body).scale.set(1,.9,1.25);fFluff(body,wool,.25,.22,.3,34,.1);
      fLegs(this,g,.11,.13,leg+.04,leg+.04,.045,dark,fShiny('#2d2220'));
      const neck=new THREE.Group();neck.position.set(0,by+.1,.26);neck.rotation.x=.7;g.add(neck);M(sph(.1,10,8),wool,0,.05,0,neck);
      const head=new THREE.Group();head.position.set(0,.14,0);head.rotation.x=-.7+.1;neck.add(head);const H=.15;
      M(sph(H,20,14),face,0,0,0,head).scale.set(.95,1,1.1);M(sph(H*.6,14,10),face,0,-H*.35,H*.75,head).scale.set(1,.8,1);M(sph(H*.1,8,6),std('#7a4a4a'),0,-H*.3,H*1.3,head,false,false);
      fFluff(head,wool,H*.6,H*.25,H*.5,10,H*.28,H*.8,-H*.1);
      for(const sx of [-1,1]){const e=M(sph(H*.3,10,8),face,sx*H*1.05,H*.1,0,head);e.scale.set(1.5,.5,.8);e.rotation.z=sx*.4;}
      fEyes(this,head,H,.42,.12,.8,.35,.22);fBlush(head,H,.6,-.15,.72);
      const tail=new THREE.Group();tail.position.set(0,by+.08,-.32);g.add(tail);fFluff(tail,wool,.05,.05,.05,4,.06);
      Object.assign(o,{neck,head,tail,nTilt:.7,size:.65,h:by+.4,rad:.35,dustR:[.25,.25,.3]});}
    if(k==='goat'){const r=.2,len=.34,leg=.36,by=leg+r*.7,fur=fm('#f4ede2'),patch=fm('#a8794f'),horn=fShiny('#bfae96');
      body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,8,20),fur,0,0,0,body);t.rotation.x=Math.PI/2;M(sph(r*.75,12,10),patch,r*.35,r*.35,-len*.1,body,false,false).scale.set(.9,.8,1.2);
      fLegs(this,g,r*.5,len*.45,leg+.03,leg+.03,.04,fur,fShiny('#4a3a30'));
      const neck=new THREE.Group();neck.position.set(0,by+r*.4,len/2+r*.3);neck.rotation.x=.5;g.add(neck);M(new THREE.CapsuleGeometry(.07,.16,6,12),fur,0,.1,0,neck);
      const head=new THREE.Group();head.position.set(0,.24,0);head.rotation.x=-.5+.15;neck.add(head);const H=.13;
      M(sph(H,20,14),fur,0,0,0,head).scale.set(.9,1,1.15);M(sph(H*.6,14,10),patch,0,-H*.3,H*.85,head).scale.set(.9,.8,1.1);
      M(new THREE.ConeGeometry(H*.22,H*.6,10),fur,0,-H*.85,H*.75,head).rotation.x=Math.PI;
      for(const sx of [-1,1]){taperTube([fV(sx*H*.3,H*.75,-H*.05),fV(sx*H*.38,H*1.2,-H*.35),fV(sx*H*.45,H*1.3,-H*.8)],q=>H*(.13-.09*q),horn,head,12,8);
        const e=M(sph(H*.3,10,8),fur,sx*H*1,H*.25,-H*.1,head);e.scale.set(1.5,.45,.7);}
      fEyes(this,head,H,.45,.18,.78,.4,.22,'#7a5a1a');fBlush(head,H,.6,-.15,.72);
      const tail=new THREE.Group();tail.position.set(0,by+r*.6,-(len/2+r*.9));g.add(tail);M(new THREE.ConeGeometry(.04,.12,8),fur,0,.05,0,tail).rotation.x=-.5;
      Object.assign(o,{neck,head,tail,nTilt:.5,size:.7,h:by+.55,rad:.35,dustR:[r,r,len*.8]});}
    if(k==='alpaca'||k==='llama'){const ll=k==='llama',leg=ll?.52:.42,by=leg+.2,fur=fm(ll?'#ffffff':'#f3e1c6',{roughness:1}),dark=fm(ll?'#8a5a3b':'#e6cfae');
      body.position.y=by;M(sph(.26,16,12),fur,0,0,0,body).scale.set(1,.9,1.3);fFluff(body,ll?dark:fur,.26,.24,.34,ll?18:30,ll?.08:.11);
      fLegs(this,g,.12,.17,leg+.03,leg+.03,.05,dark,fShiny('#5a4a3a'));
      const neck=new THREE.Group();neck.position.set(0,by+.12,.27);neck.rotation.x=.12;g.add(neck);const nl=ll?.62:.5;M(new THREE.CapsuleGeometry(.1,nl,6,14),fur,0,nl/2,0,neck);fFluff(neck,fur,.1,nl*.5,.1,12,.07,nl*.5);
      const head=new THREE.Group();head.position.set(0,nl+.08,.02);head.rotation.x=-.12;neck.add(head);const H=.13;
      M(sph(H,20,14),fur,0,0,0,head);M(sph(H*.6,14,10),dark,0,-H*.35,H*.75,head).scale.set(1,.8,1);M(sph(H*.09,8,6),std('#5a3a3a'),0,-H*.28,H*1.3,head,false,false);
      if(!ll)fFluff(head,fm('#fffaf0',{roughness:1}),H*.6,H*.35,H*.55,14,H*.32,H*.75,-H*.05);
      for(const sx of [-1,1]){const e=M(new THREE.CapsuleGeometry(H*.13,H*.6,6,10),fur,sx*H*.5,H*1.1,-H*.15,head);e.rotation.z=-sx*.25;e.rotation.x=-.15;}
      fEyes(this,head,H,.45,.12,.78,.4,.24);fBlush(head,H,.6,-.15,.72);
      const tail=new THREE.Group();tail.position.set(0,by+.08,-.36);g.add(tail);fFluff(tail,fur,.05,.05,.05,4,.06);
      Object.assign(o,{neck,head,tail,nTilt:.12,size:.85,h:by+(ll?.95:.8),rad:.38,dustR:[.26,.24,.33]});}
    if(k==='chicken'||k==='duck'||k==='turkey'){const dk=k==='duck',tk=k==='turkey',by=tk?.36:.3,f=fm(dk?'#ffe066':tk?'#8a5a3b':'#fffaf2'),red=fShiny('#e0263b',{roughness:.4}),yel=fShiny(dk?'#ff8a1f':'#ffb020',{roughness:.4});
      if(tk){body.scale.setScalar(1.25);const fan=['#c0392b','#ff8a1f','#ffd23f','#8a5a3b','#c0392b','#ff8a1f','#ffd23f'];for(let i=0;i<7;i++){const a=(i/6-.5)*2.2;const fe=M(sph(.09,10,8),fm(fan[i]),Math.sin(a)*.17,.1+Math.cos(a)*.17,-.15,body);fe.scale.set(.55,1.5,.25);fe.rotation.z=-a;}}
      body.position.y=by;M(sph(.16,18,14),f,0,0,0,body).scale.set(.95,.95,1.15);
      for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*.14,.02,-.01);body.add(w);M(sph(.1,12,10),f,0,0,-.03,w).scale.set(.35,.75,1.2);(this.wings||(this.wings=[])).push({w,sx});}
      if(!tk)for(let i=0;i<3;i++){const c=M(sph(.06,10,8),f,(i-1)*.04,.1+i%2*.02,-.17,body);c.scale.set(.5,1.6,.6);c.rotation.x=dk?-1.1:-.6;}
      const neck=new THREE.Group();neck.position.set(0,by+.1,.1);g.add(neck);
      const head=new THREE.Group();head.position.set(0,.1,.02);neck.add(head);const H=dk?.1:.09;M(sph(H,16,12),tk?fm('#7aa6d8'):f,0,0,0,head);
      if(dk){const b=M(sph(H*.42,12,10),yel,0,-H*.2,H*1,head);b.scale.set(1.2,.35,1.3);}
      else{M(new THREE.ConeGeometry(H*.28,H*.55,10),yel,0,-H*.08,H*1.1,head).rotation.x=Math.PI/2;M(sph(H*.18,8,6),red,0,-H*.5,H*.8,head).scale.y=tk?2.6:1.6;}
      if(!dk&&!tk)for(let i=0;i<3;i++)M(sph(H*.2,8,6),red,0,H*.95+(i===1?H*.1:0),(i-1)*H*.28,head);
      fEyes(this,head,H,.5,.15,.72,.5,.24,'#2a1a10');fBlush(head,H,.6,-.18,.72);
      this.legs=[];for(const [sx,ph] of [[-1,0],[1,Math.PI]]){const lg=new THREE.Group();lg.position.set(sx*.06,.2,0);g.add(lg);M(cyl(.012,.012,.2,6),yel,0,-.1,0,lg);
        for(const a of [-.5,0,.5]){const toe=M(cyl(.008,.008,.07,5),yel,Math.sin(a)*.03,-.2,Math.cos(a)*.03,lg);toe.rotation.x=Math.PI/2;toe.rotation.z=-a;}this.legs.push({g:lg,ph});}
      Object.assign(o,{neck,head,tail:null,nTilt:0,size:tk?.55:.45,h:tk?.75:.6,rad:tk?.3:.22,biped:true,dustR:[.15,.15,.18]});}
    if(k==='dragon'){const by=.75,skin=fm('#b388ff',{roughness:.5}),belly=fm('#ffe0a8'),wingM=phys('#ff8fc8',{roughness:.5,side:THREE.DoubleSide,transparent:true,opacity:.9}),hornM=fShiny('#fff4dc');
      body.position.y=by;const t=M(new THREE.CapsuleGeometry(.24,.3,8,18),skin,0,0,0,body);t.rotation.x=Math.PI/2+.3;M(sph(.2,14,10),belly,0,-.07,.08,body).scale.set(.9,.9,1.3);
      for(let i=0;i<4;i++)M(new THREE.ConeGeometry(.05,.12,6),fShiny('#ff6fae'),0,.24-i*.03,.1-i*.13,body);
      this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*.16,.15,0);body.add(w);const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(.6,.35);sh.lineTo(.55,.05);sh.lineTo(.45,-.05);sh.lineTo(.3,-.02);sh.lineTo(.15,-.1);sh.lineTo(0,-.05);
        const m=M(new THREE.ShapeGeometry(sh),wingM,0,0,0,w,true,false);m.rotation.x=-Math.PI/2;m.scale.x=sx;M(cyl(.02,.02,.6,6),skin,sx*.3,.17,0,w).rotation.z=-sx*1.03;this.wings.push({w,sx,fly:1});}
      this.legs=[];for(const [sx,ph] of [[-1,0],[1,Math.PI]]){const lg=new THREE.Group();lg.position.set(sx*.13,.55,-.05);g.add(lg);M(capTop(.06,.22),skin,0,0,0,lg);M(sph(.07,10,8),skin,0,-.33,.04,lg).scale.set(1,.5,1.4);this.legs.push({g:lg,ph});}
      const neck=new THREE.Group();neck.position.set(0,by+.22,.22);neck.rotation.x=.25;g.add(neck);M(new THREE.CapsuleGeometry(.1,.1,6,12),skin,0,.06,0,neck);
      const head=new THREE.Group();head.position.set(0,.22,.03);head.rotation.x=-.25;neck.add(head);const H=.22;
      M(sph(H,22,16),skin,0,0,0,head).scale.set(1,.92,1.05);M(sph(H*.62,16,12),belly,0,-H*.35,H*.72,head).scale.set(1,.7,1.1);
      for(const sx of [-1,1]){const hn=M(new THREE.ConeGeometry(H*.14,H*.55,10),hornM,sx*H*.45,H*.85,-H*.25,head);hn.rotation.set(-.5,0,-sx*.3);M(sph(H*.07,8,6),std('#7a4aa0'),sx*H*.2,-H*.25,H*1.2,head,false,false);}
      fEyes(this,head,H,.45,.18,.68,.45,.26,'#d6453d');fBlush(head,H,.6,-.1,.72);
      const tail=new THREE.Group();tail.position.set(0,by-.05,-.3);g.add(tail);taperTube([fV(0,0,0),fV(0,-.12,-.25),fV(.08,-.2,-.5)],q=>.11*(1-q*.75),skin,tail,16,10);
      const tip=M(new THREE.ConeGeometry(.08,.14,4),fShiny('#ff6fae'),.09,-.21,-.56,tail);tip.rotation.x=-Math.PI/2;tip.scale.y=.4;
      Object.assign(o,{neck,head,tail,nTilt:.25,size:1,h:1.35,rad:.45,biped:true,dustR:[.22,.22,.3]});}
    // 🐒 Coco: a real-looking little monkey, the same builder as the Pet Parlor's real pets (Pet.buildReal in 16-animals-pets.js), in brown
    if(k==='monkey'){const p=new Pet('monkey','#7b5b43','',null,{real:1,light:'#d8c4a6',face:'#2b211c',paw:'#2b211c'}),S=1.6;
      if(p.tag){p.g.remove(p.tag);p.tag.material.map.dispose();p.tag.material.dispose();p.tag=null;}
      p.g.scale.setScalar(S);g.add(p.g);this.tick=(t,dt,run)=>{p.speed=run*2.4;p.happy=this.happy;p.update(dt);};
      Object.assign(o,{size:1,h:p.tagH*S,rad:.4,dustR:[.17,.55,.3]});}
    /* ---- rides from the shop (24g-mounts.js): all original designs ---- */
    // 🐱 a giant fluffy cat: round and soft, pointy ears, green eyes, a big curly tail
    if(k==='kitty'){const r=.36,len=.5,leg=.42,by=leg+r*.7,fur=fm('#fff3e4',{roughness:1}),peach=fm('#ffc999'),white=fm('#ffffff',{roughness:1}),pink=fShiny('#ffa3bf',{roughness:.45}),whisk=std('#b8a796');
      body.position.y=by;const t=M(fuzz(new THREE.CapsuleGeometry(r,len,10,24),.02,30),fur,0,0,0,body);t.rotation.x=Math.PI/2;
      fFluff(body,fur,r*.95,r*.85,len*.5+r*.8,40,r*.3);
      for(let i=0;i<4;i++)M(sph(r*.32,12,8),peach,0,r*.92,(i/3-.5)*len*1.15,body,false,false).scale.set(1.5,.32,.55);// soft peach stripes on her back
      M(sph(r*.75,14,10),white,0,-r*.35,len*.35,body).scale.set(.95,.8,1.1);
      fLegs(this,g,r*.55,len*.42,leg+.05,leg+.05,.1,fur,null);
      for(const l of this.legs)M(sph(.115,12,10),white,0,-(leg+.05)+.06,.03,l.g).scale.set(1,.6,1.25);// big round paws
      const neck=new THREE.Group();neck.position.set(0,by+r*.4,len/2+r*.5);neck.rotation.x=.5;g.add(neck);
      M(sph(.27,16,12),fur,0,.05,0,neck);fFluff(neck,white,.24,.2,.22,14,.09,.02,.06);// fluffy chest ruff
      const head=new THREE.Group();head.position.set(0,.25,.05);head.rotation.x=-.5+.1;neck.add(head);const H=.3;
      M(fuzz(sph(H,24,18),.012,40),fur,0,0,0,head).scale.set(1.1,.95,.95);
      for(const sx of [-1,1])M(sph(H*.45,12,10),fur,sx*H*.72,-H*.32,H*.2,head).scale.set(1,.8,.9);// cheek fluff
      M(sph(H*.38,14,10),white,0,-H*.33,H*.76,head).scale.set(1.3,.7,.7);
      M(sph(H*.1,10,8),pink,0,-H*.13,H*.97,head,false,false).scale.set(1.4,.8,.7);
      for(const sx of [-1,1]){const e=M(new THREE.ConeGeometry(H*.36,H*.7,12),fur,sx*H*.55,H*.84,-H*.05,head);e.rotation.z=-sx*.35;e.scale.z=.55;
        const ei=M(new THREE.ConeGeometry(H*.22,H*.46,12),pink,sx*H*.53,H*.8,H*.06,head,false,false);ei.rotation.z=-sx*.35;ei.scale.z=.3;
        for(let i=0;i<3;i++){const w=M(cyl(.004,.004,H*.95,4),whisk,sx*H*.82,-H*.3+(i-1)*H*.07,H*.72,head,false,false);w.rotation.z=Math.PI/2+sx*(i-1)*.18;}}
      fEyes(this,head,H,.42,.08,.8,.38,.25,'#3fae7a');fBlush(head,H,.64,-.22,.7);
      const tail=new THREE.Group();tail.position.set(0,by+r*.25,-(len/2+r*.85));g.add(tail);
      const tp=[fV(0,0,0),fV(0,.28,-.2),fV(0,.62,-.16),fV(0,.86,.06)];taperTube(tp,q=>.12-.02*q,fur,tail,20,12);
      const tc=new THREE.CatmullRomCurve3(tp);for(let i=0;i<9;i++){const p=tc.getPoint(i/8);M(sph(.13-i*.004,10,8),i>6?peach:fur,p.x,p.y,p.z,tail,true,false);}
      Object.assign(o,{neck,head,tail,nTilt:.5,size:1,h:by+.8,rad:.6,dustR:[r,r,len*.8]});}
    // 🦕 a duck-billed dino with a long tube crest on her head
    if(k==='crest'){const r=.4,len=.7,leg=.4,by=leg+r*.6,skin=fm('#ff9a76',{roughness:.7}),belly=fm('#fff1c9'),spot=fm('#ffcf4a'),crestM=fShiny('#4fc9bd',{roughness:.4});
      body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,8,22),skin,0,0,0,body);t.rotation.x=Math.PI/2;M(sph(r*.85,14,10),belly,0,-r*.3,len*.1,body).scale.set(.95,.72,1.3);
      for(let i=0;i<8;i++)M(sph(r*.13,10,8),spot,Math.sin(i*2.3)*r*.62,r*.78,(i/7-.5)*len*1.1,body,false,false).scale.set(1,.4,1);
      for(let i=0;i<7;i++)M(sph(r*.1,10,8),crestM,0,r*.97,(i/6-.5)*len*1.2,body,false,false).scale.set(.6,.7,1.3);// little bumps down her spine
      fLegs(this,g,r*.6,len*.42,leg+.06,leg+.06,.12,skin,fShiny('#ffe2c4'));
      const neck=new THREE.Group();neck.position.set(0,by+r*.4,len/2+r*.45);neck.rotation.x=.55;g.add(neck);
      taperTube([fV(0,0,0),fV(0,.2,.02),fV(0,.42,0)],q=>.18-.05*q,skin,neck,16,12);
      const head=new THREE.Group();head.position.set(0,.44,0);head.rotation.x=-.55+.15;neck.add(head);const H=.24;
      M(sph(H,22,16),skin,0,0,0,head).scale.set(.9,.9,1.2);
      M(sph(H*.72,16,12),belly,0,-H*.28,H*1.02,head).scale.set(1.2,.45,1.1);// the wide duck bill
      for(const sx of [-1,1])M(sph(H*.07,8,6),std('#a0503a'),sx*H*.22,-H*.12,H*1.55,head,false,false);
      taperTube([fV(0,H*.55,-H*.05),fV(0,H*1.1,-H*.65),fV(0,H*1.3,-H*1.45),fV(0,H*1.05,-H*2.2)],q=>H*(.27-.15*q),crestM,head,24,12);
      M(sph(H*.14,10,8),crestM,0,H*1.05,-H*2.2,head,false,false);
      fEyes(this,head,H,.5,.25,.6,.55,.22,'#5a3a12');fBlush(head,H,.62,-.1,.7);
      const tail=new THREE.Group();tail.position.set(0,by+.05,-(len/2+r*.8));g.add(tail);taperTube([fV(0,0,0),fV(0,-.05,-.35),fV(0,-.15,-.7),fV(0,-.3,-1)],q=>.22*(1-q*.85),skin,tail,20,12);
      Object.assign(o,{neck,head,tail,nTilt:.55,size:1.15,h:by+1,rad:.75,dustR:[r,r,len*.8]});}
    // 🦄 a lavender unicorn with feathery wings (they flap when you gallop)
    if(k==='pegacorn'){const sc=1.05,h=horseLike(sc,'#ece6ff',['#8fd8ff','#c6a6ff','#ffb3e0'],{light:'#faf7ff',hoof:'#c6a6ff'}),r=.3*sc,len=.62*sc;
      const horn=M(new THREE.ConeGeometry(h.H*.16,h.H*.95,18),phys('#cfe8ff',{map:TEX.glitter,metalness:.6,roughness:.2,clearcoat:1,iridescence:.8}),0,h.H*1.15,h.H*.65,h.head);horn.rotation.x=.5;
      const fw=fm('#ffffff'),tips=[fm('#ffd6f0'),fm('#d6ecff'),fm('#e6dbff')];this.wings=[];
      for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*r*.72,r*.7,len*.32);body.add(w);const up=new THREE.Group();up.rotation.z=sx*.45;w.add(up);
        for(let i=0;i<6;i++){const L=.5-i*.045,p=new THREE.Group();p.position.z=-i*.055;p.rotation.y=sx*i*.13;up.add(p);
          const f=M(new THREE.CapsuleGeometry(.065,L,4,10),i<2?fw:tips[i%3],sx*(L/2+.04),0,0,p,true,false);f.rotation.z=Math.PI/2;f.scale.set(.35,1,1);}
        M(sph(.08,10,8),fw,0,0,-.12,up,true,false).scale.set(1,.6,1.8);this.wings.push({w,sx,fly:1});}
      this.sparkle=true;}
    // 🐉 the starlight dragon (a prize): midnight blue with glowing star spots, golden horns and big wings
    if(k==='nova'){const r=.42,len=.75,leg=.45,by=leg+r*.6,skin=phys('#3b44a8',{roughness:.45,clearcoat:.5,sheen:.6,sheenColor:new THREE.Color('#8fb8ff')}),belly=fm('#ffe7a8'),
        star=phys('#fff2b0',{emissive:'#ffd23f',emissiveIntensity:1.3,roughness:.3}),gold=fShiny('#ffd86b',{metalness:.5,roughness:.25}),
        wingM=phys('#c6a6ff',{roughness:.5,side:THREE.DoubleSide,transparent:true,opacity:.88,emissive:'#7a4aff',emissiveIntensity:.15});
      body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,8,22),skin,0,0,0,body);t.rotation.x=Math.PI/2;M(sph(r*.85,14,10),belly,0,-r*.3,len*.1,body).scale.set(.95,.72,1.3);
      for(let i=0;i<12;i++){const a=i*2.4,s=M(sph(r*.07,8,6),star,Math.sin(a)*r*.8,r*.45+Math.cos(a*1.7)*r*.3,(i/11-.5)*len*1.2,body,false,false);s.scale.set(1,.6,1);}
      for(let i=0;i<6;i++)M(new THREE.ConeGeometry(.05,.13,6),gold,0,r*.98,len*.45-i*len*.22,body);
      fLegs(this,g,r*.6,len*.42,leg+.06,leg+.06,.12,skin,gold);
      this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*r*.6,r*.75,len*.3);body.add(w);
        const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(.6,.35);sh.lineTo(.55,.05);sh.lineTo(.45,-.05);sh.lineTo(.3,-.02);sh.lineTo(.15,-.1);sh.lineTo(0,-.05);
        const m=M(new THREE.ShapeGeometry(sh),wingM,0,0,0,w,true,false);m.rotation.x=-Math.PI/2;m.scale.set(sx*1.9,1.9,1.9);
        const bone=M(cyl(.028,.016,1.32,6),skin,sx*.57,0,-.33,w);bone.quaternion.setFromUnitVectors(fV(0,1,0),fV(sx*1.14,0,-.665).normalize());// the wing's front edge
        this.wings.push({w,sx,fly:1});}
      const neck=new THREE.Group();neck.position.set(0,by+r*.45,len/2+r*.4);neck.rotation.x=.6;g.add(neck);
      taperTube([fV(0,0,0),fV(0,.25,.03),fV(0,.5,0)],q=>.18-.07*q,skin,neck,16,12);
      for(let i=0;i<3;i++)M(new THREE.ConeGeometry(.035,.09,6),gold,0,.12+i*.15,-.14+i*.02,neck);
      const head=new THREE.Group();head.position.set(0,.52,0);head.rotation.x=-.6+.15;neck.add(head);const H=.26;
      M(sph(H,22,16),skin,0,0,0,head).scale.set(.95,.88,1.15);M(sph(H*.65,16,12),skin,0,-H*.22,H*.85,head).scale.set(.9,.7,1.1);
      M(sph(H*.55,14,10),belly,0,-H*.42,H*.7,head).scale.set(.9,.4,1.1);
      for(const sx of [-1,1]){M(sph(H*.07,8,6),std('#1c1f5a'),sx*H*.2,-H*.12,H*1.5,head,false,false);
        taperTube([fV(sx*H*.4,H*.6,-H*.2),fV(sx*H*.55,H*1.05,-H*.6),fV(sx*H*.6,H*1.25,-H*1.1)],q=>H*(.13-.1*q),gold,head,16,10);
        const fin=M(new THREE.ConeGeometry(H*.2,H*.5,8),wingM,sx*H*.85,H*.25,-H*.25,head);fin.rotation.z=-sx*1.2;fin.scale.z=.3;}
      fEyes(this,head,H,.48,.2,.66,.5,.24,'#ffb020');fBlush(head,H,.62,-.1,.72);
      const tail=new THREE.Group();tail.position.set(0,by+.05,-(len/2+r*.8));g.add(tail);taperTube([fV(0,0,0),fV(0,-.08,-.45),fV(.12,-.25,-.9),fV(.3,-.35,-1.3)],q=>.22*(1-q*.85),skin,tail,24,12);
      const tip=M(new THREE.OctahedronGeometry(.11),star,.32,-.36,-1.4,tail,false,false);tip.scale.set(.6,1,1.2);
      this.sparkle=true;
      Object.assign(o,{neck,head,tail,nTilt:.6,size:1.3,h:by+1.05,rad:.85,dustR:[r,r,len*.8]});}
    // 🦅 a pterodactyl: long beak, a big orange crest and huge leathery wings that fold up along her sides on the ground
    if(k==='ptero'){const r=.3,len=.5,leg=.5,by=leg+r*.55,skin=phys('#5fb8a8',{roughness:.55,sheen:.5,sheenColor:new THREE.Color('#d8fff4')}),belly=fm('#fff1d6'),
        crestM=fShiny('#ff7a45',{roughness:.35}),beakM=fShiny('#ffcf6b',{roughness:.35}),
        memM=phys('#ffa070',{roughness:.6,side:THREE.DoubleSide,transparent:true,opacity:.93,sheen:.4,sheenColor:new THREE.Color('#ffe0c8')}),boneM=fm('#4a9e90');
      body.position.y=by;const t=M(new THREE.CapsuleGeometry(r,len,8,22),skin,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(1,.92,1);
      M(sph(r*.85,14,10),belly,0,-r*.28,len*.12,body).scale.set(.92,.72,1.25);
      // a little fuzz along her back (real pterosaurs were fuzzy!)
      for(let i=0;i<9;i++)M(sph(r*.13,8,6),boneM,0,r*.9,len*.5-i*len*.14,body,false,false).scale.set(1,.5,1.4);
      fLegs(this,g,r*.62,len*.4,leg+.05,leg+.05,.06,skin,crestM);
      // the wings: a leathery skin stretched from the long wing finger back to the body, with a front-edge bone and little claws
      this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*r*.72,r*.5,len*.28);body.add(w);
        const sh=new THREE.Shape();sh.moveTo(0,-.12);sh.lineTo(.75,-.1);sh.lineTo(1.65,.02);sh.quadraticCurveTo(1.3,.2,1.05,.3);sh.quadraticCurveTo(.75,.36,.6,.52);
        sh.quadraticCurveTo(.3,.6,0,.62);sh.lineTo(0,-.12);
        const m=M(new THREE.ShapeGeometry(sh,8),memM,0,0,0,w,true,false);m.rotation.x=-Math.PI/2;m.scale.x=sx;
        taperTube([fV(0,0,.1),fV(sx*.75,.01,.1),fV(sx*1.65,0,-.02)],q=>.05-.032*q,boneM,w,16,8);
        for(const v of [.3,.8])taperTube([fV(sx*v*1.2,0,.08),fV(sx*v*1.05,0,-.5*v-.1)],q=>.014,boneM,w,6,5);// stiff fibers in the skin
        for(let c=0;c<3;c++)M(new THREE.ConeGeometry(.018,.08,6),beakM,sx*.72,-.02,.15+c*.03,w).rotation.x=Math.PI/2+.4;
        this.wings.push({w,sx,fly:0,fold:1.25});}
      const neck=new THREE.Group();neck.position.set(0,by+r*.35,len/2+r*.45);neck.rotation.x=.45;g.add(neck);
      taperTube([fV(0,0,0),fV(0,.28,.04),fV(0,.55,0)],q=>.13-.05*q,skin,neck,16,12);
      const head=new THREE.Group();head.position.set(0,.58,0);head.rotation.x=-.45+.3;neck.add(head);const H=.2;
      M(sph(H,22,16),skin,0,0,0,head).scale.set(.85,.9,1.15);
      const beak=M(new THREE.ConeGeometry(H*.42,H*3.4,18),beakM,0,-H*.18,H*2.4,head);beak.rotation.x=Math.PI/2;beak.scale.set(.75,1,1);
      M(new THREE.ConeGeometry(H*.36,H*2.4,16),beakM,0,-H*.36,H*1.9,head).rotation.x=Math.PI/2+.06;// the lower jaw
      const crest=new THREE.Shape();crest.moveTo(0,0);crest.quadraticCurveTo(H*1.4,H*.9,H*2.6,H*1.25);crest.quadraticCurveTo(H*1.6,H*.15,H*.4,-H*.25);crest.lineTo(0,0);
      const cm=M(new THREE.ExtrudeGeometry(crest,{depth:H*.08,bevelEnabled:true,bevelSize:H*.05,bevelThickness:H*.04,bevelSegments:2,curveSegments:10}),crestM,H*.04,H*.45,-H*.1,head);cm.rotation.y=Math.PI/2;// sweeps back off the top of her head
      fEyes(this,head,H,.5,.2,.62,.55,.26,'#7a3a12');fBlush(head,H,.62,-.15,.7);
      const tail=new THREE.Group();tail.position.set(0,by+.02,-(len/2+r*.75));g.add(tail);taperTube([fV(0,0,0),fV(0,-.04,-.18),fV(0,-.04,-.34)],q=>.07*(1-q*.8),skin,tail,12,8);
      this.sparkle=false;
      Object.assign(o,{neck,head,tail,nTilt:.45,size:1.15,h:by+1.05,rad:.7,dustR:[r,r,len*.8]});}
    // 🦅 a giant bald eagle: brown feathers, white head and tail, a hooked yellow beak and big fingered wings
    if(k==='eagle'){const r=.34,len=.42,leg=.42,by=leg+r*.8,brown=fm('#5a3a22',{roughness:.9}),light=fm('#7a5232',{roughness:.9}),dark=fm('#3b2414',{roughness:.9}),
        white=fm('#fbf8f2',{roughness:.95}),yel=fShiny('#ffc22e',{roughness:.35}),talon=fShiny('#2b211a');
      body.position.y=by;body.rotation.x=-.12;const t=M(new THREE.CapsuleGeometry(r,len,8,22),brown,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(1,.92,1);
      // layers of feathers on the chest and back
      for(let i=0;i<14;i++){const a=(i%7)/6-.5,row=i<7?0:1;M(sph(r*.32,10,8),row?light:brown,a*r*1.3,-r*.35-row*r*.2,len*.35-row*len*.25,body,false,false).scale.set(1,.55,1.3);}
      for(let i=0;i<8;i++)M(sph(r*.28,10,8),dark,(i%2-.5)*r*.6,r*.78,len*.3-i*len*.13,body,false,false).scale.set(1.2,.4,1.4);
      // two strong yellow legs with feathery "trousers" and black talons
      for(const sx of [-1,1]){const lg=new THREE.Group();lg.position.set(sx*r*.45,by-r*.35,len*.05);g.add(lg);
        M(sph(r*.36,10,8),brown,0,-.02,0,lg).scale.set(.8,1.1,.9);M(cyl(.045,.04,leg-.12,10),yel,0,-(leg-.12)/2-.12,0,lg);
        for(const a of [-.45,0,.45]){const toe=M(new THREE.CapsuleGeometry(.025,.12,4,8),yel,Math.sin(a)*.07,-leg+.04,Math.cos(a)*.08,lg);toe.rotation.x=Math.PI/2;toe.rotation.y=a;
          M(new THREE.ConeGeometry(.02,.06,6),talon,Math.sin(a)*.15,-leg+.02,Math.cos(a)*.15,lg).rotation.x=Math.PI/2+.6;}
        M(new THREE.CapsuleGeometry(.025,.08,4,8),yel,0,-leg+.04,-.07,lg).rotation.x=Math.PI/2;
        this.legs.push({g:lg,ph:sx>0?Math.PI:0});}
      // the wings: long brown flight feathers spread out like fingers at the tips, lighter coverts on top
      this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*r*.8,r*.45,len*.25);body.add(w);
        M(new THREE.CapsuleGeometry(.11,.75,6,12),brown,sx*.45,0,-.05,w,true,false).rotation.z=Math.PI/2;// the arm of the wing
        for(let i=0;i<13;i++){const q=i/12,L=.5+.25*Math.sin(q*Math.PI),f=new THREE.Group();f.position.set(sx*(.12+q*.85),0,-.08);f.rotation.y=sx*(-.15+q*.95)*-1;w.add(f);
          const fe=M(new THREE.CapsuleGeometry(.075,L,4,10),i>8?dark:brown,0,0,-L/2-.05,f,true,false);fe.rotation.x=Math.PI/2;fe.scale.set(1,1,.28);}
        for(let i=0;i<4;i++){const f=new THREE.Group();f.position.set(sx*1.02,0,-.02);f.rotation.y=sx*(i*.2-.1);w.add(f);// fingered tips
          const L=.55-i*.04,fe=M(new THREE.CapsuleGeometry(.05,L,4,10),dark,sx*(L/2),0,0,f,true,false);fe.rotation.z=Math.PI/2;fe.scale.set(1,.28,1);}
        for(let i=0;i<5;i++)M(sph(.13,10,8),light,sx*(.15+i*.18),.03,-.05,w,true,false).scale.set(1.1,.35,1.3);
        this.wings.push({w,sx,fly:0,fold:1.3});}
      const neck=new THREE.Group();neck.position.set(0,by+r*.45,len/2+r*.4);neck.rotation.x=.25;g.add(neck);
      M(sph(.19,14,12),white,0,.08,0,neck).scale.set(1,1.15,1);
      const head=new THREE.Group();head.position.set(0,.26,.03);head.rotation.x=-.25;neck.add(head);const H=.2;
      M(sph(H,22,16),white,0,0,0,head).scale.set(.9,.92,1.1);
      for(let i=0;i<10;i++){const a=i/9*Math.PI-Math.PI/2;M(sph(H*.28,8,6),white,Math.sin(a)*H*.7,H*.2-Math.abs(Math.sin(a))*H*.1,-H*.75,head,false,false).scale.set(.8,.6,1.4);}// fluffy feathers at the back of the head
      M(sph(H*.42,14,10),yel,0,-H*.08,H*.88,head).scale.set(.85,.8,1.15);
      const hook=taperTube([fV(0,H*.05,H*1.1),fV(0,H*.0,H*1.45),fV(0,-H*.32,H*1.6),fV(0,-H*.5,H*1.45)],q=>H*(.22-.18*q),yel,head,16,10);
      M(sph(H*.1,8,6),fShiny('#3b2a1a'),0,-H*.05,H*1.25,head,false,false).scale.set(2.2,.5,.5);// nostrils
      fEyes(this,head,H,.5,.12,.6,.75,.24,'#e0a000');
      for(const sx of [-1,1]){const brow=M(sph(H*.22,10,8),white,sx*H*.5,H*.36,H*.55,head,false,false);brow.scale.set(1.2,.45,.9);brow.rotation.z=sx*.25;}// a serious eagle brow
      const tail=new THREE.Group();tail.position.set(0,by+r*.1,-(len/2+r*.8));g.add(tail);
      for(let i=0;i<7;i++){const a=(i/6-.5)*.9,f=new THREE.Group();f.rotation.y=a;tail.add(f);const fe=M(new THREE.CapsuleGeometry(.07,.42,4,10),white,0,0,-.24,f);fe.rotation.x=Math.PI/2;fe.scale.set(1,1,.25);}
      tail.rotation.x=-.15;
      Object.assign(o,{neck,head,tail,nTilt:.25,size:1.15,h:by+.85,rad:.7,dustR:[r,r,len*.8]});}
    // the okapi and the elephants (24c9-zoo-okapi-elephant.js), and the 🦁 safari rides you earn that use those models (24c9b-safari-rides.js):
    // model = which animal to build, gear = put a saddle on it, seat = slide the animal back so you sit that far forward (on the elephant's neck)
    const zk=this.F.model||k;if(ZOO_BUILD[zk]){ZOO_BUILD[zk].call(this,g,body,o);if(this.F.gear)safariGear(k,g,body,o);if(this.F.seat)for(const c of g.children)c.position.z-=this.F.seat;}
    return o;}
  setTag(n){if(this.tag){this.g.remove(this.tag);this.tag.material.map.dispose();this.tag.material.dispose();this.tag=null;}if(!n)return;
    this.tag=sprite(labelTex('💖 '+n,{size:58,fg:'#d6453d',bg:'rgba(255,255,255,.88)',border:null}),.8,.2);this.tag.position.y=this.h+.15;this.g.add(this.tag);}
  speak(text){if(this.say){this.g.remove(this.say);this.say.material.map.dispose();this.say.material.dispose();}const k=Math.max(.55,Math.min(1,this.size)),s=sprite(labelTex(text,{size:46,w:512,h:110,fg:'#3b2357',border:'#ffe0a8'}),1.2*k,.26*k);s.position.y=this.h+.42;this.g.add(s);this.say=s;this.sayT=2.6;}
  showDust(shine){const d=Math.max(0,Math.min(1,(60-shine)/50));this.dust.forEach((s,i)=>{const v=d-i*.12;s.visible=v>0;const k=.4+.6*Math.min(1,v*2);s.scale.set(k,.5*k,k);});}
  // sp = walking speed; the legs swing, the body bobs, the head grazes, the tail swishes
  update(dt,sp){this.t+=dt;const t=this.t,run=Math.min(1.4,sp/(1.2*this.size+.3));this.phase+=dt*(4+run*5)/Math.max(.6,Math.sqrt(this.size));
    const sw=Math.sin(this.phase)*.55*Math.min(1,run);for(const l of this.legs)l.g.rotation.x=Math.sin(this.phase+l.ph)*.55*Math.min(1,run);
    this.body.position.y=(this.by0??(this.by0=this.body.position.y))+Math.abs(Math.sin(this.phase))*.03*this.size*Math.min(1,run)+Math.sin(t*2)*.005;
    if(this.neck){const want=this.nTilt+(this.gz??(this.biped?.5:.95))*this.graze;this.neck.rotation.x+=(want+Math.sin(t*1.3)*.04-this.neck.rotation.x)*Math.min(1,dt*4);}
    if(this.biped&&this.neck&&run>.05)this.neck.position.z=(this.nz0??(this.nz0=this.neck.position.z))+Math.sin(this.phase*2)*.02;
    if(this.tick)this.tick(t,dt,run);
    if(this.tail)this.tail.rotation.y=Math.sin(t*(this.happy>0?9:2.2))*(this.happy>0?.5:.18);
    if(this.F.wingsRun)this.flying=run>.3;// winged rides flap hard while you gallop
    if(this.wings)for(const w of this.wings){if(w.fold){const op=this.wingOpen||0;w.w.rotation.y=w.sx*w.fold*(1-op);w.w.scale.x=.5+.5*op;}w.w.rotation.z=w.fly?w.sx*(-.2+Math.sin(t*(this.flying?14:6))*(this.flying?.6:.25)):w.sx*(this.happy>0||this.y>.02?.5+Math.sin(t*22)*.5:.05);}
    if(this.head){this.wig=Math.max(0,this.wig-dt);this.head.rotation.z=Math.sin(t*14)*.18*this.wig;}
    this.happy=Math.max(0,this.happy-dt);
    this.blink-=dt;const bl=this.blink<0?Math.max(.1,Math.abs(this.blink+.07)/.07):1;if(this.blink<-.14)this.blink=2+Math.random()*4;this.eyes.forEach(e=>e.scale.y=bl);
    if(this.say){this.sayT-=dt;if(this.sayT<0){this.g.remove(this.say);this.say=null;}}
    if(this.sparkle&&Math.random()<dt*2.5)burst(this.g.position.clone().add(new THREE.Vector3((Math.random()-.5)*.8,this.h*.6+Math.random()*.4,(Math.random()-.5)*.8)),rnd(['#ffd23f','#ff8fc8','#8fd8ff']),5,.6,.1);}}

/* ---------- the paddock ---------- */
const BZ=Z.barn,FA={};// FA[k] = the FarmAnimal for every animal you own (and the one you are looking at in the adopt list)
const PADDOCK_AVOID=[[-3.55,-2.2,.95],[3.25,-1.95,.9],[3.65,.9,.75],[-2.1,-.95,.45],[0,3.9,.8]];
function paddockOk(lx,lz,r){return barnOk(lx,lz,r);}
function barnOk(lx,lz,r){if(Math.hypot(lx,lz)>BZ.fence-.45-r)return false;if(lz<BZ.barnBox.lz+BZ.barnBox.d/2+.15+r)return false;
  for(const [x,z,rr] of PADDOCK_AVOID)if(Math.hypot(lx-x,lz-z)<rr+r)return false;return true;}
function paddockSpot(r){for(let i=0;i<60;i++){const lx=(Math.random()*2-1)*4.6,lz=-1.2+Math.random()*5.6;if(paddockOk(lx,lz,r))return [lx,lz];}return [0,1];}
// where each animal lives: the dinosaurs (dino:1) at 🦖 Dino Valley (12i-place-dino-valley.js), everyone else at the barn.
// care = where the one you look after stands, stand = where you stand, out = where you step off when you're done
const HOMES={barn:{id:'barn',Z:BZ,ok:barnOk,spot:paddockSpot,care:[0,1.55],stand:[1.2,3.3],out:[0,3.1],name:'🐴 Happy Barn'},
  dino:{id:'dino',Z:Z.dino,ok:dvOk,spot:dvSpot,care:DV.care,stand:DV.stand,out:DV.out,name:'🦖 Dino Valley'}};
const farmHome=k=>FK[k]&&FK[k].dino?HOMES.dino:HOMES.barn;
function farmAnimal(k){if(FA[k])return FA[k];const a=FA[k]=new FarmAnimal(k),H=farmHome(k);a.home=H;a.Z=H.Z;a.ok=H.ok;a.spot=H.spot;a.mates=FA;scene.add(a.g);const [lx,lz]=H.spot(a.rad);a.lx=lx;a.lz=lz;placeFarm(a);return a;}
function placeFarm(a){const [x,w]=a.Z.toWorld(a.lx,a.lz);a.pos.set(x,a.y,w);a.g.position.copy(a.pos);a.g.rotation.y=a.Z.rot+a.face;a.ob.x=x;a.ob.z=w;a.ob.r=a.g.visible&&!a.ridden?a.rad*.75:0;}
let barnAt='barn',barnOpen=false,barnSel=null,barnTab='mine',barnPreview=null,barnRide=null,onFPad=false,barnZoneIn=false;
function stepFarm(a,dt){if(a.ridden)return;let sp=0;
  if(barnOpen&&a===barnSel&&a.home){// walk over to the care spot and look at you
    const C=a.home.care,dx=C[0]-a.lx,dz=C[1]-a.lz,d=Math.hypot(dx,dz);
    if(d>.08){sp=Math.min(1.6,d*2);a.lx+=dx/d*Math.min(d,sp*dt);a.lz+=dz/d*Math.min(d,sp*dt);a.face=angDamp(a.face,Math.atan2(dx,dz),Math.min(1,dt*6));}
    else a.face=angDamp(a.face,.35,Math.min(1,dt*3));
    a.graze=Math.max(0,a.graze-dt*2);}
  else if(zooOpen&&a===zooSel){// stop and look at you while you pet and feed it
    const [px,pz]=a.Z.toLocal(player.pos.x,player.pos.z);a.face=angDamp(a.face,Math.atan2(px-a.lx,pz-a.lz),Math.min(1,dt*4));a.tgt=null;}
  else{a.wait-=dt;
    if(!a.tgt&&a.wait<=0){if(Math.random()<.45){a.graze=0;a.tgt=a.spot(a.rad,a);}else{a.wait=2+Math.random()*4;a.grazing=Math.random()<.6;}}
    if(a.tgt){const dx=a.tgt[0]-a.lx,dz=a.tgt[1]-a.lz,d=Math.hypot(dx,dz);
      if(d<.15){a.tgt=null;a.wait=1.5+Math.random()*4;a.grazing=Math.random()<.6;}
      else{sp=(.55+.25*Math.random()*0)*Math.max(.7,Math.sqrt(a.size));const st=Math.min(d,sp*dt),nx=a.lx+dx/d*st,nz=a.lz+dz/d*st;
        if(a.ok(nx,nz,a.rad*.7)){a.lx=nx;a.lz=nz;}else{a.tgt=null;a.wait=.5;}a.face=angDamp(a.face,Math.atan2(dx,dz),Math.min(1,dt*4));}}
    a.graze+=((!a.tgt&&a.grazing?1:0)-a.graze)*Math.min(1,dt*2);}
  // gently push apart animals that bump into each other
  for(const k in a.mates){const b=a.mates[k];if(b===a||!b.g.visible||b.ridden||b.esc)continue;const dx=a.lx-b.lx,dz=a.lz-b.lz,d=Math.hypot(dx,dz),m=(a.rad+b.rad)*.75;
    if(d<m&&d>1e-4&&!(barnOpen&&a===barnSel)){const nx=a.lx+dx/d*(m-d)*.5,nz=a.lz+dz/d*(m-d)*.5;if(a.ok(nx,nz,a.rad*.6)){a.lx=nx;a.lz=nz;}}}
  // little hops when happy
  if(a.hop>0&&a.y<=0){a.vy=2.2;a.hop--;}a.vy-=12*dt;a.y=Math.max(0,a.y+a.vy*dt);if(a.y<=0)a.vy=0;
  if(a.F.pal==='fly'){a.y=.5+Math.sin(a.t*2)*.1;a.flying=true;}
  a.update(dt,sp);placeFarm(a);}

/* ---------- riding ---------- */
function startRide(a){if(!a||!a.F.ride)return;closeBarn(true);if(BIKE.on)stopBike(true);if(SK.on)stopSkate(true);barnRide=a;BS.steed=a.k;persist();a.ridden=true;a.ob.r=0;a.graze=0;
  player.pos.set(a.pos.x,player.pos.y,a.pos.z);player.face=a.Z.rot+a.face;cam.yaw=player.face+Math.PI;av.play('ride');
  $('#rideBtn').textContent=`${a.F.e} Hop off`;$('#rideBtn').style.display='block';did('ride',a.k);sfx('tada');a.speak(rnd(a.F.say));
  toast(`Ride ${BS.own[a.k].n} anywhere in town! Tap “Hop off” to get down 💨`);renderActions();}
function stopRide(force){const a=barnRide;if(!a)return;
  if(FLY.on){if(!force){flyLand(true);return;}flyEnd(true);}// up in the air: land first (24h-flying.js)
  flyStraighten(a);FLY.settle=0;FLY.open=FLY.tuck=0;barnRide=null;a.ridden=false;a.y=0;a.vy=0;$('#rideBtn').style.display='none';if(av.emote&&av.emote.id==='ride')av.emote=null;
  const P=player.pos,H=a.home,[lx,lz]=H.Z.toLocal(P.x,P.z);
  if(H.ok(lx,lz,a.rad*.7)){a.lx=lx;a.lz=lz;a.face=player.face-H.Z.rot;const s=a.rad+.45;P.x+=Math.cos(player.face)*s;P.z-=Math.sin(player.face)*s;}
  else{burst(a.g.position.clone().add(new THREE.Vector3(0,a.h*.5,0)),'#ffd23f',30,2);const [x,z]=H.spot(a.rad);a.lx=x;a.lz=z;a.tgt=null;toast(`${BS.own[a.k].n} went home to ${H.name} 💖`);}
  placeFarm(a);renderActions();}
$('#rideBtn').onclick=()=>{sfx('pop');stopRide();};
function rideStep(dt){const a=barnRide,p=player.pos;if(!a)return;if(closetOpen||!started||handsBusy()){stopRide(true);return;}// off during sports, contests and other games
  if(!av.emote||av.emote.id!=='ride')av.play('ride');av.rideW=a.F.wide||0;
  if(flyRide(a,dt))return;// up in the air on a flying ride (24h-flying.js)
  a.pos.set(p.x,p.y,p.z);a.g.position.copy(a.pos);a.g.rotation.y=player.face;a.update(dt,player.speed*.55);
  // sit on the saddle: the avatar's 'ride' pose puts the hips at chair height, so lift everything up to the animal's back
  av.g.position.y=p.y+a.F.ride-.42;
  if(a.F.swim)swimSink(a,av,p,dt,true);}// 🦛 swims in deep water, with you on its back (26f2-hippo-swim.js)
// how much faster than walking: bigger animals go faster, unless the ride says (boost)
const rideBoost=()=>barnRide?barnRide.F.boost||1+Math.min(.9,barnRide.size*.5):1;

/* ---------- little buddies that follow you around town (the baby dragon flies!) ---------- */
function palGo(k){if(BS.pal&&BS.pal!==k)palHome();BS.pal=k;const a=farmAnimal(k);a.along=true;a.ob.r=0;a.tgt=null;
  const P=player.pos;a.pos.set(P.x-Math.sin(player.face)*1.2,P.y+(a.F.pal==='fly'?1.4:0),P.z-Math.cos(player.face)*1.2);a.g.position.copy(a.pos);burst(a.pos.clone().add(new THREE.Vector3(0,.4,0)),'#ffd23f',20,1.5);}
function palHome(){const k=BS.pal;BS.pal=null;persist();const a=FA[k];if(!a)return;a.along=false;const H=a.home;
  if(Math.hypot(a.pos.x-H.Z.x,a.pos.z-H.Z.z)>H.Z.r){burst(a.pos.clone(),'#ffd23f',20,1.5);[a.lx,a.lz]=H.spot(a.rad);}else{const [lx,lz]=H.Z.toLocal(a.pos.x,a.pos.z);if(H.ok(lx,lz,a.rad)){a.lx=lx;a.lz=lz;}else[a.lx,a.lz]=H.spot(a.rad);}
  a.y=0;a.flying=a.F.pal==='fly';placeFarm(a);}
const palV=new THREE.Vector3();
function palStep(a,dt){if(barnOpen&&a===barnSel){if(a.along){a.along=false;[a.lx,a.lz]=[a.home.care[0],a.home.care[1]+1];}stepFarm(a,dt);return;}
  if(!a.along){a.along=true;}
  const P=player.pos,fly=a.F.pal==='fly',back=player.face+Math.PI+(fly?.5:.75),r=(fly?.75:.95)+a.rad;
  palV.set(P.x+Math.sin(back)*r,fly?P.y+1.45+Math.sin(a.t*2.2)*.12:P.y,P.z+Math.cos(back)*r);
  const dx=palV.x-a.pos.x,dz=palV.z-a.pos.z,d=Math.hypot(dx,dz);
  if(d>14){a.pos.copy(palV);}else{const sp=d>.15?Math.min(9,1.5+d*3):0;if(sp){a.pos.x+=dx/d*Math.min(d,sp*dt);a.pos.z+=dz/d*Math.min(d,sp*dt);a.face=angDamp(a.face,Math.atan2(dx,dz),Math.min(1,dt*8));}
    else a.face=angDamp(a.face,player.face,Math.min(1,dt*3));a.pos.y+=(palV.y-a.pos.y)*Math.min(1,dt*(fly?4:12));a.spd=sp;}
  if(!fly){const gy=groundAt(a.pos.x,a.pos.z);if(a.pos.y<gy)a.pos.y=gy;}
  a.flying=fly;a.graze=0;a.g.position.copy(a.pos);a.g.rotation.y=a.face;a.ob.r=0;a.update(dt,fly?0:(a.spd||0));
  if(fly&&Math.random()<dt*.6)burst(a.pos.clone().add(new THREE.Vector3(0,.1,0)),rnd(['#ff8fc8','#b388ff','#ffd23f']),4,.5,.08);}

/* ---------- the barn sheet ---------- */
const fCoins=()=>SAVE.coins||0;
const starsEarned=()=>(SAVE.chal&&SAVE.chal.stars)||0;
function barnMoney(){$('#barnMoney').textContent=`🪙 ${fCoins()} · ⭐ ${starsLeft()} to spend`;}
// the barn sheet opens at the 🐴 Happy Barn ('barn') or at 🦖 Dino Valley ('dino'), and only shows the animals that live there
const atHome=f=>(barnAt==='dino')===!!f.dino;
const myHere=()=>Object.keys(BS.own).filter(k=>FK[k]&&atHome(FK[k]));
function openBarn(at){if(closetOpen||!started)return;closeTalk();barnAt=at==='dino'?'dino':'barn';const H=HOMES[barnAt];barnOpen=closetOpen=true;H.Z.padLbl.visible=false;
  document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';$('#barnUI h2').textContent=barnAt==='dino'?'🦖 Dino Valley':'🐴 Happy Barn';
  const mine=myHere();barnTab=mine.length?'mine':barnAt==='dino'?'rare':'adopt';if(!barnSel||!BS.own[barnSel.k]||!atHome(barnSel.F))barnSel=mine.length?farmAnimal(BS.sel&&mine.includes(BS.sel)?BS.sel:mine[0]):null;
  const [px,pz]=H.Z.toWorld(...H.stand);player.pos.set(px,groundAt(px,pz),pz);player.vy=0;player.speed=0;
  fcam.p.copy(camera.position);fcam.t.copy(cam.fv||player.pos);fcam.dy=0;
  if(barnSel){const n=farmNeed(barnSel.k);setTimeout(()=>{if(barnOpen&&barnSel)barnSel.speak(n||rnd(barnSel.F.say));},600);}
  else{const l=tabList(barnTab);if(l.length)previewFarm(l[0].k);}
  renderBarn();$('#barnUI').classList.add('show');$('#barnContent').scrollTop=0;sfx('tada');thumbsSoon();}
function closeBarn(keep){if(!barnOpen)return;const H=HOMES[barnAt];barnOpen=closetOpen=false;H.Z.padLbl.visible=true;document.body.classList.remove('dressing');$('#barnUI').classList.remove('show');
  clearPreview();persist();if(!keep){const [px,pz]=H.Z.toWorld(...H.out);player.pos.set(px,groundAt(px,pz),pz);cam.yaw=cam.cy=H.Z.rot;player.face=H.Z.rot;}}
$('#barnDone').onclick=()=>closeBarn();
function clearPreview(){if(barnPreview&&!BS.own[barnPreview.k]){const a=barnPreview;scene.remove(a.g);a.ob.r=0;const i=obs.indexOf(a.ob);if(i>=0)obs.splice(i,1);delete FA[a.k];
  a.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});}barnPreview=null;}
function previewFarm(k){if(barnPreview&&barnPreview.k===k)return;clearPreview();const a=farmAnimal(k);if(!BS.own[k]){a.lx=a.home.care[0];a.lz=a.home.care[1]+.6;a.face=.35;barnPreview=a;a.setTag('');}barnSel=a;
  a.speak(rnd(a.F.say));a.hop=1;placeFarm(a);}
const FTABS=[['mine','💖','My animals'],['adopt','🪙','Adopt'],['rare','⭐','Rare'],['pals','🐉','Buddies']];
// here: only the animals that live where the sheet is open (the animal book passes false to list them all)
const tabList=(t,here=true)=>FARM.filter(f=>(!here||atHome(f))&&(t==='mounts'?f.mount||f.prize||f.earn:t==='pals'?f.pal:t==='rare'?f.s&&!f.pal:f.c&&!f.pal));
const fMeter=(e,n,v)=>`<div class="meter">${e} ${n}<i><b style="width:${Math.round(v)}%"></b></i></div>`;
function renderBarn(){barnMoney();const mine=FARM.filter(f=>BS.own[f.k]&&atHome(f)),dn=barnAt==='dino';
  $('#barnTabs').innerHTML=FTABS.filter(([id])=>id==='mine'||tabList(id).length).map(([id,e,n])=>`<button class="tab${id===barnTab?' on':''}" data-ftab="${id}"><b>${dn&&id==='pals'?'🦖':dn&&id==='mine'?'🦕':e}</b>${dn&&id==='mine'?'My dinosaurs':n}</button>`).join('');
  let h='',m='';const a=barnSel,F=a&&a.F;
  if(barnTab==='mine'){
    if(!mine.length)h=dn?`<p class="drawhint" style="margin-top:14px">You don't have any dinosaurs yet. Tap <b>⭐ Rare</b> or <b>🦖 Buddies</b> to adopt your first one!</p>`:`<p class="drawhint" style="margin-top:14px">You don't have any barn animals yet. Tap <b>🪙 Adopt</b> to pick your first one!</p>`;
    else{h=`<div class="farmRow">${mine.map(f=>`<button class="item${a&&a.k===f.k?' on':''}" data-fsel="${f.k}">${fThumb(f)}<span>${esc(BS.own[f.k].n)}</span></button>`).join('')}</div>`;
      if(a&&BS.own[a.k]){const c=farmCare(a.k);a.showDust(c.shine);m=fMeter('🌾','Food',c.food)+fMeter('✨','Shiny',c.shine)+fMeter('💖','Love',c.love);
        h+=`<div class="farmName"><label>Name</label><input id="farmName" maxlength="14" value="${esc(BS.own[a.k].n)}" aria-label="Animal name"></div>
          <h3>Feed ${esc(BS.own[a.k].n)}</h3><div class="ctbtns farmBtns">${F.food.map(([e,n],i)=>`<button class="btn ghost" data-ffeed="${i}">${e} ${n}</button>`).join('')}</div>
          <h3>Care</h3><div class="ctbtns farmBtns"><button class="btn ghost" data-fdo="brush">🪮 Brush</button><button class="btn ghost" data-fdo="hug">💖 Hug</button><button class="btn ghost" data-fdo="water">💧 Water</button></div>
          ${F.pal?`<div class="ctbtns"><button class="btn big" data-fdo="along">${BS.pal===a.k?`🏠 ${esc(BS.own[a.k].n)} stays ${dn?'in Dino Valley':'at the barn'}`:`🐾 Take ${esc(BS.own[a.k].n)} with you!`}</button></div><p class="drawhint">${F.pal==='fly'?'Flies along behind you everywhere you go!':'Follows you all around town!'}</p>`:F.ride?`<div class="ctbtns"><button class="btn big" data-fdo="ride">🏇 Ride ${esc(BS.own[a.k].n)}!</button></div>`:`<p class="drawhint">${F.n}s are too little to ride, but they love hugs!</p>`}`;}}}
  else{const list=tabList(barnTab);
    h=`<button class="catLink" data-fbook="1">📖 See every animal in the game</button>`+(barnTab==='adopt'?`<button class="dinoLink" data-ftabgo="rare">🦄 Looking for the unicorn? Tap here for ⭐ Rare!</button><button class="dinoLink" data-ftabgo="pals">🐉 A baby dragon or a monkey that follows you? Tap here for Buddies!</button>`:'')+(!dn&&barnTab!=='mine'?`<button class="dinoLink" data-fdino="1">🦖 The dinosaurs moved to Dino Valley! Tap to find the way there.</button>`:'')+(barnTab==='rare'?`<div class="starNote">⭐ <b>${starsEarned()}</b> earned · <b>${starsLeft()}</b> left to spend<small>The ⭐ at the top counts every star you ever earned (that's your rank), so it never goes down. Rare animals use stars from "left to spend". Earn more from ⭐🏆 challenges!</small></div>`:'')+
      `<div class="grid">${list.map(f=>{const own=!!BS.own[f.k];return `<button class="item${a&&a.k===f.k?' on':''}" data-fpick="${f.k}">${fThumb(f)}<span>${f.n}</span><em class="${own?'got':''}">${own?'✅ Yours':f.s?`⭐ ${f.s}`:`🪙 ${f.c}`}</em></button>`;}).join('')}</div>`;
    if(a&&list.includes(F)){const own=!!BS.own[a.k],have=F.s?starsLeft():fCoins(),cost=F.s||F.c,cur=F.s?'⭐':'🪙';
      h+=`<div class="farmAbout"><b>${F.e} ${F.n}</b><span>${F.about}</span>${F.ride?'<span>🏇 You can ride this one!</span>':''}
        ${own?`<button class="btn ghost" data-fsel="${F.k}">💖 See ${esc(BS.own[F.k].n)}</button>`:have>=cost?`<button class="btn" data-fadopt="${F.k}">Adopt for ${cost} ${cur}</button>`:`<p class="bneed">You need <b>${cost-have}</b> more ${cur}</p><p class="drawhint">${F.s?'Finish ⭐🏆 challenges to earn stars!':'Earn coins from challenges, stars, pets and the bakery!'}</p>`}</div>`;}}
  $('#barnMeters').innerHTML=m;$('#barnMeters').style.display=m?'':'none';$('#barnContent').innerHTML=h;
  const ni=$('#farmName');if(ni)ni.onchange=()=>{const v=ni.value.trim().slice(0,14);if(!v||!barnSel||!BS.own[barnSel.k])return;BS.own[barnSel.k].n=v;barnSel.setTag(v);persist();renderBarn();};}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#barnTabs').onclick=e=>{const b=e.target.closest('[data-ftab]');if(!b)return;barnTab=b.dataset.ftab;sfx('pop');
  if(barnTab==='mine'){clearPreview();const mine=myHere();barnSel=mine.length?farmAnimal(BS.sel&&mine.includes(BS.sel)?BS.sel:mine[0]):null;}
  else{const list=tabList(barnTab);if(!barnSel||!list.includes(barnSel.F))previewFarm((list.find(f=>!BS.own[f.k])||list[0]).k);}
  renderBarn();$('#barnContent').scrollTop=0;};
$('#barnContent').onclick=e=>{const b=e.target.closest('button');if(!b||!barnOpen)return;const d=b.dataset;
  if(d.fsel){clearPreview();barnTab='mine';barnSel=farmAnimal(d.fsel);BS.sel=d.fsel;persist();barnSel.speak(farmNeed(d.fsel)||rnd(barnSel.F.say));sfx('pop');renderBarn();return;}
  if(d.fpick){previewFarm(d.fpick);sfx('pop');renderBarn();return;}
  if(d.fadopt)return adoptFarm(d.fadopt);
  if(d.ftabgo){barnTab=d.ftabgo;const l=tabList(barnTab);previewFarm((l.find(f=>!BS.own[f.k])||l[0]).k);sfx('pop');renderBarn();$('#barnContent').scrollTop=0;return;}
  if(d.fbook){closeBarn();setTimeout(openCatalog,350);return;}
  if(d.fdino){closeBarn();setDest(Z.dino);sfx('star');toast('Follow the pink arrow on the map to 🦖 Dino Valley 💗');return;}
  const a=barnSel;if(!a||!BS.own[a.k])return;const c=farmCare(a.k),top=()=>a.g.position.clone().add(new THREE.Vector3(0,a.h*.75,0));
  if(d.ffeed!=null){const [fe,fn]=a.F.food[+d.ffeed];c.food=Math.min(100,c.food+34);a.graze=1;a.eatT=1.4;floaties(top(),fe,5);a.speak(`Yum, ${fn.toLowerCase()}! 😋`);tone(520,.08,'triangle',.1);tone(660,.08,'triangle',.1,.1);did('farmfeed',a.k);}
  if(d.fdo==='brush'){c.shine=Math.min(100,c.shine+26);a.wig=.6;burst(top(),'#ffffff',18,1.2,.12);floaties(top(),'✨',3);a.showDust(c.shine);tone(900,.05,'sine',.08);tone(1200,.05,'sine',.08,.06);
    if(c.shine>=100){a.speak('So shiny! ✨');did('brush',a.k);}else a.speak(rnd(['Ahh, that feels nice!','More please! 🪮','*happy wiggle*']));}
  if(d.fdo==='hug'){c.love=Math.min(100,c.love+30);a.happy=2;a.hop=2;floaties(top(),'💖',7);a.speak(rnd(a.F.say));sfx('pop');}
  if(d.fdo==='water'){c.food=Math.min(100,c.food+10);c.love=Math.min(100,c.love+8);floaties(top(),'💧',5);a.speak('Slurp slurp! 💧');tone(400,.1,'sine',.08);}
  if(d.fdo==='ride'){persist();return startRide(a);}
  if(d.fdo==='along'){if(BS.pal===a.k){palHome();renderBarn();}else{palGo(a.k);did('pal',a.k);closeBarn();toast(`${BS.own[a.k].n} is coming with you! ${a.F.e}💖`);}persist();return;}
  // a happy animal (everything full) gives you coins once a day
  const day=new Date().toDateString();if(c.food>=90&&c.shine>=90&&c.love>=90&&c.bonus!==day){c.bonus=day;setTimeout(()=>{earn(5,`${BS.own[a.k].n} is so happy`);a.hop=3;banner(`${a.F.e} ${BS.own[a.k].n} is super happy!`);},700);}
  persist();renderBarn();};
function adoptFarm(k){const F=FK[k];if(BS.own[k])return;
  if(F.s){if(starsLeft()<F.s)return;BS.spent=(BS.spent||0)+F.s;}else{if(fCoins()<F.c)return;SAVE.coins-=F.c;showCoins(true);}
  BS.own[k]={n:F.nm,food:80,shine:80,love:70,t:Date.now()};BS.sel=k;persist();did('farm',k);if(F.ride)renderActions();
  const a=farmAnimal(k);if(barnPreview===a)barnPreview=null;a.setTag(F.nm);a.happy=3;a.hop=3;barnSel=a;barnTab='mine';
  floaties(a.g.position.clone().add(new THREE.Vector3(0,a.h,0)),'💖',10);for(let i=0;i<3;i++)setTimeout(()=>burst(a.g.position.clone().add(new THREE.Vector3((Math.random()-.5)*1.5,a.h,(Math.random()-.5)*1.5)),rnd(['#ff8fc8','#ffd23f','#8fd8ff']),40,3),i*220);
  sfx('tada');banner(`${F.e} Welcome home, ${F.nm}!`);a.speak(rnd(F.say));renderBarn();}

/* ---------- little pictures of each animal for the lists (drawn once with the real 3D models) ---------- */
const FTHUMB={};
const fThumb=f=>FTHUMB[f.k]?`<img class="fthumb" src="${FTHUMB[f.k]}" alt="">`:`<b>${f.e}</b>`;
let thumbBusy=false,picKit=null;
function farmPic(k,S=160,yaw=.6){if(!picKit){const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#d9c7b0',2.2));const dl=new THREE.DirectionalLight('#ffffff',2.4);dl.position.set(2,3,4);sc.add(dl);picKit={sc,cm:new THREE.PerspectiveCamera(30,1,.05,50)};}
  const {sc,cm}=picKit,rt=new THREE.WebGLRenderTarget(S,S,{samples:4}),buf=new Uint8Array(S*S*4),cv=document.createElement('canvas');cv.width=cv.height=S;const cx=cv.getContext('2d'),id=cx.createImageData(S,S);
  const lin2s=v=>{v/=255;v=v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055;return Math.max(0,Math.min(255,Math.round(v*255)));};
  const a=new FarmAnimal(k);const i=obs.indexOf(a.ob);if(i>=0)obs.splice(i,1);a.dust.forEach(d=>d.visible=false);a.g.rotation.y=a.F.fly?yaw+.55:yaw;// flyers a bit more from the side, so you see the beak, crest and wings
  // rides with wings show them spread up in a V, the way they look taking off (flat wings are just thin lines from the side)
  if(a.wings&&a.F.fly)for(const w of a.wings){w.w.rotation.set(0,0,w.sx*.6);w.w.scale.x=1;}
  sc.add(a.g);a.g.updateMatrixWorld(true);
  try{const bb=new THREE.Box3().setFromObject(a.g),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3()),d=Math.max(sz.x,sz.y,sz.z)*2.25;
    const up=a.F.fly?.45:.25;cm.position.set(c.x+d*.35,c.y+d*up,c.z+d*.9);cm.lookAt(c);
    const oc=renderer.getClearColor(new THREE.Color()),oa=renderer.getClearAlpha();renderer.setRenderTarget(rt);renderer.setClearColor('#000000',0);renderer.clear();renderer.render(sc,cm);
    renderer.readRenderTargetPixels(rt,0,0,S,S,buf);renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const s=((S-1-y)*S+x)*4,t=(y*S+x)*4,al=buf[s+3];if(!al){id.data[t+3]=0;continue;}
      id.data[t]=lin2s(buf[s]*255/al);id.data[t+1]=lin2s(buf[s+1]*255/al);id.data[t+2]=lin2s(buf[s+2]*255/al);id.data[t+3]=al;}
    cx.putImageData(id,0,0);return cv.toDataURL('image/png');}
  finally{renderer.setRenderTarget(null);rt.dispose();sc.remove(a.g);freeObj(a.g);}}
function thumbsSoon(){if(thumbBusy)return;const isRide=f=>f.mount||f.prize,todo=FARM.concat(ZOOA).filter(f=>!FTHUMB[f.k]).sort((a,b)=>!!isRide(b)-!!isRide(a));if(!todo.length)return;thumbBusy=true;
  // the rides from the shop are drawn first, and the shop and ride button show them as soon as they're done
  const one=()=>{const f=todo.shift();if(f&&!isRide(f)&&todo.length&&FARM.concat(ZOOA).filter(isRide).every(r=>FTHUMB[r.k])&&!one.told){one.told=1;if(shopOpen&&stab==='rides')renderShop();renderActions();}if(!f){thumbBusy=false;if(barnOpen)renderBarn();if(catOpen)renderCatalog();if(shopOpen&&stab==='rides')renderShop();renderActions();if($('#rides').classList.contains('show'))renderRides();return;}try{FTHUMB[f.k]=farmPic(f.k);}catch(e){}setTimeout(one,30);};setTimeout(one,50);}

/* ---------- the safari zoo (12d-place-zoo.js): walk up to an animal, pet it, feed it and learn about it ---------- */
const ZZ=Z.zoo,ZA=[];let zooOpen=false,zooSel=null,zooNear=null;
function zooOk(lx,lz,r){if(Math.hypot(lx,lz)>ZZ.fence-.45-r)return false;for(const [x,z,rr] of ZZ.avoid)if(Math.hypot(lx-x,lz-z)<rr+r)return false;return true;}
function zooSpot(r){for(let i=0;i<60;i++){const a=Math.random()*Math.PI*2,d=Math.random()*(ZZ.fence-1),lx=Math.sin(a)*d,lz=Math.cos(a)*d;if(zooOk(lx,lz,r))return [lx,lz];}return [0,0];}
// 🚰 out the back gap of the fence and down the trail to the shore, where the animals drink (it fans out wider by the water)
function zooShoreOk(lx,lz,r){const f=ZZ.fence,e=ZOO_SHORE.edge;if(lz>-f+1.6+r||lz<e)return false;return Math.abs(lx)<1.3-r*.5+Math.max(0,(-f-lz))*.55;}
function zooOk2(lx,lz,r){return zooOk(lx,lz,r)||zooShoreOk(lx,lz,r);}
// now and then an animal walks down to the water for a drink (it stops at the edge and puts its head down)
// (going in or out, it walks to the gap in the fence first)
function zooSpot2(r,a){const f=ZZ.fence,out=a&&a.lz<-f+.3;
  if(a&&a.next){const n=a.next;a.next=null;return n;}
  if(out){a.next=zooSpot(r);return [0,-f+.6+r];}
  if(Math.random()<.2){const lz=ZOO_SHORE.edge+r*.6+.15,w=1.3+(-f-lz)*.55-r-.3,s=[(Math.random()*2-1)*Math.max(0,w),lz];
    if(a){a.next=s;return [0,-f+.6+r];}return s;}
  return zooSpot(r);}
// 🦛🐊 the hippo and the alligator live in the water just off the zoo's shore, and sometimes come up onto the sand
const HIPPO_WATER={x:9,near:-(R+3.2-ZZ.d),far:-(R+12-ZZ.d)};
function zooOkH(lx,lz,r){return (Math.abs(lx)<HIPPO_WATER.x&&lz<ZOO_SHORE.edge+.5&&lz>HIPPO_WATER.far)||zooShoreOk(lx,lz,r);}
function zooSpotH(r){const W=HIPPO_WATER;if(Math.random()<.8)return [(Math.random()*2-1)*(W.x-1),W.near-1-Math.random()*(W.near-W.far-1.5)];
  const lz=ZOO_SHORE.edge-.2;return [(Math.random()*2-1)*2.5,lz];}
for(const [k,sc] of [['zebra',1],['zebra',.8],['giraffe',1],['giraffe',.75],['rhino',1],['rhino',.6],['okapi',1],['elephant',1],['elephant',.55],['lion',1],['gorilla',1],['hippo',1],['cheetah',1],['tiger',1],['gator',1]]){const a=new FarmAnimal(k);a.Z=ZZ;a.ok=zooOk2;a.spot=zooSpot2;a.mates=ZA;
  if(a.F.swim){a.ok=zooOkH;a.spot=zooSpotH;}
  if(sc!==1){a.g.scale.setScalar(sc);a.h*=sc;a.rad*=sc;a.size*=sc;a.baby=true;}a.dust.forEach(d=>d.visible=false);ZA.push(a);scene.add(a.g);[a.lx,a.lz]=a.spot(a.rad);placeFarm(a);}
const zooSeen=()=>SAVE.zoo||(SAVE.zoo={});
function zooButton(p){if(closetOpen||!started||barnRide){if(zooNear){zooNear=null;$('#zooBtn').style.display='none';}return;}
  let best=null,bd=1e9;for(const a of ZA){if(a.esc)continue;const d=Math.hypot(p.x-a.pos.x,p.z-a.pos.z)-a.rad;if(d<1.3&&d<bd){bd=d;best=a;}}
  if(best!==zooNear){zooNear=best;const b=$('#zooBtn');if(best){aniIco(b,best.F.e,'Meet',`Meet the ${best.baby?'baby ':''}${best.F.n.toLowerCase()}`);b.style.display='block';}else b.style.display='none';}}
$('#zooBtn').onclick=()=>{if(zooNear)openZoo(zooNear);};
function openZoo(a){if(closetOpen||!started)return;closeTalk();zooOpen=closetOpen=true;zooSel=a;$('#zooBtn').style.display='none';zooNear=null;
  document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';player.speed=0;
  fcam.p.copy(camera.position);fcam.t.copy(cam.fv||player.pos);
  if(a.F.arctic){const I=SAVE.ice||(SAVE.ice={});I.seen||={};if(!I.seen[a.k]){I.seen[a.k]=1;persist();}did('icelearn',a.k);}// ❄️ polar animals count for the Polar challenges, not the Safari ones
  else if(a.F.dino)did('dinolearn',a.k);// 🦖 Dino Valley
  else{const seen=zooSeen();if(!seen[a.k]){seen[a.k]=1;persist();did('zoolearn',a.k);}}
  a.speak(rnd(a.F.say));renderZoo();$('#zooUI').classList.add('show');$('#zooContent').scrollTop=0;sfx('pop');}
function closeZoo(){if(!zooOpen)return;zooOpen=closetOpen=false;document.body.classList.remove('dressing');$('#zooUI').classList.remove('show');
  const a=zooSel;zooSel=null;if(a){const yaw=Math.atan2(a.pos.x-player.pos.x,a.pos.z-player.pos.z);cam.yaw=cam.cy=yaw+Math.PI;player.face=yaw;}}
$('#zooDone').onclick=closeZoo;
function renderZoo(){const a=zooSel;if(!a)return;const F=a.F;
  $('#zooTitle').textContent=`${F.e} ${a.baby?'Baby ':''}${F.n}`;
  $('#zooContent').innerHTML=`<div class="zfacts">${F.facts.map(([e,t,d])=>`<div><b>${e}</b><span><strong>${t}</strong>${d}</span></div>`).join('')}</div>
    ${(r=>r?`<p class="drawhint">${BS.own[r.k]?`🏇 You earned ${r.e} ${esc(BS.own[r.k].n)}! Tap 🏇 with your moves to ride.`:`🏆 Want to ride one? Finish the ${r.arctic?'❄️ Polar':'🦁 Safari'} challenges (⭐🏆 at the top) to earn ${r.e} ${r.nm}!`}</p>`:'')(FARM.find(f=>f.safari&&(f.zoo||f.model)===a.k))}
    ${(r=>r?`<p class="drawhint">${BS.own[r.k]?`💖 ${esc(BS.own[r.k].n)} is yours! Step on the 🦖 footprint by the Dino Keeper's hut to take care of ${esc(BS.own[r.k].n)}.`:`🥚 Want one of your own? Step on the 🦖 footprint by the Dino Keeper's hut to adopt ${r.e} ${r.nm} with ⭐ stars!`}</p>`:'')(a.F.dino&&FARM.find(f=>f.dino&&f.model===a.k))}
    <div class="ctbtns farmBtns">${F.food.map(([e,n],i)=>`<button class="btn ghost" data-zfeed="${i}">${e} Feed ${n.toLowerCase()}</button>`).join('')}<button class="btn ghost" data-zpet="1">🤚 Pet</button></div>`;}
$('#zooContent').onclick=e=>{const b=e.target.closest('button');const a=zooSel;if(!b||!a)return;const top=a.g.position.clone().add(new THREE.Vector3(0,a.h*.8,0));
  if(b.dataset.zfeed!=null){const [fe,fn]=a.F.food[+b.dataset.zfeed];a.graze=a.k==='giraffe'?0:1;a.wig=.4;floaties(top,fe,5);a.speak(`Yum, ${fn.toLowerCase()}! 😋`);tone(520,.08,'triangle',.1);tone(660,.08,'triangle',.1,.1);did(a.F.arctic?'icefeed':a.F.dino?'dinofeed':'zoofeed',a.k);setTimeout(()=>{a.graze=0;},1500);}
  if(b.dataset.zpet){a.happy=2;a.wig=.6;floaties(top,'💖',6);a.speak(rnd(a.F.say));sfx('pop');did('zoopet',a.k);}
  // a little thank-you once a day for each kind of animal you feed and pet
  const day=new Date().toDateString(),z=zooSeen();z.fed||={};if(b.dataset.zfeed!=null&&z.fed[a.k]!==day){z.fed[a.k]=day;persist();setTimeout(()=>earn(3,`Fed the ${a.F.n.toLowerCase()}`),700);}};
function zooStep(p,dt){if(Math.hypot(p.x-ZZ.x,p.z-ZZ.z)<40||zooOpen)for(const a of ZA){if(a.esc)continue;stepFarm(a,dt);if(a.F.swim)swimSink(a,null,a.pos,dt);}zooButton(p);
  if(zooOpen&&zooSel&&Math.hypot(p.x-zooSel.pos.x,p.z-zooSel.pos.z)>8)closeZoo();}

/* ---------- the animal book: every animal in the game, where to find it and what it costs ---------- */
const PET_E={cat:'🐱',dog:'🐶',squirrel:'🐿️',bunny:'🐰',monkey:'🐒',hedgehog:'🦔'};
let catOpen=false;
function renderCatalog(){const st=myStars(),row=(ico,name,sub,tag,cls,go)=>`<div class="catRow">${ico}<span><strong>${name}</strong><small>${sub}</small></span><em class="${cls}">${tag}</em>${go?`<button data-catgo="${go}" aria-label="Show the way">📍</button>`:''}</div>`;
  const pets=PETS.map(pt=>{const need=(pt.o&&pt.o.stars)||0,z=pt.home;
    return row(`<b>${PET_E[pt.kind]||'🐾'}</b>`,esc(pt.name),`A ${pt.kind} who lives at ${z?z.name:'town'}`,pt.owned?'💖 Your pet':need?(st>=need?`✅ ⭐ ${need} reached`:`🔒 ⭐ ${need} stars`):'Free!',pt.owned?'got':need?(st>=need?'got':'star'):'free',z&&z.id);});
  const farm=f=>row(fThumb(f),f.n,BS.own[f.k]?`Yours! Named ${esc(BS.own[f.k].n)}`:f.about,BS.own[f.k]?'✅ Yours':f.s?`⭐ ${f.s}`:`🪙 ${f.c}`,BS.own[f.k]?'got':f.s?'star':'coin',f.dino?'dino':'barn');
  $('#catList').innerHTML=`<div class="cnote">You've earned ⭐ ${st} stars and have ⭐ ${starsLeft()} left to spend. Pets are free to adopt. Some need a certain number of ⭐ stars first (you keep your stars). Barn animals and little buddies cost 🪙 coins, and the rare ones cost ⭐ stars (spending stars never lowers your rank).</div>
    <h3>🐾 Pets around town</h3>${pets.join('')}
    <h3>🐴 Barn animals · 🪙 coins</h3>${tabList('adopt',false).map(farm).join('')}
    <h3>✨ Rare animals · ⭐ stars (dinosaurs live at 🦖 Dino Valley)</h3>${tabList('rare',false).map(farm).join('')}
    <h3>🐉 Little buddies who follow you</h3>${tabList('pals',false).map(farm).join('')}
    <h3>🦖 Rides from the 🛍️ shop · ⭐ stars</h3>${tabList('mounts',false).map(f=>row(fThumb(f),f.n,BS.own[f.k]?`Yours! Named ${esc(BS.own[f.k].n)}`:f.about,BS.own[f.k]?'✅ Yours':f.earn?earnTag(f.earn):f.prize?`🏆 Earn ⭐ ${f.prize}`:`⭐ ${f.mount}`,BS.own[f.k]?'got':'star',null)).join('')}
    <h3>🦖 Dino Valley · free to visit</h3>${ZOOA.filter(f=>f.dino).map(f=>row(fThumb(f),f.n,'Meet them, feed them and learn about them','Visit','free','dino')).join('')}
    <h3>🦒 Safari Zoo · free to visit</h3>${ZOOA.filter(f=>!f.arctic&&!f.dino).map(f=>row(fThumb(f),f.n,'Pet them, feed them and learn about them','Visit','free','zoo')).join('')}
    <h3>❄️ Polar Ice · free to visit</h3>${ZOOA.filter(f=>f.arctic).map(f=>row(fThumb(f),f.n,'Pet them, feed them and learn about them','Visit','free','arctic')).join('')}`;
  $('#catStars').textContent=`⭐ ${starsLeft()} to spend · 🪙 ${fCoins()}`;}
function openCatalog(){if(!started||closetOpen)return;try{closeTalk();}catch(e){}joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';catOpen=true;renderCatalog();$('#catalog').classList.add('show');$('#catList').scrollTop=0;sfx('pop');thumbsSoon();}
function closeCatalog(){catOpen=false;$('#catalog').classList.remove('show');}
$('#catBtn').onclick=openCatalog;$('#catDone').onclick=closeCatalog;
$('#catalog').onclick=e=>{if(e.target.id==='catalog')return closeCatalog();const b=e.target.closest('[data-catgo]');if(!b)return;const z=Z[b.dataset.catgo];if(!z)return;
  closeCatalog();setDest(z);sfx('star');toast(`Follow the pink arrow on the map to ${z.name} 💗`);};

/* ---------- every frame (called from the game loop) ---------- */
function barnStep(p,dt){
  zooStep(p,dt);
  const near={};for(const id in HOMES){const Hz=HOMES[id].Z;near[id]=Math.hypot(p.x-Hz.x,p.z-Hz.z)<45;}
  for(const k in FA){const a=FA[k];if(a.tag)a.tag.visible=!(barnOpen&&a===barnSel);if(a===barnRide)continue;if(k===BS.pal)palStep(a,dt);else if(near[a.home.id]||barnOpen)stepFarm(a,dt);}
  rideStep(dt);
  // the glowing horseshoe pad opens the barn
  {let on=null,far=true;for(const id in HOMES){const Hz=HOMES[id].Z,[lx,lz]=Hz.toLocal(p.x,p.z),d=Math.hypot(lx-Hz.bpad.lx,lz-Hz.bpad.lz);if(d<Hz.bpad.r)on=id;if(d<=1.3)far=false;}
   if(on&&player.onGround&&!closetOpen&&!barnRide){if(!onFPad&&started){onFPad=true;openBarn(on);}}else if(far)onFPad=false;}
  const inZ=Math.hypot(p.x-BZ.x,p.z-BZ.z)<BZ.r+1?'barn':Math.hypot(p.x-Z.dino.x,p.z-Z.dino.z)<Z.dino.r+1?'dino':'';
  if(inZ&&inZ!==barnZoneIn&&started&&!closetOpen&&!barnRide){const dn=inZ==='dino',have=Object.keys(BS.own).some(k=>FK[k]&&!!FK[k].dino===dn);
    setTimeout(()=>toast(dn?(have?'Step on the glowing footprint by the hut to take care of your dinosaurs 🦖':'Step on the glowing footprint by the hut to adopt a dinosaur of your own 🦖'):(have?'Step on the glowing horseshoe to take care of your animals 🐴':'Step on the glowing horseshoe to adopt farm animals 🐴')),1600);
    for(const k in BS.own){const n=farmNeed(k);if(n&&FA[k]&&FA[k].home.id===inZ){FA[k].speak(n);break;}}}barnZoneIn=inZ;}
const fcam={p:new THREE.Vector3(),t:new THREE.Vector3(),dy:0},fWant=new THREE.Vector3(),fTgt=new THREE.Vector3();
function barnCam(dt){const a=barnOpen?barnSel:zooOpen?zooSel:null;if(!a)return;const s=Math.max(.55,a.h);const yaw=a.Z.rot+a.face+.55,pitch=.22,d=1.25+s*(a.h>2?1.8:1.55);
  fTgt.set(a.pos.x,a.pos.y+a.h*(a.h>2?.62:.5),a.pos.z);fWant.set(fTgt.x+Math.sin(yaw)*Math.cos(pitch)*d,fTgt.y+Math.sin(pitch)*d+.2,fTgt.z+Math.cos(yaw)*Math.cos(pitch)*d);
  const k=Math.min(1,dt*4);fcam.p.lerp(fWant,k);fcam.t.lerp(fTgt,k);camera.position.copy(fcam.p);camera.lookAt(fcam.t);}

// your animals come back when the game starts
for(const k of Object.keys(BS.own))if(FK[k]){const a=farmAnimal(k);a.setTag(BS.own[k].n);a.showDust(farmCare(k).shine);}
if(BS.pal&&FA[BS.pal])palGo(BS.pal);else BS.pal=null;
renderActions();// now the 🐎 button in the moves wheel can show your horse (17d-bicycle.js)
