/* ================= AVATAR ================= */
// hands with real slim fingers and feet with toes (one merged mesh each); nail spots are saved for manicures and pedicures
const LIMB={};const UP=new THREE.Vector3(0,1,0);
function limbPart(geo,pos,dir){const q=new THREE.Quaternion().setFromUnitVectors(UP,dir.clone().normalize());geo.applyQuaternion(q);geo.translate(pos.x,pos.y,pos.z);return geo;}
function handGeo(sx){const k='h'+sx;if(LIMB[k])return LIMB[k];const parts=[],nails=[];
  const palm=new RoundedBoxGeometry(.048,.052,.0135,4,.0064);{const pp=palm.attributes.position;for(let i=0;i<pp.count;i++){const y=pp.getY(i),t=Math.min(1,Math.max(0,(y+.004)/.03));pp.setX(i,pp.getX(i)*(1-.22*t));pp.setZ(i,pp.getZ(i)*(1+.25*t));}}palm.translate(0,-.027,0);parts.push(palm);
  // long slim fingers: index (by the thumb), middle, ring, pinky. Each tapers to a rounded tip.
  [[.0158,.046,.0052,-.05],[.0053,.051,.0054,-.015],[-.0053,.048,.0052,.02],[-.0155,.039,.0047,.065]].forEach(([fx,L,r,fan])=>{fx*=-sx;fan*=-sx;
    const d=new THREE.Vector3(Math.sin(fan),-Math.cos(fan),0).applyAxisAngle(new THREE.Vector3(1,0,0),.12).normalize();const n=new THREE.Vector3(0,0,1).addScaledVector(d,-d.z).normalize();
    const b=new THREE.Vector3(fx,-.049,0);parts.push(limbPart(new THREE.CylinderGeometry(r,r*.8,L,12),b.clone().addScaledVector(d,L/2),d.clone().negate()));
    const tip=new THREE.SphereGeometry(r*.8,12,8);tip.translate(...b.clone().addScaledVector(d,L).toArray());parts.push(tip);
    const kn=new THREE.SphereGeometry(r*1.02,12,8);kn.translate(...b.toArray());parts.push(kn);
    nails.push({p:b.clone().addScaledVector(d,L-r*.35).addScaledVector(n,r*.7),d,n,r:r*.95});});
  const td=new THREE.Vector3(-sx*.6,-1,.42).normalize(),tb=new THREE.Vector3(-sx*.022,-.016,.003),tn=new THREE.Vector3(-sx*.6,.25,.75).normalize().addScaledVector(td,0).normalize();
  const TL=.032;parts.push(limbPart(new THREE.CylinderGeometry(.0068,.0052,TL,12),tb.clone().addScaledVector(td,TL/2),td.clone().negate()));
  const tt=new THREE.SphereGeometry(.0052,12,8);tt.translate(...tb.clone().addScaledVector(td,TL).toArray());parts.push(tt);
  nails.push({p:tb.clone().addScaledVector(td,TL-.002).addScaledVector(tn,.0042),d:td.clone(),n:tn.clone().addScaledVector(td,-tn.dot(td)).normalize(),r:.0055});
  const g=mergeGeometries(parts.map(x=>{x=x.index?x.toNonIndexed():x;['uv1','uv2'].forEach(a=>x.deleteAttribute(a));return x;}));g.computeVertexNormals();return LIMB[k]={g,nails};}
function footGeo(sx){const k='f'+sx;if(LIMB[k])return LIMB[k];const parts=[],nails=[];const m=-sx;
  // a slim footprint: round heel, narrow arch, wider ball (x>0 is the big toe side)
  const pts=[[0,-.046],[.014,-.041],[.019,-.025],[.015,.01],[.018,.045],[.023,.07],[.02,.084],[.008,.088],[-.006,.086],[-.019,.079],[-.024,.062],[-.023,.035],[-.02,0],[-.019,-.028],[-.012,-.042]];
  const sh=new THREE.Shape();pts.forEach(([x,y],i)=>i?sh.lineTo(x*m,y):sh.moveTo(x*m,y));
  const body=new THREE.ExtrudeGeometry(sh,{depth:.018,bevelEnabled:true,bevelThickness:.009,bevelSize:.007,bevelSegments:4,curveSegments:8});body.rotateX(Math.PI/2);
  body.computeBoundingBox();body.translate(0,-.062-body.boundingBox.min.y,0);
  const bp=body.attributes.position;for(let i=0;i<bp.count;i++){const y=bp.getY(i),z=bp.getZ(i);if(y>-.05){const t=Math.min(1,Math.max(0,(.06-z)/.1)),x=bp.getX(i)/.026,dome=Math.max(0,1-x*x);bp.setY(i,y+(y+.05)*(1.6*t*t*(3-2*t)+.7*dome));}}
  parts.push(body);
  // tapered toes: the big toe leads, the rest get smaller and step back
  [[.0138,.0094,.078,.034],[.0012,.0066,.08,.028],[-.0092,.0062,.077,.025],[-.0178,.0057,.072,.021],[-.025,.0052,.066,.017]].forEach(([x,r,zz,L])=>{x*=m;const d=new THREE.Vector3(x*.4,-.12,1).normalize();
    const b=new THREE.Vector3(x,-.06+r+.006,zz);parts.push(limbPart(new THREE.CylinderGeometry(r*.92,r,L,12),b.clone().addScaledVector(d,L/2),d.clone()));
    const tip=new THREE.SphereGeometry(r*.92,12,8);tip.translate(...b.clone().addScaledVector(d,L).toArray());parts.push(tip);
    const n=new THREE.Vector3(0,1,0).addScaledVector(d,-d.y).normalize();nails.push({p:b.clone().addScaledVector(d,L-r*.25).addScaledVector(n,r*.78),d,n,r:r*.95});});
  const g=mergeGeometries(parts.map(x=>{x=x.index?x.toNonIndexed():x;['uv1','uv2'].forEach(a=>x.deleteAttribute(a));return x;}));g.computeVertexNormals();return LIMB[k]={g,nails};}
const HIP=.82;
function lookMat(color,kind='fabric'){const c=new THREE.Color(color);
  switch(kind){
    case 'skin':return new THREE.MeshPhysicalMaterial({color:c,roughness:.5,sheen:.6,sheenColor:new THREE.Color('#ffb0a0'),sheenRoughness:.6,clearcoat:.08});
    case 'hair':return new THREE.MeshPhysicalMaterial({color:c,roughness:.38,sheen:1,sheenColor:c.clone().offsetHSL(0,0,.25),sheenRoughness:.3});
    case 'shiny':return new THREE.MeshPhysicalMaterial({color:c,roughness:.22,clearcoat:1,clearcoatRoughness:.08});
    case 'sparkle':return new THREE.MeshPhysicalMaterial({color:c,map:TEX.glitter,metalness:.55,roughness:.28,iridescence:.4,sheen:.5});
    case 'galaxy':{if(!TEX.galaxy){TEX.galaxy=canvasTex(256,256,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);for(let i=0;i<260;i++){const r=Math.random();x.fillStyle=r<.15?'#ffe27a':r<.3?'#ffb3e6':'#ffffff';x.globalAlpha=.4+Math.random()*.6;const z=Math.random()<.9?1+Math.random()*1.6:3;x.beginPath();x.arc(Math.random()*w,Math.random()*h,z,0,7);x.fill();}
        x.globalAlpha=1;x.font='16px serif';x.textAlign='center';for(let i=0;i<10;i++){x.fillStyle='#fff3b0';x.fillText('★',Math.random()*w,Math.random()*h);}},3);}
      return new THREE.MeshPhysicalMaterial({color:c,roughness:.45,sheen:.8,sheenColor:new THREE.Color('#b9a6ff'),emissive:new THREE.Color('#ffffff'),emissiveMap:TEX.galaxy,emissiveIntensity:1.1,clearcoat:.3});}
    case 'metal':return new THREE.MeshStandardMaterial({color:c,metalness:1,roughness:.2});
    case 'glass':return new THREE.MeshPhysicalMaterial({color:c,roughness:0,metalness:.1,transparent:true,opacity:.55,clearcoat:1,iridescence:.6});
    case 'gem':return new THREE.MeshPhysicalMaterial({color:c,roughness:.05,metalness:.2,clearcoat:1,emissive:c,emissiveIntensity:.35});
    case 'fur':return new THREE.MeshPhysicalMaterial({color:c,map:TEX.fur,bumpMap:TEX.fur,bumpScale:3,roughness:1,sheen:1,sheenColor:c.clone().lerp(new THREE.Color('#ffffff'),.6),sheenRoughness:.8,flatShading:false});
    case 'denim':return new THREE.MeshPhysicalMaterial({color:c,map:TEX.denim,roughness:.9,sheen:.3});
    case 'tulle':return new THREE.MeshPhysicalMaterial({color:c,roughness:.7,sheen:1,sheenColor:new THREE.Color('#ffffff'),transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false});
    default:return new THREE.MeshPhysicalMaterial({color:c,roughness:.82,sheen:1,sheenColor:c.clone().lerp(new THREE.Color('#ffffff'),.5),sheenRoughness:.45});}}
function skirtGeo(r0,r1,y0,y1,{curve=.8,folds=.05,k=12,seg=48,mermaid=false}={}){const pts=[];const N=18;
  for(let i=0;i<=N;i++){const t=i/N;let r;if(mermaid){r=t<.7?r0+(.16-r0)*t/.7:.16+(r1-.16)*Math.pow((t-.7)/.3,1.6);}else r=r0+(r1-r0)*Math.pow(t,curve);pts.push(new THREE.Vector2(r,y0+(y1-y0)*t));}
  const g=new THREE.LatheGeometry(pts.reverse(),seg);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const t=(y0-y)/(y0-y1);const a=Math.atan2(x,z);const f=1+folds*Math.sin(a*k)*t*t;p.setX(i,x*f);p.setZ(i,z*f);}
  g.computeVertexNormals();return g;}

/* face makeup layer: a thin see-through shell over the front of the face that we paint on */
const FACE={p0:Math.PI/2-.8,pl:1.6,t0:.75,tl:1.75,r:.1312};
function faceXY(x,y,z,W,hs){x/=hs?hs.x:1;y/=hs?hs.y:1.08;z/=hs?hs.z:1;const r=Math.hypot(x,y,z);return [(Math.atan2(z,-x)-FACE.p0)/FACE.pl*W,(Math.acos(y/r)-FACE.t0)/FACE.tl*W];}
const defaultMakeup=()=>({shadow:null,liner:'none',linerC:'#2b1d16',lashes:'natural',lips:null,lipLiner:null,gloss:false,blush:'pink',gems:false});
const rgbOf=h=>{const n=parseInt(h.slice(1),16);return `${n>>16&255},${n>>8&255},${n&255}`;};
const BLUSH={pink:'255,110,150',peach:'255,150,110',rose:'220,80,110'};
/* sculpted doll head: a sphere pushed in and out along each direction (nose, cheekbones, eye sockets, jaw, chin) */
const FACEOPT=[['eyes','Eye shape',[['almond','👁️','Almond'],['doe','🦌','Doe'],['cat','🐱','Cat eye'],['round','⚪','Round']]],['nose','Nose',[['straight','👃','Straight'],['petite','✨','Petite'],['button','🔘','Button']]],['lips','Lips',[['full','💋','Full'],['pout','😗','Pouty'],['heart','💗','Heart'],['soft','🙂','Soft']]]];
const NOSE={straight:{h:.18,w:.04,top:.06,tip:.035},petite:{h:.13,w:.036,top:.0,tip:.03},button:{h:.11,w:.05,top:-.04,tip:.055}};
function sculpt(d,nose='straight'){const N=NOSE[nose]||NOSE.straight;const g=(cx,cy,cz,w)=>Math.exp(-((d.x-cx)**2+(d.y-cy)**2+(d.z-cz)**2)/(w*w));const sm=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
  let r=1;const front=sm(.55,.92,d.z);
  // nose: a narrow ridge that grows from between the eyes to the tip, then tucks under
  const dy=d.y,T=N.top;let prof=0;if(dy<T&&dy>-.24)prof=N.h*Math.pow((T-dy)/(T+.24),1.5);else if(dy<=-.24&&dy>-.33)prof=N.h*(1-Math.pow((-.24-dy)/.09,2));
  r+=Math.max(0,prof)*Math.exp(-((d.x/(N.w+(T-Math.min(T,dy))*.07))**2))*front;r+=N.tip*g(0,-.235,.97,.06)*front;
  for(const sx of [-1,1]){r+=.035*g(sx*.075,-.275,.955,.05)*front;
    r-=.04*g(sx*.33,.06,.94,.13);r+=.022*g(sx*.33,.3,.89,.14);
    r+=.05*g(sx*.58,-.1,.8,.2);r-=.025*g(sx*.62,-.45,.66,.18);}
  if(dy<-.15)r-=.11*sm(.15,.85,-dy)*Math.pow(Math.abs(d.x),1.15);
  r+=.04*g(0,-.8,.58,.22)+.03*g(0,-.46,.88,.2)-.012*g(0,-.62,.79,.08);
  if(d.z<0)r+=.04*(-d.z);
  return r;}
function headGeo(HS,patch,lift=0,nose){const g=patch?new THREE.SphereGeometry(1,72,56,FACE.p0,FACE.pl,FACE.t0,FACE.tl):new THREE.SphereGeometry(1,96,72);const p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();const r=(sculpt(v,nose)+lift)*.13;p.setXYZ(i,v.x*r*HS.x,v.y*r*HS.y,v.z*r*HS.z);}g.computeVertexNormals();return g;}
const headRay=new THREE.Raycaster();
class Avatar{
  constructor(look,name,tagColor='#ff4d8d',paint=false){
    this.paintable=paint;this.g=new THREE.Group();this.look=JSON.parse(JSON.stringify(look));this.name=name;this.parts=[];this.mats=[];
    this.t=Math.random()*10;this.phase=0;this.blink=2+Math.random()*3;this.emote=null;this.legAmp=.55;this.air=0;this.wings=[];this.cape=null;
    this.buildBody();this.dress(this.look);
    this.tag=sprite(labelTex(name,{size:60,fg:tagColor,bg:'rgba(255,255,255,.9)',border:null}),.9,.225);this.tag.position.y=1.86;this.g.add(this.tag);}
  part(geo,mat,parent,x=0,y=0,z=0,outfit=true){const m=M(geo,mat,x,y,z,parent,true,true);if(outfit)this.parts.push(m);return m;}
  buildBody(){
    const s=this.skin=lookMat(this.look.skin,'skin');const B=(geo,parent,x,y,z)=>this.part(geo,s,parent,x,y,z,false);
    const G0=this.look.style!=='cute';this.legX=G0?.04:0;this.hip=HIP+this.legX*2;this.lift=0;
    const hips=this.hips=new THREE.Group();hips.position.y=this.hip;this.g.add(hips);
    B(sph(.13,24,16),hips).scale.set(1.05,.75,.8);
    const spine=this.spine=new THREE.Group();hips.add(spine);
    const chest=B(new THREE.CapsuleGeometry(.12,.2,6,20),spine,0,.24,0);chest.scale.set(this.look.style!=='cute'?1.0:1.12,1,this.look.style!=='cute'?.74:.78);
    B(this.look.style!=='cute'?cyl(.036,.044,.16,14):cyl(.042,.048,.14,14),spine,0,.52,0);
    const head=this.head=new THREE.Group();head.position.y=.68;spine.add(head);
    const glam=this.glam=this.look.style!=='cute';const HS=this.hs=glam?new THREE.Vector3(.9,1.06,.98):new THREE.Vector3(1,1.08,1);
    let surf;
    const F=this.face=Object.assign({eyes:'almond',nose:'straight',lips:'full'},this.look.face||{});
    if(glam){const hg=headGeo(HS,false,0,F.nose);const hm=B(hg,head);const tmp=new THREE.Mesh(hg);tmp.updateMatrixWorld(true);
      surf=(x,y,off=0)=>{headRay.set(new THREE.Vector3(x,y,.5),new THREE.Vector3(0,0,-1));const h=headRay.intersectObject(tmp,false)[0];return (h?h.point.z:.1)+off;};}
    else{B(sph(.13,40,30),head).scale.copy(HS);surf=(x,y,off=0)=>HS.z*Math.sqrt(Math.max(0,.0169-(x/HS.x)**2-(y/HS.y)**2))+off;}
    for(const sx of [-1,1])B(sph(.025,10,8),head,sx*.127*HS.x,-.005,0).scale.set(.6,1,.8);
    this.eyes=[];this.iris=new THREE.MeshPhysicalMaterial({color:this.look.eyes,roughness:.35,clearcoat:.6,clearcoatRoughness:.15});
    const white=new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.25,clearcoat:.6,emissive:'#ffffff',emissiveIntensity:.18}),dark=new THREE.MeshStandardMaterial({color:'#111',roughness:.2}),shine=new THREE.MeshBasicMaterial({color:'#ffffff'});
    const lash=this.lashM=new THREE.MeshStandardMaterial({color:'#2b1d16',roughness:.6});
    this.lipM=new THREE.MeshPhysicalMaterial({color:'#d77a86',roughness:.45,clearcoat:.3});this.linerM=new THREE.MeshPhysicalMaterial({color:'#c2185b',roughness:.5});this.lipLiner=[];
    const lip=(r,x,y,z,sx,sy,sz,rz=0)=>{const m=M(sph(r,24,14),this.lipM,x,y,z,head,false);m.scale.set(sx,sy,sz);m.rotation.z=rz;const l=M(sph(r,24,14),this.linerM,x,y,z-.0015,head,false);l.scale.set(sx*1.13,sy*1.32,sz);l.rotation.z=rz;l.visible=false;this.lipLiner.push(l);};
    if(glam){
      // fashion-doll face: almond eyes tilted up, thick lash line with a wing, arched brows, small nose, full lips
      this.eyeR=[.036,.024];
      this.browM=new THREE.MeshStandardMaterial({color:'#3a2618',roughness:.7});
      const ES={almond:[1.22,.76,.12,.92],round:[1.1,.92,.04,.95],cat:[1.36,.64,.3,.9],doe:[1.18,.88,-.04,1.0]}[F.eyes]||[1.22,.76,.12,.92];
      for(const sx of [-1,1]){const eg=new THREE.Group();eg.position.set(sx*.044,.008,surf(.044,.008,-.011));eg.rotation.z=sx*ES[2];eg.rotation.y=sx*.2;eg.scale.setScalar(ES[3]);head.add(eg);
        M(sph(.03,24,16),white,0,0,0,eg,false).scale.set(ES[0],ES[1],.5);
        M(sph(.0185,20,14),this.iris,0,-.001,.0085,eg,false).scale.set(1,1,.45);
        const ring=M(new THREE.TorusGeometry(.0172,.0022,8,28),dark,0,-.001,.0122,eg,false);ring.material=new THREE.MeshStandardMaterial({color:'#2a1a12',roughness:.4,transparent:true,opacity:.55});
        M(sph(.0088,14,10),dark,0,-.001,.0135,eg,false).scale.set(1,1,.4);
        M(sph(.0028,8,6),shine,.0065,.0065,.0172,eg,false);M(sph(.0014,8,6),shine,-.006,-.007,.016,eg,false);
        const up=M(new THREE.TorusGeometry(.03,.0042,8,28,Math.PI),lash,0,.0005,.0035,eg,false);up.scale.set(ES[0],ES[1]*1.03,1);
        const wing=M(new THREE.CapsuleGeometry(.0028,F.eyes==='cat'?.018:.012,4,8),lash,sx*.0325*ES[0],.006,.0035,eg,false);wing.rotation.z=-sx*1.0;
        const low=M(new THREE.TorusGeometry(.03,.0016,6,24,Math.PI),new THREE.MeshStandardMaterial({color:'#5a3a2a',roughness:.7}),0,-.001,.003,eg,false);low.scale.set(ES[0]*.98,ES[1],1);low.rotation.z=Math.PI;
        eg.userData.sx=sx;eg.userData.rx=.03*ES[0];eg.userData.ry=.03*ES[1];this.eyes.push(eg);
        const pts=[[.016,.047],[.036,.057],[.055,.0595],[.074,.052],[.085,.043]].map(([x,y])=>new THREE.Vector3(sx*x,y,surf(x,y,.0025)));
        const tube=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.0024,6,false);const tp=tube.attributes.position;
        M(tube,this.browM,0,0,0,head,false);}
      const LS={full:[1,1,1],heart:[.85,1.05,1.2],soft:[1.12,.8,.82],pout:[.92,1.2,1.15]}[F.lips]||[1,1,1];
      const ux=.0072*LS[0];lip(.0135,-ux,-.0525,surf(ux,-.0525,-.0052),1.18*LS[0],.44*LS[1],.5,.13);lip(.0135,ux,-.0525,surf(ux,-.0525,-.0052),1.18*LS[0],.44*LS[1],.5,-.13);
      lip(.019,0,-.0638,surf(0,-.0638,-.0072),1.1*LS[0],.5*LS[2],.55);
    }else{
      this.eyeR=[.03,.034];
      B(sph(.013,10,8),head,0,-.028,.13);
      for(const sx of [-1,1]){const eg=new THREE.Group();eg.position.set(sx*.046,.005,.108);head.add(eg);
        M(sph(.028,18,14),white,0,0,0,eg,false).scale.set(1,1.1,.55);M(sph(.019,16,12),this.iris,0,-.001,.009,eg,false).scale.set(1,1.05,.45);
        M(sph(.0095,12,8),dark,0,-.001,.0135,eg,false).scale.set(1,1,.4);M(sph(.004,8,6),shine,.007,.008,.017,eg,false);
        const l=M(new THREE.TorusGeometry(.029,.0045,6,16,Math.PI),lash,0,.002,.004,eg,false);l.scale.set(1,1.15,1);
        eg.userData.sx=sx;eg.userData.rx=.03;eg.userData.ry=.034;this.eyes.push(eg);
        const brow=M(new THREE.CapsuleGeometry(.004,.03,4,8),lash,sx*.046,.058,.118,head,false);brow.rotation.z=Math.PI/2-sx*.14;}
      lip(.021,0,-.0515,.1178,1.12,.36,.5);lip(.021,0,-.0635,.1165,1.02,.46,.55);}
    // makeup shell
    const RES=this.paintable?1024:256;this.faceCv=document.createElement('canvas');this.faceCv.width=this.faceCv.height=RES;
    if(this.paintable){this.paintCv=document.createElement('canvas');this.paintCv.width=this.paintCv.height=RES;}
    this.faceTex=new THREE.CanvasTexture(this.faceCv);this.faceTex.colorSpace=THREE.SRGBColorSpace;this.faceTex.anisotropy=4;
    this.overlay=M(glam?headGeo(HS,true,.012,F.nose):new THREE.SphereGeometry(FACE.r,48,32,FACE.p0,FACE.pl,FACE.t0,FACE.tl),new THREE.MeshStandardMaterial({map:this.faceTex,transparent:true,roughness:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),0,0,0,head,false,true);
    if(!glam)this.overlay.scale.copy(HS);
    // arms
    this.arms=[];for(const sx of [-1,1]){const sh=new THREE.Group();sh.position.set(sx*(glam?.155:.165),.42,0);spine.add(sh);B(capTop(glam?.038:.042,glam?.185:.17),sh);
      const el=new THREE.Group();el.position.y=glam?-.255:-.24;sh.add(el);B(capTop(glam?.032:.036,glam?.175:.16),el);const hand=new THREE.Group();hand.position.y=glam?-.245:-.23;el.add(hand);const HG=handGeo(sx);B(HG.g,hand);hand.userData.nails=HG.nails;if(!glam)hand.scale.setScalar(1.12);
      this.arms.push({sh,el,hand,sx});}
    // legs
    this.legs=[];for(const sx of [-1,1]){const hp=new THREE.Group();const X=this.legX;hp.position.set(sx*.075,-.02,0);hips.add(hp);B(capTop(glam?.058:.062,.3+X),hp);
      const kn=new THREE.Group();kn.position.y=-.38-X;hp.add(kn);B(capTop(glam?.045:.05,.3+X),kn);const an=new THREE.Group();an.position.y=-.37-X;kn.add(an);const FG=footGeo(sx);B(FG.g,an);an.userData.nails=FG.nails;
      this.legs.push({hp,kn,an,sx});}}
  setSkin(c){this.skin.color.set(c);}
  dress(look){
    this.look=JSON.parse(JSON.stringify(look));
    for(const m of this.parts){m.parent&&m.parent.remove(m);m.geometry.dispose();}for(const m of this.mats)m.dispose();this.parts=[];this.mats=[];this.wings=[];this.cape=null;
    this.skin.color.set(look.skin);this.iris.color.set(look.eyes);this.legAmp=.55;this.lift=0;
    const mat=(c,k)=>{const m=lookMat(c,k);this.mats.push(m);return m;};
    const P=(geo,m,parent,x,y,z)=>this.part(geo,m,parent,x,y,z);
    const {spine,hips,head,arms,legs}=this;
    /* hair */
    const hair0=this.parts.length;
    {const h=look.hair,m=mat(h.c,'hair');const HL=Math.min(1.3,Math.max(.35,h.len||1)),HC=h.curl||0,HV=h.vol||0;if(h.shine){m.roughness=.16;m.clearcoat=.7;m.clearcoatRoughness=.12;m.sheenRoughness=.18;}
      const cap=P(new THREE.SphereGeometry(.142,32,20,0,Math.PI*2,0,Math.PI*.6),m,head,0,.008,-.004);cap.scale.set(1.03,1.1,1.05);cap.rotation.x=-.85;
      const side=(r0,r1,hh,y,open=1.25,zoff=-.02)=>{const g=new THREE.CylinderGeometry(r0,r1,hh,32,1,true,open,Math.PI*2-open*2);const c=P(g,m,head,0,y,zoff);c.material=m;m.side=THREE.DoubleSide;return c;};
      const id=h.id;
      const hang=(L0,amp,R1,curls)=>{const L=L0*HL,Y=-.01-L/2-(this.glam?0:0);R1*=1+HV*.35;const g=new THREE.CylinderGeometry(.148,R1,L,40,24,true,1.15,Math.PI*2-2.3);const pp=g.attributes.position;
        for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),zz=pp.getZ(i);const t=(L/2-y)/L;const f=1+Math.sin(t*L*24)*amp*t+Math.sin(Math.atan2(x,zz)*9+t*6)*amp*.45*t;pp.setX(i,x*f);pp.setZ(i,zz*f);}g.computeVertexNormals();
        P(g,m,head,0,Y,-.025);m.side=THREE.DoubleSide;if(HC>.15){const rings=[],hr=.008+HC*.014,pitch=.05-HC*.012,n=16;for(let i=0;i<n;i++){const a=1.2+i/(n-1)*(Math.PI*2-2.4),y0=Y+L/2-.06-(i%2)*.03,y1=Y-L/2+.01,pts=[];
          const cx=Math.sin(a)*R1*1.02,cz=Math.cos(a)*R1*1.02-.025,ph=i*1.7;for(let y=y0;y>=y1;y-=.006){const w=(y0-y)/pitch*Math.PI*2+ph,rr=hr*Math.min(1,(y0-y)/.04+.3);pts.push(new THREE.Vector3(cx+Math.cos(w)*rr,y,cz+Math.sin(w)*rr));}
          if(pts.length>2)rings.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*2,.0105,5,false));}
        if(rings.length){const mg=mergeGeometries(rings);rings.forEach(r=>r.dispose());P(mg,m,head,0,0,0);}}
        if(curls){const rr=new THREE.IcosahedronGeometry(.026+amp*.08,1);for(let i=0;i<15;i++){const a=1.25+i/14*(Math.PI*2-2.5);P(rr.clone(),m,head,Math.sin(a)*R1*.98,Y-L/2+.01,Math.cos(a)*R1*.98-.025);}}
        else P(sph(R1*.93,24,16),m,head,0,Y-L/2+.02,-.03).scale.set(1.08,.22,.72);};
      if(id==='long')hang(this.glam?.6:.4,HC*.11,this.glam?.172:.165,HC>.45);
      if(id==='ponytail'){P(sph(.032,12,10),m,head,0,.06,-.14);const t=P(capTop(.048*(1+HV*.4),.24*HL),m,head,0,.05,-.16);t.rotation.x=.45;}
      if(id==='buns'){for(const s of [-1,1])P(sph(.068,18,14),m,head,s*.085,.125,-.03);}
      if(id==='bob'){const bl=.18*HL;side(.15,.168*(1+HV*.3),bl,.03-bl/2,1.05,-.012);}
      if(id==='pigtails'){for(const s of [-1,1]){P(sph(.03,12,10),m,head,s*.125,.03,-.05);const t=P(capTop(.042*(1+HV*.4),.2*HL),m,head,s*.13,.03,-.05);t.rotation.z=s*.35;}}
      if(id==='curly'){const rr=new THREE.IcosahedronGeometry(.058,1);for(let i=0;i<34;i++){const pol=.5+(i%6)*.33,az=Math.PI*.5+((i*.618)%1)*Math.PI*2*.78+.25;if(Math.cos(az)>.55&&pol>1.0)continue;
          const r=.15,x=Math.sin(pol)*Math.sin(az)*r*1.05,y=Math.cos(pol)*r*1.1-.02-(pol>1.5?(pol-1.5)*.12:0),z=Math.sin(pol)*Math.cos(az)*r-.015;if(z>.06&&y<.06)continue;P(rr.clone(),m,head,x,y,z);}
        side(.15,.175,.26,-.15,1.2,-.03);}
      if(id==='braids'){for(const s of [-1,1])for(let k=0;k<Math.max(3,Math.round(8*HL));k++){P(sph(.034-k*.0018,12,10),m,head,s*(.1+k*.006),-.04-k*.05,-.06+k*.012).scale.set(1,1.2,1);}}
      if(id==='afropuff'){const b=new THREE.IcosahedronGeometry(.13*(1+HV*.3),3);const p=b.attributes.position;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i);v.multiplyScalar(1+Math.sin(v.x*90)*Math.sin(v.y*80)*Math.sin(v.z*70)*.06);p.setXYZ(i,v.x,v.y,v.z);}b.computeVertexNormals();P(b,m,head,0,.15,-.07);P(new THREE.TorusGeometry(.06,.012,8,20),mat('#ff6fae','shiny'),head,0,.08,-.06).rotation.x=Math.PI/2+.5;}
      if(id==='pixie'){cap.scale.set(1.06,1.12,1.08);}
      if(id==='updo'){cap.scale.set(1.05,1.12,1.07);const bun=P(sph(.072,20,16),m,head,0,.165,-.075);bun.scale.set(1,.85,1);const tw=P(new THREE.TorusGeometry(.058,.016,8,28),m,head,0,.128,-.062);tw.rotation.x=Math.PI/2-.55;
        const pm=mat('#ffffff','shiny');for(let i=0;i<5;i++){const a=-1.2+i*.6;P(sph(.009,8,6),pm,head,Math.sin(a)*.074,.17+Math.cos(a)*.02,-.075+Math.cos(a)*.05);}
        for(const s of [-1,1]){const t=P(capTop(.008,this.glam?.16:.12),m,head,s*.108,.03,.055);t.rotation.z=s*.12;}}
      if(id==='waves')hang(this.glam?.62:.42,.08+HC*.06,this.glam?.19:.18,true);
      if(id==='sidebraid'){side(.146,.158,.14,-.04,1.1,-.02);const cv=new THREE.CatmullRomCurve3([new THREE.Vector3(.1,-.01,-.07),new THREE.Vector3(.145,-.17,-.01),new THREE.Vector3(.13,-.32,.06),new THREE.Vector3(.105,-.5,.085)]);
        const nb=Math.max(4,Math.round(11*HL));for(let k=0;k<nb;k++){const v=cv.getPoint(k/10);const s=P(sph(.036-k*.0012,12,10),m,head,v.x+(k%2?.009:-.009),v.y,v.z);s.scale.set(1,1.3,1);}
        const e=cv.getPoint((nb-1)/10);P(sph(.016,10,8),mat('#ff6fae','shiny'),head,e.x,e.y-.035,e.z);P(new THREE.ConeGeometry(.022,.05,10),m,head,e.x,e.y-.075,e.z).rotation.x=Math.PI;}
      if(id==='highpony'){P(sph(.046,14,12),m,head,0,.135,-.115);P(new THREE.TorusGeometry(.034,.013,8,20),mat('#ff6fae','shiny'),head,0,.14,-.13).rotation.x=Math.PI/2-.9;
        const t=P(capTop(.05*(1+HV*.4),(this.glam?.34:.26)*HL),m,head,0,.145,-.15);t.rotation.x=.75;}
      (h.clips||[]).forEach(([x,y,z,c])=>{const cm=mat(c||'#ff6fae','shiny'),cg=new THREE.Group();cg.position.set(x,y,z);cg.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(x,y-.02,z).normalize());head.add(cg);this.parts.push(cg);cg.geometry={dispose(){}};
        for(const sd of [-1,1]){const l=P(new THREE.ConeGeometry(.016,.032,12),cm,cg,sd*.016,0,0);l.rotation.z=sd*Math.PI/2;l.scale.z=.45;}P(sph(.009,10,8),cm,cg);});}
    this.hairMeshes=this.parts.slice(hair0).filter(o=>o.isMesh);
    /* clothes */
    const topShell=(m,sleeve)=>{const c=P(new THREE.CapsuleGeometry(.129,.2,6,24),m,spine,0,.24,0);c.scale.set(1.12,1,.8);
      for(const a of arms){if(sleeve==='short')P(capTop(.051,.06),m,a.sh);
        if(sleeve==='long'){P(capTop(.049,.17),m,a.sh);P(capTop(.043,.15),m,a.el);}
        if(sleeve==='puff')P(sph(.072,18,14),m,a.sh,0,-.03,0);
        if(sleeve==='strap'){const st=P(box(.025,.12,.012),m,spine,a.sx*.07,.41,0);st.scale.z=8;}}
      return c;};
    const decal=(emoji)=>{const t=canvasTex(128,128,(x)=>{x.font='96px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(emoji,64,72);});const dm=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.7,depthWrite:false});this.mats.push(dm);P(new THREE.PlaneGeometry(.12,.12),dm,spine,0,.29,.106).castShadow=false;};
    const waist=(m)=>P(sph(.136,24,16),m,hips).scale.set(1.06,.8,.84);
    const skirt=(m,len,r1,o={})=>P(skirtGeo(o.r0||.138,r1,.1,.1-len,o),m,hips);
    const legsShell=(m,r,full)=>{for(const l of legs){P(capTop(r,full?.3+this.legX:.08),m,l.hp);if(full)P(capTop(r-.012,.3+this.legX),m,l.kn);}};
    if(look.dress){const d=look.dress,c=d.c;const m=d.id==='gown'||d.id==='wedding'?mat(c,'fabric'):mat(c,d.id==='party'?'shiny':'fabric');
      if(d.id==='gown'){topShell(mat(c,'sparkle'),'puff');skirt(m,.9,.5,{curve:.7,folds:.08,k:10});P(new THREE.TorusGeometry(.14,.018,8,32),mat('#ffd23f','metal'),hips,0,.1,0).rotation.x=Math.PI/2;this.legAmp=.3;}
      if(d.id==='party'){topShell(m,'short');skirt(m,.45,.3,{curve:.75});const hem=P(new THREE.TorusGeometry(.31,.02,8,48),mat(c,'tulle'),hips,0,-.35,0);hem.rotation.x=Math.PI/2;}
      if(d.id==='wedding'){topShell(m,'strap');skirt(m,.9,.6,{curve:.65,folds:.06,k:14});const ov=skirt(mat('#ffffff','tulle'),.92,.66,{r0:.142,curve:.6,folds:.09,k:9});ov.position.y=.005;
        P(sph(.04,12,10),mat('#ffd6ea','shiny'),spine,0,.1,.1);this.legAmp=.28;}
      if(d.id==='mermaid'){topShell(mat(c,'sparkle'),'strap');P(skirtGeo(.138,.42,.1,-.8,{mermaid:true,folds:.08,k:9}),mat(c,'sparkle'),hips);this.legAmp=.12;}
      if(d.id==='sundress'){topShell(m,'strap');skirt(m,.42,.27,{curve:.9,folds:.07});P(new THREE.TorusGeometry(.135,.012,8,32),mat('#ffffff','fabric'),hips,0,.1,0).rotation.x=Math.PI/2;}
      if(d.id==='witch'){topShell(m,'long');skirt(m,.82,.4,{curve:.8,folds:.14,k:7,seg:14});P(new THREE.TorusGeometry(.14,.02,8,32),mat('#7ee081','shiny'),hips,0,.1,0).rotation.x=Math.PI/2;this.legAmp=.3;}
      if(d.id==='santa'){topShell(m,'long');skirt(m,.42,.3,{curve:.8});const fur=mat('#ffffff','fabric');P(new THREE.TorusGeometry(.31,.035,10,48),fur,hips,0,-.32,0).rotation.x=Math.PI/2;
        P(new THREE.TorusGeometry(.142,.022,8,32),mat('#1a1a1a','shiny'),hips,0,.1,0).rotation.x=Math.PI/2;for(const a of arms)P(new THREE.TorusGeometry(.046,.016,8,20),fur,a.el,0,-.19,0).rotation.x=Math.PI/2;}
      if(d.id==='fairy'){topShell(m,'strap');skirt(m,.3,.26);const pet=skirt(mat(c,'tulle'),.36,.36,{r0:.145,curve:.6,folds:.25,k:6,seg:36});}
      if(d.id==='stargown'){const sm=mat(c,'galaxy');topShell(sm,'strap');skirt(sm,.92,.56,{curve:.65,folds:.07,k:12});P(new THREE.TorusGeometry(.14,.016,8,32),mat('#e8e8ff','metal'),hips,0,.1,0).rotation.x=Math.PI/2;}
      if(d.id==='ballerina'){topShell(mat(c,'shiny'),'strap');waist(m);for(let i=0;i<3;i++)P(skirtGeo(.14,.36-i*.02,.02-i*.025,-.04-i*.03,{curve:.4,folds:.06,k:16}),mat(c,'tulle'),hips);legsShell(mat('#ffe3ee','fabric'),.064,true);}
    }else{
      if(look.top){const t=look.top,c=t.c;
        if(t.id==='tee'||t.id==='startee'||t.id==='hearttee'){topShell(mat(c),'short');if(t.id!=='tee')decal(t.id==='startee'?'⭐':'💖');}
        if(t.id==='tank')topShell(mat(c),'strap');
        if(t.id==='sweater'){topShell(mat(c),'long');P(new THREE.TorusGeometry(.05,.02,8,20),mat(c),spine,0,.47,0).rotation.x=Math.PI/2;}
        if(t.id==='hoodie'){const m=mat(c);topShell(m,'long');P(sph(.1,16,12,0,Math.PI*2,0,Math.PI*.6),m,spine,0,.44,-.07).rotation.x=-1.9;P(box(.16,.08,.03),m,spine,0,.12,.1);}
        if(t.id==='jacket'){const m=mat(c,'denim');topShell(m,'long');for(const s of [-1,1]){const l=P(box(.05,.2,.01),mat('#ffffff'),spine,s*.03,.3,.107);l.rotation.z=s*.25;}}
        if(t.id==='sequin')topShell(mat(c,'sparkle'),'strap');
        if(t.id==='furcoat'){const m=mat(c,'fur');const b=P(fuzz(new THREE.CapsuleGeometry(.133,.2,16,48),.016,95),m,spine,0,.24,0);b.scale.set(1.14,1,.84);
          P(fuzz(skirtGeo(.15,.2,.12,-.2,{curve:1,folds:.02,k:9,seg:48}),.012,60),m,hips);
          const col=P(fuzz(new THREE.TorusGeometry(.08,.038,24,64),.02,110),m,spine,0,.47,.0);col.rotation.x=Math.PI/2+.25;col.scale.set(1.15,1,1);
          for(const a of arms){P(fuzz(capTop(.056,.17),.01,70),m,a.sh);P(fuzz(capTop(.05,.13),.012,70),m,a.el);P(fuzz(new THREE.TorusGeometry(.045,.022,12,24),.01,70),m,a.el,0,-.2,0).rotation.x=Math.PI/2;}}}
      else topShell(mat('#ffffff'),'strap');
      const b=look.bottom||{id:'shorts',c:'#5b8fd6'},c=b.c;
      if(b.id==='jeans'){const m=mat(c,'denim');waist(m);legsShell(m,.07,true);}
      if(b.id==='leggings'){const m=mat(c,'shiny');waist(m);legsShell(m,.066,true);}
      if(b.id==='shorts'){const m=mat(c,'denim');waist(m);legsShell(m,.073,false);}
      if(b.id==='skirt'){const m=mat(c);waist(m);skirt(m,.36,.25,{curve:.9,folds:.08,k:14});}
      if(b.id==='tutu'){const m=mat(c);waist(m);for(let i=0;i<3;i++)P(skirtGeo(.14,.34-i*.03,.06-i*.03,-.1-i*.04,{curve:.5,folds:.08,k:16}),mat(c,'tulle'),hips);}
      if(b.id==='maxi'){const m=mat(c);waist(m);skirt(m,.86,.36,{curve:.85,folds:.08,k:11});this.legAmp=.32;}}
    /* shoes */
    {const s=look.shoes;if(s){const c=s.c;
      for(const l of legs){const an=l.an;const shell=(m,sy=.82)=>{const sh=P(sph(.057,16,12),m,an,0,-.012,.045);sh.scale.set(1.12,sy,2.05);return sh;};
        if(s.id==='sneaker'){shell(mat(c));P(box(.11,.03,.22),mat('#ffffff','shiny'),an,0,-.045,.045);}
        if(s.id==='boots'){const m=mat(c,'shiny');shell(m);P(capTop(.062,.16),m,l.kn,0,-.17-this.legX,0);}
        if(s.id==='heels'){const m=mat(c,'shiny');shell(m,.7);P(cyl(.012,.008,.05,8),m,an,0,-.04,-.03);}
        if(s.id==='glass'){const m=mat(c,'glass');shell(m);P(sph(.012,8,6),mat('#ffffff','gem'),an,0,.012,.1);}
        if(s.id==='rain'){const m=mat(c,'shiny');shell(m);P(capTop(.064,.12),m,l.kn,0,-.22-this.legX,0);}
        if(s.id==='skates'){const m=mat(c,'shiny');shell(m);P(capTop(.06,.06),m,l.kn,0,-.28-this.legX,0);const wm=mat('#ffd23f','shiny');for(const zz of [-.02,.11])P(cyl(.022,.022,.1,12),wm,an,0,-.065,zz).rotation.z=Math.PI/2;}
        if(s.id==='platforms'){const m=mat(c,'shiny');shell(m,.7);P(new THREE.BoxGeometry(.105,.075,.2),m,an,0,-.09,.055);P(new THREE.BoxGeometry(.095,.11,.075),m,an,0,-.075,-.03);
          const st=P(new THREE.TorusGeometry(.05,.008,8,24),m,an,0,.09,.0);st.rotation.x=Math.PI/2;this.lift=.06;}
        if(s.id==='furboots'){const m=mat(c,'fur');shell(mat(c,'fabric'),.9);P(new THREE.BoxGeometry(.11,.04,.22),mat('#3a3035','shiny'),an,0,-.045,.045);
          P(fuzz(new THREE.CylinderGeometry(.07,.09,.3,48,24),.026,120),m,l.kn,0,-.21-this.legX,0);P(fuzz(new THREE.SphereGeometry(.09,40,24),.024,120),m,l.kn,0,-.36-this.legX,.012).scale.set(1,.45,1);}
        if(s.id==='flats'){const m=mat(c,'shiny');shell(m,.6);P(sph(.015,8,6),mat('#ffffff','shiny'),an,0,-.005,.13);}
        if(s.id==='sandals'){const m=mat(c,'shiny');P(box(.11,.022,.225),m,an,0,-.047,.045);const t=P(new THREE.TorusGeometry(.043,.009,8,24),m,an,0,-.012,.075);t.scale.set(1.1,.75,1);t.rotation.y=Math.PI/2;t.rotation.z=Math.PI/2;
          P(new THREE.TorusGeometry(.047,.008,8,24),m,an,0,.03,-.005).rotation.x=Math.PI/2;P(sph(.016,10,8),mat('#ffffff','gem'),an,0,.012,.085);}}}}
    /* nails: manicure and pedicure polish from the glam mirror */
    {const N=look.nails||{};const nm=(c,f)=>{const m=mat(c,{glitter:'sparkle',chrome:'metal',jelly:'gem'}[f]||'shiny');if(f==='chrome')m.roughness=.12;return m;};
      const col=(c,i)=>c==='rainbow'?['#ff3b6b','#ffd23f','#7ee081','#4fb6ff','#b388ff'][i%5]:c;
      const nailOn=(grp,spot,m,toe)=>{const r=spot.r;const n=P(sph(1,12,8),m,grp,spot.p.x,spot.p.y,spot.p.z);n.scale.set(r*(toe?.7:.8),r*(toe?.95:1.3),r*(toe?.22:.26));
        const by=spot.d.clone().negate(),bx=new THREE.Vector3().crossVectors(by,spot.n).normalize();n.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(bx,spot.d.clone().negate(),spot.n));n.castShadow=false;};
      if(N.c)for(const a of arms){const ms={};a.hand.userData.nails.forEach((sp,i)=>{const c=col(N.c,i);nailOn(a.hand,sp,ms[c]||(ms[c]=nm(c,N.f)),false);});}
      if(N.t)for(const l of legs){const ms={};l.an.userData.nails.forEach((sp,i)=>{const c=col(N.t,i);nailOn(l.an,sp,ms[c]||(ms[c]=nm(c,N.tf)),true);});}}
    /* hats */
    {const h=look.hat;if(h){const c=h.c,id=h.id;
      if(id==='tiara'){const m=mat(c,'metal');const t=P(new THREE.TorusGeometry(.115,.008,8,40,Math.PI),m,head,0,.07,.0);t.rotation.x=-1.1;
        for(let i=-2;i<=2;i++){const a=Math.PI/2+i*.32;const x=Math.cos(a)*.115,z=Math.sin(a)*.115*.45;const g=P(new THREE.OctahedronGeometry(i?.017:.026,0),mat(i?'#ff8fc8':'#8fd8ff','gem'),head,x,.12+(i?0:.012)+Math.sin(a)*.04,z+.03);g.scale.y=1.4;}}
      if(id==='crown'){const m=mat(c,'metal');P(new THREE.CylinderGeometry(.085,.08,.06,24,1,true),m,head,0,.165,-.01).material.side=THREE.DoubleSide;
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P(new THREE.ConeGeometry(.018,.05,6),m,head,Math.sin(a)*.083,.215,Math.cos(a)*.083-.01);P(sph(.012,8,6),mat(['#ff3b6b','#4fb6ff','#7ee081'][i%3],'gem'),head,Math.sin(a)*.086,.165,Math.cos(a)*.086-.01);}}
      if(id==='witchhat'){const m=mat(c);P(cyl(.24,.24,.012,40),m,head,0,.12,-.01);const cone=P(new THREE.ConeGeometry(.115,.36,32),m,head,0,.3,-.04);cone.rotation.x=-.18;P(cyl(.118,.118,.035,32),mat('#8e6cff','shiny'),head,0,.14,-.01);}
      if(id==='catears'||id==='bunny'){const m=mat(c),inner=mat('#ffb3d1');for(const s of [-1,1]){if(id==='catears'){const e=P(new THREE.ConeGeometry(.045,.09,12),m,head,s*.075,.15,-.01);e.rotation.z=-s*.35;e.scale.z=.5;const i=P(new THREE.ConeGeometry(.028,.06,12),inner,head,s*.073,.145,.006);i.rotation.z=-s*.35;i.scale.z=.3;}
        else{const e=P(new THREE.CapsuleGeometry(.03,.16,6,12),m,head,s*.05,.27,-.02);e.rotation.z=-s*.18;e.scale.z=.55;const i=P(new THREE.CapsuleGeometry(.017,.12,6,12),inner,head,s*.05,.27,-.006);i.rotation.z=-s*.18;i.scale.z=.3;}}
        P(new THREE.TorusGeometry(.135,.008,6,32,Math.PI),mat(c,'shiny'),head,0,.03,0).rotation.y=Math.PI/2;}
      if(id==='santahat'){const m=mat(c),fur=mat('#ffffff');const cn=P(new THREE.ConeGeometry(.125,.28,24),m,head,.03,.22,-.03);cn.rotation.z=-.55;P(new THREE.TorusGeometry(.125,.03,10,32),fur,head,0,.1,-.01).rotation.x=Math.PI/2+.15;P(sph(.035,12,10),fur,head,.15,.29,-.03);}
      if(id==='party'){const m=new THREE.MeshPhysicalMaterial({color:c,map:TEX.stripes,roughness:.4,clearcoat:.6});this.mats.push(m);const cn=P(new THREE.ConeGeometry(.07,.2,24),m,head,.02,.23,0);cn.rotation.z=-.15;P(sph(.025,10,8),mat('#ffd23f','shiny'),head,.035,.335,0);}
      if(id==='cap'){const m=mat(c);P(new THREE.SphereGeometry(.146,28,14,0,Math.PI*2,0,Math.PI/2),m,head,0,.025,-.005).scale.set(1.02,.9,1.04);const b=P(cyl(.1,.1,.012,24),m,head,0,.04,.14);b.scale.z=.9;b.rotation.x=.15;}
      if(id==='flowers'){const fc=[c,'#ffffff','#ffd23f',c,'#b388ff'];for(let i=0;i<11;i++){const a=i/11*Math.PI*2;P(sph(.026,10,8),mat(fc[i%5],'shiny'),head,Math.sin(a)*.125,.105+Math.cos(a)*.015,Math.cos(a)*.122-.01);}}
      if(id==='bow'){const m=mat(c,'shiny');for(const s of [-1,1]){const l=P(new THREE.ConeGeometry(.045,.1,16),m,head,.06+s*.055,.15,-.04);l.rotation.z=s*Math.PI/2;l.scale.z=.45;}P(sph(.022,10,8),m,head,.06,.15,-.04);}}}
    /* extras */
    {const ex=look.extras||{};
      if(ex.wings){const wm=new THREE.MeshPhysicalMaterial({color:ex.wings,roughness:.15,transparent:true,opacity:.55,side:THREE.DoubleSide,iridescence:1,iridescenceIOR:1.5,depthWrite:false,emissive:ex.wings,emissiveIntensity:.15});this.mats.push(wm);
        const shp=new THREE.Shape();shp.moveTo(0,0);shp.bezierCurveTo(.15,.35,.45,.38,.42,.12);shp.bezierCurveTo(.4,0,.2,-.02,0,0);shp.bezierCurveTo(.15,-.08,.3,-.3,.18,-.32);shp.bezierCurveTo(.05,-.3,0,-.1,0,0);
        for(const s of [-1,1]){const wg=new THREE.Group();wg.position.set(s*.02,.32,-.1);spine.add(wg);this.parts.push(wg);wg.geometry={dispose(){}};const w=P(new THREE.ShapeGeometry(shp,16),wm,wg);w.scale.x=s;w.castShadow=false;this.wings.push({wg,s});}}
      if(ex.cape){const g=new THREE.PlaneGeometry(.44,.78,6,10);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-Math.abs(x)*x*1.5-(.39-y)*.12*0);p.setX(i,x*(1+(.39-y)*.6));}g.translate(0,-.39,0);g.computeVertexNormals();
        const m=mat(ex.cape);m.side=THREE.DoubleSide;const cg=new THREE.Group();cg.position.set(0,.47,-.11);spine.add(cg);this.parts.push(cg);cg.geometry={dispose(){}};P(g,m,cg).rotation.y=Math.PI;this.cape=cg;
        P(new THREE.TorusGeometry(.07,.012,8,20),m,spine,0,.47,0).rotation.x=Math.PI/2;}
      if(ex.purse){// a proper handbag: rounded body, a darker flap, gold clasp, rings and a little heart charm
        const m=mat(ex.purse,'shiny'),dk=mat('#'+new THREE.Color(ex.purse).offsetHSL(0,0,-.12).getHexString(),'shiny'),gold=mat('#e8c25a','metal'),a=arms[1];
        const pg=new THREE.Group();pg.position.set(a.sx*.03,-.01,.01);pg.rotation.z=a.sx*.38;pg.scale.setScalar(1.35);a.hand.add(pg);this.parts.push(pg);pg.geometry={dispose(){}};
        P(new THREE.TorusGeometry(.055,.008,8,24,Math.PI),m,pg,0,-.06,0);
        for(const s of [-1,1])P(new THREE.TorusGeometry(.011,.003,6,14),gold,pg,s*.055,-.062,0);
        P(new RoundedBoxGeometry(.19,.14,.07,3,.022),m,pg,0,-.135,0);
        P(new RoundedBoxGeometry(.194,.062,.074,3,.016),dk,pg,0,-.092,.002);
        const cl=P(new THREE.TorusGeometry(.012,.004,8,18),gold,pg,0,-.122,.038);cl.scale.y=.8;
        P(sph(.007,10,8),mat('#ffffff','gem'),pg,0,-.122,.039);
        const hs=new THREE.Shape();hs.moveTo(0,-.012);hs.bezierCurveTo(-.016,0,-.01,.012,0,.005);hs.bezierCurveTo(.01,.012,.016,0,0,-.012);
        P(cyl(.0012,.0012,.026,4),gold,pg,.055,-.083,.004);
        P(new THREE.ExtrudeGeometry(hs,{depth:.004,bevelEnabled:true,bevelSize:.0015,bevelThickness:.0015,bevelSegments:2,curveSegments:8}),gold,pg,.055,-.1,.002);}
      if(ex.wand){const a=arms[0];const w=P(cyl(.008,.008,.34,10),mat('#ffffff','shiny'),a.hand,0,-.02,.1);w.rotation.x=Math.PI/2-.3;const st=P(starGeo,mat(ex.wand,'gem'),a.hand,0,.03,.27);st.scale.setScalar(.32);
        for(const s of [-1,1]){const rb=P(new THREE.TorusGeometry(.012,.004,6,12),mat('#ff8fc8','shiny'),a.hand,s*.012,-.04,.04);rb.rotation.y=Math.PI/2;}}
      if(ex.glasses){const m=mat(ex.glasses,'shiny');for(const s of [-1,1])P(new THREE.TorusGeometry(.03,.005,8,24),m,head,s*.046,.005,.133);P(box(.03,.005,.005),m,head,0,.01,.136);
        for(const s of [-1,1]){const arm=P(box(.005,.005,.13),m,head,s*.078,.008,.07);}}
      if(ex.halo){const h=P(new THREE.TorusGeometry(.085,.011,10,36),mat(ex.halo,'gem'),head,0,.3,-.01);h.rotation.x=Math.PI/2;h.castShadow=false;}
      if(ex.unicorn){const hg=new THREE.Group();hg.position.set(0,.125,.092);hg.rotation.x=.55;head.add(hg);this.parts.push(hg);hg.geometry={dispose(){}};
        P(new THREE.ConeGeometry(.024,.14,18),mat(ex.unicorn,'sparkle'),hg,0,.07,0);for(let i=0;i<3;i++){const r=P(new THREE.TorusGeometry(.021-i*.006,.0045,6,16),mat('#ffffff','shiny'),hg,0,.018+i*.033,0);r.rotation.x=Math.PI/2+.25;}}
      if(ex.balloon){const bm=mat(ex.balloon,'shiny');const bg=new THREE.Group();bg.position.set(-.3,.8,-.02);spine.add(bg);this.parts.push(bg);bg.geometry={dispose(){}};
        P(sph(.11,24,18),bm,bg).scale.set(1,1.15,1);P(new THREE.ConeGeometry(.016,.03,10),bm,bg,0,-.135,0).rotation.x=Math.PI;P(cyl(.002,.002,.72,6),mat('#ffffff'),bg,0,-.5,0);}
      if(ex.pearls){const m=mat(ex.pearls,'shiny');for(let i=0;i<18;i++){const a=i/18*Math.PI*2;P(sph(.0145,12,8),m,spine,Math.sin(a)*.068,.45-Math.max(0,Math.cos(a))*.035,Math.cos(a)*.058);}P(sph(.021,14,10),m,spine,0,.41,.066);}
      if(ex.scarf){const m=mat(ex.scarf);P(new THREE.TorusGeometry(.065,.03,10,24),m,spine,0,.46,0).rotation.x=Math.PI/2;const tail=P(capTop(.03,.16),m,spine,.04,.46,.07);tail.scale.z=.4;tail.rotation.x=-.15;}}
    /* holiday costumes: their 3D pieces live in seasons.js (window.__costumes[id](kit,color)) */
    {const C=window.__costumes;if(C){const kit={P,mat,spine,hips,head,arms,legs,topShell,skirt,waist,legsShell,av:this};
      for(const slot of ['dress','top','hat']){const it=look[slot];if(it&&C[it.id])C[it.id](kit,it.c);}
      for(const id in (look.extras||{}))if(C[id])C[id](kit,look.extras[id]);}}
    /* makeup */
    {const mk=look.makeup||defaultMakeup();
      this.lipM.color.set(mk.lips||(this.glam?'#c96f7c':'#d77a86'));const gl=mk.gloss||(this.glam&&!mk.lips);this.lipM.roughness=gl?.12:.45;this.lipM.clearcoat=gl?1:.3;if(this.browM)this.browM.color.set(new THREE.Color(look.hair.c).multiplyScalar(.55));this.lipM.clearcoatRoughness=mk.gloss?.02:.2;
      this.lipLiner.forEach(l=>{l.visible=!!mk.lipLiner;});if(mk.lipLiner)this.linerM.color.set(mk.lipLiner);
      this.lashM.color.set(mk.lashes==='bold'?'#0d0a0a':'#2b1d16');
      if(mk.lashes==='long'||mk.lashes==='bold'){const n=mk.lashes==='bold'?8:6,h=mk.lashes==='bold'?.014:.01;const lg=new THREE.ConeGeometry(.0014,h,4);
        for(const eg of this.eyes){const sx=eg.userData.sx;for(let i=0;i<n;i++){const a=.25+i/(n-1)*(Math.PI-.5);const m=P(lg.clone(),this.lashM,eg,Math.cos(a)*eg.userData.rx,.002+Math.sin(a)*eg.userData.ry,.006);m.rotation.z=a-Math.PI/2+sx*.15*(Math.cos(a));m.rotation.x=.5;m.castShadow=false;}}}
      if(this.glam&&mk.liner&&mk.liner!=='none'){const lm=new THREE.MeshStandardMaterial({color:mk.linerC||'#2b1d16',roughness:.55});this.mats.push(lm);const tk=mk.liner==='thin'?.0055:.0072;
        for(const eg of this.eyes){const sx=eg.userData.sx;const t=P(new THREE.TorusGeometry(.0305,tk,8,28,Math.PI),lm,eg,0,.001,.003);t.scale.set(eg.userData.rx/.03,eg.userData.ry/.03*1.05,.6);t.castShadow=false;
          if(mk.liner==='wing'){const w=P(new THREE.CapsuleGeometry(tk*.75,.02,4,8),lm,eg,sx*eg.userData.rx*1.2,.01,.003);w.rotation.z=-sx*1.05;w.castShadow=false;}}}
      if(mk.gems){const gm=mat('#ffffff','gem');gm.iridescence=1;const cs=['#ff8fc8','#8fd8ff','#ffd23f'];
        for(const sx of [-1,1])[[.08,-.012],[.088,.004],[.07,-.028]].forEach(([gx,gy],i)=>{const m=P(new THREE.OctahedronGeometry(.0055,0),mat(cs[i],'gem'),head,sx*gx,gy,Math.sqrt(Math.max(0,.0172-gx*gx-(gy/1.08)**2))+.001);m.castShadow=false;});}}
    this.renderFace();
  }
  renderFace(){const cv=this.faceCv,W=cv.width,x=cv.getContext('2d'),k=W/1024,mk=this.look.makeup||defaultMakeup();x.clearRect(0,0,W,W);
    const at=(a,b,c)=>faceXY(a,b,c,W,this.hs);
    if(this.glam){const soft=(px,py,rx,ry,col,a)=>{x.save();x.translate(px,py);x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.beginPath();x.arc(0,0,rx,0,Math.PI*2);x.fill();x.restore();};
      for(const sx of [-1,1]){let [px,py]=at(sx*.07,-.045,.09);soft(px,py,120*k,55*k,'120,70,50',.16);[px,py]=at(sx*.062,-.014,.105);soft(px,py,70*k,40*k,'255,245,235',.28);
        if(!mk.shadow){[px,py]=at(sx*.046,.03,.115);soft(px,py,120*k,60*k,'190,120,110',.35);}
}
      const [nx,ny]=at(0,-.01,.13);soft(nx,ny,22*k,70*k,'255,250,240',.3);
      for(const sx of [-1,1]){let [px,py]=at(sx*.013,-.018,.12);soft(px,py,16*k,70*k,'130,80,60',.2);[px,py]=at(sx*.011,-.036,.12);soft(px,py,16*k,12*k,'110,60,50',.28);}
      let [px,py]=at(0,-.04,.12);soft(px,py,30*k,10*k,'110,60,50',.3);[px,py]=at(0,-.031,.14);soft(px,py,12*k,10*k,'255,255,250',.4);
      [px,py]=at(0,-.072,.115);soft(px,py,40*k,12*k,'120,70,55',.22);[px,py]=at(0,-.084,.11);soft(px,py,30*k,16*k,'255,245,235',.18);}
    if(mk.blush&&BLUSH[mk.blush])for(const sx of [-1,1]){const [cx,cy]=at(sx*.072,-.03,.1);const g=x.createRadialGradient(cx,cy,0,cx,cy,95*k);g.addColorStop(0,`rgba(${BLUSH[mk.blush]},.42)`);g.addColorStop(1,`rgba(${BLUSH[mk.blush]},0)`);x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,95*k,80*k,0,0,Math.PI*2);x.fill();}
    if(mk.shadow)for(const sx of [-1,1]){const [cx,cy]=at(sx*.047,.028,.115);x.save();x.translate(cx,cy);x.scale(1,.55);const g=x.createRadialGradient(0,0,0,0,0,155*k);const rgb2=rgbOf(mk.shadow);
      g.addColorStop(0,`rgba(${rgb2},.85)`);g.addColorStop(.55,`rgba(${rgb2},.55)`);g.addColorStop(1,`rgba(${rgb2},0)`);x.fillStyle=g;x.beginPath();x.arc(0,0,155*k,0,Math.PI*2);x.fill();x.restore();}
    if(!this.glam&&mk.liner&&mk.liner!=='none'){x.strokeStyle=mk.linerC||'#2b1d16';x.lineCap='round';x.lineJoin='round';x.lineWidth=(mk.liner==='thin'?7:12)*k;
      for(const sx of [-1,1]){const cx=sx*.046;x.beginPath();for(let i=0;i<=20;i++){const a=i/20*Math.PI;const [px,py]=at(cx+Math.cos(a)*(this.eyeR[0]+.004),(this.glam?.009:.006)+Math.sin(a)*(this.eyeR[1]+.004),.11);i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();
        if(mk.liner==='wing'){const [ax,ay]=at(cx+sx*.032,.012,.11),[bx,by]=at(cx+sx*.055,.03,.1);x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.lineWidth=10*k;x.stroke();x.lineWidth=12*k;}}}
    if(this.paintCv)x.drawImage(this.paintCv,0,0,W,W);
    this.faceTex.needsUpdate=true;}
  play(e){this.emote={id:e,t:0};}
  update(dt,speed,air){
    this.t+=dt;const t=this.t;const sp=Math.min(speed/4.5,1.3);
    this.phase+=dt*(5+sp*6)*(sp>.03?1:0);
    const L=this.legs,A=this.arms;const sw=Math.sin(this.phase)*sp*this.legAmp;
    const damp=(o,k,v,r=12)=>{o[k]+=(v-o[k])*Math.min(1,dt*r);};
    let tgt={an:0,l0:-sw,l1:sw,k0:Math.max(0,Math.sin(this.phase+1.6))*sp*.9,k1:Math.max(0,Math.sin(this.phase+1.6+Math.PI))*sp*.9,a0x:sw*1.1,a1x:-sw*1.1,a0z:-.08,a1z:.08,e0:-.2-sp*.25,e1:-.2-sp*.25,spin:0,bob:Math.abs(Math.sin(this.phase))*.035*sp,hd:0,sy:0,lean:sp*.08};
    if(air){tgt.l0=-.5;tgt.l1=.15;tgt.k0=.9;tgt.k1=.35;tgt.a0z=-1.6;tgt.a1z=1.6;tgt.a0x=0;tgt.a1x=0;}
    const breathe=Math.sin(t*2)*.01;
    const e=this.emote;let ext=0;
    if(e){e.t+=dt;const k=e.t;
      if(e.id==='wave'){tgt.a0z=-2.7;tgt.e0=0;tgt.a0x=0;ext=Math.sin(k*12)*.5;tgt.hd=.12;if(k>2)this.emote=null;}
      if(e.id==='twirl'){tgt.a0z=-1.3;tgt.a1z=1.3;tgt.a0x=tgt.a1x=0;tgt.spin=Math.min(1,k/1.1)*Math.PI*2;tgt.bob=Math.sin(Math.min(1,k/1.1)*Math.PI)*.08;if(k>1.3)this.emote=null;}
      if(e.id==='dance'){const b=Math.sin(k*8);tgt.bob=Math.abs(b)*.06;tgt.a0z=-1.2-b*.8;tgt.a1z=1.2-b*.8;tgt.a0x=tgt.a1x=0;tgt.sy=Math.sin(k*4)*.3;tgt.l0=b*.2;tgt.l1=-b*.2;tgt.hd=Math.sin(k*8)*.1;if(k>3.2)this.emote=null;}
      if(e.id==='pose'){tgt.a0z=-2.5;tgt.e0=-.3;tgt.a1z=.7;tgt.e1=-1.9;tgt.a1x=-.3;tgt.hd=-.15;tgt.l0=-.12;tgt.k0=.25;tgt.sy=.25;if(k>2.4)this.emote=null;}
      if(e.id==='hop'){tgt.bob=Math.sin(Math.min(1,k/.45)*Math.PI)*.12;tgt.a0z=-.6;tgt.a1z=.6;if(k>.5)this.emote=null;}
      if(e.id==='clap'){const c=Math.max(0,Math.sin(k*14));tgt.a0x=tgt.a1x=-1.25;tgt.a0z=.25+c*.3;tgt.a1z=-.25-c*.3;tgt.e0=tgt.e1=-.5;tgt.hd=Math.sin(k*7)*.08;if(k>2)this.emote=null;}
      if(e.id==='kiss'){const go=k>.65;tgt.a0x=go?-1.5:-1.1;tgt.e0=go?-.2:-2.1;tgt.a0z=go?-.1:.35;tgt.hd=go?0:.1;tgt.lean=go?-.05:.06;if(k>1.6)this.emote=null;}
      if(e.id==='cheer'){const w=Math.sin(k*16)*.25;tgt.a0z=-2.7+w;tgt.a1z=2.7+w;tgt.e0=tgt.e1=0;tgt.a0x=tgt.a1x=0;tgt.hd=Math.sin(k*8)*.1;if(k>1.7)this.emote=null;}
      if(e.id==='flip'){this.flip=Math.min(1,k/.75)*Math.PI*2;tgt.l0=tgt.l1=-1.2;tgt.k0=tgt.k1=1.6;tgt.a0z=-.4;tgt.a1z=.4;tgt.a0x=tgt.a1x=-1;if(k>.8){this.emote=null;this.flip=0;}}
      if(e.id==='sit'){tgt.l0=tgt.l1=-1.5;tgt.k0=tgt.k1=.05;tgt.bob=-.6;tgt.a0x=tgt.a1x=.55;tgt.a0z=-.3;tgt.a1z=.3;tgt.e0=tgt.e1=0;tgt.lean=-.18;tgt.hd=Math.sin(k*1.5)*.08;if(sp>.15)this.emote=null;}
      if(e.id==='bow'){const b=Math.sin(Math.min(1,k/1.6)*Math.PI);tgt.lean=b*.55;tgt.l1=b*.35;tgt.k1=b*.5;tgt.k0=b*.25;tgt.bob=-b*.07;tgt.a0z=-.25-b*.3;tgt.a1z=.25+b*.3;tgt.a0x=tgt.a1x=b*.2;if(k>1.6)this.emote=null;}
      if(e.id==='chair'||e.id==='mani'||e.id==='pedi'){tgt.bob=-(this.hip-(.46+this.legX));tgt.l0=tgt.l1=-1.57;tgt.k0=tgt.k1=1.57;tgt.a0x=tgt.a1x=-.35;tgt.a0z=.05;tgt.a1z=-.05;tgt.e0=tgt.e1=-.9;tgt.lean=-.04;tgt.hd=Math.sin(k*1.2)*.03;
        if(e.id==='mani'){tgt.a0x=tgt.a1x=-1.15;tgt.a0z=.2;tgt.a1z=-.2;tgt.e0=tgt.e1=-.35;tgt.lean=.1;tgt.hd=0;}
        if(e.id==='pedi'){tgt.l0=tgt.l1=-1.47;tgt.k0=tgt.k1=.05;tgt.an=1.05;tgt.a0z=-.3;tgt.a1z=.3;tgt.a0x=tgt.a1x=.25;tgt.e0=tgt.e1=-.2;tgt.lean=-.14;}
        if(sp>.15)this.emote=null;}
      if(e.id==='magic'){tgt.a0z=-2.9;tgt.a1z=2.9;tgt.e0=tgt.e1=0;tgt.a0x=tgt.a1x=0;tgt.spin=Math.min(1,k/1.8)*Math.PI*2;tgt.bob=Math.sin(Math.min(1,k/1.8)*Math.PI)*.25;if(k>1.9)this.emote=null;}}
    damp(L[0].hp.rotation,'x',tgt.l0);damp(L[1].hp.rotation,'x',tgt.l1);damp(L[0].kn.rotation,'x',tgt.k0);damp(L[1].kn.rotation,'x',tgt.k1);
    damp(A[0].sh.rotation,'x',tgt.a0x);damp(A[1].sh.rotation,'x',tgt.a1x);damp(A[0].sh.rotation,'z',tgt.a0z,9);damp(A[1].sh.rotation,'z',tgt.a1z,9);
    damp(L[0].an.rotation,'x',tgt.an);damp(L[1].an.rotation,'x',tgt.an);damp(A[0].el.rotation,'x',tgt.e0);damp(A[1].el.rotation,'x',tgt.e1);A[0].el.rotation.z=ext;
    damp(this.hips.position,'y',this.hip+this.lift+tgt.bob,20);damp(this.spine.rotation,'x',tgt.lean+breathe,6);damp(this.hips.rotation,'y',tgt.sy,8);damp(this.head.rotation,'z',tgt.hd,8);
    this.hips.rotation.x=this.emote&&this.emote.id==='flip'?this.flip:0;this.spinY=e&&(e.id==='twirl'||e.id==='magic')?tgt.spin:0;
    // blink
    this.blink-=dt;const bl=this.blink<0?Math.max(.08,Math.abs(this.blink+.07)/.07):1;if(this.blink<-.14)this.blink=2+Math.random()*3.5;this.eyes.forEach(g=>g.scale.y=bl*(g.scale.x||1));
    for(const w of this.wings)w.wg.rotation.y=w.s*(.5+Math.sin(t*(air?16:5))*.35);
    if(this.cape)this.cape.rotation.x=.1+sp*.5+Math.sin(t*3)*.04+(air?.4:0);
  }}

