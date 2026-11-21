# spot-the-difference-21-nov

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/donatfarm01/spot-the-difference-21-nov/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/donatfarm01/spot-the-difference-21-nov/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Twin Lanterns** — a spot-the-difference game in three nights. Two pictures hang
side by side in the lantern light and look identical, but 5 things differ in the
Lantern Market, 7 by the Koi Pond Garden and 10 on the Starlight Rooftops.
Click each difference on either picture to ring it in gold before the lanterns
burn down. Every scene is drawn fresh in code — no image files, no network —
with a timer, combo scoring, hints, synthesized sounds and full keyboard play.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Then serve `game/` with any static server and open `game/index.html` in a
desktop browser, for example:

```sh
npx serve game
```

Or open `game/index.html` directly from disk — the game needs no build step
and no network.

## How to play

- Click a difference on either panel to circle it. Find them all before time runs out.
- Finds earn 100 points, more with a streak; a wrong click costs 10 points and 3 seconds.
- Hints (3 per round) point at a hidden difference for 25 points.
- Clearing a round pays 5 points per second left on the clock.
- Keyboard: arrows or WASD move the crosshair, Space checks a spot, Tab switches
  panels, H hints, P pauses, M mutes, R restarts the round.

## Layout

- `main.ts` — entrypoint: copies `game/` and `screenshots/` to the output
  directory and writes `dossier.json` with `buildDossier`.
- `game/index.html` — the page: two panels, HUD, overlays.
- `game/style.css` — all styling.
- `game/src/scenes.js` — the three hand-drawn scenes and their differences.
- `game/src/render.js` — panels, gold markers, hint pulse, crosshair.
- `game/src/input.js` — mouse clicks and the keyboard crosshair.
- `game/src/score.js` — points, combo, hints and the clock.
- `game/src/audio.js` — sounds synthesized with WebAudio.
- `game/src/main.js` — state machine, frame loop and HUD.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — real renders of the game, taken in a browser.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
