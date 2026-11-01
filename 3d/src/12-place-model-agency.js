/* ===== Star Model Agency: a building you walk into, with a dressing room and a contest runway ===== */
{const z=Z.agency,g=z.g;const W=6,B=-5,F=5,H=4.2;z.box={W,B,F,H};
 const wallM=phys('#d6c2ff',{roughness:.55,clearcoat:.2}),trim=std('#e8c25a',{metalness:1,roughness:.25}),white=phys('#ffffff',{roughness:.3,clearcoat:.6}),plum=phys('#3b2357',{roughness:.4,clearcoat:.5}),velvet=phys('#ff6fae',{roughness:.9,sheen:1,sheenColor:new THREE.Color('#ffd6ea')});
 // shiny floor with a pink and white check
 const chk=canvasTex(128,128,(x)=>{x.fillStyle='#fff6fb';x.fillRect(0,0,128,128);x.fillStyle='#f6dbea';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);},6);
 const fl=M(new THREE.PlaneGeometry(W*2,F-B),phys('#ffffff',{map:chk,roughness:.18,clearcoat:.8}),0,.02,(B+F)/2,g,false,true);fl.rotation.x=-Math.PI/2;fl.material.polygonOffset=true;fl.material.polygonOffsetFactor=-2;
 // walls (the front has a wide doorway in the middle)
 M(box(W*2+.3,H,.3),wallM,0,H/2,B,g);for(let i=-6;i<=6;i++)z.ob(i*.98,B,.55);
 for(const sx of [-1,1]){M(box(.3,H,F-B),wallM,sx*W,H/2,(B+F)/2,g);for(let k=0;k<=10;k++)z.ob(sx*W,B+k*1,.55);
   M(box(W-1.7,H,.3),wallM,sx*(1.7+(W-1.7)/2),H/2,F,g);for(let k=0;k<5;k++)z.ob(sx*(2.15+k*.95),F,.55);z.ob(sx*1.8,F,.3);
   M(box(.32,H,.36),trim,sx*1.7,H/2,F,g);
   const win=M(new THREE.PlaneGeometry(1.4,1.6),glow('#fff1c4',1.05),sx*3.9,2.2,F+.16,g,false,false);M(box(1.56,1.76,.06),white,sx*3.9,2.2,F+.14,g);
   for(const k of [-1,1])M(new THREE.SphereGeometry(.3,14,10,0,Math.PI*2,0,Math.PI/2),phys('#9b7bff',{roughness:.5}),sx*3.9+k*.5,3.1,F+.3,g,false,false).scale.set(1,.5,1);}
 M(box(3.4,H-3.1,.3),wallM,0,3.1+(H-3.1)/2,F,g);
 M(box(W*2+.4,.18,.42),trim,0,H+.02,F,g);M(box(W*2+.4,.18,F-B+.4),trim,0,H+.02,(B+F)/2,g).visible=false;
 // roof: does not block the sun, so it stays bright inside
 const roof=M(box(W*2+.7,.28,F-B+.7),phys('#b388ff',{roughness:.45,clearcoat:.5}),0,H+.2,(B+F)/2,g,false,true);
 const sign=M(new THREE.PlaneGeometry(4.6,1.15),new THREE.MeshBasicMaterial({map:labelTex('⭐ Star Model Agency',{size:56,fg:'#8e3fd6',border:'#e8c25a'}),transparent:true}),0,3.62,F+.17,g,false,false);
 // a giant gold star turning on the roof
 {const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?.12:.28;i?sh.lineTo(Math.sin(a)*r,Math.cos(a)*r):sh.moveTo(0,r);}const sgeo=new THREE.ExtrudeGeometry(sh,{depth:.06,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:2});sgeo.center();
  const st=M(sgeo,std('#ffd23f',{metalness:.9,roughness:.15,emissive:'#ffaa00',emissiveIntensity:.6}),0,H+1.6,0,g);st.scale.setScalar(5);anims.push(t=>{st.rotation.y=t*.6;st.position.y=H+1.6+Math.sin(t*1.4)*.1;});}
 // red carpet out the door
 const rc=M(new THREE.PlaneGeometry(2.4,2.4),phys('#e0263b',{roughness:.9,sheen:1}),0,.03,F+1.2,g,false,true);rc.rotation.x=-Math.PI/2;rc.material.polygonOffset=true;rc.material.polygonOffsetFactor=-3;
 for(const sx of [-1,1]){for(const zz of [F+.4,F+2.2]){M(cyl(.05,.07,.9,10),trim,sx*1.4,.45,zz,g);M(sph(.08,12,8),trim,sx*1.4,.95,zz,g);z.ob(sx*1.4,zz,.15);}const rope=M(new THREE.TorusGeometry(.9,.03,8,24,Math.PI),phys('#e0263b',{roughness:.6}),sx*1.4,.88,F+1.3,g);rope.rotation.set(0,Math.PI/2,Math.PI);rope.scale.y=.25;}
 // the contest runway down the middle
 const RW={w:.85,z0:-4.55,z1:1.9,h:.3};z.rw=RW;
 M(box(RW.w*2,RW.h,RW.z1-RW.z0),white,0,RW.h/2,(RW.z0+RW.z1)/2,g);
 M(box(RW.w*2-.24,.02,RW.z1-RW.z0-.15),velvet,0,RW.h+.01,(RW.z0+RW.z1)/2,g,false,true);
 const dots=[];for(const s of [-1,1])for(let k=0;k<11;k++)dots.push(M(sph(.05,8,6),glow('#ffffff',2),s*(RW.w-.04),RW.h+.03,RW.z0+.35+k*.58,g,false,false));
 anims.push(t=>{if(curZone!==z)return;dots.forEach((b,i)=>b.scale.setScalar(.7+.5*Math.max(0,Math.sin(t*6-i*.5))));});
 // backdrop and curtain where the models come out
 M(box(4.2,3.5,.12),plum,0,1.75,B+.22,g);
 M(new THREE.PlaneGeometry(3.4,.85),new THREE.MeshBasicMaterial({map:labelTex('STAR MODEL',{bg:null,fg:'#ffffff',size:92}),transparent:true,toneMapped:false}),0,3.05,B+.3,g,false,false);
 {const cg=new THREE.PlaneGeometry(2.3,2.3,48,1);const pp=cg.attributes.position;for(let i=0;i<pp.count;i++)pp.setZ(i,Math.sin(pp.getX(i)*16)*.035);cg.computeVertexNormals();
  const cm=phys('#c2185b',{roughness:.85,sheen:1,sheenColor:new THREE.Color('#ff9ccc'),side:THREE.DoubleSide});M(cg,cm,0,1.15+RW.h,B+.36,g);
  const arch=M(new THREE.TorusGeometry(1.2,.07,10,40,Math.PI),glow('#ffd23f',1.6),0,RW.h+1.2,B+.34,g,false,false);arch.scale.y=1.15;}
 // spotlights over the runway end
 for(const s of [-1,1]){const head=M(cyl(.14,.22,.38,16),std('#222',{metalness:.8,roughness:.3}),s*1.6,H-.25,.8,g);head.rotation.z=s*.7;
   const beam=M(new THREE.ConeGeometry(.9,3.6,24,1,true),new THREE.MeshBasicMaterial({color:'#ffe6f5',transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}),s*.8,2.2,.8,g,false,false);beam.rotation.z=-s*.42;}
 // photographers' cameras on tripods at the end of the runway
 z.flashes=[];for(const s of [-1,1]){const tg=new THREE.Group();tg.position.set(s*2.05,0,3.3);tg.rotation.y=s*.5+Math.PI;g.add(tg);for(let k=0;k<3;k++){const l=M(cyl(.015,.015,1.3,6),std('#333',{metalness:.6,roughness:.4}),Math.sin(k*2.1)*.16,.62,Math.cos(k*2.1)*.16,tg);l.rotation.set(Math.cos(k*2.1)*.25,0,-Math.sin(k*2.1)*.25);}
   M(box(.26,.18,.14),std('#1d1a1f',{roughness:.4}),0,1.32,0,tg);M(cyl(.05,.06,.14,14),std('#111',{metalness:.5,roughness:.2}),0,1.32,-.12,tg).rotation.x=Math.PI/2;
   const f=M(sph(.05,10,8),glow('#ffffff',3),.08,1.45,-.02,tg,false,false);f.visible=false;z.flashes.push(f);z.ob(s*2.05,3.3,.35);}
 // judges' table on the right, facing the runway
 const JT={lx:2.35,lz0:-2.7,lz1:.7};z.jt=JT;
 M(box(.7,.06,JT.lz1-JT.lz0),white,JT.lx,.76,(JT.lz0+JT.lz1)/2,g);M(box(.06,.72,JT.lz1-JT.lz0-.1),phys('#8e6cff',{roughness:.5,clearcoat:.4}),JT.lx-.32,.38,(JT.lz0+JT.lz1)/2,g);
 const jl=M(new THREE.PlaneGeometry(1.8,.45),new THREE.MeshBasicMaterial({map:labelTex('JUDGES',{size:64,fg:'#8e6cff',border:'#e8c25a'}),transparent:true}),JT.lx-.36,.45,(JT.lz0+JT.lz1)/2,g,false,false);jl.rotation.y=-Math.PI/2;
 for(let k=0;k<4;k++)z.ob(JT.lx,JT.lz0+.25+k*(JT.lz1-JT.lz0-.5)/3,.5);
 z.jseats=[-2.15,-1,.15].map(lz=>{const cg=new THREE.Group();cg.position.set(JT.lx+.75,0,lz);g.add(cg);M(cyl(.26,.26,.08,20),phys('#ffd23f',{roughness:.6,sheen:1}),0,.42,0,cg);M(cyl(.03,.03,.4,8),trim,0,.2,0,cg);M(box(.08,.6,.5),phys('#ffd23f',{roughness:.6,sheen:1}),.25,.75,0,cg);z.ob(JT.lx+.75,lz,.3);return lz;});
 // trophy shelf on the back wall (fills up as you win)
 const shelf=new THREE.Group();shelf.position.set(3.8,0,B+.25);g.add(shelf);M(box(2.6,.07,.36),white,0,1.5,0,shelf);M(box(2.6,.07,.36),white,0,2.2,0,shelf);
 M(new THREE.PlaneGeometry(2,.5),new THREE.MeshBasicMaterial({map:labelTex('🏆 My trophies',{size:58}),transparent:true}),0,2.65,.0,shelf,false,false);z.trophyG=shelf;
 // contest pad: step on it to enter
 const padM=glow('#ffd23f',1.5);padM.transparent=true;const P={lx:3.4,lz:2.9,r:.62};z.cpad=P;
 M(new THREE.RingGeometry(.46,.64,40),padM,P.lx,.04,P.lz,g,false,false).rotation.x=-Math.PI/2;
 const tro=canvasTex(128,128,(x)=>{x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🏆',64,70);});
 M(new THREE.PlaneGeometry(.66,.66),new THREE.MeshBasicMaterial({map:tro,transparent:true,depthWrite:false}),P.lx,.045,P.lz,g,false,false).rotation.x=-Math.PI/2;
 const clbl=z.cLbl=sprite(labelTex('🏆 Model contest!',{size:52,fg:'#b8860b',border:'#ffe9a8'}),1.9,.47);clbl.position.set(P.lx,1.05,P.lz);g.add(clbl);
 // ---- dressing room on the left ----
 const DR={chair:[-4.55,1.6],mirrorX:-W+.17,pouf:[-4.55,2.5]};z.dr=DR;
 const rug=M(new THREE.CircleGeometry(1.6,40),phys('#ffd6ea',{roughness:.95,sheen:1,sheenColor:new THREE.Color('#ffffff')}),-4.3,.035,1.7,g,false,true);rug.rotation.x=-Math.PI/2;rug.material.polygonOffset=true;rug.material.polygonOffsetFactor=-3;
 // a partition wall between the dressing room and backstage
 M(box(2.7,2.6,.14),phys('#ffd6ea',{roughness:.6}),-W+1.35,1.3,-.2,g);for(let k=0;k<3;k++)z.ob(-W+.45+k*.9,-.2,.4);
 const dl=M(new THREE.PlaneGeometry(2.2,.55),new THREE.MeshBasicMaterial({map:labelTex('💄 Dressing Room',{size:56}),transparent:true}),-W+1.4,2.25,-.12,g,false,false);
 // vanity table
 const vt=new THREE.Group();vt.position.set(-W+.5,0,DR.chair[1]);g.add(vt);
 M(box(.6,.06,1.7),white,0,.76,0,vt);for(const s of [-1,1])M(box(.56,.72,.3),phys('#ffb3d1',{roughness:.4,clearcoat:.6}),0,.37,s*.68,vt);
 for(const [zz,c] of [[-.55,'#ff3b6b'],[-.42,'#8e6cff'],[.5,'#ffd23f']]){M(cyl(.03,.03,.12,12),phys(c,{roughness:.2,clearcoat:1}),.05,.85,zz,vt);M(cyl(.02,.02,.04,12),trim,.05,.93,zz,vt);}
 M(cyl(.07,.08,.03,20),phys('#ffffff',{roughness:.2,clearcoat:1}),.1,.8,.3,vt);for(let i=0;i<4;i++)M(sph(.022,10,8),phys(['#ff6fae','#b388ff','#4fb6ff','#ffd23f'][i],{roughness:.2,clearcoat:1}),.1+Math.sin(i*1.6)*.035,.83,.3+Math.cos(i*1.6)*.035,vt);
 for(let k=0;k<3;k++)z.ob(-W+.5,DR.chair[1]-.6+k*.6,.42);
 // the mirror really reflects you
 const MW=1.35,MH=1.15,my=1.55;
 const mirror=new Reflector(new THREE.PlaneGeometry(MW,MH),{clipBias:.003,textureWidth:Math.round(512*(isTouch?1:1.5)),textureHeight:Math.round(436*(isTouch?1:1.5)),color:0xd9d9e0});
 mirror.position.set(DR.mirrorX+.02,my,DR.chair[1]);mirror.rotation.y=Math.PI/2;g.add(mirror);mirror.visible=false;z.mirror=mirror;
 M(box(.06,MH+.16,MW+.16),plum,DR.mirrorX-.02,my,DR.chair[1],g);
 z.bulbs=[];for(let i=0;i<14;i++){let yy,zz;if(i<4){yy=my+MH/2+.06;zz=-MW/2+.12+i*(MW-.24)/3;}else if(i<8){yy=my-MH/2-.06;zz=-MW/2+.12+(i-4)*(MW-.24)/3;}else{const k=i-8;yy=my-MH/2+.1+(k%3)*(MH-.2)/2;zz=(k<3?-1:1)*(MW/2+.08);}
   z.bulbs.push(M(sph(.045,10,8),glow('#fff1c4',2),DR.mirrorX+.04,yy,DR.chair[1]+zz,g,false,false));}
 // swivel chair and a pouf for pedicures
 const ch=z.chair=new THREE.Group();ch.position.set(DR.chair[0],0,DR.chair[1]);g.add(ch);
 M(cyl(.3,.3,.12,24),velvet,0,.42,0,ch);M(cyl(.04,.04,.36,10),trim,0,.2,0,ch);M(cyl(.24,.26,.03,20),trim,0,.02,0,ch);const back=M(box(.5,.5,.09),velvet,0,.75,.27,ch);back.rotation.x=-.12;
 M(cyl(.28,.3,.3,24),phys('#b388ff',{roughness:.9,sheen:1,sheenColor:new THREE.Color('#e6dcff')}),DR.pouf[0],.15,DR.pouf[1],g);M(new THREE.TorusGeometry(.28,.025,8,28),trim,DR.pouf[0],.3,DR.pouf[1],g).rotation.x=Math.PI/2;
 z.ob(DR.pouf[0],DR.pouf[1],.32);
 // glam pad
 const gM=glow('#ff8fc8',1.4);gM.transparent=true;const GP={lx:-3.35,lz:1.6,r:.55};z.gpad=GP;
 M(new THREE.RingGeometry(.4,.56,36),gM,GP.lx,.04,GP.lz,g,false,false).rotation.x=-Math.PI/2;
 const lip=canvasTex(128,128,(x)=>{x.font='90px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('💄',64,70);});
 M(new THREE.PlaneGeometry(.56,.56),new THREE.MeshBasicMaterial({map:lip,transparent:true,depthWrite:false}),GP.lx,.045,GP.lz,g,false,false).rotation.x=-Math.PI/2;
 const glbl=z.gLbl=sprite(labelTex('🪞 Glam mirror',{size:54}),1.8,.45);glbl.position.set(GP.lx,1.05,GP.lz);g.add(glbl);
 anims.push(t=>{padM.opacity=.55+.45*Math.sin(t*3);gM.opacity=.55+.45*Math.sin(t*3+1);clbl.position.y=1+Math.sin(t*2)*.08;glbl.position.y=1+Math.sin(t*2+1)*.08;});
 // clothing rack and plants
 {const rg=new THREE.Group();rg.position.set(-3.6,0,4.35);g.add(rg);const metal=std('#d9d9e8',{metalness:1,roughness:.2});M(cyl(.03,.03,2,10),metal,0,1.7,0,rg).rotation.z=Math.PI/2;for(const s of [-.95,.95]){M(cyl(.03,.03,1.7,8),metal,s,.85,0,rg);}
  ['#ffd23f','#2d2d3a','#ff6fae','#4fb6ff','#e0263b'].forEach((c,i)=>{const pts=[];for(let k=0;k<=8;k++){const t=k/8;pts.push(new THREE.Vector2(.06+t*.2,-t*.8));}const d=M(new THREE.LatheGeometry(pts,18),phys(c,{roughness:.6,sheen:1,side:THREE.DoubleSide}),-.75+i*.37,1.62,0,rg);d.scale.z=.5;});
  z.ob(-3.6,4.35,.6);z.ob(-4.4,4.35,.5);z.ob(-2.8,4.35,.5);}
 for(const [lx,lz] of [[5.3,4.3],[-5.3,-4.3],[5.3,-1.2]]){M(cyl(.22,.17,.45,16),white,lx,.23,lz,g);for(let k=0;k<5;k++){const b=M(new THREE.IcosahedronGeometry(.22,1),phys('#4fa645',{roughness:.8,sheen:.6}),lx+Math.sin(k*1.3)*.12,.6+k*.12,lz+Math.cos(k*1.3)*.12,g);b.scale.y=.9;}z.ob(lx,lz,.3);}
 const pl=new THREE.PointLight('#ffe6f4',22,13,2);pl.position.set(0,3.4,-.5);g.add(pl);}

