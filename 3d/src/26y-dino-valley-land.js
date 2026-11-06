/* ===== 🦖 Dino Valley: the land under it and the footbridge over the canal (the valley itself is 12i-place-dino-valley.js) =====
   Dino Valley sits on the canal's far bank behind the Barber Shop and the Sweet Bakery: its own BANK_LAND sector (DVL.a0 .. DVL.a1,
   ground:1 because it draws its own grass; you walk on it like any bank land) and a wooden footbridge at DVL.bridge, like the ones to
   the Sports Park. Pushing the sector here (before 26z-big-world.js) flattens the big world's hills there and moves its fence round it. */
const DVL={a0:296,a1:328,bridge:312};DVL.out=Z.dino.d+Z.dino.r+4;
BANK_LAND.push({id:'dino',a0:DVL.a0,a1:DVL.a1,out:DVL.out,ground:1});
MAPC.dino='#7fae5a';
// grass out to the edge of the bank, with a sandy edge down to the water (like the airfield and the ball fields)
{const wg=new THREE.Group();scene.add(wg);const th0=deg(DVL.a0-90),th=deg(DVL.a1-DVL.a0);
 const m=M(new THREE.RingGeometry(BANK.out-.4,DVL.out,24,1,th0,th),groundMat,0,.004,0,wg,false,true);m.rotation.x=-Math.PI/2;
 const sand=std('#e8cf9a',{map:TEX.sand,roughness:1});
 M(new THREE.CylinderGeometry(DVL.out,DVL.out+2,3,24,1,true,deg(DVL.a0),deg(DVL.a1-DVL.a0)),sand,0,-1.5,0,wg,false,true);
 for(const a of [DVL.a0,DVL.a1]){const L=DVL.out-BANK.out+.4,w=M(new THREE.PlaneGeometry(L,3),sand,0,0,0,wg,false,true);const r=(BANK.out+DVL.out)/2;
   w.position.set(Math.sin(deg(a))*r,-1.5,Math.cos(deg(a))*r);w.rotation.y=deg(a)-Math.PI/2;w.material.side=THREE.DoubleSide;}}
/* ---------- 🌉 the footbridge over the canal ---------- */
{const F={a:DVL.bridge,t0:R-2.5,t1:BANK.in+2.8,w:2.4,top:2.3};F.ux=Math.sin(deg(F.a));F.uz=Math.cos(deg(F.a));DVL.fb=F;
  const loc=(x,z)=>[x*F.ux+z*F.uz,x*F.uz-z*F.ux],deck=t=>F.top*Math.sin(Math.PI*Math.max(0,Math.min(1,(t-F.t0)/(F.t1-F.t0))))+.1;
  SURF.push({h(x,z){const [t,s]=loc(x,z);if(t<F.t0||t>F.t1||Math.abs(s)>F.w/2-.18)return -1;return deck(t);}});
  BANK_BRIDGES.push({a:F.a,w:F.w,on:p=>HIGH.on||deck(loc(p.x,p.z)[0])<.5});
  const g=new THREE.Group();g.rotation.y=deg(F.a);scene.add(g);const B=advBatch(),hw=F.w/2,P=(s,t,dy=0)=>new THREE.Vector3(s,deck(t)+dy,t);
  for(let t=F.t0+.15;t<F.t1;t+=.3){const sl=Math.atan2(deck(t+.1)-deck(t-.1),.2);B.add(box(F.w,.07,.27),ADM.wood,0,deck(t)-.04,t,-sl,0,0);}
  for(const s of [-1,1]){
    for(let t=F.t0;t<F.t1-.4;t+=.4)B.stick(P(s*(hw-.08),t,-.12),P(s*(hw-.08),t+.4,-.12),.07,ADM.dark,6);
    for(let t=F.t0+.3;t<F.t1;t+=1.6){B.stick(P(s*(hw-.06),t,-.05),P(s*(hw-.06),t,1.02),.05,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,1.02),P(s*(hw-.06),Math.min(F.t1-.3,t+1.6),1.02),.045,ADM.wood,8);
      B.stick(P(s*(hw-.06),t,.55),P(s*(hw-.06),Math.min(F.t1-.3,t+1.6),.55),.025,ADM.rope,5);}
    const arch=[];for(let i=0;i<=24;i++){const t=F.t0+3+(F.t1-F.t0-6)*i/24;arch.push(P(s*(hw-.2),t,-.18-(.6*Math.sin(Math.PI*i/24))));}
    for(let i=0;i<24;i++)B.stick(arch[i],arch[i+1],.11,ADM.dark,7);}
  for(const t of [F.t0+3.4,F.t1-3.4])B.add(new THREE.CylinderGeometry(.55,.75,2.4,10),ADM.stone,0,-.9,t,0,0,0,2.4,1,1);
  B.done(g);
  MAP_DRAW.push((x,w2s,k)=>{const a=w2s(F.ux*F.t0,F.uz*F.t0),b=w2s(F.ux*F.t1,F.uz*F.t1);x.strokeStyle='#9a6a43';x.lineWidth=Math.max(2.5,F.w*k);x.lineCap='butt';x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();});}
