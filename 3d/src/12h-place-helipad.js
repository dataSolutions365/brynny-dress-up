/* ===== 🚁 Helipad: a real-looking helicopter landing pad on the open grass between the Basketball Court and the Jump Park =====
   The helicopter itself (the model, flying it, buying or winning it, and friends riding along) is in 26g-helicopter.js.
   Like a real heliport: a square concrete apron, a dark touchdown circle with a yellow ring and a big white H,
   green edge lights around the circle, a windsock that swings in the breeze, a fuel cart and a little operations hut.
   Local space: +z points toward the middle of town (the path in), so the helicopter parks facing it.
   Everything in the middle is flat on purpose: flyGrid (24h-flying.js) sees no obstacle there, so anything can land on it. */
const HPAD={r:4.3,lights:[],sock:null};
{const z=Z.heli,g=z.g,H=HPAD;
 // ---- the apron and the touchdown circle (one picture, so it stays crisp from up high) ----
 const S=11,px=1024;
 const tex=canvasTex(px,px,(x,w,h)=>{const k=w/S,c=w/2;
   // concrete slabs with a little speckle and seams
   x.fillStyle='#b9b8b2';x.fillRect(0,0,w,h);
   for(let i=0;i<26000;i++){const v=150+Math.random()*70|0;x.fillStyle=`rgba(${v},${v},${v-6},.22)`;x.fillRect(Math.random()*w,Math.random()*h,2,2);}
   x.strokeStyle='rgba(70,70,66,.35)';x.lineWidth=3;for(let i=1;i<4;i++){const p=i*w/4;x.beginPath();x.moveTo(p,0);x.lineTo(p,h);x.stroke();x.beginPath();x.moveTo(0,p);x.lineTo(w,p);x.stroke();}
   // oil stains and tyre scuffs, like a pad that gets used
   for(let i=0;i<7;i++){const gx=c+(Math.random()-.5)*w*.6,gy=c+(Math.random()-.5)*h*.6,r=10+Math.random()*30,gr=x.createRadialGradient(gx,gy,0,gx,gy,r);gr.addColorStop(0,'rgba(40,38,34,.18)');gr.addColorStop(1,'rgba(40,38,34,0)');x.fillStyle=gr;x.fillRect(gx-r,gy-r,r*2,r*2);}
   // the dark asphalt touchdown circle
   x.fillStyle='#3b3d40';x.beginPath();x.arc(c,c,H.r*k,0,Math.PI*2);x.fill();
   for(let i=0;i<9000;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*H.r*k,v=50+Math.random()*40|0;x.fillStyle=`rgba(${v},${v},${v+4},.35)`;x.fillRect(c+Math.cos(a)*r,c+Math.sin(a)*r,2,2);}
   // the yellow ring, and a white dashed edge around the apron
   x.strokeStyle='#e8c53a';x.lineWidth=.32*k;x.beginPath();x.arc(c,c,(H.r-.45)*k,0,Math.PI*2);x.stroke();
   x.strokeStyle='#f2f2ee';x.lineWidth=.18*k;x.setLineDash([.9*k,.6*k]);x.strokeRect(.35*k,.35*k,w-.7*k,h-.7*k);x.setLineDash([]);
   // the big white H (its crossbar points the way the helicopter parks)
   x.fillStyle='#f4f4f0';const hw=.5*k,hh=3.4*k,hs=1.15*k;
   x.fillRect(c-hs-hw/2,c-hh/2,hw,hh);x.fillRect(c+hs-hw/2,c-hh/2,hw,hh);x.fillRect(c-hs,c-hw/2,hs*2,hw);
   // the weight limit, painted like on a real pad
   x.font=`bold ${.75*k|0}px Arial, sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f4f4f0';x.fillText('2.5',c,c+(H.r-1.35)*k);
   x.font=`bold ${.42*k|0}px Arial, sans-serif`;x.fillText('BRYNNY HELIPORT',c,c-(H.r+.45)*k);});
 const pad=M(new THREE.PlaneGeometry(S,S),std('#ffffff',{map:tex,roughness:.92}),0,.03,0,g,false,true);pad.rotation.x=-Math.PI/2;
 pad.material.polygonOffset=true;pad.material.polygonOffsetFactor=-2;pad.material.polygonOffsetUnits=-2;
 // a low concrete kerb around the apron
 const kerb=std('#a3a29c',{roughness:.9});
 for(const [x,zz,w,d] of [[0,-S/2,S+.3,.15],[0,S/2,S+.3,.15],[-S/2,0,.15,S],[S/2,0,.15,S]]){if(zz===S/2){for(const sx of [-1,1])M(box(S/2-1.5,.08,d),kerb,sx*(S/4+.75),.04,zz,g,false,true);continue;}M(box(w,.08,d),kerb,x,.04,zz,g,false,true);}
 // ---- green edge lights round the circle (short, so nothing trips on them; seasons.js makes the town glow at night) ----
 const lightM=glow('#5dff8a',1.4),capM=std('#2f3236',{roughness:.5,metalness:.4});
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2,lx=Math.sin(a)*(H.r+.25),lz=Math.cos(a)*(H.r+.25);
   M(cyl(.045,.06,.1,10),capM,lx,.08,lz,g,false,false);H.lights.push(M(sph(.04,10,8),lightM,lx,.17,lz,g,false,false));}
 // floodlights on the two back corners
 for(const sx of [-1,1]){const lg=new THREE.Group();lg.position.set(sx*(S/2-.35),0,-S/2+.35);g.add(lg);
   M(cyl(.05,.07,2.8,10),std('#5a5d62',{metalness:.6,roughness:.4}),0,1.4,0,lg);
   const head=M(box(.42,.22,.18),std('#33363a',{metalness:.5,roughness:.4}),0,2.85,.05,lg);head.rotation.x=.5;
   M(new THREE.PlaneGeometry(.36,.16),glow('#fff4d6',1.3),0,2.8,.15,lg,false,false).rotation.x=.5-Math.PI/2+Math.PI/2;
   z.ob(sx*(S/2-.35),-S/2+.35,.15);}
 // ---- the windsock: a striped orange and white sock on a pole, swinging with the breeze ----
 {const wg=new THREE.Group();wg.position.set(S/2-.4,0,S/2-.6);g.add(wg);const pole=std('#c8cbd0',{metalness:.7,roughness:.35});
   M(cyl(.04,.06,3.6,10),pole,0,1.8,0,wg);M(cyl(.16,.2,.12,14),std('#585b60',{roughness:.6}),0,.06,0,wg);
   const piv=new THREE.Group();piv.position.y=3.55;wg.add(piv);M(new THREE.TorusGeometry(.17,.015,6,20),pole,0,0,0,piv).rotation.y=Math.PI/2;
   const stripes=canvasTex(256,64,(x,w,h)=>{for(let i=0;i<5;i++){x.fillStyle=i%2?'#f4f1ea':'#ee5f1d';x.fillRect(i*w/5,0,w/5+1,h);}});
   const sock=M(new THREE.CylinderGeometry(.17,.07,1.1,16,6,true),std('#ffffff',{map:stripes,roughness:.85,side:THREE.DoubleSide}),0,0,.58,piv,true,false);sock.rotation.x=Math.PI/2;
   stripes.rotation=Math.PI/2;stripes.center.set(.5,.5);
   H.sock=piv;z.ob(S/2-.4,S/2-.6,.12);
   anims.push(t=>{piv.rotation.y=.9+Math.sin(t*.23)*.5+Math.sin(t*1.1)*.08;sock.rotation.z=Math.sin(t*3.1)*.05;sock.scale.y=.92+Math.sin(t*.7)*.08;});}
 // ---- a little operations hut with a window and a door, and a fuel cart next to it ----
 {const hg=new THREE.Group();hg.position.set(-S/2-.6,0,-2.6);hg.rotation.y=Math.PI/2;g.add(hg);
   const wall=std('#e4e1da',{roughness:.85}),trim=std('#2f4a66',{roughness:.6});
   M(box(2.6,2.3,1.8),wall,0,1.15,0,hg);M(box(2.8,.12,2),trim,0,2.36,0,hg);
   M(box(.8,1.7,.04),trim,-.65,.85,.91,hg);M(sph(.035,8,6),std('#d8d8d8',{metalness:.8,roughness:.2}),-.38,.9,.94,hg,false,false);
   M(box(1,.6,.04),phys('#8fb4cc',{roughness:.05,metalness:.2,clearcoat:1}),.55,1.4,.91,hg,false,false);
   M(new THREE.PlaneGeometry(1.9,.42),new THREE.MeshBasicMaterial({map:labelTex('HELI OPS',{size:62,fg:'#ffffff',bg:'#2f4a66',border:null}),transparent:true}),0,2.05,.92,hg,false,false);
   for(let i=-1;i<=1;i++)z.ob(-S/2-.6,-2.6+i*.9,.75);}
 {const fg=new THREE.Group();fg.position.set(-S/2-.5,0,.9);fg.rotation.y=.3;g.add(fg);const red=phys('#b8261f',{roughness:.45,clearcoat:.4}),blk=std('#222',{roughness:.8});
   M(new THREE.CapsuleGeometry(.36,.9,6,16),red,0,.7,0,fg).rotation.z=Math.PI/2;
   for(const sx of [-1,1])for(const sz of [-1,1])M(cyl(.14,.14,.08,14),blk,sx*.45,.14,sz*.32,fg).rotation.x=Math.PI/2;
   M(box(1.1,.06,.7),std('#3a3a3a',{metalness:.5}),0,.3,0,fg);
   M(new THREE.PlaneGeometry(.7,.2),new THREE.MeshBasicMaterial({map:labelTex('JET A-1',{size:60,fg:'#ffffff',bg:null,border:null}),transparent:true}),0,.72,.37,fg,false,false);
   z.ob(-S/2-.5,.9,.7);}
 signpost(z);}
