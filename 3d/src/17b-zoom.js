/* ================= ZOOM ================= */
// Pinch with two fingers, scroll the mouse wheel, or tap the ➕ and ➖ buttons on the left to zoom in and out.
// Walking around, that moves the camera closer or further (cam.dist). At the pet parlor and the bakery it changes how
// far back the close-up camera stands (ZOOM.k), so you can always back away if your pet or cake is too close.
const ZOOM={k:Math.min(2.6,Math.max(.7,+SAVE.zoomK||1)),min:.7,max:2.6},PLAY_MIN=2.5,PLAY_MAX=14;
const zoomEl=$('#zoomCtl');
function zoomWhere(){if(parlorOpen||bakeryOpen||garageOpen)return 'station';if(!closetOpen)return 'play';return null;}
let zoomSaveT=0;
function zoomBy(f){const w=zoomWhere();
  if(w==='play')cam.dist=Math.min(PLAY_MAX,Math.max(PLAY_MIN,cam.dist*f));
  else if(w==='station'){ZOOM.k=Math.min(ZOOM.max,Math.max(ZOOM.min,ZOOM.k*f));clearTimeout(zoomSaveT);zoomSaveT=setTimeout(()=>{SAVE.zoomK=+ZOOM.k.toFixed(2);persist();},800);}}
// how far the parlor and bakery cameras stand back: a bit further on a tall phone, where the panel covers the bottom
const stationZoom=()=>ZOOM.k*(innerWidth>innerHeight*1.25?1:1.2);

/* two-finger pinch */
const pinch={pts:new Map(),d:0,on:false};
const pinchDist=()=>{const [a,b]=[...pinch.pts.values()];return Math.hypot(a[0]-b[0],a[1]-b[1]);};
function pinchDown(e){if(e.pointerType==='mouse')return false;pinch.pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pinch.pts.size!==2||!zoomWhere())return false;
  // a second finger: stop walking, looking around or scrubbing, and zoom instead
  pinch.on=true;pinch.d=pinchDist();joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';look.id=null;pcam.id=null;bcam.id=null;
  if(rub.id!==null){rub.id=null;persist();renderMeters();}return true;}
function pinchMove(e){if(!pinch.pts.has(e.pointerId))return false;pinch.pts.set(e.pointerId,[e.clientX,e.clientY]);if(!pinch.on)return false;
  const d=pinchDist();if(d>10&&pinch.d>10)zoomBy(pinch.d/d);pinch.d=d;return true;}
function pinchUp(e){pinch.pts.delete(e.pointerId);if(pinch.pts.size<2)pinch.on=false;}

/* the ➕ ➖ buttons: tap to zoom a step, or hold to keep zooming */
let zoomHold=null;
function zoomPress(f){zoomBy(f);sfx('pop');clearInterval(zoomHold);let n=0;zoomHold=setInterval(()=>{if(++n>3)zoomBy(Math.pow(f,.35));},90);}
const zoomStop=()=>{clearInterval(zoomHold);zoomHold=null;};
[['#zoomIn',1/1.25],['#zoomOut',1.25]].forEach(([id,f])=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();zoomPress(f);});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,zoomStop));});
let zoomShown=null;
function zoomTick(){const s=started&&!!zoomWhere();if(s!==zoomShown){zoomShown=s;zoomEl.classList.toggle('show',s);if(!s)zoomStop();}}
