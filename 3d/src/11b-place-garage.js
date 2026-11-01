/* ===== Car Garage =====
   The building, the lift and the car you fix up. The repair mini game itself is in 24d-garage.js.
   Car parts the game needs are kept on CARX so the game can move, hide and repaint them. */
const CARX={};
{const z=Z.garage,g=z.g;
 const tile=canvasTex(128,128,(x)=>{x.fillStyle='#f4f6fa';x.fillRect(0,0,128,128);x.fillStyle='#2d2d3a';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);},8);
 patch(7,std('#ffffff',{map:tile,roughness:.5}),z.x,z.z);
 const wallM=phys('#dfe7f1',{roughness:.6}),red=phys('#e0263b',{roughness:.35,clearcoat:.6}),white=phys('#ffffff',{roughness:.3,clearcoat:.6}),
   steel=std('#c9ced8',{metalness:.9,roughness:.3}),dark=std('#2d2d3a',{roughness:.6}),rubber=std('#1d1d22',{roughness:.85}),yellow=phys('#ffd23f',{roughness:.4,clearcoat:.5});
 // walls: back and two sides with a red racing stripe along the bottom
 M(box(9,3.4,.3),wallM,0,1.7,-4.4,g);M(box(9.04,.5,.34),red,0,.25,-4.4,g);for(let i=-4;i<=4;i++)z.ob(i*1.05,-4.4,.6);
 for(const sx of [-1,1]){M(box(.3,3.4,6.3),wallM,sx*4.5,1.7,-1.25,g);M(box(.34,.5,6.34),red,sx*4.5,.25,-1.25,g);for(let k=0;k<7;k++)z.ob(sx*4.5,-4.2+k*.98,.55);
   const win=M(box(.05,.9,1.6),phys('#9fd8ff',{roughness:.05,clearcoat:1,emissive:'#bfe6ff',emissiveIntensity:.35}),sx*4.67,2.1,-1.6,g,false,false);
   M(box(.06,1.02,1.72),white,sx*4.66,2.1,-1.6,g,false,false).scale.set(1,1,1);win.renderOrder=1;}
 // front: a big sign over the open door, the rolled-up door, and the roof
 M(box(9.6,1,.4),red,0,3,1.95,g);
 M(new THREE.PlaneGeometry(5.2,.9),new THREE.MeshBasicMaterial({map:labelTex('🔧 Car Garage',{size:66,fg:'#e0263b',border:'#ffd23f'}),transparent:true}),0,3,2.16,g,false,false);
 {const door=canvasTex(64,64,(x)=>{x.fillStyle='#d9dee8';x.fillRect(0,0,64,64);x.fillStyle='#aab2c0';for(let i=0;i<4;i++)x.fillRect(0,i*16+12,64,3);});
  M(cyl(.28,.28,8.6,24),std('#ffffff',{map:door,metalness:.4,roughness:.4}),0,2.25,1.7,g).rotation.z=Math.PI/2;}
 M(box(9.6,.25,6.8),phys('#3a5bd9',{roughness:.5,clearcoat:.4}),0,3.5,-1.25,g);
 // black and yellow safety stripes at the door
 {const st=canvasTex(128,32,(x)=>{x.fillStyle='#ffd23f';x.fillRect(0,0,128,32);x.fillStyle='#2d2d3a';for(let i=-2;i<10;i++){x.beginPath();x.moveTo(i*16,32);x.lineTo(i*16+8,32);x.lineTo(i*16+16,0);x.lineTo(i*16+8,0);x.fill();}},0);
  st.wrapS=THREE.RepeatWrapping;st.repeat.set(6,1);const s=M(new THREE.PlaneGeometry(8.6,.3),std('#ffffff',{map:st,roughness:.7}),0,.03,1.7,g,false,true);s.rotation.x=-Math.PI/2;}
 // a pegboard of tools on the back wall
 {const pb=canvasTex(512,192,(x,w,h)=>{x.fillStyle='#c79a6a';x.fillRect(0,0,w,h);x.fillStyle='rgba(80,50,30,.35)';for(let i=8;i<w;i+=16)for(let j=8;j<h;j+=16){x.beginPath();x.arc(i,j,2.2,0,Math.PI*2);x.fill();}
    x.font='70px serif';x.textAlign='center';x.textBaseline='middle';['🔧','🔨','🪛','🪚','⚙️','🔩'].forEach((e,i)=>x.fillText(e,45+i*84,h/2+4));});
  M(new THREE.PlaneGeometry(4,1.5),std('#ffffff',{map:pb,roughness:.8}),0,2,-4.24,g,false,true);}
 // red tool chest with drawers
 {const tg=new THREE.Group();tg.position.set(3.4,0,-3.7);g.add(tg);M(new RoundedBoxGeometry(1.3,1.1,.7,3,.05),red,0,.6,0,tg);
  for(let i=0;i<4;i++){M(box(1.18,.02,.02),dark,0,.33+i*.24,.36,tg);M(box(.4,.04,.04),steel,0,.42+i*.24,.37,tg);}
  for(const sx of [-1,1])for(const sz of [-1,1])M(cyl(.05,.05,.06,10),rubber,sx*.55,.05,sz*.28,tg).rotation.x=Math.PI/2;
  M(box(.5,.06,.12),steel,-.2,1.19,0,tg);M(cyl(.04,.04,.4,8),std('#ff8a1f'),.3,1.19,0,tg).rotation.z=Math.PI/2;z.ob(3.4,-3.7,.85);}
 // a stack of tires
 {const tg=new THREE.Group();tg.position.set(-3.5,0,-3.5);g.add(tg);for(let i=0;i<4;i++){const t=M(new THREE.TorusGeometry(.32,.13,12,28),rubber,0,.13+i*.25,0,tg);t.rotation.x=Math.PI/2;}z.ob(-3.5,-3.5,.55);}
 // blue oil drums
 for(const [dx,dz] of [[-3.7,-1.5],[-3.2,-.6]]){const dg=new THREE.Group();dg.position.set(dx,0,dz);g.add(dg);const dm=phys('#3a5bd9',{roughness:.35,clearcoat:.5});
   M(cyl(.32,.32,.95,24),dm,0,.475,0,dg);for(const y of [.25,.7])M(new THREE.TorusGeometry(.325,.02,6,28),dm,0,y,0,dg).rotation.x=Math.PI/2;
   const lab=M(new THREE.PlaneGeometry(.36,.3),new THREE.MeshBasicMaterial({map:labelTex('OIL',{w:128,h:96,size:50,fg:'#3a5bd9',border:'#ffd23f'}),transparent:true}),0,.5,.325,dg,false,false);z.ob(dx,dz,.42);}
 // an orange traffic cone by the door
 for(const sx of [-1,1]){const cg=new THREE.Group();cg.position.set(sx*3.6,0,1.2);g.add(cg);M(box(.4,.04,.4),std('#ff8a1f'),0,.02,0,cg);M(cyl(.03,.16,.55,16),std('#ff8a1f',{roughness:.5}),0,.31,0,cg);M(cyl(.09,.12,.1,16),white,0,.3,0,cg);z.ob(sx*3.6,1.2,.25);}

 // ---- the scissor lift the car sits on ----
 const CZ=-1.2;CARX.cz=CZ;
 M(box(1.6,.06,.7),dark,0,.03,CZ,g);
 const liftTop=CARX.liftTop=M(box(1.4,.05,.62),std('#ffd23f',{roughness:.5}),0,.2,CZ,g);
 const arms=CARX.arms=[];for(const sz of [-.24,.24])for(const s of [-1,1]){const a=M(box(1.7,.05,.05),steel,0,.1,CZ+sz,g);a.userData.s=s;arms.push(a);}

 // ---- the car ----
 const root=CARX.root=new THREE.Group();root.position.set(0,0,CZ);g.add(root);
 const car=CARX.g=new THREE.Group();root.add(car);
 const paint=CARX.paint=phys('#e0263b',{roughness:.25,metalness:.3,clearcoat:1,clearcoatRoughness:.08});
 const glass=phys('#1d2a3a',{roughness:.05,metalness:.2,clearcoat:1,transparent:true,opacity:.86});
 const trim=std('#2d2d3a',{roughness:.5});
 // back and middle of the car (rounded), with an open engine bay at the front under the hood
 M(new RoundedBoxGeometry(1.5,.4,1.06,4,.1),paint,-.43,.42,0,car);
 M(box(.85,.16,1.06),paint,.73,.3,0,car);// bay floor
 for(const s of [-1,1])M(box(.85,.24,.05),paint,.73,.5,s*.505,car);// bay sides
 M(box(.07,.24,1.06),paint,1.12,.5,0,car);// front
 const bay=M(box(.74,.02,.96),std('#3a3a44',{roughness:.8}),.72,.39,0,car,false,true);
 M(new RoundedBoxGeometry(.14,.14,1.1,2,.05),trim,1.17,.3,0,car);M(new RoundedBoxGeometry(.12,.14,1.1,2,.05),trim,-1.17,.3,0,car);
 {const gr=canvasTex(128,48,(x,w,h)=>{x.fillStyle='#1d1d22';x.fillRect(0,0,w,h);x.strokeStyle='#8a8f9c';x.lineWidth=3;for(let i=6;i<w;i+=10){x.beginPath();x.moveTo(i,6);x.lineTo(i,h-6);x.stroke();}});
  const gm=M(new THREE.PlaneGeometry(.5,.13),new THREE.MeshStandardMaterial({map:gr,roughness:.5}),1.157,.47,0,car,false,false);gm.rotation.y=Math.PI/2;}
 // cabin with windows and a roof
 M(new RoundedBoxGeometry(1.05,.32,.92,3,.1),glass,-.22,.76,0,car);
 M(new RoundedBoxGeometry(.92,.06,.88,2,.03),paint,-.26,.92,0,car);
 // lights
 CARX.heads=[];for(const s of [-1,1]){const h=M(new THREE.CircleGeometry(.075,20),glow('#fff4c8',1.2),1.158,.52,s*.36,car,false,false);h.rotation.y=Math.PI/2;CARX.heads.push(h);
   const t=M(new THREE.PlaneGeometry(.06,.16),glow('#ff2a3d',1.1),-1.181,.52,s*.36,car,false,false);t.rotation.y=-Math.PI/2;t.rotation.z=Math.PI/2;}
 // mirrors and door handles
 for(const s of [-1,1]){M(box(.08,.06,.1),paint,.28,.7,s*.5,car);M(box(.12,.02,.02),steel,-.2,.54,s*.533,car);}
 // license plate (the text is drawn in 24d-garage.js)
 CARX.plate=M(new THREE.PlaneGeometry(.32,.11),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.5}),-1.235,.33,0,car,false,false);CARX.plate.rotation.y=-Math.PI/2;
 // the hood opens from the windshield end
 const hood=CARX.hood=new THREE.Group();hood.position.set(.31,.62,0);car.add(hood);
 const hoodM=CARX.hoodM=M(new RoundedBoxGeometry(.86,.05,1.08,2,.02),paint,.43,.0,0,hood);
 // racing stripes over the hood, roof and trunk
 const stripeM=CARX.stripeM=phys('#ffffff',{roughness:.3,clearcoat:1});CARX.stripes=[];
 for(const s of [-1,1]){CARX.stripes.push(M(box(.86,.004,.1),stripeM,.43,.027,s*.12,hood,false,false),M(box(.93,.004,.1),stripeM,-.26,.952,s*.12,car,false,false),M(box(.5,.004,.1),stripeM,-.93,.622,s*.12,car,false,false));}
 // stickers along both sides (drawn in 24d-garage.js)
 CARX.sideM=new THREE.MeshStandardMaterial({transparent:true,roughness:.4,depthWrite:false,side:THREE.DoubleSide});CARX.sides=[];
 for(const s of [-1,1]){const p=M(new THREE.PlaneGeometry(1.7,.3),CARX.sideM,-.1,.42,s*.533,car,false,false);if(s<0){p.rotation.y=Math.PI;p.scale.x=-1;}CARX.sides.push(p);}
 // spoilers: small and big
 CARX.spoil={};for(const [k,h,w] of [['small',.12,.16],['big',.3,.24]]){const sg=new THREE.Group();sg.position.set(-1.02,.62,0);car.add(sg);
   for(const s of [-1,1])M(box(.05,h,.05),trim,0,h/2,s*.32,sg);const wing=M(new RoundedBoxGeometry(w,.04,1.02,2,.015),paint,-.02,h+.02,0,sg);CARX.spoil[k]=sg;sg.visible=false;}
 // glowing lights under the car
 {const gt=canvasTex(128,64,(x,w,h)=>{const r=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.6,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=r;x.fillRect(0,0,w,h);});
  CARX.glow=M(new THREE.PlaneGeometry(2.8,1.6),new THREE.MeshBasicMaterial({map:gt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,color:'#ff4d8d',toneMapped:false}),0,.02,0,car,false,false);CARX.glow.rotation.x=-Math.PI/2;CARX.glow.visible=false;}

 // wheels: tire, rim, spokes and five lug nuts. Only the front one on your side gets changed.
 const rimM=CARX.rimM=std('#d9d9e8',{metalness:1,roughness:.2});
 CARX.rubber=rubber;CARX.flatM=std('#3a3a3f',{roughness:1});
 function wheel(s,parent,nutsOn=true){const w=new THREE.Group();parent.add(w);
   const t=M(new THREE.TorusGeometry(.205,.1,14,32),rubber,0,0,0,w);t.scale.z=.95;w.userData.tire=t;
   const rim=M(cyl(.16,.16,.07,28),rimM,0,0,s*.035,w);rim.rotation.x=Math.PI/2;
   for(let i=0;i<5;i++){const sp=M(box(.025,.13,.02),rimM,0,0,s*.075,w);sp.rotation.z=i*Math.PI*2/5;sp.geometry.translate(0,.075,0);}
   M(cyl(.04,.04,.03,16),rimM,0,0,s*.08,w).rotation.x=Math.PI/2;
   const nuts=[];for(let i=0;i<5;i++){const a=i*Math.PI*2/5+Math.PI/5;const n=M(cyl(.03,.03,.045,6),std('#4a4f5c',{metalness:.8,roughness:.3}),Math.sin(a)*.075,Math.cos(a)*.075,s*.095,w);n.rotation.x=Math.PI/2;n.visible=nutsOn;n.userData.home=n.position.clone();nuts.push(n);}
   w.userData.nuts=nuts;return w;}
 CARX.wheels=[];for(const wx of [.78,-.78])for(const s of [1,-1]){const w=wheel(s,car);w.position.set(wx,.305,s*.5);CARX.wheels.push(w);}
 CARX.fix=CARX.wheels[0];CARX.fix.userData.home=CARX.fix.position.clone();
 // the new tire waiting on the floor
 CARX.spare=wheel(1,g,false);CARX.spare.position.set(1.95,.305,-.1);CARX.spare.rotation.y=-.5;CARX.spare.userData.tire.material=phys('#1d1d22',{roughness:.45,clearcoat:.6});

 // ---- engine bay parts: engine, battery, spark plug, belt, air filter, oil cap ----
 const block=std('#8a8f9c',{metalness:.7,roughness:.35});
 M(box(.34,.15,.42),block,.68,.47,0,car);M(box(.28,.04,.38),std('#e0263b',{metalness:.4,roughness:.35}),.68,.565,0,car);
 for(const pz of [-.12,-.04,.04])M(cyl(.016,.016,.06,8),white,.6,.6,pz,car);
 const P=CARX.parts={};
 const part=(id,x,y,zz)=>{const pg=new THREE.Group();pg.position.set(x,y,zz);car.add(pg);const good=new THREE.Group(),bad=new THREE.Group();pg.add(good,bad);P[id]={g:pg,good,bad,home:pg.position.clone()};return P[id];};
 {const b=part('battery',.5,.47,.33);
  M(box(.16,.14,.17),std('#2d2d3a',{roughness:.5}),0,0,0,b.g);M(box(.161,.04,.171),std('#4fb6ff',{roughness:.4}),0,.03,0,b.g);
  M(cyl(.02,.02,.03,10),std('#e0263b'),0,.085,.05,b.good);M(cyl(.02,.02,.03,10),std('#2d2d3a'),0,.085,-.05,b.good);
  const crust=std('#bfe8c8',{roughness:1});for(const zz of [.05,-.05])for(let i=0;i<4;i++)M(sph(.018+i*.003,8,6),crust,(i-1.5)*.012,.09+(i%2)*.01,zz+(i%2?.01:-.01),b.bad);}
 {const p=part('plug',.6,.6,.12);
  M(cyl(.016,.016,.06,8),white,0,0,0,p.good);M(cyl(.012,.012,.03,6),steel,0,.04,0,p.good);
  M(cyl(.016,.016,.06,8),std('#2b2b2b',{roughness:1}),0,0,0,p.bad);const cr=M(box(.034,.004,.004),std('#ff8a1f'),0,.012,0,p.bad);cr.rotation.y=.6;}
 {const b=part('belt',1.0,.48,0);
  for(const [yy,zz] of [[.04,-.12],[-.03,.12]])M(cyl(.05,.05,.04,18),steel,0,yy,zz,b.g).rotation.z=Math.PI/2;
  const t=M(new THREE.TorusGeometry(.14,.014,8,32),rubber,0,0,0,b.good);t.rotation.y=Math.PI/2;t.scale.y=.6;
  const tb=M(new THREE.TorusGeometry(.14,.014,8,32,Math.PI*1.65),std('#7a3b2a',{roughness:1}),0,0,0,b.bad);tb.rotation.y=Math.PI/2;tb.scale.y=.6;}
 {const f=part('filter',.6,.5,-.32);
  M(cyl(.13,.13,.06,24),std('#4fb6ff',{roughness:.4,clearcoat:.4}),0,.04,0,f.good);M(cyl(.12,.12,.04,24),std('#f4f6fa',{roughness:.7}),0,0,0,f.good);
  M(cyl(.13,.13,.06,24),std('#6b5a48',{roughness:1}),0,.04,0,f.bad);M(cyl(.12,.12,.04,24),std('#5a4632',{roughness:1}),0,0,0,f.bad);
  for(let i=0;i<5;i++)M(sph(.02,6,5),std('#8a7a68',{roughness:1}),Math.sin(i*1.3)*.08,.075,Math.cos(i*1.3)*.08,f.bad);}
 const cap=CARX.cap=new THREE.Group();cap.position.set(.78,.6,-.1);car.add(cap);M(cyl(.035,.035,.03,16),yellow,0,0,0,cap);M(box(.05,.012,.012),yellow,0,.02,0,cap);cap.userData.home=cap.position.clone();
 // under the car: oil pan and drain plug
 M(box(.36,.05,.32),std('#5a5f6a',{metalness:.6,roughness:.4}),.15,.2,0,car);
 const plug=CARX.plug=M(cyl(.045,.045,.045,6),std('#ffd23f',{metalness:.8,roughness:.25,emissive:'#5a4500'}),.15,.155,0,car);plug.userData.home=plug.position.clone();
 M(box(1.6,.04,.08),std('#5a5f6a',{metalness:.6,roughness:.4}),-.45,.2,-.3,car);// exhaust pipe line
 CARX.pipe=M(cyl(.035,.035,.12,12),steel,-1.22,.24,-.3,car);CARX.pipe.rotation.z=Math.PI/2;

 // ---- props used during the jobs ----
 // drain bucket on the floor under the plug
 {const bk=CARX.bucket=new THREE.Group();bk.position.set(.15,0,CZ);g.add(bk);bk.visible=false;
  const pts=[[0,0],[.2,0],[.24,.22],[.23,.23]].map(([a,b])=>new THREE.Vector2(a,b));M(new THREE.LatheGeometry(pts,24),phys('#ff8a1f',{roughness:.4,side:THREE.DoubleSide}),0,0,0,bk);
  CARX.bucketOil=M(cyl(.215,.2,1,24),std('#1a140e',{roughness:.15,metalness:.2}),0,.01,0,bk,false,false);CARX.bucketOil.geometry.translate(0,.5,0);CARX.bucketOil.scale.y=.001;}
 CARX.stream=M(cyl(.014,.014,1,8),std('#1a140e',{roughness:.1}),0,0,0,g,false,false);CARX.stream.visible=false;
 CARX.gold=M(cyl(.012,.012,1,8),phys('#e8b13a',{roughness:.05,clearcoat:1,transparent:true,opacity:.9}),0,0,0,g,false,false);CARX.gold.visible=false;
 // a jug of new oil
 {const j=CARX.jug=new THREE.Group();g.add(j);j.visible=false;M(new RoundedBoxGeometry(.16,.22,.09,2,.025),yellow,0,0,0,j);M(cyl(.025,.03,.07,10),dark,-.06,.13,0,j);
  M(new THREE.PlaneGeometry(.1,.08),new THREE.MeshBasicMaterial({map:labelTex('OIL',{w:128,h:96,size:50,fg:'#2d2d3a',bg:'#ffd23f',border:'#2d2d3a'}),transparent:true}),0,0,.046,j,false,false);}
 // glowing wrench pad: step on it to start
 const padMat=glow('#4fb6ff',1.4);padMat.transparent=true;const PD={lx:0,lz:2.9,r:.6};z.gpad=PD;
 const ring=M(new THREE.RingGeometry(.45,.62,40),padMat,PD.lx,.04,PD.lz,g,false,false);ring.rotation.x=-Math.PI/2;
 const pin=M(new THREE.CircleGeometry(.45,40),phys('#cfe8ff',{roughness:.3,emissive:'#4fb6ff',emissiveIntensity:.25}),PD.lx,.035,PD.lz,g,false,true);pin.rotation.x=-Math.PI/2;
 const wt=canvasTex(128,128,(x)=>{x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🔧',64,70);});
 const wm=M(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:wt,transparent:true,depthWrite:false}),PD.lx,.045,PD.lz,g,false,false);wm.rotation.x=-Math.PI/2;
 const lbl=z.padLbl=sprite(labelTex('🔧 Fix the car!',{size:54,fg:'#3a5bd9',border:'#cfe8ff'}),1.8,.45);lbl.position.set(PD.lx,1.05,PD.lz);g.add(lbl);
 anims.push(t=>{padMat.opacity=.55+.45*Math.sin(t*3);lbl.position.y=1+Math.sin(t*2)*.08;});
 z.ob(-.75,CZ,.75);z.ob(.75,CZ,.75);z.ob(0,CZ,.6);
 const pl=new THREE.PointLight('#fff3dc',18,10,2);pl.position.set(0,2.9,-1.2);g.add(pl);
 signpost(z);}
