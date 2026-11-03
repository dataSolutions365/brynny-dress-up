/* ===== 🛹 Skate Park =====
   A real-looking skate park on a concrete pad between the Runway and the Beach path: a wooden mini half-pipe with steel
   coping and railings on the decks (like a backyard mini ramp), and a concrete street section with blue steel edges:
   a quarter pipe, a funbox, a kicker ramp, a platform with stairs and a handrail, a long ledge and a flat bar.
   This file builds it and knows how high the ground is everywhere in it (skateH, used by groundAt in 13-park-and-stars.js).
   Riding the ramps, grinding and doing tricks on a skateboard, roller skates or a bike is in 24k-skate-park.js.
   Local layout (z.toLocal): +z points back toward the plaza (the way in), the half-pipe is at the back (-z). */
const SKZ={
  hp:{x0:-3.96,x1:3.96,z0:-8.3,z1:-4.7,flat:1.1,RT:2,H:1.6,deck:.9,base:.05},// mini half-pipe: you ride it back and forth along x
  qp:{x0:6,x1:8.2,z0:-3.2,z1:1.2,RT:1.5,H:1.2},// quarter pipe on the right, facing the middle
  fb:{x0:1.6,x1:4.2,top:.7,ramp:1.6,h:.55},// funbox: a flat top with a ramp up each end (along z)
  kick:{x0:4.4,x1:6.2,z0:3,z1:4.4,R:1.6},// kicker: a curved launch ramp, you hit it riding in from the gate (-z)
  plat:{x0:-7.4,x1:-4.6,z0:-3.2,z1:-.6,h:.9,bank:-4.6,step:.45,n:3},// platform: a bank up the back, three stairs down the front
  ledge:{x0:-3.4,x1:-2.8,z0:1,z1:5,h:.4},
  // things to grind: a = start, b = end (local x,z), y0/y1 = how high the top is at each end
  rails:[{k:'rail',n:'Rail',a:[0,1.2],b:[0,5.6],y0:.42,y1:.42},
         {k:'rail',n:'Handrail',a:[-6,-.75],b:[-6,1.05],y0:1.43,y1:.23},
         {k:'ledge',n:'Ledge',a:[-3.4,1],b:[-3.4,5],y0:.4,y1:.4},{k:'ledge',n:'Ledge',a:[-2.8,1],b:[-2.8,5],y0:.4,y1:.4},
         {k:'ledge',n:'Funbox',a:[1.6,-.7],b:[1.6,.7],y0:.55,y1:.55},{k:'ledge',n:'Funbox',a:[4.2,-.7],b:[4.2,.7],y0:.55,y1:.55}]};
{const h=SKZ.hp;h.TX=Math.sqrt(h.RT*h.RT-(h.RT-h.H)**2);const q=SKZ.qp;q.TX=Math.sqrt(q.RT*q.RT-(q.RT-q.H)**2);}
// how high the riding surface is at a spot in the park (local x,z), not counting the thin rails
function skateLH(x,z){const S=SKZ;let h=0;
  {const p=S.hp;if(z>=p.z0&&z<=p.z1&&x>=p.x0&&x<=p.x1){const u=Math.abs(x),t=u-p.flat;
    h=p.base+(t<=0?0:t<p.TX?p.RT-Math.sqrt(p.RT*p.RT-t*t):p.H);}}
  {const p=S.qp;if(z>=p.z0&&z<=p.z1&&x>=p.x0&&x<=p.x1){const t=x-p.x0;h=Math.max(h,t<p.TX?p.RT-Math.sqrt(p.RT*p.RT-t*t):p.H);}}
  {const p=S.fb,a=Math.abs(z);if(x>=p.x0&&x<=p.x1&&a<=p.top+p.ramp)h=Math.max(h,a<=p.top?p.h:p.h*(1-(a-p.top)/p.ramp));}
  {const p=S.kick;if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1){const t=p.z1-z;h=Math.max(h,p.R-Math.sqrt(p.R*p.R-t*t));}}
  {const p=S.plat;if(x>=p.x0&&x<=p.x1){
    if(z>=p.z0&&z<=p.z1)h=Math.max(h,p.h);
    else if(z>=p.bank&&z<p.z0)h=Math.max(h,p.h*(z-p.bank)/(p.z0-p.bank));
    else if(z>p.z1&&z<p.z1+p.step*p.n){const i=Math.floor((z-p.z1)/p.step);h=Math.max(h,p.h*(1-(i+1)/(p.n+1)));}}}
  {const p=S.ledge;if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)h=Math.max(h,p.h);}
  return h;}
// the same, from a spot in town (world x,z): 0 outside the park
function skateH(x,z){const s=Z.skate;if(!s)return 0;const dx=x-s.x,dz=z-s.z;if(dx*dx+dz*dz>(s.r+.5)*(s.r+.5))return 0;const [lx,lz]=s.toLocal(x,z);return skateLH(lx,lz);}

{const z=Z.skate,g=z.g,S=SKZ;
 // smooth broom-finished concrete with saw-cut joints, and maroon plywood panels like a real mini ramp
 const conT=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#b9bbbc';x.fillRect(0,0,w,h);
   for(let i=0;i<9000;i++){const c=Math.random();x.fillStyle=c<.5?'rgba(255,255,255,.18)':c<.85?'rgba(90,90,95,.16)':'rgba(140,120,100,.12)';x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);}
   for(let i=0;i<14;i++){const gr=x.createRadialGradient(0,0,0,0,0,40+Math.random()*60);gr.addColorStop(0,'rgba(80,80,85,.08)');gr.addColorStop(1,'rgba(80,80,85,0)');x.save();x.translate(Math.random()*w,Math.random()*h);x.fillStyle=gr;x.fillRect(-100,-100,200,200);x.restore();}
   x.fillStyle='rgba(70,70,75,.45)';x.fillRect(0,0,w,3);x.fillRect(0,0,3,h);});
 conT.wrapS=conT.wrapT=THREE.RepeatWrapping;
 const plyT=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#6f2d35';x.fillRect(0,0,w,h);
   for(let i=0;i<260;i++){const y=Math.random()*h;x.strokeStyle=Math.random()<.5?'rgba(40,10,15,.18)':'rgba(150,80,85,.12)';x.lineWidth=.6+Math.random()*1.6;x.beginPath();x.moveTo(0,y);
     for(let k=0;k<=8;k++)x.lineTo(k*w/8,y+Math.sin(k*1.3+i)*3);x.stroke();}
   for(let i=0;i<500;i++){x.fillStyle='rgba(255,255,255,.05)';x.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*10,1);}
   x.fillStyle='rgba(25,5,10,.5)';x.fillRect(0,0,w,2);x.fillRect(0,h/2,w,2);x.fillRect(0,0,2,h);
   x.fillStyle='rgba(30,25,25,.5)';for(const [px,py] of [[10,10],[w/2,10],[10,h/2+10],[w/2,h/2+10]])for(let k=0;k<4;k++){x.beginPath();x.arc(px+k*w/4,py,1.6,0,Math.PI*2);x.fill();}});
 plyT.wrapS=plyT.wrapT=THREE.RepeatWrapping;
 const tile=(t,k)=>{const c=t.clone();c.needsUpdate=true;c.repeat.set(k,k);return c;};
 const conM=std('#ffffff',{map:tile(conT,.25),roughness:.88}),conSide=std('#d6d8d9',{map:tile(conT,.25),roughness:.9}),
   plyM=std('#ffffff',{map:tile(plyT,.42),roughness:.62}),plySide=std('#c9c0c0',{map:tile(plyT,.42),roughness:.7}),
   steel=std('#d5d9df',{metalness:.9,roughness:.28}),blue=phys('#2350c4',{metalness:.55,roughness:.35,clearcoat:.5}),dark=std('#3a3d44',{metalness:.6,roughness:.45});
 // the concrete pad, slightly bigger than the park so the ramps never hang over grass
 {const pm=std('#ffffff',{map:tile(conT,.22),roughness:.9});patch(z.r+.3,pm,z.x,z.z,.021);}
 // a profile (points [across, up]) pushed out along local z from z0 to z1, or along local x (alongX) from x0 to x1
 const prof=(pts,a0,a1,mats,alongX)=>{const sh=new THREE.Shape();pts.forEach(([u,v],i)=>i?sh.lineTo(u,v):sh.moveTo(u,v));
   const geo=new THREE.ExtrudeGeometry(sh,{depth:a1-a0,bevelEnabled:false,steps:1});
   if(alongX){geo.rotateY(-Math.PI/2);geo.translate(a1,0,0);}else geo.translate(0,0,a0);
   const m=new THREE.Mesh(geo,mats);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
 const curve=(n,f)=>{const o=[];for(let i=0;i<=n;i++)o.push(f(i/n));return o;};
 const tube=(a,b,r,m)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),t=M(cyl(r,r,d.length(),14),m,0,0,0,g);
   t.position.copy(A).add(B).multiplyScalar(.5);t.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return t;};

 /* --- the wooden mini half-pipe --- */
 {const p=S.hp,b=p.base,top=b+p.H,e=p.flat+p.TX;
  const side=s=>curve(30,k=>{const t=p.TX*(1-k);return [s*(p.flat+t),b+p.RT-Math.sqrt(p.RT*p.RT-t*t)];});
  const pts=[[p.x0,0],[p.x1,0],[p.x1,top],...side(1),...side(-1).reverse(),[p.x0,top]];
  prof(pts,p.z0,p.z1,[plySide,plyM]);
  for(const s of [-1,1]){
    tube([s*e,top,p.z0],[s*e,top,p.z1],.045,steel);// steel coping along the lip
    // railings across the back of each deck, and a little one down the side so you don't fall off
    for(let i=0;i<=4;i++){const zz=p.z0+.12+i*(p.z1-p.z0-.24)/4;tube([s*(p.x1-.08),top,zz],[s*(p.x1-.08),top+1,zz],.025,dark);}
    tube([s*(p.x1-.08),top+1,p.z0+.12],[s*(p.x1-.08),top+1,p.z1-.12],.03,dark);tube([s*(p.x1-.08),top+.5,p.z0+.12],[s*(p.x1-.08),top+.5,p.z1-.12],.02,dark);
    for(const zz of [p.z0+.1])for(const xx of [e+.15,p.x1-.08]){tube([s*xx,top,zz],[s*xx,top+1,zz],.025,dark);}
    tube([s*(e+.15),top+1,p.z0+.1],[s*(p.x1-.08),top+1,p.z0+.1],.03,dark);
    // the name painted on each wall near the top, like at a real park
    const lt=canvasTex(512,80,(x,w,h)=>{x.fillStyle='rgba(255,255,255,.88)';x.font='700 54px "Arial Black", Impact, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('SKATE PARK',w/2,h/2+3);});
    const t=1.9,yy=b+p.RT-Math.sqrt(p.RT*p.RT-t*t),ang=Math.atan(t/Math.sqrt(p.RT*p.RT-t*t));
    const pl=M(new THREE.PlaneGeometry(2.6,.34),new THREE.MeshStandardMaterial({map:lt,transparent:true,depthWrite:false,roughness:.7,polygonOffset:true,polygonOffsetFactor:-2}),
      s*(p.flat+t-.035*Math.sin(ang)),yy+.035*Math.cos(ang),(p.z0+p.z1)/2,g,false,true);
    pl.rotation.set(0,-s*Math.PI/2,0);pl.rotateX(-(Math.PI/2-ang));}
  // a few scuffs where wheels hit the flat bottom
  const scuff=canvasTex(256,64,(x,w,h)=>{for(let i=0;i<40;i++){x.strokeStyle='rgba(20,5,8,.12)';x.lineWidth=1+Math.random()*3;const y=h/2+(Math.random()-.5)*h*.7;x.beginPath();x.moveTo(Math.random()*w*.3,y);x.lineTo(w*.7+Math.random()*w*.3,y+(Math.random()-.5)*8);x.stroke();}});
  const sc=M(new THREE.PlaneGeometry(2.2,2.4),new THREE.MeshStandardMaterial({map:scuff,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),0,b+.002,(p.z0+p.z1)/2,g,false,true);sc.rotation.x=-Math.PI/2;}

 /* --- concrete quarter pipe with blue coping --- */
 {const p=S.qp;const pts=[[p.x1,0],[p.x1,p.H],[p.x0+p.TX,p.H],...curve(26,k=>{const t=p.TX*(1-k);return [p.x0+t,p.RT-Math.sqrt(p.RT*p.RT-t*t)];}),[p.x0,0]];
  prof(pts.reverse(),p.z0,p.z1,[conSide,conM]);tube([p.x0+p.TX,p.H,p.z0],[p.x0+p.TX,p.H,p.z1],.05,blue);}
 /* --- funbox: ramps up both ends, flat top, blue steel edges --- */
 {const p=S.fb,a=p.top+p.ramp;prof([[-a,0],[-p.top,p.h],[p.top,p.h],[a,0]],p.x0,p.x1,[conSide,conM],true);
  for(const s of [-1,1]){tube([p.x0,p.h,s*p.top],[p.x1,p.h,s*p.top],.03,blue);
    for(const x of [p.x0,p.x1])M(box(.05,.05,p.top*2),blue,x,p.h-.02,0,g);}}
 /* --- kicker --- */
 {const p=S.kick,L=p.z1-p.z0;const pts=[[p.z1,0],...curve(20,k=>{const t=L*k;return [p.z1-t,p.R-Math.sqrt(p.R*p.R-t*t)];}),[p.z0,0]];
  prof(pts.map(([u,v])=>[u,v]),p.x0,p.x1,[conSide,conM],true);const top=p.R-Math.sqrt(p.R*p.R-L*L);tube([p.x0,top,p.z0],[p.x1,top,p.z0],.04,blue);}
 /* --- platform, bank and stairs with a handrail --- */
 {const p=S.plat,w=p.x1-p.x0,cx=(p.x0+p.x1)/2;
  prof([[p.bank,0],[p.z0,p.h],[p.z1,p.h],[p.z1,0]],p.x0,p.x1,[conSide,conM],true);
  M(box(w,.05,.05),blue,cx,p.h-.02,p.z1,g);
  for(let i=0;i<p.n;i++){const hh=p.h*(1-(i+1)/(p.n+1)),z0=p.z1+i*p.step;M(box(w,hh,p.step),conM,cx,hh/2,z0+p.step/2,g);M(box(w,.04,.04),blue,cx,hh-.02,z0+p.step-.02,g);}
  const r=S.rails[1];tube([r.a[0],r.y0,r.a[1]],[r.b[0],r.y1,r.b[1]],.035,blue);
  for(const [zz,yy] of [[r.a[1]+.05,p.h],[r.b[1]-.05,0]]){const k=(zz-r.a[1])/(r.b[1]-r.a[1]),top=r.y0+(r.y1-r.y0)*k;tube([r.a[0],yy,zz],[r.a[0],top,zz],.03,blue);}}
 /* --- ledge with steel edges, and a flat bar on legs --- */
 {const p=S.ledge,cx=(p.x0+p.x1)/2,cz=(p.z0+p.z1)/2,L=p.z1-p.z0;M(box(p.x1-p.x0,p.h,L),conSide,cx,p.h/2,cz,g);
  const tp=M(new THREE.PlaneGeometry(p.x1-p.x0,L),conM,cx,p.h+.001,cz,g,false,true);tp.rotation.x=-Math.PI/2;
  for(const x of [p.x0,p.x1])M(box(.04,.04,L),steel,x,p.h-.018,cz,g);}
 {const r=S.rails[0];tube([r.a[0],r.y0,r.a[1]],[r.b[0],r.y1,r.b[1]],.035,blue);
  for(const k of [.06,.5,.94]){const zz=r.a[1]+(r.b[1]-r.a[1])*k;tube([r.a[0],0,zz],[r.a[0],r.y0,zz],.028,blue);M(box(.18,.02,.18),dark,r.a[0],.01,zz,g);}}
 // when you're walking, the rails are solid (on wheels the skate park code handles them)
 for(const r of S.rails){if(r.k!=='rail')continue;const L=Math.hypot(r.b[0]-r.a[0],r.b[1]-r.a[1]),n=Math.ceil(L/.2);for(let i=0;i<=n;i++){const k=i/n,[x,w]=z.toWorld(r.a[0]+(r.b[0]-r.a[0])*k,r.a[1]+(r.b[1]-r.a[1])*k);obs.push({x,z:w,r:.06,skRail:1});}}
 /* --- around the edge: light poles, benches, a trash can --- */
 {const pole=std('#5b6068',{metalness:.7,roughness:.4}),lampG=lampMat;
  for(const [x,w] of [[-8.3,-4.3],[8.6,-4.6],[-8.6,4.3],[8.3,4.5]]){M(cyl(.07,.1,5.2,10),pole,x,2.6,w,g);const hd=M(box(.7,.14,.32),pole,x*.97,5.2,w*.97,g);hd.lookAt(z.toWorld(0,0)[0],5.2,z.toWorld(0,0)[1]);
    const lm=M(box(.6,.03,.24),lampG,x*.97,5.12,w*.97,g,false,false);lm.rotation.copy(hd.rotation);LAMPS.push(lm);z.ob(x,w,.15);}
  const wood=std('#a9744a',{roughness:.8});
  for(const [x,w,ry] of [[-7.2,6.3,.9],[7.4,6.1,-.9]]){const bg=new THREE.Group();bg.position.set(x,0,w);bg.rotation.y=ry;g.add(bg);
    M(box(1.6,.08,.45),wood,0,.45,0,bg);M(box(1.6,.35,.06),wood,0,.75,-.22,bg);for(const s of [-1,1])M(box(.08,.45,.42),dark,s*.7,.22,0,bg);z.ob(x,w,.7);}
  const can=M(cyl(.3,.28,.9,18),std('#3f6b4a',{roughness:.6,metalness:.3}),-2.8,.45,8.4,g);M(cyl(.33,.33,.08,18),dark,-2.8,.92,8.4,g);z.ob(-2.8,8.4,.35);}
 signpost(z);}
