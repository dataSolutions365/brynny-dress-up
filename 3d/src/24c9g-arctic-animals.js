/* ===== ❄️ Polar animals: a polar bear, a walrus, emperor penguins, an arctic fox, an arctic wolf and a snowy owl =====
   Real-looking on purpose (true colors and shapes, no cartoon blush or big shiny eyes), like the Safari Zoo animals.
   They live at ❄️ Polar Ice (24m-arctic.js) and four of them are rides you earn with the ❄️ Polar challenges
   (arcticRideList below: Nanuq the polar bear, Tusk the walrus who swims, Ukpik the snowy owl who flies, Amaruq the arctic wolf).
   arcticZooList() is what you learn about each one (it's added to ZOOA in 24d-barn.js). Materials are shared through safM. */
function arcticZooList(){return [
  {k:'polarbear',e:'🐻‍❄️',n:'Polar bear',arctic:1,food:[['🐟','Fish'],['🍖','Meat']],say:['*deep huff*','*sniffs the air*','*big bear yawn*'],
    facts:[['🥗','Diet','Carnivore. Mostly seals, which it catches at holes in the sea ice. It can smell a seal from about 1.5 km (1 mile) away!'],['🌍','Habitat','The sea ice of the Arctic, around the North Pole: Canada, Alaska, Greenland, Russia and Norway.'],['⏳','Lifespan','About 20 to 25 years in the wild, and up to 30 in zoos.'],['✨','Fun fact','The biggest meat-eater on land: a big male can weigh 700 kg (1,500 lb)! Its fur isn\'t really white: each hair is clear and hollow, and its skin underneath is black.']]},
  {k:'walrus',e:'🦭',n:'Walrus',arctic:1,swim:.5,food:[['🦪','Clams'],['🐟','Fish']],say:['*loud bellow*','*whisker wiggle*','*happy grunt*'],
    facts:[['🥗','Diet','Clams, mussels, snails and worms from the sea floor. It sucks clams right out of their shells, thousands in one meal!'],['🌍','Habitat','The Arctic Ocean and the seas around it, resting on floating sea ice and rocky beaches.'],['⏳','Lifespan','About 30 to 40 years.'],['✨','Fun fact','Both boys and girls have tusks, up to 1 m (3 ft) long! A walrus uses them to pull itself out of the water onto the ice. Its face has about 450 super-sensitive whiskers to feel for food.']]},
  {k:'penguin',e:'🐧',n:'Emperor penguin',arctic:1,food:[['🐟','Fish'],['🦐','Krill']],say:['*trumpet call*','*waddle waddle*','*flipper flap*'],
    facts:[['🥗','Diet','Carnivore. Fish, krill and squid. It can dive more than 500 m (1,600 ft) deep and hold its breath for over 20 minutes!'],['🌍','Habitat','Only in Antarctica, around the South Pole. Penguins live at the other end of the Earth from polar bears, so they never meet in the wild!'],['⏳','Lifespan','About 20 years.'],['✨','Fun fact','The tallest penguin in the world, about 1.1 m (3.7 ft). The dads keep the egg warm on their feet, under a flap of belly skin, for about 2 months through the winter.']]},
  {k:'arcticfox',e:'🦊',n:'Arctic fox',arctic:1,food:[['🫐','Berries'],['🥚','Egg']],say:['*yip yip*','*fluffy tail swish*','*curious head tilt*'],
    facts:[['🥗','Diet','Omnivore. Lemmings, voles, birds and eggs, berries, and leftovers from polar bears.'],['🌍','Habitat','The cold, treeless tundra all round the Arctic.'],['⏳','Lifespan','About 3 to 6 years in the wild, and up to 14 in zoos.'],['✨','Fun fact','Its coat is snowy white in winter and turns brown and gray in summer! It has fur on the bottoms of its paws and stays cozy down to -50 °C (-58 °F).']]},
  {k:'arcticwolf',e:'🐺',n:'Arctic wolf',arctic:1,food:[['🍖','Meat'],['🥩','Steak']],say:['*soft howl* 🌙','*friendly wag*','*ears up*'],
    facts:[['🥗','Diet','Carnivore. Musk oxen, arctic hares and caribou, hunted together as a pack.'],['🌍','Habitat','The far north of Canada and Greenland, where the ground stays frozen most of the year.'],['⏳','Lifespan','About 7 to 10 years in the wild, and up to 18 in zoos.'],['✨','Fun fact','Its ears are smaller and rounder than other wolves\' so they lose less heat. A pack\'s howls can be heard up to 16 km (10 miles) away!']]},
  {k:'snowyowl',e:'🦉',n:'Snowy owl',arctic:1,food:[['🐭','Mouse'],['🍗','Chicken']],say:['*hoo hoo*','*slow blink*','*head turns all the way round*'],
    facts:[['🥗','Diet','Carnivore. Mostly lemmings, more than 1,500 in a year, plus hares and birds.'],['🌍','Habitat','The Arctic tundra. In winter some fly far south, even to farm fields in the USA.'],['⏳','Lifespan','About 10 years in the wild, and up to 28 in zoos.'],['✨','Fun fact','Unlike most owls it hunts in the daytime, since Arctic summers have no night! The boys get whiter as they grow up, and the girls keep dark spots. Its feet are covered in feathers like fluffy slippers.']]}];}
// 🏆 the polar rides you earn by finishing all of their ❄️ Polar challenges (challenges.js, ids in earn.ids). Same fields as the safari rides (24i-earned-rides.js).
function arcticRideList(){return [
  {k:'nanuq',e:'🐻‍❄️',n:'Polar bear',nm:'Nanuq',model:'polarbear',zoo:'polarbear',gear:1,safari:1,arctic:1,earn:{by:'chal',ids:['ice_feedB','ice_fish10','ice_escape3'],goal:3},ride:1.34,boost:1.75,about:'A huge, gentle polar bear who carries you across the snow! Only for explorers who finish all 3 of his ❄️ Polar challenges.',food:[['🐟','Fish'],['🍖','Meat'],['🫐','Berries']],say:['*deep happy huff*','*big bear stretch*','Hold on tight! ❄️']},
  {k:'tusk',e:'🦭',n:'Walrus',nm:'Tusk',model:'walrus',zoo:'walrus',gear:1,safari:1,arctic:1,swim:.5,earn:{by:'chal',ids:['ice_feedW','ice_fish20','ice_swim'],goal:3},ride:.98,boost:1.45,about:'A big, whiskery walrus who swims you all the way round the city! Ride him right into the water. Only for swimmers who finish all 3 of his ❄️ Polar challenges.',food:[['🦪','Clams'],['🐟','Fish'],['🦐','Shrimp']],say:['*loud happy bellow*','*whisker wiggle*','Into the water! 🌊']},
  {k:'ukpik',e:'🦉',n:'Snowy owl',nm:'Ukpik',model:'snowyowl',zoo:'snowyowl',safari:1,arctic:1,fly:1,scale:3.3,earn:{by:'chal',ids:['ice_meetAll','ice_igloo','ice_spins'],goal:3},ride:1.36,boost:1.8,about:'A giant snowy owl with golden eyes. Tap 🪽 Fly to soar silently over the island! Only for explorers who finish all 3 of her ❄️ Polar challenges.',food:[['🐭','Mouse'],['🍗','Chicken'],['🐟','Fish']],say:['*hoo hoo*','*silent wing flap*','Up we go! ☁️']},
  {k:'amaruq',e:'🐺',n:'Arctic wolf',nm:'Amaruq',model:'arcticwolf',zoo:'arcticwolf',gear:1,safari:1,arctic:1,scale:1.45,earn:{by:'chal',ids:['ice_home12','ice_gold','ice_skate'],goal:3},ride:1.45,boost:2.15,about:'A fast, snowy-white arctic wolf who races you across town! Only for explorers who finish all 3 of his ❄️ Polar challenges.',food:[['🍖','Meat'],['🥩','Steak'],['🐟','Fish']],say:['*soft happy howl* 🌙','*tail wag*','Let\'s run! 💨']}];}
Object.assign(SADDLE,{nanuq:{r:.44,sx:.9,sy:.92,y:.02,z:.02,col:'#2f5a8a',seatY:.41},tusk:{r:.5,sx:1.02,sy:.86,y:.02,z:.14,col:'#7a3a2f',seatY:.45},
  amaruq:{r:.22,sx:.88,sy:1,y:.02,z:.03,col:'#3a5a7a',seatY:.21}});

// a coat texture: soft fur strokes in a few shades (c0 = the main color)
function arcFurTex(c0,cs){return canvasTex(128,128,(x,w,h)=>{x.fillStyle=c0;x.fillRect(0,0,w,h);x.lineCap='round';
  for(let i=0;i<900;i++){x.strokeStyle=cs[i%cs.length];x.lineWidth=.8+Math.random()*1.2;x.beginPath();const X=Math.random()*w,Y=Math.random()*h;x.moveTo(X,Y);x.lineTo(X+(Math.random()-.5)*3,Y+3+Math.random()*5);x.stroke();}},2);}
const arcFur=(k,c0,cs,o={})=>safM(k,()=>phys('#ffffff',{map:arcFurTex(c0,cs),roughness:.9,sheen:.6,sheenColor:new THREE.Color('#ffffff'),sheenRoughness:.6,...o}));
// real animal eyes: small, dark and glossy, set into the face (no big cartoon whites)
function arcEyes(a,head,H,ex,ey,ez,ry,size,col){const m=safM('arcEye'+col,()=>phys(col,{roughness:.12,clearcoat:1,clearcoatRoughness:.05})),pu=safM('arcPupil',()=>phys('#050506',{roughness:.1,clearcoat:1}));
  for(const sx of [-1,1]){const g=new THREE.Group();g.position.set(sx*H*ex,H*ey,H*ez);g.rotation.y=sx*ry;head.add(g);
    M(sph(H*size,12,10),m,0,0,0,g,false,false).scale.set(1,1,.6);if(col!=='#050506')M(sph(H*size*.55,10,8),pu,0,0,H*size*.4,g,false,false).scale.set(1,1,.5);a.eyes.push(g);}}
// four legs that swing from the shoulders and hips: upper leg, lower leg and a paw
function arcLegs(a,g,mat,pawM,lx,lz,hip,r0,r1,paw,frontZ=0){for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*lx,hip,sz*lz+(sz>0?frontZ:0));g.add(lg);a.legs.push({g:lg,ph});
  M(sph(r0*1.3,12,10),mat,0,0,0,lg).scale.set(.9,1.3,1.1);M(cyl(r0*1.1,r1,hip*.55,12),mat,0,-hip*.28,sz>0?0:-.02,lg);M(sph(r1*1.05,10,8),mat,0,-hip*.56,sz>0?.01:-.03,lg);
  M(cyl(r1,r1*.92,hip*.42,12),mat,0,-hip*.77,sz>0?.015:-.02,lg);const p=M(sph(paw,12,10),pawM,0,-hip+paw*.45,.03,lg);p.scale.set(1,.55,1.35);}}

/* 🐻‍❄️ Polar bear: big and heavy with a long neck and a small, long head, a high rump, short round ears, a black nose,
   huge furry paws, and creamy white fur that looks a little yellow in the light. The cub is the same bear, smaller. */
ZOO_BUILD.polarbear=function(g,body,o){const r=.44,len=.92,hip=.66,by=.86;
  const fur=arcFur('pbFur','#f1ebdc',['#e6dfcc','#faf6ec','#ddd4bf']),fur2=safM('pbFur2',()=>phys('#e9e1cf',{roughness:.95,sheen:.6,sheenColor:new THREE.Color('#fffaf0')})),
    blk=safM('pbBlk',()=>phys('#111113',{roughness:.35,clearcoat:.3})),pad=safM('pbPad',()=>std('#2a2a2c',{roughness:.8}));
  body.position.y=by;
  // the body is three big soft ovals blended together: deep chest and shoulders, the middle, and the big high rump
  const blob=(rr,x,y,z,sx,sy,sz,m=fur)=>{const b=M(fuzz(sph(rr,22,16),.012,26),m,x,y,z,body);b.scale.set(sx,sy,sz);return b;};
  blob(r,0,0,0,.95,.95,1.35);blob(r,0,-.02,len*.4,.97,1.03,1.05);blob(r,0,.06,-len*.42,1,1.05,1.1);
  M(sph(r*.8,14,10),fur2,0,-r*.55,0,body).scale.set(.9,.45,1.8);// shaggy belly
  for(let i=0;i<10;i++)M(sph(.08,8,6),fur2,(i%2?1:-1)*r*.55,-r*.78,(i/9-.5)*len*.9,body,false,false).scale.set(.7,1.5,1);// longer hair hanging under the belly
  // thick, heavy legs and huge furry paws with black claws
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.55,hip,sz*len*.44+(sz>0?.04:0));g.add(lg);this.legs.push({g:lg,ph});
    M(fuzz(sph(.2,14,10),.01,26),fur,0,-.02,0,lg).scale.set(.9,1.4,1.1);M(fuzz(cyl(.17,.14,hip*.62,14),.008,26),fur,0,-hip*.36,sz>0?.01:-.02,lg);
    M(fuzz(cyl(.14,.15,hip*.36,14),.008,26),fur,0,-hip*.78,sz>0?.03:0,lg);
    const p=M(fuzz(sph(.16,14,10),.01,26),fur2,0,-hip+.07,.06,lg);p.scale.set(1.05,.55,1.3);
    for(const dx of [-.08,-.03,.03,.08])M(sph(.02,6,4),pad,dx,-hip+.04,.25,lg,false,false).scale.set(1,.7,1.5);}
  // the long neck and the small, long head
  const neck=new THREE.Group();neck.position.set(0,by+r*.25,len/2+r*.55);neck.rotation.x=.95;g.add(neck);
  M(fuzz(new THREE.CapsuleGeometry(.24,.32,8,16),.015,24),fur,0,.2,0,neck).scale.set(.9,1,1.05);
  const head=new THREE.Group();head.position.set(0,.5,.02);head.rotation.x=-.95+.1;neck.add(head);const H=.17;
  M(sph(H,20,14),fur,0,0,0,head).scale.set(1.05,.95,1.15);
  const snout=M(new THREE.CapsuleGeometry(H*.52,H*.9,8,14),fur,0,-H*.2,H*.95,head);snout.rotation.x=Math.PI/2+.08;snout.scale.set(1,.85,1);// the long "Roman nose"
  M(sph(H*.24,12,10),blk,0,-H*.12,H*1.72,head).scale.set(1.25,.85,.9);// black nose
  M(sph(H*.3,10,8),blk,0,-H*.52,H*1.38,head,false,false).scale.set(1.1,.25,.9);// dark lips
  M(sph(H*.48,12,10),fur2,0,-H*.55,H*.75,head).scale.set(1,.55,1.2);// chin
  for(const sx of [-1,1]){const e=M(sph(H*.24,12,10),fur,sx*H*.68,H*.62,-H*.2,head);e.scale.set(1,.85,.5);M(sph(H*.13,8,6),pad,sx*H*.68,H*.6,-H*.12,head,false,false).scale.set(1,.85,.3);}// short round ears
  arcEyes(this,head,H,.42,.25,.82,.45,.085,'#050506');
  const tail=new THREE.Group();tail.position.set(0,by+r*.3,-(len/2+r*.95));g.add(tail);M(sph(.08,10,8),fur,0,0,0,tail).scale.set(1,.8,.8);
  // a slow, heavy, rolling walk: the head swings low
  this.tick=(t,dt,run)=>{body.rotation.z=Math.sin(this.phase)*.045*Math.min(1,run);};
  Object.assign(o,{neck,head,tail,nTilt:.95,gz:.55,size:1.3,h:by+r+.38,rad:.75,dustR:[r,r,len*.8]});};

/* 🦭 Walrus: a huge wrinkly cinnamon-brown body that lies low, a thick neck, a broad bristly whisker pad,
   two long ivory tusks, tiny eyes, front flippers it props itself up on, and back flippers that fan out behind. */
function walrusTex(){return canvasTex(256,256,(x,w,h)=>{x.fillStyle='#a86f55';x.fillRect(0,0,w,h);
  for(let i=0;i<1400;i++){const c=Math.random();x.fillStyle=c<.4?'rgba(205,140,115,.35)':c<.75?'rgba(120,70,50,.3)':'rgba(230,175,150,.25)';x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*4,0,Math.PI*2);x.fill();}
  x.strokeStyle='rgba(90,50,35,.45)';x.lineWidth=1.4;for(let i=0;i<70;i++){x.beginPath();const X=Math.random()*w,Y=Math.random()*h,L=10+Math.random()*30;x.moveTo(X,Y);x.quadraticCurveTo(X+L/2,Y+(Math.random()-.5)*8,X+L,Y+(Math.random()-.5)*4);x.stroke();}},2);}
ZOO_BUILD.walrus=function(g,body,o){const r=.52,len=.9,by=.5;
  const skin=safM('wrSkin',()=>{const tx=walrusTex();return phys('#ffffff',{map:tx,bumpMap:tx,bumpScale:3,roughness:.75,sheen:.3,sheenColor:new THREE.Color('#ffd8c8')});}),
    dark=safM('wrDark',()=>phys('#7a4a38',{roughness:.7})),ivory=safM('wrIvory',()=>phys('#efe4c8',{roughness:.35,clearcoat:.5})),
    whisk=safM('wrWhisk',()=>std('#e8dcc0',{roughness:.6})),pad=safM('wrPad',()=>phys('#b98468',{roughness:.8}));
  body.position.y=by;
  M(sph(r,26,18),skin,0,0,0,body).scale.set(1.08,.9,(len/2+r)/r);
  M(sph(r*1.02,20,14),skin,0,.06,len*.32,body).scale.set(1.08,1.02,1);// the huge chest and shoulders
  const rear=M(new THREE.CapsuleGeometry(r*.6,.5,8,16),skin,0,-.18,-len*.72,body);rear.rotation.x=Math.PI/2+.3;rear.scale.set(1.2,.8,1);// the body tapers back to the tail
  M(sph(r*.98,20,14),skin,0,-.02,-len*.18,body).scale.set(1.1,.92,1.25);// a soft, heavy middle that sags onto the ground
  // front flippers: propped out to the sides under the chest (they swing as it hitches along)
  for(const [sx,ph] of [[-1,0],[1,Math.PI]]){const lg=new THREE.Group();lg.position.set(sx*r*.85,by-.15,len*.42);g.add(lg);this.legs.push({g:lg,ph});
    const f=M(new THREE.CapsuleGeometry(.09,.32,6,12),skin,sx*.06,-.2,.06,lg);f.rotation.set(-.4,0,sx*.35);f.scale.set(1.5,1,.45);
    M(sph(.12,10,8),pad,sx*.12,-.36,.16,lg).scale.set(1.3,.25,1.4);}
  // back flippers fanned out behind
  for(const sx of [-1,1]){const f=M(new THREE.CapsuleGeometry(.1,.26,6,12),skin,sx*.16,-by+.08,-len*.98,body);f.rotation.set(Math.PI/2+.1,0,sx*.55);f.scale.set(1.6,1,.35);}
  // the head: thick and round, on a neck you can't really see
  const neck=new THREE.Group();neck.position.set(0,by+.12,len/2+r*.65);neck.rotation.x=.35;g.add(neck);
  M(sph(.42,18,14),skin,0,.05,0,neck).scale.set(1.02,1,.95);
  const head=new THREE.Group();head.position.set(0,.22,.2);head.rotation.x=-.35+.05;neck.add(head);const H=.27;
  M(sph(H,20,14),skin,0,0,0,head).scale.set(1.05,1,1);
  // the broad, puffy whisker pad (two big round cheeks), full of stiff bristles
  for(const sx of [-1,1]){M(sph(H*.55,16,12),pad,sx*H*.33,-H*.32,H*.75,head).scale.set(1,.95,.85);
    for(let i=0;i<14;i++){const row=i%3,col=Math.floor(i/3),bx=sx*H*(.12+col*.11),by2=-H*(.18+row*.15),bz=H*(1.18-col*.07-Math.abs(row-1)*.04),b=M(cyl(.004,.006,.07,4),whisk,bx,by2,bz,head,false,false);b.rotation.set(Math.PI/2-.25,0,sx*.35);}}
  M(sph(H*.2,10,8),dark,0,-H*.68,H*.55,head,false,false).scale.set(1.3,.6,1);// mouth under the whiskers
  for(const sx of [-1,1]){M(sph(H*.07,8,6),dark,sx*H*.2,H*.02,H*1.05,head,false,false).scale.set(1.4,.5,.6);// nostrils on top of the snout
    // the long tusks: down from the top jaw, curving in and back a little
    taperTube([fV(sx*H*.3,-H*.55,H*.88),fV(sx*H*.28,-H*1.3,H*.9),fV(sx*H*.22,-H*2.05,H*.78),fV(sx*H*.16,-H*2.55,H*.6)],q=>H*(.085-.05*q),ivory,head,14,8);}
  arcEyes(this,head,H,.58,.3,.62,.65,.06,'#120806');
  // a slow hitch-and-slide: the body heaves up and down as the flippers pull
  this.tick=(t,dt,run)=>{const k=Math.min(1,run);body.rotation.x=Math.sin(this.phase)*.06*k;neck.position.y=by+.12+Math.abs(Math.sin(this.phase))*.04*k;};
  Object.assign(o,{neck,head,tail:null,nTilt:.35,gz:.35,size:1.3,h:by+r+.42,rad:.8,dustR:[r,r,len*.8]});};

/* 🐧 Emperor penguin: tall and sleek, black back, wings and head, a white belly that blushes pale yellow up top,
   bright yellow-orange ear patches, and a long, slightly curved black bill with a pink-orange stripe. Waddles. The chick is gray and fluffy. */
let ARC_CHICK=false;// set while building the penguin chick (24m-arctic.js)
ZOO_BUILD.penguin=function(g,body,o){const chick=ARC_CHICK,blk=safM('pgBlk',()=>phys('#16181d',{roughness:.45,sheen:.5,sheenColor:new THREE.Color('#8fa3c0')})),
    wht=safM('pgWht',()=>phys('#f4f3ee',{roughness:.6,sheen:.4})),yel=safM('pgYel',()=>phys('#f8e7a6',{roughness:.6})),ear=safM('pgEar',()=>phys('#f2a92a',{roughness:.5,sheen:.5,sheenColor:new THREE.Color('#ffe08a')})),
    bill=safM('pgBill',()=>phys('#e8836a',{roughness:.35,clearcoat:.5})),feet=safM('pgFeet',()=>std('#2a2a30',{roughness:.6})),
    gray=safM('pgGray',()=>phys('#a7aab0',{roughness:.95,sheen:.8,sheenColor:new THREE.Color('#ffffff')}));
  const r=chick?.2:.24,by=chick?.28:.5;body.position.y=by;
  if(chick){M(fuzz(sph(r,18,14),.02,30),gray,0,0,0,body).scale.set(1,1.15,.95);}
  else{M(sph(r,22,16),blk,0,0,-.03,body).scale.set(1,2.05,.95);// tall, sleek body (black back)
    M(sph(r*.92,22,16),wht,0,-.03,.04,body).scale.set(.95,1.95,.95);// white front
    M(sph(r*.55,16,12),yel,0,r*1.35,.11,body).scale.set(1.1,.75,.5);}// a pale yellow blush on the upper chest
  // flippers
  this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*r*.92,chick?.04:r*.75,0);body.add(w);
    const f=M(new THREE.CapsuleGeometry(chick?.04:.05,chick?.12:.32,6,10),chick?gray:blk,0,chick?-.08:-.2,0,w);f.scale.set(.35,1,1.1);w.rotation.z=sx*.12;this.wings.push({w,sx,fly:0});}
  // short legs and broad dark feet
  for(const [sx,ph] of [[-1,0],[1,Math.PI]]){const lg=new THREE.Group();lg.position.set(sx*r*.42,by-(chick?r*.95:r*1.75),0);g.add(lg);this.legs.push({g:lg,ph});
    M(cyl(.03,.03,.06,8),feet,0,-.02,0,lg);const ft=M(sph(chick?.045:.065,10,8),feet,0,-.05,.05,lg);ft.scale.set(1,.3,1.5);}
  // head on a short neck
  const neck=new THREE.Group();neck.position.set(0,by+(chick?r*.75:r*1.75),chick?0:.02);g.add(neck);
  const head=new THREE.Group();head.position.set(0,chick?.12:.11,.02);neck.add(head);const H=chick?.13:.13;
  M(sph(H,18,14),blk,0,0,0,head).scale.set(.85,.92,1.12);
  if(!chick)M(sph(H*.9,14,10),blk,0,-H*.6,-H*.15,head).scale.set(.9,1,.95);// the head flows down into the body
  if(chick){for(const sx of [-1,1])M(sph(H*.55,12,10),wht,sx*H*.42,-H*.05,H*.55,head).scale.set(.7,1,.6);// the chick's white face mask
    const b=M(new THREE.ConeGeometry(H*.13,H*.6,8),blk,0,-H*.1,H*1.15,head);b.rotation.x=Math.PI/2+.1;}
  else{for(const sx of [-1,1]){const e=M(sph(H*.4,12,10),ear,sx*H*.7,-H*.38,-H*.1,head);e.scale.set(.42,1.25,.85);e.rotation.set(.35,0,-sx*.12);// the yellow-orange ear patches
      const e2=M(sph(H*.32,10,8),yel,sx*H*.48,-H*.95,H*.08,head,false,false);e2.scale.set(.5,1.1,.85);}// fading down into the chest
    // the long, slightly down-curved bill: black on top, a pink-orange stripe along the bottom
    const bk=new THREE.Group();bk.position.set(0,-H*.12,H*.78);bk.rotation.x=.15;head.add(bk);
    taperTube([fV(0,0,0),fV(0,-H*.04,H*.8),fV(0,-H*.18,H*1.55)],q=>H*(.2-.17*q),blk,bk,12,10);
    taperTube([fV(0,-H*.1,H*.05),fV(0,-H*.13,H*.75),fV(0,-H*.22,H*1.35)],q=>H*(.15-.12*q),bill,bk,12,10);}
  arcEyes(this,head,H,.5,.15,.6,.7,.08,'#3a1f14');
  const tail=new THREE.Group();tail.position.set(0,by-(chick?r*.7:r*1.55),-r*.8);g.add(tail);M(new THREE.ConeGeometry(.04,.12,6),blk,0,0,0,tail).rotation.x=-2.2;
  // the waddle: rock from foot to foot
  this.tick=(t,dt,run)=>{const k=Math.min(1,run*1.5);body.rotation.z=Math.sin(this.phase)*.16*k;neck.rotation.z=Math.sin(this.phase)*.1*k;
    for(const w of this.wings)w.w.rotation.z=w.sx*(.12+.25*k+(this.happy>0?.5+Math.sin(t*18)*.4:0));};
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.5,size:chick?.5:.8,h:chick?.62:by+r*2+.32,rad:chick?.22:.3,biped:true,dustR:[r,r*1.5,r]});};

/* 🦊🐺 Arctic fox and arctic wolf: one dog-family body.
   The fox is small with short legs, a short muzzle, small round ears and a huge bushy tail, all puffy white winter fur.
   The wolf is tall and long-legged with a longer muzzle, pointed ears and amber eyes, white with a creamy back. */
function arcticCanid(a,wolf,g,body,o){const r=wolf?.25:.17,len=wolf?.6:.34,hip=wolf?.62:.25,by=wolf?.78:.35;
  const fur=wolf?arcFur('wfFur','#efebe2',['#e2dccd','#f8f6f0','#d6cdb9']):arcFur('fxFur','#f6f6f3',['#e9ebee','#ffffff','#dde1e6']),
    fur2=safM(wolf?'wfFur2':'fxFur2',()=>phys(wolf?'#ddd3be':'#e4e7eb',{roughness:.95,sheen:.6,sheenColor:new THREE.Color('#ffffff')})),
    blk=safM('cnBlk',()=>phys('#141414',{roughness:.3,clearcoat:.4})),inEar=safM(wolf?'wfEar':'fxEar',()=>phys(wolf?'#cdbfa8':'#d8dde3',{roughness:.9}));
  body.position.y=by;
  // the body: soft ovals for the chest, the middle and the hips (a deep chest and a tucked-up waist)
  const blob=(rr,x,y,z,sx,sy,sz)=>{const b=M(fuzz(sph(rr,20,14),wolf?.008:.014,30),fur,x,y,z,body);b.scale.set(sx,sy,sz);return b;};
  blob(r,0,0,0,.85,.88,1.5);blob(r,0,0,len*.45,.92,1.08,1.05);blob(r,0,.02,-len*.42,.88,.95,1.05);
  if(!wolf)blob(r,0,.05,0,1,1,1.6);// the fox's thick winter coat makes it round and puffy
  // slim legs with neat, furry paws
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.5,hip,sz*len*.48);g.add(lg);a.legs.push({g:lg,ph});
    const r0=wolf?.07:.055,r1=wolf?.045:.038;
    M(sph(r0*1.3,12,10),fur,0,0,0,lg).scale.set(.9,1.5,1.2);M(cyl(r0,r1,hip*.55,10),fur,0,-hip*.3,sz>0?0:-.03,lg);
    M(cyl(r1,r1*.95,hip*.45,10),fur2,0,-hip*.75,sz>0?.01:-.03,lg);
    M(sph(r1*1.45,10,8),fur2,0,-hip+r1*.7,.025,lg).scale.set(1,.7,1.4);}
  const neck=new THREE.Group();neck.position.set(0,by+r*.35,len/2+r*.4);neck.rotation.x=wolf?.85:.7;g.add(neck);
  M(fuzz(new THREE.CapsuleGeometry(wolf?.13:.11,wolf?.14:.08,6,12),.012,30),fur,0,.08,0,neck).scale.set(1,1,1.1);
  const head=new THREE.Group();head.position.set(0,wolf?.22:.17,.02);head.rotation.x=-(wolf?.85:.7)+.1;neck.add(head);const H=wolf?.13:.11;
  M(fuzz(sph(H,18,14),.006,40),fur,0,0,0,head).scale.set(1,.9,1.1);// the skull
  for(const sx of [-1,1])M(fuzz(sph(H*.55,12,10),.008,40),fur,sx*H*.58,-H*.28,H*.1,head).scale.set(.75,.95,1.15);// ruffs of fur on the cheeks
  // the muzzle: long and narrowing to the nose (the fox's is short and fine)
  const mL=wolf?1.85:1.6;taperTube([fV(0,-H*.12,H*.55),fV(0,-H*.22,H*1.05),fV(0,-H*.3,H*mL)],q=>H*(.5-.3*q),fur,head,12,12);
  M(sph(H*.17,10,8),blk,0,-H*.24,H*(mL+.08),head).scale.set(1.15,.85,.9);// black nose
  M(sph(H*.3,10,8),fur2,0,-H*.55,H*(mL*.6),head,false,false).scale.set(.75,.35,1.4);// chin
  M(new THREE.TorusGeometry(H*.25,H*.02,4,12,Math.PI*.9),blk,0,-H*.47,H*(mL*.7),head,false,false).rotation.set(Math.PI/2,0,Math.PI*.05);// mouth line
  // ears: the fox's are short and rounded, the wolf's bigger and pointed
  for(const sx of [-1,1]){const eg=new THREE.Group();eg.position.set(sx*H*.5,H*.72,-H*.15);eg.rotation.set(-.15,0,-sx*.3);head.add(eg);
    const e=M(new THREE.ConeGeometry(H*(wolf?.34:.32),H*(wolf?.75:.5),12),fur,0,H*(wolf?.3:.2),0,eg);e.scale.z=.5;
    M(new THREE.ConeGeometry(H*.2,H*(wolf?.55:.36),10),inEar,0,H*(wolf?.26:.17),H*.07,eg,false,false).scale.z=.3;}
  arcEyes(a,head,H,.38,.2,.95,.42,.1,wolf?'#c8902a':'#2a1a10');
  // the tail: long and bushy (the fox's is huge and fluffy), carried low
  const tail=new THREE.Group();tail.position.set(0,by+r*.2,-(len/2+r*.7));g.add(tail);
  const tl=wolf?.52:.4;taperTube([fV(0,0,0),fV(0,-.1,-tl*.35),fV(0,-.2,-tl*.75),fV(0,-.22,-tl)],q=>(wolf?.06:.07)*(.7+.6*Math.sin(Math.min(1,q*1.3)*Math.PI*.8)),fur,tail,16,10,.01);
  M(fuzz(sph(wolf?.05:.06,10,8),.01,30),fur,0,-.22,-tl,tail);tail.rotation.x=wolf?-.3:-.15;
  Object.assign(o,{neck,head,tail,nTilt:wolf?.85:.7,gz:.7,size:wolf?.95:.55,h:by+r+(wolf?.42:.3),rad:wolf?.5:.32,dustR:[r,r,len*.8]});}
ZOO_BUILD.arcticfox=function(g,body,o){arcticCanid(this,false,g,body,o);};
ZOO_BUILD.arcticwolf=function(g,body,o){arcticCanid(this,true,g,body,o);};

/* 🦉 Snowy owl: big and round, white with dark brown bars and spots, a round head with no ear tufts, golden-yellow eyes,
   a small black hooked beak almost hidden in feathers, and feathered feet. Its wings open wide to fly (24h-flying.js). */
function owlTex(){return canvasTex(256,256,(x,w,h)=>{x.fillStyle='#f7f6f2';x.fillRect(0,0,w,h);
  for(let i=0;i<170;i++){const X=Math.random()*w,Y=Math.random()*h;x.fillStyle=Math.random()<.5?'#3a2e26':'#5a4a3e';x.beginPath();x.ellipse(X,Y,3+Math.random()*4,1.2+Math.random()*1.4,(Math.random()-.5)*.4,0,Math.PI*2);x.fill();}});}
ZOO_BUILD.snowyowl=function(g,body,o){const r=.17,ride=this.k==='ukpik',by=ride?.25:.27;// Ukpik (the ride) leans forward like an owl in flight, so you sit on her back
  const T=safM('owT',()=>owlTex()),barred=safM('owBar',()=>phys('#ffffff',{map:T,roughness:.85,sheen:.6,sheenColor:new THREE.Color('#ffffff')})),
    wht=safM('owWht',()=>phys('#fbfaf6',{roughness:.85,sheen:.6,sheenColor:new THREE.Color('#ffffff')})),blk=safM('owBlk',()=>phys('#1a1a1c',{roughness:.3,clearcoat:.4}));
  body.position.y=by;body.rotation.x=ride?1.25:-.12;
  M(fuzz(sph(r,20,16),.01,40),barred,0,0,0,body).scale.set(1.05,1.35,1);// round, upright body
  M(fuzz(sph(r*.88,18,14),.008,40),wht,0,-.01,r*.25,body).scale.set(1,1.25,.85);// whiter front
  // the wings: folded along the sides, and they open wide to fly
  this.wings=[];for(const sx of [-1,1]){const w=new THREE.Group();w.position.set(sx*r*.85,r*.55,-.01);body.add(w);
    M(new THREE.CapsuleGeometry(.05,.22,6,10),barred,sx*.14,0,-.02,w,true,false).rotation.z=Math.PI/2;
    for(let i=0;i<9;i++){const q=i/8,L=.16+.08*Math.sin(q*Math.PI),f=new THREE.Group();f.position.set(sx*(.04+q*.3),0,-.03);f.rotation.y=sx*(.1-q*.8);w.add(f);
      const fe=M(new THREE.CapsuleGeometry(.04,L,4,8),q>.7?barred:wht,0,0,-L/2-.02,f,true,false);fe.rotation.x=Math.PI/2;fe.scale.set(1,1,.25);}
    this.wings.push({w,sx,fly:0,fold:1.35});}
  // feathered feet with black talons
  for(const [sx,ph] of [[-1,0],[1,Math.PI]]){const lg=new THREE.Group();lg.position.set(sx*r*.42,by-r*1.1,.02);g.add(lg);this.legs.push({g:lg,ph});
    M(fuzz(sph(.05,10,8),.008,40),wht,0,-.06,.02,lg).scale.set(1,1.3,1.3);
    for(const a of [-.35,0,.35]){const c=M(new THREE.ConeGeometry(.008,.04,6),blk,Math.sin(a)*.04,-.11,.06+Math.cos(a)*.02,lg,false,false);c.rotation.x=Math.PI/2+.6;}}
  // the big round head right on the body (owls have no neck you can see)
  const neck=new THREE.Group();neck.position.set(0,ride?by+r*.62:by+r*1.15,ride?r*1.25:.01);g.add(neck);
  const head=new THREE.Group();head.position.set(0,.04,0);neck.add(head);const H=.13;
  M(fuzz(sph(H,20,16),.008,40),barred,0,0,0,head).scale.set(1.08,.95,.95);
  M(sph(H*.9,18,14),wht,0,-H*.04,H*.3,head,false,false).scale.set(1.12,.95,.62);// the flat, pure white facial disc
  for(let i=0;i<8;i++)M(sph(H*.09,6,4),barred,(i/7-.5)*H*1.2,H*.7,-H*.3,head,false,false).scale.set(1.4,.5,.6);// a few dark flecks on the crown
  const bk=M(new THREE.ConeGeometry(H*.11,H*.32,8),blk,0,-H*.12,H*.8,head);bk.rotation.x=Math.PI/2+.6;// small hooked beak
  for(const sx of [-1,1])M(sph(H*.24,10,8),wht,sx*H*.12,-H*.05,H*.72,head,false,false).scale.set(.9,.7,.5);// feathers round the beak
  arcEyes(this,head,H,.36,.12,.72,.32,.17,'#f1c21b');
  const tail=new THREE.Group();tail.position.set(0,ride?by+r*.15:by-r*.9,ride?-r*1.45:-r*.85);if(ride)tail.rotation.x=-1;g.add(tail);
  for(let i=0;i<5;i++){const f=M(new THREE.CapsuleGeometry(.03,.12,4,6),barred,(i-2)*.025,0,-.06,tail,false,false);f.rotation.x=Math.PI/2+.5;f.scale.set(1,1,.3);}
  // owls turn their heads a long way round to look about
  this.tick=(t,dt,run)=>{if(run<.05){this.look=(this.look||0)+dt;head.rotation.y=Math.sin(this.look*.4)*1.2*(Math.sin(this.look*.13)>0?1:.2);}else head.rotation.y*=.9;};
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.4,size:.42,h:by+r*1.15+.3,rad:.22,biped:true,dustR:[r,r*1.3,r]});};
