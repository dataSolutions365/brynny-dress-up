# Notes for working on this repo

## 3D world (`3d/`)
- The game code lives in `3d/src/`, one file per feature (places, avatar, pets, bakery, shop, glam mirror, map, game loop).
- `3d/game.js` is GENERATED from those files. Never edit it by hand.
- After changing anything in `3d/src/`, run `node 3d/build.mjs` and commit both the src change and the rebuilt `3d/game.js`.
  A GitHub check (`node 3d/build.mjs --check`) fails if they don't match.
- The files share one set of variables (they are joined in file-name order), so a function or variable defined in one
  file can be used in any other. Number new files so they land in the right order, e.g. `21b-ice-rink.js`.
- HTML and CSS stay in `3d/index.html`. `online.js`, `challenges.js` and `seasons.js` are separate modules that talk
  to the game through `window.__game`.
- No install is needed: plain Node runs the build, and GitHub Pages serves the files as they are.
- Online play (`online.js`) shows each friend exactly as they are: their look, plus everything listed in `SHOW` in
  `3d/src/26c-friends-see.js` (their pet, barn buddy, ride, bike, skateboard, held bat/ball and what they're busy doing).
  When you add a new ride, a new pet, or something you hold, add an entry to `SHOW` so friends see it.
  Rides that are barn animals (horse, dinos, and the shop rides in `3d/src/24g-mounts.js`) are already covered by the `ride` entry.
  `3d/tests/online-see.mjs` checks it with two phones in one room:
  `npm i --no-save playwright peer && npx playwright install chromium && node 3d/tests/online-see.mjs` (takes a few minutes).
- Basketball and batting matches against friends online are in `3d/src/24e2-sports-friends.js` (it hooks into
  `3d/src/24e-sports.js` through `SP.onMenu`, `SP.onEnd` and `SP.lx`). `3d/tests/sports-friends.mjs` plays a match with two phones
  (same setup as `online-see.mjs`).
- Rides with `fly:1` in FARM (`3d/src/24d-barn.js`) can fly: `3d/src/24h-flying.js` does the take-off, flying and landing,
  and friends see it through the `ride` entry. `3d/tests/fly.mjs` (run on every PR) checks one takes off, clears the trees and lands.
- Riding the 🚲 bike (`3d/src/17d-bicycle.js`): `bikeStep()` turns the wheels, cranks and handlebars and works out the lean,
  `bikeRide()` puts the rider's hips on the saddle, hands on the grips and feet on the pedals every frame (it runs after
  `Avatar.update`, so it wins over the walking pose). Friends online use the same two functions. `3d/tests/bike.mjs`
  (run on every PR) checks the feet stay on the pedals, the hands on the grips, coasting, and a foot down when stopped.
- 🦁 Safari rides (okapi, zebra, rhino, elephant, crowned crane, lion, giraffe) are earned rides in `3d/src/24i-earned-rides.js` with
  `earn:{by:'chal',ids:[...]}`: they come once every challenge id listed is done in the 🦁 Safari tab of `3d/challenges.js`.
  They reuse the zoo's real-looking models through `model:` (the lion and the saddles are in `3d/src/24c9b-safari-rides.js`,
  the zebra, giraffe, rhino, flying crowned crane and the zoo's gorilla in `3d/src/24c9c-safari-more.js`, which share textures and
  materials through `safM` to save memory on phones; the saddle size for each ride is in `SADDLE`);
  `seat` slides the animal back so you sit further forward, `wide` spreads the rider's legs, `boost` sets the speed.
  `3d/tests/safari-rides.mjs` (run on every PR) checks they stay locked until earned and the rider sits on the saddle.
- 🌊 The canal and 🐬 Dolphin Bay: `3d/src/26f-ocean.js`. The coast is a ring of water all the way round the island (`CANAL.inR` to
  `CANAL.outR`) with a grassy far bank (instanced palms and bushes); the bit past the Beach is the 'bay' zone, the rest shows as 🌊 Canal.
  You wade in off any shore and swim (not on a bike, skateboard or barn ride: `collide()` asks `seaKeep()`). Swimming keeps you at ground
  height 0 and just sinks and poses the body after `Avatar.update` (`swimPose()`, also used for friends online through the 'sea' entry in `SHOW`).
  For other files that use the water (the safari hippo, animals drinking): `seaDepth(x,z)`, `inCanal(x,z)`, `canalSpot(ang,t)`, `CANAL`, `WATER_Y`.
  Three dolphins and Big Blue the whale swim round the whole canal, Shelly the sea turtle near the Beach, Pip the seal sits on her rock; they never
  follow you (only adopted pets do): you swim up next to them, and that counts for the challenges. A barn ride with `swim:1` in FARM may go in the water. They show on the minimap. 🐟 Feed sends `did('seafeed', kind)`.
  🐢 Shelly, 🐬 Splash and 🐋 Big Blue are rides you earn in the 🌊 Ocean tab of `3d/challenges.js` (ids in `SEA_RIDES`), and only work in the water.
  `3d/tests/ocean.mjs` (run on every PR) checks you swim all round, the animals keep their own way instead of following you, feeding counts, the rides stay locked until earned and you sit on their back.
- 📍 The Places tab of ⭐ Star Challenges (`placesHTML()` in `3d/challenges.js`) is a legend of every place in town with the challenges
  you do there, grouped by each challenge's `go` place (no `go` puts it under "Anywhere in town"). Give a new challenge a `go` and it shows up
  under that place by itself. `3d/tests/challenge-places.mjs` (run on every PR) checks every challenge is listed once.
- 🤸 Jump Park (behind Christmas Village): the building is `3d/src/12e-place-jump-park.js`, the bouncing, flips, slam dunks and
  foam pit are `3d/src/26e-jump-park.js` (25-game-loop.js asks `jpLand()` on every landing; the Jump button calls `jpJump()`).
  `3d/tests/jump-park.mjs` (run on every PR) checks you bounce, go higher and flip when tapping Jump, dunk, and sink into the pit.
- 🛹 Skate Park: `3d/src/12f-place-skate-park.js` builds it and has `SKZ` (where every ramp, box and rail is, in the park's own
  directions) and `skateLH()` (how high the riding surface is anywhere in it; `groundAt` uses it, so walking works on the ramps).
  `3d/src/24k-skate-park.js` takes over moving you while you're on wheels (skateboard, roller skates or bike) inside the park:
  rolling with gravity on the ramps, air out of the half-pipe, ollies, grinds on `SKZ.rails` and the trick buttons. Change a ramp's
  numbers in `SKZ` and both the look and the riding follow. Friends see the lean and the tricks through the `park` entry in `SHOW`.
  `3d/tests/skate-park.mjs` (run on every PR) rides it on all three.
- `3d/tests/walk.mjs` checks on every PR that the character actually walks on an iPhone-size screen. Run it yourself with
  `npm i --no-save playwright && npx playwright install chromium && node 3d/tests/walk.mjs`.
- The 3D world reports errors, lost graphics and "tried to walk but didn't move" to the same `dressup_errors` list as the
  2D studio (snake game's Firebase project), marked `where: 3D world …`.
- Graphics memory (`3d/src/01c-memory.js`): iPhones drop the whole 3D picture when the game uses too much of it.
  When you throw a 3D thing away for good (an old avatar, a ball, a picture's model), call `freeObj(thing)` after removing it,
  or its shapes and pictures stay on the graphics chip forever. Identical shapes are shared automatically by `shareShapes()`
  at start-up and on every `Avatar.dress`, so never change a shape's numbers (`geometry.translate`, writing to `attributes`)
  after the game has started, unless it's a plain `BufferGeometry` or `PlaneGeometry` (those are never shared).
  When the phone gives the graphics back, the game carries on by itself in Light mode.

- Guy hair (`3d/src/14e2-guy-hair-real.js`): each guy cut in `GUY_REAL` is a shell that follows the head with a natural
  hairline, plus locks of hair (strands, spikes, curls, locs, a bun) merged into one shape and cached, so friends with the same
  cut share it. A guy's hat is sized to his hair by `fitGuyHat` and the hair under it is pressed flat by `guyHatPress`.
  When you add a guy cut, give it a `thick`, `flow` and `uv` (and `locks` for texture), and keep it under 60,000 points:
  `3d/tests/guy-hair.mjs` (run on every PR) checks each cut looks like its name and hats sit on the hair.

## Outfits go in both games
- Everything you can wear in the 2D studio (`index.html`) must also be wearable in the 3D world, and the other way round,
  with the same id, for girls and for guys. Add a new outfit, costume, hair style or accessory to both in the same PR.
- 2D: guy-only items have `guy:1`, and `GUY_OK` lists what guys see. 3D: guy lists are in `3d/src/14c-guy.js`; things
  brought over from 2D are added in `3d/src/14e-match-2d.js`.
- `3d/tests/closets-match.mjs` (run on every PR) fails if an id is in one game's closet but not the other's.
