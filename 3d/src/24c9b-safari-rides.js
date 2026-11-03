/* ===== 🦁 Safari rides: a real-looking lion, plus saddles for the safari animals you can earn =====
   Tembo the elephant, Kivu the okapi and Jabari the lion only come to players who finish their super hard
   🦁 Safari challenges (the list is in 24i-earned-rides.js, the challenges themselves in challenges.js).
   The elephant and okapi use the zoo's real-looking models (24c9-zoo-okapi-elephant.js) with a saddle on top;
   the lion is built here the same way: true colors and shapes, no cartoon blush or crown (that's Goldie). */

// short tawny fur: lots of fine strokes in a few shades, so the coat isn't one flat color
let LION_FUR=null;
const lionFurTex=()=>LION_FUR||(LION_FUR=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#bf8a4e';x.fillRect(0,0,w,h);
  for(let i=0;i<2600;i++){const c=Math.random();x.strokeStyle=c<.4?'rgba(150,100,50,.35)':c<.75?'rgba(232,196,140,.35)':'rgba(120,80,40,.25)';x.lineWidth=1+Math.random();
    const X=Math.random()*w,Y=Math.random()*h,L=4+Math.random()*7;x.beginPath();x.moveTo(X,Y);x.lineTo(X+(Math.random()-.5)*2,Y+L);x.stroke();}},3));
// a thick mane: a shaggy solid base (so there are never gaps) covered in hundreds of thin hair strands in one instanced mesh,
// pointing out and back from an egg shape, darker toward the back. skip(d) leaves out directions (like the face).
function lionMane(par,cx,cy,cz,rx,ry,rz,n,skip,base,cols,len=[.1,.2],thick=.024){
  const b=M(fuzz(sph(1,32,24),.07,7),phys(base,{roughness:.95,sheen:.6,sheenColor:new THREE.Color('#e0a060')}),cx,cy,cz,par);b.scale.set(rx*.92,ry*.92,rz*.92);
  const geo=new THREE.ConeGeometry(1,1,6,1);geo.translate(0,.5,0);// a pointed lock of hair growing out along +y from its root
  const m=new THREE.InstancedMesh(geo,phys('#ffffff',{roughness:.9,sheen:.6,sheenColor:new THREE.Color('#ffd8a0'),sheenRoughness:.6}),n);m.castShadow=true;m.receiveShadow=true;
  const d=new THREE.Vector3(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),s=new THREE.Vector3(),p=new THREE.Vector3(),mx=new THREE.Matrix4(),c=new THREE.Color(),lean=new THREE.Vector3();let i=0,tries=0;
  while(i<n&&tries++<n*30){d.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1);if(d.lengthSq()>1||d.lengthSq()<.05)continue;d.normalize();if(skip(d))continue;
    p.set(cx+d.x*rx*.9,cy+d.y*ry*.9,cz+d.z*rz*.9);
    // strands lean back and down a little, like real hair
    lean.set((Math.random()-.5)*.4,-.5-Math.random()*.3,-.95);const o=d.clone().add(lean).normalize();q.setFromUnitVectors(up,o);
    const L=len[0]+Math.random()*(len[1]-len[0]),T=thick*(.7+Math.random()*.6);s.set(T,L,T*.75);mx.compose(p,q,s);m.setMatrixAt(i,mx);
    const back=Math.min(1,Math.max(0,-d.z*.55-d.y*.35+.3));c.set(cols[0]).lerp(new THREE.Color(cols[1]),back).lerp(new THREE.Color(cols[2]),Math.random()*.35);m.setColorAt(i,c);i++;}
  m.count=i;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;par.add(m);return m;}

ZOO_BUILD.lion=function(g,body,o){const r=.36,len=.78,hip=.74,by=.84;
  const coat=phys('#ffffff',{map:lionFurTex(),roughness:.85,sheen:.5,sheenColor:new THREE.Color('#ffe2b0'),sheenRoughness:.6}),
    light=phys('#dcbb88',{roughness:.85,sheen:.5,sheenColor:new THREE.Color('#ffffff')}),pawM=phys('#c9975a',{roughness:.85,sheen:.4,sheenColor:new THREE.Color('#ffe2b0')}),
    dark=std('#2b1b12',{roughness:.8}),noseM=phys('#6e4034',{roughness:.45,clearcoat:.3});
  body.position.y=by;
  // a long, strong body: deep chest, shoulder blades, big haunches, a pale tucked belly
  const t=M(new THREE.CapsuleGeometry(r,len,10,24),coat,0,0,0,body);t.rotation.x=Math.PI/2;t.scale.set(.85,.92,1);
  M(sph(r*.98,20,14),coat,0,-.05,len*.34,body).scale.set(.9,1.08,1);
  for(const sx of [-1,1]){M(sph(r*.46,14,10),coat,sx*r*.42,r*.45,len*.3,body).scale.set(.6,.75,1.25);
    M(sph(r*.8,16,12),coat,sx*r*.32,.02,-len*.38,body).scale.set(.72,1,1.12);}
  M(sph(r*.7,16,10),light,0,-r*.52,len*.02,body).scale.set(.85,.4,1.7);
  // legs: thick forearms and big round paws with toes; the back legs have heavy thighs and a hock
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const lg=new THREE.Group();lg.position.set(sx*r*.52,hip,sz*len*(sz>0?.42:.44));g.add(lg);this.legs.push({g:lg,ph});
    if(sz>0){M(sph(.14,14,10),coat,0,0,0,lg).scale.set(.9,1.1,1.1);M(cyl(.125,.095,.36,16),coat,0,-.17,.01,lg);M(sph(.096,12,10),coat,0,-.36,.015,lg);M(cyl(.094,.088,.3,14),coat,0,-.5,.02,lg);}
    else{M(sph(.17,16,12),coat,0,.02,.0,lg).scale.set(.8,1.25,1.2);M(cyl(.13,.088,.34,16),coat,0,-.18,-.03,lg);M(sph(.085,12,10),coat,0,-.36,-.055,lg);
      const sh=M(cyl(.082,.078,.3,14),coat,0,-.5,-.05,lg);sh.rotation.x=.1;}
    const pw=M(sph(.106,16,12),pawM,0,-.69,.05,lg);pw.scale.set(1,.55,1.3);
    for(const tx of [-.055,-.019,.019,.055])M(sph(.036,8,6),pawM,tx,-.7,.16-Math.abs(tx)*.6,lg,false,false).scale.set(1,.8,1.1);}
  // the neck and head: the head is carried about as high as the back, the face sticks out of the mane
  const neck=new THREE.Group();neck.position.set(0,by+r*.25,len/2+r*.4);neck.rotation.x=.55;g.add(neck);
  M(sph(.26,18,14),coat,0,.08,0,neck).scale.set(.9,1.2,1);
  const head=new THREE.Group();head.position.set(0,.24,.12);head.rotation.x=-.55+.08;neck.add(head);const H=.22;
  M(sph(H,24,18),coat,0,0,0,head).scale.set(.9,.92,1.18);
  M(sph(H*.5,16,12),coat,0,H*.4,H*.72,head).scale.set(1.45,.45,.75);// brow
  M(sph(H*.48,16,12),coat,0,H*.06,H*.98,head).scale.set(.74,.66,1.55);// the long nose bridge
  M(sph(H*.3,12,10),phys('#a46e3c',{roughness:.8}),0,H*.24,H*1.2,head,false,false).scale.set(.8,.45,1.5);// darker fur down the nose
  for(const sx of [-1,1]){M(sph(H*.29,16,12),light,sx*H*.17,-H*.24,H*1.42,head).scale.set(.95,.8,1);// whisker pads
    for(let i=0;i<3;i++)M(sph(H*.024,6,4),dark,sx*H*(.15+i*.08),-H*(.2+i*.05),H*(1.69-i*.06),head,false,false);
    M(sph(H*.2,10,8),light,sx*H*.33,H*.02,H*.98,head,false,false).scale.set(1.1,.6,.6);// pale fur under the eyes
    const e=new THREE.Group();e.position.set(sx*H*.62,H*.78,-H*.05);e.rotation.z=-sx*.35;head.add(e);// small round ears, dark on the back
    M(sph(H*.25,12,10),dark,0,0,-.004,e).scale.set(1,1,.42);M(sph(H*.2,12,10),light,0,-H*.02,H*.04,e,false,false).scale.set(1,1,.3);}
  M(sph(H*.3,14,10),light,0,-H*.5,H*1.15,head).scale.set(1,.6,1);// chin
  M(sph(H*.17,12,10),noseM,0,H*.0,H*1.7,head,false,false).scale.set(1.4,.8,.75);// nose leather
  M(sph(H*.03,6,4),dark,0,-H*.16,H*1.7,head,false,false).scale.set(1,3,1);// the line under the nose
  M(sph(H*.1,8,6),dark,0,-H*.44,H*1.45,head,false,false).scale.set(1.8,.25,.6);// mouth line
  fEyes(this,head,H,.36,.2,1,.32,.16,'#c88a2a');
  for(const e of this.eyes)M(sph(H*.15,12,8),dark,0,0,-H*.035,e,false,false).scale.set(1.2,.8,.4);// dark eye lining
  // the mane: a big shaggy ruff around the face, flowing down over the neck and chest
  lionMane(head,0,-H*.15,-H*.55,H*1.5,H*1.55,H*1.15,520,d=>d.z>.55,'#7a4622',['#a8692e','#4a2812','#2a160a'],[.1,.2],.03);
  lionMane(neck,0,.02,-.04,.3,.4,.32,420,d=>d.z>.75&&d.y>-.2,'#5a3018',['#8a5326','#3b2010','#24130a'],[.12,.22],.034);
  // a long tail with a dark tuft at the end
  const tail=new THREE.Group();tail.position.set(0,by+r*.4,-(len/2+r*.82));g.add(tail);
  taperTube([fV(0,0,0),fV(0,-.18,-.16),fV(0,-.45,-.22),fV(0,-.62,-.14),fV(0,-.7,0)],q=>.042-.016*q,coat,tail,24,10);
  M(sph(.07,12,10),dark,0,-.72,.05,tail).scale.set(.9,1.5,.9);
  this.tick=(tm,dt,run)=>{body.scale.y=1+Math.sin(tm*1.8)*.012*(1-run*.5);};// breathing
  Object.assign(o,{neck,head,tail,nTilt:.55,gz:.55,size:1.2,h:by+.85,rad:.65,dustR:[r,r,len*.8]});};

// a saddle for the safari rides (and a decorated blanket for the elephant), so you can tell they're yours and ready to ride
// where the saddle sits on each ride: r = body radius under it, sx/sy = body shape, y/z = where on the body, col = blanket color, seatY = saddle height
const SADDLE={kivu:{r:.27,sx:.95,sy:1.03,y:.02,z:.02,col:'#3c6a3a',seatY:.27},jabari:{r:.36,sx:.88,sy:.95,y:0,z:.06,col:'#2f4a7a',seatY:.33},
  punda:{r:.29,sx:.9,sy:1,y:.02,z:0,col:'#8a2f2a',seatY:.3},kifaru:{r:.46,sx:.92,sy:.95,y:0,z:-.04,col:'#2f5a6a',seatY:.44},
  neema:{r:.3,sx:.95,sy:.9,y:0,z:-.03,col:'#5a2f6a',seatY:.27},twiga:{r:.3,sx:.9,sy:1,y:.03,z:.05,col:'#2f6a4a',seatY:.31},
  zuri:{r:.36,sx:1.05,sy:.95,y:.12,z:-.08,col:'#6a4a2f',seatY:.3},kiboko:{r:.5,sx:1.14,sy:.94,y:0,z:.05,col:'#2f6a8a',seatY:.47}};
function safariGear(k,g,body,o){
  const leather=phys('#6a3a1e',{roughness:.5,clearcoat:.4,clearcoatRoughness:.4}),dkL=phys('#3e2112',{roughness:.6}),brass=phys('#d4a64a',{metalness:.8,roughness:.3});
  const blanket=(col,trim,r,len,y,z,sx,sy,arc)=>{const bg=new THREE.Group();bg.position.set(0,y,z);bg.scale.set(sx,sy,1);body.add(bg);
    const cm=phys(col,{roughness:.9,sheen:.8,sheenColor:new THREE.Color('#ffffff'),side:THREE.DoubleSide});
    // a piece of a tube along the body, with the middle of the piece on top
    const cg=new THREE.CylinderGeometry(r,r,len,40,1,true,Math.PI-arc/2,arc);cg.rotateX(Math.PI/2);M(cg,cm,0,0,0,bg);
    const tm=phys(trim,{roughness:.4,metalness:.3});for(const s of [-1,1]){const e=M(new THREE.TorusGeometry(r,.012,6,40,arc),tm,0,0,s*len/2,bg,false,false);e.rotation.z=Math.PI/2-arc/2;}
    for(const s of [-1,1]){const e=M(cyl(.012,.012,len,8),tm,Math.sin(s*arc/2)*r,Math.cos(arc/2)*r,0,bg,false,false);e.rotation.x=Math.PI/2;}
    return bg;};
  if(k==='tembo'){// a red and gold blanket on the back, a rope collar where you sit just behind the ears
    blanket('#b8322a','#e8b84a',.74,1.05,.04,-.05,.92,1.02,2.9);
    const gem=phys('#2a6fd6',{roughness:.15,clearcoat:1});for(const s of [-1,1])M(sph(.05,10,8),gem,s*.62,-.18,-.05,body,false,false);
    const col=M(new THREE.TorusGeometry(.5,.035,8,36),phys('#c79a4a',{roughness:.9}),0,.0,.0,o.neck);col.rotation.x=Math.PI/2+.12;col.scale.set(1,1.15,1);
    return;}
  // the others: a leather saddle on a blanket, held on with a girth strap (sizes for each animal in SADDLE)
  const L=SADDLE[k]||SADDLE.kivu;
  blanket(L.col,'#e8c46a',L.r*1.04,.42,L.y,L.z,L.sx,L.sy,2.3);
  const sg=new THREE.Group();sg.position.set(0,L.seatY+L.y,L.z);body.add(sg);
  M(sph(.17,20,12),leather,0,0,0,sg).scale.set(.95,.22,1.25);
  M(sph(.06,12,8),leather,0,.045,.17,sg).scale.set(1.2,1.1,.8);// pommel
  M(sph(.1,14,10),leather,0,.04,-.17,sg).scale.set(1.3,.6,.45);// cantle
  for(const s of [-1,1]){const f=M(sph(.12,14,10),dkL,s*.13,-.07,0,sg);f.scale.set(.25,.7,1.1);f.rotation.z=s*.5;}// flaps
  const girth=M(new THREE.TorusGeometry(L.r*1.05,.018,6,40),dkL,0,L.y,L.z+.02,body,false,false);girth.scale.set(L.sx,L.sy,1);
  M(new THREE.TorusGeometry(.03,.007,6,14),brass,0,L.seatY+L.y+.04,L.z+.19,body,false,false);}
