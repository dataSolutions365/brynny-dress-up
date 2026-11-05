/* ================= 🧢 PICK YOUR TEAM: kids with stats, picked like a real pick-up game =================
   ROSTER is everyone you can pick, each with stats from 1 to 5:
     spd ⚡ speed (how fast they run), thr 🎯 throwing (how well they throw), cat 🙌 catching (hands), kck 🦵 kicking.
   teamPick({sport,size,title,done}) opens the draft: you're the captain of the 🦅 Eagles and pick first, the other
   captain (🐻 Bears) picks the best one left for that sport, back and forth until both teams have `size` players
   (you count on your own team, so you pick size-1). done(mine, theirs) gets two lists of ROSTER entries.
   rosterAvatar(r, color) gives a player's 3D avatar in that team's jersey colour (built once and kept).
   rosterSpeed(r) and friends turn the stats into numbers the games use. Used by football (26i2-football-games.js)
   and soccer. Your last team is remembered per sport in SAVE.teams. */
const ROSTER=[
  {n:'Sam',guy:1,skin:'#c8a072',hair:{id:'curltop',c:'#2b1d16'},spd:4,thr:2,cat:5,kck:2},
  {n:'Lily',guy:0,skin:'#f7cfae',hair:{id:'ponytail',c:'#d9a35a'},spd:5,thr:2,cat:4,kck:3},
  {n:'Marcus',guy:1,skin:'#6b4128',hair:{id:'buzz',c:'#1d140f'},spd:3,thr:5,cat:3,kck:2},
  {n:'Nora',guy:0,skin:'#eab38c',hair:{id:'braids',c:'#4a2c1a'},spd:4,thr:3,cat:4,kck:4},
  {n:'Jake',guy:1,skin:'#ffe3cc',hair:{id:'flow',c:'#a0441f'},spd:3,thr:3,cat:3,kck:5},
  {n:'Maya',guy:0,skin:'#8d5a3b',hair:{id:'afropuff',c:'#2b1d16'},spd:5,thr:3,cat:3,kck:4},
  {n:'Leo',guy:1,skin:'#d49a6a',hair:{id:'spiky',c:'#2b1d16'},spd:4,thr:4,cat:2,kck:3},
  {n:'Zara',guy:0,skin:'#b97a4f',hair:{id:'bob',c:'#1d140f'},spd:3,thr:4,cat:5,kck:2},
  {n:'Eli',guy:1,skin:'#f7cfae',hair:{id:'sidepart',c:'#d9a35a'},spd:2,thr:5,cat:3,kck:4},
  {n:'Priya',guy:0,skin:'#c8a072',hair:{id:'long',c:'#2b1d16'},spd:4,thr:2,cat:4,kck:5},
  {n:'Theo',guy:1,skin:'#eab38c',hair:{id:'afro',c:'#4a2c1a'},spd:5,thr:2,cat:3,kck:3},
];
const TP_STATS=[['spd','⚡','Speed'],['thr','🎯','Throwing'],['cat','🙌','Catching'],['kck','🦵','Kicking']];
// how much each stat counts when the other captain picks, for each sport
const TP_WANT={football:{spd:1.2,thr:1.1,cat:1.2,kck:.3},soccer:{spd:1.2,thr:.2,cat:.4,kck:1.4}};
const rosterSpeed=r=>.9+.05*(r?r.spd:3);// times the normal running speed
const rosterHands=r=>.82+.05*(r?r.cat:3);// chance to hold on to a catch
const rosterArm=r=>1.5-.2*(r?r.thr:3);// times the normal throwing miss
const rosterLeg=r=>.85+.06*(r?r.kck:3);// times the normal kicking power
function rosterLook(r,c){
  if(r.guy)return Object.assign(defaultGuyLook(),{skin:r.skin,hair:{...r.hair},top:{id:'jersey',c},bottom:{id:'gymshorts',c:'#2d2d3a'},shoes:{id:'cleats',c:'#ffffff'},hat:null,extras:{}});
  return Object.assign(defaultLook(),{style:'glam',skin:r.skin,hair:{...r.hair},dress:null,top:{id:'jersey',c},bottom:{id:'shorts',c:'#2d2d3a'},shoes:{id:'sneaker',c:'#ffffff'},hat:null,extras:{},face:{eyes:'almond',nose:'petite',lips:'soft'}});}
const TP_AV=new Map();
function rosterAvatar(r,c){const k=r.n+c;let a=TP_AV.get(k);if(!a){a=new Avatar(rosterLook(r,c),r.n,c);a.g.visible=false;TP_AV.set(k,a);}return a;}
{const st=document.createElement('style');st.textContent=`
#tpCard{max-width:460px}#tpCard h2{margin:0 0 2px}#tpCard p{margin:2px 0 8px;color:var(--muted)}
#tpTeams{display:flex;gap:8px;margin:6px 0 8px}#tpTeams>div{flex:1;border-radius:14px;padding:6px 8px;font-size:13px;font-weight:700;min-height:44px}
#tpUs{background:#e3edff;color:#1f4f9e}#tpThem{background:#ffe3e6;color:#9e1f2b}
#tpGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:46vh;overflow:auto;padding:2px}
.tpP{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;background:#fff7ef;border-radius:14px;padding:8px 10px;box-shadow:0 3px 0 #f1dcc6;font-size:12px}
.tpP:active{transform:scale(.97)}.tpP strong{font-size:16px}.tpP.gone{opacity:.35;pointer-events:none}
.tpBar{display:flex;align-items:center;gap:4px;width:100%}.tpBar i{flex:1;height:7px;border-radius:4px;background:#eadbcb;overflow:hidden;position:relative}
.tpBar i b{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:linear-gradient(90deg,#ffb067,#ff6a1f)}
#tpBtns{display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap}`;
 document.head.appendChild(st);const d=document.createElement('div');d.innerHTML='<div class="modal" id="tpMenu"><div class="card" id="tpCard"></div></div>';document.body.append(...d.children);}
const TPK={on:false};
const tpFace=r=>(r.guy?'👦':'👧')+(['#ffe3cc','#f7cfae'].includes(r.skin)?'🏻':['#eab38c','#e6c49a'].includes(r.skin)?'🏼':['#d49a6a','#c8a072'].includes(r.skin)?'🏽':['#b97a4f','#8d5a3b'].includes(r.skin)?'🏾':'🏿');
function teamPick({sport='football',size=3,title='Pick your team!',done,cancel}){if(!SAVE.teams)SAVE.teams={};const want=TP_WANT[sport]||TP_WANT.football;
  const score=r=>TP_STATS.reduce((s,[k])=>s+r[k]*(want[k]||1),0)+Math.random()*1.2;
  const S={us:[],them:[],left:ROSTER.slice(),turn:'us'};TPK.on=true;const c=$('#tpCard');
  const last=(SAVE.teams[sport]||[]).map(n=>ROSTER.find(r=>r.n===n)).filter(Boolean);
  const finish=()=>{TPK.on=false;$('#tpMenu').classList.remove('show');SAVE.teams[sport]=S.us.map(r=>r.n);persist();done&&done(S.us,S.them);};
  const full=()=>S.us.length>=size-1&&S.them.length>=size;
  const theyPick=()=>{if(full()){draw();setTimeout(finish,700);return;}const r=S.left.slice().sort((a,b)=>score(b)-score(a))[0];
    S.left.splice(S.left.indexOf(r),1);S.them.push(r);toast(`🐻 The Bears pick ${r.n}!`);tone(300,.08,'sine',.06);
    S.turn=S.us.length<size-1?'us':'them';draw();setTimeout(()=>{if(!TPK.on)return;if(full()){setTimeout(finish,500);}else if(S.turn==='them')theyPick();},650);};
  const mine=r=>{if(S.turn!=='us'||S.us.length>=size-1)return;S.left.splice(S.left.indexOf(r),1);S.us.push(r);sfx('pop');
    S.turn=S.them.length<size?'them':'us';draw();if(full()){setTimeout(finish,600);return;}if(S.turn==='them')setTimeout(()=>TPK.on&&theyPick(),600);};
  const bar=(r,k,e)=>`<span class="tpBar">${e}<i><b style="width:${r[k]*20}%"></b></i></span>`;
  function draw(){const who=S.turn==='us'&&!full()?'Your pick! Tap a player.':full()?'Teams are ready! 🏁':'🐻 Bears are picking…';
    c.innerHTML=`<h2>🧢 ${title}</h2><p>${who}</p>
      <div id="tpTeams"><div id="tpUs">🦅 Eagles: You${S.us.map(r=>', '+r.n).join('')}</div><div id="tpThem">🐻 Bears: ${S.them.map(r=>r.n).join(', ')||'…'}</div></div>
      <div id="tpGrid">${ROSTER.map(r=>`<button class="tpP ${S.left.includes(r)?'':'gone'}" data-n="${r.n}"><strong>${tpFace(r)} ${r.n}</strong>${TP_STATS.map(([k,e])=>bar(r,k,e)).join('')}</button>`).join('')}</div>
      <div id="tpBtns">${S.us.length||S.them.length?'':`<button class="btn ghost" id="tpQuick">🎲 Pick for me</button>${last.length===size-1?`<button class="btn ghost" id="tpLast">🔁 Same team as last time</button>`:''}`}<button class="btn ghost" id="tpNo">Not now</button></div>
      <p style="font-size:12px">⚡ speed · 🎯 throwing · 🙌 catching · 🦵 kicking</p>`;
    c.querySelectorAll('.tpP').forEach(b=>b.onclick=()=>mine(ROSTER.find(r=>r.n===b.dataset.n)));
    $('#tpNo').onclick=()=>{TPK.on=false;$('#tpMenu').classList.remove('show');cancel&&cancel();};
    const q=$('#tpQuick');if(q)q.onclick=()=>{S.left.sort(()=>Math.random()-.5);const take=n=>{for(let i=0;i<n;i++){const r=S.left.shift();S.us.push(r);}};take(size-1);
      while(S.them.length<size){const r=S.left.slice().sort((a,b)=>score(b)-score(a))[0];S.left.splice(S.left.indexOf(r),1);S.them.push(r);}draw();setTimeout(finish,700);};
    const l=$('#tpLast');if(l)l.onclick=()=>{for(const r of last){S.left.splice(S.left.indexOf(r),1);S.us.push(r);}
      while(S.them.length<size){const r=S.left.slice().sort((a,b)=>score(b)-score(a))[0];S.left.splice(S.left.indexOf(r),1);S.them.push(r);}draw();setTimeout(finish,700);};}
  draw();$('#tpMenu').classList.add('show');sfx('pop');}
