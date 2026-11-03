/* ===== 🐆 Big cats: a cheetah and a tiger for the Safari Zoo, and to ride once you earn them =====
   Real-looking (true colors and markings): the cheetah is slim and long-legged with solid black spots, black "tear marks"
   from its eyes to its mouth and a ringed tail tip; the tiger is big and heavy, orange with black stripes, a white belly,
   white cheeks and white spots on the backs of its ears. They live at the Safari Zoo (ZOOA in 24d-barn.js) and the rides
   (Duma and Raja) are in 24i-earned-rides.js. Each cat's coat is one small shared texture (safM, 24c9c-safari-more.js). */
// cheetah coat: golden tan with small round black spots
function cheetahTex(){return canvasTex(256,256,(x,w,h)=>{x.fillStyle='#d9a856';x.fillRect(0,0,w,h);
  for(let i=0;i<600;i++){x.fillStyle=Math.random()<.5?'rgba(240,200,120,.35)':'rgba(170,120,50,.25)';x.fillRect(Math.random()*w,Math.random()*h,2,4);}
  x.fillStyle='#1c1612';for(let i=0;i<150;i++){const X=Math.random()*w,Y=Math.random()*h,r=3+Math.random()*3.5;x.beginPath();x.ellipse(X,Y,r,r*(.8+Math.random()*.3),Math.random()*3,0,Math.PI*2);x.fill();}});}
// tiger coat: orange with wavy black stripes that run down the sides (not under the belly), as rings round the body
function tigerTex(){return canvasTex(256,256,(x,w,h)=>{x.fillStyle='#e0782a';x.fillRect(0,0,w,h);
  for(let i=0;i<700;i++){x.fillStyle=Math.random()<.5?'rgba(255,170,90,.3)':'rgba(170,80,20,.25)';x.fillRect(Math.random()*w,Math.random()*h,2,5);}
  x.fillStyle='#16110e';const n=13;for(let i=0;i<n;i++){const Y=(i+.5)/n*h,th=4+((i*7)%5)*1.2,x0=w*(.08+((i*3)%4)*.03),x1=w*(.92-((i*5)%4)*.03);
    x.beginPath();x.moveTo(x0,Y);for(let X=x0;X<=x1;X+=6)x.lineTo(X,Y+Math.sin(X*.05+i)*5-th*(1-Math.abs(X/w-.5)*1.6));
    for(let X=x1;X>=x0;X-=6)x.lineTo(X,Y+Math.sin(X*.05+i)*5+th*(1-Math.abs(X/w-.5)*1.6));x.fill();}});}

// one cat body. k: 'cheetah' or 'tiger'
function bigCat(a,k,g,body,o){const ch=k==='cheetah',T=k==='tiger';
  const r=ch?.26:.36,len=ch?.76:.84,hip=ch?.57:.54,by=ch?.72:.74;
  const M0=safM(k,()=>{const tx=ch?cheetahTex():tigerTex(),txB=tx.clone();txB.wrapS=txB.wrapT=THREE.RepeatWrapping;txB.needsUpdate=true;
    return {coat:phys('#ffffff',{map:txB,roughness:.85,sheen:.5,sheenColor:new THREE.Color('#ffe8c0'),sheenRoughness:.6}),
      head:phys(ch?'#d9a856':'#e0782a',{roughness:.85,sheen:.5,sheenColor:new THREE.Color('#ffe8c0')}),
      light:phys(ch?'#f1e2c2':'#f6efe2',{roughness:.85,sheen:.5,sheenColor:new THREE.Color('#ffffff')}),
      dark:std('#1a1411',{roughness:.7}),nose:phys(ch?'#2a1d18':'#c27a6c',{roughness:.45,clearcoat:.3})};});
  const {coat,head:headM,light,dark}=M0;
  body.position.y=by;
  const cg=new THREE.CapsuleGeometry(r,len,10,24);cg.rotateX(Math.PI/2);const t=M(bandUV(cg,T?1.1:.65),coat,0,0,0,body);t.scale.set(ch?.88:.9,ch?1:.95,1);// the stripes go round the body
  M(bandUV(sph(r*.98,20,14),T?1.1:.65),coat,0,-.02,len*.34,body).scale.set(.92,ch?1.12:1.06,1);// chest
  M(bandUV(sph(r*.92,18,12),T?1.1:.65),coat,0,ch?.02:.02,-len*.38,body).scale.set(.95,1,1.1);// haunches
  M(sph(r*.75,16,10),light,0,-r*.55,len*.02,body).scale.set(.85,.42,1.75);// pale belly
  if(ch)M(sph(r*.6,14,10),light,0,-r*.62,len*.38,body).scale.set(.8,.5,1);// cheetahs have a deep, narrow chest and a tucked waist
  // legs (long and thin on the cheetah, thick and strong on the tiger) with big soft paws
  const lr=ch?.072:.13;
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.55,hip,sz*len*.44);g.add(lg);a.legs.push({g:lg,ph});
    M(sph(lr*1.35,14,10),coat,0,0,0,lg).scale.set(.85,1.25,1.1);
    M(cyl(lr*1.15,lr*.82,hip*.5,14),coat,0,-hip*.25,sz>0?.01:-.03,lg);M(sph(lr*.82,10,8),coat,0,-hip*.5,sz>0?.015:-.05,lg);
    M(cyl(lr*.8,lr*.75,hip*.42,12),coat,0,-hip*.72,sz>0?.02:-.04,lg);
    const pw=M(sph(lr*1.05,14,10),headM,0,-hip+lr*.5,.04,lg);pw.scale.set(1,.55,1.3);
    if(T)for(const tx of [-.05,-.017,.017,.05])M(sph(.032,8,6),headM,tx,-hip+lr*.45,.13-Math.abs(tx)*.6,lg,false,false).scale.set(1,.8,1.1);}
  // neck and head
  const neck=new THREE.Group();neck.position.set(0,by+r*.3,len/2+r*.45);neck.rotation.x=ch?.7:.6;g.add(neck);
  M(bandUV(sph(ch?.17:.25,16,12),2),coat,0,.06,0,neck).scale.set(.9,1.25,1);
  const head=new THREE.Group();head.position.set(0,ch?.2:.24,.08);head.rotation.x=-(ch?.7:.6)+.08;neck.add(head);const H=ch?.13:.22;
  M(sph(H,22,16),headM,0,0,0,head).scale.set(ch?.95:1,ch?.9:.92,ch?1.05:1.12);// round head (the cheetah's is small)
  M(sph(H*.5,14,10),headM,0,H*.08,H*.95,head).scale.set(.75,.62,1.3);// nose bridge
  for(const sx of [-1,1]){M(sph(H*.28,14,10),light,sx*H*.17,-H*.24,H*1.25,head).scale.set(.95,.8,1);// white whisker pads
    for(let i=0;i<3;i++)M(sph(H*.024,6,4),dark,sx*H*(.15+i*.08),-H*(.2+i*.05),H*(1.52-i*.06),head,false,false);
    if(T){M(sph(H*.36,14,10),light,sx*H*.58,-H*.22,H*.45,head).scale.set(.6,.75,1);// white cheek ruffs
      for(let i=0;i<3;i++){const s=M(box(H*.05,H*.36,H*.12),dark,sx*H*(.82+i*.02),H*(.05-i*.12),H*(.2+i*.12),head,false,false);s.rotation.set(0,sx*.6,sx*.5);}// stripes on the cheeks
      for(let i=0;i<3;i++){const s=M(box(H*.4-i*H*.08,H*.05,H*.08),dark,sx*H*.18,H*(.72-i*.12),H*(.55-i*.1),head,false,false);s.rotation.set(-.4,sx*.35,sx*(.25+i*.1));}}// stripes on the forehead
    else{// the cheetah's black "tear marks" from the inner eye down to the corner of the mouth
      const tm=new THREE.Group();tm.position.set(sx*H*.3,H*.05,H*.9);head.add(tm);
      taperTube([fV(0,H*.18,0),fV(sx*H*.04,-H*.1,H*.2),fV(sx*H*.08,-H*.38,H*.3)],q=>H*.045,dark,tm,10,6);}
    // small round ears: dark backs, and white spots on the back of the tiger's
    const e=new THREE.Group();e.position.set(sx*H*.6,H*.72,-H*.1);e.rotation.z=-sx*.3;head.add(e);
    M(sph(H*.26,12,10),T?dark:headM,0,0,-.004,e).scale.set(1,1,.42);M(sph(H*.2,12,10),light,0,-H*.02,H*.045,e,false,false).scale.set(1,1,.3);
    if(T)M(sph(H*.1,8,6),light,0,0,-H*.12,e,false,false).scale.set(1,1,.3);else M(sph(H*.14,8,6),dark,0,H*.04,-H*.11,e,false,false).scale.set(1,1,.3);}
  M(sph(H*.3,14,10),light,0,-H*.5,H*1,head).scale.set(1,.6,1);// chin
  M(sph(H*.15,12,10),M0.nose,0,H*.02,H*1.5,head,false,false).scale.set(1.4,.8,.75);// nose
  M(sph(H*.1,8,6),dark,0,-H*.44,H*1.28,head,false,false).scale.set(1.8,.25,.6);// mouth line
  if(T)M(sph(H*.3,12,8),light,0,H*.32,H*.62,head,false,false).scale.set(1.2,.5,.6);// white above the eyes
  fEyes(a,head,H,.36,.22,.9,.32,.16,ch?'#b8862a':'#d8a22a');
  for(const e of a.eyes)M(sph(H*.15,12,8),dark,0,0,-H*.035,e,false,false).scale.set(1.2,.8,.4);
  // a long tail (the cheetah's ends in black and white rings and a white tip)
  const tail=new THREE.Group();tail.position.set(0,by+r*.3,-(len/2+r*.85));g.add(tail);
  const tl=ch?.85:.8,pts=[fV(0,0,0),fV(0,-.18,-.25),fV(0,-.3,-.5),fV(0,-.2,-tl)];
  taperTube(pts,q=>(ch?.045:.06)-.015*q,coat,tail,18,8);
  if(ch){for(let i=0;i<3;i++){const q=.72+i*.08,p=new THREE.CatmullRomCurve3(pts).getPoint(q);const rg=M(new THREE.TorusGeometry(.036,.016,6,14),dark,p.x,p.y,p.z,tail,false,false);rg.rotation.x=.4;}
    M(sph(.035,8,6),light,0,-.2,-tl,tail);}
  else M(sph(.06,8,6),dark,0,-.2,-tl,tail);
  Object.assign(o,{neck,head,tail,nTilt:ch?.7:.6,gz:.7,size:ch?1:1.2,h:by+r+.45,rad:ch?.55:.7,dustR:[r,r,len*.8]});}
ZOO_BUILD.cheetah=function(g,body,o){bigCat(this,'cheetah',g,body,o);};
ZOO_BUILD.tiger=function(g,body,o){bigCat(this,'tiger',g,body,o);};
