/* ===== Beach ===== */
{const z=Z.beach,g=z.g;patch(10.5,std('#ffffff',{map:TEX.sand,roughness:1}),z.x,z.z,.018);
 const palm=(lx,lz,lean)=>{const pg=new THREE.Group();pg.position.set(lx,0,lz);pg.rotation.y=rand()*6;g.add(pg);const trunk=std('#9a7046',{roughness:.9});let px=0,py=0;
   for(let k=0;k<8;k++){const seg=M(cyl(.14-k*.008,.17-k*.008,.62,10),trunk,px,py+.3,0,pg);seg.rotation.z=-lean*k*.05;px+=Math.sin(lean*k*.05)*.62;py+=Math.cos(lean*k*.05)*.6;}
   const leaf=phys('#3f9a3a',{roughness:.6,side:THREE.DoubleSide,sheen:.4});
   for(let k=0;k<8;k++){const lg=new THREE.Group();lg.position.set(px,py+.1,0);lg.rotation.y=k/8*Math.PI*2;pg.add(lg);const l=M(new THREE.ConeGeometry(.35,2.2,4,1),leaf,0,0,1.0,lg,true,false);l.rotation.x=Math.PI/2+.5;l.scale.y=1;l.scale.x=1.4;l.scale.z=.12;}
   for(let k=0;k<3;k++)M(sph(.13,10,8),std('#5a3a1a'),px+Math.sin(k*2)*.18,py-.05,Math.cos(k*2)*.18,pg);z.ob(lx,lz,.35);};
 palm(-6.5,2,1.2);palm(6.5,1,1);palm(-4.5,-4,.8);palm(7,-5,1.3);
 const umb=(lx,lz,c1)=>{const ug=new THREE.Group();ug.position.set(lx,0,lz);g.add(ug);M(cyl(.04,.04,2.4,8),std('#ffffff',{metalness:.6,roughness:.3}),0,1.2,0,ug);
   const top=M(new THREE.ConeGeometry(1.5,.6,16,1,true),phys(c1,{side:THREE.DoubleSide,map:TEX.stripes,roughness:.6,sheen:1}),0,2.3,0,ug);top.rotation.z=.12;z.ob(lx,lz,.2);
   const tw=M(box(.9,.02,1.8),phys(c1,{map:TEX.stripes,roughness:.9}),1.2,.03,.4,ug,false,true);tw.rotation.y=.3;};
 umb(-2.5,1,'#ff6fae');umb(2.8,-.5,'#4fb6ff');umb(.5,-4.5,'#ffd23f');
 // beach ball
 const bt=canvasTex(256,128,(x)=>{const c=['#ff3b6b','#ffffff','#4fb6ff','#ffffff','#ffd23f','#ffffff'];c.forEach((cc,i)=>{x.fillStyle=cc;x.fillRect(i*256/6,0,256/6+1,128);});});
 const ball=M(sph(.35,24,16),phys('#ffffff',{map:bt,roughness:.25,clearcoat:1}),-1,.35,3.5,g);
 z.ball={m:ball,vx:0,vz:0};
 // sandcastle
 const sc=new THREE.Group();sc.position.set(4,0,3.5);g.add(sc);const sandM=std('#e8c98f',{map:TEX.sand,roughness:1});
 M(box(1.4,.5,1.4),sandM,0,.25,0,sc);for(const [x,w] of [[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]]){M(cyl(.25,.28,.9,12),sandM,x,.45,w,sc);M(new THREE.ConeGeometry(.3,.4,12),sandM,x,1.1,w,sc);}
 M(cyl(.004,.004,.6,4),std('#fff'),0,1,0,sc);M(box(.25,.15,.01),phys('#ff3b6b'),.13,1.2,0,sc);z.ob(4,3.5,1);
 // a little dock
 const wood=std('#a87a52',{roughness:.85});const dock=new THREE.Group();dock.position.set(-1,0,-8.5);g.add(dock);
 for(let k=0;k<10;k++)M(box(2,.08,.38),wood,0,.15,-k*.42,dock);for(const s of [-.9,.9])for(let k=0;k<3;k++)M(cyl(.08,.08,1.2,8),wood,s,-.3,-k*1.8,dock);
 z.dock={lx:-1,lz0:-8.3,lz1:-12.5,h:.19};
 // seashells & starfish
 const shell=phys('#ffd9c9',{roughness:.3,clearcoat:1});for(let i=0;i<14;i++){const a=rand()*Math.PI*2,r=2+rand()*7;const s=M(sph(.08,10,6,0,Math.PI*2,0,Math.PI/2),shell,Math.sin(a)*r,0,Math.cos(a)*r,g);s.scale.set(1,.5,1.3);}
 signpost(z);}

