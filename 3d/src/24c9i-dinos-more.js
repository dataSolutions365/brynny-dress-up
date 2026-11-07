/* ===== 🦕 More real-looking dinosaurs (built with the helpers in 24c9h-dinos.js), and the 🏆 big dinosaurs you earn and ride =====
   - ZOO_BUILD.parasaurR (Parasaurolophus, the crested duck-bill that honks through its crest) and pteroR (Pteranodon, the flying
     reptile: not a dinosaur, a cousin). They live at 🦖 Dino Valley (DINOA, 24n-dino-valley.js), and the young ones you can buy
     (Honker and Sunny in FARM, 24d-barn.js) are the same models, smaller.
   - dinoRideList(): a big grown-up of every young dinosaur you can have (T. rex, raptor, triceratops, brachiosaurus, stegosaurus,
     Parasaurolophus, Pteranodon), earned from the 🦖 Dino tab of 3d/challenges.js (ids start with dino_) like the 🦁 safari rides
     (24i-earned-rides.js). They use the very same models through model: with a bigger scale:, live at Dino Valley (dino:1) and get
     their saddle from dnSaddle. You sit at F.ride = scale * (body height + saddle y + r*sy) + .06 (see the note on each builder).
   - Kid-safe: nobody bites or chases. The Parasaurolophus honks now and then, that's all. */

/* ---------- 🦕 Parasaurolophus: a big plant-eater with a duck-like bill and a long hollow crest sweeping back off its head (it
   honked through it like a trombone). Long back legs, shorter front legs with little hoof-like hands, a deep tail.
   Olive brown with darker bands across the back, pale underneath, and a rusty crest.
   Ride: scale s => F.ride = s*2.7+.06 (Honker .4 => 1.14, Tuba .9 => 2.49) ---------- */
ZOO_BUILD.parasaurR=function(g,body,o){const by=1.7,m=dnSkin('para'),C=['#5d5a3c','#d2c49c',(x,y,z,ny)=>ny>.2?(Math.sin(z*7)>.55?.2*ny:0):0],
  bill=['#3f3a30','#6a604e'],crestC=['#7a4630','#b98a60',(x,y,z,ny)=>Math.sin(z*14)>.6?.12:0],nail=dnClaw();
  body.position.y=by;
  dnTube([[0,-.15,1.25],[0,.05,.7],[0,.2,0],[0,.25,-.55],[0,.15,-1.0]],[.45,.7,.8,.75,.55],m,body,C,{sx:.8,seg:22,rad:16});
  // a deep tail, flat at the sides, held out straight behind
  const tail=new THREE.Group();tail.position.set(0,.15,-.95);body.add(tail);
  dnTube([[0,0,.1],[0,0,-.8],[0,-.1,-1.8],[0,-.25,-2.8],[0,-.35,-3.4]],[.52,.4,.24,.1,.03],m,tail,C,{sx:.55,sy:1.1,seg:22,rad:12});
  // long strong back legs with a big thigh, shorter front legs; blunt hoof-like toes
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const fr=sz>0,H=fr?by-.25:by+.05,
    lg=dnLeg(this,g,sx*(fr?.38:.45),H,fr?.95:-.45,ph,fr?[[0,0,0],[0,-.55,.08],[0,-1.0,-.02],[0,-H+.15,.04]]:[[0,0,0],[0,-.7,.25],[0,-1.25,-.15],[0,-H+.2,.05]],fr?[.22,.14,.11,.1]:[.42,.27,.17,.16],m,C);
    if(!fr)M(dnPaint(sph(.42,14,10),C[0],C[1]),m,-sx*.06,-.35,.08,lg).scale.set(.72,1.35,1.05);
    dnPad(lg,-H,fr?.12:.2,m,C,nail,3);}
  // the neck curving up, the head with its duck bill, and the long crest
  const neck=new THREE.Group();neck.position.set(0,by,1.3);g.add(neck);
  dnTube([[0,-.25,-.25],[0,.1,.15],[0,.55,.4],[0,.9,.52]],[.45,.33,.25,.21],m,neck,C,{sx:.8,seg:14,rad:12});
  const head=new THREE.Group();head.position.set(0,.95,.58);neck.add(head);
  dnTube([[0,.02,-.16],[0,.03,.12],[0,-.06,.4],[0,-.13,.6]],[.2,.2,.15,.12],m,head,C,{sx:.72,seg:12,rad:12});
  dnTube([[0,-.12,.48],[0,-.17,.76],[0,-.19,.86]],[.13,.12,.07],m,head,bill,{sx:1.15,sy:.42,seg:8,rad:10});
  dnTube([[0,.1,.18],[0,.27,0],[0,.42,-.4],[0,.5,-.85],[0,.47,-1.18]],[.1,.095,.085,.075,.05],m,head,crestC,{sx:.62,seg:18,rad:10});
  for(const s of [-1,1]){dnEye(this,head,s*.135,.07,.12,.032,'#7a5222',s*1.3);M(sph(.022,6,4),dnDark(),s*.06,-.1,.74,head,false,false).scale.set(1,.6,1.6);}
  // breathing, and a big honk now and then (head up, a deep trombone-like call when you're close by)
  let hT=6+Math.random()*12,honk=0;
  this.tick=(t,dt,run)=>{body.scale.y=1+Math.sin(t*1.1)*.01;hT-=dt;
    if(hT<0&&run<.1&&!this.ridden){hT=14+Math.random()*16;honk=1.8;
      if(this.g.parent&&this.g.visible&&Math.hypot(player.pos.x-this.pos.x,player.pos.z-this.pos.z)<14){this.speak('*HOOONK!* 🎺');tone(150,.7,'sawtooth',.035,0,120);tone(225,.7,'triangle',.03,0,180);}}
    if(honk>0){honk-=dt;head.rotation.x=-Math.sin(Math.min(1,(1.8-honk)/1.8)*Math.PI)*.45;}else head.rotation.x*=.9;};
  dnSaddle(this,body,.2,0,.8,.8,1,'#8a5a2a');
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.45,size:1.7,h:by+1.6,rad:1,dustR:[.7,.7,1]});};

/* ---------- 🦕 Pteranodon: a flying reptile with a long toothless beak, a crest sweeping back off its head, a small furry body
   and huge leathery wings stretched from one very long finger. On the ground the wings fold up along its sides.
   Grey brown on the back, pale underneath, a red-brown crest. It flies (fly:1, 24h-flying.js opens the wings: a.wingOpen).
   Ride: scale s => F.ride = s*.95+.06 (Sunny 1.1 => 1.1, Zephyr 2.5 => 2.44) ---------- */
ZOO_BUILD.pteroR=function(g,body,o){const by=.72,m=dnSkin('ptero',true),C=['#4b4740','#e9e4d8'],beak=['#c9b183','#e8d8b0'],crestC=['#8a3a26','#b0583a'],claw=dnClaw(),
  mem=dnM('pteroMem',()=>phys('#5e4c40',{roughness:.75,side:THREE.DoubleSide,sheen:.3,sheenColor:new THREE.Color('#d8b89a')}));
  body.position.y=by;
  dnTube([[0,.12,.4],[0,.04,.15],[0,0,-.12],[0,-.05,-.34],[0,-.07,-.48]],[.13,.21,.19,.1,.02],m,body,C,{sx:.85,seg:14,rad:12});
  for(const s of [-1,1]){const lg=dnLeg(this,g,s*.11,by-.04,-.18,s<0?0:Math.PI,[[0,0,0],[0,-.3,.09],[0,-.6,-.02]],[.085,.05,.035],m,C);
    dnToes(lg,[0,-(by-.04)+.03,0],.1,.025,m,C,claw,.3,3);}
  // the wings: the arm out to the wrist, then the long wing finger to the tip, with the skin stretched behind back to the body.
  // inner tips the skin down along the flank when the wing folds (FarmAnimal.update swings w back by fold when wingOpen is 0)
  this.wings=[];const inners=[];
  const shape=dnM('pteroWingG',()=>{const sh=new THREE.Shape();sh.moveTo(0,-.02);sh.lineTo(.7,-.02);sh.quadraticCurveTo(1.3,.02,1.9,.3);
    sh.quadraticCurveTo(1.45,.42,1.1,.47);sh.quadraticCurveTo(.6,.56,.2,.6);sh.lineTo(0,.62);sh.lineTo(0,-.02);const g=new THREE.ShapeGeometry(sh,10);g.rotateX(-Math.PI/2);return g;});
  for(const s of [-1,1]){const w=new THREE.Group();w.position.set(s*.16,.1,.22);body.add(w);const I=new THREE.Group();w.add(I);inners.push(I);
    const mm=M(shape,mem,0,0,0,I,true,false);mm.scale.x=s;
    dnTube([[0,0,0],[s*.35,.02,-.02],[s*.7,.03,.02]],[.06,.045,.04],m,I,C,{seg:8,rad:8});
    dnTube([[s*.7,.03,.02],[s*1.3,.02,-.05],[s*1.9,0,-.3]],[.035,.022,.006],m,I,C,{seg:12,rad:8});
    for(let c=0;c<3;c++)M(new THREE.ConeGeometry(.012,.06,6),claw,s*.7,.0,.06+c*.025,I,false,false).rotation.x=Math.PI/2+.3;
    this.wings.push({w,sx:s,fly:0,fold:1.3});}
  // a slim neck, a small head, the long pointed beak and the crest sweeping back
  const neck=new THREE.Group();neck.position.set(0,by+.13,.42);g.add(neck);
  dnTube([[0,-.05,-.08],[0,.18,.05],[0,.36,.12]],[.09,.07,.06],m,neck,C,{sx:.9,seg:10,rad:10});
  const head=new THREE.Group();head.position.set(0,.38,.14);neck.add(head);
  dnTube([[0,0,-.07],[0,.01,.07]],[.08,.07],m,head,C,{sx:.8,seg:6,rad:10});
  dnTube([[0,-.01,.05],[0,-.03,.4],[0,-.06,.72]],[.06,.033,.006],m,head,beak,{sx:.7,seg:12,rad:10});
  dnTube([[0,.04,-.02],[0,.11,-.26],[0,.15,-.52]],[.05,.034,.008],m,head,crestC,{sx:.32,seg:10,rad:8});
  for(const s of [-1,1])dnEye(this,head,s*.05,.025,.04,.016,'#2a1a10',s*1.35);
  // the skin hangs down along the flank when the wings are folded
  this.tick=(t)=>{const op=this.wingOpen||0;for(const I of inners){I.rotation.x=-(1-op)*1.3;I.scale.z=1-.35*(1-op);}};
  dnSaddle(this,body,.03,.02,.2,.85,1,'#5a3a7a');
  Object.assign(o,{neck,head,nTilt:.15,gz:.4,size:1,h:by+.8,rad:.6,biped:true,dustR:[.2,.2,.3]});};

// their facts for the meet card (DINOA, 24c9h-dinos.js)
DINOA.push(
  {k:'parasaurR',e:'🦕',n:'Parasaurolophus',dino:1,food:[['🌿','Ferns'],['🍃','Leaves']],say:['*HOOONK!* 🎺','*munch munch* 🌿','*friendly head bob*'],
    facts:[['🌿','Diet','Herbivore. Leaves, twigs and pine needles, ground up by hundreds of teeth in the back of its bill.'],
      ['🌍','When and where','Western North America (Alberta, Utah and New Mexico), about 77 to 73 million years ago.'],
      ['📏','Size','About 9.5 m (31 ft) long and as heavy as a big elephant. Its crest was up to 1.8 m (6 ft) long!'],
      ['✨','Fun fact','Its crest was hollow inside, with tubes from its nose. Blowing air through it made a deep honk, like a trombone, to call its friends.']]},
  {k:'pteroR',e:'🦕',n:'Pteranodon',dino:1,food:[['🐟','Fish'],['🦐','Shrimp']],say:['*SKRAAAW!*','*big wing stretch*','*beak clack clack*'],
    facts:[['🐟','Diet','Fish! It flew low over the sea and scooped them up with its long beak, a bit like a pelican.'],
      ['🌍','When and where','Over the shallow sea that covered the middle of North America (Kansas!), about 86 to 84 million years ago.'],
      ['📏','Size','Its wings were up to 7 m (23 ft) from tip to tip, wider than a car is long, but it weighed less than a grown-up.'],
      ['✨','Fun fact','It wasn\'t a dinosaur, it was a pterosaur, a flying cousin! Its wings were skin stretched from one super long finger, and its body was covered in fuzz.']]});

// 🏆 the big dinosaurs: earn each one by finishing all of its 🦖 Dino challenges (challenges.js, ids in earn.ids). They live at Dino Valley.
// Same fields as the safari rides (24i-earned-rides.js): wide = legs spread round a broad back, boost = speed, seat = slide the animal back.
function dinoRideList(){return [
  {k:'dtrike',e:'🦕',n:'Big triceratops',nm:'Tank',model:'trikeR',scale:1,dino:1,safari:1,earn:{by:'chal',ids:['dino_meet3','dino_feedT','dino_dig3'],goal:3},ride:2.64,wide:.55,boost:1.7,about:'A full-grown triceratops as big as an elephant, with three long horns and a huge frill! Only for explorers who finish all 3 of his 🦖 Dino challenges.',food:[['🌿','Ferns'],['🌴','Palm leaves'],['🍉','Melon']],say:['*low friendly snort*','*stomp stomp*','Hold on to the frill!']},
  {k:'dstego',e:'🦕',n:'Big stegosaurus',nm:'Spike',model:'stegoR',scale:.95,seat:.8,dino:1,safari:1,earn:{by:'chal',ids:['dino_feedS','dino_dig10','dino_days3'],goal:3},ride:2.03,wide:.45,boost:1.6,about:'A full-grown stegosaurus with tall plates down her back. You sit up in front of the plates! Only for explorers who finish all 3 of her 🦖 Dino challenges.',food:[['🌿','Ferns'],['🥬','Leaves'],['🍓','Berries']],say:['*soft huff*','*plates wiggle*','*munch munch* 🌿']},
  {k:'dcrest',e:'🦕',n:'Parasaurolophus',nm:'Tuba',model:'parasaurR',scale:.9,dino:1,safari:1,earn:{by:'chal',ids:['dino_meetAll','dino_feed20','dino_kinds4'],goal:3},ride:2.49,wide:.5,boost:1.9,about:'A big crested duck-bill dinosaur who honks through her long crest like a trombone! Only for explorers who finish all 3 of her 🦖 Dino challenges.',food:[['🌿','Ferns'],['🍃','Leaves'],['🍐','Pear']],say:['*HOOONK!* 🎺','*happy head bob*','Honk means hello!']},
  {k:'draptor',e:'🦖',n:'Big raptor (Utahraptor)',nm:'Dash',model:'raptorR',scale:1.6,dino:1,safari:1,earn:{by:'chal',ids:['dino_feedR','dino_kinds8','dino_ride300'],goal:3},ride:1.96,wide:.32,boost:2.4,about:'A huge feathered raptor, the biggest kind there was, and the fastest dinosaur ride! Only for speedy explorers who finish all 3 of his 🦖 Dino challenges.',food:[['🍗','Chicken'],['🐟','Fish'],['🥚','Egg']],say:['*chirp chirp*','*fluffs his feathers*','Ready, set, ZOOM! 💨']},
  {k:'dtrex',e:'🦖',n:'Big T. rex',nm:'Rex',model:'trexR',scale:.8,dino:1,safari:1,earn:{by:'chal',ids:['dino_feedX','dino_dig25','dino_days5'],goal:3},ride:2.75,wide:.5,boost:2,about:'A giant, gentle T. rex who lets you ride way up on his back! Only for champions who finish all 3 of his 🦖 Dino challenges.',food:[['🍖','Meat'],['🍗','Drumstick'],['🍉','Melon']],say:['*big rumbly ROAR* 🦖','*tiny arm wave*','*stomp... stomp...*']},
  {k:'dlong',e:'🦕',n:'Big brachiosaurus',nm:'Atlas',model:'longneckR',scale:.85,dino:1,safari:1,earn:{by:'chal',ids:['dino_big3','dino_feed60','dino_ride2k'],goal:3},ride:3.31,wide:.6,boost:1.6,about:'The tallest ride in town! A full-grown brachiosaurus as tall as a house. Only for legends who finish all 3 of his 🦖 Dino challenges.',food:[['🌲','Tree tops'],['🍃','Leaves'],['🍐','Pear']],say:['*deep gentle hum*','I can see the whole island!','*slow happy blink*']},
  {k:'dptero',e:'🦕',n:'Big pteranodon',nm:'Zephyr',model:'pteroR',scale:2.5,dino:1,safari:1,fly:1,earn:{by:'chal',ids:['dino_big6','dino_dig50','dino_days10'],goal:3},ride:2.44,wide:.35,boost:1.9,about:'A giant pteranodon with wings wider than a bus! Tap 🪽 Fly to soar over the whole island. Only for true legends who finish all 3 of her 🦖 Dino challenges.',food:[['🐟','Fish'],['🦐','Shrimp'],['🍤','Fried shrimp']],say:['*SKRAAAW!*','*big wing stretch*','Up, up and away! ☁️']}];}
const DINO_BIG=['dtrike','dstego','dcrest','draptor','dtrex','dlong','dptero'];
