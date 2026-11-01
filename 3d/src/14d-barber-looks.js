/* ================= BARBER LOOKS: haircuts, facial hair and glasses ================= */
// Barber cuts and facial hair are "shells": a copy of the head's own shape, puffed out a little where the hair grows.
// thick(d) says how thick the hair is (in meters) for each direction d from the middle of the head (d is a unit vector:
// +z is the face, +y is up). Where it's 0 or less there is no hair, so the shape of thick() is the haircut.
const smooth=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
// the head's radius in direction d (same shape as headGeo in 14-avatar.js)
const headR=(av,d)=>av.glam?sculpt(d,av.face.nose,av.jaw)*.13:.13;
function shellGeo(av,thick,seg=1){const g=new THREE.SphereGeometry(1,Math.round(96*seg),Math.round(72*seg)),p=g.attributes.position,d=new THREE.Vector3(),keep=new Uint8Array(p.count),HS=av.hs;
  // outside the haircut the shell tucks just under the skin, so the edge is where the two meet: a smooth line, not steps
  for(let i=0;i<p.count;i++){d.fromBufferAttribute(p,i).normalize();const t=thick(d);keep[i]=t>0?1:0;const r=headR(av,d)+Math.max(t,-.004)+.0006;p.setXYZ(i,d.x*r*HS.x,d.y*r*HS.y,d.z*r*HS.z);}
  const ix=g.index.array,out=[];for(let i=0;i<ix.length;i+=3)if(keep[ix[i]]||keep[ix[i+1]]||keep[ix[i+2]])out.push(ix[i],ix[i+1],ix[i+2]);
  g.setIndex(out);g.computeVertexNormals();return g;}
// a point on the hair (or skin) in direction d, and the outward direction there
function shellPt(av,d,t=0){const HS=av.hs,r=headR(av,d)+t;return new THREE.Vector3(d.x*r*HS.x,d.y*r*HS.y,d.z*r*HS.z);}
const dirOf=(az,y)=>{const s=Math.sqrt(Math.max(0,1-y*y));return new THREE.Vector3(Math.sin(az)*s,y,Math.cos(az)*s);};

/* ---------- haircuts ---------- */
// where the hair stops: high on the forehead, above the ears, low at the back of the neck
function hairline(d){const c=d.z/(Math.hypot(d.x,d.z)||1);return c>=0?.2+.42*Math.pow(c,1.5):.2-.7*Math.pow(-c,1.2);}
const onTop=(d,a=.45,b=.85)=>smooth(a,b,d.y);
// below the hairline it gives how far below (as a small minus number), so the shell slides smoothly under the skin
const grow=(d,w=.12)=>{const h=hairline(d);return d.y<=h?(d.y-h)*.06:smooth(h,h+w,d.y);};
// each cut: [id, emoji, name, thickness(d), extra pieces(kit,material)]
const BCUTS=[
  ['fade','📐','Fade',d=>{const e=grow(d,.08);return e<0?e:e*(.0025+.032*onTop(d,.5,.82));}],
  ['slick','😎','Slick back',d=>{const e=grow(d,.1);return e<0?e:e*(.01+.036*onTop(d,.3,.85)*(.65+.35*Math.max(0,d.z)));},(k,m)=>{m.roughness=.14;m.clearcoat=.85;m.clearcoatRoughness=.1;}],
  ['twists','🪢','Twists',d=>{const e=grow(d,.08);return e<0?e:e*(.004+.012*onTop(d,.4,.8));},(k,m)=>{
    const tg=capTop(.0105,.022);for(let i=0;i<46;i++){const y=.4+((i*.618)%1)*.58,az=i*2.399;const d=dirOf(az,y);if(d.z>.5&&y<.7)continue;const tw=k.P(tg.clone(),m,k.head);tw.position.copy(shellPt(k.av,d,.004));tw.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),d.clone().lerp(new THREE.Vector3(0,1,0),.12).normalize());}tg.dispose();}],
  ['fauxhawk','🦅','Faux hawk',d=>{const e=grow(d,.08);return e<0?e:e*(.0025+.008*onTop(d,.5,.8)+.05*Math.exp(-((d.x/.22)**2))*onTop(d,.5,.9)*(.7+.3*d.z));},(k,m)=>{
    const cg=new THREE.ConeGeometry(.03,.06,10);for(let i=0;i<5;i++){const d=new THREE.Vector3(0,.95,.45-i*.2).normalize();const c=k.P(cg.clone(),m,k.head);c.position.copy(shellPt(k.av,d,.055+.004*(2-Math.abs(i-1))));c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().lerp(new THREE.Vector3(0,.2,1),.3).normalize());c.scale.z=.55;}cg.dispose();}],
  ['mohawk','🦔','Mohawk',d=>{const e=grow(d,.06);if(e<0)return e;const band=Math.exp(-((d.x/.13)**2));return band>.3?e*(.004+.016*band):(band-.3)*.03;},(k,m)=>{
    const cg=new THREE.ConeGeometry(.03,.12,10);for(let i=0;i<9;i++){const a=.6-i*.24,d=new THREE.Vector3(0,Math.cos(a),Math.sin(a));const c=k.P(cg.clone(),m,k.head);c.position.copy(shellPt(k.av,d,.065-.004*Math.abs(i-3)));c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);c.scale.z=.4;}cg.dispose();}],
  ['cornrows','〰️','Cornrows',d=>{const e=grow(d,.05);return e<0?e:.0025;},(k,m)=>{
    for(let r=-4;r<=4;r++){const x=r*.13,q=Math.sqrt(1-x*x),pts=[];for(let f=.95;f>-2.5;f-=.12){const d=new THREE.Vector3(x,q*Math.cos(f),q*Math.sin(f));if(d.y>hairline(d)+.03)pts.push(shellPt(k.av,d,.004));}
      if(pts.length>3){const g=fuzz(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*4,.0085,7,false),.002,320);k.P(g,m,k.head);}}}],
  ['bald','🥚','Bald',d=>-1],
];
const BCUT=Object.fromEntries(BCUTS.map(c=>[c[0],c]));

/* ---------- facial hair ---------- */
// soft masks (0 to 1) for each part of a beard, from the direction d. y: up and down, ax: how far to the side, az: angle round from the front
const fz=d=>({ax:Math.abs(d.x),y:d.y,z:d.z,az:Math.atan2(Math.abs(d.x),d.z)});
const mouth=({ax,y})=>smooth(.33,.27,ax)*smooth(-.58,-.54,y)*smooth(-.33,-.37,y);// the lips stay uncovered
const MUST=({ax,y,z})=>{const lo=-.37-.55*Math.max(0,ax-.2);return smooth(-.25,-.29,y)*smooth(lo-.04,lo,y)*smooth(.35,.3,ax)*smooth(.45,.6,z);};
const CHIN=({ax,y,z})=>smooth(.23,.17,ax)*smooth(-.53,-.58,y)*smooth(-.1,.15,z);
const SIDES=({ax,y,z})=>smooth(.25,.29,ax)*smooth(.37,.33,ax)*smooth(-.33,-.37,y)*smooth(-.62,-.58,y)*smooth(.3,.5,z);
const JAWLINE=({y,az})=>{const top=-.32+.48*smooth(.35,1.35,az);return smooth(top+.04,top-.02,y)*smooth(1.8,1.6,az);};
const BURNS=({y,az})=>smooth(1.15,1.3,az)*smooth(1.75,1.6,az)*smooth(.22,.16,y)*smooth(-.4,-.3,y);
const STRAP=({y,az})=>{const top=-.6+.75*smooth(.4,1.35,az);return smooth(top+.05,top-.02,y)*smooth(top-.32,top-.24,y)*smooth(1.75,1.6,az);};
const max=(...a)=>Math.max(...a);
// [id, emoji, name, mask(f), thickness(f) or 'stubble']
const BEARDS=[
  ['none','🙂','Clean shave'],
  ['stubble','🧔‍♂️','Stubble',f=>JAWLINE(f)*(1-mouth(f)),'stubble'],
  ['mustache','🥸','Mustache',MUST,f=>.008],
  ['handlebar','🎩','Handlebar',MUST,f=>.008],
  ['goatee','🐐','Goatee',f=>max(MUST(f),CHIN(f),SIDES(f))*(1-mouth(f)),f=>.008+.01*smooth(-.6,-.85,f.y)],
  ['chinstrap','➰','Chin strap',f=>max(STRAP(f),BURNS(f)),f=>.006],
  ['sideburns','🎸','Sideburns',BURNS,f=>.006],
  ['beard','🧔','Short beard',f=>JAWLINE(f)*(1-mouth(f)),f=>.009+.006*smooth(-.5,-.85,f.y)],
  ['fullbeard','🧙‍♂️','Big beard',f=>JAWLINE(f)*(1-mouth(f)),f=>.013+.05*smooth(-.45,-.95,f.y)*smooth(.9,.2,f.az)],
];
const BEARD=Object.fromEntries(BEARDS.map(b=>[b[0],b]));
let stubbleTex=null;
function stubbleMat(k,c){if(!stubbleTex){stubbleTex=canvasTex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);for(let i=0;i<5200;i++){x.fillStyle=`rgba(255,255,255,${.35+Math.random()*.6})`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random(),1.5+Math.random()*1.5);}},6);stubbleTex.colorSpace=THREE.NoColorSpace;}
  const m=new THREE.MeshStandardMaterial({color:new THREE.Color(c).multiplyScalar(.75),alphaMap:stubbleTex,transparent:true,opacity:.9,depthWrite:false,roughness:.9,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});k.av.mats.push(m);return m;}
function buildBeard(k,b){const B=BEARD[b.id];if(!B||!B[3])return;const av=k.av,c=b.c||'#3a2618';
  const stub=B[4]==='stubble',m=stub?stubbleMat(k,c):k.mat(c,'hair');
  const g=shellGeo(av,d=>{const f=fz(d),v=B[3](f);if(v<.35)return (v-.35)*.03;return (stub?.0024:B[4](f))*smooth(.35,.7,v);},1.3);
  if(!stub)fuzz(g,.0012,240);const mesh=k.P(g,m,k.head);mesh.castShadow=false;
  if(b.id==='handlebar')for(const s of [-1,1]){const pts=[[.2,-.34],[.3,-.38],[.38,-.3],[.36,-.2]].map(([ax,y])=>{const d=new THREE.Vector3(s*ax,y,1).normalize();d.y=y;d.normalize();return shellPt(av,d,.008+ (ax>.33?.01:0));});
    k.P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),14,.0045,6,false),m,k.head);k.P(sph(.0055,8,6),m,k.head).position.copy(pts[3]);}}

/* ---------- glasses ---------- */
// new glasses for the 👔 clothing store. They sit where the closet's 👓 glasses sit: lenses at x ±.046, y .005, z .133
// You can only wear one pair at a time.
const GLASSES=['glasses','heartglasses','shades','aviators','roundspecs','sportshades','thickframes','gamer3d'];
const STORE_GLASSES=[['aviators','🕶️','Aviators','#d4af37'],['roundspecs','🤓','Round glasses','#8a5a3b'],['sportshades','🏃','Sport shades','#ff3b6b'],['thickframes','👓','Thick frames','#2d2d3a'],['gamer3d','🎮','3D glasses','#ffffff']];
const lensMat=(k,c,o=.82)=>{const m=new THREE.MeshPhysicalMaterial({color:c,roughness:.05,metalness:.3,clearcoat:1,transparent:true,opacity:o,iridescence:.35,side:THREE.DoubleSide});k.av.mats.push(m);return m;};
// a rounded rectangle centered on 0,0
function roundShape(sh,w,h,r){const x=-w/2,y=-h/2;sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);return sh;}
const temples=(k,m,y=.008,w=.005)=>{for(const s of [-1,1])k.P(box(w,w,.13),m,k.head,s*.08,y,.07);};
const STORE_WEAR={
  // 🕶️ Aviators: thin gold wire, big teardrop lenses and a double bridge
  aviators(k,c){const m=k.mat(c,'metal'),lm=lensMat(k,'#3a3f4a');const sh=new THREE.Shape();sh.moveTo(-.026,.016);sh.bezierCurveTo(-.01,.022,.022,.02,.028,.012);sh.bezierCurveTo(.032,-.012,.012,-.03,-.004,-.028);sh.bezierCurveTo(-.026,-.024,-.032,0,-.026,.016);
    for(const s of [-1,1]){const l=k.P(new THREE.ShapeGeometry(sh,16),lm,k.head,s*.047,.004,.134);l.scale.x=s;
      k.P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sh.getPoints(20).map(p=>new THREE.Vector3(p.x*s,p.y,0)),true),40,.0016,5,true),m,k.head,s*.047,.004,.135);}
    k.P(box(.026,.0025,.0025),m,k.head,0,.019,.137);k.P(box(.02,.0025,.0025),m,k.head,0,.011,.137);temples(k,m,.016,.003);},
  // 🤓 Round glasses: thin round frames with clear lenses
  roundspecs(k,c){const m=k.mat(c,'shiny'),lm=lensMat(k,'#e8f6ff',.18);for(const s of [-1,1]){k.P(new THREE.TorusGeometry(.024,.0028,8,28),m,k.head,s*.042,.004,.135);k.P(new THREE.CircleGeometry(.024,24),lm,k.head,s*.042,.004,.134);}
    k.P(new THREE.TorusGeometry(.009,.0024,6,12,Math.PI),m,k.head,0,.008,.137);temples(k,m,.01,.004);},
  // 🏃 Sport shades: one curved wrap-around lens that shines like a rainbow
  sportshades(k,c){const m=k.mat(c,'shiny'),lm=lensMat(k,c,.85);lm.iridescence=1;lm.metalness=.6;
    k.P(new THREE.CylinderGeometry(.142,.142,.036,40,1,true,-.75,1.5),lm,k.head,0,.008,-.005);
    k.P(new THREE.CylinderGeometry(.144,.144,.006,40,1,true,-.78,1.56),m,k.head,0,.027,-.005).material.side=THREE.DoubleSide;temples(k,m,.02,.005);},
  // 👓 Thick frames: big bold square frames
  thickframes(k,c){const m=k.mat(c,'shiny'),lm=lensMat(k,'#e8f6ff',.16);const rr=(w,h,r)=>{const sh=new THREE.Shape();roundShape(sh,w,h,r);return sh;};
    const fr=rr(.06,.042,.01);fr.holes.push(rr(.044,.028,.006));const fg=new THREE.ExtrudeGeometry(fr,{depth:.006,bevelEnabled:true,bevelSize:.0012,bevelThickness:.0012,bevelSegments:2});
    for(const s of [-1,1]){k.P(fg.clone(),m,k.head,s*.046,.006,.131);k.P(new THREE.ShapeGeometry(rr(.044,.028,.006)),lm,k.head,s*.046,.006,.134);}fg.dispose();
    k.P(box(.028,.007,.007),m,k.head,0,.014,.137);temples(k,m,.016,.006);},
  // 🎮 3D glasses: white frames with one red and one blue lens
  gamer3d(k,c){const m=k.mat(c,'shiny');for(const s of [-1,1]){k.P(new RoundedBoxGeometry(.056,.034,.006,2,.006),m,k.head,s*.046,.006,.134);k.P(box(.044,.024,.003),lensMat(k,s<0?'#ff2a4d':'#2ab7ff',.85),k.head,s*.046,.006,.138);}
    k.P(box(.03,.006,.006),m,k.head,0,.012,.137);temples(k,m,.014,.006);},
};

/* ---------- guy clothes you can only get at the 👔 clothing store ---------- */
const CAMO_TEX={};
function camoMat(k,c){const t=CAMO_TEX[c]||(CAMO_TEX[c]=canvasTex(256,256,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);
  for(const [k2,n] of [[-.25,22],[.2,20],[-.45,16]]){x.fillStyle=shadeC(c,k2);for(let i=0;i<n;i++){x.beginPath();const X=Math.random()*w,Y=Math.random()*h;for(let a=0;a<6.3;a+=.7){const r=14+Math.random()*16;x.lineTo(X+Math.cos(a)*r,Y+Math.sin(a)*r*.7);}x.fill();}}},3));
  const m=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:t,roughness:.85,sheen:.5,sheenColor:new THREE.Color('#ffffff')});k.av.mats.push(m);return m;}
const ARGYLE_TEX={};
function argyleMat(k,c){const t=ARGYLE_TEX[c]||(ARGYLE_TEX[c]=canvasTex(128,128,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);x.fillStyle=shadeC(c,-.22);
  x.beginPath();x.moveTo(64,0);x.lineTo(128,64);x.lineTo(64,128);x.lineTo(0,64);x.fill();x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.lineTo(128,128);x.moveTo(128,0);x.lineTo(0,128);x.stroke();},4));
  const m=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:t,roughness:.9,sheen:.8,sheenColor:new THREE.Color('#ffffff')});k.av.mats.push(m);return m;}
const STORE_TOPS=[['leather','🧥','Leather jacket','#2d2d3a'],['hawaiian','🌺','Hawaiian shirt','#2fa3d6'],['baseball','⚾','Baseball jersey','#ffffff'],['football','🏈','Football jersey','#d62839'],['camo','🪖','Camo jacket','#6b7a3f'],['sweatervest','🧶','Sweater vest','#1f2a44']];
const STORE_BOTTOMS=[['ripped','🩹','Ripped jeans','#6f9be0'],['camopants','🪖','Camo pants','#6b7a3f'],['chinoshorts','🩳','Chino shorts','#c8b28a']];
const STORE_SHOES=[['cowboyboots','🤠','Cowboy boots','#8a5a3b'],['goldkicks','✨','Gold sneakers','#e0b04a'],['runners','🏃','Running shoes','#4fb6ff']];
const STORE_HATS=[['fedora','🕵️','Fedora','#3b3b46'],['cowboyhat','🤠','Cowboy hat','#c8a06a'],['visor','☀️','Visor','#ffffff']];
const STORE_EXTRAS=[['studs','💎','Diamond studs','#cfefff'],['dogtags','🪖','Dog tags','#c0c0c0']];
Object.assign(STORE_WEAR,{
  // 🧥 Leather jacket: shiny, open over a white tee, with a wide collar and a zipper
  leather(k,c){const m=k.mat(c,'shiny');m.roughness=.35;k.topShell(m,'long');frontStrip(k,k.mat('#ffffff'),lineOf(0,.462,0,.08,.03,.036,10),.003);crewNeck(k,k.mat('#ffffff'),.054,.008);
    const dk=k.mat(shadeC(c,-.2),'shiny');for(const s of [-1,1])frontStrip(k,dk,lineOf(s*.04,.47,s*.07,.36,.02,.012,5),.006);
    frontStrip(k,k.mat('#d9d9d9','metal'),lineOf(.036,.4,.04,.08,.003,.003,8),.006);waistband(k,dk);cuffs(k,dk,.044,.012);},
  // 🌺 Hawaiian shirt: flowers all over, a collar and buttons
  hawaiian(k,c){const m=printMat(k,c,'flowers');k.topShell(m,'short');shirtCollar(k,m);const bm=k.mat('#ffffff','shiny');[.42,.35,.28,.21,.14].forEach(y=>frontDot(k,bm,y,0,.0045));},
  // ⚾ Baseball jersey: buttons down the front, piping and a number
  baseball(k,c){const m=k.mat(c),t=k.mat(isLight(c)?'#1f2a44':'#ffffff');k.topShell(m,'short');crewNeck(k,t,.056,.007);
    frontStrip(k,t,lineOf(0,.45,0,.04,.004,.004,10),.003);[.4,.32,.24,.16].forEach(y=>frontDot(k,t,y,.012,.004));frontText(k,'7',isLight(c)?'#d62839':'#ffffff',.3,.1);
    for(const a of k.arms)k.P(new THREE.TorusGeometry(.052,.006,6,20),t,a.sh,0,-.06,0).rotation.x=Math.PI/2;},
  // 🏈 Football jersey: big shoulder pads, a number and stripes on the sleeves
  football(k,c){const m=k.mat(c),w=k.mat(trimOf(c));k.topShell(m,'short');for(const a of k.arms){const p=k.P(sph(.085,18,12),m,k.spine,a.sx*.13,.43,0);p.scale.set(1,.5,1.05);
      for(const dy of [-.02,-.035])k.P(new THREE.TorusGeometry(.053,.006,6,20),w,a.sh,0,dy,0).rotation.x=Math.PI/2;}
    crewNeck(k,w,.058,.01);frontText(k,'88',trimOf(c),.27,.15);},
  // 🪖 Camo jacket: camouflage print, pockets on the chest and a collar
  camo(k,c){const m=camoMat(k,c);k.topShell(m,'long');shirtCollar(k,m);frontStrip(k,k.mat(shadeC(c,-.35)),lineOf(0,.45,0,.04,.004,.004,10),.004);
    for(const s of [-1,1])frontStrip(k,camoMat(k,shadeC(c,-.05)),lineOf(s*.065,.37,s*.065,.31,.028,.028,2),.005);cuffs(k,m,.044,.012);waistband(k,m);},
  // 🧶 Sweater vest: an argyle vest over a white button-up
  sweatervest(k,c){GUY_WEAR.buttonup(k,'#ffffff');const v=k.topShell(argyleMat(k,c));v.scale.multiplyScalar(1.025);v.scale.z*=1.02;
    frontStrip(k,k.mat('#ffffff'),lineOf(0,.47,0,.33,.04,.0,6),.006);for(const s of [-1,1])frontStrip(k,k.mat(shadeC(c,-.3)),lineOf(s*.04,.47,0,.33,.005,.004,6),.007);waistband(k,k.mat(shadeC(c,-.3)));},
  // 🩹 Ripped jeans: tight jeans with frayed rips at the knees
  ripped(k,c){GUY_WEAR.slimjeans(k,c);const w=k.mat('#f2efe6');for(const l of k.legs){for(const [p,y] of [[l.kn,-.01],[l.hp,-.24]]){const r=k.P(box(.05,.022,.004),w,p,0,y,.067);r.rotation.z=l.sx*.15;}}},
  // 🪖 Camo pants with pockets on the side
  camopants(k,c){const m=camoMat(k,c);k.waist(m);looseLegs(k,m,.084,{hem:.84});sidePockets(k,camoMat(k,shadeC(c,-.05)),-.24,.084);guyBelt(k,'#1a1a1a');},
  // 🩳 Chino shorts with rolled hems
  chinoshorts(k,c){const m=k.mat(c);k.waist(m);looseLegs(k,m,.084,{thigh:.36,shin:0});for(const l of k.legs)beltRing(k,k.mat(shadeC(c,-.1)),l.hp,.086,.009,.02-.36+.01);guyBelt(k);},
  // 🤠 Cowboy boots: pointy toes, a heel, tall shafts and stitching
  cowboyboots(k,c){const m=k.mat(c,'shiny');shoeShell(k,m,.85,1.02).forEach(sh=>{sh.scale.z*=1.15;});bootLeg(k,m,.066,.2);const dk=k.mat(shadeC(c,-.35),'shiny');
    k.legs.forEach(l=>{k.P(box(.07,.045,.05),dk,l.an,0,-.05,-.035);for(const s of [-1,1]){const st=k.P(box(.004,.12,.004),k.mat('#ffd23f'),l.kn,s*.05,-.31-k.av.legX,.042);st.rotation.y=s*.6;}});},
  // ✨ Gold sneakers: shiny gold with white soles
  goldkicks(k,c){const m=k.mat(c,'metal');m.roughness=.18;shoeShell(k,m,.88,1.05);solePad(k,k.mat('#ffffff','shiny'),.036,.118,.235);shoeTrim(k,k.mat('#ffffff','shiny'));},
  // 🏃 Running shoes: light, with a bright sole and a stripe
  runners(k,c){const m=k.mat(c);shoeShell(k,m,.8,1.03);solePad(k,k.mat(isLight(c)?'#ff3b6b':'#ffd23f','shiny'),.03,.114,.232);shoeTrim(k,k.mat('#ffffff','shiny'));},
  // 🕵️ Fedora: a pinched crown, a band and a short brim
  fedora(k,c){const m=k.mat(c);m.side=THREE.DoubleSide;const cr=k.P(new THREE.CylinderGeometry(.115,.135,.11,32),m,k.head,0,.15,-.005);cr.scale.z=.95;
    k.P(sph(.1,20,10,0,Math.PI*2,0,Math.PI/2),m,k.head,0,.2,-.005).scale.set(1.13,.25,1.05);beltRing(k,k.mat('#1a1a1a'),k.head,.135,.012,.11);
    const b=k.P(new THREE.CylinderGeometry(.21,.21,.008,40),m,k.head,0,.098,-.005);b.rotation.x=-.08;},
  // 🤠 Cowboy hat: a tall crown and a wide brim that curls up at the sides
  cowboyhat(k,c){const m=k.mat(c);m.side=THREE.DoubleSide;k.P(new THREE.CylinderGeometry(.11,.13,.13,32),m,k.head,0,.16,-.005).scale.z=.9;
    k.P(sph(.1,20,10,0,Math.PI*2,0,Math.PI/2),m,k.head,0,.22,-.005).scale.set(1.1,.3,.95);beltRing(k,k.mat(shadeC(c,-.45)),k.head,.13,.012,.11);
    const g=new THREE.RingGeometry(.12,.27,48,4),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),r=Math.hypot(x,y);p.setZ(i,Math.max(0,r-.17)*Math.pow(Math.abs(x)/r,3)*1.1);}g.computeVertexNormals();
    const br=k.P(g,m,k.head,0,.1,-.005);br.rotation.x=-Math.PI/2;},
  // ☀️ Visor: a headband with a curved brim and no top
  visor(k,c){const m=k.mat(c);m.side=THREE.DoubleSide;k.P(new THREE.CylinderGeometry(.143,.143,.035,32,1,true),m,k.head,0,.065,-.005);
    const b=k.P(new THREE.CylinderGeometry(.143,.2,.012,32,1,false,-1,2),m,k.head,0,.05,-.005);b.scale.z=1.1;},
  // 💎 Diamond studs in both ears
  studs(k,c){const m=k.mat(c,'gem');for(const s of [-1,1])k.P(new THREE.OctahedronGeometry(.008,0),m,k.head,s*.12*k.av.hs.x,-.035,0);},
  // 🪖 Dog tags on a chain
  dogtags(k,c){const m=k.mat(c,'metal'),g=new THREE.TorusGeometry(.006,.0018,6,10);
    for(let i=0;i<22;i++){const a=i/22*Math.PI*2;k.P(g.clone(),m,k.spine,Math.sin(a)*.074,.45-Math.max(0,Math.cos(a))*.1,Math.cos(a)*.066+(Math.cos(a)>0?.014:0)).rotation.y=a;}
    for(const s of [-1,1]){const t=k.P(new RoundedBoxGeometry(.026,.04,.004,2,.006),m,k.spine,s*.009,.33,shellZ(k,.33)+.006);t.rotation.z=s*.15;}},
});
Object.assign(GUY_WEAR,STORE_WEAR);Object.assign(OUTFITS2D,{aviators:STORE_WEAR.aviators,roundspecs:STORE_WEAR.roundspecs,sportshades:STORE_WEAR.sportshades,thickframes:STORE_WEAR.thickframes,gamer3d:STORE_WEAR.gamer3d});
// the store's things are in the closet too, with a 🔒 until you buy them (glasses for girls too)
GUY_TOPS.push(...STORE_TOPS);GUY_BOTTOMS.push(...STORE_BOTTOMS);GUY_SHOES.push(...STORE_SHOES);GUY_HATS.push(...STORE_HATS);GUY_EXTRAS.push(...STORE_GLASSES,...STORE_EXTRAS);EXTRAS.push(...STORE_GLASSES);
// prices. tab:'store' things are sold in the 👔 clothing store, not in the 🪙 coin shop
const STORE_PRICE={tops:[55,35,45,60,50,40],bottoms:[40,45,30],shoes:[60,90,45],hats:[45,55,25],glasses:[40,25,45,30,20],extras:[35,30]};
const STORE_CAT={glasses:STORE_GLASSES,tops:STORE_TOPS,bottoms:STORE_BOTTOMS,shoes:STORE_SHOES,hats:STORE_HATS,extras:STORE_EXTRAS};
for(const tab in STORE_CAT)STORE_CAT[tab].forEach(([id,e,n],i)=>SHOP.push({k:'look:'+id,tab:'store',st:tab,e,n,p:STORE_PRICE[tab][i],
  d:`${tab==='glasses'?'Try them on and see!':'Made for guys.'} Find ${tab==='glasses'?'them':'it'} in your closet's ${{glasses:'Extras',tops:'Tops',bottoms:'Bottoms',shoes:'Shoes',hats:'Hats',extras:'Extras'}[tab]}.`}));

// put one thing on a look (for buying, wearing, and trying things on in the store)
const SLOT_TABS=['dresses','tops','bottoms','shoes','hats','extras'];
function findItem(id){for(const tab of SLOT_TABS){const it=(CAT[tab]||[]).concat(GUY_CAT[tab]||[]).find(x=>x[0]===id);if(it)return [tab,it];}return [null,null];}
function applyItem(L,id,c){const [tab,it]=findItem(id);if(!it)return null;c=c||it[3];
  if(tab==='extras'){L.extras=L.extras||{};if(GLASSES.includes(id))GLASSES.forEach(g=>{if(g!==id)delete L.extras[g];});L.extras[id]=L.extras[id]||c;return tab;}
  L[KEY[tab]]={id,c};
  if(tab==='dresses'){L.top=L.bottom=null;}
  if(tab==='tops'){L.dress=null;if(!L.bottom)L.bottom=plainBottom(L);}
  if(tab==='bottoms'){L.dress=null;if(!L.top)L.top=plainTop(L);}
  return tab;}

/* ---------- put it all on the avatar (14-avatar.js calls this at the end of dress) ---------- */
function barberDress(k,look){const av=k.av,h=look.hair||{},cut=BCUT[h.id];
  if(cut){const cap=av.hairMeshes[0];if(cap){cap.visible=false;av.hairMeshes=av.hairMeshes.filter(m=>m!==cap);}
    const m=k.mat(h.c||'#2b1d16','hair');const n0=av.parts.length;
    if(h.id!=='bald'){const g=shellGeo(av,cut[3]);fuzz(g,.0012,200);k.P(g,m,k.head);}
    if(cut[4])cut[4](k,m);av.hairMeshes=av.hairMeshes.concat(av.parts.slice(n0).filter(o=>o.isMesh));}
  if(look.beard&&look.beard.id&&look.beard.id!=='none')buildBeard(k,look.beard);}
