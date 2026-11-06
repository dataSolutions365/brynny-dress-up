// 🆕 Every update a player would notice adds a line to the What's new card (WHATS_NEW in 3d/src/26k-whats-new.js).
// Runs on every pull request: if the PR changes the 3D game (3d/, other than tests and the generated game.js) but adds no
// note to WHATS_NEW, it fails and says how to add one. For a change nobody would notice (a test, a comment, an internal
// clean-up), put [no-whats-new] in the PR title or description.
//
// Run it with:  BASE_SHA=<base commit> PR_TEXT="<title and body>" node 3d/tests/whats-new-note.mjs
import { execFileSync } from 'node:child_process';

const base = process.env.BASE_SHA;
if (!base) { console.log('No BASE_SHA (not a pull request): nothing to check.'); process.exit(0); }
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });
const changed = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean);
const game = changed.filter(f => f.startsWith('3d/') && !f.startsWith('3d/tests/') && f !== '3d/game.js');
const NOTES = '3d/src/26k-whats-new.js';
// a new note is an added line in the notes file that has a note's words in it: {e:'…',t:'…'}
const added = changed.includes(NOTES) ? git('diff', `${base}...HEAD`, '--', NOTES).split('\n').filter(l => /^\+\s*\{e:'/.test(l) && /\bt:'/.test(l)) : [];
const skip = /\[no-whats-new\]/i.test(process.env.PR_TEXT || '');

console.log(`3D game files changed: ${game.length ? game.join(', ') : 'none'}`);
console.log(`What's new notes added: ${added.length}${added.length ? '\n  ' + added.map(l => l.trim()).join('\n  ') : ''}`);
if (!game.length || added.length) console.log('✅ OK');
else if (skip) console.log('✅ OK: the PR says [no-whats-new].');
else {
  console.error(`❌ This PR changes the 3D game but adds no line to the What's new card.
   Add one short, kid-friendly sentence to today's entry at the top of WHATS_NEW in ${NOTES}, e.g.
     {e:'🏄',t:'The wave pool is twice as big! Grab a surfboard at the new Surf Shack.',go:'water'},
   (start a new entry {v:'YYYY-MM-DD',notes:[...]} for today if there isn't one), then run node 3d/build.mjs.
   If players won't notice anything, put [no-whats-new] in the PR title or description.`);
  process.exitCode = 1;
}
