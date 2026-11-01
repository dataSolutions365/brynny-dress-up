/* ===== Sparkle Studio (center) ===== */
{const z=Z.studio,g=z.g;
 const marble=phys('#f3d5e4',{roughness:.18,clearcoat:1,clearcoatRoughness:.08});
 M(cyl(6.2,6.4,.15,64),marble,0,.075,0,g,false,true);
 M(new THREE.TorusGeometry(6.25,.06,8,96),std('#d4af37',{metalness:1,roughness:.25}),0,.15,0,g).rotation.x=Math.PI/2;
 const col=phys('#ffffff',{roughness:.3,clearcoat:.6}),gold=std('#e8c25a',{metalness:1,roughness:.22});
 for(let i=0;i<6;i++){const a=deg(30+i*60),x=Math.sin(a)*5.6,w=Math.cos(a)*5.6;M(cyl(.22,.26,4.2,20),col,x,2.25,w,g);M(cyl(.36,.36,.2,20),gold,x,4.4,w,g);M(cyl(.36,.36,.2,20),gold,x,.25,w,g);obs.push({x,z:w,r:.4});}
 const crown=M(new THREE.TorusGeometry(5.6,.16,10,96),gold,0,4.55,0,g);crown.rotation.x=Math.PI/2;
 // fairy lights hanging between columns
 const bulbs=[];const bc=['#ff8fc8','#ffd23f','#8fd8ff','#c6a6ff'];
 for(let i=0;i<6;i++)for(let k=1;k<10;k++){const a=deg(30+i*60+k*6),sag=Math.sin(k/10*Math.PI)*.7;const b=M(sph(.07,8,6),glow(bc[(i+k)%4],2.2),Math.sin(a)*5.6,4.35-sag,Math.cos(a)*5.6,g,false,false);bulbs.push(b);}
 anims.push(t=>bulbs.forEach((b,i)=>b.scale.setScalar(.8+.35*Math.sin(t*3+i))));
 // dress-up pad
 const padMat=glow('#ff8fc8',1.4);padMat.transparent=true;
 const pad=M(new THREE.RingGeometry(.8,1.15,48),padMat,0,.17,0,g,false,false);pad.rotation.x=-Math.PI/2;
 const padIn=M(new THREE.CircleGeometry(.8,48),phys('#ffd6ea',{roughness:.2,clearcoat:1,emissive:'#ff6fae',emissiveIntensity:.2}),0,.165,0,g,false,true);padIn.rotation.x=-Math.PI/2;
 const padLbl=z.padLbl=sprite(labelTex('👗 Dress up!',{size:56}),1.8,.45);padLbl.position.set(0,1.0,0);g.add(padLbl);
 anims.push(t=>{padMat.opacity=.55+.45*Math.sin(t*3);padLbl.position.y=.95+Math.sin(t*2)*.08;});
 z.pad={x:0,z:0,r:.95};
 // mirrors
 for(const a of [deg(90),deg(270)]){const mg=new THREE.Group();mg.position.set(Math.sin(a)*4.2,0,Math.cos(a)*4.2);mg.rotation.y=a+Math.PI;g.add(mg);
   const fr=M(new THREE.TorusGeometry(.75,.08,12,48),gold,0,1.55,0,mg);fr.scale.y=1.45;
   const gl=M(new THREE.CircleGeometry(.72,48),std('#ffffff',{metalness:1,roughness:.02}),0,1.55,.01,mg,false,false);gl.scale.y=1.45;
   M(cyl(.06,.06,.5),gold,0,.25,0,mg);M(cyl(.35,.4,.08,24),gold,0,.04,0,mg);obs.push({x:mg.position.x,z:mg.position.z,r:.6});}
 // clothing racks with little dresses
 for(const a of [deg(150),deg(330)]){const rg=new THREE.Group();rg.position.set(Math.sin(a)*4,0,Math.cos(a)*4);rg.rotation.y=a+Math.PI/2;g.add(rg);
   const metal=std('#d9d9e8',{metalness:1,roughness:.2});M(cyl(.03,.03,2.2),metal,0,1.7,0,rg).rotation.z=Math.PI/2;
   for(const s of [-1.05,1.05]){M(cyl(.03,.03,1.7),metal,s,.85,0,rg);M(box(.06,.04,.6),metal,s,.02,0,rg);}
   const cs=['#ff8fc8','#8fd8ff','#ffd23f','#b388ff','#7ee081','#ff6f6f'];
   cs.forEach((c,i)=>{const pts=[];for(let k=0;k<=8;k++){const t=k/8;pts.push(new THREE.Vector2(.07+t*.22,-t*.75));}
     const d=M(new THREE.LatheGeometry(pts,20),phys(c,{roughness:.8,sheen:1,sheenColor:new THREE.Color('#ffffff'),side:THREE.DoubleSide}),-.85+i*.34,1.6,0,rg);d.scale.z=.5;});
   obs.push({x:rg.position.x,z:rg.position.z,r:1.2});}
 // stage spot shine
 const sl=new THREE.PointLight('#ffb3e0',18,12,2);sl.position.set(0,4,0);g.add(sl);}

