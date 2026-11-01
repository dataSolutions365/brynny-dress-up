/* ===== Halloween ===== */
{const z=Z.halloween,g=z.g;patch(8.5,std('#8a6aa8',{map:TEX.grass,roughness:.95}),z.x,z.z);
 const faceTex=canvasTex(256,128,(x)=>{x.fillStyle='#000';x.fillRect(0,0,256,128);x.fillStyle='#ffd25a';const tri=(a,b,c,d,e,f)=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.lineTo(e,f);x.fill();};tri(44,50,56,30,62,52);tri(68,52,74,30,84,50);x.beginPath();x.moveTo(40,70);x.quadraticCurveTo(64,96,88,70);x.lineTo(80,74);x.lineTo(74,68);x.lineTo(64,76);x.lineTo(54,68);x.lineTo(48,74);x.closePath();x.fill();});
 const pumpMat=phys('#ff7a1a',{roughness:.45,clearcoat:.4,emissive:'#ffb347',emissiveMap:faceTex,emissiveIntensity:2.2});
 const stemMat=std('#4d6b2a');
 const pumpkin=(lx,lz,s)=>{const p=M(sph(.5*s,28,18),pumpMat,lx,.38*s,lz,g);p.scale.y=.78;p.rotation.y=Math.atan2(-lx,8-lz)-Math.PI/2*0;M(cyl(.05*s,.07*s,.22*s,8),stemMat,lx,.78*s,lz,g);z.ob(lx,lz,.45*s);return p;};
 [[-3,2],[3.2,2.6],[-5.5,-1],[5,-2],[-1.5,5],[1.8,4.6],[-6,3],[6.2,1.5],[0,-6.5]].forEach(([x,w],i)=>{const p=pumpkin(x,w,.9+(i%3)*.35);p.rotation.y=Math.atan2(-x,10-w);});
 // haunted house
 const hg=new THREE.Group();hg.position.set(0,0,-4.2);g.add(hg);
 M(box(4,3,3.2),phys('#4a3566',{roughness:.8}),0,1.5,0,hg);const roof=M(new THREE.ConeGeometry(3.3,2.2,4),phys('#2a1d3d',{roughness:.6}),0,4.1,0,hg);roof.rotation.y=Math.PI/4;
 M(box(.9,1.6,.05),std('#2a1a12'),0,.8,1.61,hg,false,false);
 for(const [x,y] of [[-1.2,2],[1.2,2],[-1.2,.9],[1.2,.9]])M(new THREE.PlaneGeometry(.6,.6),glow('#ffcf6a',1.3),x,y,1.61,hg,false,false);
 const tow=M(cyl(.7,.7,4.4,16),phys('#4a3566'),1.7,2.2,-.8,hg);M(new THREE.ConeGeometry(.95,1.6,16),phys('#2a1d3d'),1.7,5.2,-.8,hg);
 z.ob(0,-4.2,2.4);z.ob(-1.3,-4.2,1.6);z.ob(1.3,-4.2,1.6);
 // spooky trees
 const bark=std('#2b2020',{roughness:.9});
 for(const [lx,lz] of [[-6.5,-4],[6.5,-4.5],[-7,2],[7.3,4]]){const tg=new THREE.Group();tg.position.set(lx,0,lz);g.add(tg);M(cyl(.12,.25,3.4,8),bark,0,1.7,0,tg);
   for(let k=0;k<5;k++){const b=M(cyl(.03,.08,1.3,6),bark,0,0,0,tg);const a=k*1.3;b.position.set(Math.sin(a)*.35,2.2+k*.25,Math.cos(a)*.35);b.rotation.set(Math.cos(a)*.9,0,-Math.sin(a)*.9);}z.ob(lx,lz,.4);}
 // ghosts
 const gm=phys('#ffffff',{roughness:.3,transparent:true,opacity:.82,emissive:'#d8d0ff',emissiveIntensity:.35});
 for(let i=0;i<3;i++){const gg=new THREE.Group();g.add(gg);const pts=[];for(let k=0;k<=12;k++){const t=k/12;pts.push(new THREE.Vector2(Math.sin(t*Math.PI*.5+.0)*.45*(t<.5?Math.sqrt(t*2):1)+.0001,.9-t*1.1));}
   M(new THREE.LatheGeometry(pts,24),gm,0,0,0,gg,true,false);for(const s of [-1,1])M(sph(.06,10,8),std('#111'),s*.15,.62,.38,gg,false,false);
   const r0=3+i*1.5,ph=i*2.1;anims.push(t=>{const a=t*.4+ph;gg.position.set(Math.sin(a)*r0,1.5+Math.sin(t*2+ph)*.3,Math.cos(a)*r0*.6+1);gg.rotation.y=a+Math.PI/2;});}
 // gravestones
 for(const [lx,lz] of [[-3.5,-2],[-4.5,-.5],[3.5,-1.5],[4.5,.3]]){M(box(.7,.9,.18),phys('#9a9aa8',{roughness:.9}),lx,.45,lz,g).rotation.y=rand()-.5;M(cyl(.35,.35,.18,16,1),phys('#9a9aa8',{roughness:.9}),lx,.9,lz,g).rotation.x=Math.PI/2;z.ob(lx,lz,.45);}
 const pl=new THREE.PointLight('#b46bff',30,14,2);pl.position.set(0,3,0);g.add(pl);
 signpost(z);}

