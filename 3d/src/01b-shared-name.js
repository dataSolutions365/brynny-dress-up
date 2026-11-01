/* ---------- your name, shared with the 2D studio ---------- */
// Both games keep the player's name under 'brynny.name' as {n:name,at:time}, and whichever game changed it last wins.
// The 2D studio (index.html, save key 'brynny-dressup-v1') has a list of dress-up girls, so a new name typed here
// also renames the girl you are playing there.
const NAME_KEY='brynny.name',STORE_2D='brynny-dressup-v1';
function sharedName(){try{const s=JSON.parse(localStorage.getItem(NAME_KEY));return s&&typeof s.n==='string'&&s.n.trim()?s:null;}catch(e){return null;}}
function read2D(){try{const d=JSON.parse(localStorage.getItem(STORE_2D));return d&&Array.isArray(d.chars)&&d.chars.length?d:null;}catch(e){return null;}}
const cur2D=d=>d.chars.find(c=>c.id===d.cur)||d.chars[0];
// on start: take the name if the 2D studio changed it last; before either game has shared one, use the 2D girl's name
function pullName(){const s=sharedName();
  if(s){if(s.at>(SAVE.nameAt||0)&&s.n!==SAVE.name){SAVE.name=s.n.trim().slice(0,16);SAVE.nameAt=s.at;persist();return true;}return false;}
  const d=read2D(),c=d&&d.welcomed&&cur2D(d),n=c&&String(c.name||'').trim().slice(0,16);if(n&&n!==SAVE.name){SAVE.name=n;persist();return true;}
  return false;}
pullName();
// change the name in this game and send it to the 2D studio too
function setMyName(n){n=String(n||'').trim().slice(0,16);if(!n)return false;const s=sharedName();
  if(n===SAVE.name&&s&&s.n===n)return true;
  const at=Date.now();SAVE.name=n;SAVE.nameAt=at;persist();
  try{localStorage.setItem(NAME_KEY,JSON.stringify({n,at}));}catch(e){}
  const d=read2D();if(d){const c=cur2D(d);if(c&&c.name!==n){c.name=n;c.nameAt=at;c.at=at;try{localStorage.setItem(STORE_2D,JSON.stringify(d));}catch(e){}}}
  return true;}
