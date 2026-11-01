/* ================= STAR MODEL AGENCY: glam mirror (makeup, hair, nails, toes) + model contest ================= */
const AG=Z.agency;
const agW=(lx,y,lz)=>{const [x,w]=AG.toWorld(lx,lz);return new THREE.Vector3(x,y,w);};
const agFace=(dx,dz)=>{const c=Math.cos(AG.rot),s=Math.sin(AG.rot);return Math.atan2(dx*c+dz*s,-dx*s+dz*c);};
const ag={built:false,judges:[],rivals:[],gigi:null,all:[]};
function agNPC(look,name,col,lx,lz,face){const a=new Avatar(look,name,col);const o={a,g:a.g,look,name,pos:agW(lx,0,lz),face,sp:0,home:[lx,lz,face],say:null,sayT:0};a.g.position.copy(o.pos);a.g.rotation.y=face;scene.add(a.g);ag.all.push(o);return o;}
const JUDGES=[
  {n:'Madame Chic',em:'🎩',what:'style',w:[.62,.18,.2],l:{hair:{id:'updo',c:'#2b1d16',shine:true},skin:'#e6c49a',eyes:'#3d2a1a',dress:{id:'gown',c:'#2d2d3a'},shoes:{id:'heels',c:'#2d2d3a'},hat:null,extras:{glasses:'#2d2d3a',pearls:'#ffffff'},mk:{lips:'#c2185b',liner:'wing',lashes:'long'}}},
  {n:'Lady Glitter',em:'✨',what:'glam',w:[.22,.58,.2],l:{hair:{id:'waves',c:'#ff7eb6',shine:true},skin:'#ffe3cc',eyes:'#7a5cc8',dress:null,top:{id:'sequin',c:'#d4af37'},bottom:{id:'skirt',c:'#2d2d3a'},shoes:{id:'platforms',c:'#d4af37'},hat:{id:'tiara',c:'#ffd23f'},extras:{},mk:{lips:'#ff6fae',shadow:'#b388ff',gems:true,gloss:true,lashes:'bold'}}},
  {n:'Coco Star',em:'💃',what:'walk',w:[.22,.18,.6],l:{hair:{id:'afropuff',c:'#2b1d16'},skin:'#8d5a3b',eyes:'#3d2a1a',dress:{id:'mermaid',c:'#8e6cff'},shoes:{id:'heels',c:'#ff3b6b'},hat:null,extras:{glasses:'#ff6fae'},mk:{lips:'#e0263b',liner:'thin',lashes:'long'}}}];
const RIVAL_N=['Bella','Sienna','Rosie'];
function buildAgencyNPCs(){if(ag.built)return;ag.built=true;
  JUDGES.forEach((j,i)=>{const l=Object.assign(defaultLook(),{style:'glam',top:null,bottom:null},j.l);l.makeup=Object.assign(defaultMakeup(),j.l.mk);delete l.mk;
    const o=agNPC(l,`${j.em} ${j.n}`,'#b8860b',AG.jt.lx+.72,AG.jseats[i],agFace(-1,0));o.a.play('chair');o.j=j;ag.judges.push(o);});
  [[-3.3,-3.2],[-4.3,-2.5],[-4.7,-3.9]].forEach(([lx,lz],i)=>{const l=randLook();l.style='glam';const o=agNPC(l,RIVAL_N[i],'#c2185b',lx,lz,agFace(1,.3));o.base=l;ag.rivals.push(o);});
  const gl=Object.assign(defaultLook(),{style:'glam',skin:'#d49a6a',hair:{id:'highpony',c:'#ff6fae',shine:true},dress:null,top:{id:'tee',c:'#2d2d3a'},bottom:{id:'jeans',c:'#3a5bd9'},shoes:{id:'sneaker',c:'#ffffff'},hat:null,extras:{}});gl.makeup=Object.assign(defaultMakeup(),{lips:'#ff3b6b',liner:'wing'});gl.nails={c:'#ff6fae',f:'glitter'};
  ag.gigi=agNPC(gl,'💇‍♀️ Gigi','#8e6cff',-3.75,.55,agFace(-.6,1));}
function stepNPC(o,dt){o.g.position.copy(o.pos);o.g.rotation.y=o.face+(o.a.spinY||0);o.a.update(dt,o.sp,false);if(o.say){o.sayT-=dt;if(o.sayT<0){o.g.remove(o.say);o.say=null;}}}
function npcSay(o,t){if(o)friendBubble(o,t);}
anims.push((t,dt)=>{const here=started&&(curZone===AG||ct.on||glamOpen);AG.mirror.visible=here;if(!here)return;buildAgencyNPCs();for(const o of ag.all)if(o!==ct.walker)stepNPC(o,dt);
  AG.bulbs.forEach((b,i)=>b.scale.setScalar(.85+.2*Math.sin(t*2+i*.7)));AG.flashes.forEach(f=>{if(f.visible&&(f.t-=dt)<0)f.visible=false;});});
function camFlash(){AG.flashes.forEach((f,i)=>setTimeout(()=>{f.visible=true;f.t=.09;},i*140+Math.random()*120));try{sndCam.currentTime=0;sndCam.play().catch(()=>{});}catch(e){}}
function showTrophies(){const g=AG.trophyG;(g.userData.cups||[]).forEach(m=>g.remove(m));g.userData.cups=[];const list=((SAVE.contest||{}).cups||[]).slice(-10);
  list.forEach((r,i)=>{const cg=new THREE.Group();cg.position.set(-1.05+(i%5)*.52,i<5?1.535:2.235,.02);g.add(cg);g.userData.cups.push(cg);const m=std(['#ffd23f','#d9d9e8','#d08a4a'][r]||'#ffd23f',{metalness:1,roughness:.18});
    M(cyl(.1,.06,.16,16),m,0,.2,0,cg);M(cyl(.025,.025,.1,8),m,0,.08,0,cg);M(cyl(.07,.08,.04,16),m,0,.02,0,cg);for(const s of [-1,1]){const h=M(new THREE.TorusGeometry(.04,.01,6,14),m,s*.1,.21,0,cg);}});}
showTrophies();

/* ---------- glam mirror (the dressing room) ---------- */
let glamOpen=false,onGPad=false,onCPad=false,glamPrevTab='dresses';
const GTABS=[['makeup','💄','Makeup'],['hair','💇','Hair salon'],['nails','💅','Manicure'],['toes','🦶','Pedicure']];
const NAILF=[['shiny','💅 Shiny'],['glitter','✨ Glitter'],['chrome','🪩 Chrome'],['jelly','💎 Jelly']];
const gcam={p:new THREE.Vector3(),t:new THREE.Vector3(),init:false};
function nailsHTML(key,fkey,title){const N=SAVE.look.nails||{},cur=nailBrush[key],fin=N[fkey]||'shiny';
  return `<h3>${title}</h3><div class="swatches"><button class="sw none${!cur?' on':''}" data-nail="${key}" data-c="" aria-label="polish remover">🧽</button>${myColors(POLISH).map(c=>`<button class="sw${c===cur?' on':''}" style="background:${c}" data-nail="${key}" data-c="${c}" aria-label="polish ${c}"></button>`).join('')}<button class="sw fancy${cur==='rainbow'?' on':''}" style="background:linear-gradient(135deg,#ff3b6b,#ffd23f,#7ee081,#4fb6ff,#b388ff)" data-nail="${key}" data-c="rainbow" aria-label="rainbow">🌈</button></div>
    <h3>Finish</h3><div class="chips">${NAILF.map(([v,n])=>`<button class="${fin===v?'on':''}" data-nf="${fkey}" data-v="${v}">${n}</button>`).join('')}</div>
    <div style="height:10px"></div><div class="chips"><button data-nailall="${key}">💅 Paint them all</button><button data-nailoff="${key}">🧽 Take off all polish</button></div>`;}
function glamHTML(){const L=SAVE.look;
  if(ctab==='nails')return `<p class="drawhint">👆 Pick a color, then tap one nail at a time to paint it. The big buttons switch hands.</p>`+nailsHTML('c','f','💅 Nail polish');
  if(ctab==='toes')return `<p class="drawhint">👆 Feet up on the pouf! Pick a color, then tap one toenail at a time. Sandals 🩴 show off your toes later.</p>`+nailsHTML('t','tf','🦶 Toe polish');
  if(ctab==='hair')return hairHTML();
  if(ctab==='makeup')return makeupHTML();
  return null;}
function glamSeat(fx){const t=ctab;const chairF=agFace(-1,0),pediF=agFace(0,1);
  av.dress(t==='toes'?Object.assign({},SAVE.look,{shoes:null}):SAVE.look);
  av.play(t==='nails'?'mani':t==='toes'?'pedi':'chair');if(t==='toes'||t==='nails')player.face=t==='toes'?pediF:chairF;if(t==='makeup')player.face=chairF;
  if(fx){const P=player.pos,g=ag.gigi;if(t==='hair'){burst(av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.15,0)),'#ffffff',30,1.4,.09);tone(180,.6,'sawtooth',.025,0,260);if(g)g.a.play('magic');}
    else if(t==='nails'||t==='toes'){const pts=t==='nails'?av.arms.map(a=>a.hand):av.legs.map(l=>l.an);pts.forEach(o=>burst(o.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.08,0)),'#ffd6f0',14,.8,.06));sfx('brush');if(g)g.a.play('clap');}
    if(g&&Math.random()<.5)npcSay(g,rnd(['Gorgeous! 😍','So pretty! 💖','Stunning! ✨','Love it! 💅','Perfect! 🌟']));}}
function openGlam(fromContest){if(closetOpen&&!fromContest)return;closeTalk();buildAgencyNPCs();glamOpen=true;closetOpen=true;
  glamPrevTab=GTABS.some(g=>g[0]===ctab)?'dresses':ctab;ctab='makeup';czoom='face';gcam.init=false;
  const [cx,cz]=AG.dr.chair;player.pos.copy(agW(cx,0,cz));player.vy=0;player.speed=0;player.face=agFace(-1,0);cam.closetYaw=cam.cy=player.face;cam.cd=.55;cam.cp=.02;cam.fv=null;
  joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';document.body.classList.add('dressing');$('#ctitle').textContent='🪞 Glam Mirror';
  AG.gLbl.visible=false;const g=ag.gigi;if(g){g.pos.copy(agW(-4.05,0,.75));g.face=Math.atan2(player.pos.x-g.pos.x,player.pos.z-g.pos.z);npcSay(g,'Welcome to the glam room! 💖');g.a.play('wave');}
  glamSeat(false);renderCloset();$('#closet').classList.add('show');$('#ccontent').scrollTop=0;sfx('tada');}
function closeGlam(){if(!glamOpen)return;hideHTool();glamOpen=false;closetOpen=false;czoom='body';ctab=glamPrevTab;document.body.classList.remove('dressing');$('#closet').classList.remove('show');$('#ctitle').textContent='👗 My closet';
  av.dress(SAVE.look);persist();AG.gLbl.visible=true;AG.chair.rotation.y=0;const g=ag.gigi;if(g){g.pos.copy(agW(...g.home.slice(0,1),0,g.home[1]));g.face=g.home[2];}
  player.pos.copy(agW(-2.95,0,1.6));player.face=agFace(1,0);cam.yaw=cam.cy=player.face+Math.PI;av.play('twirl');
  if(ct.on&&ct.sub==='glam'){ct.sub=null;backToContest();return;}
  did('glam');if(Date.now()-(SAVE.glamPaid||0)>6e5){SAVE.glamPaid=Date.now();persist();setTimeout(()=>earn(5,'Glam time!'),700);}
  toast('Looking fabulous! ✨ Now try the 🏆 model contest!');}
function glamCam(dt){if(!glamOpen||ctab==='makeup')return;const fwd=tmpV.set(Math.sin(player.face),0,Math.cos(player.face)).clone();let T,Pp;
  if(ctab==='hair'){T=av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.02,0));const a=player.face+hairView;Pp=T.clone().add(new THREE.Vector3(Math.sin(a)*1.0,.12,Math.cos(a)*1.0));}
  else if(nailCamAt(ctab==='nails'?'c':'t',fwd)){T=nailCamT;Pp=nailCamP;}
  else if(ctab==='nails'){player.face=agFace(-1,0);T=av.arms[0].hand.getWorldPosition(new THREE.Vector3()).add(av.arms[1].hand.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5);Pp=T.clone().addScaledVector(fwd,.2).add(new THREE.Vector3(0,.27,0));}
  else{player.face=agFace(0,1);T=av.legs[0].an.getWorldPosition(new THREE.Vector3()).add(av.legs[1].an.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5).addScaledVector(fwd,.1);Pp=T.clone().addScaledVector(fwd,.12).add(new THREE.Vector3(0,.36,0));}
  if(!gcam.init){gcam.p.copy(Pp);gcam.t.copy(T);gcam.init=true;}const k=Math.min(1,dt*5);gcam.p.lerp(Pp,k);gcam.t.lerp(T,k);camera.position.copy(gcam.p);camera.lookAt(gcam.t);}
function glamClick(b){const L=SAVE.look;if(beautyClick(b))return true;
  if(b.dataset.nail){nailBrush[b.dataset.nail]=b.dataset.c||'';sfx('pop');renderCloset();renderNailUI();return true;}
  if(b.dataset.nailall){youPaintAll(b.dataset.nailall,nailBrush[b.dataset.nailall]);glamSeat(true);renderCloset();return true;}
  if(b.dataset.nailoff){youPaintAll(b.dataset.nailoff,'');sfx('pop');renderCloset();return true;}
  if(b.dataset.nf){L.nails=Object.assign({},L.nails);L.nails[b.dataset.nf]=b.dataset.v;persist();glamSeat(true);sfx('pop');renderCloset();return true;}
  if(b.dataset.shine){L.hair.shine=b.dataset.shine==='1';persist();glamSeat(true);sfx('pop');renderCloset();return true;}
  return false;}

/* ---------- hands-on beauty: style hair and put on makeup with your finger ---------- */
const HTOOLS=[['brush','🪮','Brush','Brush down the hair to make it smooth, straight and shiny.'],['straight','🔥','Straightener','Glide the flat iron down the hair to make it super straight and shiny.'],['curl','🌀','Curling iron','Rub the curling iron on the hair to curl it. Rub more for big curls!'],['cut','✂️','Scissors','Drag the scissors over the hair to cut it shorter. Long hair turns into a bob, then short.'],
  ['grow','🌱','Grow','Rub on the magic grow cream to make the hair longer.'],['dry','💨','Blow-dryer','Blow-dry the hair for big, fluffy volume.'],['spray','🎨','Color spray','Pick a color, then spray it on the hair.'],['braid','🪢','Braid','Tap her hair to start braiding. Drag the glowing strand over the middle one, left then right, back and forth!'],['clip','🎀','Clips','Tap the hair to put a clip on it. Tap the clip button again to take them all off.']];
const MTOOLS=[['lips','💄','Lipstick','Rub on the lips.'],['gloss','✨','Gloss','Rub on the lips to make them shiny.'],['shadow','👁️','Eyeshadow','Rub on the eyelids.'],['liner','✏️','Eyeliner','Swipe across the eyes.'],['lashes','🪶','Mascara','Brush the lashes. Each swipe makes them longer.'],
  ['blush','🌸','Blush','Rub on the cheeks.'],['gems','💎','Face gems','Tap beside the eyes.'],
  ['brows','〰️','Brows','Pick a color, then rub on the eyebrows.'],['tan','🧴','Spray tan','Spray all over the face for a sun-kissed glow. Spray more for a deeper tan.'],['freckles','🟤','Freckles','Dab on the nose and cheeks. Dab more for more freckles.'],['stickers','💖','Stickers','Pick a sticker, then tap the face to stick it on.'],
  ['soap','🧼','Soap','Rub the soap all over the face to make bubbles.'],['rinse','🚿','Rinse','Rub the water over the bubbles to wash all the makeup off.'],['paint','🖌️','Paint','Draw anything on the face.']];
let hairView=.75,hTool='brush',mTool='lips',sprayC='#ff7eb6',clipC='#ff6fae',hstroke=null,mstroke=null;const MKC={lips:MK_LIPS,gloss:null,shadow:MK_SHADOW,liner:['#2b1d16','#000000','#6a3df0','#3a5bd9','#2fd1c5','#d4af37','#ff3b6b'],lashes:null,blush:[['pink','#ff8fb0'],['peach','#ffab85'],['rose','#dc6080']],gems:null};
let mkColor={lips:'#ff3b6b',shadow:'#b388ff',liner:'#2b1d16',blush:'pink'};
const meter=(n,v)=>`<div class="meter"><span>${n}</span><i><b style="width:${Math.round(v*100)}%"></b></i></div>`;
function hairHTML(){const H=SAVE.look.hair,t=HTOOLS.find(x=>x[0]===hTool);
  let h=`<div class="chips tools">${HTOOLS.map(([id,e,n])=>`<button class="${hTool===id?'on':''}" data-htool="${id}">${e} ${n}</button>`).join('')}</div><p class="drawhint">👆 ${t[3]}</p><div class="chips"><button data-hview="1.2">⬅️ Her right side</button><button data-hview="0">🙂 Front</button><button data-hview="-1.2">➡️ Her left side</button><button data-hview="3.14">🔙 Back</button></div>`;
  h+=`<div class="hmeters">${meter('Length',((H.len||1)-.35)/.95)}${meter('Curls',H.curl||0)}${meter('Volume',H.vol||0)}</div>`;
  if(hTool==='spray')h+=`<h3>Spray color</h3><div class="swatches">${myColors(HAIRC.concat(['#ffd23f','#7ee081','#ff3b6b'])).map(c=>`<button class="sw${c===sprayC?' on':''}" style="background:${c}" data-spray="${c}"></button>`).join('')}</div>`;
  if(hTool==='clip')h+=`<h3>Clip color</h3><div class="swatches">${['#ff6fae','#ffd23f','#4fb6ff','#b388ff','#ffffff','#7ee081','#d4af37'].map(c=>`<button class="sw${c===clipC?' on':''}" style="background:${c}" data-clipc="${c}"></button>`).join('')}</div><div class="chips" style="margin-top:8px"><button data-hreset="clips">🧹 Take clips off</button></div>`;
  h+=`<h3>Quick styles</h3><div class="grid">${hairsOf(SAVE.look).map(([id,ico,n])=>`<button class="item${H.id===id?' on':''}" data-hair="${id}"><b>${ico}</b><span>${n}</span></button>`).join('')}</div>
    <div class="chips" style="margin-top:10px"><button data-hreset="all">↩️ Wash out (reset length, curls, volume)</button></div>`;
  return h;}
function makeupHTML(){const mk=SAVE.look.makeup,t=MTOOLS.find(x=>x[0]===mTool),cols=MKC[mTool];
  let h=mkTopHTML()+`<div class="zoomrow">${[['eyes','👁️ Eyes'],['lips','👄 Lips'],['face','🙂 Face']].map(([z,n])=>`<button class="${czoom===z?'on':''}" data-zoom="${z}">${n}</button>`).join('')}</div>
    <div class="chips tools">${MTOOLS.map(([id,e,n])=>`<button class="${mTool===id?'on':''}" data-mtool="${id}">${e} ${n}</button>`).join('')}</div><p class="drawhint">👆 ${t[3]} You can tap too.</p>`;
  if(mTool==='paint')return h+`<div class="chips">${[['thin','✏️ Thin'],['medium','🖍️ Medium'],['thick','🎨 Thick']].map(([v,n])=>`<button class="${!brush.erase&&brush.size===v?'on':''}" data-brush="${v}">${n}</button>`).join('')}<button class="${brush.erase?'on':''}" data-brush="erase">🧽 Eraser</button><button data-brush="undo">↩️ Undo</button><button data-brush="clear">🗑️ Clear</button></div><div style="height:8px"></div><div class="swatches">${MK_BRUSH.map(c=>`<button class="sw${!brush.erase&&c===brush.c?' on':''}" style="background:${c}" data-sw="brush" data-c="${c}"></button>`).join('')}</div>`+faceShapes();
  if(MKX[mTool])return h+mkExtraHTML()+faceShapes();
  if(cols)h+=`<div class="swatches">${cols.map(c=>{const [v,cc]=Array.isArray(c)?c:[c,c];return `<button class="sw${mkColor[mTool]===v?' on':''}" style="background:${cc}" data-mkc="${v}"></button>`;}).join('')}</div>`;
  h+=`<div class="chips" style="margin-top:8px"><button data-mkoff="${mTool}">🧼 Wipe off ${t[2].toLowerCase()}</button><button data-mkoff="all">🧼 Wipe off everything</button></div>`;
  if(['shadow','liner','lashes'].includes(mTool))h+=eyeLooksHTML();
  return h+faceShapes();}
function faceShapes(){const L=SAVE.look;if((L.style||'glam')==='cute')return '';const F=L.face||{};
  return FACEOPT.filter(([k])=>k!=='nose').map(([k,t,opts])=>`<h3>${k==='eyes'?'👁️ Eye shape':'👄 Lip shape'}</h3><div class="grid">${opts.map(([v,e,n])=>`<button class="item${(F[k]||opts[0][0])===v?' on':''}" data-face="${k}:${v}"><b>${e}</b><span>${n}</span></button>`).join('')}</div>`).join('');}
function beautyClick(b){const L=SAVE.look,H=L.hair,mk=L.makeup;if(mkExtraClick(b))return true;
  if(b.dataset.htool){hTool=b.dataset.htool;if(hTool==='clip'&&!b.classList.contains('on')){}else if(hTool==='clip'){}sfx('pop');renderCloset();return true;}
  if(b.dataset.hview){hairView=+b.dataset.hview;sfx('pop');return true;}
  if(b.dataset.spray){sprayC=b.dataset.spray;sfx('pop');renderCloset();return true;}
  if(b.dataset.clipc){clipC=b.dataset.clipc;sfx('pop');renderCloset();return true;}
  if(b.dataset.hreset){if(b.dataset.hreset==='clips')H.clips=[];else{delete H.len;delete H.curl;delete H.vol;H.clips=[];}persist();glamSeat(true);renderCloset();return true;}
  if(b.dataset.mtool){mTool=b.dataset.mtool;setZoom({lips:'lips',gloss:'lips',shadow:'eyes',liner:'eyes',lashes:'eyes',brows:'eyes'}[mTool]||'face');sfx('pop');renderCloset();return true;}
  if(b.dataset.mkc){mkColor[mTool]=b.dataset.mkc;sfx('pop');renderCloset();return true;}
  if(b.dataset.mkoff){const k=b.dataset.mkoff;const d=defaultMakeup();if(k==='all')L.makeup=Object.assign(d,{blush:'none'});else if(k==='lips'){mk.lips=null;mk.lipLiner=null;}else if(k==='blush')mk.blush='none';else mk[k]=d[k];persist();av.dress(SAVE.look);sfx('splash');renderCloset();return true;}
  return false;}
// hair strokes
function hairHit(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);return ray.intersectObjects(av.hairMeshes||[],false)[0]||null;}
let hairDirty=0;
function hairStroke(e,first){if(hTool==='braid'){if(first&&hairHit(e))openBraid();return true;}const h=hairHit(e);if(!h)return false;if(hTool!=='clip'){showHTool(h.point);hwRoot=h.point.clone();}const H=SAVE.look.hair,P=h.point;if(!hstroke.ld&&['curl','straight','brush','dry','grow'].includes(hTool)&&!['long','waves'].includes(H.id)&&!(hTool==='grow'&&['bob','pixie'].includes(H.id))){H.id=H.curl>.45||hTool==='curl'?'waves':'long';H.len=1;hairDirty=1;toast('💁‍♀️ Let her hair down so you can style it!');}if(!hstroke.ld&&hTool==='cut'&&!['long','waves','bob','pixie'].includes(H.id)){H.id='long';H.len=1;hairDirty=1;}hstroke.ld=1;const d=first?0:Math.hypot(e.clientX-hstroke.x,e.clientY-hstroke.y);hstroke.x=e.clientX;hstroke.y=e.clientY;hstroke.go+=d;
  const k=d*.0016,cl=v=>Math.min(1,Math.max(0,v));let fx='#ffffff';
  if(hTool==='straight'){H.curl=cl((H.curl||0)-k*2.4);H.vol=cl((H.vol||0)-k*.8);if(hstroke.go>90&&!H.shine){H.shine=true;toast('✨ Sleek and shiny!');}fx='#ffe0b0';if(d&&Math.random()<.25)tone(220,.1,'sine',.025,0,180);}
  else if(hTool==='brush'){H.curl=cl((H.curl||0)-k*1.3);H.vol=cl((H.vol||0)-k*.4);if(hstroke.go>140&&!H.shine){H.shine=true;toast('✨ So shiny!');}if(d)sfx('brush');}
  else if(hTool==='curl'){H.curl=cl((H.curl||0)+k*1.2);fx='#ffd6ea';if(d&&Math.random()<.3)tone(900,.08,'sine',.04,0,1200);}
  else if(hTool==='dry'){H.vol=cl((H.vol||0)+k*1.1);fx='#cfefff';if(d&&Math.random()<.4)tone(160,.12,'sawtooth',.02,0,200);}
  else if(hTool==='cut'||hTool==='grow'){const s=hTool==='cut'?-1:1;H.len=(H.len||1)+s*k*.9;fx=hTool==='cut'?'#d9d9e8':'#7ee081';
    if(hTool==='cut'&&d&&hstroke.go-(hstroke.snip||0)>40){hstroke.snip=hstroke.go;tone(2400,.04,'square',.05);tone(1800,.04,'square',.05,.05);burst(P.clone(),H.c,6,.5,.04);}
    const longish=['long','waves'];if(s<0&&H.len<.42&&longish.includes(H.id)){H.id='bob';H.len=1;toast('✂️ A cute bob!');}else if(s<0&&H.len<.5&&H.id==='bob'){H.id='pixie';H.len=1;toast('✂️ A short pixie cut!');}
    else if(s>0&&H.id==='pixie'&&H.len>1.15){H.id='bob';H.len=.6;toast('🌱 It grew into a bob!');}else if(s>0&&H.id==='bob'&&H.len>1.25){H.id='long';H.len=.5;toast('🌱 Long hair!');}
    H.len=Math.min(1.3,Math.max(.35,H.len));}
  else if(hTool==='spray'){const c=new THREE.Color(H.c).lerp(new THREE.Color(sprayC),Math.min(1,.08+k*2.2));H.c='#'+c.getHexString();fx=sprayC;if(d&&Math.random()<.4)tone(3000+Math.random()*800,.05,'sawtooth',.012);}
  else if(hTool==='clip'){if(!first)return true;const lp=av.head.worldToLocal(P.clone());H.clips=(H.clips||[]).slice(-7).concat([[+lp.x.toFixed(4),+lp.y.toFixed(4),+lp.z.toFixed(4),clipC]]);sfx('pop');fx=clipC;}
  if(first||Math.random()<.35)burst(P.clone(),fx,first?14:5,.6,.05);hairDirty=1;return true;}
// makeup strokes
function mkRegion(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObject(av.overlay,false)[0];if(!h)return null;
  const p=av.head.worldToLocal(h.point.clone()),ax=Math.abs(p.x);let r='face';
  if(ax<.04&&p.y<-.035&&p.y>-.085)r='lips';else if(ax>.008&&ax<.1&&p.y>=.04&&p.y<.085)r='brows';else if(ax>.012&&ax<.09&&p.y>-.012&&p.y<.05)r='eyes';else if(ax>.035&&p.y<-.005&&p.y>-.07)r='cheeks';return {r,p:h.point,lp:p,sx:Math.sign(p.x)};}
function mkStroke(e,first){const g=mkRegion(e);if(!g)return false;if(MKX[mTool])return mkExtraStroke(e,first,g);const mk=SAVE.look.makeup;const d=first?0:Math.hypot(e.clientX-mstroke.x,e.clientY-mstroke.y);mstroke.x=e.clientX;mstroke.y=e.clientY;mstroke.go+=d;
  const want={lips:'lips',gloss:'lips',shadow:'eyes',liner:'eyes',lashes:'eyes',blush:'cheeks',gems:'eyes'}[mTool];if(g.r!==want&&!(mTool==='gems'&&g.r==='cheeks')){if(first)toast({lips:'👄 Rub on the lips',eyes:'👁️ Rub on the eyes',cheeks:'🌸 Rub on the cheeks'}[want]);return true;}
  let ch=false;const key=mTool+g.r+(g.sx||0);
  if(!mstroke.done[key]&&(first||mstroke.go>18)){mstroke.done[key]=1;ch=true;
    if(mTool==='lips')mk.lips=mkColor.lips;if(mTool==='gloss')mk.gloss=true;if(mTool==='shadow')mk.shadow=mkColor.shadow;
    if(mTool==='liner'){mk.linerC=mkColor.liner;mk.liner=mk.liner==='none'||!mk.liner?'thin':mk.liner==='thin'?'bold':'wing';}
    if(mTool==='lashes')mk.lashes=mk.lashes==='natural'?'long':'bold';if(mTool==='blush')mk.blush=mkColor.blush;if(mTool==='gems')mk.gems=true;}
  if(ch){av.dress(SAVE.look);persist();sfx(mTool==='gems'?'star':'brush');}
  if(first||Math.random()<.3)burst(g.p.clone(),mTool==='lips'?mkColor.lips:mTool==='shadow'?mkColor.shadow:'#ffd6f0',first?10:4,.4,.035);return true;}

/* real salon tools that follow your finger in the hair */
const htoolG={};let htoolOn=null,htoolT=0,htoolHide=0;
function buildHTool(id){const g=new THREE.Group(),cyl=(a,b,h,n=14)=>new THREE.CylinderGeometry(a,b,h,n),m=(geo,mt,x=0,y=0,z=0,par=g)=>{const o=new THREE.Mesh(geo,mt);o.position.set(x,y,z);par.add(o);return o;};
  const pink=std('#ff6fae',{roughness:.35}),silver=std('#d8dbe3',{metalness:.9,roughness:.25}),black=std('#2d2d3a',{roughness:.4}),white=std('#ffffff',{roughness:.4}),gold=std('#d4af37',{metalness:.8,roughness:.3});
  if(id==='curl'){m(cyl(.016,.016,.16),silver,0,.08,0);m(new THREE.SphereGeometry(.016,12,8),silver,0,0,0);const cl=m(new THREE.BoxGeometry(.02,.13,.008),silver,0,.085,.019);g.userData.spin=m(cyl(.003,.003,.001),silver,0,0,0);
    m(cyl(.02,.02,.012),black,0,.165,0);m(cyl(.018,.014,.13),pink,0,.235,0);m(cyl(.004,.004,.04),black,0,.31,0);g.userData.spinAxis='y';}
  else if(id==='straight'){const a=new THREE.Group(),b=new THREE.Group();g.add(a,b);for(const [gr,sx] of [[a,1],[b,-1]]){m(new THREE.BoxGeometry(.012,.24,.034),pink,sx*.008,.15,0,gr);m(new THREE.BoxGeometry(.004,.1,.03),silver,sx*.002,.05,0,gr);}
    m(cyl(.01,.01,.03,10),black,0,.27,0).rotation.z=Math.PI/2;m(cyl(.003,.003,.06),black,0,.3,0);g.userData.jaw=[a,b];}
  else if(id==='dry'){const body=m(cyl(.035,.03,.13),pink,0,.06,-.05);body.rotation.x=Math.PI/2;m(cyl(.022,.03,.03),black,0,.06,.025).rotation.x=Math.PI/2;
    const back=m(cyl(.036,.036,.01),black,0,.06,-.118);back.rotation.x=Math.PI/2;m(cyl(.016,.014,.12),pink,0,.15,-.07);m(new THREE.BoxGeometry(.012,.02,.01),white,0,.12,-.05);g.userData.wob=1;}
  else if(id==='cut'){const a=new THREE.Group(),b=new THREE.Group();g.add(a,b);for(const [gr,sx] of [[a,1],[b,-1]]){const bl=m(new THREE.BoxGeometry(.01,.11,.003),silver,0,.055,sx*.002,gr);
      const r=m(new THREE.TorusGeometry(.022,.006,8,16),pink,sx*.016,.13,0,gr);}g.userData.jaw=[a,b];g.userData.snip=1;}
  else if(id==='brush'){m(new THREE.BoxGeometry(.06,.07,.012),pink,0,.035,-.008);for(let i=0;i<5;i++)for(let j=0;j<5;j++)m(cyl(.0018,.0018,.016,4),white,-.024+i*.012,.008+j*.013,.006).rotation.x=Math.PI/2;
    m(cyl(.009,.011,.15),pink,0,.14,-.008);}
  else if(id==='spray'){m(cyl(.028,.028,.13),gold,0,.1,0);m(cyl(.018,.026,.03),white,0,.18,0);m(new THREE.BoxGeometry(.016,.014,.022),black,0,.2,.006);}
  else if(id==='grow'){m(cyl(.026,.03,.09),std('#7ee081',{roughness:.3}),0,.08,0);m(cyl(.02,.02,.03),white,0,.14,0);m(new THREE.TorusGeometry(.02,.006,6,16),white,0,.02,0).rotation.x=Math.PI/2;}
  else return null;
  g.traverse(o=>{if(o.isMesh)o.castShadow=false;});g.visible=false;scene.add(g);return g;}
function showHTool(P){clearTimeout(htoolHide);let g=htoolG[hTool];if(g===undefined)g=htoolG[hTool]=buildHTool(hTool);for(const k in htoolG)if(htoolG[k])htoolG[k].visible=false;if(!g){htoolOn=null;return;}
  const toCam=camera.position.clone().sub(P).normalize();g.position.copy(P).addScaledVector(toCam,hTool==='dry'?.13:hTool==='spray'?.14:.06);
  g.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(camera.position,g.position,new THREE.Vector3(0,1,0)));g.rotateY(Math.PI);g.rotateX(-.35);g.rotateZ(hTool==='curl'||hTool==='straight'?.2:-.5);if(hTool==='straight')g.rotateY(.9);
  g.visible=true;htoolOn=g;}
function hideHTool(){for(const k in htoolG)if(htoolG[k])htoolG[k].visible=false;htoolOn=null;}
anims.push((t)=>{const g=htoolOn;if(!g||!g.visible)return;const u=g.userData;
  if(u.jaw){const o=u.snip?(Math.sin(t*14)*.5+.5)*.35:(Math.sin(t*6)*.5+.5)*.06;u.jaw[0].rotation.z=o;u.jaw[1].rotation.z=-o;}
  if(u.spinAxis)g.children[0].rotation.y=t*6;if(u.wob)g.rotation.z+=Math.sin(t*40)*.004;});

/* real hair strands that wrap around the curling iron, slide through the straightener, catch in the brush and blow in the dryer air */
const hwrap=new THREE.Group();scene.add(hwrap);hwrap.visible=false;const hwMat=new THREE.MeshStandardMaterial({color:'#7a4a2a',roughness:.45,metalness:.05});let hwRoot=null;
function wrapStrands(t){hwrap.children.forEach(o=>o.geometry.dispose());hwrap.clear();const g=htoolOn;if(!g||!g.visible||!hwRoot||!hstroke){hwrap.visible=false;return;}
  hwrap.visible=true;g.updateMatrixWorld(true);hwMat.color.set(SAVE.look.hair.c);const W=(x,y,z)=>g.localToWorld(new THREE.Vector3(x,y,z)),go=hstroke.go||0,id=hTool;
  const tube=(pts,r)=>{const c=new THREE.CatmullRomCurve3(pts);const m=new THREE.Mesh(new THREE.TubeGeometry(c,Math.max(16,pts.length*6),r,6,false),hwMat);m.castShadow=false;hwrap.add(m);};
  const root=hwRoot.clone(),rootIn=root.clone().lerp(av.head.getWorldPosition(new THREE.Vector3()),.06);
  if(id==='curl'){const turns=1.5+Math.min(3,go/120),spin=t*6;for(let s=0;s<3;s++){const pts=[rootIn.clone()],off=s*.7,n=Math.round(turns*10);
      for(let i=0;i<=n;i++){const a=spin+off+i/10*Math.PI*2,y=.025+(i/n)*.12;pts.push(W(Math.cos(a)*(.021+s*.002),y,Math.sin(a)*(.021+s*.002)));}tube(pts,.0042);}}
  else if(id==='straight'){for(let s=-2;s<=2;s++){const z=s*.006,w=Math.sin(t*5+s)*.002;tube([rootIn.clone(),W(w,.02,z),W(0,.08,z),W(0,.16,z),W(0,.24,z),W(w*3,.29,z+w)],.0035);}}
  else if(id==='brush'){for(let s=0;s<6;s++){const x=-.024+s*.0096,sw=Math.sin(t*4+s)*.006;tube([rootIn.clone(),W(x*.6,.005,.004),W(x,.03,.012),W(x,.06,.014),W(x+sw,.085,.008),W(x+sw*1.5,.1,-.004)],.0028);}}
  else if(id==='dry'){const nozzle=W(0,.06,.04),dir=root.clone().sub(nozzle).normalize(),up=new THREE.Vector3(0,1,0),side=new THREE.Vector3().crossVectors(dir,up).normalize();
    for(let s=0;s<9;s++){const a=s/9*Math.PI*2,sp=side.clone().multiplyScalar(Math.cos(a)*.03).addScaledVector(up,Math.sin(a)*.03),pts=[rootIn.clone().add(sp.clone().multiplyScalar(.3))];
      for(let i=1;i<=6;i++){const f=i/6,fl=Math.sin(t*22+s*1.7+i*1.3)*.012*f;pts.push(root.clone().addScaledVector(dir,f*.12).addScaledVector(sp,1+f*1.4).addScaledVector(up,fl).addScaledVector(side,fl*.8));}tube(pts,.0032);}}
  else if(id==='cut'){for(let s=0;s<4;s++){const z=(s-1.5)*.005;tube([rootIn.clone(),W(.002,.03,z),W(0,.055,z)],.003);}}
  else {hwrap.visible=false;}}
anims.push((t)=>wrapStrands(t));

/* braid it yourself: the same braiding game as the 2D salon. Tap her hair with the braid tool and a big close-up opens:
   drag the glowing outside strand over the middle one, left then right, back and forth, then tie it off with a bow */
const BR={k:0,order:[0,1,2],need:8,drag:null,cols:[]};const BX=[112,150,188];
const braidSvg=$('#braidSvg');
function openBraid(){const c=SAVE.look.hair.c,sh=(v)=>'#'+new THREE.Color(c).lerp(new THREE.Color(v>0?'#ffffff':'#000000'),Math.abs(v)).getHexString();
  BR.k=0;BR.order=[0,1,2];BR.drag=null;BR.cols=c==='rainbow'?['#ff6fae','#ffd23f','#4fb6ff']:[sh(.18),c,sh(-.22)];
  $('#braidTie').style.display='none';$('#braidModal').classList.add('show');drawBraid();sfx('pop');}
function closeBraid(){$('#braidModal').classList.remove('show');BR.drag=null;}
function drawBraid(px,py){
  const y0=46+BR.k*28,expect=BR.k%2?2:0;let s='';
  s+=`<path d="M70 0 L230 0 L230 30 Q150 56 70 30 Z" fill="${BR.cols[1]}"/>`;
  for(let i=0;i<BR.k;i++){const y=48+i*28,lean=i%2?1:-1;
    s+=`<ellipse cx="${150+lean*7}" cy="${y}" rx="24" ry="15" fill="${BR.cols[i%3]}" stroke="rgba(0,0,0,.25)" stroke-width="2" transform="rotate(${lean*-28} ${150+lean*7} ${y})"/><path d="M${138+lean*7} ${y-6} Q${150+lean*7} ${y-12} ${162+lean*7} ${y-6}" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>`;}
  if(BR.k<BR.need){
    for(let slot=0;slot<3;slot++){
      const ci=BR.order[slot],top=[150+(BX[slot]-150)*.35,y0],drag=BR.drag&&BR.drag.slot===slot;
      const ex=drag?px:BX[slot],ey=drag?py:400;
      const d=`M${top[0]} ${top[1]} Q${(top[0]+ex)/2+(drag?0:(BX[slot]-150)*.3)} ${(top[1]+ey)/2} ${ex} ${ey}`;
      if(slot===expect&&!BR.drag)s+=`<path d="${d}" stroke="#ffd23f" stroke-width="30" stroke-linecap="round" fill="none" opacity=".55"><animate attributeName="opacity" values=".2;.7;.2" dur="1.2s" repeatCount="indefinite"/></path>`;
      s+=`<path d="${d}" stroke="${BR.cols[ci]}" stroke-width="20" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#fff" stroke-opacity=".25" stroke-width="4" stroke-linecap="round" fill="none" transform="translate(-4 0)"/>`;
    }
    const hx=expect===0?60:240;
    s+=`<text x="${hx}" y="330" font-size="34" text-anchor="middle">${expect===0?'👉':'👈'}</text>`;
  }else{
    s+=`<path d="M138 ${y0-4} L128 ${y0+40} L150 ${y0+24} L172 ${y0+40} L162 ${y0-4} Z" fill="${BR.cols[1]}"/>`;
  }
  braidSvg.innerHTML=s;
  $('#braidBar').style.width=Math.round(BR.k/BR.need*100)+'%';
  $('#braidHint').textContent=BR.k>=BR.need?'Beautiful braid! Now tie it off.':`Drag the glowing ${BR.k%2?'right':'left'} strand over the middle one. (${BR.k}/${BR.need})`;
}
function braidPt(ev){const pt=braidSvg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform(braidSvg.getScreenCTM().inverse());return [q.x,q.y];}
braidSvg.addEventListener('pointerdown',ev=>{
  if(BR.k>=BR.need)return;const [x,y]=braidPt(ev),y0=46+BR.k*28;if(y<y0)return;
  let best=0,bd=1e9;for(let i=0;i<3;i++){const t=(y-y0)/(400-y0),sx=(150+(BX[i]-150)*.35)*(1-t)+BX[i]*t,d=Math.abs(x-sx);if(d<bd){bd=d;best=i;}}
  if(bd>32)return;
  if(best===1){toast('✋ Grab an outside strand');return;}
  const expect=BR.k%2?2:0;if(best!==expect){toast(`✨ Try the glowing ${expect?'right':'left'} strand`);return;}
  ev.preventDefault();try{braidSvg.setPointerCapture(ev.pointerId);}catch(e){}
  BR.drag={slot:best,id:ev.pointerId};drawBraid(x,y);
});
braidSvg.addEventListener('pointermove',ev=>{if(!BR.drag||ev.pointerId!==BR.drag.id)return;ev.preventDefault();const [x,y]=braidPt(ev);drawBraid(x,y);});
const braidUp=ev=>{
  if(!BR.drag||ev.pointerId!==BR.drag.id)return;const [x]=braidPt(ev),slot=BR.drag.slot;BR.drag=null;
  const crossed=slot===0?x>140:x<160;
  if(crossed){[BR.order[slot],BR.order[1]]=[BR.order[1],BR.order[slot]];BR.k++;tone(500+BR.k*60,.09,'triangle',.08);if(BR.k>=BR.need){$('#braidTie').style.display='block';sfx('tada');}}
  drawBraid();
};
braidSvg.addEventListener('pointerup',braidUp);braidSvg.addEventListener('pointercancel',braidUp);
$('#braidClose').onclick=closeBraid;
$('#braidTie').onclick=()=>{closeBraid();const H=SAVE.look.hair;H.id='sidebraid';H.len=1;hTool='brush';persist();hairDirty=1;
  burst(av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.1,0)),'#ffd6ea',30,1.2,.08);did('braid');sfx('tada');toast('🪢 You braided it yourself!');renderCloset();};
function beautyDown(e){if(!glamOpen)return false;
  if(ctab==='nails'||ctab==='toes')return youNailTap(e);
  if(ctab==='hair'){hstroke={id:e.pointerId,x:e.clientX,y:e.clientY,go:0};hairStroke(e,true);try{canvas.setPointerCapture(e.pointerId);}catch(_){}return true;}
  if(ctab==='makeup'&&mTool!=='paint'){mstroke={id:e.pointerId,x:e.clientX,y:e.clientY,go:0,done:{}};if(mkStroke(e,true)){try{canvas.setPointerCapture(e.pointerId);}catch(_){}return true;}mstroke=null;return false;}
  return false;}
function beautyMove(e){if(hstroke&&e.pointerId===hstroke.id){hairStroke(e,false);return true;}if(mstroke&&e.pointerId===mstroke.id){mkStroke(e,false);return true;}return false;}
function beautyUp(e){if(hstroke&&e.pointerId===hstroke.id){hstroke=null;clearTimeout(htoolHide);htoolHide=setTimeout(hideHTool,350);persist();renderCloset();}if(mstroke&&e.pointerId===mstroke.id){mstroke=null;if(mkDirty){mkDirty=0;persist();}renderCloset();}}
let hairT=0;anims.push((t)=>{if(hairDirty&&glamOpen&&t-hairT>.12){hairDirty=0;hairT=t;av.dress(ctab==='toes'?Object.assign({},SAVE.look,{shoes:null}):SAVE.look);}});

/* ---------- the model contest ---------- */
const ALL=a=>a.map(x=>x[0]);
const CT_THEMES=[
  {id:'royal',e:'👑',n:'Royal Ball',tip:'Princess gowns, tiaras, crowns and glass slippers!',dress:['gown','wedding','ballerina','stargown'],top:['sequin'],bottom:['maxi','tutu'],shoes:['glass','heels'],hat:['tiara','crown'],extras:['pearls','wand','cape'],fams:['pink','purple','gold','white']},
  {id:'beach',e:'🏖️',n:'Beach Party',tip:'Sunny and fun! Sundresses, shorts, sandals and sunglasses.',dress:['sundress','mermaid'],top:['tank','tee','hearttee','startee'],bottom:['shorts','skirt'],shoes:['sandals','flats','sneaker'],hat:['cap','flowers'],extras:['glasses','balloon'],fams:['yellow','teal','blue','orange']},
  {id:'spooky',e:'🎃',n:'Spooky Glam',tip:'Witchy and cool! Black, purple and orange, with a cape or a wand.',dress:['witch'],top:['hoodie','sequin','jacket'],bottom:['leggings','skirt','tutu'],shoes:['boots','platforms'],hat:['witchhat','catears'],extras:['cape','wand'],fams:['black','purple','orange','green']},
  {id:'winter',e:'❄️',n:'Winter Wonderland',tip:'Cozy and snowy! Sweaters, fluffy coats, boots and scarves.',dress:['santa'],top:['sweater','furcoat','hoodie'],bottom:['jeans','leggings','maxi'],shoes:['boots','furboots'],hat:['santahat','bow'],extras:['scarf'],fams:['white','red','blue','silver']},
  {id:'garden',e:'🌷',n:'Garden Party',tip:'Pretty as a flower! Fairy dresses, flower crowns and wings.',dress:['fairy','sundress','party'],top:['hearttee','tank'],bottom:['skirt','tutu','maxi'],shoes:['flats','sandals'],hat:['flowers','bow'],extras:['wings','purse'],fams:['pink','green','yellow','purple']},
  {id:'pop',e:'🎤',n:'Pop Star',tip:'Shine on stage! Sparkly tops, party dresses and platform heels.',dress:['party'],top:['sequin','startee','jacket'],bottom:['skirt','leggings','tutu','shorts'],shoes:['platforms','heels','skates'],hat:['cap','bow'],extras:['glasses','purse'],fams:['pink','purple','blue','gold']},
  {id:'galaxy',e:'🌌',n:'Galaxy Night',tip:'Out of this world! Starry gowns, sparkles, wings and halos.',dress:['stargown','mermaid','gown'],top:['sequin'],bottom:['leggings','maxi'],shoes:['platforms','glass'],hat:['tiara'],extras:['wings','halo','unicorn'],fams:['purple','blue','black','silver']},
  {id:'pink',e:'💗',n:'Pretty in Pink',tip:'Everything pink! Pink clothes, pink shoes, pink hat, pink lips.',pink:true,dress:ALL(DRESSES),top:ALL(TOPS),bottom:ALL(BOTTOMS),shoes:ALL(SHOES),hat:ALL(HATS),extras:ALL(EXTRAS),fams:['pink']}];
const PRIZE=[50,30,20,10];
function fam(hex){if(!hex||hex==='rainbow')return '';if(hex==='#d4af37'||hex==='#e8c25a')return 'gold';const c=new THREE.Color(hex),h={};c.getHSL(h);const H=h.h*360,S=h.s,L=h.l;
  if(L>.88)return 'white';if(L<.22)return 'black';if(S<.18)return L>.6?'silver':'black';
  if(H>=345||H<12)return L>.72?'pink':'red';if(H>=290)return 'pink';if(H<42)return L<.45?'brown':'orange';if(H<68)return 'yellow';if(H<160)return 'green';if(H<200)return 'teal';if(H<245)return 'blue';return 'purple';}
function themeCheck(L,th){const r={};const ok=(o,list)=>!!o&&list.includes(o.id);
  if(th.pink){const pk=c=>fam(c)==='pink';r.outfit=L.dress?(pk(L.dress.c)?2:0):(L.top&&pk(L.top.c)?1:0)+(L.bottom&&pk(L.bottom.c)?1:0);r.shoes=L.shoes&&pk(L.shoes.c)?1:0;r.hat=L.hat&&pk(L.hat.c)?1:0;r.extra=Object.values(L.extras||{}).some(pk)?1:0;r.color=pk((L.makeup||{}).lips)||pk(L.hair.c)?1:0;}
  else{r.outfit=L.dress?(ok(L.dress,th.dress)?2:0):(ok(L.top,th.top)?1:0)+(ok(L.bottom,th.bottom)?1:0);r.shoes=ok(L.shoes,th.shoes)?1:0;r.hat=ok(L.hat,th.hat)?1:0;r.extra=Object.keys(L.extras||{}).some(k=>th.extras.includes(k))?1:0;const m=L.dress||L.top;r.color=m&&th.fams.includes(fam(m.c))?1:0;}
  r.T=(r.outfit+r.shoes+r.hat+r.extra+r.color)/6;return r;}
function glamCheck(L){const mk=L.makeup||{},N=L.nails||{};const n=[!!mk.shadow,mk.liner&&mk.liner!=='none',mk.lashes&&mk.lashes!=='natural',!!mk.lips,!!(mk.gloss||mk.lipLiner),!!mk.gems].filter(Boolean).length;
  const r={mk:Math.min(3,n),nails:nailCols(N,'c').some(Boolean)?1:0,toes:nailCols(N,'t').some(Boolean)?1:0,hair:L.hair.shine||SALON.has(L.hair.id)?1:0};r.G=(r.mk+r.nails+r.toes+r.hair)/6;return r;}
function judgeCards(T,G,W){return JUDGES.map(j=>{const v=j.w[0]*T+j.w[1]*G+j.w[2]*W;return Math.max(1,Math.min(10,Math.round(1.6+v*8.4+(Math.random()-.5)*1.2)));});}
function themeLook(base,th,q){const l=JSON.parse(JSON.stringify(base));const yes=()=>Math.random()<q;const cols=COLORS.filter(c=>th.fams.includes(fam(c)));const tc=()=>yes()&&cols.length?rnd(cols):rnd(COLORS);
  const pick=(arr,list)=>{arr=inSeason(arr);const good=arr.filter(x=>list.includes(x[0]));return yes()&&good.length?rnd(good):rnd(arr);};
  if(th.dress.length&&(!th.top.length||Math.random()<.6)){const d=pick(DRESSES,th.dress);l.dress={id:d[0],c:tc()};l.top=l.bottom=null;}
  else{const t=pick(TOPS,th.top),b=pick(BOTTOMS,th.bottom);l.dress=null;l.top={id:t[0],c:tc()};l.bottom={id:b[0],c:th.pink?tc():b[3]};}
  const s=pick(SHOES,th.shoes);l.shoes={id:s[0],c:th.pink?tc():s[3]};
  if(Math.random()<.85){const h=pick(HATS,th.hat);l.hat={id:h[0],c:th.pink?tc():h[3]};}else l.hat=null;
  l.extras={};if(Math.random()<.8){const e=pick(EXTRAS,th.extras);l.extras[e[0]]=th.pink?tc():e[3];}
  l.hair={id:Math.random()<.45?rnd([...SALON]):rnd(HAIRS)[0],c:base.hair.c,shine:Math.random()<.4};
  l.makeup=Object.assign(defaultMakeup(),{shadow:Math.random()<.6?rnd(MK_SHADOW):null,liner:rnd(['none','thin','wing']),lashes:rnd(['natural','long','bold']),lips:Math.random()<.85?rnd(MK_LIPS):null,gloss:Math.random()<.5,gems:Math.random()<.25});
  l.nails=Math.random()<.6?{c:rnd(POLISH),f:rnd(['shiny','glitter','chrome'])}:{};if(Math.random()<.4)l.nails.t=rnd(POLISH);return l;}
const ct={on:false,phase:'',round:0,themes:[],you:[],riv:[],sub:null,queue:[],walker:null,w:null,pose:null,cards:[]};
const rw=()=>AG.rw;
function stagePlayer(){player.pos.copy(agW(0,rw().h,rw().z0+.6));player.vy=0;player.speed=0;player.face=agFace(0,1);cam.yaw=cam.cy=cam.closetYaw=player.face;}
function openContest(){if(closetOpen)return;closeTalk();buildAgencyNPCs();Object.assign(ct,{on:true,phase:'intro',round:0,sub:null,you:[],riv:[[],[],[]],walker:null,w:null});
  closetOpen=true;document.body.classList.add('dressing','contest');joy.id=null;joy.x=joy.y=0;joyEl.style.display='none';AG.cLbl.visible=false;ccam.init=false;
  stagePlayer();av.play('wave');renderContest();$('#contest').classList.add('show');$('#ctcontent').scrollTop=0;sfx('tada');}
function endContest(){if(!ct.on)return;ct.on=false;ct.phase='';ct.sub=null;clearCards();ct.walker=null;
  ag.rivals.forEach(o=>{o.pos.copy(agW(o.home[0],0,o.home[1]));o.face=o.home[2];o.sp=0;});
  closetOpen=false;document.body.classList.remove('dressing','contest');$('#contest').classList.remove('show');showHud(false);AG.cLbl.visible=true;
  player.pos.copy(agW(2.6,0,2.3));player.vy=0;player.face=agFace(0,1);cam.yaw=cam.cy=player.face+Math.PI;}
function backToContest(){closetOpen=true;document.body.classList.add('dressing','contest');stagePlayer();ccam.init=false;renderContest();$('#contest').classList.add('show');}
function themeNow(){return ct.themes[ct.round];}
const star5=v=>{const n=Math.round(v*5);return '⭐'.repeat(n)+'☆'.repeat(5-n);};
function names(arr,ids){return ids.filter(id=>arr.some(x=>x[0]===id)).slice(0,4).map(id=>{const a=arr.find(x=>x[0]===id);return `${a[1]} ${a[2]}`;}).join(', ');}
function renderContest(){const C=SAVE.contest||{};let h='';$('#cttitle').textContent='🏆 Model Contest';$('#ctdone').textContent=ct.phase==='final'?'Done':'Leave';
  if(ct.phase==='intro'){h=`<div class="ctTheme"><b>🏆</b><div><strong>Star Model Contest</strong><span>3 rounds · 3 judges · 4 models</span></div></div>
    <p class="cttext">Every round has a theme. Dress up for it, get glam at the mirror, then walk the runway and strike your best poses! The judges each give a score from 1 to 10.</p>
    <div class="earn"><div><b>🥇</b><span>1st place</span><em>+${PRIZE[0]} 🪙</em></div><div><b>🥈</b><span>2nd place</span><em>+${PRIZE[1]} 🪙</em></div><div><b>🥉</b><span>3rd place</span><em>+${PRIZE[2]} 🪙</em></div><div><b>🎀</b><span>4th place</span><em>+${PRIZE[3]} 🪙</em></div></div>
    <p class="cttext">Tonight you're up against <b>${RIVAL_N.join(', ')}</b>.${C.wins?` You have won ${C.wins} time${C.wins>1?'s':''}! 🏆`:''}</p>
    <div class="ctbtns"><button class="btn" data-ct="start">▶ Start the contest!</button></div>`;}
  else if(ct.phase==='prep'){const th=themeNow(),L=SAVE.look,T=themeCheck(L,th),G=glamCheck(L);const ck=v=>v?'✅':'⬜';
    const want=th.pink?[[T.outfit>=2,'👗','Pink dress, or a pink top and bottom'],[T.shoes,'👠','Pink shoes'],[T.hat,'👑','A pink hat'],[T.extra,'👜','A pink accessory'],[T.color,'💄','Pink lips or pink hair']]
      :[[T.outfit>=2,'👗',`${names(DRESSES,th.dress)}${th.top.length?' · or '+names(TOPS,th.top):''}${th.bottom.length?' + '+names(BOTTOMS,th.bottom):''}`],[T.shoes,'👠',names(SHOES,th.shoes)],[T.hat,'👑',names(HATS,th.hat)],[T.extra,'👜',names(EXTRAS,th.extras)],
        [T.color,'🎨',`Colors: <i class="dots">${COLORS.filter(c=>th.fams.includes(fam(c))).slice(0,7).map(c=>`<u style="background:${c}"></u>`).join('')}</i>`]];
    h=`<div class="ctTheme"><b>${th.e}</b><div><strong>Round ${ct.round+1} of 3: ${th.n}</strong><span>${th.tip}</span></div></div>
      <h3>What the judges want <span class="ctstars">${star5(T.T)}</span></h3><div class="ctwant">${want.map(([v,e,t])=>`<div><b>${ck(v)}</b><span>${e} ${t}</span></div>`).join('')}</div>
      <h3>Glam check <span class="ctstars">${star5(G.G)}</span></h3><div class="ctwant"><div><b>${ck(G.mk>=3)}</b><span>💄 Makeup (${G.mk} of 3: eyeshadow, liner, lashes, lipstick, gloss, gems)</span></div><div><b>${ck(G.hair)}</b><span>💇 Salon hair or glossy blow-dry</span></div><div><b>${ck(G.nails)}</b><span>💅 Manicure</span></div><div><b>${ck(G.toes)}</b><span>🦶 Pedicure</span></div></div>
      <div class="ctbtns"><button class="btn ghost" data-ct="closet">👗 Change outfit</button><button class="btn ghost" data-ct="glam">🪞 Glam mirror</button></div>
      <div class="ctbtns"><button class="btn big" data-ct="walk">${isGuy(SAVE.look)?'🕺':'💃'} Walk the runway!</button></div>`;}
  else if(ct.phase==='result'||ct.phase==='final'){const rows=[{n:SAVE.name||'You',you:true,r:ct.you},...ag.rivals.map((o,i)=>({n:o.name,r:ct.riv[i]}))].map(x=>({...x,last:x.r[ct.round].sum,tot:x.r.reduce((a,b)=>a+b.sum,0)}));
    const fin=ct.phase==='final';rows.sort((a,b)=>(fin?b.tot-a.tot:b.last-a.last)||(a.you?-1:b.you?1:0));const max=fin?90:30;const place=rows.findIndex(r=>r.you);
    const medal=['🥇','🥈','🥉','🎀'];
    h=fin?`<div class="ctTheme gold"><b>${medal[place]}</b><div><strong>${place===0?'You won the contest!':`You came in ${['1st','2nd','3rd','4th'][place]} place!`}</strong><span>${place===0?'You are the Star Model! 👑':'Great job! Try again to win the crown!'} +${PRIZE[place]} 🪙</span></div></div>`
      :`<div class="ctTheme"><b>${themeNow().e}</b><div><strong>Round ${ct.round+1} scores: ${themeNow().n}</strong><span>${place===0?'You got the top score this round! 🌟':'Keep going, you can still win!'}</span></div></div>`;
    const you=ct.you[ct.round];if(!fin&&you)h+=`<div class="ctwant"><div><b>👗</b><span>Theme ${star5(you.T)}</span></div><div><b>💄</b><span>Glam ${star5(you.G)}</span></div><div><b>💃</b><span>Poses ${star5(you.W)}</span></div></div>`;
    h+=`<h3>${fin?'Final scores':'This round'}</h3><div class="board">${rows.map((r,i)=>{const v=fin?r.tot:r.last;return `<div class="${r.you?'me':''}"><b>${fin?medal[i]:i+1}</b><span>${r.you?'⭐ ':''}${r.n}</span><i><u style="width:${Math.round(v/max*100)}%"></u></i><em>${v}</em></div>`;}).join('')}</div>`;
    if(!fin)h+=`<p class="cttext">Total so far: ${rows.slice().sort((a,b)=>b.tot-a.tot).map(r=>`${r.n} ${r.tot}`).join(' · ')}</p>`;
    h+=`<div class="ctbtns">${fin?`<button class="btn" data-ct="again">🔁 Play again</button><button class="btn ghost" data-ct="leave">Done</button>`:`<button class="btn big" data-ct="next">${ct.round<2?'Next round ▶':'See who won! 🏆'}</button>`}</div>`;}
  $('#ctcontent').innerHTML=h;}
$('#ctcontent').onclick=e=>{const b=e.target.closest('[data-ct]');if(!b)return;const k=b.dataset.ct;sfx('pop');
  if(k==='start'||k==='again'){const pool=CT_THEMES.filter(t=>!t.hol).sort(()=>Math.random()-.5),hol=CT_THEMES.find(t=>t.hol&&seasonOn(t.hol));Object.assign(ct,{themes:hol?[hol].concat(pool.slice(0,2)):pool.slice(0,3),round:0,you:[],riv:[[],[],[]],phase:'prep'});dressRivals();renderContest();$('#ctcontent').scrollTop=0;banner(`${themeNow().e} ${themeNow().n}`);}
  else if(k==='closet'){ct.sub='closet';$('#contest').classList.remove('show');document.body.classList.remove('contest');closetOpen=false;cam.yaw=player.face;ctab=ctab==='makeup'||GTABS.some(g=>g[0]===ctab)&&ctab!=='hair'?'dresses':ctab;openCloset();}
  else if(k==='glam'){ct.sub='glam';$('#contest').classList.remove('show');document.body.classList.remove('contest');closetOpen=false;openGlam(true);}
  else if(k==='walk')startShow();
  else if(k==='next'){if(ct.round<2){ct.round++;ct.phase='prep';dressRivals();renderContest();$('#ctcontent').scrollTop=0;banner(`${themeNow().e} ${themeNow().n}`);}else finishContest();}
  else if(k==='leave')endContest();};
$('#ctdone').onclick=()=>{sfx('pop');endContest();};
function dressRivals(){const th=themeNow();ag.rivals.forEach(o=>{o.q=.35+Math.random()*.5;o.look=themeLook(o.base,th,o.q);o.a.dress(o.look);});}
function finishContest(){ct.phase='final';const tot=x=>x.reduce((a,b)=>a+b.sum,0);const me=tot(ct.you),place=ct.riv.filter(r=>tot(r)>me).length;
  const C=SAVE.contest=Object.assign({played:0,wins:0,cups:[]},SAVE.contest);C.played++;if(place===0)C.wins++;if(place<3){C.cups.push(place);C.cups=C.cups.slice(-10);}C.best=Math.max(C.best||0,me);persist();showTrophies();
  did('contest',place);renderContest();$('#ctcontent').scrollTop=0;setTimeout(()=>earn(PRIZE[place],place===0?'Contest winner!':'Contest prize'),600);
  if(place===0){banner('👑 Star Model! 👑');sfx('tada');try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}av.play('cheer');const P=player.pos;for(let k=0;k<5;k++)setTimeout(()=>burst(new THREE.Vector3(P.x+(Math.random()-.5)*2,P.y+2,P.z+(Math.random()-.5)*2),rnd(['#ffd23f','#ff8fc8','#8fd8ff']),50,3.5),k*220);}
  else{banner(['🥇','🥈','🥉','🎀'][place]+' Nice job!');av.play('bow');}
  ag.judges.forEach(o=>o.a.play('clap'));setTimeout(()=>ag.judges.forEach(o=>o.a.play('chair')),2100);}
// ---- the show: rivals walk, then you ----
function showHud(on){$('#ctHud').style.display=on?'block':'none';$('#ctPose').style.display='none';}
function startShow(){ct.phase='show';$('#contest').classList.remove('show');showHud(true);clearCards();ct.queue=[0,1,2,'you'];ct.w=null;nextWalker();sfx('tada');}
function nextWalker(){const k=ct.queue.shift();if(k===undefined){ct.phase='result';ct.walker=null;showHud(false);renderContest();$('#contest').classList.add('show');$('#ctcontent').scrollTop=0;return;}
  clearCards();const you=k==='you',o=you?null:ag.rivals[k];ct.w={k,you,o,st:'in',t:0};ct.walker=o;
  const P=agW(0,rw().h,rw().z0+.45);if(you){player.pos.copy(P);player.face=agFace(0,1);}else{o.pos.copy(P);o.face=agFace(0,1);o.a.emote=null;}
  $('#ctTop').textContent=you?`${isGuy(SAVE.look)?'🕺':'💃'} Your turn, ${SAVE.name||'superstar'}!`:`${themeNow().e} ${o.name} walks the runway`;$('#ctSkip').style.display=you?'none':'block';
  if(you)banner((isGuy(SAVE.look)?'🕺':'💃')+' Your turn!');}
$('#ctSkip').onclick=()=>{sfx('pop');const w=ct.w;if(!w||w.you)return;
  // score everyone who has not walked yet, then jump to your turn
  [w.k,...ct.queue.filter(x=>x!=='you')].forEach(i=>{if(!ct.riv[i][ct.round])scoreRival(i);const o=ag.rivals[i];o.pos.copy(agW(o.home[0],0,o.home[1]));o.face=o.home[2];o.sp=0;});
  ct.queue=['you'];nextWalker();};
function scoreRival(i){const o=ag.rivals[i];const T=themeCheck(o.look,themeNow()).T,G=glamCheck(o.look).G,W=.42+Math.random()*.5;const cards=judgeCards(T,G,W);ct.riv[i][ct.round]={cards,sum:cards.reduce((a,b)=>a+b,0),T,G,W};return ct.riv[i][ct.round];}
function scoreYou(){const th=themeNow(),T=themeCheck(SAVE.look,th).T,G=glamCheck(SAVE.look).G,res=ct.pose.res,W=res.reduce((a,b)=>a+b,0)/res.length;const cards=judgeCards(T,G,W);ct.you[ct.round]={cards,sum:cards.reduce((a,b)=>a+b,0),T,G,W};return ct.you[ct.round];}
function clearCards(){ct.cards.forEach(s=>{s.parent&&s.parent.remove(s);s.material.map.dispose();s.material.dispose();});ct.cards=[];}
function showCard(j,n,delay){setTimeout(()=>{if(!ct.on)return;const o=ag.judges[j];const s=sprite(labelTex(String(n),{w:160,h:160,size:96,fg:n>=8?'#ff3b8d':n>=5?'#8e6cff':'#8a7499',border:'#e8c25a'}),.42,.42);s.position.set(0,1.62,0);o.g.add(s);ct.cards.push(s);o.a.play(n>=8?'clap':'chair');setTimeout(()=>{if(ct.on&&o.a.emote&&o.a.emote.id==='clap')o.a.play('chair');},1500);sfx('pop');tone(500+n*60,.18,'triangle',.12);},delay);}
const WALK_SP=2.5;
function contestStep(dt){const w=ct.w;if(!ct.on||ct.phase!=='show'||!w)return;w.t+=dt;const R=rw(),end=agW(0,R.h,R.z1-.5),start=agW(0,R.h,R.z0+.45);
  if(w.st==='in'||w.st==='out')(w.you?av:w.o.a).runwayT=.25;// catwalk for girls, a confident stride for guys (runwayWalk in 14d-dances.js)
  const mover=w.you?{get pos(){return player.pos;},set face(v){player.face=v;},get face(){return player.face;},a:av}:w.o;const pos=w.you?player.pos:w.o.pos;let sp=0;
  const walkTo=(tgt)=>{tmpV.subVectors(tgt,pos);tmpV.y=0;const d=tmpV.length();if(d<.05)return true;tmpV.normalize();pos.addScaledVector(tmpV,Math.min(d,WALK_SP*dt));sp=WALK_SP;const f=Math.atan2(tmpV.x,tmpV.z);if(w.you)player.face=angDamp(player.face,f,Math.min(1,dt*10));else w.o.face=angDamp(w.o.face,f,Math.min(1,dt*10));return false;};
  if(w.st==='in'){if(walkTo(end)){w.st='pose';w.t=0;if(w.you)startPoses();else{w.o.a.play(rnd(['pose','kiss','twirl','cheer']));camFlash();burst(w.o.pos.clone().add(new THREE.Vector3(0,1.2,0)),'#ffd6f0',40,2.2,.12);}}}
  else if(w.st==='pose'){const lookF=agFace(0,1);if(w.you){player.face=angDamp(player.face,lookF,Math.min(1,dt*8));stepPoses(dt);}else{w.o.face=angDamp(w.o.face,lookF,Math.min(1,dt*8));if(w.t>1.3){w.st='score';w.t=0;const r=scoreRival(w.k);r.cards.forEach((n,j)=>showCard(j,n,j*180));$('#ctTop').textContent=`${w.o.name}: ${r.sum} points`;}}}
  else if(w.st==='score'){if(w.t>(w.you?3.4:1.5)){w.st='out';w.t=0;if(w.you)clearCards();}}
  else if(w.st==='out'){if(walkTo(start)||w.t>4){if(!w.you){const o=w.o;o.pos.copy(agW(o.home[0],0,o.home[1]));o.face=o.home[2];o.sp=0;ct.walker=null;}nextWalker();return;}}
  if(w.you){player.speed=sp;player.pos.y=groundAt(player.pos.x,player.pos.z);player.vy=0;}else{const o=w.o;o.sp=sp;o.pos.y=groundAt(o.pos.x,o.pos.z);stepNPC(o,dt);}}
// pose mini game: tap when the marker is in the pink
function startPoses(){ct.pose={i:0,t:0,res:[],cool:0};$('#ctPose').style.display='flex';$('#ctMsg').textContent='';$('#ctTop').textContent='📸 Tap POSE when the line is in the pink!';}
function stepPoses(dt){const P=ct.pose;if(!P)return;if(P.done){if((P.cool-=dt)<=0){ct.pose.done=false;finishPoses();}return;}P.t+=dt;P.cool-=dt;const sp=[2.3,3,3.8][P.i]||3.8;P.x=.5+.5*Math.sin(P.t*sp);$('#ctMark').style.left=(P.x*100)+'%';if(P.t>6&&P.cool<=0)posePress(true);}
function posePress(timeout){const P=ct.pose;if(!P||P.done||P.cool>0||ct.w.st!=='pose')return;const d=Math.abs(P.x-.5);let v,msg;
  if(timeout){v=.1;msg='Too slow! 😅';}else if(d<.05){v=1;msg='PERFECT! ✨';}else if(d<.13){v=.7;msg='Great! 💖';}else if(d<.24){v=.4;msg='Nice!';}else{v=.15;msg='Oops! 🙈';}
  P.res.push(v);$('#ctMsg').textContent=msg;$('#ctMsg').classList.remove('pop');void $('#ctMsg').offsetWidth;$('#ctMsg').classList.add('pop');
  av.play(['pose','kiss','twirl','cheer','magic'][(P.i+Math.floor(Math.random()*2))%5]);camFlash();burst(player.pos.clone().add(new THREE.Vector3(0,1.2,0)),v>=.7?'#ffd23f':'#ffd6f0',v>=.7?60:24,v>=.7?3:1.6,.13);if(v>=1)sfx('star');
  P.i++;P.t=Math.random()*3;P.cool=.9;if(P.i>=3){P.done=true;P.cool=1.4;}}
function finishPoses(){$('#ctPose').style.display='none';const w=ct.w;w.st='score';w.t=0;const r=scoreYou();r.cards.forEach((n,j)=>showCard(j,n,400+j*650));
  $('#ctTop').textContent='The judges are scoring…';setTimeout(()=>{if(!ct.on)return;$('#ctTop').textContent=`You got ${r.sum} points! ${r.sum>=26?'🤩':r.sum>=20?'😊':'💪'}`;if(r.sum>=24){try{sndCheer.currentTime=0;sndCheer.play().catch(()=>{});}catch(e){}}
    const low=[['T',0,'Dress more for the theme next time! 👗'],['G',1,'Visit the glam mirror! 💄💅'],['W',2,'Practice those poses! 📸']].filter(([k])=>r[k]<.55).sort((a,b)=>r[a[0]]-r[b[0]])[0];
    const j=low?ag.judges[low[1]]:rnd(ag.judges);npcSay(j,low?low[2]:rnd(['Fabulous! 😍','A true star! 🌟','Gorgeous! 💖','Wow, just wow! ✨']));},400+3*650);
  w.t=-1.4;}
$('#ctPoseBtn').addEventListener('pointerdown',e=>{e.preventDefault();posePress(false);});
addEventListener('keydown',e=>{if(e.code==='Space'&&ct.on&&ct.phase==='show'&&ct.w&&ct.w.you&&ct.w.st==='pose'){posePress(false);e.preventDefault();}});
const ccam={p:new THREE.Vector3(),t:new THREE.Vector3(),init:false};
function contestCam(dt){if(!ct.on||ct.sub)return;const R=rw();let Pp,T;const w=ct.w;
  if(ct.phase==='show'&&w){const pos=w.you?player.pos:w.o.pos;if(w.st==='score'){Pp=agW(-.4,1.75,2.4);T=agW(AG.jt.lx+.6,1.25,-1);}else{Pp=agW(.25,1.25,R.z1+2.45);T=pos.clone().add(new THREE.Vector3(0,w.st==='pose'?1.05:1.15,0));}}
  else{const P=player.pos;T=P.clone().add(new THREE.Vector3(0,.95,0));Pp=agW(.5,1.55,R.z0+3.6);}
  if(!ccam.init){ccam.p.copy(Pp);ccam.t.copy(T);ccam.init=true;}const k=Math.min(1,dt*(ct.phase==='show'?4:5));ccam.p.lerp(Pp,k);ccam.t.lerp(T,k);camera.position.copy(ccam.p);camera.lookAt(ccam.t);}
// keep the camera inside the building when you walk around in it
function agencyCamClamp(tgt){const b=AG.box;const [plx,plz]=AG.toLocal(tgt.x,tgt.z);if(Math.abs(plx)>b.W-.3||plz<b.B+.3||plz>b.F-.7)return;
  const [clx,clz]=AG.toLocal(camera.position.x,camera.position.z);let t=1;const lim=(c,p,lo,hi)=>{if(c>hi&&c!==p)t=Math.min(t,(hi-p)/(c-p));if(c<lo&&c!==p)t=Math.min(t,(lo-p)/(c-p));};
  lim(clx,plx,-b.W+.4,b.W-.4);lim(clz,plz,b.B+.4,b.F-.4);lim(camera.position.y,tgt.y,.3,b.H-.25);if(t<1)camera.position.lerpVectors(tgt,camera.position,Math.max(.05,t));}

