/* ================= PLAYER ================= */
if(!SAVE.look)SAVE.look=defaultLook();
if(!SAVE.name)SAVE.name='';
const player={pos:new THREE.Vector3(0,.15,2.6),vy:0,face:Math.PI,onGround:true,speed:0};
if(!SAVE.look.makeup)SAVE.look.makeup=defaultMakeup();if(!SAVE.look.style)SAVE.look.style='glam';
function loadPaint(a){if(!SAVE.facePaint||!a.paintCv)return;const im=new Image();im.onload=()=>{a.paintCv.getContext('2d').drawImage(im,0,0);a.renderFace();};im.src=SAVE.facePaint;}
let av=new Avatar(SAVE.look,SAVE.name||'Brynny','#ff4d8d',true);scene.add(av.g);loadPaint(av);
const cam={yaw:0,pitch:.3,dist:5.2,cy:0,cp:.3,cd:5.2,closetYaw:0,vo:0,mode:'play',ty:new THREE.Vector3()};
cam.yaw=0;// camera on +z side, so walking "up" heads toward the plaza center first
cam.cy=cam.yaw;

/* ================= FRIENDS ================= */
const FRIENDS=[];
function randLook(){const l=defaultLook();l.face={eyes:rnd(['almond','round','cat','doe']),nose:rnd(['straight','petite','button']),lips:rnd(['full','heart','soft','pout'])};l.style=Math.random()<.75?'glam':'cute';l.skin=rnd(SKIN);l.eyes=rnd(EYES);l.hair={id:rnd(HAIRS)[0],c:rnd(HAIRC)};
  if(Math.random()<.5){const d=rnd(DRESSES);l.dress={id:d[0],c:Math.random()<.5?d[3]:rnd(COLORS)};}else{l.dress=null;const t=rnd(TOPS),b=rnd(BOTTOMS);l.top={id:t[0],c:Math.random()<.5?t[3]:rnd(COLORS)};l.bottom={id:b[0],c:b[3]};}
  const s=rnd(SHOES);l.shoes={id:s[0],c:s[3]};l.hat=Math.random()<.6?(h=>({id:h[0],c:h[3]}))(rnd(HATS)):null;l.extras={};if(Math.random()<.35){const e=rnd(EXTRAS);l.extras[e[0]]=e[3];}return l;}
function friendBubble(f,text){if(f.say){f.g.remove(f.say);f.say.material.map.dispose();f.say.material.dispose();}const s=sprite(labelTex(text,{size:46,w:512,h:110,fg:'#3b2357',border:'#ffd6ea'}),1.5,.32);s.position.y=2.35;f.g.add(s);f.say=s;f.sayT=2.8;}
/* ================= TOWNSPEOPLE ================= */
// Each friend has a home spot, a personality, their own chat lines and a list of little quests.
const TOWN=[
  {n:'Ava',home:'runway',em:'💃',hi:['Hey superstar! ✨','Oh! A fashion icon! 💅'],chat:['I practice my runway walk every single day!','Pink is always in style. Always. 💖','I want to design my own clothes one day.','Did you know a twirl makes any dress 10 times cuter?'],qs:['hat','twirl','photo']},
  {n:'Zoe',home:'beach',em:'🏄‍♀️',hi:['Yo! Wanna race? 🏃‍♀️','Hiii! The waves are perfect today 🌊'],chat:['I found a starfish this morning! ⭐','Last one to the dock is a soggy noodle!','Sandcastles are my favorite thing to build 🏰','I can do a flip! Can you? 🤸'],qs:['stars','flip','visit:christmas']},
  {n:'Mia',home:'spring',em:'🎨',hi:['Oh hi! I was just painting the flowers 🌷','Hello, hello! 🎨'],chat:['Butterflies are like flying paintings 🦋','My favorite color changes every day. Today it is purple!','I painted a picture of a rainbow cat once 🌈🐱','Flowers smell even better after the rain.'],qs:['dance','pet','dress']},
  {n:'Lily',home:'birthday',em:'🎂',hi:['Yay, you came to the party! 🎉','Happy un-birthday! 🥳'],chat:['Every day can be a party if you want! 🎈','I already ate three cupcakes. Shh! 🧁','Balloons make me so happy 🎈','My birthday wish is a secret… but it is about ponies 🦄'],qs:['dress','visit:beach','dance']},
  {n:'Jade',home:'halloween',em:'🦇',hi:['Boo! Did I scare you? 👻','Welcome to the spooky side 🎃'],chat:['The ghosts here are actually super friendly 👻','I named a bat Sir Flaps-a-Lot 🦇','Pumpkin pie is the best pie. No arguments.','I like spooky stuff AND sparkly stuff ✨🕸️'],qs:['visit:spring','hat','stars']},
  {n:'Nora',home:'christmas',em:'⛄',hi:['Brrr! Hi there! ❄️','Hello! Want some hot cocoa? ☕'],chat:['I built that snowman all by myself! ⛄','Snowflakes are all different, just like people ❄️','I always leave cookies for Santa 🍪','Ice skating makes me feel like a princess ⛸️'],qs:['twirl','visit:halloween','pet']},
  {n:'Kiki',home:'studio',em:'👗',hi:['Ooh, let me see your outfit! 👀','Hi bestie! 💕'],chat:['Have you tried the mirrors? Mirror selfies are the best 🪞','I change my outfit like five times a day 😂','Accessories make the outfit! 👜','Glitter is basically a personality ✨'],qs:['wings','photo','shoes']},
];
const LOOK_NAME=(arr,id)=>{const a=arr.find(x=>x[0]===id);return a?[a[2],a[1]]:null;};
const QUESTS={
  hat:{ask:'Can you put on a cute hat and come show me? 👒',hint:'Go to the 👗 Dress up circle in the Sparkle Studio and pick something from Hats.',check:()=>!!SAVE.look.hat},
  dress:{ask:'Will you wear a fancy dress and come back to show me? 👗',hint:'Go to the 👗 Dress up circle in the Sparkle Studio and pick a dress.',check:()=>!!SAVE.look.dress},
  wings:{ask:'I wish I could see fairy wings! Can you wear some? 🧚',hint:'Go to the 👗 Dress up circle in the Sparkle Studio, then look in Extras for wings.',check:()=>!!(SAVE.look.extras&&SAVE.look.extras.wings)},
  shoes:{ask:'Show me your fanciest heels! 👠',hint:'Go to the 👗 Dress up circle in the Sparkle Studio and pick heels from Shoes.',check:()=>!!SAVE.look.shoes&&/heels|platforms|glass/.test(SAVE.look.shoes.id)},
  pet:{ask:'I love animals! Can you bring a pet to meet me? 🐾',hint:'Adopt a pet and bring them here.',check:f=>{const p=myPet();return !!p&&p.pos.distanceTo(f.pos)<6;}},
  stars:{ask:'Can you find 3 stars ⭐ and come tell me?',hint:'Stars are hiding all over town!',n:3},
  twirl:{ask:'Do a twirl for me! 🌀',hint:'Use the 🌀 Twirl move next to me.',act:'twirl'},
  dance:{ask:'Let\'s have a dance party! Show me your moves! 💃',hint:'Use the 💃 Dance move next to me.',act:'dance'},
  flip:{ask:'Bet you can\'t do a flip! 🤸',hint:'Use the 🤸 Flip move next to me.',act:'flip'},
  photo:{ask:'Take a picture with me! 📸',hint:'Stand close and tap 📸 Photo.',act:'photo'},
  visit:{ask:z=>`Can you visit ${Z[z].name} and come back to tell me about it?`,hint:z=>`Walk to ${Z[z].name}, then come back.`},
};
const QA=[
  {q:'Which is better, cats or dogs?',a:[['🐱 Cats','Cats are so fluffy! 😻'],['🐶 Dogs','Woof! Dogs are the best! 🐶'],['🐰 Both!','Good answer! All of them! 💖']]},
  {q:'What\'s your favorite color?',a:[['💖 Pink','Pink twins! 💖'],['💜 Purple','Purple is so magical! 🔮'],['💙 Blue','Like the ocean! 🌊'],['🌈 All','A rainbow girl! 🌈']]},
  {q:'Would you rather be a mermaid or a fairy?',a:[['🧜‍♀️ Mermaid','Splish splash! 🐚'],['🧚 Fairy','Sprinkle some fairy dust on me! ✨']]},
  {q:'Pizza or ice cream?',a:[['🍕 Pizza','Extra cheese please! 🧀'],['🍦 Ice cream','Sprinkles on top! 🍨']]},
  {q:'Which holiday do you love the most?',a:[['🎃 Halloween','Trick or treat! 🍬'],['🎄 Christmas','So cozy! ❄️'],['🎂 Birthdays','Cake for everyone! 🎂']]},
  {q:'Do you like to sing or dance?',a:[['🎤 Sing','La la laaa! 🎶'],['💃 Dance','Let\'s dance right now! 💃']]},
];
const PLAYER_COMPLIMENTS=f=>{const L=f.lookD,o=[];
  if(L.dress){const d=LOOK_NAME(DRESSES,L.dress.id);if(d)o.push(`I love your ${d[0].toLowerCase()}! ${d[1]}`);}
  if(L.hat){const d=LOOK_NAME(HATS,L.hat.id);if(d)o.push(`Your ${d[0].toLowerCase()} is so cute! ${d[1]}`);}
  if(L.shoes){const d=LOOK_NAME(SHOES,L.shoes.id);if(d)o.push(`Cool ${d[0].toLowerCase()}! ${d[1]}`);}
  o.push('Your hair looks amazing! 💇‍♀️','You have the best smile! 😊','You are so nice! 💖');return o;};
const THANKS=['Aww, thank you! You\'re the sweetest! 💖','Stop it, you\'re making me blush! 😊','Yay! You made my day! ✨','Thank you! I like you a lot! 💕'];
function townSave(f){SAVE.town=SAVE.town||{};return SAVE.town[f.name]||(SAVE.town[f.name]={h:0,qi:0,q:null});}
function setFriendTag(f){const s=townSave(f),best=s.h>=5;if(f.tag){f.g.remove(f.tag);f.tag.material.map&&f.tag.material.map.dispose();f.tag.material.dispose();}
  f.tag=sprite(labelTex((best?'💖 ':'')+f.name,{size:60,fg:best?'#ff4d8d':'#8e6cff',bg:'rgba(255,255,255,.9)',border:null}),.9,.225);f.tag.position.y=1.86;f.g.add(f.tag);}
TOWN.forEach((d,i)=>{const L=randLook();const f=new Avatar(L,d.n,'#8e6cff');Object.assign(f,{lookD:L,info:d,face:0,tgt:null,wait:Math.random()*3,say:null,cool:0,speed:0});
  const z=Z[d.home]||ZONES[1+i%(ZONES.length-1)];f.home=z;const a=i*1.7;f.pos=new THREE.Vector3(z.x+Math.sin(a)*z.r*.5,0,z.z+Math.cos(a)*z.r*.5);collide(f.pos);
  const hb=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,2,8),new THREE.MeshBasicMaterial({visible:false}));hb.position.y=1;hb.userData.f=f;f.g.add(hb);f.hb=hb;
  scene.add(f.g);FRIENDS.push(f);setFriendTag(f);});

