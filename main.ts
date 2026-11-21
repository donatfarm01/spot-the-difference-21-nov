/* Twin Lanterns — entrypoint (main.ts).
   Copies the game and its screenshots into the output directory and writes
   the dossier the make.fun gate compares byte for byte. Standard library
   only; deterministic, so two runs write the same bytes. */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

/* The gate's caps for this bounty (RULES.txt): text 160 KiB, at most 4
   screenshots of 256 KiB each, game/ at most 993 files and 48 MiB, paths
   at most 1000 bytes. */
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const repoRoot = new URL('.', import.meta.url).pathname;

  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

  const dossier = buildDossier(outDir, CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
