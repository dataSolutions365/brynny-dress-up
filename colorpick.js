/* 🌈 Every color, in every shade.
   Shared by the 2D studio (index.html), the pet page (pets.html) and the 3D world (3d/index.html).

   Every row of color dots in the game is a <div class="swatches"> of round buttons, and each page already
   knows what to do when one of those buttons is tapped (it reads the color from a data- attribute on it).
   This file adds one more button to the end of every such row: 🌈 "All colors". It opens a sheet with lots of
   base colors; tap one to see all of its shades, light to dark, bright to soft. Tapping a shade makes a copy
   of one of the row's own buttons with that color and taps it, so the page sets the color exactly as if it had
   been one of its own dots. Nothing in the pages has to change for a new color row to get it.
   The last few shades picked for a row show up in that row as extra dots (kept on this device only).
   Skin rows open on skin tones (with a 🧚 Fantasy button for the rest). */
(function(){
  if(window.__colorPick)return;
  const HEX=/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
  const hsl=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));
    return '#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');};
  const rgb=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255];};
  const norm=h=>{const [r,g,b]=rgb(h);return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');};

  // Light to dark across, bright / soft / dusty down. 7 x 3 = 21 shades of every color.
  const LIGHT=[92,80,68,56,44,32,20];
  const fam=(n,e,h,s)=>({n,e,h,s,rows:[1,.62,.3].map(m=>LIGHT.map(l=>hsl(h,s*m,l)))});
  const COLORS=[
    fam('Red','❤️',0,85),fam('Coral','🪸',10,90),fam('Orange','🧡',26,95),fam('Amber','🍯',38,95),fam('Yellow','💛',52,95),
    fam('Lime','🍈',78,80),fam('Green','💚',120,65),fam('Emerald','💎',148,70),fam('Mint','🌿',162,55),fam('Teal','🦚',178,70),
    fam('Aqua','💧',190,85),fam('Sky','🩵',202,85),fam('Blue','💙',218,85),fam('Indigo','🌌',236,70),fam('Purple','💜',266,70),
    fam('Lavender','🪻',282,60),fam('Magenta','🔮',300,75),fam('Hot pink','💗',325,90),fam('Pink','🌸',342,85),fam('Rose','🌹',352,55),
    fam('Copper','🥉',18,60),fam('Brown','🤎',25,45),fam('Tan','🧸',34,40),
    {n:'Gray','e':'🩶',h:0,s:0,rows:[[100,90,80,68,56,44,34].map(l=>hsl(0,0,l)),[26,20,15,11,7,4,0].map(l=>hsl(0,0,l)),[92,78,62,48,34,22,12].map(l=>hsl(210,14,l))]},
  ];
  const SLIGHT=[90,82,73,63,52,40,28];
  const sfam=(n,h,s)=>({n,e:'',h,s,rows:[1,.75,.5].map(m=>SLIGHT.map(l=>hsl(h,s*m,l)))});
  const SKINS=[sfam('Rosy',10,50),sfam('Peach',20,60),sfam('Warm',26,55),sfam('Golden',33,60),sfam('Olive',40,32),sfam('Neutral',24,38)];

  const css=`
#cpSheetBg{position:fixed;inset:0;z-index:2147483000;background:rgba(40,20,60,.18);display:none}
#cpSheetBg.show{display:block}
#cpSheet{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(560px,100vw);max-height:86vh;overflow:auto;box-sizing:border-box;
  background:#fff;border-radius:22px 22px 0 0;box-shadow:0 -6px 30px rgba(60,20,80,.25);padding:12px 16px calc(16px + env(safe-area-inset-bottom));
  font-family:inherit;color:#4a2b5c;-webkit-tap-highlight-color:transparent}
#cpSheet *{box-sizing:border-box}
#cpSheet .cpTop{display:flex;align-items:center;gap:12px;margin-bottom:10px}
#cpSheet .cpNow{width:46px;height:46px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #eadcf0;flex:none}
#cpSheet .cpTitle{flex:1;font-weight:800;font-size:18px;line-height:1.15}
#cpSheet .cpTitle small{display:block;font-weight:600;font-size:13px;opacity:.7}
#cpSheet .cpDone{border:0;border-radius:999px;background:#ff5fa8;color:#fff;font:inherit;font-weight:800;font-size:17px;padding:11px 18px;min-height:46px}
#cpSheet h4{margin:10px 0 7px;font-size:14px;font-weight:800;opacity:.8}
#cpSheet .cpBases{display:grid;grid-template-columns:repeat(auto-fill,minmax(48px,1fr));gap:8px}
#cpSheet .cpBase{width:48px;height:48px;justify-self:center;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #eadcf0;padding:0;cursor:pointer}
#cpSheet .cpBase.on{box-shadow:0 0 0 4px #ff5fa8}
#cpSheet .cpBase.fant{background:conic-gradient(#ff5a5a,#ffb347,#ffe066,#7ee081,#4fb6ff,#b388ff,#ff5a5a);font-size:20px}
#cpSheet .cpShades{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
#cpSheet .cpShade{aspect-ratio:1;min-height:42px;border-radius:12px;border:3px solid #fff;box-shadow:0 0 0 1.5px #e3d5ea;padding:0;cursor:pointer}
#cpSheet .cpShade.on{box-shadow:0 0 0 4px #ff5fa8;transform:scale(1.06)}
#cpSheet .cpHint{display:flex;justify-content:space-between;font-size:12px;font-weight:700;opacity:.6;margin-top:5px}
.swatches .cp-more{background:conic-gradient(#ff4d4d,#ffa64d,#ffe14d,#6fdc6f,#4dc3ff,#5a6dff,#c46bff,#ff4dc4,#ff4d4d)!important;position:relative;cursor:pointer;padding:0}
.swatches .cp-more::after{content:"+";position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:900 20px/1 system-ui,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,.45)}
`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // ---- which data- attribute on a row's buttons holds the color, and a key that names the row ----
  const colorAttr=b=>{for(const a of b.attributes)if(a.name.startsWith('data-')&&HEX.test(a.value))return a.name;return null;};
  const rowInfo=row=>{
    for(const b of row.children){if(b.tagName!=='BUTTON'||b.classList.contains('cp-more'))continue;const at=colorAttr(b);if(!at)continue;
      const key=[...b.attributes].filter(a=>a.name.startsWith('data-')&&a.name!==at).map(a=>a.name+'='+a.value).sort().join('&')+'|'+at;
      return {tpl:b,at,key,skin:/skin/i.test(key)};}
    return null;};
  const findRow=key=>{for(const r of document.querySelectorAll('.swatches')){const i=rowInfo(r);if(i&&i.key===key)return {row:r,...i};}return null;};

  let RECENT={};try{RECENT=JSON.parse(localStorage.getItem('cpRecent')||'{}')||{};}catch(e){RECENT={};}
  const saveRecent=()=>{try{localStorage.setItem('cpRecent',JSON.stringify(RECENT));}catch(e){}};
  const last={};   // the shade just picked for each row (this visit only), so it shows as chosen

  const makeDot=(info,c)=>{const d=info.tpl.cloneNode(true);d.setAttribute(info.at,c);d.classList.remove('on','none','rainbow','fancy');d.classList.add('cp-recent');
    d.textContent='';d.style.background=c;d.setAttribute('aria-label','color '+c);return d;};

  function decorate(row){
    if(row.dataset.cp)return;const info=rowInfo(row);if(!info)return;row.dataset.cp='1';
    const have=new Set([...row.querySelectorAll('button')].map(b=>(b.getAttribute(info.at)||'').toLowerCase()));
    const rec=(RECENT[info.key]||[]).filter(c=>!have.has(c));
    for(const c of rec){const d=makeDot(info,c);row.appendChild(d);}
    if(!row.querySelector('.on')&&last[info.key]){const d=[...row.querySelectorAll('.cp-recent')].find(b=>b.getAttribute(info.at)===last[info.key]);if(d)d.classList.add('on');}
    const m=document.createElement('button');m.type='button';m.className='sw cp-more';m.setAttribute('aria-label','All colors');m.title='All colors';row.appendChild(m);
  }

  // ---- the sheet ----
  let bg,sheet,S=null;   // S = {key, skin, list, fi, cur}
  function build(){
    bg=document.createElement('div');bg.id='cpSheetBg';sheet=document.createElement('div');sheet.id='cpSheet';bg.appendChild(sheet);document.body.appendChild(bg);
    bg.addEventListener('click',e=>{if(e.target===bg)close();});
    sheet.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      if(b.classList.contains('cpDone'))return close();
      if(b.dataset.fant){S.list=S.list===SKINS?COLORS:SKINS;S.fi=0;return draw();}
      if(b.dataset.fi!=null){S.fi=+b.dataset.fi;return draw();}
      if(b.dataset.shade)pick(b.dataset.shade);});
  }
  function draw(){
    const F=S.list[S.fi];
    let h=`<div class="cpTop"><div class="cpNow" style="background:${S.cur||'#fff'}"></div><div class="cpTitle">🎨 All colors<small>Tap a color, then pick its shade</small></div><button class="cpDone">✓ Done</button></div>`;
    h+=`<h4>${S.list===SKINS?'Skin tones':'Colors'}</h4><div class="cpBases">`;
    S.list.forEach((f,i)=>{h+=`<button class="cpBase${i===S.fi?' on':''}" data-fi="${i}" style="background:${f.rows[0][3]}" aria-label="${f.n}" title="${f.n}"></button>`;});
    if(S.skin)h+=`<button class="cpBase fant" data-fant="1" aria-label="${S.list===SKINS?'Fantasy colors':'Skin tones'}" title="${S.list===SKINS?'Fantasy colors':'Skin tones'}">${S.list===SKINS?'🧚':'🙂'}</button>`;
    h+=`</div><h4>${F.e} ${F.n} shades</h4><div class="cpShades">`;
    for(const r of F.rows)for(const c of r)h+=`<button class="cpShade${c===S.cur?' on':''}" data-shade="${c}" style="background:${c}" aria-label="${F.n} ${c}"></button>`;
    h+=`</div><div class="cpHint"><span>☀️ light</span><span>dark 🌙</span></div>`;
    sheet.innerHTML=h;
  }
  const dist=(a,b)=>{const x=rgb(a),y=rgb(b);return (x[0]-y[0])**2+(x[1]-y[1])**2+(x[2]-y[2])**2;};
  function open(row){
    const info=rowInfo(row);if(!info)return;if(!sheet)build();
    const on=row.querySelector('button.on'),cur=on&&HEX.test(on.getAttribute(info.at)||'')?norm(on.getAttribute(info.at)):null;
    S={key:info.key,skin:info.skin,list:info.skin?SKINS:COLORS,fi:0,cur};
    if(cur){let best=1e9;const look=lst=>lst.forEach((f,i)=>f.rows.forEach(r=>r.forEach(c=>{const d=dist(c,cur);if(d<best){best=d;S.list=lst;S.fi=i;}})));
      look(info.skin?SKINS:COLORS);if(info.skin&&best>900){const b0=best;best=1e9;look(COLORS);if(best>=b0){S.list=SKINS;look(SKINS);}}}
    draw();bg.classList.add('show');
  }
  function close(){if(bg)bg.classList.remove('show');S=null;}
  function pick(c){
    const r=findRow(S.key);if(!r){close();return;}
    S.cur=c;last[S.key]=c;
    const rec=(RECENT[S.key]||[]).filter(x=>x!==c);rec.unshift(c);RECENT[S.key]=rec.slice(0,3);saveRecent();
    let d=[...r.row.querySelectorAll('button')].find(b=>b.getAttribute(r.at)===c);
    if(!d){d=makeDot(r,c);r.row.insertBefore(d,r.row.querySelector('.cp-more'));}
    d.click();
    // the page usually redraws the row; mark the new dot as chosen if nothing else is
    requestAnimationFrame(()=>{scan();const n=findRow(S&&S.key);if(n&&!n.row.querySelector('.on')){const x=[...n.row.querySelectorAll('button')].find(b=>b.getAttribute(n.at)===c);if(x)x.classList.add('on');}});
    draw();
  }

  // the 🌈 button: catch it before the page's own click handlers see it
  window.addEventListener('click',e=>{const m=e.target.closest&&e.target.closest('.cp-more');if(!m)return;e.stopPropagation();e.preventDefault();open(m.parentElement);},true);

  // add the 🌈 button to every color row, now and whenever a panel is drawn
  let pend=false;
  const scan=()=>{pend=false;document.querySelectorAll('.swatches:not([data-cp])').forEach(decorate);};
  new MutationObserver(ms=>{if(pend)return;for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1){pend=true;requestAnimationFrame(scan);return;}})
    .observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();

  window.__colorPick={COLORS,SKINS,open,close,count:()=>COLORS.reduce((n,f)=>n+f.rows.flat().length,0)};
})();
