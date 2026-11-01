// Family-only online play.
// A grown-up types a secret family word once on each family phone. The game keeps it on that phone.
// Room codes and challenge codes are mixed with the word before they go online, so a phone
// without the same word looks in the wrong place and finds nothing. The word itself never leaves the phone.
// Used by the 2D studio (index.html) and the 3D world (3d/online.js) through window.Family.
(() => {
  const KEY = 'brynny-family-word';
  const norm = w => String(w || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const get = () => { try { return norm(localStorage.getItem(KEY)); } catch (e) { return ''; } };
  const set = w => { try { localStorage.setItem(KEY, norm(w)); } catch (e) { } };
  const MIN = 4;

  async function hex(text) {
    if (!(window.crypto && crypto.subtle)) throw new Error('no crypto');
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  // a code that only phones with the same family word can work out
  const key = (what, code) => hex(`brynny-family|${what}|${get()}|${String(code).toUpperCase()}`);
  // the same, written with the letters of `abc` (for places that only take short codes)
  async function keyIn(what, code, abc, len) {
    const h = await key(what, code); let s = '';
    for (let i = 0; i < len; i++) s += abc[parseInt(h.slice(i * 4, i * 4 + 4), 16) % abc.length];
    return s;
  }

  // the grown-up box: type the family word. Resolves true when a word is saved.
  function ask(why) {
    return new Promise(done => {
      const old = document.getElementById('famAsk'); if (old) old.remove();
      const box = document.createElement('div');
      box.id = 'famAsk';
      box.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(40,20,40,.55);display:grid;place-items:center;padding:16px;font-family:inherit';
      box.innerHTML = `<div style="background:#fff;border-radius:22px;max-width:360px;width:100%;padding:20px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.3);color:#4a2b45">
        <div style="font-size:40px">👨‍👩‍👧</div>
        <h2 style="margin:4px 0 6px;font-size:22px">Family secret word</h2>
        <p style="margin:0 0 12px;font-size:15px;opacity:.8">${why || 'Online play is just for family.'} Ask a grown-up to type your family’s secret word. Use the same word on every family phone.</p>
        <input id="famWord" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Secret word" aria-label="Family secret word"
          style="width:100%;box-sizing:border-box;font-size:22px;padding:10px;border-radius:14px;border:3px solid #f6cfe3;text-align:center;outline:none;margin-bottom:6px">
        <label style="display:block;font-size:13px;opacity:.7;margin-bottom:10px"><input type="checkbox" id="famShow"> show the word</label>
        <p id="famMsg" style="min-height:18px;margin:0 0 8px;font-size:14px;color:#e0263b"></p>
        <button id="famOk" style="font:inherit;font-size:18px;font-weight:700;border:0;border-radius:999px;padding:12px 26px;background:#ff4f9a;color:#fff;cursor:pointer">✅ Save</button>
        <button id="famNo" style="font:inherit;font-size:16px;border:0;background:none;color:#4a2b45;opacity:.7;padding:12px;cursor:pointer">Not now</button>
      </div>`;
      document.body.appendChild(box);
      const inp = box.querySelector('#famWord'), msg = box.querySelector('#famMsg');
      const close = ok => { box.remove(); done(ok); };
      box.querySelector('#famShow').onchange = e => { inp.type = e.target.checked ? 'text' : 'password'; };
      box.querySelector('#famOk').onclick = () => {
        if (norm(inp.value).length < MIN) { msg.textContent = `Use at least ${MIN} letters or numbers.`; return; }
        set(inp.value); close(true);
      };
      box.querySelector('#famNo').onclick = () => close(false);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') box.querySelector('#famOk').click(); e.stopPropagation(); });
      setTimeout(() => inp.focus(), 50);
    });
  }
  // make sure this phone has a family word, asking for one if it doesn't
  const ensure = async why => get().length >= MIN || ask(why);

  window.Family = { get, has: () => get().length >= MIN, set, key, keyIn, ask, ensure };
})();
