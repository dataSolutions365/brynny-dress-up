/* ================= PORTRAITS FOR THE 2D STUDIO ================= */
// The 2D studio's top-left picture can be "my 3D character" or "my pet". Whenever your look (or your pet's outfit)
// changes, we take a little close-up picture right after the frame is drawn, save it in localStorage
// ('brynny.me3d' and 'brynny.pet3d'), and draw the frame again so you never see it happen.
const PORT={cam:new THREE.PerspectiveCamera(30,1,.05,30),key:{},t:0,v:new THREE.Vector3()};
const PORT_PX=144;
function snapOne(g,head,dist,drop,lsKey,extra){
  const hidden=[];g.traverse(o=>{if(o.isSprite&&o.visible){o.visible=false;hidden.push(o);}});
  g.updateMatrixWorld(true);const h=head.getWorldPosition(PORT.v.set(0,0,0)).clone(),yaw=g.rotation.y;
  PORT.cam.position.set(h.x+Math.sin(yaw)*dist,h.y+drop*.3,h.z+Math.cos(yaw)*dist);PORT.cam.lookAt(h.x,h.y-drop,h.z);PORT.cam.updateMatrixWorld();
  const s=PORT_PX,pr=renderer.getPixelRatio(),W=innerWidth,H=innerHeight;
  renderer.setScissorTest(true);renderer.setScissor(0,0,s,s);renderer.setViewport(0,0,s,s);
  try{renderer.render(scene,PORT.cam);
    const c=document.createElement('canvas');c.width=c.height=s;c.getContext('2d').drawImage(renderer.domElement,0,(H-s)*pr,s*pr,s*pr,0,0,s,s);
    localStorage.setItem(lsKey,JSON.stringify(Object.assign({img:c.toDataURL('image/jpeg',.85),at:Date.now()},extra||{})));}catch(e){}
  renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);hidden.forEach(o=>o.visible=true);}
// called by the game loop right after the frame is drawn; at most one picture every couple of seconds
function portraitTick(){const now=performance.now();if(!started||now<PORT.t)return;PORT.t=now+2000;
  const pt=myPet(),meK=JSON.stringify(SAVE.look)+(SAVE.facePaint||'').length,petK=pt?pt.name+JSON.stringify(petCare(pt).fit||{}):'';
  let shot=false;
  if(meK!==PORT.key.me&&av&&av.head){PORT.key.me=meK;snapOne(av.g,av.head,1.05,.13,'brynny.me3d');shot=true;}
  else if(pt&&petK!==PORT.key.pet&&pt.head){PORT.key.pet=petK;snapOne(pt.g,pt.head,.75,.05,'brynny.pet3d',{name:pt.name});shot=true;}
  if(shot){renderer.render(scene,camera);renderMe();}}
renderMe();
