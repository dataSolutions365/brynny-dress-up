/* ===== Happy Barn (the building, fence and paddock; the animals live in 24d-barn.js) ===== */
// local layout: +z points back toward the Birthday Party (the gate), the red barn stands at the back
// a round fence with a gate that faces the plaza, and a sign over the gate (used by the barn and the zoo)
function ringFence(z,FR,gateA,railM,gateM,label,fg){const g=z.g,wood=std('#b07a4a',{roughness:.85});
  const postG=cyl(.07,.08,1.05,8),railG=box(.06,.09,1),capG=sph(.085,8,6);
  for(let i=0;i<40;i++){const a=i/40*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<gateA)continue;const x=Math.sin(a)*FR,w=Math.cos(a)*FR;M(postG,railM,x,.52,w,g);M(capG,railM,x,1.05,w,g,false,false);z.ob(x,w,.32);}
  for(let i=0;i<40;i++){const a=(i+.5)/40*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<gateA+.05)continue;const L=2*FR*Math.sin(Math.PI/40)+.04;
    for(const y of [.45,.85]){const r=M(railG,railM,Math.sin(a)*FR,y,Math.cos(a)*FR,g);r.scale.z=L;r.rotation.y=a+Math.PI/2;}}
  // gate posts with little lanterns
  for(const s of [-1,1]){const a=s*gateA,x=Math.sin(a)*FR,w=Math.cos(a)*FR;M(cyl(.1,.11,1.6,10),gateM,x,.8,w,g);M(sph(.13,12,10),glow('#fff1c4',1.4),x,1.72,w,g,false,false);z.ob(x,w,.3);}
  {const sm=new THREE.MeshBasicMaterial({map:labelTex(label,{size:56,fg,border:'#ffe0a8'}),transparent:true});for(const sd of [1,-1]){const p=M(new THREE.PlaneGeometry(2.6,.5),sm,0,2.05,FR*Math.cos(gateA)+sd*.01,g,false,false);if(sd<0)p.rotation.y=Math.PI;}}
  for(const s of [-1,1])M(cyl(.025,.025,.45,6),wood,s*1,1.8,FR*Math.cos(gateA),g);}
{const z=Z.barn,g=z.g;
 // dirt and straw ground
 const dirt=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#d9b77e';x.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const c=Math.random();x.fillStyle=c<.4?'rgba(160,115,60,.35)':c<.75?'rgba(255,236,170,.55)':'rgba(120,170,70,.35)';x.save();x.translate(Math.random()*w,Math.random()*h);x.rotate(Math.random()*Math.PI);x.fillRect(0,0,6+Math.random()*7,1.4);x.restore();}},4);
 patch(z.r,std('#ffffff',{map:dirt,roughness:1}),z.x,z.z);
 // a short dirt path from the party to the gate
 {const [px,pz]=z.toWorld(0,z.r+.6+z.gap/2);const pm=std('#ffffff',{map:dirt,roughness:1});pm.polygonOffset=true;pm.polygonOffsetFactor=-1;pm.polygonOffsetUnits=-1;
  const p=M(new THREE.PlaneGeometry(2.2,2.4+z.gap),pm,px,.013,pz,scene,false,true);p.rotation.x=-Math.PI/2;p.rotation.z=z.rot;}
 const red=phys('#d6453d',{roughness:.55,clearcoat:.3}),white=phys('#fffaf2',{roughness:.45,clearcoat:.4}),roofM=phys('#5b4a6b',{roughness:.6,clearcoat:.3}),
   wood=std('#b07a4a',{roughness:.85}),dark=std('#3b2618',{roughness:1}),gold=std('#e8c25a',{metalness:1,roughness:.25});
 /* the barn: a gambrel (two-slope) roof like a storybook barn */
 const B={w:4.6,h1:2.3,h2:1.5,d:3.2,lz:-3.05};z.barnBox=B;
 {const bg=new THREE.Group();bg.position.set(0,0,B.lz);g.add(bg);const hw=B.w/2,top=B.h1+B.h2,mx=hw*.62,my=B.h1+B.h2*.62;
  const prof=[[-hw,0],[hw,0],[hw,B.h1],[mx,my],[0,top],[-mx,my],[-hw,B.h1]];
  const sh=new THREE.Shape();prof.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));
  const walls=M(new THREE.ExtrudeGeometry(sh,{depth:B.d,bevelEnabled:false}),red,0,0,-B.d/2,bg);
  // roof: four boards along the two slopes on each side
  const slope=(x1,y1,x2,y2)=>{const L=Math.hypot(x2-x1,y2-y1)+.2,a=Math.atan2(y2-y1,x2-x1);const m=M(box(L,.14,B.d+.4),roofM,(x1+x2)/2,(y1+y2)/2,0,bg);m.rotation.z=a;m.translateY(.08);};
  for(const s of [-1,1]){slope(s*(hw+.12),B.h1-.08,s*mx,my);slope(s*mx,my,0,top);}
  // white trim on the front: frame, the big X doors (open) and the hay loft window
  const fz=B.d/2+.02;
  const trim=(w,h,x,y,rz=0)=>{const m=M(box(w,h,.08),white,x,y,fz,bg);m.rotation.z=rz;return m;};
  for(const s of [-1,1])trim(.16,B.h1,s*(hw-.08),B.h1/2);trim(B.w,.16,0,B.h1-.08);
  M(box(1.9,1.75,.04),dark,0,.875,fz-.01,bg);// dark inside behind the open doors
  for(const s of [-1,1]){const dg=new THREE.Group();dg.position.set(s*.95,0,fz+.02);dg.rotation.y=s*1.1;bg.add(dg);
   M(box(.95,1.75,.06),red,-s*.475,.875,0,dg);const ws=(w,h,x,y,rz=0)=>{const m=M(box(w,h,.07),white,x,y,.03,dg);m.rotation.z=rz;};
   ws(.95,.1,-s*.475,1.7);ws(.95,.1,-s*.475,.05);ws(.1,1.75,-s*.05,.875);ws(.1,1.75,-s*.9,.875);ws(.1,1.95,-s*.475,.875,Math.atan2(1.6,.8)*s);}
  M(box(.9,.75,.05),dark,0,B.h1+.55,fz-.01,bg);trim(1.08,.1,0,B.h1+.97);trim(1.08,.1,0,B.h1+.13);trim(.1,.85,-.5,B.h1+.55);trim(.1,.85,.5,B.h1+.55);
  // hay peeking out of the loft
  const hayM=std('#f2cf63',{roughness:1});for(let i=0;i<7;i++){const h=M(cyl(.012,.012,.42,4),hayM,-.3+i*.1,B.h1+.3,fz+.06,bg,false,false);h.rotation.z=(i-3)*.18;h.rotation.x=.6;}
  // a rooster weather vane on top
  const vane=new THREE.Group();vane.position.set(0,top+.08,0);bg.add(vane);M(cyl(.025,.025,.7,8),gold,0,.35,0,vane);
  const rooster=new THREE.Group();rooster.position.y=.72;vane.add(rooster);M(sph(.12,14,10),gold,0,0,0,rooster).scale.set(1.4,1,.4);M(sph(.07,12,8),gold,.15,.1,0,rooster);M(new THREE.ConeGeometry(.08,.2,8),gold,-.18,.08,0,rooster).rotation.z=1.1;
  for(const [a,l] of [[0,'N'],[Math.PI/2,'E']]){const r=M(box(.5,.02,.02),gold,0,.5,0,vane);r.rotation.y=a;}
  anims.push(t=>{rooster.rotation.y=Math.sin(t*.4)*.8;});
  z.ob(0,B.lz,1.2);for(const s of [-1,1]){z.ob(s*1.5,B.lz,1.1);z.ob(s*1.5,B.lz-1,1.1);z.ob(s*1.5,B.lz+1,1.1);}
  const sign=M(new THREE.PlaneGeometry(2.4,.6),new THREE.MeshBasicMaterial({map:labelTex('🐴 Happy Barn',{size:62,fg:'#d6453d',border:'#ffe0a8'}),transparent:true}),0,B.h1+1.45,fz+.03,bg,false,false);}
 /* a round silo with a dome */
 {const sg=new THREE.Group();sg.position.set(-3.55,0,-2.2);g.add(sg);const sm=phys('#e9e3f2',{roughness:.5,clearcoat:.4});
  M(cyl(.75,.75,3.6,28),sm,0,1.8,0,sg);for(let i=1;i<6;i++)M(new THREE.TorusGeometry(.76,.025,6,32),std('#b8b0c8',{metalness:.6,roughness:.4}),0,i*.62,0,sg).rotation.x=Math.PI/2;
  M(new THREE.SphereGeometry(.78,28,14,0,Math.PI*2,0,Math.PI/2),phys('#ff8fc8',{roughness:.35,clearcoat:1}),0,3.6,0,sg);z.ob(-3.55,-2.2,.95);}
 /* hay bales */
 const baleM=std('#f2cf63',{roughness:1,map:noiseTex('#f2cf63',()=>Math.random()<.5?'rgba(255,245,190,.7)':'rgba(190,140,50,.45)',4000,1,4)});
 const bale=(x,y,zz,ry=0,par=g)=>{const b=M(box(.95,.55,.6),baleM,x,y+.275,zz,par);b.rotation.y=ry;for(const s of [-1,1])M(box(.96,.56,.03),std('#c98f3c'),s*.24,0,0,b);return b;};
 bale(3.2,0,-2.3,.1);bale(3.35,0,-1.55,-.15);bale(3.25,.55,-1.95,.05);z.ob(3.25,-1.95,.9);
 /* water trough */
 {const tg=new THREE.Group();tg.position.set(3.65,0,.9);tg.rotation.y=-.5;g.add(tg);M(box(1.3,.45,.55),wood,0,.3,0,tg);
  M(box(1.18,.04,.43),phys('#7fd3ff',{roughness:.05,clearcoat:1,transparent:true,opacity:.85}),0,.5,0,tg,false,false);for(const s of [-1,1])M(box(.08,.3,.5),wood,s*.55,.08,0,tg);
  z.ob(3.65,.9,.75);z.trough={lx:3.65,lz:.9};}
 /* feed bucket and a carrot crate by the barn door */
 {const cg=new THREE.Group();cg.position.set(-2.1,0,-.95);g.add(cg);M(box(.6,.32,.42),wood,0,.16,0,cg);
  const car=phys('#ff8a1f',{roughness:.5}),leaf=phys('#4fa645',{roughness:.7});for(let i=0;i<6;i++){const c=M(new THREE.ConeGeometry(.045,.24,10),car,-.2+(i%3)*.2,.36,-.08+(i>2?.15:0),cg,false,false);c.rotation.z=Math.PI/2+.3*(i%2?1:-1);M(sph(.035,8,6),leaf,c.position.x+(i%2?.12:-.12),.38,c.position.z,cg,false,false);}
  z.ob(-2.1,-.95,.45);}
 /* round wooden fence with a gate toward the party */
 const FR=5.55,gateA=.32;z.fence=FR;z.gateA=gateA;ringFence(z,FR,gateA,white,red,'🐴 Happy Barn','#d6453d');
 /* glowing horseshoe pad: step on it to open the barn */
 {const P={lx:0,lz:3.9,r:.6};z.bpad=P;const padMat=glow('#ff9c6b',1.4);padMat.transparent=true;
  const ring=M(new THREE.RingGeometry(.45,.62,40),padMat,P.lx,.04,P.lz,g,false,false);ring.rotation.x=-Math.PI/2;
  const pin=M(new THREE.CircleGeometry(.45,40),phys('#ffe2c8',{roughness:.3,emissive:'#ff9c6b',emissiveIntensity:.25}),P.lx,.035,P.lz,g,false,true);pin.rotation.x=-Math.PI/2;
  const shoe=canvasTex(128,128,(x)=>{x.strokeStyle='#c46a2a';x.lineWidth=18;x.lineCap='round';x.beginPath();x.arc(64,58,34,Math.PI*.82,Math.PI*2.18,false);x.stroke();x.fillStyle='#fff';for(const a of [.95,1.2,1.5,1.8,2.05])x.fillRect(64+Math.cos(a*Math.PI)*34-3,58+Math.sin(a*Math.PI)*34-3,6,6);});
  const sm=M(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:shoe,transparent:true,depthWrite:false}),P.lx,.045,P.lz,g,false,false);sm.rotation.x=-Math.PI/2;sm.rotation.z=Math.PI;
  const lbl=z.padLbl=sprite(labelTex('🐴 Barn friends!',{size:52}),1.8,.44);lbl.position.set(P.lx,1.05,P.lz);g.add(lbl);
  anims.push(t=>{padMat.opacity=.55+.45*Math.sin(t*3);lbl.position.y=1+Math.sin(t*2)*.08;});}
 // flowers along the fence and a few chicks' worth of straw piles
 for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2+.2;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<gateA+.25)continue;const x=Math.sin(a)*(FR+.45),w=Math.cos(a)*(FR+.45);
  M(sph(.12,10,8),phys(['#ff6fae','#ffd23f','#ffffff','#b388ff'][i%4],{roughness:.6}),x,.14,w,g,false,false);M(sph(.18,10,8),std('#4fa645',{roughness:.9}),x,.06,w,g,false,false).scale.y=.5;}
 for(const [x,w] of [[-1.2,-1.1],[1.4,-1.2]]){const s=M(sph(.45,14,10),baleM,x,0,w,g,false,true);s.scale.y=.28;}
 signpost(z);}
