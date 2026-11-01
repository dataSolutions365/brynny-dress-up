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
  for(const z of ZONES){if(!z.d||z.nopath)continue;const [px,py]=w2s(z.x,z.z);x.beginPath();x.moveTo(cx+(px-cx)*7/z.d,cy+(py-cy)*7/z.d);x.lineTo(px,py);x.stroke();}
  // zones
  for(const z of ZONES){const [px,py]=w2s(z.x,z.z);x.beginPath();x.arc(px,py,z.r*k,0,Math.PI*2);x.fillStyle=MAPC[z.id]||'#fff3b0';x.fill();
    x.lineWidth=Math.max(1.5,.35*k);x.strokeStyle=mapDest===z?'#ff4d8d':'rgba(255,255,255,.9)';x.stroke();}
}
function drawArrow(x,px,py,ang,s,fill){x.save();x.translate(px,py);x.rotate(ang);x.beginPath();x.moveTo(0,-s);x.lineTo(s*.72,s*.7);x.lineTo(0,s*.32);x.lineTo(-s*.72,s*.7);x.closePath();
  x.fillStyle=fill;x.fill();x.lineWidth=s*.22;x.strokeStyle='#fff';x.lineJoin='round';x.stroke();x.restore();}
function drawMini(){const S=miniCv.width,h=S/2,k=S/44;// ~44 world units across
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
// full map is fixed (start view: the plaza is "up"), so places never move around
const MAPW=R+5;
const mapW2s=(wx,wz)=>{const S=mapCv.width,k=S/(MAPW*2);return [S/2+wx*k,S/2+wz*k];};
function drawMap(){const S=mapCv.width,k=S/(MAPW*2),x=mapX;drawWorld(x,mapW2s,k,S);
  x.textAlign='center';x.textBaseline='middle';
  for(const z of ZONES){let [px,py]=mapW2s(z.x,z.z);x.font=`${Math.round(S*.065)}px serif`;x.fillText(zEmoji(z),px,py-S*.018);
    x.font=`700 ${Math.round(S*.03)}px system-ui,-apple-system,sans-serif`;const t=zLabel(z),tw=x.measureText(t).width,ty=py+S*.042;px=Math.min(S*.95-tw/2-8,Math.max(S*.05+tw/2+8,px));
    x.fillStyle=mapDest===z?'#ff4d8d':'rgba(59,35,87,.82)';x.beginPath();x.roundRect?x.roundRect(px-tw/2-8,ty-S*.022,tw+16,S*.044,S*.022):x.rect(px-tw/2-8,ty-S*.022,tw+16,S*.044);x.fill();
    x.fillStyle='#fff';x.fillText(t,px,ty+1);
    if(window.__chal&&window.__chal.left(z.id)){const [bx,by]=mapW2s(z.x,z.z);x.font=`${Math.round(S*.045)}px serif`;x.fillText('⭐',bx+S*.05,by-S*.05);}}
  if(mapOthers)for(const o of mapOthers.values()){const [ox,oy]=mapW2s(o.pos.x,o.pos.z);x.beginPath();x.arc(ox,oy,S*.016,0,Math.PI*2);x.fillStyle='#2fb8a5';x.fill();x.lineWidth=3;x.strokeStyle='#fff';x.stroke();}
  const [px,py]=mapW2s(player.pos.x,player.pos.z);
  x.beginPath();x.arc(px,py,S*.045+Math.sin(performance.now()/200)*S*.006,0,Math.PI*2);x.fillStyle='rgba(142,108,255,.25)';x.fill();
  x.beginPath();x.arc(px,py,S*.03,0,Math.PI*2);x.fillStyle='#fff';x.fill();drawArrow(x,px,py,Math.atan2(Math.sin(player.face),-Math.cos(player.face)),S*.026,'#8e6cff');
  x.font=`700 ${Math.round(S*.03)}px system-ui,-apple-system,sans-serif`;const yw=x.measureText('You').width+S*.03,yy=py-S*.075;
  x.fillStyle='#8e6cff';x.beginPath();x.roundRect?x.roundRect(px-yw/2,yy-S*.024,yw,S*.048,S*.024):x.rect(px-yw/2,yy-S*.024,yw,S*.048);x.fill();x.lineWidth=3;x.strokeStyle='#fff';x.stroke();
  x.fillStyle='#fff';x.fillText('You',px,yy+1);}
let mapOpen=false;
function openMap(){if(closetOpen)return;mapOpen=true;joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';$('#mapStop').style.display=mapDest?'inline-block':'none';
  $('#mapTip').textContent=mapDest?`Going to ${zLabel(mapDest)}. Tap another place to change.`:'Tap a place and a sparkly arrow will show you the way!';
  $('#map').classList.add('show');sfx('pop');(function loop(){if(!mapOpen)return;drawMap();requestAnimationFrame(loop);})();}
function closeMap(){mapOpen=false;$('#map').classList.remove('show');}
// 3D guide beam over the place you're going to
const beam=new THREE.Group();beam.visible=false;scene.add(beam);
{const bm=new THREE.MeshBasicMaterial({color:'#ff6fae',transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending});
 M(new THREE.CylinderGeometry(.55,.9,40,24,1,true),bm,0,20,0,beam,false,false);
 const st=M(new THREE.OctahedronGeometry(.8),new THREE.MeshBasicMaterial({color:'#ffd23f'}),0,6,0,beam,false,false);
 anims.push(t=>{if(!beam.visible)return;st.position.y=6+Math.sin(t*2.5)*.5;st.rotation.y=t*2;bm.opacity=.28+Math.sin(t*4)*.08;});}
function setDest(z){mapDest=z;$('#mini').classList.toggle('going',!!z);if(z){beam.position.set(z.x,0,z.z);beam.visible=true;}else beam.visible=false;}
mapCv.addEventListener('click',e=>{const r=mapCv.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*mapCv.width,sy=(e.clientY-r.top)/r.height*mapCv.height;
  const k=mapCv.width/(MAPW*2);let best=null,bd=1e9;for(const z of ZONES){const [px,py]=mapW2s(z.x,z.z),d=Math.hypot(sx-px,sy-(py+mapCv.width*.012));if(d<Math.max(z.r*k,mapCv.width*.09)&&d<bd){bd=d;best=z;}}
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
