/* ================= MAP ================= */
const MAPC={studio:'#ffd6ea',birthday:'#ffb3c7',halloween:'#ff9a3c',christmas:'#e9f4ff',beach:'#ffe39a',runway:'#c9b6ff',spring:'#b8f0a8',parlor:'#ffd8b0',bakery:'#ffc4dd',agency:'#ffe066',court:'#ffb070',batting:'#a8e0a0',barn:'#f2b38a',zoo:'#f5d98a',garage:'#cfe0ff',barber:'#bcd7ff',store:'#d7ccb8'};
const zEmoji=z=>z.name.split(' ')[0],zLabel=z=>z.name.replace(/^\S+\s/,'');
let mapDest=null,mapOthers=null;
const miniCv=$('#miniCv'),miniX=miniCv.getContext('2d'),mapCv=$('#mapCv'),mapX=mapCv.getContext('2d');
// shared drawing of the island; w2s maps world (x,z) to canvas px, k = px per world unit
function drawWorld(x,w2s,k,size){
  x.fillStyle='#2ab0d4';x.fillRect(0,0,size,size);
  const [cx,cy]=w2s(0,0);
  x.beginPath();x.arc(cx,cy,(R+2.4)*k,0,Math.PI*2);x.fillStyle='#f1d9a6';x.fill();
  x.beginPath();x.arc(cx,cy,R*k,0,Math.PI*2);x.fillStyle='#8fd36f';x.fill();
  // beach dock
  {const b=Z.beach;if(b.dock){const [a1,a2]=[b.toWorld(b.dock.lx,b.dock.lz0),b.toWorld(b.dock.lx,b.dock.lz1)];const p1=w2s(...a1),p2=w2s(...a2);x.strokeStyle='#9a6a43';x.lineWidth=Math.max(2,1.6*k);x.lineCap='butt';x.beginPath();x.moveTo(...p1);x.lineTo(...p2);x.stroke();}}
  // paths
  x.strokeStyle='#efe6da';x.lineCap='round';x.lineWidth=Math.max(2,2.6*k);
  x.beginPath();x.arc(cx,cy,7.15*k,0,Math.PI*2);x.stroke();
  for(const z of ZONES){if(!z.d||z.nopath)continue;const [px,py]=w2s(z.x,z.z),f=(z.p0||7)/z.d;x.beginPath();x.moveTo(cx+(px-cx)*f,cy+(py-cy)*f);x.lineTo(px,py);x.stroke();}
  // zones
  for(const z of ZONES){const [px,py]=w2s(z.x,z.z);x.beginPath();x.arc(px,py,z.r*k,0,Math.PI*2);x.fillStyle=MAPC[z.id]||'#fff3b0';x.fill();
    x.lineWidth=Math.max(1.5,.35*k);x.strokeStyle=mapDest===z?'#ff4d8d':'rgba(255,255,255,.9)';x.stroke();}
}
function drawArrow(x,px,py,ang,s,fill){x.save();x.translate(px,py);x.rotate(ang);x.beginPath();x.moveTo(0,-s);x.lineTo(s*.72,s*.7);x.lineTo(0,s*.32);x.lineTo(-s*.72,s*.7);x.closePath();
  x.fillStyle=fill;x.fill();x.lineWidth=s*.22;x.strokeStyle='#fff';x.lineJoin='round';x.stroke();x.restore();}
function drawMini(){const S=miniCv.width,h=S/2,k=S/54;// ~54 world units across
  const p=player.pos,fx=-Math.sin(cam.yaw),fz=-Math.cos(cam.yaw),rx=-fz,rz=fx;
  // heading-up: what's ahead on screen is up on the map
  const w2s=(wx,wz)=>{const dx=wx-p.x,dz=wz-p.z;return [h+(dx*rx+dz*rz)*k,h-(dx*fx+dz*fz)*k];};
  const x=miniX;x.save();drawWorld(x,w2s,k,S);
  for(const s of STARS){if(s.got)continue;const [sx,sy]=w2s(s.x,s.z);if(Math.hypot(sx-h,sy-h)>h)continue;x.beginPath();x.arc(sx,sy,4,0,Math.PI*2);x.fillStyle='#ffd23f';x.fill();x.lineWidth=1.5;x.strokeStyle='#fff';x.stroke();}
  x.font=`${Math.round(S*.12)}px serif`;x.textAlign='center';x.textBaseline='middle';
  for(const z of ZONES){const [zx,zy]=w2s(z.x,z.z);if(Math.hypot(zx-h,zy-h)<h+10)x.fillText(zEmoji(z),zx,zy);}
  if(mapOthers)for(const o of mapOthers.values()){const [ox,oy]=w2s(o.pos.x,o.pos.z);if(Math.hypot(ox-h,oy-h)>h-6)continue;x.beginPath();x.arc(ox,oy,7,0,Math.PI*2);x.fillStyle='#2fb8a5';x.fill();x.lineWidth=2.5;x.strokeStyle='#fff';x.stroke();}
  if(mapDest){let [dx,dy]=w2s(mapDest.x,mapDest.z);const ddx=dx-h,ddy=dy-h,dd=Math.hypot(ddx,ddy),edge=h-16;
    x.setLineDash([10,9]);x.lineDashOffset=-performance.now()/40;x.lineWidth=5;x.strokeStyle='#ff4d8d';x.beginPath();x.moveTo(h,h);
    const end=Math.min(dd,edge);x.lineTo(h+ddx/dd*end,h+ddy/dd*end);x.stroke();x.setLineDash([]);
    if(dd>edge){drawArrow(x,h+ddx/dd*edge,h+ddy/dd*edge,Math.atan2(ddx,-ddy),15,'#ff4d8d');}
    else{x.beginPath();x.arc(dx,dy,9+Math.sin(performance.now()/180)*2,0,Math.PI*2);x.lineWidth=4;x.strokeStyle='#ff4d8d';x.stroke();}}
  // player: facing relative to the camera
  const pa=Math.atan2(Math.sin(player.face)*rx+Math.cos(player.face)*rz,Math.sin(player.face)*fx+Math.cos(player.face)*fz);
  drawArrow(x,h,h,pa,15,'#8e6cff');x.restore();}
// full map is fixed (start view: the plaza is "up"), so places never move around.
// It can zoom in (➕ / pinch) and be dragged around, so names stay big enough to read on a phone.
const MAPW=R+3,MAPZ=[1,1.6,2.4];
const mv={zi:0,z:1,ox:0,oy:0};// zoom step, zoom, and how far the view is dragged (canvas px)
const mapK=()=>mapCv.width/(MAPW*2)*mv.z;
// world (x,z) -> canvas px; lay=true gives the un-dragged spot used for laying out tags
const mapW2s=(wx,wz,lay)=>{const S=mapCv.width,k=mapK();return [S/2+(lay?0:mv.ox)+wx*k,S/2+(lay?0:mv.oy)+wz*k];};
const mapTS=()=>Math.min(1.35,Math.pow(mv.z,.45));// tags grow a little when zoomed in
const mapFont=S=>`700 ${Math.round(S*.03*mapTS())}px system-ui,-apple-system,sans-serif`;
// Where each place's emoji and name tag go. Tags try below, above, then beside the place and take the first
// spot that doesn't cover another tag or emoji, so names never sit on top of each other.
let mapLay=null;
function mapLayout(){const S=mapCv.width;if(mapLay&&mapLay.S===S&&mapLay.n===ZONES.length&&mapLay.zm===mv.z)return mapLay.z;
  const x=mapX,k=mapK(),ts=mapTS(),h=Math.round(S*.046*ts),pad=S*.008,c=S/2,rIn=MAPW*k-S*.01;x.font=mapFont(S);
  const items=ZONES.map(z=>{const [px,py]=mapW2s(z.x,z.z,true),e=Math.round(Math.min(S*.06*ts,Math.max(S*.042*ts,z.r*k*1.05)));
    return {z,px,py,e,t:zLabel(z),w:x.measureText(zLabel(z)).width+S*.028*ts,eb:{x0:px-e*.55,y0:py-e*.62,x1:px+e*.55,y1:py+e*.48}};});
  const hit=(a,b,p=pad)=>a.x0<b.x1+p&&b.x0<a.x1+p&&a.y0<b.y1+p&&b.y0<a.y1+p;
  const inside=b=>[[b.x0,b.y0],[b.x1,b.y0],[b.x0,b.y1],[b.x1,b.y1]].every(([X,Y])=>Math.hypot(X-c,Y-c)<rIn);
  // a long name can also fold onto two lines when one line doesn't fit anywhere
  const two=t=>{const ws=t.split(' ');if(ws.length<2)return null;let bi=1,bw=1e9;for(let i=1;i<ws.length;i++){const m=Math.max(x.measureText(ws.slice(0,i).join(' ')).width,x.measureText(ws.slice(i).join(' ')).width);if(m<bw){bw=m;bi=i;}}
    return {lines:[ws.slice(0,bi).join(' '),ws.slice(bi).join(' ')],w:bw+S*.028*ts};};
  // place tags one by one; try a few different orders and keep the tidiest result
  const tryOrder=order=>{const placed=[],out=new Map();let tot=0;
    for(const it of order){const {px,py,e}=it;let best=null,bs=1e9;
      for(const v of [{lines:[it.t],w:it.w},two(it.t)]){if(!v||bs<.05)continue;const w=v.w,hh=h*(v.lines.length>1?1.75:1);
        const dn=py+e*.48+hh*.5+2,up=py-e*.62-hh*.5-2,sx=e*.3+w*.5;
        const cands=[[px,dn],[px,up],[px+sx,dn],[px-sx,dn],[px+sx,up],[px-sx,up],[px+e*.55+w*.5+4,py],[px-e*.55-w*.5-4,py]];
        for(let [ci,[cx,cy]] of cands.entries()){
          // keep tags over the map; poking a little past the shore onto the water is fine
          cx=Math.max(c-MAPW*k+w/2+4,Math.min(c+MAPW*k-w/2-4,cx));
          const b={x0:cx-w/2,y0:cy-hh/2,x1:cx+w/2,y1:cy+hh/2,lines:v.lines};
          const sc=(inside(b)?0:.5)+placed.filter(o=>hit(b,o)).length*100+items.filter(o=>o!==it&&hit(b,o.eb)).length*100+(hit(b,it.eb,-2)?100:0)+[0,.1,.3,.3,.4,.4,.7,.7][ci]+(v.lines.length>1?.25:0);
          if(sc<bs){bs=sc;best=b;}if(sc<.05)break;}}
      out.set(it,best);placed.push(best);tot+=bs;}
    return {out,tot};};
  // crowded middle first is usually best; then some shuffles (same every time) in case it isn't
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  let best=tryOrder([...items].sort((a,b)=>a.z.d-b.z.d));
  for(let i=0;i<40&&best.tot>=100;i++){const o=[...items];for(let j=o.length-1;j>0;j--){const q=Math.floor(rnd()*(j+1));[o[j],o[q]]=[o[q],o[j]];}
    const r=tryOrder(o);if(r.tot<best.tot)best=r;}
  for(const it of items)it.lb=best.out.get(it);
  mapLay={S,n:ZONES.length,zm:mv.z,z:items};return items;}
function drawMap(){const S=mapCv.width,k=mapK(),x=mapX,ts=mapTS();drawWorld(x,mapW2s,k,S);
  x.save();x.translate(mv.ox,mv.oy);
  x.textAlign='center';x.textBaseline='middle';const lay=mapLayout(),h=S*.046*ts;
  for(const it of lay){const z=it.z;x.font=`${it.e}px serif`;x.fillText(zEmoji(z),it.px,it.py-it.e*.07);}
  for(const it of lay){const z=it.z,b=it.lb,cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;x.font=mapFont(S);
    x.fillStyle=mapDest===z?'#ff4d8d':'rgba(59,35,87,.86)';x.beginPath();x.roundRect?x.roundRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0,h/2):x.rect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);x.fill();
    x.fillStyle='#fff';b.lines.forEach((t,i)=>x.fillText(t,cx,cy+1+(i-(b.lines.length-1)/2)*h*.72));
    if(window.__chal&&window.__chal.left(z.id)){x.font=`${Math.round(S*.04*ts)}px serif`;x.fillText('⭐',it.px+it.e*.6,it.py-it.e*.6);}}
  x.restore();x.textAlign='center';x.textBaseline='middle';
  if(mapOthers)for(const o of mapOthers.values()){const [ox,oy]=mapW2s(o.pos.x,o.pos.z);x.beginPath();x.arc(ox,oy,S*.016,0,Math.PI*2);x.fillStyle='#2fb8a5';x.fill();x.lineWidth=3;x.strokeStyle='#fff';x.stroke();}
  const [px,py]=mapW2s(player.pos.x,player.pos.z);
  x.beginPath();x.arc(px,py,S*.04+Math.sin(performance.now()/200)*S*.006,0,Math.PI*2);x.fillStyle='rgba(142,108,255,.25)';x.fill();
  x.beginPath();x.arc(px,py,S*.026,0,Math.PI*2);x.fillStyle='#fff';x.fill();drawArrow(x,px,py,Math.atan2(Math.sin(player.face),-Math.cos(player.face)),S*.022,'#8e6cff');
  x.font=mapFont(S);const yh=S*.046*ts,yw=x.measureText('You').width+S*.03*ts,yy=py-S*.04-yh*.6;
  x.fillStyle='#8e6cff';x.beginPath();x.roundRect?x.roundRect(px-yw/2,yy-yh/2,yw,yh,yh/2):x.rect(px-yw/2,yy-yh/2,yw,yh);x.fill();x.lineWidth=3;x.strokeStyle='#fff';x.stroke();
  x.fillStyle='#fff';x.fillText('You',px,yy+1);}
// keep the island on screen while dragging
function mapClamp(){const S=mapCv.width,lim=Math.max(0,MAPW*mapK()-S/2);mv.ox=Math.max(-lim,Math.min(lim,mv.ox));mv.oy=Math.max(-lim,Math.min(lim,mv.oy));}
// zoom to step i, keeping the canvas point (fx,fy) still (default: the middle of the view)
function mapZoom(i,fx,fy){const S=mapCv.width;i=Math.max(0,Math.min(MAPZ.length-1,i));if(fx==null){fx=fy=S/2;}
  const f=MAPZ[i]/mv.z;mv.ox=fx-S/2-(fx-S/2-mv.ox)*f;mv.oy=fy-S/2-(fy-S/2-mv.oy)*f;mv.zi=i;mv.z=MAPZ[i];mapClamp();
  mapCv.classList.toggle('zoomed',i>0);$('#mapIn').disabled=i===MAPZ.length-1;$('#mapOut').disabled=i===0;}
function mapCenterOn(wx,wz){const k=mapK();mv.ox=-wx*k;mv.oy=-wz*k;mapClamp();}
let mapOpen=false;
function openMap(){if(closetOpen)return;mapOpen=true;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';$('#mapStop').style.display=mapDest?'inline-block':'none';
  $('#mapTip').textContent=mapDest?`Going to ${zLabel(mapDest)}. Tap another place to change.`:'Tap a place and a sparkly arrow will show you the way!';
  if(mv.zi>0)mapCenterOn(player.pos.x,player.pos.z);
  $('#map').classList.add('show');sfx('pop');(function loop(){if(!mapOpen)return;drawMap();requestAnimationFrame(loop);})();}
function closeMap(){mapOpen=false;$('#map').classList.remove('show');}
// 3D guide beam over the place you're going to
const beam=new THREE.Group();beam.visible=false;scene.add(beam);
{const bm=new THREE.MeshBasicMaterial({color:'#ff6fae',transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending});
 M(new THREE.CylinderGeometry(.55,.9,40,24,1,true),bm,0,20,0,beam,false,false);
 const st=M(new THREE.OctahedronGeometry(.8),new THREE.MeshBasicMaterial({color:'#ffd23f'}),0,6,0,beam,false,false);
 anims.push(t=>{if(!beam.visible)return;st.position.y=6+Math.sin(t*2.5)*.5;st.rotation.y=t*2;bm.opacity=.28+Math.sin(t*4)*.08;});}
function setDest(z){mapDest=z;$('#mini').classList.toggle('going',!!z);if(z){beam.position.set(z.x,0,z.z);beam.visible=true;}else beam.visible=false;}
// drag to move the map around when zoomed in, pinch to zoom; a short tap picks a place
const mptr=new Map();let mdrag=0,mpinch=0;
const mapPt=e=>{const r=mapCv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*mapCv.width,(e.clientY-r.top)/r.height*mapCv.height];};
mapCv.addEventListener('pointerdown',e=>{mptr.set(e.pointerId,mapPt(e));if(mptr.size===1)mdrag=0;if(mptr.size===2){const [a,b]=[...mptr.values()];mpinch=Math.hypot(a[0]-b[0],a[1]-b[1]);}try{mapCv.setPointerCapture(e.pointerId);}catch(_){}});
mapCv.addEventListener('pointermove',e=>{const old=mptr.get(e.pointerId);if(!old)return;const p=mapPt(e);mptr.set(e.pointerId,p);
  if(mptr.size===2){const [a,b]=[...mptr.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);mdrag=99;
    if(mpinch&&d/mpinch>1.35){mapZoom(mv.zi+1,(a[0]+b[0])/2,(a[1]+b[1])/2);mpinch=d;}else if(mpinch&&d/mpinch<.74){mapZoom(mv.zi-1,(a[0]+b[0])/2,(a[1]+b[1])/2);mpinch=d;}return;}
  const dx=p[0]-old[0],dy=p[1]-old[1];mdrag+=Math.hypot(dx,dy);if(mv.zi>0){mv.ox+=dx;mv.oy+=dy;mapClamp();}});
const mapUp=e=>{mptr.delete(e.pointerId);if(mptr.size<2)mpinch=0;};
mapCv.addEventListener('pointerup',mapUp);mapCv.addEventListener('pointercancel',mapUp);
mapCv.addEventListener('wheel',e=>{e.preventDefault();const [fx,fy]=mapPt(e);mapZoom(mv.zi+(e.deltaY<0?1:-1),fx,fy);},{passive:false});
$('#mapIn').onclick=()=>mapZoom(mv.zi+1);$('#mapOut').onclick=()=>mapZoom(mv.zi-1);
mapCv.addEventListener('click',e=>{if(mdrag>mapCv.width*.02)return;// that was a drag, not a tap
  const [sx0,sy0]=mapPt(e),sx=sx0-mv.ox,sy=sy0-mv.oy;
  // a tap on a name tag picks that place; otherwise the closest place within reach of the tap
  const S=mapCv.width,k=mapK(),lay=mapLayout();let best=null,bd=1e9;
  for(const it of lay){const b=it.lb;if(sx>=b.x0-4&&sx<=b.x1+4&&sy>=b.y0-4&&sy<=b.y1+4){best=it.z;bd=0;break;}}
  if(!best)for(const it of lay){const d=Math.hypot(sx-it.px,sy-it.py);if(d<Math.max(it.z.r*k,S*.06)&&d<bd){bd=d;best=it.z;}}
  if(!best)return;if(curZone===best){toast(`You're already at ${zLabel(best)}! ✨`);return;}
  setDest(best);sfx('star');closeMap();toast(`Follow the pink arrow on the map to ${zLabel(best)} 💗`);});
$('#mini').addEventListener('click',openMap);
$('#mapClose').onclick=closeMap;
$('#mapStop').onclick=()=>{setDest(null);closeMap();};
$('#map').addEventListener('click',e=>{if(e.target.id==='map')closeMap();});
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='KeyM'){mapOpen?closeMap():started&&openMap();}else if(e.code==='Escape'&&mapOpen)closeMap();});
let miniT=0;
onTick.push(dt=>{if(mapDest&&curZone===mapDest){did('arrive',mapDest.id);sfx('tada');banner(`🎉 You made it!`);burst(player.pos.clone().add(new THREE.Vector3(0,1.5,0)),'#ff8fc8',40,3);setDest(null);}
  if((miniT+=dt)>1/30){miniT=0;drawMini();}});
window.__game={AG,ct,openGlam,closeGlam,openContest,endContest,ag,setDest,mapDest:()=>mapDest,openMap,closeMap,setMapOthers:m=>{mapOthers=m;},FRIENDS,openTalk,closeTalk,townSave,player,cam,camera,openCloset,closeCloset,openParlor,closeParlor,tryParlor,openBakery,closeBakery,bakery:()=>bk,petCare,SAVE,av:()=>av,ZONES,STARS,joy,keys,PETS,doAction,setZoom:z=>{setZoom(z);renderCloset();},THREE,scene,Avatar,onTick,toast,banner,burst,friendBubble,angDamp,
  sun,hemi,skyMat,sky,renderer,FOG,LAMPS,lampMat,CLOUD_MATS,CAT,DRESSES,TOPS,HATS,EXTRAS,SHOP,Z,deg,M,std,phys,glow,sph,cyl,box,canvasTex,labelTex,sprite,floaties,sfx,tone,groundAt,obs,starGeo,earn,addHeart,tsay,talkF:()=>talkF,TALK_EXTRA,persist,rebuildPlayer,refreshOpen,CT_THEMES,closetOpen:()=>closetOpen,started:()=>started};
Object.assign(window.__game,{openBarn,closeBarn,startRide,stopRide,openZoo,closeZoo,farmPic,barn:()=>BS,farm:()=>FA,zoo:()=>ZA,openBraid,glamCheck,zone:()=>curZone,sfx,busy:()=>closetOpen||!started||mapOpen,started:()=>started,myPet,townSave});
