// Your picture: shown at the top left of the 2D studio and the 3D world, and picked in either one.
// Both pages load this file and keep the choice in localStorage, so it is the same everywhere:
//   brynny.pic    the picture you picked ({e:'🐱'}, or '@me3d' / '@pet3d' for a live picture); none = "Match my look"
//   brynny.body   'girl' or 'guy', saved by the 3D world ("Match my look" falls back to 👧 or 👦 from it)
// Each page can set BrynnyPic.match to a function that draws your current look: the 2D studio draws the doll's face,
// the 3D world uses its live close-up. Until it can, "Match my look" shows 👧 or 👦.
//   brynny.me3d / brynny.pet3d   live close-ups of your 3D character and pet, taken by the 3D world (3d/src/26b-portrait.js)
(function(){
  const PIC_KEY='brynny.pic',BODY_KEY='brynny.body';
  const PICS=[['People',['👧','👦','🧒','👩','👨','👱‍♀️','👱‍♂️','👸','🤴','🧚‍♀️','🧙‍♂️','🦸‍♀️','🦸‍♂️','🥷','🧑‍🚀','🧑‍🎤']],
    ['Guys',['🧔','👨‍🦱','👨‍🦰','👱‍♂️','👨‍🦳','👨‍🦲','🧑‍🦱','😎','🤠','🏄‍♂️','⛹️‍♂️','🏌️‍♂️','🧑‍🔧','🧑‍🚒','👮‍♂️','👷‍♂️','🧛‍♂️','🤖']],
  ['Animals',['🐱','🐶','🐕','🐿️','🐰','🐵','🦔','🦄','🐹','🐻','🐼','🦊','🐯','🐸','🐧','🦋']],
  ['Fun',['⚽','🏀','⚾','🏈','🎮','🚗','🛹','🎸','🎂','🌈','🌟','💎']]];
  const LIVE={'@me3d':['brynny.me3d','My 3D character'],'@pet3d':['brynny.pet3d','My 3D pet']};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=k=>{try{return JSON.parse(localStorage.getItem(k))||null;}catch(e){return null;}};
  const auto=()=>{const b=read(BODY_KEY);return b&&b.b==='guy'?'👦':'👧';};
  const liveImg=id=>{const d=LIVE[id]&&read(LIVE[id][0]);return d&&typeof d.img==='string'&&d.img.startsWith('data:image/')?d.img:null;};
  const current=()=>{const p=read(PIC_KEY);return p&&typeof p.e==='string'?p.e:'';};
  // what to draw for a picture: an emoji, or a live picture from the 3D world (the girl/guy emoji until there is one)
  const html=id=>{if(LIVE[id]){const im=liveImg(id);return im?`<img class="picimg" src="${im}" alt="">`:auto();}
    if(!id&&API.match){try{const m=API.match();if(m)return m;}catch(e){}}return esc(id||auto());};
  // the picker: tap a button with data-pic, then call set(button.dataset.pic). where3d changes the hint text.
  function picker(where3d){const cur=current();
    const btn=(id,label)=>`<button class="${cur===id?'on ':''}${label?'auto':''}" data-pic="${id}" aria-label="${label||'Picture '+id}">${label?`${html(id)} ${label}`:esc(id)}</button>`;
    return `<div>${btn('','Match my look')}${btn('@me3d','My 3D character')}${btn('@pet3d','My 3D pet')}</div>`+PICS.map(([t,l])=>`<b>${t}</b><div>${l.map(e=>btn(e)).join('')}</div>`).join('')+
      (cur in LIVE&&!liveImg(cur)?`<p class="hint">${where3d?(cur==='@pet3d'?'Adopt a pet and':'Walk around for a moment and'):'Play the 🌍 3D World once'+(cur==='@pet3d'?' with a pet':'')+' and'} the picture shows up here.</p>`:'');}
  function set(id){try{if(id)localStorage.setItem(PIC_KEY,JSON.stringify({e:id,at:Date.now()}));else localStorage.removeItem(PIC_KEY);}catch(e){}}
  const API={current,html,picker,set,auto,liveImg,match:null};
  window.BrynnyPic=API;
})();
