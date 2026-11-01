/* ===== 💈 Barber Shop and 👔 Clothing Store: two little shops out past the Spring Garden and the Runway ===== */
// A small shop building: walls with a doorway in the front (+z faces the middle of the island), a roof that doesn't
// block the sun, a sign over the door and a striped awning. Returns the materials so the inside can match.
function smallShop(z,{W,B,F,H,wall,trim,roof,floor,sign,signFg,stripe}){const g=z.g;z.box={W,B,F,H};
  const wallM=phys(wall,{roughness:.6,clearcoat:.15}),trimM=std(trim,{roughness:.4,metalness:.3}),white=phys('#ffffff',{roughness:.3,clearcoat:.6});
  const fl=M(new THREE.PlaneGeometry(W*2,F-B),phys('#ffffff',{map:floor,roughness:.3,clearcoat:.5}),0,.02,(B+F)/2,g,false,true);fl.rotation.x=-Math.PI/2;fl.material.polygonOffset=true;fl.material.polygonOffsetFactor=-2;
  const D=1.25;// half the doorway
  M(box(W*2+.3,H,.3),wallM,0,H/2,B,g);for(let x=-W;x<=W+.01;x+=.95)z.ob(x,B,.5);
  for(const sx of [-1,1]){M(box(.3,H,F-B),wallM,sx*W,H/2,(B+F)/2,g);for(let k=B;k<=F+.01;k+=.95)z.ob(sx*W,k,.5);
    M(box(W-D,H,.3),wallM,sx*(D+(W-D)/2),H/2,F,g);for(let x=D+.45;x<=W;x+=.9)z.ob(sx*x,F,.5);z.ob(sx*(D+.1),F,.3);
    M(box(.32,H,.36),trimM,sx*D,H/2,F,g);
    // a shop window on each side of the door
    M(new THREE.PlaneGeometry(1.5,1.4),glow('#fff1c4',1.0),sx*(D+(W-D)/2),1.7,F+.16,g,false,false);M(box(1.66,1.56,.06),white,sx*(D+(W-D)/2),1.7,F+.14,g);}
  M(box(D*2,H-2.6,.3),wallM,0,2.6+(H-2.6)/2,F,g);
  M(box(W*2+.4,.16,.4),trimM,0,H+.02,F,g);
  M(box(W*2+.6,.26,F-B+.6),phys(roof,{roughness:.5,clearcoat:.4}),0,H+.17,(B+F)/2,g,false,true);
  M(new THREE.PlaneGeometry(Math.min(W*2-.6,4.4),1),new THREE.MeshBasicMaterial({map:labelTex(sign,{size:58,fg:signFg,border:trim}),transparent:true}),0,H-.55,F+.17,g,false,false);
  // striped awning over the windows and the door
  const st=canvasTex(128,32,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=stripe[i%2];x.fillRect(i*16,0,16,h);}});st.wrapS=THREE.RepeatWrapping;st.repeat.set(W*1.2,1);
  const aw=M(new THREE.PlaneGeometry(W*2,.9),phys('#ffffff',{map:st,roughness:.8,side:THREE.DoubleSide}),0,2.75,F+.45,g);aw.rotation.x=-.9;
  const scal=canvasTex(128,32,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=stripe[i%2];x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16+16,0);x.lineTo(i*16+8,h);x.fill();}});scal.wrapS=THREE.RepeatWrapping;scal.repeat.set(W*1.2,1);
  M(new THREE.PlaneGeometry(W*2,.22),new THREE.MeshStandardMaterial({map:scal,transparent:true,side:THREE.DoubleSide,roughness:.8}),0,2.34,F+.74,g,false,false);
  return {wallM,trimM,white};}
// a glowing pad on the floor that opens something when you step on it
function floorPad(z,lx,lz,color,emoji,label){const g=z.g,m=glow(color,1.4);m.transparent=true;
  M(new THREE.RingGeometry(.42,.6,40),m,lx,.04,lz,g,false,false).rotation.x=-Math.PI/2;
  const t=canvasTex(128,128,(x)=>{x.font='88px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(emoji,64,70);});
  M(new THREE.PlaneGeometry(.6,.6),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),lx,.045,lz,g,false,false).rotation.x=-Math.PI/2;
  const lbl=sprite(labelTex(label,{size:52}),1.9,.47);lbl.position.set(lx,1.05,lz);g.add(lbl);
  const ph=Math.random()*6;anims.push(t=>{m.opacity=.55+.45*Math.sin(t*3+ph);lbl.position.y=1+Math.sin(t*2+ph)*.08;});
  return {lx,lz,r:.6,lbl};}

/* ---------- 💈 Barber Shop ---------- */
{const z=Z.barber,g=z.g;const W=4.4,B=-3.8,F=3.8,H=3.7;
 const chk=canvasTex(128,128,(x)=>{x.fillStyle='#f4f4f4';x.fillRect(0,0,128,128);x.fillStyle='#222831';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);},5);
 const {white,trimM}=smallShop(z,{W,B,F,H,wall:'#cfe3ff',trim:'#2f4a7a',roof:'#2f4a7a',floor:chk,sign:'💈 Barber Shop',signFg:'#2f4a7a',stripe:['#d62839','#ffffff']});
 const chrome=std('#e6e9ef',{metalness:1,roughness:.15}),leather=phys('#b3121f',{roughness:.35,clearcoat:.6}),dark=std('#22252b',{roughness:.5});
 // the spinning barber pole by the door: red, white and blue stripes that look like they climb up
 {const tex=canvasTex(128,256,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);const cols=['#d62839','#ffffff','#1f4fb3','#ffffff'];x.lineWidth=34;
    for(let i=-8;i<16;i++){x.strokeStyle=cols[((i%4)+4)%4];x.beginPath();x.moveTo(0,i*32);x.lineTo(w,i*32+w*.9);x.stroke();}});tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  const pg=new THREE.Group();pg.position.set(-1.8,0,F+.55);g.add(pg);
  M(cyl(.06,.08,1,12),chrome,0,.5,0,pg);M(cyl(.2,.22,.1,24),chrome,0,1.03,0,pg);
  const pole=M(cyl(.15,.15,1.2,32,1),phys('#ffffff',{map:tex,roughness:.25,clearcoat:1,emissive:'#ffffff',emissiveMap:tex,emissiveIntensity:.25}),0,1.7,0,pg);
  M(cyl(.18,.18,1.24,32,1,true),phys('#ffffff',{transparent:true,opacity:.16,roughness:0,clearcoat:1,side:THREE.DoubleSide}),0,1.7,0,pg,false,false);
  M(cyl(.2,.2,.1,24),chrome,0,2.35,0,pg);M(sph(.18,20,12,0,Math.PI*2,0,Math.PI/2),chrome,0,2.4,0,pg);M(sph(.05,12,8),glow('#fff1c4',1.6),0,2.62,0,pg,false,false);
  anims.push((t,dt)=>{tex.offset.y=-t*.35;});z.ob(-1.8,F+.55,.3);z.pole=pole;}
 // three barber stations along the back wall: a mirror, a shelf with tools and a big red chair. The middle one is yours.
 z.chairs=[];
 for(const lx of [-2.6,0,2.6]){const mi=M(new THREE.PlaneGeometry(1.3,1.25),phys('#dfe9f5',{metalness:1,roughness:.04,envMapIntensity:1.4}),lx,1.85,B+.17,g,false,false);M(box(1.44,1.39,.06),dark,lx,1.85,B+.14,g);
   M(box(1.5,.06,.4),white,lx,1.05,B+.35,g);M(box(1.5,.9,.36),phys('#2f4a7a',{roughness:.5,clearcoat:.3}),lx,.5,B+.33,g);for(const k of [-.5,.5])z.ob(lx+k,B+.35,.45);
   // a blue jar of combs, a spray bottle and the clippers
   M(cyl(.07,.07,.2,16),phys('#2ab7ff',{transmission:.6,transparent:true,opacity:.7,roughness:.05}),lx-.45,1.18,B+.32,g);for(let i=0;i<3;i++){const c=M(box(.012,.22,.05),dark,lx-.47+i*.02,1.22,B+.32,g);c.rotation.z=(i-1)*.2;}
   M(cyl(.045,.05,.18,12),phys('#ffffff',{roughness:.3,clearcoat:.8}),lx+.42,1.17,B+.34,g);M(box(.04,.06,.05),dark,lx+.42,1.29,B+.34,g);
   const cl=M(new RoundedBoxGeometry(.07,.16,.05,2,.015),phys('#1d1d22',{roughness:.3,clearcoat:.8}),lx+.15,1.1,B+.36,g);cl.rotation.z=1.3;
   const cg=new THREE.Group();cg.position.set(lx,0,B+1.75);g.add(cg);z.chairs.push(cg);
   M(cyl(.26,.3,.06,24),chrome,0,.03,0,cg);M(cyl(.07,.09,.36,12),chrome,0,.24,0,cg);
   M(new RoundedBoxGeometry(.62,.14,.58,3,.05),leather,0,.46,0,cg);
   const bk=M(new RoundedBoxGeometry(.58,.72,.12,3,.05),leather,0,.86,.29,cg);bk.rotation.x=-.12;const hr=M(new RoundedBoxGeometry(.32,.16,.1,3,.04),leather,0,1.34,.36,cg);cg.userData.back=[bk,hr];
   for(const s of [-1,1]){M(new RoundedBoxGeometry(.08,.08,.5,2,.03),leather,s*.33,.66,.02,cg);M(cyl(.02,.02,.2,8),chrome,s*.33,.56,.02,cg);}
   const fr=M(box(.42,.03,.16),chrome,0,.2,-.42,cg);M(cyl(.015,.015,.22,8),chrome,0,.26,-.32,cg).rotation.x=.9;
   z.ob(lx,B+1.75,.45);}
 z.seat=[0,B+1.75];
 // a waiting bench, a magazine table and a plant
 {const wood=std('#9a6a43',{roughness:.7});const bg=new THREE.Group();bg.position.set(-W+.45,0,1.6);bg.rotation.y=Math.PI/2;g.add(bg);
  M(box(1.9,.1,.45),leather,0,.45,0,bg);M(box(1.9,.5,.08),leather,0,.75,-.22,bg);for(const x of [-.85,.85])M(box(.06,.42,.4),chrome,x,.21,0,bg);for(let k=0;k<3;k++)z.ob(-W+.45,.85+k*.75,.4);
  M(cyl(.3,.3,.04,20),wood,-W+.5,.5,-.05,g);M(cyl(.03,.03,.5,8),chrome,-W+.5,.25,-.05,g);z.ob(-W+.5,-.05,.35);
  ['#ff6fae','#4fb6ff','#ffd23f'].forEach((c,i)=>{const mg=M(box(.18,.01,.24),std(c),-W+.45+i*.06,.53+i*.01,-.05+i*.03,g);mg.rotation.y=i*.4;});
  M(cyl(.22,.17,.42,16),white,W-.45,.21,2.8,g);for(let k=0;k<5;k++){const b=M(new THREE.IcosahedronGeometry(.2,1),phys('#4fa645',{roughness:.8}),W-.45+Math.sin(k*1.3)*.1,.55+k*.12,2.8+Math.cos(k*1.3)*.1,g);}z.ob(W-.45,2.8,.3);
  const ws=M(new THREE.PlaneGeometry(1.4,.36),new THREE.MeshBasicMaterial({map:labelTex('Waiting area',{size:56,fg:'#2f4a7a'}),transparent:true}),-W+.17,1.9,1.6,g,false,false);ws.rotation.y=Math.PI/2;}
 // a few hair clippings on the floor by your chair
 for(let i=0;i<9;i++){const c=M(new THREE.CircleGeometry(.05+Math.random()*.05,6),std('#3a2618',{roughness:1}),(Math.random()-.5)*1.1,.03,B+1.75+(Math.random()-.5)*1.1,g,false,false);c.rotation.x=-Math.PI/2;c.scale.y=.5;}
 // step on the pad in front of your chair
 z.bpad=floorPad(z,0,B+2.75,'#4fb6ff','✂️','💈 Barber chair');
 signpost(z);}

/* ---------- 👔 Clothing Store ---------- */
{const z=Z.store,g=z.g;const W=4.8,B=-4,F=4,H=3.8;
 const woodT=canvasTex(256,256,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=`hsl(30,${30+Math.random()*10}%,${52+Math.random()*10}%)`;x.fillRect(0,i*32,w,32);x.fillStyle='rgba(60,30,10,.25)';x.fillRect(0,i*32,w,2);x.fillRect(Math.random()*w,i*32,2,32);}},4);
 const {white}=smallShop(z,{W,B,F,H,wall:'#efe6d6',trim:'#3b2f2a',roof:'#3b2f2a',floor:woodT,sign:'👔 Clothing Store',signFg:'#3b2f2a',stripe:['#1f2a44','#efe6d6']});
 const metal=std('#d9d9e8',{metalness:1,roughness:.2}),wood=std('#7a5236',{roughness:.6}),dark=std('#2b2b33',{roughness:.5});
 // clothing racks with shirts on hangers
 const rack=(lx,lz,rot,cols)=>{const rg=new THREE.Group();rg.position.set(lx,0,lz);rg.rotation.y=rot;g.add(rg);M(cyl(.025,.025,1.8,10),metal,0,1.55,0,rg).rotation.z=Math.PI/2;for(const s of [-.85,.85])M(cyl(.025,.03,1.55,8),metal,s,.78,0,rg);
   cols.forEach((c,i)=>{const x=-.7+i*1.4/(cols.length-1);M(new THREE.TorusGeometry(.04,.006,6,12,Math.PI),metal,x,1.58,0,rg).rotation.y=Math.PI/2;const sh=M(new RoundedBoxGeometry(.06,.6,.42,2,.03),phys(c,{roughness:.8,sheen:.6}),x,1.22,0,rg);
     M(new RoundedBoxGeometry(.05,.4,.1,2,.02),phys(c,{roughness:.8}),x,1.32,.24,rg).rotation.x=.15;M(new RoundedBoxGeometry(.05,.4,.1,2,.02),phys(c,{roughness:.8}),x,1.32,-.24,rg).rotation.x=-.15;});
   for(const s of [-.8,0,.8]){const [wx,wz]=[lx+Math.cos(rot)*s,lz-Math.sin(rot)*s];z.ob(wx,wz,.4);}};
 rack(-3,1.2,0,['#d62839','#2d2d3a','#4fb6ff','#2e9e4f','#c0392b','#ffffff']);rack(-3,-1.2,0,['#1f2a44','#6b7a3f','#c8b28a','#ff8a1f','#8a8f99','#2fa3d6']);
 // shelves of folded jeans and tees on the back wall
 {const sg=new THREE.Group();sg.position.set(-2.4,0,B+.3);g.add(sg);for(let r=0;r<3;r++){M(box(2.6,.05,.4),wood,0,.6+r*.65,0,sg);
    for(let i=0;i<5;i++)for(let k=0;k<2;k++)M(new RoundedBoxGeometry(.38,.08,.3,2,.02),phys(['#3a5bd9','#6f9be0','#2d2d3a','#c8b28a','#ffffff','#d62839','#4fb6ff'][(i+r*2+k)%7],{roughness:.85}),-1.05+i*.52,.67+r*.65+k*.085,0,sg);}
  for(const s of [-1.3,1.3])M(box(.05,2.1,.4),wood,s,1.05,0,sg);for(let k=0;k<3;k++)z.ob(-3.4+k*1,B+.3,.4);}
 // the glasses counter: a glass case with sunglasses on little stands, and the cash register
 {const cg=new THREE.Group();cg.position.set(2.6,0,1.9);g.add(cg);M(box(2.4,.85,.7),wood,0,.43,0,cg);M(box(2.44,.05,.74),dark,0,.88,0,cg);
  M(box(2.3,.3,.6),phys('#ffffff',{transmission:.9,transparent:true,opacity:.25,roughness:0,thickness:.1}),0,1.06,0,cg,false,false);
  ['#d4af37','#ff3b6b','#2d2d3a','#8a5a3b','#4fb6ff'].forEach((c,i)=>{const x=-.9+i*.45,fm=std(c,{metalness:.6,roughness:.25});for(const s of [-1,1]){M(new THREE.TorusGeometry(.05,.008,8,20),fm,x+s*.058,.98,.05,cg);
    M(new THREE.CircleGeometry(.05,16),phys('#22252b',{roughness:.05,clearcoat:1,transparent:true,opacity:.8}),x+s*.058,.98,.052,cg,false,false);}M(box(.03,.008,.008),fm,x,.99,.05,cg);M(box(.01,.06,.01),metal,x,.93,.0,cg);});
  const reg=new THREE.Group();reg.position.set(.75,.91,-.12);cg.add(reg);M(new RoundedBoxGeometry(.4,.18,.32,2,.03),dark,0,.09,0,reg);const scr=M(new RoundedBoxGeometry(.3,.18,.04,2,.02),dark,0,.28,.06,reg);scr.rotation.x=-.4;
  M(new THREE.PlaneGeometry(.25,.13),glow('#7ee081',1.2),0,.285,.085,reg,false,false).rotation.x=-.4;
  const gl=sprite(labelTex('🕶️ Glasses',{size:56,fg:'#3b2f2a'}),1.5,.37);gl.position.set(-.3,1.55,0);cg.add(gl);
  for(let k=0;k<4;k++)z.ob(2.6-1.05+k*.7,1.9,.45);}
 z.clerk=[2.6,1.1];
 // a tall mirror on the back wall, and the pad in front of it where you try things on
 {M(new THREE.PlaneGeometry(1.1,2.1),phys('#dfe9f5',{metalness:1,roughness:.04,envMapIntensity:1.4}),2.2,1.3,B+.17,g,false,false);M(box(1.24,2.24,.06),wood,2.2,1.3,B+.14,g);
  M(new THREE.PlaneGeometry(1.4,.36),new THREE.MeshBasicMaterial({map:labelTex('Try it on!',{size:56,fg:'#3b2f2a'}),transparent:true}),2.2,2.7,B+.18,g,false,false);}
 z.spad=floorPad(z,2.2,B+1.5,'#ffd23f','👔','👔 Try on & buy');
 // two mannequin spots by the windows (the mannequins themselves are made when you walk in, see 24d)
 z.manq=[[-1.9,F-1],[1.9,F-1.1]];for(const [lx,lz] of z.manq){M(cyl(.35,.38,.12,24),white,lx,.06,lz,g);z.ob(lx,lz,.4);}
 for(const [lx,lz] of [[W-.45,-1.2],[-W+.45,3.2]]){M(cyl(.22,.17,.42,16),white,lx,.21,lz,g);for(let k=0;k<5;k++)M(new THREE.IcosahedronGeometry(.2,1),phys('#4fa645',{roughness:.8}),lx+Math.sin(k*1.3)*.1,.55+k*.12,lz+Math.cos(k*1.3)*.1,g);z.ob(lx,lz,.3);}
 signpost(z);}
