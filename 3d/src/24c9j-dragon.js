/* ===== 🐉 A real-looking dragon (built with the dinosaur helpers in 24c9h-dinos.js) =====
   ZOO_BUILD.dragonR: a big scaly reptile on four clawed legs, with a long neck, a horned head with heavy brow ridges, a row of spines
   from head to tail, and huge leathery bat-like wings (skin stretched between long finger bones) that fold along its sides on the ground
   and open to fly (24h-flying.js sets a.wingOpen). Not a cartoon: earthy scale colours, darker on the back and pale underneath.
   Kid-safe: no fire, it just puffs a little smoke from its nose now and then.
   Colours come from F.dcol {top, belly, mem} so one model makes every dragon in the game:
     🐉 Ember the baby dragon (a little buddy who flies along with you), ⭐ Nova the starlight dragon (the 50 ⭐ prize ride, midnight
     blue with a sparkle) and 🔥 Draco the great dragon (the hardest 🦖 Dino challenges, 24c9i-dinos-more.js).
   Ride: scale s => F.ride = s*2.12+.06 (you sit at the base of the neck, in front of the wings: seat .9) */
ZOO_BUILD.dragonR=function(g,body,o){const by=1.5,D=this.F.dcol||{},top=D.top||'#5a2a1e',bel=D.belly||'#c8a070',memC=D.mem||'#6a3226',
  m=dnSkin('dragon'),C=[top,bel,(x,y,z,ny)=>ny>.15?(Math.sin(z*9+x*6)*Math.sin(z*4)>.4?.18:0):0],claw=dnClaw(),horn=dnHornM(),
  spine=dnM('drSpine'+top,()=>phys(new THREE.Color(top).multiplyScalar(.55),{roughness:.5,clearcoat:.3})),
  mem=dnM('drMem'+memC,()=>phys(memC,{roughness:.7,side:THREE.DoubleSide,sheen:.4,sheenColor:new THREE.Color('#ffd0a0')}));
  body.position.y=by;
  const T=dnTube([[0,.1,1.3],[0,.05,.6],[0,0,0],[0,.05,-.6],[0,0,-1.1]],[.45,.6,.66,.6,.45],m,body,C,{sx:.82,seg:22,rad:16});
  const tail=new THREE.Group();tail.position.set(0,0,-1.05);body.add(tail);
  const TL=dnTube([[0,0,.1],[0,-.1,-1],[0,-.25,-2.2],[0,-.3,-3.3],[0,-.18,-4.2]],[.45,.32,.18,.08,.02],m,tail,C,{sx:.8,seg:24,rad:12});
  // a row of spines down the back and the tail, getting smaller toward the tip
  const sp=(par,p,h)=>dnHorn(par,spine,0,p.y-.04,p.z,h*.32,h,-.55,0);
  for(let i=0;i<9;i++){const q=.08+i*.1;if(this.F.ride&&q<.3)continue;sp(body,T.top(q),.22);}// (not under the saddle)
  for(let i=0;i<12;i++)sp(tail,TL.top(.03+i*.075),.2-i*.014);
  // four strong legs with clawed feet
  for(const [sx,sz,ph] of [[-1,1,0],[1,1,Math.PI],[-1,-1,Math.PI],[1,-1,0]]){const fr=sz>0,H=fr?by-.05:by+.02,
    lg=dnLeg(this,g,sx*(fr?.42:.45),H,fr?.95:-.72,ph,fr?[[0,0,0],[sx*.05,-.6,.12],[0,-1.1,-.05],[0,-H+.15,.05]]:[[0,0,0],[0,-.6,.25],[0,-1.15,-.15],[0,-H+.15,.03]],fr?[.24,.16,.12,.1]:[.36,.22,.13,.11],m,C);
    if(!fr)M(dnPaint(sph(.36,14,10),C[0],C[1]),m,-sx*.05,-.3,.08,lg).scale.set(.72,1.3,1.05);
    dnToes(lg,[0,-H+.1,.05],fr?.24:.3,.06,m,C,claw,.38,3);}
  // the neck, curving up, and the head: long snout, heavy brows, swept-back horns, cheek spikes
  const neck=new THREE.Group();neck.position.set(0,by+.2,1.4);g.add(neck);
  const NK=dnTube([[0,-.2,-.3],[0,.2,.2],[0,.7,.55],[0,1.1,.75]],[.42,.32,.24,.2],m,neck,C,{sx:.82,seg:16,rad:12});
  for(let i=0;i<5;i++){const p=NK.top(.15+i*.17);dnHorn(neck,spine,0,p.y-.03,p.z-.05,.05,.16,-1.1,0);}
  const head=new THREE.Group();head.position.set(0,1.15,.82);neck.add(head);
  dnTube([[0,.05,-.22],[0,.08,.15],[0,0,.5],[0,-.05,.78]],[.22,.23,.16,.09],m,head,C,{sx:.8,seg:14,rad:12});
  const jaw=new THREE.Group();jaw.position.set(0,-.12,0);head.add(jaw);
  dnTube([[0,0,-.15],[0,-.04,.35],[0,-.02,.7]],[.16,.11,.06],m,jaw,[top,bel],{sx:.85,sy:.6,seg:10,rad:10});
  for(const s of [-1,1]){dnHorn(head,horn,s*.12,.2,-.12,.06,.62,-1.3,-s*.25);dnHorn(head,horn,s*.08,.18,0,.035,.25,-1.2,-s*.4);
    for(const k of [0,1])dnHorn(head,spine,s*.17,-.08-k*.07,-.05-k*.06,.03,.18,-1.4,-s*1.1);
    M(dnPaint(sph(.08,10,8),C[0],C[1]),m,s*.15,.2,.32,head).scale.set(1,.55,1.8);
    dnEye(this,head,s*.17,.12,.3,.045,'#e0a020',s*1.1);M(sph(.025,6,4),dnDark(),s*.05,.03,.76,head,false,false).scale.set(1,.6,1.6);}
  // the wings: arm out to the wrist, four long fingers fanning back, and the skin stretched between them back to the body.
  // inner lets the skin hang down along the flank when the wing folds (FarmAnimal.update swings the wing back by fold)
  this.wings=[];const inners=[];
  const wingG=dnM('drWingG',()=>{const s=new THREE.Shape(),P=[[1.3,-.15],[3.0,.3],[2.7,1.0],[2.1,1.5],[1.4,1.7]];
    s.moveTo(0,-.05);s.lineTo(.7,-.25);s.lineTo(P[0][0],P[0][1]);s.lineTo(P[1][0],P[1][1]);
    for(let i=1;i<P.length-1;i++){const a=P[i],b=P[i+1];s.quadraticCurveTo((a[0]+b[0])/2-.25,(a[1]+b[1])/2-.12,b[0],b[1]);}
    s.quadraticCurveTo(.7,1.3,0,1.25);s.lineTo(0,-.05);const g=new THREE.ShapeGeometry(s,8);g.rotateX(-Math.PI/2);return g;});
  const fly=this.F.pal==='fly';
  for(const s of [-1,1]){const w=new THREE.Group();w.position.set(s*.38,.45,.55);body.add(w);const I=new THREE.Group();w.add(I);inners.push(I);
    M(wingG,mem,0,0,0,I,true,false).scale.x=s;
    dnTube([[0,0,0],[s*.7,.22,.1],[s*1.3,.2,.15]],[.09,.07,.055],m,I,C,{seg:8,rad:8});
    for(const [x,z] of [[3.0,-.3],[2.7,-1.0],[2.1,-1.5],[1.4,-1.7]])dnTube([[s*1.3,.2,.15],[s*(1.3+(x-1.3)*.5),.12,.15+(z-.15)*.5],[s*x,.02,z]],[.04,.028,.008],m,I,C,{seg:8,rad:6});
    M(new THREE.ConeGeometry(.035,.16,8),claw,s*1.32,.24,.24,I,false,false).rotation.x=Math.PI/2;
    this.wings.push({w,sx:s,fly:fly?1:0,fold:1.3});}
  // breathing; the skin hangs down when the wings fold; now and then it lifts its head and puffs a little smoke from its nose
  let pT=5+Math.random()*10,puff=0;const nose=new THREE.Vector3();
  this.tick=(t,dt,run)=>{body.scale.y=1+Math.sin(t*1.1)*.01;if(fly)this.wingOpen=1;const op=this.wingOpen||0;
    for(const I of inners){I.rotation.x=-(1-op)*1.3;I.scale.z=1-.4*(1-op);}
    pT-=dt;if(pT<0&&run<.1&&!this.ridden){pT=12+Math.random()*14;puff=1.6;}
    if(puff>0){puff-=dt;const k=Math.sin(Math.min(1,(1.6-puff)/1.6)*Math.PI);head.rotation.x=-k*.3;jaw.rotation.x=k*.25;
      if(this.g.visible&&this.g.parent&&Math.random()<dt*10){head.localToWorld(nose.set(0,.03,.8));burst(nose,'#c8c2b8',3,.5,.06);}}
    else{head.rotation.x*=.9;jaw.rotation.x*=.9;}};
  if(this.F.sparkle)this.sparkle=true;
  dnSaddle(this,body,.07,.9,.55,.82,1,'#3a2a5a');
  Object.assign(o,{neck,head,tail,nTilt:0,gz:.45,size:2,h:by+1.6,rad:1.1,dustR:[.7,.7,1]});};
