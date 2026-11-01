/* ================= BAKERY (design your own cake) ================= */
const SPONGE=[['vanilla','#f6dfa4','🍦','Vanilla'],['chocolate','#6b3b22','🍫','Chocolate'],['strawberry','#ffb3c4','🍓','Strawberry'],['redvelvet','#b3243a','❤️','Red velvet'],['lemon','#ffe680','🍋','Lemon'],['rainbow',null,'🌈','Rainbow']];
const RAINBOW6=['#ff6f91','#ffb347','#ffe066','#7ee081','#4fb6ff','#b388ff'],PASTEL=['#ffb3d1','#b388ff','#8fd8ff','#7ee081','#ffd23f'];
const FROST=['#ffffff','#fff4fa','#fff1d6','#ffb3d1','#ff8fc8','#ff6fae','#c2185b','#e0263b','#ff8a1f','#ffd23f','#7ee081','#2fd1c5','#8fd8ff','#4fb6ff','#b388ff','#8e6cff','#6b3b22','#2d2d3a'];
const FANCY=[['cookies','🍪','Cookies & cream','radial-gradient(circle at 30% 30%,#2a1d18 12%,transparent 14%),radial-gradient(circle at 70% 60%,#2a1d18 10%,transparent 12%),#f7f3ee'],['funfetti','🎉','Funfetti','radial-gradient(circle at 30% 30%,#ff3b6b 10%,transparent 12%),radial-gradient(circle at 70% 40%,#4fb6ff 10%,transparent 12%),radial-gradient(circle at 45% 72%,#ffd23f 10%,transparent 12%),#fff7ef'],['shimmer','✨','Shimmer','linear-gradient(135deg,#ffe6f2,#fff,#e6dcff,#fff)']];
const DRIPC=['#4a2a17','#fff8f0','#ff6fae','#c9822b','#e8c25a','#4fb6ff','#8e6cff','#7ee081','#e0263b'];
const CSTYLES=[['smooth','🎂','Smooth'],['drip','🍫','Drip'],['ruffles','🌸','Ruffles'],['naked','🍰','Naked']];
const BORDERS=[['none','🚫','None'],['pearls','⚪','Pearls'],['swirls','🧁','Swirls'],['dots','🔵','Dots']];
const CSHAPES=[['round','⭕','Round'],['square','⬛','Square'],['heart','❤️','Heart']];
const PLATES=[['white','🍽️','White plate',0,'#ffffff'],['gold','✨','Gold stand',.13,'#e8c25a'],['pink','🎀','Pink stand',.13,'#ff8fc8'],['glass','💎','Glass stand',.13,'#dff4ff']];
const CTOP=[['cherry','🍒','Cherry'],['strawberry','🍓','Strawberry'],['blueberry','🫐','Blueberry'],['oreo','🍪','Oreo'],['macaron','🍬','Macaron'],['choc','🍫','Chocolate'],['swirl','🧁','Frosting swirl'],['flower','🌸','Flower'],['pearl','⚪','Sugar pearl'],['heart','💖','Candy heart'],['star','⭐','Gold star'],['sprinkles','✨','Sprinkles'],['lolly','🍭','Lollipop'],['horn','🦄','Unicorn horn'],['rings','💍','Wedding rings']];
const TCOLOR=new Set(['macaron','swirl','flower','pearl','heart','lolly']);
const STANDUP={oreo:.032,choc:.03,star:.038,heart:.026};
const TSPACE={pearl:.034,sprinkles:.07,blueberry:.045,cherry:.065,swirl:.06,flower:.06};
const CANDLEC=['rainbow','#ff6fae','#ffd23f','#ffffff','#4fb6ff','#8e6cff','#7ee081'];
const CAKES=[['birthday','🎂','Birthday'],['wedding','💍','Wedding'],['oreo','🍪','Oreo'],['rainbow','🌈','Rainbow'],['chocolate','🍫','Chocolate drip'],['strawberry','🍓','Strawberry'],['unicorn','🦄','Unicorn'],['heart','💖','Sweetheart'],['spooky','🎃','Spooky'],['plain','⚪','Plain']];
const BTABS=[['cake','🎂','Cakes'],['frost','🍦','Frosting'],['tops','🍓','Toppings'],['write','✍️','Writing'],['candles','🕯️','Candles']];
const WRITE_IDEAS=n=>['Happy Birthday!',`Happy Birthday ${n}!`,'Congrats!','Love you!','Mr & Mrs','Yum!','BFFs 💖'];

function tierDims(n){const out=[];let y=0;for(let i=0;i<n;i++){const R=n===1?.48:n===4?.5-.1*i:.5-.13*i,h=n===1?.38:.3-.02*i;out.push({R,h,y0:y});y+=h;}return out;}
const TREC=(k,t,s,a,f,c)=>({k,t,s,a:+a.toFixed(3),f:+f.toFixed(3),r:+(Math.random()*6.28).toFixed(2),c});
function ringTop(k,t,n,dims,c,f,a0=0){f=f??(t===dims.length-1?.78:(dims[t+1].R/dims[t].R+1)/2);const out=[];for(let i=0;i<n;i++)out.push(TREC(k,t,'top',a0+i/n*Math.PI*2,f,typeof c==='function'?c(i):c));return out;}
function ringSide(k,t,n,f,c,a0=0){const out=[];for(let i=0;i<n;i++)out.push(TREC(k,t,'side',a0+i/n*Math.PI*2,f,typeof c==='function'?c(i):c));return out;}
function presetCake(id){const c={id,shape:'round',n:2,tiers:['#fff4fa','#ffb3d1'],style:'smooth',flavor:'vanilla',drip:'#4a2a17',border:'none',borderC:'#ffffff',top:[],text:'',textC:'#ff3b6b',candles:0,candleC:'rainbow',plate:'white'};
  const D=n=>tierDims(n);
  if(id==='birthday'){Object.assign(c,{border:'swirls',borderC:'#ff6fae',text:'Happy Birthday!',candles:5});c.top=[...ringSide('sprinkles',0,9,.5),...ringSide('sprinkles',1,7,.5,null,.4),...ringTop('cherry',0,10,D(2))];}
  else if(id==='wedding'){Object.assign(c,{n:3,tiers:['#ffffff','#ffffff','#ffffff'],style:'ruffles',border:'pearls',borderC:'#ffffff',plate:'gold'});
    c.top=[TREC('rings',2,'top',0,0)];const fc=['#ffb3d1','#ffffff','#ff8fc8'];for(let t=0;t<3;t++)[[-.35,.3],[0,.62],[.32,.85]].forEach(([a,f],i)=>c.top.push(TREC('flower',t,'side',a+t*.15,f,fc[(i+t)%3])));c.top.push(...ringTop('pearl',0,22,D(3),'#ffffff'),...ringTop('pearl',1,18,D(3),'#ffffff'));}
  else if(id==='oreo'){Object.assign(c,{tiers:['cookies','cookies'],style:'drip',drip:'#4a2a17',border:'swirls',borderC:'#ffffff',flavor:'chocolate'});c.top=[...ringTop('oreo',1,7,D(2)),...ringTop('oreo',0,11,D(2)),...ringTop('swirl',1,7,D(2),'#ffffff',.45,.45)];}
  else if(id==='rainbow'){Object.assign(c,{n:3,tiers:['#ff8fc8','#ffd23f','#8fd8ff'],border:'pearls',borderC:'#ffffff',candles:3,flavor:'rainbow'});c.top=[...ringSide('sprinkles',0,8,.5),...ringSide('sprinkles',1,7,.5),...ringSide('sprinkles',2,6,.5),...ringTop('swirl',2,8,D(3),i=>RAINBOW6[i%6])];}
  else if(id==='chocolate'){Object.assign(c,{tiers:['#6b3b22','#6b3b22'],style:'drip',drip:'#e8c25a',border:'swirls',borderC:'#4a2a17',flavor:'chocolate'});c.top=[...ringTop('strawberry',1,6,D(2)),...ringTop('choc',0,9,D(2))];}
  else if(id==='strawberry'){Object.assign(c,{n:1,tiers:['#fff8f0'],style:'naked',flavor:'vanilla',border:'dots',borderC:'#fff8f0'});c.top=[...ringTop('strawberry',0,10,D(1),null,.78),...ringTop('blueberry',0,8,D(1),null,.45,.3),TREC('flower',0,'top',0,0,'#ffffff')];}
  else if(id==='unicorn'){Object.assign(c,{n:1,tiers:['#fff4fa'],style:'drip',drip:'#ffb3d1',border:'swirls',borderC:'pastel',plate:'pink'});c.top=[TREC('horn',0,'top',0,0),...ringTop('swirl',0,9,D(1),i=>PASTEL[i%5],.78,Math.PI/9),...ringSide('flower',0,5,.55,i=>PASTEL[i%5],-.6)];}
  else if(id==='heart'){Object.assign(c,{shape:'heart',n:1,tiers:['#ff8fc8'],style:'smooth',border:'pearls',borderC:'#ffffff',text:'Love you!',textC:'#ffffff'});c.top=[...ringTop('heart',0,8,D(1),i=>i%2?'#ffffff':'#e0263b',.8),...ringSide('heart',0,10,.5,'#ffffff')];}
  else if(id==='spooky'){Object.assign(c,{tiers:['#ff8a1f','#2d2d3a'],style:'drip',drip:'#8e6cff',border:'dots',borderC:'#7ee081',flavor:'chocolate'});c.top=[...ringTop('star',1,5,D(2)),...ringTop('lolly',0,8,D(2),i=>i%2?'#ff8a1f':'#8e6cff'),...ringSide('sprinkles',0,8,.5)];}
  else Object.assign(c,{n:1,tiers:['#ffffff']});
  return c;}
if(!SAVE.cake||!SAVE.cake.tiers)SAVE.cake=presetCake('birthday');

/* textures and shared bits */
TEX.cookies=noiseTex('#f7f3ee',()=>Math.random()<.7?'rgba(42,29,24,.9)':'rgba(90,70,60,.6)',700,3,4);
TEX.funfetti=noiseTex('#fff7ef',()=>rnd(['#ff3b6b','#4fb6ff','#ffd23f','#7ee081','#b388ff','#ff8a1f']),420,3,5);
TEX.crumb=noiseTex('#ffffff',()=>`rgba(${Math.random()<.5?'0,0,0':'255,255,255'},${(Math.random()*.25).toFixed(2)})`,3500,3,2.5);
TEX.seeds=canvasTex(64,64,(x)=>{x.fillStyle='#e8213b';x.fillRect(0,0,64,64);x.fillStyle='#ffe27a';for(let i=0;i<14;i++){x.beginPath();x.ellipse(Math.random()*64,Math.random()*64,1.6,2.6,0,0,Math.PI*2);x.fill();}});
TEX.spiral=canvasTex(128,128,(x)=>{x.fillStyle='#ffffff';x.fillRect(0,0,128,128);x.strokeStyle='#d9d9d9';x.lineWidth=11;x.beginPath();for(let a=0;a<Math.PI*8;a+=.1){const r=a*2.4;x.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r);}x.stroke();});
const cakeMat={};const cmat=(k,f)=>cakeMat[k]||(cakeMat[k]=f());
const frostMat=c=>cmat('f'+c,()=>c==='cookies'?phys('#ffffff',{map:TEX.cookies,roughness:.6}):c==='funfetti'?phys('#ffffff',{map:TEX.funfetti,roughness:.55}):c==='shimmer'?phys('#fff0f8',{map:TEX.glitter,metalness:.35,roughness:.3,iridescence:.7}):phys(c,{roughness:.5,clearcoat:.25,sheen:.4,sheenColor:new THREE.Color('#ffffff')}));
const frostCol=c=>c==='cookies'?'#f7f3ee':c==='funfetti'?'#fff7ef':c==='shimmer'?'#fff0f8':c;
const spongeMat=c=>cmat('s'+c,()=>phys(c,{map:TEX.crumb,roughness:.95}));
const dripMat=c=>cmat('d'+c,()=>c==='#e8c25a'?std(c,{metalness:1,roughness:.22}):phys(c,{roughness:.15,clearcoat:1}));
const instMat=k=>cmat('i'+k,()=>k==='pearls'?phys('#ffffff',{roughness:.15,clearcoat:1,iridescence:.5}):phys('#ffffff',{roughness:.45,clearcoat:.3}));
const TGEO={};const tgeo=(k,f)=>TGEO[k]||(TGEO[k]=f());
const hash1=k=>{const s=Math.sin(k*12.9898+78.233)*43758.5453;return s-Math.floor(s);};

function cakeShape(shape,R){const s=new THREE.Shape();
  if(shape==='square'){const w=R*.86,r=R*.14;s.moveTo(-w+r,-w);s.lineTo(w-r,-w);s.quadraticCurveTo(w,-w,w,-w+r);s.lineTo(w,w-r);s.quadraticCurveTo(w,w,w-r,w);s.lineTo(-w+r,w);s.quadraticCurveTo(-w,w,-w,w-r);s.lineTo(-w,-w+r);s.quadraticCurveTo(-w,-w,-w+r,-w);}
  else if(shape==='heart'){const k=R/15;for(let i=0;i<64;i++){const t=i/64*Math.PI*2;const x=16*Math.sin(t)**3*k,y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)+2.5)*k;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();}
  else s.absarc(0,0,R,0,Math.PI*2,false);
  return s;}
/* how far the edge of the cake is in each direction, and which way it faces */
const polarCache={};
function cakePolar(shape,R){const key=shape+R.toFixed(3);if(polarCache[key])return polarCache[key];
  const pts=cakeShape(shape,R).getPoints(shape==='round'?48:16).map(p=>[p.x,-p.y]);const N=96,rad=new Float32Array(N),nx=new Float32Array(N),nz=new Float32Array(N);
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2,dx=Math.sin(a),dz=Math.cos(a);let best=0,bn=[dx,dz];
    for(let j=0;j<pts.length;j++){const [x1,z1]=pts[j],[x2,z2]=pts[(j+1)%pts.length];const ex=x2-x1,ez=z2-z1,den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;
      const t=(x1*ez-z1*ex)/den,u=(x1*dz-z1*dx)/den;if(u>=0&&u<=1&&t>best){best=t;const l=Math.hypot(ex,ez)||1;let n=[ez/l,-ex/l];if(n[0]*dx+n[1]*dz<0)n=[-n[0],-n[1]];bn=n;}}
    rad[i]=best;nx[i]=bn[0];nz[i]=bn[1];}
  let per=0;for(let j=0;j<pts.length;j++){const [x1,z1]=pts[j],[x2,z2]=pts[(j+1)%pts.length];per+=Math.hypot(x2-x1,z2-z1);}
  return polarCache[key]={rad,nx,nz,N,per};}
function edgeAt(P,a){const N=P.N,f=(((a/(Math.PI*2))%1)+1)%1*N,i=Math.floor(f)%N,j=(i+1)%N,w=f-Math.floor(f);
  const nx=P.nx[i]*(1-w)+P.nx[j]*w,nz=P.nz[i]*(1-w)+P.nz[j]*w,l=Math.hypot(nx,nz)||1;return [P.rad[i]*(1-w)+P.rad[j]*w,nx/l,nz/l];}
const tierGeoCache={};
function tierGeo(shape,R,h,b=.03){const key=[shape,R.toFixed(3),h.toFixed(3),b].join();if(tierGeoCache[key])return tierGeoCache[key];
  const g=new THREE.ExtrudeGeometry(cakeShape(shape,R-b),{depth:Math.max(.002,h-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:b>.015?4:2,curveSegments:shape==='round'?56:20});
  g.rotateX(-Math.PI/2);g.translate(0,b,0);return tierGeoCache[key]=g;}
function swirlGeo(){const pts=[new THREE.Vector2(.0005,0)];for(let i=0;i<=14;i++){const t=i/14;pts.push(new THREE.Vector2(Math.max(.0008,.03*Math.pow(1-t,.75)*(.9+.1*Math.cos(t*Math.PI*3))),.004+t*.05));}
  const g=new THREE.LatheGeometry(pts,28),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),zz=p.getZ(i),a=Math.atan2(x,zz),k=1+.2*Math.sin(a*6-y*70);p.setX(i,x*k);p.setZ(i,zz*k);}g.computeVertexNormals();return g;}
const UPV=new THREE.Vector3(0,1,0),qA=new THREE.Quaternion(),qB=new THREE.Quaternion(),mA=new THREE.Matrix4(),vA=new THREE.Vector3(),vB=new THREE.Vector3(),cA=new THREE.Color();

/* one topping, built standing on +Y (Y points out of the cake) */
function toppingMesh(k,c,seed=1){const g=new THREE.Group();const add=(geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;};const col=c||'#ff6fae';
  switch(k){
  case 'cherry':add(tgeo('cherry',()=>sph(.032,16,12)),cmat('cherry',()=>phys('#c8102e',{roughness:.1,clearcoat:1})),0,.03,0);add(tgeo('stem',()=>cyl(.003,.004,.06,6)),cmat('stem',()=>std('#4d6b2a')),.01,.08,0).rotation.z=-.35;break;
  case 'strawberry':{add(tgeo('straw',()=>{const pts=[new THREE.Vector2(.0005,0)];for(let i=0;i<=10;i++){const t=i/10;pts.push(new THREE.Vector2(Math.max(.0005,.034*Math.sqrt(1-t)*(.8+.2*Math.min(1,t*5))),t*.075));}return new THREE.LatheGeometry(pts,18);}),cmat('straw',()=>phys('#ffffff',{map:TEX.seeds,roughness:.35,clearcoat:.8})));
    const l=add(tgeo('leaf',()=>new THREE.ConeGeometry(.032,.014,7)),cmat('leaf',()=>std('#3f8a2f',{roughness:.6})),0,.004,0);l.rotation.x=Math.PI;break;}
  case 'blueberry':add(tgeo('blue',()=>sph(.021,14,10)),cmat('blue',()=>phys('#33407e',{roughness:.45,sheen:1,sheenColor:new THREE.Color('#9fb0ff')})),0,.02,0);add(tgeo('bcrown',()=>cyl(.006,.004,.006,6)),cmat('stem2',()=>std('#1d1d33')),0,.04,0);break;
  case 'oreo':{const ck=cmat('oreo',()=>phys('#1e1512',{roughness:.75})),cr=cmat('cream',()=>phys('#f8f5ee',{roughness:.5}));const cg=tgeo('ock',()=>cyl(.045,.045,.011,24));add(cg,ck,0,.0055,0);add(tgeo('ocr',()=>cyl(.041,.041,.009,24)),cr,0,.0155,0);add(cg,ck,0,.0255,0);break;}
  case 'macaron':{const sm=cmat('mac'+col,()=>phys(col,{roughness:.55,sheen:.6}));const sg=tgeo('mshell',()=>{const s=sph(.034,16,10);s.scale(1,.42,1);return s;});add(sg,sm,0,.012,0);add(tgeo('mcream',()=>cyl(.03,.03,.01,20)),cmat('cream',()=>phys('#f8f5ee',{roughness:.5})),0,.024,0);add(sg,sm,0,.036,0);break;}
  case 'choc':add(tgeo('choc',()=>box(.07,.012,.07)),cmat('choc',()=>phys('#3d2112',{roughness:.3,clearcoat:.5})),0,.006,0);add(tgeo('choc2',()=>box(.05,.004,.006)),cmat('choc2',()=>phys('#f3e2c0',{roughness:.4})),0,.014,0);break;
  case 'swirl':add(tgeo('swirl',swirlGeo),cmat('fr'+col,()=>phys(col,{roughness:.45,clearcoat:.3}))).scale.setScalar(1.15);break;
  case 'flower':{const pm=cmat('pet'+col,()=>phys(col,{roughness:.5,sheen:1}));const pg=tgeo('petal',()=>{const s=sph(.022,10,8);s.scale(.55,.3,1);return s;});for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const p=add(pg,pm,Math.sin(a)*.022,.008,Math.cos(a)*.022);p.rotation.y=a;}add(tgeo('fc',()=>sph(.012,10,8)),cmat('fcen',()=>phys('#ffd23f',{roughness:.4})),0,.012,0);break;}
  case 'pearl':add(tgeo('pearl',()=>sph(.015,14,10)),cmat('pearl'+col,()=>col==='#d4af37'||col==='#e8c25a'?std(col,{metalness:1,roughness:.2}):phys(col,{roughness:.15,clearcoat:1,iridescence:.5})),0,.013,0);break;
  case 'heart':add(tgeo('cheart',()=>{const gg=new THREE.ExtrudeGeometry(heartShape,{depth:.35,bevelEnabled:true,bevelThickness:.12,bevelSize:.1,bevelSegments:3,curveSegments:12});gg.center();gg.scale(.03,.03,.03);gg.rotateX(-Math.PI/2);gg.translate(0,.009,0);return gg;}),cmat('ch'+col,()=>phys(col,{roughness:.15,clearcoat:1})));break;
  case 'star':add(tgeo('cstar',()=>{const gg=starGeo.clone();gg.scale(.17,.17,.17);gg.rotateX(-Math.PI/2);gg.translate(0,.01,0);return gg;}),cmat('gold',()=>std('#e8c25a',{metalness:1,roughness:.2,emissive:'#ffb000',emissiveIntensity:.25})));break;
  case 'sprinkles':{let s=Math.floor(seed*1e6)%2147483646+1;const rng=()=>(s=(s*16807)%2147483647)/2147483647;const sc=['#ff3b6b','#4fb6ff','#ffd23f','#7ee081','#b388ff','#ff8a1f','#ffffff'];
    const base=tgeo('spr',()=>{const gg=new THREE.CapsuleGeometry(.0035,.012,2,6).toNonIndexed();gg.rotateZ(Math.PI/2);return gg;});const n=base.attributes.position.count,K=12;
    const pos=new Float32Array(n*3*K),nor=new Float32Array(n*3*K),clr=new Float32Array(n*3*K);
    for(let q=0;q<K;q++){const a=rng()*Math.PI*2,r=Math.sqrt(rng())*.05;mA.makeRotationY(rng()*Math.PI*2).setPosition(Math.sin(a)*r,.004,Math.cos(a)*r);cA.set(sc[q%sc.length]);
      for(let i=0;i<n;i++){vA.fromBufferAttribute(base.attributes.position,i).applyMatrix4(mA);vB.fromBufferAttribute(base.attributes.normal,i).transformDirection(mA);const o=(q*n+i)*3;pos[o]=vA.x;pos[o+1]=vA.y;pos[o+2]=vA.z;nor[o]=vB.x;nor[o+1]=vB.y;nor[o+2]=vB.z;clr[o]=cA.r;clr[o+1]=cA.g;clr[o+2]=cA.b;}}
    const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));gg.setAttribute('normal',new THREE.BufferAttribute(nor,3));gg.setAttribute('color',new THREE.BufferAttribute(clr,3));
    add(gg,cmat('spr',()=>phys('#ffffff',{vertexColors:true,roughness:.35,clearcoat:.6}))).userData.own=true;break;}
  case 'lolly':add(tgeo('lstick',()=>cyl(.004,.004,.11,6)),cmat('lstick',()=>std('#ffffff',{roughness:.4})),0,.055,0);{const d=add(tgeo('ldisk',()=>cyl(.034,.034,.01,24)),cmat('lol'+col,()=>phys(col,{map:TEX.spiral,roughness:.15,clearcoat:1})),0,.13,0);d.rotation.x=Math.PI/2;}break;
  case 'horn':{const hg=tgeo('horn',()=>{const gg=new THREE.ConeGeometry(.04,.22,24,10);const p=gg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),zz=p.getZ(i),a=Math.atan2(x,zz),k=1+.12*Math.sin(a*2-y*60);p.setX(i,x*k);p.setZ(i,zz*k);}gg.computeVertexNormals();gg.translate(0,.11,0);return gg;});
    add(hg,cmat('gold',()=>std('#e8c25a',{metalness:1,roughness:.2,emissive:'#ffb000',emissiveIntensity:.25})));
    for(const sx of [-1,1]){const e=add(tgeo('ear',()=>new THREE.ConeGeometry(.03,.07,12)),cmat('ear',()=>phys('#fff4fa',{roughness:.5})),sx*.09,.03,-.01);e.rotation.z=-sx*.3;const ei=add(tgeo('eari',()=>new THREE.ConeGeometry(.018,.05,12)),cmat('eari',()=>phys('#ffb3d1',{roughness:.5})),sx*.088,.028,.004);ei.rotation.z=-sx*.3;}break;}
  case 'rings':{const gm=cmat('gold',()=>std('#e8c25a',{metalness:1,roughness:.2,emissive:'#ffb000',emissiveIntensity:.25}));const rg=tgeo('ring',()=>new THREE.TorusGeometry(.032,.006,10,32));add(rg,gm,-.017,.07,0).rotation.y=.4;add(rg,gm,.017,.07,0).rotation.y=-.4;add(tgeo('rstick',()=>cyl(.003,.003,.04,6)),gm,0,.02,0);
    add(tgeo('rgem',()=>new THREE.OctahedronGeometry(.009)),cmat('gem',()=>phys('#dff4ff',{roughness:0,clearcoat:1,emissive:'#bfe8ff',emissiveIntensity:.4})),-.017,.108,0);break;}
  }
  return g;}

/* ---------- build the whole cake from SAVE.cake ---------- */
const bk={body:null,tiers:[],hits:[],tops:[],flames:[],text:null,light:null,spin:0,spinT:0,pipe:null,lastP:null,blowing:false};
function plateInfo(){return PLATES.find(p=>p[0]===SAVE.cake.plate)||PLATES[0];}
function disposeTree(o){o.traverse(m=>{if(m.isInstancedMesh)m.dispose();if(m.userData.own){m.geometry.dispose();}});}
function cakeDims(){return tierDims(SAVE.cake.n);}
function cakeH(){const D=cakeDims(),t=D[D.length-1];return t.y0+t.h;}
function buildCake(){const C=SAVE.cake,root=Z.bakery.cakeRoot;if(bk.body){root.remove(bk.body);disposeTree(bk.body);}
  const body=bk.body=new THREE.Group();root.add(body);bk.tiers=[];bk.hits=[];bk.tops=[];
  // the plate or stand
  const [pid,,,ph,pc]=plateInfo();const pm=pid==='glass'?phys(pc,{roughness:0,transparent:true,opacity:.5,clearcoat:1}):pid==='white'?phys(pc,{roughness:.2,clearcoat:1}):pid==='gold'?std(pc,{metalness:1,roughness:.22}):phys(pc,{roughness:.25,clearcoat:1});
  if(ph){M(cyl(.2,.26,.03,28),pm,0,.015,0,body);M(cyl(.05,.07,ph-.03,16),pm,0,ph/2,0,body);}
  M(cyl(.62,.6,.025,48),pm,0,ph+.0125,0,body);if(pid!=='glass')M(new THREE.TorusGeometry(.61,.012,8,64),pm,0,ph+.025,0,body).rotation.x=Math.PI/2;
  const base=ph+.025,D=cakeDims();
  D.forEach((d,i)=>{const tg=new THREE.Group();tg.position.y=base+d.y0;body.add(tg);const fc=C.tiers[i]||C.tiers[C.tiers.length-1]||'#ffffff';const P=cakePolar(C.shape,d.R);
    const T={g:tg,R:d.R,h:d.h,P,c:fc};bk.tiers.push(T);const hit=m=>{m.userData.tier=i;bk.hits.push(m);return m;};
    if(C.style==='naked'){const sp=C.flavor==='rainbow'?null:(SPONGE.find(s=>s[0]===C.flavor)||SPONGE[0])[1];const fm=frostMat(fc);let y=0;const sh=d.h*.26,ch=d.h*.07;
      for(let L=0;L<3;L++){const sc=sp||RAINBOW6[(L+i*3)%6];hit(M(tierGeo(C.shape,d.R-.008,sh,.012),spongeMat(sc),0,y,0,tg,true,true));y+=sh;if(L<2){hit(M(tierGeo(C.shape,d.R-.016,ch,.012),fm,0,y,0,tg,false,true));y+=ch;}}
      hit(M(tierGeo(C.shape,d.R-.004,d.h-y,.012),fm,0,y,0,tg,false,true));}
    else hit(M(tierGeo(C.shape,d.R,d.h),frostMat(fc),0,0,0,tg,true,true));
    if(C.style==='drip')buildDrip(T,i);
    if(C.style==='ruffles')buildRuffles(T);
    if(C.border!=='none'){buildBorder(T,d.h-.004,i===D.length-1?1:.97,true);buildBorder(T,.012,1.01,false);}
    T.topsG=new THREE.Group();tg.add(T.topsG);});
  C.top=C.top.filter(r=>r.t<D.length);C.top.forEach(r=>addTopping(r));
  buildText();buildCandles();}
function buildDrip(T){const C=SAVE.cake,dm=dripMat(C.drip);bk.hits.push(Object.assign(M(tierGeo(C.shape,T.R+.004,.028,.012),dm,0,T.h-.022,0,T.g,false,true),{userData:{tier:bk.tiers.indexOf(T)}}));
  const n=Math.round(T.P.per/.055),im=new THREE.InstancedMesh(tgeo('drip',()=>new THREE.CapsuleGeometry(.013,.06,4,8)),dm,n);
  for(let k=0;k<n;k++){const a=k/n*Math.PI*2,[rb]=edgeAt(T.P,a),len=.025+.1*hash1(k+T.R*100);const sy=(len+.026)/.086;mA.makeScale(1,sy,1).setPosition(Math.sin(a)*(rb+.002),T.h-.012-len/2,Math.cos(a)*(rb+.002));im.setMatrixAt(k,mA);}
  im.castShadow=false;T.g.add(im);}
function buildRuffles(T){const C=SAVE.cake,rows=Math.max(2,Math.floor((T.h-.03)/.042)),per=Math.round(T.P.per/.04),im=new THREE.InstancedMesh(tgeo('ruf',()=>sph(1,10,8)),frostMat(T.c),rows*per);let n=0;
  for(let r=0;r<rows;r++)for(let k=0;k<per;k++){const a=(k+(r%2)*.5)/per*Math.PI*2,[rb,nx,nz]=edgeAt(T.P,a);qA.setFromUnitVectors(vA.set(0,0,1),vB.set(nx,0,nz));mA.compose(vA.set(Math.sin(a)*(rb-.004),.03+r*.042,Math.cos(a)*(rb-.004)),qA,vB.set(.032,.028,.012));im.setMatrixAt(n++,mA);}
  T.g.add(im);}
function buildBorder(T,y,inset,top){const C=SAVE.cake,k=C.border,sp=k==='pearls'?.034:k==='dots'?.026:.055,n=Math.round(T.P.per*inset/sp);
  const geo=k==='swirls'?tgeo('swirl',swirlGeo):k==='pearls'?tgeo('bpearl',()=>sph(.016,12,10)):tgeo('bdot',()=>sph(.012,10,8));
  const im=new THREE.InstancedMesh(geo,instMat(k),n);
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,[rb]=edgeAt(T.P,a),r=rb*inset-(top?(k==='swirls'?.025:.012):-.004);const s=k==='swirls'?(top?.75:.85):1;mA.makeRotationY(a).scale(vA.set(s,s,s)).setPosition(Math.sin(a)*r,y+(k==='swirls'?0:.008),Math.cos(a)*r);im.setMatrixAt(i,mA);im.setColorAt(i,cA.set(C.borderC==='pastel'?PASTEL[i%5]:frostCol(C.borderC)));}
  if(im.instanceColor)im.instanceColor.needsUpdate=true;T.g.add(im);}
function placeTopping(o,r){const T=bk.tiers[r.t];if(!T)return false;const [rb,nx,nz]=edgeAt(T.P,r.a);
  if(r.s==='top'){o.position.set(Math.sin(r.a)*rb*r.f,T.h-.004,Math.cos(r.a)*rb*r.f);
    if(STANDUP[r.k]){o.rotation.set(0,r.a,0);const inner=o.children[0];if(inner){inner.rotation.x=Math.PI/2-.25;inner.position.y=STANDUP[r.k];}}
    else{o.rotation.set(0,r.r,0);}}
  else{const y=Math.min(T.h-.05,Math.max(.04,r.f*T.h));o.position.set(Math.sin(r.a)*(rb-.006),y,Math.cos(r.a)*(rb-.006));qA.setFromUnitVectors(UPV,vA.set(nx,0,nz));qB.setFromAxisAngle(UPV,r.r);o.quaternion.copy(qA).multiply(qB);}
  return true;}
function addTopping(r){const T=bk.tiers[r.t];if(!T)return null;let o=toppingMesh(r.k,r.c,r.r);
  if(r.s==='top'&&STANDUP[r.k]){const w=new THREE.Group();w.add(o);o=w;}
  placeTopping(o,r);T.topsG.add(o);bk.tops.push(o);return o;}
function buildText(){const C=SAVE.cake,T=bk.tiers[bk.tiers.length-1];if(bk.text){bk.text.parent&&bk.text.parent.remove(bk.text);bk.text.material.map.dispose();bk.text.material.dispose();bk.text=null;}
  if(!C.text||!T)return;const words=C.text.trim().split(/\s+/);const lines=[];let cur='';const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d');
  let size=110;const fit=()=>{lines.length=0;cur='';x.font=`700 ${size}px Fredoka, "Trebuchet MS", sans-serif`;for(const w of words){const t=cur?cur+' '+w:w;if(x.measureText(t).width>460&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);};
  fit();while(size>40&&(lines.length*size*1.05>440||lines.some(l=>x.measureText(l).width>480))){size-=8;fit();}
  x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';const y0=256-(lines.length-1)*size*.55;
  lines.forEach((l,i)=>{x.lineWidth=size*.16;x.strokeStyle=C.textC==='#ffffff'?'rgba(194,24,91,.55)':'rgba(255,255,255,.9)';x.strokeText(l,256,y0+i*size*1.1);x.fillStyle=C.textC;x.fillText(l,256,y0+i*size*1.1);});
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;const s=T.R*(C.candles>0?1.12:1.5);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  m.rotation.x=-Math.PI/2;m.position.y=T.h+.002;m.userData.own=true;T.g.add(m);bk.text=m;}
/* number candles use a 3D font that loads the first time you need one */
let candleFont=null,candleFontP=null;
function loadCandleFont(){if(!candleFontP)candleFontP=Promise.all([import('three/addons/loaders/FontLoader.js'),import('three/addons/geometries/TextGeometry.js')]).then(([FL,TG])=>new Promise((ok,no)=>new FL.FontLoader().load('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',f=>{candleFont={f,TG:TG.TextGeometry};ok(candleFont);},undefined,no))).catch(e=>{candleFontP=null;throw e;});return candleFontP;}
const MAX_STICKS=40,MAX_AGE=99;
/* where little candles go: rings from the edge inward, as many as fit on each ring */
function candleSpots(T,n){if(n===1)return [[0,0]];const out=[];
  if(n<=12){for(let i=0;i<n;i++){const a=Math.PI+i/n*Math.PI*2,[rb]=edgeAt(T.P,a);const r=rb*(n>8?.78:.68);out.push([Math.sin(a)*r,Math.cos(a)*r]);}return out;}
  const rings=[.84,.62,.4,.18].map(f=>({f,cap:Math.max(1,Math.floor(Math.PI*2*f*T.R/.06))}));let left=n;
  for(const rg of rings){if(left<=0)break;const k=Math.min(left,rg.cap);rg.k=k;left-=k;}
  if(left>0){const tot=rings.reduce((a,r)=>a+r.cap,0);rings.forEach(r=>r.k=Math.round(n*r.cap/tot));rings[0].k+=n-rings.reduce((a,r)=>a+r.k,0);}
  rings.forEach((rg,j)=>{for(let i=0;i<(rg.k||0);i++){const a=Math.PI+(i+j*.5)/rg.k*Math.PI*2,[rb]=edgeAt(T.P,a);out.push([Math.sin(a)*rb*rg.f,Math.cos(a)*rb*rg.f]);}});return out;}
function buildCandles(){const C=SAVE.cake,T=bk.tiers[bk.tiers.length-1];bk.flames=[];if(bk.light){bk.light.parent&&bk.light.parent.remove(bk.light);bk.light=null;}
  if(bk.candleG){bk.candleG.parent&&bk.candleG.parent.remove(bk.candleG);disposeTree(bk.candleG);bk.candleG=null;}if(!T||!C.candles)return;
  const g=bk.candleG=new THREE.Group();g.position.y=T.h-.004;T.g.add(g);const lit=C.lit!==false;
  const wick=tgeo('wick',()=>cyl(.002,.002,.02,4)),fl=tgeo('flame',()=>sph(.014,10,8)),wickM=cmat('wick',()=>std('#222'));
  const flame=(parent,x,y,z)=>{M(wick,wickM,x,y+.008,z,parent,false,false);const f=M(fl,glow('#ffcc55',3),x,y+.031,z,parent,false,false);f.scale.y=1.8;f.visible=lit;bk.flames.push(f);};
  if(C.candleType==='number'){
    if(!candleFont){loadCandleFont().then(()=>{if(SAVE.cake===C&&C.candleType==='number')buildCandles();}).catch(()=>{if(SAVE.cake===C){C.candleType='sticks';persist();buildCandles();toast('Number candles need the internet. Here are little candles instead 🕯️');if(bakeryOpen&&btab==='candles')renderBakery();}});return;}
    const digits=String(Math.min(MAX_AGE,C.candles)).split(''),size=Math.min(.2,T.R*.5),gap=size*.12;
    const geos=digits.map(d=>{const key='num'+d+size.toFixed(3);return tgeo(key,()=>{const gg=new candleFont.TG(d,{font:candleFont.f,size,height:size*.28,curveSegments:6,bevelEnabled:true,bevelThickness:size*.04,bevelSize:size*.03,bevelSegments:3});gg.computeBoundingBox();const b=gg.boundingBox;gg.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2);gg.computeBoundingBox();return gg;});});
    const widths=geos.map(gg=>gg.boundingBox.max.x-gg.boundingBox.min.x);let x=-(widths.reduce((a,w)=>a+w,0)+gap*(digits.length-1))/2;
    geos.forEach((gg,i)=>{const col=C.candleC==='rainbow'?['#ff4d8d','#8e6cff','#2fb6ff'][i%3]:C.candleC;const w=widths[i],cx=x+w/2;x+=w+gap;
      M(gg,cmat('ncnd'+col,()=>phys(col,{roughness:.3,clearcoat:1,sheen:.4})),cx,0,-T.R*.12,g,true,false);
      const top=gg.boundingBox.max.y;flame(g,cx,top,-T.R*.12);});}
  else{const n=Math.min(MAX_STICKS,C.candles),spots=candleSpots(T,n),thin=n>16?.8:1,stripe=tgeo('cand'+thin,()=>cyl(.011*thin,.011*thin,.13,10));
    spots.forEach(([x,z],i)=>{const col=C.candleC==='rainbow'?RAINBOW6[i%6]:C.candleC;const cg=new THREE.Group();cg.position.set(x,0,z);g.add(cg);
      M(stripe,cmat('cnd'+col,()=>phys(col,{map:TEX.stripes,roughness:.4,clearcoat:.5})),0,.065,0,cg,false,false);flame(cg,0,.13,0);});}
  bk.light=new THREE.PointLight('#ffb060',lit?6:0,3,2);bk.light.position.y=.35;g.add(bk.light);}
anims.push((t,dt)=>{const root=Z.bakery.cakeRoot;if(!bakeryOpen)bk.spinT+=dt*.35;bk.spin+=(bk.spinT-bk.spin)*Math.min(1,dt*8);root.rotation.y=bk.spin;
  bk.flames.forEach((f,i)=>{if(f.visible)f.scale.set(1+.15*Math.sin(t*20+i),1.8+.3*Math.sin(t*15+i*2),1);});if(bk.light){const on=bk.flames.filter(f=>f.visible).length;bk.light.intensity=on?3+on*.6+Math.sin(t*17):0;}});

/* ---------- the cake studio panel ---------- */
let bakeryOpen=false,btab='cake',btop='cherry',btopC='#ff6fae',btier='all',onBPad=false;
const bcam={p:new THREE.Vector3(),t:new THREE.Vector3(),dp:0,id:null,x:0,y:0},bTgt=new THREE.Vector3(),bWant=new THREE.Vector3();
const BCAM={cake:[.36,1.05],frost:[.3,1],tops:[.42,.9],write:[1.12,.85],candles:[.5,.95]};
function openBakery(){if(closetOpen)return;closeTalk();const z=Z.bakery,S=z.stand;bakeryOpen=closetOpen=true;z.padLbl.visible=false;
  document.body.classList.add('dressing');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';
  const [px,pz]=z.toWorld(-1.05,-.3),[cx,cz]=z.toWorld(S.lx,S.lz);player.pos.set(px,0,pz);player.vy=0;player.speed=0;player.face=Math.atan2(cx-px,cz-pz);
  bk.spinT=bk.spin=Math.round(bk.spin/(Math.PI*2))*Math.PI*2;bcam.p.copy(camera.position);bcam.t.copy(cam.fv||player.pos);bcam.dp=0;
  renderBakery();$('#bakery').classList.add('show');$('#bcontent').scrollTop=0;sfx('tada');}
function closeBakery(){if(!bakeryOpen)return;const z=Z.bakery;bakeryOpen=closetOpen=false;z.padLbl.visible=true;bk.pipe=null;bcam.id=null;
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  document.body.classList.remove('dressing');$('#bakery').classList.remove('show');persist();cam.yaw=cam.cy=z.rot;player.face=z.rot;
  if(ck.on){bk.dirty=false;ckStudioClosed();return;}// cake contest (21b-cake-contest.js)
  toast(SAVE.cake.text?`Yum! Your cake says “${SAVE.cake.text}” 🎂`:'Yum! Your cake stays on the stand 🎂');
  // coins for baking: once every 10 minutes so it can't be farmed
  if(bk.dirty)did('cake',SAVE.cake.n);if(bk.dirty&&Date.now()-(SAVE.cakePaid||0)>6e5){SAVE.cakePaid=Date.now();persist();setTimeout(()=>earn(8,'Cake made!'),700);}bk.dirty=false;}
$('#bdone').onclick=closeBakery;$('#bphoto').onclick=()=>{wantPhoto=true;};
function cakeChanged(rebuild=true){if(rebuild)buildCake();bk.dirty=true;persist();}
function renderBakery(){const C=SAVE.cake;$('#btabs').innerHTML=BTABS.map(([id,ico,n])=>`<button class="tab${id===btab?' on':''}" data-btab="${id}"><b>${ico}</b>${n}</button>`).join('');
  const items=(list,cur,kind)=>`<div class="grid">${list.map(([id,e,n])=>`<button class="item${id===cur?' on':''}" data-${kind}="${id}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`;
  const chips=(list,cur,kind)=>`<div class="chips">${list.map(([id,e,n])=>`<button class="${String(id)===String(cur)?'on':''}" data-${kind}="${id}">${e?e+' ':''}${n}</button>`).join('')}</div>`;
  const sw=(list,cur,kind,extra='')=>`<div class="swatches">${list.map(col=>`<button class="sw${col===cur?' on':''}" style="background:${col}" data-${kind}="${col}" aria-label="color ${col}"></button>`).join('')}${extra}</div>`;
  let h='';
  if(btab==='cake')h=`${ck.on?'':`<h3>Pick a cake to start</h3>${items(CAKES,C.id,'preset')}`}<h3>Shape</h3>${chips(CSHAPES,C.shape,'shape')}<h3>Layers</h3>${chips([[1,'','1'],[2,'','2'],[3,'','3'],[4,'','4']],C.n,'layers')}<h3>Cake stand</h3>${chips(PLATES,C.plate,'plate')}`;
  else if(btab==='frost'){const names=C.n===1?[]:[['all','🎂','All']].concat(cakeDims().map((d,i)=>[i,'',i===0?'Bottom':i===C.n-1?'Top':C.n===3?'Middle':i===1?'2nd':'3rd']));
    const curC=btier==='all'?C.tiers[0]:C.tiers[btier];
    h=`<h3>Style</h3>${items(CSTYLES,C.style,'style')}<h3>Frosting color</h3>${names.length?chips(names,btier,'btier')+'<div style="height:8px"></div>':''}${sw(FROST,curC,'frost',FANCY.map(([id,e,n,bg])=>`<button class="sw fancy${curC===id?' on':''}" style="background:${bg}" data-frost="${id}" aria-label="${n}">${e}</button>`).join(''))}`;
    if(C.style==='drip')h+=`<h3>Drip color</h3>${sw(DRIPC,C.drip,'drip')}`;
    if(C.style==='naked')h+=`<h3>Cake flavor</h3>${chips(SPONGE.map(([id,,e,n])=>[id,e,n]),C.flavor,'flavor')}`;else h+=`<p class="drawhint">Tip: 🍰 Naked style shows the cake flavor inside.</p>`;
    h+=`<h3>Border</h3>${chips(BORDERS,C.border,'border')}`;if(C.border!=='none')h+=`<div style="height:8px"></div>${sw(FROST,C.borderC,'borderc',`<button class="sw fancy${C.borderC==='pastel'?' on':''}" style="background:conic-gradient(#ffb3d1,#b388ff,#8fd8ff,#7ee081,#ffd23f,#ffb3d1)" data-borderc="pastel" aria-label="pastel">🌈</button>`)}`;}
  else if(btab==='tops'){h=`<p class="drawhint" style="margin-top:8px">Pick a topping, then <b>tap the cake</b> to stick it on. Drag across the cake to add lots! Drag beside the cake to spin it.</p>${items(CTOP,btop,'top')}`;
    if(TCOLOR.has(btop))h+=`<h3>Topping color</h3>${sw(FROST,btopC,'topc')}`;
    h+=`<div style="height:12px"></div><div class="chips"><button data-tact="ring">⭕ Add a ring</button><button data-tact="undo">↩️ Undo</button><button data-tact="clear">🧽 Clear toppings</button></div>`;}
  else if(btab==='write')h=`<h3>Write on top of your cake</h3><input class="binput" id="btext" maxlength="28" placeholder="Type a message" autocomplete="off" value="${(C.text||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}"><div style="height:10px"></div><div class="chips">${WRITE_IDEAS(SAVE.name||'Brynny').map(t=>`<button data-wtext="${t.replace(/"/g,'&quot;')}">${t}</button>`).join('')}<button data-wtext="">🧽 Erase</button></div><h3>Icing color</h3>${sw(['#ff3b6b','#c2185b','#ff6fae','#e0263b','#8e6cff','#4fb6ff','#2fd1c5','#7ee081','#ffd23f','#ff8a1f','#4a2a17','#ffffff','#d4af37'],C.textC,'textc')}`;
  else{const lit=C.lit!==false&&C.candles>0,num=C.candleType==='number',max=num?MAX_AGE:MAX_STICKS;
    h=`<h3>Candle type</h3>${chips([['sticks','🕯️','Little candles'],['number','🔢','Number candles']],num?'number':'sticks','ctype')}
    <h3>${num?'How old? 🎂':'How many candles?'}</h3><div class="cstep"><button data-cstep="-1" aria-label="fewer">−</button><b>${C.candles}</b><button data-cstep="1" aria-label="more">+</button></div>
    <div style="height:8px"></div>${chips([0,1,5,10,11,16,21,30].filter(v=>v<=max).map(v=>[v,'',String(v)]),C.candles,'candles')}
    ${num?'<p class="drawhint">A big number candle, like 11 or 21. Up to 99!</p>':`<p class="drawhint">Up to ${MAX_STICKS} candles. Want a big number instead? Pick 🔢 Number candles.</p>`}
    ${C.candles?`<h3>Candle color</h3>${sw(CANDLEC.slice(1),C.candleC,'candlec',`<button class="sw fancy${C.candleC==='rainbow'?' on':''}" style="background:conic-gradient(#ff6f91,#ffe066,#7ee081,#4fb6ff,#b388ff,#ff6f91)" data-candlec="rainbow" aria-label="rainbow">🌈</button>`)}<div style="height:14px"></div>${lit?'<button class="btn" data-blow="1">🌬️ Make a wish and blow!</button><p class="drawhint">Or tap a flame to blow it out.</p>':'<button class="btn" data-light="1">🔥 Light the candles</button>'}`:''}`;}
  $('#bcontent').innerHTML=h;
  const inp=$('#btext');if(inp){inp.addEventListener('input',()=>{SAVE.cake.text=inp.value;bk.dirty=true;buildText();persist();});inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();});}}
$('#btabs').onclick=e=>{const b=e.target.closest('[data-btab]');if(!b)return;btab=b.dataset.btab;bcam.dp=0;sfx('pop');renderBakery();$('#bcontent').scrollTop=0;};
const cakeTop=()=>{const T=bk.tiers[bk.tiers.length-1];return T?T.g.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,T.h+.15,0)):Z.bakery.cakeRoot.getWorldPosition(new THREE.Vector3());};
function cakeCheer(){burst(cakeTop(),rnd(['#ff8fc8','#ffd23f','#8fd8ff','#ffffff']),24,1.4,.08);}
$('#bcontent').onclick=e=>{const b=e.target.closest('button');if(!b)return;const C=SAVE.cake,d=b.dataset;
  if(d.preset){SAVE.cake=presetCake(d.preset);btier='all';cakeChanged();sfx('tada');cakeCheer();renderBakery();return;}
  if(d.shape){C.shape=d.shape;cakeChanged();sfx('pop');cakeCheer();renderBakery();return;}
  if(d.layers){const n=+d.layers;while(C.tiers.length<n)C.tiers.push(C.tiers[C.tiers.length-1]||'#ffffff');C.tiers.length=n;C.n=n;btier='all';cakeChanged();sfx('pop');cakeCheer();renderBakery();return;}
  if(d.plate){C.plate=d.plate;cakeChanged();sfx('pop');renderBakery();return;}
  if(d.style){C.style=d.style;cakeChanged();sfx('pop');cakeCheer();renderBakery();return;}
  if(d.btier!=null){btier=d.btier==='all'?'all':+d.btier;sfx('pop');renderBakery();return;}
  if(d.frost){if(btier==='all')C.tiers=C.tiers.map(()=>d.frost);else C.tiers[btier]=d.frost;cakeChanged();sfx('pop');renderBakery();return;}
  if(d.drip){C.drip=d.drip;cakeChanged();sfx('pop');renderBakery();return;}
  if(d.flavor){C.flavor=d.flavor;cakeChanged();sfx('pop');renderBakery();return;}
  if(d.border){C.border=d.border;cakeChanged();sfx('pop');renderBakery();return;}
  if(d.borderc){C.borderC=d.borderc;cakeChanged();sfx('pop');renderBakery();return;}
  if(d.top){btop=d.top;sfx('pop');renderBakery();return;}
  if(d.topc){btopC=d.topc;sfx('pop');renderBakery();return;}
  if(d.tact==='ring'){const D=cakeDims();let added=0;D.forEach((dd,t)=>{const T=bk.tiers[t];const sp=(TSPACE[btop]||.075)*1.5,f=t===D.length-1?.78:(D[t+1].R/dd.R+1)/2,n=Math.max(4,Math.min(24,Math.round(T.P.per*f/sp)));
      ringTop(btop,t,n,D,TCOLOR.has(btop)?btopC:undefined,f).forEach(r=>{if(C.top.length<260){C.top.push(r);addTopping(r);added++;}});});
    if(added){bk.dirty=true;sfx('tada');cakeCheer();}else toast('Your cake is full of toppings! Try Undo or Clear.');persist();return;}
  if(d.tact==='undo'){const r=C.top.pop();if(r){const o=bk.tops.pop();o&&o.parent&&o.parent.remove(o);if(o)disposeTree(o);sfx('pop');persist();}return;}
  if(d.tact==='clear'){C.top=[];cakeChanged();sfx('pop');return;}
  if(d.wtext!=null){C.text=d.wtext;bk.dirty=true;const i=$('#btext');if(i)i.value=C.text;buildText();persist();sfx('pop');if(C.text)cakeCheer();return;}
  if(d.textc){C.textC=d.textc;buildText();persist();sfx('pop');renderBakery();return;}
  if(d.candles!=null||d.cstep){const max=C.candleType==='number'?MAX_AGE:MAX_STICKS;C.candles=Math.max(0,Math.min(max,d.cstep?(C.candles||0)+(+d.cstep):+d.candles));C.lit=true;bk.dirty=true;buildText();buildCandles();persist();sfx('pop');renderBakery();return;}
  if(d.ctype){C.candleType=d.ctype;if(d.ctype==='number'&&!C.candles)C.candles=11;if(d.ctype==='sticks')C.candles=Math.min(MAX_STICKS,C.candles);C.lit=true;bk.dirty=true;buildText();buildCandles();persist();sfx('pop');renderBakery();return;}
  if(d.candlec){C.candleC=d.candlec;buildCandles();persist();sfx('pop');renderBakery();return;}
  if(d.blow){blowAll();return;}
  if(d.light){C.lit=true;bk.flames.forEach((f,i)=>setTimeout(()=>{f.visible=true;sfx('pop');},i*120));persist();setTimeout(renderBakery,bk.flames.length*120+50);return;}};
function blowOne(i,quiet){const f=bk.flames[i];if(!f||!f.visible)return;f.visible=false;const p=f.getWorldPosition(new THREE.Vector3());burst(p,'#cfcfd8',8,.5,.05);if(!quiet)sfx('blow');
  if(bk.flames.every(f=>!f.visible))wishMade();}
function blowAll(){if(bk.blowing)return;bk.blowing=true;sfx('blow');bk.flames.forEach((f,i)=>setTimeout(()=>blowOne(i,true),180+i*90));setTimeout(()=>{bk.blowing=false;},400+bk.flames.length*90);}
function wishMade(){did('wish');SAVE.cake.lit=false;if(Date.now()-(SAVE.wishPaid||0)>3e5){SAVE.wishPaid=Date.now();setTimeout(()=>earn(5,'Birthday wish'),900);}persist();sfx('tada');const P=cakeTop();for(let k=0;k<4;k++)setTimeout(()=>burst(P.clone().add(new THREE.Vector3((Math.random()-.5)*.6,.2,(Math.random()-.5)*.6)),rnd(['#ff8fc8','#ffd23f','#8fd8ff','#7ee081']),30,2,.09),k*200);
  floaties(P,'🎉',6);try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}av.play&&av.play('clap');banner('🎉 Make a wish! 🎉');setTimeout(()=>{if(bakeryOpen&&btab==='candles')renderBakery();},600);}

/* tap the cake to decorate it */
function cakeHit(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObjects(bk.hits,false)[0]||null;}
function flameNear(e){let best=-1,bd=34;bk.flames.forEach((f,i)=>{if(!f.visible)return;const p=f.getWorldPosition(vA).project(camera);const sx=(p.x+1)/2*innerWidth,sy=(1-p.y)/2*innerHeight,d=Math.hypot(sx-e.clientX,sy-e.clientY);if(d<bd){bd=d;best=i;}});return best;}
function placeAt(h){const C=SAVE.cake,i=h.object.userData.tier,T=bk.tiers[i];if(!T)return;if(C.top.length>=260){toast('Your cake is full of toppings! Try Undo.');return;}
  const lp=T.g.worldToLocal(h.point.clone()),n=h.face?h.face.normal:UPV;const a=Math.atan2(lp.x,lp.z),[rb]=edgeAt(T.P,a);
  const top=n.y>.6||lp.y>T.h-.02;let r;
  if(top){const f=Math.min(.95,Math.hypot(lp.x,lp.z)/Math.max(.01,rb));r=TREC(btop,i,'top',a,f,TCOLOR.has(btop)?btopC:undefined);}
  else r=TREC(btop,i,'side',a,Math.min(.9,Math.max(.12,lp.y/T.h)),TCOLOR.has(btop)?btopC:undefined);
  C.top.push(r);addTopping(r);bk.dirty=true;bk.lastP=h.point.clone();sfx(btop==='sprinkles'?'bubble':'pop');if(Math.random()<.35)burst(h.point.clone(),'#fff1c4',6,.6,.05);}
function bakeryDown(e){const cap=()=>{try{canvas.setPointerCapture(e.pointerId);}catch(_){}};
  if(btab==='candles'){const i=flameNear(e);if(i>=0){blowOne(i);return;}}
  if(btab==='tops'&&bk.pipe===null){const h=cakeHit(e);if(h){bk.pipe=e.pointerId;placeAt(h);cap();return;}}
  if(bcam.id===null){bcam.id=e.pointerId;bcam.x=e.clientX;bcam.y=e.clientY;bcam.moved=0;cap();}}
function bakeryMove(e){if(e.pointerId===bk.pipe){const h=cakeHit(e);if(h&&(!bk.lastP||bk.lastP.distanceTo(h.point)>(TSPACE[btop]||.075)))placeAt(h);return;}
  if(e.pointerId===bcam.id){const dx=e.clientX-bcam.x,dy=e.clientY-bcam.y;bk.spinT+=dx*.012;bcam.dp=Math.min(.9,Math.max(-.35,bcam.dp+dy*.004));bcam.x=e.clientX;bcam.y=e.clientY;bcam.moved+=Math.abs(dx)+Math.abs(dy);}}
function bakeryUp(e){if(e.pointerId===bk.pipe){bk.pipe=null;bk.lastP=null;persist();}
  if(e.pointerId===bcam.id){bcam.id=null;if(bakeryOpen&&bcam.moved<6&&btab!=='tops'&&cakeHit(e)){cakeCheer();sfx('pop');if(btab!=='candles')toast('Tap 🍓 Toppings to decorate your cake!');}}}
function bakeryCam(dt){const z=Z.bakery,S=z.stand,H=cakeH()+plateInfo()[3];const [pi,df]=BCAM[btab];const pitch=Math.min(1.35,Math.max(-.05,pi+bcam.dp)),yaw=z.rot;
  // back up far enough that the whole cake fits in the part of the screen the panel does not cover
  const land=innerWidth>innerHeight*1.25,vf=Math.tan(camera.fov*Math.PI/360),hf=vf*camera.aspect;
  const d=df*Math.max(.7/(hf*(land?.38:.95)),(H*.5+.28)/(vf*(land?.75:.5)))*ZOOM.k;
  const [cx,cz]=z.toWorld(S.lx,S.lz);bTgt.set(cx,.84+(btab==='write'?H:H*.5),cz);bWant.set(bTgt.x+Math.sin(yaw)*Math.cos(pitch)*d,bTgt.y+Math.sin(pitch)*d,bTgt.z+Math.cos(yaw)*Math.cos(pitch)*d);
  const a=Math.min(1,dt*5);bcam.p.lerp(bWant,a);bcam.t.lerp(bTgt,a);camera.position.copy(bcam.p);camera.lookAt(bcam.t);}
buildCake();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>buildText());
