/* ===== Pet Parlor ===== */
{const z=Z.parlor,g=z.g;
 const tile=canvasTex(128,128,(x)=>{x.fillStyle='#fff4f9';x.fillRect(0,0,128,128);x.fillStyle='#ffd6ea';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);},7);
 patch(7,std('#ffffff',{map:tile,roughness:.45}),z.x,z.z);
 const wallM=phys('#ffc2dc',{roughness:.6}),white=phys('#ffffff',{roughness:.3,clearcoat:.6}),gold=std('#e8c25a',{metalness:1,roughness:.25}),pinkG=phys('#ff8fc8',{roughness:.3,clearcoat:1});
 // back wall with a big sign
 M(box(9,3.2,.3),wallM,0,1.6,-4.6,g);for(let i=-4;i<=4;i++)z.ob(i*1.05,-4.6,.6);
 M(new THREE.PlaneGeometry(4.8,1.2),new THREE.MeshBasicMaterial({map:labelTex('🐾 Pet Parlor',{size:70,fg:'#ff4d8d'}),transparent:true}),0,2.45,-4.44,g,false,false);
 for(let i=0;i<7;i++){const pw=M(new THREE.CircleGeometry(.12,16),new THREE.MeshBasicMaterial({color:'#ff8fc8'}),-3.6+i*1.2,.9+(i%2)*.3,-4.44,g,false,false);}
 // striped awning roof on four posts
 M(box(9.6,.18,7.6),phys('#ff9ccc',{map:TEX.stripes,roughness:.6}),0,3.35,-1,g);
 for(let i=-9;i<=9;i++){M(new THREE.SphereGeometry(.26,12,8,0,Math.PI*2,Math.PI/2,Math.PI/2),phys(i%2?'#ffffff':'#ff6fae',{roughness:.6}),i*.52,3.27,2.75,g,false,false);}
 for(const sx of [-1,1]){M(cyl(.12,.14,3.3,16),white,sx*4.4,1.65,2.6,g);M(new THREE.TorusGeometry(.15,.04,8,20),gold,sx*4.4,.3,2.6,g).rotation.x=Math.PI/2;z.ob(sx*4.4,2.6,.25);}
 // grooming table where your pet sits
 const T={lx:0,lz:-1.2,h:.72};z.table=T;
 M(cyl(.62,.7,.66,40),white,0,.33,T.lz,g);M(cyl(.76,.76,.06,40),pinkG,0,.69,T.lz,g);
 M(new THREE.TorusGeometry(.76,.03,8,48),gold,0,.72,T.lz,g).rotation.x=Math.PI/2;z.ob(0,T.lz,.85);
 const bottleC=['#ff3b6b','#ff6fae','#8e6cff','#4fb6ff','#7ee081','#ffd23f'];
 bottleC.forEach((c,i)=>{const a=deg(150+i*12),bx=Math.sin(a)*.64,bz=T.lz+Math.cos(a)*.64;M(cyl(.035,.042,.1,12),phys(c,{roughness:.1,clearcoat:1,transmission:.2}),bx,.77,bz,g);M(cyl(.016,.02,.07,8),std('#2d2d3a'),bx,.855,bz,g);});
 // bath tub and food bowl that show up on the table during pet care
 const tub=z.tub=new THREE.Group();tub.position.set(0,T.h,T.lz);g.add(tub);tub.visible=false;
 {const pts=[[0,0],[.36,0],[.42,.05],[.45,.2],[.47,.26],[.44,.27]].map(([a,b])=>new THREE.Vector2(a,b));const t=M(new THREE.LatheGeometry(pts,40),phys('#ffffff',{roughness:.15,clearcoat:1,side:THREE.DoubleSide}),0,0,0,tub);t.scale.z=1.35;
  const w=M(new THREE.CircleGeometry(.43,40),phys('#8fd8ff',{roughness:.05,clearcoat:1,transparent:true,opacity:.75}),0,.17,0,tub,false,false);w.rotation.x=-Math.PI/2;w.scale.set(1,1.35,1);
  const foam=phys('#ffffff',{roughness:.2,transparent:true,opacity:.9,iridescence:1});for(let i=0;i<22;i++){const a=i/22*Math.PI*2;M(sph(.045+(i%3)*.012,10,8),foam,Math.sin(a)*.44,.27,Math.cos(a)*.44*1.35,tub,false,false);}
  M(cyl(.02,.02,.2,8),gold,0,.37,-.62,tub);const sp=M(new THREE.TorusGeometry(.06,.02,8,16,Math.PI),gold,0,.47,-.56,tub);sp.rotation.y=Math.PI/2;}
 const bowl=z.bowl=new THREE.Group();bowl.position.set(0,T.h,T.lz+.52);g.add(bowl);bowl.visible=false;
 {const pts=[[0,0],[.08,0],[.11,.05],[.1,.06]].map(([a,b])=>new THREE.Vector2(a,b));M(new THREE.LatheGeometry(pts,24),phys('#ff6fae',{roughness:.25,clearcoat:1,side:THREE.DoubleSide}),0,0,0,bowl);
  z.bowlFood=sprite(new THREE.CanvasTexture(document.createElement('canvas')),.16,.16);z.bowlFood.position.y=.1;bowl.add(z.bowlFood);}
 // glowing paw pad: step on it to start pet care
 const padMat=glow('#ffb347',1.4);padMat.transparent=true;const P={lx:0,lz:.75,r:.6};z.ppad=P;
 const ring=M(new THREE.RingGeometry(.45,.62,40),padMat,P.lx,.04,P.lz,g,false,false);ring.rotation.x=-Math.PI/2;
 const pin=M(new THREE.CircleGeometry(.45,40),phys('#ffe2b8',{roughness:.3,emissive:'#ffb347',emissiveIntensity:.25}),P.lx,.035,P.lz,g,false,true);pin.rotation.x=-Math.PI/2;
 const pawTex=canvasTex(128,128,(x)=>{x.fillStyle='#ff6fae';x.beginPath();x.ellipse(64,80,26,22,0,0,Math.PI*2);x.fill();for(const [px,py] of [[30,48],[52,30],[76,30],[98,48]]){x.beginPath();x.ellipse(px,py,11,14,0,0,Math.PI*2);x.fill();}});
 const pawM=M(new THREE.PlaneGeometry(.6,.6),new THREE.MeshBasicMaterial({map:pawTex,transparent:true,depthWrite:false}),P.lx,.045,P.lz,g,false,false);pawM.rotation.x=-Math.PI/2;
 const lbl=z.padLbl=sprite(labelTex('🐾 Pet care!',{size:56}),1.7,.42);lbl.position.set(P.lx,1.05,P.lz);g.add(lbl);
 anims.push(t=>{padMat.opacity=.55+.45*Math.sin(t*3);lbl.position.y=1+Math.sin(t*2)*.08;});
 // big bathtub
 {const bg=new THREE.Group();bg.position.set(-3.1,0,-3.3);g.add(bg);const pts=[[0,.15],[.62,.15],[.72,.3],[.76,.7],[.8,.78],[.74,.8]].map(([a,b])=>new THREE.Vector2(a,b));const t=M(new THREE.LatheGeometry(pts,40),phys('#ffffff',{roughness:.12,clearcoat:1,side:THREE.DoubleSide}),0,0,0,bg);t.scale.x=1.5;
  const w=M(new THREE.CircleGeometry(.72,40),phys('#8fd8ff',{roughness:.05,clearcoat:1}),0,.62,0,bg,false,false);w.rotation.x=-Math.PI/2;w.scale.set(1.5,1,1);
  const foam=phys('#ffffff',{roughness:.2,iridescence:1});for(let i=0;i<16;i++){M(sph(.1+(i%3)*.04,12,10),foam,(Math.sin(i*2.1))*.75,.68+(i%2)*.05,Math.cos(i*1.7)*.4,bg,false,false);}
  for(const [fx,fz] of [[-.8,-.4],[.8,-.4],[-.8,.4],[.8,.4]])M(sph(.09,10,8),gold,fx,.08,fz,bg);
  M(cyl(.035,.035,.6,10),gold,-1.05,1,0,bg);M(new THREE.TorusGeometry(.12,.035,8,16,Math.PI),gold,-.93,1.3,0,bg).rotation.x=Math.PI/2;z.ob(-3.1,-3.3,1.2);}
 // food shelf with bowls and a big bone
 {const sg=new THREE.Group();sg.position.set(3.2,0,-3.6);g.add(sg);const wood=std('#e7b98a',{roughness:.7});M(box(2,.9,.7),wood,0,.45,0,sg);
  ['#4fb6ff','#ff6fae','#7ee081'].forEach((c,i)=>{const pts=[[0,0],[.15,0],[.2,.09],[.19,.1]].map(([a,b])=>new THREE.Vector2(a,b));M(new THREE.LatheGeometry(pts,24),phys(c,{roughness:.25,clearcoat:1,side:THREE.DoubleSide}),-.6+i*.6,.9,0,sg);M(cyl(.15,.15,.05,20),std(['#c47a3a','#e8a35a','#8a5a3b'][i],{roughness:.9}),-.6+i*.6,.95,0,sg);});
  const bone=new THREE.Group();bone.position.set(0,1.45,-.1);bone.rotation.z=.15;sg.add(bone);const bm=phys('#fff6e8',{roughness:.5});M(cyl(.07,.07,.7,12),bm,0,0,0,bone).rotation.z=Math.PI/2;for(const sx of [-1,1])for(const sy of [-1,1])M(sph(.1,12,10),bm,sx*.36,sy*.07,0,bone);
  anims.push(t=>{bone.position.y=1.45+Math.sin(t*2)*.06;});z.ob(3.2,-3.6,1.1);}
 // little outfit rack for pets
 {const rg=new THREE.Group();rg.position.set(3.7,0,-.8);rg.rotation.y=-Math.PI/2;g.add(rg);const metal=std('#d9d9e8',{metalness:1,roughness:.2});
  M(cyl(.025,.025,1.6),metal,0,1.25,0,rg).rotation.z=Math.PI/2;for(const s of [-.78,.78]){M(cyl(.025,.025,1.25),metal,s,.62,0,rg);M(box(.05,.03,.45),metal,s,.02,0,rg);}
  ['#ff8fc8','#4fb6ff','#ffd23f','#b388ff','#7ee081'].forEach((c,i)=>{const pts=[];for(let k=0;k<=6;k++){const t=k/6;pts.push(new THREE.Vector2(.05+t*.14,-t*.38));}const d=M(new THREE.LatheGeometry(pts,16),phys(c,{roughness:.8,sheen:1,side:THREE.DoubleSide}),-.6+i*.3,1.2,0,rg);d.scale.z=.5;});
  z.ob(3.7,-.8,.9);}
 // cozy pet bed
 {const bg=new THREE.Group();bg.position.set(-3.5,0,-.3);g.add(bg);M(new THREE.TorusGeometry(.5,.16,12,32),phys('#b388ff',{roughness:.9,sheen:1}),0,.16,0,bg).rotation.x=Math.PI/2;M(cyl(.5,.5,.1,28),phys('#ffd6ea',{roughness:.9,sheen:1}),0,.08,0,bg);z.ob(-3.5,-.3,.65);}
 // paw balloons by the entrance
 for(const sx of [-1,1]){const bg=new THREE.Group();bg.position.set(sx*4.4,0,2.6);g.add(bg);const b=M(sph(.32,20,14),phys(sx<0?'#ffb347':'#ff6fae',{roughness:.15,clearcoat:1}),0,3.9,0,bg,false,false);b.scale.y=1.15;
  const ph=sx;anims.push(t=>{b.position.y=3.9+Math.sin(t*1.3+ph)*.1;});}
 const pl=new THREE.PointLight('#ffd0e8',18,10,2);pl.position.set(0,2.8,-1);g.add(pl);
 signpost(z);}

