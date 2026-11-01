/* ================= INPUT ================= */
const keys={};addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.code]=true;if(e.code==='Space'){jump();e.preventDefault();}const d=/^Digit(\d)$/.exec(e.code);if(d&&ACTIONS[+d[1]-1])doAction(ACTIONS[+d[1]-1][0]);});addEventListener('keyup',e=>keys[e.code]=false);
const joy={id:null,x0:0,y0:0,x:0,y:0};const look={id:null,x:0,y:0};const joyEl=$('#joy'),knob=$('#knob');
let closetOpen=false;
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
const brush={c:'#2b1d16',size:'thin',erase:false,last:null,id:null};const BRUSH={thin:5,medium:12,thick:26};const undo=[];
function faceHit(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObject(av.overlay,false)[0];return h&&h.uv?h.uv:null;}
function paintAt(uv){const cv=av.paintCv,W=cv.width,x=cv.getContext('2d');const px=uv.x*W,py=(1-uv.y)*W;
  x.globalCompositeOperation=brush.erase?'destination-out':'source-over';x.strokeStyle=brush.c;x.fillStyle=brush.c;x.lineCap=x.lineJoin='round';x.lineWidth=BRUSH[brush.size]*W/1024*(brush.erase?2:1);x.globalAlpha=brush.size==='thick'&&!brush.erase?.55:1;
  x.beginPath();if(brush.last){x.moveTo(brush.last[0],brush.last[1]);x.lineTo(px,py);x.stroke();}else{x.arc(px,py,x.lineWidth/2,0,Math.PI*2);x.fill();}
  x.globalAlpha=1;x.globalCompositeOperation='source-over';brush.last=[px,py];av.renderFace();}
function savePaint(){try{SAVE.facePaint=av.paintCv.toDataURL('image/png');}catch(e){}persist();}
const drawing=()=>closetOpen&&!parlorOpen&&!shopOpen&&ctab==='makeup'&&(!glamOpen||mTool==='paint');
canvas.addEventListener('pointerdown',e=>{e.preventDefault();
  if(pinchDown(e))return;
  if(parlorOpen){parlorDown(e);return;}
  if(bakeryOpen){bakeryDown(e);return;}
  if(garageOpen){garageDown(e);return;}
  if(beautyDown(e))return;
  if(drawing()&&brush.id===null){const uv=faceHit(e);if(uv){brush.id=e.pointerId;brush.last=null;const x=av.paintCv.getContext('2d');undo.push(x.getImageData(0,0,av.paintCv.width,av.paintCv.height));if(undo.length>5)undo.shift();paintAt(uv);try{canvas.setPointerCapture(e.pointerId);}catch(_){}return;}}
  if(closetOpen||e.pointerType==='mouse'||e.clientX>innerWidth*.5){if(look.id===null){look.id=e.pointerId;look.x=e.clientX;look.y=e.clientY;try{canvas.setPointerCapture(e.pointerId);}catch(_){}}return;}
  if(joy.id===null){joy.id=e.pointerId;joy.x0=e.clientX;joy.y0=e.clientY;joy.x=joy.y=0;joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';joyEl.style.display='block';knob.style.transform='';try{canvas.setPointerCapture(e.pointerId);}catch(_){}fadeHint();}});
canvas.addEventListener('pointermove',e=>{
  if(pinchMove(e))return;
  if(parlorOpen){parlorMove(e);return;}
  if(bakeryOpen){bakeryMove(e);return;}
  if(garageOpen){garageMove(e);return;}
  if(beautyMove(e))return;
  if(e.pointerId===brush.id){const uv=faceHit(e);if(uv)paintAt(uv);else brush.last=null;return;}
  if(e.pointerId===joy.id){let dx=e.clientX-joy.x0,dy=e.clientY-joy.y0;const d=Math.hypot(dx,dy),max=56;if(d>max){dx*=max/d;dy*=max/d;}joy.x=dx/max;joy.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`;}
  if(e.pointerId===look.id){const dx=e.clientX-look.x,dy=e.clientY-look.y;look.x=e.clientX;look.y=e.clientY;
    if(closetOpen){if(barberOpen)bview-=dx*.012;else if(!drawing()&&!(ct.on&&!ct.sub)&&!(glamOpen&&ctab!=='hair'))player.face+=dx*.012;}else{cam.yaw-=dx*.006;cam.pitch=Math.min(1.25,Math.max(-.15,cam.pitch+dy*.004));fadeHint();}}});
const endPtr=e=>{pinchUp(e);parlorUp(e);bakeryUp(e);garageUp(e);beautyUp(e);if(e.pointerId===brush.id){brush.id=null;brush.last=null;savePaint();}if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';}if(e.pointerId===look.id)look.id=null;};
canvas.addEventListener('pointerup',endPtr);canvas.addEventListener('pointercancel',endPtr);canvas.addEventListener('lostpointercapture',endPtr);
canvas.addEventListener('wheel',e=>{zoomBy(Math.exp(Math.max(-60,Math.min(60,e.deltaY))*.004));e.preventDefault();},{passive:false});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
$('#jump').addEventListener('pointerdown',e=>{e.preventDefault();jump();});
function jump(){if(closetOpen)return;if(player.onGround){player.vy=6.2;player.onGround=false;sfx('jump');}}
let hintFaded=false;function fadeHint(){if(hintFaded)return;hintFaded=true;setTimeout(()=>$('#hint').style.opacity=0,2500);setTimeout(()=>$('#hint').style.display='none',3200);}
if(!isTouch)$('#hint').innerHTML='Walk with W A S D or the arrow keys.<br>Drag to look around. Space to jump.';

