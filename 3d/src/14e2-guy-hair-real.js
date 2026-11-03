/* ================= REAL-LOOKING GUY HAIR =================
   Guy hair used to be a smooth ball (the girls' hair cap) with a few lumps on it, so every cut looked like a helmet.
   Now each guy cut is built like a real one:
   - a shell that follows the head's own shape (shellGeo in 14d-barber-looks.js) with a natural hairline: the
     forehead, temples, sideburns in front of the ears, the ears left free, and a tapered nape
   - the hair picture runs the way the hair is combed (each cut has its own flow), so you see strands, not a helmet
   - locks: thin tapered locks of hair laid along the comb direction (or spikes, curls, locs, a bun), darker at the
     roots. They are all merged into ONE shape per cut: one draw call and little graphics memory.
   - hats: under a cap or beanie the hair is pressed flat, a sweatband squeezes the hair right where it sits, and
     hats are sized to the head and hair (fitGuyHat), so nothing floats.
   14-avatar.js calls guyRealHair for a guy whose hair id is in GUY_REAL (girls keep their own styles), and fitGuyHat
   for a guy's hat. The barber cuts (BCUT) get pressed under hats too (barberDress calls guyHatPress).
   Shapes are cached by cut + hat + face, so friends with the same cut share one copy (GH_CACHE). */
const GH_UP=new THREE.Vector3(0,1,0);
const ghRand=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
// where a guy's hair starts. c: 1 at the face, 0 at the ears, -1 at the back. Lower numbers = more hair.
// front/side/back move the line (minus = lower), burns = how far the sideburns come down in front of the ears
function guyLine(d,{front=0,side=0,back=-.35,burns=1}={}){const c=d.z/(Math.hypot(d.x,d.z)||1);
  return hairline(d)-.3*burns*Math.exp(-(((c-.42)/.1)**2))+front*smooth(.3,.9,c)+side*Math.exp(-((c/.4)**2))+back*smooth(-.12,-.5,c);}
// 1 well inside the hair, 0 at the hairline; below the line a small minus number so the shell tucks under the skin
const gGrow=(d,L,w=.1)=>{const h=guyLine(d,L);return d.y<=h?(d.y-h)*.06:smooth(h,h+w,d.y);};
const fwd=d=>smooth(.1,.85,d.z);// 1 at the front of the head
const sideC=d=>d.z/(Math.hypot(d.x,d.z)||1);
// comb directions (tangent to the head): away from a point P, down, around the front-to-back line (for a part)
const away=(d,P)=>{const t=d.clone().multiplyScalar(d.dot(P)).sub(P);return t.lengthSq()<1e-8?new THREE.Vector3(1,0,0):t.normalize();};
const downT=d=>{const t=d.clone().multiplyScalar(d.y);t.y-=1;return t.lengthSq()<1e-8?new THREE.Vector3(0,0,1):t.normalize();};
const partAng=d=>Math.atan2(d.x,d.y);
const fromPart=(d,p)=>{const t=new THREE.Vector3(d.y,-d.x,0).multiplyScalar(partAng(d)>p?1:-1);return t.lengthSq()<1e-8?downT(d):t.normalize();};
// how the hair picture wraps: strands run away from P (U = how many times round, a whole number so the picture joins up)
const poleUV=(P,U=4)=>{const A=new THREE.Vector3().crossVectors(P,Math.abs(P.y)<.9?GH_UP:new THREE.Vector3(0,0,1)).normalize(),B=new THREE.Vector3().crossVectors(P,A);
  const f=d=>[Math.atan2(d.dot(B),d.dot(A))/(Math.PI*2)*U,Math.acos(Math.max(-1,Math.min(1,d.dot(P))))/1.8];f.U=U;return f;};
const partUV=p=>{const f=d=>[d.z*2.5,Math.abs(partAng(d)-p)/1.8];f.U=0;return f;};
const CROWN=new THREE.Vector3(0,.55,-.83).normalize(),MAN_BUN=new THREE.Vector3(0,.5,-.87).normalize();

// the shell: shellGeo plus a picture that runs the way the hair is combed
function ghShell(av,thick,uvf,fz=.0008){const g=shellGeo(av,thick),p=g.attributes.position,n=p.count,HS=av.hs,d=new THREE.Vector3(),uv=[];
  for(let i=0;i<n;i++){d.set(p.getX(i)/HS.x,p.getY(i)/HS.y,p.getZ(i)/HS.z).normalize();uv.push(...uvf(d));}
  // where the picture wraps round (u jumps by U), give those triangles their own copies of the points
  const ix=Array.from(g.index.array),U=uvf.U,extra=[];
  if(U)for(let t=0;t<ix.length;t+=3){const us=[0,1,2].map(j=>uv[ix[t+j]*2]);if(Math.max(...us)-Math.min(...us)<U/2)continue;
    for(let j=0;j<3;j++)if(uv[ix[t+j]*2]<U/2){extra.push(ix[t+j]);uv.push(uv[ix[t+j]*2]+U,uv[ix[t+j]*2+1]);ix[t+j]=n+extra.length-1;}}
  const pos=new Float32Array((n+extra.length)*3);pos.set(p.array);extra.forEach((s,k)=>pos.set(p.array.subarray(s*3,s*3+3),(n+k)*3));
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));out.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  out.setIndex(ix);g.dispose();out.computeVertexNormals();
  // bumpy like real hair, but only where there is hair, so the hairline stays a clean line
  if(fz){const P2=out.attributes.position,N=out.attributes.normal;for(let i=0;i<P2.count;i++){const x=P2.getX(i),y=P2.getY(i),z=P2.getZ(i);d.set(x/HS.x,y/HS.y,z/HS.z).normalize();
    const a=fz*smooth(0,.012,thick(d)),q=(f)=>Math.sin(x*f*1.3+Math.sin(y*f*.7))*Math.sin(y*f+z*f*.9)*Math.cos(z*f*1.1-x*f*.5),h=a*(.55+.45*q(fz>.003?110:220))+(fz>.003?a*.3*q(330):0);
    P2.setXYZ(i,x+N.getX(i)*h,y+N.getY(i)*h,z+N.getZ(i)*h);}out.computeVertexNormals();}
  return out;}

// locks of hair: each is a line of points with an outward direction at each point, made into a thin tapered tube
// (S sides, w wide and h thick) and merged into one shape. Roots are darker, like real hair.
function ghLocks(locks){let nv=0,ni=0;for(const L of locks){const S=L.S||4;nv+=L.pts.length*S;ni+=(L.pts.length-1)*S*6;}
  const pos=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Uint8Array(nv*3),idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
  const T=new THREE.Vector3(),B=new THREE.Vector3(),N2=new THREE.Vector3(),q=new THREE.Vector3();let v=0,k=0;
  for(const L of locks){const S=L.S||4,K=L.pts.length,base=v,tp=L.taper||(t=>.25+.75*Math.sin(Math.min(1,t*6+.15)*Math.PI/2)*(1-Math.pow(t,1.8)*.94));
    for(let i=0;i<K;i++){const t=i/(K-1),c=L.pts[i];T.subVectors(L.pts[Math.min(i+1,K-1)],L.pts[Math.max(i-1,0)]).normalize();B.crossVectors(T,L.nrm[i]).normalize();N2.crossVectors(B,T);
      const f=tp(t),sh=(L.c||1)*(.62+.38*smooth(0,L.vl>1?.12:.4,t));
      for(let j=0;j<S;j++){const a=j/S*Math.PI*2+(L.tw||0)*t;q.copy(c).addScaledVector(B,Math.cos(a)*L.w*f).addScaledVector(N2,Math.sin(a)*L.h*f);
        pos.set([q.x,q.y,q.z],v*3);uv.set([(L.u0||0)+j/S*(L.su||.05)+(L.tw?t*.4:0),t*(L.vl||1)],v*2);const cb=Math.min(255,sh*255);col.set([cb,cb,cb],v*3);v++;}
      if(i<K-1)for(let j=0;j<S;j++){const a=base+i*S+j,b=base+i*S+(j+1)%S;idx.set([a,b,a+S,b,b+S,a+S],k);k+=6;}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setAttribute('color',new THREE.BufferAttribute(col,3,true));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();return g;}

// walk a lock from the root d0 along the cut's comb direction for len meters, riding in the hair (off = how deep
// in it, 1 = on top) plus lift(t) above it. Long hair that reaches hang (a height on the head) falls straight down.
function ghTrace(av,cut,d0,len,{step=.0065,off=.85,lift=()=>0,hang=-9,spread=.25,wave=0,wig=.25,seed=0,flat=null}={}){
  const pts=[],nrm=[],d=d0.clone();let s=0;
  for(;s<=len;s+=step){const t=cut.T(d);if(s>0&&t<.0012&&d.y>hang)break;if(d.y<=hang)break;
    const tt=flat!=null&&t>flat?flat:t;pts.push(shellPt(av,d,Math.max(.001,tt*off)+lift(s/len)));nrm.push(d.clone());
    const f=cut.flow(d),side=new THREE.Vector3().crossVectors(d,f);f.addScaledVector(side,Math.sin(s*90+seed)*wig).addScaledVector(d,-f.dot(d)).normalize();
    d.addScaledVector(f,step/.13).normalize();}
  // hanging part: straight down and a little out, with a soft wave
  if(d.y<=hang&&pts.length&&s<len){const p=pts[pts.length-1].clone(),out=new THREE.Vector3(p.x,0,p.z).normalize();
    for(let i=1;s<len;s+=step,i++){const w=Math.sin(i*.55+seed)*wave;p.addScaledVector(GH_UP,-step).addScaledVector(out,step*spread+w*step);pts.push(p.clone());nrm.push(out.clone());}}
  return pts.length>2?{pts,nrm}:null;}
// roots spread evenly over the head (a golden-angle spiral), where keep(d) says so
function ghRoots(n,keep){const out=[];for(let i=0;i<n;i++){const y=1-(i+.5)/n*1.6,d=dirOf(i*2.39996,y);if(keep(d))out.push(d);}return out;}
// a curl: a little spring standing on the hair at d (r = how wide, len = how tall, turns)
function ghCoil(av,cut,d,{r=.008,len=.022,turns=2,w=.0035,c=1,rnd=Math.random,lean=.5}={}){
  const base=shellPt(av,d,cut.T(d)*.55),A=d.clone().addScaledVector(cut.flow(d),lean).normalize(),X=new THREE.Vector3().crossVectors(A,GH_UP);
  if(X.lengthSq()<1e-6)X.set(1,0,0);X.normalize();const Y=new THREE.Vector3().crossVectors(A,X),ph=rnd()*6.28,pts=[],nrm=[],K=Math.round(turns*7);
  for(let i=0;i<=K;i++){const t=i/K,a=ph+t*turns*Math.PI*2,rr=r*(1-.25*t);pts.push(base.clone().addScaledVector(A,t*len).addScaledVector(X,Math.cos(a)*rr).addScaledVector(Y,Math.sin(a)*rr));nrm.push(A.clone());}
  return {pts,nrm,w,h:w,S:4,c,taper:t=>1-.5*t,su:.03,d,bump:1};}

/* ---------- the cuts ----------
   thick(d): how thick the hair is (meters) in direction d; flow(d): comb direction; uv: how the picture runs;
   locks(av,cut,rnd): the locks; extra(av,cut,rnd,parts): more pieces as [geometry, 'hair'|'tie'] */
const shortLocks=(n,len,{w=.0065,h=.0028,off=1,lift=0,seed=1,keep=()=>true,flat=null}={})=>(av,cut,rnd)=>ghRoots(n,d=>cut.T(d)>.003&&keep(d)).map((d,i)=>{
  const L=ghTrace(av,cut,d,len*(.7+rnd()*.6),{off,seed:i,flat,lift:t=>lift*t*t});return L&&Object.assign(L,{w:w*(.8+rnd()*.4),h,c:.9+rnd()*.16,u0:rnd()});}).filter(Boolean);
const GUY_REAL={
  // 💇‍♂️ Crew cut: short and neat, a little longer on top, pushed forward with a tiny lift at the front
  crop:{thick:d=>{const e=gGrow(d,{},.08);return e<0?e:e*(.0035+.011*onTop(d,.35,.85)+.004*fwd(d)*onTop(d,.4,.8));},
    flow:d=>away(d,CROWN),uv:poleUV(CROWN),locks:shortLocks(900,.04,{w:.0075,h:.002,lift:.004})},
  // 🪒 Buzz cut: clipped all over, you can almost see the scalp
  buzz:{thick:d=>{const e=gGrow(d,{},.05);return e<0?e:e*.0026;},flow:d=>away(d,CROWN),uv:poleUV(CROWN,6),buzz:1},
  // 😎 Swoop: short sides, long on top, swept up off the forehead and back
  quiff:{thick:d=>{const e=gGrow(d,{},.08);if(e<0)return e;const top=onTop(d,.3,.75);return e*(.004+top*(.012+.05*Math.pow(fwd(d),1.2)));},
    flow:d=>{const P=new THREE.Vector3(0,.15,1).normalize();return away(d,P).addScaledVector(downT(d),.15*(1-onTop(d,.2,.6)));},uv:poleUV(new THREE.Vector3(0,.15,1).normalize()),
    locks:(av,cut,rnd)=>{const out=[];
      // top: from the front hairline, up over the swoop and back
      for(const d of ghRoots(2600,d=>d.z>.25&&d.y>guyLine(d)&&d.y<guyLine(d)+.1&&Math.abs(d.x)<.5)){const L=ghTrace(av,cut,d,.13+rnd()*.05,{off:1,seed:out.length,wig:.12});if(L)out.push(Object.assign(L,{w:.011,h:.003,c:.9+rnd()*.18,u0:rnd()}));}
      for(const d of ghRoots(700,d=>cut.T(d)>.003&&d.z<.4)){const L=ghTrace(av,cut,d,.05+rnd()*.03,{off:1,seed:out.length});if(L)out.push(Object.assign(L,{w:.008,h:.002,c:.9+rnd()*.16,u0:rnd()}));}
      return out;}},
  // 👔 Side part: a neat line on one side, hair combed across the top and down the sides
  sidepart:{thick:d=>{const e=gGrow(d,{},.08);if(e<0)return e;const a=partAng(d),g=Math.exp(-(((a+.5)/.05)**2))*onTop(d,.3,.6);
      return e*(.005+.014*onTop(d,.3,.8)+.008*fwd(d)*smooth(-.5,.2,a)*onTop(d,.35,.7))*(1-.85*g);},
    flow:d=>fromPart(d,-.5).addScaledVector(new THREE.Vector3(0,0,-1),.12).addScaledVector(downT(d),.25*(1-onTop(d,.3,.7))),uv:partUV(-.5),
    locks:shortLocks(900,.08,{w:.009,h:.0024,off:1})},
  // 🌀 Curly top: faded sides, a pile of tight curls on top
  curltop:{thick:d=>{const e=gGrow(d,{side:.05},.07);return e<0?e:e*(.003+.018*onTop(d,.5,.8));},flow:d=>away(d,CROWN),uv:poleUV(CROWN),curls:1,
    locks:(av,cut,rnd)=>ghRoots(700,d=>d.y>.62&&cut.T(d)>.008).map(d=>ghCoil(av,cut,d,{r:.0075+rnd()*.003,len:.016+rnd()*.012,turns:1.6+rnd(),w:.0036,c:.8+rnd()*.3,rnd}))},
  // ⚡ Spiky: short sides, gelled spikes pointing up and back
  spiky:{thick:d=>{const e=gGrow(d,{},.08);return e<0?e:e*(.004+.01*onTop(d,.4,.8));},flow:d=>away(d,new THREE.Vector3(0,.3,1).normalize()),uv:poleUV(CROWN),shine:1,
    locks:(av,cut,rnd)=>{const out=ghRoots(260,d=>d.y>.45&&cut.T(d)>.005).map((d,i)=>{const L=ghTrace(av,cut,d,.03+rnd()*.02,{off:.6,seed:i,wig:.05,lift:t=>t*(.03+rnd()*.012)});
        return L&&Object.assign(L,{w:.012+rnd()*.004,h:.007,c:.85+rnd()*.25,u0:rnd(),taper:t=>1-t*.96,d,bump:1});}).filter(Boolean);
      return out.concat(shortLocks(700,.03,{w:.007,h:.002})(av,cut,rnd));}},
  // 🏄 Surfer flow: parted in the middle, long and wavy, tucked behind the ears down to the jaw
  flow:{line:{side:.05,back:-.25},thick:d=>{const e=gGrow(d,{side:.05,back:-.25},.1);return e<0?e:e*(.01+.012*onTop(d,.3,.8));},
    flow:d=>away(d,new THREE.Vector3(0,.82,.57).normalize()).addScaledVector(downT(d),.3),uv:poleUV(new THREE.Vector3(0,.82,.57).normalize()),
    locks:(av,cut,rnd)=>ghRoots(950,d=>cut.T(d)>.005&&d.y>.15).map((d,i)=>{const L=ghTrace(av,cut,d,.25+rnd()*.03,{off:1,seed:i,step:.011,hang:-.05+.1*Math.max(0,sideC(d)),spread:.15,wave:.12,wig:.08});
      return L&&Object.assign(L,{w:.02+rnd()*.006,h:.0025,c:.92+rnd()*.1,u0:rnd(),vl:2});}).filter(Boolean),
    // behind the locks: a soft sheet of hair from the ears down, so you never see through it
    extra:(av,cut,rnd,add)=>{const g=new THREE.CylinderGeometry(1,1.12,1,40,6,true,.95,Math.PI*2-1.9),p=g.attributes.position,d=new THREE.Vector3();
      for(let i=0;i<p.count;i++){const y=p.getY(i),t=.5-y;d.set(p.getX(i),0,p.getZ(i)).normalize();d.y=-.05;d.normalize();const q=shellPt(av,d,cut.T(d)*.8);
        const r=Math.hypot(q.x,q.z)*(1+t*.12)+Math.sin(Math.atan2(q.x,q.z)*14)*.003*t;p.setXYZ(i,Math.sin(Math.atan2(p.getX(i),p.getZ(i)))*r,q.y-t*.15,Math.cos(Math.atan2(p.getX(i),p.getZ(i)))*r);}
      g.computeVertexNormals();add(g,'sheet');}},
  // 🥷 Man bun: hair pulled back tight into a bun at the back of the head
  manbun:{line:{side:.04},thick:d=>{const e=gGrow(d,{side:.04},.06);return e<0?e:e*.0065;},flow:d=>away(d,MAN_BUN).negate(),
    uv:poleUV(new THREE.Vector3(0,.3,1).normalize()),
    locks:(av,cut,rnd)=>{const BUN=MAN_BUN,out=[];
      for(const d of ghRoots(420,d=>cut.T(d)>.003&&d.angleTo(BUN)>.3)){const L=ghTrace(av,cut,d,d.angleTo(BUN)*.13,{off:.95,seed:out.length,wig:.08});if(L)out.push(Object.assign(L,{w:.008,h:.0022,c:.85+rnd()*.25,u0:rnd()}));}
      return out;},
    extra:(av,cut,rnd,add)=>{const BUN=MAN_BUN,c=shellPt(av,BUN,.033),A=BUN.clone(),X=new THREE.Vector3(1,0,0),Y=new THREE.Vector3().crossVectors(A,X).normalize(),locks=[];
      // the bun: locks wound round and round
      for(let i=0;i<14;i++){const tilt=(i/14-.5)*2.2,r=.026+(i%3)*.003,ph=rnd()*6.28,pts=[],nrm=[];
        for(let k=0;k<=22;k++){const a=ph+k/22*Math.PI*1.7,v=new THREE.Vector3().addScaledVector(X,Math.cos(a)).addScaledVector(Y,Math.sin(a)*Math.cos(tilt)).addScaledVector(A,Math.sin(a)*Math.sin(tilt)*.8);
          pts.push(c.clone().addScaledVector(v,r));nrm.push(v.clone().normalize());}locks.push({pts,nrm,w:.011,h:.006,c:.85+rnd()*.25,u0:rnd(),taper:t=>1-.6*Math.pow(t,3)});}
      add(ghLocks(locks),'locks');const core=fuzz(new THREE.IcosahedronGeometry(.025,2),.002,120);core.translate(c.x,c.y,c.z);add(core,'hair');
      const tie=new THREE.TorusGeometry(.017,.0045,6,18);tie.lookAt(A);const tp=shellPt(av,BUN,.012);tie.translate(tp.x,tp.y,tp.z);add(tie,'tie');}},
  // ☁️ Afro: big, round and soft all over, with tiny coils
  afro:{line:{side:-.05,burns:0},thick:d=>{const e=gGrow(d,{side:-.05,burns:0},.3);if(e<0)return e;
      // the outside is a round ball, a bit wider than tall
      const o=new THREE.Vector3(d.x/1.08,d.y,d.z),R=.185,C=new THREE.Vector3(0,.055,-.045),a=o.lengthSq(),b=o.dot(C),out=(b+Math.sqrt(Math.max(0,b*b-a*(C.lengthSq()-R*R))))/a;
      return e*Math.max(.015,out-.13)*(1-.6*fwd(d)*smooth(.9,.5,d.y));},flow:d=>downT(d),uv:poleUV(GH_UP,8),afro:1,
    locks:(av,cut,rnd)=>ghRoots(850,d=>cut.T(d)>.02).map(d=>{const c=ghCoil(av,cut,d,{r:.005,len:.009,turns:1.2,w:.0026,c:.93+rnd()*.08,rnd,lean:0});c.S=4;
      const sh=shellPt(av,d,cut.T(d)-.004);const b0=c.pts[0].clone();c.pts.forEach(p=>p.sub(b0).add(sh));return c;})},
  // 💇 Short: a classic short guy's cut, textured on top, a little fringe falling forward
  pixie:{thick:d=>{const e=gGrow(d,{front:-.05},.09);return e<0?e:e*(.005+.02*onTop(d,.3,.8)+.008*fwd(d)*onTop(d,.4,.8));},
    flow:d=>away(d,CROWN).addScaledVector(new THREE.Vector3(1,0,0),.35*fwd(d)),uv:poleUV(CROWN),
    locks:(av,cut,rnd)=>{const out=shortLocks(1000,.06,{w:.0085,h:.0022,off:1,lift:.003})(av,cut,rnd);
      // the fringe: a few locks that fall a little onto the forehead
      for(const d of ghRoots(900,d=>d.z>.6&&d.y>guyLine(d)&&d.y<guyLine(d)+.1&&Math.abs(d.x)<.35)){const L=ghTrace(av,cut,d,.04+rnd()*.03,{off:1,seed:out.length,wig:.1});
        if(L){const b=L.pts.length,n=1+Math.floor(rnd()*3);for(let i=1;i<=n;i++){const q=L.pts[b-1].clone().addScaledVector(L.nrm[b-1],.003*i/3);q.y-=.005*i;q.x+=.007*i;L.pts.push(q);L.nrm.push(L.nrm[b-1]);}
          out.push(Object.assign(L,{w:.009,h:.0022,c:.9+rnd()*.15,u0:rnd()}));}}
      return out;}},
  // 🌀 Curly: a full head of soft curls, a bit over the ears
  curly:{line:{side:-.12,back:-.45,front:-.04,burns:.4},thick:d=>{const e=gGrow(d,{side:-.12,back:-.45,front:-.04,burns:.4},.12);return e<0?e:e*(.016+.014*onTop(d,.2,.8));},
    flow:d=>downT(d).addScaledVector(away(d,CROWN),.6),uv:poleUV(CROWN),curls:1,
    locks:(av,cut,rnd)=>ghRoots(620,d=>cut.T(d)>.008).map(d=>ghCoil(av,cut,d,{r:.009+rnd()*.004,len:.02+rnd()*.012,turns:1.8+rnd(),w:.0042,c:.8+rnd()*.3,rnd,lean:.8}))},
  // 🪢 Locs: rope-like locs from all over the head, hanging to the shoulders
  locs:{line:{back:-.3},thick:d=>{const e=gGrow(d,{back:-.3},.06);return e<0?e:e*.006;},flow:d=>away(d,new THREE.Vector3(0,.25,.97).normalize()).addScaledVector(downT(d),.3),
    uv:poleUV(new THREE.Vector3(0,.25,.97).normalize()),
    locks:(av,cut,rnd)=>ghRoots(150,d=>cut.T(d)>.003&&d.y>-.2).map((d,i)=>{const L=ghTrace(av,cut,d,.24+rnd()*.06,{off:1,seed:i,step:.009,hang:-.2+.25*Math.max(0,sideC(d)),spread:.2,wave:.15,wig:.05,lift:()=>.006});
      return L&&Object.assign(L,{w:.0078,h:.0078,S:6,tw:9,su:.25,c:.8+rnd()*.3,u0:rnd(),vl:3,taper:t=>t<.04?.75:1-.35*Math.pow(t,4)});}).filter(Boolean)},
};

/* ---------- hats on real hair ---------- */
// what a hat does to the hair under it: covers it (pressed flat), squeezes a band around it, or sits on top
const GH_TOP=new Set(['crown','party','tiara','horns','hibiscus','bow','flowers']),GH_BAND=new Set(['sweatband','visor','mummywrap','headband']);
const hatKind=look=>{const h=look&&look.hat;return !h||!h.id?null:GH_TOP.has(h.id)?'top':GH_BAND.has(h.id)?'band':'cover';};
const BAND_Y=.44;// how high a sweatband sits (as d.y)
function guyHatPress(look,thick){const k=hatKind(look);
  if(k==='cover')return d=>{const t=thick(d);if(t<=0)return t;const s=smooth(-.1,.35,d.y);return t*(1-s)+Math.min(t,.008)*s;};
  if(k==='band')return d=>{const t=thick(d);if(t<=0)return t;const s=Math.exp(-(((d.y-BAND_Y)/.06)**2));return t*(1-s)+(t>.02?t*.75:Math.min(t,.003))*s;};
  return thick;}
// is d where a hat would squash a curl, spike or bun?
const underHat=(look,d)=>{const k=hatKind(look);return k==='cover'?d.y>.12:k==='band'?Math.abs(d.y-BAND_Y)<.12:false;};

const GH_CACHE=new Map();
function guyRealHair(av,look,P,m,mat){const h=look.hair,id=h.id,S=GUY_REAL[id],hk=hatKind(look)||'',F=av.face||{};
  const key=[id,hk,av.glam?1:0,F.nose,av.jaw].join('|');
  let pieces=GH_CACHE.get(key);
  if(!pieces){const rnd=ghRand(id.length*977+7),cut={T:guyHatPress(look,S.thick),flow:d=>S.flow(d)};pieces=[];
    pieces.push([ghShell(av,cut.T,S.uv,S.buzz?0:S.afro?.006:.0008),'shell']);
    if(S.locks){let L=S.locks(av,cut,rnd);if(hk)L=L.filter(l=>hk==='cover'?l.nrm[0].y<.3:!l.bump||!underHat(look,l.d||l.nrm[0]));if(L.length)pieces.push([ghLocks(L),'locks']);}
    if(S.extra&&!(id==='manbun'&&hk==='cover'))S.extra(av,cut,rnd,(g,k)=>pieces.push([g,k]));
    GH_CACHE.set(key,pieces);if(GH_CACHE.size>6)GH_CACHE.delete(GH_CACHE.keys().next().value);}
  if(S.shine){m.roughness=.2;m.clearcoat=.6;m.clearcoatRoughness=.2;}
  // the shell: the comb-direction picture; a buzz cut gets a fine clipped-hair picture instead
  if(S.buzz){m.map=m.bumpMap=buzzTex();m.bumpScale=.6;m.sheen=.2;m.roughness=.75;m.color.lerp(new THREE.Color(look.skin),.3);}
  if(S.afro||S.curls){m.map=m.bumpMap=curlTex();m.bumpScale=.8;m.sheen=.5;m.roughness=.6;}
  m.side=THREE.FrontSide;
  // the locks use the same hair, with darker roots (vertex colors)
  const ml=m.clone();ml.vertexColors=true;ml.side=THREE.DoubleSide;ml.sheen=Math.min(ml.sheen,.5);if(S.afro||S.curls||id==='locs'){ml.map=ml.bumpMap=hairTex();ml.bumpScale=.4;}av.mats.push(ml);
  const tie=mat('#1d1d24','shiny');
  let ms=null;for(const [g,k] of pieces){if(k==='sheet'&&!ms){ms=m.clone();ms.side=THREE.DoubleSide;av.mats.push(ms);}const o=P(g,k==='locks'?ml:k==='tie'?tie:k==='sheet'?ms:m,av.head,0,0,0);if(k==='locks')o.castShadow=false;}}
// a fine clipped-hair picture (buzz cut) and a tight-curl picture (afro, curls)
let BUZZ_TEX=null,CURL_TEX=null;
function buzzTex(){if(BUZZ_TEX)return BUZZ_TEX;BUZZ_TEX=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#e6e6e6';x.fillRect(0,0,w,h);
  for(let i=0;i<9000;i++){const v=Math.random();x.fillStyle=v<.7?`rgba(20,20,20,${.45+Math.random()*.45})`:`rgba(255,255,255,${.15+Math.random()*.25})`;const a=Math.random()*.6-.3;x.save();x.translate(Math.random()*w,Math.random()*h);x.rotate(a);x.fillRect(0,0,1,2+Math.random()*2);x.restore();}},6);return BUZZ_TEX;}
function curlTex(){if(CURL_TEX)return CURL_TEX;CURL_TEX=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#c4c4c4';x.fillRect(0,0,w,h);
  for(let i=0;i<1400;i++){const cx=Math.random()*w,cy=Math.random()*h,r=2+Math.random()*3.5;x.lineWidth=1+Math.random()*1.2;x.strokeStyle=Math.random()<.55?`rgba(30,30,30,${.25+Math.random()*.35})`:`rgba(255,255,255,${.2+Math.random()*.3})`;
    x.beginPath();x.arc(cx,cy,r,Math.random()*6,Math.random()*6+4);x.stroke();}},4);return CURL_TEX;}

// size a guy's hat to his head and hair, so it sits on the hair instead of floating around it.
// parts: the hat's pieces. Covering hats are sized to the hair, bands hug the hair where they sit, small hats sit on top.
function fitGuyHat(av,look,parts){const k=hatKind(look);if(!k)return;parts=parts.filter(o=>o.parent===av.head);if(!parts.length)return;
  const h=look.hair||{},S=GUY_REAL[h.id],cut=BCUT[h.id];
  const raw=S?S.thick:cut?cut[3]:d=>.012,T=guyHatPress(look,d=>Math.max(0,raw(d)));
  const R=(d)=>shellPt(av,d.normalize(),T(d));
  const grp=(sx,sy,sz,y=0)=>{const g=new THREE.Group();g.scale.set(sx,sy,sz);g.position.y=y;av.head.add(g);av.parts.push(g);g.geometry={dispose(){}};return g;};
  const cl=(v,a,b)=>Math.min(b,Math.max(a,v));
  // small hats (a crown is .085 wide at .135 up) sit where the hair is at that width
  if(k==='top'){let y=0;for(let a=0;a<4;a++)y+=R(dirOf(a*Math.PI/2,.74)).y/4;const g=grp(1,1,1,y-.135);parts.forEach(o=>g.add(o));return;}
  if(k==='cover'){const x=R(new THREE.Vector3(1,.3,0)).x,zf=R(new THREE.Vector3(0,.3,1)).z,zb=-R(new THREE.Vector3(0,.3,-1)).z,top=R(GH_UP.clone()).y;
    // a little higher than it was made for (so the brim clears the eyebrows), and as tall as the hair
    const lift=.022,g=grp(cl((x+.012)/.149,.84,1.08),cl((top+.012-lift)/.156,.8,1.08),cl(((zf+zb)/2+.012)/.152,.84,1.08),lift);parts.forEach(o=>g.add(o));return;}
  // a sweatband: a soft band that follows the head and hair all the way round
  if(look.hat.id==='sweatband'&&parts.length===1){const o=parts[0],pts=[],nrm=[];
    for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,d=dirOf(a,BAND_Y-.04*Math.max(0,-Math.cos(a))),p=R(d.clone());p.addScaledVector(d,.011);pts.push(p);nrm.push(new THREE.Vector3(p.x,0,p.z).normalize());}
    const g=ghLocks([{pts,nrm,w:.016,h:.0055,S:10,taper:()=>1}]);o.parent.remove(o);const b=new THREE.Mesh(g,o.material);b.castShadow=true;av.head.add(b);av.parts.push(b);return;}
  // other bands: each piece is sized for its own height on the head
  for(const o of parts){const y=o.position.y,yd=cl(y/(.13*av.hs.y),-.6,.9);const x=R(new THREE.Vector3(1,yd,0)).x,zf=R(new THREE.Vector3(0,yd,1)).z,zb=-R(new THREE.Vector3(0,yd,-1)).z;
    const g=grp(cl((x+.01)/.142,.7,1.1),1,cl(((zf+zb)/2+.01)/.142,.7,1.1));g.position.z=(zf-zb)/2;o.position.z-=g.position.z;g.add(o);}}
// 🪢 the barber's Twists: short rope twists that stand up a little and fall forward and down, instead of pegs
BCUT.twists[4]=(k,m)=>{const av=k.av,look=av.look||{},rnd=ghRand(4242),cut={T:guyHatPress(look,d=>Math.max(0,BCUT.twists[3](d))),flow:d=>away(d,CROWN).addScaledVector(downT(d),.4)};
  const L=ghRoots(260,d=>cut.T(d)>.008&&d.y>.35&&!(hatKind(look)==='cover')).map((d,i)=>{const t=ghTrace(av,cut,d,.04+rnd()*.025,{off:1,seed:i,step:.006,wig:.05,lift:s=>.006+.012*Math.sin(Math.min(1,s*1.5)*Math.PI/2)});
    return t&&Object.assign(t,{w:.0065,h:.0065,S:6,tw:10,su:.25,c:.85+rnd()*.2,u0:rnd(),taper:t=>t>.85?1-(t-.85)*3:1});}).filter(Boolean);
  if(!L.length)return;const ml=m.clone();ml.vertexColors=true;av.mats.push(ml);k.P(ghLocks(L),ml,k.head).castShadow=false;};
