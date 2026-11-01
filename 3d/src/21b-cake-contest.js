/* ================= BAKERY CAKE CONTEST =================
   Like a TV baking show: a theme, a countdown, three other bakers, three judges and ⭐ stars for the winners.
   You decorate in the normal cake studio (21-bakery.js) while the clock ticks. When time is up the judges taste
   every cake and hold up a score from 1 to 10. Friends in your online room (online.js) can bake in the same contest;
   computer bakers fill the empty spots. Your own cake design is put back afterwards unless you choose to keep the new one. */
const ck={on:false,phase:'',th:null,secs:180,end:0,k:'',seed:'',backup:null,friends:new Map(),invite:null,
  rivals:[],judges:[],entries:[],jq:[],jT:0,focus:null,hudSec:-1,warned:{},built:false,pick:180,
  cam:{p:new THREE.Vector3(),t:new THREE.Vector3(),wp:new THREE.Vector3(),wt:new THREE.Vector3(),init:false}};
const CK_TIMES=[[120,'2 min'],[180,'3 min'],[300,'5 min']];
const CK_STARS=[3,2,1,0],CK_COINS=[20,15,10,5],CK_MEDAL=['🥇','🥈','🥉','🎀'];
const CK_RIVALS=['Mia','Lulu','Ava'];
const CK_JUDGES=[{n:'Chef Honey',e:'🍯',what:'the theme',w:[.6,.2,.2]},{n:'Granny Sprinkles',e:'👵',what:'decorating',w:[.2,.6,.2]},{n:'Miss Whisk',e:'🥄',what:'the wow',w:[.2,.2,.6]}];
// where things stand in the bakery (local coordinates, see 11-place-bakery.js)
const CK_SLOTS=[[-3.45,-.45],[-3.45,-2.25],[2.75,-.25]],CK_BAKER=[[-2.8,-.45],[-2.8,-2.25],[2.1,-.25]],CK_JSPOT=[[-1.1,-2.15],[0,-2.35],[1.1,-2.15]];
const CK_PAD={lx:1.9,lz:-2.6,r:.6};

/* ---------- colors ---------- */
const ckHSL=c=>{if(!c||c[0]!=='#')return null;const h={};new THREE.Color(c).getHSL(h);return h;};
const ckFam=c=>c&&c[0]==='#'?fam(c):'';
const ckWhite=c=>c==='shimmer'||['#ffffff','#fff4fa','#fff1d6','#fff8f0'].includes(c);
const ckPastel=c=>{if(c==='shimmer')return true;const h=ckHSL(c);return !!h&&h.l>=.68&&h.s>.25;};
const ckBright=c=>{if(c==='funfetti')return true;const h=ckHSL(c);return !!h&&h.s>.45&&h.l>.35&&h.l<.82;};
const CK_TOPC={cherry:'#c8102e',strawberry:'#e0263b',blueberry:'#33407e',oreo:'#1e1512',choc:'#3d2112',star:'#e8c25a',horn:'#e8c25a',rings:'#e8c25a'};

/* ---------- themes: what the judges look for, and how the computer bakers try to make it ---------- */
const CK_THEMES=[
  {id:'birthday',e:'🎂',n:'Birthday Bash',tip:'A party cake! Candles, a happy message, sprinkles and bright colors.',
    want:I=>[[I.C.candles>0,'🕯️','Candles'],[I.text,'✍️','A happy message on top'],[I.has('sprinkles'),'✨','Sprinkles'],[I.any(ckBright),'🎨','Bright, happy frosting'],[I.n>=2,'🎂','2 layers or more']],
    r:{n:[2,3],cols:['#ff8fc8','#4fb6ff','#ffd23f','#b388ff','#7ee081','funfetti','#ff6fae'],styles:['smooth','drip'],border:['swirls','dots'],tops:['sprinkles','cherry','swirl','lolly'],text:['Happy Birthday!','Party time!','Yay!'],candles:1}},
  {id:'unicorn',e:'🦄',n:'Unicorn Dream',tip:'Magical and pastel! A unicorn horn, frosting swirls, flowers and soft colors.',
    want:I=>[[I.has('horn'),'🦄','A unicorn horn'],[I.all(ckPastel),'🌈','Soft pastel frosting'],[I.has('swirl'),'🧁','Frosting swirls'],[I.has('flower')||I.has('pearl'),'🌸','Flowers or sugar pearls'],[I.C.style==='drip'||I.C.border!=='none','💧','A drip or a pretty border']],
    r:{n:[1,2],cols:['#fff4fa','#ffb3d1','#b388ff','#8fd8ff','shimmer'],styles:['drip','smooth'],drip:['#ffb3d1','#8e6cff','#4fb6ff'],border:['swirls','pearls'],borderC:['pastel','#ffffff'],tops:['horn','swirl','flower','pearl'],topC:['#ffb3d1','#b388ff','#8fd8ff','#7ee081','#ffd23f'],plate:['pink','glass']}},
  {id:'chocolate',e:'🍫',n:'Chocolate Lovers',tip:'All about chocolate! Chocolate frosting, a drip, Oreos and berries.',
    want:I=>[[I.any(c=>c==='cookies'||ckFam(c)==='brown'),'🍫','Chocolate frosting'],[I.C.style==='drip','💧','A drip'],[I.has('choc')||I.has('oreo'),'🍪','Chocolate pieces or Oreos'],[I.has('strawberry')||I.has('cherry'),'🍓','Strawberries or cherries'],[I.n>=2,'🎂','2 layers or more']],
    r:{n:[2,3],cols:['#6b3b22','cookies'],styles:['drip'],drip:['#4a2a17','#e8c25a','#fff8f0'],border:['swirls'],borderC:['#4a2a17','#ffffff'],tops:['choc','oreo','strawberry','cherry'],flavor:['chocolate']}},
  {id:'fruit',e:'🍓',n:'Fruit Garden',tip:'Fresh and fruity! Strawberries, blueberries, cherries and flowers.',
    want:I=>[[I.has('strawberry'),'🍓','Strawberries'],[I.has('blueberry'),'🫐','Blueberries'],[I.has('cherry'),'🍒','Cherries'],[I.has('flower'),'🌸','Flowers'],[I.C.style==='naked'||I.all(c=>ckWhite(c)||ckPastel(c)),'🍰','Naked style or light frosting']],
    r:{n:[1,2],cols:['#fff8f0','#ffffff','#ffb3d1','#fff1d6'],styles:['naked','smooth'],border:['dots','none'],tops:['strawberry','blueberry','cherry','flower'],topC:['#ffffff','#ffb3d1','#ffd23f']}},
  {id:'wedding',e:'💍',n:'Wedding Wonder',tip:'Tall and elegant! 3 layers or more, white frosting, pearls and rings.',
    want:I=>[[I.n>=3,'🎂','3 layers or more'],[I.all(ckWhite),'🤍','White frosting'],[I.has('pearl')||I.C.border==='pearls','⚪','Pearls'],[I.has('rings'),'💍','Wedding rings on top'],[I.C.style==='ruffles'||['gold','glass'].includes(I.C.plate),'✨','Ruffles or a fancy stand']],
    r:{n:[3,4],cols:['#ffffff','#fff4fa','shimmer'],styles:['ruffles','smooth'],border:['pearls'],borderC:['#ffffff'],tops:['rings','pearl','flower'],topC:['#ffffff','#ffb3d1'],plate:['gold','glass']}},
  {id:'rainbow',e:'🌈',n:'Rainbow Party',tip:'Every color! Different colored layers, sprinkles and rainbow toppings.',
    want:I=>[[new Set(I.tiers).size>=3||(I.C.style==='naked'&&I.C.flavor==='rainbow')||I.any(c=>c==='funfetti'),'🌈','3 different colored layers (or a rainbow cake)'],[I.n>=3,'🎂','3 layers or more'],[I.has('sprinkles'),'✨','Sprinkles'],[I.colors>=4,'🎨','Toppings in lots of colors'],[I.C.border!=='none','🧁','A border']],
    r:{n:[3,4],cols:['#ff8fc8','#ffd23f','#8fd8ff','#7ee081','#b388ff','#ff8a1f'],mixed:1,styles:['smooth','naked'],flavor:['rainbow'],border:['swirls','dots','pearls'],borderC:['pastel','#ffffff'],tops:['sprinkles','swirl','lolly','macaron'],topC:['#ff6f91','#ffb347','#ffe066','#7ee081','#4fb6ff','#b388ff']}},
  {id:'spooky',e:'🎃',n:'Spooky Sweets',hol:'halloween',tip:'Boo! Orange, black and purple, with lollipops and gold stars.',
    want:I=>[[I.all(c=>['orange','black','purple'].includes(ckFam(c))),'🎃','Orange, black or purple frosting'],[I.C.style==='drip','💧','A spooky drip'],[I.has('lolly'),'🍭','Lollipops'],[I.has('star'),'⭐','Gold stars'],[I.has('sprinkles')||I.C.border==='dots','✨','Sprinkles or dots']],
    r:{n:[2,3],cols:['#ff8a1f','#2d2d3a','#8e6cff'],mixed:1,styles:['drip'],drip:['#8e6cff','#7ee081','#ff8a1f'],border:['dots'],borderC:['#7ee081','#ff8a1f'],tops:['lolly','star','sprinkles'],topC:['#ff8a1f','#8e6cff','#7ee081']}},
  {id:'heart',e:'💖',n:'Sweetheart',hol:'valentine',tip:'Full of love! A heart cake, pink or red frosting, candy hearts and a sweet message.',
    want:I=>[[I.C.shape==='heart','❤️','A heart-shaped cake'],[I.all(c=>['pink','red'].includes(ckFam(c))),'💗','Pink or red frosting'],[I.has('heart'),'💖','Candy hearts'],[I.text,'✍️','A sweet message'],[I.has('pearl')||I.C.border==='pearls','⚪','Pearls']],
    r:{n:[1,2],shape:['heart'],cols:['#ff8fc8','#ffb3d1','#e0263b','#ff6fae'],styles:['smooth','ruffles'],border:['pearls','swirls'],borderC:['#ffffff'],tops:['heart','pearl','strawberry'],topC:['#ffffff','#e0263b','#ff6fae'],text:['Love you!','Be mine','XOXO']}},
  {id:'christmas',e:'🎄',n:'Christmas Cake',hol:'christmas',tip:'Merry and bright! Red, green and white frosting, gold stars, pearls and berries.',
    want:I=>[[I.all(c=>['red','green','white'].includes(ckFam(c))),'🎄','Red, green or white frosting'],[I.has('star'),'⭐','Gold stars'],[I.has('pearl')||I.C.border==='pearls','⚪','Pearls'],[I.has('cherry')||I.has('strawberry'),'🍒','Red berries'],[I.text,'✍️','A merry message']],
    r:{n:[2,3],cols:['#e0263b','#ffffff','#7ee081'],mixed:1,styles:['smooth','ruffles'],border:['pearls','swirls'],borderC:['#ffffff','#e0263b'],tops:['star','pearl','cherry','strawberry'],topC:['#ffffff','#d4af37'],text:['Merry Christmas!','Ho ho ho!','Joy!']}}];
function ckPickTheme(){const hol=CK_THEMES.find(t=>t.hol&&seasonOn(t.hol));if(hol&&Math.random()<.5)return hol;return rnd(CK_THEMES.filter(t=>!t.hol||seasonOn(t.hol)));}

/* ---------- looking at a cake ---------- */
function ckInfo(C){const kinds=new Set(C.top.map(r=>r.k)),tiers=C.tiers.slice(0,C.n);
  const cols=new Set(C.top.map(r=>r.c||CK_TOPC[r.k]).filter(Boolean));
  return {C,n:C.n,tiers,kinds,has:k=>kinds.has(k),all:f=>tiers.every(f),any:f=>tiers.some(f),text:!!(C.text||'').trim(),colors:cols.size+(kinds.has('sprinkles')?3:0)};}
function ckJudge(C,th,R){const I=ckInfo(C),want=th.want(I),T=want.filter(w=>w[0]).length/want.length;
  const D=Math.min(1,I.C.top.length/30)*.4+Math.min(1,I.kinds.size/4)*.3+(C.border!=='none'?.15:0)+(C.style!=='smooth'?.15:0);
  const W=(C.n-1)/3*.3+(C.plate!=='white'?.15:0)+(I.text?.15:0)+(C.candles>0?.1:0)+(['horn','rings','star','lolly'].some(k=>I.has(k))?.1:0)+(new Set(I.tiers).size>1||I.any(c=>c[0]!=='#')?.1:0)+(C.shape!=='round'?.1:0);
  const cards=CK_JUDGES.map(j=>{const v=j.w[0]*T+j.w[1]*D+j.w[2]*W;return Math.max(1,Math.min(10,Math.round(1.6+v*8.4+(R()-.5)*1.2)));});
  return {T,D,W:Math.min(1,W),cards,sum:cards.reduce((a,b)=>a+b,0)};}
// the same seed gives the same numbers on every phone in an online room
function ckRng(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return (h>>>0)/4294967296;};}

/* ---------- the computer bakers' cakes ---------- */
function ckRivalCake(th,q,R){const r=th.r,pick=a=>a[Math.floor(R()*a.length)],yes=()=>R()<q;
  const n=yes()?pick(r.n):pick([1,2,2,3]);
  const C={id:'plain',shape:r.shape&&yes()?pick(r.shape):pick(['round','round','round','square','heart']),n,tiers:[],style:yes()?pick(r.styles):pick(CSTYLES)[0],
    flavor:r.flavor&&yes()?pick(r.flavor):pick(SPONGE)[0],drip:pick(r.drip||DRIPC),border:yes()?pick(r.border):pick(BORDERS)[0],borderC:pick(r.borderC||r.cols.filter(c=>c[0]==='#')),
    top:[],text:'',textC:pick(['#ff3b6b','#8e6cff','#c2185b','#4a2a17']),candles:0,candleC:'rainbow',plate:r.plate&&yes()?pick(r.plate):pick(['white','white','pink','gold'])};
  const one=yes()?pick(r.cols):pick(FROST);const used=[];
  for(let i=0;i<n;i++){let c=r.mixed&&yes()?pick(r.cols.filter(x=>!used.includes(x)).concat(used.length>=r.cols.length?r.cols:[])):(R()<.75?one:yes()?pick(r.cols):pick(FROST));used.push(c);C.tiers.push(c);}
  const D=tierDims(n),top=n-1,kinds=r.tops.filter(()=>yes());if(!kinds.length||R()<.3)kinds.push(pick(CTOP.filter(t=>t[0]!=='rings'&&t[0]!=='horn'))[0]);
  const tc=()=>pick(r.topC||FROST);
  for(const k of kinds){
    if(k==='horn'||k==='rings'){C.top.push(TREC(k,top,'top',0,0));continue;}
    const t=Math.floor(R()*n),c=TCOLOR.has(k)?tc():undefined,a0=R()*Math.PI;
    if(['sprinkles','flower','heart','pearl'].includes(k)&&R()<.5)C.top.push(...ringSide(k,t,6+Math.floor(R()*6),.35+R()*.3,c,a0));
    else C.top.push(...ringTop(k,t,6+Math.floor(R()*7),D,c,t===top&&kinds.includes('horn')?.8:undefined,a0));}
  if(r.text&&yes())C.text=pick(r.text);
  if(r.candles&&yes())C.candles=3+Math.floor(R()*6);
  return C;}
// what a cake looks like while it is still being made (stage 1 baked, 2 frosted, 3 half decorated, 4 done)
function ckStageCake(C,s){const c=JSON.parse(JSON.stringify(C));
  if(s<=1)Object.assign(c,{style:'naked',border:'none',top:[],text:'',candles:0,tiers:c.tiers.map(()=>'#fff8f0')});
  else if(s===2)Object.assign(c,{top:[],text:'',candles:0});
  else if(s===3){c.top=c.top.slice(0,Math.ceil(c.top.length/2));c.candles=0;}
  return c;}

/* ---------- 3D: build any cake from its data, away from your own cake on the stand ---------- */
function cakeModel(C){const keep={cake:SAVE.cake,root:Z.bakery.cakeRoot},b=Object.assign({},bk),g=new THREE.Group();
  SAVE.cake=JSON.parse(JSON.stringify(C));SAVE.cake.candleType='sticks';Z.bakery.cakeRoot=g;Object.assign(bk,{body:null,text:null,light:null,candleG:null});
  try{buildCake();
    // candle glow without a real light: every new light makes the graphics card rebuild its shaders
    if(bk.light&&bk.light.parent)bk.light.parent.remove(bk.light);}
  finally{SAVE.cake=keep.cake;Z.bakery.cakeRoot=keep.root;Object.assign(bk,b);}
  return g;}
function ckDispose(g){if(!g)return;g.parent&&g.parent.remove(g);disposeTree(g);g.traverse(m=>{if(m.userData.own&&m.material&&m.material.map){m.material.map.dispose();m.material.dispose();}});}

/* ---------- the room: contest pad, display stands, bakers and judges ---------- */
const ckW=(lx,y,lz)=>{const [x,z]=Z.bakery.toWorld(lx,lz);return new THREE.Vector3(x,y,z);};
const ckFace=(dx,dz)=>{const r=Z.bakery.rot,c=Math.cos(r),s=Math.sin(r);return Math.atan2(dx*c+dz*s,-dx*s+dz*c);};
{const z=Z.bakery,g=z.g;const white=phys('#ffffff',{roughness:.3,clearcoat:.6}),pink=phys('#ff8fc8',{roughness:.3,clearcoat:1}),gold=std('#e8c25a',{metalness:1,roughness:.25});
  z.ckStands=CK_SLOTS.map(([lx,lz])=>{M(cyl(.36,.4,.8,32),white,lx,.4,lz,g);M(cyl(.42,.42,.04,32),pink,lx,.82,lz,g);M(new THREE.TorusGeometry(.42,.018,8,40),gold,lx,.84,lz,g).rotation.x=Math.PI/2;z.ob(lx,lz,.48);
    const s=new THREE.Group();s.position.set(lx,.84,lz);g.add(s);return s;});
  // a golden pad: step on it to start a contest
  const P=CK_PAD;z.ckPad=P;const pm=glow('#ffd23f',1.4);pm.transparent=true;
  M(new THREE.RingGeometry(.45,.62,40),pm,P.lx,.04,P.lz,g,false,false).rotation.x=-Math.PI/2;
  M(new THREE.CircleGeometry(.45,40),phys('#fff3c4',{roughness:.3,emissive:'#ffd23f',emissiveIntensity:.25}),P.lx,.035,P.lz,g,false,true).rotation.x=-Math.PI/2;
  const tt=canvasTex(128,128,(x)=>{x.font='92px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🏆',64,70);});
  M(new THREE.PlaneGeometry(.6,.6),new THREE.MeshBasicMaterial({map:tt,transparent:true,depthWrite:false}),P.lx,.045,P.lz,g,false,false).rotation.x=-Math.PI/2;
  const lbl=z.ckLbl=sprite(labelTex('🏆 Cake contest!',{size:50,fg:'#b8860b',border:'#ffe066'}),1.8,.45);lbl.position.set(P.lx,1.05,P.lz);g.add(lbl);
  anims.push(t=>{pm.opacity=.55+.45*Math.sin(t*3+1);lbl.position.y=1+Math.sin(t*2+1)*.08;});}
function ckNPC(look,name,col,lx,lz,face){const a=new Avatar(look,name,col);const o={a,g:a.g,pos:ckW(lx,0,lz),face,name};a.g.position.copy(o.pos);a.g.rotation.y=face;a.g.visible=false;scene.add(a.g);return o;}
function ckBuildPeople(){if(ck.built)return;ck.built=true;
  const jl=[{hair:{id:'updo',c:'#f2f2f2',shine:true},dress:{id:'gown',c:'#ffd23f'},hat:null,extras:{pearls:'#ffffff'}},
    {hair:{id:'bob',c:'#d9d9d9'},dress:null,top:{id:'sweater',c:'#ff8fc8'},bottom:{id:'skirt',c:'#8e6cff'},hat:{id:'bow',c:'#ff3b6b'},extras:{glasses:'#8e6cff'}},
    {hair:{id:'highpony',c:'#2b1d16',shine:true},dress:{id:'party',c:'#4fb6ff'},hat:null,extras:{}}];
  ck.judges=CK_JUDGES.map((j,i)=>{const l=Object.assign(randLook(),{style:'glam'},jl[i]);if(!HAIRS.some(h=>h[0]===l.hair.id))l.hair.id=HAIRS[0][0];
    const [lx,lz]=CK_JSPOT[i];return ckNPC(l,`${j.e} ${j.n}`,'#b8860b',lx,lz,ckFace(0,1));});
  ck.rivals=CK_RIVALS.map((n,i)=>{const l=randLook();l.hat=null;const [lx,lz]=CK_BAKER[i],[sx,sz]=CK_SLOTS[i];return ckNPC(l,`🧁 ${n}`,'#c2185b',lx,lz,ckFace(sx-lx,sz-lz));});}
function ckShowPeople(on){[...ck.judges,...ck.rivals].forEach(o=>{o.g.visible=on;});}
anims.push((t,dt)=>{if(!ck.on)return;for(const o of [...ck.judges,...ck.rivals]){if(!o.g.visible)continue;o.g.position.copy(o.pos);o.g.rotation.y=o.face+(o.a.spinY||0);o.a.update(dt,0,false);
  if(o.say){o.sayT-=dt;if(o.sayT<0){o.g.remove(o.say);o.say=null;}}}});

/* ---------- online: friends in your room can bake too (online.js passes our messages along) ---------- */
const ckNet=()=>{const n=window.__net;return n&&n.live()?n:null;};
const HEX6=/^#[0-9a-f]{6}$/i,CK_KINDS=new Set(CTOP.map(t=>t[0]));
const ckNum=(v,a,b,d)=>{v=+v;return Number.isFinite(v)?Math.max(a,Math.min(b,v)):d;};
function ckClean(c){if(!c||typeof c!=='object'||!Array.isArray(c.tiers))return null;const one=(v,list,d)=>list.includes(v)?v:d;const col=(v,d)=>typeof v==='string'&&(HEX6.test(v)||FANCY.some(f=>f[0]===v))?v:d;
  const n=Math.round(ckNum(c.n,1,4,1)),tiers=c.tiers.slice(0,4).map(v=>col(v,'#ffffff'));while(tiers.length<n)tiers.push(tiers[tiers.length-1]||'#ffffff');
  const top=(Array.isArray(c.top)?c.top:[]).slice(0,260).filter(r=>r&&CK_KINDS.has(r.k)).map(r=>({k:r.k,t:Math.round(ckNum(r.t,0,n-1,0)),s:r.s==='side'?'side':'top',a:ckNum(r.a,-20,20,0),f:ckNum(r.f,0,1,.5),r:ckNum(r.r,0,7,0),c:HEX6.test(r.c)?r.c:undefined}));
  return {id:'friend',shape:one(c.shape,CSHAPES.map(s=>s[0]),'round'),n,tiers,style:one(c.style,CSTYLES.map(s=>s[0]),'smooth'),flavor:one(c.flavor,SPONGE.map(s=>s[0]),'vanilla'),
    drip:col(c.drip,'#4a2a17'),border:one(c.border,BORDERS.map(s=>s[0]),'none'),borderC:c.borderC==='pastel'?'pastel':col(c.borderC,'#ffffff'),top,
    text:String(c.text||'').slice(0,28),textC:col(c.textC,'#ff3b6b'),candles:Math.round(ckNum(c.candles,0,MAX_AGE,0)),candleC:c.candleC==='rainbow'?'rainbow':col(c.candleC,'rainbow'),plate:one(c.plate,PLATES.map(p=>p[0]),'white')};}
function ckSend(d){const n=ckNet();if(n)try{n.send(Object.assign({t:'cake',k:ck.k},d));}catch(e){}}
function ckFromNet(id,name,d){if(!d||typeof d.a!=='string')return;
  if(d.a==='start'){const th=CK_THEMES.find(t=>t.id===d.th),ms=ckNum(d.ms,0,600000,0);if(!th||ms<20000)return;
    if(ck.on){if(ck.phase==='intro'&&!ck.k)toast(`${name} started a cake contest too! 🎂`);return;}
    ck.invite={k:String(d.k).slice(0,20),th,end:Date.now()+ms,by:name,id};
    if(!closetOpen&&started)ckOpen(true);else toast(`${name} started a cake contest! 🎂 Step on the 🏆 pad in the bakery to join`);return;}
  if(!ck.on||d.k!==ck.k)return;
  const f=ck.friends.get(id)||{name,cake:null};f.name=name;ck.friends.set(id,f);
  if(d.a==='join'&&ck.phase==='bake')toast(`${name} is baking with you! 👩‍🍳`);
  if(d.a==='cake'){f.cake=ckClean(d.cake);if(ck.phase==='wait')ckRender();}}
// online.js loads after this file, so look for it once the page is ready
addEventListener('load',()=>{if(window.__net)window.__net.on(ckFromNet);if(window.__game)Object.assign(window.__game,{cakeContest:ck,openCakeContest:ckOpen,cakeTimeUp:ckTimeUp});});

/* ---------- the contest panel ---------- */
const ckP=()=>$('#ckcontent');
const ckTime=s=>`${Math.floor(s/60)}:${String(Math.max(0,s%60)).padStart(2,'0')}`;
const ckStar5=v=>{const n=Math.round(v*5);return '⭐'.repeat(n)+'☆'.repeat(5-n);};
function ckOpen(fromInvite){if(ck.on||closetOpen)return;closeTalk();ckBuildPeople();
  const inv=ck.invite&&ck.invite.end-Date.now()>20000?ck.invite:null;ck.invite=inv;
  Object.assign(ck,{on:true,phase:inv?'invite':'intro',k:'',th:inv?inv.th:ckPickTheme(),friends:new Map(),entries:[],focus:null,warned:{},keep:false,backup:null});
  closetOpen=true;document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';Z.bakery.ckLbl.visible=false;Z.bakery.padLbl.visible=false;
  ckStage();ckShowPeople(true);ck.rivals.forEach((o,i)=>{o.g.visible=true;o.a.play('wave');});ck.cam.init=false;
  ckRender();$('#cakect').classList.add('show');sfx('tada');if(fromInvite)banner('🎂 Cake contest!');}
// you stand beside the decorating table, facing the judges
function ckStage(){const S=Z.bakery.stand;player.pos.copy(ckW(-1.05,0,-.3));player.vy=0;player.speed=0;player.face=ckFace(.6,-1);cam.yaw=cam.cy=cam.closetYaw=player.face;}
function ckRender(){let h='';const C=SAVE.cakeContest||{};const th=ck.th;$('#cktitle').textContent='🏆 Cake Contest';$('#ckdone').textContent=ck.phase==='final'?'Done':'Leave';
  const net=ckNet();
  if(ck.phase==='intro'||ck.phase==='invite'){const inv=ck.phase==='invite'?ck.invite:null;const t=inv?inv.th:th;
    h=`<div class="ctTheme"><b>${t.e}</b><div><strong>Theme: ${t.n}</strong><span>${t.tip}</span></div></div>`;
    if(inv)h+=`<p class="cttext"><b>${ckEsc(inv.by)}</b> started a cake contest! You have <b>${ckTime(Math.round((inv.end-Date.now())/1000))}</b> to decorate your cake.</p>`;
    else h+=`<p class="cttext">You have a little bit of time to decorate a cake for the theme. When the clock runs out, the judges taste every cake and give a score from 1 to 10.</p>
      <h3>How much time?</h3><div class="chips">${CK_TIMES.map(([s,n])=>`<button class="${s===ck.pick?'on':''}" data-ckt="${s}">⏱️ ${n}</button>`).join('')}</div>`;
    h+=`<h3>The judges</h3><div class="ctwant">${CK_JUDGES.map(j=>`<div><b>${j.e}</b><span>${j.n} loves ${j.what}</span></div>`).join('')}</div>
      <h3>Prizes</h3><div class="earn">${CK_STARS.map((s,i)=>`<div><b>${CK_MEDAL[i]}</b><span>${['1st','2nd','3rd','4th'][i]} place</span><em>${s?`+${s} ⭐ `:''}+${CK_COINS[i]} 🪙</em></div>`).join('')}</div>
      <p class="cttext">${net&&!inv?'Friends in your room can bake with you! ':''}You're up against <b>${CK_RIVALS.join(', ')}</b>.${C.wins?` You have won ${C.wins} time${C.wins>1?'s':''}! 🏆`:''}</p>
      <div class="ctbtns"><button class="btn big" data-ck="${inv?'join':'start'}">${inv?'👩‍🍳 Join the contest!':'⏱️ Start baking!'}</button></div>`;}
  else if(ck.phase==='confirm'){const left=Math.max(0,Math.round((ck.end-Date.now())/1000));
    h=`<div class="ctTheme"><b>⏱️</b><div><strong>${ckTime(left)} left</strong><span>Are you finished decorating?</span></div></div>
      <div class="ctbtns"><button class="btn ghost" data-ck="back">🎂 Keep decorating</button><button class="btn big" data-ck="finish">✅ I'm done!</button></div>`;}
  else if(ck.phase==='wait'){const left=Math.max(0,Math.round((ck.end-Date.now())/1000));
    h=`<div class="ctTheme"><b>⏳</b><div><strong>Waiting for your friends</strong><span>${left?`${ckTime(left)} left on the clock`:'Almost ready…'}</span></div></div>
      <div class="ctwant">${[...ck.friends.values()].map(f=>`<div><b>${f.cake?'✅':'🧁'}</b><span>${ckEsc(f.name)}</span></div>`).join('')}</div>`;}
  else if(ck.phase==='final'){const rows=ck.entries.slice().sort((a,b)=>b.res.sum-a.res.sum||(a.name<b.name?-1:1));const place=rows.findIndex(r=>r.you),me=rows[place];
    h=`<div class="ctTheme gold"><b>${CK_MEDAL[place]}</b><div><strong>${place===0?'You won the cake contest!':`You came in ${['1st','2nd','3rd','4th','5th','6th'][place]} place!`}</strong><span>${place===0?'You are the Star Baker! 👑':'Yummy job! Try again to win!'} ${CK_STARS[place]?`+${CK_STARS[place]} ⭐ `:''}+${CK_COINS[Math.min(3,place)]} 🪙</span></div></div>
      <div class="ctwant"><div><b>${th.e}</b><span>Theme ${ckStar5(me.res.T)}</span></div><div><b>🍓</b><span>Decorating ${ckStar5(me.res.D)}</span></div><div><b>✨</b><span>Wow ${ckStar5(me.res.W)}</span></div></div>
      <h3>Scores</h3><div class="board">${rows.map((r,i)=>`<div class="${r.you?'me':''}"><b>${CK_MEDAL[i]||i+1}</b><span>${r.you?'⭐ ':r.friend?'👭 ':''}${ckEsc(r.name)}</span><i><u style="width:${Math.round(r.res.sum/30*100)}%"></u></i><em>${r.res.sum}</em></div>`).join('')}</div>
      <p class="cttext">${th.want(ckInfo(me.cake)).map(([v,e,t])=>`${v?'✅':'⬜'} ${e} ${t}`).join('<br>')}</p>
      <div class="ctbtns"><button class="btn" data-ck="again">🔁 Play again</button><button class="btn ghost" data-ck="keep">💾 Keep this cake</button></div>
      <p class="drawhint">Tap Done to put your old cake back on the stand, or 💾 Keep this cake.</p>`;}
  ckP().innerHTML=h;}
const ckEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
$('#ckcontent').onclick=e=>{const t=e.target.closest('[data-ckt]');if(t){ck.pick=+t.dataset.ckt;sfx('pop');ckRender();return;}
  const b=e.target.closest('[data-ck]');if(!b)return;const k=b.dataset.ck;sfx('pop');
  if(k==='start'){ck.k=Math.random().toString(36).slice(2,10);ck.secs=ck.pick;ckBegin(Date.now()+ck.secs*1000);ckSend({a:'start',th:ck.th.id,ms:ck.secs*1000});}
  else if(k==='join'){const inv=ck.invite;ck.invite=null;if(!inv||inv.end-Date.now()<15000){toast('That contest is almost over 😢');ck.phase='intro';ckRender();return;}
    ck.k=inv.k;ck.th=inv.th;ck.friends.set(inv.id,{name:inv.by,cake:null});ckBegin(inv.end);ckSend({a:'join'});}
  else if(k==='back'){ck.phase='bake';$('#cakect').classList.remove('show');closetOpen=false;openBakery();$('#bdone').textContent='✅ Finished!';}
  else if(k==='finish')ckTimeUp();
  else if(k==='again'){ckEnd(true);closetOpen=false;ckOpen();}
  else if(k==='keep'){ck.keep=true;toast('Your contest cake stays on the stand 🎂');ckEnd();}};
$('#ckdone').onclick=()=>{sfx('pop');ckEnd();};

/* ---------- baking against the clock ---------- */
function ckBegin(end){const th=ck.th;Object.assign(ck,{phase:'bake',end,secs:Math.round((end-Date.now())/1000),seed:ck.k+th.id,backup:JSON.parse(JSON.stringify(SAVE.cake)),keep:false,hudSec:-1,warned:{},slots:3});
  // computer bakers: same cakes on every phone in the room, because they come from the contest's seed
  ck.rv=CK_RIVALS.map((n,i)=>{const R=ckRng(ck.seed+'|'+n);const q=.35+R()*.5;return {name:n,i,q,cake:ckRivalCake(th,q,R),speed:.8+R()*.35,stage:0,model:null};});
  SAVE.cake=presetCake('plain');buildCake();persist();
  $('#cakect').classList.remove('show');closetOpen=false;btab='cake';openBakery();$('#bdone').textContent='✅ Finished!';
  ck.rivals.forEach((o,i)=>{o.a.play('wave');setTimeout(()=>npcSay(o,rnd(['Let’s bake! 🧁','I’ve got this! 💪','Good luck! 🍀'])),400+i*500);});
  banner(`${th.e} ${th.n}!`);ckHud();}
// the studio's Done button lands here (see closeBakery in 21-bakery.js)
function ckStudioClosed(){if(ck.phase!=='bake'||ck.forceEnd)return;$('#bdone').textContent='Done';
  if(ck.end-Date.now()>20000){ck.phase='confirm';closetOpen=true;document.body.classList.add('dressing');ckStage();Z.bakery.padLbl.visible=false;ckRender();$('#cakect').classList.add('show');return;}
  ckTimeUp();}
function ckTimeUp(){if(ck.phase!=='bake'&&ck.phase!=='confirm')return;
  if(bakeryOpen){ck.forceEnd=true;closeBakery();ck.forceEnd=false;}
  $('#bdone').textContent='Done';closetOpen=true;document.body.classList.add('dressing');ckStage();Z.bakery.padLbl.visible=false;
  did('cake',SAVE.cake.n);ckSend({a:'cake',cake:SAVE.cake});
  if(ck.friends.size){ck.phase='wait';ckRender();$('#cakect').classList.add('show');}else{$('#cakect').classList.remove('show');ckJudgeAll();}}
function ckRivalStep(){if(!ck.rv)return;const done=ck.phase!=='bake'&&ck.phase!=='confirm',f=done?1:1-(ck.end-Date.now())/(ck.secs*1000);
  ck.rv.forEach((r,i)=>{if(i>=ck.slots)return;const s=done?4:[.06,.28,.55,.85].filter(x=>f*r.speed>=x).length;if(s===r.stage)return;r.stage=s;
    ckDispose(r.model);r.model=null;if(s>0){r.model=cakeModel(ckStageCake(r.cake,s));r.model.scale.setScalar(.55);Z.bakery.ckStands[i].add(r.model);}
    const o=ck.rivals[i];if(o&&s>1&&s<4&&ck.phase==='bake'){o.a.play(rnd(['clap','magic','twirl']));if(Math.random()<.5)npcSay(o,['','','Frosting time! 🍦','Toppings! 🍓'][s]);}});}
function ckHud(){const H=$('#ckHud');H.style.display=ck.on&&(ck.phase==='bake'||ck.phase==='judge')?'block':'none';$('#ckWant').style.display='none';$('#ckSkip').style.display=ck.phase==='judge'?'block':'none';$('#ckCards').innerHTML='';}
anims.push((t,dt)=>{if(!ck.on)return;
  // how many stands the computer bakers get (friends' cakes take the rest)
  ck.slots=Math.max(0,Math.min(3,4-1-ck.friends.size));
  if(ck.phase==='bake'||ck.phase==='confirm'||ck.phase==='wait'){const left=Math.max(0,Math.ceil((ck.end-Date.now())/1000));
    if(left!==ck.hudSec){ck.hudSec=left;ckRivalStep();
      if(ck.phase==='bake'){const I=ckInfo(SAVE.cake),want=ck.th.want(I),got=want.filter(w=>w[0]).length;
        $('#ckTop').innerHTML=`<span class="${left<=10?'hot':''}">⏱️ ${ckTime(left)}</span><button id="ckThemeBtn">${ck.th.e} ${ck.th.n} · ${got}/5 ✅</button>`;
        if($('#ckWant').style.display==='block')ckWantList();}
      if(ck.phase==='confirm'||ck.phase==='wait')ckRender();
      if(left===60&&!ck.warned[60]){ck.warned[60]=1;banner('⏱️ 1 minute left!');}
      if(left===30&&!ck.warned[30]){ck.warned[30]=1;banner('⏱️ 30 seconds!');sfx('pop');}
      if(left<=10&&left>0&&ck.phase==='bake')tone(880,.08,'square',.08);
      if(left===0&&(ck.phase==='bake'||ck.phase==='confirm')){banner('⏰ Time’s up! Spatulas down!');sfx('tada');ckTimeUp();}}
    if(ck.phase==='wait'&&([...ck.friends.values()].every(f=>f.cake)||Date.now()>ck.end+8000)){$('#cakect').classList.remove('show');ckJudgeAll();}}
  // judging runs on the real clock so it keeps the same pace on slow phones
  {const now=performance.now(),rdt=Math.min(.5,(now-(ck.lastNow||now))/1000);ck.lastNow=now;if(ck.phase==='judge')ckJudgeStep(rdt);}
  // walked away (or a friend took you somewhere else): end it
  if(curZone&&curZone!==Z.bakery&&ck.phase!=='bake'){ckRestore();ckEnd();}});
function ckWantList(){const want=ck.th.want(ckInfo(SAVE.cake));$('#ckWant').innerHTML=`<b>${ck.th.e} ${ck.th.n}</b><span>${ck.th.tip}</span>${want.map(([v,e,t])=>`<div>${v?'✅':'⬜'} ${e} ${t}</div>`).join('')}`;}
$('#ckTop').addEventListener('click',e=>{if(!e.target.closest('#ckThemeBtn'))return;const w=$('#ckWant');const on=w.style.display!=='block';w.style.display=on?'block':'none';if(on)ckWantList();sfx('pop');});
$('#ckWant').addEventListener('click',()=>{$('#ckWant').style.display='none';});

/* ---------- judging ---------- */
function ckJudgeAll(){ck.phase='judge';const th=ck.th;ckRivalStep();
  const me={name:SAVE.name||'You',you:true,cake:JSON.parse(JSON.stringify(SAVE.cake)),at:'stand'};
  const friends=[...ck.friends.values()].filter(f=>f.cake).map((f,i)=>({name:f.name,friend:true,cake:f.cake,at:2-i>=0?2-i:null}));
  // friends' cakes go on the stands from the right; computer bakers keep the ones they used
  friends.forEach(f=>{if(f.at==null)return;const st=Z.bakery.ckStands[f.at];const r=ck.rv[f.at];if(r){ckDispose(r.model);r.model=null;r.stage=9;}
    f.model=cakeModel(f.cake);f.model.scale.setScalar(.55);st.add(f.model);});
  const rivals=ck.rv.slice(0,ck.slots).map((r,i)=>({name:r.name,rival:i,cake:r.cake,at:i}));
  ck.rivals.forEach((o,i)=>{o.g.visible=i<ck.slots;o.face=ckFace(0,1);o.a.play('wave');});
  ck.entries=[...rivals,...friends,me];ck.entries.forEach(e=>{e.res=ckJudge(e.cake,th,ckRng(ck.seed+'#'+e.name));});
  ck.jq=ck.entries.slice();ck.jT=0;ck.cur=null;ckHud();ck.cam.init=false;sfx('tada');banner('🍴 Judging time!');}
function ckJudgeStep(dt){ck.jT-=dt;if(ck.jT>0)return;
  if(ck.cur&&!ck.cur.shown){ck.cur.shown=true;const e=ck.cur;
    $('#ckCards').innerHTML=CK_JUDGES.map((j,i)=>`<div style="animation-delay:${i*.35}s"><b class="${e.res.cards[i]>=8?'hi':''}">${e.res.cards[i]}</b><span>${j.e} ${j.n}</span></div>`).join('')+`<div class="tot" style="animation-delay:1.05s"><b>${e.res.sum}</b><span>Total</span></div>`;
    CK_JUDGES.forEach((j,i)=>setTimeout(()=>{if(!ck.on)return;const n=e.res.cards[i];tone(500+n*60,.18,'triangle',.12);if(n>=8)ck.judges[i].a.play('clap');},i*350));
    if(e.you)setTimeout(()=>av.play(e.res.sum>=22?'cheer':'bow'),1200);
    ck.jT=2.6;return;}
  const e=ck.cur=ck.jq.shift();if(!e){ckFinish();return;}
  ck.focus=e.at;$('#ckCards').innerHTML='';
  $('#ckTop').innerHTML=`<span>🍴 The judges taste ${e.you?'your':ckEsc(e.name)+'’s'} cake…</span>`;
  ck.judges.forEach((o,i)=>{const p=ckFocusPos();o.face=Math.atan2(p.x-o.pos.x,p.z-o.pos.z);if(Math.random()<.6)setTimeout(()=>npcSay(o,rnd(['Mmm! 😋','So pretty! 💖','Yummy!','Ooh la la!','Delicious! 🍰'])),300+i*250);});
  burst(ckFocusPos().add(new THREE.Vector3(0,.4,0)),'#ffd6ea',24,1.2,.1);ck.jT=1.1;}
$('#ckSkip').onclick=()=>{sfx('pop');ck.jq=[];ck.cur=null;ckFinish();};
function ckFocusPos(){const at=ck.focus;if(at==='stand'||at==null)return ckW(Z.bakery.stand.lx,.95,Z.bakery.stand.lz);const [lx,lz]=CK_SLOTS[at];return ckW(lx,1.05,lz);}
function ckFinish(){if(ck.phase!=='judge')return;ck.phase='final';ck.focus=null;ckHud();
  const rows=ck.entries.slice().sort((a,b)=>b.res.sum-a.res.sum||(a.name<b.name?-1:1)),place=rows.findIndex(r=>r.you),me=rows[place];
  const C=SAVE.cakeContest=Object.assign({played:0,wins:0},SAVE.cakeContest);C.played++;if(place===0)C.wins++;C.best=Math.max(C.best||0,me.res.sum);persist();
  did('cakect',place);
  if(CK_STARS[place])dispatchEvent(new CustomEvent('brynny:prize',{detail:{n:CK_STARS[place],e:CK_MEDAL[place],t:`Cake contest: ${['1st','2nd','3rd'][place]} place!`,b:place===0?'👑 Star Baker!':`${CK_MEDAL[place]} Cake contest prize!`}}));
  setTimeout(()=>earn(CK_COINS[Math.min(3,place)],'Cake contest'),600);
  if(place===0){banner('👑 Star Baker! 👑');sfx('tada');try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}av.play('cheer');const P=ckFocusPos();
    for(let k=0;k<5;k++)setTimeout(()=>burst(new THREE.Vector3(P.x+(Math.random()-.5)*2,P.y+1.5,P.z+(Math.random()-.5)*2),rnd(['#ffd23f','#ff8fc8','#8fd8ff']),50,3.5),k*220);}
  else{banner(CK_MEDAL[place]+' Nice baking!');av.play('clap');}
  ck.judges.forEach(o=>{o.face=ckFace(0,1);o.a.play('clap');});
  const win=rows[0];ck.rivals.forEach((o,i)=>{if(win.rival===i)o.a.play('cheer');else if(o.g.visible)o.a.play('clap');});
  ckRender();$('#cakect').classList.add('show');$('#ckcontent').scrollTop=0;}

/* ---------- ending ---------- */
function ckRestore(){if(ck.backup&&!ck.keep){SAVE.cake=ck.backup;buildCake();persist();}ck.backup=null;}
function ckEnd(again){if(!ck.on)return;ckRestore();
  if(bakeryOpen){ck.forceEnd=true;closeBakery();ck.forceEnd=false;}
  ck.on=false;ck.phase='';ck.focus=null;ck.invite=null;$('#bdone').textContent='Done';
  (ck.rv||[]).forEach(r=>{ckDispose(r.model);r.model=null;});ck.rv=null;
  Z.bakery.ckStands.forEach(s=>[...s.children].forEach(ckDispose));
  ckShowPeople(false);ckHud();$('#ckHud').style.display='none';$('#cakect').classList.remove('show');
  Z.bakery.ckLbl.visible=true;Z.bakery.padLbl.visible=true;
  if(!again){closetOpen=false;document.body.classList.remove('dressing');player.pos.copy(ckW(.9,0,.2));player.vy=0;player.face=Z.bakery.rot;cam.yaw=cam.cy=Z.bakery.rot;}}

/* ---------- camera while the contest panel or judging is showing ---------- */
function cakeContestCam(dt){if(!ck.on||bakeryOpen)return;const c=ck.cam;
  if(ck.focus!=null){const P=ckFocusPos(),[lx,lz]=Z.bakery.toLocal(P.x,P.z);c.wt.copy(P).add(new THREE.Vector3(0,.15,0));c.wp.copy(ckW(lx*.5,P.y+1.05,lz+1.9));}
  else{c.wt.copy(ckW(0,1.0,-1.2));c.wp.copy(ckW(-.2,2.9,3.9));}
  if(!c.init){c.p.copy(camera.position);c.t.copy(c.wt);c.init=true;}
  const a=Math.min(1,dt*3);c.p.lerp(c.wp,a);c.t.lerp(c.wt,a);camera.position.copy(c.p);camera.lookAt(c.t);}

/* ---------- the golden pad ---------- */
let onCkPad=false;
anims.push(()=>{if(!started)return;const z=Z.bakery,[lx,lz]=z.toLocal(player.pos.x,player.pos.z),d=Math.hypot(lx-CK_PAD.lx,lz-CK_PAD.lz);
  if(d<CK_PAD.r&&player.onGround&&!closetOpen){if(!onCkPad){onCkPad=true;ckOpen();}}else if(d>1.3)onCkPad=false;});
