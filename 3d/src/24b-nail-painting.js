/* ================= NAIL PAINTING: paint one nail at a time ================= */
// You at the glam mirror (manicure 'c' and pedicure 't', 10 nails each) and your pet at the parlor (12 claws).
// The camera zooms in on one hand, foot or paw, and big round buttons over the game switch between them.
let nailBrush={c:'#ff6fae',t:'#ff6fae'},nailFocus={c:0,t:0},nailUIKey=null;
const nailCamT=new THREE.Vector3(),nailCamP=new THREE.Vector3();
// what we're painting right now: 'c' fingers, 't' toes, 'pet' claws, or null
function nailCtx(){if(glamOpen&&!(ct.on&&!ct.sub)&&(ctab==='nails'||ctab==='toes'))return ctab==='nails'?'c':'t';if(parlorOpen&&ptab==='nails'&&pPet)return 'pet';return null;}

// nail spots in the world: {p: position, n: which way the nail faces, i: nail number, g: which hand/foot/paw}
function youNailSpots(key){const grps=key==='c'?av.arms.map(a=>a.hand):av.legs.map(l=>l.an),out=[],q=new THREE.Quaternion();
  grps.forEach((g,gi)=>{g.updateWorldMatrix(true,false);g.getWorldQuaternion(q);g.userData.nails.forEach((sp,i)=>out.push({p:g.localToWorld(sp.p.clone()),n:sp.n.clone().applyQuaternion(q),i:gi*5+i,g:gi}));});return out;}
function petNailSpots(pt){return pt.claws.map((m,i)=>({p:m.getWorldPosition(new THREE.Vector3()),i,g:Math.floor(i/3)}));}
// the nail closest to the finger on screen, if it's close enough
function nearestNail(e,spots,maxPx){let best=null,bd=maxPx;const v=new THREE.Vector3();
  for(const s of spots){v.copy(s.p).project(camera);if(v.z>1)continue;const d=Math.hypot((v.x+1)/2*innerWidth-e.clientX,(1-v.y)/2*innerHeight-e.clientY);if(d<bd){bd=d;best=s;}}return best;}

/* ---------- you, at the glam mirror ---------- */
function youPaint(key,list){const L=SAVE.look;L.nails=Object.assign({},L.nails);L.nails[key+'i']=list;delete L.nails[key];persist();
  av.dress(key==='t'?Object.assign({},L,{shoes:null}):L);}
const brushCol=(b,i)=>b==='rainbow'?NAIL_RB[i%5]:(b||null);
function youPaintAll(key,b){youPaint(key,Array.from({length:10},(_,i)=>brushCol(b,i)));renderNailUI();}
function youNailTap(e){const key=ctab==='nails'?'c':'t',s=nearestNail(e,youNailSpots(key),48);
  if(!s){toast(key==='c'?'Tap one nail to paint it 💅':'Tap one toenail to paint it 💅');return true;}
  const cs=nailCols(SAVE.look.nails,key),was=cs.every(Boolean),b=nailBrush[key];cs[s.i]=brushCol(b,s.i);youPaint(key,cs);
  burst(s.p,cs[s.i]||'#ffffff',10,.45,.025);sfx(b?'brush':'pop');
  if(!was&&cs.every(Boolean)){sfx('tada');const g=ag.gigi;if(g){npcSay(g,rnd(['All done! Gorgeous! 😍','So pretty! 💅','Perfect nails! ✨']));g.a.play('clap');}}
  renderNailUI();return true;}
// camera close-up on the hand or foot you picked, looking straight at the nails
function nailCamAt(key,fwd){player.face=key==='c'?agFace(-1,0):agFace(0,1);const sp=youNailSpots(key).filter(s=>s.g===nailFocus[key]);if(!sp.length)return false;
  // aim at the four fingertips (the thumb sits off to the side) so they fill the screen
  nailCamT.set(0,0,0);const n=new THREE.Vector3();sp.forEach((s,i)=>{const w=i%5===4?.4:1;nailCamT.addScaledVector(s.p,w);n.addScaledVector(s.n,w);});nailCamT.divideScalar(sp.length-.6);n.normalize();
  if(n.y<.2)n.y=.2;n.normalize();// never look up from under the table
  nailCamP.copy(nailCamT).addScaledVector(n,key==='c'?.16:.22).addScaledVector(fwd,.04);return true;}

/* ---------- your pet, at the parlor ---------- */
function pawCam(pt,dt){const l=pt.legs[pFocus]||pt.legs[0],paw=l.paw.getWorldPosition(new THREE.Vector3()),k=Math.min(1.1,Math.max(.7,pt.tagH));
  // look from in front of the paw and a bit to its side; back paws are seen more from the side
  const lx=l.sx*(l.sz>0?.45:1),lz=l.sz>0?1:.15,yaw=pt.face+pcam.dy,c=Math.cos(yaw),s=Math.sin(yaw);
  const dir=new THREE.Vector3(lx*c+lz*s,(l.sz>0?.6:.8)+pcam.dp*.5,-lx*s+lz*c).normalize();
  pTgt.copy(paw);pWant.copy(paw).addScaledVector(dir,(l.sz>0?.3:.34)*k*ZOOM.k);
  const a=Math.min(1,dt*5);pcam.p.lerp(pWant,a);pcam.t.lerp(pTgt,a);camera.position.copy(pcam.p);camera.lookAt(pcam.t);}

/* ---------- big round buttons over the game, and the progress bar ---------- */
const nailUI=$('#nailui');
function renderNailUI(){const k=nailCtx();nailUIKey=k;nailUI.classList.toggle('show',!!k);if(!k)return;
  let done,all,btns,cur,title;
  if(k==='pet'){const c=petCare(pPet);done=c.polish.filter(Boolean).length;all=c.polish.length;cur=ppol;title=`💅 ${pPet.name}'s claws`;
    btns=pPet.legs.map((l,i)=>[i,'🐾',(l.sz>0?'Front ':'Back ')+(l.sx<0?'R':'L'),pFocus===i]);}
  else{const cs=nailCols(SAVE.look.nails,k);done=cs.filter(Boolean).length;all=10;cur=nailBrush[k];title=k==='c'?'💅 Manicure':'🦶 Pedicure';
    btns=(k==='c'?[[0,'✋','Right hand'],[1,'🤚','Left hand']]:[[0,'🦶','Right foot'],[1,'🦶','Left foot']]).map(b=>b.concat(nailFocus[k]===b[0]));}
  const bottle=cur==='rainbow'?'conic-gradient(#ff3b6b,#ffd23f,#7ee081,#4fb6ff,#b388ff,#ff3b6b)':cur==='glitter'?'linear-gradient(135deg,#fff3b0,#d4af37,#ffe27a)':cur||'#ffffff';
  nailUI.innerHTML=`<div class="nprog"><b>${title}</b><i><u style="width:${Math.round(done/all*100)}%"></u></i><span>${done} / ${all} painted</span></div>
    <div class="nbar">${btns.map(([i,e,n,on])=>`<button class="${on?'on':''}" data-nfocus="${i}"><b>${e}</b><span>${n}</span></button>`).join('')}
    <button class="bottle" data-nall="1" aria-label="paint them all"><b><u style="background:${bottle}">${cur?'':'🧽'}</u></b><span>${cur?'Paint all':'Clean all'}</span></button></div>`;}
nailUI.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=nailCtx();if(!k)return;
  if(b.dataset.nfocus!=null){const i=+b.dataset.nfocus;if(k==='pet')pFocus=i;else nailFocus[k]=i;pcam.dy=pcam.dp=0;sfx('pop');renderNailUI();return;}
  if(b.dataset.nall){if(k==='pet')petPaintAll(ppol);else{youPaintAll(k,nailBrush[k]);sfx(nailBrush[k]?'brush':'pop');renderCloset();}}});
anims.push(()=>{if(nailCtx()!==nailUIKey)renderNailUI();});
