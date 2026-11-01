/* ================= POLISHED DOLL LOOK ================= */
// Shared textures and shapes that give the people soft, detailed faces and silky hair:
// shaded irises, a fan of curled lashes, thick tapered brows, sculpted glossy lips and hair strands.
// Every texture here is made once and shared by everyone, so it costs no extra memory per person.

// iris: the sphere is turned so its pole looks forward, so canvas rows are rings (pupil in the middle,
// dark rim outside) and canvas columns go around the eye (left half of the canvas is the bottom of the eye).
// It is white and grey, so the eye color tints it.
let IRIS_TEX=null;
function irisTex(){if(IRIS_TEX)return IRIS_TEX;IRIS_TEX=canvasTex(256,256,(x,w,h)=>{
  for(let y=0;y<h;y++){const th=y/h*Math.PI,s=th<Math.PI/2?Math.sin(th):1;let c;
    if(s<.4)c=8;else if(s<.47)c=8+(s-.4)/.07*150;else if(s<.84)c=255-(s-.47)/.37*95;else if(s<.93)c=160-(s-.84)/.09*120;else c=40;
    x.fillStyle=`rgb(${c|0},${c|0},${c|0})`;x.fillRect(0,y,w,1);}
  // little streaks around the iris
  const r0=h*Math.asin(.47)/Math.PI,r1=h*Math.asin(.86)/Math.PI;
  for(let i=0;i<220;i++){const u=Math.random()*w,a=Math.random();x.strokeStyle=a<.5?`rgba(255,255,255,${.25+Math.random()*.35})`:`rgba(40,30,30,${.12+Math.random()*.2})`;x.lineWidth=1+Math.random()*1.5;
    x.beginPath();x.moveTo(u,r0+Math.random()*4);x.lineTo(u+(Math.random()-.5)*3,r1-Math.random()*8);x.stroke();}
  // light comes in from below, the upper lid shades the top
  let g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.25,'rgba(255,255,255,.35)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(.75,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,r0,w,r1-r0);});IRIS_TEX.anisotropy=4;return IRIS_TEX;}
function irisGeo(r){const g=new THREE.SphereGeometry(r,32,20);g.rotateX(Math.PI/2);return g;}

// a fan of curled lashes along the upper lid (and a few under the outer corner), merged into one mesh.
// rx, ry: the eye's half width and height; sx: which side (outer corner is at x = sx*rx); n, len: how many and how long
function lashFan(rx,ry,sx,n,len,thick=1){const parts=[];
  const one=(px,py,ang,L,curl,r)=>{const g=new THREE.ConeGeometry(r,L,4,3);g.translate(0,L/2,0);const p=g.attributes.position;
    for(let i=0;i<p.count;i++){const t=p.getY(i)/L;p.setZ(i,p.getZ(i)+curl*L*t*t);}   // curl forward, like curled lashes
    g.rotateZ(ang);g.translate(px,py,.003);parts.push(g);};
  for(let i=0;i<n;i++){const f=(i+.5)/n,a=Math.PI*(sx>0?.06+f*.86:.94-f*.86);const px=Math.cos(a)*rx,py=Math.sin(a)*ry;
    const out=Math.max(0,Math.cos(a)*sx);   // 0 at the inner corner side, 1 at the outer corner
    const nx=Math.cos(a)/rx,ny=Math.sin(a)/ry;const ang=Math.atan2(-nx,ny)-sx*(.25+.35*out);
    one(px,py,ang,len*(.55+.6*out)*(1+(i%2)*.12),.55,.0012*thick);
    if(i%2&&out>.3)one(px,py,ang-sx*.18,len*(.5+.5*out),.5,.001*thick);}   // little clumps, fuller at the outer corner
  for(let i=0;i<4;i++){const a=-Math.PI/2+sx*(.55+i*.22);const px=Math.cos(a)*rx*.98,py=Math.sin(a)*ry*.95;one(px,py,Math.atan2(-sx*.6,-1),len*.3,-.3,.0007*thick);}
  const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());g.computeVertexNormals();return g;}

// a thick brow that tapers to a fine tail. pts: points in head space from the inner end to the tail
function browGeo(pts,r0,r1,flat=.45){const c=new THREE.CatmullRomCurve3(pts),seg=24,rad=8,g=new THREE.TubeGeometry(c,seg,1,rad,false),p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<=seg;i++){const t=i/seg,P=c.getPointAt(t);let R=r0+(r1-r0)*Math.pow(t,.9);if(t<.15)R*=.6+.4*Math.sin(t/.15*Math.PI/2);
    for(let j=0;j<=rad;j++){const k=i*(rad+1)+j;v.set(p.getX(k),p.getY(k),p.getZ(k)).sub(P).multiplyScalar(R);v.z*=flat;v.add(P);p.setXYZ(k,v.x,v.y,v.z);}}
  g.computeVertexNormals();return g;}

// sculpted lips: a squashed sphere bent into a lip shape. Upper lips get a cupid's bow and a little dip in the middle
// of the bottom edge; lower lips are fuller in the middle. z(x,y) is the face surface there.
function lipGeo(upper,w,h,d,cy,z){const g=new THREE.SphereGeometry(1,40,20),p=g.attributes.position;
  const zs=[];for(let i=0;i<=8;i++){const X=(i/8*2-1)*w;zs.push(z(X,cy));}const zAt=X=>{const f=(X/w+1)/2*8,i=Math.max(0,Math.min(7,Math.floor(f)));return zs[i]+(zs[i+1]-zs[i])*(f-i);};
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),zz=p.getZ(i);let Y,f;
    if(upper){f=Math.max(.18,1-.62*x*x);Y=y*h*f;if(y>0)Y+=y*h*(.35*Math.exp(-(((Math.abs(x)-.3)/.2)**2))-.5*Math.exp(-((x/.12)**2)));else Y-=-y*h*.28*Math.exp(-((x/.28)**2));}
    else{f=Math.max(.16,Math.pow(1-x*x,.7));Y=y*h*f;if(y<0)Y-=-y*h*.12*Math.exp(-((x/.4)**2));}
    const X=x*w;p.setXYZ(i,X,cy+Y,zAt(X)-d*.55+zz*d*f-d*.9*x*x*x*x);}
  g.computeVertexNormals();return g;}

// silky hair: fine light and dark strands running along the hair (down the cylinders, from the crown on the cap)
let HAIR_TEX=null;
function hairTex(){if(HAIR_TEX)return HAIR_TEX;HAIR_TEX=canvasTex(512,256,(x,w,h)=>{x.fillStyle='#e6e6e6';x.fillRect(0,0,w,h);
  for(let i=0;i<500;i++){const u=Math.random()*w,l=1+Math.random()*2.5;const d=Math.random();x.strokeStyle=d<.5?`rgba(255,255,255,${.08+Math.random()*.18})`:`rgba(60,60,60,${.05+Math.random()*.1})`;x.lineWidth=l;
    x.beginPath();x.moveTo(u,0);x.bezierCurveTo(u+(Math.random()-.5)*6,h*.35,u+(Math.random()-.5)*6,h*.7,u+(Math.random()-.5)*4,h);x.stroke();}
  // a soft shiny band, like light on silky hair
  const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.22,'rgba(255,255,255,.18)');g.addColorStop(.32,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h);});
  HAIR_TEX.wrapS=HAIR_TEX.wrapT=THREE.RepeatWrapping;HAIR_TEX.repeat.set(2,1);return HAIR_TEX;}

