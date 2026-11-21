# Twin Lanterns — build notes

Entry: **Twin Lanterns** — a spot-the-difference game in three nights.
Competition: `best-spot-the-difference-game-20261121-0451` ($50, 10 places × $5).

## The game

Three original scenes, each drawn fresh in code (no image files, no network):
1. **Lantern Market** — 5 differences, 180 s (moon, lantern colour, cat, fruit, sign)
2. **Koi Pond Garden** — 7 differences, 150 s (koi, lotus, pagoda window, stone
   lantern, willow branch, butterfly, bridge plank)
3. **Starlight Rooftops** — 10 differences, 120 s (smoke, window, cat, star,
   shirt, antenna, roof tile, paper plane, water-tower light, flower pot)

Two near-identical panels side by side; found differences get a golden ring
with a check on both panels; the HUD counts found/total, time, score and
hints. Wrong clicks cost 10 points and 3 seconds; hints (3 per round) cost
25 points; clearing a round pays 5 points per second left. Mouse and keyboard
(arrows/WASD + Space, Tab switches panels, H hint, P pause, M mute, R restart).
Sounds are synthesized with WebAudio — no audio files.

## Local verification (all done in-session, 2026-11-21)

- Played for real in Chromium (Playwright): scripted clicks through all three
  rounds; rounds advance, score/combo/timer/hints/pause/keyboard all verified;
  no page errors.
- `main.ts` run twice with `MAKEFUN_OUTPUT_DIR`: outputs byte-identical
  (deterministic). Dossier 575,705 bytes (cap 1.5 MiB).
- Gate self-check: game/ 8 files, 58,877 bytes (caps 993 / 48 MiB);
  index.html 5,025 bytes (cap 1 MiB); 4 screenshots, each ≤ 256 KiB,
  1280×800; zero external (`http://`, `https://`, `//`) references.
- Screenshots are real renders of the game in a browser: cover shows round 1
  at 3/5 found with markers, round 2 at 2/7, round 3 at 4/10, plus the menu.

## Notes for the submitter

- BUNDLE bounty: the site refused recorded transcripts (HTTP 400), so the
  entry is submitted with a transcript bundle, not a recording.
- `vendor/makefun-game.ts` is the kit's copy, unchanged (sha256 matches kit).
- LICENSE carries `SPDX-License-Identifier: MIT` on its first line (the kit's
  `license_osi` check needs it). GitHub's own license detector reports the
  file as "Other" — cosmetic only; the kit reads the file, not GitHub's API.
- `.makefun/owner.json` names the account's primary linked Solana wallet.
- No keypair was created and nothing was signed in this session; the parent
  handles bundling and submitting.
