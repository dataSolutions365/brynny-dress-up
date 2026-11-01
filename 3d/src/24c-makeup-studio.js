/* ================= GLAM MIRROR makeup studio extras =================
   spray tan, brow color, freckles, face stickers, a soap + rinse wash station,
   one-tap eye looks, a timed "theme" makeup challenge and a mystery makeup box. */

// drawn on the face canvas after face paint (called from Avatar.renderFace, so only function declarations here)
function faceExtras(a,x,at,k,mk){
  if(mk.freckles>0){let sd=11;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;const n=Math.round(10+mk.freckles*36);
    x.fillStyle=`rgba(135,78,48,${.32+mk.freckles*.28})`;
    for(let i=0;i<n;i++){const sx=i%2?1:-1,fx=sx*(.008+r()*.062),fy=-.004-r()*.036;const [px,py]=at(fx,fy,mkSurfZ(fx,fy));x.beginPath();x.arc(px,py,(2.6+r()*3.4)*k,0,Math.PI*2);x.fill();}}
  for(const s of mk.stickers||[]){const [px,py]=at(s[0],s[1],s[2]);faceSticker(x,px,py,40*k,s[3],s[4]);}
  if(a.foam)for(const f of a.foam){const [px,py]=at(f[0],f[1],f[2]);const R=f[3]*k;const g=x.createRadialGradient(px-R*.3,py-R*.3,0,px,py,R);
    g.addColorStop(0,'rgba(255,255,255,.97)');g.addColorStop(.7,'rgba(238,246,255,.9)');g.addColorStop(1,'rgba(200,225,255,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,R,0,Math.PI*2);x.fill();}}
function mkSurfZ(x,y){return Math.sqrt(Math.max(0,.0172-x*x-(y/1.08)**2));}
function faceSticker(x,px,py,R,kind,c){x.save();x.translate(px,py);x.fillStyle=c||'#ff6fae';x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=R*.13;x.lineJoin='round';x.beginPath();
  if(kind==='heart'){x.moveTo(0,R*.75);x.bezierCurveTo(-R*1.25,-R*.1,-R*.6,-R*1.05,0,-R*.35);x.bezierCurveTo(R*.6,-R*1.05,R*1.25,-R*.1,0,R*.75);}
  else if(kind==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?R*.42:R;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();}
  else if(kind==='sparkle'){for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,r=i%2?R*.2:R;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();}
  else if(kind==='flower'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5,cx=Math.cos(a)*R*.5,cy=Math.sin(a)*R*.5;x.moveTo(cx+R*.4,cy);x.arc(cx,cy,R*.4,0,Math.PI*2);}}
  else if(kind==='moon'){x.arc(0,0,R*.8,0,Math.PI*2);x.stroke();x.clip();x.beginPath();x.arc(0,0,R*.8,0,Math.PI*2);x.moveTo(R*1.04,-R*.2);x.arc(R*.38,-R*.2,R*.66,0,Math.PI*2);x.fill('evenodd');x.restore();return;}
  else x.arc(0,0,R*.42,0,Math.PI*2);
  x.stroke();x.fill();x.fillStyle=kind==='flower'?'#ffd23f':'rgba(255,255,255,.6)';x.beginPath();if(kind==='flower')x.arc(0,0,R*.3,0,Math.PI*2);else x.arc(-R*.22,-R*.22,R*.13,0,Math.PI*2);x.fill();x.restore();}

/* ---------- the new tools ---------- */
const MKX={brows:1,tan:1,freckles:1,stickers:1,soap:1,rinse:1};
const BROWC=[['#3a2618','Brown'],['#1a1210','Black'],['#8a5a3b','Light brown'],['#d9b26a','Blonde'],['#b5452e','Red'],['#ff6fae','Pink'],['#b388ff','Purple'],['#4fb6ff','Blue'],['#ffffff','Bleached']];
const STK=[['heart','💖','Hearts'],['star','⭐','Stars'],['sparkle','✨','Sparkles'],['flower','🌼','Flowers'],['moon','🌙','Moons'],['dot','🔵','Dots']];
const STKC=['#ff6fae','#ff3b6b','#ffd23f','#ff8a1f','#4fb6ff','#2fd1c5','#b388ff','#7ee081','#ffffff','#d4af37','#2d2d3a'];
let stkKind='heart',stkC='#ff6fae',browPick='#3a2618',mkDirty=0,washed=0;
const FOAM_FULL=22;
function mkExtraHTML(){const mk=SAVE.look.makeup;let h='';
  if(mTool==='brows')h+=`<div class="swatches">${BROWC.map(([c,n])=>`<button class="sw${browPick===c?' on':''}" style="background:${c}" data-browc="${c}" aria-label="${n} brows"></button>`).join('')}</div>`;
  if(mTool==='tan')h+=`<div class="hmeters">${meter('Tan',mk.tan||0)}</div>`;
  if(mTool==='freckles')h+=`<div class="hmeters">${meter('Freckles',mk.freckles||0)}</div>`;
  if(mTool==='stickers')h+=`<div class="chips">${STK.map(([v,e,n])=>`<button class="${stkKind===v?'on':''}" data-stk="${v}">${e} ${n}</button>`).join('')}</div><div style="height:8px"></div><div class="swatches">${STKC.map(c=>`<button class="sw${stkC===c?' on':''}" style="background:${c}" data-stkc="${c}"></button>`).join('')}</div>`;
  if(mTool==='soap'||mTool==='rinse'){const f=(av.foam||[]).length;h+=`<div class="hmeters">${meter('Bubbles',Math.min(1,f/FOAM_FULL))}</div>`;
    h+=`<p class="drawhint">${mTool==='soap'?(f>=FOAM_FULL?'🫧 All soapy! Now pick 🚿 Rinse.':'🫧 Keep rubbing until the bubble meter is full.'):(f?'🚿 Rub the bubbles away.':'🧼 Soap up first, then rinse.')}</p>`;return h;}
  const off={brows:'🧽 Back to natural brows',tan:'🧼 Wash off tan',freckles:'🧼 Wipe off freckles',stickers:'🧽 Peel off stickers'}[mTool];
  return h+`<div class="chips" style="margin-top:8px"><button data-mkoff="${mTool==='brows'?'browC':mTool}">${off}</button><button data-mkoff="all">🧼 Wipe off everything</button></div>`;}

function mkExtraClick(b){const L=SAVE.look,mk=L.makeup;
  if(b.dataset.browc){browPick=b.dataset.browc;sfx('pop');renderCloset();return true;}
  if(b.dataset.stk){stkKind=b.dataset.stk;sfx('pop');renderCloset();return true;}
  if(b.dataset.stkc){stkC=b.dataset.stkc;sfx('pop');renderCloset();return true;}
  if(b.dataset.elook){const p=EYE_LOOKS.find(e=>e[0]===b.dataset.elook);if(!p)return true;applyEyeLook(mk,p[3]);av.dress(L);persist();sfx('tada');
    burst(av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.03,.1)),p[3].shadow||'#ffd6f0',22,.7,.05);gigiSays(rnd(['Ooh, '+p[2]+'! 😍','That look is SO you! 💖','Gorgeous eyes! ✨']));renderCloset();return true;}
  if(b.dataset.mkchal){if(mkChal)endMkChal(false);else startMkChal();return true;}
  if(b.dataset.mystery){openMystery();return true;}
  return false;}

function mkExtraStroke(e,first,g){const L=SAVE.look,mk=L.makeup;const d=first?0:Math.hypot(e.clientX-mstroke.x,e.clientY-mstroke.y);mstroke.x=e.clientX;mstroke.y=e.clientY;mstroke.go+=d;const lp=g.lp;
  if(mTool==='brows'){if(g.r!=='brows'){if(first)toast('〰️ Rub on the eyebrows');return true;}
    if(!av.browM){if(first)toast('〰️ Brows are on the 💃 Glam girl look');return true;}
    if(mk.browC!==browPick){mk.browC=browPick;av.browM.color.set(browPick);mkDirty=1;sfx('brush');}
    if(first||Math.random()<.3)burst(g.p.clone(),browPick,first?8:3,.3,.03);return true;}
  if(mTool==='tan'){if(first||d){mk.tan=Math.min(1,(mk.tan||0)+(first?.04:d*.0011));av.skin.color.set(L.skin).lerp(TAN_C,mk.tan*.55);mkDirty=1;
      if(Math.random()<.4)tone(2600+Math.random()*900,.05,'sawtooth',.01);}
    if(first||Math.random()<.5)burst(g.p.clone(),'#e8a46a',first?12:4,.5,.04);return true;}
  if(mTool==='freckles'){if(g.r==='lips'||g.r==='eyes'){if(first)toast('🟤 Dab on the nose and cheeks');return true;}
    if(first||mstroke.go-(mstroke.fk||0)>45){mstroke.fk=mstroke.go;mk.freckles=Math.min(1,(mk.freckles||0)+.2);mkRefresh();mkDirty=1;tone(700+Math.random()*300,.05,'sine',.04);burst(g.p.clone(),'#8a5a3b',5,.25,.025);}return true;}
  if(mTool==='stickers'){if(!first)return true;mk.stickers=(mk.stickers||[]).slice(-19).concat([[+lp.x.toFixed(4),+lp.y.toFixed(4),+lp.z.toFixed(4),stkKind,stkC]]);
    mkRefresh();mkDirty=1;sfx('star');burst(g.p.clone(),stkC,10,.4,.035);return true;}
  if(mTool==='soap'){const F=av.foam=av.foam||[];if(first||mstroke.go-(mstroke.fk||0)>14){mstroke.fk=mstroke.go;
      if(F.length<60)F.push([lp.x+(Math.random()-.5)*.01,lp.y+(Math.random()-.5)*.01,lp.z,16+Math.random()*18]);av.renderFace();
      if(Math.random()<.5)tone(500+Math.random()*500,.06,'sine',.035,0,900);if(Math.random()<.35)burst(g.p.clone(),'#ffffff',3,.2,.025);
      if(F.length===FOAM_FULL){toast('🫧 So soapy! Now pick 🚿 Rinse.');renderCloset();}}return true;}
  if(mTool==='rinse'){const F=av.foam||[];if(!F.length){if(first)toast('🧼 Soap up first, then rinse!');return true;}
    av.foam=F.filter(f=>Math.hypot(f[0]-lp.x,f[1]-lp.y)>.026);washed+=F.length-av.foam.length;av.renderFace();
    if(Math.random()<.5)tone(3000+Math.random()*1500,.05,'sawtooth',.015);if(first||Math.random()<.6)burst(g.p.clone(),'#8fd8ff',6,.5,.04);
    if(!av.foam.length){if(washed>=8)freshFace();else{toast('🫧 Use more soap for a full wash!');}washed=0;}return true;}
  return false;}

// the avatar keeps its own copy of the look, so hand it the new makeup before repainting the face
function mkRefresh(){av.look.makeup=JSON.parse(JSON.stringify(SAVE.look.makeup));av.renderFace();}
function freshFace(){const L=SAVE.look;L.makeup=Object.assign(defaultMakeup(),{blush:'none'});
  if(av.paintCv){const x=av.paintCv.getContext('2d');x.clearRect(0,0,av.paintCv.width,av.paintCv.height);savePaint();}
  av.dress(L);persist();sfx('splash');burst(av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.05,.1)),'#cfefff',30,1,.06);
  toast('✨ Squeaky clean! A fresh face, ready for makeup.');gigiSays('Fresh and glowy! Now let\'s do your makeup 💄');did('wash');renderCloset();}
function gigiSays(t){const g=ag.gigi;if(g){npcSay(g,t);g.a.play('clap');}}

/* ---------- one-tap eye looks ---------- */
const eyeStk=(kind,c,pts)=>pts.flatMap(([x,y])=>[-1,1].map(s=>[+(s*x).toFixed(4),y,+mkSurfZ(s*x,y).toFixed(4),kind,c]));
const EYE_LOOKS=[
  ['soft','#ffb3d1','Soft glam',{shadow:'#ffb3d1',liner:'thin',linerC:'#2b1d16',lashes:'long'}],
  ['smoky','#2d2d3a','Smoky',{shadow:'#2d2d3a',liner:'bold',linerC:'#000000',lashes:'bold'}],
  ['sunset','#ff8a1f','Sunset',{shadow:'#ff8a1f',liner:'wing',linerC:'#2b1d16',lashes:'long'}],
  ['kawaii','#ff6fae','Kawaii',{shadow:'#ff6fae',liner:'thin',linerC:'#ff3b6b',lashes:'long',blush:'pink',stk:eyeStk('heart','#ff6fae',[[.075,-.024]])}],
  ['ocean','#4fb6ff','Ocean',{shadow:'#4fb6ff',liner:'wing',linerC:'#3a5bd9',lashes:'long',gems:true}],
  ['fairy','#7ee081','Fairy',{shadow:'#7ee081',liner:'thin',linerC:'#d4af37',lashes:'long',stk:eyeStk('sparkle','#ffd23f',[[.083,-.006],[.07,-.026]])}],
  ['galaxy','#8e6cff','Galaxy',{shadow:'#8e6cff',liner:'wing',linerC:'#000000',lashes:'bold',stk:eyeStk('star','#c0c0c0',[[.08,-.016]])}],
  ['gold','#d4af37','Golden',{shadow:'#d4af37',liner:'wing',linerC:'#2b1d16',lashes:'bold',gems:true}],
  ['fire','#e0263b','Fire',{shadow:'#e0263b',liner:'wing',linerC:'#000000',lashes:'bold',stk:eyeStk('star','#ffd23f',[[.078,-.02]])}]];
function applyEyeLook(mk,p){const {stk,...rest}=p;Object.assign(mk,rest);if(stk){const have=new Set((mk.stickers||[]).map(s=>s.slice(0,2).join()));mk.stickers=(mk.stickers||[]).concat(stk.filter(s=>!have.has(s.slice(0,2).join()))).slice(-20);}}
function eyeLooksHTML(){const mk=SAVE.look.makeup,sk=SAVE.look.skin;
  return `<h3>✨ One-tap eye looks</h3><div class="grid elooks">${EYE_LOOKS.map(([id,c,n,p])=>`<button class="item${mk.shadow===p.shadow&&mk.liner===p.liner?' on':''}" data-elook="${id}"><b class="eprev" style="background:radial-gradient(ellipse 60% 38% at 50% 42%,${c} 0 45%,transparent 75%),${sk}"><i style="border-color:${p.linerC}"></i></b><span>${n}</span></button>`).join('')}</div>`;}

/* ---------- theme challenge: a timed makeup look the judge scores ---------- */
const MK_THEMES=[
  {n:'🔥 Fire',c:['#ff3b6b','#e0263b','#ff8a1f','#ffd23f','#d4af37','#c2185b'],x:['wing','stickers'],tip:'reds, oranges and gold, with a sharp wing'},
  {n:'🎀 Kawaii',c:['#ff6fae','#ffb3d1','#b388ff','#4fb6ff','#e89aa0'],x:['blush','stickers'],tip:'pastel pinks, rosy blush and cute stickers'},
  {n:'🌊 Ocean',c:['#4fb6ff','#2fd1c5','#3a5bd9','#c0c0c0'],x:['gems','gloss'],tip:'blues and teals, glossy lips and gems'},
  {n:'🦇 Spooky',c:['#2d2d3a','#8e6cff','#8e2b5b','#000000','#7ee081'],x:['wing','stickers'],tip:'dark purple and black, a bold wing and moons or stars'},
  {n:'🧚 Fairy',c:['#7ee081','#b388ff','#ffb3d1','#d4af37','#2fd1c5'],x:['gems','stickers'],tip:'greens and lilac, gems and sparkles'},
  {n:'🌌 Galaxy',c:['#8e6cff','#3a5bd9','#2d2d3a','#c0c0c0','#b388ff'],x:['lashes','stickers'],tip:'deep purples and blues, big lashes and stars'},
  {n:'☀️ Sun-kissed',c:['#ff8a1f','#e89aa0','#b5655b','#d4af37','#8a5a3b'],x:['tan','freckles'],tip:'warm nudes, a spray tan and freckles'},
  {n:'🍭 Candy',c:['#ff6fae','#ff3b6b','#4fb6ff','#7ee081','#ffd23f'],x:['gloss','blush'],tip:'bright candy colors, glossy lips and blush'}];
let mkChal=null;
const hexRGB=h=>{const n=parseInt((h||'#000').slice(1),16);return [n>>16&255,n>>8&255,n&255];};
const palDist=(c,pal)=>c?Math.min(...pal.map(p=>{const a=hexRGB(c),b=hexRGB(p);return Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);})):999;
function startMkChal(){const th=rnd(MK_THEMES.filter(t=>!mkChal||t!==mkChal.th));mkChal={th,left:120,shown:-1};
  $('#mkChal').classList.add('show');$('#mkChalT').textContent='Theme: '+th.n;$('#mkChalRes').textContent='';$('#mkChalDone').style.display='';
  sfx('tada');gigiSays(`Your theme is ${th.n}! Use ${th.tip}. You have 2 minutes! ⏱️`);renderCloset();}
function mkScore(th){const mk=SAVE.look.makeup;const col=c=>{const d=palDist(c,th.c);return d<70?25:d<130?12:0;};
  let s=col(mk.lips)+col(mk.shadow)+(mk.liner&&mk.liner!=='none'?8:0)+(mk.lashes&&mk.lashes!=='natural'?7:0),max=65;
  const got={wing:mk.liner==='wing'||mk.liner==='bold',stickers:(mk.stickers||[]).length>0,blush:mk.blush&&mk.blush!=='none',gems:!!mk.gems,gloss:!!mk.gloss,lashes:mk.lashes==='bold',tan:(mk.tan||0)>.2,freckles:(mk.freckles||0)>0};
  for(const k of th.x){max+=15;if(got[k])s+=15;}
  if(th.x.includes('stickers')){max+=5;if((mk.stickers||[]).some(st=>palDist(st[4],th.c)<70))s+=5;}
  return Math.round(s/max*100);}
function endMkChal(scored){if(!mkChal)return;const th=mkChal.th;mkChal=null;$('#mkChalDone').style.display='none';
  if(!scored){$('#mkChal').classList.remove('show');renderCloset();return;}
  const p=mkScore(th),st=p>=85?3:p>=60?2:1;$('#mkChalT').textContent=th.n+' '+'⭐'.repeat(st)+'☆'.repeat(3-st);
  $('#mkChalRes').textContent=`${p}% on theme! ${st===3?'Perfect look! 😍':st===2?'So pretty! 💖':'Nice try! Use more theme colors 🎨'}`;
  gigiSays(st===3?`A ${th.n} masterpiece! 🏆`:st===2?`Lovely ${th.n} look! ✨`:`Cute! Try more ${th.tip} next time 💕`);
  burst(av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.2,0)),'#ffd23f',16+st*12,1.2,.07);sfx(st>1?'tada':'pop');
  setTimeout(()=>earn(4+st*4,'Theme challenge!'),600);did('mkchal',st);
  clearTimeout(endMkChal.t);endMkChal.t=setTimeout(()=>{if(!mkChal)$('#mkChal').classList.remove('show');},5000);renderCloset();}
anims.push((t,dt)=>{if(!mkChal)return;if(!glamOpen){endMkChal(false);return;}mkChal.left-=dt;const s=Math.max(0,Math.ceil(mkChal.left));
  if(s!==mkChal.shown){mkChal.shown=s;$('#mkChalTime').textContent=`⏱️ ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;$('#mkChalTime').classList.toggle('hurry',s<=15);if(s<=5&&s>0)tone(880,.08,'sine',.05);}
  if(mkChal.left<=0){toast('⏰ Time\'s up!');endMkChal(true);}});
$('#mkChalDone').onclick=()=>endMkChal(true);
function mkTopHTML(){const th=mkChal&&mkChal.th;
  return `<div class="chips mktop"><button class="${mkChal?'on':''}" data-mkchal="1">${mkChal?'✋ Stop challenge':'⏱️ Theme challenge'}</button><button data-mystery="1">🎁 Mystery makeup box</button></div>`+
    (th?`<p class="drawhint">🎯 <b>${th.n}</b>: use ${th.tip}. Tap ✨ Finish at the top when you're done.</p>`:'');}

/* ---------- mystery makeup box: a surprise full look in a theme ---------- */
function openMystery(){const th=rnd(MK_THEMES),L=SAVE.look,mk=L.makeup;
  const look=EYE_LOOKS.filter(e=>th.c.includes(e[3].shadow));const base=look.length?rnd(look)[3]:{shadow:rnd(th.c),liner:rnd(['thin','wing']),linerC:'#2b1d16',lashes:'long'};
  applyEyeLook(mk,base);mk.lips=rnd(th.c.filter(c=>!['#000000','#c0c0c0','#d4af37','#7ee081'].includes(c)))||mk.lips;
  for(const k of th.x){if(k==='gems')mk.gems=true;if(k==='gloss')mk.gloss=true;if(k==='blush')mk.blush='pink';if(k==='lashes')mk.lashes='bold';if(k==='wing')mk.liner='wing';if(k==='tan')mk.tan=Math.max(mk.tan||0,.45);if(k==='freckles')mk.freckles=Math.max(mk.freckles||0,.6);
    if(k==='stickers'){const kd=th.n.includes('Spooky')?'moon':th.n.includes('Kawaii')?'heart':th.n.includes('Fairy')?'sparkle':'star';applyEyeLook(mk,{stk:eyeStk(kd,rnd(th.c),[[.076,-.022]])});}}
  av.dress(L);persist();sfx('tada');tone(660,.12,'triangle',.08);tone(990,.16,'triangle',.08,.12);
  burst(av.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.1,.1)),rnd(th.c),36,1.1,.06);
  toast(`🎁 Surprise! A ${th.n} look!`);gigiSays(rnd(['Ooh, what a surprise! 🎁','I love this one! 😍','Mystery magic! ✨']));did('mystery');renderCloset();}
