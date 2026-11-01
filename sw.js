// Offline saving for the home-screen app.
//
// After the game has been opened once with internet, it keeps working with no internet:
// the 2D studio, the pet page, the 3D world, the 3D engine, fonts, and all the music.
//
// How it decides what to use:
// - Game pages and game code: try the internet first (always checking for a newer copy) so updates show up right away,
//   and use the saved copy when there is no internet.
// - Music and sounds: use the saved copy (they never change), and save each song the first time it loads.
// - The 3D engine and fonts (from cdn.jsdelivr.net and Google Fonts): saved copy first, they never change.
// - Everything else (sign-in, cloud saves, online play) goes straight to the internet as usual.
//
// When you add a new song, add it to MUSIC below so it is saved for offline play right away.
// Songs not listed are still saved the first time they play.
const CACHE = 'dressup-offline-v1';

const CORE = [
  './', 'index.html', 'pets.html', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'family.js', 'pics.js', '3d/', '3d/index.html', '3d/game.js', '3d/online.js', '3d/challenges.js', '3d/seasons.js',
];

const MUSIC = [
  'brynny-song-11.mp3',
  'audio/autumn-wind.mp3', 'audio/ballet-recital.mp3', 'audio/bday-ukulele.mp3', 'audio/camera.mp3',
  'audio/city-park.mp3', 'audio/clouds.mp3', 'audio/creepy-simple.mp3', 'audio/fashion-show.mp3',
  'audio/fashion-walk.mp3', 'audio/fireworks.mp3', 'audio/halloween-waltz.mp3', 'audio/ice-rink.mp3',
  'audio/kids-giggle.mp3', 'audio/merry-xmas.mp3', 'audio/pool-splash.mp3', 'audio/pumpkin-horror.mp3',
  'audio/school-bell.mp3', 'audio/sea-waves.mp3', 'audio/sparkle-room.mp3', 'audio/spooky-wind.mp3',
  'audio/spring-birds.mp3', 'audio/stadium-cheer.mp3', 'audio/stadium.mp3', 'audio/valentine-day.mp3',
  'audio/wedding-day.mp3', 'audio/wedding-music.mp3', 'audio/winter-days.mp3', 'audio/xmas-musicbox.mp3',
];

// The 3D engine. These load on the very first visit, before this file is running, so save them up front.
const THREE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const ENGINE = [
  'build/three.module.min.js',
  'examples/jsm/geometries/RoundedBoxGeometry.js',
  'examples/jsm/objects/Reflector.js',
  'examples/jsm/utils/BufferGeometryUtils.js',
  'examples/jsm/geometries/TextGeometry.js',
  'examples/jsm/loaders/FontLoader.js',
].map(p => THREE + p);

const SAVE_FOREVER_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

// Save each file on its own, so one missing file can't stop the rest from being saved.
const saveAll = (cache, urls) => Promise.allSettled(urls.map(u =>
  fetch(u, { cache: 'no-cache' }).then(r => (r.ok ? cache.put(u, r) : null))));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => saveAll(c, [...CORE, ...ENGINE]).then(() => c))
    .then(c => { saveAll(c, MUSIC); }) // music keeps downloading in the background
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('dressup-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (url.pathname.endsWith('.mp3')) { e.respondWith(music(req, url)); return; }
    if (req.mode === 'navigate' || /\.(html|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/')) {
      e.respondWith(internetFirst(req));
      return;
    }
    e.respondWith(savedFirst(req));
    return;
  }
  if (SAVE_FOREVER_HOSTS.includes(url.hostname)) e.respondWith(savedFirst(req));
  // anything else (Firebase sign-in, cloud saves, online play) is left alone
});

async function internetFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    // no-cache: always ask the server if the file changed (cheap when it hasn't), so a page and
    // its game code never come from two different versions after an update goes live
    const res = await fetch(req, { cache: 'no-cache' });
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const saved = await cache.match(req, { ignoreSearch: true });
    if (saved) return saved;
    if (req.mode === 'navigate') {
      const page = await cache.match(new URL(req.url).pathname.includes('/3d/') ? '3d/index.html' : 'index.html');
      if (page) return page;
    }
    throw err;
  }
}

async function savedFirst(req) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(req);
  if (saved) return saved;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

// Songs: keep the whole file, and hand back just the part the player asks for
// (Safari asks for byte ranges, and plays nothing offline without this).
async function music(req, url) {
  const cache = await caches.open(CACHE);
  const key = url.origin + url.pathname;
  let saved = await cache.match(key);
  if (!saved) {
    try {
      const whole = await fetch(key);
      if (!whole.ok) return whole;
      await cache.put(key, whole.clone());
      saved = whole;
    } catch (err) {
      return fetch(req);
    }
  }
  return partOf(req, saved);
}

async function partOf(req, res) {
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const size = buf.byteLength;
  let start = m[1] === '' || m[1] === undefined ? NaN : Number(m[1]);
  let stop = m[2] ? Number(m[2]) : size - 1;
  if (Number.isNaN(start)) { start = Math.max(0, size - (Number(m[2]) || 0)); stop = size - 1; } // "bytes=-500"
  stop = Math.min(stop, size - 1);
  if (start >= size || start > stop) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(buf.slice(start, stop + 1), {
    status: 206,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': `bytes ${start}-${stop}/${size}`,
      'Content-Length': String(stop - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
