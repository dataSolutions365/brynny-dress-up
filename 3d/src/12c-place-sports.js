/* ===== Basketball Court and Batting Cage (the games themselves live in 24e-sports.js) =====
   Both places use their zone's local space: +z points back toward the plaza, -z points out toward the sea. */
const SPC={HZ:-4.2,RIM:2.6,RR:.25,BOARD:-4.55,FT:-.8,ARC:4.6,X:5.2,Z0:-5.4,Z1:3.2};// court sizes
const SPB={PLATE:3.4,MACH:-3.4,FENCE:10.2};// batting cage sizes
function spPad(z,lx,lz,col,emoji,text,fg){const m=glow(col,1.5);m.transparent=true;const P={lx,lz,r:.62};
  M(new THREE.RingGeometry(.46,.64,40),m,lx,.04,lz,z.g,false,false).rotation.x=-Math.PI/2;
  const t=canvasTex(128,128,(x)=>{x.font='92px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(emoji,64,70);});
  M(new THREE.PlaneGeometry(.64,.64),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),lx,.045,lz,z.g,false,false).rotation.x=-Math.PI/2;
  const l=sprite(labelTex(text,{size:54,fg}),1.9,.47);l.position.set(lx,1.05,lz);z.g.add(l);P.lbl=l;
  anims.push(t=>{m.opacity=.55+.45*Math.sin(t*3);l.position.y=1+Math.sin(t*2)*.08;});return P;}

/* ---------- 🏀 Basketball Court ---------- */
{const z=Z.court,g=z.g,C=SPC;
 // painted floor: wood planks, purple key, white lines and the 3-point arc
 const W=C.X*2,L=C.Z1-C.Z0,K=100;
 const floor=canvasTex(W*K,L*K,(x)=>{const px=v=>(v+C.X)*K,pz=v=>(v-C.Z0)*K;
   x.fillStyle='#e0a868';x.fillRect(0,0,W*K,L*K);
   for(let i=0;i<W*K;i+=26){x.fillStyle=`rgba(120,70,30,${.05+Math.random()*.08})`;x.fillRect(i,0,2,L*K);for(let j=Math.random()*200;j<L*K;j+=180+Math.random()*120){x.fillRect(i,j,26,2);}}
   x.fillStyle='rgba(255,140,60,.28)';x.beginPath();x.arc(px(0),pz(C.HZ),C.ARC*K,Math.acos((C.ARC-.25)/C.ARC),Math.PI-Math.acos((C.ARC-.25)/C.ARC));x.lineTo(px(-C.ARC+.25),pz(C.Z0));x.lineTo(px(C.ARC-.25),pz(C.Z0));x.closePath();x.fill();
   x.fillStyle='#8e6cff';x.fillRect(px(-1),pz(C.Z0),2*K,(C.FT-C.Z0)*K);
   x.strokeStyle='#ffffff';x.lineWidth=7;
   x.strokeRect(px(-C.X)+5,pz(C.Z0)+5,W*K-10,L*K-10);
   x.strokeRect(px(-1),pz(C.Z0),2*K,(C.FT-C.Z0)*K);
   x.beginPath();x.arc(px(0),pz(C.FT),K,0,Math.PI*2);x.stroke();
   // 3-point line: straight in the corners, then the arc around the hoop
   const cx=C.ARC-.25;
   x.beginPath();x.arc(px(0),pz(C.HZ),C.ARC*K,Math.PI-Math.acos(cx/C.ARC),Math.acos(cx/C.ARC),true);x.stroke();
   const cz=C.HZ+Math.sqrt(C.ARC*C.ARC-cx*cx);
   for(const s of [-1,1]){x.beginPath();x.moveTo(px(s*cx),pz(C.Z0));x.lineTo(px(s*cx),pz(cz));x.stroke();}
   x.font=`${K*1.1}px serif`;x.textAlign='center';x.textBaseline='middle';x.globalAlpha=.85;x.fillText('🏀',px(0),pz(2.1));x.globalAlpha=1;});
 const fl=M(new THREE.PlaneGeometry(W,L),phys('#ffffff',{map:floor,roughness:.35,clearcoat:.6}),0,.03,(C.Z0+C.Z1)/2,g,false,true);fl.rotation.x=-Math.PI/2;fl.material.polygonOffset=true;fl.material.polygonOffsetFactor=-2;
 // the hoop: pole, backboard, orange rim and a net that swishes
 const steel=std('#3b4a66',{metalness:.7,roughness:.35}),white=phys('#ffffff',{roughness:.2,clearcoat:1});
 M(cyl(.09,.11,3.3,14),steel,0,1.65,C.BOARD-.75,g);z.ob(0,C.BOARD-.75,.25);
 M(box(.12,.12,.8),steel,0,3.1,C.BOARD-.38,g);
 M(box(1.5,1,.05),phys('#ffffff',{roughness:.05,transmission:.5,transparent:true,opacity:.75,clearcoat:1}),0,3,C.BOARD,g);
 for(const [w,h,y,xx] of [[1.5,.05,3.48,0],[1.5,.05,2.52,0],[.05,1,3,-.73],[.05,1,3,.73]])M(box(w,h,.06),phys('#e0263b',{roughness:.4}),xx,y,C.BOARD+.01,g,false,false);
 for(const [w,h,y,xx] of [[.6,.04,3.0,0],[.6,.04,2.66,0],[.04,.38,2.83,-.28],[.04,.38,2.83,.28]])M(box(w,h,.02),phys('#e0263b',{roughness:.4}),xx,y,C.BOARD+.035,g,false,false);
 const rim=M(new THREE.TorusGeometry(C.RR,.018,10,40),std('#ff6a1f',{metalness:.5,roughness:.35}),0,C.RIM,C.HZ,g);rim.rotation.x=Math.PI/2;
 M(box(.06,.03,.12),std('#ff6a1f',{metalness:.5,roughness:.35}),0,C.RIM,C.BOARD+.06,g);
 const netGeo=new THREE.CylinderGeometry(C.RR,C.RR*.6,.4,12,4,true);const net=M(netGeo,new THREE.MeshBasicMaterial({color:'#ffffff',wireframe:true,transparent:true,opacity:.85}),0,C.RIM-.2,C.HZ,g,false,false);
 z.hoop={rim,net,shake:0,swish:0};
 anims.push((t,dt)=>{const h=z.hoop;if(h.swish>0){h.swish=Math.max(0,h.swish-dt*2.5);net.scale.set(1-h.swish*.25,1+h.swish*.5,1-h.swish*.25);net.position.y=C.RIM-.2-h.swish*.1;}
   if(h.shake>0){h.shake=Math.max(0,h.shake-dt*3);rim.rotation.x=Math.PI/2+Math.sin(t*40)*h.shake*.12;}});
 // scoreboard behind the hoop (24e-sports.js draws on it)
 const sbCv=document.createElement('canvas');sbCv.width=512;sbCv.height=200;const sbT=new THREE.CanvasTexture(sbCv);sbT.colorSpace=THREE.SRGBColorSpace;
 z.board={cv:sbCv,tex:sbT,draw(a,b,mid){const x=sbCv.getContext('2d');x.fillStyle='#1d1a2f';x.fillRect(0,0,512,200);x.strokeStyle='#ffd23f';x.lineWidth=8;x.strokeRect(4,4,504,192);
   x.textAlign='center';x.textBaseline='middle';x.font='700 34px Fredoka, sans-serif';x.fillStyle='#ffd23f';x.fillText(mid||'🏀 COURT',256,40);
   x.font='700 92px Fredoka, sans-serif';x.fillStyle='#ff6fae';x.fillText(a??'-',128,128);x.fillStyle='#4fb6ff';x.fillText(b??'-',384,128);x.fillStyle='#fff';x.font='700 60px Fredoka, sans-serif';x.fillText(':',256,124);sbT.needsUpdate=true;}};
 z.board.draw('0','0');
 M(cyl(.07,.07,4.6,10),steel,-1.5,2.3,C.Z0-.6,g);M(cyl(.07,.07,4.6,10),steel,1.5,2.3,C.Z0-.6,g);z.ob(-1.5,C.Z0-.6,.2);z.ob(1.5,C.Z0-.6,.2);
 M(new THREE.PlaneGeometry(2.8,1.1),new THREE.MeshBasicMaterial({map:sbT,toneMapped:false}),0,4.35,C.Z0-.55,g,false,false);
 // bleachers on the right side
 {const bg=new THREE.Group();bg.position.set(C.X+.95,0,-.6);g.add(bg);const seat=phys('#4fb6ff',{roughness:.4,clearcoat:.5}),alu=std('#c9d3e0',{metalness:.8,roughness:.3});
  for(let i=0;i<3;i++){M(box(.45,.08,4.6),seat,i*.42,.35+i*.35,0,bg);M(box(.05,.35+i*.35,4.6),alu,i*.42+.2,(.35+i*.35)/2,0,bg);}
  for(let k=0;k<5;k++)z.ob(C.X+1.2,-2.6+k*1,.62);}
 // ball rack on the left
 {const rg=new THREE.Group();rg.position.set(-C.X-.75,0,-1.2);g.add(rg);const alu=std('#c9d3e0',{metalness:.8,roughness:.3});
  for(const s of [-1,1])M(box(.06,.9,.06),alu,0,.45,s*.7,rg);M(box(.3,.05,1.5),alu,0,.88,0,rg);M(box(.3,.05,1.5),alu,0,.45,0,rg);
  const bm=phys('#ff7a1f',{roughness:.6});for(let i=0;i<4;i++)for(const y of [.6,1.03])M(sph(.13,16,12),bm,0,y,-.5+i*.33,rg);z.ob(-C.X-.75,-1.6,.35);z.ob(-C.X-.75,-.8,.35);}
 z.pad=spPad(z,-2.6,4.35,'#ff8a1f','🏀','🏀 Play ball!','#e8590c');
 const pl=new THREE.PointLight('#fff1dc',10,12,2);pl.position.set(0,5,-1);g.add(pl);
 signpost(z);}

/* ---------- ⚾ Batting Cage ---------- */
{const z=Z.batting,g=z.g,B=SPB;
 // striped grass field opening toward the sea, a dirt circle at home plate and in front of the pitching machine
 const grassT=canvasTex(256,256,(x)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#5fbf4a':'#6fcf58';x.fillRect(0,i*32,256,32);}},2);
 const fld=M(new THREE.CircleGeometry(B.FENCE,48,Math.PI*.25,Math.PI*.5),phys('#ffffff',{map:grassT,roughness:.9}),0,.025,B.PLATE,g,false,true);fld.rotation.x=-Math.PI/2;fld.material.polygonOffset=true;fld.material.polygonOffsetFactor=-2;
 const dirt=phys('#c98a55',{roughness:1});dirt.polygonOffset=true;dirt.polygonOffsetFactor=-3;
 M(new THREE.CircleGeometry(1.5,32),dirt,0,.032,B.PLATE,g,false,true).rotation.x=-Math.PI/2;
 M(new THREE.CircleGeometry(1.1,32),dirt,0,.032,B.MACH,g,false,true).rotation.x=-Math.PI/2;
 const chalk=new THREE.MeshBasicMaterial({color:'#ffffff'});
 {const s=new THREE.Shape();s.moveTo(-.22,0);s.lineTo(.22,0);s.lineTo(.22,.2);s.lineTo(0,.36);s.lineTo(-.22,.2);s.closePath();
  const pm=M(new THREE.ShapeGeometry(s),phys('#ffffff',{roughness:.5}),0,.045,B.PLATE+.18,g,false,true);pm.rotation.x=-Math.PI/2;pm.rotation.z=Math.PI;}
 for(const sx of [-1,1]){const bx=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(.6,1.1)),new THREE.LineBasicMaterial({color:'#ffffff'}));bx.position.set(sx*.55,.05,B.PLATE);bx.rotation.x=-Math.PI/2;g.add(bx);}
 // foul lines
 for(const sx of [-1,1]){const fl=M(new THREE.PlaneGeometry(.06,B.FENCE-.2),chalk,0,.04,0,g,false,false);fl.rotation.x=-Math.PI/2;fl.rotation.z=sx*Math.PI/4;
   fl.position.set(sx*Math.sin(Math.PI/4)*(B.FENCE/2),.04,B.PLATE-Math.cos(Math.PI/4)*(B.FENCE/2));}
 // the outfield fence with a yellow top and distance numbers
 {const fm=phys('#2f7a34',{roughness:.7}),top=phys('#ffd23f',{roughness:.5});const n=14;
  for(let i=0;i<n;i++){const a=-Math.PI/4+(i+.5)/n*Math.PI/2,x=Math.sin(a)*B.FENCE,zz=B.PLATE-Math.cos(a)*B.FENCE;const seg=2*B.FENCE*Math.sin(Math.PI/4/n)+.04;
    const p=M(box(seg,.9,.08),fm,x,.45,zz,g);p.rotation.y=-a;const t=M(box(seg,.06,.12),top,x,.92,zz,g);t.rotation.y=-a;}
  for(const [a,txt] of [[-Math.PI/4+.08,'120'],[0,'HOME RUN!'],[Math.PI/4-.08,'120']]){const s=M(new THREE.PlaneGeometry(txt.length>4?2:.8,.36),new THREE.MeshBasicMaterial({map:labelTex(txt,{size:70,bg:null,fg:'#ffffff',w:txt.length>4?512:256}),transparent:true}),Math.sin(a)*(B.FENCE-.06),.5,B.PLATE-Math.cos(a)*(B.FENCE-.06),g,false,false);s.rotation.y=-a;}}
 // backstop net behind home plate
 {const netM=new THREE.MeshBasicMaterial({color:'#2d2d3a',wireframe:true,transparent:true,opacity:.55}),pole=std('#3b4a66',{metalness:.7,roughness:.35});
  const bs=z.backstop=new THREE.Group();g.add(bs);// hidden while you bat, so the camera can see through it
  const ng=new THREE.CylinderGeometry(2.3,2.3,3,18,6,true,-Math.PI*.42,Math.PI*.84);const n=M(ng,netM,0,1.5,B.PLATE,bs,false,false);
  for(let i=0;i<=4;i++){const a=-Math.PI*.42+i/4*Math.PI*.84;const x=Math.sin(a)*2.3,zz=B.PLATE+Math.cos(a)*2.3;M(cyl(.05,.05,3.1,8),pole,x,1.55,zz,bs);z.ob(x,zz,.25);}
  for(let k=0;k<9;k++){const a=-Math.PI*.42+k/8*Math.PI*.84;z.ob(Math.sin(a)*2.3,B.PLATE+Math.cos(a)*2.3,.3);}}
 // pitching machine behind a safety screen
 {const mg=new THREE.Group();mg.position.set(0,0,B.MACH);g.add(mg);const blue=phys('#3a5bd9',{roughness:.4,clearcoat:.6}),dark=std('#2d2d3a',{roughness:.5});
  for(const s of [-1,1]){const l=M(cyl(.03,.03,1,8),dark,s*.25,.45,.15,mg);l.rotation.z=s*.25;}M(cyl(.03,.03,1,8),dark,0,.45,-.25,mg).rotation.x=.3;
  M(box(.5,.35,.45),blue,0,.95,0,mg);const wh=[];for(const s of [-1,1]){const w=M(cyl(.18,.18,.08,20),std('#111',{roughness:.6}),s*.13,1.1,.18,mg);w.rotation.z=Math.PI/2;wh.push(w);}
  M(cyl(.06,.06,.4,12),dark,0,1.1,.3,mg).rotation.x=Math.PI/2;
  z.mlight=M(sph(.07,12,10),glow('#ff3b3b',2),0,1.32,0,mg,false,false);
  const hop=M(cyl(.22,.12,.3,14,1,true),phys('#ffd23f',{roughness:.5,side:THREE.DoubleSide}),0,1.3,-.1,mg);
  z.wheels=wh;z.ob(0,B.MACH,.5);
  const scr=new THREE.Group();scr.position.set(0,0,B.MACH+.7);g.add(scr);
  for(const s of [-1,1])M(cyl(.03,.03,1.2,8),dark,s*.6,.6,0,scr);M(box(1.2,.04,.04),dark,0,1.2,0,scr);
  M(new THREE.PlaneGeometry(1.2,.7),new THREE.MeshBasicMaterial({color:'#2d2d3a',wireframe:true,transparent:true,opacity:.6}),0,.5,0,scr,false,false);
  M(new THREE.PlaneGeometry(.55,.55),new THREE.MeshBasicMaterial({color:'#2d2d3a',wireframe:true,transparent:true,opacity:.6}),-.32,.95,0,scr,false,false);
  z.ob(-.4,B.MACH+.7,.35);z.ob(.4,B.MACH+.7,.35);}
 // bat rack and a bucket of balls
 {const rg=new THREE.Group();rg.position.set(2.7,0,B.PLATE+.6);g.add(rg);const wood=std('#9a6a43',{roughness:.7}),bat=std('#e8c99a',{roughness:.5});
  M(box(.9,.08,.3),wood,0,.9,0,rg);M(box(.06,.9,.3),wood,-.42,.45,0,rg);M(box(.06,.9,.3),wood,.42,.45,0,rg);
  for(let i=0;i<4;i++){const b=M(cyl(.035,.018,.8,10),i===2?std('#3b2357',{roughness:.4}):bat,-.3+i*.2,.5,0,rg);b.rotation.z=.12;}z.ob(2.7,B.PLATE+.6,.5);
  M(cyl(.22,.19,.4,18),phys('#ff3b6b',{roughness:.5}),-2.4,.2,B.PLATE-.6,g);for(let i=0;i<6;i++)M(sph(.05,10,8),phys('#ffffff',{roughness:.6}),-2.4+Math.sin(i*1.1)*.11,.42,B.PLATE-.6+Math.cos(i*1.1)*.11,g,false,false);z.ob(-2.4,B.PLATE-.6,.3);}
 z.pad=spPad(z,-2.9,5.2,'#4fd16a','⚾','⚾ Batting practice!','#2f8f3a');
 signpost(z);}
