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
