/* ---------- graphics memory: give back what we stop using, share copies, and wake up after a nap ----------
   iPhones take the whole 3D picture away ("the 3D world took a little nap") when a page uses too much graphics
   memory, or sometimes when Safari goes to the background. Three.js keeps every shape and picture it has ever
   drawn on the graphics chip until someone calls dispose(), so:
   - freeObj(thing): call it when a 3D thing is thrown away for good (an old avatar, an old outfit, a ball).
     A moment later, everything it used that nothing left in the world still uses is given back.
   - shareShapes(thing): meshes with exactly the same shape (there are thousands of the same spheres, boxes and
     cylinders) share one copy. At start-up this saves about half of all the shape memory.
   - when the phone gives the graphics back (webglcontextrestored), the sky reflections are made again and the
     game carries on right where it was. If it was taken away while playing (memory, not the background),
     the picture switches to Light (no shadows, normal sharpness) so it doesn't happen again. */
const matsOf=o=>o.material?(Array.isArray(o.material)?o.material:[o.material]):[];
function texOf(m,out){for(const k in m){const v=m[k];if(v&&v.isTexture&&!v.isRenderTargetTexture)out.add(v);}
  if(m.uniforms)for(const k in m.uniforms){const v=m.uniforms[k]&&m.uniforms[k].value;if(v&&v.isTexture&&!v.isRenderTargetTexture)out.add(v);}return out;}
const FREE_Q=new Set();let freeT=0;
function freeObj(root){if(!root||!root.traverse)return;
  root.traverse(o=>{if(o.geometry&&o.geometry.isBufferGeometry)FREE_Q.add(o.geometry);for(const m of matsOf(o)){FREE_Q.add(m);texOf(m,FREE_Q);}});
  if(!freeT)freeT=setTimeout(freeSweep,700);}
// give back everything waiting in FREE_Q that nothing in the world uses any more. Giving back something that is
// still used somewhere else (a picture kept for later) is safe too: three.js just sends it again the next time.
function freeSweep(){freeT=0;if(!FREE_Q.size)return;const used=new Set();
  scene.traverse(o=>{if(o.geometry)used.add(o.geometry);for(const m of matsOf(o)){used.add(m);texOf(m,used);}});
  if(scene.environment)used.add(scene.environment);if(scene.background&&scene.background.isTexture)used.add(scene.background);
  for(const x of FREE_Q)if(!used.has(x)){if(x.isBufferGeometry)unshare(x);try{x.dispose();}catch(e){}}
  FREE_Q.clear();}

// same shape = same kind, same numbers in every attribute, same index and groups
const SHARE_TYPES=new Set(['SphereGeometry','IcosahedronGeometry','OctahedronGeometry','DodecahedronGeometry','TetrahedronGeometry','CapsuleGeometry',
  'BoxGeometry','RoundedBoxGeometry','CylinderGeometry','ConeGeometry','TorusGeometry','TorusKnotGeometry','CircleGeometry','RingGeometry',
  'LatheGeometry','ShapeGeometry','ExtrudeGeometry','TubeGeometry']);
const SHARED=new Map(),SHARE_KEY=new WeakMap();// key -> [geometries that other meshes can share]
function geoKey(G){const a=G.attributes,p=a.position.array;let h=0;for(let i=0;i<p.length;i++)h=(Math.imul(h,31)+Math.round(p[i]*1e4))|0;
  return G.type+'|'+Object.keys(a).sort().map(n=>n+':'+a[n].count+'x'+a[n].itemSize).join(',')+'|'+(G.index?G.index.count:0)+'|'+G.groups.map(g=>g.start+'-'+g.count+'-'+g.materialIndex).join(',')+'|'+h;}
function sameArr(a,b){if(a.length!==b.length||a.constructor!==b.constructor)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
function sameGeo(A,B){for(const n in A.attributes){const x=A.attributes[n],y=B.attributes[n];if(!y||x.itemSize!==y.itemSize||x.normalized!==y.normalized||!sameArr(x.array,y.array))return false;}
  return !!A.index===!!B.index&&(!A.index||sameArr(A.index.array,B.index.array));}
function canShare(o){const G=o.geometry;if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!G||!SHARE_TYPES.has(G.type)||!G.attributes.position)return false;
  if(Object.keys(G.morphAttributes).length||o.morphTargetInfluences)return false;
  for(const n in G.attributes){const at=G.attributes[n];if(at.isInterleavedBufferAttribute||at.usage!==THREE.StaticDrawUsage)return false;}return true;}
function shareShapes(root=scene){let n=0;
  root.traverse(o=>{if(!canShare(o))return;const G=o.geometry;if(SHARE_KEY.has(G))return;
    const k=geoKey(G),list=SHARED.get(k);const same=list&&list.find(x=>sameGeo(x,G));
    if(same){o.geometry=same;n++;FREE_Q.add(G);if(!freeT)freeT=setTimeout(freeSweep,700);return;}
    SHARE_KEY.set(G,k);if(list)list.push(G);else SHARED.set(k,[G]);});
  return n;}
function unshare(G){const k=SHARE_KEY.get(G);if(!k)return;const list=SHARED.get(k);if(list){const i=list.indexOf(G);if(i>=0)list.splice(i,1);if(!list.length)SHARED.delete(k);}SHARE_KEY.delete(G);}

// a short note about graphics memory for the problem reports (3d/index.html)
function gpuNote(){try{const m=renderer.info.memory;return `${m.geometries} shapes, ${m.textures} pictures, ${renderer.info.render.calls} draws, sharp ${renderer.getPixelRatio()}${renderer.shadowMap.enabled?'':' no shadows'}`;}catch(e){return '';}}

// the graphics came back after a nap
let glNap=null;
canvas.addEventListener('webglcontextlost',()=>{glNap={hidden:document.hidden};});
canvas.addEventListener('webglcontextrestored',()=>{const n=glNap;glNap=null;
  if(n&&!n.hidden&&renderer.shadowMap.enabled){// it ran out of memory while playing: go Light now (three.js builds every shader again anyway)
    renderer.shadowMap.enabled=false;prNow=PR_MIN;renderer.setPixelRatio(prNow);renderer.setSize(innerWidth,innerHeight,false);}
  try{makeEnv();}catch(e){}
  renderer.shadowMap.needsUpdate=true;});

// what the player was doing, for the problem reports (3d/index.html), e.g. "playing 1-on-1 | online with 1 friend"
function gameStatus(){const s=[],add=f=>{try{const v=f();if(v)s.push(v);}catch(e){}};
  add(()=>!started&&'on the welcome screen');add(()=>closetOpen&&'in the closet');add(()=>glamOpen&&'at the glam mirror');
  add(()=>SP.mode&&'playing '+({ft:'free throws',shoot:'shootout',v1:'1-on-1',bat:'batting',wif:'wiffle ball'}[SP.mode]||SP.mode));add(()=>VS.on&&'match with friends');
  add(()=>{const n=window.__net;return n&&n.live()&&`online with ${n.friends().size} friend${n.friends().size>1?'s':''}`;});
  add(()=>FLY.on&&'flying');add(()=>barnRide&&'riding');add(()=>gpuNote());
  return s.join(' | ');}
