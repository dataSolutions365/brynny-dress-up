/* ===== Sweet Bakery ===== */
{const z=Z.bakery,g=z.g;
 const tile=canvasTex(128,128,(x)=>{x.fillStyle='#fffaf0';x.fillRect(0,0,128,128);x.fillStyle='#c9f2e3';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);},7);
 patch(7,std('#ffffff',{map:tile,roughness:.45}),z.x,z.z);
 const cream=phys('#fff0d6',{roughness:.6}),mint=phys('#9fe6cf',{roughness:.5,clearcoat:.3}),white=phys('#ffffff',{roughness:.3,clearcoat:.6}),pinkG=phys('#ff8fc8',{roughness:.3,clearcoat:1}),gold=std('#e8c25a',{metalness:1,roughness:.25}),wood=std('#e7b98a',{roughness:.7});
 // walls: back and two sides, with a mint stripe along the bottom
 M(box(9,3.4,.3),cream,0,1.7,-4.6,g);M(box(9.04,1,.34),mint,0,.5,-4.6,g);for(let i=-4;i<=4;i++)z.ob(i*1.05,-4.6,.6);
 for(const sx of [-1,1]){M(box(.3,3.4,5.4),cream,sx*4.5,1.7,-2,g);M(box(.34,1,5.44),mint,sx*4.5,.5,-2,g);for(let k=0;k<6;k++)z.ob(sx*4.5,-4.4+k*.95,.55);
   const win=M(new THREE.CircleGeometry(.55,32),glow('#fff1c4',1.1),sx*4.66,2.1,-2,g,false,false);win.rotation.y=sx*Math.PI/2;
   const fr=M(new THREE.TorusGeometry(.56,.06,8,32),white,sx*4.67,2.1,-2,g);fr.rotation.y=Math.PI/2;}
 M(new THREE.PlaneGeometry(4.8,1.2),new THREE.MeshBasicMaterial({map:labelTex('🧁 Sweet Bakery',{size:68,fg:'#ff4d8d'}),transparent:true}),0,2.55,-4.44,g,false,false);
 // roof with a scalloped mint and white awning across the front
 M(box(9.6,.25,6.4),phys('#ff9ccc',{roughness:.5,clearcoat:.4}),0,3.5,-1.9,g);
 const awn=M(box(9.6,.12,1.1),phys('#9fe6cf',{map:TEX.stripes,roughness:.6}),0,3.2,1.65,g);awn.rotation.x=.35;
 for(let i=-9;i<=9;i++)M(new THREE.SphereGeometry(.26,12,8,0,Math.PI*2,Math.PI/2,Math.PI/2),phys(i%2?'#ffffff':'#9fe6cf',{roughness:.6}),i*.52,3.03,2.17,g,false,false);
 // a giant cupcake on the roof you can see from far away
 {const cg=new THREE.Group();cg.position.set(0,3.62,-2.3);g.add(cg);
  const rib=canvasTex(128,32,(x)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#ffffff':'#e8e8e8';x.fillRect(i*8,0,8,32);}});
  M(cyl(1.05,.78,1,32),phys('#ff6fae',{map:rib,roughness:.5,clearcoat:.5}),0,.5,0,cg);
  const fm=phys('#fff4fa',{roughness:.35,clearcoat:.5,sheen:.6});[[1.05,.34,1.1],[.82,.3,1.55],[.56,.26,1.95]].forEach(([r,t,y])=>M(new THREE.TorusGeometry(r,t,16,40),fm,0,y,0,cg).rotation.x=Math.PI/2);
  M(new THREE.ConeGeometry(.45,.7,24),fm,0,2.35,0,cg);M(sph(.26,20,16),phys('#d0102b',{roughness:.12,clearcoat:1}),0,2.85,0,cg);
  const spc=['#ff3b6b','#4fb6ff','#ffd23f','#7ee081','#b388ff'];for(let i=0;i<34;i++){const a=i*2.4,y=1.15+(i%5)*.2,r=1.12-(i%5)*.13;const s=M(new THREE.CapsuleGeometry(.04,.1,2,6),phys(spc[i%5],{roughness:.4}),Math.sin(a)*r,y+.2,Math.cos(a)*r,cg,false,false);s.rotation.set(a,a*1.7,1.2);}
  anims.push(t=>{cg.rotation.y=t*.25;cg.position.y=3.62+Math.sin(t*1.5)*.06;});}
 // glass display case with little cakes
 {const dg=new THREE.Group();dg.position.set(-2.55,0,-3.75);g.add(dg);M(box(2.5,.9,.85),pinkG,0,.45,0,dg);M(box(2.55,.06,.9),white,0,.92,0,dg);
  M(box(2.45,.55,.8),phys('#ffffff',{roughness:0,transmission:.9,transparent:true,opacity:.25,clearcoat:1}),0,1.22,0,dg,false,false);
  [['#ffb3d1','#ff6fae'],['#6b3b22','#e8c25a'],['#fff4fa','#8fd8ff']].forEach(([c,t],i)=>{const x=-.8+i*.8;M(cyl(.2,.2,.22,28),phys(c,{roughness:.5,clearcoat:.3}),x,1.06,0,dg);M(cyl(.21,.21,.04,28),phys(t,{roughness:.3,clearcoat:1}),x,1.17,0,dg);M(sph(.035,10,8),phys('#d0102b',{roughness:.1,clearcoat:1}),x,1.22,0,dg);});
  z.ob(-2.55,-3.75,1.3);z.ob(-3.3,-3.75,.6);z.ob(-1.8,-3.75,.6);}
 // cupcake shelf
 {const sg=new THREE.Group();sg.position.set(2.7,0,-4.15);g.add(sg);M(box(2.3,.06,.5),wood,0,1.7,0,sg);for(const y of [.55,1.1])M(box(2.3,.06,.5),wood,0,y,0,sg);for(const x of [-1.12,1.12])M(box(.06,1.72,.5),wood,x,.86,0,sg);
  const fc=['#ff8fc8','#8fd8ff','#ffd23f','#b388ff','#7ee081','#fff4fa'];for(const [y,n] of [[.58,4],[1.13,4],[1.73,3]])for(let i=0;i<n;i++){const x=-.75+i*(1.5/(n-1));M(cyl(.11,.08,.13,14),phys('#ffffff',{map:TEX.stripes,roughness:.5}),x,y+.065,0,sg);const f=M(sph(.12,14,10),phys(fc[(i+n+y*10|0)%6],{roughness:.4,clearcoat:.4}),x,y+.18,0,sg);f.scale.y=.8;M(sph(.025,8,6),phys('#d0102b',{roughness:.1}),x,y+.29,0,sg);}
  z.ob(2.7,-4.15,1.2);z.ob(1.9,-4.15,.5);z.ob(3.5,-4.15,.5);}
 // pink oven with a glowing window
 {const og=new THREE.Group();og.position.set(3.75,0,-1.7);og.rotation.y=-Math.PI/2;g.add(og);M(box(1,1.05,.8),phys('#ffb3d1',{roughness:.4,clearcoat:.6}),0,.53,0,og);
  M(new THREE.PlaneGeometry(.62,.42),glow('#ffb060',1.2),0,.5,.41,og,false,false);M(box(.7,.05,.05),gold,0,.8,.42,og);for(let i=0;i<3;i++)M(cyl(.05,.05,.04,12),white,-.25+i*.25,.95,.42,og).rotation.x=Math.PI/2;z.ob(3.75,-1.7,.75);}
 // cafe tables near the door
 for(const sx of [-1,1]){const tg=new THREE.Group();tg.position.set(sx*2.9,0,1.4);g.add(tg);M(cyl(.45,.45,.05,28),white,0,.74,0,tg);M(cyl(.04,.05,.72,10),gold,0,.36,0,tg);M(cyl(.25,.28,.03,20),gold,0,.015,0,tg);
   M(cyl(.09,.07,.1,14),phys('#ffffff',{map:TEX.stripes}),0,.82,0,tg);const f=M(sph(.1,14,10),phys(sx<0?'#ff8fc8':'#8fd8ff',{roughness:.4}),0,.92,0,tg);f.scale.y=.8;z.ob(sx*2.9,1.4,.55);}
 // the decorating table: your cake sits on a stand that spins
 const S={lx:0,lz:-.9,h:.93};z.stand=S;
 M(cyl(.58,.62,.78,40),white,0,.39,S.lz,g);M(cyl(.66,.66,.05,40),mint,0,.79,S.lz,g);M(new THREE.TorusGeometry(.66,.025,8,48),gold,0,.815,S.lz,g).rotation.x=Math.PI/2;z.ob(0,S.lz,.75);
 const root=z.cakeRoot=new THREE.Group();root.position.set(0,.815,S.lz);g.add(root);
 // glowing cupcake pad: step on it to start baking
 const padMat=glow('#ff8fc8',1.4);padMat.transparent=true;const P={lx:0,lz:.85,r:.6};z.bpad=P;
 const ring=M(new THREE.RingGeometry(.45,.62,40),padMat,P.lx,.04,P.lz,g,false,false);ring.rotation.x=-Math.PI/2;
 const pin=M(new THREE.CircleGeometry(.45,40),phys('#ffe2ef',{roughness:.3,emissive:'#ff8fc8',emissiveIntensity:.25}),P.lx,.035,P.lz,g,false,true);pin.rotation.x=-Math.PI/2;
 const cupTex=canvasTex(128,128,(x)=>{x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🧁',64,70);});
 const cupM=M(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:cupTex,transparent:true,depthWrite:false}),P.lx,.045,P.lz,g,false,false);cupM.rotation.x=-Math.PI/2;
 const lbl=z.padLbl=sprite(labelTex('🎂 Bake a cake!',{size:54}),1.8,.45);lbl.position.set(P.lx,1.05,P.lz);g.add(lbl);
 anims.push(t=>{padMat.opacity=.55+.45*Math.sin(t*3);lbl.position.y=1+Math.sin(t*2)*.08;});
 for(const sx of [-1,1]){const bg=new THREE.Group();bg.position.set(sx*4.5,0,.5);g.add(bg);const b=M(sph(.3,20,14),phys(sx<0?'#9fe6cf':'#ff6fae',{roughness:.15,clearcoat:1}),0,3.95,0,bg,false,false);b.scale.y=1.15;const ph=sx;anims.push(t=>{b.position.y=3.95+Math.sin(t*1.3+ph)*.1;});}
 const pl=new THREE.PointLight('#ffe0c8',18,10,2);pl.position.set(0,2.8,-1);g.add(pl);
 signpost(z);}

