/* ================= ANIMALS / PETS ================= */
// the family's real dogs: Titus (black and tan, orange collar) and Artemis (fluffy cream). Change these names to rename them in the game
const FAMILY_DOGS=['Titus','Artemis'];
// the family's squirrel friend: change this name to rename them in the game
const FAMILY_SQUIRREL='Tiereyn';
// the monkey and the hedgehog: change these names to rename them in the game
const EXOTIC_NAMES=['Mango','Spike'];
// eye colors for the cartoon pets
const PET_EYE={cat:'#8cbf3f',dog:'#7a4a22',squirrel:'#4a2c18',bunny:'#6a4030'};
const PET_DIM={cat:{r:.1,len:.24,leg:.17,head:.095},dog:{r:.12,len:.28,leg:.2,head:.11},squirrel:{r:.075,len:.1,leg:.07,head:.072},bunny:{r:.1,len:.08,leg:.06,head:.085}};
const PET_SAY={cat:['Meow! 🐱','Purrr… 💖','Mrrow?'],dog:['Woof woof! 🐶','Arf! 💖','*happy wiggle*'],squirrel:['Chitter chatter! 🌰','Squeak!','Got any acorns?'],monkey:['Ooh ooh ah ah! 🐒','*happy chatter*','Got a banana? 🍌'],hedgehog:['*sniff sniff* 🦔','Squeak!','*happy huff*'],bunny:['*nose wiggle* 🐰','Hop hop! 💖','Squeak!']};
// realistic body sizes for the family's own pets (built by Pet.buildReal)
const REAL_DIM={dog:{r:.1,len:.3,leg:.25,head:.085},squirrel:{r:.072,len:.13,leg:.075,head:.06},monkey:{r:.08,len:.16,leg:.2,head:.07},hedgehog:{r:.085,len:.1,leg:.035,head:.06}};
// soft fur strands: used as a color and bump texture so real pets look furry instead of smooth
let FUR_TEX=null;const furTex=()=>FUR_TEX||(FUR_TEX=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.lineCap='round';
  for(let i=0;i<5200;i++){const x=Math.random()*w,y=Math.random()*h,l=5+Math.random()*9,a=Math.PI/2+(Math.random()-.5)*.5,d=Math.random();
    g.strokeStyle=d<.55?`rgba(0,0,0,${.05+Math.random()*.12})`:`rgba(255,255,255,${.3+Math.random()*.5})`;g.lineWidth=.8+Math.random()*1.2;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}},3));
const V3=(x,y,z)=>new THREE.Vector3(x,y,z),LIMB_UP=V3(0,1,0);
// a smooth tapered limb from point a (radius ra) to point b (radius rb)
function limb(a,b,ra,rb,mat,par){const d=b.clone().sub(a),L=d.length(),g=new THREE.Group();g.position.copy(a).add(b).multiplyScalar(.5);g.quaternion.setFromUnitVectors(LIMB_UP,d.normalize());par.add(g);
  M(new THREE.CylinderGeometry(rb,ra,L,16,1,true),mat,0,0,0,g);M(sph(ra,14,10),mat,0,-L/2,0,g);M(sph(rb,14,10),mat,0,L/2,0,g);return g;}
// one smooth body shape (no ball seams): a capsule along z, reshaped by a profile from back (t=-1) to front (t=1)
function bodyGeo(r,L,K){const g=new THREE.SphereGeometry(1,32,40);g.rotateX(Math.PI/2);const p=g.attributes.position,e=L/2+r;
  const at=(arr,t)=>{const n=K.t.length;if(t<=K.t[0])return arr[0];for(let i=1;i<n;i++)if(t<=K.t[i]){const f=(t-K.t[i-1])/(K.t[i]-K.t[i-1]),s=(1-Math.cos(f*Math.PI))/2;return arr[i-1]+(arr[i]-arr[i-1])*s;}return arr[n-1];};
  for(let k=0;k<p.count;k++){const x=p.getX(k),y=p.getY(k),t=p.getZ(k),r0=Math.hypot(x,y),rr=Math.pow(Math.max(0,1-Math.pow(Math.abs(t),3)),1/3),f=r0>1e-6?rr/r0*r:0;
    p.setXYZ(k,x*f*at(K.sx,t),y*f*at(K.sy,t)+at(K.dy,t)*r,t*e);}g.computeVertexNormals();return g;}
// a smooth tail or tube along points, thickness set by rf(0..1)
function taperTube(pts,rf,mat,par,seg=36,rad=12,fuzz=0){const c=new THREE.CatmullRomCurve3(pts),g=new THREE.TubeGeometry(c,seg,1,rad,false),p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<=seg;i++){const P=c.getPointAt(i/seg),R=rf(i/seg);for(let j=0;j<=rad;j++){const k=i*(rad+1)+j,n=fuzz?1+fuzz*(Math.sin(i*2.7+j*1.9)*.5+Math.sin(i*5.3-j*3.1)*.5):1;v.set(p.getX(k),p.getY(k),p.getZ(k)).sub(P).multiplyScalar(R*(j===rad?1+fuzz*(Math.sin(i*2.7)*.5+Math.sin(i*5.3)*.5):n)).add(P);p.setXYZ(k,v.x,v.y,v.z);}}
  g.computeVertexNormals();const m=M(g,mat,0,0,0,par);M(sph(rf(0),12,10),mat,pts[0].x,pts[0].y,pts[0].z,par);const e=pts[pts.length-1];M(sph(rf(1),12,10),mat,e.x,e.y,e.z,par);return m;}
class Pet{
  constructor(kind,color,name,home,o={}){
    Object.assign(this,{kind,name,home});this.o=o;this.g=new THREE.Group();this.t=Math.random()*9;this.pos=new THREE.Vector3();this.face=Math.random()*6;this.speed=0;this.owned=false;this.wait=Math.random()*3;this.tgt=null;this.vy=0;this.y=0;this.phase=0;this.happy=0;this.say=null;
    const D=o.real?(o.dim||REAL_DIM[kind]):PET_DIM[kind],furC=new THREE.Color(color),lightC=o.light?new THREE.Color(o.light):furC.clone().lerp(new THREE.Color('#fff8f0'),.65);
    const fur=phys(furC,{roughness:.95,sheen:1,sheenColor:furC.clone().lerp(new THREE.Color('#ffffff'),.6),sheenRoughness:.8}),light=phys(lightC,{roughness:.95,sheen:1,sheenColor:new THREE.Color('#ffffff')});
    const pink=phys('#ff9eb5',{roughness:.6}),eyeM=phys('#1a1210',{roughness:.05,clearcoat:1}),shine=new THREE.MeshBasicMaterial({color:'#fff'});
    if(o.real){for(const m of [fur,light]){m.map=furTex();m.bumpMap=furTex();m.bumpScale=1.5;}
      const faceM=o.face?phys(o.face,{roughness:.95,sheen:1,sheenColor:new THREE.Color('#ffffff'),map:furTex(),bumpMap:furTex(),bumpScale:1.5}):fur;
      this.furMats=[fur,light];if(o.face)this.furMats.push(faceM);this.buildReal(kind,D,o,fur,light,faceM,eyeM,shine);}
    else{
    const body=this.body=new THREE.Group();this.g.add(body);const up=kind==='squirrel'?.75:kind==='bunny'?.35:0;
    const torso=this.torso=new THREE.Group();torso.position.set(0,D.leg+D.r*.9,0);torso.rotation.x=-up;body.add(torso);this.D=D;this.furMats=[fur,light];
    M(new THREE.CapsuleGeometry(D.r,D.len,8,18),fur,0,0,0,torso).rotation.x=Math.PI/2;
    M(sph(D.r*.85,18,12),light,0,-D.r*.25,D.len*.1,torso).scale.set(.9,.8,1.4);
    const head=this.head=new THREE.Group();head.position.set(0,D.r*.9+(kind==='squirrel'?D.r*.6:D.r*.4),D.len/2+D.r*.7);torso.add(head);head.rotation.x=up*.8;this.headX0=head.rotation.x;
    const H=D.head,faceM=o.face?phys(o.face,{roughness:.95,sheen:1,sheenColor:new THREE.Color('#ffffff')}):fur;if(o.face)this.furMats.push(faceM);M(sph(H,24,18),faceM,0,0,0,head);
    // tan eyebrow dots, like a black-and-tan dog
    if(o.brows)for(const sx of [-1,1])M(sph(H*.1,10,8),light,sx*H*.36,H*.42,H*.86,head).scale.set(1.2,.7,.6);
    const mz=kind==='dog'?1.25:1;M(sph(H*.48,16,12),light,0,-H*.32,H*.78,head).scale.set(1.25,.85,mz);
    M(sph(H*.13,10,8),kind==='dog'?eyeM:pink,0,-H*.18,H*1.18*(kind==='dog'?1.08:.98),head).scale.set(1.3,.9,1);
    // big shiny cartoon eyes with a colored iris, two sparkles, and soft pink cheeks
    const irisM=phys(o.eye||PET_EYE[kind]||'#5a3a2a',{map:irisTex(),roughness:.1,clearcoat:1,clearcoatRoughness:.05}),blushM=new THREE.MeshBasicMaterial({color:'#ff8fb0',transparent:true,opacity:.4,depthWrite:false});
    for(const sx of [-1,1]){const e=M(irisGeo(H*.17),irisM,sx*H*.4,H*.1,H*.8,head);e.rotation.y=sx*.35;e.scale.z=.75;
      M(sph(H*.05,8,6),shine,sx*H*.4+H*.05,H*.18,H*.96,head,false);M(sph(H*.024,8,6),shine,sx*H*.4-H*.04,H*.03,H*.95,head,false);
      M(sph(H*.15,12,8),blushM,sx*H*.56,-H*.16,H*.76,head,false,false).scale.set(1,.6,.35);}
    for(const sx of [-1,1]){
      if(kind==='cat'){const e=M(new THREE.ConeGeometry(H*.36,H*.62,12),fur,sx*H*.55,H*.82,-H*.05,head);e.rotation.z=-sx*.3;e.scale.z=.55;const i=M(new THREE.ConeGeometry(H*.22,H*.4,12),pink,sx*H*.53,H*.78,H*.05,head);i.rotation.z=-sx*.3;i.scale.z=.3;}
      if(kind==='dog'){const e=M(sph(H*.42,14,10),phys(o.ear||furC.clone().multiplyScalar(.7),{roughness:.95,sheen:1}),sx*H*.88,-H*.05,-H*.05,head);e.scale.set(.42,o.fluffy?1.45:1.15,.85);e.rotation.z=sx*.25;if(o.fluffy)e.position.y-=H*.12;}
      if(kind==='squirrel'){const e=M(new THREE.ConeGeometry(H*.25,H*.5,10),o.ear?phys(o.ear,{roughness:.9}):fur,sx*H*.5,H*.85,-H*.1,head);e.rotation.z=-sx*.2;}
      if(kind==='bunny'){const e=M(new THREE.CapsuleGeometry(H*.2,H*1.3,6,12),fur,sx*H*.38,H*1.45,-H*.1,head);e.rotation.z=-sx*.15;e.scale.z=.55;const i=M(new THREE.CapsuleGeometry(H*.11,H*1.05,6,12),pink,sx*H*.38,H*1.45,-H*.02,head);i.rotation.z=-sx*.15;i.scale.z=.3;}
      if(kind==='cat'){for(const k of [-1,1]){const w=M(cyl(.0015,.0015,H*.9,4),shine,sx*H*.55,-H*.25+k*H*.06,H*.95,head,false);w.rotation.z=Math.PI/2+sx*k*.15;}}}
    this.legs=[];for(const [sx,sz] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const lg=new THREE.Group();lg.position.set(sx*D.r*.55,D.leg+.02,sz*(D.len*.45+(kind==='bunny'&&sz<0?.02:0)));body.add(lg);
      M(capTop(D.r*.32,Math.max(.01,D.leg-D.r*.5)),fur,0,0,0,lg);const paw=M(sph(D.r*.36,10,8),light,0,-D.leg+D.r*.25,D.r*.12,lg);paw.scale.set(1,.7,1.3);this.legs.push({lg,sz,sx,paw});if(o.fluffy&&sz<0)M(sph(D.r*.3,10,8),fur,0,-D.leg*.35,-D.r*.25,lg).scale.set(.8,1.4,.9);}
    const tail=this.tail=new THREE.Group();tail.position.set(0,D.leg+D.r*1.1,-(D.len/2+D.r*.6));body.add(tail);
    if(kind==='cat'){let y=0,z=0;for(let i=0;i<6;i++){const a=.3+i*.22;M(sph(.026-i*.0015,10,8),fur,0,y,z,tail);y+=Math.cos(a)*.05;z-=Math.sin(a)*.04-.01*i;}}
    if(kind==='dog'&&!o.fluffy){const t=M(capTop(.028,.12),fur,0,0,0,tail);t.rotation.x=-2.3;}
    // long-haired dogs: a feathery plume tail, a fluffy chest, and soft fringe on the belly and legs
    if(kind==='dog'&&o.fluffy){for(let i=0;i<6;i++){const a=i/5;M(sph(.04+Math.sin(a*Math.PI)*.022,12,10),i>3?light:fur,0,.015+a*.11,-.02-a*.1,tail);}}
    if(kind==='dog'&&o.fluffy){
      for(let i=0;i<5;i++){const a=i/4;M(sph(D.r*.42,12,10),light,(a-.5)*D.r*1.1,-D.r*.15-Math.sin(a*Math.PI)*D.r*.25,D.len*.5+D.r*.35,torso).scale.set(1,1.2,.8);}
      for(let i=0;i<6;i++){const a=i/5;for(const sx of [-1,1])M(sph(D.r*.3,10,8),fur,sx*D.r*.5,-D.r*.82,(a-.5)*D.len*1.1,torso).scale.set(.9,.8,1.3);}}
    // dalmatian-style spots
    if(o.spots){const sm=phys(o.spots,{roughness:.95,sheen:1});[[.9,.3,.2],[-.85,.4,-.15],[.2,.97,.05],[-.4,.85,.4],[.6,.6,-.45],[-.95,-.1,.35],[.95,-.05,-.3]].forEach(([x,y,zz])=>M(sph(D.r*.2,10,8),sm,x*D.r*.97,y*D.r*.97,zz*D.len,torso,false,false).scale.set(1,.5,1));
      M(sph(H*.3,12,10),sm,H*.5,H*.4,H*.55,head,false,false).scale.set(.5,1,1);}
    if(kind==='squirrel'){const tm=o.tail?phys(o.tail,{roughness:1,sheen:1,sheenColor:new THREE.Color('#ffffff'),sheenRoughness:.5}):fur;if(o.tail)this.furMats.push(tm);for(let i=0;i<7;i++){const a=i/6*Math.PI*.95;M(sph(.055+Math.sin(a)*.02,12,10),tm,0,.02+Math.sin(a)*.2,-.05-Math.sin(a*.55)*.12+(i>4?(i-4)*.04:0),tail);}}
    if(kind==='bunny')M(sph(.045,12,10),light,0,-.02,0,tail);}
    const head=this.head,body=this.body;
    this.collar=M(new THREE.TorusGeometry(D.head*.68,o.collar?.02:.012,8,24),phys(o.collar||'#ff3b6b',{roughness:.3,clearcoat:1}),0,-D.head*.7,-D.head*.05,head);this.collar.rotation.x=Math.PI/2;this.collar.visible=false;
    this.bell=M(sph(.018,10,8),new THREE.MeshStandardMaterial({color:'#ffd23f',metalness:1,roughness:.2}),0,-D.head*.85,D.head*.6,head);this.bell.visible=false;
    // real dogs wear the collar around the neck, with the tag hanging at the throat
    if(this.neckRing){const n=this.neckRing,c=this.collar;c.geometry.dispose();c.geometry=new THREE.TorusGeometry(n.rad,o.collar?.01:.008,8,28);this.torso.add(c);c.position.copy(n.pos);c.rotation.set(0,0,0);c.quaternion.setFromUnitVectors(V3(0,0,1),n.dir);
      c.add(this.bell);this.bell.position.set(0,-n.rad-.01,0);}
    body.scale.setScalar(1.3);this.tagH=(D.leg+D.r*2+D.head*2+(kind==='bunny'?.25:.12))*1.3;this.setTag();}
  // a more lifelike body: snout, neck, deep chest, jointed legs (used for the family's real pets)
  buildReal(kind,D,o,fur,light,faceM,eyeM,shine){faceM=faceM;const r=D.r,L=D.len,H=D.head,leg=D.leg,dog=kind==='dog';
    const ph=(c,x={})=>{const m=phys(c,{roughness:.95,sheen:1,sheenColor:new THREE.Color('#ffffff'),map:furTex(),bumpMap:furTex(),bumpScale:1.5,...x});this.furMats.push(m);return m;};
    const earM=o.ear?ph(o.ear):fur,muzM=o.face?faceM:dog&&o.brows?light:fur,sockM=o.brows?light:fur,noseM=phys(dog?'#151012':'#c98f86',{roughness:.25,clearcoat:.6});
    const body=this.body=new THREE.Group();this.g.add(body);const up=kind==='squirrel'?.6:kind==='monkey'?.12:0;this.D=D;
    const pawM=o.paw?phys(o.paw,{roughness:.7}):dog?sockM:fur;
    const torso=this.torso=new THREE.Group();torso.position.set(0,leg+r*.95,0);torso.rotation.x=-up;body.add(torso);
    const head=this.head=new THREE.Group();torso.add(head);
    if(dog){
      M(bodyGeo(r,L,{t:[-1,-.55,-.1,.35,1],sx:[.82,.9,.8,.95,.88],sy:[.85,.95,.8,1.12,1],dy:[.1,.08,.16,-.08,0]}),fur,0,0,0,torso);  // deep chest, tucked belly, hips
      if(o.brows)for(const sx of [-1,1])M(sph(r*.22,10,8),light,sx*r*.32,-r*.1,L*.3+r*1.0,torso).scale.set(1,1.3,.4); // tan chest spots
      const nb=V3(0,r*.3,L*.38),nt=V3(0,r*1.15,L*.5+r*.35);limb(nb,nt,r*.56,r*.46,fur,torso);    // neck
      const nd=nt.clone().sub(nb);this.neckRing={pos:nb.clone().addScaledVector(nd,.62),dir:nd.clone().normalize(),rad:r*.57};
      head.position.set(0,r*1.35,L*.5+r*.55);
      const chi=o.chi;   // chihuahua: round apple head, short snout, big eyes, big upright ears
      M(sph(H,24,18),faceM,0,chi?H*.05:0,0,head).scale.set(chi?.95:.84,chi?.92:.8,chi?1:1.08);   // skull
      if(chi){limb(V3(0,-H*.3,H*.6),V3(0,-H*.38,H*1.28),H*.36,H*.22,muzM,head);M(sph(H*.12,12,10),noseM,0,-H*.33,H*1.48,head).scale.set(1.2,.85,.9);
        M(sph(H*.2,12,10),muzM,0,-H*.58,H*.95,head).scale.set(.9,.5,1.6);
        for(const sx of [-1,1]){if(o.brows){M(sph(H*.1,10,8),light,sx*H*.34,H*.34,H*.86,head).scale.set(1.3,.7,.5);M(sph(H*.3,12,10),light,sx*H*.3,-H*.32,H*.6,head).scale.set(.8,.75,.9);}
          M(sph(H*.19,14,10),eyeM,sx*H*.38,H*.08,H*.84,head).scale.set(1.05,1,.6);M(sph(H*.055,8,6),shine,sx*H*.42,H*.15,H*.96,head,false);
          const ep=new THREE.Group();ep.position.set(sx*H*.58,H*.55,-H*.05);ep.rotation.set(-.15,0,-sx*.8);head.add(ep);
          M(new THREE.ConeGeometry(H*.52,H*1.3,16),earM,0,H*.6,0,ep).scale.z=.28;const inr=M(new THREE.ConeGeometry(H*.36,H*1.0,16),phys('#f2b7a6',{roughness:.7}),0,H*.55,H*.06,ep);inr.scale.z=.14;}}
      else{
      if(o.face)M(sph(H,24,18),fur,0,H*.12,-H*.3,head).scale.set(.86,.8,.8);                // golden back of the head
      limb(V3(0,-H*.22,H*.45),V3(0,-H*.32,H*1.42),H*.48,H*.29,muzM,head);                         // snout
      if(o.brows)limb(V3(0,-H*.0,H*.5),V3(0,-H*.15,H*1.25),H*.3,H*.17,fur,head);              // dark bridge of the nose
      M(sph(H*.17,14,10),noseM,0,-H*.2,H*1.57,head).scale.set(1.25,.85,.9);                  // nose
      M(sph(H*.28,14,10),muzM,0,-H*.52,H*.95,head).scale.set(.95,.55,1.8);                    // lower jaw
      for(const sx of [-1,1]){M(sph(H*.38,14,10),muzM,sx*H*.3,-H*.3,H*.45,head).scale.set(.8,.8,1);
        M(sph(H*.12,14,10),eyeM,sx*H*.36,H*.12,H*.78,head).scale.set(1.15,.8,.6);M(sph(H*.035,8,6),shine,sx*H*.38+H*.03,H*.16,H*.85,head,false);
        if(o.brows)M(sph(H*.09,10,8),light,sx*H*.33,H*.36,H*.82,head).scale.set(1.3,.7,.5);
        const ep=new THREE.Group();ep.position.set(sx*H*.62,H*.48,-H*.1);ep.rotation.set(.15,0,sx*(o.fluffy?.2:.4));head.add(ep);  // floppy ears
        M(sph(H*.5,14,12),earM,0,-H*.45,H*.05,ep).scale.set(.17,o.fluffy?1.45:1.05,.6);
        if(o.fluffy)M(sph(H*.36,12,10),earM,0,-H*.98,H*.02,ep).scale.set(.2,.75,1);}}
      if(o.fluffy){M(sph(r*.75,16,12),light,0,-r*.3,L*.3+r*.55,torso).scale.set(1.05,1.25,.75);   // fluffy chest
        M(bodyGeo(r*.5,L*.7,{t:[-1,0,1],sx:[1.2,1.5,1.2],sy:[.5,.6,.5],dy:[0,0,0]}),light,0,-r*.62,L*.05,torso);}  // soft belly fringe
    }else if(kind==='squirrel'){
      M(bodyGeo(r,L,{t:[-1,-.4,.3,1],sx:[.95,1.05,.85,.72],sy:[1,1.1,.88,.72],dy:[0,0,0,.05]}),fur,0,0,0,torso);  // pear-shaped body
      M(sph(r*.85,16,12),light,0,-r*.38,0,torso).scale.set(.82,.6,1.7);                        // white belly
      for(const sx of [-1,1])M(sph(r*.7,16,12),fur,sx*r*.45,-r*.1,-L*.38,torso).scale.set(.65,1,1.2); // strong back legs
      head.position.set(0,r*.85,L*.5+r*.45);
      M(sph(H,22,16),fur,0,0,0,head).scale.set(.85,.85,1.1);
      limb(V3(0,-H*.15,H*.45),V3(0,-H*.25,H*1.1),H*.52,H*.28,fur,head);                       // pointy snout
      M(sph(H*.1,10,8),noseM,0,-H*.2,H*1.37,head);
      M(sph(H*.42,14,10),light,0,-H*.52,H*.62,head).scale.set(.9,.6,1.4);                     // white chin and cheeks
      for(const sx of [-1,1]){M(sph(H*.28,14,10),light,sx*H*.47,H*.14,H*.48,head).scale.set(.45,1.05,1.05);  // pale eye ring
        M(sph(H*.22,14,10),eyeM,sx*H*.56,H*.15,H*.52,head).scale.set(.6,.95,.95);M(sph(H*.055,8,6),shine,sx*H*.68,H*.24,H*.6,head,false);
        M(sph(H*.28,12,10),earM,sx*H*.45,H*.82,-H*.15,head).scale.set(.38,1,.8);}
    }else if(kind==='monkey'){   // gray langur: long limbs, black face with a pale ruff, very long tail
      faceM=phys(o.face||'#1d1b1d',{roughness:.55});
      M(bodyGeo(r,L,{t:[-1,-.3,.4,1],sx:[.85,.9,.95,.85],sy:[.9,.95,1.05,.95],dy:[0,0,0,0]}),fur,0,0,0,torso);
      M(sph(r*.8,14,10),light,0,-r*.35,L*.15,torso).scale.set(.8,.6,1.4);
      head.position.set(0,r*1.0,L*.5+r*.75);
      M(sph(H,22,16),fur,0,0,0,head).scale.set(.95,.95,.9);
      M(sph(H*.98,20,14),light,0,-H*.06,H*.18,head).scale.set(1.02,1.0,.55);                  // pale ruff around the face
      M(sph(H*.72,18,12),faceM,0,-H*.1,H*.55,head).scale.set(1,1.1,.55);                     // black face
      M(sph(H*.32,14,10),faceM,0,-H*.32,H*.82,head).scale.set(1.1,.8,.8);                     // muzzle
      M(sph(H*.6,14,10),light,0,H*.36,H*.55,head).scale.set(1.15,.32,.5);                      // brow
      for(const sx of [-1,1]){M(sph(H*.1,12,8),phys('#3a2414',{roughness:.05,clearcoat:1}),sx*H*.24,H*.08,H*.9,head);M(sph(H*.03,8,6),shine,sx*H*.26,H*.12,H*.98,head,false);
        M(sph(H*.22,12,10),faceM,sx*H*.9,H*.05,0,head).scale.set(.35,1,.8);}
    }else{   // hedgehog: a dome of spines, white face and belly, pink nose and feet
      M(bodyGeo(r,L,{t:[-1,0,1],sx:[.95,1.05,.95],sy:[.8,.85,.75],dy:[0,0,-.1]}),light,0,0,0,torso);
      const sk=o.spines||'#6b5233',cap=new THREE.SphereGeometry(1,24,16,0,Math.PI*2,0,1.95);cap.scale(r*1.14,r*.94,(L/2+r)*1.03);
      M(cap,phys(sk,{roughness:.9}),0,r*.03,-r*.05,torso);
      const sg=new THREE.ConeGeometry(r*.06,r*.32,5);sg.translate(0,r*.16,0);const N=520,im=new THREE.InstancedMesh(sg,phys('#ffffff',{roughness:.6}),N);im.castShadow=true;
      const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),c1=new THREE.Color(sk),c2=new THREE.Color('#e3d5b2'),cc=new THREE.Color(),a=r*1.05,b=r*.9,c=(L/2+r);
      for(let i=0;i<N;i++){let u;do{u=V3(Math.random()*2-1,Math.random()*1.2-.2,Math.random()*2-1);}while(u.lengthSq()>1||u.lengthSq()<.05);u.normalize();if(u.y<-.25){i--;continue;}
        const pos=V3(a*1.08*u.x,b*1.02*u.y+r*.03,c*u.z-r*.05),nrm=V3(u.x/a,u.y/b,u.z/c).normalize().add(V3(0,0,-.55)).normalize();q.setFromUnitVectors(LIMB_UP,nrm);
        m4.compose(pos,q,V3(1,.8+Math.random()*.5,1));im.setMatrixAt(i,m4);im.setColorAt(i,cc.copy(c1).lerp(c2,Math.random()<.2?.6:Math.random()*.25));}
      torso.add(im);
      head.position.set(0,-r*.1,L*.5+r*.62);
      M(sph(H,20,14),light,0,0,0,head).scale.set(.85,.8,1);
      limb(V3(0,-H*.15,H*.45),V3(0,-H*.32,H*1.35),H*.48,H*.14,light,head);                      // pointy snout
      M(sph(H*.13,12,10),phys('#e89a9a',{roughness:.4,clearcoat:.5}),0,-H*.33,H*1.46,head);
      for(const sx of [-1,1]){M(sph(H*.13,12,10),eyeM,sx*H*.42,H*.15,H*.66,head);M(sph(H*.04,8,6),shine,sx*H*.46,H*.2,H*.76,head,false);
        M(sph(H*.24,12,10),phys('#d9b3a8',{roughness:.8}),sx*H*.58,H*.55,-H*.05,head).scale.set(.45,1,.85);}
    }
    this.headX0=head.rotation.x=up*.8;
    this.legs=[];for(const [sx,sz] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const lg=new THREE.Group();lg.position.set(sx*r*(dog?.55:.5),leg+.02,sz*L*(dog?.4:.42));body.add(lg);let paw;
      if(dog&&sz>0){limb(V3(0,r*.2,0),V3(0,-leg*.5,r*.05),r*.38,r*.26,fur,lg);limb(V3(0,-leg*.5,r*.05),V3(0,-leg+r*.22,r*.02),r*.22,r*.18,sockM,lg);
        if(o.fluffy)M(sph(r*.28,10,8),light,0,-leg*.35,-r*.22,lg).scale.set(.7,1.6,.9);}
      else if(dog){limb(V3(0,r*.1,0),V3(0,-leg*.62,-r*.4),r*.42,r*.2,fur,lg);limb(V3(0,-leg*.62,-r*.4),V3(0,-leg+r*.22,-r*.05),r*.19,r*.17,sockM,lg);
        if(o.fluffy)M(sph(r*.3,10,8),fur,0,-leg*.35,-r*.35,lg).scale.set(.8,1.4,.9);}
      else if(kind==='monkey'){if(sz>0){limb(V3(0,r*.2,0),V3(0,-leg*.5,-r*.15),r*.32,r*.22,fur,lg);limb(V3(0,-leg*.5,-r*.15),V3(0,-leg+r*.2,r*.05),r*.2,r*.16,fur,lg);}
        else{limb(V3(0,r*.1,0),V3(0,-leg*.45,r*.35),r*.4,r*.24,fur,lg);limb(V3(0,-leg*.45,r*.35),V3(0,-leg+r*.2,-r*.05),r*.22,r*.16,fur,lg);}}
      else if(kind==='hedgehog')limb(V3(0,0,0),V3(0,-leg+r*.12,r*.08),r*.2,r*.15,pawM,lg);
      else limb(V3(0,0,0),V3(0,-leg+r*.15,r*.1),r*(sz>0?.18:.26),r*.14,fur,lg);
      paw=M(sph(r*(kind==='hedgehog'?.2:.3),12,10),pawM,0,-leg+r*.18,r*.12,lg);paw.scale.set(1,.6,kind==='squirrel'&&sz<0?2.2:kind==='monkey'?1.6:1.35);if(kind==='squirrel'&&sz<0)paw.position.z=r*.3;
      this.legs.push({lg,sz,sx,paw});}
    const tail=this.tail=new THREE.Group();body.add(tail);
    if(dog&&o.chi){tail.position.set(0,leg+r*1.05,-(L*.5+r*.6));taperTube([V3(0,0,0),V3(0,.05,-.04),V3(0,.1,-.03),V3(0,.12,.02)],t=>.014-.007*t,fur,tail);}  // little tail curled up
    else if(dog&&!o.fluffy){tail.position.set(0,leg+r*1.05,-(L*.5+r*.6));taperTube([V3(0,0,0),V3(0,-.01,-.06),V3(0,-.05,-.11),V3(0,-.12,-.14),V3(0,-.18,-.145)],t=>.02-.012*t,fur,tail);}
    if(dog&&o.fluffy){tail.position.set(0,leg+r*1.05,-(L*.5+r*.55));const P=[V3(0,0,0),V3(0,.03,-.07),V3(0,.02,-.15),V3(0,-.04,-.21),V3(0,-.1,-.23)];
      taperTube(P,t=>.02+.03*Math.sin(Math.PI*Math.min(1,.1+t)),fur,tail,36,16,.12);taperTube(P.map(v=>v.clone().add(V3(0,-.018,.004))),t=>.012+.03*Math.sin(Math.PI*Math.min(1,.15+t*.95)),light,tail).scale.set(.85,1,1);}  // feathery plume
    if(kind==='monkey'){tail.position.set(0,leg+r*.95,-(L*.5+r*.7));const P=[V3(0,0,0),V3(0,.1,-.08),V3(0,.22,-.12),V3(0,.3,-.22),V3(0,.26,-.36),V3(0,.14,-.44),V3(0,.03,-.46)];
      taperTube(P,t=>.02-.006*t,fur,tail,48,12,.05);M(sph(.03,12,10),light,0,.0,-.46,tail).scale.set(.8,1.6,.8);}  // very long tail with a fluffy tip
    if(kind==='hedgehog'){tail.position.set(0,leg+r*.4,-(L*.5+r*.9));M(sph(.015,8,6),light,0,0,0,tail);}
    if(kind==='squirrel'){tail.position.set(0,leg+r*.6,-(L*.5+r*.55));const tm=o.tail?ph(o.tail,{sheenRoughness:.4}):fur,fm=ph(new THREE.Color(o.tail||'#999').lerp(new THREE.Color('#ffffff'),.5),{transparent:true,opacity:.45,depthWrite:false});
      const P=[V3(0,0,0),V3(0,.07,-.08),V3(0,.19,-.13),V3(0,.31,-.1),V3(0,.37,-.02),V3(0,.35,.05)],rf=t=>.016+.045*Math.pow(Math.max(0,Math.sin(Math.PI*(.12+.88*t))),.55);
      taperTube(P,rf,tm,tail,48,24,.12).scale.set(.75,1,1);taperTube(P,t=>rf(t)*1.25+.004,fm,tail,48,24,.25).scale.set(.8,1,1);}}  // big bushy S-shaped tail with a frosty edge
  setTag(){if(this.tag){this.g.remove(this.tag);this.tag.material.map.dispose();this.tag.material.dispose();}this.tag=sprite(labelTex((this.owned?'💖 ':'')+this.name,{size:58,fg:this.owned?'#ff4d8d':'#8a5a3b',bg:'rgba(255,255,255,.88)',border:null}),.72,.18);this.tag.position.y=this.tagH;this.g.add(this.tag);
    this.showCollar();}
  // pets with their own collar (like a real family dog) always wear it; others get the pink one when adopted
  showCollar(){this.collar.visible=(this.owned||!!this.o.collar)&&!this.fitNeck;this.bell.visible=this.owned&&!this.fitNeck;}
  update(dt){this.t+=dt;const t=this.t,sp=Math.min(this.speed/3,1.6);this.phase+=dt*(6+sp*8)*(sp>.03?1:0);
    const hopper=this.kind==='bunny'||this.kind==='squirrel';
    this.legs.forEach(l=>{l.lg.rotation.x=hopper?(sp>.05?Math.sin(this.phase)*.6*(l.sz>0?1:-1):0):Math.sin(this.phase+(l.sz>0?0:Math.PI)+(l.sx>0?Math.PI:0))*.7*sp;});
    this.body.position.y=hopper?Math.abs(Math.sin(this.phase))*.12*Math.min(1,sp*2):Math.abs(Math.sin(this.phase*2))*.012*sp;
    const wag=this.happy>0||(this.owned&&sp<.1);this.happy=Math.max(0,this.happy-dt);
    if(this.kind==='dog')this.tail.rotation.z=Math.sin(t*(wag?18:5))*(wag?.7:.2);
    if(this.kind==='cat')this.tail.rotation.z=Math.sin(t*2)*.3;
    if(this.kind==='squirrel')this.tail.rotation.x=Math.sin(t*3)*.08;
    if(this.kind==='monkey')this.tail.rotation.z=Math.sin(t*1.5)*.15;
    this.head.rotation.y=Math.sin(t*.7)*.25*(sp<.1?1:.2);this.head.rotation.z=this.happy>0?Math.sin(t*10)*.15:0;
    if(this.say){this.sayT-=dt;if(this.sayT<0){this.g.remove(this.say);this.say=null;}}}
  speak(text){if(this.say){this.g.remove(this.say);this.say.material.map.dispose();this.say.material.dispose();}const s=sprite(labelTex(text,{size:46,w:512,h:110,fg:'#3b2357',border:'#ffd6ea'}),1.1,.24);s.position.y=this.tagH+.25;this.g.add(s);this.say=s;this.sayT=2.4;}}
const PETS=[['cat','#f4a259','Pumpkin','spring'],['cat','#3a3540','Midnight','halloween'],['dog','#d9a35b','Biscuit','beach'],['dog','#8b5a2b','Cocoa','birthday'],['squirrel','#9a9a9a','Nutmeg','christmas'],['bunny','#f5efe6','Snowball','spring'],['dog','#f3ece2','Marshmallow','studio'],['cat','#9aa0a6','Smokey','runway'],
  // more dogs! (new pets go at the end so saved pets keep their spot)
  // the family's own two dogs, waiting to be adopted at the Pet Parlor
  ['dog','#1e1714',FAMILY_DOGS[0],'parlor',{stars:5,real:1,light:'#b8773d',brows:1,collar:'#ff6a1f',ear:'#17110f'}],
  ['dog','#dcb57a',FAMILY_DOGS[1],'parlor',{stars:5,real:1,fluffy:1,face:'#fbf6ec',light:'#f2e2c2',ear:'#d8ad6a'}],
  ['squirrel','#857558',FAMILY_SQUIRREL,'parlor',{stars:5,real:1,light:'#ffffff',ear:'#b08a70',tail:'#8f8a84'}],
  ['dog','#f7f4ef','Oreo','christmas',{stars:3,spots:'#1d1a1a',light:'#ffffff'}],
  ['dog','#6f6a66','Pepper','runway',{stars:3,light:'#cfc9c2'}],
  ['dog','#d8a24e','Waffles','bakery',{stars:3,fluffy:1,light:'#f3d79e'}],
  // Apollo the family's chihuahua
  ['dog','#1d1716','Apollo','parlor',{stars:5,real:1,chi:1,brows:1,light:'#b97a45',ear:'#1a1414',dim:{r:.075,len:.19,leg:.17,head:.085}}],
  // exotic pets cost the most stars
  ['monkey','#9a999b',EXOTIC_NAMES[0],'spring',{stars:10,real:1,light:'#dcdad6',face:'#1d1b1d',paw:'#2c2a2c'}],
  ['hedgehog','#f4efe6',EXOTIC_NAMES[1],'halloween',{stars:7,real:1,light:'#f4efe6',spines:'#6b5233',paw:'#e9b3a8'}]].map(([k,c,n,h,o],i)=>{
  const pt=new Pet(k,c,n,Z[h],o);const a=i*2.3,r=Z[h].r*.6;pt.pos.set(Z[h].x+Math.sin(a)*r,0,Z[h].z+Math.cos(a)*r);collide(pt.pos,.3);scene.add(pt.g);return pt;});
const myPet=()=>PETS.find(p=>p.owned);
function adopt(pt){did('adopt');if(!SAVE.adoptPaid){SAVE.adoptPaid=1;setTimeout(()=>earn(10,'New pet'),900);}const old=myPet();if(old&&old!==pt){old.owned=false;old.setTag();}pt.owned=true;pt.setTag();SAVE.pet=PETS.indexOf(pt);persist();pt.happy=2;pt.speak(rnd(PET_SAY[pt.kind]));
  floaties(pt.g.position.clone().add(new THREE.Vector3(0,pt.tagH,0)),'💖',8);sfx('tada');toast(`${pt.name} is your pet now! 💖 Take them to the 🐾 Pet Parlor for food, a bath, nails and outfits.`);}
function stepPet(pt,dt){if(pt.inParlor){parlorPet(pt,dt);return;}let spd=0;const P=player.pos;
  if(pt.owned){const side=new THREE.Vector3(Math.sin(player.face+2.3)*.9,0,Math.cos(player.face+2.3)*.9).add(P);const d=Math.hypot(side.x-pt.pos.x,side.z-pt.pos.z);
    if(d>20){pt.pos.set(side.x,0,side.z);}else if(d>.35){pt.tgt=side;spd=Math.min(7,.8+d*2.6);}else{pt.tgt=null;pt.face=angDamp(pt.face,Math.atan2(P.x-pt.pos.x,P.z-pt.pos.z),dt*4);}
    if(!player.onGround&&pt.y<=0&&player.vy>3&&d<4)pt.vy=4.2;}
  else{pt.wait-=dt;if(!pt.tgt&&pt.wait<=0){const a=Math.random()*Math.PI*2,r=Math.random()*pt.home.r*.85;pt.tgt=new THREE.Vector3(pt.home.x+Math.sin(a)*r,0,pt.home.z+Math.cos(a)*r);}
    if(pt.tgt)spd=pt.kind==='bunny'||pt.kind==='squirrel'?1.6:1.1;
    const dP=Math.hypot(P.x-pt.pos.x,P.z-pt.pos.z);if(dP<2.2&&started){spd=0;pt.face=angDamp(pt.face,Math.atan2(P.x-pt.pos.x,P.z-pt.pos.z),dt*4);}}
  if(pt.tgt&&spd>0){const dx=pt.tgt.x-pt.pos.x,dz=pt.tgt.z-pt.pos.z,d=Math.hypot(dx,dz);if(d<.3&&!pt.owned){pt.tgt=null;pt.wait=2+Math.random()*5;spd=0;}
    else{const st=Math.min(d,spd*dt);pt.pos.x+=dx/d*st;pt.pos.z+=dz/d*st;collide(pt.pos,.22);pt.face=angDamp(pt.face,Math.atan2(dx,dz),Math.min(1,dt*8));}}
  pt.speed+=(spd-pt.speed)*Math.min(1,dt*8);
  pt.vy-=18*dt;pt.y+=pt.vy*dt;if(pt.y<0){pt.y=0;pt.vy=0;}
  const gy=groundAt(pt.pos.x,pt.pos.z);pt.pos.y+=(gy-pt.pos.y)*Math.min(1,dt*12);
  pt.g.position.set(pt.pos.x,pt.pos.y+pt.y,pt.pos.z);pt.g.rotation.y=pt.face;pt.update(dt);}
// some pets need a few ⭐ stars (from star challenges and hidden stars) before you can adopt them; stars are not used up
const myStars=()=>(SAVE.chal&&SAVE.chal.stars)||0;
const starsShort=pt=>pt.owned?0:Math.max(0,((pt.o&&pt.o.stars)||0)-myStars());
let petNear=null;
function petButton(){const P=player.pos;let best=null,bd=2.1;for(const pt of PETS){const d=Math.hypot(P.x-pt.pos.x,P.z-pt.pos.z);if(d<bd){bd=d;best=pt;}}
  if(best!==petNear||(best&&best.owned!==petNear._o)){petNear=best;const b=$('#petBtn');if(best){best._o=best.owned;b.textContent=best.owned?`💖 Pet ${best.name}`:starsShort(best)?`🔒 Adopt ${best.name} · ⭐ ${best.o.stars}`:`🐾 Adopt ${best.name}`;b.style.display='block';}else b.style.display='none';}}
$('#petBtn').onclick=()=>{const pt=petNear;if(!pt)return;if(pt.owned){pt.happy=2;pt.vy=3;const need=petNeed(pt,true);if(need){pt.speak(need);toast(`Take ${pt.name} to the 🐾 Pet Parlor!`);}else pt.speak(rnd(PET_SAY[pt.kind]));floaties(pt.g.position.clone().add(new THREE.Vector3(0,pt.tagH*.8,0)),'💖',5);sfx('pop');}else if(starsShort(pt)){const n=starsShort(pt);pt.speak(rnd(PET_SAY[pt.kind]));sfx('pop');toast(`${pt.name} needs ⭐ ${pt.o.stars} stars to adopt. Get ${n} more ${n===1?'star':'stars'} from star challenges or hidden stars!`);}
  else adopt(pt);petNear=null;petButton();};
if(SAVE.pet!=null&&PETS[SAVE.pet]){const pt=PETS[SAVE.pet];pt.owned=true;pt.setTag();pt.pos.set(player.pos.x+.8,0,player.pos.z+.8);}

