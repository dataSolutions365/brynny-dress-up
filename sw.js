// Keeps the game playable with no internet once it has been opened one time.
// Bump VERSION whenever a file below changes so phones pick up the new copy.
const VERSION = 'dressup-v1';
const FILES = ['./', 'index.html', 'brynny-song.mp3', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // The song is served whole from the cache so it plays offline (Safari asks for byte ranges).
  if (url.origin === location.origin && url.pathname.endsWith('.mp3')) {
    e.respondWith(caches.match('brynny-song.mp3').then(r => r ? rangeFrom(req, r) : fetch(req)));
    return;
  }
  // Pages: try the network first so updates show up, fall back to the saved copy.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  // Everything else (fonts included): saved copy first, and save anything new.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});

async function rangeFrom(req, res) {
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer();
  const [, s, end] = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = Number(s) || 0, stop = end ? Number(end) : buf.byteLength - 1;
  return new Response(buf.slice(start, stop + 1), {
    status: 206,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': `bytes ${start}-${stop}/${buf.byteLength}`,
      'Content-Length': String(stop - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}
