/* ===== 🦖 Dino Valley: the dinosaur park across the canal (zone Z.dino, 02-island.js) =====
   An original prehistoric valley (its own name and look): a big meadow of ferns and cycads with tall monkey-puzzle trees, a pond,
   a nest of eggs, a 🦖 T. rex paddock behind a strong timber fence, a 🦖 raptor pen with a wire net, and the 🥚 Dino Keeper's hut
   with a glowing footprint pad where you take care of your own dinosaurs (the barn sheet in 24d-barn.js, for dino:1 animals).
   - This file builds everything inside the valley, in the zone's own directions (+z points back at the island and the gate).
     The land under it, its sandy edge and the footbridge over the canal are in 26y-dino-valley-land.js (they need the canal's BANK).
   - The dinosaurs that live here are in 24n-dino-valley.js; the real-looking models are in 24c9h-dinos.js.
   - DV has where everything is. dvOk/dvSpot are the meadow (the plant-eaters and your own dinosaurs), dvTOk/dvTSpot the T. rex paddock
     and dvROk/dvRSpot the raptor pen: change a number in DV and the scenery and where the dinosaurs walk both follow. */
const DV={fence:16.8,gateA:.2,
  T:{x:6.5,z:-6,r:7.2},// 🦖 the T. rex paddock
  P:{x:-8.5,z:-7.5,r:4.2},// 🦖 the raptor pen
  pond:{x:-7.2,z:1.8,r:2.4},nest:{x:3.6,z:5.2,r:.95},
  hut:{x:-9.2,z:8.6,w:3.2,d:2.4,ry:.75},// the Dino Keeper's hut
  bpad:{lx:-5.9,lz:11.2,r:.7},care:[-4.6,7.8],stand:[-5.4,10.4],out:[-5.6,11.9],// your dinosaurs' care pad, where yours stands, and where you stand
  // tall trees and big rocks the dinosaurs walk round: [x, z, radius]
  trees:[[-13.2,-1.5],[-12.5,4.5],[-3.5,-13.5],[1.2,-9.5],[12.8,4.2],[9.5,9.8],[-1.5,-4.2],[14.8,-4.5],[-14.2,-6.8]],
  rocks:[[3.6,1.3,.9],[-3.2,4.5,.7],[11.5,1.2,.8],[-10.8,-2.6,.6],[0,-14.6,1.1]]};
DV.avoid=[[DV.pond.x,DV.pond.z,DV.pond.r+.3],[DV.nest.x,DV.nest.z,DV.nest.r],[DV.hut.x,DV.hut.z,2.1],...DV.trees.map(([x,z])=>[x,z,.7]),...DV.rocks];
// the meadow: inside the big fence, outside the paddocks, round the pond, the nest, the hut, the trees and rocks
function dvOk(lx,lz,r){if(Math.hypot(lx,lz)>DV.fence-.7-r)return false;
  for(const Q of [DV.T,DV.P])if(Math.hypot(lx-Q.x,lz-Q.z)<Q.r+.6+r)return false;
  for(const [x,z,rr] of DV.avoid)if(Math.hypot(lx-x,lz-z)<rr+r)return false;
  if(Math.abs(lx-DV.bpad.lx)<1.2+r&&Math.abs(lz-DV.bpad.lz)<1.2+r)return false;return true;}
function dvSpot(r){for(let i=0;i<80;i++){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*(DV.fence-1),lx=Math.sin(a)*d,lz=Math.cos(a)*d;if(dvOk(lx,lz,r))return [lx,lz];}return [-1,9];}
// inside a paddock: its middle keeps well clear of the fence so a long tail doesn't poke through
const dvIn=(Q,lx,lz,r,k)=>Math.hypot(lx-Q.x,lz-Q.z)<Q.r-.7-r*k;
function dvTOk(lx,lz,r){return dvIn(DV.T,lx,lz,r,2.5);}
function dvTSpot(r){const Q=DV.T;for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*Q.r,lx=Q.x+Math.sin(a)*d,lz=Q.z+Math.cos(a)*d;if(dvTOk(lx,lz,r))return [lx,lz];}return [Q.x,Q.z];}
function dvROk(lx,lz,r){return dvIn(DV.P,lx,lz,r,1.6);}
function dvRSpot(r){const Q=DV.P;for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*Q.r,lx=Q.x+Math.sin(a)*d,lz=Q.z+Math.cos(a)*d;if(dvROk(lx,lz,r))return [lx,lz];}return [Q.x,Q.z];}

const dvV=(x,y,z)=>new THREE.Vector3(x,y,z);
{const z=Z.dino,g=z.g,F=DV.fence;z.fence=F;
 const B=advBatch(),wood=std('#7a5a3c',{roughness:.9}),woodD=std('#5a4029',{roughness:.95}),stone=std('#8d8678',{roughness:.95}),
   bark=std('#5e4a38',{roughness:1}),moss=std('#3f5a2c',{roughness:1});
 // the ground: a lush meadow with a dirt path in from the gate
 {const tx=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#5f8a3c';x.fillRect(0,0,w,h);for(let i=0;i<3200;i++){const c=Math.random();x.fillStyle=c<.35?'rgba(40,80,30,.45)':c<.7?'rgba(130,170,70,.4)':'rgba(120,95,60,.3)';
   x.save();x.translate(Math.random()*w,Math.random()*h);x.rotate(Math.random()*Math.PI);x.fillRect(0,0,4+Math.random()*6,1.4);x.restore();}},6);
  patch(F+.6,std('#ffffff',{map:tx,roughness:1}),z.x,z.z,.016);
  const dirt=canvasTex(128,128,(x,w,h)=>{x.fillStyle='#a88a62';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=Math.random()<.5?'rgba(90,70,45,.35)':'rgba(205,185,150,.35)';x.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*3,2);}},3);
  const pm=std('#ffffff',{map:dirt,roughness:1});pm.polygonOffset=true;pm.polygonOffsetFactor=-3;pm.polygonOffsetUnits=-3;
  const path=(x0,z0,x1,z1,w)=>{const L=Math.hypot(x1-x0,z1-z0),p=M(new THREE.PlaneGeometry(w,L),pm,(x0+x1)/2,.03,(z0+z1)/2,g,false,true);p.rotation.order='YXZ';p.rotation.y=Math.atan2(x1-x0,z1-z0);p.rotation.x=-Math.PI/2;};
  path(0,F+5,0,4,2.4);path(0,6.5,DV.stand[0],DV.stand[1],1.8);path(0,4,3,-1.5,1.8);path(-.5,4.5,-4.5,-4.5,1.8);}
 // the big wooden fence round the valley, open at the gate (posts, two rails), all merged into a few shapes
 {const N=Math.round(F*2*Math.PI/.85),open=a=>Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<DV.gateA;
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2;if(open(a))continue;const x=Math.sin(a)*F,w=Math.cos(a)*F;B.add(cyl(.08,.09,1.15,7),wood,x,.575,w);z.ob(x,w,.32);
    const a2=(i+1)/N*Math.PI*2;if(open(a2))continue;for(const y of [.5,.95])B.stick(dvV(x,y,w),dvV(Math.sin(a2)*F,y,Math.cos(a2)*F),.045,woodD,5);}}
 // the gate: two mossy stone pillars and a timber beam with the sign
 {const gx=Math.sin(DV.gateA)*F,gz=Math.cos(DV.gateA)*F;
  for(const s of [-1,1]){B.add(box(.9,3.4,.9),stone,s*gx,1.7,gz,0,s*.05,0);B.add(box(1.05,.25,1.05),stone,s*gx,3.45,gz);B.add(sph(.5,8,6),moss,s*gx,.15,gz,0,0,0,1.2,.35,1.2);z.ob(s*gx,gz,.65);}
  B.add(box(2*gx+.8,.38,.42),wood,0,3.15,gz);
  const sign=M(new THREE.PlaneGeometry(4.2,.95),new THREE.MeshBasicMaterial({map:labelTex('🦖 Dino Valley',{size:64,fg:'#2f5a2a',bg:'#f4ead2',border:'#7a5a3c'}),transparent:true}),0,3.95,gz+.02,g,false,false);
  const back=sign.clone();back.rotation.y=Math.PI;back.position.z=gz-.02;g.add(back);
  for(const s of [-1,1])B.stick(dvV(s*1.4,3.35,gz),dvV(s*1.4,3.55,gz),.03,woodD,5);}
 // 🦖 the T. rex paddock: tall timber posts and four heavy rails (you look in from outside), and a sign
 const ring=(Q,h,rails,postR,railR,gap)=>{const N=Math.round(Q.r*2*Math.PI/gap);for(let i=0;i<N;i++){const a=i/N*Math.PI*2,a2=(i+1)/N*Math.PI*2,x=Q.x+Math.sin(a)*Q.r,w=Q.z+Math.cos(a)*Q.r;
   B.add(cyl(postR,postR*1.12,h,7),woodD,x,h/2,w);z.ob(x,w,.36);for(const y of rails)B.stick(dvV(x,y,w),dvV(Q.x+Math.sin(a2)*Q.r,y,Q.z+Math.cos(a2)*Q.r),railR,wood,5);}};
 ring(DV.T,2.5,[.45,1.05,1.65,2.25],.13,.07,.8);
 // 🦖 the raptor pen: posts with a wire net all round
 ring(DV.P,1.9,[.15,1.8],.09,.05,.8);
 {const net=canvasTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(60,60,58,.9)';x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.lineTo(w,h);x.moveTo(w,0);x.lineTo(0,h);x.stroke();});
  net.wrapS=net.wrapT=THREE.RepeatWrapping;net.repeat.set(Math.round(DV.P.r*2*Math.PI/.25),Math.round(1.7/.25));
  const nm=std('#ffffff',{map:net,transparent:true,alphaTest:.3,side:THREE.DoubleSide,roughness:.6,metalness:.4});
  M(new THREE.CylinderGeometry(DV.P.r,DV.P.r,1.7,56,1,true),nm,DV.P.x,1,DV.P.z,g,false,false);}
 const sign=(x,w,ry,text,col)=>{B.add(cyl(.06,.07,1.6,7),woodD,x,.8,w);const p=M(new THREE.PlaneGeometry(1.9,.48),new THREE.MeshBasicMaterial({map:labelTex(text,{size:52,fg:col,bg:'#f4ead2',border:'#7a5a3c'})}),x,1.55,w,g,false,false);p.rotation.y=ry;z.ob(x,w,.2);};
 {const a=Math.atan2(-DV.T.x,-DV.T.z+6),x=DV.T.x+Math.sin(a)*(DV.T.r+.8),w=DV.T.z+Math.cos(a)*(DV.T.r+.8);sign(x,w,a,'🦖 T. rex','#7a2f20');}
 {const a=Math.atan2(-DV.P.x+3,-DV.P.z+4),x=DV.P.x+Math.sin(a)*(DV.P.r+.8),w=DV.P.z+Math.cos(a)*(DV.P.r+.8);sign(x,w,a,'🦖 Raptors','#5a3a1a');}
 // the pond, with stones round it
 {const P=DV.pond;const wm=phys('#3d7f7a',{roughness:.08,clearcoat:1,clearcoatRoughness:.05,transparent:true,opacity:.92});wm.polygonOffset=true;wm.polygonOffsetFactor=-4;wm.polygonOffsetUnits=-4;
  const wtr=M(new THREE.CircleGeometry(P.r,40),wm,P.x,.04,P.z,g,false,true);wtr.rotation.x=-Math.PI/2;wtr.scale.y=.8;
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2,s=.2+((i*7)%5)*.05;B.add(new THREE.DodecahedronGeometry(s,0),stone,P.x+Math.sin(a)*(P.r+.05),s*.4,P.z+Math.cos(a)*(P.r*.8+.05),i,i*2,0,1.3,.7,1.1);}
  for(let i=0;i<7;i++){const a=i*.9+.3;B.add(cyl(.015,.02,.9,5),moss,P.x+Math.sin(a)*(P.r-.3),.45,P.z+Math.cos(a)*(P.r*.8-.25),.1*Math.sin(i),0,.1*Math.cos(i));}}// reeds
 // a nest with four eggs
 {const N=DV.nest,ng=new THREE.Group();ng.position.set(N.x,0,N.z);g.add(ng);
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2,r=.62+((i*5)%3)*.06;B.add(cyl(.025,.025,.7,5),woodD,N.x+Math.sin(a)*r,.12+(i%3)*.05,N.z+Math.cos(a)*r,Math.PI/2,a+Math.PI/2+.25,0,1,1,1,'YXZ');}
  B.add(sph(.72,14,8),std('#8a6e48',{roughness:1}),N.x,.02,N.z,0,0,0,1,.18,1);
  const egg=phys('#efe6d2',{roughness:.5,clearcoat:.2,map:canvasTex(64,64,(x,w,h)=>{x.fillStyle='#efe6d2';x.fillRect(0,0,w,h);for(let i=0;i<80;i++){x.fillStyle='rgba(120,90,60,.45)';x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*2,0,7);x.fill();}})});
  for(const [x,w,a] of [[-.18,-.1,.3],[.16,-.14,-.4],[0,.18,.1],[.24,.16,.7]]){const e=M(sph(.15,14,10),egg,x,.2,w,ng);e.scale.set(1,1.35,1);e.rotation.set(a,0,a*.6);}
  z.ob(N.x,N.z,N.r);}
 // 🥚 the Dino Keeper's hut: log walls, a leafy roof, a door and a window
 {const H=DV.hut,hg=new THREE.Group();hg.position.set(H.x,0,H.z);hg.rotation.y=H.ry;g.add(hg);const HB=advBatch();
  for(let i=0;i<9;i++){const y=.14+i*.26;for(const s of [-1,1]){HB.add(cyl(.13,.13,H.w+.3,8),wood,0,y,s*H.d/2,0,0,Math.PI/2);HB.add(cyl(.13,.13,H.d+.3,8),wood,s*H.w/2,y+.13,0,Math.PI/2,0,0);}}
  const roof=std('#5d6b34',{roughness:1});for(const s of [-1,1])HB.add(box(H.w+.9,.18,H.d*.72),roof,0,2.75,s*H.d*.32,s*.55,0,0);
  HB.add(box(.35,.35,H.d+.5),roof,0,3.08,0);
  HB.done(hg);
  M(box(.9,1.6,.06),std('#3b2a1c',{roughness:.9}),-.6,.8,H.d/2+.13,hg);M(box(.7,.55,.06),phys('#bfe3ff',{roughness:.1,clearcoat:1}),.75,1.35,H.d/2+.13,hg,false,false);
  const lt=M(new THREE.PlaneGeometry(2.2,.5),new THREE.MeshBasicMaterial({map:labelTex('🥚 Dino Keeper',{size:52,fg:'#2f5a2a',bg:'#f4ead2',border:'#7a5a3c'})}),0,2.25,H.d/2+.2,hg,false,false);
  for(const [x,w] of [[-1,0],[1,0],[0,-.7],[0,.7]])z.ob(H.x+Math.cos(H.ry)*x*1.2+Math.sin(H.ry)*w,H.z-Math.sin(H.ry)*x*1.2+Math.cos(H.ry)*w,1.1);}
 // the glowing footprint pad: step on it to take care of your dinosaurs (24d-barn.js opens the sheet)
 {const P=DV.bpad;z.bpad=P;const padMat=glow('#9be36b',1.4);padMat.transparent=true;
  const rg=M(new THREE.RingGeometry(.5,.68,40),padMat,P.lx,.05,P.lz,g,false,false);rg.rotation.x=-Math.PI/2;
  const pin=M(new THREE.CircleGeometry(.5,40),phys('#e3f5cf',{roughness:.3,emissive:'#7cc75a',emissiveIntensity:.25}),P.lx,.045,P.lz,g,false,true);pin.rotation.x=-Math.PI/2;
  const foot=canvasTex(128,128,x=>{x.fillStyle='#3f6a2a';x.beginPath();x.ellipse(64,80,18,22,0,0,7);x.fill();
    for(const a of [-.5,0,.5]){x.save();x.translate(64,70);x.rotate(a);x.beginPath();x.ellipse(0,-34,8,22,0,0,7);x.fill();x.restore();}});
  const fp=M(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:foot,transparent:true,depthWrite:false}),P.lx,.055,P.lz,g,false,false);fp.rotation.x=-Math.PI/2;
  const lbl=z.padLbl=sprite(labelTex('🦖 Your dinosaurs!',{size:52}),1.9,.44);lbl.position.set(P.lx,1.05,P.lz);g.add(lbl);
  anims.push(t=>{padMat.opacity=.55+.45*Math.sin(t*3);lbl.position.y=1+Math.sin(t*2)*.08;});}
 // tall monkey-puzzle trees (an ancient kind of conifer dinosaurs really ate): a bare trunk and tiers of dark spiky branches
 {const ndl=std('#2f4a26',{roughness:.95}),ndl2=std('#3b5a2c',{roughness:.95});
  DV.trees.forEach(([x,w],i)=>{const h=7+((i*37)%5)*.8;B.add(cyl(.14,.3,h,8),bark,x,h/2,w);z.ob(x,w,.45);
    for(let k=0;k<5;k++){const y=h*.55+k*(h*.45/5),r=1.9-k*.33;B.add(new THREE.ConeGeometry(r,.75,9,1,true),k%2?ndl:ndl2,x,y,w,0,i+k,0);B.add(new THREE.CylinderGeometry(r*.2,r,.18,9),k%2?ndl2:ndl,x,y-.38,w,0,i,0);}
    B.add(new THREE.ConeGeometry(.5,1,8),ndl,x,h+.35,w);});}
 // big mossy boulders
 for(const [x,w,r] of DV.rocks){B.add(new THREE.DodecahedronGeometry(r,1),stone,x,r*.45,w,x,w,0,1.15,.75,1);B.add(sph(r*.75,10,6),moss,x,r*.75,w,0,0,0,1.1,.3,1);z.ob(x,w,r*.9);}
 B.done(g);
 /* ---------- ferns and cycads everywhere (one instanced shape each, so they cost almost nothing) ---------- */
 {// one fern frond: a curved strip with a picture of leaflets (see-through between them)
  const ft=canvasTex(64,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#4f7a2c';x.lineWidth=3;x.beginPath();x.moveTo(w/2,h);x.lineTo(w/2,4);x.stroke();
    for(let y=12;y<h-6;y+=9){const L=(w/2-3)*Math.sin(Math.PI*(1-y/h))*.95+4;x.fillStyle=y%18?'#5f8f36':'#4f7f2e';
      for(const s of [-1,1]){x.beginPath();x.moveTo(w/2,y+4);x.quadraticCurveTo(w/2+s*L*.6,y-3,w/2+s*L,y-6);x.quadraticCurveTo(w/2+s*L*.5,y+3,w/2,y+7);x.fill();}}});
  const fm2=std('#ffffff',{map:ft,alphaTest:.45,side:THREE.DoubleSide,roughness:.9});
  const frond=(len,droop)=>{const p=new THREE.PlaneGeometry(.42,len,1,8);p.translate(0,len/2,0);const a=p.attributes.position;
    for(let i=0;i<a.count;i++){const y=a.getY(i),q=y/len;a.setY(i,Math.sin(q*1.2)*len*.75-droop*q*q*len);a.setZ(i,(1-Math.cos(q*1.2))*len*.8);}p.computeVertexNormals();return p;};
  const plant=(n,len,droop,tilt)=>{const parts=[];for(let i=0;i<n;i++){const f=frond(len,droop);f.rotateX(tilt);f.rotateY(i/n*Math.PI*2+i*.3);parts.push(f);}const m=mergeGeometries(parts);parts.forEach(p=>p.dispose());return m;};
  const fern=plant(7,1.1,.25,-.35),cyc=plant(9,1.3,.1,-.6);
  const spots=[];for(let i=0;i<260&&spots.length<120;i++){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*(F+3.5),lx=Math.sin(a)*d,lw=Math.cos(a)*d;
    if(Math.abs(lx)<1.6&&lw>3)continue;// keep the path from the gate clear
    if(Math.hypot(lx-DV.bpad.lx,lw-DV.bpad.lz)<2||Math.hypot(lx-DV.hut.x,lw-DV.hut.z)<2.4||Math.hypot(lx-DV.pond.x,lw-DV.pond.z)<DV.pond.r+.2||Math.hypot(lx-DV.nest.x,lw-DV.nest.z)<1.2)continue;
    if(Math.abs(Math.hypot(lx,lw)-F)<.5)continue;spots.push([lx,lw,.6+Math.random()*.7,Math.random()*6]);}
  const put=(geo,list,par)=>{const im=new THREE.InstancedMesh(geo,fm2,list.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3();
    list.forEach(([x,w,k,ry],i)=>{m4.compose(new THREE.Vector3(x,0,w),q.setFromAxisAngle(new THREE.Vector3(0,1,0),ry),s.set(k,k,k));im.setMatrixAt(i,m4);});im.castShadow=false;im.receiveShadow=true;par.add(im);return im;};
  put(fern,spots.slice(0,LITE?60:90),g);
  // cycads: a short scaly trunk with a crown of stiff fronds
  const cy=[[-2.4,9.8],[2.6,10.4],[6.2,4.6],[-11.8,1.2],[-5.2,-1.8],[10.8,-12.2],[-13.6,10.2],[13.2,8.2],[-.8,13.6]];
  const CB=advBatch(),trunk=std('#6b5a3e',{roughness:1,map:canvasTex(32,64,(x,w,h)=>{x.fillStyle='#6b5a3e';x.fillRect(0,0,w,h);x.strokeStyle='#4a3c28';x.lineWidth=2;for(let y=0;y<h;y+=8)for(let i=0;i<w;i+=8){x.strokeRect(i+(y%16?4:0),y,8,8);}})});
  for(const [x,w] of cy){CB.add(cyl(.22,.28,.9,9),trunk,x,.45,w);z.ob(x,w,.4);}CB.done(g);
  {const cg=new THREE.Group();cg.position.y=.85;g.add(cg);put(cyc,cy.map(([x,w],i)=>[x,w,.9+(i%3)*.15,i]),cg);}}
 signpost(z);}
